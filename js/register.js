const msgBox = document.getElementById("msg");
const form = document.getElementById("registerForm");
const btn = document.getElementById("registerBtn");

function showMsg(text, type = "error") {
  msgBox.textContent = text;
  msgBox.className = `msg show ${type}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    showMsg("Las contraseñas no coinciden", "error");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Creando cuenta...`;

  try {
    await registerRequest(nombre, email, password, confirmPassword);
    showMsg(
      "Cuenta creada. Revisa tu correo para verificar tu cuenta antes de iniciar sesión.",
      "success"
    );
    form.reset();
  } catch (err) {
    showMsg(err.message || "No se pudo completar el registro", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Registrarme";
  }
});
