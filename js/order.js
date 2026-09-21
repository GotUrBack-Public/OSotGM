import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* ==================================================
   ELEMENTE
================================================== */

const loadingState =
  document.getElementById("loadingState");

const errorState =
  document.getElementById("errorState");

const errorMessage =
  document.getElementById("errorMessage");

const orderContent =
  document.getElementById("orderContent");

const orderCode =
  document.getElementById("orderCode");

const orderTitle =
  document.getElementById("orderTitle");

const orderStatus =
  document.getElementById("orderStatus");

const orderDescription =
  document.getElementById("orderDescription");

const githubLink =
  document.getElementById("githubLink");

const technologyGroups =
  document.getElementById("technologyGroups");

const creatorAvatar =
  document.getElementById("creatorAvatar");

const creatorName =
  document.getElementById("creatorName");

const creatorEmail =
  document.getElementById("creatorEmail");

const creatorPhoneSection =
  document.getElementById("creatorPhoneSection");

const creatorPhone =
  document.getElementById("creatorPhone");

const participantsList =
  document.getElementById("participantsList");

const logoutBtn =
  document.getElementById("logoutBtn");


/* ==================================================
   HILFSFUNKTIONEN
================================================== */

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function getOrderId() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get("id");

}


function getInitials(value) {

  if (!value) {
    return "?";
  }

  const text =
    String(value).trim();

  if (!text) {
    return "?";
  }

  const parts =
    text.split(/\s+/);

  if (parts.length >= 2) {

    return (
      parts[0][0] +
      parts[1][0]
    ).toUpperCase();

  }

  return text
    .slice(0, 2)
    .toUpperCase();

}


function showError(message) {

  loadingState.style.display =
    "none";

  orderContent.style.display =
    "none";

  errorState.style.display =
    "block";

  errorMessage.textContent =
    message;

}


function showContent() {

  loadingState.style.display =
    "none";

  errorState.style.display =
    "none";

  orderContent.style.display =
    "block";

}


/* ==================================================
   STATUS
================================================== */

function getStatusLabel(status) {

  switch (status) {

    case "open":
      return "Offen";

    case "completed":
      return "Abgeschlossen";

    case "closed":
      return "Abgeschlossen";

    default:
      return status || "Unbekannt";

  }

}


/* ==================================================
   TECHNIK
================================================== */

function renderTechnologyGroup(
  title,
  values,
  platform = false
) {

  if (
    !Array.isArray(values) ||
    values.length === 0
  ) {
    return "";
  }

  return `
    <div class="technology-group">

      <h4>
        ${escapeHtml(title)}
      </h4>

      <div class="tag-group">

        ${values.map(value => `
          <span
            class="tag${platform ? " platform" : ""}"
          >
            ${escapeHtml(value)}
          </span>
        `).join("")}

      </div>

    </div>
  `;

}


function renderTechnologies(order) {

  technologyGroups.innerHTML = `

    ${renderTechnologyGroup(
      "Programmiersprachen",
      order.languages
    )}

    ${renderTechnologyGroup(
      "Frameworks",
      order.frameworks
    )}

    ${renderTechnologyGroup(
      "Datenbanken",
      order.databases
    )}

    ${renderTechnologyGroup(
      "Tools & Technologien",
      order.tools
    )}

    ${renderTechnologyGroup(
      "Plattformen",
      order.platforms,
      true
    )}

  `;

}


/* ==================================================
   CREATOR
================================================== */

async function loadCreator(order) {

  const creatorId =
    order.creatorId;

  let profile = null;

  if (creatorId) {

    try {

      const profileSnapshot =
        await getDoc(
          doc(
            db,
            "users",
            creatorId
          )
        );

      if (profileSnapshot.exists()) {
        profile =
          profileSnapshot.data();
      }

    } catch (error) {

      console.warn(
        "Creator-Profil konnte nicht geladen werden:",
        error
      );

    }

  }


  const email =
    order.creatorEmail ||
    profile?.email ||
    "Keine E-Mail angegeben";


  const title =
    profile?.title ||
    "";


  creatorName.textContent =
    title
      ? title
      : email;


  creatorAvatar.textContent =
    getInitials(
      title || email
    );


  creatorEmail.textContent =
    email;


  if (email.includes("@")) {

    creatorEmail.href =
      `mailto:${email}`;

  } else {

    creatorEmail.removeAttribute(
      "href"
    );

  }


  const phone =
    order.creatorPhone ||
    profile?.phone ||
    null;


  if (phone) {

    creatorPhoneSection.style.display =
      "block";

    creatorPhone.textContent =
      phone;

    creatorPhone.href =
      `tel:${phone.replace(/\s+/g, "")}`;

  } else {

    creatorPhoneSection.style.display =
      "none";

  }

}


/* ==================================================
   TEILNEHMER
================================================== */

function getParticipantStatusLabel(status) {

  switch (status) {

    case "interested":
      return "Interessiert";

    case "accepted":
      return "Angenommen";

    case "working":
      return "Arbeitet";

    case "completed":
      return "Fertig";

    default:
      return status || "Teilnehmer";

  }

}


function renderParticipants(participants) {

  if (
    !Array.isArray(participants) ||
    participants.length === 0
  ) {

    participantsList.innerHTML = `
      <div class="empty-participants">
        Noch keine Teilnehmer.
      </div>
    `;

    return;

  }


  participantsList.innerHTML =
    participants.map(
      participant => {

        const name =
          participant.name ||
          participant.email ||
          participant.userEmail ||
          "Teilnehmer";


        const email =
          participant.email ||
          participant.userEmail ||
          "";


        const status =
          getParticipantStatusLabel(
            participant.status
          );


        return `
          <div class="participant">

            <div class="participant-main">

              <div class="participant-name">
                ${escapeHtml(name)}
              </div>

              ${
                email
                  ? `
                    <div class="participant-email">
                      ${escapeHtml(email)}
                    </div>
                  `
                  : ""
              }

            </div>

            <span class="participant-status">
              ${escapeHtml(status)}
            </span>

          </div>
        `;

      }
    ).join("");

}


/* ==================================================
   AUFTRAG LADEN
================================================== */

async function loadOrder() {

  const orderId =
    getOrderId();


  if (!orderId) {

    showError(
      "Es wurde keine Auftrags-ID angegeben."
    );

    return;

  }


  try {

    const orderSnapshot =
      await getDoc(
        doc(
          db,
          "orders",
          orderId
        )
      );


    if (!orderSnapshot.exists()) {

      showError(
        "Dieser Auftrag existiert nicht oder wurde gelöscht."
      );

      return;

    }


    const order =
      orderSnapshot.data();


    orderCode.textContent =
      order.orderCode ||
      `Auftrag ${orderId}`;


    orderTitle.textContent =
      order.title ||
      "Ohne Titel";


    orderStatus.textContent =
      getStatusLabel(
        order.status
      );


    orderDescription.textContent =
      order.description ||
      "Keine Beschreibung vorhanden.";


    if (order.githubUrl) {

      githubLink.href =
        order.githubUrl;

      githubLink.textContent =
        order.githubUrl;

    } else {

      githubLink.removeAttribute(
        "href"
      );

      githubLink.textContent =
        "Kein GitHub Repository angegeben";

    }


    renderTechnologies(
      order
    );


    renderParticipants(
      order.participants
    );


    await loadCreator(
      order
    );


    showContent();


  } catch (error) {

    console.error(
      "Fehler beim Laden des Auftrags:",
      error
    );


    showError(
      `Auftrag konnte nicht geladen werden: ${error.message}`
    );

  }

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


    await loadOrder();

  }
);






