import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase.js";


const userEmail =
  document.getElementById("user-email");

const logoutButton =
  document.getElementById("logout-button");

const profileButton =
  document.getElementById("profile-button");

const profileCard =
  document.getElementById("profile-card");

const worktimeCard =
  document.getElementById("worktime-card");

const monthlyHours =
  document.getElementById("monthly-hours");


/*
 * Zeit formatieren
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


  return null;

}


/*
 * Monatsstunden laden
 */

async function loadMonthlyHours(
  user
) {

  const now =
    new Date();


  const monthStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );


  const nextMonth =
    new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0
    );


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
        user.uid
      )
    );


  const snapshot =
    await getDocs(
      sessionsQuery
    );


  let total =
    0;


  snapshot.forEach(
    (sessionDocument) => {

      const session =
        sessionDocument.data();


      if (
        session.status !==
        "completed"
      ) {

        return;

      }


      const startedAt =
        timestampToDate(
          session.startedAt
        );


      if (
        !startedAt ||
        startedAt < monthStart ||
        startedAt >= nextMonth
      ) {

        return;

      }


      total +=
        Number(
          session.durationMs || 0
        );

    }
  );


  monthlyHours.textContent =
    formatShortDuration(
      total
    );

}


/*
 * Auth
 */

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "index.html";

      return;

    }


    userEmail.textContent =
      user.email;


    try {

      await loadMonthlyHours(
        user
      );

    } catch (error) {

      console.error(
        "Monthly hours error:",
        error
      );

    }

  }
);


/*
 * Profil
 */

profileButton.addEventListener(
  "click",
  () => {

    window.location.href =
      "profile.html";

  }
);


profileCard.addEventListener(
  "click",
  () => {

    window.location.href =
      "profile.html";

  }
);


/*
 * Arbeitszeit
 */

worktimeCard.addEventListener(
  "click",
  () => {

    window.location.href =
      "worktime.html";

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



