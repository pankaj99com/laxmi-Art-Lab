const STORAGE_KEY = "laxmiArtsLabData";
const supabaseClient = typeof createSupabaseClient === "function" ? createSupabaseClient() : null;

const defaultPaintings = [
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
];

const defaultClasses = [
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
];

function loadSiteData() {
  try {
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (savedData?.paintings && savedData?.classes) return savedData;
  } catch (error) {
    console.warn("Could not load saved site data", error);
  }

  return {
    paintings: defaultPaintings,
    classes: defaultClasses,
  };
}

const siteData = loadSiteData();
const paintings = siteData.paintings;
const classes = siteData.classes;

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const paintingGrid = document.querySelector("#paintingGrid");
const classGrid = document.querySelector("#classGrid");
const classSelect = document.querySelector("#classSelect");
const purchaseModal = document.querySelector("#purchaseModal");
const classModal = document.querySelector("#classModal");
const toast = document.querySelector("#toast");
const leafField = document.querySelector("#leafField");
const contactStatus = document.querySelector("#contactStatus");
const purchaseStatus = document.querySelector("#purchaseStatus");
const classStatus = document.querySelector("#classStatus");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3600);
}

function setFormStatus(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function getCurrentPage() {
  return {
    title: document.title,
    url: window.location.href,
    path: window.location.pathname,
  };
}

async function saveFormSubmission(formType, payload) {
  if (!supabaseClient) {
    throw new Error("Add your Supabase URL and publishable key in supabase-config.js.");
  }

  const { error } = await supabaseClient.from("form_submissions").insert({
    form_type: formType,
    payload,
    page: getCurrentPage(),
    user_agent: navigator.userAgent,
  });

  if (error) throw error;
}

function checkout(type, item, customer) {
  console.info("Payment integration payload", { type, item, customer });
  showToast(`Saved ${item.title || item.name}. Connect a payment provider for live checkout.`);
}

function renderMapleLeaves() {
  const palettes = [
    ["#d76a35", "#a84224", "#f0b34f"],
    ["#b84f2c", "#7b3321", "#d99a35"],
    ["#d9a536", "#a45a24", "#7f8b45"],
    ["#c5522d", "#743b2c", "#e6b457"],
  ];

  leafField.innerHTML = Array.from({ length: 24 }, (_, index) => {
    const colors = palettes[index % palettes.length];
    const size = 24 + (index % 6) * 7;
    const duration = 9 + (index % 7) * 1.7;
    const delay = -index * 0.8;
    const x = (index * 13 + 5) % 96;
    const drift = 28 + (index % 5) * 18;
    const rotate = -80 + index * 31;
    const opacity = 0.5 + (index % 5) * 0.08;

    return `
      <span
        class="maple-leaf"
        style="
          --x:${x}vw;
          --size:${size}px;
          --duration:${duration}s;
          --sway-duration:${3.2 + (index % 4) * 0.8}s;
          --delay:${delay}s;
          --drift:${drift}px;
          --rotate:${rotate}deg;
          --opacity:${opacity};
          --leaf-a:${colors[0]};
          --leaf-b:${colors[1]};
          --leaf-c:${colors[2]};
        "
      ></span>
    `;
  }).join("");
}

function setupRevealAnimation() {
  const sections = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  sections.forEach((section) => observer.observe(section));
}

function renderPaintings(filter = "all") {
  const visiblePaintings =
    filter === "all" ? paintings : paintings.filter((painting) => painting.category === filter);

  paintingGrid.innerHTML = visiblePaintings
    .map(
      (painting) => `
        <article class="painting-card">
          <div
            class="painting-image ${painting.image ? "has-photo" : ""}"
            style="--art-bg:${painting.colors[0]};--art-accent:${painting.colors[1]};${painting.image ? `background-image:url('${painting.image}');` : ""}"
          ></div>
          <div class="painting-body">
            <div class="card-top">
              <div>
                <span class="tag">${painting.category}</span>
                <h3>${painting.title}</h3>
              </div>
              <span class="price">${currency.format(painting.price)}</span>
            </div>
            <p>${painting.medium} - ${painting.size}</p>
            <div class="card-actions">
              <button class="button" type="button" data-buy="${painting.id}" ${painting.available ? "" : "disabled"}>
                ${painting.available ? "Buy Painting" : "Sold"}
              </button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderClasses() {
  classGrid.innerHTML = classes
    .map(
      (artClass) => `
        <article class="class-card">
          <span class="tag">${artClass.age}</span>
          <h3>${artClass.name}</h3>
          <p>${artClass.description}</p>
          <p><strong>${artClass.schedule}</strong> - ${currency.format(artClass.price)} / month</p>
          <button class="button" type="button" data-register="${artClass.id}">Register</button>
        </article>
      `,
    )
    .join("");

  classSelect.innerHTML = classes
    .map((artClass) => `<option value="${artClass.id}">${artClass.name} - ${currency.format(artClass.price)}</option>`)
    .join("");
}

function openPurchaseModal(paintingId) {
  const painting = paintings.find((item) => item.id === paintingId);
  if (!painting) return;

  document.querySelector("#purchaseTitle").textContent = painting.title;
  document.querySelector("#purchaseMeta").textContent =
    `${painting.medium} - ${painting.size} - ${currency.format(painting.price)}`;
  purchaseModal.dataset.paintingId = paintingId;
  purchaseModal.showModal();
}

function openClassModal(classId) {
  if (classId) classSelect.value = classId;
  classModal.showModal();
}

document.querySelector(".nav-toggle").addEventListener("click", (event) => {
  const links = document.querySelector("#navLinks");
  const isOpen = links.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

document.querySelector("#navLinks").addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    document.querySelector("#navLinks").classList.remove("open");
    document.querySelector(".nav-toggle").setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll("[data-open-modal='class']").forEach((button) => {
  button.addEventListener("click", () => openClassModal());
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

document.querySelector(".filter-row").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  document.querySelectorAll("[data-filter]").forEach((chip) => chip.classList.remove("active"));
  button.classList.add("active");
  renderPaintings(button.dataset.filter);
});

paintingGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy]");
  if (button) openPurchaseModal(button.dataset.buy);
});

classGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-register]");
  if (button) openClassModal(button.dataset.register);
});

document.querySelector("#purchaseForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const painting = paintings.find((item) => item.id === purchaseModal.dataset.paintingId);
  const customer = Object.fromEntries(formData.entries());

  setFormStatus(purchaseStatus, "Saving purchase interest...");

  try {
    await saveFormSubmission("painting_purchase", { painting, customer });
    checkout("painting", painting, customer);
    purchaseModal.close();
    form.reset();
    setFormStatus(purchaseStatus, "");
  } catch (error) {
    console.error("Could not save purchase interest", error);
    setFormStatus(purchaseStatus, error.message, true);
  }
});

document.querySelector("#classForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const registration = Object.fromEntries(formData.entries());
  const age = Number(registration.age);

  if (age < 5) {
    showToast("Class registration is open from age 5.");
    return;
  }

  const selectedClass = classes.find((item) => item.id === registration.classType);
  setFormStatus(classStatus, "Saving class registration...");

  try {
    await saveFormSubmission("class_registration", { class: selectedClass, registration });
    checkout("class", selectedClass, registration);
    classModal.close();
    form.reset();
    setFormStatus(classStatus, "Registrations start from age 5.");
  } catch (error) {
    console.error("Could not save class registration", error);
    setFormStatus(classStatus, error.message, true);
  }
});

document.querySelector("#contactForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = Object.fromEntries(new FormData(form).entries());
  setFormStatus(contactStatus, "Sending message...");

  try {
    await saveFormSubmission("contact_message", { message });
    setFormStatus(contactStatus, "Thanks. Your message has been saved.");
    form.reset();
  } catch (error) {
    console.error("Could not save contact message", error);
    setFormStatus(contactStatus, error.message, true);
  }
});

renderPaintings();
renderClasses();
renderMapleLeaves();
setupRevealAnimation();
