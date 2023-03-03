
#'R Markdown Format for Flexible Dashboards
#'
#'Format for converting an R Markdown document to a grid oriented dashboard
#'layout. The dashboard flexibly adapts the size of it's plots and htmlwidgets
#'to its containing web page.
#'
#'@inheritParams rmarkdown::html_document
#'@inheritParams rmarkdown::html_document_base
#'
#'@param fig_retina Scaling to perform for retina displays (defaults to 2). Note
#'  that for flexdashboard enabling retina scaling provides for both crisper
#'  graphics on retina screens but also much higher quality auto-scaling of R
#'  graphics within flexdashboard containers.
#'
#'@param fig_mobile Create an additional rendering of each R graphics figure
#'  optimized for rendering on mobile devices oriented in portrait mode. If
#'  \code{TRUE}, creates a figure which is 3.75 x 4.80 inches wide; if
#'  \code{FALSE}, create no additional figure for mobile devices; if a numeric
#'  vector of length 2, creates a mobile figure with the specified width and
#'  height.
#'
#'@param favicon Path to graphic to be used as a favicon for the dashboard. Pass
#'  \code{NULL} to use no favicon.
#'
#'@param logo Path to graphic to be used as a logo for the dashboard. Pass
#'  \code{NULL} to not include a logo. Note that no scaling is performed on the
#'  logo image, so it should fit exactly within the dimensions of the navigation
#'  bar (48 pixels high for the default "cosmo" theme, other themes may have
#'  slightly different navigation bar heights).
#'
#'@param social Specify a character vector of social sharing services to
#'  automatically add sharing links for them on the \code{navbar}. Valid values
#'  are "twitter", "facebook", "linkedin", and "pinterest" (more than one
#'  service can be specified).
#'
#'@param source_code URL for source code of dashboard (used primarily for
#'  publishing flexdashboard examples). Automatically creates a \code{navbar}
#'  item which links to the source code.
#'
#'@param navbar Optional list of elements to be placed on the flexdashboard
#'  navigation bar. Each element should be a list containing a \code{title}
#'  and/or \code{icon} field, an \code{href} field. Optional fields
#'  \code{target} (e.g. "_blank") and \code{align} ("left" or "right") are also
#'  supported.
#'
#'@param orientation Determines whether level 2 headings are treated as
#'  dashboard rows or dashboard columns.
#'
#'@param vertical_layout Vertical layout behavior: "fill" to vertically resize
#'  charts so they completely fill the page; "scroll" to layout charts at their
#'  natural height, scrolling the page if necessary.
#'
#'@param storyboard \code{TRUE} to use a storyboard layout scheme that places
#'  each dashboard component in a navigable storyboard frame. When a storyboard
#'  layout is used the \code{orientation} and \code{vertical_layout} arguments
#'  are ignored. When creating a dashbaord with multiple pages you should apply
#'  the `{.storyboard}` attribute to individual pages rather than using the
#'  global \code{storyboard} option.
#'
#'@param theme One of the following:
#'  * A [bslib::bs_theme()] object (or a list of [bslib::bs_theme()] argument values)
#'  * Use this option to choose any [Bootstrap
#'      version](https://rstudio.github.io/bslib/articles/bslib.html#bootstrap-versions),
#'      [Bootswatch
#'      theme](https://rstudio.github.io/bslib/articles/bslib.html#bootswatch-themes),
#'      or implement a [custom
#'      theme](https://rstudio.github.io/bslib/articles/bslib.html#custom-themes).
#'    * In this case, any `.scss`/`.sass` files provided to the `css`
#'      parameter may utilize the `theme`'s underlying Sass utilities
#'      (e.g., variables, mixins, etc).
#'  * A character string specifying a [Bootswatch 3](https://bootswatch.com/3/)
#'    theme name (for backwards-compatibility). The "cosmo" theme is used when
#'    "default" is specified.
#'
#'@param highlight Syntax highlighting style. Supported styles include
#'  "default", "tango", "pygments", "kate", "monochrome", "espresso", "zenburn",
#'  and "haddock". Pass NULL to prevent syntax highlighting.
#'
#'@param devel Enable development mode (used for development of the format
#'  itself, not useful for users of the format).
#'
#'@param resize_reload Disable the auto-reloading behavior when the window is
#'  resized. Useful when debugging large flexdashboard applications and this
#'  functionality is not needed.
#'
#'@param ... Other arguments to [rmarkdown::html_document_base()].
#'
#'@details See the flexdashboard website for additional documentation:
#'  \href{https://pkgs.rstudio.com/flexdashboard/}{https://pkgs.rstudio.com/flexdashboard/}
#'
#' @examples
#' \dontrun{
#'
#' library(rmarkdown)
#' library(flexdashboard)
#'
#' # simple invocation
#' render("dashboard.Rmd", flex_dashboard())
#'
#' # specify the theme option
#' render("pres.Rmd", flex_dashboard(theme = "yeti"))
#' }
#'
#'
#'@export
flex_dashboard <- function(fig_width = 6.0,
                           fig_height = 4.8,
                           fig_retina = 2,
                           fig_mobile = TRUE,
                           dev = "png",
                           self_contained = TRUE,
                           favicon = NULL,
                           logo = NULL,
                           social = NULL,
                           source_code = NULL,
                           navbar = NULL,
                           orientation = c("columns", "rows"),
                           vertical_layout = c("fill", "scroll"),
                           storyboard = FALSE,
                           theme = "default",
                           highlight = "default",
                           mathjax = "default",
                           extra_dependencies = NULL,
                           css = NULL,
                           includes = NULL,
                           lib_dir = NULL,
                           md_extensions = NULL,
                           pandoc_args = NULL,
                           devel = FALSE,
                           resize_reload = TRUE,
                           ...) {

  opts_orig <- NULL
  on_exit <- function() {
    options(opts_orig)
  }

  # force self_contained to FALSE in devel mode
  if (devel)
    self_contained <- FALSE

  # build pandoc args
  args <- c("--standalone")

  # use section divs
  args <- c(args, "--section-divs")

  # add template
  args <- c(args, "--template",
            pandoc_path_arg(resource("default.html")))

  # handle automatic navbar links
  navbar <- append(navbar, navbar_links(social, source_code))

  # handle navbar
  if (length(navbar) > 0)
    args <- c(args, pandoc_navbar_args(navbar))

  # resolve orientation
  orientation <- match.arg(orientation)

  # resolve vertical_layout
  vertical_layout <- match.arg(vertical_layout)
  fill_page <- identical(vertical_layout, "fill")

  # resolve theme
  theme <- resolve_theme(theme)
  # Set internal option so that gauge() can resolve accent colors at render-time
  opts_orig <- c(opts_orig, options(flexdashboard.theme = theme))

  # resolve auto_reload
  if (resize_reload == 'no' | grepl("fa?l?s?e?", resize_reload, ignore.case = T))
    resize_reload <- F
  else
    resize_reload <- T

  # determine knitr options
  knitr_options <- knitr_options_html(fig_width = fig_width,
                                      fig_height = fig_height,
                                      fig_retina = fig_retina,
                                      keep_md = FALSE,
                                      dev = dev)
  knitr_options$opts_chunk$echo = FALSE
  knitr_options$opts_chunk$warning = FALSE
  knitr_options$opts_chunk$message = FALSE
  knitr_options$opts_chunk$comment = NA

  # force to fill it's container (unless the option is already set)
  if (is.na(getOption('DT.fillContainer', NA))) {
    opts_orig <- c(opts_orig, options(DT.fillContainer = TRUE))
  }

  # add hook to capture fig.width and fig.height and serialize them into the DOM
  default_knitr_chunk_hook <- knitr::hooks_markdown()[["chunk"]]
  knitr_options$knit_hooks <- list()
  knitr_options$knit_hooks$chunk <- function(x, options) {
    x <- default_knitr_chunk_hook(x, options)
    knitrOptions <- paste0(
      '<div class="knitr-options" ',
           'data-fig-width="', figSizePixels(options$fig.width[[1]]), '" ',
           'data-fig-height="', figSizePixels(options$fig.height[[1]]), '">',
      '</div>'
    )
    paste(knitrOptions, x, sep = "\n")
  }

  # kntir hook to determine if we need to add various libraries
  knitr_options$knit_hooks$document <- function(x) {
    iconDeps <- icon_dependencies(x)
    if (length(iconDeps) > 0)
      knitr::knit_meta_add(list(iconDeps))
    storyboardDeps <- storyboard_dependencies(x)
    if (length(storyboardDeps) > 0)
      knitr::knit_meta_add(list(storyboardDeps))
    x
  }

  # knitr options hook to add mobile graphics device

  # resovle fig_mobile
  default_fig_mobile <- c(3.75, 4.80)
  if (is.logical(fig_mobile)) {
    if (isTRUE(fig_mobile))
      fig_mobile <- default_fig_mobile
    else
      fig_mobile <- NULL
  }

  # validate that it's either NULL or numeric vector of length 2
  if (!is.null(fig_mobile) &&
      (!is.numeric(fig_mobile) || length(fig_mobile) != 2)) {
    stop("fig_mobile must either be a logical or a numeric ",
         "vector of length 2")
  }

  # add the hook if appropriate
  mobile_figures <- list()
  if (!is.null(fig_mobile)) {
    next_figure_id <- 1
    knitr_options$opts_hooks$dev <- function(options) {

      # don't provide an extra 'png' device for context=data chunks
      # used in shiny_prerendered (it breaks data chunk caching)
      if (identical(options$label, "data") || identical(options$context, "data")) {
        return(options)
      }

      if (identical(options$dev, 'png')) {
        figure_id <- paste0('fig', next_figure_id)
        options$dev <- c('png', 'png')
        options$fig.ext <- c('png', 'mb.png')
        options$fig.width <- c(options$fig.width, fig_mobile[[1]])
        options$fig.height <- c(options$fig.height, fig_mobile[[2]])
        options$out.extra <- c(options$out.extra, paste0('data-figure-id=',
                                                         figure_id))
        options$fig.process <- function(filename) {
          if (grepl("^.*\\.mb\\.png$", filename)) {
            mobile_figures[[figure_id]] <<- filename
            next_figure_id <<- next_figure_id + 1
          }
          filename
        }
      }
      options
    }
  }

  # capture the source file
  source_file <- NULL
  pre_knit <- function(input, ...) {
    source_file <<- input
  }

  # preprocessor
  pre_processor <- function (metadata, input_file, runtime, knit_meta,
                             files_dir, output_dir) {

    args <- c()

    # Restore the original options when the server stops
    # running (instead of when render() is done executing)
    if (is_shiny_runtime(runtime)) {
      opts_orig2 <- opts_orig
      shiny::onStop(function() { options(opts_orig2) })
      opts_orig <<- NULL
    }

    # initialize includes if needed
    if (is.null(includes))
      includes <- list()

    # helper function to add a graphic file dependency/variable
    add_graphic <- function(name, graphic) {
      if (!is.null(graphic)) {
        graphic_path <- pandoc_path_arg(graphic)
        args <<- c(args, pandoc_variable_arg(name, graphic_path))
      }
    }

    # include logo and favicon
    add_graphic("logo", logo)
    add_graphic("favicon", favicon)

    # Include flexdashboard.js unless we're in devel mode.
    # In that case, relative filesystem references to
    # them are included in the template, along with live reload
    if (devel) {
      args <- c(args, pandoc_variable_arg("devel", "1"))
    } else {
      # It's important that this CSS is included this way (i.e., not a
      # htmlDependency()) so that the storyboard container has a defined size
      # when sly JS executes (#332).
      dashboardCss <- c(
        '<style type="text/css">',
        readLines(resource("storyboard.css")),
        if (fill_page) readLines(resource("fillpage.css")),
        '</style>'
      )
      dashboardCssFile <- tempfile(fileext = "html")
      writeLines(dashboardCss, dashboardCssFile)
      includes$in_header <- c(includes$in_header, dashboardCssFile)

      dashboardScriptFile <- tempfile(fileext = ".html")
      dashboardScript <- c('<script type="text/javascript">', readLines(resource("flexdashboard.js")), '</script>')
      writeLines(dashboardScript, dashboardScriptFile)
      includes$before_body <- c(includes$before_body, dashboardScriptFile)
    }

    # if there is no fig_mobile height and width then pass the default
    if (is.null(fig_mobile))
      fig_mobile <- default_fig_mobile

    # dashboard init script
    dashboardInitScript <- c(
       '<script type="text/javascript">',
       '$(document).ready(function () {',
       '  FlexDashboard.init({',
       paste0('    fillPage: ', ifelse(fill_page,'true','false'), ','),
       paste0('    orientation: "', orientation, '",'),
       paste0('    storyboard: ', ifelse(storyboard,'true','false'), ','),
       paste0('    defaultFigWidth: ', figSizePixels(fig_width), ','),
       paste0('    defaultFigHeight: ', figSizePixels(fig_height), ','),
       paste0('    defaultFigWidthMobile: ', figSizePixels(fig_mobile[[1]]), ','),
       paste0('    defaultFigHeightMobile: ', figSizePixels(fig_mobile[[2]]), ','),
       paste0('    resize_reload: ', ifelse(resize_reload,'true','false')),
       '  });',
       '  var navbar = $(".navbar").first();',
       '  var body = $("body").first();',
       '  var sidebar = $(".section.sidebar").first();',
       '  function addNavbarPadding() {',
       '    var navHeight = navbar.outerHeight();',
       '    body.css("padding-top", (navHeight + 8) + "px");',
       '    sidebar.css("top", navHeight + "px");',
       # Trigger browser resize in a way that's supported on IE11
       # https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events#the_old-fashioned_way
       # This is primarily here to make sure htmlwidgets (or anything else with
       # resize callback) can size itself appropriately after padding is added
       '    var resizeEvent = window.document.createEvent("UIEvents");',
       '    resizeEvent.initUIEvent("resize", true, false, window, 0);',
       '    window.dispatchEvent(resizeEvent);',
       '  }',
       '  if (!window.Shiny) setTimeout(addNavbarPadding, 100);',
       '  $(document).on("shiny:idle", function() {',
       '    setTimeout(addNavbarPadding, 50);',
       '  });',
       '});',
       '</script>'
    )
    dashboardInitScriptFile <- tempfile(fileext = ".html")
    writeLines(dashboardInitScript, dashboardInitScriptFile)
    includes$after_body <- c(includes$after_body, dashboardInitScriptFile)

    # mobile figures
    args <- c(args, mobile_figure_args(mobile_figures))

    # source code embed if requested
    if (source_code_embed(source_code)) {

      # validate we have a file
      if (!file.exists(source_file))
        stop("source code file for embed not found: ", source_file, call. = FALSE)

      # embed it
      args <- c(args, source_code_embed_args(source_file))
    }

    # highlight
    args <- c(args, pandoc_highlight_args(highlight, default = "pygments"))

    # user includes
    args <- c(args, pandoc_include_args(in_header = includes$in_header,
                                        before_body = includes$before_body,
                                        after_body = includes$after_body))

    # html_document_base gained a css argument in v2.7.7
    # (which also handles scss/sass files), so only do the
    # CSS -> Pandoc conversion if these are css files
    if (!is_installed("rmarkdown", "2.7.7")) {
      for (css_file in css) {
        if (grepl("\\.s[ac]ss$", css_file)) {
          stop("Compilation of Sass -> CSS requires rmarkdown version 2.7.7 or higher")
        }
        args <- c(args, "--css", pandoc_path_arg(css_file))
      }
    }

    args
  }

  # depend on sly for storyboard mode
  if (storyboard)
    extra_dependencies <- append(extra_dependencies, storyboard_dependencies())

  # depend on stickytable headers
  extra_dependencies <- append(extra_dependencies,
                               list(html_dependency_jquery(),
                                    html_dependency_stickytableheaders()))

  # depend on font libraries for navbar
  extra_dependencies <- append(extra_dependencies,
                               navbar_dependencies(navbar))

  if (is.character(theme)) {
    extra_dependencies <- append(extra_dependencies, list(valueBoxStaticAccentCSS(theme)))
  }

  # depend on featherlight and prism for embedded source code
  if (source_code_embed(source_code)) {
    extra_dependencies <- append(extra_dependencies,
                                 list(html_dependency_jquery(),
                                      html_dependency_featherlight(),
                                      html_dependency_prism()))
  }

  if (is_bs_theme(theme)) {
    if (!is_installed("rmarkdown", "2.7.1")) {
      stop("Using a {bslib} theme requires rmarkdown v2.7.1 or higher")
    }

    # Attach the dynamic CSS dependency to the theme so that the dependency
    # is restyled if and when `session$setCurrentTheme()` gets called
    flexdb_css <- bslib::bs_dependency_defer(html_dependencies_flexdb)
    theme <- bslib::bs_bundle(theme, sass::sass_layer(html_deps = flexdb_css))

    # If $navbar-bg wasn't specified by user, default it to $primary
    # (instead of $dark, since the template has .navbar-inverse)
    navbar_bg <- grepl("$navbar-bg:", sass::as_sass(theme), fixed = TRUE)
    if (!navbar_bg) {
      theme <- bslib::bs_add_variables(
        theme, primary = unname(getSassAccentColors(theme, "primary")),
        "navbar-bg" = "$primary"
      )
    }
  } else {
    extra_dependencies <- append(extra_dependencies, html_dependencies_flexdb(theme))
  }

  # return format
  output_format(
    knitr = knitr_options,
    pandoc = pandoc_options(to = "html4",
                            from = rmarkdown_format(md_extensions),
                            args = args,
                            ext = ".html"),
    keep_md = FALSE,
    clean_supporting = self_contained,
    pre_knit = pre_knit,
    pre_processor = pre_processor,
    on_exit = on_exit,
    base_format = html_document_base(theme = theme,
                                     self_contained = self_contained,
                                     lib_dir = lib_dir, mathjax = mathjax,
                                     template = "default",
                                     pandoc_args = pandoc_args,
                                     bootstrap_compatible = TRUE,
                                     extra_dependencies = extra_dependencies,
                                     css = css,
                                     ...)
  )
}

