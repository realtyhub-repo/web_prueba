const loadingState = document.getElementById("loadingState");
const successState = document.getElementById("successState");
const errorState = document.getElementById("errorState");
const errorText = document.getElementById("errorText");

(async function verify() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    loadingState.style.display = "none";
    errorText.textContent = "No se encontró un token de verificación en el enlace.";
    errorState.style.display = "block";
    return;
  }

  try {
    await verifyEmailRequest(token);
    loadingState.style.display = "none";
    successState.style.display = "block";
  } catch (err) {
    loadingState.style.display = "none";
    errorText.textContent = err.message || "El enlace es inválido o ya expiró.";
    errorState.style.display = "block";
  }
})();
