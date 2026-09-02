/*
========================================
CONFIGURAÇÃO DO ODONTOGRAMA FELINO
========================================
*/

const FELINE_STORAGE_KEYS = Object.freeze({
    records: "rab_feline_records",
    currentRecordId: "rab_current_feline_record_id"
});

// Numeração Triadan modificada para felinos.
// Arcada superior direita/esquerda: incisivos, canino, pré-molares (3-4), molar (1)
// Arcada inferior direita/esquerda: incisivos, canino, pré-molares (3-4), molar (1)
const FELINE_UPPER_TEETH = [
    "109", "108", "107", "106", "104", "103", "102", "101",
    "201", "202", "203", "204", "206", "207", "208", "209"
];

const FELINE_LOWER_TEETH = [
    "409", "408", "407", "404", "403", "402", "401",
    "301", "302", "303", "304", "307", "308", "309"
];

let felineCurrentStatus = "healthy";
let felineToothData = {};
let felineSelectedRecordId = null;

/*
========================================
RENDERIZAÇÃO DO ODONTOGRAMA
========================================
*/

function renderFelineDentalGrid(containerId, teethList) {
    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    container.innerHTML = "";

    teethList.forEach(function (toothNumber) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "dental-tooth";
        button.dataset.tooth = toothNumber;

        const currentStatus = felineToothData[toothNumber] || "healthy";

        button.classList.add("dental-tooth-" + currentStatus);

        button.innerHTML = `
            <span class="dental-tooth-number">${toothNumber}</span>
            <span class="dental-tooth-symbol"></span>
        `;

        button.addEventListener("click", function () {
            markFelineTooth(toothNumber, button);
        });

        container.appendChild(button);
    });
}

function markFelineTooth(toothNumber, button) {
    felineToothData[toothNumber] = felineCurrentStatus;

    button.className = "dental-tooth dental-tooth-" + felineCurrentStatus;

    button.innerHTML = `
        <span class="dental-tooth-number">${toothNumber}</span>
        <span class="dental-tooth-symbol"></span>
    `;

    const info = document.getElementById("felineSelectedToothInfo");

    if (info) {
        info.textContent =
            "Dente " + toothNumber + " marcado como: " + translateFelineStatus(felineCurrentStatus);
    }
}

function translateFelineStatus(status) {
    const labels = {
        healthy: "Saudável",
        carious: "Cariado",
        extracted: "Extraído",
        treated: "Tratado"
    };

    return labels[status] || status;
}

function clearFelineDentalChart() {
    const confirmed = confirm("Deseja limpar todo o odontograma felino?");

    if (!confirmed) {
        return;
    }

    felineToothData = {};

    renderFelineDentalGrid("upperDentalArchFelina", FELINE_UPPER_TEETH);
    renderFelineDentalGrid("lowerDentalArchFelina", FELINE_LOWER_TEETH);

    const info = document.getElementById("felineSelectedToothInfo");

    if (info) {
        info.textContent = "Nenhum dente selecionado";
    }
}

/*
========================================
SELEÇÃO DE STATUS
========================================
*/

function configureFelineStatusButtons() {
    const buttons = document.querySelectorAll("#felineStatusList .dental-status-button");

    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            buttons.forEach(function (item) {
                item.classList.remove("active");
            });

            button.classList.add("active");

            felineCurrentStatus = button.dataset.status;
        });
    });
}

/*
========================================
SALVAR / CARREGAR FICHA FELINA
========================================
*/

function loadFelineRecords() {
    const saved = localStorage.getItem(FELINE_STORAGE_KEYS.records);

    if (!saved) {
        return [];
    }

    try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Erro ao carregar fichas felinas:", error);
        return [];
    }
}

function saveFelineRecords(records) {
    localStorage.setItem(
        FELINE_STORAGE_KEYS.records,
        JSON.stringify(records)
    );
}

function saveFelineRecord() {
    const records = loadFelineRecords();

    const record = {
        id: felineSelectedRecordId || ("feline-" + Date.now()),
        especie: "felino",
        nome: document.getElementById("felina-nome").value.trim(),
        idade: document.getElementById("felina-idade").value.trim(),
        sexo: document.getElementById("felina-sexo").value,
        raca: document.getElementById("felina-raca").value.trim(),
        peso: document.getElementById("felina-peso").value.trim(),
        cor: document.getElementById("felina-cor").value.trim(),
        tutor: document.getElementById("felina-tutor").value.trim(),
        anamnese: document.getElementById("felina-anamnese").value.trim(),
        diagnostico: document.getElementById("felina-diagnostico").value.trim(),
        conduta: document.getElementById("felina-conduta").value.trim(),
        odontograma: felineToothData,
        data: document.getElementById("felina-data").value,
        atualizadoEm: new Date().toISOString()
    };

    if (!record.nome) {
        alert("Informe o nome do paciente felino.");
        return;
    }

    const index = records.findIndex(function (item) {
        return item.id === record.id;
    });

    if (index === -1) {
        records.push(record);
    } else {
        records[index] = record;
    }

    saveFelineRecords(records);

    felineSelectedRecordId = record.id;

    localStorage.setItem(
        FELINE_STORAGE_KEYS.currentRecordId,
        record.id
    );

    const status = document.getElementById("felineRecordStatus");

    if (status) {
        status.textContent = "Ficha salva";
    }

    if (typeof registrarAcao === "function") {
        registrarAcao({
            paciente: record.nome,
            procedimento: "Ficha Odontológica Felina",
            tutor: record.tutor || "Tutor",
            dataHora: new Date().toLocaleString("pt-BR"),
            registroId: record.id
        });
    }

    alert("Ficha felina salva com sucesso.");
}

