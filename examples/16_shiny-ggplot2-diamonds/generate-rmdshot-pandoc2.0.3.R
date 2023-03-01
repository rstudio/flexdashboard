
rmarkdown::pandoc_version()

# install Winston's experimental branch: devtools::install_github("wch/webshot@rmd")
webshot::rmdshot('examples/16_shiny-diamonds-explorer/dashboard.Rmd',
  'examples/16_shiny-diamonds-explorer/rmdshot-pandoc2.0.3.png', delay = 6)
