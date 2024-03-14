// import fs from 'fs';
// import csv from 'csv-parser';


export function km(data, centroids, var1, var2) {

  // let centroids = init_centroids.slice();
  let clusters;

  // Assign points to clusters
  clusters = assignPointsToClusters(data, centroids, var1, var2);

  // Calculate new centroids
  const newCentroids = calculateCentroids(clusters, var1, var2);

  if (hasConverged(newCentroids, centroids)) {
      console.log("Converged");
  }

  return newCentroids;
}

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
      if (centroids[i].x == prevCentroids[i].x && centroids[i].y ==  prevCentroids[i].y) {
        return true;
      }
    }
    return false;
}
  
function assignPointsToClusters(data, centroids, var1, var2) {
    const clusters = new Array(centroids.length).fill().map(() => []);
  
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const closestCentroidIndex = findClosestCentroidIndex(point, centroids, var1, var2);
      data[i]['cluster'] = closestCentroidIndex + 1;
      clusters[closestCentroidIndex].push(point);
    }
  
    return clusters;
}
  
function findClosestCentroidIndex(point, centroids, var1, var2) {
    let minDistance = Infinity;
    let closestIndex = 0;
  
    for (let i = 0; i < centroids.length; i++) {
      const centroid = centroids[i];
      const distance = euclideanDistance(point, centroid, var1, var2);
  
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
  
    return closestIndex;
}
  
function euclideanDistance(point1, point2, var1, var2) {

    let sum = Math.pow(point1[var1] - point2.x, 2) + Math.pow(point1[var2] - point2.y, 2)

    return Math.sqrt(sum);
}
  
function calculateCentroids(clusters, var1, var2) {
    return clusters.map(cluster => {
      if (cluster.length === 0) {
        return [];
      }

      let xsum = 0;
      let ysum = 0;
      for (let i=0; i < cluster.length; i++) {
        xsum += cluster[i][var1];
        ysum += cluster[i][var2];
      }

      let centroid = {'x': xsum/cluster.length, 'y': ysum/cluster.length};

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

// console.log(visualize('gdpp', 'imports', [[8430, 696.64], [16000, 1208.88], [32300, 9436]]));
