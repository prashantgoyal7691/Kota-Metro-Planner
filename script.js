// Kota Metro graph with unique distances for variety
const metro = {
  "Dhanmandi": [["Gumanpura", 3, "Yellow"], ["Old City", 6, "Green"]],
  "Gumanpura": [["Dhanmandi", 3, "Yellow"], ["Railway Station", 4, "Yellow"], ["RIBI", 10, "Red"]],
  "Railway Station": [["Gumanpura", 4, "Yellow"], ["Nayapura", 7, "Yellow"], ["Shastri Nagar", 5, "Blue"]],
  "Nayapura": [["Railway Station", 7, "Yellow"], ["Chambal Garden", 3, "Yellow"], ["New Bus Stand", 8, "Blue"], ["Aerodrome", 5, "Red"]],
  "Chambal Garden": [["Nayapura", 3, "Yellow"], ["Kota University", 9, "Yellow"]],
  "Kota University": [["Chambal Garden", 9, "Yellow"], ["Industrial Area", 6, "Yellow"], ["Kota College", 7, "Green"]],
  "Industrial Area": [["Kota University", 6, "Yellow"], ["Kota Bus Stand", 5, "Yellow"]],
  "Kota Bus Stand": [["Industrial Area", 5, "Yellow"], ["Kunhadi", 8, "Red"], ["Borkhera", 6, "Green"]],
  "Kunhadi": [["Kota Bus Stand", 8, "Red"], ["Aerodrome", 9, "Red"], ["RIBI", 7, "Red"]],
  "RIBI": [["Kunhadi", 7, "Red"], ["Gumanpura", 10, "Red"]],
  "Talwandi": [["Dadabari", 4, "Blue"]],
  "Dadabari": [["Talwandi", 4, "Blue"], ["New Bus Stand", 5, "Blue"], ["Sawai Pura", 7, "Blue"]],
  "New Bus Stand": [["Dadabari", 5, "Blue"], ["Nayapura", 8, "Blue"], ["Sawai Pura", 6, "Blue"]],
  "Aerodrome": [["Nayapura", 5, "Red"], ["Kunhadi", 9, "Red"]],
  "Tower Circle": [["Shastri Nagar", 4, "Blue"], ["Borkhera", 5, "Green"], ["Old City", 7, "Green"]],
  "Shastri Nagar": [["Tower Circle", 4, "Blue"], ["Railway Station", 5, "Blue"]],
  "Borkhera": [["Tower Circle", 5, "Green"], ["Kota College", 6, "Green"], ["Kota Bus Stand", 6, "Green"]],
  "Kota College": [["Borkhera", 6, "Green"], ["Kota University", 7, "Green"]],
  "Old City": [["Dhanmandi", 6, "Green"], ["Tower Circle", 7, "Green"]],
  "Sawai Pura": [["Dadabari", 7, "Blue"], ["New Bus Stand", 6, "Blue"]]
};

// Populate dropdowns
const stations = Object.keys(metro);
const sourceSelect = document.getElementById("source");
const destSelect = document.getElementById("destination");
stations.forEach(st => {
  sourceSelect.add(new Option(st, st));
  destSelect.add(new Option(st, st));
});

// Group by line
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

// DFS to find all possible paths
function findAllPaths(graph, src, dest, visited = new Set(), path = [], lines = [], distance = 0, allPaths = []) {
  visited.add(src);
  path.push(src);

  if (src === dest) {
    allPaths.push({ path: [...path], lines: [...lines], distance });
  } else {
    for (let [neighbor, w, line] of graph[src]) {
      if (!visited.has(neighbor)) {
        lines.push(line);
        findAllPaths(graph, neighbor, dest, visited, path, lines, distance + w, allPaths);
        lines.pop();
      }
    }
  }

  path.pop();
  visited.delete(src);
}

// On "Find Route Options" button click
document.getElementById("findRoute").addEventListener("click", () => {
  const src = sourceSelect.value, dest = destSelect.value;
  if (src === dest) {
    document.getElementById("output").innerHTML = "<p>Please choose different stations.</p>";
    return;
  }

  const allPaths = [];
  findAllPaths(metro, src, dest, new Set(), [], [], 0, allPaths);
  if (allPaths.length === 0) {
    document.getElementById("output").innerHTML = "<p>No route exists between these stations.</p>";
    return;
  }

  document.getElementById("output").innerHTML = `
  <h3>Choose Route Type</h3>
  <div class="button-group">
    <button id="chooseTime">Show Minimum Time Route</button>
    <button id="chooseFare">Show Minimum Fare Route</button>
  </div>
  `;

  document.getElementById("chooseTime").addEventListener("click", () => {
    renderTopFilteredRoute(src, dest, allPaths, "time");
  });

  document.getElementById("chooseFare").addEventListener("click", () => {
    renderTopFilteredRoute(src, dest, allPaths, "fare");
  });
});

