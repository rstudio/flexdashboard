
var FlexDashboard = (function () {

  var FlexDashboard = function() {

    // default options
    _options = {
      fillPage: false,
      orientation: 'columns',
      defaultFigWidth: 576,
      defaultFigHeight: 480,
      valueBoxAlpha: 0
    };
  };

  function init(options) {

    // extend default options
    $.extend(true, _options, options);

    // patch DT sizing
    patchDTSizing();

    // find navbar items
    var navbarItems = $('#flexdashboard-navbar');
    if (navbarItems.length)
      navbarItems = JSON.parse(navbarItems.html());
    addNavbarItems(navbarItems);

    // find the main dashboard container
    var dashboardContainer = $('#dashboard-container');

    // look for a global sidebar
    var globalSidebar = dashboardContainer.find(".sidebar-global");
    if (globalSidebar.length > 0) {

      // ensure that sidebar-global also implies sidebar
      globalSidebar.addClass('sidebar');

      // global layout for fullscreen displays
      if (!isMobilePhone()) {

         // hoist it up to the top level
         globalSidebar.insertBefore(dashboardContainer);

         // lay it out (set width/positions)
         layoutSidebar(globalSidebar, dashboardContainer);
      }
    }

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

          // lay it out
          layoutDashboardPage($(this));

          // add it to the navbar
          addToNavbar($(this), index === 0);

        });

    } else {

      // remove the navbar and navbar button if we don't
      // have any navbuttons
      if (navbarItems.length === 0) {
        $('#navbar').remove();
        $('#navbar-button').remove();
      }

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

    // intialize prism highlighting
    initPrismHighlighting();
  }

  function addNavbarItems(navbarItems) {

    var navbarLeft = $('ul.navbar-left');
    var navbarRight = $('ul.navbar-right');

    for (var i = 0; i<navbarItems.length; i++) {
      var item = navbarItems[i];
      var li = $('<li></li>');

      if (item.items) {
        li.addClass('dropdown');
        var title = item.title;
        if (title)
          title = title + ' <span class="caret"></span>';
        var a = navbarLink(item.icon, title, item.title);
        a.addClass('dropdown-toggle');
        a.attr('data-toggle', 'dropdown');
        a.attr('role', 'button');
        a.attr('aria-expanded', 'false');
        li.append(a);
        var ul = $('<ul class="dropdown-menu"></ul>');
        ul.attr('role', 'menu');
        for (var j = 0; j<item.items.length; j++) {
          var subItem = item.items[j];
          var subli = $('<li></li>');
          subli.append(navbarLink(subItem.icon, subItem.title, subItem.url));
          ul.append(subli);
        }
        li.append(ul);
      } else {
        li.append(navbarLink(item.icon, item.title, item.url));
      }

      if (item.align === "left")
        navbarLeft.append(li);
      else
        navbarRight.append(li);
    }
  }

  function addToNavbar(page, active) {

    // capture the id and data-icon attribute (if any)
    var id = page.attr('id');
    var icon = page.attr('data-icon');

    // get the wrapper
    var wrapper = page.closest('.dashboard-page-wrapper');

    // move the id to the wrapper
    page.removeAttr('id');
    wrapper.attr('id', id);

    // add the tab-pane class to the wrapper
    wrapper.addClass('tab-pane');
    if (active)
      wrapper.addClass('active');

    // get a reference to the h1, discover it's id and title, then remove it
    var h1 = wrapper.children('h1').first();
    var title = h1.html();
    h1.remove();

    // add an item to the navbar for this tab
    var li = $('<li></li>');
    if (active)
      li.addClass('active');
    var a = navbarLink(icon, title, '#' + id);
    a.attr('data-toggle', 'tab');
    li.append(a);
    $('ul.navbar-left').append(li);
  }

  function navbarLink(icon, title, url) {

    var a = $('<a></a>');
    if (icon) {

      // get the name of the icon set and icon
      var dashPos = icon.indexOf("-");
      var iconSet = icon.substring(0, dashPos);
      var iconName = icon.substring(dashPos + 1);

      // create the icon
      var iconElement = $('<span class="' + iconSet + ' ' + icon + '"></span>');
      if (title)
        iconElement.css('margin-right', '7px');
      a.append(iconElement);
      // if url is null see if we can auto-generate based on icon (e.g. social)
      if (!url)
        maybeGenerateLinkFromIcon(iconName, a);
    }
    if (title)
      a.append(title);

    // add the url.
    if (url) {
      if (url === "source_embed") {
        a.attr('href', '#');
        a.attr('data-featherlight', "#flexdashboard-source-code");
        a.featherlight({
            beforeOpen: function(event){
              $('body').addClass('unselectable');
            },
            afterClose: function(event){
              $('body').removeClass('unselectable');
            }
        });
      } else {
        a.attr('href', url);
      }
    }

    return a;
  }

  // auto generate a link from an icon name (e.g. twitter) when possible
  function maybeGenerateLinkFromIcon(iconName, a) {

     var serviceLinks = {
      "twitter": "https://twitter.com/share?text=" + encodeURIComponent(document.title) + "&url="+encodeURIComponent(location.href),
      "facebook": "https://www.facebook.com/sharer/sharer.php?s=100&p[url]="+encodeURIComponent(location.href),
      "google-plus": "https://plus.google.com/share?url="+encodeURIComponent(location.href),
      "linkedin": "https://www.linkedin.com/shareArticle?mini=true&url="+encodeURIComponent(location.href) + "&title=" + encodeURIComponent(document.title),
      "pinterest": "https://pinterest.com/pin/create/link/?url="+encodeURIComponent(location.href) + "&description=" + encodeURIComponent(document.title)
    };

    var makeSocialLink = function(a, url) {
      a.attr('href', '#');
      a.on('click', function(e) {
        e.preventDefault();
        window.open(url);
      });
    };

    $.each(serviceLinks, function(key, value) {
      if (iconName.indexOf(key) !== -1)
        makeSocialLink(a, value);
    });
  }

  // layout a dashboard page
  function layoutDashboardPage(page) {

    // use a page wrapper so that free form content above the
    // dashboard appears at the top rather than the side (as it
    // would without the wrapper in a column orientation)
    var wrapper = $('<div class="dashboard-page-wrapper"></div>');
    page.wrap(wrapper);

    // hoist up any content before level 2 or level 3 headers
    var children = page.children();
    children.each(function(index) {
      if ($(this).hasClass('level2') || $(this).hasClass('level3'))
        return false;
      $(this).insertBefore(page);
    });

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
      if (sidebar.length > 0)
        layoutSidebar(sidebar, page);
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

  function layoutSidebar(sidebar, content) {

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
    content.css('padding-left', sidebarWidth + 'px');
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

      // flags
      var haveCaptions = false;
      var haveFlexHeight = true;

      // remove the h2
      $(this).children('h2').remove();

      // make it a dashboard row
      $(this).addClass('dashboard-row');

      // find all of the level 3 subheads
      var columns = $(this).children('div.section.level3');

      // determine figureSizes sizes
      var figureSizes = chartFigureSizes(columns);

      // fixup the columns
      columns.each(function(index) {

        // check for a value box
        if ($(this).hasClass('value-box')) {

          // layout value box
          layoutValueBox($(this));

          // static height based on height of value boxes
          haveFlexHeight = false;

        } else {

          // layout the chart
          var result = layoutChart($(this));

          // update flexHeight state
          if (!result.flex)
            haveFlexHeight = false;

          // update state
          if (result.caption)
            haveCaptions = true;
        }

        // set the column flex based on the figure width
        // (value boxes will just get the default figure width)
        var chartWidth = figureSizes[index].width;
        setFlex($(this), chartWidth + ' ' + chartWidth + ' 0px');

      });

      // if we don't have any captions in this row then remove
      // the chart notes divs
      if (!haveCaptions)
        $(this).find('.chart-notes').remove();

       // make it a flexbox row
      if (haveFlexHeight)
        $(this).addClass('dashboard-row-flex');

      // now we can set the height on all the wrappers (based on maximum
      // figure height + room for title and notes, or data-height on the
      // container if specified). However, don't do this if there is
      // no flex on any of the constituent columns
      var flexHeight = null;
      var dataHeight = parseInt($(this).attr('data-height'));
      if (dataHeight)
        flexHeight = adjustedHeight(dataHeight, columns.first());
      else if (haveFlexHeight)
        flexHeight = maxChartHeight(figureSizes, columns);
      if (flexHeight) {
        if (fillPage)
          setFlex($(this), flexHeight + ' ' + flexHeight + ' 0px');
        else {
          $(this).css('height', flexHeight + 'px');
          setFlex($(this), '0 0 ' + flexHeight + 'px');
        }
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

      // column flex is the max row width (or data-width if specified)
      var flexWidth;
      var dataWidth = parseInt($(this).attr('data-width'));
      if (dataWidth)
        flexWidth = dataWidth;
      else
        flexWidth = maxChartWidth(figureSizes);
      setFlex($(this), flexWidth + ' ' + flexWidth + ' 0px');

      // layout each chart
      rows.each(function(index) {

         // check for a value box
        if ($(this).hasClass('value-box')) {

          layoutValueBox($(this));

        } else {

          // perform the layout
          var result = layoutChart($(this));

          // ice the notes if there are none
          if (!result.caption)
            $(this).find('.chart-notes').remove();

          // set flex height based on figHeight, then adjust
          if (result.flex) {
            var chartHeight = figureSizes[index].height;
            chartHeight = adjustedHeight(chartHeight, $(this));
            if (fillPage)
              setFlex($(this), chartHeight + ' ' + chartHeight + ' 0px');
            else {
              $(this).css('height', chartHeight + 'px');
              setFlex($(this), chartHeight + ' ' + chartHeight + ' ' + chartHeight + 'px');
            }
          }
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
    if (chart.length > 0) {
      var chartTitle = chart.find('.chart-title');
      if (chartTitle.length)
        height += chartTitle.first().outerHeight();
      var chartNotes = chart.find('.chart-notes');
      if (chartNotes.length)
        height += chartNotes.first().outerHeight();
    }
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
      caption: false,
      flex: false
    };

    // extract the title
    var title = extractTitle(chart);

    // auto-resizing treatment for image
    autoResizeChartImage(chart);

    // put all the content in a chart wrapper div
    chart.addClass('chart-wrapper');
    chart.wrapInner('<div class="chart-stage"></div>');
    var chartContent = chart.children('.chart-stage');

    // flex the content if it has a chart OR is empty (e.g. samply layout)
    result.flex = hasChart(chartContent) || (chartContent.find('p').length == 0);
    if (result.flex) {
      // add flex classes
      chart.addClass('chart-wrapper-flex');
      chartContent.addClass('chart-stage-flex');

      // additional shim to break out of flexbox sizing
      chartContent.wrapInner('<div class="chart-shim"></div>');
      chartContent = chartContent.children('.chart-shim');

      // bootstrap table
      handleBootstrapTable(chartContent);
    }

    // add the title
    var chartTitle = $('<div class="chart-title"></div>');
    chartTitle.html(title);
    chart.prepend(chartTitle);

    // extract notes
    if (extractChartNotes(chartContent, chart))
      result.caption = true;

    // return result
    return result;
  }

  // layout a value box
  function layoutValueBox(valueBox) {

    // look for custom background color
    var bgColor = valueBox.attr('data-background');
    if (bgColor) {
      valueBox.css('background-color', bgColor);
    } else {
      // automatically use bg-primary if none specified
      if (!valueBox.hasClass('bg-primary') && !valueBox.hasClass('bg-info') &&
          !valueBox.hasClass('bg-warning') && !valueBox.hasClass('bg-success') &&
          !valueBox.hasClass('bg-danger')) {
        valueBox.addClass('bg-primary');
      }

      // add alpha if necessary
      addValueBoxAlpha(valueBox);
    }

    // extract the title/caption
    var chartTitle = extractTitle(valueBox);

    // extract the value (remove leading vector index)
    var chartValue = valueBox.text().trim();
    chartValue = chartValue.replace("[1] ", "");

    // build a value box structure
    var value = $('<p class="value"></p>');
    value.text(chartValue);
    var caption = $('<p class="caption"></p>');
    caption.html(chartTitle);
    var inner = $('<div class="inner"></div>');
    inner.append(value);
    inner.append(caption);

    // replace children with it
    valueBox.children().remove();
    valueBox.append(inner);

    // add icon if specified
    var chartIcon = valueBox.attr('data-icon');
    if (chartIcon) {
      var icon = $('<div class="icon"></div>');
      var iconLib = "";
      var components = chartIcon.split("-");
      if (components.length > 1)
        iconLib = components[0] + " ";
      var i = $('<i class="' + iconLib + chartIcon + '"></i>');
      icon.append(i);
      valueBox.append(icon);
    }
  }

  function addValueBoxAlpha(valueBox) {
    if (_options.valueBoxAlpha.length) {

      var alpha = _options.valueBoxAlpha[0];
      if (_options.valueBoxAlpha.length > 1 &&
          !valueBox.hasClass('bg-primary')) {
        alpha = _options.valueBoxAlpha[1];
      }
      if (alpha > 0) {
        var color = valueBox.css('backgroundColor');
        var newColor = color.replace('rgb', 'rgba').replace(')', ',' + alpha + ')');
        valueBox.css({backgroundColor: newColor});
      }
    }
  }

  // get a reference to the h3, discover it's inner html, and remove it
  function extractTitle(container) {
    var h3 = container.children('h3').first();
    var title = h3.html();
    h3.remove();
    return title;
  }

  function handleBootstrapTable(chartContent) {

    function handleTable(bsTable, overflowContainer) {

      // remove grid effect that shiny uses
      bsTable.removeClass('table-bordered');

      // add shim to force scrollbar on overflow
      overflowContainer.addClass('bootstrap-table-shim');

      // fixup xtable generated tables with a proper thead
      var headerRow = bsTable.find('tbody > tr:first-child > th').parent();
      if (headerRow.length > 0) {
        var thead = $('<thead></thead>');
        bsTable.prepend(thead);
        headerRow.detach().appendTo(thead);
      }

      // stable table headers when scrolling
      bsTable.stickyTableHeaders({
        scrollableArea: overflowContainer
      });
    }

    var bsTable = findBootstrapTable(chartContent);
    if (bsTable.length > 0)
      handleTable(bsTable, chartContent);

    // if there is a shiny-html-output element then listen for
    // new bootstrap tables bound to it (delay looking for the
    // table to provide time for the value to be bound)
    chartContent.find('.shiny-html-output').on('shiny:value',
      function(event) {
        var element = $(event.target);
        setTimeout(function() {
          var bsTable = findBootstrapTable(element);
          if (bsTable.length > 0)
            handleTable(bsTable, element.parent());
        }, 10);
      });
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
    var widget = chartContent.children('div[id^="htmlwidget-"],div.html-widget');
    var shiny = chartContent.children('div[class^="shiny-"]');
    var bsTable = findBootstrapTable(chartContent);
    return (img.length > 0) ||
           (widget.length > 0) ||
           (shiny.length > 0) ||
           (bsTable.length > 0);
  }

  function findBootstrapTable(chartContent) {
    var bsTable = chartContent.find('table.table');
    if (bsTable.length > 0)
      return bsTable;
    else
      return chartContent.find('tr.header').parent('thead').parent('table');
  }

  function patchDTSizing() {

    // bail if no HTMLWidgets
    if (!HTMLWidgets.widgets)
      return;

    // find the DT resize handler and replace it
    var widgets = HTMLWidgets.widgets;
    for (var i=0; i<widgets.length; i++) {
      var widget = widgets[i];
      if (widget.name === "datatables") {

        // monkey patch (post-process) renderValue to set scrollX = TRUE
        var previousRenderValue = widget.renderValue;
        widget.renderValue = function(el, x, instance) {

          // force scrollX/scrollY and turn off autoWidth
          x.options.scrollX = true;
          x.options.scrollY = "300px";
          x.options.bAutoWidth = true;

          // call renderValue so the table gets fully laid out
          previousRenderValue(el, x, instance);

          // reset the sScrollY on the table dynamically
          setDataTableScrollY(el, $(el).innerHeight());

          // adjust column sizes
          var dt = findDataTable(el);
          dt.fnAdjustColumnSizing();
        }

        // monkey patch (pre-process) resize to set scrollY dynamically
        var previousResize = widget.resize;
        widget.resize = function(el, width, height, instance) {

          // call previous resize handler
          if (previousResize)
            previousResize(el, width, height, instance);

          // set the sScrollY on the table dynamically
          setDataTableScrollY(el, height);
        };
      }
    }
  }

  function setDataTableScrollY(el, availableHeight) {

    // see how much of the table is occupied by header/footer elements
    // and use that to compute a target scroll body height
    var dtWrapper = $(el).find('div.dataTables_wrapper');
    var dtScrollBody = $(el).find($('div.dataTables_scrollBody'));
    var framingHeight = dtWrapper.innerHeight() - dtScrollBody.innerHeight();
    var scrollBodyHeight = availableHeight - framingHeight;

    // set the height
    dtScrollBody.height(scrollBodyHeight + 'px');
  }

  function findDataTable(el) {
    if (el) {
      var dt = null;
      $($.fn.dataTable.fnTables()).each(function(i, table) {
        var $table = $(table);
        if ($(el).has($table).length > 0) {
          dt = $table.dataTable();
          return false;
        }
      });
    }
    return dt;
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

  // tweak Prism highlighting
  function initPrismHighlighting() {

    if (window.Prism) {
      Prism.languages.insertBefore('r', 'comment', {
        'heading': [
          {
            // title 1
        	  // =======

        	  // title 2
        	  // -------
        	  pattern: /\w+.*(?:\r?\n|\r)(?:====+|----+)/,
            alias: 'operator'
          },
          {
            // ### title 3
            pattern: /(^\s*)###[^#].+/m,
            lookbehind: true,
            alias: 'operator'
          }
        ]
      });

      // prism highlight
      Prism.highlightAll();
    }
  }

  FlexDashboard.prototype = {
    constructor: FlexDashboard,
    init: init
  };

  return FlexDashboard;

})();

window.FlexDashboard = new FlexDashboard();
