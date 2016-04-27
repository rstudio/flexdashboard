HTMLWidgets.widget({

  name: 'gauge',

  type: 'output',

  factory: function(el, width, height) {

    var justgage = null;

    return {

      renderValue: function(x) {

        // convert sector colors
        for (var i=0; i<x.customSectors.length; i++) {
          var sector = x.customSectors[i];
          if (sector.color === "success")
            sector.color = "rgba(63, 182, 24, 0.7)";
          else if (sector.color === "warning")
            sector.color = "rgba(255, 117, 24, 0.7)";
          else if (sector.color === "danger")
            sector.color = "rgba(255, 0, 57, 0.7)";
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
