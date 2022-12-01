//global variables:
let svg_margin = {
    top: 20,
    right: 20,
    bottom: 80,
    left: 40
},
    radius = 6,
    SVGWIDTH = 560,//1060,//760,//
    SVGHEIGHT = 600;

let svg_width = SVGWIDTH - svg_margin.left - svg_margin.right,
    svg_height = SVGHEIGHT - svg_margin.top - svg_margin.bottom;

let score_importance_weight = new Array(4);
score_importance_weight[0] = document.getElementById("inputBox_lc").value / 100;
score_importance_weight[1] = document.getElementById("inputBox_bc").value / 100;
score_importance_weight[2] = document.getElementById("inputBox_nd").value / 100;
score_importance_weight[3] = document.getElementById("inputBox_nc").value / 100;

let source_datasets, source_datasets_names, labelToClass, scaled_datasets;
let alphaShape_distance, cluster_nums, non_separability_weights;
let xScale, xMap, xAxis, yScale, yMap, yAxis;
let locked_pos, data_changed_sign = false;
let bgcolor = "#fff", background_color_lab = d3.lab(d3.rgb(bgcolor))
let DATATYPE = "SCATTERPLOT";
let Tableau_20_palette = ["#4E79A7", "#A0CBE8", "#F28E2B", "#FFBE7D", "#59A14F", "#8CD17D", "#B6992D", "#F1CE63", "#499894", "#86BCB6", "#E15759", "#FF9D9A", "#79706E", "#BAB0AC", "#D37295", "#FABFD2", "#B07AA1", "#D4A6C8", "#9D7660", "#D7B5A6"];
let Tableau_10_palette = ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F", "#EDC948", "#B07AA1", "#FF9DA7", "#9C755F", "#BAB0AC"];
let color_names_checked, color_blind_type;
let best_color_names = {
    "brown": d3.rgb(100, 53, 0),
    "orange": d3.rgb(255, 118, 2),
    "yellow": d3.rgb(255, 246, 3),
    "red": d3.rgb(255, 30, 32),
    "pink": d3.rgb(255, 147, 205),
    "blue": d3.rgb(5, 74, 255),
    "green": d3.rgb(14, 160, 46),
    "grey": d3.rgb(143, 136, 135),
    "purple": d3.rgb(113, 0, 135),
    "black": d3.rgb(4, 11, 5),
    "white": d3.rgb(255, 255, 255)
};
let decline_rate_efficiency = 0.99,
    decline_rate_quality = 0.999,
    decline_rate = 0.99;

// color name lookup table
let color_name_map = {};
// color saliency range
let minE = -4.5,
    maxE = 0;

//d3.hsl((d3.hsl("#b8e1f1")).h,(d3.hsl("#b8e1f1")).s, 0.9)
p0 = ["#ecc300", "#ef617f", "#c693d6", "#287480", "#ff9301", "#3aa770", "#706c8c", "#7bc7e5", "#fff0ab", "#f9c9d3", "#e8d4ee", "#b1dfe6", "#ffd296", "#c0e9d4", "#d9d8e1", "#d8eef7"]
// p0 = ["#ecc300","#ef617f","#c693d6","#287480","#ff9301","#3aa770","#706c8c","#7bc7e5","#fff0ab","#f9c9d3","#e8d4ee",d3.hsl((d3.hsl("#287480")).h,(d3.hsl("#287480")).s, 0.8),"#ffd296","#c0e9d4","#d9d8e1",d3.hsl((d3.hsl("#b8e1f1")).h,(d3.hsl("#b8e1f1")).s, 0.91)]
p01 = ["#ecc300", "#ef617f", "#c693d6", "#287480", "#ff9301", "#3aa770", "#706c8c", "#7bc7e5", "#fff0ab", "#f9c9d3", "#e8d4ee", "#c2e6ec", "#ffd296", "#c0e9d4", "#d9d8e1", "#b8e1f1"]
p1 = ["rgb(143, 218, 40)", "rgb(255, 99, 255)", "rgb(255, 161, 95)", "rgb(97, 93, 199)", "rgb(80, 187, 160)", "rgb(255, 27, 101)", "rgb(53, 150, 190)", "rgb(178, 172, 204)",
    "rgb(238, 249, 223)", "rgb(255, 99, 255)", "rgb(255, 227, 207)", "rgb(220, 219, 243)", "rgb(220, 242, 236)", "rgb(255, 207, 222)", "rgb(217, 237, 245)", "rgb(239, 238, 244)"]
p2 = ["#9757de", "#ff8728", "#e0be65", "#087edb", "#e678ba", "#6cca62", "#e5393d", "#b5b9d6", "#e4d4f7", "#ffe8d6", "#f2e4bf", "#d2eafd", "#fbe9f4", "#d0eecd", "#fbe3e4", "#dee0ed"]
p3 = ["#f660de", "#c79129", "#4bce68", "#3d67c3", "#f79469", "#679fd5", "#788f6a", "#c0a6ff", "#fbc3f2", "#f2e2c2", "#ddf5e2", "#cbd6ee", "#fbd0be", "#d5e4f3", "#e3e8e0", "#e8deff"]
p4 = ["#de862c", "#9636e8", "#ffd74c", "#406e99", "#74c7ff", "#ff3e57", "#369f7c", "#ecbdb3", "#faede1", "#e7d2f9", "#fff7dc", "#e6edf4", "#d7efff", "#ffdce0", "#ebf8f4", "#f8e7e3"]

