const STORAGE_KEYS = Object.freeze({
    clinicName: "rab_clinic_name",
    clinicLogo: "rab_clinic_logo",
    patients: "rab_patients",
    selectedPatientId: "rab_selected_patient_id",
    medicalRecords: "rab_medical_records",
    actions: "rab_recent_actions"
});

const MOBILE_BREAKPOINT = 768;

let previousLogoTrigger = null;

function getElement(id) {
    return document.getElementById(id);
}

function getStorage(key, fallback = null) {
    const value = localStorage.getItem(key);

    if (value === null) {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function toggleMenu() {
    const sidebar = getElement("sidebar");
    const overlay = getElement("overlay");
    const menuButton = getElement("mobileMenuButton");

    if (!sidebar || !overlay) {
        return;
    }

    const isOpen = sidebar.classList.toggle("open");

    overlay.classList.toggle("show", isOpen);

    if (menuButton) {
        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    }
}

function closeMenu() {
    const sidebar = getElement("sidebar");
    const overlay = getElement("overlay");
    const menuButton = getElement("mobileMenuButton");

    sidebar?.classList.remove("open");
    overlay?.classList.remove("show");

    menuButton?.setAttribute(
        "aria-expanded",
        "false"
    );
}

function applyLogo(container, source) {
    if (!container || !source) {
        return;
    }

    container.innerHTML = "";

    const image = document.createElement("img");

    image.src = source;
    image.alt = "Logo da clínica";

    container.appendChild(image);
}

function restoreDefaultLogo() {
    const logo = getElement("brandLogo");

    if (!logo) {
        return;
    }
}

function loadClinicSettings() {
    const savedName = localStorage.getItem(
        STORAGE_KEYS.clinicName
    );

    const savedLogo = localStorage.getItem(
        STORAGE_KEYS.clinicLogo
    );

    const brandName = getElement("brandName");

    if (savedName && brandName) {
        brandName.textContent = savedName;
    }

    if (savedLogo) {
        applyLogo(
            getElement("brandLogo"),
            savedLogo
        );

        const preview = getElement("logoPreview");

        if (preview) {
            preview.src = savedLogo;
            preview.style.display = "block";
        }
    }

    const input = getElement("clinicNameInput");

    if (input) {
        input.value = savedName || "Sistema";
    }
}

function openLogoModal() {
    const modal = getElement("logoModal");

    if (!modal) {
        return;
    }

    previousLogoTrigger = document.activeElement;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    getElement("clinicNameInput")?.focus();
}

function closeLogoModal() {
    const modal = getElement("logoModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    previousLogoTrigger?.focus();
}

function configureLogoInput() {
    const input = getElement("logoInput");
    const preview = getElement("logoPreview");

    if (!input || !preview) {
        return;
    }

    input.addEventListener("change", event => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/svg+xml"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Use uma imagem PNG, JPG ou SVG.");
            input.value = "";
            return;
        }

        if (file.size > 1024 * 1024) {
            alert("A imagem deve ter no máximo 1 MB.");
            input.value = "";
            return;
        }

        const reader = new FileReader();

        reader.addEventListener("load", readerEvent => {
            preview.src = readerEvent.target.result;
            preview.style.display = "block";
        });

        reader.readAsDataURL(file);
    });
}

function saveLogoSettings(event) {
    event.preventDefault();

    const nameInput = getElement("clinicNameInput");
    const brandName = getElement("brandName");
    const preview = getElement("logoPreview");

    const name = nameInput?.value.trim();

    if (!name) {
        alert("Informe o nome da clínica.");
        nameInput?.focus();
        return;
    }

    localStorage.setItem(
        STORAGE_KEYS.clinicName,
        name
    );

    if (brandName) {
        brandName.textContent = name;
    }

    if (
        preview &&
        preview.src &&
        preview.style.display !== "none"
    ) {
        localStorage.setItem(
            STORAGE_KEYS.clinicLogo,
            preview.src
        );

        applyLogo(
            getElement("brandLogo"),
            preview.src
        );
    }

    closeLogoModal();

    alert("Configurações da clínica salvas.");
}

