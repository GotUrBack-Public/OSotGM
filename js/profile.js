import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase.js";


const userEmail = document.getElementById("user-email");
const profileEmail = document.getElementById("profile-email");
const profileInitial = document.getElementById("profile-initial");

const profileForm = document.getElementById("profile-form");

const titleInput = document.getElementById("title");
const techStackInput = document.getElementById("tech-stack");

const saveButton = document.getElementById("save-profile");
const message = document.getElementById("profile-message");

const logoutButton = document.getElementById("logout-button");
const backButton = document.getElementById("back-button");


let currentUser = null;


function showMessage(text, type = "info") {

  message.textContent = text;
  message.className = `message ${type}`;

}


function setLoading(isLoading) {

  saveButton.disabled = isLoading;

  saveButton.textContent =
    isLoading
      ? "Speichern..."
      : "Profil speichern";

}


async function loadProfile(user) {

  const profileRef = doc(
    db,
    "users",
    user.uid
  );

  try {

    const profileSnapshot = await getDoc(profileRef);


    if (profileSnapshot.exists()) {

      const profile = profileSnapshot.data();

      titleInput.value =
        profile.title || "";

      techStackInput.value =
        profile.techStack || "";

      return;
    }


    /*
     * Falls der User noch kein Profil besitzt,
     * wird automatisch eines erstellt.
     */

    await setDoc(
      profileRef,
      {
        email: user.email,
        title: "",
        techStack: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    );

  } catch (error) {

    console.error(
      "Profile loading error:",
      error
    );

    showMessage(
      "Das Profil konnte nicht geladen werden.",
      "error"
    );

  }

}


onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "index.html";

      return;
    }


    currentUser = user;


    userEmail.textContent =
      user.email;

    profileEmail.textContent =
      user.email;


    profileInitial.textContent =
      user.email
        ? user.email
            .charAt(0)
            .toUpperCase()
        : "?";


    await loadProfile(user);

  }
);


profileForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    if (!currentUser) {
      return;
    }


    const title =
      titleInput.value.trim();

    const techStack =
      techStackInput.value.trim();


    setLoading(true);

    showMessage("");


    try {

      const profileRef = doc(
        db,
        "users",
        currentUser.uid
      );


      await setDoc(
        profileRef,
        {
          email: currentUser.email,
          title: title,
          techStack: techStack,
          updatedAt: serverTimestamp()
        },
        {
          merge: true
        }
      );


      showMessage(
        "Profil erfolgreich gespeichert.",
        "success"
      );

    } catch (error) {

      console.error(
        "Profile save error:",
        error
      );


      showMessage(
        "Das Profil konnte nicht gespeichert werden.",
        "error"
      );

    } finally {

      setLoading(false);

    }

  }
);


backButton.addEventListener(
  "click",
  () => {

    window.location.href =
      "dashboard.html";

  }
);


logoutButton.addEventListener(
  "click",
  async () => {

    logoutButton.disabled = true;

    logoutButton.textContent =
      "Logout...";


    try {

      await signOut(auth);

      window.location.href =
        "index.html";

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );


      logoutButton.disabled = false;

      logoutButton.textContent =
        "Logout";

    }

  }
);




