// Co-Saliency based Palette Generation for multiple multi-class scatterplots

d3.select(".operationDiv").style('pointer-events', "none");

document.querySelector('.instructions-container > div:last-child').onclick = () => {
    document.querySelector('.instructions-container').classList.add('hide')
}

function showHelp() {
    document.querySelector('.instructions-container').classList.remove('hide')
}

if (!getCookie("Palettailor")) {
    setCookie("Palettailor", 1, 30);
    console.log(document.cookie);
    document.querySelector('.instructions-container').classList.remove('hide');
}


function changeSlider(name, value) {
    let label_value = value / 100;
    switch (name) {
        case "slider_0":
            document.getElementById("inputBox_lc").value = value;
            score_importance_weight[0] = label_value;
            break;
        case "slider_1":
            document.getElementById("inputBox_bc").value = value;
            score_importance_weight[1] = label_value;
            break;
        case "slider_2":
            document.getElementById("inputBox_nd").value = value;
            score_importance_weight[2] = label_value;
            break;
        case "slider_3":
            document.getElementById("inputBox_nc").value = value;
            score_importance_weight[3] = label_value;
            break;
        case "inputBox_lc":
            document.getElementById("slider_0").value = value;
            score_importance_weight[0] = label_value;
            break;
        case "inputBox_bc":
            document.getElementById("slider_1").value = value;
            score_importance_weight[1] = label_value;
            break;
        case "inputBox_nd":
            document.getElementById("slider_2").value = value;
            score_importance_weight[2] = label_value;
            break;
        case "inputBox_nc":
            document.getElementById("slider_3").value = value;
            score_importance_weight[3] = label_value;
            break;
        default:
    }
}

function showSlider(name, item) {
    if (d3.select("#" + name).style("display") === 'none') {
        d3.select("#" + name).style("display", "block");
        d3.select(item).style("background-color", "#cccccc");
    } else {
        d3.select("#" + name).style("display", "none");
        d3.select(item).style("background-color", "#f6f6f6");
    }
}

c3.load("../js/lib/c3_data.json");
for (var c = 0; c < c3.color.length; ++c) {
    var x = c3.color[c];
    color_name_map[[x.L, x.a, x.b].join(",")] = c;
}

function addToHistory() {
    let svgs = d3.select("#renderDiv").selectAll("svg");
    if (svgs._groups[0].length > 0) {
        let li = d3.select(".historyList").append("li")
            .attr("data-palette", d3.select("#paletteText").attr('data-palette'))
            .style('cursor', 'pointer')
            .on("click", function () {
                addToHistory();
                let svg = d3.select(this).selectAll("svg");
                svg.each(function () {
                    d3.select(this).attr("width", SVGWIDTH).attr("height", SVGHEIGHT);
                    d3.select("#renderDiv").node().appendChild(d3.select(this).node());
                });
                let rect = d3.select(this).selectAll(".rect");
                rect.each(function () {
                    d3.select(".paletteDiv").node().appendChild(d3.select(this).node());
                });
                d3.select(".paletteDiv").insert("br", ".rect:nth-child(" + (rect._groups[0].length / 2 + 1) + ")")
                d3.select(this).remove();
                var result = d3.select(this),
                    palette = result.attr('data-palette').split(';');
                palette = palette.map(function (c) {
                    return d3.lab(c);
                });
                outputPalette(palette);
                drawTransferFunction(palette)
            });

        // append render result
        let div = li.append("div").attr("class", "screenshot");
        svgs.each(function () {
            d3.select(this).attr("width", 80).attr("height", 80)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + SVGWIDTH + " " + SVGHEIGHT);
            // li.node().appendChild(d3.select(this).node());
            div.node().appendChild(d3.select(this).node());
        });

        d3.select(".paletteDiv").selectAll("br").remove()
        // append palette
        let rects = d3.select(".paletteDiv").selectAll(".rect");
        div = li.append("div").attr("class", "paletteBar");
        if (rects._groups[0].length > 0) {
            rects.each(function () {
                // li.node().appendChild(d3.select(this).node());
                div.node().appendChild(d3.select(this).node());
            });
        }

        // append delete sign
        li.append("div").attr("class", "delete_sign").append("i").attr("class", "icon_trash").style("color", "black").on("click", function () {
            li.remove();
            d3.event.stopPropagation()

        });
    }
}

