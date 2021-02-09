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
        var sectors = x.customSectors.ranges;
        for (var i=0; i<sectors.length; i++) {
          var sector = sectors[i];
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
          value: x.value,
          min: x.min,
          max: x.max,
          relativeGaugeSize: true,
          formatNumber: true,
          humanFriendly: x.humanFriendly,
          humanFriendlyDecimal: x.humanFriendlyDecimal,
          customSectors: x.customSectors
        };

        // Add these props to the config if specified
        var optional_props = [
          "symbol", "label", "gaugeColor", "valueFontColor",
          "valueFontFamily", "labelFontColor", "labelFontFamily"
        ]
        for (var i = 0; i < optional_props.length; i++) {
          var prop = optional_props[i];
          if (x[prop]) config[prop] = x[prop];
        }

        // add linked value class if appropriate
        if (x.href !== null && window.FlexDashboard) {
          $(el).addClass('linked-value');
          $(el).on('click', function(e) {
            window.FlexDashboardUtils.showLinkedValue(x.href);
          });
        }

debugger;
        // create the justgage if we need to
        if (justgage === null) {
          justgage = new JustGage(config);
        } else {
          justgage.refresh(x.value, x.max, x.min, x.label);
          gauge.update({
            valueFontColor: x.valueFontColor,
            labelFontColor: x.labelFontColor
          });
        }

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
