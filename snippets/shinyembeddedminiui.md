```{r}
shinyApp(
  ui = miniPage(
    miniButtonBlock({
      selectInput("region", "Region:", choices = colnames(WorldPhones))
    }),
    miniContentPanel({
      plotOutput("phonePlot", height = "100%")
    })
  ),
  server = function(input, output) {
    output$phonePlot <- renderPlot({
      barplot(WorldPhones[,input$region]*1000, 
              ylab = "Number of Telephones", xlab = "Year")
    })
  },
  options = list(height = "100%")
)
```