function collectColorNames() {
    let color_names_checked = [];
    let inputs = d3.select("#color-names-div").selectAll("input");
    inputs.each(function () {
        // console.log(d3.select(this)._groups[0][0].value, d3.select(this)._groups[0][0].checked);
        if (d3.select(this)._groups[0][0].checked) {
            color_names_checked.push(d3.select(this)._groups[0][0].value);
        }
    });
    return color_names_checked;
}

function renderResult() {
    document.querySelector('#running').classList.remove('hide');

    setTimeout(() => {
        let palette;
        //scatterplot
        if (DATATYPE === "SCATTERPLOT") {
            palette = appendScatterplot();
        }

        //bar chart
        if (DATATYPE === "BARCHART") {
            palette = appendBarchart();
        }

        //line chart
        if (DATATYPE === "LINECHART") {
            palette = appendLinechart();
        }

        // draw the palette
        appendPaletteResult(palette);
        data_changed_sign = false;

        document.querySelector('#running').classList.add('hide')
    }, 0);
}

function appendScatterplot() {
    let used_palette = doColorization();

    for (let s = 0; s < source_datasets.length; s++) {
        let scatterplot_svg = d3.select("#renderDiv").append("svg").attr("id", "scatterSvg")
            .attr("width", SVGWIDTH).attr("height", SVGHEIGHT);
        let scatterplot = scatterplot_svg.style("background-color", bgcolor).append("g")
            .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")");
        // draw dots
        let dots = scatterplot.append("g").selectAll(".dot")
            .data(source_datasets[s])
            .enter().append("circle")
            .attr("class", "dot")
            .attr("id", function (d) {
                return "class_" + labelToClass[cValue(d)];
            })
            .attr("r", radius)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .attr("fill", function (d) {
                return used_palette[labelToClass[cValue(d)]];
            })
            .attr("item-color", function (d) {
                return used_palette[labelToClass[cValue(d)]];
            })
            .on("mouseenter", function (d) {
                updateSvg(used_palette, scatterplot, labelToClass[cValue(d)])
            }).on("mouseleave", function () {
                updateSvg(used_palette, scatterplot, -1)
            })
            .on("click", function (d) {
                updateSvg(used_palette, scatterplot, labelToClass[cValue(d)])
                // set status
                d3.select("#tfInfoLabel").select("#icon_lock-" + labelToClass[cValue(d)]).attr("class", "icon_box-checked")
            })
        // add the x Axis
        scatterplot.append("g")
            .attr("transform", "translate(0," + svg_height + ")")
            .call(d3.axisBottom(xScale)); //.tickFormat("")

        // add the y Axis
        scatterplot.append("g")
            .call(d3.axisLeft(yScale)); //.tickFormat("")

        scatterplot_svg.append("text").attr("x", 0).attr("y", 20).text(source_datasets_names[s]);
    }
    return used_palette;
}

function updateSvg(palette, svg, classId) {
    for (let i = 0; i < palette.length / 2; i++) {
        if (classId != i && d3.select("#tfInfoLabel").select("#icon_lock-" + i).attr("class") != "icon_box-checked")
            svg.selectAll("#class_" + i)
                .attr("fill", function () {
                    return palette[i + palette.length / 2];
                })
                .attr("item-color", function () {
                    return palette[i + palette.length / 2];
                })
        else {
            svg.selectAll("#class_" + i)
                .attr("fill", function () {
                    return palette[i];
                })
                .attr("item-color", function () {
                    return palette[i];
                })
                .raise(); // https://stackoverflow.com/questions/24045673/reorder-elements-of-svg-z-index-in-d3-js
        }

    }
}

function appendBarchart() {
    let used_palette = doColorization();
    let barchart_svg = d3.select("#renderDiv").append("svg")
        .attr("width", SVGWIDTH).attr("height", SVGHEIGHT);

    let barchart = barchart_svg.style("background-color", bgcolor)
        .append("g")
        .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")");

    // add the x Axis
    barchart.append("g")
        .attr("transform", "translate(0," + svg_height + ")")
        .call(d3.axisBottom(xScale)); //.tickFormat("")

    // add the y Axis
    barchart.append("g")
        .call(d3.axisLeft(yScale)); //.tickFormat("")

    barchart.selectAll("bars")
        .data(source_datasets)
        .enter().append("rect")
        .attr("class", "bars")
        .attr("id", function (d) {
            return "bar_" + labelToClass[cValue(d)];
        })
        .style("fill", function (d) {
            return used_palette[labelToClass[cValue(d)]];
        })
        .attr("x", function (d) {
            return xScale(cValue(d));
        })
        .attr("width", xScale.bandwidth())
        .attr("y", function (d) {
            return yScale(yValue(d));
        })
        .attr("height", function (d) {
            return svg_height - yScale(yValue(d));
        })
        .attr("rx", 10).attr("ry", 10)
        .attr("item-color", function (d) {
            return used_palette[labelToClass[d.label]];
        })
    // .on("click", appendClickEvent);
    barchart_svg.append("text").attr("x", 0).attr("y", 20).text(source_datasets_names);

    return used_palette;
}

