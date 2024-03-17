<script>
  // imports/exports
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  export let data;
  export let mapSelect;
  export let mapDeselect;
  export let colorScale;
  
  // initial state
  let mapContainer;
  let svg;
  let clustersDict = {};

  onMount(async () => {
    // fetch geojson
    const response = await fetch('https://raw.githubusercontent.com/SM-Figueroa/dsc106_final_proj/main/static/world_map.geo.json');
    const jsonData = await response.json();

    // map dims
    const width = 960;
    const height = 500;

    // create map
    const projection = d3.geoMercator()
      .translate([width / 2, height / 2])
      .scale(100);

    const path = d3.geoPath().projection(projection);

    svg = d3.select(mapContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // create paths with hover functionality
    svg.selectAll('path')
      .data(jsonData.features)
      .enter().append('path')
      .attr('d', path)
      .attr('fill', "grey")
      .attr('stroke', 'white')
      .on('mouseover', function(event, d) {
            const name = d.properties.name;
            d3.select(this)
              .attr('fill', brighten(clustersDict[name] > 0 ? colorScale(clustersDict[name]) : "gray"));
            mapSelect(name);
          })
      .on('mouseout', function(event, d) {
          const name = d.properties.name;
          d3.select(this)
            .attr('fill', clustersDict[name] > 0 ? colorScale(clustersDict[name]) : "gray");
          mapDeselect(name);
      })


  });

  function brighten(color) {
    return d3.color(color).brighter(0.7);
  }
  
  // update map with cluster denominations
  $: {
    if (svg && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        clustersDict[data[i].country] = data[i]["cluster"];
      }

      svg.selectAll('path')
        .attr('fill', d => clustersDict[d.properties.name] > 0 ? colorScale(clustersDict[d.properties.name]) : "gray");
    } else {
      // console.log("Initialized");
    }
  }
</script>

<div bind:this={mapContainer}></div>
