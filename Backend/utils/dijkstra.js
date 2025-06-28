function dijkstra(graph, start, end) {
  const dist = {};
  const prev = {};
  const visited = new Set();
  const pq = new Map(); // node → cost

  dist[start] = 0;
  pq.set(start, 0);

  while (pq.size > 0) {
    // Pick node with smallest cost
    const [current] = [...pq.entries()].sort((a, b) => a[1] - b[1])[0];
    pq.delete(current);
    visited.add(current);

    if (current === end) break;

    for (const neighbor of graph[current] || []) {
      if (visited.has(neighbor.to)) continue;

      const alt = dist[current] + neighbor.cost;
      if (alt < (dist[neighbor.to] || Infinity)) {
        dist[neighbor.to] = alt;
        prev[neighbor.to] = current;
        pq.set(neighbor.to, alt);
      }
    }
  }

  // Reconstruct path
  const path = [];
  let node = end;
  while (node) {
    path.unshift(node);
    node = prev[node];
  }

  return {
    path: path.length > 1 ? path : [],
    totalCost: dist[end] || -1,
  };
}

module.exports = { dijkstra };
