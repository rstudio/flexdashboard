

var FlexDashboard = (function () {

  // initialize options
  var _options = {};

  var FlexDashboard = function() {

    // default options
    _options = $.extend(_options, {
      theme: "cosmo",
      fillPage: false,
      orientation: 'columns',
      storyboard: false,
      defaultFigWidth: 576,
      defaultFigHeight: 461,
      defaultFigWidthMobile: 360,
      defaultFigHeightMobile: 461,
      isMobile: false,
      isPortrait: false,
      resize_reload: true
    });
  };

  function init(options) {

    // extend default options
    $.extend(true, _options, options);

    // add ids to sections that don't have them (pandoc won't assign ids
    // to e.g. sections with titles consisting of only chinese characters)
    var nextId = 1;
    $('.level1:not([id]),.level2:not([id]),.level3:not([id])').each(function() {
      $(this).attr('id', 'dashboard-' + nextId++);
    });

    // find navbar items
    var navbarItems = $('#flexdashboard-navbar');
    if (navbarItems.length)
      navbarItems = JSON.parse(navbarItems.html());
    addNavbarItems(navbarItems);

    // find the main dashboard container
    var dashboardContainer = $('#dashboard-container');

    // resolve mobile classes
    resolveMobileClasses(dashboardContainer);

    // one time global initialization for components
    componentsInit(dashboardContainer);

    // look for a global sidebar
    var globalSidebar = dashboardContainer.find(".section.level1.sidebar");
    if (globalSidebar.length > 0) {

      // global layout for fullscreen displays
      if (!isMobilePhone()) {

         // hoist it up to the top level
         globalSidebar.insertBefore(dashboardContainer);

         // lay it out (set width/positions)
         layoutSidebar(globalSidebar, dashboardContainer);

      // tuck sidebar into first page for mobile phones
      } else {

        // convert it into a level3 section
        globalSidebar.removeClass('sidebar');
        globalSidebar.removeClass('level1');
        globalSidebar.addClass('level3');
        var h1 = globalSidebar.children('h1');
        var h3 = $('<h3></h3>');
        h3.append(h1.contents());
        h3.insertBefore(h1);
        h1.detach();

        // move it into the first page
        var page = dashboardContainer.find('.section.level1').first();
        if (page.length > 0)
          page.prepend(globalSidebar);
      }
    }

    // look for pages to layout
    var pages = $('div.section.level1');
    if (pages.length > 0) {

        // find the navbar and collapse on clicked
        var navbar = $('#navbar');
        navbar.on("click", "a[data-toggle!=dropdown]", null, function () {
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

      // add the storyboard class if requested
      if (_options.storyboard)
        dashboardContainer.addClass('storyboard');

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

    // record mobile and orientation state then register a handler
    // to refresh if resize_reload is set to true and it changes
    _options.isMobile = isMobilePhone();
    _options.isPortrait = isPortrait();
    if (_options.resize_reload) {
      $(window).on('resize', function() {
        if (_options.isMobile !== isMobilePhone() ||
            _options.isPortrait !== isPortrait()) {
          window.location.reload();
        }
      });
    } else {
      // if in desktop mode and resizing to mobile, make sure the heights are 100%
      // This enforces what `fillpage.css` does for "wider" pages.
      // Since we are not reloading once the page becomes small, we need to force the height to 100%
      // This is a new situation introduced when `_options.resize_reload` is `false`
      if (! _options.isMobile) {
        // only add if `fillpage.css` was added in the first place
        if (_options.fillPage) {
          // fillpage.css
          $("html,body,#dashboard").css("height", "100%");
        }
      }
    }
    // trigger layoutcomplete event
    dashboardContainer.trigger('flexdashboard:layoutcomplete');
  }

  function resolveMobileClasses(dashboardContainer) {
     // add top level layout class
    dashboardContainer.addClass(isMobilePhone() ? 'mobile-layout' :
                                                  'desktop-layout');

    // look for .mobile sections and add .no-mobile to their peers
    var mobileSections = $('.section.mobile');
    mobileSections.each(function() {
       var id = $(this).attr('id');
       var nomobileId = id.replace(/-\d+$/, '');
       $('#' + nomobileId).addClass('no-mobile');
    });
  }

  function addNavbarItems(navbarItems) {

    var navbarLeft = $('ul.navbar-left');
    var navbarRight = $('ul.navbar-right');

    for (var i = 0; i<navbarItems.length; i++) {

      // get the item
      var item = navbarItems[i];

      // determine the container
      var container = null;
      if (item.align === "left")
        container = navbarLeft;
      else
        container = navbarRight;

      // navbar menu if we have multiple items
      if (item.items) {
        var menu = navbarMenu(null, item.icon, item.title, container);
        for (var j = 0; j<item.items.length; j++) {
          var subItem = item.items[j];
          var li = $('<li></li>');
          var a = navbarLink(subItem.icon, subItem.title, subItem.href, subItem.target);
          a.removeClass("nav-link").addClass("dropdown-item");
          li.append(a);
          menu.append(li);
        }
      } else {
        var li = $('<li class="nav-item"></li>');
        li.append(navbarLink(item.icon, item.title, item.href, item.target));
        container.append(li);
      }
    }
  }

  // create or get a reference to an existing dropdown menu
  function navbarMenu(id, icon, title, container) {
    var existingMenu = [];
    if (id)
      existingMenu = container.children('#' + id);
    if (existingMenu.length > 0) {
      return existingMenu.children('ul');
    } else {
      var li = $('<li class="nav-item"></li>');
      if (id)
        li.attr('id', id);
      li.addClass('dropdown');
      // auto add "Share" title on mobile if necessary
      if (!title && icon && (icon === "fa-share-alt") && isMobilePhone())
        title = "Share";
      if (title) {
        title = title + ' <span class="caret"></span>';
      }
      var a = navbarLink(icon, title, "#");
      a.addClass('dropdown-toggle');
      a.attr('data-toggle', 'dropdown');
      a.attr('data-bs-toggle', 'dropdown');
      a.attr('role', 'button');
      a.attr('aria-expanded', 'false');
      li.append(a);
      var ul = $('<ul class="dropdown-menu"></ul>');
      ul.attr('role', 'menu');
      li.append(ul);
      container.append(li);
      return ul;
    }
  }

  function addToNavbar(page, active) {

    // capture the id and data-icon attribute (if any)
    var id = page.attr('id');
    var icon = page.attr('data-icon');
    var navmenu = page.attr('data-navmenu');

    // get hidden state (transfer this to navbar)
    var hidden = page.hasClass('hidden');
    page.removeClass('hidden');

    // sanitize the id for use with bootstrap tabs
    id = id.replace(/[.\/?&!#<>]/g, '').replace(/\s/g, '_');
    page.attr('id', id);

    // get the wrapper
    var wrapper = page.closest('.dashboard-page-wrapper');

    // move the id to the wrapper
    page.removeAttr('id');
    wrapper.attr('id', id);

    // add the tab-pane class to the wrapper
    wrapper.addClass('tab-pane');
    if (active)
      wrapper.addClass('active');

    // get a reference to the h1, discover its inner contens, then detach it
    var h1 = wrapper.find('h1').first();
    var title = h1.contents();
    h1.detach();

    // create a navbar item
    var li = $('<li></li>');
    var a = navbarLink(icon, title, '#' + id);
    a.attr('data-toggle', 'tab');
    li.append(a);

    // add it to the navbar (or navbar menu if specified)
    var container = $('ul.navbar-left');
    if (navmenu) {
      var menuId = navmenu.replace(/\s+/g, '');
      var menu = navbarMenu(menuId, null, navmenu, container);
      li.find("> a").removeClass("nav-link").addClass("dropdown-item");
      menu.append(li);
    } else {
      li.addClass("nav-item")
      container.append(li);
    }

    // hide it if requested
    if (hidden)
      li.addClass('hidden');
  }

  function navbarLink(icon, title, href, target) {

    var a = $('<a class="nav-link"></a>');
    if (icon) {

      // get the name of the icon set and icon
      var dashPos = icon.indexOf("-");
      var iconSet = null;
      var iconSplit = icon.split(" ");
      if (iconSplit.length > 1) {
        iconSet = iconSplit[0];
        icon = iconSplit.slice(1).join(" ");
      } else {
        iconSet = icon.substring(0, dashPos);
      }
      var iconName = icon.substring(dashPos + 1);

      // create the icon
      var iconElement = $('<span class="' + iconSet + ' ' + icon + '"></span>');
      if (title)
        iconElement.css('margin-right', '7px');
      a.append(iconElement);
      // if href is null see if we can auto-generate based on icon (e.g. social)
      if (!href)
        maybeGenerateLinkFromIcon(iconName, a);
    }
    if (title)
      a.append(title);

    // add the href.
    if (href) {
      if (href === "source_embed") {
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
        a.attr('href', href);
      }
    }

    // add the arget
    if (target)
      a.attr('target', target);

    return a;
  }

  // auto generate a link from an icon name (e.g. twitter) when possible
  function maybeGenerateLinkFromIcon(iconName, a) {

     var serviceLinks = {
      "twitter": "https://twitter.com/share?text=" + encodeURIComponent(document.title) + "&url="+encodeURIComponent(location.href),
      "facebook": "https://www.facebook.com/sharer/sharer.php?s=100&p[url]="+encodeURIComponent(location.href),
      "linkedin": "https://www.linkedin.com/shareArticle?mini=true&url="+encodeURIComponent(location.href) + "&title=" + encodeURIComponent(document.title),
      "pinterest": "https://pinterest.com/pin/create/link/?url="+encodeURIComponent(location.href) + "&description=" + encodeURIComponent(document.title)
    };

    var makeSocialLink = function(a, href) {
      a.attr('href', '#');
      a.on('click', function(e) {
        e.preventDefault();
        window.open(href);
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

    // if there are no level2 or level3 headers synthesize a level3
    // header to contain the (e.g. frame it, scroll container, etc.)
    var headers = page.find('h2,h3');
    if (headers.length === 0)
      page.wrapInner('<div class="section level3"></div>');

    // hoist up any content before level 2 or level 3 headers
    var children = page.children();
    children.each(function(index) {
      if ($(this).hasClass('level2') || $(this).hasClass('level3'))
        return false;
      $(this).insertBefore(page);
    });

    // determine orientation and fillPage behavior for distinct media
    var orientation, fillPage, storyboard;

    // media: mobile phone
    if (isMobilePhone()) {

      // if there is a sidebar we need to ensure it's content
      // is properly framed as an h3
      var sidebar = page.find('.section.sidebar');
      sidebar.removeClass('sidebar');
      sidebar.wrapInner('<div class="section level3"></div>');
      var h2 = sidebar.find('h2');
      var h3 = $('<h3></h3>');
      h3.append(h2.contents());
      h3.insertBefore(h2);
      h2.detach();

      // wipeout h2 elements then enclose them in a single h2
      var level2 = page.find('div.section.level2');
      level2.each(function() {
        level2.children('h2').remove();
        level2.children().unwrap();
      });
      page.wrapInner('<div class="section level2"></div>');

      // substitute mobile images
      if (isPortrait()) {
        var mobileFigures = $('img.mobile-figure');
        mobileFigures.each(function() {
          // get the src (might be base64 encoded)
          var src = $(this).attr('src');

          // find it's peer
          var id = $(this).attr('data-mobile-figure-id');
          var img = $('img[data-figure-id=' + id + "]");
          img.attr('src', src)
             .attr('width', _options.defaultFigWidthMobile)
             .attr('height', _options.defaultFigHeightMobile);
        });
      }

      // hoist storyboard commentary into it's own section
      if (page.hasClass('storyboard')) {
        var commentaryHR = page.find('div.section.level3 hr');
        commentaryHR.each(function() {
          var commentary = $(this).nextAll().detach();
          var commentarySection = $('<div class="section level3"></div>');
          commentarySection.append(commentary);
          commentarySection.insertAfter($(this).closest('div.section.level3'));
          $(this).remove();
        });
      }

      // force a non full screen layout by columns
      orientation = _options.orientation = 'columns';
      fillPage = _options.fillPage = false;
      storyboard = _options.storyboard = false;

    // media: desktop
    } else {

      // determine orientation
      orientation = page.attr('data-orientation');
      if (orientation !== 'rows' && orientation != 'columns')
        orientation = _options.orientation;

      // determine storyboard mode
      storyboard = page.hasClass('storyboard');

      // fillPage based on options (force for storyboard)
      fillPage = _options.fillPage || storyboard;

      // handle sidebar
      var sidebar = page.find('.section.level2.sidebar');
      if (sidebar.length > 0)
        layoutSidebar(sidebar, page);
    }

    // give it and it's parent divs height: 100% if we are in fillPage mode
    if (fillPage) {
      page.addClass('vertical-layout-fill');
      page.css('height', '100%');
      page.parents('div').css('height', '100%');
    } else {
      page.addClass('vertical-layout-scroll');
    }

    // perform the layout
    if (storyboard)
      layoutPageAsStoryboard(page);
    else if (orientation === 'rows')
      layoutPageByRows(page, fillPage);
    else if (orientation === 'columns')
      layoutPageByColumns(page, fillPage);
  }

  function layoutSidebar(sidebar, content) {

    // get it out of the header hierarchy
    sidebar = sidebar.first();
    if (sidebar.hasClass('level1')) {
      sidebar.removeClass('level1');
      sidebar.children('h1').remove();
    } else if (sidebar.hasClass('level2')) {
      sidebar.removeClass('level2');
      sidebar.children('h2').remove();
    }

    // determine width
    var sidebarWidth = isTablet() ? 220 : 250;
    var dataWidth = parseInt(sidebar.attr('data-width'));
    if (dataWidth)
      sidebarWidth = dataWidth;

    // set the width and shift the page right to accomodate the sidebar
    sidebar.css('width', sidebarWidth + 'px');
    content.css('padding-left', sidebarWidth + 'px');

    // wrap it's contents in a form
    sidebar.wrapInner($('<form></form>'));
  }

  function layoutPageAsStoryboard(page) {

    // create storyboard navigation
    var nav = $('<div class="storyboard-nav"></div>');

    // add navigation buttons
    var prev = $('<button class="sbprev"><i class="fa fa-angle-left"></i></button>');
    nav.append(prev);
    var next= $('<button class="sbnext"><i class="fa fa-angle-right"></i></button>');
    nav.append(next);

    // add navigation frame
    var frameList = $('<div class="sbframelist"></div>');
    nav.append(frameList);
    var ul = $('<ul></ul>');
    frameList.append(ul);

     // find all the level3 sections (those are the storyboard frames)
    var frames = page.find('div.section.level3');
    frames.each(function() {

      // mark it
      $(this).addClass('sbframe');

      // divide it into chart content and (optional) commentary
      $(this).addClass('dashboard-column-orientation');

      // stuff the chart into it's own div w/ flex
      $(this).wrapInner('<div class="sbframe-component"></div>');
      setFlex($(this), 1);
      var frame = $(this).children('.sbframe-component');

      // extract the title from the h3
      var li = $('<li></li>');
      var h3 = frame.children('h3');
      li.append(h3.contents());
      h3.detach();
      ul.append(li);

      // extract commentary
      var hr = frame.children('hr');
      if (hr.length) {
        var commentary = hr.nextAll().detach();
        hr.remove();
        var commentaryFrame = $('<div class="sbframe-commentary"></div>');
        commentaryFrame.addClass('flowing-content-shim');
        commentaryFrame.addClass('flowing-content-container');
        commentaryFrame.append(commentary);
        $(this).append(commentaryFrame);

        // look for a data-commentary-width attribute
        var commentaryWidth = $(this).attr('data-commentary-width');
        if (commentaryWidth)
          commentaryFrame.css('width', commentaryWidth + 'px');
      }

      // layout the chart (force flex)
      var result = layoutChart(frame, true);

      // ice the notes if there are none
      if (!result.notes)
        frame.find('.chart-notes').remove();

      // set flex on chart
      setFlex(frame, 1);
    });

    // create a div to hold all the frames
    var frameContent = $('<div class="sbframe-content"></div>');
    frameContent.addClass('dashboard-row-orientation');
    frameContent.append(frames.detach());

    // row orientation to stack nav and frame content
    page.addClass('dashboard-row-orientation');
    page.append(nav);
    page.append(frameContent);
    setFlex(frameContent, 1);

    // initialize sly
    var sly = new Sly(frameList, {
    		horizontal: true,
    		itemNav: 'basic',
    		smart: true,
    		activateOn: 'click',
    		startAt: 0,
    		scrollBy: 1,
    		activatePageOn: 'click',
    		speed: 200,
    		moveBy: 600,
    		dragHandle: true,
    		dynamicHandle: true,
    		clickBar: true,
    		keyboardNavBy: 'items',
    		next: next,
    		prev: prev
    	}).init();

    // make first frame active
    frames.removeClass('active');
    frames.first().addClass('active');

    // subscribe to frame changed events
    sly.on('active', function (eventName, itemIndex) {
      frames.removeClass('active');
      frames.eq(itemIndex).addClass('active')
                          .trigger('shown');
    });
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
      var haveNotes = false;
      var haveFlexHeight = true;

      // remove the h2
      $(this).children('h2').remove();

      // check for a tabset
      var isTabset = $(this).hasClass('tabset');
      if (isTabset)
        layoutTabset($(this));

      // give it row layout semantics if it's not a tabset
      if (!isTabset)
        $(this).addClass('dashboard-row');

      // find all of the level 3 subheads
      var columns = $(this).find('div.section.level3');

      // determine figureSizes sizes
      var figureSizes = chartFigureSizes(columns);

      // fixup the columns
      columns.each(function(index) {

        // layout the chart (force flex if we are in a tabset)
        var result = layoutChart($(this), isTabset);

        // update flexHeight state
        if (!result.flex)
          haveFlexHeight = false;

        // update state
        if (result.notes)
          haveNotes = true;

        // set the column flex based on the figure width
        // (value boxes will just get the default figure width)
        var chartWidth = figureSizes[index].width;
        setFlex($(this), chartWidth + ' ' + chartWidth + ' 0px');

      });

      // remove empty chart note divs
      if (isTabset)
        $(this).find('.chart-notes').filter(function() {
            return $(this).html() === "&nbsp;";
        }).remove();
      if (!haveNotes)
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

      // check for a tabset
      var isTabset = $(this).hasClass('tabset');
      if (isTabset)
        layoutTabset($(this));

      // find all the h3 elements
      var rows = $(this).find('div.section.level3');

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

        // perform the layout
        var result = layoutChart($(this), false);

        // ice the notes if there are none
        if (!result.notes)
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
  function layoutChart(chart, forceFlex) {

    // state to return
    var result = {
      notes: false,
      flex: false
    };

    // extract the title
    var title = extractTitle(chart);

    // find components that apply to this container
    var components = componentsFind(chart);

    // if it's a custom component then call it and return
    var customComponents = componentsCustom(components);
    if (customComponents.length) {
      componentsLayout(customComponents, title, chart);
      result.notes = false;
      result.flex = forceFlex || componentsFlex(customComponents);
      return result;
    }

    // put all the content in a chart wrapper div
    chart.addClass('chart-wrapper');
    chart.wrapInner('<div class="chart-stage"></div>');
    var chartContent = chart.children('.chart-stage');

    // flex the content if appropriate
    result.flex = forceFlex || componentsFlex(components);
    if (result.flex) {
      // add flex classes
      chart.addClass('chart-wrapper-flex');
      chartContent.addClass('chart-stage-flex');

      // additional shim to break out of flexbox sizing
      chartContent.wrapInner('<div class="chart-shim"></div>');
      chartContent = chartContent.children('.chart-shim');
    }

    // set custom data-padding attribute
    var pad = chart.attr('data-padding');
    if (pad) {
      if (pad === "0")
        chart.addClass('no-padding');
      else {
        pad = pad + 'px';
        chartContent.css('left', pad)
                    .css('top', pad)
                    .css('right', pad)
                    .css('bottom', pad)
      }
    }

    // call compoents
    componentsLayout(components, title, chartContent);

    // also activate components on shiny output
    findShinyOutput(chartContent).on('shiny:value',
      function(event) {
        var element = $(event.target);
        setTimeout(function() {

          // see if we opted out of flex based on our output (for shiny
          // we can't tell what type of output we have until after the
          // value is bound)
          var components = componentsFind(element);
          var flex = forceFlex || componentsFlex(components);
          if (!flex) {
            chart.css('height', "");
            setFlex(chart, "");
            chart.removeClass('chart-wrapper-flex');
            chartContent.removeClass('chart-stage-flex');
            chartContent.children().unwrap();
          }

          // perform layout
          componentsLayout(components, title, element.parent());
        }, 10);
      });

    // add the title
    var chartTitle = $('<div class="chart-title"></div>');
    chartTitle.append(title);
    chart.prepend(chartTitle);

    // add the notes section
    var chartNotes = $('<div class="chart-notes"></div>');
    chartNotes.html('&nbsp;');
    chart.append(chartNotes);

    // attempt to extract notes if we have a component
    if (components.length)
      result.notes = extractChartNotes(chartContent, chartNotes);

    // return result
    return result;
  }

  // build a tabset from a section div with the .tabset class
  function layoutTabset(tabset) {

    // check for fade option
    var fade = tabset.hasClass("tabset-fade");
    var pills = tabset.hasClass("tabset-pills");
    var navClass = pills ? "nav-pills" : "nav-tabs";

    // determine the heading level of the tabset and tabs
    var match = tabset.attr('class').match(/level(\d) /);
    if (match === null)
      return;
    var tabsetLevel = Number(match[1]);
    var tabLevel = tabsetLevel + 1;

    // find all subheadings immediately below
    var tabs = tabset.find("div.section.level" + tabLevel);
    if (!tabs.length)
      return;

    // create tablist and tab-content elements
    var tabList = $('<ul class="nav ' + navClass + '" role="tablist"></ul>');
    $(tabs[0]).before(tabList);
    var tabContent = $('<div class="tab-content"></div>');
    $(tabs[0]).before(tabContent);

    // build the tabset
    var activeTab = 0;
    tabs.each(function(i) {

      // get the tab div
      var tab = $(tabs[i]);

      // get the id then sanitize it for use with bootstrap tabs
      var id = tab.attr('id');

      // see if this is marked as the active tab
      if (tab.hasClass('active'))
        activeTab = i;

      // sanitize the id for use with bootstrap tabs
      id = id.replace(/[.\/?&!#<>]/g, '').replace(/\s/g, '_');
      tab.attr('id', id);

      // get the heading element within it and grab it's text
      var heading = tab.find('h' + tabLevel + ':first');
      var headingDom = heading.contents();

      // build and append the tab list item
      var a = $('<a role="tab" data-toggle="tab" class="nav-link"></a>');
      a.append(headingDom);
      a.attr('href', '#' + id);
      a.attr('aria-controls', id);
      var li = $('<li role="presentation" class="nav-item"></li>');
      li.append(a);
      tabList.append(li);

      // set it's attributes
      tab.attr('role', 'tabpanel');
      tab.addClass('tab-pane');
      tab.addClass('tabbed-pane');
      tab.addClass('no-title');
      if (fade)
        tab.addClass('fade');

      // move it into the tab content div
      tab.detach().appendTo(tabContent);
    });

    // set active tab
    $(tabList.children()[activeTab]).tab("show");
    var active = $(tabContent.children('div.section')[activeTab]);
    active.addClass('active');
    if (fade)
      active.addClass('in');

    // add nav-tabs-custom
    tabset.addClass('nav-tabs-custom');

    // internal layout is dashboard-column with tab-content flexing
    tabset.addClass('dashboard-column');
    setFlex(tabContent, 1);
  }

  // one time global initialization for components
  function componentsInit(dashboardContainer) {
    for (var i=0; i<window.FlexDashboardComponents.length; i++) {
      var component = window.FlexDashboardComponents[i];
      if (component.init)
        component.init(dashboardContainer);
    }
  }

  // find components that apply within a container
  function componentsFind(container) {

    // look for components
    var components = [];
    for (var i=0; i<window.FlexDashboardComponents.length; i++) {
      var component = window.FlexDashboardComponents[i];
      if (component.find(container).length)
        components.push(component);
    }

    // if there were none then use a special flowing content component
    // that just adds a scrollbar in fillPage mode
    if (components.length == 0) {
      components.push({
        find: function(container) {
          return container;
        },

        flex: function(fillPage) {
          return fillPage;
        },

        layout: function(title, container, element, fillPage) {
          if (fillPage) {
            container.addClass('flowing-content-shim');
            container.addClass('flowing-content-container');
          }
        }
      });
    }

    return components;
  }

  // if there is a custom component then pick it out
  function componentsCustom(components) {
    var customComponent = [];
    for (var i=0; i<components.length; i++)
      if (components[i].type === "custom") {
        customComponent.push(components[i]);
        break;
      }
    return customComponent;
  }

  // query all components for flex
  function componentsFlex(components) {

    // no components at all means no flex
    if (components.length === 0)
      return false;

    // otherwise query components (assume true unless we see false)
    var isMobile = isMobilePhone();
    for (var i=0; i<components.length; i++)
      if (components[i].flex && !components[i].flex(_options.fillPage))
        return false;
    return true;
  }

  // layout all components
  function componentsLayout(components, title, container) {
    var isMobile = isMobilePhone();
    for (var i=0; i<components.length; i++) {
      var element = components[i].find(container);
      if (components[i].layout) {
        // call layout (don't call other components if it returns false)
        var result = components[i].layout(title, container, element, _options.fillPage);
        if (result === false)
          return;
      }
    }
  }

  // get a reference to the h3, discover it's inner html, and remove it
  function extractTitle(container) {
    var h3 = container.children('h3').first();
    var title = '';
    if (!container.hasClass('no-title'))
      title = h3.contents();
    h3.detach();
    return title;
  }

  // extract chart notes
  function extractChartNotes(chartContent, chartNotes) {
    // look for a terminating blockquote or image caption
    var blockquote = chartContent.children('blockquote:last-child');
    var caption = chartContent.children('div.image-container')
                              .children('p.caption');
    if (blockquote.length) {
      chartNotes.empty().append(blockquote.children('p:first-child').contents());
      blockquote.remove();
      return true;
    } else if (caption.length) {
      chartNotes.empty().append(caption.contents());
      caption.remove();
      return true;
    } else {
      return false;
    }
  }

  function findShinyOutput(chartContent) {
    return chartContent.find('.shiny-text-output, .shiny-html-output');
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

  function isFillPage() {
    return _options.fillPage;
  }

  // detect portrait mode
  function isPortrait() {
    return ($(window).width() < $(window).height());
  }

  // safely detect rendering on a tablet
  function isTablet() {
    try
    {
      return window.matchMedia("only screen and (min-width: 769px) and (max-width: 992px)").matches;
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
    var hash = window.decodeURIComponent(window.location.hash);
    if (hash.length > 0)
      $('ul.nav a[href="' + hash + '"]').tab('show');
    FlexDashboardUtils.manageActiveNavbarMenu();

    // navigate to a tab when the history changes
    window.addEventListener("popstate", function(e) {
      var hash = window.decodeURIComponent(window.location.hash);
      var activeTab = $('ul.nav a[href="' + hash + '"]');
      if (activeTab.length) {
        activeTab.tab('show');
      } else {
        $('ul.nav a:first').tab('show');
      }
      FlexDashboardUtils.manageActiveNavbarMenu();
    });

    // add a hash to the URL when the user clicks on a tab/page
    $('.navbar-nav a[data-toggle="tab"]').on('click', function(e) {
      var baseUrl = FlexDashboardUtils.urlWithoutHash(window.location.href);
      var hash = FlexDashboardUtils.urlHash($(this).attr('href'));
      var href = baseUrl + hash;
      FlexDashboardUtils.setLocation(href);
    });

    // handle clicks of other links that should activate pages
    var navPages = $('ul.navbar-nav li a[data-toggle=tab]');
    navPages.each(function() {
      var href =  $(this).attr('href');
      var links = $('a[href="' + href + '"][data-toggle!=tab]');
      links.each(function() {
        $(this).on('click', function(e) {
          window.FlexDashboardUtils.showPage(href);
        });
      });
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
    init: init,
    isMobilePhone: isMobilePhone,
    isFillPage: isFillPage
  };

  return FlexDashboard;

})();

// utils
window.FlexDashboardUtils = {
  resizableImage: function(img) {
    var src = img.attr('src');
    var url = 'url("' + src + '")';
    img.parent().css('background', url)
                .css('background-size', 'contain')
                .css('background-repeat', 'no-repeat')
                .css('background-position', 'center')
                .addClass('image-container');
  },
  setLocation: function(href) {
    if (history && history.pushState) {
      history.pushState(null, null, href);
    } else {
      window.location.replace(href);
    }
    setTimeout(function() {
        window.scrollTo(0, 0);
    }, 10);
    this.manageActiveNavbarMenu();
  },
  showPage: function(href) {
    $('ul.navbar-nav li a[href="' + href + '"]').tab('show');
    var baseUrl = this.urlWithoutHash(window.location.href);
    var loc = baseUrl + href;
    this.setLocation(loc);
  },
  showLinkedValue: function(href) {
    // check for a page link
    if ($('ul.navbar-nav li a[data-toggle=tab][href="' + href + '"]').length > 0)
      this.showPage(href);
    else
      window.open(href);
  },
  urlWithoutHash: function(url) {
    var hashLoc = url.indexOf('#');
    if (hashLoc != -1)
      return url.substring(0, hashLoc);
    else
      return url;
  },
  urlHash: function(url) {
    var hashLoc = url.indexOf('#');
    if (hashLoc != -1)
      return url.substring(hashLoc);
    else
      return "";
  },
  manageActiveNavbarMenu: function () {
    // remove active from currently active tabs
    $('.navbar ul.nav .active').removeClass('active');
    // find the active tab
    var activeTab = $('.dashboard-page-wrapper.tab-pane.active');
    if (activeTab.length > 0) {
      var tabId = activeTab.attr('id');
      if (tabId)
        $(".navbar ul.nav a[href='#" + tabId + "']").tab("show");
    }
  }
};

window.FlexDashboard = new FlexDashboard();

// empty content
window.FlexDashboardComponents.push({
  find: function(container) {
    if (container.find('p').length == 0)
      return container;
    else
      return $();
  }
})

// plot image
window.FlexDashboardComponents.push({

  find: function(container) {
    return container.children('p')
                    .children('img:only-child');
  },

  layout: function(title, container, element, fillPage) {
    FlexDashboardUtils.resizableImage(element);
  }
});

// plot image (figure style)
window.FlexDashboardComponents.push({

  find: function(container) {
    return container.children('div.figure').children('img');
  },

  layout: function(title, container, element, fillPage) {
    FlexDashboardUtils.resizableImage(element);
  }
});

// htmlwidget
window.FlexDashboardComponents.push({

  init: function(dashboardContainer) {
    // trigger "shown" after initial layout to force static htmlwidgets
    // in runtime: shiny to be resized after the dom has been transformed
    dashboardContainer.on('flexdashboard:layoutcomplete', function(event) {
      setTimeout(function() {
        dashboardContainer.trigger('shown');
      }, 200);
    });
  },

  find: function(container) {
    return container.children('div[id^="htmlwidget-"],div.html-widget');
  }
});

// gauge
window.FlexDashboardComponents.push({

  find: function(container) {
    return container.children('div.html-widget.gauge');
  },

  flex: function(fillPage) {
    return false;
  },

  layout: function(title, container, element, fillPage) {


  }

});

// shiny output
window.FlexDashboardComponents.push({
  find: function(container) {
    return container.children('div[class^="shiny-"]');
  }
});

// bootstrap table
window.FlexDashboardComponents.push({

  find: function(container) {
    var bsTable = container.find('table.table');
    if (bsTable.length !== 0)
      return bsTable;
    else
      return container.find('tr.header').parent('thead').parent('table');
  },

  flex: function(fillPage) {
    return fillPage;
  },

  layout: function(title, container, element, fillPage) {

    // alias variables
    var bsTable = element;

    // fixup xtable generated tables with a proper thead
    var headerRow = bsTable.find('tbody > tr:first-child > th').parent();
    if (headerRow.length > 0) {
      var thead = $('<thead></thead>');
      bsTable.prepend(thead);
      headerRow.detach().appendTo(thead);
    }

    // improve appearance
    container.addClass('bootstrap-table');

    // for fill page provide scrolling w/ sticky headers
    if (fillPage) {
      // force scrollbar on overflow
      container.addClass('flowing-content-shim');

      // stable table headers when scrolling
      bsTable.stickyTableHeaders({
        scrollableArea: container
      });
    }
  }
});

// embedded shiny app
window.FlexDashboardComponents.push({

  find: function(container) {
    return container.find('iframe.shiny-frame');
  },

  flex: function(fillPage) {
    return fillPage;
  },

  layout: function(title, container, element, fillPage) {
    if (fillPage) {
      element.attr('height', '100%');
    } else {
      // provide default height if necessary
      var height = element.get(0).style.height;
      if (!height)
        height = element.attr('height');
      if (!height)
        element.attr('height', 500);
    }
  }
});

// shiny fillRow or fillCol
window.FlexDashboardComponents.push({

  find: function(container) {
    return container.find('.flexfill-container');
  },

  flex: function(fillPage) {
    return fillPage;
  },

  layout: function(title, container, element, fillPage) {
    if (fillPage)
      element.css('height', '100%');
    else {
      // provide default height if necessary
      var height = element.get(0).style.height;
      if (height === "100%" || height === "auto" || height === "initial" ||
          height === "inherit" || !height) {
        element.css('height', 500);
      }
    }
  }
});

// valueBox
window.FlexDashboardComponents.push({

  type: "custom",

  find: function(container) {
    if (container.find('span.value-output, .shiny-valuebox-output').length)
      return container;
    else
      return $();
  },

  flex: function(fillPage) {
    return false;
  },

  layout: function(title, container, element, fillPage) {

    // alias variables
    var chartTitle = title;
    var valueBox = element;

    // add value-box class to container
    container.addClass('value-box');

    // value paragraph
    var value = $('<p class="value"></p>');

    // if we have shiny-text-output then just move it in
    var valueOutputSpan = [];
    var shinyOutput = valueBox.find('.shiny-valuebox-output').detach();
    if (shinyOutput.length) {
      valueBox.children().remove();
      shinyOutput.html("&mdash;");
      value.append(shinyOutput);
    } else {
      // extract the value (remove leading vector index)
      var chartValue = valueBox.text().trim();
      chartValue = chartValue.replace("[1] ", "");
      valueOutputSpan = valueBox.find('span.value-output').detach();
      valueBox.children().remove();
      value.text(chartValue);
    }

    // caption
    var caption = $('<p class="caption"></p>');
    caption.append(chartTitle);

    // build inner div for value box and add it
    var inner = $('<div class="inner"></div>');
    inner.append(value);
    inner.append(caption);
    valueBox.append(inner);

    // add icon if specified
    var icon = $('<div class="icon"><i></i></div>');
    valueBox.append(icon);
    function setIcon(chartIcon) {
      var iconLib = "";
      var iconSplit = chartIcon.split(" ");
      if (iconSplit.length > 1) {
        iconLib = iconSplit[0];
        chartIcon = iconSplit.slice(1).join(" ");
      } else {
        var components = chartIcon.split("-");
        if (components.length > 1)
          iconLib = components[0];
      }
      icon.children('i').attr('class', iconLib + ' ' + chartIcon);
    }
    var chartIcon = valueBox.attr('data-icon');
    if (chartIcon)
      setIcon(chartIcon);

    // handle data attributes in valueOutputSpan
    function handleValueOutput(valueOutput) {

      // caption
      var dataCaption = valueOutput.attr('data-caption');
      if (dataCaption)
        caption.html(dataCaption);

      // icon
      var dataIcon = valueOutput.attr('data-icon');
      if (dataIcon)
        setIcon(dataIcon);

      // If valueBox(color=) was an accent color, this attr should
      // be populated with the accent color and the relevant CSS comes
      // in through HTML dependencies
      var dataColorAccent = valueOutput.attr('data-color-accent');
      var valueBoxClasses = "value-box-" + (["primary", "info", "danger", "warning", "success"].join(" value-box-"));
      if (dataColorAccent) {
        valueBox.removeClass(valueBoxClasses);
        valueBox.addClass('value-box-' + dataColorAccent);
      }

      // If valueBox(color=) was a CSS color, these other data-color-*
      // attrs will be populated
      var dataColor = valueOutput.attr('data-color');
      if (dataColor) {
        valueBox.removeClass(valueBoxClasses);
        valueBox.css('background-color', dataColor);
      }
      var dataColorText = valueOutput.attr('data-color-text');
      if (dataColorText) {
        valueBox.find(".inner").css('color', dataColorText);
      }
      var dataColorIcon = valueOutput.attr('data-color-icon');
      if (dataColorIcon) {
        valueBox.find(".icon").css('color', dataColorIcon);
      }

      // url
      var dataHref = valueOutput.attr('data-href');
      if (dataHref) {
        valueBox.addClass('linked-value');
        valueBox.off('click.value-box');
        valueBox.on('click.value-box', function(e) {
          window.FlexDashboardUtils.showLinkedValue(dataHref);
        });
      }
    }

    // check for a valueOutputSpan
    if (valueOutputSpan.length > 0) {
      handleValueOutput(valueOutputSpan);
    }

    // if we have a shinyOutput then bind a listener to handle
    // new valueOutputSpan values
    shinyOutput.on('shiny:value',
      function(event) {
        var element = $(event.target);
        setTimeout(function() {
          var valueOutputSpan = element.find('span.value-output');
          if (valueOutputSpan.length > 0)
            handleValueOutput(valueOutputSpan);
        }, 10);
      }
    );
  }
});
