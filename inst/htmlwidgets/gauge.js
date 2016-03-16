HTMLWidgets.widget({

  name: 'gauge',

  type: 'output',

  // #yourjustgage svg {margin-top: -80px}

  factory: function(el, width, height) {

    var justgage = null;

    el.style.marginTop = "-20px";
    el.style.height = "200px";

    return {



      renderValue: function(x) {

        // justgage config
        var config = {
          id: el.id,
            value: x.value,
            min: x.min,
            max: x.max,
            height: 200
            //relativeGaugeSize: true
        };

        // add label if specifed
        if (x.label !== null)
          config.label = x.label;

        // create the justgage if we need to
        if (justgage === null)
          justgage = new JustGage(config);
        else
          justgage.refresh(x.value, x.max);
      },

      resize: function(width, height) {



      }

    };
  }
});
