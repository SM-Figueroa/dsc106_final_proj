export function km(data, centroids, var1, var2) {

  // let centroids = init_centroids.slice();
  let clusters;

  // Assign points to clusters
  clusters = assignPointsToClusters(data, centroids, var1, var2);

  // Calculate new centroids
  const newCentroids = calculateCentroids(clusters, var1, var2);

  // if (hasConverged(newCentroids, centroids)) {
  //     console.log("Converged");
  // }

  return newCentroids;
}

export function hasConverged(centroids, prevCentroids) {

    for (let i = 0; i < centroids.length; i++) {
      if (centroids[i].x == prevCentroids[i].x && centroids[i].y ==  prevCentroids[i].y) {
        continue;
      } else {
        return false;
      }
    }
    return true;
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
