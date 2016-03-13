#' Create a value box for the main body of a dashboard.
#'
#' A value box displays a value (usually a number) in large text, with a smaller
#' caption beneath, and a large icon on the right side.
#'
#' @param value The value to display in the box. Usually a number or short text.
#' @param caption The caption to display beneatht the value.
#' @param icon An icon for the box.
#' @param color Background color for the box.
#' @param expr An expression that generates a value box
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @export
valueBox <- function(value, caption = NULL, icon = NULL, color = NULL) {

  # resolve background color
  if (!is.null(color) && color %in% c("primary", "info", "success", "warning", "danger"))
    color <- paste0("bg-", color)

  # build the value output
  valueOutput <- tags$span(class="value-output",
            `data-caption` = caption,
            `data-icon` = icon,
            `data-color` = color,
    value
  )

  # attach font dependency if necessary
  hasPrefix <- function(x, prefix) {
    if (!is.null(x))
      grepl(paste0('^', prefix), x)
    else
      FALSE
  }
  fontAwesome <- hasPrefix(icon, 'fa')
  ionicons <-  hasPrefix(icon, 'ion')
  deps <- html_dependencies_fonts(fontAwesome, ionicons)
  if (length(deps) > 0)
     valueOutput <- attachDependencies(valueOutput, deps)

  # return output
  valueOutput
}

#' @rdname valueBox
#' @export
renderValueBox <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  renderUI(expr, env, quoted = TRUE)
}

