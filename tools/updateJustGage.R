library(rprojroot)

justgage <- find_package_root_file("inst/htmlwidgets/lib/justgage")

# TODO: update this to an official release if this gets merged
# https://github.com/toorshia/justgage/pull/358
src_js <- "https://raw.githubusercontent.com/cpsievert/justgage/labelFontFamily/dist/justgage.js"
download.file(
  src_js,
  file.path(justgage, basename(src_js))
)
