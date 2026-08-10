document.addEventListener("DOMContentLoaded", () => {

  /* ── mobile nav ── */
  const menu = document.querySelector(".menu-btn");
  const links = document.querySelector(".nav-links");
  const nav = document.querySelector(".nav");

  if (menu) {
    menu.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      /* Swap hamburger ↔ close icon */
      menu.innerHTML = isOpen ? "&#x2715;" : "&#9776;";
      /* Force solid navbar state when mobile menu is open */
      if (isOpen) {
        nav.classList.add("menu-open");
      } else {
        nav.classList.remove("menu-open");
      }
    });
  }

  /* close nav when a link is clicked (excluding dropdown toggle) */
  document.querySelectorAll(".nav-links a:not(.dropdown-toggle)").forEach(a => {
    a.addEventListener("click", () => {
      links && links.classList.remove("open");
      nav && nav.classList.remove("menu-open");
      if (menu) menu.innerHTML = "&#9776;";
    });
  });

  /* ── dropdown toggle on mobile ── */
  document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const dropdown = toggle.closest(".nav-dropdown");
      if (dropdown) dropdown.classList.toggle("active");
    });
  });

  /* close nav when clicking outside */
  document.addEventListener("click", (e) => {
    if (links && links.classList.contains("open") && !nav.contains(e.target)) {
      links.classList.remove("open");
      nav.classList.remove("menu-open");
      if (menu) menu.innerHTML = "&#9776;";
    }
  });

  /* ── scroll-aware nav ── */
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── toast notifications ── */
  document.querySelectorAll("[data-toast]").forEach(btn => {
    btn.addEventListener("click", e => {
      const t = document.querySelector(".toast");
      if (t) {
        t.textContent = btn.dataset.toast;
        t.style.display = "block";
        setTimeout(() => t.style.display = "none", 2800);
      }
      if (btn.tagName === "A") e.preventDefault();
    });
  });

  /* ── FAQ accordion ── */
  document.querySelectorAll(".faq button").forEach(btn => {
    btn.addEventListener("click", () => btn.closest(".faq").classList.toggle("open"));
  });

  /* ── catalogue filter ── */
  document.querySelectorAll(".filter").forEach(filter => {
    filter.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
      filter.classList.add("active");
      const cat = filter.dataset.category;
      document.querySelectorAll("[data-product]").forEach(card => {
        card.style.display = (!cat || cat === "all" || card.dataset.product === cat) ? "" : "none";
      });
    });
  });

  /* ── time slot picker ── */
  document.querySelectorAll(".time").forEach(time => {
    time.addEventListener("click", () => {
      document.querySelectorAll(".time").forEach(x => x.classList.remove("selected"));
      time.classList.add("selected");
    });
  });

  /* ── demo form intercept ── */
  const form = document.querySelector("#demo-form");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const t = document.querySelector(".toast");
    if (t) {
      t.textContent = "Demo submission received — connect your backend here.";
      t.style.display = "block";
      setTimeout(() => t.style.display = "none", 3000);
    }
    form.reset();
  });

});

// --- Modal logic ---
window.openResearchModal = function (title) {
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('pdfViewer').src = 'assets/dummy-research.pdf';
  document.getElementById('researchModal').classList.add('active');
};

window.closeResearchModal = function (event) {
  if (event && event.target.closest('.modal-content') && !event.target.classList.contains('modal-close')) {
    return;
  }
  document.getElementById('pdfViewer').src = '';
  document.getElementById('researchModal').classList.remove('active');
};
