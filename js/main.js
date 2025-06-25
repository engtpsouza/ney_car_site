// Dados dos veículos
let veiculosData = [];

// Função para carregar os veículos do JSON
async function carregarVeiculos() {
  try {
    const res = await fetch('veiculos.json');
    veiculosData = await res.json(); // Armazena os dados para uso posterior

    const listaVeiculos = document.getElementById('lista-veiculos');
    listaVeiculos.innerHTML = veiculosData.map(veiculo => `
      <div class="card" data-aos="fade-up" data-aos-delay="100">
        <img src="${veiculo.imagem}" alt="${veiculo.modelo}" />
        <div class="card-content">
          <h3>${veiculo.modelo}</h3>
          <p class="category">${veiculo.categoria}</p>
          <div class="card-prices">
            <span class="price-day">R$ ${parseFloat(veiculo.preco_dia).toFixed(2)} / dia</span>
            <span class="price-total" id="total-${veiculo.modelo.replace(/\s/g, '-')}-card"></span>
          </div>
          <a href="#reserva" class="btn btn-primary btn-card">Reservar</a>
        </div>
      </div>
    `).join('');

    // Preenche o dropdown de tipo de carro
    const tipoCarroSelect = document.getElementById('tipo-carro');
    const categoriasUnicas = [...new Set(veiculosData.map(v => v.categoria))];
    categoriasUnicas.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria;
      option.textContent = categoria;
      tipoCarroSelect.appendChild(option);
    });

    // Atualiza os valores totais nos cards assim que a página carrega, caso datas já estejam preenchidas
    calcularTotalPeriodo();

  } catch (error) {
    console.error('Erro ao carregar veículos:', error);
    document.getElementById('lista-veiculos').innerHTML = '<p>Erro ao carregar veículos.</p>';
  }
}

// Função para calcular dias e atualizar valor total nos cards
function calcularTotalPeriodo() {
  const retiradaInput = document.getElementById('data-retirada');
  const devolucaoInput = document.getElementById('data-devolucao');
  const resultadoReserva = document.getElementById('resultado-reserva');

  const retirada = retiradaInput.value;
  const devolucao = devolucaoInput.value;

  if (!retirada || !devolucao) {
    // Limpa os totais nos cards se as datas não estiverem preenchidas
    veiculosData.forEach(veiculo => {
      const totalSpan = document.getElementById(`total-${veiculo.modelo.replace(/\s/g, '-')}-card`);
      if (totalSpan) {
        totalSpan.textContent = '';
      }
    });
    resultadoReserva.textContent = '';
    return;
  }

  const dtRetirada = new Date(retirada);
  const dtDevolucao = new Date(devolucao);

  // Ajusta as datas para o fuso horário local para evitar problemas com diferença de fuso
  dtRetirada.setMinutes(dtRetirada.getMinutes() + dtRetirada.getTimezoneOffset());
  dtDevolucao.setMinutes(dtDevolucao.getMinutes() + dtDevolucao.getTimezoneOffset());

  if (dtDevolucao < dtRetirada) {
    resultadoReserva.textContent = 'A data de devolução deve ser igual ou posterior à de retirada.';
    // Limpa os totais nos cards
    veiculosData.forEach(veiculo => {
      const totalSpan = document.getElementById(`total-${veiculo.modelo.replace(/\s/g, '-')}-card`);
      if (totalSpan) {
        totalSpan.textContent = '';
      }
    });
    return;
  }

  const diffTime = Math.abs(dtDevolucao.getTime() - dtRetirada.getTime());
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Garante que o número de dias seja no mínimo 1 se as datas forem iguais ou válidas
  if (diffDays === 0 && dtRetirada.toDateString() === dtDevolucao.toDateString()) {
      diffDays = 1;
  } else if (diffDays === 0) { // Se por algum motivo for 0 e as datas não são iguais (erro de cálculo)
      resultadoReserva.textContent = 'Erro ao calcular número de dias.';
      return;
  }


  veiculosData.forEach(veiculo => {
    const precoDia = parseFloat(veiculo.preco_dia);
    const total = (precoDia * diffDays).toFixed(2);
    const totalSpan = document.getElementById(`total-${veiculo.modelo.replace(/\s/g, '-')}-card`);
    if (totalSpan) {
      totalSpan.textContent = `Total: R$ ${total}`;
    }
  });

  // Atualiza a mensagem geral da reserva
  if (diffDays > 0) {
      resultadoReserva.textContent = `Período de ${diffDays} dia(s) selecionado.`;
  } else {
      resultadoReserva.textContent = '';
  }
}