b0 = ["#cd884d", "#ff96d7", "#628712", "#be2890", "#00a795", "#2bd650", "#4dafff", "#e0d63a", "#f0dcca", "#ffdff3", "#ecf8d1", "#f3c7e5", "#cbfff9", "#c2f3cd", "#b7deff", "#f5f2c0"]
b1 = ["#d78c5a", "#d7d1d0", "#f8f900", "#c592ff", "#51d224", "#fe3ca1", "#41c4dc", "#da0037", "#5a3115", "#2f2928", "#3d3d00", "#280057", "#153809", "#420022", "#0e444d", "#6b001b"]
b11 = ["#b4650f", "#bfcb31", "#c400b9", "#11ff80", "#ff96ac", "#4163ff", "#2f94a6", "#816365", "#522e06", "#30330c", "#590054", "#005929", "#590012", "#000f59", "#133e45", "#352829"]

n0 = ["#a06aff", "#fb1b0a", "#837300", "#ff09a5", "#4ea3d5", "#f8a8c1", "#f19674", "#51da89", "#e9dcff", "#fec8c3", "#fff6b8", "#ffc3e9", "#c6e1f1", "#fbd5e1", "#fae0d6", "#daf7e6"]
n1 = ["#b49cff", "#697d81", "#f5476d", "#8fd400", "#337ad1", "#d7c621", "#f67a44", "#0ec7f2", "#e4dcff", "#eef1f1", "#fde2e8", "#e8ffb8", "#c9dcf2", "#f7f3cf", "#fbcbb6", "#b7eefb"]

case0 = ["#c5a02e", "#8f795f", "#e71855", "#75c1b0", "#00a625", "#d47800", "#3062ff", "#8daee0", "#e37ffd", "#ac40ef", "#f7f2e0", "#ece7e2", "#facfdc", "#cce8e2", "#caffd6", "#ffeacf", "#dfe6ff", "#c5d6ef", "#f8dffe", "#e7cafa"]
case_palettailor = ["#6fdf28", "#fed0e6", "#2ef8ba", "#f8f800", "#fe0037", "#3168c1", "#9a41d2", "#a95109", "#00d1f3", "#fe60eb"]
case1 = ["#5e9030", "#4fdb70", "#0ea5cd", "#00d6bb", "#da1292", "#7c6755", "#bb46f9", "#ffb481", "#dead33", "#ff2544", "#e5f2d8", "#bef1ca", "#dcf5fc", "#cafff8", "#fbd3ed", "#e1dad3", "#f0d6fd", "#ffdfca", "#f7ecd2", "#ffe4e8"]
case2 = ["#a535c5", "#9d6d79", "#ff2a34", "#e178e2", "#03adae", "#639ed4", "#ff8043", "#86d9a6", "#d7b32d", "#57903b", "#e9ccf1", "#e9dfe1", "#ffe3e4", "#faeafa", "#c0fdfd", "#c5dbef", "#ffdac9", "#caeed8", "#faf6e7", "#eff6eb"]
case2 = ["#a535c5", "#9d6d79", "#ff2a34", "#e178e2", "#03adae", "#639ed4", "#ff8043", "#86d9a6", "#d7b32d", "#57903b",
    "#e9ccf1", "#e9dfe1", "#ffe3e4", "#faeafa", "#c0fdfd", "#c5dbef", "#ffdac9", d3.hsl((d3.hsl("#caeed8")).h, (d3.hsl("#caeed8")).s, 0.95), "#faf6e7", d3.hsl((d3.hsl("#eff6eb")).h, (d3.hsl("#eff6eb")).s, 0.89)]

case3 = ["#ed6600", "#4c9fff", "#dc0794", "#31de62", "#4d7445", "#777198", "#4fdbcc", "#ffce38", "#ff78ff", "#9e53e8", "#ffdabf", "#bfdcff", "#fdcfee", "#d9f9e2", "#e8f0e6", "#e9e8ee", "#cef5f0", "#fff5d8", "#ffc9ff", "#ebddfa"]
case3 = ["#ed6600", "#4c9fff", "#ff2a34", "#31de62", "#4d7445", "#777198", "#4fdbcc", "#ffce38", "#ff78ff", "#9e53e8",
    "#ffdabf", "#bfdcff", "#ffe3e4", "#d9f9e2", "#e8f0e6", "#e9e8ee", "#cef5f0", "#fff5d8", "#ffc9ff", "#ebddfa"]
case3 = ["#ed6600", "#4c9fff", "#ff2a34", "#31de62", "#009840", "#777198", "#4fdbcc", "#ffce38", "#ff78ff", "#9e53e8",
    "#ffdabf", "#bfdcff", "#ffe3e4", "#e0fae7", "#c7ffde", "#e9e8ee", "#cef5f0", "#fff5d8", "#ffc9ff", "#ebddfa"]

