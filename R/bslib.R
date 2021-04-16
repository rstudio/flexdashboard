resolve_theme <- function(theme) {
  if (identical(theme, "default")) {
    return("cosmo")
  }
  if (identical(theme, "bootstrap")) {
    return("default")
  }
  if (is.character(theme)) {
    return(theme)
  }
  if (is.list(theme)) {
    if (!is_bs_theme(theme)) {
      theme <- do.call(bs_theme, theme)
    }
    # Default to cosmo theme (just like the non-bslib usage does)
    # (Users can explictly opt-out with bootswatch: default)
    if (is.null(theme_bootswatch(theme))) {
      theme <- bs_theme_update(theme, bootswatch = "cosmo")
    }
    # Also default to enable-rounded: true
    if (!grepl("$enable-rounded:", sass::as_sass(theme))) {
      theme <- bs_theme_update(theme, "enable-rounded" = TRUE)
    }
  }
  theme
}
