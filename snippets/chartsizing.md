---
title: "Chart Sizing"
output: 
  flexdashboard::flex_dashboard:
    fill_page: true
    orientation: rows
---

Row
-------------------------------------

### Chart 1

```{r, fig.width=10, fig.height=7}
plot(cars)
```

Row
-------------------------------------
    
### Chart 2
    
```{r}
plot(mtcars)
```
    
### Chart 3

```{r}
plot(airmiles)
```