figSizePixels <- function(size) as.integer(size * 96)

mobile_figure_args <- function(mobile_figures) {
  if (length(mobile_figures) > 0) {
    figures <- c()
    ids <- names(mobile_figures)
    for (id in ids) {
      figures <- c(figures, paste0(
        '<img class="mobile-figure" data-mobile-figure-id=', id,
        ' src="', mobile_figures[[id]] ,'" />'))
    }
    figuresFile <- tempfile(fileext = ".html")
    writeLines(figures, figuresFile)
    pandoc_include_args(before_body = figuresFile)
  } else {
    NULL
  }
}

source_code_embed <- function(source_code) {
  identical(source_code, "embed")
}

source_code_embed_args <- function(source_file) {

  # read the code
  code <- readLines(source_file)

  # embed it
  if (length(code) > 0) {

    # escape in case there is html in code
    code <- htmlEscape(code)

    # ensure we don't start with an emtpy line
    code[[1]] <- paste0(
      '<pre class="line-numbers"><code class="language-r">',
      code[[1]]
    )

    codeDiv <- c(
      '<div id="flexdashboard-source-code">',
      code,
      '</code></pre>',
      '</div>'
    )

    codeFile <- tempfile(fileext = ".html")
    writeLines(codeDiv, codeFile)
    pandoc_include_args(after_body = codeFile)
  } else {
    NULL
  }
}


