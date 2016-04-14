```{r}
shinyApp(
  ui = fluidPage(
    selectInput("region", "Region:", choices = colnames(WorldPhones)),
    plotOutput("phonePlot")
  ),
  server = function(input, output) {
    output$phonePlot <- renderPlot({
      barplot(WorldPhones[,input$region]*1000, 
              ylab = "Number of Telephones", xlab = "Year")
    }, height = 500)
  },
  options = list(height = 600)
)
```