document.addEventListener('DOMContentLoaded', function() {
  // Inicializa a biblioteca AOS para animações ao scroll
  AOS.init({
    duration: 800,
    once: true,
    easing: 'ease-in-out'
  });

  // Menu responsivo
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const overlay = document.querySelector('.overlay');
  const closeMenu = document.querySelector('.close-menu');
  
  menuToggle.addEventListener('click', function() {
    mainNav.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });
  
  closeMenu.addEventListener('click', function(e) {
    e.preventDefault();
    mainNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  });
  
  overlay.addEventListener('click', function() {
    mainNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  });

  // Carregar veículos
  async function carregarVeiculos() {
    try {
      const response = await fetch('veiculos.json');
      if (!response.ok) {
        throw new Error('Erro ao carregar veículos');
      }
      const veiculosData = await response.json();
      exibirVeiculos(veiculosData);
    } catch (error) {
      console.error('Erro:', error);
      const listaVeiculos = document.getElementById('lista-veiculos');
      if (listaVeiculos) {
        listaVeiculos.innerHTML = '<p>Não foi possível carregar os veículos no momento.</p>';
      }
    }
  }

  function exibirVeiculos(veiculos) {
    const listaVeiculos = document.getElementById('lista-veiculos');
    if (!listaVeiculos) return;

    listaVeiculos.innerHTML = veiculos.map(veiculo => `
      <div class="card" data-aos="fade-up" data-aos-delay="100">
        <img src="${veiculo.imagem}" alt="${veiculo.modelo}" class="card-img" />
        <div class="card-content">
          <h3>${veiculo.modelo}</h3>
          <p class="category">${veiculo.categoria}</p>
          <p>${veiculo.descricao}</p>
          <div class="card-prices">
            <span class="price-day">R$ ${parseFloat(veiculo.preco_dia).toFixed(2)} / dia</span>
            <span class="price-total" id="total-${veiculo.modelo.replace(/\s/g, '-')}-card"></span>
          </div>
          <a href="#reserva" class="btn btn-primary btn-card">Reservar</a>
        </div>
      </div>
    `).join('');
  }

  // Formulário de reserva
  const reservaForm = document.getElementById('reserva-form');
  const nomeInput = document.getElementById('nome');
  const telefoneInput = document.getElementById('telefone');
  const dataRetiradaInput = document.getElementById('data-retirada');
  const dataDevolucaoInput = document.getElementById('data-devolucao');
  const resultadoReservaDiv = document.getElementById('resultado-reserva');

  // Função para calcular o total de dias e atualizar a exibição
  function calcularTotalPeriodo() {
    const retirada = dataRetiradaInput.value;
    const devolucao = dataDevolucaoInput.value;
    
    if (!retirada || !devolucao) {
      resultadoReservaDiv.textContent = 'Selecione as datas para calcular o período.';
      resultadoReservaDiv.style.color = '#666';
      return;
    }

    const dtRetirada = new Date(retirada);
    const dtDevolucao = new Date(devolucao);
    
    let diffTime = Math.abs(dtDevolucao.getTime() - dtRetirada.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) diffDays = 1;

    // Atualizar os totais nos cards (assumindo que os veículos já foram carregados)
    document.querySelectorAll('.card').forEach(card => {
      const precoDiaElement = card.querySelector('.price-day');
      if (precoDiaElement) {
        const precoDia = parseFloat(precoDiaElement.textContent.match(/\d+\.\d{2}/)[0]);
        const total = (precoDia * diffDays).toFixed(2);
        const totalSpan = card.querySelector('.price-total');
        if (totalSpan) {
          totalSpan.textContent = `Total: R$ ${total}`;
        }
      }
    });

    resultadoReservaDiv.textContent = `Período da reserva: ${diffDays} dia(s). Valores atualizados nos veículos.`;
    resultadoReservaDiv.style.color = 'green';
  }

  // Adiciona listeners para atualizar o cálculo quando as datas mudarem
  if (dataRetiradaInput) {
    dataRetiradaInput.addEventListener('change', calcularTotalPeriodo);
  }
  if (dataDevolucaoInput) {
    dataDevolucaoInput.addEventListener('change', calcularTotalPeriodo);
  }

  // Envio do formulário
  if (reservaForm) {
    reservaForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Coleta os valores dos campos
      const nome = nomeInput ? nomeInput.value.trim() : '';
      const telefone = telefoneInput ? telefoneInput.value.trim() : '';
      const dataRetirada = dataRetiradaInput ? dataRetiradaInput.value : '';
      const dataDevolucao = dataDevolucaoInput ? dataDevolucaoInput.value : '';

      // Validação básica
      if (!nome || !telefone || !dataRetirada || !dataDevolucao) {
        if (resultadoReservaDiv) {
          resultadoReservaDiv.textContent = 'Por favor, preencha todos os campos obrigatórios.';
          resultadoReservaDiv.style.color = 'red';
        }
        return;
      }

      // Feedback para o usuário
      if (resultadoReservaDiv) {
        resultadoReservaDiv.textContent = 'Sua solicitação foi enviada! Em breve entraremos em contato.';
        resultadoReservaDiv.style.color = 'green';
      }
      
      reservaForm.reset();
      calcularTotalPeriodo();
    });
  }
  
  // Define data mínima para os campos de data (hoje)
  const today = new Date().toISOString().split('T')[0];
  if (dataRetiradaInput) dataRetiradaInput.min = today;
  if (dataDevolucaoInput) dataDevolucaoInput.min = today;

  // Carrega os veículos ao iniciar
  carregarVeiculos();
});