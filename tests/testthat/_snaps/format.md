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
      </div>
      </div>
      <div id="column-2" class="section level2">
      <h2>Column 2</h2>
      <div id="dpi-retina-1" class="section level3">
      <h3>75 DPI, Retina 1</h3>
      <div class="knitr-options" data-fig-width="480" data-fig-height="480">
      </div>
      <p><img src="data:image/png;base64,..." data-figure-id="fig3" /></p>
      </div>
      <div id="dpi-retina-1-1" class="section level3">
      <h3>150 DPI, Retina 1</h3>
      <div class="knitr-options" data-fig-width="480" data-fig-height="480">
      </div>
      <p><img src="data:image/png;base64,..." data-figure-id="fig4" /></p>
      </div>
      <div id="dpi-retina-2" class="section level3">
      <h3>75 DPI, Retina 2</h3>
      <div class="knitr-options" data-fig-width="480" data-fig-height="480">
      </div>
      <p><img src="data:image/png;base64,..." width="375" data-figure-id="fig5" /></p>

