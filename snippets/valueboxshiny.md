
### Articles per Day {.value-box data-icon="fa-pencil"}

```{r}
articles <- computeArticles()
renderValueBox({
  valueBox(articles, color = ifelse(articles > 100, "success", "info"))
})
```
