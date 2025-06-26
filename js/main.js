document.addEventListener('DOMContentLoaded', function() {
    console.log('main.js: DOMContentLoaded disparado. Script carregado.');

    // Inicializa a biblioteca AOS para animações ao scroll
    AOS.init({
        duration: 800,
        once: true,
        easing: 'ease-in-out'
    });

    // --- Lógica de Carregamento e Exibição de Veículos ---
    // Dados dos veículos
    let veiculosData = []; // Armazena os dados dos veículos carregados

    async function carregarVeiculos() {
        console.log('main.js: Iniciando carregamento de veículos...');
        try {
            const res = await fetch('veiculos.json');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            veiculosData = await res.json(); // Armazena os dados para uso posterior

            const listaVeiculos = document.getElementById('lista-veiculos');
            if (listaVeiculos) {
                if (veiculosData.length === 0) {
                    listaVeiculos.innerHTML = '<p>Nenhum veículo disponível no momento.</p>';
                } else {
                    listaVeiculos.innerHTML = veiculosData.map(veiculo => `
                        <div class="card" data-aos="fade-up" data-aos-delay="100">
                            <img src="${veiculo.imagem}" alt="${veiculo.modelo}" />
                            <div class="card-content">
                                <h3>${veiculo.modelo}</h3>
                                <p class="category">${veiculo.categoria || ''}</p>
                                <div class="card-prices">
                                    <span class="price-day">R$ ${parseFloat(veiculo.preco_dia).toFixed(2)} / dia</span>
                                    <span class="price-total" id="total-${veiculo.modelo.replace(/\s/g, '-')}-card"></span>
                                </div>
                                <a href="#reserva" class="btn btn-primary btn-card">Reservar</a>
                            </div>
                        </div>
                    `).join('');
                    console.log('main.js: Veículos carregados e exibidos com sucesso.');

                    // Chama calcularTotalPeriodo para preencher os totais se as datas já estiverem selecionadas
                    // ou para limpar/resetar se não houver datas.
                    calcularTotalPeriodo();
                }
            } else {
                console.error('main.js: Elemento #lista-veiculos não encontrado para carregar veículos.');
            }
        }
        catch (error) {
            console.error('main.js: Erro ao carregar veículos:', error);
            const listaVeiculos = document.getElementById('lista-veiculos');
            if (listaVeiculos) {
                listaVeiculos.innerHTML = '<p>Erro ao carregar veículos. Por favor, tente novamente mais tarde.</p>';
            }
        }
    }
    // --- Fim da Lógica de Carregamento e Exibição de Veículos ---


    // Seleciona os elementos do formulário de reserva
    const reservaForm = document.getElementById('reserva-form');
    const nomeInput = document.getElementById('nome');
    const telefoneInput = document.getElementById('telefone');
    const dataRetiradaInput = document.getElementById('data-retirada');
    const dataDevolucaoInput = document.getElementById('data-devolucao');
    const resultadoReservaDiv = document.getElementById('resultado-reserva');


    // Verificação para garantir que todos os elementos do formulário foram encontrados
    if (!reservaForm) console.error('main.js: Elemento #reserva-form não encontrado!');
    if (!nomeInput) console.error('main.js: Elemento #nome não encontrado!');
    if (!telefoneInput) console.error('main.js: Elemento #telefone não encontrado!');
    if (!dataRetiradaInput) console.error('main.js: Elemento #data-retirada não encontrado!');
    if (!dataDevolucaoInput) console.error('main.js: Elemento #data-devolucao não encontrado!');
    if (!resultadoReservaDiv) console.error('main.js: Elemento #resultado-reserva não encontrado!');


    // Função auxiliar para formatar a data para o formato DD/MM/YYYY
    function formatDate(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // Função para calcular o total de dias e atualizar a exibição, se necessário
    function calcularTotalPeriodo() {
        const retirada = dataRetiradaInput.value;
        const devolucao = dataDevolucaoInput.value;
        
        if (!retirada || !devolucao) {
            // Limpa os totais se as datas não estiverem completas
            veiculosData.forEach(veiculo => {
                const totalSpan = document.getElementById(`total-${veiculo.modelo.replace(/\s/g, '-')}-card`);
                if (totalSpan) {
                    totalSpan.textContent = '';
                }
            });
            if (resultadoReservaDiv) {
                resultadoReservaDiv.textContent = 'Selecione as datas para calcular o período.';
                resultadoReservaDiv.style.color = '#666';
            }
            return;
        }

        const dtRetirada = new Date(retirada);
        const dtDevolucao = new Date(devolucao);

        // Ajusta as datas para o fuso horário local para evitar problemas com diferença de fuso
        dtRetirada.setMinutes(dtRetirada.getMinutes() + dtRetirada.getTimezoneOffset());
        dtDevolucao.setMinutes(dtDevolucao.getMinutes() + dtDevolucao.getTimezoneOffset());

        let diffTime = Math.abs(dtDevolucao.getTime() - dtRetirada.getTime());
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Se as datas forem iguais, considera 1 dia
        if (diffDays === 0 && dtRetirada.toDateString() === dtDevolucao.toDateString()) {
            diffDays = 1;
        } else if (diffDays === 0) { // Se por algum motivo for 0 e as datas não são iguais (erro de cálculo)
            if (resultadoReservaDiv) {
                resultadoReservaDiv.textContent = 'Erro ao calcular número de dias.';
                resultadoReservaDiv.style.color = 'red';
            }
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

        if (resultadoReservaDiv) {
            resultadoReservaDiv.textContent = `Período da reserva: ${diffDays} dia(s). Valores atualizados nos veículos.`;
            resultadoReservaDiv.style.color = 'green';
        }
    }


    // Adiciona um "listener" para o evento de envio do formulário de reserva
    if (reservaForm) { // Garante que o formulário foi encontrado antes de adicionar o listener
        reservaForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário (que recarregaria a página)
            console.log('main.js: Evento de submit do formulário de reserva capturado. preventDefault() chamado.');

            // Coleta os valores dos campos
            const nome = nomeInput ? nomeInput.value.trim() : '';
            const telefone = telefoneInput ? telefoneInput.value.trim() : '';
            const dataRetirada = dataRetiradaInput ? dataRetiradaInput.value : '';
            const dataDevolucao = dataDevolucaoInput ? dataDevolucaoInput.value : '';

            console.log('main.js: Valores dos campos - Nome:', nome, 'Telefone:', telefone, 'Retirada:', dataRetirada, 'Devolução:', dataDevolucao);

            // Validação básica dos campos obrigatórios
            if (!nome || !telefone || !dataRetirada || !dataDevolucao) {
                if (resultadoReservaDiv) {
                    resultadoReservaDiv.textContent = 'Por favor, preencha todos os campos obrigatórios (Nome, Telefone, Data de Retirada, Data de Devolução).';
                    resultadoReservaDiv.style.color = 'red';
                }
                console.warn('main.js: Validação falhou - campos obrigatórios ausentes.');
                return; // Interrompe a execução se os campos não estiverem preenchidos
            }

            // Validação das datas: data de devolução não pode ser anterior à data de retirada
            const startDate = new Date(dataRetirada);
            const endDate = new Date(dataDevolucao);

            if (startDate > endDate) {
                if (resultadoReservaDiv) {
                    resultadoReservaDiv.textContent = 'A Data de Devolução não pode ser anterior à Data de Retirada.';
                    resultadoReservaDiv.style.color = 'red';
                }
                console.warn('main.js: Validação falhou - Data de Devolução anterior à Data de Retirada.');
                return; // Interrompe a execução
            }

            // Constrói a mensagem para o WhatsApp
            let message = `Olá! Meu nome é ${nome}. Telefone: ${telefone}. `;
            message += `Tenho interesse em alugar um veículo para o período de ${formatDate(dataRetirada)} a ${formatDate(dataDevolucao)}.`;
            message += `\nPor favor, envie-me as opções disponíveis e os valores.`; // Mensagem simplificada

            console.log('main.js: Mensagem gerada para WhatsApp:', message);

            // Número de WhatsApp da Ney Car Auto Center (DDD 77)
            const whatsappNumber = '557736442289'; 
            
            // Codifica a mensagem para ser usada na URL do WhatsApp
            const encodedMessage = encodeURIComponent(message);
            
            // Constrói a URL completa do WhatsApp
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            console.log('main.js: URL do WhatsApp gerada:', whatsappUrl);

            // Abre o WhatsApp em uma nova aba/janela
            window.open(whatsappUrl, '_blank');
            console.log('main.js: Tentando abrir a URL do WhatsApp.');

            // Feedback para o usuário e limpeza do formulário
            if (resultadoReservaDiv) {
                resultadoReservaDiv.textContent = 'Sua solicitação foi enviada para o WhatsApp. Em breve entraremos em contato!';
                resultadoReservaDiv.style.color = 'green';
            }
            reservaForm.reset(); // Limpa o formulário após o envio
            console.log('main.js: Formulário resetado.');

            // Re-chama calcularTotalPeriodo para limpar os valores totais nos cards
            // ou garantir que eles reflitam o estado inicial (sem datas selecionadas)
            calcularTotalPeriodo(); 
        });
    }

    // Adiciona listeners para atualizar o cálculo quando as datas mudarem
    // (Isso vai mostrar o "Total: R$ X.XX" nos cards ao selecionar as datas)
    if (dataRetiradaInput) {
        dataRetiradaInput.addEventListener('change', calcularTotalPeriodo);
    }
    if (dataDevolucaoInput) {
        dataDevolucaoInput.addEventListener('change', calcularTotalPeriodo);
    }


    // Garante que os veículos sejam carregados quando a página terminar de carregar
    carregarVeiculos();
});