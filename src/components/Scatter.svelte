<script>
    // imports/exports
    import * as d3 from "d3";
    import { km, hasConverged } from "../kmeans";
    import Map from "./Map.svelte";
    export let data;

    // Declare scatter plot dimensions and margins.
    const width = 1000;
    const height = 500;
    const marginTop = 65;
    const marginRight = 20;
    const marginBottom = 50;
    const marginLeft = 160;

    // Define axis variables
    let gx;
    let gy;

    // Define variables and corresponding labels
    let vars = [
        "child_mort",
        "exports",
        "health",
        "imports",
        "income",
        "inflation",
        "life_expec",
        "total_fer",
        "gdpp",
    ];
    let var_labels = {
        child_mort: "child mortality rate",
        exports: "exports",
        health: "health",
        imports: "imports",
        income: "income",
        inflation: "inflation",
        life_expec: "life expectancy",
        total_fer: "fertility",
        gdpp: "GDP",
    };
    let axis_labels = {
        child_mort: "child mortality rate per 1000 live births",
        exports: "exports per capita (dollars)",
        health: "health spending per capita (dollars)",
        imports: "imports per capita (dollars)",
        income: "net income per person (dollars)",
        inflation: "inflation (percentage)",
        life_expec: "life expectancy (years)",
        total_fer: "fertility (children born to each woman)",
        gdpp: "GDP per capita (dollars/person)",
    };

    // initial variable/centroid state
    let x_var = "health";
    let y_var = "income";

    let centroids = [];
    let numComp = 0;

    // axes
    $: x = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d[x_var]))
        .range([marginLeft, width - marginRight]);

    $: y = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d[y_var]))
        .range([height - marginBottom, marginTop]);

    $: col = d3
        .scaleOrdinal()
        .domain([0, 5])
        .range(["#5AC8FA", "#FFA500", "#008080", "#EE82EE", "#483D8B"]);

    $: d3.select(gx).call(d3.axisBottom(x));
    $: d3.select(gy).call(d3.axisLeft(y));

    // function to set cluster of all data points to 0 (no cluster)
    function clusterReset() {
        for (let i = 0; i < data.length; i++) {
            data[i]["cluster"] = 0;

            data = data.map((d) => ({ ...d }));
        }
    }
    clusterReset();

    // function to get/store centroid position and convert to scatter dimensions
    function handleClick(event) {
        if (centroids.length >= numComp) {
            return;
        }

        const svg = document.querySelector("svg");
        const rect = svg.getBoundingClientRect();

        // Convert click position to SVG coordinate space
        const x_p = event.clientX - rect.left;
        const y_p = event.clientY - rect.top;

        if (x_p >= marginLeft && x_p <= width - marginRight && y_p >= marginTop && y_p <= height - marginBottom) {
        // Use the invert function of the scales to convert pixels to data values
        const x_val = x.invert(x_p);
        const y_val = y.invert(y_p);

        centroids = [...centroids, { x: x_val, y: y_val }];

        converged = false;
        }
    }

    // function to remove all centroids/clusters from the plot
    function clearCentroids() {
        centroids = []; // Clear the array, removing all points
        converged = false;
        clusterReset();
    }

    let converged = false;
    // $: console.log(converged);

    // run one step of the kmeans algorithm (kmeans.js)
    function runkMeans() {
        if (centroids.length == 0) {
            return;
        }

        let newCentroids = km(data, centroids, x_var, y_var);

        if (hasConverged(newCentroids, centroids)) {
            // console.log("Converged");
            converged = true;
        }

        centroids = newCentroids;

        data = data.map((d) => ({ ...d }));
    }

    // tooltip dimensions
    const tooltipW = 160;
    const tooltipH = 70;
    const tooltipPaddingTop = 15;
    const tooltipPaddingLeft = 12;
    const tooltipLineHeight = 12;

    // function to keep track of mouse position over SVG
    let mousePosition = [0, 0];
    function recordMousePosition(event) {
        mousePosition = d3.pointer(event);
    }

    let selectedPoint;
    // $: console.log(selectedPoint)

    // function to show tool tip on hover
    function showTooltip(event, d) {

        const tooltipGroup = d3.select('#tooltip');
        tooltipGroup.style('opacity', 1);

        selectedPoint = d;
        // console.log(selectedPoint['country']);
    }

    // function to hide tool tip after hover
    function hideTooltip() {

        selectedPoint = null;
    }

    // Map interaction/select

    // set hover color
    function brighten(color) {
        return d3.color(color).brighter(0.7);
    }

    // function to get/brighten/enlarge scatter point corresponding to map country hovered
    function mapSelect(name) {
        // console.log(name);

        for (let i = 0; i < data.length; i++) {
            if (data[i].country == name) {
                const circle = d3.select(`#key-${i}`);
                // console.log(circle);
                circle.attr("r", 20);
                circle.attr("fill", brighten(data[i].cluster ? col(data[i].cluster) : "gray"));
                break;
            }
        }
    };

    // revert to normal after hover
    function mapDeselect(name) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].country == name) {
                const circle = d3.select(`#key-${i}`);
                // console.log(circle);
                circle.attr("r", 4);
                circle.attr("fill", data[i].cluster ? col(data[i].cluster) : "gray");
                break;
            }
        }
    }

    function handleNumCompChange(event) {
        // Get the selected value from the dropdown
        const selectedValue = parseInt(event.target.value);

        // Update the numComp variable with the selected value
        numComp = selectedValue;
    }

    
