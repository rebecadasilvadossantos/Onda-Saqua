const botoes = document.querySelectorAll(".nave-link");
const paginas = document.querySelectorAll(".pag");

function mostrarPagina(id) {
    const paginaSelecionada = document.getElementById(id);

    if (!paginaSelecionada || !paginaSelecionada.classList.contains("pag")) {
        return;
    }

    paginas.forEach((pagina) => {
        pagina.style.display = "none";
    });

    paginaSelecionada.style.display = "block";
}

botoes.forEach((botao) => {
    botao.addEventListener("click", (evento) => {
        evento.preventDefault();

        const destino = botao.getAttribute("href");

        if (destino && destino.startsWith("#")) {
            mostrarPagina(destino.slice(1));
        }
    });
});

mostrarPagina("inicio");