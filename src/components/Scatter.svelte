<script>
    import * as d3 from 'd3';
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

    let vars = data.columns;
    vars.shift();
    let var_labels = {'child_mort': 'child mortality rate', 'exports': 'exports',
                    'health': 'health', 'imports': 'imports', 'income': 'income',
                    'inflation': 'inflation', 'life_expect': 'life expectancy', 
                    'total_fer': 'fertility', 'gdpp': 'GDP'};
    let axis_labels = {'child_mort': 'child mortality rate per 1000 live births',
                    'exports': 'exports per capita (dollars)',
                    'health': 'health spending per capita (dollars)',
                    'imports': 'imports per capita (dollars)',
                    'income': 'net income per person (dollars)',
                    'inflation': 'inflation (percentage)',
                    'life_expect': 'life expectancy (years)', 
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

    $: d3.select(gx).call(d3.axisBottom(x));
    $: d3.select(gy).call(d3.axisLeft(y));


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
    }


    $: console.log(data);

</script>

<div class="interactive-scatter">

    <div class='scatter-inputs'>
        <label for="xdropdown">x variable:</label>
        <select id="xdropdown" bind:value={x_var}>
            {#each vars as v}
            <option value={v}>{var_labels[v]}</option>
            {/each}
        </select>

        <label for="ydropdown">y variable:</label>
        <select id="ydropdown" bind:value={y_var}>
            {#each vars as v}
            <option value={v}>{var_labels[v]}</option>
            {/each}
        </select> 



        <label for="numComp">Number of Components:</label>
        <input id="numComp" type="number" bind:value={numComp}>

        <button on:click={clearCentroids}>Clear Centroids</button>
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
                    r=2.5
                />
            {/each}

            {#each centroids as c}
                <circle cx={x(c.x)} cy={y(c.y)} r="10" fill="red" />
            {/each}
        </g>
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
        fill: gray;
    }
</style>