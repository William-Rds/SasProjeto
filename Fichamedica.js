const STORAGE_KEYS = Object.freeze({
    patients: "rab_patients",
    clinicName: "rab_clinic_name",
    clinicLogo: "rab_clinic_logo",
    selectedPatientId: "rab_selected_patient_id",
    medicalRecords: "rab_medical_records",
    currentRecordId: "rab_current_record_id",
    actions: "rab_recent_actions"
});

let patients = [];
let selectedPatient = null;
let selectedPatientId = null;
let currentRecordId = null;
let selectedDentalStatus = null;
let dentalState = {};

const DENTAL_STATUSES = [
    {
        id: "extraction",
        label: "Extração",
        shortLabel: "X",
        color: "#000000"
    },
    {
        id: "nonexistent",
        label: "Inexistente",
        shortLabel: "■",
        color: "#000000"
    }
];

const UPPER_TEETH = [
    "110", "109", "108", "107", "106",
    "105", "104", "103", "102", "101",
    "201", "202", "203", "204", "205",
    "206", "207", "208", "209", "210"
];

const LOWER_TEETH = [
    "411", "410", "409", "408", "407",
    "406", "405", "404", "403", "402",
    "401", "301", "302", "303", "304",
    "305", "306", "307", "308", "309",
    "310", "311"
];

