#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
gauge <- function(value, min, max,
                  symbol = NULL, label = NULL,
                  sectors = gaugeSectors()) {

  x <- list(
    value = value,
    min = min,
    max = max,
    symbol = symbol,
    label = label,
    customSectors = I(resolveSectors(sectors, min, max))
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'gauge',
    x,
    package = 'flexdashboard',
    dependencies = rmarkdown::html_dependency_jquery()
  )
}

#' @export
#' @rdname gauge
gaugeSectors <- function(success = NULL, warning = NULL, danger = NULL,
                         colors = c("success", "warning", "danger")) {
  list(success = success,
       warning = warning,
       danger = danger,
       colors = colors)
}

resolveSectors <- function(sectors, min, max) {

  # create default sectors if necessary
  if (is.null(sectors)) {
    sectors = sectors(
      success = c(min, max),
      warning = NULL,
      danger = NULL,
      colors = c("success", "warning", "danger")
    )
  }
  # provide default success range if only colors were specified
  if (is.null(sectors$success) &&
      is.null(sectors$warning) &&
      is.null(sectors$danger)) {
    sectors$success <- c(min, max)
  }
  # provide default colors if none were specified
  if (is.null(sectors$colors))
    sectors$colors <- c("success", "warning", "danger")

  # create custom sectors to pass to justgage
  customSectors <- list()
  addSector <- function(sector, color) {
    if (!is.null(sector)) {
      # validate
      if (!is.numeric(sector) || length(sector) != 2)
        stop("sectors must be numeric vectors of length 2", call. = FALSE)
      # add sector
      customSectors[[length(customSectors) + 1]] <<-
        list(lo = sector[[1]], hi = sector[[2]], color = color)
    }
  }
  sectors$colors <- rep_len(sectors$colors, 3)
  addSector(sectors$success, sectors$colors[[1]])
  addSector(sectors$warning, sectors$colors[[2]])
  addSector(sectors$danger, sectors$colors[[3]])

  # return
  customSectors
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
gaugeOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'gauge', width, height, package = 'flexdashboard')
}

#' @rdname gauge-shiny
#' @export
renderGauge <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, gaugeOutput, env, quoted = TRUE)
}

