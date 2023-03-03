
test_that("flex_dashboard format", {

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
                      output_file = output_file,
                      quiet = TRUE)
    expect_true(file.exists(output_file))
  })
})

test_that("figure size knitr options are written into the document", {
  skip_if_not(rmarkdown::pandoc_available())

  rmd_src <- test_path("rmds", "fig-size-knitr-options.Rmd")
  rmd <- tempfile(fileext = ".Rmd")
  file.copy(rmd_src, rmd)
  on.exit(unlink(rmd), add = TRUE)

  rmd_out <- rmarkdown::render(rmd, quiet = TRUE)
  on.exit(unlink(rmd_out), add = TRUE)

  lines <- readLines(rmd_out)

  # Extract tested portion of the pre-rendered document
  test <- grep("<!-- TEST -->", lines, fixed = TRUE)
  expect_length(test, 2)
  test_lines <- lines[seq(test[1] + 1, test[2] - 1)]

  # Minimize sensitivity to trivial changes
  test_lines <- trimws(test_lines)
  test_lines <- test_lines[nzchar(test_lines)]

  # Replace base64 data with static content
  test_lines <- gsub("data:([^;]+);base64,[^\"]+", "data:\\1;base64,...", test_lines)

  expect_snapshot(cat(test_lines, sep = "\n"))
})