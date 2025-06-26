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
  const navLinks = document.querySelectorAll('.nav-list a:not(.close-menu)');
  
  function closeMobileMenu() {
    mainNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }
  
  menuToggle.addEventListener('click', function() {
    mainNav.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });
  
  closeMenu.addEventListener('click', function(e) {
    e.preventDefault();
    closeMobileMenu();
  });
  
  overlay.addEventListener('click', function() {
    closeMobileMenu();
  });

  // Fechar o menu ao clicar em um link
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      closeMobileMenu();
    });
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
          <button class="btn btn-primary btn-card reservar-btn" data-modelo="${veiculo.modelo}">Reservar</button>
        </div>
      </div>
    `).join('');

    // Adiciona evento de clique para os botões de reserva
    document.querySelectorAll('.reservar-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const modelo = this.getAttribute('data-modelo');
        abrirWhatsApp(modelo);
      });
    });
  }

  // Formulário de reserva
  const nomeInput = document.getElementById('nome');
  const telefoneInput = document.getElementById('telefone');
  const dataRetiradaInput = document.getElementById('data-retirada');
  const dataDevolucaoInput = document.getElementById('data-devolucao');
  const resultadoReservaDiv = document.getElementById('resultado-reserva');
  const consultarButton = document.getElementById('consultar-button');
  const whatsappButton = document.getElementById('whatsapp-button');

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

    resultadoReservaDiv.textContent = `Período da reserva: ${diffDays} dia(s).`;
    resultadoReservaDiv.style.color = 'green';

    // Rolar até a seção de veículos
    document.getElementById('veiculos').scrollIntoView({ behavior: 'smooth' });
  }

  // Adiciona listener para o botão de consulta
  consultarButton.addEventListener('click', function() {
    // Validação básica
    if (!dataRetiradaInput.value || !dataDevolucaoInput.value) {
      resultadoReservaDiv.textContent = 'Por favor, preencha as datas de retirada e devolução.';
      resultadoReservaDiv.style.color = 'red';
      return;
    }
    calcularTotalPeriodo();
  });

  // Função para abrir o WhatsApp com a mensagem pré-preenchida
  function abrirWhatsApp(modeloVeiculo = '') {
    const nome = nomeInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const dataRetirada = dataRetiradaInput.value;
    const dataDevolucao = dataDevolucaoInput.value;
    
    let message = 'Olá! Eu sou ' + (nome || '') + ' e gostaria de reservar o veículo ' + modeloVeiculo;
    
    if (dataRetirada && dataDevolucao) {
      message += ' no intervalo de ' + formatarData(dataRetirada) + ' a ' + formatarData(dataDevolucao) + '.';
    } else {
      message += '.';
    }
    
    const whatsappNumber = '557736442289';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  }

  function formatarData(dataString) {
    const [year, month, day] = dataString.split('-');
    return `${day}/${month}/${year}`;
  }

  // Configura o botão do WhatsApp
  whatsappButton.addEventListener('click', function(e) {
    e.preventDefault();
    abrirWhatsApp();
  });

  // Define data mínima para os campos de data (hoje)
  const today = new Date().toISOString().split('T')[0];
  if (dataRetiradaInput) dataRetiradaInput.min = today;
  if (dataDevolucaoInput) dataDevolucaoInput.min = today;

  // Carrega os veículos ao iniciar
  carregarVeiculos();

  // Prevenir zoom com dois dedos
  document.addEventListener('touchmove', function(event) {
    if (event.scale !== 1) {
      event.preventDefault();
    }
  }, { passive: false });
});