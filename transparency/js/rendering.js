
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

    let case_data = transferToBezierCurve(histData)
    // for (let j = 0; j < case_data.length; j++) {
    //     case_data_arr[j] = []
    //     let end_point = parseInt(case_data[j].length / 2)
    //     for (let i = 0; i < case_data[j].length; i++) {
    //         if (i === 0 || i === end_point) {
    //             case_data_arr[j].push([case_data[j][i][0], case_data[j][i][1]])
    //         } else if (i < end_point) {
    //             let data = getBezierPoints(10, case_data[j][i - 1], [(case_data[j][i - 1][0] + case_data[j][i][0]) / 2, 0.9 * ((case_data[j][i - 1][1] + case_data[j][i][1]) / 2 - 0.2)], case_data[j][i])
    //             for (let d of data) {
    //                 case_data_arr[j].push(d)
    //             }
    //         } else {
    //             let data = getBezierPoints(10, case_data[j][i - 1], [(case_data[j][i - 1][0] + case_data[j][i][0]) / 2, ((case_data[j][i - 1][1] + case_data[j][i][1]) / 2 + 0.2)], case_data[j][i])
    //             for (let d of data) {
    //                 case_data_arr[j].push(d)
    //             }
    //         }
    //     }

    //     case_data_arr[j].push([case_data[j][0][0], case_data[j][0][1]])
    // }

    // draw X axis
    // console.log(axis_x_values);
    for (let i of axis_x_values.keys()) {
        // console.log(i);
        // standard_result_svg_group.append("line")
        //     .style("stroke", "black")
        //     .style("stroke-width", 1)
        //     .attr("x1", axis_x(i))
        //     .attr("y1", axis_y(0))
        //     .attr("x2", axis_x(i))
        //     .attr("y2", axis_y(1));
        standard_result_svg_group.append("line")
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("x1", axis_x(i))
            .attr("y1", axis_y(axis_y.domain()[0]))
            .attr("x2", axis_x(i))
            .attr("y2", axis_y(axis_y.domain()[1]));
    }
    standard_result_svg_group.selectAll("path")
        .data(case_data).enter()
        .append('path')
        .attr("d", function (d) {
            let p = d.map(function (v) {
                return [axis_x(v[0]), axis_y(v[1])];
            })
            return curve(p);
        })
        // .attr("fill", function (d, i) {
        //     return "rgba(" + used_color[used_order[i]].join(",") + ")"
        // })
        .style("stroke", function (d, i) {
            return "rgba(" + used_color[used_order[i]].slice(0, 3).join(',') + "," + 1 + ")"
        })
        .style("stroke-width", 2)
        .style("fill", "none")
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
            p.push([axis_x(d[0][0]), axis_y(d[0][1])])
            return curve(p);
        })
        // .attr("fill", function (d, i) {
        //     return "rgba(" + used_color[used_order[i]].join(",") + ")"
        // })
        .style("stroke", function (d, i) {
            return "rgba(" + used_color[used_order[i]].slice(0, 3).join(',') + "," + 1 + ")"
        })
        .style("stroke-width", 2)
        .style("fill", "none")
}

