# return a string as a tempfile
as_tmpfile <- function(str) {
  if (length(str) > 0) {
    str_tmpfile <- tempfile("rmarkdown-str", fileext = ".html")
    writeLines(str, str_tmpfile, useBytes = TRUE)
    str_tmpfile
  } else {
    NULL
  }
}

# A variant of relative_to that normalizes its inputs.
normalized_relative_to <- function(dir, file) {
  rmarkdown::relative_to(
    normalizePath(dir, winslash = "/", mustWork = FALSE),
    normalizePath(file, winslash = "/", mustWork = FALSE))
}

# devel mode
knit_devel <- function(input, ...) {
  rmarkdown::render(input,
                    output_options = list(devel = TRUE),
                    quiet = TRUE)
}
