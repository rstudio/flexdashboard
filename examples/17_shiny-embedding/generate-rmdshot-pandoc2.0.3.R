
rmarkdown::pandoc_version()

# install Winston's experimental branch: devtools::install_github("wch/webshot@rmd")
webshot::rmdshot('examples/17_shiny-embedding/dashboard.Rmd',
  'examples/17_shiny-embedding/rmdshot-pandoc2.0.3.png', delay = 6)
