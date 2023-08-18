
function drawHistogram(histData, colorObj, divObj) {
    let used_color = colorObj.palette, used_order = colorObj.order

    // draw the corresponding data
    let traditionalSvg = divObj.append("svg").attr("width", SVGWIDTH)
        .attr("height", SVGHEIGHT)
        .style("background-color", "rgba(" + background_color.join(",") + ")")
        .on("dblclick", function () {
            // let svgEl = traditionalSvg._groups[0][0];
            // // let svgEl = document.getElementById(svgId);
            // svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            // var svgData = svgEl.outerHTML;
            // var preface = '<?xml version="1.0" standalone="no"?>\r\n';
            // var svgBlob = new Blob([preface, svgData], {
            //     type: "image/svg+xml;charset=utf-8"
            // });
            // // console.log(svgBlob);
            // var svgUrl = URL.createObjectURL(svgBlob);
            // var downloadLink = document.createElement("a");
            // downloadLink.href = svgUrl;
            // downloadLink.download = "result.svg";
            // downloadLink.click();
            // URL.revokeObjectURL(svgUrl);

            svg2Png(traditionalSvg, divObj)
        })
    // .style("margin-left", "20px")//.style("border", "1px solid #444444");
    let tmp = traditionalSvg.append("g")
        .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")")

    for (let m = 0; m < histData.length; m++) {
        for (let n = 0; n < histData[used_order[m]].length; n++) {
            tmp.append("rect")
                .attr("class", "bar")
                .attr("id", "hist-" + m)
                // .attr("fill", "rgba(" + colors[+used_color[m]].join(',') + "," + opacities[m] + ")")
                .attr("fill", "rgba(" + used_color[used_order[m]].join(',') + ")")
                .attr("x", n * axis_x_bandwidth)
                .attr("width", axis_x_bandwidth)
                .attr("y", axis_y(histData[used_order[m]][n]))
                .attr("height", svg_height - axis_y(histData[used_order[m]][n]))
        }
    }
    return traditionalSvg
}

function drawParallelCoordinates(histData, colorObj, divObj) {
    // console.log(histData, colorObj, divObj);
    let used_color = colorObj.palette, used_order = colorObj.order
    const curve = d3.line().curve(d3.curveLinear);
    let svg = divObj.append("svg")
        .attr("width", SVGWIDTH)
        .attr("height", SVGHEIGHT)
        .style("background-color", "rgba(" + background_color.join(",") + ")")//.style("margin-left", "10px")
        .on("dblclick", function () {
            svg2Png(svg, divObj)
        })

    let standard_result_svg_group = svg.append("g")
        .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")")

    let case_data = histData
    let case_data_arr = []
    for (let j = 0; j < case_data.length; j++) {
        case_data_arr[j] = []
        let end_point = parseInt(case_data[j].length / 2)
        for (let i = 0; i < case_data[j].length; i++) {
            if (i === 0 || i === end_point) {
                case_data_arr[j].push([case_data[j][i][0], case_data[j][i][1]])
            } else if (i < end_point) {
                let data = getBezierPoints(10, case_data[j][i - 1], [(case_data[j][i - 1][0] + case_data[j][i][0]) / 2, 0.9 * ((case_data[j][i - 1][1] + case_data[j][i][1]) / 2 - 0.2)], case_data[j][i])
                for (let d of data) {
                    case_data_arr[j].push(d)
                }
            } else {
                let data = getBezierPoints(10, case_data[j][i - 1], [(case_data[j][i - 1][0] + case_data[j][i][0]) / 2, ((case_data[j][i - 1][1] + case_data[j][i][1]) / 2 + 0.2)], case_data[j][i])
                for (let d of data) {
                    case_data_arr[j].push(d)
                }
            }
        }
    }

    // draw X axis
    // console.log(axis_x_values);
    for (let i of axis_x_values.keys()) {
        // console.log(i);
        standard_result_svg_group.append("line")
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("x1", axis_x(i))
            .attr("y1", axis_y(0))
            .attr("x2", axis_x(i))
            .attr("y2", axis_y(1));
    }
    standard_result_svg_group.selectAll("path")
        .data(case_data_arr).enter()
        .append('path')
        .attr("d", function (d) {
            let p = d.map(function (v) {
                return [axis_x(v[0]), axis_y(v[1])];
            })
            return curve(p);
        })
        .attr("fill", function (d, i) {
            return "rgba(" + used_color[used_order[i]].join(",") + ")"
        })
}


