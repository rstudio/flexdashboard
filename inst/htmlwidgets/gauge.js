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
          titlePosition: window.FlexDashboard ? "below" : "above",
          relativeGaugeSize: true,
          formatNumber: true,
          humanFriendly: true,
          humanFriendlyDecimal: 2,
          customSectors: x.customSectors
        };

        // if a title is specified then handle as appropriate
        if (x.title !== null) {
          // flexdahsboard hoists the title up to the chart stage
          if (window.FlexDashboard) {
            $(el).closest('.chart-wrapper').children('.chart-title').text(x.title);
            $(el).addClass('notitle');
          // otherwise apply it directly to the gauge
          } else {
            config.title = x.title;
          }
        // otherwise layout with no title
        } else {
          $(el).addClass('notitle');
        }

        // add symbol if specified
        if (x.symbol !== null)
          config.symbol = x.symbol;

        // add label if specifed
        if (x.label !== null)
          config.label = x.label;

        // create the justgage if we need to
        if (justgage === null)
          justgage = new JustGage(config);
        else
          justgage.refresh(x.value, x.max, config);
      },

      resize: function(width, height) {
      }
    };
  }
});
