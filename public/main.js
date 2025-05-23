function renderizarPaginacao() {
  const totalPaginas = Math.ceil(todosLogs.length / limitePorPagina);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  if (totalPaginas <= 1) return;

  // Botão primeira página
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

  // Páginas ao redor da atual
  let start = Math.max(paginaAtual - 1, 2);
  let end = Math.min(paginaAtual + 1, totalPaginas - 1);

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

  // Botão última página
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