const STORAGE_KEY = "laxmiArtsLabData";
const supabaseClient = createSupabaseClient();

const defaultData = {
  paintings: [
    {
      id: "sunset-valley",
      title: "Sunset Valley",
      category: "Landscape",
      medium: "Acrylic on canvas",
      size: "18 x 24 in",
      price: 8500,
      available: true,
      image: "",
      colors: ["#f7b267", "#d95f43"],
    },
    {
      id: "lotus-morning",
      title: "Lotus Morning",
      category: "Floral",
      medium: "Watercolor",
      size: "12 x 16 in",
      price: 5200,
      available: true,
      image: "",
      colors: ["#f7d1cd", "#7d4260"],
    },
    {
      id: "city-rhythm",
      title: "City Rhythm",
      category: "Abstract",
      medium: "Mixed media",
      size: "24 x 30 in",
      price: 12000,
      available: true,
      image: "",
      colors: ["#223843", "#d59a2f"],
    },
    {
      id: "green-horizon",
      title: "Green Horizon",
      category: "Landscape",
      medium: "Oil on canvas",
      size: "20 x 30 in",
      price: 9800,
      available: false,
      image: "",
      colors: ["#0d7c83", "#f0c987"],
    },
    {
      id: "festival-bloom",
      title: "Festival Bloom",
      category: "Floral",
      medium: "Acrylic on board",
      size: "16 x 20 in",
      price: 6800,
      available: true,
      image: "",
      colors: ["#eb5e55", "#3a7d44"],
    },
    {
      id: "silent-wave",
      title: "Silent Wave",
      category: "Abstract",
      medium: "Texture art",
      size: "18 x 18 in",
      price: 7600,
      available: true,
      image: "",
      colors: ["#4f6d7a", "#e8dab2"],
    },
  ],
  classes: [
    {
      id: "kids-foundation",
      name: "Kids Foundation",
      age: "Age 5-9",
      schedule: "Sat & Sun",
      price: 300,
      description: "Color basics, brush control, fun drawing, and confidence-building art activities.",
    },
    {
      id: "junior-art",
      name: "Junior Art Studio",
      age: "Age 10-15",
      schedule: "Tue & Thu",
      price: 500,
      description: "Sketching, watercolor, acrylic painting, composition, and creative projects.",
    },
    {
      id: "adult-weekend",
      name: "Adult Weekend Batch",
      age: "Age 16+",
      schedule: "Sunday",
      price: 800,
      description: "Relaxed guided painting sessions for beginners, hobby artists, and art lovers.",
    },
  ],
};

let siteData = loadData();
let pendingImageUploads = {};