function newFelinePatientRecord() {
    const confirmed = confirm("Deseja iniciar uma nova ficha felina em branco?");

    if (!confirmed) {
        return;
    }

    felineSelectedRecordId = null;
    felineToothData = {};

    document
        .querySelectorAll(
            "#felineMedicalRecord input[type='text'], " +
            "#felineMedicalRecord input[type='date'], " +
            "#felineMedicalRecord select, " +
            "#felineMedicalRecord textarea"
        )
        .forEach(function (field) {
            field.value = "";
        });

    renderFelineDentalGrid("upperDentalArchFelina", FELINE_UPPER_TEETH);
    renderFelineDentalGrid("lowerDentalArchFelina", FELINE_LOWER_TEETH);

    const status = document.getElementById("felineRecordStatus");

    if (status) {
        status.textContent = "Novo registro";
    }

    localStorage.removeItem(FELINE_STORAGE_KEYS.currentRecordId);
}

/*
========================================
BUSCA DE PACIENTE FELINO
========================================
*/

function configureFelinePatientSearch() {
    const input = document.getElementById("felinePatientSearch");
    const resultsBox = document.getElementById("felineSearchResults");

    if (!input || !resultsBox) {
        return;
    }

    input.addEventListener("input", function () {
        const term = input.value.trim().toLocaleLowerCase("pt-BR");

        if (!term) {
            resultsBox.classList.remove("show");
            resultsBox.innerHTML = "";
            return;
        }

        const records = loadFelineRecords().filter(function (record) {
            return record.nome.toLocaleLowerCase("pt-BR").includes(term);
        });

        resultsBox.innerHTML = "";

        if (records.length === 0) {
            resultsBox.innerHTML =
                '<div class="medical-search-empty">Nenhum paciente felino encontrado.</div>';
        } else {
            records.forEach(function (record) {
                const item = document.createElement("button");

                item.type = "button";
                item.className = "medical-search-result";

                item.innerHTML = `
                    ${record.nome}
                    <span>${record.tutor || "Sem tutor"} — ${record.raca || "Raça não informada"}</span>
                `;

                item.addEventListener("click", function () {
                    loadFelineRecordIntoForm(record);
                    resultsBox.classList.remove("show");
                    input.value = record.nome;
                });

                resultsBox.appendChild(item);
            });
        }

        resultsBox.classList.add("show");
    });
}

function loadFelineRecordIntoForm(record) {
    felineSelectedRecordId = record.id;
    felineToothData = record.odontograma || {};

    document.getElementById("felina-nome").value = record.nome || "";
    document.getElementById("felina-idade").value = record.idade || "";
    document.getElementById("felina-sexo").value = record.sexo || "";
    document.getElementById("felina-raca").value = record.raca || "";
    document.getElementById("felina-peso").value = record.peso || "";
    document.getElementById("felina-cor").value = record.cor || "";
    document.getElementById("felina-tutor").value = record.tutor || "";
    document.getElementById("felina-anamnese").value = record.anamnese || "";
    document.getElementById("felina-diagnostico").value = record.diagnostico || "";
    document.getElementById("felina-conduta").value = record.conduta || "";
    document.getElementById("felina-data").value = record.data || "";

    renderFelineDentalGrid("upperDentalArchFelina", FELINE_UPPER_TEETH);
    renderFelineDentalGrid("lowerDentalArchFelina", FELINE_LOWER_TEETH);

    const status = document.getElementById("felineRecordStatus");

    if (status) {
        status.textContent = "Editando ficha existente";
    }
}

/*
========================================
INICIALIZAÇÃO
========================================
*/

document.addEventListener("DOMContentLoaded", function () {
    renderFelineDentalGrid("upperDentalArchFelina", FELINE_UPPER_TEETH);
    renderFelineDentalGrid("lowerDentalArchFelina", FELINE_LOWER_TEETH);

    configureFelineStatusButtons();
    configureFelinePatientSearch();

    const savedId = localStorage.getItem(FELINE_STORAGE_KEYS.currentRecordId);

    if (savedId) {
        const records = loadFelineRecords();
        const record = records.find(function (item) {
            return item.id === savedId;
        });

        if (record) {
            loadFelineRecordIntoForm(record);
        }
    }
});