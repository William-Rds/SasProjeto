const STORAGE_KEYS = Object.freeze({
    patients: "rab_patients",
    clinicName: "rab_clinic_name",
    clinicLogo: "rab_clinic_logo",
    selectedPatientId: "rab_selected_patient_id"
});

const PATIENTS_PER_PAGE = 8;

let patients = [];
let currentPage = 1;
let currentSearch = "";
let lastFocusedElement = null;

function getElement(id) {
    return document.getElementById(id);
}

function createId(prefix = "id") {
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
    } catch (error) {
        console.error("Erro ao carregar pacientes:", error);
        patients = [];
    }
}

function savePatients() {
    localStorage.setItem(
        STORAGE_KEYS.patients,
        JSON.stringify(patients)
    );
}

function formatWeight(weight) {
    const number = Number(
        String(weight || "").replace(",", ".")
    );

    if (
        !Number.isFinite(number) ||
        number <= 0
    ) {
        return "—";
    }

    return `${number.toLocaleString("pt-BR", {
        maximumFractionDigits: 2
    })} kg`;
}

function parseWeight(value) {
    const normalized = String(value || "")
        .trim()
        .replace(",", ".")
        .replace(/[^\d.]/g, "");

    if (!/^\d+(\.\d+)?$/.test(normalized)) {
        return null;
    }

    const number = Number(normalized);

    return Number.isFinite(number) && number > 0
        ? number
        : null;
}

function parseAge(value) {
    const normalized = String(value || "").trim();

    if (!normalized) {
        return null;
    }

    if (!/^\d+$/.test(normalized)) {
        return null;
    }

    const age = Number(normalized);

    return Number.isInteger(age) &&
        age >= 0 &&
        age <= 100
        ? age
        : null;
}

function getFilteredPatients() {
    const term = currentSearch
        .trim()
        .toLocaleLowerCase("pt-BR");

    return [...patients]
        .filter(patient => {
            if (!term) {
                return true;
            }

            return [
                patient.name,
                patient.breed,
                patient.owner,
                patient.color,
                patient.observations
            ]
                .join(" ")
                .toLocaleLowerCase("pt-BR")
                .includes(term);
        })
        .sort((first, second) =>
            first.name.localeCompare(
                second.name,
                "pt-BR",
                { sensitivity: "base" }
            )
        );
}

function createCell(value, label) {
    const cell = document.createElement("td");

    cell.textContent = value || "—";
    cell.dataset.label = label;

    return cell;
}

function createActionButton(
    icon,
    className,
    label,
    callback
) {
    const button = document.createElement("button");

    button.type = "button";
    button.className =
        `patient-action-button ${className}`;
    button.textContent = icon;
    button.title = label;
    button.setAttribute("aria-label", label);

    button.addEventListener("click", callback);

    return button;
}