const PROCEDURE_GROUPS = [
    {
        id: "ortodontia",
        title: "Ortodontia",
        fields: [
            ["moldagem", "Moldagem"],
            ["modelo", "Modelo"],
            ["planoInclinadoDireito", "Plano inclinado dir."],
            ["planoInclinadoEsquerdo", "Plano inclinado esq."],
            ["aparelhoExpansor", "Aparelho expansor"],
            ["aparelhoRetrator", "Aparelho retrator"],
            ["botao", "Botão"],
            ["elastico", "Elástico"]
        ],
        texts: [
            ["outros", "Outros"]
        ]
    },
    {
        id: "periodontia",
        title: "Periodontia",
        sections: [
            {
                title: "Raspagem",
                fields: [
                    ["raspagemUltrassom", "Ultrassom"],
                    ["raspagemManual", "Manual"],
                    ["aplainamentoRadicular", "Aplainamento radicular"]
                ]
            },
            {
                title: "Polimento",
                fields: [
                    ["pedraPomes", "Pedra-pomes"],
                    ["fluor", "Flúor"],
                    ["pastaProfilatica", "Pasta profilática"]
                ]
            },
            {
                title: "Cirurgia",
                fields: [
                    ["gengivectomia", "Gengivectomia"],
                    ["raspagemAberta", "Raspagem aberta / retalho"],
                    ["esplintagem", "Esplintagem"],
                    ["implanteOsseo", "Implante ósseo"]
                ]
            }
        ],
        texts: [
            ["outros", "Outros"]
        ]
    },
    {
        id: "exodontia",
        title: "Exodontia",
        sections: [
            {
                title: "Rotina",
                fields: [
                    ["alavanca", "Alavanca"],
                    ["odontoseccao", "Odonto-secção"],
                    ["alveolectomiaRetalho", "Alveolectomia / retalho"],
                    ["alveoloplastia", "Alveoloplastia"]
                ]
            },
            {
                title: "Fratura de raiz",
                fields: [
                    ["expectativa", "Expectativa"],
                    ["remocaoAlavanca", "Remoção / alavanca"],
                    ["pulverizacao", "Pulverização"],
                    ["alveolectomiaFratura", "Alveolectomia"]
                ]
            }
        ],
        texts: [
            ["outros", "Outros"]
        ]
    },
    {
        id: "sintese",
        title: "Síntese",
        fields: [
            ["fioAbsorvivel", "Fio absorvível"],
            ["fioNaoAbsorvivel", "Fio não absorvível"]
        ],
        texts: [
            ["tipo", "Tipo"]
        ]
    },
    {
        id: "dentistica",
        title: "Dentística / Prótese",
        fields: [
            ["amalgama", "Amálgama"],
            ["resinaAutopolim", "Resina autopolim."],
            ["resinaFoto", "Resina foto"],
            ["ionomeroVidro", "Ionômero de vidro"],
            ["primer", "Primer"],
            ["mri", "M.R.I."],
            ["polimento", "Polimento"],
            ["pinoDentinario", "Pino dentinário"],
            ["pinoRadicular", "Pino radicular"],
            ["odontoplastia", "Odontoplastia"],
            ["reducaoCoroa", "Redução de coroa"],
            ["moldagem", "Moldagem"],
            ["modelo", "Modelo"],
            ["rmf", "R.M.F."],
            ["metaloCeramica", "Metalo-cerâmica"],
            ["metaloPlastica", "Metalo-plástica"]
        ],
        texts: [
            ["observacoes", "Observações"]
        ]
    },
    {
        id: "neoplasia",
        title: "Neoplasia",
        sections: [
            {
                title: "Biópsia",
                fields: [
                    ["tecidoMole", "Tecido mole"],
                    ["tecidoOsseo", "Ósseo"],
                    ["incisional", "Incisional"],
                    ["excisional", "Excisional"]
                ],
                texts: [
                    ["observacoesBiopsia", "Observações"],
                    ["resultado", "Resultado"]
                ]
            },
            {
                title: "Cirurgia",
                fields: [
                    ["resseccaoTecidoMole", "Ressecção tecido mole"],
                    ["resseccaoOsseaTotal", "Ressecção óssea total"],
                    ["resseccaoOsseaParcial", "Ressecção óssea parcial"]
                ],
                texts: [
                    ["observacoesCirurgia", "Observações"]
                ]
            }
        ]
    },
    {
        id: "outrasCirurgias",
        title: "Outras Cirurgias",
        fields: [
            ["palato", "Palato"],
            ["faringostomia", "Faringostomia"],
            ["labio", "Lábio"],
            ["traqueostomia", "Traqueostomia"],
            ["mucosa", "Mucosa"],
            ["ostectomia", "Ostectomia"],
            ["sialoadenectomia", "Sialoadenectomia"]
        ],
        texts: [
            ["outras", "Outras"],
            ["observacoes", "Observações"]
        ]
    },
    {
        id: "endodontia",
        title: "Endodontia",
        fields: [
            ["pulpotomia", "Pulpotomia"],
            ["pulpectomia", "Pulpectomia"],
            ["penetracaoDesinfetante", "Penetração desinfetante"],
            ["dakin", "Dakin"],
            ["endoPtc", "Endo-PTC"],
            ["edta", "EDTA"],
            ["clorexidina", "Clorexidina"],
            ["cimento", "Cimento"],
            ["guttaPercha", "Gutta-percha"],
            ["hidroxidoCalcio", "Curativo hidróxido de cálcio"],
            ["protecaoPulpar", "Proteção pulpar"],
            ["apicoectomia", "Apicoectomia"],
            ["apexificacao", "Apexificação"]
        ],
        texts: [
            ["observacoes", "Observações"]
        ],
        endodontic: true
    },
    {
        id: "osteossintese",
        title: "Osteossíntese",
        fields: [
            ["mandibula", "Mandíbula"],
            ["maxila", "Maxila"],
            ["suturaTecidoMole", "Sutura tecido mole"],
            ["resinaAcrilica", "Resina acrílica"],
            ["cerclagemOssea", "Cerclagem óssea"],
            ["interdental", "Interdental"],
            ["fixacaoInterna", "Fixação interna"],
            ["fixacaoExterna", "Fixação externa"],
            ["bloqueioIntermaxilar", "Bloqueio intermaxilar"],
            ["funilEsparadrapado", "Funil esparadrapado"]
        ],
        texts: [
            ["outros", "Outros"]
        ]
    }
];

function getElement(id) {
    return document.getElementById(id);
}

function createId(prefix) {
    if (
        crypto &&
        typeof crypto.randomUUID === "function"
    ) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
}

function capitalizeWords(value) {
    return String(value || "")
        .trim()
        .toLocaleLowerCase("pt-BR")
        .replace(
            /(^|\s)([a-záàâãéêíóôõúç])/giu,
            (match, space, letter) =>
                space +
                letter.toLocaleUpperCase("pt-BR")
        );
}

function getValue(id) {
    return getElement(id)?.value.trim() || "";
}

