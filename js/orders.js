import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* ==================================================
   AUSWAHLDATEN
================================================== */
const languages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Kotlin",
  "Swift",
  "Dart",
  "R",
  "Scala",
  "Perl",
  "Lua",
  "Haskell",
  "Elixir",
  "Erlang",
  "Objective-C",
  "MATLAB",
  "SQL",
  "Assembly",
  "Solidity",
  "Groovy",
  "Visual Basic",
  "Fortran",
  "COBOL",
  "Julia",
  "Crystal",
  "F#",
  "OCaml",
  "Zig",
  "Nim",
  "VHDL",
  "Verilog",
  "SystemVerilog"
];

const frameworks = [
  "React",
  "Next.js",
  "Vue",
  "Nuxt",
  "Angular",
  "Svelte",
  "SvelteKit",
  "Astro",
  "SolidJS",
  "Remix",
  "Gatsby",
  "Express",
  "NestJS",
  "Fastify",
  "Django",
  "Flask",
  "FastAPI",
  "Spring",
  "Spring Boot",
  "Laravel",
  "Symfony",
  "Ruby on Rails",
  "ASP.NET",
  ".NET",
  "Flutter",
  "React Native",
  "Electron",
  "Tauri",
  "Godot",
  "Unity",
  "Unreal Engine"
];

const databases = [
  "Firebase Firestore",
  "Firebase Realtime Database",
  "PostgreSQL",
  "MySQL",
  "MariaDB",
  "SQLite",
  "MongoDB",
  "Redis",
  "Supabase",
  "Oracle Database",
  "Microsoft SQL Server",
  "Cassandra",
  "DynamoDB",
  "Neo4j",
  "InfluxDB",
  "Elasticsearch"
];

const tools = [
  "Git",
  "GitHub",
  "GitLab",
  "Bitbucket",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Jenkins",
  "GitHub Actions",
  "Vercel",
  "Netlify",
  "Cloudflare",
  "AWS",
  "Microsoft Azure",
  "Google Cloud",
  "Firebase",
  "Figma",
  "Postman",
  "REST API",
  "GraphQL",
  "WebSocket",
  "Linux",
  "Nginx",
  "Apache",
  "Webpack",
  "Vite",
  "Babel",
  "npm",
  "Yarn",
  "pnpm"
];

const platforms = [
  "Web",
  "Desktop",
  "Windows",
  "macOS",
  "Linux",
  "Android",
  "iOS",
  "iPadOS",
  "ChromeOS",
  "Raspberry Pi",
  "Arduino",
  "ESP32",
  "Embedded",
  "Server",
  "Cloud",
  "Docker",
  "Mobile",
  "Game",
  "Cross-Platform",
  "Smart TV",
  "Wear OS",
  "watchOS"
];


/* ==================================================
   ELEMENTE
================================================== */

const activeOrdersPanel =
  document.getElementById("activeOrdersPanel");

const createOrderPanel =
  document.getElementById("createOrderPanel");

const showCreateOrderBtn =
  document.getElementById("showCreateOrderBtn");

const cancelCreateOrderBtn =
  document.getElementById("cancelCreateOrderBtn");

const orderForm =
  document.getElementById("orderForm");

const orderTitle =
  document.getElementById("orderTitle");

const orderDescription =
  document.getElementById("orderDescription");

const githubUrl =
  document.getElementById("githubUrl");

const contactEmail =
  document.getElementById("contactEmail");

const contactPhone =
  document.getElementById("contactPhone");

const confirmContact =
  document.getElementById("confirmContact");

const confirmRules =
  document.getElementById("confirmRules");

const confirmCredits =
  document.getElementById("confirmCredits");

const orderFormMessage =
  document.getElementById("orderFormMessage");

const ordersList =
  document.getElementById("ordersList");

const logoutBtn =
  document.getElementById("logoutBtn");


let currentUser = null;


/* ==================================================
   FORMULAR EIN / AUS
================================================== */

