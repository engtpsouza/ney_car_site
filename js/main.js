fetch('veiculos.json')
  .then(res => res.json())
  .then(data => {
    const cont = document.getElementById('lista-veiculos');
    if (!data.length) {
      cont.innerHTML = '<p>Nenhum veículo disponível.</p>';
      return;
    }
    cont.innerHTML = data.map(v => `
      <div class="card">
        <img src="${v.imagem}" alt="${v.modelo}" />
        <h3>${v.modelo}</h3>
        <p>${v.descricao}</p>
        <p><strong>R$ ${v.preco_dia}/dia</strong></p>
      </div>
    `).join('');
  })
  .catch(err => {
    document.getElementById('lista-veiculos').innerHTML =
      '<p>Erro ao carregar veículos. Verifique veiculos.json e imagens.</p>';
    console.error(err);
  });
