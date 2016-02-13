
context("Format")

test_that("flex_dashbaord format", {

  # don't run on cran because pandoc is required
  skip_on_cran()

  # work in a temp directory
  dir <- tempfile()
  dir.create(dir)
  oldwd <- setwd(dir)
  on.exit(setwd(oldwd), add = TRUE)

  # create a draft of a flex_dashboard
  testdoc <- "testdoc.Rmd"
  rmarkdown::draft(testdoc,
                   system.file("rmarkdown", "templates", "flex_dashboard",
                               package = "flexdashboard"),
                   create_dir = FALSE,
                   edit = FALSE)

  # render it
  capture.output({
    output_file <- tempfile(fileext = ".html")
    output_format <- flex_dashboard()
    rmarkdown::render(testdoc,
                      output_format = output_format,
                      output_file = output_file)
    expect_true(file.exists(output_file))
  })
})

