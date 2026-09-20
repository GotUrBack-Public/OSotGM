import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/*
==================================================
 AUSWAHLDATEN
==================================================
*/

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


/*
==================================================
 ELEMENTE
==================================================
*/

const orderForm = document.getElementById("orderForm");

const orderTitle = document.getElementById("orderTitle");
const orderDescription = document.getElementById("orderDescription");
const githubUrl = document.getElementById("githubUrl");

const contactEmail = document.getElementById("contactEmail");
const contactPhone = document.getElementById("contactPhone");

const confirmContact = document.getElementById("confirmContact");
const confirmRules = document.getElementById("confirmRules");
const confirmCredits = document.getElementById("confirmCredits");

const orderFormMessage = document.getElementById("orderFormMessage");
const ordersList = document.getElementById("ordersList");

const logoutBtn = document.getElementById("logoutBtn");


/*
==================================================
 AKTUELLER BENUTZER
==================================================
*/

let currentUser = null;


/*
==================================================
 AUSWAHLEN RENDERN
==================================================
*/

function renderSelectionList(containerId, items, prefix) {

  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  items.forEach((item, index) => {

    const id = `${prefix}-${index}`;

    const label = document.createElement("label");

    label.className = "selection-option";

    label.innerHTML = `
      <input
        type="checkbox"
        value="${escapeHtml(item)}"
        data-selection="${prefix}"
        id="${id}"
      >

      <span>${escapeHtml(item)}</span>
    `;

    container.appendChild(label);
  });
}


/*
==================================================
 HTML SICHER AUSGEBEN
==================================================
*/

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/*
==================================================
 AUSGEWÄHLTE WERTE AUSLESEN
==================================================
*/

function getSelectedValues(prefix) {

  const selected = document.querySelectorAll(
    `input[data-selection="${prefix}"]:checked`
  );

  return Array.from(selected).map(
    checkbox => checkbox.value
  );
}


/*
==================================================
 GITHUB URL VALIDIEREN
==================================================
*/

function normalizeGithubUrl(value) {

  let url = value.trim();

  if (!url) {
    return null;
  }

  if (!url.startsWith("https://github.com/")) {
    url = `https://github.com/${url}`;
  }

  try {

    const parsed = new URL(url);

    if (parsed.hostname !== "github.com") {
      return null;
    }

    const parts = parsed.pathname
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


/*
==================================================
 NACHRICHT
==================================================
*/

function showMessage(message, type = "info") {

  orderFormMessage.textContent = message;

  orderFormMessage.className =
    `form-message ${type}`;
}


/*
==================================================
 AUFTRAG ERSTELLEN
==================================================
*/

orderForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  if (!currentUser) {
    showMessage(
      "Du musst eingeloggt sein.",
      "error"
    );

    return;
  }


  const title = orderTitle.value.trim();

  const description =
    orderDescription.value.trim();


  const normalizedGithub =
    normalizeGithubUrl(githubUrl.value);


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
      "Bitte gib ein gültiges GitHub-Repository an.",
      "error"
    );

    return;
  }


  if (!contactEmail.value.trim()) {

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


  const button =
    orderForm.querySelector("button[type='submit']");


  button.disabled = true;

  button.textContent = "Auftrag wird erstellt...";


  try {

    /*
    ----------------------------------------------
    NÄCHSTE AUFTRAGSNUMMER
    ----------------------------------------------
    */

    const numberQuery = query(
      collection(db, "orders"),
      orderBy("orderNumber", "desc")
    );

    const numberSnapshot =
      await getDocs(numberQuery);


    let nextNumber = 1;


    if (!numberSnapshot.empty) {

      const highest =
        numberSnapshot.docs[0].data().orderNumber;

      if (typeof highest === "number") {
        nextNumber = highest + 1;
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

        orderNumber: nextNumber,

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
          contactEmail.value.trim(),

        creatorPhone:
          contactPhone.value.trim() || null,

        status:
          "open",

        participants: [],

        confirmations: {

          contact:
            confirmContact.checked,

          rules:
            confirmRules.checked,

          credits:
            confirmCredits.checked

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


    await loadOrders();


  } catch (error) {

    console.error(
      "Fehler beim Erstellen:",
      error
    );


    showMessage(
      "Der Auftrag konnte nicht erstellt werden.",
      "error"
    );

  } finally {

    button.disabled = false;

    button.textContent =
      "Auftrag erstellen";
  }

});


/*
==================================================
 AUFTRÄGE LADEN
==================================================
*/

async function loadOrders() {

  ordersList.innerHTML = `
    <div class="empty-state">
      Aufträge werden geladen...
    </div>
  `;


  try {

    const ordersQuery = query(
      collection(db, "orders"),
      where("status", "==", "open")
    );


    const snapshot =
      await getDocs(ordersQuery);


    if (snapshot.empty) {

      ordersList.innerHTML = `
        <div class="empty-state">
          Aktuell gibt es keine offenen Aufträge.
        </div>
      `;

      return;
    }


    ordersList.innerHTML = "";


    snapshot.forEach((documentSnapshot) => {

      const order =
        documentSnapshot.data();


      const card =
        createOrderCard(
          documentSnapshot.id,
          order
        );


      ordersList.appendChild(card);

    });


  } catch (error) {

    console.error(
      "Fehler beim Laden der Aufträge:",
      error
    );


    ordersList.innerHTML = `
      <div class="empty-state error">
        Die Aufträge konnten nicht geladen werden.
      </div>
    `;
  }
}


/*
==================================================
 AUFTRAGSKARTE
==================================================
*/

function createOrderCard(documentId, order) {

  const card =
    document.createElement("article");


  card.className =
    "order-card";


  const languages =
    order.languages || [];


  const platforms =
    order.platforms || [];


  card.innerHTML = `

    <div class="order-card-header">

      <div>

        <span class="order-code">
          ${escapeHtml(order.orderCode || "OSGTM")}
        </span>

        <h3>
          ${escapeHtml(order.title || "Ohne Titel")}
        </h3>

      </div>

      <span class="order-status">
        Offen
      </span>

    </div>


    <p class="order-description">
      ${escapeHtml(order.description || "")}
    </p>


    <div class="order-tags">

      ${languages.map(language => `
        <span class="tag">
          ${escapeHtml(language)}
        </span>
      `).join("")}

    </div>


    <div class="order-tags">

      ${platforms.map(platform => `
        <span class="tag platform-tag">
          ${escapeHtml(platform)}
        </span>
      `).join("")}

    </div>


    <div class="order-card-footer">

      <a
        href="${escapeHtml(order.githubUrl || "#")}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn secondary-btn"
      >
        GitHub Repository
      </a>


      <button
        class="btn primary-btn"
        data-order-id="${escapeHtml(documentId)}"
        disabled
      >
        Auftrag ansehen
      </button>

    </div>

  `;


  return card;
}


/*
==================================================
 LOGOUT
==================================================
*/

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


/*
==================================================
 AUTH
==================================================
*/

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "index.html";

      return;
    }


    currentUser = user;


    /*
    Standardmäßig die eigene
    Login-E-Mail als Kontakt vorschlagen.
    */

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



