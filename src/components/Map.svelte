<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  export let data;

  let mapContainer;
  let svg;
  let clustersDict = {};
  const colorScale = d3.scaleOrdinal()
      .domain([0, 5])
      .range(['#5AC8FA', '#FFA500', '#008080', '#EE82EE', '#483D8B']);

  onMount(async () => {
    const response = await fetch('https://raw.githubusercontent.com/SM-Figueroa/dsc106_final_proj/main/static/world_map.geo.json');
    const jsonData = await response.json();

    const width = 960;
    const height = 500;

    const projection = d3.geoMercator()
      .translate([width / 2, height / 2])
      .scale(100);

    const path = d3.geoPath().projection(projection);

    svg = d3.select(mapContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg.selectAll('path')
      .data(jsonData.features)
      .enter().append('path')
      .attr('d', path)
      .attr('fill', "grey")
      .attr('stroke', 'white');
  });

  $: {
    if (svg && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        clustersDict[data[i]["country"]] = data[i]["cluster"];
      }
      console.log(clustersDict);

      svg.selectAll('path')
        .attr('fill', d => colorScale(clustersDict[d.properties.name]));
    } else {
      console.log("Initialized");
    }
  }
</script>

<div bind:this={mapContainer}></div>