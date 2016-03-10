
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
  thumbs <- list(...)
  numRows <- length(thumbs) / 3
  rows <- list()
  for (i in 1:numRows) {
    lastIndex <- i * 3
    rows <- append(rows, list(div(class = "row",
                                  thumbs[[lastIndex-2]],
                                  thumbs[[lastIndex-1]],
                                  thumbs[[lastIndex]]
    )))
  }
  leftover <- length(thumbs) %% 3
  if (leftover > 0) {
    if (leftover == 1) {
      rows <- append(rows, list(div(class = "row",
                                    thumbs[[length(thumbs)]]                         
      )))
    } else if (leftover == 2) {
      rows <- append(rows, list(div(class = "row",
                                    thumbs[[length(thumbs)-1]],
                                    thumbs[[length(thumbs)]] 
      )))
    }
  }
  tagList(rows)
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