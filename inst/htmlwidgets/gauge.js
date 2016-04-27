HTMLWidgets.widget({

  name: 'gauge',

  type: 'output',

  factory: function(el, width, height) {

    var justgage = null;

    return {

      renderValue: function(x) {

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
          /*
          customSectors: [
            { lo: 1, hi: 50, color: "green" },
            { lo: 51, hi: 100, color: "blue" }

          ]
          */
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
