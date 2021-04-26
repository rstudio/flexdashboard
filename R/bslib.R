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
    # Flexdashboard wants to default to bs_theme(bootswatch = 'cosmo'), but we
    # can't do that if theme is already a bs_theme() object since updating the
    # bootswatch theme will override the user's variable defaults
    if (is_bs_theme(theme) && is.null(theme_bootswatch(theme))) {
      warning(
        "Consider adding `bootswatch = 'cosmo'` and `'enable-rounded' = TRUE` ",
        "to `bs_theme()` to get the same styling defaults that you get without ",
        "using `!expr` inside `theme:`.",
        call. = FALSE
      )
    }
    # Default to cosmo theme (just like the non-bslib usage does)
    # (Users can explictly opt-out with bootswatch: default)
    if (!is_bs_theme(theme)) {
      theme <- utils::modifyList(list(bootswatch = "cosmo"), theme)
      theme <- do.call(bs_theme, theme)
    }
    # Also default to enable-rounded: true
    if (!grepl("^\\s*\\$enable-rounded:", sass::as_sass(theme))) {
      theme <- bs_theme_update(theme, "enable-rounded" = TRUE)
    }
  }
  theme
}
