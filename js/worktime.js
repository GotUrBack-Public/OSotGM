import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase.js";


const userEmail =
  document.getElementById("user-email");

const dashboardButton =
  document.getElementById("dashboard-button");

const logoutButton =
  document.getElementById("logout-button");

const worktimeButton =
  document.getElementById("worktime-button");

const currentTime =
  document.getElementById("current-time");

const statusDot =
  document.getElementById("status-dot");

const statusText =
  document.getElementById("status-text");

const message =
  document.getElementById("worktime-message");

const monthTotal =
  document.getElementById("month-total");

const monthName =
  document.getElementById("month-name");

const sessionList =
  document.getElementById("session-list");


let currentUser = null;

let activeSession = null;

let timerInterval = null;


/*
 * Monatsnamen
 */

const monthNames = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember"
];


/*
 * Nachrichten anzeigen
 */

function showMessage(
  text,
  type = "info"
) {

  message.textContent = text;

  message.className =
    `message ${type}`;

}


/*
 * Zeit formatieren
 */

function formatDuration(
  milliseconds
) {

  const totalSeconds =
    Math.max(
      0,
      Math.floor(milliseconds / 1000)
    );


  const hours =
    Math.floor(
      totalSeconds / 3600
    );


  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );


  const seconds =
    totalSeconds % 60;


  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0")
  ].join(":");

}


/*
 * Stunden und Minuten für die Anzeige
 */

function formatShortDuration(
  milliseconds
) {

  const totalMinutes =
    Math.floor(
      Math.max(
        0,
        milliseconds
      ) / 60000
    );


  const hours =
    Math.floor(
      totalMinutes / 60
    );


  const minutes =
    totalMinutes % 60;


  return `${hours}h ${String(minutes).padStart(2, "0")}min`;

}


/*
 * Firestore Timestamp → Date
 */

function timestampToDate(
  timestamp
) {

  if (!timestamp) {
    return null;
  }


  if (
    typeof timestamp.toDate ===
    "function"
  ) {

    return timestamp.toDate();

  }


  if (
    typeof timestamp.seconds ===
    "number"
  ) {

    return new Date(
      timestamp.seconds * 1000
    );

  }


  return null;

}


/*
 * Aktuelle Session im Timer anzeigen
 */

function updateActiveTimer() {

  if (!activeSession) {

    currentTime.textContent =
      "00:00:00";

    return;

  }


  const startDate =
    timestampToDate(
      activeSession.startedAt
    );


  if (!startDate) {
    return;
  }


  const elapsed =
    Date.now() -
    startDate.getTime();


  currentTime.textContent =
    formatDuration(elapsed);

}


/*
 * Timer starten
 */

function startTimer() {

  stopTimer();

  updateActiveTimer();


  timerInterval =
    setInterval(
      updateActiveTimer,
      1000
    );

}


/*
 * Timer stoppen
 */

function stopTimer() {

  if (timerInterval) {

    clearInterval(
      timerInterval
    );

    timerInterval = null;

  }

}


/*
 * UI auf "arbeitet" setzen
 */

function setWorkingState() {

  statusDot.classList.add(
    "active"
  );

  statusText.textContent =
    "Du arbeitest gerade";

  worktimeButton.textContent =
    "Arbeit beenden";

  worktimeButton.classList.add(
    "stop"
  );

  startTimer();

}


/*
 * UI auf "nicht am Arbeiten" setzen
 */

function setNotWorkingState() {

  statusDot.classList.remove(
    "active"
  );

  statusText.textContent =
    "Nicht bei der Arbeit";

  worktimeButton.textContent =
    "Arbeit beginnen";

  worktimeButton.classList.remove(
    "stop"
  );

  stopTimer();

  currentTime.textContent =
    "00:00:00";

}


/*
 * Monatsgrenzen bestimmen
 */

function getCurrentMonthRange() {

  const now =
    new Date();


  const start =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );


  const end =
    new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0
    );


  return {
    start,
    end
  };

}


