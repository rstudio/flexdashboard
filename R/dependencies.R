html_dependencies_fonts <- function(font_awesome, ionicons) {
  deps <- list()
  if (font_awesome)
    deps <- append(deps, list(html_dependency_font_awesome()))
  if (ionicons)
    deps <- append(deps, list(html_dependency_ionicons()))
  deps
}

# function for resolving resources
flexdashboard_dependency <- function(name) {
  system.file("www", name, package = "flexdashboard")
}

html_dependency_font_awesome <- function() {
  htmlDependency(
    "font-awesome",
    "4.5.0",
    src = flexdashboard_dependency("font-awesome"),
    stylesheet = "css/font-awesome.min.css"
  )
}

html_dependency_ionicons <- function() {
  htmlDependency(
    "ionicons",
    "2.0.1",
    src = flexdashboard_dependency("ionicons"),
    stylesheet = "css/ionicons.min.css"
  )
}

html_dependency_stickytableheaders <- function() {
  htmlDependency(
    "stickytableheaders",
    "0.1.19",
    src = flexdashboard_dependency("stickytableheaders"),
    script = "jquery.stickytableheaders.min.js"
  )
}

html_dependency_featherlight <- function() {
  htmlDependency(
    "featherlight",
    "1.3.5",
    src = flexdashboard_dependency("featherlight"),
    stylesheet = "featherlight.min.css",
    script = "featherlight.min.js"
  )
}

html_dependency_prism <- function() {
  htmlDependency(
    "prism",
    "1.4.1",
    src = flexdashboard_dependency("prism"),
    stylesheet = "prism.css",
    script = "prism.js"
  )
}

html_dependency_featherlight <- function() {
  htmlDependency(
    "featherlight",
    "1.3.5",
    src = flexdashboard_dependency("featherlight"),
    stylesheet = "featherlight.min.css",
    script = "featherlight.min.js"
  )
}

