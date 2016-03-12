library(shiny)
library(shinySignals)
library(dplyr)
library(bubbles)

# An empty prototype of the data frame we want to create
prototype <- data.frame(date = character(), time = character(),
  size = numeric(), r_version = character(), r_arch = character(),
  r_os = character(), package = character(), version = character(),
  country = character(), ip_id = character(), received = numeric())

# Connects to streaming log data for cran.rstudio.com and
# returns a reactive expression that serves up the cumulative
# results as a data frame
packageStream <- function(session = getDefaultReactiveDomain()) {
  # Connect to data source
  sock <- socketConnection("cransim.rstudio.com", 6789, blocking = FALSE, open = "r")
  # Clean up when session is over
  session$onSessionEnded(function() {
    close(sock)
  })

  # Returns new lines
  newLines <- reactive({
    invalidateLater(1000, session)
    readLines(sock)
  })

  # Parses newLines() into data frame
  reactive({
    if (length(newLines()) == 0)
      return()
    read.csv(textConnection(newLines()), header=FALSE, stringsAsFactors=FALSE,
      col.names = names(prototype)
    ) %>% mutate(received = as.numeric(Sys.time()))
  })
}

# Accumulates pkgStream rows over time; throws out any older than timeWindow
# (assuming the presence of a "received" field)
packageData <- function(pkgStream, timeWindow) {
  shinySignals::reducePast(pkgStream, function(memo, value) {
    rbind(memo, value) %>%
      filter(received > as.numeric(Sys.time()) - timeWindow)
  }, prototype)
}

# Count the total nrows of pkgStream
downloadCount <- function(pkgStream) {
  shinySignals::reducePast(pkgStream, function(memo, df) {
    if (is.null(df))
      return(memo)
    memo + nrow(df)
  }, 0)
}

# Use a bloom filter to probabilistically track the number of unique
# users we have seen; using bloom filter means we will not have a
# perfectly accurate count, but the memory usage will be bounded.
userCount <- function(pkgStream) {
  # These parameters estimate that with 5000 unique users added to
  # the filter, we'll have a 1% chance of false positive on the next
  # user to be queried.
  bloomFilter <- BloomFilter$new(5000, 0.01)
  total <- 0
  reactive({
    df <- pkgStream()
    if (!is.null(df) && nrow(df) > 0) {
      # ip_id is only unique on a per-day basis. To make them unique
      # across days, include the date. And call unique() to make sure
      # we don't double-count dupes in the current data frame.
      ids <- paste(df$date, df$ip_id) %>% unique()
      # Get indices of IDs we haven't seen before
      newIds <- !sapply(ids, bloomFilter$has)
      # Add the count of new IDs
      total <<- total + length(newIds)
      # Add the new IDs so we know for next time
      sapply(ids[newIds], bloomFilter$set)
    }
    total
  })
}

# Quick and dirty bloom filter. The hashing "functions" are based on choosing
# random sets of bytes out of a single MD5 hash. Seems to work well for normal
# values, but has not been extensively tested for weird situations like very
# small n or very large p.

library(digest)
library(bit)

BloomFilter <- setRefClass("BloomFilter",
  fields = list(
   .m = "integer",
   .bits = "ANY",
   .k = "integer",
   .bytesNeeded = "integer",
   .bytesToTake = "matrix"
  ),
  methods = list(
   # @param n - Set size
   # @param p - Desired false positive probability (e.g. 0.01 for 1%)
   initialize = function(n = 10000, p = 0.001) {
     m = (as.numeric(n) * log(1 / p)) / (log(2)^2)

     .m <<- as.integer(m)
     .bits <<- bit(.m)
     .k <<- max(1L, as.integer(round((as.numeric(.m)/n) * log(2))))

     # This is how many *bytes* of data we need for *each* of the k indices we need to
     # generate
     .bytesNeeded <<- as.integer(ceiling(log2(.m) / 8))
     .bytesToTake <<- sapply(rep_len(.bytesNeeded, .k), function(byteCount) {
       # 16 is number of bytes an md5 hash has
       sample.int(16, byteCount, replace = FALSE)
     })
   },
   .hash = function(x) {
     hash <- digest(x, "md5", serialize = FALSE, raw = TRUE)
     sapply(1:.k, function(i) {
       val <- rawToInt(hash[.bytesToTake[,i]])
       # Scale down to fit into the desired range
       as.integer(val * (as.numeric(.m) / 2^(.bytesNeeded*8)))
     })
   },
   has = function(x) {
     all(.bits[.hash(x)])
   },
   set = function(x) {
     .bits[.hash(x)] <<- TRUE
   }
  )
)

rawToInt <- function(bytes) {
  Reduce(function(left, right) {
    bitwShiftL(left, 8) + right
  }, as.integer(bytes), 0L)
}

