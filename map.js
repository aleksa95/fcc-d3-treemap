const projectName = "tree-map";

const margin = { top: 0, right: 100, bottom: 100, left: 100 };

const width = 1040;
const height = 700;

const color = d3.scaleOrdinal(d3.schemeCategory20);

const map = d3.select('#map')
  .attr('class','treemap')
  .style('position', 'relative')
  .attr('width', width   + margin.left + margin.right)
  .attr('height', height + margin.top  + margin.bottom)
  .call(responsivefy)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const tool = d3.select('body')
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip');

const treemap = d3.treemap()
  .size([width, height])
  .paddingInner(2);

d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json', (error, data) => {
  if (error) throw error;

  const CATEGORIES = [];

  var root = d3.hierarchy(data)
    .eachBefore(d => d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
    .sum(d => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(root);

  var cell = map.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
    .each(d => {
      if (d.category && !CATEGORIES.includes(d.category)) CATEGORIES.push(d.category);
    })
    .attr("class", "group")
    .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

  var tile = cell.append("rect")
    .attr("id", function(d) { return d.data.id; })
    .attr("class", "tile")
    .attr("width", function(d) { return d.x1 - d.x0; })
    .attr("height", function(d) { return d.y1 - d.y0; })
    .attr("data-name", function(d){
      return d.data.name;
    })
    .attr("data-category", function(d){
      return d.data.category;
    })
    .attr("data-value", function(d){
      return d.data.value;
    })
    .attr("fill", function(d) {
      return color(d.data.category);
    })
    .on("mousemove", function (d) {
      tool.attr("data-value", () => d.value);
      tool.style("left", d3.event.pageX + 10 + "px");
      tool.style("top", d3.event.pageY - 20 + "px");
      tool.style("display", "inline-block");
      tool.html(d.children ? null : `Name: ${d.data.name} <br> Genre: ${d.data.category} <br> Sales: ${d.value}`);
    }).on("mouseout", () => { tool.style("display", "none"); })
    .style("color", "#fff");

  cell.append("text")
    .attr('class', 'tile-text')
    .selectAll("tspan")
    .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
    .attr("font-size", "10px")
    .attr("fill", "#fff")
    .attr("x", 0)
    .attr("y", function(d, i) { return 12 + i * 10; })
    .text(function(d) { return d; });

  var categories = root.leaves().map(function(nodes){
    return nodes.data.category;
  });
  categories = categories.filter(function(category, index, self){
    return self.indexOf(category)===index;
  });

  // LEGEND
  const legend = map
    .append("g")
    .attr("id", 'legend')
    .call(responsivefy);

  const legendWidth = 600;
  const LEGEND_OFFSET = height + 20;
  const LEGEND_RECT_SIZE = 15;
  const LEGEND_H_SPACING = 150;
  const LEGEND_V_SPACING = 10;
  const LEGEND_TEXT_X_OFFSET = 3;
  const LEGEND_TEXT_Y_OFFSET = -2;
  const legendElemsPerRow = Math.floor(legendWidth/LEGEND_H_SPACING);

  var legendElem = legend
    .attr("transform", `translate(${((width - legendWidth) / 2) + (legendWidth / 10)}, ${LEGEND_OFFSET})`)
    .selectAll("g")
    .data(categories)
    .enter().append("g")
    .attr("transform", function(d, i) {
      return 'translate(' +
        ((i%legendElemsPerRow)*LEGEND_H_SPACING) + ',' +
        ((Math.floor(i/legendElemsPerRow))*LEGEND_RECT_SIZE + (LEGEND_V_SPACING*(Math.floor(i/legendElemsPerRow)))) + ')';
    });

  legendElem.append("rect")
    .attr('width', LEGEND_RECT_SIZE)
    .attr('height', LEGEND_RECT_SIZE)
    .attr('class','legend-item')
    .attr('fill', function(d){
      return color(d);
    });

  legendElem.append("text")
    .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
    .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
    .text(function(d) { return d; });
});

function responsivefy(map) {
  var container = d3.select(("body")),
    width  = parseInt(map.style("width")),
    height = parseInt(map.style("height")),
    aspect = width / height;
  map.attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMid")
    .call(resize);
  d3.select(window).on("resize." + container.attr("id"), resize);
  function resize() {
    var targetWidth = parseInt(container.style("width"));
    map.style("width", targetWidth);
    map.style("height", Math.round(targetWidth / aspect));
  }
}