const msgBox = document.getElementById("msg");
const form = document.getElementById("forgotForm");
const btn = document.getElementById("forgotBtn");

function showMsg(text, type = "error") {
  msgBox.textContent = text;
  msgBox.className = `msg show ${type}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Enviando...`;

  try {
    await forgotPasswordRequest(email);
    showMsg(
      "Si el correo existe en nuestro sistema, te enviamos un enlace para restablecer tu contraseña.",
      "success"
    );
    form.reset();
  } catch (err) {
    showMsg(err.message || "No se pudo enviar el enlace", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Enviar enlace";
  }
});
