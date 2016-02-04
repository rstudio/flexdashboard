
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
    columns.each(function() {

      // get a reference to the h3 and discover it's inner html
      var h3 = $(this).children('h3').first();
      var chartTitle = h3.html();

      // remove the h3
      h3.remove();




    });

  });

});


/*
<div class="row">
  <div class="col-sm-6">
    <div class="chart-wrapper">
      <div class="chart-title">
      Pageviews by browser (past 24 hours)
      </div>

      <div class="chart-stage">
      </div>

      <div class="chart-notes">
      This is a sample text region to describe this chart.
      </div>
  </div>
</div>

*/