function appendLinechart() {
    let used_palette = doColorization();
    let linechart_svg = d3.select("#renderDiv").append("svg")
        .attr("width", SVGWIDTH).attr("height", SVGHEIGHT);

    let linechart = linechart_svg.style("background-color", bgcolor)
        .append("g")
        .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")");

    // Scale the range of the data
    xScale.domain(d3.extent(source_datasets, function (d) {
        return d.x;
    }));
    // define the line
    let valueline = d3.line()
        .x(function (d) {
            return xScale(d.x);
        })
        .y(function (d) {
            return yScale(d.y);
        }).curve(d3.curveCatmullRom);

    let linechart_source_data = [],
        tmp_keys = [],
        count = 0;
    for (let point of source_datasets) {
        if (tmp_keys[labelToClass[point.label]] == undefined) {
            tmp_keys[labelToClass[point.label]] = count++;
            linechart_source_data[tmp_keys[labelToClass[point.label]]] = { p: [], label: point.label };
        }
        linechart_source_data[tmp_keys[labelToClass[point.label]]].p.push({ x: point.x, y: point.y });
    }

    // Add the valueline path.
    linechart.selectAll('path')
        .data(linechart_source_data).enter().append("path")
        .attr("d", function (d) {
            return valueline(d.p);
        })
        .attr("class", "linechart")
        .attr("id", function (d) {
            return "line_" + labelToClass[d.label];
        })
        .attr("fill", "none")
        .attr("stroke", function (d) {
            return used_palette[labelToClass[d.label]];
        })
        .style("stroke-width", radius)
        .attr("item-color", function (d) {
            return used_palette[labelToClass[d.label]];
        })
    // .on("click", appendClickEvent);

    // Add the X Axis
    linechart.append("g")
        .attr("transform", "translate(0," + svg_height + ")")
        .call(d3.axisBottom(xScale)); //.tickFormat("")

    // Add the Y Axis
    linechart.append("g")
        .call(d3.axisLeft(yScale)); //.tickFormat("")

    linechart_svg.append("text").attr("x", 0).attr("y", 20).text(source_datasets_names);
    return used_palette;
}

function appendPaletteResult(palette) {
    let palette_results_div = d3.select(".paletteDiv");
    let palette_size = palette.length / 2
    for (let i = 0; i < palette.length; i++) {
        if (i === palette_size) {
            palette_results_div.append("br")
        }
        // assemble a color
        let color = d3.rgb(palette[i]);
        let c = getColorNameIndex(color);
        // write the color name
        let t = c3.color.relatedTerms(c, 1);
        let span = palette_results_div.append("span").attr("class", "rect")
            .attr("id", function () {
                if (i < palette_size) {
                    return "highlighted_rect"
                } else {
                    return "dehighlighted_rect"
                }
            })
            .style("width", "30px").style("height", "30px").style("display", "inline-block")
            .style("margin-left", "10px").style("background", palette[i]).attr("color", palette[i])
            .style("text-align", "center").style("padding", "5px")
            .attr("title", function () {
                if (t[0] === undefined) return "no name";
                return c3.terms[t[0].index];
            });
        if (i >= palette_size) continue
        // append lock and unlock sign
        let img = span.append("img").attr("class", "icon_unlock").style("display", "none").attr("isLocked", "0")
            .on("click", function () {
                if (d3.select(this).attr("class") === "icon_lock")
                    d3.select(this).attr("class", "icon_unlock").attr("isLocked", "0").style("display", "none")
                else
                    d3.select(this).attr("class", "icon_lock").attr("isLocked", "1").style("display", "block")
            });
        if (locked_pos.indexOf(i) != -1) {
            img.attr("class", "icon_lock").style("display", "block").attr("isLocked", "1")
        }
        span.on("mouseover", function () {
            d3.select(this).select("img").style("display", "block");
        })
            .on("mouseout", function () {
                if (d3.select(this).select("img").attr("class") === "icon_unlock")
                    d3.select(this).select("img").style("display", "none")
            })
    }
    outputPalette(palette);
}

