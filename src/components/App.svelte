<script>
  import Scatter from "./Scatter.svelte";
  import Map from "./Map.svelte";
  import * as d3 from 'd3';
  import { onMount } from 'svelte';


  // load dataframe here
    let data = [];

    onMount(async () => {

        const res = await fetch('https://raw.githubusercontent.com/SM-Figueroa/dsc106_final_proj/main/static/country_data_transformed.csv'); 

        const csv = await res.text();

        data = d3.csvParse(csv, d3.autoType);

        // console.log(data);

    });


</script>

<main>
  <h1>K-Means Clustering Sanbox</h1>

  <p>
    Visualized below is a dataset of livelihood statistics, 
    where each point on the scatter plot represents a country. 
    Change the x and y variables to visualize unique trends between these statistics.
  </p>

  <p>
    There's also an option to set a number of components or groups to cluster the data by. 
    After setting this value you can click on any point on the graph to draw centroids. 
  </p>

  <p>
    In the future, we plan use the choices of variables and centroids to perform a clustering algorithm
    that will color code the points of the scatter plot by each cluster.
  </p>

  <Scatter {data}/>
  
</main>

<style>
  /* Write your CSS here */
</style>
