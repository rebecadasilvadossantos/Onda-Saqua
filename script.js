/* =====================================================
   ONDA SAQUA - JAVASCRIPT COMPLETO
   Mapa, eventos, roteiros e conta demonstrativa
===================================================== */

/* -----------------------------------------------------
   1. NAVEGAÇÃO ENTRE AS PÁGINAS
----------------------------------------------------- */

const botoesNavegacao = document.querySelectorAll(".nave-link");
const paginas = document.querySelectorAll(".pag");

function mostrarPagina(id) {
    const paginaSelecionada = document.getElementById(id);

    if (!paginaSelecionada || !paginaSelecionada.classList.contains("pag")) {
        return;
    }

    paginas.forEach(pagina => {
        pagina.style.display = "none";
    });

    paginaSelecionada.style.display = "block";

    if (id === "mapa") {
        iniciarMapa();

        setTimeout(() => {
            if (mapa) {
                mapa.invalidateSize();
            }
        }, 200);
    }

    if (id === "conta") {
        atualizarPerfil();
    }

    if (id === "eventos") {
        renderizarEventos();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

botoesNavegacao.forEach(botao => {
    botao.addEventListener("click", evento => {
        evento.preventDefault();

        const destino = botao.getAttribute("href");

        if (destino && destino.startsWith("#")) {
            mostrarPagina(destino.substring(1));
        }
    });
});

const botaoExplorar = document.querySelector(".botao-explorar");

if (botaoExplorar) {
    botaoExplorar.addEventListener("click", evento => {
        evento.preventDefault();
        mostrarPagina("mapa");
    });
}


/* -----------------------------------------------------
   2. DADOS DOS PONTOS TURÍSTICOS
----------------------------------------------------- */

const pontosTuristicos = [
    {
        id: 1,
        tipo: "destino",
        nome: "Igreja Nossa Senhora de Nazareth",
        categoria: "História e cultura",
        descricao: "Um dos principais cartões-postais de Saquarema, localizado no alto do outeiro.",
        latitude: -22.93699,
        longitude: -42.49246
    },
    {
        id: 2,
        tipo: "destino",
        nome: "Praia da Vila",
        categoria: "Praia",
        descricao: "Uma das praias mais conhecidas de Saquarema.",
        latitude: -22.934997,
        longitude: -42.495575
    },
    {
        id: 3,
        tipo: "destino",
        nome: "Casa de Cultura Walmir Ayala",
        categoria: "Cultura",
        descricao: "Espaço cultural instalado em um importante prédio histórico da cidade.",
        latitude: -22.932141,
        longitude: -42.497052
    },
    {
        id: 4,
        tipo: "destino",
        nome: "Mirante do Morro da Cruz",
        categoria: "Mirante",
        descricao: "Local para apreciar a paisagem de Saquarema.",
        latitude: -22.922869,
        longitude: -42.482327
    },
    {
        id: 5,
        tipo: "destino",
        nome: "Museu do Sambaqui da Beirada",
        categoria: "História e arqueologia",
        descricao: "Espaço dedicado à preservação da história arqueológica da região.",
        latitude: -22.925766,
        longitude: -42.544025
    },
    {
        id: 6,
        tipo: "destino",
        nome: "Praia de Boqueirão",
        categoria: "Praia",
        descricao: "Praia localizada no bairro Boqueirão.",
        latitude: -22.932498,
        longitude: -42.524181
    }
];


/* -----------------------------------------------------
   3. EVENTOS DEMONSTRATIVOS
   Estes dados são exemplos para apresentação acadêmica.
----------------------------------------------------- */

const eventosDisponiveis = [
    {
        id: "evento-1",
        tipo: "evento",
        nome: "Feira Cultural de Saquarema",
        categoria: "Cultura e lazer",
        descricao: "Evento demonstrativo com artesanato, cultura e atividades locais.",
        data: "Data demonstrativa",
        local: "Casa de Cultura Walmir Ayala",
        latitude: -22.932141,
        longitude: -42.497052
    },
    {
        id: "evento-2",
        tipo: "evento",
        nome: "Encontro Esportivo na Praia",
        categoria: "Esporte",
        descricao: "Evento demonstrativo com atividades esportivas e recreativas.",
        data: "Data demonstrativa",
        local: "Praia da Vila",
        latitude: -22.934997,
        longitude: -42.495575
    },
    {
        id: "evento-3",
        tipo: "evento",
        nome: "Passeio Histórico",
        categoria: "Turismo e história",
        descricao: "Evento demonstrativo para conhecer pontos históricos da cidade.",
        data: "Data demonstrativa",
        local: "Igreja Nossa Senhora de Nazareth",
        latitude: -22.93699,
        longitude: -42.49246
    }
];


/* -----------------------------------------------------
   4. VARIÁVEIS DO MAPA E DO ROTEIRO
----------------------------------------------------- */

let mapa = null;
let marcadores = [];
let linhaRoteiro = null;
let destinosSelecionados = [];


/* -----------------------------------------------------
   5. FUNÇÕES AUXILIARES DE ARMAZENAMENTO
----------------------------------------------------- */

function lerArmazenamento(chave, valorPadrao = []) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : valorPadrao;
    } catch (erro) {
        console.error("Erro ao ler os dados salvos:", erro);
        return valorPadrao;
    }
}

