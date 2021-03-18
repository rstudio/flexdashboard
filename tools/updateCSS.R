library(sass)

src <- rprojroot::find_package_root_file("inst/www/flex_dashboard/flexdashboard.scss")

sass_partial(
  sass_file(src),
  bundle = bslib::bs_theme(version = 3),
  cache = NULL,
  options = sass::sass_options(output_style = "compressed"),
  output = sub("flexdashboard\\.scss$", "flexdashboard.min.css", src)
)
