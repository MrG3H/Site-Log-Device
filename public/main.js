let todosLogs = [];
let paginaAtual = 1;
let limitePorPagina = 50;

// ✅ Conectar ao WebSocket com reconexão automática
const socket = io({
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// ✅ Quando uma nova log for emitida pelo backend, recarrega automaticamente.
socket.on('nova_log', (deviceId) => {
  console.log(`📡 Nova log detectada para o device: ${deviceId}`);
  window.carregarTodosLogs(); // ✅ Atualiza automaticamente.
});

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
    const response = await fetch(`/api/logs/${deviceId}`);
    const data = await response.json();

    if (!data) {
      logContainer.innerHTML = '<p>Nenhum dado encontrado.</p>';
      return;
    }

    const wrapper = { [deviceId]: data };
    processarLogs(wrapper);

  } catch (err) {
    logContainer.innerHTML = '<p>Erro ao buscar os dados.</p>';
    console.error('Erro ao buscar logs:', err);
  }
};

// 🔄 Carregar todos os logs
window.carregarTodosLogs = async function () {
  const logContainer = document.getElementById('log-container');
  logContainer.innerHTML = 'Carregando logs...';

  try {
    const response = await fetch(`/api/logs`);
    const data = await response.json();

    if (!data) {
      logContainer.innerHTML = '<p>Nenhum log disponível.</p>';
      return;
    }

    processarLogs(data);

  } catch (err) {
    logContainer.innerHTML = '<p>Erro ao carregar os logs.</p>';
    console.error('Erro ao carregar logs:', err);
  }
};

// 🔄 Processa logs
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
      <time><strong>${log.modelo || 'Desconhecido'}</strong> ${log.timestamp} - <em>ID: ${log.deviceId}</em></time><br/>
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

  if (totalPaginas <= 1) return;

  // Botão da primeira página
  const firstBtn = document.createElement('button');
  firstBtn.innerText = '1';
  firstBtn.onclick = () => {
    paginaAtual = 1;
    renderizarLogs();
  };
  if (paginaAtual === 1) {
    firstBtn.style.backgroundColor = '#007bff';
    firstBtn.style.color = '#fff';
  }
  pagination.appendChild(firstBtn);

  // Mostrar ... se estiver longe da primeira página
  if (paginaAtual > 4) {
    const dots = document.createElement('span');
    dots.innerText = ' ... ';
    pagination.appendChild(dots);
  }

  // Páginas próximas (anterior, atual, próxima)
  const start = Math.max(2, paginaAtual - 1);
  const end = Math.min(totalPaginas - 1, paginaAtual + 1);

  for (let i = start; i <= end; i++) {
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

  // Mostrar ... se estiver longe da última página
  if (paginaAtual < totalPaginas - 3) {
    const dots = document.createElement('span');
    dots.innerText = ' - ';
    pagination.appendChild(dots);
  }

  // Botão da última página
  if (totalPaginas > 1) {
    const lastBtn = document.createElement('button');
    lastBtn.innerText = totalPaginas;
    lastBtn.onclick = () => {
      paginaAtual = totalPaginas;
      renderizarLogs();
    };
    if (paginaAtual === totalPaginas) {
      lastBtn.style.backgroundColor = '#007bff';
      lastBtn.style.color = '#fff';
    }
    pagination.appendChild(lastBtn);
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