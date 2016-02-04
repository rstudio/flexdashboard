


#'@export
grid_dashboard <- function(fig_width = 5,
                           fig_height = 3.5,
                           fig_retina = 2,
                           dev = "png",
                           smart = TRUE,
                           self_contained = TRUE,
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

  # determine knitr options
  knitr_options <- knitr_options_html(fig_width = fig_width,
                                      fig_height = fig_height,
                                      fig_retina = fig_retina,
                                      keep_md = FALSE,
                                      dev = dev)
  knitr_options$opts_chunk$echo = FALSE

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