function outputPalette(palette) {
    //output the palette
    var format = resultsColorSpace,
        paletteStr = "[",
        data_palette_attr = "";
    for (let i = 0; i < palette.length - 1; i++) {
        paletteStr += "" + colorConversionFns[format](palette[i]) + ",";
        data_palette_attr += palette[i] + ";";
    }
    paletteStr += "" + colorConversionFns[format](palette[palette.length - 1]) + "]";
    data_palette_attr += palette[palette.length - 1];
    d3.select("#paletteText").property('value', paletteStr).attr('data-palette', data_palette_attr);
}

$('.resultFnt').change(function () {
    resultsColorSpace = $(this).children("option:selected").text();
    var format = resultsColorSpace;
    var result = d3.select("#paletteText"),
        palette = result.attr('data-palette').split(';');

    palette = palette.map(function (c) {
        return d3.lab(c);
    });

    paletteStr = '[' + resultsQuote +
        palette.map(colorConversionFns[format])
            .join(resultsQuote + ', ' + resultsQuote) +
        resultsQuote + ']';
    result.property('value', paletteStr);
});

function changeBgcolor() {
    let bg_icon = d3.select("#bg_icon");
    if (bg_icon.attr("class") === "icon_black_bg") {
        bg_icon.attr("class", "icon_white_bg");
        bgcolor = "#000";
        renderResult();
    } else {
        bg_icon.attr("class", "icon_black_bg");
        bgcolor = "#fff";
        renderResult();
    }
}

function saMode(mode) {
    if (mode === 0) {
        d3.select("#effi_icon").attr("class", "icon_efficiency_choosed");
        d3.select("#qual_icon").attr("class", "icon_quality");
        decline_rate = decline_rate_efficiency;
    } else {
        d3.select("#effi_icon").attr("class", "icon_efficiency");
        d3.select("#qual_icon").attr("class", "icon_quality_choosed");
        decline_rate = decline_rate_quality;
    }
}

function drawTransferFunction(palette) {

    let x_labels = Object.keys(labelToClass)

    // draw information table
    var dataForm = "";
    for (let i = 0; i < x_labels.length; i++) {
        let id = labelToClass[x_labels[i]]
        let c = getColorNameIndex(d3.rgb(palette[id])),
            t = c3.color.relatedTerms(c, 1);
        let color_name = "undefined"
        if (t[0] != undefined) {
            color_name = c3.terms[t[0].index]
        }
        dataForm += ("<tr><td><span class=\'icon_box-empty\' classId=\'" + labelToClass[x_labels[i]] + "\' id=\'icon_lock-" + labelToClass[x_labels[i]] + "\' style=\'display:inline-block;\' onclick=\'lockThisRect(this);\'></span>" +
            "</td><td>" +
            "<span class=\'tf_rect\' classId=\'" + labelToClass[x_labels[i]] + "\' style=\'background:" + palette[id] + ";\' onclick=\'lockThisRect(this);\'></span>" +
            "</td><td>" +
            x_labels[i] +
            "</td><td>" +
            color_name +
            "</td><td>" +
            colorConversionFns['Hex'](palette[id]) +
            "</td></tr>");
    }
    document.getElementById("tfInfoLabel").innerHTML = dataForm;
}

function lockThisRect(item) {
    let palette = []
    let spans = d3.select(".paletteDiv").selectAll("span");
    spans.each(function () {
        palette.push(d3.rgb(d3.select(this).attr("color")))
    });

    let choosed_id = +d3.select(item).attr("classId")
    if (d3.select("#icon_lock-" + choosed_id).attr("class") === "icon_box-empty") {
        d3.select("#icon_lock-" + choosed_id).attr("class", "icon_box-checked")
        updateSvg(palette, d3.select("#scatterSvg"), choosed_id)
    }
    else {
        d3.select("#icon_lock-" + choosed_id).attr("class", "icon_box-empty")
        updateSvg(palette, d3.select("#scatterSvg"), -1)
    }
}
