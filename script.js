// --- Kota Metro Graph ---
const metro = {
  Dhanmandi: [
    ["Gumanpura", 3, "Yellow"],
    ["Old City", 6, "Green"],
  ],
  Gumanpura: [
    ["Dhanmandi", 3, "Yellow"],
    ["Railway Station", 4, "Yellow"],
    ["RIBI", 10, "Red"],
  ],
  "Railway Station": [
    ["Gumanpura", 4, "Yellow"],
    ["Nayapura", 7, "Yellow"],
    ["Shastri Nagar", 5, "Blue"],
  ],
  Nayapura: [
    ["Railway Station", 7, "Yellow"],
    ["Chambal Garden", 3, "Yellow"],
    ["New Bus Stand", 8, "Blue"],
    ["Aerodrome", 5, "Red"],
  ],
  "Chambal Garden": [
    ["Nayapura", 3, "Yellow"],
    ["Kota University", 9, "Yellow"],
  ],
  "Kota University": [
    ["Chambal Garden", 9, "Yellow"],
    ["Industrial Area", 6, "Yellow"],
    ["Kota College", 7, "Green"],
  ],
  "Industrial Area": [
    ["Kota University", 6, "Yellow"],
    ["Kota Bus Stand", 5, "Yellow"],
  ],
  "Kota Bus Stand": [
    ["Industrial Area", 5, "Yellow"],
    ["Kunhadi", 8, "Red"],
    ["Borkhera", 6, "Green"],
  ],
  Kunhadi: [
    ["Kota Bus Stand", 8, "Red"],
    ["Aerodrome", 9, "Red"],
    ["RIBI", 7, "Red"],
  ],
  RIBI: [
    ["Kunhadi", 7, "Red"],
    ["Gumanpura", 10, "Red"],
  ],
  Talwandi: [["Dadabari", 4, "Blue"]],
  Dadabari: [
    ["Talwandi", 4, "Blue"],
    ["New Bus Stand", 5, "Blue"],
    ["Sawai Pura", 7, "Blue"],
  ],
  "New Bus Stand": [
    ["Dadabari", 5, "Blue"],
    ["Nayapura", 8, "Blue"],
    ["Sawai Pura", 6, "Blue"],
  ],
  Aerodrome: [
    ["Nayapura", 5, "Red"],
    ["Kunhadi", 9, "Red"],
  ],
  "Tower Circle": [
    ["Shastri Nagar", 4, "Blue"],
    ["Borkhera", 5, "Green"],
    ["Old City", 7, "Green"],
  ],
  "Shastri Nagar": [
    ["Tower Circle", 4, "Blue"],
    ["Railway Station", 5, "Blue"],
  ],
  Borkhera: [
    ["Tower Circle", 5, "Green"],
    ["Kota College", 6, "Green"],
    ["Kota Bus Stand", 6, "Green"],
  ],
  "Kota College": [
    ["Borkhera", 6, "Green"],
    ["Kota University", 7, "Green"],
  ],
  "Old City": [
    ["Dhanmandi", 6, "Green"],
    ["Tower Circle", 7, "Green"],
  ],
  "Sawai Pura": [
    ["Dadabari", 7, "Blue"],
    ["New Bus Stand", 6, "Blue"],
  ],
};

// Populate dropdowns
const stations = Object.keys(metro);
stations.forEach((st) => {
  document.getElementById("source").add(new Option(st, st));
  document.getElementById("destination").add(new Option(st, st));
});

// Group path segments by metro line
function groupByLine(path, lines) {
  if (path.length === 0) return [];
  let groups = [];
  let currentLine = lines[0];
  let currentGroup = [path[0]];
  for (let i = 1; i < path.length; i++) {
    if (lines[i - 1] === currentLine) currentGroup.push(path[i]);
    else {
      groups.push({ line: currentLine, stations: currentGroup });
      currentLine = lines[i - 1];
      currentGroup = [path[i - 1], path[i]];
    }
  }
  groups.push({ line: currentLine, stations: currentGroup });
  return groups;
}

