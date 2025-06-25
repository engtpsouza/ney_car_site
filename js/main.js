// Função para carregar os veículos do JSON
async function carregarVeiculos() {
  try {
    const res = await fetch('veiculos.json');
    const veiculos = await res.json();

    const listaVeiculos = document.getElementById('lista-veiculos');
    listaVeiculos.innerHTML = veiculos.map(veiculo => `
      <div class="card">
        <img src="${veiculo.imagem}" alt="${veiculo.modelo}" />
        <h3>${veiculo.modelo}</h3>
        <p>${veiculo.descricao}</p>
        <strong>R$ ${veiculo.preco_dia} / dia</strong>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar veículos:', error);
    document.getElementById('lista-veiculos').innerHTML = '<p>Erro ao carregar veículos.</p>';
  }
}

// Função para calcular dias e mostrar valor total da reserva
function calcularReserva(event) {
  event.preventDefault();

  const retirada = document.getElementById('data-retirada').value;
  const devolucao = document.getElementById('data-devolucao').value;
  const resultado = document.getElementById('resultado');

  if (!retirada || !devolucao) {
    resultado.textContent = 'Por favor, selecione ambas as datas.';
    return;
  }

  const dtRetirada = new Date(retirada);
  const dtDevolucao = new Date(devolucao);

  if (dtDevolucao <= dtRetirada) {
    resultado.textContent = 'A data de devolução deve ser posterior à de retirada.';
    return;
  }

  const diffTime = Math.abs(dtDevolucao - dtRetirada);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Calcula valor total usando o primeiro veículo como referência
  fetch('veiculos.json')
    .then(res => res.json())
    .then(veiculos => {
      if (veiculos.length === 0) {
        resultado.textContent = 'Nenhum veículo disponível para cálculo.';
        return;
      }
      const precoDia = parseFloat(veiculos[0].preco_dia);
      const total = (precoDia * diffDays).toFixed(2);
      resultado.textContent = `Reserva por ${diffDays} dia(s). Valor aproximado: R$ ${total}`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
  carregarVeiculos();

  document.getElementById('reserva-form').addEventListener('submit', calcularReserva);
});
