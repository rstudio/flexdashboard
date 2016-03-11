
library(htmltools)

# Generate HTML for a 4-wide bootstrap thumbnail
thumbnail <- function(title, img, href, caption = TRUE) {
  div(class = "col-sm-4",
      a(class = "thumbnail", title = title, href = href,
        img(src = img),
        div(class = ifelse(caption, "caption", ""),
          ifelse(caption, title, "")
        )
      )
  )
}

# Generate HTML for several rows of 4-wide bootstrap thumbnails 
thumbnails <- function(...) {
  
  # capture arguments and setup rows to return
  thumbs <- list(...)
  numThumbs <- length(thumbs)
  fullRows <- numThumbs / 3
  rows <- tagList()
  
  # add a row of thumbnails
  addRow <- function(first, last) {
    rows <<- tagAppendChild(rows, div(class = "row", thumbs[first:last]))
  }
  
  # handle full rows
  for (i in 1:fullRows) {
    last <- i * 3
    first <- last-2
    addRow(first, last)
  }
  
  # check for leftovers
  leftover <- numThumbs %% 3
  if (leftover > 0) {
    last <- numThumbs
    first <- last - leftover + 1
    addRow(first, last)
  }
  
  # return the rows!
  rows
}

# Generate HTML for examples
examples <- function(showcaseOnly = TRUE, caption = TRUE) {
  
  # read examples
  examples <- yaml::yaml.load_file("examples.yml")
  
  # filter for showcase if requested
  if (showcaseOnly)
    examples <- subset(examples, examples$showcase == TRUE)
  
  lapply(examples, function(x) {
    thumbnail(title = x$title, 
              img = x$img, 
              href = x$href, 
              caption = caption)
  })
}