/*
 * Arbeits-Sessions aus Firestore laden
 */

async function loadSessions() {

  if (!currentUser) {
    return;
  }


  const sessionsRef =
    collection(
      db,
      "workSessions"
    );


  const sessionsQuery =
    query(
      sessionsRef,
      where(
        "userId",
        "==",
        currentUser.uid
      )
    );


  const snapshot =
    await getDocs(
      sessionsQuery
    );


  const {
    start,
    end
  } =
    getCurrentMonthRange();


  const sessions = [];


  snapshot.forEach(
    (sessionDocument) => {

      const session =
        sessionDocument.data();


      const startedAt =
        timestampToDate(
          session.startedAt
        );


      if (!startedAt) {
        return;
      }


      /*
       * Aktive Session merken
       */

      if (
        session.status ===
        "active"
      ) {

        if (
          !activeSession ||
          startedAt >
          timestampToDate(
            activeSession.startedAt
          )
        ) {

          activeSession = {
            id:
              sessionDocument.id,

            ...session
          };

        }

      }


      /*
       * Nur Sessions dieses Monats
       */

      if (
        startedAt >= start &&
        startedAt < end &&
        session.status ===
        "completed"
      ) {

        const duration =
          Number(
            session.durationMs || 0
          );


        sessions.push({
          id:
            sessionDocument.id,

          startedAt,

          endedAt:
            timestampToDate(
              session.endedAt
            ),

          duration
        });

      }

    }
  );


  /*
   * Aktuelle Session berücksichtigen,
   * falls sie diesen Monat gestartet wurde.
   */

  if (activeSession) {

    const activeStart =
      timestampToDate(
        activeSession.startedAt
      );


    if (
      activeStart >= start &&
      activeStart < end
    ) {

      const currentDuration =
        Date.now() -
        activeStart.getTime();


      sessions.push({
        id:
          activeSession.id,

        startedAt:
          activeStart,

        endedAt:
          null,

        duration:
          currentDuration
      });

    }

  }


  /*
   * Nach Datum sortieren
   */

  sessions.sort(
    (a, b) =>
      b.startedAt -
      a.startedAt
  );


  /*
   * Monatssumme berechnen
   */

  const total =
    sessions.reduce(
      (
        sum,
        session
      ) =>
        sum +
        session.duration,
      0
    );


  monthTotal.textContent =
    formatShortDuration(
      total
    );


  renderSessions(
    sessions
  );


  if (activeSession) {

    setWorkingState();

  } else {

    setNotWorkingState();

  }

}


/*
 * Sessions darstellen
 */

function renderSessions(
  sessions
) {

  sessionList.innerHTML = "";


  if (!sessions.length) {

    const empty =
      document.createElement(
        "p"
      );

    empty.className =
      "empty-sessions";

    empty.textContent =
      "Diesen Monat gibt es noch keine Arbeitszeiten.";

    sessionList.appendChild(
      empty
    );

    return;

  }


  sessions
    .slice(0, 10)
    .forEach(
      (session) => {

        const row =
          document.createElement(
            "div"
          );

        row.className =
          "session";


        const date =
          document.createElement(
            "span"
          );

        date.className =
          "session-date";


        date.textContent =
          session.startedAt.toLocaleDateString(
            "de-DE",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            }
          );


        const duration =
          document.createElement(
            "span"
          );

        duration.className =
          "session-duration";


        duration.textContent =
          formatShortDuration(
            session.duration
          );


        row.appendChild(
          date
        );

        row.appendChild(
          duration
        );


        sessionList.appendChild(
          row
        );

      }
    );

}


/*
 * Arbeit beginnen
 */

