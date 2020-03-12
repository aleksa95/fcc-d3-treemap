const projectName = "tree-map";

var width = 1040,
  height = 600;

const COLORS = ['#8CBAD1','#70D64E','#EF7087','#DDA335','#D981D5','#82CE8C','#839BE6','#C6D445','#C3B66B','#D1A7CC','#70D3C5','#DD9692'];

var color = d3.scale.ordinal().range(COLORS);

var treemap = d3.layout.treemap()
  .size([width, height])
  .padding(.25)
  .value(function (d) { return d.value; });

var div = d3.select("body").append("div")
  .attr("class","treemap")
  .style("position", "relative")
  .style("width", width + "px")
  .style("height", height + "px");

const legend = d3.select("body").append("div")
  .style("position", "relative")
  .style("width", width + "px")
  .style("height", 300 + "px");

const tool = d3.select("body").append("div").attr("class", "tooltip");

d3.select(self.frameElement).style("height", height + 300 + "px");
d3.select(self.frameElement).style("width", width + 20 + "px");

d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json", function (error, root) {
  if (error) throw error;

  const CATEGORIES = [];

  div.selectAll(".node")
    .data(treemap.nodes(root))
    .enter().append("div")
    .each(d => {
      if (d.category && !CATEGORIES.includes(d.category)) CATEGORIES.push(d.category);
    })
    .attr("class", "node")
    .style("left", function (d) { return d.x + "px"; })
    .style("top", function (d) { return d.y + "px"; })
    .style("width", function (d) { return Math.max(0, d.dx - 1) + "px"; })
    .style("height", function (d) { return Math.max(0, d.dy - 1) + "px"; })
    .style("background", (d) => d ? color(d.category) : null)
    .style("color", "#fff")
    .text(d => d.children ? null : d.name)
    .on("mousemove", function (d) {
      tool.style("left", d3.event.pageX + 10 + "px");
      tool.style("top", d3.event.pageY - 20 + "px");
      tool.style("display", "inline-block");
      tool.html(d.children ? null : `Name: ${d.name} <br> Genre: ${d.category} <br> Sales: ${d.value}`);
    }).on("mouseout", () => { tool.style("display", "none"); });

  legend.append('text')
    .style("position", "absolute")
    .style("text-anchor", "left")
    .attr("class", "attribution")
    .html("Genres")
    .style("left", "5px")
    .style("top", "34px");

  for (let i = 0; i < CATEGORIES.length - 1; i += 1) {
    legend.append('div')
      .attr("class","ledg")
      .style("width", "350px")
      .style("height", "15px")
      .style("color", "#fff")
      .style("left", "5px")
      .style("padding", "2px")
      .style("top", () => (55 + 25 * i) + "px")
      .text(() => CATEGORIES[i])
      .style("background", () => color(CATEGORIES[i]))
  }
});