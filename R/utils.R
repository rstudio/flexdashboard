# return a string as a tempfile
as_tmpfile <- function(str) {
  if (length(str) > 0) {
    str <- enc2utf8(str)
    str_tmpfile <- tempfile("rmarkdown-str", fileext = ".html")
    con <- file(str_tmpfile, open = "w+", encoding = "native.enc")
    writeLines(str, con = con, useBytes = TRUE)
    close(con)
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

is_accent_color <- function(x) {
  stopifnot(length(x) == 1)
  x %in% accent_colors()
}

accent_colors <- function() {
  c("primary", "info", "success", "warning", "danger")
}

"%||%" <- function(x, y) {
  if (is.null(x)) y else x
}

dropNulls <- function(x) {
  x[!vapply(x, is.null, FUN.VALUE = logical(1))]
}

is_available <- function(package, version = NULL) {
  installed <- nzchar(system.file(package = package))
  if (is.null(version)) {
    return(installed)
  }
  installed && isTRUE(utils::packageVersion(package) >= version)
}