function drawVennDiagrams(histData, colorObj, divObj) {
    let used_color = colorObj.palette, used_order = colorObj.order

    // draw the corresponding data
    let traditionalSvg = divObj.append("svg").attr("width", SVGWIDTH)
        .attr("height", SVGHEIGHT)
        .style("background-color", "rgba(" + background_color.join(",") + ")")
        .on("dblclick", function () {
            svg2Png(traditionalSvg, divObj)
        })
    // .style("margin-left", "20px")//.style("border", "1px solid #444444");
    let tmp = traditionalSvg.append("g")
    // .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")")
    for (let m = 0; m < histData.length; m++) {
        tmp.append("ellipse")
            .attr("id", "ellipse-" + i)
            // .attr("fill", "rgba(" + used_color[used_order[m]].join(',') + ")")
            .attr("cx", histData[used_order[m]][0])
            .attr("cy", histData[used_order[m]][1])
            .attr("rx", histData[used_order[m]][2])
            .attr("ry", histData[used_order[m]][3])
            .attr("transform", `rotate(${histData[used_order[m]][4]}, ${histData[used_order[m]][0]}, ${histData[used_order[m]][1]})`)
            .style("stroke", "rgba(" + used_color[used_order[m]].slice(0, 3).join(',') + "," + 1 + ")")
            .style("stroke-width", 2)
            .style("fill", "none")
    }
    return traditionalSvg
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
                if (global_axis_pixels[y] != undefined && global_axis_pixels[y][x] != undefined) {
                    // console.log(y, x);
                    color_new = [0, 0, 0, 1]
                }
            }
            // if (global_axis_pixels[y] != undefined && global_axis_pixels[y][x] != undefined) {
            //     color_new = global_axis_pixels[y][x]
            // }else{
            //     color_new = background_color
            // }

            img_data[index * 4] = color_new[0]
            img_data[index * 4 + 1] = color_new[1]
            img_data[index * 4 + 2] = color_new[2]
            img_data[index * 4 + 3] = color_new[3] * 255

        }
    }

    // draw the image onto the canvas
    putImageData(context, imgData, img_data);
}

function drawStepHistogram(histData, colorObj, divObj) {
    let used_color = colorObj.palette, used_order = colorObj.order

    // draw the corresponding data
    let traditionalSvg = divObj.append("svg").attr("width", SVGWIDTH)
        .attr("height", SVGHEIGHT)
        .style("background-color", "rgba(" + background_color.join(",") + ")")
        .on("dblclick", function () {
            svg2Png(traditionalSvg, divObj)
        })
    // .style("margin-left", "20px")//.style("border", "1px solid #444444");
    let tmp = traditionalSvg.append("g")
        .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")")

    for (let m = 0; m < histData.length; m++) {
        let pre_h = svg_height
        for (let n = 0; n < histData[used_order[m]].length; n++) {
            if (histData[used_order[m]][n] == 0) {
                pre_h = svg_height
                continue
            }
            let x = n * axis_x_bandwidth,
                y = axis_y(histData[used_order[m]][n])
            tmp.append("line")
                .style("stroke", "rgba(" + used_color[m].slice(0, 3).join(',') + "," + 1 + ")")
                .style("stroke-width", 2)
                .attr("x1", x)
                .attr("y1", pre_h)
                .attr("x2", x)
                .attr("y2", y);
            tmp.append("line")
                .style("stroke", "rgba(" + used_color[m].slice(0, 3).join(',') + "," + 1 + ")")
                .style("stroke-width", 2)
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", x + axis_x_bandwidth)
                .attr("y2", y);
            if (n === histData[used_order[m]].length - 1 || (n < histData[used_order[m]].length - 1 && histData[used_order[m]][n + 1] === 0)) {
                tmp.append("line")
                    .style("stroke", "rgba(" + used_color[m].slice(0, 3).join(',') + "," + 1 + ")")
                    .style("stroke-width", 2)
                    .attr("x1", x + axis_x_bandwidth)
                    .attr("y1", y)
                    .attr("x2", x + axis_x_bandwidth)
                    .attr("y2", svg_height);
            }
            pre_h = y
        }

    }
}

