const msgBox = document.getElementById("msg");
const form = document.getElementById("resetForm");
const btn = document.getElementById("resetBtn");
const noTokenState = document.getElementById("noTokenState");

function showMsg(text, type = "error") {
  msgBox.textContent = text;
  msgBox.className = `msg show ${type}`;
}

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (!token) {
  form.style.display = "none";
  noTokenState.style.display = "block";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    showMsg("Las contraseñas no coinciden", "error");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Cambiando...`;

  try {
    await resetPasswordRequest(token, password, confirmPassword);
    showMsg("Contraseña actualizada. Ya puedes iniciar sesión.", "success");
    form.reset();
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1800);
  } catch (err) {
    showMsg(err.message || "No se pudo cambiar la contraseña", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Cambiar contraseña";
  }
});
