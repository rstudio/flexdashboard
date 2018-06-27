
rmarkdown::pandoc_version()

# install Winston's experimental branch: devtools::install_github("wch/webshot@rmd")
webshot::rmdshot('examples/04_shiny-cran-downloads/dashboard.Rmd',
  'examples/04_shiny-cran-downloads/rmdshot-pandoc2.0.3.png', delay = 6)
