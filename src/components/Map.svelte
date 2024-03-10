<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    let mapContainer;
  
    onMount(async () => {
      const response = await fetch('https://raw.githubusercontent.com/SM-Figueroa/dsc106_final_proj/main/static/world_map.geo.json');
      const data = await response.json();

      const clusters_response = await fetch('https://raw.githubusercontent.com/SM-Figueroa/dsc106_final_proj/main/static/clustered_data_with_country.json');
      const clusters_data = await clusters_response.json()
  
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

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        const countryClusterMap = {};
        clusters_data.forEach(cluster => {
          cluster.countries.forEach(country => {
            countryClusterMap[country] = cluster.cluster;
          });
        });
  
      svg.selectAll('path')
        .data(data.features)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', d => colorScale(countryClusterMap[d.properties.name]))
        .attr('stroke', 'white');
    });
  </script>
  
  <div bind:this={mapContainer}></div>
  