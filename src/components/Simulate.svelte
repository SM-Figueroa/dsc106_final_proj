<script>
    import * as d3 from 'd3';


    function generateMultivariateNormal(meanX, meanY, varianceX, varianceY, covarianceXY, n, group) {
        // Calculate the Cholesky decomposition of the covariance matrix
        const a11 = Math.sqrt(varianceX);
        const a21 = covarianceXY / Math.sqrt(varianceX);
        const a22 = Math.sqrt(varianceY - (covarianceXY * covarianceXY) / varianceX);
        
        const points = [];

        for (let i = 0; i < n; i++) {
            // Generate two independent standard normal variables (using Box-Muller)
            let u1 = 0, u2 = 0;
            while(u1 === 0) u1 = Math.random();
            while(u2 === 0) u2 = Math.random();
            
            let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            let z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

            // Transform the standard normals into the desired multivariate normals
            let x = meanX + a11 * z0;
            let y = meanY + a21 * z0 + a22 * z1;

            points.push({x, y, group});
        }

        return points;
    }

    let distributions = [
        { meanX: 0, meanY: 0, varianceX: 1, varianceY: 1, covarianceXY: 0, n: 100 }
    ];

    function addDistribution() {
        distributions.push({ meanX: 0, meanY: 0, varianceX: 1, varianceY: 1, covarianceXY: 0, n: 100 });
        distributions = distributions;
    }

    function removeDistribution(index) {
        distributions.splice(index, 1);
        distributions = distributions;
    }

    function generatePoints(distributions, len) {
        
        let result = [];

        console.log(distributions[0].meanX);

        for (let i = 0; i < distributions.length; i++) {
            
            let points = generateMultivariateNormal(distributions[i].meanX, distributions[i].meanY, distributions[i].varianceX, distributions[i].varianceY, distributions[i].covarianceXY, distributions[i].n, i);
            // console.log(points);
            result = result.concat(points);
            // console.log(result);
        }

        return result;
    }

    let data = [];
    $: data = generatePoints(distributions, distributions.length);


    let gx;
    let gy;
  
    // graph dimensions
    const width = 928;
    const height = 600;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;

    // axes
    $: x = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d.x))
        .range([marginLeft, width-marginRight]);
  
    $: y = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d.y))
        .range([height - marginBottom, marginTop]);


    $: c = d3
        .scaleOrdinal(d3.schemeTableau10);

    $: d3.select(gx).call(d3.axisBottom(x));
    $: d3.select(gy).call(d3.axisLeft(y));


    $: console.log(data);
  
  </script>
  
  
<div class="simulated-data">

    <div class="inputs">

        <button on:click={addDistribution}>Add Distribution</button>

        {#each distributions as distribution, index}
            <div>
                <h5>Distribution {index + 1}</h5>
                <button on:click={() => removeDistribution(index)}>Remove</button>

                <label for={`meanX-${index}`}>Mean X:</label>
                <input id={`meanX-${index}`} type="number" bind:value={distribution.meanX}>

                <label for={`meanY-${index}`}>Mean Y:</label>
                <input id={`meanY-${index}`} type="number" bind:value={distribution.meanY}>

                <label for={`varianceX-${index}`}>Variance X:</label>
                <input id={`varianceX-${index}`} type="number" bind:value={distribution.varianceX}>

                <label for={`varianceY-${index}`}>Variance Y:</label>
                <input id={`varianceY-${index}`} type="number" bind:value={distribution.varianceY}>

                <label for={`covarianceXY-${index}`}>Covariance XY:</label>
                <input id={`covarianceXY-${index}`} type="number" bind:value={distribution.covarianceXY}>

                <label for={`n-${index}`}>Number of Points (n):</label>
                <input id={`n-${index}`} type="number" bind:value={distribution.n}>
            </div>
        {/each}
    </div>
    
    <svg
    {width}
    {height}
    viewBox="0 0  {width} {height}"
    class="scatter"
    >
        <!-- x-axis -->
        <g bind:this={gx} transform="translate(0,{height - marginBottom})" />
        <!-- y-axis -->
        <g bind:this={gy} transform="translate({marginLeft},0)"/>
        <!-- points -->
        <g class="points">
            {#each data as d, i}
                <circle
                    key={i}
                    cx={x(d.x)}
                    cy={y(d.y)}
                    fill={c(d.group*10)}
                    r=2.5
                />
            {/each}
        </g>
    </svg>
</div>
  
  <style>
    /* svg object of graph */
    .scatter {
        max-width: 100%;
        height: auto;
    }
    
    /* points group */
    .points {
        stroke: "#000";
        stroke-opacity: "0.2";
        fill: red;
    }
  </style>