/**
 * ApexMetrics Cloud Command Center - 10X Core Engine
 * Author: Deep Purohit
 * Features: Multi-Metric Area Chart, Live Simulation Heartbeat, Table Sorter, Terminal Stream
 */

// ==========================================================================
// 1. Centralized Datasets & Metric Sets
// ==========================================================================
const metricDatasets = {
  revenue: {
    title: "Revenue & Cash Velocity (₹)",
    yPrefix: "₹",
    ySuffix: "k",
    "7D": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      current: [320, 390, 410, 380, 520, 580, 640],
      benchmark: [280, 310, 340, 350, 410, 470, 510]
    },
    "30D": {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      current: [2400, 3200, 3900, 4780],
      benchmark: [1900, 2400, 2900, 3800]
    },
    "90D": {
      labels: ["Month 1", "Month 2", "Month 3"],
      current: [11200, 13400, 14280],
      benchmark: [8900, 10200, 12000]
    }
  },

  throughput: {
    title: "API Throughput (req/s)",
    yPrefix: "",
    ySuffix: "k",
    "7D": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      current: [64, 71, 78, 82, 91, 104, 112],
      benchmark: [55, 60, 68, 70, 75, 82, 88]
    },
    "30D": {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      current: [68, 75, 81, 84],
      benchmark: [58, 63, 69, 74]
    },
    "90D": {
      labels: ["Month 1", "Month 2", "Month 3"],
      current: [62, 74, 84],
      benchmark: [52, 60, 70]
    }
  },

  latency: {
    title: "Global Roundtrip Latency (ms)",
    yPrefix: "",
    ySuffix: "ms",
    "7D": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      current: [32, 28, 26, 25, 24, 23, 24],
      benchmark: [42, 38, 35, 34, 32, 31, 30]
    },
    "30D": {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      current: [30, 27, 25, 24],
      benchmark: [38, 35, 32, 30]
    },
    "90D": {
      labels: ["Month 1", "Month 2", "Month 3"],
      current: [35, 28, 24],
      benchmark: [45, 38, 32]
    }
  }
};

let currentMetric = "revenue";
let currentRange = "30D";
let velocityChart = null;
let trafficChart = null;

// ==========================================================================
// 2. Transaction Ledger Dataset
// ==========================================================================
const masterTransactions = [
  { id: "TXN-8041", org: "Razorpay Payments Ltd", region: "ap-south-1 (Mumbai)", amount: 148500, status: "Completed", date: "2026-10-06 13:42" },
  { id: "TXN-8042", org: "Zomato Logistics Tech", region: "ap-south-1 (Mumbai)", amount: 284000, status: "Completed", date: "2026-10-06 13:15" },
  { id: "TXN-8043", org: "Swiggy Cloud Ingress", region: "ap-southeast-1", amount: 92000, status: "Processing", date: "2026-10-06 12:50" },
  { id: "TXN-8044", org: "Cred Finance Core", region: "ap-south-1 (Mumbai)", amount: 340000, status: "Completed", date: "2026-10-06 12:20" },
  { id: "TXN-8045", org: "InMobi Exchange Node", region: "eu-central-1", amount: 56000, status: "Failed", date: "2026-10-06 11:45" },
  { id: "TXN-8046", org: "Zerodha Trading Stream", region: "ap-south-1 (Mumbai)", amount: 410000, status: "Completed", date: "2026-10-06 11:10" },
  { id: "TXN-8047", org: "Freshworks CRM Hub", region: "us-east-1", amount: 125000, status: "Processing", date: "2026-10-06 10:35" }
];

let activeStatusFilter = "ALL";
let activeSearchQuery = "";
let sortOrderAsc = false; // Toggle for amount sorting
let currentPage = 1;
const pageSize = 5;

