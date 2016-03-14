Row
-----------------------------------------------------------------------

### Articles per Day {.value-box data-icon="fa-pencil"}

```{r}
valueBox(computeArticles())
```


### Comments per Day {.value-box data-icon="fa-comments"}

```{r}
valueBox(computeComments())
```

### Spam per Day {.value-box data-icon="fa-trash"}

```{r}
spam <- computeSpam()
valueBox(spam, color = ifelse(spam > 10, "warning", "primary"))
```
