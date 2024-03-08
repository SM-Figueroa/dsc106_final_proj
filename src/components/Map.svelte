const svg = d3.select("svg");
d3.json("component\\world_map.geo.json").then(function(geojson) {
    const projection = d3.geoMercator().fitSize([800, 600], geojson);
    const path = d3.geoPath().projection(projection);

    svg.selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "steelblue")
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
});