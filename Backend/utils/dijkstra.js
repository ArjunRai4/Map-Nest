function dijkstra(graph, start, end) {
  const dist = {};
  const prev = {};
  const visited = new Set();
  const pq = new Map(); // node → cost

  dist[start] = 0;
  pq.set(start, 0);

  while (pq.size > 0) {
    const [current] = [...pq.entries()].sort((a, b) => a[1] - b[1])[0];
    pq.delete(current);
    visited.add(current);

    if (current === end) {
      console.log("✅ Reached destination:", current);
      break;
    }

    if (!graph[current]) {
      console.warn("⚠️ Node has no neighbors:", current);
      continue;
    }

    for (const neighbor of graph[current]) {
      if (visited.has(neighbor.to)) continue;

      const alt = dist[current] + neighbor.cost;
      if (alt < (dist[neighbor.to] ?? Infinity)) {
        dist[neighbor.to] = alt;
        prev[neighbor.to] = current;
        pq.set(neighbor.to, alt);
      }
    }
  }

  // Reconstruct path
  const path = [];
  let node = end;
  while (node && prev[node] !== undefined) {
    path.unshift(node);
    node = prev[node];
  }

  // Include the start node if path exists
  if (path.length > 0) {
    path.unshift(start);
  }

  const totalCost = typeof dist[end] === 'number' ? dist[end] : -1;

  return {
    path,
    totalCost,
  };
}

module.exports = { dijkstra };
