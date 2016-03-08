
library(htmltools)

thumbnail <- function(title, img, href) {
  div(class = "col-md-4",
      a(class = "thumbnail", title = title, href = href,
        img(src = img)
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

showcaseThumbnails <- function() {
  thumbnails(
    thumbnail(
      title = "flexdashboard with d3heatmap",
      img = "images/htmlwidgets-d3heatmap.png",
      href = "https://rstudio-pubs-static.s3.amazonaws.com/157935_0569d3a4ecb744b78281848dfdade055.html"
    ),
    thumbnail(
      title = "flexdashboard with dygraphs",
      img = "images/dygraphs.png",
      href = "https://rstudio-pubs-static.s3.amazonaws.com/157936_b8de6c18b00240c6a42785ce8a1a1fdc.html"
    ),
    thumbnail(
      title = "flexdashboard with plotly",
      img = "images/plotly.png",
      href = "https://rstudio-pubs-static.s3.amazonaws.com/157937_dc7c4031822441a88a05277d38f34f0e.html"
    )
  )
}