function setValue(id, value) {
    const element = getElement(id);

    if (element) {
        element.value =
            value === null || value === undefined
                ? ""
                : value;
    }
}

function normalizePatient(patient = {}) {
    return {
        id: patient.id || createId("patient"),
        name: patient.name || "",
        breed: patient.breed || "",
        weight: patient.weight ?? "",
        age: patient.age ?? "",
        owner: patient.owner || "",
        color: patient.color || "",
        sex: patient.sex || "",
        observations: patient.observations || "",
        updatedAt: patient.updatedAt || ""
    };
}

function loadPatients() {
    const saved = localStorage.getItem(
        STORAGE_KEYS.patients
    );

    if (!saved) {
        patients = [];
        return;
    }

    try {
        const parsed = JSON.parse(saved);

        patients = Array.isArray(parsed)
            ? parsed.map(normalizePatient)
            : [];
    } catch {
        patients = [];
    }
}

function savePatients() {
    localStorage.setItem(
        STORAGE_KEYS.patients,
        JSON.stringify(patients)
    );
}

function loadClinicBrand() {
    const name = localStorage.getItem(
        STORAGE_KEYS.clinicName
    );

    const logo = localStorage.getItem(
        STORAGE_KEYS.clinicLogo
    );

    if (name) {
        setText("medicalRecordClinicName", name);
    }

    if (logo) {
        const container = getElement(
            "medicalRecordLogo"
        );

        if (container) {
            container.innerHTML = "";

            const image = document.createElement("img");
            image.src = logo;
            image.alt = "Logo da clínica";

            container.appendChild(image);
        }
    }
}

function setText(id, value) {
    const element = getElement(id);

    if (element) {
        element.textContent = value;
    }
}

function formatWeight(weight) {
    const value = Number(
        String(weight || "").replace(",", ".")
    );

    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {
        return "";
    }

    return `${value.toLocaleString("pt-BR", {
        maximumFractionDigits: 2
    })} kg`;
}

function renderPatientFields() {
    const container = getElement(
        "patientFieldsGrid"
    );

    if (!container) {
        return;
    }

    const fields = [
        ["recordPatientName", "Nome", "text"],
        ["recordPatientAge", "Idade / Nasc.", "text"],
        ["recordPatientWeight", "Peso", "text"],
        ["recordPatientBreed", "Raça", "text"],
        ["recordPatientColor", "Cor", "text"],
        ["recordPatientOwner", "Proprietário", "text"],
        ["recordPatientSex", "Sexo", "select"]
    ];

    fields.forEach(([id, labelText, type]) => {
        const wrapper = document.createElement("div");
        wrapper.className = "medical-field";

        const label = document.createElement("label");
        label.htmlFor = id;
        label.textContent = labelText;

        let input;

        if (type === "select") {
            input = document.createElement("select");

            [
                ["", "Selecionar"],
                ["Macho", "Macho"],
                ["Fêmea", "Fêmea"]
            ].forEach(([value, text]) => {
                const option =
                    document.createElement("option");

                option.value = value;
                option.textContent = text;

                input.appendChild(option);
            });
        } else {
            input = document.createElement("input");
            input.type = "text";
        }

        input.id = id;
        input.name = id;

        wrapper.append(label, input);
        container.appendChild(wrapper);
    });
}

function fillPatientFields(patient) {
    setValue("recordPatientName", patient.name);
    setValue(
        "recordPatientAge",
        patient.age === null ||
            patient.age === undefined ||
            patient.age === ""
            ? ""
            : `${patient.age} anos`
    );
    setValue(
        "recordPatientWeight",
        formatWeight(patient.weight)
    );
    setValue("recordPatientBreed", patient.breed);
    setValue("recordPatientColor", patient.color);
    setValue("recordPatientOwner", patient.owner);
    setValue("recordPatientSex", patient.sex);
}

function selectPatient(patient) {
    selectedPatient = normalizePatient(patient);
    selectedPatientId = selectedPatient.id;

    localStorage.setItem(
        STORAGE_KEYS.selectedPatientId,
        selectedPatientId
    );

    fillPatientFields(selectedPatient);

    const search = getElement(
        "medicalPatientSearch"
    );

    const results = getElement(
        "medicalSearchResults"
    );

    if (search) {
        search.value = selectedPatient.name;
    }

    if (results) {
        results.innerHTML = "";
        results.classList.remove("show");
    }

    setText(
        "medicalRecordStatus",
        "Paciente selecionado"
    );
}

