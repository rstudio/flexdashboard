
rmarkdown::pandoc_version()

# install Winston's experimental branch: devtools::install_github("wch/webshot@rmd")
webshot::rmdshot('examples/11_shiny-kmeans-clustering/dashboard.Rmd',
  'examples/11_shiny-kmeans-clustering/rmdshot-pandoc2.0.3.png', delay = 6)
