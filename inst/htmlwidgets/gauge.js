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
          customSectors: x.customSectors
        };

        // add label if specifed
        if (x.label !== null)
          config.label = x.label;

        // create the justgage if we need to
        if (justgage === null)
          justgage = new JustGage(config);
        else
          justgage.refresh(x.value, x.max, config);

        // manage size
        this.manageSize(width);

      },

      resize: function(width, height) {
        this.manageSize(width);
      },

      manageSize: function(width) {
        if (width <= 350)
          $(el).addClass('narrow');
        else
          $(el).removeClass('narrow');
      }

    };
  }
});
