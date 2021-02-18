library(sass)

src <- rprojroot::find_package_root_file("inst/rmarkdown/templates/flex_dashboard/resources/flexdashboard.scss")

sass_partial(
  sass_file(src),
  bundle = bslib::bs_theme(version = 3, "contrast-color-dark" = ""),
  output = sub("flexdashboard\\.scss$", "flexdashboard.css", src)
)
