import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { auth } from "./firebase.js";


const userEmail = document.getElementById("user-email");
const logoutButton = document.getElementById("logout-button");


/*
 * Schutz des Dashboards
 *
 * Nur eingeloggte Firebase-Benutzer
 * dürfen diese Seite sehen.
 */
onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href = "index.html";

    return;
  }


  userEmail.textContent = user.email;
});


/*
 * Logout
 */
logoutButton.addEventListener("click", async () => {

  logoutButton.disabled = true;
  logoutButton.textContent = "Logout...";


  try {

    await signOut(auth);

    window.location.href = "index.html";

  } catch (error) {

    console.error("Logout error:", error);

    logoutButton.disabled = false;
    logoutButton.textContent = "Logout";

    alert(
      "Beim Ausloggen ist ein Fehler aufgetreten."
    );
  }
});
