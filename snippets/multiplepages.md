---
title: "Multiple Pages"
output: 
  flexdashboard::flex_dashboard:
    fill_page: true
    orientation: columns
---

Page 1
=====================================  
    
Column
-------------------------------------
    
### Chart 1
    
```{r, fig.width = 10, fig.height=5}
plot(cars)
```
    
### Chart 2

```{r, fig.width = 10, fig.height=5}
plot(pressure)
```
   
Page 2 {data-orientation=rows}
=====================================     
   
Row
-------------------------------------
    
### Chart 1
    
```{r, fig.width=5, fig.height=10}
plot(mtcars)
```
    
### Chart 2

```{r, fig.width=5, fig.height=10}
plot(airmiles)
```