function drawConvexHull(histData, colorObj, divObj) {
    console.log(histData, colorObj, divObj);
    let used_color = colorObj.palette, used_order = colorObj.order
    const curve = d3.line().curve(d3.curveLinear);
    let svg = divObj.append("svg")
        .attr("width", SVGWIDTH)
        .attr("height", SVGHEIGHT)
        .style("background-color", "rgba(" + background_color.join(",") + ")").style("margin-left", "10px")
        .on("dblclick", function () {
            svg2Png(svg, divObj)
        })

    let standard_result_svg_group = svg.append("g")
        .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")")

    standard_result_svg_group.selectAll("path")
        .data(histData).enter()
        .append('path')
        .attr("d", function (d) {
            let p = d.map(function (v) {
                return [axis_x(v[0]), axis_y(v[1])];
            })
            return curve(p);
        })
        .attr("fill", function (d, i) {
            return "rgba(" + used_color[used_order[i]].join(",") + ")"
        })
}

function putImageData(ctx, imageData, img_data) {
    var height = imageData.height;
    var width = imageData.width;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var pos = y * width + x;
            ctx.fillStyle = 'rgba(' + img_data[pos * 4 + 0] +
                ',' + img_data[pos * 4 + 1] +
                ',' + img_data[pos * 4 + 2] +
                ',' + (img_data[pos * 4 + 3] / 255) + ')';
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function renderingPixels(palette, divObj, renderInSame = false) {
    let canvas_id = "rendering_canvas"
    if (renderInSame && d3.select("#" + canvas_id)._groups[0] == 0) {
        divObj.append("canvas").attr("id", canvas_id)
            .attr("width", SVGWIDTH).attr("height", SVGHEIGHT).style("margin-left", "10px")
    } else {
        canvas_id = "rendering_canvas-" + canvas_id_global_count
        canvas_id_global_count++
        divObj.append("canvas").attr("id", canvas_id)
            .attr("width", SVGWIDTH).attr("height", SVGHEIGHT).style("margin-left", "10px")
    }

    //get pixels image
    let context = document.getElementById(canvas_id).getContext('2d');
    let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    let img_data = new Array(imgData.width * imgData.height * 4)

    //traverse the image data
    let index, color_new;
    for (let i = 0; i < imgData.height; i++) {
        for (let j = 0; j < imgData.width; j++) {
            index = i * imgData.width + j;
            let x = j,
                y = i
            if (global_pixels_arr[y] != undefined && global_pixels_arr[y][x] != undefined) {
                color_new = palette[global_pixels_arr[y][x]]
                if (global_axis_pixels[y] != undefined && global_axis_pixels[y][x] != undefined) {
                    color_new = global_axis_colors[global_pixels_arr[y][x]]
                }
            } else {
                color_new = background_color
            }

            img_data[index * 4] = color_new[0]
            img_data[index * 4 + 1] = color_new[1]
            img_data[index * 4 + 2] = color_new[2]
            img_data[index * 4 + 3] = color_new[3] * 255

        }
    }

    // draw the image onto the canvas
    putImageData(context, imgData, img_data);
}


function showOptimizedColors(palette, divObj) {
    let div = divObj.append("div").style("display", "inline-block").style("width", "200px").style("margin-left", "5px").style("text-align", "left").style("vertical-align", "top")
    let info_div = div.append("div").style("display", "inline-block")
    info_div.append("h2")
        .text("Input Colors:")
    for (let i = 0; i < palette.length; i++) {
        info_div.append("span")
            .style("width", "30px").style("height", "30px").style("display", "inline-block")
            .style("margin-left", "10px").style("background", "rgba(" + palette[i].join(",") + ")")
        info_div.append("span").style("display", "inline-block")
            .text("rgba( " + (palette[i].slice(0, 3)).map(d => d.toFixed(0)).join(", ") + ", " + palette[i][3].toFixed(2) + " )").style("vertical-align", "top").style("margin-left", "10px")
        info_div.append("br")
    }
}