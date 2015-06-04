function map() {

    var selectedCountry = undefined;
    var selectedCountryId = undefined;
    var clickCallback = function(string){};
    var redraw;
	var width = 1200;
	var height = width / 1.5;

    var write = function(){
        console.log("DISPTACKHA JFKA");
    };

    var chart = function () {
        d3.select(window).on("resize", throttle);

        var zoom = d3.behavior.zoom().scaleExtent([1, 9]).on("zoom", move);

        var topo, projection, path, svg, g;
        var dispatch = d3.dispatch("draw");

        var tooltip = d3.select("#map").append("div").attr("class", "tooltip hidden");

        setup(width, height);

        function setup(width, height) {
            //projection = d3.geo.mercator().translate([(width / 2), (height / 2)]).scale(width / 2 / Math.PI);
			projection = d3.geo.mercator().translate([(width/2), (height-250)]).scale(width / 2 / Math.PI);
            path = d3.geo.path().projection(projection);
            svg = d3.select("#map").append("svg").attr("width", width).attr("height", height); //.call(zoom);//.on("click", click).append("g");
            g = svg.append("g");
        }

        d3.json("data/world-topo.json", function (error, world) {
            var countries = topojson.feature(world, world.objects.countries).features;

            topo = countries;
            draw(topo);

        });

        function draw(topo) {

            var country = g.selectAll(".country").data(topo);

            var vMax = d3.max(topo, function (d) {
                return +d.properties.le;
            });
            var vMin = d3.min(topo, function (d) {
                return +d.properties.le;
            });

            var colorScale = d3.scale.linear()
                .range([0, 255.])
                .domain([vMin, vMax]);

            country.enter().insert("path")
                .attr("class", "country")
                .attr("d", path)
                .attr("id", function (d, i) {
                    var name = d.properties.name.replace(/\s/g, '');
                    return name;
                })
                .attr("title", function (d, i) {
                    return d.properties.name;
                })
                .attr("life", function (d, i) {
                    return d.properties.le;
                })
                .style("fill", function (d, i) {
                    if (d.properties.le === undefined) {
                        return "rgba(255,0,255,0.5)";
                    }
                    if(selectedCountry === d.properties.name)
                    {
                        return "rgba(255,255,0,1)";
                    }
                    return "rgba(" + Math.floor(colorScale(d.properties.le)) + ", " + Math.floor(colorScale(d.properties.le)) + ", " + Math.floor(colorScale(d.properties.le)) + ", 1)";
                });
            // Remove Antarctica
            g.select("#Antarctica").remove();

            //offsets for tooltips
            var offsetL = document.getElementById('map').offsetLeft + 20;
            var offsetT = document.getElementById('map').offsetTop + 10;

            //tooltips
            country.on("mousemove", function (d, i) {

                var mouse = d3.mouse(svg.node()).map(function (d) {
                    return parseInt(d);
                });

                tooltip.classed("hidden", false).attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px").html(d.properties.name + " " + d.properties.le)

            })
                .on("mouseout", function (d, i) {
                    tooltip.classed("hidden", true);
                })
                .on("mousedown", function(d,i) {
                    g.select("#"+selectedCountryId).style("fill",function (d, i) {
                        return "rgba(" + Math.floor(colorScale(d.properties.le)) + ", " + Math.floor(colorScale(d.properties.le)) + ", " + Math.floor(colorScale(d.properties.le)) + ", 1)";
                    });
                    var id = d.properties.name.replace(/\s/g, '');
                    selectedCountry = d.properties.name;
                    selectedCountryId = id;
                    g.select("#" + id).style("fill","rgba(255,255,0,1)");
                    console.log("Clicked country:");
                    clickCallback(id);

                    //redraw();
                });

        }


        redraw = function() {
            //width = document.getElementById('container').offsetWidth;
            //height = width / 2;
            console.log("REDRAWING");
            d3.select('svg').remove();
            setup(width, height);
            draw(topo);
        };


        function move() {
            /*
            var t = d3.event.translate;
            var s = d3.event.scale;
            zscale = s;
            var h = height / 4;


            t[0] = Math.min(
                (width / height) * (s - 1),
                Math.max(width * (1 - s), t[0])
            );

            t[1] = Math.min(
                h * (s - 1) + h * s,
                Math.max(height * (1 - s) - h * s, t[1])
            );

            zoom.translate(t);
            g.attr("transform", "translate(" + t + ")scale(" + s + ")");

            //adjust the country hover stroke width based on zoom level
            d3.selectAll(".country").style("stroke-width", 1.5 / s);
            */

        }


        var throttleTimer;

        function throttle() {
           /* window.clearTimeout(throttleTimer);
            throttleTimer = window.setTimeout(function () {
                redraw();
            }, 200);*/
        }


        //geo translation on mouse click in map
        function click() {
            /*var latlon = projection.invert(d3.mouse(this));
            console.log(latlon);*/
        }

    };


    chart.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.clickCallback = function (value) {
        if (!arguments.length) return clickCallback;
        clickCallback = value;
        return chart;
    };

    chart.selectedCountry = function (value) {
        if (!arguments.length) return selectedCountry;
        selectedCountry = value;
        return chart;
    };

    chart.redrawFunction = function (value) {
        if (!arguments.length) return redraw;
        return chart;
    };

    return chart;
}