function showCreateOrder() {
  activeOrdersPanel.style.display = "none";
  createOrderPanel.style.display = "block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function showActiveOrders() {
  createOrderPanel.style.display = "none";
  activeOrdersPanel.style.display = "block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


showCreateOrderBtn.addEventListener(
  "click",
  showCreateOrder
);


cancelCreateOrderBtn.addEventListener(
  "click",
  showActiveOrders
);


/* ==================================================
   AUSWAHLEN
================================================== */

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function renderSelectionList(
  containerId,
  items,
  prefix
) {
  const container =
    document.getElementById(containerId);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  items.forEach((item, index) => {
    const id =
      `${prefix}-${index}`;

    const label =
      document.createElement("label");

    label.className =
      "selection-option";

    label.innerHTML = `
      <input
        type="checkbox"
        value="${escapeHtml(item)}"
        data-selection="${prefix}"
        id="${id}"
      >

      <span>
        ${escapeHtml(item)}
      </span>
    `;

    container.appendChild(label);
  });
}


function getSelectedValues(prefix) {
  const selected =
    document.querySelectorAll(
      `input[data-selection="${prefix}"]:checked`
    );

  return Array.from(selected).map(
    checkbox => checkbox.value
  );
}


/* ==================================================
   GITHUB
================================================== */

function normalizeGithubUrl(value) {
  let url = value.trim();

  if (!url) {
    return null;
  }

  if (!url.startsWith("https://github.com/")) {
    url =
      `https://github.com/${url}`;
  }

  try {
    const parsed =
      new URL(url);

    if (
      parsed.hostname !== "github.com" &&
      parsed.hostname !== "www.github.com"
    ) {
      return null;
    }

    const parts =
      parsed.pathname
        .split("/")
        .filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    return `https://github.com/${parts[0]}/${parts[1]}`;

  } catch {
    return null;
  }
}


/* ==================================================
   MELDUNGEN
================================================== */

function showMessage(
  message,
  type = "info"
) {
  orderFormMessage.textContent =
    message;

  orderFormMessage.className =
    `form-message ${type}`;
}


/* ==================================================
   AUFTRAG ERSTELLEN
================================================== */

orderForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    if (!currentUser) {
      showMessage(
        "Du musst eingeloggt sein.",
        "error"
      );

      return;
    }

    const title =
      orderTitle.value.trim();

    const description =
      orderDescription.value.trim();

    const normalizedGithub =
      normalizeGithubUrl(
        githubUrl.value
      );

    if (!title) {
      showMessage(
        "Bitte gib einen Titel ein.",
        "error"
      );

      return;
    }

    if (!description) {
      showMessage(
        "Bitte gib eine Beschreibung ein.",
        "error"
      );

      return;
    }

    if (!normalizedGithub) {
      showMessage(
        "Bitte gib ein gültiges GitHub-Repository ein.",
        "error"
      );

      return;
    }

    const email =
      contactEmail.value.trim();

    if (!email) {
      showMessage(
        "Eine Kontakt-E-Mail ist erforderlich.",
        "error"
      );

      return;
    }

    const selectedLanguages =
      getSelectedValues("language");

    const selectedFrameworks =
      getSelectedValues("framework");

    const selectedDatabases =
      getSelectedValues("database");

    const selectedTools =
      getSelectedValues("tool");

    const selectedPlatforms =
      getSelectedValues("platform");

    if (selectedLanguages.length === 0) {
      showMessage(
        "Bitte wähle mindestens eine Programmiersprache aus.",
        "error"
      );

      return;
    }

    if (selectedPlatforms.length === 0) {
      showMessage(
        "Bitte wähle mindestens eine Plattform aus.",
        "error"
      );

      return;
    }

    if (!confirmContact.checked) {
      showMessage(
        "Bitte bestätige deine Kontaktangaben.",
        "error"
      );

      return;
    }

    if (!confirmRules.checked) {
      showMessage(
        "Bitte bestätige die Auftragsregeln.",
        "error"
      );

      return;
    }

    if (!confirmCredits.checked) {
      showMessage(
        "Bitte bestätige die Credit-Regelung.",
        "error"
      );

      return;
    }

    const button =
      orderForm.querySelector(
        "button[type='submit']"
      );

    button.disabled = true;

    button.textContent =
      "Auftrag wird erstellt...";

    try {

      /*
      ----------------------------------------------
      NÄCHSTE AUFTRAGSNUMMER
      ----------------------------------------------
      */

      const numberQuery =
        query(
          collection(db, "orders"),
          orderBy("orderNumber", "desc")
        );

      const numberSnapshot =
        await getDocs(numberQuery);

      let nextNumber = 1;

      if (!numberSnapshot.empty) {

        const highest =
          numberSnapshot.docs[0]
            .data()
            .orderNumber;

        if (
          typeof highest === "number"
        ) {
          nextNumber =
            highest + 1;
        }
      }


      /*
      ----------------------------------------------
      AUFTRAG SPEICHERN
      ----------------------------------------------
      */

      await addDoc(
        collection(db, "orders"),
        {

          orderNumber:
            nextNumber,

          orderCode:
            `OSGTM-${String(nextNumber).padStart(4, "0")}`,

          title,

          description,

          githubUrl:
            normalizedGithub,

          languages:
            selectedLanguages,

          frameworks:
            selectedFrameworks,

          databases:
            selectedDatabases,

          tools:
            selectedTools,

          platforms:
            selectedPlatforms,

          creatorId:
            currentUser.uid,

          creatorEmail:
            email,

          creatorPhone:
            contactPhone.value.trim() || null,

          status:
            "open",

          participants: [],

          confirmations: {

            contact:
              true,

            rules:
              true,

            credits:
              true

          },

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),

          completedAt:
            null

        }
      );


      showMessage(
        "Auftrag erfolgreich erstellt!",
        "success"
      );


      orderForm.reset();


      if (currentUser.email) {

        contactEmail.value =
          currentUser.email;

      }


      showActiveOrders();

      await loadOrders();


    } catch (error) {

      console.error(
        "Fehler beim Erstellen des Auftrags:",
        error
      );


      showMessage(
        `Auftrag konnte nicht erstellt werden: ${error.message}`,
        "error"
      );

    } finally {

      button.disabled = false;

      button.textContent =
        "Auftrag erstellen";

    }

  }
);