function salvarArmazenamento(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;
    } catch (erro) {
        console.error("Erro ao salvar os dados:", erro);
        alert("Não foi possível salvar. Verifique o armazenamento do navegador.");
        return false;
    }
}

function obterUsuarioAtual() {
    const email = localStorage.getItem("ondaSaquaUsuarioLogado");

    if (!email) {
        return null;
    }

    const usuarios = lerArmazenamento("ondaSaquaUsuarios", []);
    return usuarios.find(usuario => usuario.email === email) || null;
}

function chaveRoteirosUsuario() {
    const usuario = obterUsuarioAtual();
    return usuario ? `ondaSaquaRoteiros_${usuario.email}` : null;
}

function chaveHistoricoUsuario() {
    const usuario = obterUsuarioAtual();
    return usuario ? `ondaSaquaHistorico_${usuario.email}` : null;
}


/* -----------------------------------------------------
   6. INICIAR O MAPA LEAFLET
----------------------------------------------------- */

function iniciarMapa() {
    if (mapa !== null) {
        return;
    }

    const elementoMapa = document.getElementById("mapaSaquarema");

    if (!elementoMapa) {
        return;
    }

    if (typeof L === "undefined") {
        console.error("Leaflet não carregou. Verifique sua conexão com a internet.");
        elementoMapa.innerHTML = `
            <p class="erro-mapa">
                Não foi possível carregar o mapa. Verifique sua conexão com a internet.
            </p>
        `;
        return;
    }

    mapa = L.map("mapaSaquarema").setView([-22.936, -42.496], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(mapa);

    // Marcadores dos pontos turísticos
    pontosTuristicos.forEach(ponto => {
        const marcador = L.marker([
            ponto.latitude,
            ponto.longitude
        ]).addTo(mapa);

        marcador.bindPopup(`
            <div class="popup-mapa">
                <strong>${ponto.nome}</strong>
                <br>
                <small>${ponto.categoria}</small>
                <p>${ponto.descricao}</p>
                <button type="button" onclick="adicionarDestino(${ponto.id})">
                    + Adicionar ao roteiro
                </button>
                <button type="button" class="botao-visitado"
                    onclick="registrarVisita(${ponto.id})">
                    ✓ Marcar como visitado
                </button>
            </div>
        `);

        marcadores.push(marcador);
    });

    // Marcadores dos eventos demonstrativos
    eventosDisponiveis.forEach(evento => {
        const marcadorEvento = L.marker([
            evento.latitude,
            evento.longitude
        ]).addTo(mapa);

        marcadorEvento.bindPopup(`
            <div class="popup-mapa">
                <strong>🎉 ${evento.nome}</strong>
                <br>
                <small>${evento.categoria}</small>
                <p>${evento.descricao}</p>
                <p><strong>Data:</strong> ${evento.data}</p>
                <button type="button"
                    onclick="adicionarEvento('${evento.id}')">
                    + Adicionar ao roteiro
                </button>
                <button type="button" class="botao-visitado"
                    onclick="registrarVisita('${evento.id}')">
                    ✓ Marcar como visitado
                </button>
            </div>
        `);

        marcadores.push(marcadorEvento);
    });

    atualizarListaRoteiro();
}


/* -----------------------------------------------------
   7. RENDERIZAR OS EVENTOS NA PÁGINA
----------------------------------------------------- */

function renderizarEventos() {
    const lista = document.getElementById("listaEventos");

    if (!lista) {
        return;
    }

    lista.innerHTML = eventosDisponiveis.map(evento => `
        <article class="card-evento">
            <span class="etiqueta-evento">EVENTO DEMONSTRATIVO</span>

            <h3>🎉 ${evento.nome}</h3>

            <p>
                <strong>Categoria:</strong>
                ${evento.categoria}
            </p>

            <p>
                <strong>Data:</strong>
                ${evento.data}
            </p>

            <p>
                <strong>Local:</strong>
                ${evento.local}
            </p>

            <p>${evento.descricao}</p>

            <button type="button"
                onclick="adicionarEvento('${evento.id}')">
                + Adicionar ao roteiro
            </button>
        </article>
    `).join("");
}


/* -----------------------------------------------------
   8. ADICIONAR DESTINOS E EVENTOS AO ROTEIRO
----------------------------------------------------- */

window.adicionarDestino = function(id) {
    const ponto = pontosTuristicos.find(item => item.id === Number(id));

    if (!ponto) {
        return;
    }

    adicionarItemRoteiro(ponto);
};

window.adicionarEvento = function(id) {
    const evento = eventosDisponiveis.find(item => item.id === String(id));

    if (!evento) {
        return;
    }

    adicionarItemRoteiro(evento);

    if (mapa) {
        mapa.closePopup();
    }
};

function adicionarItemRoteiro(item) {
    const jaExiste = destinosSelecionados.some(
        selecionado => String(selecionado.id) === String(item.id)
    );

    if (jaExiste) {
        alert("Esse item já está no seu roteiro!");
        return;
    }

    destinosSelecionados.push(item);
    atualizarListaRoteiro();

    if (mapa) {
        mapa.closePopup();
    }
}


/* -----------------------------------------------------
   9. REMOVER ITEM DO ROTEIRO
----------------------------------------------------- */

window.removerDestino = function(id) {
    destinosSelecionados = destinosSelecionados.filter(
        item => String(item.id) !== String(id)
    );

    atualizarListaRoteiro();
};


/* -----------------------------------------------------
   10. ATUALIZAR A LISTA DO ROTEIRO
----------------------------------------------------- */

function atualizarListaRoteiro() {
    const lista = document.getElementById("listaRoteiro");

    if (!lista) {
        return;
    }

    if (destinosSelecionados.length === 0) {
        lista.innerHTML = `
            <p>Nenhum destino adicionado ainda.</p>
        `;
    } else {
        lista.innerHTML = destinosSelecionados.map((item, index) => {
            const ehEvento = item.tipo === "evento";

            return `
                <div class="destino-roteiro">
                    <strong>
                        ${index + 1}.
                        ${ehEvento ? "🎉" : "📍"}
                        ${item.nome}
                    </strong>

                    <small>
                        ${ehEvento ? "Evento" : "Ponto turístico"}
                        | ${item.categoria}
                    </small>

                    ${ehEvento ? `
                        <p>📅 ${item.data}</p>
                        <p>📍 ${item.local}</p>
                    ` : ""}

                    <button type="button"
                        onclick="removerDestino('${item.id}')">
                        Remover
                    </button>
                </div>
            `;
        }).join("");
    }

    atualizarLinhaRoteiro();
}


/* -----------------------------------------------------
   11. DESENHAR O TRAJETO NO MAPA
----------------------------------------------------- */

function atualizarLinhaRoteiro() {
    if (!mapa || typeof L === "undefined") {
        return;
    }

    if (linhaRoteiro) {
        mapa.removeLayer(linhaRoteiro);
        linhaRoteiro = null;
    }

    if (destinosSelecionados.length < 2) {
        return;
    }

    const coordenadas = destinosSelecionados.map(item => [
        item.latitude,
        item.longitude
    ]);

    linhaRoteiro = L.polyline(coordenadas, {
        color: "#F28B73",
        weight: 5,
        opacity: 0.9,
        dashArray: "8, 8"
    }).addTo(mapa);

    mapa.fitBounds(linhaRoteiro.getBounds(), {
        padding: [30, 30]
    });
}


/* -----------------------------------------------------
   12. SALVAR ROTEIRO NA CONTA DO USUÁRIO
----------------------------------------------------- */

const botaoSalvarRoteiro = document.getElementById("btnSalvarRoteiro");

if (botaoSalvarRoteiro) {
    botaoSalvarRoteiro.addEventListener("click", () => {
        const usuario = obterUsuarioAtual();

        if (!usuario) {
            alert("Entre na sua conta para salvar seus roteiros.");
            mostrarPagina("conta");
            return;
        }

        if (destinosSelecionados.length === 0) {
            alert("Adicione pelo menos um destino ou evento ao roteiro!");
            return;
        }

        const chave = chaveRoteirosUsuario();
        const roteiros = lerArmazenamento(chave, []);

        const novoRoteiro = {
            id: Date.now(),
            nome: `Roteiro de ${usuario.nome}`,
            data: new Date().toLocaleDateString("pt-BR"),
            destinos: destinosSelecionados.map(item => ({
                id: item.id,
                tipo: item.tipo || "destino",
                nome: item.nome,
                categoria: item.categoria,
                data: item.data || "",
                local: item.local || "",
                latitude: item.latitude,
                longitude: item.longitude
            }))
        };

        roteiros.push(novoRoteiro);

        if (salvarArmazenamento(chave, roteiros)) {
            alert("Roteiro salvo na sua conta!");
            atualizarPerfil();
        }
    });
}


/* -----------------------------------------------------
   13. REGISTRAR LUGARES VISITADOS
----------------------------------------------------- */

window.registrarVisita = function(id) {
    const usuario = obterUsuarioAtual();

    if (!usuario) {
        alert("Entre na sua conta para registrar lugares visitados.");
        mostrarPagina("conta");
        return;
    }

    const item = [...pontosTuristicos, ...eventosDisponiveis].find(
        elemento => String(elemento.id) === String(id)
    );

    if (!item) {
        return;
    }

    const chave = chaveHistoricoUsuario();
    const historico = lerArmazenamento(chave, []);

    const jaVisitado = historico.some(
        visita => String(visita.id) === String(item.id)
    );

    if (jaVisitado) {
        alert("Esse local já está no seu histórico!");
        return;
    }

    historico.push({
        id: item.id,
        nome: item.nome,
        categoria: item.categoria,
        dataVisita: new Date().toLocaleDateString("pt-BR")
    });

    if (salvarArmazenamento(chave, historico)) {
        alert("Visita registrada com sucesso!");
        atualizarPerfil();

        if (mapa) {
            mapa.closePopup();
        }
    }
}


/* -----------------------------------------------------
   14. CADASTRO DEMONSTRATIVO
----------------------------------------------------- */

const botaoCadastro = document.getElementById("btnCadastro");

if (botaoCadastro) {
    botaoCadastro.addEventListener("click", () => {
        const nome = document.getElementById("nomeCadastro").value.trim();
        const email = document.getElementById("emailCadastro").value.trim().toLowerCase();
        const senha = document.getElementById("senhaCadastro").value;
        const mensagem = document.getElementById("mensagemConta");

        if (!nome || !email || !senha) {
            mensagem.textContent = "Preencha todos os campos do cadastro.";
            return;
        }

        if (senha.length < 4) {
            mensagem.textContent = "A senha deve ter pelo menos 4 caracteres.";
            return;
        }

        const usuarios = lerArmazenamento("ondaSaquaUsuarios", []);

        const emailExiste = usuarios.some(usuario => usuario.email === email);

        if (emailExiste) {
            mensagem.textContent = "Esse e-mail já possui cadastro. Faça login.";
            return;
        }

        usuarios.push({
            nome: nome,
            email: email,
            senha: senha
        });

        if (salvarArmazenamento("ondaSaquaUsuarios", usuarios)) {
            localStorage.setItem("ondaSaquaUsuarioLogado", email);

            document.getElementById("nomeCadastro").value = "";
            document.getElementById("emailCadastro").value = "";
            document.getElementById("senhaCadastro").value = "";

            mensagem.textContent = "Cadastro realizado! Você entrou na sua conta.";
            atualizarPerfil();
        }
    });
}


/* -----------------------------------------------------
   15. LOGIN DEMONSTRATIVO
----------------------------------------------------- */

const botaoLogin = document.getElementById("btnLogin");

if (botaoLogin) {
    botaoLogin.addEventListener("click", () => {
        const email = document.getElementById("emailLogin").value.trim().toLowerCase();
        const senha = document.getElementById("senhaLogin").value;
        const mensagem = document.getElementById("mensagemConta");

        if (!email || !senha) {
            mensagem.textContent = "Informe seu e-mail e sua senha.";
            return;
        }

        const usuarios = lerArmazenamento("ondaSaquaUsuarios", []);

        const usuario = usuarios.find(
            item => item.email === email && item.senha === senha
        );

        if (!usuario) {
            mensagem.textContent = "E-mail ou senha incorretos.";
            return;
        }

        localStorage.setItem("ondaSaquaUsuarioLogado", usuario.email);

        document.getElementById("emailLogin").value = "";
        document.getElementById("senhaLogin").value = "";

        mensagem.textContent = `Bem-vindo(a), ${usuario.nome}!`;
        atualizarPerfil();
    });
}


/* -----------------------------------------------------
   16. ATUALIZAR PERFIL, ROTEIROS E HISTÓRICO
----------------------------------------------------- */

function atualizarPerfil() {
    const formularioCadastro = document.getElementById("formCadastro");
    const formularioLogin = document.getElementById("formLogin");
    const perfil = document.getElementById("perfilUsuario");
    const mensagem = document.getElementById("mensagemConta");

    if (!formularioCadastro || !formularioLogin || !perfil) {
        return;
    }

    const usuario = obterUsuarioAtual();

    if (!usuario) {
        formularioCadastro.style.display = "flex";
        formularioLogin.style.display = "flex";
        perfil.style.display = "none";
        return;
    }

    formularioCadastro.style.display = "none";
    formularioLogin.style.display = "none";
    perfil.style.display = "block";

    document.getElementById("nomeUsuario").textContent =
        `Olá, ${usuario.nome}! Seja bem-vindo(a) ao Onda Saqua.`;

    if (mensagem) {
        mensagem.textContent = "";
    }

    renderizarRoteirosSalvos();
    renderizarHistorico();
}

function renderizarRoteirosSalvos() {
    const area = document.getElementById("roteirosSalvos");

    if (!area) {
        return;
    }

    const chave = chaveRoteirosUsuario();
    const roteiros = chave ? lerArmazenamento(chave, []) : [];

    if (roteiros.length === 0) {
        area.innerHTML = "<p>Você ainda não salvou nenhum roteiro.</p>";
        return;
    }

    area.innerHTML = roteiros.map(roteiro => `
        <div class="item-perfil">
            <strong>${roteiro.nome}</strong>
            <p>Salvo em: ${roteiro.data}</p>
            <p>${roteiro.destinos.length} item(ns) no roteiro</p>

            <button type="button"
                onclick="carregarRoteiroSalvo(${roteiro.id})">
                Ver no mapa
            </button>
        </div>
    `).join("");
}

function renderizarHistorico() {
    const area = document.getElementById("historicoVisitas");

    if (!area) {
        return;
    }

    const chave = chaveHistoricoUsuario();
    const historico = chave ? lerArmazenamento(chave, []) : [];

    if (historico.length === 0) {
        area.innerHTML = "<p>Você ainda não registrou lugares visitados.</p>";
        return;
    }

    area.innerHTML = historico.map(visita => `
        <div class="item-perfil">
            <strong>📍 ${visita.nome}</strong>
            <p>${visita.categoria}</p>
            <small>Visitado em: ${visita.dataVisita}</small>
        </div>
    `).join("");
}


/* -----------------------------------------------------
   17. CARREGAR ROTEIRO SALVO NO MAPA
----------------------------------------------------- */

window.carregarRoteiroSalvo = function(id) {
    const chave = chaveRoteirosUsuario();

    if (!chave) {
        return;
    }

    const roteiros = lerArmazenamento(chave, []);
    const roteiro = roteiros.find(item => item.id === Number(id));

    if (!roteiro) {
        alert("Não foi possível encontrar esse roteiro.");
        return;
    }

    destinosSelecionados = roteiro.destinos.map(destino => {
        const lista = destino.tipo === "evento"
            ? eventosDisponiveis
            : pontosTuristicos;

        return lista.find(item => String(item.id) === String(destino.id)) || destino;
    });

    atualizarListaRoteiro();
    mostrarPagina("mapa");

    setTimeout(() => {
        if (mapa) {
            mapa.invalidateSize();
            atualizarLinhaRoteiro();
        }
    }, 250);
};


/* -----------------------------------------------------
   18. SAIR DA CONTA
----------------------------------------------------- */

const botaoSair = document.getElementById("btnSair");

if (botaoSair) {
    botaoSair.addEventListener("click", () => {
        localStorage.removeItem("ondaSaquaUsuarioLogado");

        destinosSelecionados = [];
        atualizarListaRoteiro();
        atualizarPerfil();

        const mensagem = document.getElementById("mensagemConta");

        if (mensagem) {
            mensagem.textContent = "Você saiu da sua conta.";
        }
    });
}


/* -----------------------------------------------------
   19. INICIALIZAÇÃO DO SITE
----------------------------------------------------- */

renderizarEventos();
mostrarPagina("inicio");
atualizarPerfil();

/* =========================================
   20. PREVISÃO REAL DO CLIMA E DAS ONDAS
   SAQUAREMA - RJ
========================================= */

const coordenadasSaquarema = {
    latitude: -22.936,
    longitude: -42.496
};

function interpretarClima(codigo) {
    const condicoes = {
        0: "Céu limpo ☀️",
        1: "Predominantemente limpo 🌤️",
        2: "Parcialmente nublado ⛅",
        3: "Nublado ☁️",
        45: "Neblina 🌫️",
        48: "Neblina intensa 🌫️",
        51: "Garoa leve 🌦️",
        53: "Garoa moderada 🌦️",
        55: "Garoa intensa 🌧️",
        61: "Chuva leve 🌧️",
        63: "Chuva moderada 🌧️",
        65: "Chuva forte ⛈️",
        80: "Pancadas de chuva 🌦️",
        81: "Pancadas moderadas 🌧️",
        82: "Pancadas fortes ⛈️",
        95: "Tempestade ⛈️"
    };

    return condicoes[codigo] || "Condição variável";
}

function converterDirecao(graus) {
    if (graus === null || graus === undefined) {
        return "--";
    }

    const direcoes = [
        "N", "NE", "L", "SE",
        "S", "SO", "O", "NO"
    ];

    return direcoes[Math.round(graus / 45) % 8];
}

async function carregarPrevisaoClima() {
    const latitude = coordenadasSaquarema.latitude;
    const longitude = coordenadasSaquarema.longitude;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=America%2FSao_Paulo`;

    try {
        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Erro ao consultar o clima");
        }

        const dados = await resposta.json();
        const clima = dados.current;

        document.getElementById("temperatura").textContent =
            `${clima.temperature_2m}°C`;

        document.getElementById("sensacaoTermica").textContent =
            `${clima.apparent_temperature}°C`;

        document.getElementById("umidade").textContent =
            `${clima.relative_humidity_2m}%`;

        document.getElementById("ventoClima").textContent =
            `${clima.wind_speed_10m} km/h`;

        document.getElementById("condicaoClima").textContent =
            interpretarClima(clima.weather_code);

        return true;

    } catch (erro) {
        console.error("Erro na previsão do clima:", erro);
        document.getElementById("condicaoClima").textContent =
            "Previsão indisponível";

        return false;
    }
}

async function carregarPrevisaoOndas() {
    const latitude = coordenadasSaquarema.latitude;
    const longitude = coordenadasSaquarema.longitude;

    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&current=wave_height,wave_direction,wave_period&timezone=America%2FSao_Paulo`;

    try {
        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Erro ao consultar as ondas");
        }

        const dados = await resposta.json();
        const ondas = dados.current;

        document.getElementById("alturaOndas").textContent =
            ondas.wave_height != null
                ? `${ondas.wave_height} m`
                : "-- m";

        document.getElementById("periodoOndas").textContent =
            ondas.wave_period != null
                ? `${ondas.wave_period} s`
                : "-- s";

        document.getElementById("direcaoOndas").textContent =
            converterDirecao(ondas.wave_direction);

        return true;

    } catch (erro) {
        console.error("Erro na previsão das ondas:", erro);

        document.getElementById("alturaOndas").textContent = "-- m";
        document.getElementById("periodoOndas").textContent = "-- s";
        document.getElementById("direcaoOndas").textContent =
            "Indisponível";

        return false;
    }
}

async function atualizarPrevisao() {
    const aviso = document.getElementById("atualizacaoPrevisao");

    if (!aviso) return;

    aviso.textContent = "Atualizando informações...";

    const [climaOk, ondasOk] = await Promise.all([
        carregarPrevisaoClima(),
        carregarPrevisaoOndas()
    ]);

    const horario = new Date().toLocaleString("pt-BR");

    aviso.textContent =
        `Última consulta: ${horario}. ` +
        (climaOk && ondasOk
            ? "Informações carregadas."
            : "Algumas informações estão indisponíveis.");
}

/* Atualizar quando abrir a aba Previsão */

const navegacaoOriginal = mostrarPagina;

mostrarPagina = function(id) {
    navegacaoOriginal(id);

    if (id === "previsao") {
        atualizarPrevisao();
    }
};

/* Primeira consulta */

atualizarPrevisao();

/* Atualização automática a cada 30 minutos */

setInterval(atualizarPrevisao, 30 * 60 * 1000);