function showOptimizedColors(palette, order, divObj) {
    // get composited colors
    getBlendedColors(palette, order)

    let div = divObj.append("div").style("display", "inline-block").style("width", "500px").style("margin-left", "50px").style("text-align", "left")
    let jnd_div = div.append("div").style("display", "inline-block")
    jnd_div.append("h2")
        .text(" < JND( " + threshold_variables[0].toFixed(2) + " )")
    let lum_div = div.append("div").style("display", "inline-block")
    lum_div.append("h2")
        .text(" unsatisfied Luminance: ")
    let name_div = div.append("div").style("display", "inline-block")
    name_div.append("h2")
        .text(" unsatisfied Name Similarity: ")
    let sep_div_main = div.append("div").style("display", "inline-block")
    sep_div_main.append("h2").on("click", function () {
        if (sep_div.style("display") == 'none')
            sep_div.style("display", "inline-block")
        else
            sep_div.style("display", "none")
    })
        .text("Related : ")
    let sep_div = sep_div_main.append("div").style("display", "none")
    let cont_div_main = div.append("div").style("display", "inline-block").style("margin-left", "10px")
    cont_div_main.append("h2").on("click", function () {
        if (cont_div.style("display") == 'none')
            cont_div.style("display", "inline-block")
        else
            cont_div.style("display", "none")
    })
        .text("Separability : ")
    let cont_div = cont_div_main.append("div").style("display", "none")

    let unrelated_div_main = div.append("div").style("display", "inline-block").style("margin-left", "10px")
    unrelated_div_main.append("h2").on("click", function () {
        if (unrelated_div.style("display") == 'none')
            unrelated_div.style("display", "inline-block")
        else
            unrelated_div.style("display", "none")
    })
        .text("Unrelated : ")
    let unrelated_div = unrelated_div_main.append("div").style("display", "none")

    let jnd_count = 0, lumi_count = 0, name_count = 0
    // calculate all color distance and name difference
    let diff_arr = {}
    let blended_colors_all_arr = Object.keys(blended_colors_all)
    // var index = blended_colors_all_arr.indexOf('bgColor');
    // if (index !== -1) {
    //     blended_colors_all_arr.splice(index, 1);
    // }
    for (let i = 0; i < blended_colors_all_arr.length; i++) {
        let key = blended_colors_all_arr[i]
        if (!diff_arr[key]) diff_arr[key] = {}
        let cj = blended_colors_all[key]
        let lab_cj = d3.lab(d3.rgb(cj[0], cj[1], cj[2]))
        let hsl_cj = d3.hsl(d3.rgb(cj[0], cj[1], cj[2]))
        let hcl_cj = d3.hcl(lab_cj)
        let ns = getColorSaliency(lab_cj)
        // name_saliency_score_arr.push(ns)
        // if (getColorName(lab_cj)[0] == 'grey') return -1000000
        for (let j = i + 1; j < blended_colors_all_arr.length; j++) {
            let key2 = blended_colors_all_arr[j]
            if (!diff_arr[key2]) diff_arr[key2] = {}
            let ck = blended_colors_all[key2]
            let lab_ck = d3.lab(d3.rgb(ck[0], ck[1], ck[2]))

            // // luminance order
            // if ((key.length - key2.length) * (lab_cj.L - lab_ck.L) > 0) {
            //     lumi_count++
            //     lum_div.append("span")
            //         .style("width", "30px").style("height", "30px").style("display", "inline-block")
            //         .style("margin-left", "10px").style("background", "rgba(" + blended_colors_all[key].join(",") + ")")
            //     lum_div.append("span")
            //         .style("width", "30px").style("height", "30px").style("display", "inline-block")
            //         .style("margin-left", "10px").style("background", "rgba(" + blended_colors_all[key2].join(",") + ")")
            //     lum_div.append("span").text(key + " : " + key2 + " = " + lab_cj.L.toFixed(2) + " : " + lab_ck.L.toFixed(2))
            //         .style("display", "inline-block").style("vertical-align", "top")
            //     lum_div.append("br")
            // }

            let hsl_ck = d3.hsl(d3.rgb(ck[0], ck[1], ck[2]))
            let hcl_ck = d3.hcl(lab_ck)
            let hd = getHueDiff(hcl_cj, hcl_ck)

            let cd = d3_ciede2000(lab_cj, lab_ck)
            if (cd < threshold_variables[0]) {
                jnd_count++
                jnd_div.append("span")
                    .style("width", "30px").style("height", "30px").style("display", "inline-block")
                    .style("margin-left", "10px").style("background", "rgba(" + blended_colors_all[key].join(",") + ")")
                jnd_div.append("span")
                    .style("width", "30px").style("height", "30px").style("display", "inline-block")
                    .style("margin-left", "10px").style("background", "rgba(" + blended_colors_all[key2].join(",") + ")")
                jnd_div.append("span").text(key + " : " + key2 + " = " + cd.toFixed(2))
                    .style("display", "inline-block").style("vertical-align", "top")
                jnd_div.append("br")
            }
            cd *= 0.02
            let nd = 1 - getNameDifference(lab_cj, lab_ck)
            let ld = Math.abs(lab_cj.L - lab_ck.L) // / 100
            diff_arr[key][key2] = [cd, nd, hd, ld]
            diff_arr[key2][key] = [cd, nd, hd, ld]

        }
    }
    if (jnd_count == 0) {
        jnd_div.remove()
    }

    // relateness score
    let relateness_score = 0, sum_len = 0, all_ns_arr = []
    for (let i = 0; i < blended_colors_arr.length; i++) {
        let tmp = []
        for (let j = 1; j < blended_colors_arr[i].length; j++) {
            let ns = diff_arr[blended_colors_arr[i][j]][blended_colors_arr[i][0]][1]
            // if (ns < threshold_variables[2]) return -1000000
            tmp.push(ns)
        }
        if (tmp.length == 0) tmp = [0]
        sum_len += tmp.length
        relateness_score += d3.sum(tmp) * Math.sqrt(overlap_size_arr[blended_colors_arr[i][0]] * blended_num_arr[blended_colors_arr[i][0]])

        let key = blended_colors_arr[i][0]
        sep_div.append("span")
            .style("width", "30px").style("height", "30px").style("display", "inline-block")
            .style("margin-left", "10px").style("background", "rgba(" + blended_colors_all[key].join(",") + ")").style("font-weight", "bold")
        sep_div.append("span").text(key + " : " + (d3.sum(tmp) * overlap_size_arr[key] * blended_num_arr[key]).toFixed(2) + " = " + d3.sum(tmp).toFixed(2) + "*" + overlap_size_arr[key].toFixed(2) + "*" + blended_num_arr[key].toFixed(2) + "=>" + Math.sqrt(overlap_size_arr[blended_colors_arr[i][0]] * blended_num_arr[blended_colors_arr[i][0]]).toFixed(2))
            .style("display", "inline-block").style("vertical-align", "top")
        sep_div.append("br")

        for (let j = 0; j < blended_colors_arr[i].length; j++) {
            for (let k = j + 1; k < blended_colors_arr[i].length; k++) {
                let ns = diff_arr[blended_colors_arr[i][j]][blended_colors_arr[i][k]][1]
                if (ns < threshold_variables[2]) {
                    name_count++
                    name_div.append("span")
                        .style("width", "30px").style("height", "30px").style("display", "inline-block")
                        .style("margin-left", "10px").style("background", "rgba(" + blended_colors_all[blended_colors_arr[i][j]].join(",") + ")")
                    name_div.append("span")
                        .style("width", "30px").style("height", "30px").style("display", "inline-block")
                        .style("margin-left", "10px").style("background", "rgba(" + blended_colors_all[blended_colors_arr[i][k]].join(",") + ")")
                    name_div.append("span").text(blended_colors_arr[i][j] + " : " + blended_colors_arr[i][k] + " = " + ns.toFixed(2))
                        .style("display", "inline-block").style("vertical-align", "top")
                    name_div.append("br")
                }
                all_ns_arr.push(ns)
                sep_div.append("span")
                    .style("width", "30px").style("height", "30px").style("display", "inline-block")
                    .style("margin-left", "20px").style("background", "rgba(" + blended_colors_all[blended_colors_arr[i][j]].join(",") + ")")
                sep_div.append("span")
                    .style("width", "30px").style("height", "30px").style("display", "inline-block")
                    .style("margin-left", "10px").style("background", "rgba(" + blended_colors_all[blended_colors_arr[i][k]].join(",") + ")")
                sep_div.append("span").text(blended_colors_arr[i][j] + " | " + blended_colors_arr[i][k] + " : NS = " + ns.toFixed(2)
                    + " , CD = " + diff_arr[blended_colors_arr[i][j]][blended_colors_arr[i][k]][0].toFixed(2)
                    + " , HD = " + diff_arr[blended_colors_arr[i][j]][blended_colors_arr[i][k]][2].toFixed(2)
                    + " , LD = " + diff_arr[blended_colors_arr[i][j]][blended_colors_arr[i][k]][3].toFixed(2))
                    .style("display", "inline-block").style("vertical-align", "top")
                sep_div.append("br")
            }
        }
        sep_div.append("hr")
    }
    relateness_score /= sum_len
    relateness_score += d3.min(all_ns_arr)
    if (name_count == 0) {
        name_div.remove()
    }

    // console.log(pixels_num_weight, "pixels_num_weight", blended_colors_neighboring_relation);
    // separability score
    let separability_score = [], background_score = []
    for (let j = 0; j < blended_colors_all_arr.length; j++) {
        let key = blended_colors_all_arr[j]
        if (key === 'bgColor') continue
        for (let i = 0; i < blended_colors_neighboring_relation[key].length; i++) {
            separability_score.push(diff_arr[key][blended_colors_neighboring_relation[key][i]][0] * (1 + pixels_num_weight[key]))
            cont_div.append("span")
                .style("width", "30px").style("height", "30px").style("display", "inline-block")
                .style("margin-left", "20px").style("background", "rgba(" + blended_colors_all[key].join(",") + ")")
            cont_div.append("span")
                .style("width", "30px").style("height", "30px").style("display", "inline-block")
                .style("margin-left", "10px").style("background", "rgba(" + blended_colors_all[blended_colors_neighboring_relation[key][i]].join(",") + ")")
            cont_div.append("span").text(key + " | " + blended_colors_neighboring_relation[key][i] + " : CD = " + diff_arr[key][blended_colors_neighboring_relation[key][i]][0].toFixed(2) + " x " + " R( " + (1 + pixels_num_weight[key]).toFixed(2) + " ) = " + (diff_arr[key][blended_colors_neighboring_relation[key][i]][0] * (1 + pixels_num_weight[key])).toFixed(2))
                .style("display", "inline-block").style("vertical-align", "top")
            cont_div.append("br")
        }
        background_score.push(diff_arr[key]['bgColor'][3])
        if (diff_arr[key]['bgColor'][3] < threshold_variables[1]) {
            lumi_count++
            lum_div.append("span")
                .style("width", "30px").style("height", "30px").style("display", "inline-block")
                .style("margin-left", "10px").style("background", "rgba(" + blended_colors_all[key].join(",") + ")")
            lum_div.append("span").text(key + " : bg = " + diff_arr[key]['bgColor'][3].toFixed(2))
                .style("display", "inline-block").style("vertical-align", "top")
            lum_div.append("br")
        }
        cont_div.append("hr")
    }
    // console.log(separability_score);
    separability_score = d3.min(separability_score)
    // console.log(separability_score);
    background_score = d3.min(background_score)
    if (lumi_count == 0) {
        lum_div.remove()
    }

    sep_div_main.select("h2").text("relateness ( " + relateness_score.toFixed(2) + " ): ")
    cont_div_main.select("h2").text("separability ( " + separability_score.toFixed(2) + " ): ")

    let unrelateness_score = []
    for (let i = 0; i < unrelated_colors_global.length; i++) {
        unrelateness_score.push(diff_arr[unrelated_colors_global[i][0]][unrelated_colors_global[i][1]][1])
        unrelated_div.append("span")
            .style("width", "30px").style("height", "30px").style("display", "inline-block")
            .style("margin-left", "20px").style("background", "rgba(" + blended_colors_all[unrelated_colors_global[i][0]].join(",") + ")")
        unrelated_div.append("span")
            .style("width", "30px").style("height", "30px").style("display", "inline-block")
            .style("margin-left", "10px").style("background", "rgba(" + blended_colors_all[unrelated_colors_global[i][1]].join(",") + ")")
        unrelated_div.append("span").text(unrelated_colors_global[i][0] + " | " + unrelated_colors_global[i][1] + " : NS = " + (diff_arr[unrelated_colors_global[i][0]][unrelated_colors_global[i][1]][1]).toFixed(2))
            .style("display", "inline-block").style("vertical-align", "top")
        unrelated_div.append("br")
    }
    unrelateness_score = -d3.max(unrelateness_score) - d3.mean(unrelateness_score)
    // unrelateness_score = d3.mean(unrelateness_score)
    unrelated_div_main.select("h2").text("unrelateness ( " + unrelateness_score.toFixed(2) + " ): ")

    let total_score = weight_global[0] * relateness_score + weight_global[1] * unrelateness_score + weight_global[2] * separability_score

    div.append("h2")
        .text("score = " + total_score.toFixed(2) + " = " + weight_global[0] + " x Relateness(" + relateness_score.toFixed(2) + ") + " + weight_global[1] +
            " x unRelateness(" + unrelateness_score.toFixed(2) + ") + " + weight_global[2] + " x Separability(" + separability_score.toFixed(2) + ")")

    let info_div = div.append("div").style("display", "inline-block")
    info_div.append("h2")
        .text("rendering order is " + order.join(" - "))
    let all_colors = []
    for (let i = 0; i < blended_colors_all_arr.length; i++) {
        if (blended_colors_all_arr[i] == "bgColor") continue
        let cj = blended_colors_all[blended_colors_all_arr[i]]
        let lab_cj = d3.lab(d3.rgb(cj[0], cj[1], cj[2]))
        let hsl_cj = d3.hsl(d3.rgb(cj[0], cj[1], cj[2]))
        all_colors.push([hsl_cj, blended_colors_all_arr[i]])
        info_div.append("span")
            .style("width", "30px").style("height", "30px").style("display", "inline-block")
            .style("margin-left", "10px").style("background", "rgba(" + cj.join(",") + ")")
        info_div.append("span").text(blended_colors_all_arr[i] + ", Lab(" + Math.round(lab_cj.L) + "," + Math.round(lab_cj.a) + "," + Math.round(lab_cj.b) + ")"
            + ", hsl(" + Math.round(hsl_cj.h) + "," + (hsl_cj.s).toFixed(2) + "," + (hsl_cj.l).toFixed(2) + ")" + ", Size(" + pixels_num_weight[blended_colors_all_arr[i]].toFixed(2) + "), " + getColorName(d3.rgb(cj[0], cj[1], cj[2]))[0]).style("display", "inline-block").style("vertical-align", "top").style("margin-left", "10px")
        let idx_arr = blended_colors_all_arr[i].split("-")
        if (idx_arr.length === 1) {
            info_div.append("span").style("display", "inline-block")
                .text("rgba( " + (palette[+idx_arr[0]].slice(0, 3)).map(d => d.toFixed(0)).join(", ") + ", " + palette[+idx_arr[0]][3].toFixed(2) + " )").style("vertical-align", "top").style("margin-left", "10px")
        }
        info_div.append("br")
    }
    // drawColorWheel(divObj, all_colors)
}


