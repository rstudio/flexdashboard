flexdashboard 0.5.2.9000
===========

This release adds integration with the new [`{bslib}` package](https://rstudio.github.io/bslib/index.html), making the customization of main colors and fonts much easier via `flex_dashboard`'s `theme` parameter. For example, here's a custom dark mode with custom Google Fonts:

````yaml
---
output:
  flexdashboard::flex_dashboard:
    theme:
      bg: "#101010"
      fg: "#FDF7F7"
      primary: "#ED79F9"
      base_font: !expr bslib::font_google("Prompt")
      code_font: !expr bslib::font_google("JetBrains Mono")
---
````

Furthermore, all of `{flexdashboard}` now also works sensible with `{bslib}`'s real-time theming widget (`bs_themer()`). To use it, add a `runtime: shiny` to the top of the yaml matter and call `bslib::bs_themer()` in a server context. Also, if your dashboard contains static plots, you can add `thematic::thematic_shiny(font = "auto")` to theme plots in real-time too (just make sure the plots are generated through `renderPlot()`).

````yaml
---
output:
  flexdashboard::flex_dashboard:
    theme:
      version: 4
---

```{r, include = FALSE}
bslib::bs_themer()
thematic::thematic_shiny(font = "auto")
```

## Row

### My plot

```{r}
renderPlot(plot(1:10))
```
````

By default, using this `{bslib}` integration will also upgrade your dashboard from Bootstrap 3 to 4. If you run into any issues with custom widgets rendering not quite right, note that you can add `version: 3` to the `theme` in order to use Bootstrap 3 instead of 4. To learn more about `{bslib}`[See here](https://github.com/rstudio/bslib#basic-theming-options) to learn more about the theming options that `{bslib}` provides.

### Possibly breaking changes

* The `smart` argument was removed from `flexdashboard::flex_dashboard` since it was removed in rmarkdown 2.2 (relatedly, we now require rmarkdown 2.2 or higher). (#301)
* The `window.FlexDashboard.themeColor` JavaScript object property is no longer available. Resolving of theming accent colors should now be done server-side via `{bslib}`'s [dynamic theming tools](https://rstudio.github.io/bslib/articles/theming.html#custom-components-1). (#305) 

### Improvements & fixes

* Closed #310: An `.active` class may now be added to a particular `.tabset` tab to control which tab is shown by default. (#311)

* Closed #306: A `.tabset-pills` class may now be added to `.tabset` to render pills instead of tabs. (#307)

* Closed #297, #254: `gauge()` now uses justgage.js 1.4.0, allowing  `renderGauge()` to properly update various labels and `sectors` on redraw. (#301)

* Closed #300: When a custom `{bslib}` theme is provided to `flex_dashboard`, `gauge()` and `viewBox()` now generate default styles to match it. (#301, #305)

* Closed #227: Fixed a bug with `source_code: embed` producing errors because code wasn't being escaped before being included in HTML. (#228, thanks @cderv) 

* Added padding to the top of the sidebar. (#294)

flexdashboard 0.5.2
===========

* Support use of Font Awesome icon sets (e.g. "fab fa-r-project")

* Fixed [#245](https://github.com/rstudio/flexdashboard/issues/245): Shiny (1.4.0+) outputs not rendering in modified flexdashboard html. ([#250](https://github.com/rstudio/flexdashboard/pull/250))

flexdashboard 0.5.1.1
===========

Changed maintainer.

flexdashboard 0.5.1
===========

* Fixed [#149](https://github.com/rstudio/flexdashboard/issues/149): a compatability issue when using Pandoc 2.0. ([#150](https://github.com/rstudio/flexdashboard/pull/150))

* Fixed [#139](https://github.com/rstudio/flexdashboard/issues/139): remove previous valueBox handlers when rebinding.

* Update to roxygen2 6.0.

flexdashboard 0.5.0
===========

(tagged @ commit [#d99dd62](https://github.com/rstudio/flexdashboard/commit/d99dd62d49375d414336386e11da8d1807c01fae))

* Don't hook graphics device option for `fig_mobile` if it's a data chunk (this broke knitr caching for `shiny_prerendered` data chunks).


flexdashboard 0.4.0
===========
(tagged @ commit [#0a88a91](https://github.com/rstudio/flexdashboard/commit/0a88a91654a1a18b30b23b60097f6fb16ad2c317))

* Add support for `target` field in navbar links (e.g. target: "_blank").

* Fixed [#100](https://github.com/rstudio/flexdashboard/issues/100): problem w/ embedding source code for Rmd w/ spaces in path.

* Fixed [#106](https://github.com/rstudio/flexdashboard/issues/106): ensure that previous bg class on valueBox is cleared.


flexdashboard 0.3.0
===========
(tagged @ commit [#2b6eb71](https://github.com/rstudio/flexdashboard/commit/2b6eb71b1f75078ea36b33d5aa3c9f8d4ace639b))

* Support `.hidden` attribute for pages to hide them from the navbar.

* Scroll sidebar when content overflows vertically.

* Correct handling for storyboard notes in mobile layout.

* Handle titles with extended characters (auto-assign id if pandoc doesn't).

* Handle page titles with punctuation (sanitize id for bootstrap tabs).

* Use `pre_knit` hook to get access to the source file path.

* Restore original DT options after rendering.


flexdashboard 0.2.0
===========
(tagged @ commit [#64d975f](https://github.com/rstudio/flexdashboard/commit/64d975f962dd3eca8ab2067f55a35ec05d72d4ac))

* Initial release to CRAN.


flexdashboard 0.1.0
===========
(tagged @ commit [#990d10c](https://github.com/rstudio/flexdashboard/commit/990d10c2b3c4a8fa2029a7723f7e1a4ce86d3717))

* init commit!