async function startWork() {

  if (!currentUser) {
    return;
  }


  worktimeButton.disabled =
    true;


  showMessage(
    "Arbeitszeit wird gestartet..."
  );


  try {

    /*
     * Sicherheitshalber prüfen,
     * ob bereits eine aktive Session existiert.
     */

    const sessionsRef =
      collection(
        db,
        "workSessions"
      );


    const activeQuery =
      query(
        sessionsRef,
        where(
          "userId",
          "==",
          currentUser.uid
        ),
        where(
          "status",
          "==",
          "active"
        )
      );


    const activeSnapshot =
      await getDocs(
        activeQuery
      );


    if (
      !activeSnapshot.empty
    ) {

      showMessage(
        "Du hast bereits eine aktive Arbeitszeit.",
        "error"
      );

      await loadSessions();

      return;

    }


    const sessionReference =
      await addDoc(
        sessionsRef,
        {
          userId:
            currentUser.uid,

          startedAt:
            serverTimestamp(),

          endedAt:
            null,

          durationMs:
            0,

          status:
            "active"
        }
      );


    /*
     * Wir setzen lokal sofort eine
     * Startzeit, damit der Timer ohne
     * Verzögerung sichtbar ist.
     */

    activeSession = {
      id:
        sessionReference.id,

      userId:
        currentUser.uid,

      startedAt:
        Timestamp.now(),

      endedAt:
        null,

      durationMs:
        0,

      status:
        "active"
    };


    setWorkingState();


    showMessage(
      "Arbeitszeit gestartet.",
      "success"
    );


  } catch (error) {

    console.error(
      "Start work error:",
      error
    );


    showMessage(
      "Die Arbeitszeit konnte nicht gestartet werden.",
      "error"
    );

  } finally {

    worktimeButton.disabled =
      false;

  }

}


/*
 * Arbeit beenden
 */

async function stopWork() {

  if (
    !currentUser ||
    !activeSession
  ) {
    return;
  }


  worktimeButton.disabled =
    true;


  showMessage(
    "Arbeitszeit wird beendet..."
  );


  try {

    const endDate =
      new Date();


    const startDate =
      timestampToDate(
        activeSession.startedAt
      );


    if (!startDate) {

      throw new Error(
        "Startzeit konnte nicht gelesen werden."
      );

    }


    const durationMs =
      Math.max(
        0,
        endDate.getTime() -
        startDate.getTime()
      );


    const sessionReference =
      doc(
        db,
        "workSessions",
        activeSession.id
      );


    await updateDoc(
      sessionReference,
      {
        endedAt:
          serverTimestamp(),

        durationMs:
          durationMs,

        status:
          "completed"
      }
    );


    activeSession =
      null;


    setNotWorkingState();


    showMessage(
      "Arbeitszeit beendet.",
      "success"
    );


    await loadSessions();


  } catch (error) {

    console.error(
      "Stop work error:",
      error
    );


    showMessage(
      "Die Arbeitszeit konnte nicht beendet werden.",
      "error"
    );

  } finally {

    worktimeButton.disabled =
      false;

  }

}


/*
 * Start / Stop Button
 */

worktimeButton.addEventListener(
  "click",
  async () => {

    if (activeSession) {

      await stopWork();

    } else {

      await startWork();

    }

  }
);


/*
 * Dashboard
 */

dashboardButton.addEventListener(
  "click",
  () => {

    window.location.href =
      "dashboard.html";

  }
);


/*
 * Logout
 */

logoutButton.addEventListener(
  "click",
  async () => {

    logoutButton.disabled =
      true;

    logoutButton.textContent =
      "Logout...";


    try {

      await signOut(
        auth
      );


      window.location.href =
        "index.html";

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );


      logoutButton.disabled =
        false;

      logoutButton.textContent =
        "Logout";

    }

  }
);


/*
 * Authentifizierung
 */

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "index.html";

      return;

    }


    currentUser =
      user;


    userEmail.textContent =
      user.email;


    const now =
      new Date();


    monthName.textContent =
      `${monthNames[now.getMonth()]} ${now.getFullYear()}`;


    try {

      await loadSessions();

    } catch (error) {

      console.error(
        "Session loading error:",
        error
      );


      showMessage(
        "Die Arbeitszeiten konnten nicht geladen werden.",
        "error"
      );

    }

  }
);