</script>

<div class = "float-container">
    <div class = "float-child1">
        <div class="interactive-scatter">

            <!-- buttons and parameters for user to play with -->
            <div class="scatter-inputs">
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
        
                <label for="numComp">Total Number of Clusters:</label>
                <select id="numComp" bind:value={numComp} on:change={handleNumCompChange}>
                    {#each Array.from({ length: 6 }, (_, i) => i) as n}
                        <option value={n}>{n}</option>
                    {/each}
                </select>
        
                <button on:click={clearCentroids}>Clear Centroids</button>
                <button on:click={runkMeans}>Run Next Iteration >> </button>
        
            </div>
        
            <!-- actual scatter plot -->
            <svg
                {width}
                {height}
                viewBox="0 0  {width} {height}"
                class="scatter"
                on:click={handleClick}
                on:pointermove={recordMousePosition}
            >
                <!-- x-axis -->
                <text y={height - 5} x={width / 2 - 70} font-size="15px">
                    {axis_labels[x_var]}
                </text>
                <g bind:this={gx} transform="translate(0,{height - marginBottom})" />
        
                <!-- y-axis -->
                <text
                    transform="rotate(-90)"
                    y={marginLeft - 50}
                    x={-height / 2 - 80}
                    font-size="15px"
                >
                    {axis_labels[y_var]}
                </text>
                <g bind:this={gy} transform="translate({marginLeft},0)" />
                <!-- points -->
                <g class="points">
                    {#each data as d, i}
                        <circle
                            id="key-{i}"
                            cx={x(d[x_var])}
                            cy={y(d[y_var])}
                            fill={d.cluster ? col(d.cluster) : "gray"}
                            r="4"
                            on:mouseover={(event) => showTooltip(event, d)}
                            on:mouseout={hideTooltip}
                        />
                    {/each}
        
                    {#each centroids as c, i}
                        <circle
                            cx={x(c.x)}
                            cy={y(c.y)}
                            r="10"
                            fill={col(i + 1)}
                            stroke="black"
                            stroke-width="5"
                        />
                    {/each}
                </g>
        
                <!-- tooltip display if not hidden -->
                {#if selectedPoint != null}
                    <g
                    class="tooltip"
                    transform="translate({mousePosition[0] - tooltipW - 5},{mousePosition[1] -
                        tooltipH})"
                    >
                        <rect width={tooltipW} height={tooltipH} fill="white" stroke="black" />
                        <g transform="translate({tooltipPaddingLeft},{tooltipPaddingTop})">
                            <text class="tooltip-name" y={tooltipLineHeight}>
                                <tspan style="font-weight: bold">{selectedPoint.country}</tspan>
                            </text>
                            <text y={tooltipLineHeight * 2.5}>
                            {var_labels[x_var]}: {Math.round(selectedPoint[x_var]*100)/100}
                            </text>
                            <text y={tooltipLineHeight * 3.75}>
                            {var_labels[y_var]}: {Math.round(selectedPoint[y_var]*100)/100}
                            </text>
                        </g>
                    </g>
                {/if}
            </svg>
            <!-- display converged message -->
            {#if converged}
                <p class = "converged">Converged!</p>
            {/if}
        </div>
        
    </div>

    <div class = "float-child2">
        <div class = "map">
            <Map {data} mapSelect={mapSelect} mapDeselect={mapDeselect} colorScale={col}/>
        </div>
    </div>
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

    .map {
        margin-top: 60px;
    }

    .converged {
        font-size: 24px;
        display: inline-block;
        margin-top: 50px;
        margin-left: 10%; /* Adjust the margin-left based on your specific layout */
        color:#007bff;
        font-weight: bold;
    }

    p {
        font-size: 16px;
        line-height: 1.5;
        color: #555;
        margin-bottom: 15px;
    }

    .float-container {
        border: 3px solid #fff;
        padding: 10px;
        display: flex;
        justify-content: space-between;
    }

    .float-child1 {
        width: 60%;
        margin: 10;
        padding: 0;
    }

    .float-child2 {
        width: 45%;
        margin: 10;
        padding: 0;
    }

        /* Styling for buttons */
    button {
        padding: 10px 20px; /* Padding for comfortable clicking area */
        margin: 5px; /* Space between buttons */
        background-color: #007bff; /* Cool blue background color */
        color: #fff; /* White text color */
        border: none; /* No border */
        border-radius: 5px; /* Rounded corners */
        font-family: 'Montserrat', sans-serif; /* Use Montserrat font */
        font-size: 16px; /* Font size */
        cursor: pointer; /* Show pointer cursor on hover */
        transition: background-color 0.3s ease; /* Smooth color transition */
    }

    /* Hover effect for buttons */
    button:hover {
        background-color: #0056b3; /* Darker blue on hover */
    }

        /* Styling for dropdowns */
    select {
        padding: 10px; /* Padding for comfortable clicking area */
        margin: 5px; /* Space between dropdowns */
        background-color: #fff; /* White background color */
        color: #333; /* Dark text color */
        border: 1px solid #007bff; /* Blue border */
        border-radius: 5px; /* Rounded corners */
        font-family: 'Montserrat', sans-serif; /* Use Montserrat font */
        font-size: 16px; /* Font size */
        cursor: pointer; /* Show pointer cursor on hover */
        transition: border-color 0.3s ease; /* Smooth border color transition */
    }

    /* Hover effect for dropdowns */
    select:hover {
        border-color: #0056b3; /* Darker blue border on hover */
    }

    /* Focus effect for dropdowns */
    select:focus {
        outline: none; /* Remove default focus outline */
        border-color: #0056b3; /* Darker blue border on focus */
    }

    /* Styling for number input */
    input[type="number"] {
        padding: 10px; /* Padding for comfortable clicking area */
        margin: 5px; /* Space between input and other elements */
        background-color: #fff; /* White background color */
        color: #333; /* Dark text color */
        border: 1px solid #007bff; /* Blue border */
        border-radius: 5px; /* Rounded corners */
        font-family: 'Montserrat', sans-serif; /* Use Montserrat font */
        font-size: 16px; /* Font size */
        cursor: pointer; /* Show pointer cursor on hover */
        transition: border-color 0.3s ease; /* Smooth border color transition */
    }

    /* Hover effect for number input */
    input[type="number"]:hover {
        border-color: #0056b3; /* Darker blue border on hover */
    }

    /* Focus effect for number input */
    input[type="number"]:focus {
        outline: none; /* Remove default focus outline */
        border-color: #0056b3; /* Darker blue border on focus */
    }

    .tooltip text {
    font-size: 14px; /* Adjust the font size as needed */
    line-height: 1.5; /* Increase line height for more space between lines */
    }


</style> 
