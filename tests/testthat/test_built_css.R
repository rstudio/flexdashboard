test_that("flexdashboard.min.css has been built", {
  skip_on_cran()

  src <- system.file("www/flex_dashboard/flexdashboard.scss", package = "flexdashboard")

  new_css <- sass::sass_partial(
    sass::sass_file(src),
    bundle = bslib::bs_theme(version = 3),
    cache = NULL,
    options = sass::sass_options(output_style = "compressed")
  )

  # Remove class and attributes
  new_css <- sub("\n", "", as.character(new_css), fixed = TRUE)

  pkg_css_file <- system.file("www/flex_dashboard/flexdashboard.min.css", package = "flexdashboard")
  pkg_css <- readLines(pkg_css_file)

  # If this fails, that means that tools/updateShinyCSS.R needs to be run.
  expect_identical(new_css, pkg_css)
})

