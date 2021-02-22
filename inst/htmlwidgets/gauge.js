HTMLWidgets.widget({

  name: 'gauge',

  type: 'output',

  factory: function(el, width, height) {

    var justgage = null;
    var previousValue = null;

    return {

      renderValue: function(x) {

        // justgage config
        var config = {
          id: el.id,
          value: x.value,
          min: x.min,
          max: x.max,
          valueMinFontSize: 20,
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

        // create the justgage if we need to
        if (justgage === null) {
          justgage = new JustGage(config);
        } else {
          // justgage currently doesn't support an .update() or .refresh()
          // of customSectors, so we first to a full redraw with the previous
          // value with no initial animation, then refresh with the new value
          config.value = previousValue;
          config.startAnimationTime = 0;
          justgage.destroy();
          justgage = new JustGage(config);
          setTimeout(function() {
            justgage.refresh(x.value);
          }, 20);
        }
        previousValue = x.value;

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