function searchPatients(term) {
    const normalized = String(term || "")
        .trim()
        .toLocaleLowerCase("pt-BR");

    if (!normalized) {
        return [];
    }

    return patients
        .filter(patient =>
            [
                patient.name,
                patient.breed,
                patient.owner,
                patient.color
            ]
                .join(" ")
                .toLocaleLowerCase("pt-BR")
                .includes(normalized)
        )
        .slice(0, 8);
}

function renderSearchResults(term) {
    const container = getElement(
        "medicalSearchResults"
    );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!term.trim()) {
        container.classList.remove("show");
        return;
    }

    const results = searchPatients(term);
    container.classList.add("show");

    if (!results.length) {
        const empty = document.createElement("div");
        empty.className = "medical-search-empty";
        empty.textContent =
            "Nenhum paciente encontrado.";

        container.appendChild(empty);
        return;
    }

    results.forEach(patient => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "medical-search-result";

        const name = document.createElement("strong");
        name.textContent = patient.name;

        const details = document.createElement("span");
        details.textContent = [
            patient.breed,
            patient.owner
        ]
            .filter(Boolean)
            .join(" • ");

        button.append(name, details);

        button.addEventListener("click", () => {
            selectPatient(patient);
        });

        container.appendChild(button);
    });
}

function renderProcedureGroups() {
    const container = getElement("procedureGrid");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    PROCEDURE_GROUPS.forEach((group, index) => {
        const card = document.createElement("article");
        card.className = "procedure-card";

        const title = document.createElement("h3");
        title.textContent =
            `${index + 1}. ${group.title}`;

        card.appendChild(title);

        const sections = group.sections || [
            {
                title: "",
                fields: group.fields || []
            }
        ];

        sections.forEach(section => {
            if (section.title) {
                const heading =
                    document.createElement("h4");

                heading.textContent = section.title;
                card.appendChild(heading);
            }

            const options = document.createElement("div");
            options.className = "procedure-options";

            section.fields.forEach(([id, label]) => {
                const wrapper =
                    document.createElement("label");

                wrapper.className = "procedure-option";

                const input =
                    document.createElement("input");

                input.type = "checkbox";
                input.dataset.group = group.id;
                input.dataset.field = id;

                const text = document.createElement("span");
                text.textContent = label;

                wrapper.append(input, text);
                options.appendChild(wrapper);
            });

            card.appendChild(options);

            section.texts?.forEach(([id, label]) => {
                card.appendChild(
                    createTextProcedureField(
                        group.id,
                        id,
                        label
                    )
                );
            });
        });

        group.texts?.forEach(([id, label]) => {
            card.appendChild(
                createTextProcedureField(
                    group.id,
                    id,
                    label
                )
            );
        });

        if (group.endodontic) {
            card.appendChild(
                createEndodonticFields()
            );
        }

        container.appendChild(card);
    });
}

function createTextProcedureField(
    group,
    field,
    labelText
) {
    const wrapper = document.createElement("label");
    wrapper.className = "procedure-text-field";

    const label = document.createElement("span");
    label.textContent = labelText;

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 500;
    input.dataset.group = group;
    input.dataset.field = field;

    wrapper.append(label, input);

    return wrapper;
}

function createEndodonticFields() {
    const wrapper = document.createElement("div");
    wrapper.className = "endodontic-measurements";

    const title = document.createElement("strong");
    title.textContent = "Medidas dos canais";

    wrapper.appendChild(title);

    ["initial", "final"].forEach(type => {
        const row = document.createElement("div");
        row.className = "endodontic-row";

        const heading = document.createElement("span");
        heading.textContent =
            type === "initial"
                ? "Lima inicial nº / comprimento"
                : "Lima final nº / comprimento";

        row.appendChild(heading);

        ["RM", "RD", "RP"].forEach(canal => {
            const label = document.createElement("label");
            label.className = "canal-field";

            const canalName =
                document.createElement("span");

            canalName.textContent = canal;

            const number = document.createElement("input");
            number.placeholder = "nº";
            number.inputMode = "numeric";
            number.dataset.group = "endodontia";
            number.dataset.field =
                `${type}${canal}Number`;

            const length = document.createElement("input");
            length.placeholder = "mm";
            length.inputMode = "decimal";
            length.dataset.group = "endodontia";
            length.dataset.field =
                `${type}${canal}Length`;

            label.append(
                canalName,
                number,
                length
            );

            row.appendChild(label);
        });

        wrapper.appendChild(row);
    });

    return wrapper;
}

