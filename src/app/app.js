document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (token) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("video-section").style.display = "block";
    await getHolovakner();
  } else {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("video-section").style.display = "none";
  }
});

document
  .getElementById("video-draft-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    await createHolovakDraft();
  });

document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    await login();
  });

async function createHolovakDraft() {
  const title = document.getElementById("video-title").value;
  const description = document.getElementById("video-description").value;

  try {
    const res = await fetch("/api/holovakner", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ title, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Չստացվեց ստեղծել draft-ը: ${data.error}`);
    }

    const holovakID = data.id;
    if (holovakID) {
      await getHolovakner();
      await holovakStateHandler(holovakID);
    }
  } catch (error) {
    alert(`Սխալ՝ ${error.message}`);
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Մուտքը չստացվեց: ${data.error}`);
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("video-section").style.display = "block";
      await getHolovakner();
    } else {
      alert("Մուտքը չստացվեց։ Ստուգիր email-ը ու գաղտնաբառը։");
    }
  } catch (error) {
    alert(`Սխալ՝ ${error.message}`);
  }
}

async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(`Չստացվեց ստեղծել user-ը: ${data.error}`);
    }
    console.log("User-ը ստեղծվեց!");
    await login();
  } catch (error) {
    alert(`Սխալ՝ ${error.message}`);
  }
}

function logout() {
  localStorage.removeItem("token");
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("video-section").style.display = "none";
}

function setUploadButtonState(uploading, selector) {
  const uploadBtn = document.getElementById(selector);
  if (uploading) {
    uploadBtn.textContent = "Վերբեռնում...";
    uploadBtn.disabled = true;
    return;
  }
  uploadBtn.textContent = "Վերբեռնել";
  uploadBtn.disabled = false;
}

async function uploadThumbnail(holovakID) {
  const thumbnailFile = document.getElementById("thumbnail").files[0];
  if (!thumbnailFile) return;

  const formData = new FormData();
  formData.append("thumbnail", thumbnailFile);

  const uploadBtnSelector = "upload-thumbnail-btn";
  setUploadButtonState(true, uploadBtnSelector);

  try {
    const res = await fetch(`/api/thumbnail_upload/${holovakID}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(`Thumbnail-ը չվերբեռնվեց։ Error: ${data.error}`);
    }

    await res.json();
    console.log("Thumbnail-ը վերբեռնվեց!");
    await getHolovak(holovakID);
  } catch (error) {
    alert(`Սխալ՝ ${error.message}`);
  }

  setUploadButtonState(false, uploadBtnSelector);
}

async function uploadVideoFile(holovakID) {
  const videoFile = document.getElementById("video-file").files[0];
  if (!videoFile) return;

  const formData = new FormData();
  formData.append("video", videoFile);

  const uploadBtnSelector = "upload-video-btn";
  setUploadButtonState(true, uploadBtnSelector);

  try {
    const res = await fetch(`/api/holovak_upload/${holovakID}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(`Հոլովակի ֆայլը չվերբեռնվեց։ Error: ${data.error}`);
    }

    console.log("Հոլովակը վերբեռնվեց!");
    await getHolovak(holovakID);
  } catch (error) {
    alert(`Սխալ՝ ${error.message}`);
  }

  setUploadButtonState(false, uploadBtnSelector);
}

const holovakStateHandler = createHolovakStateHandler();

async function getHolovakner() {
  try {
    const res = await fetch("/api/holovakner", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(`Չստացվեց բերել հոլովակները։ Error: ${data.error}`);
    }

    const holovakner = await res.json();
    const holovakList = document.getElementById("video-list");
    holovakList.innerHTML = "";
    for (const holovak of holovakner) {
      const listItem = document.createElement("li");
      listItem.textContent = holovak.title;
      listItem.onclick = () => holovakStateHandler(holovak.id);
      holovakList.appendChild(listItem);
    }
  } catch (error) {
    alert(`Սխալ՝ ${error.message}`);
  }
}

function createHolovakStateHandler() {
  let currentHolovakID = null;

  return async function handleHolovakClick(holovakID) {
    if (currentHolovakID !== holovakID) {
      currentHolovakID = holovakID;

      // Reset file input values
      document.getElementById("thumbnail").value = "";
      document.getElementById("video-file").value = "";

      await getHolovak(holovakID);
    }
  };
}

async function getHolovak(holovakID) {
  try {
    const res = await fetch(`/api/holovakner/${holovakID}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!res.ok) {
      throw new Error("Չստացվեց բերել հոլովակը։");
    }

    const holovak = await res.json();
    viewHolovak(holovak);
  } catch (error) {
    alert(`Սխալ՝ ${error.message}`);
  }
}

let currentHolovak = null;

function viewHolovak(holovak) {
  currentHolovak = holovak;
  document.getElementById("video-display").style.display = "block";
  document.getElementById("video-title-display").textContent = holovak.title;
  document.getElementById("video-description-display").textContent =
    holovak.description;

  const thumbnailImg = document.getElementById("thumbnail-image");
  if (!holovak.thumbnailURL) {
    thumbnailImg.style.display = "none";
  } else {
    thumbnailImg.style.display = "block";
    thumbnailImg.src = holovak.thumbnailURL;
  }

  const videoPlayer = document.getElementById("video-player");
  if (videoPlayer) {
    if (!holovak.videoURL) {
      videoPlayer.style.display = "none";
    } else {
      videoPlayer.style.display = "block";
      videoPlayer.src = holovak.videoURL;
      videoPlayer.load();
    }
  }
}

async function deleteHolovak() {
  if (!currentHolovak) {
    alert("Ջնջելու համար հոլովակ ընտրված չէ։");
    return;
  }

  try {
    const res = await fetch(`/api/holovakner/${currentHolovak.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!res.ok) {
      throw new Error("Չստացվեց ջնջել հոլովակը։");
    }
    alert("Հոլովակը հաջողությամբ ջնջվեց։");
    document.getElementById("video-display").style.display = "none";
    await getHolovakner();
  } catch (error) {
    alert(`Սխալ՝ ${error.message}`);
  }
}

document.getElementById("signup-button").addEventListener("click", signup);
document.getElementById("logout-button").addEventListener("click", logout);
document
  .getElementById("thumbnail-upload-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    await uploadThumbnail(currentHolovak?.id);
  });

document
  .getElementById("video-file-upload-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    await uploadVideoFile(currentHolovak?.id);
  });
document.getElementById("delete-holovak").addEventListener("click", deleteHolovak);
