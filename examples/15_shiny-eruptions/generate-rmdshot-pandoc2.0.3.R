
rmarkdown::pandoc_version()

# install Winston's experimental branch: devtools::install_github("wch/webshot@rmd")
webshot::rmdshot('examples/15_shiny-old-faithful-eruptions/dashboard.Rmd',
  'examples/15_shiny-old-faithful-eruptions/rmdshot-pandoc2.0.3.png', delay = 6)