function collectProcedureData() {
    const data = {};

    document
        .querySelectorAll("[data-group][data-field]")
        .forEach(element => {
            const group = element.dataset.group;
            const field = element.dataset.field;

            if (!data[group]) {
                data[group] = {};
            }

            data[group][field] =
                element.type === "checkbox"
                    ? element.checked
                    : element.value.trim();
        });

    return data;
}

function restoreProcedureData(data) {
    if (!data) {
        return;
    }

    document
        .querySelectorAll("[data-group][data-field]")
        .forEach(element => {
            const group = element.dataset.group;
            const field = element.dataset.field;
            const value = data[group]?.[field];

            if (element.type === "checkbox") {
                element.checked = value === true;
            } else {
                element.value = value || "";
            }
        });
}

function renderDentalStatuses() {
    const container = getElement("dentalStatusList");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    DENTAL_STATUSES.forEach((status) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "dental-status-button";
        button.dataset.status = status.id;

        const symbol = document.createElement("span");
        symbol.className =
            `dental-status-symbol dental-status-symbol-${status.id}`;

        symbol.textContent = status.shortLabel;
        symbol.setAttribute("aria-hidden", "true");

        const text = document.createElement("span");
        text.textContent = status.label;

        button.append(symbol, text);

        button.addEventListener("click", () => {
            selectedDentalStatus = status.id;

            document
                .querySelectorAll(".dental-status-button")
                .forEach((item) => {
                    item.classList.remove("active");
                });

            button.classList.add("active");

            setText(
                "dentalSelectedInfo",
                `Situação selecionada: ${status.label}. Clique em um dente.`
            );
        });

        container.appendChild(button);
    });
}

function renderDentalArch(id, teeth) {
    const container = getElement(id);

    if (!container) {
        return;
    }

    const isUpper = id === "upperDentalArch";
    const image = document.createElement("img");
    image.className = "dental-arch-image";
    image.src = isUpper ? "ArcaDentSup.jpeg" : "ArcaDentInf.jpeg";
    image.alt = isUpper
        ? "Ilustração da arcada dentária superior"
        : "Ilustração da arcada dentária inferior";

    const markers = document.createElement("div");
    markers.className = "dental-marker-grid";

    teeth.forEach(toothNumber => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "dental-tooth";
        button.dataset.tooth = toothNumber;
        button.setAttribute(
            "aria-label",
            `Marcar dente ${toothNumber}`
        );

        const number = document.createElement("span");
        number.className = "dental-tooth-number";
        number.textContent = toothNumber;

        const symbol = document.createElement("span");
        symbol.className = "dental-tooth-symbol";
        symbol.textContent = "";
        symbol.setAttribute("aria-hidden", "true");

        button.append(number, symbol);

        button.addEventListener("click", () => {
            applyDentalStatus(toothNumber);
        });

        markers.appendChild(button);
    });

    container.replaceChildren(image, markers);
}

function renderDentalArches() {
    renderDentalArch(
        "upperDentalArch",
        UPPER_TEETH
    );

    renderDentalArch(
        "lowerDentalArch",
        LOWER_TEETH
    );
}

function getDentalStatus(id) {
    return DENTAL_STATUSES.find(
        status => status.id === id
    );
}

