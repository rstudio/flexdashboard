flexdashboard 0.5.1.1
===========

* Changed maintainer.

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