pandoc_navbar_args <- function(navbar) {

  # validate
  if (!is.list(navbar))
    stop("navbar must be a list of navbar elements", call. = FALSE)
  for (item in navbar) {
     if (!is.list(item) ||
         (is.null(item[["title"]]) && is.null(item[["icon"]]))) {
       stop("navbar must be a list of navbar elements", call. = FALSE)
     }
  }

  # convert to json
  navbarJson <- toJSON(navbar, auto_unbox = TRUE)

  # write to a temporary file
  navbarHtml <- paste('<script id="flexdashboard-navbar" type="application/json">',
                      navbarJson,
                      '</script>',
                      sep = '\n')

  # return as an in_header include
  pandoc_include_args(in_header = as_tmpfile(navbarHtml))
}

navbar_links <- function(social, source_code) {

  links <- list()

  # social links
  for (service in social) {
    if (identical(service, "menu")) {
      menu <- list(icon = "fa-share-alt")
      menu$items <- list(
        list(title = "Twitter", icon = "fa-twitter"),
        list(title = "Facebook", icon = "fa-facebook"),
        list(title = "LinkedIn", icon = "fa-linkedin"),
        list(title = "Pinterest", icon = "fa-pinterest")
      )
      links <- append(links, list(menu))
    } else {
      links <- append(links, list(list(icon = paste0("fa-", service))))
    }
  }

  # source_code
  if (!is.null(source_code)) {

    # determine icon
    if (grepl("^http[s]?://git.io", source_code) ||
        grepl("^http[s]?://github.com", source_code)) {
      icon <- "fa-github"
    } else {
      icon <- "fa-code"
    }

    # build nav item
    url <- source_code
    if (identical(url, "embed"))
      url <- "source_embed"
    link <- list(title = "Source Code",
                 icon = icon,
                 href = url,
                 align = "right")
    links <- append(links, list(link))
  }

  links
}

