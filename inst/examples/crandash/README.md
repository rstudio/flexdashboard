## crandash

Demo of dashboard with streaming updates, using [flexdashboard](https://rstudio.github.io/flexdashboard) and [shiny](http://shiny.rstudio.com).

The streaming data is a 1-week-delayed livestream of download logs from cran.rstudio.com. The server code for that service is at [jcheng5/cransim](https://github.com/jcheng5/cransim).

### Requirements

```r
install.packages(c("shiny", "dplyr", "htmlwidgets", "digest", "bit"))
devtools::install_github("jcheng5/bubbles")
devtools::install_github("hadley/shinySignals")
```

### Running the Dashboard

```r
rmarkdown::run("crandash.Rmd")
```

