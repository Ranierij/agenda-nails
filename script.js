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

function salvar() {
    const nome = document.getElementById("nome").value;
    if (!nome) return alert("Digite o nome!");
    agenda.push({ nome, ...window.tempAgendamento, data: formatarData(semanaAtual), valor: document.getElementById("servico").value });
    localStorage.setItem("agenda", JSON.stringify(agenda));
    fechar();
    renderAgenda();
}

function mudarData(dias) {
    semanaAtual.setDate(semanaAtual.getDate() + dias);
    renderAgenda();
}

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