function applyDentalStatus(toothNumber) {
    if (!selectedDentalStatus) {
        setText(
            "dentalSelectedInfo",
            "Selecione uma situação antes de clicar em um dente."
        );

        return;
    }

    if (
        dentalState[toothNumber] ===
        selectedDentalStatus
    ) {
        delete dentalState[toothNumber];

        setText(
            "dentalSelectedInfo",
            `Dente ${toothNumber}: marcação removida.`
        );
    } else {
        dentalState[toothNumber] =
            selectedDentalStatus;

        const status = getDentalStatus(
            selectedDentalStatus
        );

        setText(
            "dentalSelectedInfo",
            `Dente ${toothNumber}: ${status.label}.`
        );
    }

    refreshDentalVisuals();
}

function refreshDentalVisuals() {
    document
        .querySelectorAll(".dental-tooth")
        .forEach((tooth) => {
            const number = tooth.dataset.tooth;
            const status = getDentalStatus(
                dentalState[number]
            );

            tooth.className = "dental-tooth";

            const symbol = tooth.querySelector(
                ".dental-tooth-symbol"
            );

            if (!symbol) {
                return;
            }

            symbol.textContent = "";

            if (!status) {
                tooth.title = `Dente ${number}`;
                return;
            }

            tooth.classList.add(
                `dental-tooth-${status.id}`
            );

            symbol.textContent = status.shortLabel;
            tooth.title =
                `${number}: ${status.label}`;
        });
}



function collectClinicalData() {
    return {
        date: getValue("recordDate"),
        diagnosis: getValue("finalDiagnosis"),
        treatment: getValue("performedTreatment"),
        radiology: getValue("radiology"),
        medication: getValue("prescribedMedication"),
        feeding: getValue("feeding"),
        recommendations: getValue(
            "generalRecommendations"
        ),
        observations: getValue(
            "generalObservations"
        ),
        surgeon: getValue("surgeonName"),
        registration: getValue(
            "surgeonRegistration"
        ),
        documentation: {
            xray: getElement(
                "documentationXray"
            )?.checked || false,

            photo: getElement(
                "documentationPhoto"
            )?.checked || false,

            film: getElement(
                "documentationFilm"
            )?.checked || false
        }
    };
}

function collectMedicalRecord() {
    return {
        id: currentRecordId || createId("record"),
        patientId: selectedPatientId,
        patient: collectPatientData(),
        procedures: collectProcedureData(),
        dental: { ...dentalState },
        clinical: collectClinicalData(),
        updatedAt: new Date().toISOString()
    };
}

function loadRecords() {
    const saved = localStorage.getItem(
        STORAGE_KEYS.medicalRecords
    );

    if (!saved) {
        return [];
    }

    try {
        const parsed = JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];
    } catch {
        return [];
    }
}

function saveMedicalRecord() {
    const patient = collectPatientData();

    if (!patient.name) {
        alert(
            "Selecione um paciente ou informe o nome do animal."
        );
        return;
    }

    const record = collectMedicalRecord();
    const records = loadRecords();

    const index = records.findIndex(
        item => item.id === record.id
    );

    if (index >= 0) {
        records[index] = record;
    } else {
        records.push(record);
    }

    localStorage.setItem(
        STORAGE_KEYS.medicalRecords,
        JSON.stringify(records)
    );

    localStorage.setItem(
        STORAGE_KEYS.currentRecordId,
        record.id
    );

    currentRecordId = record.id;

    if (selectedPatientId) {
        const patientIndex = patients.findIndex(
            item => item.id === selectedPatientId
        );

        if (patientIndex >= 0) {
            patients[patientIndex] = {
                ...patients[patientIndex],
                weight: patient.weight,
                age: patient.age,
                breed: patient.breed,
                color: patient.color,
                owner: patient.owner,
                sex: patient.sex,
                updatedAt: new Date().toISOString()
            };

            savePatients();
        }
    }

    const actions = JSON.parse(
        localStorage.getItem(
            STORAGE_KEYS.actions
        ) || "[]"
    );

    actions.unshift({
        patientName: patient.name,
        owner: patient.owner,
        patientId: selectedPatientId,
        recordId: record.id,
        updatedAt: record.updatedAt
    });

    localStorage.setItem(
        STORAGE_KEYS.actions,
        JSON.stringify(actions.slice(0, 20))
    );

    setText(
        "medicalRecordStatus",
        "Ficha salva"
    );

    alert("Ficha médica salva com sucesso.");
}

