/**
 * Created by Nathan on 6/4/2015.
 */

var navMap = function() {
    var width = 500,
        height = 400;

    var callBack = function(continent) {
        console.log(continent + " Pressed");
    };

    var navMapChart = function() {

        var mygeo = d3.geo;

        var options = [
            {name: "Eckert III", projection: d3.geo.eckert3().scale(100)},
            {name: "Eckert IV", projection: d3.geo.eckert4().scale(100)},
            {name: "Wagner IV", projection: d3.geo.wagner4().scale(100)},
            {name: "Winkel Tripel", projection: d3.geo.winkel3().scale(100)}
        ];

        options.forEach(function (o) {
            o.projection.rotate([0, 0]).center([0, 0]);
        });


        var interval = setInterval(loop, 3000),
            i = 0,
            n = options.length - 1;


        var projection = options[i].projection;

        var path = d3.geo.path().projection(projection);

        var graticule = d3.geo.graticule();

        var svg = d3.select("#navMap").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id","nMap");


        svg.append("path")
            .datum(graticule)
            .attr("fill","rgba(0,0,0,0)")
            .attr("id", "graticule")
            .attr("d", path);


        var tooltip = d3.select("#navMap").append("div").attr("class", "tooltip hidden");

        var continents;

        d3.json("data/continent-geogame-110m.json", function (error, world) {

            var countries = topojson.feature(world, world.objects.countries);

            //feature collections only have type, id, and name so i would not sitck properties in there but i dont think its invalid!
            //http://geojson.org/geojson-spec.html#introduction
            var asia = {
                type: "FeatureCollection",
                name: "Asia",
                color: "#ffbb78",
                id: 1,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "Asia";
                })
            };
            var africa = {
                type: "FeatureCollection",
                name: "Africa",
                color: "#2ca02c",
                id: 2,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "Africa";
                })
            };
            var europe = {
                type: "FeatureCollection",
                name: "Europe",
                color: "#ff7f0e",
                id: 3,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "Europe";
                })
            };
            var na = {
                type: "FeatureCollection",
                name: "North America",
                color: "#1f77b4",
                id: 4,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "North America";
                })
            };
            var sa = {
                type: "FeatureCollection",
                name: "South America",
                color: "#d62728",
                id: 5,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "South America";
                })
            };
            /*var antarctica = {
                type: "FeatureCollection",
                name: "Antarctica",
                color: "#98df8a",
                id: 6,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "Antarctica";
                })
            };*/
            var oceania = {
                type: "FeatureCollection",
                name: "Oceania",
                color: "#aec7e8",
                id: 7,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "Oceania";
                })
            };
            //skipped: Seven seas (open ocean) - only applies to French Southern and Antarctic Lands

            continents = [asia, africa, europe, na, sa, oceania];


            //var continent = g.selectAll(".continent").data(continents);
            var continent = svg.selectAll(".continent").data(continents);

            continent.enter().insert("path")
                .attr("class", "continent")
                .attr("d", path)
                .attr("id", function (d, i) {
                    return d.name.replace(/\s/g, '');
                })
                .attr("title", function (d, i) {
                    return d.name;
                })
                .style("fill", function (d, i) {
                    return d.color;
                });



            var offsetL = document.getElementById('nMap').offsetLeft + 20;


            continent
                .on("mousemove", function (d, i) {
                    var offsetT = document.getElementById('nMap').offsetTop + 10;
                    var mouse = d3.mouse(svg.node()).map(function (d) {
                        return parseInt(d);
                    });
                    tooltip
                        .classed("hidden", false)
                        .attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT
                        ) + "px")
                        .html(d.name);
                })
                .on("mouseout", function (d, i) {
                    tooltip.classed("hidden", true)
                })
                .on("mousedown", function(d,i) {
                    d3.selectAll(".continent").classed("selected", false);
                    d3.select("#"+ d.name.replace(/\s/g, '')).classed("selected", true);
                    callBack(d.name.replace(/\s/g, ''));
                });

        });


        var menu = d3.select("#projection-menu").on("change", change);

        menu.selectAll("option")
            .data(options)
            .enter().append("option")
            .text(function (d) {
                return d.name;
            });

        function loop() {
            /*
            var j = Math.floor(Math.random() * n);
            if (j < 43) {
                menu.property("selectedIndex", i = j + (j >= i));
                update(options[i]);
            }
            */
        }

        function change() {
            clearInterval(interval);
            update(options[this.selectedIndex]);
        }

        function update(option) {
            svg.selectAll("path").transition()
                .duration(750)
                .attrTween("d", projectionTween(projection, projection = option.projection));
        }

        function projectionTween(projection0, projection1) {
            return function (d) {
                var t = 0;

                var projection = d3.geo.projection(project)
                    .scale(1)
                    .translate([width / 2, height/1.7]);

                path = d3.geo.path().projection(projection);

                function project(λ, φ) {
                    λ *= 180 / Math.PI, φ *= 180 / Math.PI;
                    var p0 = projection0([λ, φ]), p1 = projection1([λ, φ]);
                    return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]];
                }

                return function (_) {
                    t = _;
                    return path(d);
                };
            };
        }
        update(options[0]);
    };

    navMapChart.callBack = function(value) {
        if(!arguments.length) return callBack;
        callBack = value;
        return navMapChart;
    };

    navMapChart.width = function(value) {
        if(!arguments.length) return width;
        width = value;
        return navMapChart;
    };

    navMapChart.height = function(value) {
        if(!arguments.length) return height;
        height = value;
        return navMapChart;
    };

    return navMapChart;
};