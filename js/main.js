document.addEventListener('DOMContentLoaded', function() {
// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navList = document.querySelector('nav ul');if (menuToggle && navList) {
    menuToggle.addEventListener('click', function() {
        navList.classList.toggle('active');
    });

    navList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navList.classList.contains('active')) {
                navList.classList.remove('active');
            }
        });
    });
}

// Ajuste opcional da altura da logo (agora principalmente controlado pelo CSS)
const logoImg = document.querySelector('.logo img');
// Não precisamos mais necessariamente ajustar via JS, o CSS já aumentou.
// Se precisar de um ajuste fino baseado na altura do texto, descomente abaixo:
/*
const navLink = document.querySelector('nav a');
if (logoImg && navLink) {
    const navLinkFontSize = parseFloat(window.getComputedStyle(navLink).fontSize);
    logoImg.style.maxHeight = `${navLinkFontSize * 2.5}px`; // Ajuste o multiplicador conforme necessário
}
*/

// Fetch and display vehicles (mantido)
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

// Handle booking form submission (mantido)
const bookingForm = document.querySelector('.reserva form');
if (bookingForm) {
    bookingForm.addEventListener('submit', function(event) {
        event.preventDefault();
        alert('Funcionalidade de reserva em desenvolvimento! Datas selecionadas: ' +
              document.getElementById('data-retirada').value + ' a ' +
              document.getElementById('data-devolucao').value);
    });
}