function loadCurrentRecord() {
    const recordId = localStorage.getItem(
        STORAGE_KEYS.currentRecordId
    );

    if (!recordId) {
        return;
    }

    const record = loadRecords().find(
        item => item.id === recordId
    );

    if (!record) {
        return;
    }

    currentRecordId = record.id;

    if (record.patientId) {
        const patient = patients.find(
            item => item.id === record.patientId
        );

        if (patient) {
            selectPatient(patient);
        }
    }

    if (!selectedPatientId && record.patient) {
        setValue(
            "recordPatientName",
            record.patient.name
        );

        setValue(
            "recordPatientAge",
            record.patient.age === null ||
                record.patient.age === undefined ||
                record.patient.age === ""
                ? ""
                : `${record.patient.age} anos`
        );

        setValue(
            "recordPatientWeight",
            formatWeight(record.patient.weight)
        );

        setValue(
            "recordPatientBreed",
            record.patient.breed
        );

        setValue(
            "recordPatientColor",
            record.patient.color
        );

        setValue(
            "recordPatientOwner",
            record.patient.owner
        );

        setValue(
            "recordPatientSex",
            record.patient.sex
        );
    }

    restoreProcedureData(record.procedures);

    dentalState = record.dental || {};
    refreshDentalVisuals();

    if (record.clinical) {
        setValue("recordDate", record.clinical.date);
        setValue(
            "finalDiagnosis",
            record.clinical.diagnosis
        );
        setValue(
            "performedTreatment",
            record.clinical.treatment
        );
        setValue(
            "radiology",
            record.clinical.radiology
        );
        setValue(
            "prescribedMedication",
            record.clinical.medication
        );
        setValue("feeding", record.clinical.feeding);
        setValue(
            "generalRecommendations",
            record.clinical.recommendations
        );
        setValue(
            "generalObservations",
            record.clinical.observations
        );
        setValue(
            "surgeonName",
            record.clinical.surgeon
        );
        setValue(
            "surgeonRegistration",
            record.clinical.registration
        );

        setCheckbox(
            "documentationXray",
            record.clinical.documentation?.xray
        );

        setCheckbox(
            "documentationPhoto",
            record.clinical.documentation?.photo
        );

        setCheckbox(
            "documentationFilm",
            record.clinical.documentation?.film
        );
    }

    setText(
        "medicalRecordStatus",
        "Ficha carregada"
    );
}

function setCheckbox(id, value) {
    const element = getElement(id);

    if (element) {
        element.checked = value === true;
    }
}

function openQuickPatientModal() {
    const modal = getElement(
        "quickPatientModal"
    );

    const form = getElement("quickPatientForm");

    if (!modal || !form) {
        return;
    }

    form.reset();

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    getElement("quickPatientName")?.focus();
}

function closeQuickPatientModal() {
    const modal = getElement(
        "quickPatientModal"
    );

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");
}

function saveQuickPatient(event) {
    event.preventDefault();

    const name = capitalizeWords(
        getValue("quickPatientName")
    );

    const breed = capitalizeWords(
        getValue("quickPatientBreed")
    );

    const owner = capitalizeWords(
        getValue("quickPatientOwner")
    );

    const color = capitalizeWords(
        getValue("quickPatientColor")
    );

    const rawWeight = getValue(
        "quickPatientWeight"
    );

    const weight = Number(
        rawWeight.replace(",", ".")
    );

    const rawAge = getValue("quickPatientAge");

    const age = rawAge
        ? Number(rawAge)
        : null;

    if (!name || !breed || !owner) {
        alert(
            "Preencha nome, raça e proprietário."
        );
        return;
    }

    if (
        !Number.isFinite(weight) ||
        weight <= 0
    ) {
        alert("Informe um peso válido.");
        return;
    }

    if (
        rawAge &&
        (!Number.isInteger(age) ||
            age < 0 ||
            age > 100)
    ) {
        alert(
            "Informe uma idade válida entre 0 e 100 anos."
        );
        return;
    }

    const patient = {
        id: createId("patient"),
        name,
        breed,
        owner,
        color,
        weight,
        age,
        sex: "",
        observations: "",
        updatedAt: new Date().toISOString()
    };

    patients.push(patient);
    savePatients();
    selectPatient(patient);
    closeQuickPatientModal();

    alert(
        "Paciente cadastrado e selecionado na ficha."
    );
}

