resolve_theme <- function(theme) {
  if (is.list(theme)) {
    if (!is_available("rmarkdown", "2.6.6")) {
      stop("Providing a list to `theme` requires the rmarkdown verion 2.6.6 or higher.", call. = FALSE)
    }
    return(as_bs_theme(theme))
  }
  if (identical(theme, "default")) {
    return("cosmo")
  }
  if (identical(theme, "bootstrap")) {
    return("default")
  }
  # html_document() handles invalid theme input
  theme
}

as_bs_theme <- function(theme) {
  if (bslib::is_bs_theme(theme)) {
    return(theme)
  }
  if (is.list(theme)) {
    return(do.call(bslib::bs_theme, theme))
  }
  NULL
}
