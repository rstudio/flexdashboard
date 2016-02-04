
$(document).ready(function () {

  // find all the level2 sections (those are the rows)
  var rows = $('div.section.level2');
  rows.each(function () {

    // remove the h2
    $(this).children('h2').remove();

    // convert into a bootstrap row
    $(this).addClass('row');

    // find all of the level 3 subheads
    var columns = $(this).children('div.section.level3');

    // get length and use that to compute the column size
    var numColumns = columns.length;

    // col class
    var colWidth = 12 / numColumns;
    var colClass = "col-sm-" + colWidth;

    columns.each(function() {

      // set the colClass
      $(this).addClass(colClass);

      // get a reference to the h3 and discover it's inner html
      var h3 = $(this).children('h3').first();
      var chartTitleHTML = h3.html();

      // remove the h3
      h3.remove();

      // put all the content in a chart wrapper div
      $(this).wrapInner('<div class="chart-wrapper">' +
                        '<div class="chart-stage"></div>' +
                        '</div>');

      // get a references to the chart wrapper and chart stage
      var chartWrapper = $(this).children('.chart-wrapper');
      var chartStage = chartWrapper.children('.chart-stage');

      // add the title
      var chartTitle = $('<div class="chart-title"></div>');
      chartTitle.html(chartTitleHTML);
      chartWrapper.prepend(chartTitle);

      // if there is more than one top level elements in
      // in chart stage then take the last element and
      // convert it into the chart notes (otherwise just
      // create an empty chart notes)
      var chartNotes = $('<div class="chart-notes"></div>');
      chartNotes.html('&nbsp;');
      if (chartStage.children().length > 1) {
        var lastChild = chartStage.children().last();
        if (lastChild.html().length > 0)
          chartNotes.html(lastChild.html());
        lastChild.remove();
      }
      chartWrapper.append(chartNotes);
    });
  });
});