function renderTopFilteredRoute(src, dest, routes, filterType) {
  if (!routes.length) return;

  // Define line-based speed & fare factors
  const lineFactors = {
    "Yellow": { speed: 0.9, fare: 2.5 }, // fastest, costliest
    "Blue": { speed: 1.1, fare: 2.0 },   // moderate speed and fare
    "Green": { speed: 1.4, fare: 1.5 },  // slower, cheaper
    "Red": { speed: 1.7, fare: 1.2 }     // slowest, cheapest
  };

  // Compute total time & fare for each route
  routes.forEach(r => {
    const groups = groupByLine(r.path, r.lines);
    const lineChanges = groups.length - 1;

    let totalTime = 0;
    let totalFare = 10; // base fare ₹10

    // Calculate contribution of each line segment
    for (let i = 0; i < r.lines.length; i++) {
      const line = r.lines[i];
      const factors = lineFactors[line] || { speed: 1.3, fare: 2.0 };

      const segmentDistance = r.distance / r.lines.length;

      // Slower lines → more time, but cheaper fare
      totalTime += segmentDistance * factors.speed;
      totalFare += segmentDistance * factors.fare;
    }

    // Add penalties for interchanges
    totalTime += lineChanges * 8; // 8 min per line change
    totalFare += lineChanges * 2; // ₹2 per interchange

    r.totalTime = totalTime;
    r.fare = Math.ceil(totalFare);
  });

  // Sort depending on user choice
  if (filterType === "time") {
    routes.sort((a, b) => a.totalTime - b.totalTime);
  } else {
    routes.sort((a, b) => a.fare - b.fare);
  }

  const bestRoute = routes[0];
  const groups = groupByLine(bestRoute.path, bestRoute.lines);
  const lineChanges = groups.length - 1;

  // Generate route HTML
  const title =
    filterType === "time"
      ? "⚡ Fastest Route (Minimum Time)"
      : "💰 Cheapest Route (Minimum Fare)";

  const routeHtml = groups
    .map(
      g =>
        `<p class="line-group ${g.line}"><b>${g.line} Line:</b> ${g.stations.join(" → ")}</p>`
    )
    .join("");

  const html = `
    <h3>${title} from ${src} to ${dest}</h3>
    <div class="route-result">
      ${routeHtml}
      <p><b>Total Travel Time:</b> ${bestRoute.totalTime.toFixed(1)} min</p>
      <p><b>Estimated Fare:</b> ₹${bestRoute.fare}</p>
      <p><b>Total Line Changes:</b> ${lineChanges}</p>
    </div>
  `;

  document.getElementById("output").innerHTML = html;
  document.getElementById("output").scrollIntoView({ behavior: "smooth" });
}
// Predefined interchange stations and their lines
const interchangeStations = [
  { name: "Dhanmandi", lines: ["Yellow", "Green"] },
  { name: "Gumanpura", lines: ["Yellow", "Red"] },
  { name: "Railway Station", lines: ["Yellow", "Blue"] },
  { name: "Nayapura", lines: ["Yellow", "Blue", "Red"] },
  { name: "Kota University", lines: ["Yellow", "Green"] },
  { name: "Kota Bus Stand", lines: ["Yellow", "Green", "Red"] },
  { name: "Tower Circle", lines: ["Blue", "Green"] }
];

// Handle Interchange Button (Slide In/Out)
document.getElementById("showInterchanges").addEventListener("click", () => {
  const panel = document.getElementById("interchangePanel");
  panel.classList.toggle("active");

  if (panel.classList.contains("active")) {
    const listContainer = document.getElementById("interchangeList");
    if (listContainer.innerHTML.trim() === "") {
      listContainer.innerHTML = interchangeStations
        .map(
          st => `
          <div class="interchange-item">
            <b>${st.name}</b><br>
            Lines: ${st.lines
              .map(line => `<span class="${line}">${line}</span>`)
              .join(", ")}
          </div>`
        )
        .join("");
    }
}
});

// Close button for panel
document.getElementById("closeInterchanges").addEventListener("click", () => {
  document.getElementById("interchangePanel").classList.remove("active");
});