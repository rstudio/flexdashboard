
### Articles per Day {.value-box data-icon="fa-pencil"}

```{r}
renderValueBox({
  articles <- computeArticles(input$types)
  valueBox(articles, color = ifelse(articles > 100, "success", "info"))
})
```