function removeLogo() {
    const confirmed = confirm(
        "Deseja remover a imagem da logo?"
    );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(
        STORAGE_KEYS.clinicLogo
    );

    restoreDefaultLogo();

    const preview = getElement("logoPreview");
    const input = getElement("logoInput");

    if (preview) {
        preview.removeAttribute("src");
        preview.style.display = "none";
    }

    if (input) {
        input.value = "";
    }

    alert("Imagem removida.");
}

function initials(name) {
    return String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("");
}

function formatActionDate(value) {
    if (!value) {
        return "Data não informada";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

function loadActions() {
    const actions = getStorage(
        STORAGE_KEYS.actions,
        []
    );

    return Array.isArray(actions)
        ? actions
        : [];
}

function saveAction(action) {
    const actions = loadActions();

    actions.unshift(action);

    setStorage(
        STORAGE_KEYS.actions,
        actions.slice(0, 20)
    );
}

function renderActions() {
    const panel = getElement("actionsPanel");
    const counter = getElement("actionsCounter");

    if (!panel) {
        return;
    }

    const actions = loadActions();

    panel.innerHTML = "";

    if (counter) {
        counter.textContent =
            `${actions.length} ${
                actions.length === 1
                    ? "registro"
                    : "registros"
            }`;
    }

    if (!actions.length) {
        panel.innerHTML = `
            <p class="empty-actions">
                Nenhuma ação realizada ainda.
            </p>
        `;

        return;
    }

    actions.forEach(action => {
        const item = document.createElement("div");
        item.className = "action-item";

        const avatar = document.createElement("div");
        avatar.className = "patient-avatar";
        avatar.textContent = initials(
            action.patientName
        );

        const description = document.createElement("div");
        description.className = "action-description";

        const title = document.createElement("strong");
        title.textContent =
            `${action.patientName} — Ficha médica`;

        const owner = document.createElement("span");
        owner.textContent =
            action.owner || "Proprietário não informado";

        description.append(title, owner);

        const date = document.createElement("span");
        date.className = "action-date";
        date.textContent = formatActionDate(
            action.updatedAt
        );

        const button = document.createElement("button");
        button.className = "access-button";
        button.type = "button";
        button.textContent = "ACESSAR";

        button.addEventListener("click", () => {
            localStorage.setItem(
                STORAGE_KEYS.selectedPatientId,
                action.patientId || ""
            );

            localStorage.setItem(
                "rab_current_record_id",
                action.recordId || ""
            );

            window.location.href =
                "fichamedica.html";
        });

        item.append(
            avatar,
            description,
            date,
            button
        );

        panel.appendChild(item);
    });
}

function configureDashboard() {
    getElement("mobileMenuButton")
        ?.addEventListener("click", toggleMenu);

    getElement("overlay")
        ?.addEventListener("click", closeMenu);

    getElement("logoSettingsButton")
        ?.addEventListener("click", openLogoModal);

    getElement("closeLogoModal")
        ?.addEventListener("click", closeLogoModal);

    getElement("logoForm")
        ?.addEventListener("submit", saveLogoSettings);

    getElement("removeLogoButton")
        ?.addEventListener("click", removeLogo);

    getElement("logoModal")
        ?.addEventListener("click", event => {
            if (
                event.target ===
                getElement("logoModal")
            ) {
                closeLogoModal();
            }
        });

    getElement("logoutButton")
        ?.addEventListener("click", () => {
            alert(
                "A autenticação será conectada em uma etapa posterior."
            );
        });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeLogoModal();
            closeMenu();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadClinicSettings();
    configureLogoInput();
    configureDashboard();
    renderActions();
});

window.addEventListener("storage", event => {
    if (
        event.key === STORAGE_KEYS.clinicName ||
        event.key === STORAGE_KEYS.clinicLogo ||
        event.key === STORAGE_KEYS.actions
    ) {
        loadClinicSettings();
        renderActions();
    }
});