function renderPatients() {
    const tableBody = getElement(
        "patientsTableBody"
    );

    const emptyState = getElement(
        "patientsEmptyState"
    );

    const counter = getElement(
        "patientsCounter"
    );

    if (!tableBody || !emptyState || !counter) {
        return;
    }

    const filtered = getFilteredPatients();
    const totalPages = Math.ceil(
        filtered.length / PATIENTS_PER_PAGE
    );

    if (totalPages > 0) {
        currentPage = Math.min(
            currentPage,
            totalPages
        );
    } else {
        currentPage = 1;
    }

    const start = (
        currentPage - 1
    ) * PATIENTS_PER_PAGE;

    const pagePatients = filtered.slice(
        start,
        start + PATIENTS_PER_PAGE
    );

    tableBody.innerHTML = "";

    pagePatients.forEach(patient => {
        const row = document.createElement("tr");

        row.append(
            createCell(patient.name, "Paciente"),
            createCell(patient.breed, "Raça"),
            createCell(
                formatWeight(patient.weight),
                "Peso"
            ),
            createCell(patient.owner, "Proprietário")
        );

        const actions = document.createElement("td");
        actions.className = "patient-actions";
        actions.dataset.label = "Ações";

        actions.append(
            createActionButton(
                "↗",
                "open",
                "Abrir ficha médica",
                () => openMedicalRecord(patient.id)
            ),
            createActionButton(
                "✎",
                "edit",
                "Editar paciente",
                () => openEditModal(patient.id)
            ),
            createActionButton(
                "×",
                "delete",
                "Excluir paciente",
                () => deletePatient(patient.id)
            )
        );

        row.appendChild(actions);
        tableBody.appendChild(row);
    });

    counter.textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "paciente"
                : "pacientes"
        }`;

    emptyState.style.display =
        filtered.length === 0
            ? "flex"
            : "none";

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const pagination = getElement(
        "patientsPagination"
    );

    if (!pagination) {
        return;
    }

    pagination.innerHTML = "";

    if (totalPages <= 1) {
        pagination.style.display = "none";
        return;
    }

    pagination.style.display = "flex";

    const previous = document.createElement("button");
    previous.type = "button";
    previous.textContent = "Anterior";
    previous.disabled = currentPage === 1;

    previous.addEventListener("click", () => {
        currentPage--;
        renderPatients();
    });

    pagination.appendChild(previous);

    for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = page;

        if (page === currentPage) {
            button.classList.add("active");
            button.setAttribute(
                "aria-current",
                "page"
            );
        }

        button.addEventListener("click", () => {
            currentPage = page;
            renderPatients();
        });

        pagination.appendChild(button);
    }

    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Próxima";
    next.disabled = currentPage === totalPages;

    next.addEventListener("click", () => {
        currentPage++;
        renderPatients();
    });

    pagination.appendChild(next);
}

function loadClinicBrand() {
    const name = localStorage.getItem(
        STORAGE_KEYS.clinicName
    );

    const logo = localStorage.getItem(
        STORAGE_KEYS.clinicLogo
    );

    const brandName = getElement("brandName");
    const brandLogo = getElement("brandLogo");

    if (name && brandName) {
        brandName.textContent = name;
    }

    if (logo && brandLogo) {
        brandLogo.innerHTML = "";

        const image = document.createElement("img");
        image.src = logo;
        image.alt = "Logo da clínica";

        brandLogo.appendChild(image);
    }
}

function openModal() {
    const modal = getElement("patientModal");
    const form = getElement("patientForm");

    if (!modal || !form) {
        return;
    }

    lastFocusedElement = document.activeElement;

    form.reset();
    getElement("patientId").value = "";

    getElement("patientModalTitle").textContent =
        "Novo Paciente";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    getElement("patientName")?.focus();
}

function openEditModal(patientId) {
    const patient = patients.find(
        item => item.id === patientId
    );

    if (!patient) {
        return;
    }

    lastFocusedElement = document.activeElement;

    getElement("patientId").value = patient.id;
    getElement("patientName").value = patient.name;
    getElement("patientBreed").value = patient.breed;
    getElement("patientWeight").value =
        patient.weight;
    getElement("patientAge").value =
        patient.age ?? "";
    getElement("patientOwner").value =
        patient.owner;
    getElement("patientObservations").value =
        patient.observations;

    getElement("patientModalTitle").textContent =
        "Editar Paciente";

    const modal = getElement("patientModal");

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    getElement("patientName")?.focus();
}

function closeModal() {
    const modal = getElement("patientModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    lastFocusedElement?.focus();
}

function savePatient(event) {
    event.preventDefault();

    const id = getElement("patientId").value.trim();
    const name = capitalizeWords(
        getElement("patientName").value
    );
    const breed = capitalizeWords(
        getElement("patientBreed").value
    );
    const owner = capitalizeWords(
        getElement("patientOwner").value
    );

    const weight = parseWeight(
        getElement("patientWeight").value
    );

    const rawAge = getElement("patientAge").value;
    const age = parseAge(rawAge);

    if (!name || !breed || !owner) {
        alert(
            "Preencha nome, raça e proprietário."
        );
        return;
    }

    if (weight === null) {
        alert("Informe um peso válido maior que zero.");
        getElement("patientWeight").focus();
        return;
    }

    if (rawAge.trim() && age === null) {
        alert(
            "Informe uma idade válida entre 0 e 100 anos."
        );
        getElement("patientAge").focus();
        return;
    }

    const patient = normalizePatient({
        id: id || createId("patient"),
        name,
        breed,
        owner,
        weight,
        age,
        observations:
            getElement("patientObservations")
                .value
                .trim(),
        updatedAt: new Date().toISOString()
    });

    if (id) {
        const index = patients.findIndex(
            item => item.id === id
        );

        if (index === -1) {
            alert("Paciente não encontrado.");
            return;
        }

        patients[index] = patient;
    } else {
        patients.push(patient);
    }

    savePatients();
    closeModal();
    renderPatients();

    alert(
        id
            ? "Paciente atualizado com sucesso."
            : "Paciente cadastrado com sucesso."
    );
}

function deletePatient(patientId) {
    const patient = patients.find(
        item => item.id === patientId
    );

    if (!patient) {
        return;
    }

    const confirmed = confirm(
        `Deseja excluir o paciente "${patient.name}"?`
    );

    if (!confirmed) {
        return;
    }

    patients = patients.filter(
        item => item.id !== patientId
    );

    savePatients();
    renderPatients();

    alert("Paciente excluído com sucesso.");
}

function openMedicalRecord(patientId) {
    localStorage.setItem(
        STORAGE_KEYS.selectedPatientId,
        patientId
    );

    localStorage.removeItem(
        "rab_current_record_id"
    );

    window.location.href =
        "fichamedica.html";
}

function toggleMenu() {
    const sidebar = getElement("sidebar");
    const overlay = getElement("overlay");
    const button = getElement("mobileMenuButton");

    if (!sidebar || !overlay) {
        return;
    }

    const isOpen = sidebar.classList.toggle("open");

    overlay.classList.toggle("show", isOpen);

    button?.setAttribute(
        "aria-expanded",
        String(isOpen)
    );
}

function closeMenu() {
    getElement("sidebar")?.classList.remove("open");
    getElement("overlay")?.classList.remove("show");

    getElement("mobileMenuButton")
        ?.setAttribute("aria-expanded", "false");
}

function configureEvents() {
    getElement("addPatientButton")
        ?.addEventListener("click", openModal);

    getElement("closePatientModal")
        ?.addEventListener("click", closeModal);

    getElement("cancelPatientButton")
        ?.addEventListener("click", closeModal);

    getElement("patientForm")
        ?.addEventListener("submit", savePatient);

    getElement("patientSearch")
        ?.addEventListener("input", event => {
            currentSearch = event.target.value;
            currentPage = 1;
            renderPatients();
        });

    getElement("patientModal")
        ?.addEventListener("click", event => {
            if (
                event.target ===
                getElement("patientModal")
            ) {
                closeModal();
            }
        });

    getElement("mobileMenuButton")
        ?.addEventListener("click", toggleMenu);

    getElement("overlay")
        ?.addEventListener("click", closeMenu);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeModal();
            closeMenu();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadClinicBrand();
    loadPatients();
    renderPatients();
    configureEvents();
});

window.addEventListener("storage", event => {
    if (
        event.key === STORAGE_KEYS.patients ||
        event.key === STORAGE_KEYS.clinicName ||
        event.key === STORAGE_KEYS.clinicLogo
    ) {
        loadClinicBrand();
        loadPatients();
        renderPatients();
    }
});