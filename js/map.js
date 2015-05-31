function map() {
	var chart = function() {
		d3.select(window).on("resize", throttle);

		var zoom = d3.behavior.zoom().scaleExtent([1, 9]).on("zoom", move);

		var width = document.getElementById('container').offsetWidth;
		var height = width / 2;

		var topo,projection,path,svg,g;

		var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");

		setup(width,height);

		function setup(width,height){
			projection = d3.geo.mercator().translate([(width/2), (height/2)]).scale( width / 2 / Math.PI);
			path = d3.geo.path().projection(projection);
			svg = d3.select("#container").append("svg").attr("width", width).attr("height", height).call(zoom).on("click", click).append("g");
			g = svg.append("g");
		}

		d3.json("data/world-topo.json", function(error, world) {
			var countries = topojson.feature(world, world.objects.countries).features;
			topo = countries;
			draw(topo);

		});

function draw(topo) {
  var country = g.selectAll(".country").data(topo);

  country.enter().insert("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("id", function(d,i) { return d.id; })
      .attr("title", function(d,i) { return d.properties.name; })
	  .attr("life", function(d,i) { return d.properties.le; })
      .style("fill", function(d) {
			if(d.properties.le > 30 && d.properties.le <= 40){
				return "white";
			}
			else if(d.properties.le >= 41 && d.properties.le <= 44){
				return "#FFE6E6";
			}
			else if(d.properties.le >= 45 && d.properties.le <= 49){
				return "#FFCCCC";
			}
			else if(d.properties.le >= 50 && d.properties.le <= 54){
				return "#FFB2B2";
			}
			else if(d.properties.le >= 55 && d.properties.le <= 59){
				return "#FF9999";
			}
			else if(d.properties.le >= 60 && d.properties.le <= 63){
				return "#FF8080";
			}
			else if(d.properties.le >= 64 && d.properties.le <= 67){
				return "#FF6666";
			}
			else if(d.properties.le >= 68 && d.properties.le <= 71){
				return "#FF4D4D";
			}
			else if(d.properties.le >= 72 && d.properties.le <= 75){
				return "#FF3333";
			}
			else if(d.properties.le >= 76 && d.properties.le <= 79){
				return "#FF1919";
			}
			else if(d.properties.le >= 80 && d.properties.le <= 84){
				return "red";
			}
			else{
				return "black";
			}
			
		});

  //offsets for tooltips
  var offsetL = document.getElementById('container').offsetLeft+20;
  var offsetT = document.getElementById('container').offsetTop+10;

  //tooltips
  country.on("mousemove", function(d,i) {

      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

      tooltip.classed("hidden", false).attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px").html(d.properties.name + " " + d.properties.le)

      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true);
      }); 

}


function redraw() {
  width = document.getElementById('container').offsetWidth;
  height = width / 2;
  d3.select('svg').remove();
  setup(width,height);
  draw(topo);
}


function move() {

  var t = d3.event.translate;
  var s = d3.event.scale; 
  zscale = s;
  var h = height/4;


  t[0] = Math.min(
    (width/height)  * (s - 1), 
    Math.max( width * (1 - s), t[0] )
  );

  t[1] = Math.min(
    h * (s - 1) + h * s, 
    Math.max(height  * (1 - s) - h * s, t[1])
  );

  zoom.translate(t);
  g.attr("transform", "translate(" + t + ")scale(" + s + ")");

  //adjust the country hover stroke width based on zoom level
  d3.selectAll(".country").style("stroke-width", 1.5 / s);

}



var throttleTimer;
function throttle() {
  window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
      redraw();
    }, 200);
}


	//geo translation on mouse click in map
	function click() {
		var latlon = projection.invert(d3.mouse(this));
		console.log(latlon);
	}
	
	};	
	
	 return chart;
};