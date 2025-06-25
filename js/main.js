document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENTOS DO DOM ---
  const dataRetiradaInput = document.getElementById("data-retirada");
  const dataDevolucaoInput = document.getElementById("data-devolucao");
  const track = document.getElementById("carros-carousel");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  // --- ESTADO DA APLICAÇÃO ---
  let veiculos = [];
  let indexCentral = 0;      // Índice do carro nos dados originais (fonte da verdade)
  let currentDomIndex = 0;   // Índice do card no DOM (controla a posição visual)
  let isTransitioning = false; // Flag para evitar cliques durante a animação
  const SEU_NUMERO_WHATSAPP = "5511999999999"; // <-- TROQUE PELO SEU NÚMERO com código do país e DDD

  /**
   * Define a posição do carrossel. Esta é a função central para todo o movimento.
   */
  function setCarouselPosition() {
    const cardElement = track.querySelector('.carro-card');
    if (!cardElement) return;

    // Calcula a largura total, incluindo o espaçamento (gap)
    const cardWidth = cardElement.offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const totalWidthPerItem = cardWidth + gap;
    
    const offset = -currentDomIndex * totalWidthPerItem;
    track.style.transform = `translateX(${offset}px)`;
  }

  /**
   * Atualiza qual card recebe o destaque visual.
   */
  function atualizarDestaque() {
    track.querySelectorAll('.carro-card').forEach(card => {
      const isCenter = parseInt(card.dataset.originalIndex) === indexCentral;
      card.classList.toggle('center', isCenter);
    });
  }

  /**
   * Renderiza os cards do carrossel. Chamada no início e em redimensionamentos.
   */
  function renderizarCarrossel() {
    if (veiculos.length === 0) return;

    const useInfiniteLoop = veiculos.length > 1;
    const dias = calcularDias();
    
    track.innerHTML = "";

    const itemsToRender = useInfiniteLoop 
      ? [veiculos[veiculos.length - 1], ...veiculos, veiculos[0]] 
      : [...veiculos];

    itemsToRender.forEach(carro => {
      const originalIndex = veiculos.findIndex(v => v.nome === carro.nome && v.preco === carro.preco);
      
      const card = document.createElement("div");
      card.className = "carro-card";
      card.dataset.originalIndex = originalIndex;
      
      card.innerHTML = `
        <div class="carro-card-content">
          <img src="${carro.imagem}" alt="${carro.nome}">
          <h3>${carro.nome}</h3>
          <p>Diária: <strong>R$ ${parseFloat(carro.preco).toFixed(2).replace('.',',')}</strong></p>
          <p>Total (${dias} ${dias === 1 ? 'dia' : 'dias'}): <strong>R$ ${totalizar(carro.preco, dias)}</strong></p>
          <button class="whatsapp-btn" data-car-index="${originalIndex}" ${dias > 0 ? '' : 'disabled'}>
            Solicitar Locação via WhatsApp
          </button>
        </div>
      `;
      track.appendChild(card);
    });
    
    // Define a posição inicial correta, sem animação
    track.style.transition = 'none';
    currentDomIndex = useInfiniteLoop ? indexCentral + 1 : indexCentral;
    setCarouselPosition();
    atualizarDestaque();
  }

  /**
   * Lida com o fim da transição para fazer o "salto" invisível do loop.
   */
  function handleTransitionEnd() {
    isTransitioning = false;
    const useInfiniteLoop = veiculos.length > 1;
    if (!useInfiniteLoop) return;

    // Se paramos no clone do fim, saltamos para o item real do começo
    if (currentDomIndex >= veiculos.length + 1) {
      track.style.transition = 'none';
      currentDomIndex = 1;
      setCarouselPosition();
    }
    // Se paramos no clone do começo, saltamos para o item real do fim
    if (currentDomIndex <= 0) {
      track.style.transition = 'none';
      currentDomIndex = veiculos.length;
      setCarouselPosition();
    }
  }

  /**
   * Move o carrossel na direção desejada.
   */
  function moverCarrossel(direcao) {
    if (isTransitioning || veiculos.length <= 1) return;
    isTransitioning = true;
    
    // Atualiza o índice do DOM para o movimento
    currentDomIndex += direcao;
    
    // Aplica a animação e move
    track.style.transition = 'transform 0.5s ease-in-out';
    setCarouselPosition();

    // Atualiza o índice dos dados para saber qual é o carro central
    const numVeiculos = veiculos.length;
    indexCentral = (indexCentral + direcao + numVeiculos) % numVeiculos;
    atualizarDestaque();
  }

  // --- Funções Auxiliares (sem alterações) ---

  function totalizar(preco, dias) {
      const total = parseFloat(preco) * dias;
      return total.toFixed(2).replace('.', ',');
  }
  
  function calcularDias() {
    if (!dataRetiradaInput.value || !dataDevolucaoInput.value) return 0;
    const retirada = new Date(dataRetiradaInput.value);
    const devolucao = new Date(dataDevolucaoInput.value);
    const diffTime = devolucao.getTime() - retirada.getTime();
    if (diffTime < 0) return 0;
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return dias;
  }

  function configurarDatas() {
    const hoje = new Date().toISOString().split("T")[0];
    dataRetiradaInput.min = hoje;
    dataDevolucaoInput.min = hoje;

    const renderOnDateChange = () => {
        if (dataRetiradaInput.value) {
            dataDevolucaoInput.min = dataRetiradaInput.value;
        }
        renderizarCarrossel();
    };

    dataRetiradaInput.addEventListener("change", renderOnDateChange);
    dataDevolucaoInput.addEventListener("change", renderOnDateChange);
  }

  async function carregarVeiculos() {
    try {
      const resposta = await fetch("https://script.google.com/macros/s/AKfycbwjsCItoKDekA2U8VfLma7izBSEUzCNyprYujfINUcwpxeRL3kNiRR7HyacVE2oalYRQw/exec");
      if (!resposta.ok) throw new Error(`Erro na rede: ${resposta.statusText}`);
      veiculos = await resposta.json();
      renderizarCarrossel();
    } catch (erro) {
      console.error("Erro ao carregar dados dos veículos:", erro);
      track.innerHTML = "<p>Não foi possível carregar os veículos. Tente novamente mais tarde.</p>";
    }
  }

  function solicitarLocacao(event) {
    const target = event.target;
    if (target.classList.contains('whatsapp-btn')) {
        const carroIndex = parseInt(target.dataset.carIndex, 10);
        const carro = veiculos[carroIndex];
        const dias = calcularDias();

        if (dias <= 0) {
            alert("Por favor, selecione a data de retirada e devolução.");
            return;
        }

        const dataRetiradaFormatada = new Date(dataRetiradaInput.value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        const dataDevolucaoFormatada = new Date(dataDevolucaoInput.value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

        const mensagem = `Olá! Gostaria de solicitar a locação do veículo *${carro.nome}*.
Período: de ${dataRetiradaFormatada} a ${dataDevolucaoFormatada} (${dias} dias).
Valor total: R$ ${totalizar(carro.preco, dias)}.
Aguardo contato. Obrigado!`;
        
        const urlWhatsApp = `https://wa.me/${SEU_NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
        
        window.open(urlWhatsApp, '_blank');
    }
  }

  // --- INICIALIZAÇÃO E EVENT LISTENERS ---
  prevBtn.addEventListener("click", () => moverCarrossel(-1));
  nextBtn.addEventListener("click", () => moverCarrossel(1));
  track.addEventListener("transitionend", handleTransitionEnd);
  track.addEventListener("click", solicitarLocacao);
  window.addEventListener('resize', renderizarCarrossel);

  configurarDatas();
  carregarVeiculos();
});