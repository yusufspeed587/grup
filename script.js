// MENU NAVIGASI MOBILE
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");

  menuToggle.textContent =
    navMenu.classList.contains("active") ? "✕" : "☰";
});

// TUTUP MENU SETELAH LINK DIKLIK
document.querySelectorAll("#navMenu a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    menuToggle.textContent = "☰";
  });
});

// ANIMASI SAAT SCROLL
const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15
});

revealElements.forEach(element => {
  observer.observe(element);
});

// TOMBOL KEMBALI KE ATAS
const backTop = document.getElementById("backTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 350) {
    backTop.classList.add("show");
  } else {
    backTop.classList.remove("show");
  }
});

// TAHUN OTOMATIS
document.getElementById("year").textContent =
  new Date().getFullYear();

// FORMULIR KONTAK
const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !subject || !message) {
    alert("Mohon lengkapi semua data!");
    return;
  }

  // Ganti dengan alamat email resmi SPEED GRUP.
  const contactEmail = "emailanda@example.com";

  const body = `
Nama: ${name}
Email: ${email}

Pesan:
${message}
  `;

  const mailto =
    `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailto;
});