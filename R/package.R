#' flexdashboard: Interactive dashboards for R
#'
#' Create interactive dashboards using \pkg{rmarkdown}.
#'
#' @details
#'
#' \itemize{
#' \item{Use R Markdown to publish a group of related data visualizations as a dashboard.}
#' \item{Ideal for publishing interactive JavaScript visualizations based on htmlwidgets (also works with standard base, lattice, and grid graphics).}
#' \item{Flexible and easy to specify layouts. Charts are intelligently re-sized to fill the browser and adapted for display on mobile devices.}
#' \item{Optionally use Shiny to drive visualizations dynamically.}
#' }
#'
#' See the flexdashboard website for additional documentation:
#'   \href{https://pkgs.rstudio.com/flexdashboard/}{https://pkgs.rstudio.com/flexdashboard/}
#'
#' @import rmarkdown
#' @import htmltools
#' @import sass
#' @import bslib
#' @importFrom jsonlite toJSON
#' @importFrom tools file_path_sans_ext
#' @importFrom utils packageVersion
#' @importFrom grDevices col2rgb
#'
#' @docType package
"_PACKAGE"


