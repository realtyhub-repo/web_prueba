// Si no hay access token en memoria (por ejemplo, F5 en esta pestaña),
// intentamos recuperarlo con el refresh token (cookie httpOnly).
// Si tampoco eso funciona, es porque no hay sesión: al login.
(async function guard() {
  if (!TokenStore.get()) {
    const token = await refreshAccessToken();
    if (!token) {
      window.location.href = "index.html";
    }
  }
})();

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await logoutRequest();
  window.location.href = "index.html";
});