/* ==================================================
   AUFTRÄGE LADEN
================================================== */

async function loadOrders() {

  ordersList.innerHTML = `
    <div class="empty-orders">
      <div class="empty-orders-icon">📦</div>
      <h3>Aufträge werden geladen...</h3>
    </div>
  `;


  try {

    const ordersQuery =
      query(
        collection(db, "orders"),
        where("status", "==", "open")
      );


    const snapshot =
      await getDocs(ordersQuery);


    if (snapshot.empty) {

      ordersList.innerHTML = `
        <div class="empty-orders">

          <div class="empty-orders-icon">
            📭
          </div>

          <h3>
            Noch keine aktiven Aufträge
          </h3>

          <p>
            Erstelle den ersten Auftrag auf der Plattform.
          </p>

          <button
            class="btn primary-btn"
            id="emptyCreateOrderBtn"
          >
            + Auftrag erstellen
          </button>

        </div>
      `;


      document
        .getElementById("emptyCreateOrderBtn")
        .addEventListener(
          "click",
          showCreateOrder
        );


      return;
    }


    ordersList.innerHTML = "";


    snapshot.forEach(
      (documentSnapshot) => {

        const order =
          documentSnapshot.data();


        const card =
          createOrderCard(
            documentSnapshot.id,
            order
          );


        ordersList.appendChild(card);

      }
    );


  } catch (error) {

    console.error(
      "Fehler beim Laden der Aufträge:",
      error
    );


    ordersList.innerHTML = `
      <div class="empty-orders">

        <div class="empty-orders-icon">
          ⚠️
        </div>

        <h3>
          Aufträge konnten nicht geladen werden
        </h3>

        <p>
          ${escapeHtml(error.message)}
        </p>

      </div>
    `;

  }

}


/* ==================================================
   AUFTRAGSKARTE
================================================== */

function createOrderCard(
  documentId,
  order
) {

  const card =
    document.createElement("article");


  card.className =
    "order-card";


  const languages =
    order.languages || [];


  const frameworks =
    order.frameworks || [];


  const platforms =
    order.platforms || [];


  card.innerHTML = `

    <div class="order-card-top">

      <div>

        <span class="order-code">
          ${escapeHtml(
            order.orderCode || "OSGTM"
          )}
        </span>

        <h3>
          ${escapeHtml(
            order.title || "Ohne Titel"
          )}
        </h3>

      </div>

      <span class="order-status">
        Offen
      </span>

    </div>


    <p class="order-description">
      ${escapeHtml(
        order.description || ""
      )}
    </p>


    ${
      languages.length
        ? `
          <div class="tag-group">
            ${languages.map(language => `
              <span class="tag">
                ${escapeHtml(language)}
              </span>
            `).join("")}
          </div>
        `
        : ""
    }


    ${
      frameworks.length
        ? `
          <div class="tag-group">
            ${frameworks.map(framework => `
              <span class="tag">
                ${escapeHtml(framework)}
              </span>
            `).join("")}
          </div>
        `
        : ""
    }


    ${
      platforms.length
        ? `
          <div class="tag-group">
            ${platforms.map(platform => `
              <span class="tag platform">
                ${escapeHtml(platform)}
              </span>
            `).join("")}
          </div>
        `
        : ""
    }


    <div class="order-footer">

      <a
        href="${escapeHtml(
          order.githubUrl || "#"
        )}"
        target="_blank"
        rel="noopener noreferrer"
        class="order-github"
      >
        GitHub Repository →
      </a>


      <button
        class="btn primary-btn"
        data-order-id="${escapeHtml(
          documentId
        )}"
        disabled
        title="Die Detailansicht bauen wir als Nächstes."
      >
        Auftrag ansehen
      </button>

    </div>

  `;


  return card;
}


/* ==================================================
   LOGOUT
================================================== */

logoutBtn.addEventListener(
  "click",
  async () => {

    try {

      await signOut(auth);

      window.location.href =
        "index.html";

    } catch (error) {

      console.error(
        "Logout fehlgeschlagen:",
        error
      );

    }

  }
);


/* ==================================================
   AUTH
================================================== */

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "index.html";

      return;
    }


    currentUser = user;


    if (user.email) {

      contactEmail.value =
        user.email;

    }


    renderSelectionList(
      "languagesContainer",
      languages,
      "language"
    );


    renderSelectionList(
      "frameworksContainer",
      frameworks,
      "framework"
    );


    renderSelectionList(
      "databasesContainer",
      databases,
      "database"
    );


    renderSelectionList(
      "toolsContainer",
      tools,
      "tool"
    );


    renderSelectionList(
      "platformsContainer",
      platforms,
      "platform"
    );


    await loadOrders();

  }
);