tableau0 = ['#f28e2b', '#9c755f', '#e15759', '#edc948', '#59a14f', '#4e79a7', '#b07aa1', '#bab0ac', '#ff9da7', '#76b7b2']
random_tableau0 = ['#f28e2b', '#4e79a7', '#76b7b2', '#9c755f', '#59a14f', '#b07aa1', '#e15759', '#edc948', '#ff9da7', '#bab0ac']

matrix0 = ["#f6c900", "#a39172", "#3acac2", "#6aa50b", "#ff82ff", "#5664b7", "#d01f21", "#fff2bb", "#eae6df", "#def6f4", "#e6fbc4", "#ffc0ff", "#dee0f0", "#fae3e3"]
matrix1 = ["#f4a24e", "#518ef4", "#e58fdf", "#ff1835", "#43e4fb", "#39b221", "#858386", "#fad6b2", "#c5d9fb", "#f5d5f3", "#ffdbdf", "#c8f7fd", "#caf3c2", "#e5e5e5"]
matrix1 = ["#f4a24e", "#518ef4", "#e58fdf", "#ff1835", "#3acac2", "#39b221", "#858386", "#fad6b2", "#c5d9fb", "#f5d5f3", "#ffdbdf", "#def6f4", "#caf3c2", "#e5e5e5"]
matrix2 = ["#65bd9b","#e39f01","#d68eff","#387cd2","#d4d515","#ff4fb3","#da1000","#c7e7db","#fee7b0","#f4e3ff","#c2d7f1","#f7f7b7","#ffc4e5","#ffc8c4"]
matrix2 = ["#65bd9b","#e39f01","#d68eff","#387cd2",d3.hsl((d3.hsl("#d4d515")).h, (d3.hsl("#d4d515")).s, (d3.hsl("#d4d515")).l-0.1),"#ff4fb3","#da1000","#c7e7db","#fee7b0","#f4e3ff","#c2d7f1","#f7f7b7","#ffc4e5","#ffc8c4"]
matrix2 = ["#65bd9b","#e39f01","#d68eff","#387cd2","#a5a610","#ff4fb3","#da1000","#c7e7db","#fee7b0","#f4e3ff","#c2d7f1","#f7f7b7","#ffc4e5","#ffc8c4"]
matrix3 = ["#56d445","#2a97f4","#e2af96","#ff84cc","#ffac01","#7d7095","#d02002","#d2f3cd","#cae5fc","#f5e3db","#ffd1ec","#fff0d1","#dad6e0","#fecec6"]
matrix4 = ["#8bd7ec","#a47c7a","#ffbd3b","#ef69d2","#b0e438","#67a1f7","#457549","#ceeef7","#e8dedd","#ffedcc","#f9ccef","#e7f7c4","#c0d8fb","#cfe2d0"]


background0 = ["#b728ac","#42cfff","#9c9bfd","#e6fe04","#079166","#ff2571","#8c888c","#b27a08",
"#4f114b","#00506b","#020150","#404700","#034e36","#610021","#242324","#5d3f04"]
background0 = ["#b728ac","#42cfff","#9c9bfd","#e6fe04",d3.hsl((d3.hsl("#079166")).h, (d3.hsl("#079166")).s, 0.44),"#ff2571",d3.hsl((d3.hsl("#8c888c")).h, (d3.hsl("#8c888c")).s, 0.64),"#b27a08",
"#4f114b","#00506b",d3.hsl((d3.hsl("#9c9bfd")).h, (d3.hsl("#9c9bfd")).s, 0.21),"#404700","#034e36",d3.hsl((d3.hsl("#ff2571")).h, (d3.hsl("#ff2571")).s, 0.14),"#242324",d3.hsl((d3.hsl("#b27a08")).h, (d3.hsl("#b27a08")).s, 0.14)]
// background0 = ["#b728ac","#42cfff","#9c9bfd","#e6fe04","#0ad696","#ff2571","#a4a1a4","#b27a08","#4f114b","#00506b","#030269","#404700","#034e36","#610021","#242324","#442e03"]

background1 = ["#e32995","#e6b01a","#0386dd","#7be3f6","#e54306","#00aa26","#ffa0ff","#7152db","#2b051b","#4c3a08","#001d30","#054854","#521802","#00400e","#590059","#160b39"]
background1 = ["#e32995","#e6b01a","#0386dd","#7be3f6","#e54306","#00aa26","#ffa0ff","#7152db",
d3.hsl((d3.hsl("#e32995")).h, (d3.hsl("#e32995")).s, 0.16),"#4c3a08","#001d30","#054854",d3.hsl((d3.hsl("#e54306")).h, (d3.hsl("#e54306")).s, 0.1),"#00400e","#590059","#160b39"]

line0 = ["#995f28","#59a34b","#da45e2","#f8b91c","#4abdff","#f2dfcd","#d8ebd4","#f4c9f6","#fdecc2","#c0e8ff"]