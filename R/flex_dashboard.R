
#'Convert to a flex oriented dashboard
#'
#'Format for converting an R Markdown document to flex oriented dashboard. Level
#'1 headings are treated as pages; Level 2 headings as rows; and Level 3
#'headings as columns.
#'
#'@inheritParams rmarkdown::html_document
#'
#'@param highlight Syntax highlighting style. Supported styles include
#'  "default", "tango", "pygments", "kate", "monochrome", "espresso", "zenburn",
#'  and "haddock". Pass NULL to prevent syntax highlighting.
#'
#'@export
flex_dashboard <- function(fig_width = 5,
                           fig_height = 3.5,
                           dev = "png",
                           smart = TRUE,
                           self_contained = TRUE,
                           fill_page = TRUE,
                           orientation = c("columns", "rows"),
                           sidebar_width = 250,
                           theme = "default",
                           highlight = "default",
                           mathjax = "default",
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

  # additional css
  for (css_file in css)
    args <- c(args, "--css", pandoc_path_arg(css_file))

  # add template
  args <- c(args, "--template", pandoc_path_arg(resource("default.html")))

  # resolve theme
  if (identical(theme, "default"))
    theme <- "cosmo"
  else if (identical(theme, "bootstrap"))
    theme <- "default"

  # fill page
  if (fill_page)
    args <- c(args, pandoc_variable_arg("fill_page", "1"))

  # orientation variable
  orientation = match.arg(orientation)
  args <- c(args, pandoc_variable_arg("orientation", orientation))

  # sidebar width variable
  args <- c(args, pandoc_variable_arg("sidebar_width", sidebar_width))

  # default fig_width and fig_height variables
  figSizePixels <- function(size) as.integer(size * 96)
  args <- c(args, pandoc_variable_arg("default_fig_width", figSizePixels(fig_width)))
  args <- c(args, pandoc_variable_arg("default_fig_height", figSizePixels(fig_height)))

  # determine knitr options
  knitr_options <- knitr_options_html(fig_width = fig_width,
                                      fig_height = fig_width,
                                      fig_retina = 2,
                                      keep_md = FALSE,
                                      dev = dev)
  knitr_options$opts_chunk$echo = FALSE
  knitr_options$opts_chunk$comment = NA

  # add hook to capture fig.width and fig.height and serialized
  # them into the DOM
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
    } else {
      dashboardAssets <- c('<style type="text/css">',
                           readLines(resource("flexdashboard.css")),
                           readLines(resource(paste0("theme-", theme, ".css"))),
                           '</style>',
                           '<script type="text/javascript">',
                           readLines(resource("flexdashboard.js")),
                           '</script>')
      dashboardAssetsFile <- tempfile(fileext = ".html")
      writeLines(dashboardAssets, dashboardAssetsFile)
      args <- c(args, pandoc_include_args(before_body = dashboardAssetsFile))
    }

    # highlight
    args <- c(args, pandoc_highlight_args(highlight, default = "pygments"))

    args
  }

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
                                     ...)
  )

}
