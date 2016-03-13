# return a string as a tempfile
as_tmpfile <- function(str) {
  if (length(str) > 0) {
    str_tmpfile <- tempfile("rmarkdown-str", fileext = ".html")
    writeLines(str, str_tmpfile)
    str_tmpfile
  } else {
    NULL
  }
}

knitMetaAdd = function(meta, label = '') {
  # if (packageVersion("knitr") >= "1.12.20") {
  #   knitr::knit_meta_add(meta, label)
  # } else {
  knitrNamespace <- asNamespace("knitr")
  knitEnv <- get(".knitEnv", envir = knitrNamespace)
  if (length(meta)) {
    meta_id = attr(knitEnv$meta, 'knit_meta_id')
    knitEnv$meta <- c(knitEnv$meta, meta)
    attr(knitEnv$meta, "knit_meta_id") = c(meta_id, rep(label, length(meta)))
  }
  knitEnv$meta
  # }
}

# devel mode
knit_devel <- function(input, ...) {
  rmarkdown::render(input,
                    output_options = list(devel = TRUE),
                    quiet = TRUE)
}
