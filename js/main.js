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
   const precoDia = parseFloat(veiculo.preco