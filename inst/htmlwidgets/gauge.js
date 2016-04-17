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
        if (justgage === null) {
          justgage = new JustGage(config);
          
          // retrigger justgage animation when containing tab pane is shown
          var tab = $(el).closest('div.tab-pane');
          if (tab !== null) {
            var tabID = tab.attr('id');
            var tabAnchor = $('a[data-toggle="tab"][href="#' + tabID + '"]');
            if (tabAnchor !== null) {
              tabAnchor.on('shown.bs.tab', function() {
                justgage.refresh(0, x.max, { refreshAnimationTime: 0, onAnimationEnd: function() {
                  justgage.refresh(x.value, x.max, { refreshAnimationTime: 700, onAnimationEnd: null });
                }});
              });
            }
          }
        }
        else
          justgage.refresh(x.value, x.max);
      },

      resize: function(width, height) {



      }

    };
  }
});