function clearDentalMarkings() {
    const confirmed = confirm(
        "Deseja remover todas as marcações do odontograma?"
    );

    if (!confirmed) {
        return;
    }

    dentalState = {};
    refreshDentalVisuals();

    setText(
        "dentalSelectedInfo",
        "As marcações foram removidas."
    );
}

function configureEvents() {
    getElement("medicalPatientSearch")
        ?.addEventListener("input", event => {
            renderSearchResults(event.target.value);
        });

    getElement("openQuickPatientButton")
        ?.addEventListener(
            "click",
            openQuickPatientModal
        );

    getElement("closeQuickPatientButton")
        ?.addEventListener(
            "click",
            closeQuickPatientModal
        );

    getElement("cancelQuickPatientButton")
        ?.addEventListener(
            "click",
            closeQuickPatientModal
        );

    getElement("quickPatientForm")
        ?.addEventListener("submit", saveQuickPatient);

    getElement("saveMedicalRecordButton")
        ?.addEventListener("click", saveMedicalRecord);

    getElement("printMedicalRecordButton")
        ?.addEventListener("click", () => {
            window.print();
        });

    getElement("clearDentalButton")
        ?.addEventListener(
            "click",
            clearDentalMarkings
        );

    getElement("quickPatientModal")
        ?.addEventListener("click", event => {
            if (
                event.target ===
                getElement("quickPatientModal")
            ) {
                closeQuickPatientModal();
            }
        });

    document.addEventListener("click", event => {
        const field = document.querySelector(
            ".medical-search-field"
        );

        const results = getElement(
            "medicalSearchResults"
        );

        if (
            field &&
            results &&
            !field.contains(event.target)
        ) {
            results.classList.remove("show");
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeQuickPatientModal();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadClinicBrand();
    loadPatients();

    renderPatientFields();
    renderProcedureGroups();
    renderDentalStatuses();
    renderDentalArches();

    configureEvents();
    loadCurrentRecord();

    const selectedPatientId =
        localStorage.getItem(
            STORAGE_KEYS.selectedPatientId
        );

    if (
        !selectedPatientId &&
        !currentRecordId
    ) {
        const date = getElement("recordDate");

        if (date) {
            date.value = new Date()
                .toISOString()
                .slice(0, 10);
        }
    }

    if (selectedPatientId && !selectedPatient) {
        const patient = patients.find(
            item => item.id === selectedPatientId
        );

        if (patient) {
            selectPatient(patient);
        }
    }
});
function parseWeightValue(value) {
    const normalized = String(value || "")
        .trim()
        .toLowerCase()
        .replace(",", ".")
        .replace("kg", "")
        .trim();

    const match = normalized.match(
        /^\d+(?:\.\d+)?/
    );

    if (!match) {
        return null;
    }

    const number = Number(match[0]);

    return Number.isFinite(number) && number > 0
        ? number
        : null;
}

function parseAgeValue(value) {
    const normalized = String(value || "")
        .trim()
        .toLowerCase()
        .replace("anos", "")
        .replace("ano", "")
        .trim();

    if (!normalized) {
        return null;
    }

    const number = Number(normalized);

    return Number.isInteger(number) &&
        number >= 0 &&
        number <= 100
        ? number
        : null;
}

function collectPatientData() {
    return {
        name: capitalizeWords(
            getValue("recordPatientName")
        ),

        age: parseAgeValue(
            getValue("recordPatientAge")
        ),

        weight: parseWeightValue(
            getValue("recordPatientWeight")
        ),

        breed: capitalizeWords(
            getValue("recordPatientBreed")
        ),

        color: capitalizeWords(
            getValue("recordPatientColor")
        ),

        owner: capitalizeWords(
            getValue("recordPatientOwner")
        ),

        sex: getValue("recordPatientSex")
    };
}

window.addEventListener("storage", event => {
    if (
        event.key === STORAGE_KEYS.patients ||
        event.key === STORAGE_KEYS.clinicName ||
        event.key === STORAGE_KEYS.clinicLogo
    ) {
        loadPatients();
        loadClinicBrand();
    }
});