import fs from 'fs';
import csv from 'csv-parser';

function kmeans(data, init_centroids, maxIterations = 1000) {
    let centroids = init_centroids.slice(); // Copy the initial centroids
    let prevCentroids = [centroids.map(centroid => centroid.slice())]; // Store initial centroids
    let clusters; // Initialize clusters here

    for (let iter = 0; iter < maxIterations; iter++) {
        // Assign points to clusters
        clusters = assignPointsToClusters(data, centroids);

        // Calculate new centroids
        const newCentroids = calculateCentroids(clusters);
        if (hasConverged(newCentroids, centroids)) {
            break;
        }
        
        prevCentroids.push(newCentroids.map(centroid => centroid.slice())); // Store unique previous centroids
        centroids = newCentroids;
    }

    // Filter out duplicate previous centroids
    prevCentroids = prevCentroids.filter((centroid, index) => 
        index === prevCentroids.findIndex(c => arraysEqual(c, centroid))
    );

    return { clusters, centroids, all_centroids: prevCentroids };
}

function hasConverged(centroids, prevCentroids) {
    for (let i = 0; i < centroids.length; i++) {
      if (!arraysEqual(centroids[i], prevCentroids[i])) {
        return false;
      }
    }
    return true;
}
  
function assignPointsToClusters(data, centroids) {
    const clusters = new Array(centroids.length).fill().map(() => []);
  
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const closestCentroidIndex = findClosestCentroidIndex(point, centroids);
      clusters[closestCentroidIndex].push(point);
    }
  
    return clusters;
}
  
function findClosestCentroidIndex(point, centroids) {
    let minDistance = Infinity;
    let closestIndex = 0;
  
    for (let i = 0; i < centroids.length; i++) {
      const centroid = centroids[i];
      const distance = euclideanDistance(point, centroid);
  
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
  
    return closestIndex;
}
  
function euclideanDistance(point1, point2) {
    let sum = 0;
    for (let i = 0; i < point1.length; i++) {
      sum += Math.pow(point1[i] - point2[i], 2);
    }
    return Math.sqrt(sum);
}
  
function calculateCentroids(clusters) {
    return clusters.map(cluster => {
      if (cluster.length === 0) {
        return [];
      }
      const centroid = cluster[0].map((col, i) => {
        return cluster.reduce((sum, curr) => sum + curr[i], 0) / cluster.length;
      });
      return centroid;
    });
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

function visualize(col1, col2, init_centroids) {
    const results = [];
    const countryNames = []; // Array to store country names

    fs.createReadStream('/Users/vikram/Documents/dsc106_final_proj/static/country_data_transformed.csv')
        .pipe(csv())
        .on('data', (row) => {
            const exportsValue = parseFloat(row[col1]);
            const healthValue = parseFloat(row[col2]);
            const countryName = row['country'];

            if (!isNaN(exportsValue) && !isNaN(healthValue)) {
                results.push([exportsValue, healthValue]);
                countryNames.push(countryName);
            }
        })
        .on('end', () => {
            // Perform k-means clustering
            const { clusters, centroids, all_centroids } = kmeans(results, init_centroids);

            // Append country names to the clusters
            const clusteredDataWithCountry = clusters.map((cluster, index) => {
                return {
                    cluster: index + 1,
                    countries: cluster.map((_, idx) => countryNames[results.indexOf(cluster[idx])])
                };
            });

            // uncomment to save the output clusters as a json file
            // const jsonContent = JSON.stringify(clusteredDataWithCountry, null, 2);

            // fs.writeFile('clustered_data_with_country.json', jsonContent, 'utf8', (err) => {
            //     if (err) {
            //         console.error('An error occurred while writing JSON Object to File.');
            //         return console.error(err);
            //     }
            //     console.log('JSON file has been saved.');
            // });

            // console.log("Centroids:", centroids);
            // console.log("Previous Centroids", all_centroids);
            // console.log("Clusters:", clusteredDataWithCountry);
        });
        return clusteredDataWithCountry;
}

console.log(visualize('gdpp', 'imports', [[8430, 696.64], [16000, 1208.88], [32300, 9436]]));
