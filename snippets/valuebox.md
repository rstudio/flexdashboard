Row
-----------------------------------------------------------------------

### Articles per Day {.value-box}

```{r}
articles <- computeArticles()
valueBox(articles, icon = "fa-pencil")
```

### Comments per Day {.value-box}

```{r}
comments <- computeComments()
valueBox(comments, icon = "fa-comments")
```

### Spam per Day {.value-box}

```{r}
spam <- computeSpam()
valueBox(spam, 
         icon = "fa-trash",
         color = ifelse(spam > 10, "warning", "primary"))
```
