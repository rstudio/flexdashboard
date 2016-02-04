


#'@export
keen_dashboard <- function(smart = TRUE,
                           self_contained = TRUE,
                           theme = "default",
                           css = NULL,
                           includes = NULL,
                           lib_dir = NULL,
                           md_extensions = NULL,
                           pandoc_args = NULL,
                           ...) {

  # function for resolving resources
  resource <- function(name) {
    system.file("rmarkdown/templates/keen_dashboard/resources", name,
                package = "dashboards")
  }


  # build pandoc args
  args <- c("--standalone")

  # use section divs
  args <- c(args, "--section-divs")

  # additional css
  for (css_file in css)
    args <- c(args, "--css", pandoc_path_arg(css_file))

  # add template
  args <- c(args, "--template", pandoc_path_arg(resource("default.html")))

  # include dashboard.css and dashboard.js
  dashboardAssets <- c('<style type="text/css">',
                       readLines(resource("dashboard.css"), encoding = "UTF-8"),
                       '</style>',
                       '<script type="text/javascript">',
                       readLines(resource("dashboard.js"), encoding = "UTF-8"),
                       '</script>')
  dashboardAssetsFile <- tempfile(fileext = ".html")
  writeLines(dashboardAssets, dashboardAssetsFile)
  args <- c(args, pandoc_include_args(before_body = dashboardAssetsFile))

  # determine knitr options
  knitr_options <- knitr_options_html(4, 4, FALSE, FALSE, "png")
  knitr_options$opts_chunk$echo = FALSE

  # return format
  output_format(
    knitr = knitr_options,
    pandoc = pandoc_options(to = "html",
                            from = rmarkdown_format(md_extensions),
                            args = args),
    keep_md = FALSE,
    clean_supporting = self_contained,
    base_format = html_document_base(smart = smart, theme = theme,
                                     self_contained = self_contained,
                                     lib_dir = lib_dir, mathjax = NULL,
                                     template = "default",
                                     pandoc_args = pandoc_args,
                                     bootstrap_compatible = TRUE,
                                     ...)
  )

}