function KdeValue(xyPoints, pos) {
    var h, h2, iqr, xPoints;
    // Update bandwidth
    // Use same bandwidth for each dimension
    xPoints = xyPoints.map(function (d) { return d.x }).sort(function (a, b) { return a - b });
    // console.log(xPoints);
    iqr = d3.quantile(xPoints, 0.75) - d3.quantile(xPoints, 0.25);
    h = 1.06 * Math.min(d3.deviation(xPoints), iqr / 1.34) * Math.pow(xyPoints.length, -0.2);//A rule-of-thumb bandwidth estimator
    h2 = h * h;
    // console.log("h", h);


    // Use same bandwidth for each dimension
    function kde(point) {
        //return d3.mean(xyPoints, function (p) { return gaussian(norm(p, {x:point[0],y:point[1]}) / h) }) / h2;
        return d3.sum(xyPoints, function (p) { return gaussian(norm(p, { x: point[0], y: point[1] }) / h) }) / h2;
    }

    // Norm of 2D arrays/vectors
    function norm(v1, v2) {
        return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y));
    }

    function gaussian(x) {
        // sqrt(2 * PI) is approximately 2.5066
        return Math.exp(-x * x / 2) / 2.5066;
    }

    return kde(pos);
}

function drawHistogramOutline(histData, colorObj, divObj) {
    let used_color = colorObj.palette, used_order = colorObj.order
    let div = divObj.append("div")
        .style("display", "inline-block")
        .style("margin-left", "10px")
    div.append("h3").text("double click the figure to download:")
    // draw the corresponding data
    let traditionalSvg = div.append("svg").attr("width", SVGWIDTH)
        .attr("height", SVGHEIGHT)
        .style("background-color", "#fff")
        .on("dblclick", function () {
            let svgEl = traditionalSvg._groups[0][0];
            // let svgEl = document.getElementById(svgId);
            svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            var svgData = svgEl.outerHTML;
            var preface = '<?xml version="1.0" standalone="no"?>\r\n';
            var svgBlob = new Blob([preface, svgData], {
                type: "image/svg+xml;charset=utf-8"
            });
            // console.log(svgBlob);
            var svgUrl = URL.createObjectURL(svgBlob);
            var downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = "result.svg";
            downloadLink.click();
            URL.revokeObjectURL(svgUrl);

            svg2Png(traditionalSvg, divObj)
        })
    // .style("margin-left", "20px")//.style("border", "1px solid #444444");
    let tmp = traditionalSvg.append("g")
        .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")")

    let points = new Array(histData.length)
    let max_data = d3.max(histData, function (d) {
        return d3.max(d)
    }), min_data = 0;
    let scalePoints = d3.scaleLinear()
        .range([0, 100])
        .domain([min_data, max_data]);
    let scalePointsBack = d3.scaleLinear()
        .range([min_data, max_data])
        .domain([0, 100]);
    for (let m = 0; m < histData.length; m++) {
        // let str = "["
        // let points = []
        points[m] = []
        for (let n = 0; n < histData[used_order[m]].length; n++) {
            tmp.append("rect")
                .attr("class", "bar")
                .attr("id", "hist-" + m)
                // .attr("fill", "rgba(" + colors[+used_color[m]].join(',') + "," + opacities[m] + ")")
                .attr("fill", "rgb(" + used_color[used_order[m]].slice(0, 3).join(',') + ")")
                .attr("x", n * axis_x_bandwidth)
                .attr("width", axis_x_bandwidth)
                .attr("y", axis_y(histData[used_order[m]][n]))
                .attr("height", svg_height - axis_y(histData[used_order[m]][n]))
                .style("opacity", used_color[used_order[m]][3])
            if (histData[used_order[m]][n] > 0) {
                // points.push({ x: n * axis_x_bandwidth, y: svg_height - axis_y(histData[used_order[m]][n]) })
                // str += '[' + n * axis_x_bandwidth + "," + (svg_height - axis_y(histData[used_order[m]][n])) + "],"
                let v = Math.round(scalePoints(histData[used_order[m]][n]))
                if (v > 0)
                    for (let i = 0; i < v; i++) {
                        points[m].push({
                            x: n, y: 0
                        })
                    }
            }
        }
        // str += ']'
        // console.log(str);
    }
    console.log("====>>>>points", points);

    // draw the outline
    var line = d3.line()
        .x(function (d) {
            return d.q * axis_x_bandwidth;
        })
        .y(function (d) {
            // return svg_height - d.p;
            return axis_y(d.p);
        })
        .curve(d3.curveCardinal)

    for (let m = 0; m < histData.length; m++) {
        let data = []
        let sign = false
        for (var i = 0; i <= histData[m].length; i++) {
            let q = i + 0.5,
                p = scalePointsBack(KdeValue(points[m], [i, 0]))
            if (p > max_data) {
                sign = true
            }
            // if (p > max_data) p = max_data
            // console.log(p);
            if (p < 0) p = 0
            let el = {
                "q": q,
                "p": p
            }
            data.push(el)
        }
        console.log(sign, data);
        if (sign) {
            let m_data = d3.max(data, function (d) {
                return d.p
            })
            for (let i = 0; i < data.length; i++) {
                data[i].p = data[i].p / m_data * max_data
            }
        }
        // console.log("-------------------------------------");
        tmp.append("path")
            .datum(data)
            .attr("class", "line")
            .style("fill", "none")
            .style("stroke", "rgb(" + used_color[used_order[m]].slice(0, 3).join(',') + ")")
            .style("stroke-width", "1.5px")
            .attr("d", line);
    }

    return traditionalSvg
}

