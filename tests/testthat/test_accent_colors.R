test_that("resolveAccentColors() works", {
  cols <- c("primary", "success", "pink", "#000", "#FFFFFF", NA)
  expect_equal(
    resolveAccentColors(cols, "cosmo"),
    c("rgba(39, 128, 227, 0.7)", "rgba(63, 182, 24, 0.7)",
     "pink", "#000", "#FFFFFF", NA)
  )
  expect_equal(
    resolveAccentColors(cols, bslib::bs_theme(version = 4)),
    c("#007bff", "#28a745", "pink", "#000", "#FFFFFF", NA)
  )
  expect_equal(
    resolveAccentColors(cols, bslib::bs_theme(version = 3)),
    c("#337ab7", "#5cb85c", "pink", "#000", "#FFFFFF", NA)
  )
})
