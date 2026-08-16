// Shortik frontend — a deliberately small vanilla-JS client for the API in src/api.
// State lives in `state`, every screen change goes through render(), every request through api().

const TOKEN_KEY = "shortik.token";
const EMAIL_KEY = "shortik.email";

const state = {
  token: localStorage.getItem(TOKEN_KEY),
  email: localStorage.getItem(EMAIL_KEY),
  holovakner: [],
  current: null,
};

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------- api helpers

async function api(method, path, { json, form, auth = true } = {}) {
  const headers = {};
  if (auth && state.token) headers.Authorization = `Bearer ${state.token}`;
  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }
  const res = await fetch(path, { method, headers, body });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || res.statusText);
  }
  return data;
}

function say(message) {
  alert(message);
}

// ---------------------------------------------------------------- session

async function login(email, password) {
  const data = await api("POST", "/api/login", { json: { email, password }, auth: false });
  if (!data.token) {
    throw new Error("Մուտքը չստացվեց։ Ստուգիր email-ը ու գաղտնաբառը։");
  }
  state.token = data.token;
  state.email = email;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(EMAIL_KEY, email);
  await loadHolovakner();
  render();
}

function logout() {
  state.token = null;
  state.email = null;
  state.holovakner = [];
  state.current = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  render();
}

// ---------------------------------------------------------------- holovakner

async function loadHolovakner() {
  state.holovakner = await api("GET", "/api/holovakner");
}

async function selectHolovak(id) {
  $("thumbnail").value = "";
  $("video-file").value = "";
  state.current = await api("GET", `/api/holovakner/${id}`);
  render();
}

async function createDraft(title, description) {
  const created = await api("POST", "/api/holovakner", { json: { title, description } });
  await loadHolovakner();
  await selectHolovak(created.id);
}

async function deleteCurrent() {
  if (!state.current) {
    say("Ջնջելու համար հոլովակ ընտրված չէ։");
    return;
  }
  await api("DELETE", `/api/holovakner/${state.current.id}`);
  say("Հոլովակը հաջողությամբ ջնջվեց։");
  state.current = null;
  await loadHolovakner();
  render();
}

async function uploadFile(kind) {
  // kind: "thumbnail" | "video" — the multipart field name the server expects
  const input = kind === "thumbnail" ? $("thumbnail") : $("video-file");
  const button = kind === "thumbnail" ? $("upload-thumbnail-btn") : $("upload-video-btn");
  const file = input.files[0];
  if (!file || !state.current) return;

  const form = new FormData();
  form.append(kind, file);
  const path = kind === "thumbnail" ? `/api/thumbnail_upload/${state.current.id}` : `/api/holovak_upload/${state.current.id}`;

  button.disabled = true;
  button.textContent = "Վերբեռնում...";
  try {
    await api("POST", path, { form });
    say(kind === "thumbnail" ? "Thumbnail-ը վերբեռնվեց!" : "Հոլովակը վերբեռնվեց!");
    await selectHolovak(state.current.id);
  } finally {
    button.disabled = false;
    button.textContent = "Վերբեռնել";
  }
}

// ---------------------------------------------------------------- render

function render() {
  const signedIn = Boolean(state.token);
  $("auth-section").hidden = signedIn;
  $("holovak-section").hidden = !signedIn;
  $("logout-button").hidden = !signedIn;
  $("whoami").textContent = signedIn && state.email ? state.email : "";
  if (!signedIn) return;

  const list = $("holovak-list");
  list.innerHTML = "";
  for (const holovak of state.holovakner) {
    const li = document.createElement("li");
    li.textContent = holovak.title;
    if (state.current && holovak.id === state.current.id) li.classList.add("active");
    li.onclick = () => selectHolovak(holovak.id).catch((err) => say(`Սխալ՝ <error>`.replace("<error>", err.message)));
    list.appendChild(li);
  }

  $("holovak-display").hidden = !state.current;
  if (state.current) viewHolovak(state.current);
}

function viewHolovak(holovak) {
  $("holovak-title-display").textContent = holovak.title;
  $("holovak-description-display").textContent = holovak.description;

  const thumbnailImg = $("thumbnail-image");
  thumbnailImg.hidden = !holovak.thumbnailURL;
  if (holovak.thumbnailURL) {
    thumbnailImg.src = holovak.thumbnailURL;
  }

  const videoPlayer = $("video-player");
  videoPlayer.hidden = !holovak.videoURL;
  if (holovak.videoURL && videoPlayer.src !== holovak.videoURL) {
    videoPlayer.src = holovak.videoURL;
    videoPlayer.load();
  }
}

// ---------------------------------------------------------------- wiring

function guard(fn, prefix) {
  return async (event) => {
    event?.preventDefault?.();
    try {
      await fn();
    } catch (err) {
      say(prefix.replace("<error>", err.message));
    }
  };
}

$("login-form").addEventListener(
  "submit",
  guard(() => login($("email").value, $("password").value), "Մուտքը չստացվեց: <error>"),
);

$("signup-button").addEventListener(
  "click",
  guard(async () => {
    const email = $("email").value;
    const password = $("password").value;
    await api("POST", "/api/users", { json: { email, password }, auth: false });
    console.log("User-ը ստեղծվեց!");
    await login(email, password);
  }, "Չստացվեց ստեղծել user-ը: <error>"),
);

$("logout-button").addEventListener("click", () => logout());

$("draft-form").addEventListener(
  "submit",
  guard(async () => {
    await createDraft($("draft-title").value, $("draft-description").value);
    $("draft-form").reset();
  }, "Չստացվեց ստեղծել draft-ը: <error>"),
);

$("thumbnail-upload-form").addEventListener("submit", guard(() => uploadFile("thumbnail"), "Thumbnail-ը չվերբեռնվեց։ Error: <error>"));
$("video-upload-form").addEventListener("submit", guard(() => uploadFile("video"), "Հոլովակի ֆայլը չվերբեռնվեց։ Error: <error>"));
$("delete-holovak").addEventListener("click", guard(() => deleteCurrent(), "Չստացվեց ջնջել հոլովակը։"));

// first paint: restore the session if there is a token
if (state.token) {
  loadHolovakner()
    .then(render)
    .catch(() => logout());
} else {
  render();
}
