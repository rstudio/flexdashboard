
// flex dashboard jsfiddle: https://jsfiddle.net/13ofvvyg/


var GridDashboard = (function () {

  var GridDashboard = function() {

    // default options
    _options = {
      orientation: 'rows'
    };
  };

  function init(options) {

    // extend default options
    $.extend(true, _options, options);

    // find the main dashboard container
    var dashboardContainer = $('#dashboard-container');

    // look for pages to layout
    var pages = $('div.section.level1');
    if (pages.length > 0) {

        // find the navbar and collapse on clicked
        var navbar = $('#navbar');
        navbar.on("click", "a", null, function () {
           navbar.collapse('hide');
        });

        // envelop the dashboard container in a tab content div
        dashboardContainer.wrapInner('<div class="tab-content"></div>');

        pages.each(function(index) {

          // add it to the navbar
          addToNavbar($(this), index === 0);

          // lay it out
          layoutDashboardPage($(this));
        });

    } else {

      // remove the navbar and navbar button
      $('#navbar').remove();
      $('#navbar-button').remove();

      // layout the entire page
      layoutDashboardPage(dashboardContainer);
    }

    // handle location hash
    handleLocationHash();
  }

  function addToNavbar(page, active) {

    // capture the id
    var id = page.attr('id');

    // add the tab-pane class
    page.addClass('tab-pane');
    if (active)
      page.addClass('active');

    // get a reference to the h1, discover it's id and title, then remove it
    var h1 = page.children('h1').first();
    var pageTitleHTML = h1.html();
    h1.remove();

    // add an item to the navbar for this tab
    var li = $('<li></li>');
    if (active)
      li.addClass('active');
    var a = $('<a></a>');
    a.attr('href', '#' + id);
    a.attr('data-toggle', 'tab');
    a.html(pageTitleHTML);
    li.append(a);
    $('ul.navbar-nav').append(li);
  }

  // layout a dashboard page
  function layoutDashboardPage(page) {

    // determine orientation
    var orientation = page.attr('data-orientation');
    if (orientation !== 'rows' && orientation != 'columns')
      orientation = _options.orientation;

    if (orientation === 'rows')
      layoutPageByRows(page);
    else if (orientation === 'columns')
      layoutPageByColumns(page);
  }

  function layoutPageByRows(page) {

    // row orientation
    page.addClass('dashboard-row-orientation');

    // find all the level2 sections (those are the rows)
    var rows = page.find('div.section.level2');
    rows.each(function () {

      // flag indicating whether we have any captions
      var haveCaptions = false;

      // remove the h2
      $(this).children('h2').remove();

      // make it a flexbox row
      $(this).addClass('dashboard-row');

      // find all of the level 3 subheads
      var columns = $(this).children('div.section.level3');

      // compute column classes
      var colClasses = computeColumnClasses(columns);

      // fixup the columns
      columns.each(function(index) {

        // set the colClass
        if (colClasses[index] !== null)
          $(this).addClass(colClasses[index]);

        // layout the chart
        var result = layoutChart($(this));

        // update state
        if (result.caption)
          haveCaptions = true;
      });

      // if we don't have any captions in this row then remove
      // the chart notes divs
      if (!haveCaptions)
        $(this).find('.chart-notes').remove();
    });
  }

  function layoutPageByColumns(page) {

    // column orientation
    page.addClass('dashboard-column-orientation');

    // find all the level2 sections (those are the columns)
    var columns = page.find('div.section.level2');

    // compute column classes
    var colClasses = computeColumnClasses(columns);

    // layout each column
    columns.each(function (index) {

      // remove the h2
      $(this).children('h2').remove();

      // make it a flexbox column
      $(this).addClass('dashboard-column');

      // set the colClass
      if (colClasses[index] !== null)
        $(this).addClass(colClasses[index]);

      // find all the h3 elements, these are the chart cells
      var rows = $(this).children('div.section.level3');
      rows.each(function() {

        // layout the chart
        var result = layoutChart($(this));




      });
    });
  }


   // compute the width oriented classes for a set of columns
  function computeColumnClasses(columns) {

    // classes to return
    var columnClasses = [];
    for (var i = 0; i<columns.length; i++)
      columnClasses.push(null);

    // for now return nothing until we sort out how to do this with flexbox
    return columnClasses;

    /*
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
    */
  }

  // layout a chart
  function layoutChart(chart) {

    // state to return
    var result = {
      caption: false
    };

    // get a reference to the h3, discover it's inner html, and remove it
    var h3 = chart.children('h3').first();
    var title = h3.html();
    h3.remove();

    // put all the content in a chart wrapper div
    chart.addClass('chart-wrapper');
    chart.wrapInner('<div class="chart-stage">' +
                    '<div class="chart-shim"></div>' +
                    '</div>');

    // get a reference to the chart shim
    var chartShim = chart.find('.chart-shim');

    // add the title
    var chartTitle = $('<div class="chart-title"></div>');
    chartTitle.html(title);
    chart.prepend(chartTitle);

    // extract notes
    if (extractChartNotes(chartShim, chart))
      result.caption = true;

    // return result
    return result;
  }



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

  GridDashboard.prototype = {
    constructor: GridDashboard,
    init: init
  };

  return GridDashboard;

})();

window.GridDashboard = new GridDashboard();


