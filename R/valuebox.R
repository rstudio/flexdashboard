#' Create a value box component for a dashboard.
#'
#' A value box displays a value (usually a number) in large text, with a smaller
#' caption beneath, and a large icon on the right side.
#'
#' @param value The value to display in the box. Usually a number or short text.
#' @param caption The caption to display beneath the value.
#' @param icon An icon for the box (e.g. "fa-comments")
#' @param color Background color for the box. This can be one of the built-in
#'   background colors ("primary", "info", "success", "warning", "danger") or
#'   any valid CSS color value.
#' @param href An optional URL to link to. Note that this can be an anchor of
#'   another dashboard page (e.g. "#details").
#'
#' @details See the flexdashboard website for additional documentation:
#'  <https://pkgs.rstudio.com/flexdashboard/articles/using.html#value-boxes-1>
#'
#' @examples
#' library(flexdashboard)
#'
#' valueBox(42, caption = "Errors", icon="fa-thumbs-down")
#' valueBox(107, caption = "Trials", icon="fa-tag")
#' valueBox(247, caption = "Connections", icon="fa-random")
#'
#' @export
valueBox <- function(value, caption = NULL, icon = NULL, color = NULL, href = NULL) {
  color <- color %||% "primary"
  stopifnot(is.character(color) && length(color) == 1)

  if (is_accent_color(color)) {
    attachDependencies(
      valueBoxTag(
        value = value, caption = caption, icon = icon, href = href,
        `data-color-accent` = color
      ),
      # Accent colors can be customized in "real-time"
      # https://rstudio.github.io/bslib/articles/theming.html#dynamically-themeable-component
      bslib::bs_dependency_defer(valueBoxDynamicAccentCSS),
      append = TRUE
    )
  } else {
    # If we know the color code now, compute the contrasts now, and attach them
    # as attributes
    color <- htmltools::parseCssColors(color)
    colorText <- getColorContrast(color)
    colorIcon <- sassValue(
      paste0("mix(", color, ",", getColorContrast(colorText), ",50%)")
    )
    valueBoxTag(
      value = value, caption = caption, icon = icon, href = href,
      `data-color` = color, `data-color-text` = colorText,
      `data-color-icon` = colorIcon
    )
  }
}

valueBoxTag <- function(value, caption, icon, href, ...) {
  tag <- tags$span(
    class = "value-output",
    `data-caption` = caption,
    `data-icon` = icon,
    `data-href` = href,
    ...,
    value
  )
  attachDependencies(tag, valueBoxCoreDependencies(icon))
}


valueBoxCoreDependencies <- function(icon) {
  deps <- list(htmlDependency(
    name = "value-box-core",
    version = get_package_version("flexdashboard"),
    package = "flexdashboard",
    src = "www/flex_dashboard",
    stylesheet = "value-box.css"
  ))
  icons <- html_dependencies_fonts(
    isTRUE(grepl('^fa', icon)),
    isTRUE(grepl('^ion', icon))
  )
  if (length(icons)) {
    deps <- append(deps, icons)
  }
  deps
}

valueBoxStaticAccentCSS <- function(theme) {
  if (!is.character(theme)) return(NULL)
  if (identical(theme, "default")) {
    theme <- "bootstrap"
  }
  htmltools::htmlDependency(
    name = "value-box-accent-static",
    version = get_package_version("flexdashboard"),
    package = "flexdashboard",
    src = "www/flex_dashboard",
    stylesheet = paste0("theme-", theme, "-value-box.css")
  )
}

valueBoxDynamicAccentCSS <- function(theme) {
  if (!bslib::is_bs_theme(theme)) return(NULL)

  version <- get_package_version("flexdashboard")
  bslib::bs_dependency(
    sass::sass_file(resource("value-box-sass/accent-dynamic.scss")),
    theme = theme,
    name = "value-box-accent-dynamic",
    version = version,
    cache_key_extra = version
  )
}


getColorContrast <- function(color) {
  sass_func <- system_file("sass-utils", "color-contrast.scss", package = "bslib")
  sassValue(
    sprintf("color-contrast(%s, #1a1a1a)", color),
    defaults = sass::sass_file(sass_func)
  )
}

# sort of like Sass' @debug
sassValue <- function(expr, defaults = "") {
  out <- sass::sass(
    list(defaults, sprintf("foo{bar:%s}", expr)),
    options = sass::sass_options(output_style = "compressed")
  )
  out <- sub("foo{bar:", "", out, fixed = TRUE)
  out <- sub("}", "", out, fixed = TRUE)
  gsub("\n", "", out, fixed = TRUE)
}


#' Shiny bindings for valueBox
#'
#' Output and render functions for using valueBox within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a gauge
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name valueBox-shiny
#'
#' @export
valueBoxOutput <- function(outputId, width = '100%', height = '160px') {
  shiny::uiOutput(outputId, class = 'shiny-html-output shiny-valuebox-output',
                  width = width, height = height)
}


#' @rdname valueBox-shiny
#' @export
renderValueBox <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  renderFunc <- shiny::renderUI(expr, env, quoted = TRUE)
  attr(renderFunc, "outputFunc") <- valueBoxOutput
  renderFunc
}

