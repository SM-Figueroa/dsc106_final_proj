function distance(point1, point2) {
    let sum = 0;
    for (let i = 0; i < point1.length - 1; i++) {
        sum += Math.pow(point1[i] - point2[i], 2);
    }

    return Math.sqrt(sum)
}

function assignCluster(data, centroids) {
    const clusters = new Array(centroids.length).fill().map(() => []);
    for (const point of data) {
        let minDist = Infinity;
        let closestCentroidIndex = -1;

        for (let i = 0; i < centroids.length; i++) {
            const dist = distance(point, centroids[i]);
            if (dist < minDist) {
                minDist = dist;
                closestCentroidIndex = i;
            }
        }

        clusters[closestCentroidIndex].push(point);
    }

    return clusters
}

function updateCentroids(clusters) {
    const centroids = [];
    for (const cluster of clusters) {
        if (cluster.length === 0) {
            centroids.push([]);
            continue;
        }

        const centroid = cluster[0].map((_, i) => 
        cluster.reduce((sum, current) => sum + current[i], 0) / cluster.length);

        centroids.push(centroid);
    }

    return centroids;
}

function kMeans(data, k, maxIterations=100) {
    let centroids = [];
    for (let i = 0; i < k; i++) {
        centroids.push(data[Math.floor(Math.random() * data.length)]);
    }

    let iterations = 0;
    let prevClusters = null;
    let clusters = null;

    while (iterations < maxIterations) {
        clusters = assignCluster(data, centroids);

        if (clusters.some(cluster => cluster.length === 0)) {
            break;
        }

        if (JSON.stringify(clusters) === JSON.stringify(prevClusters)) {
            break;
        }

        centroids = updateCentroids(clusters);
        prevClusters = clusters;
        iterations++;
    }

    return clusters;
}