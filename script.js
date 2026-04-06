const profissionais = ["Ana"];
const horarios = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

let agenda = JSON.parse(localStorage.getItem("agenda")) || [];
let semanaAtual = new Date();

// --- PROTEÇÃO DE LOGIN ---
if (!localStorage.getItem("logado") && !window.location.href.includes("login.html")) {
    window.location.href = "login.html";
}

// --- MENU LATERAL ---
function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar.classList.contains("hidden-sidebar")) {
        sidebar.classList.remove("hidden-sidebar");
        overlay.style.display = "block";
    } else {
        sidebar.classList.add("hidden-sidebar");
        overlay.style.display = "none";
    }
}

function logout() {
    localStorage.removeItem("logado");
    window.location.href = "login.html";
}

// --- LÓGICA DA AGENDA ---
function formatarData(d) { return d.toISOString().split("T")[0]; }

function renderAgenda() {
    const gridHoras = document.getElementById("horarios");
    const gridColunas = document.getElementById("colunas");
    const labelData = document.getElementById("semanaAtual");
    if (!gridHoras || !gridColunas) return;

    labelData.innerText = semanaAtual.toLocaleDateString("pt-BR", {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    gridHoras.innerHTML = "";
    gridColunas.innerHTML = "";

    // --- O SEGREDO DO ALINHAMENTO ---
    // Criamos um espaço vazio no topo da coluna de horas 
    // com a mesma altura que o nome do profissional (h3)
    const espacador = document.createElement("div");
    espacador.style.height = "50px"; // Ajuste esta altura se necessário
    gridHoras.appendChild(espacador);

    horarios.forEach(h => {
        const div = document.createElement("div");
        div.className = "hora";
        // A altura aqui deve ser exatamente a mesma do .slot no CSS + margens
        div.style.height = "93px";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.innerText = h;
        gridHoras.appendChild(div);
    });

    profissionais.forEach(prof => {
        const col = document.createElement("div");
        col.className = "profissional";
        col.innerHTML = `<h3 style="text-align:center; color:#6b2c91; height:50px; margin:0; display:flex; align-items:center; justify-content:center;">${prof}</h3>`;

        horarios.forEach(hora => {
            const dataStr = formatarData(semanaAtual);
            const ag = agenda.find(a => a.data === dataStr && a.hora === hora && a.profissional === prof);
            const slot = document.createElement("div");
            slot.className = "slot " + (ag ? "ocupado" : "");
            slot.innerHTML = ag ? `<strong>${ag.nome}</strong>` : "Disponível";
            slot.onclick = () => abrirModal(hora, prof);
            col.appendChild(slot);
        });
        gridColunas.appendChild(col);
    });
}

function abrirModal(hora, prof) {
    window.tempAgendamento = { hora, prof };
    document.getElementById("tituloModal").innerText = `${prof} - ${hora}`;
    document.getElementById("modal").classList.remove("hidden");
}

function fechar() { document.getElementById("modal").classList.add("hidden"); }

// Atualize a função salvar
function salvar() {
    const nome = document.getElementById("nome").value;
    const valor = document.getElementById("servico").value;
    const forma = document.getElementById("formaPagamento").value;

    if (!nome) return alert("Digite o nome da cliente!");

    // Adicionamos 'forma' e 'valor' ao objeto salvo
    agenda.push({
        nome,
        ...window.tempAgendamento,
        data: formatarData(semanaAtual),
        valor: parseFloat(valor),
        forma: forma
    });

    localStorage.setItem("agenda", JSON.stringify(agenda));

    // Limpar campo nome para o próximo uso
    document.getElementById("nome").value = "";
    fechar();
    renderAgenda();
}

// Dentro da sua função renderAgenda(), localize onde o slot é criado e mude esta linha:
// slot.innerHTML = ag ? `<strong>${ag.nome}</strong><span style="font-size:11px;">R$ ${ag.valor} (${ag.forma})</span>` : "Disponível";

window.onload = () => {
    renderAgenda();
    const inputData = document.getElementById('inputData');
    if (inputData) {
        inputData.addEventListener('change', (e) => {
            semanaAtual = new Date(e.target.value + "T00:00:00");
            renderAgenda();
        });
    }
};

function renderClientes() {
    const container = document.getElementById("listaClientes");
    if (!container) return; // Só executa se estiver na página clientes.html

    container.innerHTML = "";

    // Pegar nomes únicos de clientes da agenda
    const nomesClientes = [...new Set(agenda.map(a => a.nome))];

    if (nomesClientes.length === 0) {
        container.innerHTML = "<p>Nenhum cliente cadastrado ainda.</p>";
        return;
    }

    nomesClientes.forEach(nome => {
        const totalGasto = agenda
            .filter(a => a.nome === nome)
            .reduce((sum, item) => sum + Number(item.valor), 0);

        const card = document.createElement("div");
        card.className = "glass-card"; // Reutilizando seu estilo de vidro
        card.style.color = "#333";
        card.style.margin = "10px";
        card.style.textAlign = "left";
        card.style.padding = "20px";
        card.style.background = "white";

        card.innerHTML = `
            <h3 style="color: #6b2c91;">👤 ${nome}</h3>
            <p><strong>Total Investido:</strong> R$ ${totalGasto.toFixed(2)}</p>
            <p style="font-size: 12px; color: #666;">Cliente frequente</p>
        `;
        container.appendChild(card);
    });
}

// Função para rodar apenas na página de faturamento
function renderFaturamento() {
    const inputDataFat = document.getElementById("data");
    if (!inputDataFat) return; // Só executa se estiver na faturamento.html

    // Ao mudar a data no calendário da página de faturamento
    inputDataFat.addEventListener("change", (e) => {
        const dataBusca = e.target.value;
        const filtrados = agenda.filter(a => a.data === dataBusca);

        let tGeral = 0, tPix = 0, tDinheiro = 0, tCartao = 0;

        filtrados.forEach(item => {
            const v = Number(item.valor);
            tGeral += v;
            if (item.forma === "Pix") tPix += v;
            if (item.forma === "Dinheiro") tDinheiro += v;
            if (item.forma === "Cartão") tCartao += v;
        });

        // Atualiza os textos na tela
        document.getElementById("total").innerHTML = `<strong>Total do Dia:</strong> R$ ${tGeral.toFixed(2)}`;
        document.getElementById("pix").innerText = `Pix: R$ ${tPix.toFixed(2)}`;
        document.getElementById("dinheiro").innerText = `Dinheiro: R$ ${tDinheiro.toFixed(2)}`;
        document.getElementById("cartao").innerText = `Cartão: R$ ${tCartao.toFixed(2)}`;
    });
}

// --- ATUALIZAÇÃO DO WINDOW.ONLOAD ---
window.onload = () => {
    renderAgenda();      // Tenta carregar agenda (index)
    renderClientes();    // Tenta carregar clientes (clientes)
    renderFaturamento(); // Tenta carregar faturamento (faturamento)

    // Lógica do input de data da Agenda (index)
    const inputData = document.getElementById('inputData');
    if (inputData) {
        inputData.addEventListener('change', (e) => {
            semanaAtual = new Date(e.target.value + "T00:00:00");
            renderAgenda();
        });
    }
};