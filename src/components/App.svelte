<script>
  import Scatter from "./Scatter.svelte";
  import * as d3 from 'd3';
  import { onMount } from 'svelte';


  // load dataframe here
    let data = [];

    onMount(async () => {

        const res = await fetch('https://raw.githubusercontent.com/SM-Figueroa/dsc106_final_proj/main/static/country_data_transformed.csv'); 

        const csv = await res.text();

        data = d3.csvParse(csv, d3.autoType);

        console.log(data);

    });


</script>

<main>
  <h1>DSC106 Final Project Prototype</h1>
  <h3>Country Clustering</h3>

  <Scatter {data}/>
</main>

<style>
  /* Write your CSS here */
</style>
