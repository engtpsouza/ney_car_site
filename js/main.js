fetch('veiculos.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('lista-veiculos');
    container.innerHTML = data.map(veiculo => `
      <div class="card">
        <img src="${veiculo.imagem}" alt="${veiculo.modelo}" />
        <h3>${veiculo.modelo}</h3>
        <p>${veiculo.descricao}</p>
        <p><strong>R$ ${veiculo.preco_dia}/dia</strong></p>
      </div>
    `).join('');
  })
  .catch(err => {
    document.getElementById('lista-veiculos').innerHTML =
      '<p>Erro ao carregar os veículos. Verifique o arquivo veiculos.json.</p>';
    console.error(err);
  });