// DFS for all possible routes
function findAllPaths(
  graph,
  src,
  dest,
  visited = new Set(),
  path = [],
  lines = [],
  distance = 0,
  allPaths = []
) {
  path.push(src);
  visited.add(src);
  if (src === dest)
    allPaths.push({ path: [...path], lines: [...lines], distance });
  else {
    for (let [neighbor, w, line] of graph[src]) {
      if (!visited.has(neighbor)) {
        findAllPaths(
          graph,
          neighbor,
          dest,
          new Set(visited),
          [...path],
          [...lines, line],
          distance + w,
          allPaths
        );
      }
    }
  }
  path.pop();
}

// Main button
document.getElementById("findRoute").addEventListener("click", () => {
  const src = source.value,
    dest = destination.value;
  if (src === dest) {
    document.getElementById("output").innerHTML =
      "<p>Please choose different stations.</p>";
    return;
  }

  const allPaths = [];
  findAllPaths(metro, src, dest, new Set(), [], [], 0, allPaths);
  if (allPaths.length === 0) {
    document.getElementById("output").innerHTML = "<p>No route found.</p>";
    return;
  }

  // Compute realistic fare & time
  const lineFactors = {
    Yellow: { speed: 0.8, fare: 2.3 },
    Blue: { speed: 1.0, fare: 2.0 },
    Green: { speed: 1.1, fare: 1.7 },
    Red: { speed: 1.2, fare: 1.6 },
  };

  allPaths.forEach((r) => {
    const groups = groupByLine(r.path, r.lines);
    const lineChanges = groups.length - 1;
    let time = 0,
      fare = 12;
    for (let i = 0; i < r.lines.length; i++) {
      const f = lineFactors[r.lines[i]] || { speed: 1, fare: 2 };
      const d = r.distance / r.lines.length;
      time += d * f.speed * 2;
      fare += d * f.fare;
    }
    r.time = parseFloat((time + lineChanges * 5).toFixed(1));
    r.fare = Math.round(fare + lineChanges * 3);
  });

  // Balanced route: time + interchange penalty
  // Sort by (time + interchange penalty)
  allPaths.sort(
    (a, b) =>
      a.time +
      (groupByLine(a.path, a.lines).length - 1) * 8 -
      (b.time + (groupByLine(b.path, b.lines).length - 1) * 8)
  );

  // Pick top 3 routes (if available)
  const topRoutes = allPaths.slice(0, 3);

  // Create HTML for all 3
  let html = `<h3>🚇 Top ${topRoutes.length} Optimized Routes from ${src} to ${dest}</h3>`;
  topRoutes.forEach((r, i) => {
    const g = groupByLine(r.path, r.lines);
    html += `
    <div class="route-result">
      <h4>Option ${i + 1}</h4>
      ${g
        .map(
          (gr) =>
            `<p class="line-group ${gr.line}"><b>${
              gr.line
            } Line:</b> ${gr.stations.join(" → ")}</p>`
        )
        .join("")}
      <p><b>Total Travel Time:</b> ${r.time} min</p>
      <p><b>Estimated Fare:</b> ₹${r.fare}</p>
      <p><b>Total Line Changes:</b> ${g.length - 1}</p>
    </div>
  `;
  });
  document.getElementById("output").innerHTML = html;
});

// Interchange panel
const interchangeStations = [
  { name: "Dhanmandi", lines: ["Yellow", "Green"] },
  { name: "Gumanpura", lines: ["Yellow", "Red"] },
  { name: "Railway Station", lines: ["Yellow", "Blue"] },
  { name: "Nayapura", lines: ["Yellow", "Blue", "Red"] },
  { name: "Kota University", lines: ["Yellow", "Green"] },
  { name: "Kota Bus Stand", lines: ["Yellow", "Green", "Red"] },
  { name: "Tower Circle", lines: ["Blue", "Green"] },
];
document.getElementById("showInterchanges").addEventListener("click", () => {
  document.getElementById("interchangePanel").classList.toggle("active");
  const list = document.getElementById("interchangeList");
  if (!list.innerHTML) {
    list.innerHTML = interchangeStations
      .map(
        (st) =>
          `<div class="interchange-item"><b>${st.name}</b><br>Lines: ${st.lines
            .map((l) => `<span class="${l}">${l}</span>`)
            .join(", ")}</div>`
      )
      .join("");
  }
});
document.getElementById("closeInterchanges").addEventListener("click", () => {
  document.getElementById("interchangePanel").classList.remove("active");
});
