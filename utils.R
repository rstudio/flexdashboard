
library(htmltools)

thumbnail <- function(title, img, href, caption = TRUE) {
  div(class = "col-sm-4",
      a(class = "thumbnail", title = title, href = href,
        img(src = img),
        div(class = ifelse(caption, "caption", ""),
          ifelse(caption, title, "")
        )
      )
  )
}

thumbnails <- function(...) {
  
  # capture arguments and setup rows to return
  thumbs <- list(...)
  numThumbs <- length(thumbs)
  fullRows <- numThumbs / 3
  rows <- tagList()
  
  # add a row of thumbnails
  addRow <- function(first, last) {
    rows <<- tagAppendChild(rows, div(class = "row", thumbs[first:last]))
  }
  
  # handle full rows
  for (i in 1:fullRows) {
    last <- i * 3
    first <- last-2
    addRow(first, last)
  }
  
  # check for leftovers
  leftover <- numThumbs %% 3
  if (leftover > 0) {
    last <- numThumbs
    first <- last - leftover + 1
    addRow(first, last)
  }
  
  # return the rows!
  rows
}

showcaseThumbnails <- function(caption = TRUE) {
  thumbnails(
    thumbnail(
      title = "NBA scoring with d3heatmap",
      img = "images/htmlwidgets-d3heatmap.png",
      href = "https://beta.rstudioconnect.com/jjallaire/htmlwidgets-d3heatmap/",
      caption = caption
    ),
    thumbnail(
      title = "Linked time-series with dygraphs",
      img = "images/dygraphs.png",
      href = "https://beta.rstudioconnect.com/jjallaire/htmlwidgets-dygraphs/",
      caption = caption
    ),
    thumbnail(
      title = "Interactive ggplot2 with plotly",
      img = "images/plotly.png",
      href = "https://beta.rstudioconnect.com/jjallaire/htmlwidgets-plotly/",
      caption = caption
    )
  )
}

