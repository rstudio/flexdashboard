
rmarkdown::pandoc_version()

# install Winston's experimental branch: devtools::install_github("wch/webshot@rmd")
webshot::rmdshot('examples/03_shiny-biclust-example/dashboard.Rmd',
  'examples/03_shiny-biclust-example/rmdshot-pandoc2.0.3.png', delay = 6)
