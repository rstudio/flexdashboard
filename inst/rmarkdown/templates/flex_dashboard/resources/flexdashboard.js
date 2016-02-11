
var FlexDashboard = (function () {

  var FlexDashboard = function() {

    // default options
    _options = {
      fillPage: true,
      orientation: 'columns',
      defaultFigWidth: 480,
      defaultFigHeight: 336
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

    // if we are in shiny we need to trigger a window resize event to
    // force correct layout of shiny-bound-output elements
    if (isShinyDoc())
      $(window).trigger('resize');

    // make main components visible
    $('.section.sidebar').css('visibility', 'visible');
    dashboardContainer.css('visibility', 'visible');

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

    // determine orientation and fillPage behavior for distinct media
    var orientation, fillPage;

    // media: mobile phone
    if (isMobilePhone()) {

      // if there is a sidebar we need to ensure it's content
      // is properly framed as an h3
      var sidebar = page.find('.section.sidebar');
      sidebar.removeClass('sidebar');
      sidebar.wrapInner('<div class="section level3"></div>');
      var h2 = sidebar.find('h2');
      var h3 = $('<h3></h3>');
      h3.html(h2.html());
      h3.insertBefore(h2);
      h2.remove();

      // wipeout h2 elements then enclose them in a single h2
      var level2 = page.find('div.section.level2');
      level2.each(function() {
        level2.children('h2').remove();
        level2.children().unwrap();
      });
      page.wrapInner('<div class="section level2"></div>');

      // force a non full screen layout by columns
      orientation = 'columns';
      fillPage = false;

    // media: desktop
    } else {

      // determine orientation
      orientation = page.attr('data-orientation');
      if (orientation !== 'rows' && orientation != 'columns')
        orientation = _options.orientation;

      // fillPage based on options
      fillPage = _options.fillPage;

      // handle sidebar
      var sidebar = page.find('.section.sidebar');
      if (sidebar.length > 0) {

        // get it out of the header hierarchy
        sidebar = sidebar.first();
        sidebar.removeClass('level2');
        sidebar.children('h2').remove();

        // determine width
        var sidebarWidth = 250;
        var dataWidth = parseInt(sidebar.attr('data-width'));
        if (dataWidth)
          sidebarWidth = dataWidth;

        // set the width and shift the page right to accomodate the sidebar
        sidebar.css('width', sidebarWidth + 'px');
        page.css('padding-left', sidebarWidth + 'px');
      }
    }

    // give it and it's parent divs height: 100% if we are in fillPage mode
    if (fillPage) {
      page.css('height', '100%');
      page.parents('div').css('height', '100%');
    }

    // perform the layout
    if (orientation === 'rows')
      layoutPageByRows(page, fillPage);
    else if (orientation === 'columns')
      layoutPageByColumns(page, fillPage);
  }

  function layoutPageByRows(page, fillPage) {

    // row orientation
    page.addClass('dashboard-row-orientation');

    // find all the level2 sections (those are the rows)
    var rows = page.find('div.section.level2');

    // if there are no level2 sections then treat the
    // entire page as if it's a level 2 section
    if (rows.length === 0) {
      page.wrapInner('<div class="section level2"></div>');
      rows = page.find('div.section.level2');
    }

    rows.each(function () {

      // flag indicating whether we have any captions
      var haveCaptions = false;

      // remove the h2
      $(this).children('h2').remove();

      // make it a flexbox row
      $(this).addClass('dashboard-row');

      // find all of the level 3 subheads
      var columns = $(this).children('div.section.level3');

      // determine figureSizes sizes
      var figureSizes = chartFigureSizes(columns);

      // fixup the columns
      columns.each(function(index) {

        // layout the chart
        var result = layoutChart($(this));

        // update state
        if (result.caption)
          haveCaptions = true;

        // set the column flex based on the figure width
        var chartWidth = figureSizes[index].width;
        setFlex($(this), chartWidth + ' ' + chartWidth + ' 0px');
      });

      // if we don't have any captions in this row then remove
      // the chart notes divs
      if (!haveCaptions)
        $(this).find('.chart-notes').remove();

      // now we can set the height on all the wrappers (based on maximum
      // figure height + room for title and notes)
      var maxHeight = maxChartHeight(figureSizes, columns);
      if (fillPage)
        setFlex($(this), maxHeight + ' ' + maxHeight + ' 0px');
      else {
        $(this).css('height', maxHeight + 'px');
        setFlex($(this), '0 0 ' + maxHeight + 'px');
      }
    });
  }

  function layoutPageByColumns(page, fillPage) {

    // column orientation
    page.addClass('dashboard-column-orientation');

    // find all the level2 sections (those are the columns)
    var columns = page.find('div.section.level2');

    // if there are no level2 sections then treat the
    // entire page as if it's a level 2 section
    if (columns.length === 0) {
      page.wrapInner('<div class="section level2"></div>');
      columns = page.find('div.section.level2');
    }

    // layout each column
    columns.each(function (index) {

      // remove the h2
      $(this).children('h2').remove();

      // make it a flexbox column
      $(this).addClass('dashboard-column');

      // find all the h3 elements
      var rows = $(this).children('div.section.level3');

      // get the figure sizes for the rows
      var figureSizes = chartFigureSizes(rows);

      // column flex is the max row width
      var maxWidth = maxChartWidth(figureSizes);
      setFlex($(this), maxWidth + ' ' + maxWidth + ' 0px');

      // layout each chart
      rows.each(function(index) {

        // perform the layout
        var result = layoutChart($(this));

        // ice the notes if there are none
        if (!result.caption)
          $(this).find('.chart-notes').remove();

        // set height based on figHeight, then adjust
        var chartHeight = figureSizes[index].height;
        chartHeight = adjustedHeight(chartHeight, $(this));
        if (fillPage)
          setFlex($(this), chartHeight + ' ' + chartHeight + ' 0px');
        else {
          $(this).css('height', chartHeight + 'px');
          setFlex($(this), chartHeight + ' ' + chartHeight + ' ' + chartHeight + 'px');
        }
      });
    });
  }

  function chartFigureSizes(charts) {

    // sizes
    var figureSizes = new Array(charts.length);

    // check each chart
    charts.each(function(index) {

      // start with default
      figureSizes[index] = {
        width: _options.defaultFigWidth,
        height: _options.defaultFigHeight
      };

      // look for data-height or data-width then knit options
      var dataWidth = parseInt($(this).attr('data-width'));
      var dataHeight = parseInt($(this).attr('data-height'));
      var knitrOptions = $(this).find('.knitr-options:first');
      var knitrWidth, knitrHeight;
      if (knitrOptions) {
        knitrWidth = parseInt(knitrOptions.attr('data-fig-width'));
        knitrHeight =  parseInt(knitrOptions.attr('data-fig-height'));
      }

      // width
      if (dataWidth)
        figureSizes[index].width = dataWidth;
      else if (knitrWidth)
        figureSizes[index].width = knitrWidth;

      // height
      if (dataHeight)
        figureSizes[index].height = dataHeight;
      else if (knitrHeight)
        figureSizes[index].height = knitrHeight;
    });

    // return sizes
    return figureSizes;
  }

  function maxChartHeight(figureSizes, charts) {

    // first compute the maximum height
    var maxHeight = _options.defaultFigHeight;
    for (var i = 0; i<figureSizes.length; i++)
      if (figureSizes[i].height > maxHeight)
        maxHeight = figureSizes[i].height;

    // now add offests for chart title and chart notes
    if (charts.length)
      maxHeight = adjustedHeight(maxHeight, charts.first());

    return maxHeight;
  }

  function adjustedHeight(height, chart) {
    var chartTitle = chart.find('.chart-title');
    if (chartTitle.length)
      height += chartTitle.first().outerHeight();
    var chartNotes = chart.find('.chart-notes');
    if (chartNotes.length)
      height += chartNotes.first().outerHeight();
    return height;
  }

  function maxChartWidth(figureSizes) {
    var maxWidth = _options.defaultFigWidth;
    for (var i = 0; i<figureSizes.length; i++)
      if (figureSizes[i].width > maxWidth)
        maxWidth = figureSizes[i].width;
    return maxWidth;
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

    // auto-resizing treatment for image
    autoResizeChartImage(chart);

    // put all the content in a chart wrapper div
    chart.addClass('chart-wrapper');
    chart.wrapInner('<div class="chart-stage"></div>');
    var chartContent = chart.children('.chart-stage');

    // additional shim to break out of flexbox sizing
    chartContent.wrapInner('<div class="chart-shim"></div>');
    chartContent = chartContent.children('.chart-shim');

    // add the title
    var chartTitle = $('<div class="chart-title"></div>');
    chartTitle.html(title);
    chart.prepend(chartTitle);

    // extract notes
    if (extractChartNotes(chartContent, chart))
      result.caption = true;

    // tag it as content only if it doesn't have a chart
    if (!hasChart(chartContent))
      chartContent.addClass('content-only');

    // return result
    return result;
  }

  function autoResizeChartImage(chart) {

    // look for a top level <p> tag with a single child that is an image
    var img = chart.children('p').children('img:only-child');

    // did we find one?
    if (img.length == 1) {

      // apply the image container style to the parent <p>
      var p = img.parent();
      p.addClass('image-container');

      // grab the url and make it the background image of the <p>
      var src = img.attr('src');
      var url = 'url("' + src + '")';
      p.css('background', url)
       .css('background-size', 'contain')
       .css('background-repeat', 'no-repeat')
       .css('background-position', 'center');
      }
  }

  // extract chart notes from a chart-stage section
  function extractChartNotes(chartContent, chartWrapper) {

    // track whether we successfully extracted notes
    var extracted = false;

    // if there is more than one top level visualization element
    // (an image or an htmlwidget in chart stage) then take the
    // last element and convert it into the chart notes, otherwise
    // just create an empty chart notes

    var chartNotes = $('<div class="chart-notes"></div>');
    chartNotes.html('&nbsp;');

    // look for a chart image or htmlwidget
    if (hasChart(chartContent)) {
      var lastChild = chartContent.children().last();
      if (lastChild.is("p") &&
          (lastChild.html().length > 0) &&
          (lastChild.children('img:only-child').length === 0)) {
        extracted = true;
        chartNotes.html(lastChild.html());
        lastChild.remove();
      }

    }
    chartWrapper.append(chartNotes);

    // return status
    return extracted;
  }

  function hasChart(chartContent) {
    var img = chartContent.children('p.image-container')
                          .children('img:only-child');
    var widget = chartContent.children('div[id^="htmlwidget-"]');
    return img.length > 0 || widget.length > 0;
  }

  // safely detect rendering on a mobile phone
  function isMobilePhone() {
    try
    {
      return ! window.matchMedia("only screen and (min-width: 768px)").matches;
    }
    catch(e) {
      return false;
    }
  }

  // test whether this is a shiny doc
  function isShinyDoc() {
    return (typeof(window.Shiny) !== "undefined" && !!window.Shiny.outputBindings);
  }

  // set flex using vendor specific prefixes
  function setFlex(el, flex) {
    el.css('-webkit-box-flex', flex)
      .css('-webkit-flex', flex)
      .css('-ms-flex', flex)
      .css('flex', flex);
  }

  // support bookmarking of pages
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

  FlexDashboard.prototype = {
    constructor: FlexDashboard,
    init: init
  };

  return FlexDashboard;

})();

window.FlexDashboard = new FlexDashboard();


