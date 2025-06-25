document.addEventListener('DOMContentLoaded', function() {
    console.log('main.js: DOMContentLoaded disparado. Script carregado.');

    // Inicializa a biblioteca AOS para animações ao scroll
    AOS.init({
        duration: 800,
        once: true,
        easing: 'ease-in-out'
    });

    // Seleciona os elementos do formulário
    const reservaForm = document.getElementById('reserva-form');
    const nomeInput = document.getElementById('nome');
    // const tipoCarroSelect = document.getElementById('tipo-carro'); // REMOVIDO
    const dataRetiradaInput = document.getElementById('data-retirada');
    const dataDevolucaoInput = document.getElementById('data-devolucao');
    const resultadoReservaDiv = document.getElementById('resultado-reserva');

    // Verificação para garantir que todos os elementos foram encontrados
    if (!reservaForm) console.error('main.js: Elemento #reserva-form não encontrado!');
    if (!nomeInput) console.error('main.js: Elemento #nome não encontrado!');
    // if (!tipoCarroSelect) console.error('main.js: Elemento #tipo-carro não encontrado!'); // REMOVIDO
    if (!dataRetiradaInput) console.error('main.js: Elemento #data-retirada não encontrado!');
    if (!dataDevolucaoInput) console.error('main.js: Elemento #data-devolucao não encontrado!');
    if (!resultadoReservaDiv) console.error('main.js: Elemento #resultado-reserva não encontrado!');

    // Função auxiliar para formatar a data para o formato DD/MM/YYYY
    function formatDate(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // Adiciona um "listener" para o evento de envio do formulário
    if (reservaForm) { // Garante que o formulário foi encontrado antes de adicionar o listener
        reservaForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário (que recarregaria a página)
            console.log('main.js: Evento de submit do formulário capturado. preventDefault() chamado.');

            // Coleta os valores dos campos
            const nome = nomeInput ? nomeInput.value.trim() : '';
            // const tipoCarro = tipoCarroSelect ? tipoCarroSelect.value : ''; // REMOVIDO
            const dataRetirada = dataRetiradaInput ? dataRetiradaInput.value : '';
            const dataDevolucao = dataDevolucaoInput ? dataDevolucaoInput.value : '';

            console.log('main.js: Valores dos campos - Nome:', nome, 'Retirada:', dataRetirada, 'Devolução:', dataDevolucao);

            // Validação básica dos campos obrigatórios
            if (!nome || !dataRetirada || !dataDevolucao) {
                if (resultadoReservaDiv) {
                    resultadoReservaDiv.textContent = 'Por favor, preencha todos os campos obrigatórios (Nome, Data de Retirada, Data de Devolução).';
                    resultadoReservaDiv.style.color = 'red';
                }
                console.warn('main.js: Validação falhou - campos obrigatórios ausentes.');
                return; // Interrompe a execução se os campos não estiverem preenchidos
            }

            // Validação das datas: data de devolução não pode ser antes da data de retirada
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
            let message = `Olá! Meu nome é ${nome}. `;
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

            // Não há lógica de filtragem de veículos implementada, então
            // o site já estará mostrando "todos os veículos disponíveis" por padrão.
            // Se no futuro você adicionar filtros, precisará adicionar aqui
            // a lógica para "resetar" esses filtros e mostrar todos os veículos novamente.
        });
    }

    // --- Lógica para popular a lista de veículos (se houver) ---
    // Esta seção foi removida pois o campo "Tipo de Carro" foi removido do HTML.
    // Se você tiver uma lógica para exibir os veículos na seção "Veículos Disponíveis",
    // ela deve estar em outro lugar ou ser adicionada aqui, mas não relacionada ao select.
});