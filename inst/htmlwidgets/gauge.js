HTMLWidgets.widget({

  name: 'gauge',

  type: 'output',

  factory: function(el, width, height) {

    var justgage = null;

    return {

      renderValue: function(x) {

        // resolve theme colors for sectors
        function themeColor(colorName, defaultColor) {
          // just in case someone tries to use this outside of flexdashboard
          if (window.FlexDashboard) {
            var color = window.FlexDashboard.themeColor(colorName);
            if (!color)
              color = defaultColor;
            return color;
          } else {
            return defaultColor;
          }
        }
        for (var i=0; i<x.customSectors.length; i++) {
          var sector = x.customSectors[i];
          if (sector.color === "primary")
            sector.color = themeColor("primary",  "#a9d70b");
          else if (sector.color === "info")
            sector.color = themeColor("info",  "#a9d70b");
          else if (sector.color === "success")
            sector.color = themeColor("success",  "#a9d70b");
          else if (sector.color === "warning")
            sector.color = themeColor("warning",  "#f9c802");
          else if (sector.color === "danger")
            sector.color = themeColor("danger", "#ff0000");
        }

        // justgage config
        var config = {
          id: el.id,
          title: " ",
          valueFontColor: "gray",
          value: x.value,
          min: x.min,
          max: x.max,
          titlePosition: "below",
          relativeGaugeSize: true,
          formatNumber: true,
          humanFriendly: x.humanFriendly,
          humanFriendlyDecimal: x.humanFriendlyDecimal,
          customSectors: x.customSectors
        };

        // add symbol if specified
        if (x.symbol !== null)
          config.symbol = x.symbol;

        // add label if specifed
        if (x.label !== null)
          config.label = x.label;

        // add linked value class if appropriate
        if (x.href !== null && window.FlexDashboard) {
          $(el).addClass('linked-value');
          $(el).on('click', function(e) {
            window.FlexDashboardUtils.showLinkedValue(x.href);
          });
        }

        // create the justgage if we need to
        if (justgage === null)
          justgage = new JustGage(config);
        else
          justgage.refresh(x.value, x.max, config);

        // fixup svg path filters so they don't use relative hrefs
        // e.g. url(#inner-shadow-htmlwidget-068c4cc821772b0a2ef5)
        // (see https://github.com/rstudio/flexdashboard/issues/94)
        var baseUrl = window.location.href.replace(window.location.hash, "");
        $(el).find('svg>path').each(function() {
          var filter = $(this).attr('filter');
          if (filter) {
            var match = /url\(#([^\)]+)\)/.exec(filter);
            if (match)
              $(this).attr('filter', 'url(' + baseUrl + '#' + match[1] + ')');
          }
        });
      },

      resize: function(width, height) {
      }
    };
  }
});
