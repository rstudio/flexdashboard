library(rsconnect)

example_dir <- rprojroot::find_package_root_file("examples")
app_basename <- grep("^[0-9][0-9]_", list.dirs(example_dir, full.names = FALSE), value = TRUE)
app_name <- vapply(strsplit(app_basename, "_"), function(x) x[[2]], character(1))


Map(
  f = function(name, basename) {
    file <- file.path(example_dir, basename, "dashboard.Rmd")
    if (!file.exists(file)) return()

    message("---- Deploying flexdashboard example app ", name, " --------")

    deployApp(appDir = file, appName = paste0("flexdashboard-", name), account = "testing-apps")
  }, app_name, app_basename
)
