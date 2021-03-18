test_that("flexdashboard.css has been built", {

  src <- rprojroot::find_package_root_file("inst/www/flex_dashboard/flexdashboard.scss")

  new_css <- sass_partial(
    sass_file(src),
    bundle = bslib::bs_theme(version = 3),
    cache = NULL
  )

  pkg_css_file <- sub("flexdashboard\\.scss$", "flexdashboard.css", src)
  pkg_css <- readChar(pkg_css_file, file.size(pkg_css_file), useBytes = TRUE)

  # If this fails, that means that tools/updateCSS.R needs to be run.
  expect_identical(as.character(new_css), pkg_css)
})