// ==========================================================================
// 3. Chart.js Implementation
// ==========================================================================
function initVelocityChart() {
  const ctx = document.getElementById('velocityChart').getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 320);
  gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
  gradientCurrent = gradient;

  const dataset = metricDatasets[currentMetric][currentRange];

  velocityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dataset.labels,
      datasets: [
        {
          label: 'Current Cycle',
          data: dataset.current,
          borderColor: '#06b6d4',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#06b6d4',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Previous Period',
          data: dataset.benchmark,
          borderColor: 'rgba(148, 163, 184, 0.35)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 } }
        },
        tooltip: {
          backgroundColor: '#0f1219',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          titleFont: { family: "'JetBrains Mono', monospace" },
          bodyFont: { family: "'JetBrains Mono', monospace" }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace" } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: {
            color: '#64748b',
            font: { family: "'JetBrains Mono', monospace" },
            callback: (v) => `${metricDatasets[currentMetric].yPrefix}${v}${metricDatasets[currentMetric].ySuffix}`
          }
        }
      }
    }
  });
}

function initTrafficChart() {
  const ctx = document.getElementById('trafficChart').getContext('2d');

  trafficChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Web Apps', 'REST / GraphQL', 'Mobile SDKs'],
      datasets: [
        {
          data: [45, 35, 20],
          backgroundColor: ['#06b6d4', '#3b82f6', '#8b5cf6'],
          borderColor: '#10141d',
          borderWidth: 4,
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '74%',
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function updateChart() {
  const meta = metricDatasets[currentMetric];
  const dataset = meta[currentRange];

  velocityChart.data.labels = dataset.labels;
  velocityChart.data.datasets[0].data = dataset.current;
  velocityChart.data.datasets[1].data = dataset.benchmark;
  velocityChart.options.scales.y.ticks.callback = (v) => `${meta.yPrefix}${v}${meta.ySuffix}`;
  velocityChart.update();
}

// ==========================================================================
// 4. Regional Cloud Nodes Generator
// ==========================================================================
const cloudNodes = [
  { name: "ap-south-1a (Primary)", loc: "Mumbai, India", cpu: 42, ram: 68, ping: 18, status: "Healthy" },
  { name: "ap-southeast-1b", loc: "Singapore Hub", cpu: 58, ram: 74, ping: 48, status: "Healthy" },
  { name: "eu-central-1", loc: "Frankfurt, DE", cpu: 31, ram: 52, ping: 112, status: "Healthy" },
  { name: "us-east-1c", loc: "N. Virginia, US", cpu: 49, ram: 64, ping: 165, status: "Healthy" }
];

function renderNodeCards() {
  const container = document.getElementById('nodes-grid');
  container.innerHTML = cloudNodes.map((node, i) => `
    <div class="col-md-6">
      <div class="node-card">
        <div class="node-header">
          <div>
            <span class="node-region">${node.loc}</span>
            <h4 class="node-title">${node.name}</h4>
          </div>
          <span class="badge bg-success font-mono">● ${node.status}</span>
        </div>

        <div class="meter-row">
          <div class="meter-header">
            <span>CPU Compute Load</span>
            <strong id="node-cpu-${i}">${node.cpu}%</strong>
          </div>
          <div class="progress" style="height: 6px; background: rgba(255,255,255,0.06);">
            <div class="progress-bar bg-cyan" id="bar-cpu-${i}" style="width: ${node.cpu}%;"></div>
          </div>
        </div>

        <div class="meter-row">
          <div class="meter-header">
            <span>Memory Allocation (RAM)</span>
            <strong id="node-ram-${i}">${node.ram}%</strong>
          </div>
          <div class="progress" style="height: 6px; background: rgba(255,255,255,0.06);">
            <div class="progress-bar bg-primary" id="bar-ram-${i}" style="width: ${node.ram}%;"></div>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-secondary-subtle">
          <span class="small font-mono text-dim">Network Ping: <strong class="text-white">${node.ping}ms</strong></span>
          <button class="btn btn-outline-secondary btn-sm" onclick="restartNode(${i})">Reboot Node</button>
        </div>
      </div>
    </div>
  `).join('');
}

function restartNode(index) {
  alert(`Rebooting instance ${cloudNodes[index].name}... Microservice traffic re-routed.`);
}

// ==========================================================================
// 5. Live Terminal Log Stream
// ==========================================================================
const sampleLogs = [
  { level: "SYS", msg: "Telemetry beacon synchronized with Mumbai ap-south-1" },
  { level: "INFO", msg: "TLS Handshake verified for incoming API client [200 OK]" },
  { level: "INFO", msg: "Autoscale health check: All 1,428 containers reporting nominal" },
  { level: "WARN", msg: "High traffic spike detected on /api/v2/checkout endpoint" },
  { level: "INFO", msg: "Redis cache memory eviction cleared 12.4 MB" },
  { level: "SYS", msg: "Database replication delta: 0ms lag across read-replicas" }
];

function appendLogEntry() {
  const consoleEl = document.getElementById('terminal-console');
  if (!consoleEl) return;

  const randomLog = sampleLogs[Math.floor(Math.random() * sampleLogs.length)];
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];

  const logDiv = document.createElement('div');
  logDiv.className = 'log-entry';
  logDiv.innerHTML = `
    <span class="log-time">${timeStr}</span>
    <span class="log-level-${randomLog.level.toLowerCase()}">[${randomLog.level}]</span>
    <span class="log-msg">${randomLog.msg}</span>
  `;

  consoleEl.prepend(logDiv);
  if (consoleEl.children.length > 25) consoleEl.removeChild(consoleEl.lastChild);
}

// Stream logs every 3.5 seconds
setInterval(appendLogEntry, 3500);

// ==========================================================================
// 6. Table Engine (Search, Filter, Sort, Pagination)
// ==========================================================================
function formatINR(val) {
  return '₹' + val.toLocaleString('en-IN');
}

function getFilteredData() {
  return masterTransactions.filter(item => {
    const matchesStatus = activeStatusFilter === "ALL" || item.status === activeStatusFilter;
    const matchesQuery = item.org.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
                         item.id.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
                         item.region.toLowerCase().includes(activeSearchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  }).sort((a, b) => sortOrderAsc ? a.amount - b.amount : b.amount - a.amount);
}

function renderTable() {
  const filtered = getFilteredData();
  const tableRows = document.getElementById('table-rows');
  const paginationSummary = document.getElementById('pagination-summary');

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  if (pageItems.length === 0) {
    tableRows.innerHTML = `
      <tr><td colspan="7" class="text-center py-4 text-muted">No records match your active query.</td></tr>
    `;
    paginationSummary.textContent = "Showing 0 entries";
    return;
  }

  tableRows.innerHTML = pageItems.map(item => `
    <tr>
      <td class="font-mono text-cyan">${item.id}</td>
      <td class="fw-semibold">${item.org}</td>
      <td><span class="badge bg-secondary font-mono">${item.region}</span></td>
      <td class="font-mono fw-bold text-white">${formatINR(item.amount)}</td>
      <td><span class="status-tag ${item.status.toLowerCase()}">${item.status}</span></td>
      <td class="font-mono text-dim small">${item.date}</td>
      <td>
        <button class="btn-action-view" onclick="alert('Viewing invoice details for ${item.id} (${item.org})')">Audit</button>
      </td>
    </tr>
  `).join('');

  paginationSummary.textContent = `Showing ${startIdx + 1} to ${Math.min(startIdx + pageSize, filtered.length)} of ${filtered.length} entries`;

  // Update status counts
  document.getElementById('count-all').textContent = masterTransactions.length;
  document.getElementById('count-completed').textContent = masterTransactions.filter(t => t.status === "Completed").length;
  document.getElementById('count-processing').textContent = masterTransactions.filter(t => t.status === "Processing").length;
  document.getElementById('count-failed').textContent = masterTransactions.filter(t => t.status === "Failed").length;
}

// Client-Side CSV Exporter
function exportCSV() {
  const rows = [
    ["Transaction ID", "Organization", "Region", "Amount (INR)", "Status", "Date"],
    ...masterTransactions.map(t => [t.id, `"${t.org}"`, `"${t.region}"`, t.amount, t.status, `"${t.date}"`])
  ];

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `apexmetrics_ledger_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// ==========================================================================
// 7. Live Real-Time Telemetry Simulation (Heartbeat)
// ==========================================================================
function liveHeartbeat() {
  // Jitter throughput slightly
  const baseReq = 84200;
  const jitter = Math.floor(Math.random() * 800 - 400);
  const currentReq = baseReq + jitter;
  document.getElementById('kpi-throughput').innerHTML = `${currentReq.toLocaleString()} <small>req/s</small>`;

  // Jitter latency between 22ms and 28ms
  const lat = Math.floor(Math.random() * 6 + 22);
  document.getElementById('kpi-latency').textContent = `${lat} ms`;

  // Jitter Mumbai CPU load slightly
  if (cloudNodes.length > 0) {
    const nodeCpu = Math.min(Math.max(cloudNodes[0].cpu + Math.floor(Math.random() * 5 - 2), 20), 90);
    const cpuEl = document.getElementById('node-cpu-0');
    const barEl = document.getElementById('bar-cpu-0');
    if (cpuEl && barEl) {
      cpuEl.textContent = `${nodeCpu}%`;
      barEl.style.width = `${nodeCpu}%`;
    }
  }
}

// Pulse every 4 seconds
setInterval(liveHeartbeat, 4000);

// ==========================================================================
// 8. Event Listeners & Binding
// ==========================================================================
document.getElementById('metric-select').addEventListener('change', (e) => {
  currentMetric = e.target.value;
  updateChart();
});

document.querySelectorAll('.btn-range').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-range').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentRange = btn.dataset.range;
    updateChart();
  });
});

document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeStatusFilter = pill.dataset.status;
    currentPage = 1;
    renderTable();
  });
});

document.getElementById('search-input').addEventListener('input', (e) => {
  activeSearchQuery = e.target.value;
  currentPage = 1;
  renderTable();
});

document.getElementById('th-amount').addEventListener('click', () => {
  sortOrderAsc = !sortOrderAsc;
  document.getElementById('th-amount').textContent = sortOrderAsc ? "AMOUNT (INR) ↑" : "AMOUNT (INR) ↓";
  renderTable();
});

document.getElementById('page-prev-btn').addEventListener('click', () => {
  if (currentPage > 1) { currentPage--; renderTable(); }
});

document.getElementById('page-next-btn').addEventListener('click', () => {
  const total = Math.ceil(getFilteredData().length / pageSize);
  if (currentPage < total) { currentPage++; renderTable(); }
});

document.getElementById('btn-export-csv').addEventListener('click', exportCSV);

document.getElementById('btn-clear-logs').addEventListener('click', () => {
  document.getElementById('terminal-console').innerHTML = '';
});

document.getElementById('clear-notif').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('notif-dot').style.display = 'none';
  document.getElementById('notif-item-1').style.display = 'none';
  document.getElementById('notif-item-2').style.display = 'none';
});

document.getElementById('deploy-cluster-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('deploy-name').value;
  const region = document.getElementById('deploy-region').value;

  cloudNodes.push({ name: name, loc: region, cpu: 12, ram: 25, ping: 22, status: "Healthy" });
  renderNodeCards();

  alert(`Cluster "${name}" initialized successfully in ${region}!`);
  bootstrap.Modal.getInstance(document.getElementById('deployModal')).hide();
});

// Boot Initialization
initVelocityChart();
initTrafficChart();
renderNodeCards();
renderTable();
for (let i = 0; i < 5; i++) appendLogEntry();