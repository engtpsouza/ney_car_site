document.addEventListener('DOMContentLoaded', function() {
    // Inicializa a biblioteca AOS para animações ao scroll
    AOS.init({
        duration: 800, // Duração da animação em milissegundos
        once: true,    // A animação só deve ocorrer uma vez
        easing: 'ease-in-out' // Efeito de aceleração
    });

    // Seleciona os elementos do formulário
    const reservaForm = document.getElementById('reserva-form');
    const nomeInput = document.getElementById('nome');
    const tipoCarroSelect = document.getElementById('tipo-carro');
    const dataRetiradaInput = document.getElementById('data-retirada');
    const dataDevolucaoInput = document.getElementById('data-devolucao');
    const resultadoReservaDiv = document.getElementById('resultado-reserva');

    // Função auxiliar para formatar a data para o formato DD/MM/YYYY
    function formatDate(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // Adiciona um "listener" para o evento de envio do formulário
    reservaForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário (que recarregaria a página)

        // Coleta os valores dos campos
        const nome = nomeInput.value.trim();
        const tipoCarro = tipoCarroSelect.value;
        const dataRetirada = dataRetiradaInput.value;
        const dataDevolucao = dataDevolucaoInput.value;

        // Validação básica dos campos obrigatórios
        if (!nome || !dataRetirada || !dataDevolucao) {
            resultadoReservaDiv.textContent = 'Por favor, preencha todos os campos obrigatórios (Nome, Data de Retirada, Data de Devolução).';
            resultadoReservaDiv.style.color = 'red';
            return; // Interrompe a execução se os campos não estiverem preenchidos
        }

        // Validação das datas: data de devolução não pode ser antes da data de retirada
        const startDate = new Date(dataRetirada);
        const endDate = new Date(dataDevolucao);

        if (startDate > endDate) {
            resultadoReservaDiv.textContent = 'A Data de Devolução não pode ser anterior à Data de Retirada.';
            resultadoReservaDiv.style.color = 'red';
            return; // Interrompe a execução
        }

        // Constrói a mensagem para o WhatsApp
        let message = `Olá! Meu nome é ${nome}. `;
        message += `Tenho interesse em alugar um veículo para o período de ${formatDate(dataRetirada)} a ${formatDate(dataDevolucao)}.`;

        if (tipoCarro && tipoCarro !== '') { // Verifica se um tipo de carro específico foi selecionado
            message += `\nTipo de veículo desejado: ${tipoCarro}.`;
        } else {
            message += `\nNão tenho preferência de tipo de veículo.`;
        }
        message += `\nPor favor, envie-me as opções disponíveis e os valores.`;

        // Número de WhatsApp da Ney Car Auto Center (DDD 77)
        // O número deve estar no formato internacional (código do país + DDD + número, sem espaços ou caracteres especiais)
        const whatsappNumber = '557736442289'; 
        
        // Codifica a mensagem para ser usada na URL do WhatsApp
        const encodedMessage = encodeURIComponent(message);
        
        // Constrói a URL completa do WhatsApp
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        // Abre o WhatsApp em uma nova aba/janela
        window.open(whatsappUrl, '_blank');

        // Feedback para o usuário e limpeza do formulário (opcional)
        resultadoReservaDiv.textContent = 'Sua solicitação foi enviada para o WhatsApp. Em breve entraremos em contato!';
        resultadoReservaDiv.style.color = 'green';
        reservaForm.reset(); // Limpa o formulário após o envio
    });

    // --- Início: Lógica para popular a lista de veículos (se houver) ---
    // Atualmente, o <select id="tipo-carro"> só tem "Qualquer tipo".
    // Se você tiver uma lista de veículos em algum lugar (ex: um array em JS ou vindo de uma API),
    // você pode usar esta seção para popular o select dinamicamente.
    // Exemplo (descomente e adapte se necessário):
    /*
    const veiculosDisponiveis = [
        "Carro Compacto - Fiat Mobi",
        "Sedan Médio - Chevrolet Onix Plus",
        "SUV - Hyundai Creta",
        "Utilitário - Fiat Fiorino",
        // Adicione mais veículos conforme necessário
    ];

    if (tipoCarroSelect) {
        veiculosDisponiveis.forEach(veiculo => {
            const option = document.createElement('option');
            option.value = veiculo;
            option.textContent = veiculo;
            tipoCarroSelect.appendChild(option);
        });
    }
    */
    // --- Fim: Lógica para popular a lista de veículos ---
});