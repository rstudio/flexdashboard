
#'Convert to a grid oriented dashboard
#'
#'Format for converting an R Markdown document to grid oriented dashboard. Level
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
grid_dashboard <- function(fig_width = 5,
                           fig_height = 3.5,
                           dev = "png",
                           smart = TRUE,
                           self_contained = TRUE,
                           orientation = c("rows", "columns"),
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
    system.file("rmarkdown/templates/grid_dashboard/resources", name,
                package = "dashboards")
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

  # add flag if we using the default theme
  if (identical(theme, "default"))
    args <- c(args, pandoc_variable_arg("theme_default", "1"))

  # body padding based on theme
  args <- c(args, pandoc_body_padding_variable_arg(theme))

  # orientation variable
  orientation = match.arg(orientation)
  args <- c(args, pandoc_variable_arg("orientation", orientation))

  # default fig_width and fig_height variables
  args <- c(args, pandoc_variable_arg("default_fig_width", fig_width))
  args <- c(args, pandoc_variable_arg("default_fig_height", fig_height))

  # determine knitr options
  knitr_options <- knitr_options_html(fig_width = fig_width,
                                      fig_height = fig_height,
                                      fig_retina = 2,
                                      keep_md = FALSE,
                                      dev = dev)
  knitr_options$opts_chunk$echo = FALSE

  # add hook to capture fig.width and fig.height and serialized
  # them into the DOM
  knitr_options$knit_hooks <- list()
  knitr_options$knit_hooks$chunk  <- function(x, options) {
    knitrOptions <- paste0(
      '<div class="knitr-options" ',
           'data-fig-width="', as.integer(options$fig.width * 96), '" ',
           'data-fig-height="', as.integer(options$fig.height * 96), '">',
      '</div>'
    )
    paste(knitrOptions, x, sep = '\n')
  }

  # preprocessor
  pre_processor <- function (metadata, input_file, runtime, knit_meta,
                             files_dir, output_dir) {

    args <- c()

    # include dashboard.css and dashboard.js (but not in devel
    # mode, in that case relative filesystem references to
    # them are included in the template along with live reload)
    if (devel) {
      args <- c(args, pandoc_variable_arg("devel", "1"))
    } else {
      dashboardAssets <- c('<style type="text/css">',
                           readLines(resource("dashboard.css")),
                           '</style>',
                           '<script type="text/javascript">',
                           readLines(resource("dashboard.js")),
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


# variable which controls body offset (depends on height of navbar in theme)
pandoc_body_padding_variable_arg <- function(theme) {

  # height of navbar in bootstrap 3.3.5
  navbarHeights <- c("default" = 51,
                     "cerulean" = 51,
                     "journal" = 61 ,
                     "flatly" = 60,
                     "readable" = 66,
                     "spacelab" = 52,
                     "united" = 51,
                     "cosmo" = 51,
                     "lumen" = 54,
                     "paper" = 64,
                     "sandstone" = 61,
                     "simplex" = 41,
                     "yeti" = 45)

  # body padding is navbar height + 9
  bodyPadding <- navbarHeights[[theme]] + 9

  # return variable
  pandoc_variable_arg("body_padding", bodyPadding)
}



