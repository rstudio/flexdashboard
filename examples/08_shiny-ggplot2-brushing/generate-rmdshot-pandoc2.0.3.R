
rmarkdown::pandoc_version()

# install Winston's experimental branch: devtools::install_github("wch/webshot@rmd")
webshot::rmdshot('examples/08_shiny-ggplot2-brushing/dashboard.Rmd',
  'examples/08_shiny-ggplot2-brushing/rmdshot-pandoc2.0.3.png', delay = 6)