navbar_dependencies <- function(navbar) {

  font_awesome <- FALSE
  ionicons <- FALSE

  for (item in navbar) {
    if (!is.null(item$icon)) {
      if (grepl('fa-', item$icon))
        font_awesome <- TRUE
      if (grepl('^ion-', item$icon))
        ionicons <- TRUE
    }
  }

  html_dependencies_fonts(font_awesome, ionicons)
}

icon_dependencies <- function(source) {

  # discover icon libs used in the source
  res <- regexec('data-icon="?(fa|ion)-', source)
  matches <- regmatches(source, res)
  libs <- c()
  for (match in matches) {
    if (length(match) > 0)
      libs <- c(libs, match[[2]])
  }
  libs <- unique(libs)

  # return their dependencies
  html_dependencies_fonts("fa" %in% libs, "ion" %in% libs)
}

storyboard_dependencies <- function(source = NULL) {
  if (!is.null(source))
    deps <- any(grepl('\\.storyboard', source))
  else
    deps <- TRUE

  if (deps)
    list(html_dependency_jquery(),
         html_dependency_font_awesome(),
         html_dependency_sly())
  else
    NULL
}


html_dependencies_flexdb <- function(theme) {
  name <- "flexdashboard-css"
  version <- get_package_version("flexdashboard")

  if (is.character(theme)) {
    if (identical(theme, "default")) {
      theme <- "bootstrap"
    }
    dep <- htmlDependency(
      name = name, version = version,
      src = "www/flex_dashboard",
      package = "flexdashboard",
      stylesheet = c(
        "flexdashboard.min.css",
        paste0("theme-", theme, ".css")
      )
    )
    return(list(dep))
  }

  if (bslib::is_bs_theme(theme)) {
    dep <- bslib::bs_dependency(
      sass::sass_file(resource("flexdashboard.scss")),
      theme = theme, name = name, version = version,
      cache_key_extra = version
    )
    return(list(dep))
  }

  if (!is.null(theme)) {
    warning("Didn't recognize a theme object with class: ", class(theme))
  }

  NULL
}

# function for resolving resources
resource <- function(name) {
  system_file("www/flex_dashboard", name, package = "flexdashboard")
}

# copied from rmarkdown:::is_shiny
is_shiny_runtime <- function(runtime) {
  !is.null(runtime) && grepl("^shiny", runtime)
}
