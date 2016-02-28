---
title: "Text Annotations"
output:
  flexdashboard::flex_dashboard:
    orientation: rows
    vertical_layout: fill
---

Monthly deaths from bronchitis, emphysema and asthma in the UK, 1974–1979.

```{r setup, include=FALSE}
library(dygraphs)
```

Row {data-height=600}
-------------------------------------

### All Lung Deaths

```{r}
dygraph(ldeaths)
```

Source: P. J. Diggle (1990) Time Series: A Biostatistical Introduction. Oxford, table A.3    

Row {data-height=400}
-------------------------------------

### Male Deaths

```{r}
dygraph(mdeaths)
```

Note: Includes only male deaths

### Female Deaths

```{r}
dygraph(mdeaths)
```

Note: Includes only female deaths
