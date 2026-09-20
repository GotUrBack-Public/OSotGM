import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { auth } from "./firebase.js";

const loginForm = document.getElementById("login-form");
const message = document.getElementById("login-message");

function showMessage(text, type = "info") {
  message.textContent = text;
  message.className = `message ${type}`;
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showMessage("Bitte E-Mail und Passwort eingeben.", "error");
      return;
    }

    const button = loginForm.querySelector("button");

    button.disabled = true;
    button.textContent = "Einloggen...";

    try {
      await signInWithEmailAndPassword(auth, email, password);

      showMessage(
        "Login erfolgreich. Dashboard wird geöffnet...",
        "success"
      );

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);

    } catch (error) {
      console.error("Firebase login error:", error);

      const messages = {
        "auth/invalid-credential":
          "E-Mail oder Passwort ist falsch.",

        "auth/invalid-email":
          "Die E-Mail-Adresse ist ungültig.",

        "auth/user-disabled":
          "Dieser Account wurde deaktiviert.",

        "auth/too-many-requests":
          "Zu viele Versuche. Bitte später erneut versuchen."
      };

      showMessage(
        messages[error.code] ||
        "Anmeldung fehlgeschlagen. Bitte versuche es erneut.",
        "error"
      );

    } finally {
      button.disabled = false;
      button.textContent = "Einloggen";
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Eingeloggt:", user.email);
  }
});
