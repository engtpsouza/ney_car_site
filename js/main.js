document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('nav ul'); // Select the unordered list inside nav

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
        });

        // Close menu when a navigation link is clicked (for single-page navigation)
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navList.classList.contains('active')) {
                    navList.classList.remove('active');
                }
            });
        });
    }

    // Fetch and display vehicles from veiculos.json
    fetch('veiculos.json')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            const cont = document.getElementById('lista-veiculos');
            if (!cont) {
                console.error("Element with ID 'lista-veiculos' not found.");
                return;
            }

            if (!data || data.length === 0) {
                cont.innerHTML = '<p>Nenhum veículo disponível no momento.</p>';
                return;
            }

            cont.innerHTML = data.map(v => `
                <div class="card">
                    <img src="${v.imagem}" alt="${v.modelo}" loading="lazy" />
                    <h3>${v.modelo}</h3>
                    <p>${v.descricao}</p>
                    <p><strong>R$ ${v.preco_dia.replace('.', ',')}/dia</strong></p>
                </div>
            `).join('');
        })
        .catch(err => {
            const cont = document.getElementById('lista-veiculos');
            if (cont) {
                cont.innerHTML = '<p>Erro ao carregar veículos. Verifique o arquivo veiculos.json e as imagens.</p>';
            }
            console.error('Erro ao carregar veículos:', err);
        });

    // Handle booking form submission (optional: add actual booking logic)
    const bookingForm = document.querySelector('.reserva form'); // Select the form inside .reserva
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Here you would add logic to process the booking dates,
            // e.g., send data to a server or display available cars based on dates.
            alert('Funcionalidade de reserva em desenvolvimento! Datas selecionadas: ' +
                  document.getElementById('data-retirada').value + ' a ' +
                  document.getElementById('data-devolucao').value);
        });
    }
});