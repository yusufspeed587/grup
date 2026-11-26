// ======================================
// SPEED GRUP - DASHBOARD JAVASCRIPT
// ======================================

const STORAGE_KEY = "speedGrupDatabase";

const defaultData = {
  clients: [
    { id: 1, name: "Andi Pratama", email: "andi@email.com", phone: "081234567890" },
    { id: 2, name: "Siti Rahma", email: "siti@email.com", phone: "082345678901" },
    { id: 3, name: "Budi Santoso", email: "budi@email.com", phone: "083456789012" }
  ],
  projects: [
    { id: 1, name: "Website Company Profile", client: "Andi Pratama", date: "2026-11-20", status: "Proses" },
    { id: 2, name: "Desain Logo Brand", client: "Siti Rahma", date: "2026-11-22", status: "Selesai" },
    { id: 3, name: "Landing Page Bisnis", client: "Budi Santoso", date: "2026-11-24", status: "Menunggu" }
  ],
  orders: [
    { id: 1, name: "Pembuatan Website", client: "Andi Pratama", amount: 2500000, status: "Proses" },
    { id: 2, name: "Desain Logo", client: "Siti Rahma", amount: 750000, status: "Selesai" }
  ],
  finances: [
    { id: 1, description: "Pembayaran Website", date: "2026-11-20", type: "Pemasukan", amount: 2500000 },
    { id: 2, description: "Pembayaran Desain Logo", date: "2026-11-22", type: "Pemasukan", amount: 750000 },
    { id: 3, description: "Biaya Operasional", date: "2026-11-23", type: "Pengeluaran", amount: 300000 }
  ]
};

let database;

function loadDatabase() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    database = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultData));

    if (!database || !Array.isArray(database.clients) ||
        !Array.isArray(database.projects) ||
        !Array.isArray(database.orders) ||
        !Array.isArray(database.finances)) {
      throw new Error("Format data tidak valid");
    }
  } catch (error) {
    database = JSON.parse(JSON.stringify(defaultData));
    showToast("Data tidak dapat dibaca. Data contoh dimuat.");
  }

  saveDatabase();
}

function saveDatabase() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(number) || 0);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function makeId(collection) {
  return Math.max(0, ...collection.map(item => Number(item.id) || 0)) + 1;
}

function getFinanceTotals() {
  const income = database.finances
    .filter(item => item.type === "Pemasukan")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expense = database.finances
    .filter(item => item.type === "Pengeluaran")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return { income, expense, balance: income - expense };
}

function statusHTML(status) {
  const classes = {
    "Selesai": "status-selesai",
    "Proses": "status-proses",
    "Menunggu": "status-menunggu",
    "Dibatalkan": "status-dibatalkan"
  };

  return `<span class="status ${classes[status] || "status-menunggu"}">${escapeHTML(status)}</span>`;
}

function emptyRow(columns, message = "Belum ada data.") {
  return `<tr><td colspan="${columns}"><div class="empty-state">${message}</div></td></tr>`;
}

// ======================================
// NAVIGASI HALAMAN
// ======================================

const pageNames = {
  overview: "Dashboard Overview",
  clients: "Manajemen Klien",
  projects: "Manajemen Proyek",
  orders: "Manajemen Pesanan",
  finance: "Keuangan",
  reports: "Laporan"
};

function navigateTo(page) {
  if (!pageNames[page]) page = "overview";

  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.toggle("active", section.id === page);
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  document.getElementById("pageTitle").textContent = pageNames[page];
  document.getElementById("breadcrumb").textContent = pageNames[page].replace("Dashboard ", "");

  history.replaceState(null, "", `#${page}`);
  closeSidebar();
}

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    navigateTo(link.dataset.page);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => navigateTo(button.dataset.go));
});

// ======================================
// SIDEBAR MOBILE
// ======================================

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");

document.getElementById("menuToggle").addEventListener("click", () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
});

document.getElementById("closeSidebar").addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

// ======================================
// TANGGAL
// ======================================

document.getElementById("currentDate").textContent =
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

// ======================================
// OVERVIEW
// ======================================

