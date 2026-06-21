let jobsData = [];
let newsData = [];

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function populateSelect(select, values) {
  const current = select.value;
  select.innerHTML = `<option value="">${select.dataset.allLabel}</option>`;
  [...new Set(values)].filter(Boolean).sort().forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
  select.value = current;
}

function renderJobs() {
  const search = document.getElementById("jobs-search").value.toLowerCase();
  const source = document.getElementById("jobs-source-filter").value;
  const tbody = document.getElementById("jobs-table-body");

  const filtered = jobsData
    .filter((job) => {
      const matchesSearch = !search ||
        (job.title || "").toLowerCase().includes(search) ||
        (job.company || "").toLowerCase().includes(search);
      const matchesSource = !source || job.source === source;
      return matchesSearch && matchesSource;
    })
    .sort((a, b) => (b.first_seen || "").localeCompare(a.first_seen || ""));

  tbody.innerHTML = filtered.map((job) => `
    <tr>
      <td data-label="Data">${escapeHtml(job.first_seen)}</td>
      <td data-label="Titolo">${escapeHtml(job.title)}</td>
      <td data-label="Azienda">${escapeHtml(job.company)}</td>
      <td data-label="Località">${escapeHtml(job.location)}</td>
      <td data-label="Fonte">${escapeHtml(job.source)}</td>
      <td data-label="Link">${job.url ? `<a class="open-link" href="${job.url}" target="_blank" rel="noopener">Apri</a>` : ""}</td>
    </tr>
  `).join("");

  document.getElementById("jobs-count").textContent = `${filtered.length} annunci`;
}

function renderNews() {
  const search = document.getElementById("news-search").value.toLowerCase();
  const company = document.getElementById("news-company-filter").value;
  const tbody = document.getElementById("news-table-body");

  const filtered = newsData
    .filter((item) => {
      const matchesSearch = !search ||
        (item.title || "").toLowerCase().includes(search) ||
        (item.company || "").toLowerCase().includes(search);
      const matchesCompany = !company || item.company === company;
      return matchesSearch && matchesCompany;
    })
    .sort((a, b) => (b.pub_date || b.first_seen || "").localeCompare(a.pub_date || a.first_seen || ""));

  tbody.innerHTML = filtered.map((item) => `
    <tr>
      <td data-label="Data">${escapeHtml(item.pub_date || item.first_seen)}</td>
      <td data-label="Azienda">${escapeHtml(item.company)}</td>
      <td data-label="Titolo">${escapeHtml(item.title)}</td>
      <td data-label="Fonte">${escapeHtml(item.source_publisher)}</td>
      <td data-label="Link">${item.url ? `<a class="open-link" href="${item.url}" target="_blank" rel="noopener">Apri</a>` : ""}</td>
    </tr>
  `).join("");

  document.getElementById("news-count").textContent = `${filtered.length} notizie`;
}

function setupTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.tab).classList.add("active");
    });
  });
}

async function init() {
  setupTabs();

  const jobsSourceFilter = document.getElementById("jobs-source-filter");
  jobsSourceFilter.dataset.allLabel = "Tutte le fonti";
  const newsCompanyFilter = document.getElementById("news-company-filter");
  newsCompanyFilter.dataset.allLabel = "Tutte le aziende";

  try {
    const [jobsRes, newsRes] = await Promise.all([
      fetch("data/jobs_history.json"),
      fetch("data/news_history.json"),
    ]);
    jobsData = await jobsRes.json();
    newsData = await newsRes.json();
  } catch (e) {
    console.error("Errore nel caricamento dei dati", e);
    jobsData = [];
    newsData = [];
  }

  populateSelect(jobsSourceFilter, jobsData.map((j) => j.source));
  populateSelect(newsCompanyFilter, newsData.map((n) => n.company));

  document.getElementById("jobs-search").addEventListener("input", renderJobs);
  jobsSourceFilter.addEventListener("change", renderJobs);
  document.getElementById("news-search").addEventListener("input", renderNews);
  newsCompanyFilter.addEventListener("change", renderNews);

  renderJobs();
  renderNews();
}

init();
