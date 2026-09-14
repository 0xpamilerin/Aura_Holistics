document.addEventListener("DOMContentLoaded", () => {

  /* ── mobile nav ── */
  const menu = document.querySelector(".menu-btn");
  const links = document.querySelector(".nav-links");
  const nav = document.querySelector(".nav");

  if (menu && links) {
    menu.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      menu.innerHTML = isOpen ? "&#x2715;" : "&#9776;";
      menu.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (nav) {
        if (isOpen) {
          nav.classList.add("menu-open");
        } else {
          nav.classList.remove("menu-open");
        }
      }
    });
  }

  /* close nav when a link is clicked (excluding dropdown toggle) */
  document.querySelectorAll(".nav-links a:not(.dropdown-toggle)").forEach(a => {
    a.addEventListener("click", () => {
      if (links) links.classList.remove("open");
      if (nav) nav.classList.remove("menu-open");
      if (menu) {
        menu.innerHTML = "&#9776;";
        menu.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ── dropdown toggle on mobile ── */
  document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
    toggle.setAttribute("role", "button");
    toggle.setAttribute("tabindex", "0");
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");

    const toggleHandler = (e) => {
      e.preventDefault();
      const dropdown = toggle.closest(".nav-dropdown");
      if (dropdown) {
        const isActive = dropdown.classList.toggle("active");
        toggle.setAttribute("aria-expanded", isActive ? "true" : "false");
      }
    };

    toggle.addEventListener("click", toggleHandler);
    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        toggleHandler(e);
      }
    });
  });

  /* close nav when clicking outside */
  document.addEventListener("click", (e) => {
    if (links && links.classList.contains("open") && nav && !nav.contains(e.target)) {
      links.classList.remove("open");
      nav.classList.remove("menu-open");
      if (menu) {
        menu.innerHTML = "&#9776;";
        menu.setAttribute("aria-expanded", "false");
      }
    }
  });

  /* ── scroll-aware nav ── */
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── toast notifications (with debounce) ── */
  let toastTimer = null;
  window.showToast = function(message, duration = 3000) {
    const t = document.querySelector(".toast");
    if (!t) return;
    if (toastTimer) clearTimeout(toastTimer);
    t.textContent = message;
    t.style.display = "block";
    toastTimer = setTimeout(() => {
      t.style.display = "none";
      toastTimer = null;
    }, duration);
  };

  document.querySelectorAll("[data-toast]").forEach(btn => {
    btn.addEventListener("click", e => {
      window.showToast(btn.dataset.toast);
      if (btn.tagName === "A" && btn.getAttribute("href") === "#") {
        e.preventDefault();
      }
    });
  });

  /* ── FAQ accordion ── */
  document.querySelectorAll(".faq button").forEach(btn => {
    const faqItem = btn.closest(".faq");
    const isOpen = faqItem && faqItem.classList.contains("open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");

    btn.addEventListener("click", () => {
      if (!faqItem) return;
      const opened = faqItem.classList.toggle("open");
      btn.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  });

  /* ── catalogue filter & instant search ── */
  const filterBtns = document.querySelectorAll(".filter");
  const searchInput = document.querySelector("#catalogueSearch");
  const productCards = document.querySelectorAll("[data-product]");
  const emptyState = document.querySelector("#catalogueEmpty");

  let activeCategory = "all";
  let activeSearchTerm = "";

  function applyCatalogueFilters() {
    let visibleCount = 0;
    productCards.forEach(card => {
      const prodCategory = card.dataset.product || "";
      const textContent = card.innerText.toLowerCase();

      const matchesCat = (activeCategory === "all" || prodCategory === activeCategory);
      const matchesSearch = (!activeSearchTerm || textContent.includes(activeSearchTerm));

      if (matchesCat && matchesSearch) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCategory = btn.dataset.category || "all";
        applyCatalogueFilters();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeSearchTerm = e.target.value.trim().toLowerCase();
      applyCatalogueFilters();
    });
  }

  /* ── time slot picker ── */
  const timeInput = document.querySelector("#selectedTime");
  document.querySelectorAll(".time").forEach(timeBtn => {
    timeBtn.addEventListener("click", () => {
      document.querySelectorAll(".time").forEach(x => x.classList.remove("selected"));
      timeBtn.classList.add("selected");
      if (timeInput) {
        timeInput.value = timeBtn.dataset.time || timeBtn.textContent.trim();
      }
    });
  });

  /* ── appointment date min constraint (today) ── */
  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  /* ── auto pre-select treatment from URL query (?service=...) ── */
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get("service");
  const serviceSelect = document.querySelector('select[name="treatment"], #treatmentSelect');

  if (serviceParam && serviceSelect) {
    const cleanService = serviceParam.trim().toLowerCase();
    for (const opt of serviceSelect.options) {
      if (opt.text.toLowerCase().includes(cleanService) || opt.value.toLowerCase().includes(cleanService)) {
        opt.selected = true;
        break;
      }
    }
  }

  /* ── appointment multi-step navigation & submission ── */
  const bookingForm = document.querySelector("#appointment-form") || document.querySelector("#demo-form");
  const steps = document.querySelectorAll(".booking-step");
  const confirmationPanel = document.querySelector("#bookingConfirmation");

  if (bookingForm && confirmationPanel) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Collect summary details
      const treatmentVal = (serviceSelect && serviceSelect.options[serviceSelect.selectedIndex]?.text) || "Consultation";
      const dateVal = (dateInput && dateInput.value) || "To be scheduled";
      const timeVal = (timeInput && timeInput.value) || (document.querySelector(".time.selected")?.textContent.trim()) || "09:00 AM";
      const nameVal = document.querySelector('input[name="fullname"]')?.value || "Valued Client";
      const phoneVal = document.querySelector('input[name="phone"]')?.value || "Provided";
      const emailVal = document.querySelector('input[name="email"]')?.value || "Provided";

      // Populate confirmation table
      const elTreatment = document.querySelector("#confirmTreatment");
      const elDateTime = document.querySelector("#confirmDateTime");
      const elClient = document.querySelector("#confirmClient");
      const elContact = document.querySelector("#confirmContact");

      if (elTreatment) elTreatment.textContent = treatmentVal;
      if (elDateTime) elDateTime.textContent = `${dateVal} at ${timeVal}`;
      if (elClient) elClient.textContent = nameVal;
      if (elContact) elContact.textContent = `${emailVal} · ${phoneVal}`;

      // Switch view to confirmation
      bookingForm.style.display = "none";
      confirmationPanel.style.display = "block";

      // Mark all steps up to confirmation active/completed
      steps.forEach((s, idx) => {
        s.classList.remove("active");
        if (idx === 3) s.classList.add("active");
        else s.classList.add("completed");
      });

      window.showToast("Appointment request received! We will confirm via email/phone.");
    });
  } else if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      window.showToast("Demo submission received — connect your backend here.");
      bookingForm.reset();
    });
  }

  /* ── contact form submission ── */
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      window.showToast("Thank you! Your message has been sent to our Ibadan clinic team.");
      contactForm.reset();
    });
  }

  /* ── dynamic product detail page (?name=...&cat=...&price=...) ── */
  const prodNameParam = urlParams.get("name") || urlParams.get("product");
  if (prodNameParam) {
    const pageTitle = document.querySelector("#productPageTitle");
    const heroTitle = document.querySelector("#productHeroTitle");
    const cardTitle = document.querySelector("#productCardTitle");
    const visual = document.querySelector("#productVisual");
    const priceTag = document.querySelector("#productPrice");
    const eyebrow = document.querySelector("#productCategory");

    const decodedName = decodeURIComponent(prodNameParam);
    const decodedPrice = urlParams.get("price") ? decodeURIComponent(urlParams.get("price")) : "₦0";
    const decodedCat = urlParams.get("cat") ? decodeURIComponent(urlParams.get("cat")) : "Herbal Product";

    if (pageTitle) pageTitle.textContent = `${decodedName} | Aura Holistic`;
    if (heroTitle) heroTitle.textContent = decodedName;
    if (cardTitle) cardTitle.textContent = decodedName;
    if (visual) visual.textContent = decodedName.toUpperCase();
    if (priceTag) priceTag.textContent = decodedPrice;
    if (eyebrow) eyebrow.textContent = decodedCat.toUpperCase();
  }

  /* ── keyboard modal dismiss (Escape key) ── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (typeof window.closeResearchModal === "function") window.closeResearchModal();
      if (typeof window.closeVideoModal === "function") window.closeVideoModal();
    }
  });

});

/* ── Research Modal Handlers ── */
window.openResearchModal = function (title) {
  const modal = document.getElementById("researchModal");
  const titleEl = document.getElementById("modalTitle");
  const pdfViewer = document.getElementById("pdfViewer");

  if (titleEl) titleEl.innerText = title;
  if (pdfViewer) pdfViewer.src = "assets/dummy-research.pdf";
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

window.closeResearchModal = function (event) {
  if (event && event.target.closest(".modal-content") && !event.target.classList.contains("modal-close")) {
    return;
  }
  const modal = document.getElementById("researchModal");
  const pdfViewer = document.getElementById("pdfViewer");

  if (pdfViewer) pdfViewer.src = "";
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
};

/* ── Video Modal Handlers (Patient Stories) ── */
window.openVideoModal = function (videoSrc, title) {
  const modal = document.getElementById("videoModal");
  const videoEl = document.getElementById("videoPlayerTag");
  const titleEl = document.getElementById("videoModalTitle");

  if (titleEl) titleEl.innerText = title || "Patient Story";
  if (videoEl) {
    videoEl.src = videoSrc;
    videoEl.load();
    videoEl.play().catch(() => {});
  }
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

window.closeVideoModal = function (event) {
  if (event && event.target.closest(".modal-content") && !event.target.classList.contains("modal-close") && !event.target.classList.contains("close-btn")) {
    return;
  }
  const modal = document.getElementById("videoModal");
  const videoEl = document.getElementById("videoPlayerTag");

  if (videoEl) {
    videoEl.pause();
    videoEl.src = "";
  }
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
};
