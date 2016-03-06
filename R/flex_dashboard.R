
#'R Markdown Format for Flexible Dashboards
#'
#'Format for converting an R Markdown document to a grid oriented dashboard
#'layout. The dashboard flexibly adapts the size of it's plots and htmlwidgets
#'to its containing web page.
#'
#'@inheritParams rmarkdown::html_document
#'
#'@param social Specify a character vector of social sharing services to
#'  automatically add sharing links for them on the \code{navbar}. Valid values
#'  are "twitter", "facebook", "google-plus", "linkedin", and "pinterest" (more
#'  than one service can be specified).
#'
#'@param source_code URL for source code of dashboard (used primarily for
#'  publishing flexdashboard examples). Automatically creates a \code{navbar}
#'  item which links to the source code.
#'
#'@param navbar Optional list of elements to be placed on the flexdashboard
#'  navigation bar. Each element should be a list containing a \code{title}
#'  and/or \code{icon} field, a \code{url} field and an optional \code{align}
#'  ("left" or "right") field.
#'
#'@param orientation Determines whether level 2 headings are treated as
#'  dashboard rows or dashboard columns.
#'
#'@param vertical_layout Vertical layout behavior: "fill" to vertically resize
#'  charts so they completely fill the page; "scroll" to layout charts at their
#'  natural height, scrolling the page if necessary.
#'
#'@param theme Visual theme ("default", "bootstrap", "cerulean", "journal",
#'  "flatly", "readable", "spacelab", "united", "cosmo", "lumen", "paper",
#'  "sandstone", "simplex", or "yeti"). The "cosmo" theme is used when "default"
#'  is specified.
#'
#'@param highlight Syntax highlighting style. Supported styles include
#'  "default", "tango", "pygments", "kate", "monochrome", "espresso", "zenburn",
#'  and "haddock". Pass NULL to prevent syntax highlighting.
#'
#'@param devel Enable development mode (used for development of the format
#'  itself, not useful for users of the format).
#'
#'@param ... Unused
#'
#'@details See the flexdashboard website for additional documentation
#'  flex_dashboard: http://rstudio.github.io/flexdashboard
#'
#' @examples
#' \dontrun{
#'
#' library(rmarkdown)
#' library(flexdashboard)
#'
#' # simple invocation
#' render("dashboard.Rmd", flex_dashboard())
#'
#' # specify the theme option
#' render("pres.Rmd", flex_dashboard(theme = "yeti"))
#' }
#'
#'
#'@export
flex_dashboard <- function(fig_width = 5,
                           fig_height = 4,
                           dev = "png",
                           smart = TRUE,
                           self_contained = TRUE,
                           social = NULL,
                           source_code = NULL,
                           navbar = NULL,
                           orientation = c("columns", "rows"),
                           vertical_layout = c("fill", "scroll"),
                           theme = "default",
                           highlight = "default",
                           mathjax = "default",
                           extra_dependencies = NULL,
                           css = NULL,
                           includes = NULL,
                           lib_dir = NULL,
                           md_extensions = NULL,
                           pandoc_args = NULL,
                           devel = FALSE,
                           ...) {

  # function for resolving resources
  resource <- function(name) {
    system.file("rmarkdown/templates/flex_dashboard/resources", name,
                package = "flexdashboard")
  }

  # force self_contained to FALSE in devel mode
  if (devel)
    self_contained <- FALSE

  # build pandoc args
  args <- c("--standalone")

  # use section divs
  args <- c(args, "--section-divs")

  # add template
  args <- c(args, "--template", pandoc_path_arg(resource("default.html")))

  # handle automatic navbar links
  navbar <- append(navbar, navbar_links(social, source_code))

  # handle navbar
  if (length(navbar) > 0)
    args <- c(args, pandoc_navbar_args(navbar))

  # resolve orientation
  orientation <- match.arg(orientation)

  # resolve vertical_layout
  vertical_layout <- match.arg(vertical_layout)
  fill_page <- identical(vertical_layout, "fill")

  # resolve theme
  if (identical(theme, "default"))
    theme <- "cosmo"
  else if (identical(theme, "bootstrap"))
    theme <- "default"

  # navbar type
  if (theme %in% c("default"))
    navbar_type <- "default"
  else
    navbar_type <- "inverse"
  args <- c(args, pandoc_variable_arg("navbar", navbar_type))

  # determine knitr options
  knitr_options <- knitr_options_html(fig_width = fig_width,
                                      fig_height = fig_height,
                                      fig_retina = 2,
                                      keep_md = FALSE,
                                      dev = dev)
  knitr_options$opts_chunk$echo = FALSE
  knitr_options$opts_chunk$comment = NA

  # add hook to capture fig.width and fig.height and serialized
  # them into the DOM
  figSizePixels <- function(size) as.integer(size * 96)
  knitr_options$knit_hooks <- list()
  knitr_options$knit_hooks$chunk  <- function(x, options) {
    knitrOptions <- paste0(
      '<div class="knitr-options" ',
           'data-fig-width="', figSizePixels(options$fig.width), '" ',
           'data-fig-height="', figSizePixels(options$fig.height), '">',
      '</div>'
    )
    paste(knitrOptions, x, sep = '\n')
  }

  # preprocessor
  pre_processor <- function (metadata, input_file, runtime, knit_meta,
                             files_dir, output_dir) {

    args <- c()

    # include flexdashboard.css and flexdashboard.js (but not in devel
    # mode, in that case relative filesystem references to
    # them are included in the template along with live reload)
    if (devel) {
      args <- c(args, pandoc_variable_arg("devel", "1"))
      dashboardCss <- NULL
      dashboardScript <- NULL
    } else {
      if (fill_page) {
        fillPageCss <- readLines(resource("fillpage.css"))
      } else {
        fillPageCss <- NULL
      }

      dashboardCss <- c(
        '<style type="text/css">',
        readLines(resource("flexdashboard.css")),
        readLines(resource(paste0("theme-", theme, ".css"))),
        fillPageCss,
        '</style>'
      )

      dashboardScript <- c(
        '<script type="text/javascript">',
        readLines(resource("flexdashboard.js")),
        '</script>'
      )
    }

    # add FlexDashboard initialization
    dashboardScript <- c(dashboardScript,
      '<script type="text/javascript">',
      '$(document).ready(function () {',
      '  FlexDashboard.init({',
      paste0('    fillPage: ', ifelse(fill_page,'true','false'), ','),
      paste0('    orientation: "', orientation, '",'),
      paste0('    defaultFigWidth: ', figSizePixels(fig_width), ','),
      paste0('    defaultFigHeight: ', figSizePixels(fig_height)),
      '  });',
      '});',
      '</script>'
    )

    # css
    if (!is.null(dashboardCss)) {
      dashboardCssFile <- tempfile(fileext = "html")
      writeLines(dashboardCss, dashboardCssFile)
      args <- c(args, pandoc_include_args(in_header = dashboardCssFile))
    }

    # script
    dashboardScriptFile <- tempfile(fileext = ".html")
    writeLines(dashboardScript, dashboardScriptFile)
    args <- c(args, pandoc_include_args(before_body = dashboardScriptFile))

    # highlight
    args <- c(args, pandoc_highlight_args(highlight, default = "pygments"))

    # user includes
    if (is.null(includes))
      includes <- list()
    args <- c(args, pandoc_include_args(in_header = includes$in_header,
                                        before_body = includes$before_body,
                                        after_body = includes$after_body))

    # additional user css
    for (css_file in css)
      args <- c(args, "--css", pandoc_path_arg(css_file))

    args
  }

  # dependencies
  extra_dependencies <- append(extra_dependencies,
                               list(html_dependency_jquery(),
                                    html_dependency_float_thead()))
  extra_dependencies <- append(extra_dependencies,
                               navbar_dependencies(navbar))

  # return format
  output_format(
    knitr = knitr_options,
    pandoc = pandoc_options(to = "html",
                            from = rmarkdown_format(md_extensions),
                            args = args),
    keep_md = FALSE,
    clean_supporting = self_contained,
    pre_processor = pre_processor,
    base_format = html_document_base(smart = smart, theme = theme,
                                     self_contained = self_contained,
                                     lib_dir = lib_dir, mathjax = mathjax,
                                     template = "default",
                                     pandoc_args = pandoc_args,
                                     bootstrap_compatible = TRUE,
                                     extra_dependencies = extra_dependencies,
                                     ...)
  )
}