function renderOverview() {
  const totals = getFinanceTotals();

  document.getElementById("totalClients").textContent = database.clients.length;
  document.getElementById("totalProjects").textContent = database.projects.length;
  document.getElementById("totalOrders").textContent = database.orders.length;
  document.getElementById("totalBalance").textContent = formatRupiah(totals.balance);

  const projectRows = database.projects.slice(-5).reverse();

  document.getElementById("overviewProjects").innerHTML =
    projectRows.length
      ? projectRows.map(project => `
        <tr>
          <td><strong>${escapeHTML(project.name)}</strong></td>
          <td>${escapeHTML(project.client)}</td>
          <td>${escapeHTML(project.date)}</td>
          <td>${statusHTML(project.status)}</td>
        </tr>
      `).join("")
      : emptyRow(4);

  renderChart();
  renderActivity();
}

function renderChart() {
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - i);

    months.push({
      month: date.getMonth(),
      year: date.getFullYear(),
      label: date.toLocaleDateString("id-ID", { month: "short" }),
      income: 0,
      expense: 0
    });
  }

  database.finances.forEach(item => {
    const date = new Date(item.date + "T00:00:00");
    if (Number.isNaN(date.getTime())) return;

    const month = months.find(m =>
      m.month === date.getMonth() && m.year === date.getFullYear()
    );

    if (month) {
      if (item.type === "Pemasukan") month.income += Number(item.amount);
      else month.expense += Number(item.amount);
    }
  });

  const maxValue = Math.max(
    1,
    ...months.flatMap(m => [m.income, m.expense])
  );

  document.getElementById("overviewChart").innerHTML = months.map(m => {
    const incomeHeight = (m.income / maxValue) * 100;
    const expenseHeight = (m.expense / maxValue) * 100;

    return `
      <div class="chart-column">
        <div class="chart-bar income" style="height:${incomeHeight}%"
          title="Pemasukan: ${formatRupiah(m.income)}"></div>
        <div class="chart-bar expense" style="height:${expenseHeight}%"
          title="Pengeluaran: ${formatRupiah(m.expense)}"></div>
        <span class="chart-month">${escapeHTML(m.label)}</span>
      </div>
    `;
  }).join("");
}

function renderActivity() {
  const activities = [
    ...database.clients.map(item => ({
      title: "Klien: " + item.name,
      subtitle: "Data klien terdaftar",
      symbol: "♙"
    })),
    ...database.projects.map(item => ({
      title: "Proyek: " + item.name,
      subtitle: "Status: " + item.status,
      symbol: "▤"
    })),
    ...database.orders.map(item => ({
      title: "Pesanan: " + item.name,
      subtitle: formatRupiah(item.amount),
      symbol: "🛒"
    }))
  ].slice(-5).reverse();

  document.getElementById("recentActivity").innerHTML =
    activities.length
      ? activities.map(item => `
        <div class="activity-item">
          <div class="activity-symbol">${item.symbol}</div>
          <div>
            <strong>${escapeHTML(item.title)}</strong>
            <small>${escapeHTML(item.subtitle)}</small>
          </div>
        </div>
      `).join("")
      : `<div class="empty-state">Belum ada aktivitas.</div>`;
}

// ======================================
// MANAJEMEN KLIEN
// ======================================

function renderClients(keyword = "") {
  const filtered = database.clients.filter(client =>
    `${client.name} ${client.email} ${client.phone}`
      .toLowerCase().includes(keyword.toLowerCase())
  );

  document.getElementById("clientCount").textContent =
    `${database.clients.length} klien terdaftar`;

  document.getElementById("clientsTable").innerHTML =
    filtered.length
      ? filtered.map(client => `
        <tr>
          <td><strong>${escapeHTML(client.name)}</strong></td>
          <td>${escapeHTML(client.email)}</td>
          <td>${escapeHTML(client.phone)}</td>
          <td><button class="action-button delete" data-delete-client="${client.id}">Hapus</button></td>
        </tr>
      `).join("")
      : emptyRow(4, "Klien tidak ditemukan.");
}

document.getElementById("addClient").addEventListener("click", () => {
  const name = prompt("Masukkan nama klien:");
  if (name === null) return;
  if (!name.trim()) return showToast("Nama klien wajib diisi.");

  const email = prompt("Masukkan email klien:");
  if (email === null) return;

  const phone = prompt("Masukkan nomor telepon:");
  if (phone === null) return;

  database.clients.push({
    id: makeId(database.clients),
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim()
  });

  refreshAll();
  showToast("Klien berhasil ditambahkan.");
});

