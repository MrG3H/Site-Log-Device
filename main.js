let todosLogs = [];
let paginaAtual = 1;
let limitePorPagina = 50;

// 🔁 Atualiza limite de visualização
window.atualizarLimite = function () {
  const valor = document.getElementById('limitSelect').value;
  limitePorPagina = (valor === "all") ? todosLogs.length : parseInt(valor);
  paginaAtual = 1;
  renderizarLogs();
};

// 🔍 Buscar logs por ID
window.buscarLogs = async function () {
  const deviceId = document.getElementById('deviceIdInput').value.trim();
  if (!deviceId) {
    alert('Digite um ID de dispositivo válido.');
    return;
  }

  const logContainer = document.getElementById('log-container');
  logContainer.innerHTML = 'Carregando logs do dispositivo...';

  try {
    const response = await fetch(`http://localhost:3000/api/logs/${deviceId}`);
    const data = await response.json();
    const wrapper = data ? { [deviceId]: data } : {};
    processarLogs(wrapper);
  } catch (err) {
    logContainer.innerHTML = '<p>Erro ao buscar os dados.</p>';
    console.error(err);
  }
};

// 🔄 Carregar todos os logs
window.carregarTodosLogs = async function () {
  const logContainer = document.getElementById('log-container');
  logContainer.innerHTML = 'Carregando logs...';

  try {
    const response = await fetch('http://localhost:3000/api/logs');
    const data = await response.json();
    processarLogs(data);
  } catch (err) {
    logContainer.innerHTML = '<p>Erro ao carregar os logs.</p>';
    console.error(err);
  }
};

// 🔄 Processa logs do Firebase
function processarLogs(data) {
  todosLogs = [];

  for (const deviceId in data) {
    const registros = data[deviceId];
    for (const timestamp in registros) {
      todosLogs.push({
        deviceId,
        timestamp,
        ...registros[timestamp]
      });
    }
  }

  todosLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  paginaAtual = 1;
  window.atualizarLimite();
}

// 📊 Renderiza logs na tela
function renderizarLogs() {
  const inicio = (paginaAtual - 1) * limitePorPagina;
  const fim = inicio + limitePorPagina;
  const logsPagina = todosLogs.slice(inicio, fim);

  const logContainer = document.getElementById('log-container');
  logContainer.innerHTML = '';

  if (logsPagina.length === 0) {
    logContainer.innerHTML = '<p>Nenhum log encontrado.</p>';
    return;
  }

  logsPagina.forEach(log => {
    const div = document.createElement('div');
    div.className = 'log';
    div.innerHTML = `
      <time><strong>${log.modelo}</strong> ${log.timestamp} - <em>ID: ${log.deviceId}</em></time><br/>
      CPU: ${log.cpu}<br/>
      RAM: ${log.ram}<br/>
      Dados Móveis: ${log.dadosMoveis}<br/>
      Wi-Fi: ${log.wifi}
    `;
    logContainer.appendChild(div);
  });

  renderizarPaginacao();
}

// 📄 Paginação
function renderizarPaginacao() {
  const totalPaginas = Math.ceil(todosLogs.length / limitePorPagina);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.onclick = () => {
      paginaAtual = i;
      renderizarLogs();
    };
    if (i === paginaAtual) {
      btn.style.backgroundColor = '#007bff';
      btn.style.color = '#fff';
    }
    pagination.appendChild(btn);
  }
}

// 📥 Exportar para CSV
window.exportarCSV = function () {
  if (todosLogs.length === 0) {
    alert("Nenhum dado para exportar.");
    return;
  }

  const headers = ["Device ID", "Timestamp", "CPU", "RAM", "Dados Móveis", "Wi-Fi"];
  const rows = todosLogs.map(log => [
    log.deviceId,
    log.timestamp,
    log.cpu,
    log.ram,
    log.dadosMoveis,
    log.wifi
  ]);

  const csvContent = [headers, ...rows]
    .map(e => e.map(v => `"${v}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "logs_dispositivos.csv";
  link.click();
};

// 🚀 Iniciar carregamento automático
window.onload = () => {
  window.carregarTodosLogs();
};
