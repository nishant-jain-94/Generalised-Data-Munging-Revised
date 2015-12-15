$("#visualize").on('click',function() {
  console.log("Something");
  var filename = $('#filename').val();
  console.log(filename);
  $.getJSON(filename,function(data) {
    console.log(data);
    visualize(data);
  });
});

var visualize = function(visualizer) {
  var vis = d3.select("#visualization");
  var margin = { top:100, right:100, bottom:100, left:100 };
  var height = 800;
  var width = 3000;
  var padding = 2;

  width = visualizer.data_domain.length * 10;

  var colorScale = d3.scale.linear().domain([d3.min(visualizer.data_domain,function(d) {
    return parseFloat(d[visualizer.data_rep.y_criteria]);
  }),d3.max(visualizer.data_domain,function(d) {
    return parseFloat(d[visualizer.data_rep.y_criteria]);
  })]).range(['#0075B4', '#70B5DC']);

  var xScale = d3.scale.ordinal()
    .rangeRoundBands([margin.left,width-margin.right])
    .domain(visualizer.data_domain.map(function(d) {
      return d[visualizer.data_rep.x_criteria];
    }));

  var yScale = d3.scale.linear()
    .range([height-margin.top,margin.bottom])
    .domain([d3.min(visualizer.data_domain,function(d) {
      var blah = (parseFloat(d[visualizer.data_rep.y_criteria]));
      return parseFloat(parseFloat(d[visualizer.data_rep.y_criteria]).toFixed(2));
    }),d3.max(visualizer.data_domain,function(d) {
      return parseFloat(parseFloat(d[visualizer.data_rep.y_criteria]).toFixed(2));
    })]);

  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

  var yAxis = d3.svg.axis().scale(yScale).orient("left");

  d3.select("#visualization").attr('width',width).attr('height',height).selectAll('rect')
    .data(visualizer.data_domain)
    .enter()
    .append('rect')
    .attr('x',function(d){
      return xScale(d[visualizer.data_rep.x_criteria]);
    })
    .attr('y',function(d) {
      return yScale(d[visualizer.data_rep.y_criteria]);
    })
    .attr('width',3)
    .attr('height',function(d) {
      return ((height-margin.bottom)-yScale(parseFloat(parseFloat(d[visualizer.data_rep.y_criteria]).toFixed(2))));
    })
    .attr('fill',function(d) {
      return colorScale(d);
    });

  d3.select("#visualization").append("g").attr("transform","translate(0,"+(height-margin.bottom)+")").call(xAxis).selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-90)" );

  d3.select("#visualization").append("g").attr("transform","translate(0"+(margin.left)+")").call(yAxis).selectAll("text")
    .style("text-anchor","end");
};