document.getElementById("clientsTable").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-client]");
  if (!button) return;

  const id = Number(button.dataset.deleteClient);
  if (!confirm("Hapus data klien ini?")) return;

  database.clients = database.clients.filter(item => item.id !== id);
  refreshAll();
  showToast("Data klien berhasil dihapus.");
});

document.getElementById("clientSearch").addEventListener("input", event => {
  renderClients(event.target.value);
});

// ======================================
// MANAJEMEN PROYEK
// ======================================

function renderProjects(keyword = "") {
  const filtered = database.projects.filter(project =>
    `${project.name} ${project.client} ${project.status}`
      .toLowerCase().includes(keyword.toLowerCase())
  );

  document.getElementById("projectsTable").innerHTML =
    filtered.length
      ? filtered.map(project => `
        <tr>
          <td><strong>${escapeHTML(project.name)}</strong></td>
          <td>${escapeHTML(project.client)}</td>
          <td>${escapeHTML(project.date)}</td>
          <td>${statusHTML(project.status)}</td>
          <td><button class="action-button delete" data-delete-project="${project.id}">Hapus</button></td>
        </tr>
      `).join("")
      : emptyRow(5, "Belum ada proyek.");
}

document.getElementById("addProject").addEventListener("click", () => {
  const name = prompt("Nama proyek:");
  if (name === null) return;
  if (!name.trim()) return showToast("Nama proyek wajib diisi.");

  const client = prompt("Nama klien:");
  if (client === null) return;

  const date = prompt("Tanggal proyek (YYYY-MM-DD):", new Date().toISOString().slice(0, 10));
  if (date === null) return;

  const status = prompt("Status: Proses / Selesai / Menunggu", "Menunggu");
  if (status === null) return;

  const validStatus = ["Proses", "Selesai", "Menunggu"];
  if (!validStatus.includes(status)) {
    return showToast("Status tidak valid.");
  }

  database.projects.push({
    id: makeId(database.projects),
    name: name.trim(),
    client: client.trim(),
    date: date.trim(),
    status
  });

  refreshAll();
  showToast("Proyek berhasil ditambahkan.");
});

document.getElementById("projectsTable").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-project]");
  if (!button) return;

  const id = Number(button.dataset.deleteProject);
  if (!confirm("Hapus proyek ini?")) return;

  database.projects = database.projects.filter(item => item.id !== id);
  refreshAll();
  showToast("Proyek berhasil dihapus.");
});

document.getElementById("projectSearch").addEventListener("input", event => {
  renderProjects(event.target.value);
});

// ======================================
// MANAJEMEN PESANAN
// ======================================

function renderOrders() {
  document.getElementById("ordersTable").innerHTML =
    database.orders.length
      ? database.orders.map(order => `
        <tr>
          <td><strong>${escapeHTML(order.name)}</strong></td>
          <td>${escapeHTML(order.client)}</td>
          <td>${formatRupiah(order.amount)}</td>
          <td>${statusHTML(order.status)}</td>
          <td><button class="action-button delete" data-delete-order="${order.id}">Hapus</button></td>
        </tr>
      `).join("")
      : emptyRow(5, "Belum ada pesanan.");
}

document.getElementById("addOrder").addEventListener("click", () => {
  const name = prompt("Nama pesanan:");
  if (name === null) return;
  if (!name.trim()) return showToast("Nama pesanan wajib diisi.");

  const client = prompt("Nama klien:");
  if (client === null) return;

  const amount = prompt("Nilai pesanan (angka saja):");
  if (amount === null) return;

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return showToast("Nilai pesanan harus berupa angka positif.");
  }

  const status = prompt("Status: Proses / Selesai / Menunggu", "Menunggu");
  if (status === null) return;

  if (!["Proses", "Selesai", "Menunggu"].includes(status)) {
    return showToast("Status tidak valid.");
  }

  database.orders.push({
    id: makeId(database.orders),
    name: name.trim(),
    client: client.trim(),
    amount: Number(amount),
    status
  });

  refreshAll();
  showToast("Pesanan berhasil ditambahkan.");
});

