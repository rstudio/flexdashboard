#' Create a gauge component for a dashboard.
#'
#' A gauge displays a numeric value on a meter that runs between
#' specified minimum and maximum values.
#'
#' @param value Numeric value to display
#' @param min Minimum numeric value
#' @param max Maximum numeric value
#' @param sectors Custom colored sectors (e.g. "success", "warning", "danger"). By
#'  default all values are colored using the "success" theme color
#' @param success Two-element numeric vector defining the range of values to
#'  color as "success" (specific color provided by theme or custom \code{colors})
#' @param warning Two-element numeric vector defining the range of values to
#'  color as "warning" (specific color provided by theme or custom \code{colors})
#' @param danger Two-element numeric vector defining the range of values to
#'  color as "danger" (specific color provided by theme or custom \code{colors})
#' @param colors Vector of colors to use for the \code{success}, \code{warning},
#'  and \code{danger} ranges. Colors can be standard theme colors ("success",
#'  "warning", "danger", "primary", and "info") or any other valid CSS color
#'  specifier. Note that if no custom sector ranges are defined, this parameter
#'  can be a single color value rather than a vector of three values
#' @param symbol Optional symbol to show next to value (e.g. 'kg')
#' @param label Optional label to display beneath the value
#' @param abbreviate Abbreviate large numbers for min, max, and value
#'    (e.g. 1234567 -> 1.23M). Defaults to \code{TRUE}.
#' @param abbreviateDecimals Number of decimal places for abbreviated
#'   numbers to contain (defaults to 1).
#' @param href An optional URL to link to. Note that this can be an anchor of
#'   another dashboard page (e.g. "#details").
#'
#' @details See the flexdashboard website for additional documentation:
#'  \href{http://rmarkdown.rstudio.com/flexdashboard/using.html#gauges}{http://rmarkdown.rstudio.com/flexdashboard/using.html#gauges}
#'
#' @examples
#' library(flexdashboard)
#'
#' gauge(42, min = 0, max = 100, symbol = '%', gaugeSectors(
#'   success = c(80, 100), warning = c(40, 79), danger = c(0, 39)
#' ))
#'
#' @export
gauge <- function(value, min, max, sectors = gaugeSectors(),
                  symbol = NULL, label = NULL,
                  abbreviate = TRUE, abbreviateDecimals = 1,
                  href = NULL) {

  if (!inherits(sectors, "gaugeSectors")) {
    stop("sectors must be a gaugeSectors() object")
  }

  # make sure at least one sector range is populated
  if (is.null(sectors$warning) && is.null(sectors$danger)) {
    sectors$success <- sectors$success %||% c(min, max)
  }

  # create the customSectors.ranges justgage payload
  ranges <- Map(
    sectors[c("success", "warning", "danger")], sectors$colors,
    f = function(sector, color) {
      if (is.null(sector)) return(NULL)
      if (!is.numeric(sector) || length(sector) != 2)
        stop("gaugeSector() ranges must be a numeric vector of length 2", call. = FALSE)
      list(lo = sector[[1]], hi = sector[[2]], color = color)
    }, USE.NAMES = FALSE
  )

  x <- list(
    value = value,
    min = min,
    max = max,
    customSectors = list(percents = FALSE, ranges = dropNulls(ranges)),
    symbol = symbol,
    label = label,
    humanFriendly = abbreviate,
    humanFriendlyDecimal = abbreviateDecimals,
    href = href
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'gauge', x,
    package = 'flexdashboard',
    dependencies = rmarkdown::html_dependency_jquery(),
    preRenderHook = function(widget) {
      theme <- bslib::bs_current_theme()
      if (is.null(theme)) {
        return(widget)
      }
      # Resolve any accent colors in the sectors
      widget$x$customSectors <- resolveSectorColors(
        widget$x$customSectors,
        bslib::bs_get_variables(theme, accent_colors())
      )
      # Supply smarter defaults for grayscale colors and fonts
      vars <- bslib::bs_get_variables(theme, c("bg", "fg", "font-family-base"))
      gray_pal <- scales::colour_ramp(
        htmltools::parseCssColors(vars[c("bg", "fg")])
      )
      defaults <- list(
        gaugeColor = gray_pal(0.1),
        valueFontColor = gray_pal(0.9),
        labelFontColor = gray_pal(0.65),
        valueFontFamily = vars[["font-family-base"]],
        labelFontFamily = vars[["font-family-base"]]
      )
      widget$x <- utils::modifyList(widget$x, defaults)
      widget
    }
  )
}

#' @export
#' @rdname gauge
gaugeSectors <- function(success = NULL, warning = NULL, danger = NULL,
                         colors = c("success", "warning", "danger")) {
  structure(
    list(
      success = success, warning = warning, danger = danger,
      colors = rep_len(colors %||% c("success", "warning", "danger"), 3)
    ),
    class = "gaugeSectors"
  )
}

resolveSectorColors <- function(sectors, accentMap) {
  sectors$ranges <- lapply(sectors$ranges, function(x) {
    if (is_accent_color(x$color)) {
      x$color <- accentMap[[x$color]]
    }
    x$color <- htmltools::parseCssColors(x$color)
    x
  })
  sectors
}


#' Shiny bindings for gauge
#'
#' Output and render functions for using gauge within Shiny
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
#' @name gauge-shiny
#'
#' @export
gaugeOutput <- function(outputId, width = '100%', height = '200px') {
  htmlwidgets::shinyWidgetOutput(outputId, 'gauge', width, height, package = 'flexdashboard')
}

#' @rdname gauge-shiny
#' @export
renderGauge <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, gaugeOutput, env, quoted = TRUE)
}
