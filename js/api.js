// ==============================
// MANEJO DEL ACCESS TOKEN
// ==============================
// Lo guardamos en memoria (variable) + sessionStorage como respaldo
// para que sobreviva a un F5. El refresh token vive solo en la cookie
// httpOnly, nunca lo tocamos desde JS.

const TokenStore = {
  get() {
    return sessionStorage.getItem("accessToken");
  },
  set(token) {
    sessionStorage.setItem("accessToken", token);
  },
  clear() {
    sessionStorage.removeItem("accessToken");
  },
};

// ==============================
// FETCH BASE
// ==============================
// credentials: "include" es OBLIGATORIO para que el navegador
// mande/reciba la cookie httpOnly del refresh token.

async function rawFetch(path, { method = "GET", body, auth = false } = {}) {
  const headers = {
    "ngrok-skip-browser-warning": "true",   // 👈 agregas esta línea
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = TokenStore.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${AUTH_BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return res;
}

// Intenta parsear el error del backend para mostrar algo útil al usuario
async function parseError(res) {
  let message = `Error ${res.status}`;
  try {
    const data = await res.json();
    if (data?.message) message = data.message;
    else if (data?.error) message = data.error;
    else if (typeof data === "string") message = data;
    else if (Array.isArray(data?.errors)) {
      message = data.errors.map((e) => e.message || e.defaultMessage || e).join(", ");
    }
  } catch (_) {
    // el body no era JSON, dejamos el mensaje genérico
  }
  return message;
}

// ==============================
// LLAMADA CON AUTO-REFRESH
// ==============================
// Si el endpoint requiere auth y responde 401, intentamos refrescar
// el access token una sola vez con la cookie y reintentamos.

async function apiFetch(path, options = {}) {
  let res = await rawFetch(path, options);

  if (res.status === 401 && options.auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await rawFetch(path, options);
    }
  }

  if (!res.ok) {
    const message = await parseError(res);
    throw new Error(message);
  }

  // 204 No Content u otras respuestas vacías
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ==============================
// ENDPOINTS DE AUTH
// ==============================

async function loginRequest(email, password) {
  const data = await apiFetch("/login", {
    method: "POST",
    body: { email, password },
  });
  TokenStore.set(data.accessToken);
  return data;
}

async function googleLoginRequest(idToken) {
  const data = await apiFetch("/google", {
    method: "POST",
    body: { id_token: idToken },
  });
  TokenStore.set(data.accessToken);
  return data;
}

async function registerRequest(nombre, email, password, confirmPassword) {
  return apiFetch("/register", {
    method: "POST",
    body: { nombre, email, password, confirmPassword },
  });
}

async function resendVerificationRequest(email) {
  return apiFetch("/resend-verification", {
    method: "POST",
    body: { email },
  });
}

async function verifyEmailRequest(token) {
  return apiFetch(`/verify-email?token=${encodeURIComponent(token)}`, {
    method: "GET",
  });
}

async function forgotPasswordRequest(email) {
  return apiFetch("/forgot-password", {
    method: "POST",
    body: { email },
  });
}

async function resetPasswordRequest(token, password, confirmPassword) {
  return apiFetch("/reset-password", {
    method: "POST",
    body: { token, password, confirmPassword },
  });
}

async function refreshAccessToken() {
  try {
    const res = await rawFetch("/refresh", { method: "POST" });
    if (!res.ok) {
      TokenStore.clear();
      return null;
    }
    const data = await res.json();
    TokenStore.set(data.accessToken);
    return data.accessToken;
  } catch (_) {
    TokenStore.clear();
    return null;
  }
}

async function logoutRequest() {
  try {
    await rawFetch("/logout", { method: "POST" });
  } finally {
    TokenStore.clear();
  }
}