const loginPanel = document.querySelector("#loginPanel");
const dashboardPanel = document.querySelector("#dashboardPanel");
const loginForm = document.querySelector("#loginForm");
const loginStatus = document.querySelector("#loginStatus");
const classesEditor = document.querySelector("#classesEditor");
const paintingsEditor = document.querySelector("#paintingsEditor");
const toast = document.querySelector("#toast");
const logoutButton = document.querySelector("#logoutButton");
const missingSessionMessages = new Set(["Auth session missing!", "Auth session missing"]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadData() {
  try {
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (savedData?.paintings && savedData?.classes) return savedData;
  } catch (error) {
    console.warn("Could not load saved data", error);
  }

  return clone(defaultData);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function showDashboard() {
  loginPanel.hidden = true;
  dashboardPanel.hidden = false;
  logoutButton.hidden = false;
  renderEditors();
}

function showLogin(message = "") {
  loginPanel.hidden = false;
  dashboardPanel.hidden = true;
  logoutButton.hidden = true;
  loginStatus.textContent = missingSessionMessages.has(message) ? "" : message;
}

async function requireLogin() {
  if (!supabaseClient) {
    showLogin("Add your Supabase URL and publishable key in supabase-config.js.");
    return;
  }

  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error) {
    showLogin(missingSessionMessages.has(error.message) ? "" : error.message);
    return;
  }

  if (user) {
    showDashboard();
    return;
  }

  showLogin();
}

function renderEditors() {
  classesEditor.innerHTML = siteData.classes
    .map(
      (artClass) => `
        <article class="admin-card">
          <h3>${artClass.name}</h3>
          <label>Name<input data-class="${artClass.id}" data-field="name" value="${artClass.name}" /></label>
          <label>Age group<input data-class="${artClass.id}" data-field="age" value="${artClass.age}" /></label>
          <label>Schedule<input data-class="${artClass.id}" data-field="schedule" value="${artClass.schedule}" /></label>
          <label>Price<input data-class="${artClass.id}" data-field="price" type="number" min="0" value="${artClass.price}" /></label>
          <label>Description<textarea data-class="${artClass.id}" data-field="description" rows="4">${artClass.description}</textarea></label>
        </article>
      `,
    )
    .join("");

  paintingsEditor.innerHTML = siteData.paintings
    .map(
      (painting) => `
        <article class="admin-card">
          <h3>${painting.title}</h3>
          <label>Title<input data-painting="${painting.id}" data-field="title" value="${painting.title}" /></label>
          <label>Category<input data-painting="${painting.id}" data-field="category" value="${painting.category}" /></label>
          <label>Medium<input data-painting="${painting.id}" data-field="medium" value="${painting.medium}" /></label>
          <label>Size<input data-painting="${painting.id}" data-field="size" value="${painting.size}" /></label>
          <label>Price<input data-painting="${painting.id}" data-field="price" type="number" min="0" value="${painting.price}" /></label>
          <div class="admin-image-tools">
            <div
              class="admin-image-preview ${painting.image ? "" : "empty"}"
              data-image-preview="${painting.id}"
              ${painting.image ? `style="background-image:url('${painting.image}')"` : ""}
            ></div>
            ${
              painting.image
                ? `<p class="form-note">Remove the current image before uploading a new one.</p>
                   <button class="button button-ghost" type="button" data-remove-image="${painting.id}">Remove Current Image</button>`
                : `<label class="admin-upload-control">
                     <span>Browse Image From Computer</span>
                     <input data-image-upload="${painting.id}" type="file" accept="image/*" />
                   </label>
                   <p class="form-note" data-upload-note="${painting.id}">Choose a painting photo from your system, then click Save Painting.</p>
                   <label>Image URL<input data-painting="${painting.id}" data-field="image" type="url" value="" placeholder="https://..." /></label>`
            }
          </div>
          <label class="admin-check"><input data-painting="${painting.id}" data-field="available" type="checkbox" ${painting.available ? "checked" : ""} /> Available for sale</label>
          <div class="admin-save-row">
            <button class="button" type="button" data-save-painting="${painting.id}">Save Painting</button>
            <button class="button button-ghost" type="button" data-remove-painting="${painting.id}">Remove</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function updateClass(event) {
  const input = event.target.closest("[data-class]");
  if (!input) return;

  const artClass = siteData.classes.find((item) => item.id === input.dataset.class);
  if (!artClass) return;

  artClass[input.dataset.field] = input.dataset.field === "price" ? Number(input.value) : input.value;
  saveData();
  showToast("Class updated. Refresh the website to see it.");
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not load image file."));
      image.onload = () => {
        const maxSize = 1400;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function getPaintingCard(button) {
  return button.closest(".admin-card");
}

function savePaintingFromCard(button) {
  const card = getPaintingCard(button);
  const paintingId = button.dataset.savePainting;
  const painting = siteData.paintings.find((item) => item.id === paintingId);
  if (!card || !painting) return;

  card.querySelectorAll("[data-painting]").forEach((input) => {
    if (input.dataset.field === "price") {
      painting.price = Number(input.value);
    } else if (input.dataset.field === "available") {
      painting.available = input.checked;
    } else if (input.dataset.field === "image") {
      painting.image = pendingImageUploads[paintingId] || input.value.trim();
    } else {
      painting[input.dataset.field] = input.value;
    }
  });

  if (pendingImageUploads[paintingId]) {
    painting.image = pendingImageUploads[paintingId];
    delete pendingImageUploads[paintingId];
  }

  saveData();
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: JSON.stringify(siteData) }));
  renderEditors();
  showToast("Painting saved. Open the website to see the image.");
}

async function handleImageUpload(input) {
  const paintingId = input.dataset.imageUpload;
  const file = input.files?.[0];
  if (!file) return;

  const preview = document.querySelector(`[data-image-preview="${paintingId}"]`);
  const note = document.querySelector(`[data-upload-note="${paintingId}"]`);
  if (note) note.textContent = "Preparing image preview...";

  try {
    const imageData = await resizeImageFile(file);
    pendingImageUploads[paintingId] = imageData;

    if (preview) {
      preview.classList.remove("empty");
      preview.style.backgroundImage = `url('${imageData}')`;
    }

    if (note) note.textContent = `${file.name} is ready. Click Save Painting to publish it.`;
  } catch (error) {
    if (note) note.textContent = error.message;
  }
}

loginForm.addEventListener("input", () => {
  loginStatus.textContent = "";
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!supabaseClient) {
    showLogin("Add your Supabase URL and publishable key in supabase-config.js.");
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  loginStatus.textContent = "Signing in...";

  supabaseClient.auth
    .signInWithPassword({
      email,
      password,
    })
    .then(({ error }) => {
      if (error) {
        loginStatus.textContent =
          "Login failed. Use an existing Supabase Auth email user and password.";
        return;
      }

      form.reset();
      showDashboard();
    });
});

classesEditor.addEventListener("input", updateClass);

paintingsEditor.addEventListener("change", (event) => {
  const upload = event.target.closest("[data-image-upload]");
  if (upload) handleImageUpload(upload);
});

paintingsEditor.addEventListener("click", (event) => {
  const saveButton = event.target.closest("[data-save-painting]");
  if (saveButton) {
    savePaintingFromCard(saveButton);
    return;
  }

  const removeImageButton = event.target.closest("[data-remove-image]");
  if (removeImageButton) {
    const painting = siteData.paintings.find((item) => item.id === removeImageButton.dataset.removeImage);
    if (!painting) return;

    if (!window.confirm("Remove the current image before uploading a new one?")) return;

    painting.image = "";
    delete pendingImageUploads[painting.id];
    saveData();
    renderEditors();
    showToast("Current image removed. You can upload a new one now.");
    return;
  }

  const button = event.target.closest("[data-remove-painting]");
  if (!button) return;

  siteData.paintings = siteData.paintings.filter((painting) => painting.id !== button.dataset.removePainting);
  saveData();
  renderEditors();
  showToast("Painting removed.");
});

document.querySelector("#addPaintingButton").addEventListener("click", () => {
  const id = `painting-${Date.now()}`;
  siteData.paintings.push({
    id,
    title: "New Painting",
    category: "Abstract",
    medium: "Acrylic on canvas",
    size: "12 x 16 in",
    price: 1000,
    available: true,
    image: "",
    colors: ["#c5522d", "#d39a35"],
  });
  saveData();
  renderEditors();
  showToast("New painting added.");
});

document.querySelector("#resetButton").addEventListener("click", () => {
  siteData = clone(defaultData);
  saveData();
  renderEditors();
  showToast("Demo data restored.");
});

logoutButton.addEventListener("click", async () => {
  if (supabaseClient) await supabaseClient.auth.signOut();
  showLogin();
});

requireLogin();

if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session) {
      showDashboard();
      return;
    }

    showLogin();
  });
}