// Validação e envio do formulário de reserva
function validarFormularioReserva(event) {
  event.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const retirada = document.getElementById('data-retirada').value;
  const devolucao = document.getElementById('data-devolucao').value;
  const resultadoReserva = document.getElementById('resultado-reserva');

  if (!nome || !telefone || !retirada || !devolucao) {
    resultadoReserva.textContent = 'Por favor, preencha todos os campos obrigatórios.';
    resultadoReserva.style.color = 'red';
    return;
  }

  const dtRetirada = new Date(retirada);
  const dtDevolucao = new Date(devolucao);

  dtRetirada.setMinutes(dtRetirada.getMinutes() + dtRetirada.getTimezoneOffset());
  dtDevolucao.setMinutes(dtDevolucao.getMinutes() + dtDevolucao.getTimezoneOffset());

  if (dtDevolucao < dtRetirada) {
    resultadoReserva.textContent = 'A data de devolução deve ser igual ou posterior à data de retirada.';
    resultadoReserva.style.color = 'red';
    return;
  }

  const diffTime = Math.abs(dtDevolucao.getTime() - dtRetirada.getTime());
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
      diffDays = 1; // Para reservas de 1 dia (mesma data)
  }

  // Validação do formato do telefone
  const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  if (!telefoneRegex.test(telefone)) {
    resultadoReserva.textContent = 'Por favor, insira um telefone válido no formato (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX.';
    resultadoReserva.style.color = 'red';
    return;
  }

  // Aqui você enviaria os dados do formulário para um backend ou exibiria uma mensagem de sucesso.
  // Por simplicidade, apenas exibe a mensagem de sucesso.
  resultadoReserva.textContent = `Sua solicitação de reserva foi enviada! Entraremos em contato em breve. Período: ${diffDays} dia(s).`;
  resultadoReserva.style.color = 'green';

  // Opcional: limpar o formulário após o envio
  // event.target.reset();
  // calcularTotalPeriodo(); // Limpa os totais nos cards
}


document.addEventListener('DOMContentLoaded', () => {
  // Inicializa AOS
  AOS.init({
    duration: 1000,
    once: true,
  });

  carregarVeiculos();

  const reservaForm = document.getElementById('reserva-form');
  const dataRetiradaInput = document.getElementById('data-retirada');
  const dataDevolucaoInput = document.getElementById('data-devolucao');

  if (reservaForm) {
    reservaForm.addEventListener('submit', validarFormularioReserva);
  }

  // Adiciona listeners para os campos de data para atualizar os preços automaticamente
  if (dataRetiradaInput) {
    dataRetiradaInput.addEventListener('change', calcularTotalPeriodo);
  }
  if (dataDevolucaoInput) {
    dataDevolucaoInput.addEventListener('change', calcularTotalPeriodo);
  }

  // Smooth scroll para links de navegação
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - (document.querySelector('.header-full-width').offsetHeight || 0), // Ajusta para o cabeçalho fixo
          behavior: 'smooth'
        });
      }
    });
  });

  // Ajuste do logo no scroll para cabeçalho fixo
  const header = document.querySelector('.header-full-width');
  const logo = document.querySelector('.logo');
  const initialLogoHeight = logo ? logo.offsetHeight : 120; // Pega a altura inicial ou usa um fallback

  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 50) { // Se o scroll for maior que 50px
        header.classList.add('scrolled');
        if (logo) logo.style.height = '80px'; // Reduz a logo
      } else {
        header.classList.remove('scrolled');
        if (logo) logo.style.height = initialLogoHeight + 'px'; // Volta ao tamanho original
      }
    }
  });

});