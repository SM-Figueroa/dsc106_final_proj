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
  <h1>K-Means Clustering Sandbox</h1>
  <h3>Country Clustering</h3>

  <p>
    We’ve all heard about k-means clustering as data scientists, but have you ever wondered what it looks like step-by-step? Therefore, to answer this question, we’ve created a highly customizable sandbox to view k-mean’s behavior step-by-step. Welcome to the k-means clustering sandbox! The visualization below demonstrates k-means iteration by iteration on a dataset of livelihood statistics of countries.
  </p>

  <p>
    You can choose your x-variable and y-variable in the dropdowns below. You also can choose the number of clusters you would like in the “Total Number of Clusters” dropdown. Click on the scatterplot in the locations you want to initialize your centroids. Make sure to match the number of “clicked” centroids with the number of centroids you chose in the “Number of Clusters” dropdown. Once you do that, press the “Run Next Iteration >>” button until you see the word “Converged!” below the x-axis title. When you want to reset, just click the “Clear Centroids” button. 
  </p>

  <p>
    The output to the right is a map of the countries and clusters they are a part of. The map adjusts per iteration, so you will be able to see the countries change color as the iterations move forward! Additionally, you can hover over countries on the map to see their corresponding data point on the scatter plot!
  </p>

  <p>
    Have fun as you explore! Try clustering on different x and y variable combinations, number of clusters, and initial centroids and takeaway how these factors influence the behavior of one of the most popular unsupervised machine learning algorithms in data science! You may also learn about different countries and how they stack up against each other based on your input variables.
  </p>

  <Scatter {data}/>

  <p>
    ** Note: Not all countries are included in the dataset. Therefore, even while clustering, some countries on the map will remain gray throughout the clustering process. This is fine and not an error. There also may be smaller-sized countries that are not visible by color on the map during clustering. 
  </p>

  <p>
    In general, try choosing centroids along the general shape of data for the best results!
  </p>

  <p>
    Check out our <a href = "https://youtu.be/FXYI2zJfkdc">Video</a>!
  </p>
  
</main>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

  main {
      font-family: 'Montserrat', sans-serif;
      margin: 0 auto;
      padding: 10px;
      text-align: center;
  }

  h1 {
      font-size: 36px; /* Larger font size for headings */
      color: #333;
      margin-bottom: 20px;
  }

  h3 {
      font-size: 24px;
      font-weight: 700; /* Bold font weight for emphasis */
      color: #666;
      margin-bottom: 10px;
  }

  p {
      font-size: 18px; /* Slightly larger font size for paragraphs */
      line-height: 1.5;
      color: #555;
      margin-bottom: 15px;
      text-align: left;
  }

</style>
