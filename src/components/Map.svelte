<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    let mapContainer;
  
    onMount(async () => {
      const response = await fetch('https://raw.githubusercontent.com/SM-Figueroa/dsc106_final_proj/main/static/world_map.geo.json');
      const data = await response.json();
  
      const width = 960;
      const height = 500;
  
      const projection = d3.geoMercator()
        .translate([width / 2, height / 2])
        .scale(100);
  
      const path = d3.geoPath().projection(projection);
  
      const svg = d3.select(mapContainer)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
  
      svg.selectAll('path')
        .data(data.features)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', 'lightgray')
        .attr('stroke', 'white');
    });
  </script>
  
  <div bind:this={mapContainer}></div>
  