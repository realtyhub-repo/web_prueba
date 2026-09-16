const msgBox = document.getElementById("msg");
const resendBox = document.getElementById("resendBox");
const resendBtn = document.getElementById("resendBtn");
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");

let lastEmailTried = "";

function showMsg(text, type = "error") {
  msgBox.textContent = text;
  msgBox.className = `msg show ${type}`;
}

function hideMsg() {
  msgBox.className = "msg";
}

// Si ya hay una sesión activa (el refresh todavía sirve), lo mandamos directo
(async function checkExistingSession() {
  const token = await refreshAccessToken();
  if (token) {
    window.location.href = "dashboard.html";
  }
})();

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideMsg();
  resendBox.style.display = "none";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  lastEmailTried = email;

  loginBtn.disabled = true;
  loginBtn.innerHTML = `<span class="spinner"></span> Ingresando...`;

  try {
    await loginRequest(email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    const message = err.message || "No se pudo iniciar sesión";
    showMsg(message, "error");

    // Si el backend avisa que el correo no está verificado, mostramos
    // la opción de reenviar el enlace de verificación
    if (/verific/i.test(message)) {
      resendBox.style.display = "block";
    }
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Ingresar";
  }
});

resendBtn.addEventListener("click", async () => {
  if (!lastEmailTried) return;
  resendBtn.disabled = true;
  resendBtn.textContent = "Enviando...";
  try {
    await resendVerificationRequest(lastEmailTried);
    showMsg("Te enviamos un nuevo enlace de verificación a tu correo.", "success");
    resendBox.style.display = "none";
  } catch (err) {
    showMsg(err.message || "No se pudo reenviar el correo", "error");
  } finally {
    resendBtn.disabled = false;
    resendBtn.textContent = "Reenviar correo de verificación";
  }
});

// ==============================
// GOOGLE SIGN-IN
// ==============================
window.onload = () => {
  if (!window.google || !google.accounts) return;

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
  });

  google.accounts.id.renderButton(
    document.getElementById("googleBtnContainer"),
    { theme: "outline", size: "large", width: 320 }
  );
};

async function handleGoogleCredential(response) {
  hideMsg();
  try {
    // response.credential es el id_token que pide el backend
    await googleLoginRequest(response.credential);
    window.location.href = "dashboard.html";
  } catch (err) {
    showMsg(err.message || "No se pudo iniciar sesión con Google", "error");
  }
}
