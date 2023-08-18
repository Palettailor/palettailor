
function simulatedAnnealing(histData, used_colors, initial_order) {
    let palette_size = histData.length;
    let initial_colors = []
    for (let i = 0; i < palette_size; i++) {
        initial_colors.push([used_colors[i][0], used_colors[i][1], used_colors[i][2], 0.01 * getRandomIntInclusive(20, 80)])
    }
    // let initial_order = [...Array(palette_size).keys()]

    let iterate_times = 0;
    //default parameters
    let max_temper = 100000,
        dec = 0.99,
        max_iteration_times = 10000000,
        end_temper = 0.001;
    cur_temper = max_temper;

    let o = {
        palette: initial_colors,
        order: initial_order,
        score: getPaletteScore(initial_colors, initial_order)
    },
        preferredObj = o;

    function deepCopy(arr) {
        let array = []
        for (let i = 0; i < arr.length; i++) {
            array.push(arr[i].slice())
        }
        return array
    }

    let disturbColor = function (c) {
        return normScope(c + getRandomIntInclusive(-10, 10), [0, 255])
    }

    while (cur_temper > end_temper) {
        for (let i = 0; i < 1; i++) { //disturb at each temperature
            iterate_times++;

            // disturb the parameters
            let curr_colors = deepCopy(o.palette)
            let curr_order = (o.order).slice()
            let idx = getRandomIntInclusive(0, palette_size - 1), idx_1
            if (Math.random() >= optimizeColorSign) {
                // import new color or opacity
                if (Math.random() >= optimizeAssignmentSign) {
                    if (palette_size < used_colors.length && Math.random() > 0.5) {
                        // exchange colors from unused colors
                        idx_1 = getRandomIntInclusive(palette_size, used_colors.length - 1)
                    } else {
                        // exchange current colors
                        idx_1 = getRandomIntInclusive(0, palette_size - 1)
                        while (idx_1 == idx) {
                            idx_1 = getRandomIntInclusive(0, palette_size - 1)
                        }
                    }
                    // exchange colors
                    let tmp = used_colors[idx].slice()
                    used_colors[idx] = used_colors[idx_1]
                    used_colors[idx_1] = tmp

                    for (let i = 0; i < palette_size; i++) {
                        curr_colors[i] = used_colors[i].slice(0, 3).concat([curr_colors[i][3]])
                    }
                } else {
                    // disturb opacity
                    curr_colors[idx][3] = normScope(curr_colors[idx][3] + 0.01 * getRandomIntInclusive(-10, 10), [0.2, 0.8])
                }
            } else {
                if (Math.random() > 0.5) {
                    curr_colors[idx] = [disturbColor(curr_colors[idx][0]), disturbColor(curr_colors[idx][1]), disturbColor(curr_colors[idx][2]), curr_colors[idx][3]]
                } else {
                    curr_colors[idx][3] = normScope(curr_colors[idx][3] + 0.01 * getRandomIntInclusive(-10, 10), [0.2, 0.8])
                }
            }

            let o2 = {
                palette: curr_colors,
                order: curr_order,
                score: getPaletteScore(curr_colors, curr_order)
            };

            let delta_score = o.score - o2.score;
            let prob = Math.exp((-delta_score) / cur_temper)
            if (delta_score <= 0 || delta_score > 0 && Math.random() <= prob) {
                o = o2;
                if (preferredObj.score - o.score < 0) {
                    preferredObj = o;
                }
            }
            if (iterate_times > max_iteration_times) {
                break;
            }
        }

        cur_temper *= dec;
    }
    console.log("preferredObj", preferredObj);
    return preferredObj;
}

function getPaletteScore(palette, order) {
    // get composited colors
    getBlendedColors(palette, order)

    // calculate all color distance and name difference
    let diff_arr = {}
    let blended_colors_all_arr = Object.keys(blended_colors_all)
    for (let i = 0; i < blended_colors_all_arr.length; i++) {
        let key = blended_colors_all_arr[i]
        if (!diff_arr[key]) diff_arr[key] = {}
        let cj = blended_colors_all[key]
        let lab_cj = d3.lab(d3.rgb(cj[0], cj[1], cj[2]))
        for (let j = i + 1; j < blended_colors_all_arr.length; j++) {
            let key2 = blended_colors_all_arr[j]
            if (!diff_arr[key2]) diff_arr[key2] = {}
            let ck = blended_colors_all[key2]
            let lab_ck = d3.lab(d3.rgb(ck[0], ck[1], ck[2]))

            let cd = d3_ciede2000(lab_cj, lab_ck)
            if (cd < threshold_variables[0]) return -1000000
            cd *= 0.02
            let nd = 1 - getNameDifference(lab_cj, lab_ck)
            let ld = Math.abs(lab_cj.L - lab_ck.L)// / 100
            // using name similarity
            diff_arr[key][key2] = [cd, nd, ld]
            diff_arr[key2][key] = [cd, nd, ld]
        }
    }

    // relateness score
    let relateness_score = 0
    for (let i = 0; i < blended_colors_arr.length; i++) {
        let contour_arr = blended_colors_arr[i]
        let tmp = []
        for (let j = 0; j < contour_arr.length; j++) {
            if (contour_arr[j].length != 1) continue
            for (let k = j + 1; k < contour_arr.length; k++) {
                let ns = diff_arr[contour_arr[j]][contour_arr[k]][1]
                // if (ns < 0.01) return -1000000
                tmp.push(ns)
            }
        }
        if (tmp.length == 0) tmp = [0]
        relateness_score += d3.mean(tmp)
    }
    relateness_score /= blended_colors_arr.length

    // unrelateness score
    let unrelateness_score = []
    for (let i = 0; i < unrelated_colors_global.length; i++) {
        unrelateness_score.push(diff_arr[unrelated_colors_global[i][0]][unrelated_colors_global[i][1]][1])
    }
    unrelateness_score = -d3.max(unrelateness_score)

    // separability score
    let separability_score = [], background_score = []
    for (let j = 0; j < blended_colors_all_arr.length; j++) {
        let key = blended_colors_all_arr[j]
        if (key === 'bgColor') continue
        for (let i = 0; i < blended_colors_neighboring_relation[key].length; i++) {
            separability_score.push(diff_arr[key][blended_colors_neighboring_relation[key][i]][0] * (1 + pixels_num_weight[key]))
        }
        background_score.push(diff_arr[key]['bgColor'][2])
    }
    separability_score = d3.min(separability_score)
    background_score = d3.min(background_score)
    if (background_score < threshold_variables[1]) {
        return -1000000
    }

    let total_score = weight_global[0] * relateness_score + weight_global[1] * unrelateness_score + weight_global[2] * separability_score

    return total_score
}