pandoc_navbar_args <- function(navbar) {

  # validate
  if (!is.list(navbar))
    stop("navbar must be a list of navbar elements", call. = FALSE)
  for (item in navbar) {
     if (!is.list(item) ||
         (is.null(item[["title"]]) && is.null(item[["icon"]]))) {
       stop("navbar must be a list of navbar elements", call. = FALSE)
     }
  }

  # convert to json
  navbarJson <- toJSON(navbar, auto_unbox = TRUE)

  # write to a temporary file
  navbarHtml <- paste('<script id="flexdashboard-navbar" type="application/json">',
                      navbarJson,
                      '</script>',
                      sep = '\n')

  # return as an in_header include
  pandoc_include_args(in_header = as_tmpfile(navbarHtml))
}

navbar_links <- function(social, source_code) {

  links <- list()

  # social links
  for (service in social)
    links <- append(links, list(list(icon = paste0("fa-", service))))

  # source_code
  if (!is.null(source_code)) {

    # determine icon
    if (grepl("^http[s]?://git.io", source_code) ||
        grepl("^http[s]?://github.com", source_code)) {
      icon <- "fa-github"
    } else {
      icon <- "fa-code"
    }

    # build nav item
    link <- list(title = "Source Code",
                 icon = icon,
                 url = source_code,
                 align = "right")
    links <- append(links, list(link))
  }

  links
}

navbar_dependencies <- function(navbar) {

  font_awesome <- FALSE
  ionicons <- FALSE

  for (item in navbar) {
    if (!is.null(item$icon)) {
      if (grepl('^fa-', item$icon))
        font_awesome <- TRUE
      if (grepl('^ion-', item$icon))
        ionicons <- TRUE
    }
  }

  deps <- list()
  if (font_awesome)
    deps <- append(deps, list(html_dependency_font_awesome()))
  if (ionicons)
    deps <- append(deps, list(html_dependency_ionicons()))
  deps
}

html_dependency_font_awesome <- function() {
  htmlDependency(
    "font-awesome",
    "4.5.0",
    src = system.file("www/font-awesome", package = "flexdashboard"),
    stylesheet = "css/font-awesome.min.css"
  )
}

html_dependency_ionicons <- function() {
  htmlDependency(
    "ionicons",
    "2.0.1",
    src = system.file("www/ionicons", package = "flexdashboard"),
    stylesheet = "css/ionicons.min.css"
  )
}

html_dependency_float_thead <- function() {
  htmlDependency(
    "float-thead",
    "1.3.2",
    src = system.file("www/float-thead", package = "flexdashboard"),
    script = "jquery.floatThead.min.js"
  )
}


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


# devel mode
knit_devel <- function(input, ...) {
  rmarkdown::render(input, quiet = TRUE)
}
