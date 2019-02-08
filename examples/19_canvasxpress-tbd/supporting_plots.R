# ----------------------
# Plot Related Functions
#-----------------------

# shared variables
logRatioCol          <- "logFC"
logIntCol            <- "AveExpr"
axisAlgorithm        <- "wilkinsonExtended"
backgroundType       <- "window"
sizes                <- c(10, 10, 4, 10, 12, 14, 16, 18, 20, 22, 24, 26)
plot_colors          <- c("rgba(0,104,139,0.5)", "rgba(205,0,0,0.5)", "rgba(64,64,64,0.5)")
backgroundColor      <- "lightgrey"
tickColor            <- "white"
legendBoxColor       <- "black"
fontName             <- "Arial"
sizeByShowLegend     <- FALSE
titleScaleFontFactor <- 0.5
axisScaleFontFactor  <- 1.8

profilePlot <- function(df, title = NULL) {

    ## create CanvasXpress data
    cx <- data.frame(a = round(df[colnames(df) == logIntCol], digits = 2),
                     b = round(df[colnames(df) == logRatioCol], digits = 2))
    va <- data.frame(Group      = df$Group,
                     nLog10pVal = df$NegativeLogP)
    rownames(va) <- rownames(cx)

    ## CanvasXpress Plot
    canvasXpress(
        data                     = cx,
        varAnnot                 = va,
        graphType                = "Scatter2D",
        axisAlgorithm            = axisAlgorithm,
        backgroundType           = backgroundType,
        backgroundWindow         = backgroundColor,
        colorBy                  = "Group",
        colors                   = plot_colors,
        legendBackgroundColor    = backgroundColor,
        legendBoxColor           = legendBoxColor,
        legendInside             = TRUE,
        legendPosition           = "bottomRight",
        showLoessFit             = TRUE,
        loessColor               = "darkgoldenrod1",
        sizeBy                   = "Group",
        sizes                    = sizes,
        sizeByShowLegend         = sizeByShowLegend,
        title                    = title,
        titleScaleFontFactor     = titleScaleFontFactor,
        fontName                 = fontName,
        xAxis                    = list(logIntCol),
        xAxisTickColor           = tickColor,
        xAxisTitle               = logIntCol,
        yAxis                    = list(logRatioCol),
        yAxisTickColor           = tickColor,
        yAxisTitle               = logRatioCol,
        axisTitleScaleFontFactor = axisScaleFontFactor
    )
}

volcanoPlot <- function(df, title = NULL) {

    ## create CanvasXpress data
    cx <- data.frame(a = round(df[colnames(df) == logRatioCol], digits = 2),
                     b = round(df$NegativeLogP, digits = 2))
    colnames(cx) = c(logRatioCol, "NegativeLogP")
    va <- data.frame(Group  = df$Group,
                     LogInt = round(df[[logIntCol]], digits = 2))
    rownames(va) <- rownames(cx)

    ## CanvasXpress Plot
    canvasXpress(
        data                     = cx,
        varAnnot                 = va,
        graphType                = "Scatter2D",
        axisAlgorithm            = axisAlgorithm,
        backgroundType           = backgroundType,
        backgroundWindow         = backgroundColor,
        colorBy                  = "Group",
        colors                   = plot_colors,
        legendBackgroundColor    = backgroundColor,
        legendBoxColor           = legendBoxColor,
        legendInside             = FALSE,
        legendPosition           = "right",
        sizeBy                   = "Group",
        sizes                    = sizes,
        sizeByShowLegend         = sizeByShowLegend,
        title                    = title,
        titleScaleFontFactor     = titleScaleFontFactor,
        fontName                 = fontName,
        xAxis                    = c(logRatioCol, ""),
        xAxisTickColor           = tickColor,
        xAxisTitle               = logRatioCol,
        yAxis                    = c("NegativeLogP", ""),
        yAxisTickColor           = tickColor,
        yAxisTitle               = "-log10(P.Value)",
        axisTitleScaleFontFactor = axisScaleFontFactor
    )
}

heatmapPlot <- function(df, smpAnnot = FALSE, title = NULL) {
    canvasXpress(
        data                     = df,
        smpAnnot                 = smpAnnot,
        graphType                = "Heatmap",
        smpOverlays              = list("Group"),
        smpOverlayProperties     = list(Group = list(thickness = 60, color = "Set1")),
        overlayScaleFontFactor   = 1.4,
        showSampleNames          = FALSE,
        sortSampleByCategory     = list("Group"),
        heatmapSmpSeparateBy     = "Group",
        variablesClustered       = TRUE,
        axisAlgorithm            = axisAlgorithm,
        showVarDendrogram        = FALSE,
        heatmapIndicatorPosition = "right",
        colorSpectrum            = c("navy", "white", "firebrick3"),
        title                    = title,
        broadcast                = FALSE,
        fontName                 = fontName
    )
}

genePlot <- function(df, block, title = NULL) {
    smpAnnot           <- data.frame(Group = block)
    rownames(smpAnnot) <- rownames(t(df))
    varAnnot           <- data.frame(Gene = rownames(df))
    rownames(varAnnot) <- rownames(df)

    if (length(rownames(varAnnot)) > 4) {
        heatmapPlot(df, smpAnnot, title = title)
    } else {
        canvasXpress(
            data                     = df,
            smpAnnot                 = smpAnnot,
            varAnnot                 = varAnnot,
            graphType                = "Boxplot",
            graphOrientation         = "vertical",
            backgroundWindow         = "lightgrey",
            backgroundType           = backgroundType,
            legendBoxColor           = legendBoxColor,
            legendBackgroundColor    = backgroundColor,
            groupingFactors          = c("Group"),
            segregateVariablesBy     = list("Gene"),
            colors                   = rep("deepskyblue3", 4),
            title                    = "Top Fold Changes Genes",
            titleScaleFontFactor     = 0.4,
            xAxisTitle               = "Log2CPM",
            axisTitleScaleFontFactor = 1.8,
            smpHairline              = TRUE,
            smpHairlineColor         = "white",
            smpHairlineWidth         = 1,
            xAxisTickColor           = tickColor,
            smpTitle                 = "Group",
            smpTitleScaleFontFactor  = 0.5,
            xAxis2Show               = FALSE,
            axisAlgorithm            = axisAlgorithm,
            showLegend               = FALSE,
            layoutBoxShow            = FALSE,
            smpLabelRotate           = 50,
            smpLabelScaleFontFactor  = 0.5,
            xAxisMinorTicks          = FALSE,
            fontName                 = fontName,
            boxplotMedianWidth       = 2,
            boxplotMedianColor       = "dodgerblue4",
            boxplotMean              = TRUE,
            marginLeft               = 30,
            broadcast                = FALSE
        )
    }
}
