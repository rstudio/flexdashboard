

#' @import rmarkdown
NULL


knit2browser <- function(input_file, ...) {
  suppressMessages({
      output_file = rmarkdown::render(input_file)
      #system(paste("open", output_file))
  })
}
