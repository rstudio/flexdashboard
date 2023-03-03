# figure size knitr options are written into the document

    Code
      cat(test_lines, sep = "\n")
    Output
      <div id="column-1" class="section level2">
      <h2>Column 1</h2>
      <div id="a-wide-plot" class="section level3">
      <h3>A wide plot</h3>
      <div class="knitr-options" data-fig-width="960" data-fig-height="480">
      </div>
      <p><img src="data:image/png;base64,..." width="960" data-figure-id="fig1" /></p>
      </div>
      <div id="a-tall-plot" class="section level3">
      <h3>A tall plot</h3>
      <div class="knitr-options" data-fig-width="480" data-fig-height="960">
      </div>
      <p><img src="data:image/png;base64,..." width="480" data-figure-id="fig2" /></p>

