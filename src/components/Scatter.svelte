<script>
    import * as d3 from 'd3';
    import { km } from '../kmeans';
    import Map from "./Map.svelte";
    export let data;

    // Declare the chart dimensions and margins.
    const width = 800;
    const height = 450;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 50;
    const marginLeft = 80;

    let gx;
    let gy;

    let vars = ['child_mort', 'exports', 'health', 'imports', 
                'income', 'inflation', 'life_expec', 'total_fer', 'gdpp'];
    let var_labels = {'child_mort': 'child mortality rate', 'exports': 'exports',
                    'health': 'health', 'imports': 'imports', 'income': 'income',
                    'inflation': 'inflation', 'life_expec': 'life expectancy', 
                    'total_fer': 'fertility', 'gdpp': 'GDP'};
    let axis_labels = {'child_mort': 'child mortality rate per 1000 live births',
                    'exports': 'exports per capita (dollars)',
                    'health': 'health spending per capita (dollars)',
                    'imports': 'imports per capita (dollars)',
                    'income': 'net income per person (dollars)',
                    'inflation': 'inflation (percentage)',
                    'life_expec': 'life expectancy (years)', 
                    'total_fer': 'fertility (children born to each woman)',
                    'gdpp': 'GDP per capita (dollars/person)'};

    let x_var = 'health';
    let y_var = 'income';

    let centroids = [];
    let numComp = 0;

    // axes
    $: x = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d[x_var]))
        .range([marginLeft, width-marginRight]);
  
    $: y = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d[y_var]))
        .range([height - marginBottom, marginTop]);

    $: col = d3
        .scaleOrdinal()
        .domain([0, 5])
        .range(['#5AC8FA', '#FFA500', '#008080', '#EE82EE', '#483D8B']);

    $: d3.select(gx).call(d3.axisBottom(x));
    $: d3.select(gy).call(d3.axisLeft(y));


    function clusterReset () {

        for (let i = 0; i < data.length; i++) {

            data[i]['cluster'] = 0;

            data = data.map(d => ({...d}));
        }
    }
    clusterReset();

    // Function to handle click event on the SVG
    function handleClick(event) {

        if (centroids.length >= numComp) {
            return;
        }

        const svg = document.querySelector('svg');
        const rect = svg.getBoundingClientRect();

        // Convert click position to SVG coordinate space
        const x_p = event.clientX - rect.left;
        const y_p = event.clientY - rect.top;

        // Use the invert function of the scales to convert pixels to data values
        const x_val= x.invert(x_p);
        const y_val = y.invert(y_p);

        console.log(`Data Coordinates: X=${x_val}, Y=${y_val}`);

        centroids = [...centroids, {x: x_val, y: y_val}];

    }

    function clearCentroids() {
        centroids = []; // Clear the array, removing all points
        clusterReset();
    }

    let converged = false;

    // kmeans stuff
    function runkMeans() {

        if (centroids.length == 0) {
            return;
        }
        
        centroids = km(data, centroids, x_var, y_var);

        if (centroids == -1) {
            converged = true;
        }

        data = data.map(d => ({...d}));
    }

    //$: console.log(data);

</script>

<div class="interactive-scatter">

    <div class='scatter-inputs'>
        <label for="xdropdown">x variable:</label>
        <select id="xdropdown" bind:value={x_var} on:change={clearCentroids}>
            {#each vars as v}
            <option value={v}>{var_labels[v]}</option>
            {/each}
        </select>

        <label for="ydropdown">y variable:</label>
        <select id="ydropdown" bind:value={y_var} on:change={clearCentroids}>
            {#each vars as v}
            <option value={v}>{var_labels[v]}</option>
            {/each}
        </select> 



        <label for="numComp">Number of Components:</label>
        <input id="numComp" type="number" bind:value={numComp} max="5" min="0">

        <button on:click={clearCentroids}>Clear Centroids</button>
        <button on:click={runkMeans}>Run K-Means Clustering</button>
    </div>

    <svg
    {width}
    {height}
    viewBox="0 0  {width} {height}"
    class="scatter"
    on:click={handleClick}
    >
        <!-- x-axis -->
        <text 
            y={height - 5}
            x={width/2 - 70}
            font-size=15px
            >
            {axis_labels[x_var]}
        </text>
        <g bind:this={gx} transform="translate(0,{height - marginBottom})"/>

        <!-- y-axis -->
        <text 
            transform="rotate(-90)"
            y={marginLeft - 50}
            x={-height/2 - 80}
            font-size=15px
            >
            {axis_labels[y_var]}
        </text>
        <g bind:this={gy} transform="translate({marginLeft},0)" />
        <!-- points -->
        <g class="points">
            {#each data as d, i}
                <circle
                    key={i}
                    cx={x(d[x_var])}
                    cy={y(d[y_var])}
                    fill={d.cluster ? col(d.cluster) : 'gray'}
                    r=2.5
                />
            {/each}

            {#each centroids as c, i}
                <circle cx={x(c.x)} cy={y(c.y)} r="10" fill={col(i+1)} stroke="black" stroke-width=5/>
            {/each}
        </g>
        {#if converged}
            <p>Converged</p>
        {/if}
    </svg>
</div>

<style>
    .scatter {
        max-width: 100%;
        height: auto;
    }
    
    /* points group */
    .points {
        stroke: "#000";
        stroke-opacity: "0.2";
    }
</style>

<Map {data} />