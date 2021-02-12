library(sass)
pkg_dir <- rprojroot::find_package_root_file()
pkgload::load_all(pkg_dir) # To load themeColors

resources <- file.path(pkg_dir, "inst/rmarkdown/templates/flex_dashboard/resources/")

# Compile CSS the 'core' CSS for viewBox()
withr::with_dir(resources, {
  sass(
    sass_file("value-box-sass/core.scss"),
    output = "value-box.css",
    cache = FALSE
  )
})

# Compile a different CSS for each theme to facilitate viewBox()'s accent colors
for (theme in names(themeColors)) {
  colors <- themeColors[[theme]]
  withr::with_dir(resources, {
    sass(
      list(
        sprintf(
          "$theme-colors: (%s);",
          paste0("'", names(colors), "': ", colors, collapse = ", ")
        ),
        sass_file("value-box-sass/accent-static.scss")
      ),
      output = paste0("theme-", theme, "-value-box.css"),
      cache = FALSE
    )
  })
}
