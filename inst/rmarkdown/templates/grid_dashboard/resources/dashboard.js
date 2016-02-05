
$(document).ready(function () {

  // extract chart notes from a chart-stage section
  function extractChartNotes(chartStage, chartWrapper) {

    // track whether we successfully extracted notes
    var extracted = false;

    // if there is more than one top level visualization element
    // (an image or an htmlwidget in chart stage then take the
    // last element and convert it into the chart notes (otherwise
    // just create an empty chart notes)
    var chartNotes = $('<div class="chart-notes"></div>');
    chartNotes.html('&nbsp;');
    if (chartStage.find('img').length > 0 ||
        chartStage.find('div[id^="htmlwidget-"]').length > 0) {
      var lastChild = chartStage.children().last();
      if (lastChild.is("p") && (lastChild.html().length > 0)) {
        extracted = true;
        chartNotes.html(lastChild.html());
      }
      lastChild.remove();
    }
    chartWrapper.append(chartNotes);

    // return status
    return extracted;
  }

  // compute the width oriented classes for a set of columns
  function computeColumnClasses(columns) {

    // classes to return
    var columnClasses = [];
    for (var i = 0; i<columns.length; i++)
      columnClasses.push(null);

    // are data-col attributes used, if so convert to col classes
    var columnsUsed = 0;
    var unallocatedColumns = [];
    columns.each(function(index) {
      var dataCol = parseInt($(this).attr('data-col'));
      if (!isNaN(dataCol)) {
        columnsUsed += dataCol;
        $(this).addClass('col-sm-' + dataCol);
        $(this).removeAttr('data-col');
      } else {
        unallocatedColumns.push($(this));
      }
    });

    // if we've allocated some columns then auto-allocate the rest
    if (columnsUsed > 0) {
      var colWidth = (12 - columnsUsed) / unallocatedColumns.length;
      unallocatedColumns.map(function(col) {
        col.addClass('col-sm-' + colWidth);
      });
    }

    // do any columns specify a col- explicitly? If so
    // then the user is controlling the widths
    var explicitWidths = columns.filter('[class*=" col-"]').length > 0;
    if (!explicitWidths) {
      // get length and use that to compute the column size
      var numColumns = columns.length;

      // compute the col class
      var colClass = "col-sm-" + (12 / numColumns);

      // apply it to every element
      columnClasses = columnClasses.map(function() { return colClass; });
    }

    // return
    return columnClasses;
  }


  // layout a dashboard page
  function layoutDashboardPage(page) {

    // find all the level2 sections (those are the rows)
    var rows = page.find('div.section.level2');
    rows.each(function () {

      // flag indicating whether we have any captions
      var haveCaptions = false;

      // retain the maximum height for chart content
      var maxChartHeight = 0;

      // remove the h2
      $(this).children('h2').remove();

      // convert into a bootstrap row
      $(this).addClass('row');

      // find all of the level 3 subheads
      var columns = $(this).children('div.section.level3');

      // compute column classes
      var colClasses = computeColumnClasses(columns);

      // fixup the columns
      columns.each(function(index) {

        // set the colClass
        if (colClasses[index] !== null)
          $(this).addClass(colClasses[index]);

        // mark as a grid element for custom css
        $(this).addClass('grid-element');

        // get a reference to the h3, discover it's inner html, and remove it
        var h3 = $(this).children('h3').first();
        var chartTitleHTML = h3.html();
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

        // extract notes
        if (extractChartNotes(chartStage, chartWrapper))
          haveCaptions = true;

        // take a measurement of the chart height and update the
        // max height if necessary
        var chartHeight = chartStage.outerHeight();
        if (chartHeight > maxChartHeight)
          maxChartHeight = chartHeight;
      });

      // if we don't have any captions in this row then remove
      // the chart notes divs
      if (!haveCaptions)
        $(this).find('.chart-notes').remove();

      // pin the height of this row to the max-height of the grid cells
      // (this prevents the height changing when img auto-sizing occurs)
      if (maxChartHeight > 0)
        $(this).find('.chart-stage').css('min-height', maxChartHeight + 'px');
    });
  }

  // layout the dashboard based on level 1, 2, and 3 headings
  function layoutDashboard() {

    // look for pages to layout
    var pages = $('div.section.level1');
    if (pages.length > 0) {

        // find the navbar and collapse on clicked
        var navbar = $('#navbar');
        navbar.on("click", "a", null, function () {
           navbar.collapse('hide');
        });

        // find the navbar list
        var navbarList = $('ul.navbar-nav');

        // find the main container and envelop it in a tab content div
        var dashboardContainer = $('#dashboard-container');
        dashboardContainer.wrapInner('<div class="tab-content"></div>');

        pages.each(function(index) {

          // capture the id
          var id = $(this).attr('id');

          // add the tab-pane class
          $(this).addClass('tab-pane');
          if (index === 0)
            $(this).addClass('active');

          // get a reference to the h1, discover it's id and title, then remove it
          var h1 = $(this).children('h1').first();
          var pageTitleHTML = h1.html();
          h1.remove();

          // add an item to the navbar for this tab
          var li = $('<li></li>');
          if (index === 0)
            li.addClass('active');
          var a = $('<a></a>');
          a.attr('href', '#' + id);
          a.attr('data-toggle', 'tab');
          a.html(pageTitleHTML);
          li.append(a);
          navbarList.append(li);

          // lay it out
          layoutDashboardPage($(this));
        });

    } else {
      // remove the navbar and navbar button
      $('#navbar').remove();
      $('#navbar-button').remove();

      // layout the entire page
      layoutDashboardPage($(document));
    }
  }

  function handleLocationHash() {
    // restore tab/page from bookmark
    var hash = window.location.hash;
    if (hash.length > 0)
      $('ul.nav a[href="' + hash + '"]').tab('show');

    // add a hash to the URL when the user clicks on a tab/page
    $('a[data-toggle="tab"]').on('click', function(e) {
      window.location.hash = $(this).attr('href');
      window.scrollTo(0,0);
    });
  }

  // initialization
  layoutDashboard();
  handleLocationHash();
});


