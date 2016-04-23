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
            value: x.value,
            min: x.min,
            max: x.max,
            relativeGaugeSize: true
        };

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