document.getElementById("ordersTable").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-order]");
  if (!button) return;

  const id = Number(button.dataset.deleteOrder);
  if (!confirm("Hapus pesanan ini?")) return;

  database.orders = database.orders.filter(item => item.id !== id);
  refreshAll();
  showToast("Pesanan berhasil dihapus.");
});

// ======================================
// MANAJEMEN KEUANGAN
// ======================================

function renderFinance() {
  const totals = getFinanceTotals();

  document.getElementById("incomeTotal").textContent = formatRupiah(totals.income);
  document.getElementById("expenseTotal").textContent = formatRupiah(totals.expense);
  document.getElementById("balanceTotal").textContent = formatRupiah(totals.balance);

  document.getElementById("financeTable").innerHTML =
    database.finances.length
      ? [...database.finances].reverse().map(item => `
        <tr>
          <td><strong>${escapeHTML(item.description)}</strong></td>
          <td>${escapeHTML(item.date)}</td>
          <td>${item.type === "Pemasukan"
            ? '<span class="status status-selesai">Pemasukan</span>'
            : '<span class="status status-dibatalkan">Pengeluaran</span>'}</td>
          <td>${formatRupiah(item.amount)}</td>
          <td><button class="action-button delete" data-delete-finance="${item.id}">Hapus</button></td>
        </tr>
      `).join("")
      : emptyRow(5, "Belum ada transaksi.");
}

document.getElementById("addFinance").addEventListener("click", () => {
  const description = prompt("Keterangan transaksi:");
  if (description === null) return;
  if (!description.trim()) return showToast("Keterangan wajib diisi.");

  const type = prompt("Jenis transaksi: Pemasukan / Pengeluaran", "Pemasukan");
  if (type === null) return;

  if (!["Pemasukan", "Pengeluaran"].includes(type)) {
    return showToast("Jenis transaksi tidak valid.");
  }

  const amount = prompt("Jumlah uang (angka saja):");
  if (amount === null) return;

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return showToast("Jumlah harus berupa angka positif.");
  }

  const date = prompt("Tanggal (YYYY-MM-DD):", new Date().toISOString().slice(0, 10));
  if (date === null) return;

  database.finances.push({
    id: makeId(database.finances),
    description: description.trim(),
    type,
    amount: Number(amount),
    date: date.trim()
  });

  refreshAll();
  showToast("Transaksi berhasil ditambahkan.");
});

document.getElementById("financeTable").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-finance]");
  if (!button) return;

  const id = Number(button.dataset.deleteFinance);
  if (!confirm("Hapus transaksi ini?")) return;

  database.finances = database.finances.filter(item => item.id !== id);
  refreshAll();
  showToast("Transaksi berhasil dihapus.");
});

// ======================================
// LAPORAN
// ======================================

function renderReports() {
  const totals = getFinanceTotals();

  document.getElementById("reportClients").textContent = database.clients.length;
  document.getElementById("reportProjects").textContent = database.projects.length;
  document.getElementById("reportOrders").textContent = database.orders.length;
  document.getElementById("reportBalance").textContent = formatRupiah(totals.balance);

  document.getElementById("reportSummary").innerHTML = `
    <div class="report-row"><span>Total klien terdaftar</span><strong>${database.clients.length}</strong></div>
    <div class="report-row"><span>Total proyek</span><strong>${database.projects.length}</strong></div>
    <div class="report-row"><span>Proyek selesai</span><strong>${database.projects.filter(p => p.status === "Selesai").length}</strong></div>
    <div class="report-row"><span>Total pesanan</span><strong>${database.orders.length}</strong></div>
    <div class="report-row"><span>Total pemasukan</span><strong>${formatRupiah(totals.income)}</strong></div>
    <div class="report-row"><span>Total pengeluaran</span><strong>${formatRupiah(totals.expense)}</strong></div>
    <div class="report-row"><span>Saldo bersih</span><strong>${formatRupiah(totals.balance)}</strong></div>
  `;
}

// ======================================
// EXPORT CSV
// ======================================

function downloadCSV(filename, rows) {
  const csv = rows.map(row =>
    row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

document.getElementById("exportReport").addEventListener("click", () => {
  const totals = getFinanceTotals();

  const rows = [
    ["LAPORAN SPEED GRUP"],
    ["Tanggal ekspor", new Date().toLocaleDateString("id-ID")],
    [],
    ["RINGKASAN"],
    ["Total klien", database.clients.length],