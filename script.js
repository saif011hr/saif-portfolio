(() => {
  "use strict";

  const root = document.documentElement;
  const profile = window.SAIF_PROFILE || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  root.classList.add("js-ready", "is-loading");

  document.querySelectorAll("[data-profile]").forEach((element) => {
    const value = profile[element.dataset.profile];
    if (typeof value === "string") element.textContent = value;
  });

  document.querySelectorAll("[data-profile-href]").forEach((element) => {
    const value = profile[element.dataset.profileHref];
    if (typeof value === "string") element.href = value;
  });

  document.querySelectorAll("[data-profile-image]").forEach((image) => {
    const media = profile.media?.[image.dataset.profileImage];
    if (!media) return;
    image.src = media.available ? media.path : media.placeholder;
    if (media.available) {
      image.closest("figure")?.querySelector(".portrait-stamp")?.setAttribute("hidden", "");
    }
  });

  const loader = document.querySelector(".page-loader");
  const loaderStart = performance.now();
  let loaderComplete = false;

  function finishLoader() {
    if (loaderComplete || !loader) return;
    loaderComplete = true;
    const minimumDuration = reducedMotion.matches ? 0 : 650;
    const delay = Math.max(0, minimumDuration - (performance.now() - loaderStart));
    window.setTimeout(() => {
      loader.classList.add("is-done");
      root.classList.remove("is-loading");
    }, delay);
  }

  if (document.readyState === "complete") finishLoader();
  else window.addEventListener("load", finishLoader, { once: true });
  window.setTimeout(finishLoader, 1800);

  const themeToggle = document.querySelector(".theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themeStorageKey = "saif-portfolio-theme";

  function updateThemeControls() {
    const light = root.dataset.theme === "light";
    themeToggle?.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    if (themeMeta) themeMeta.content = light ? "#f1eee8" : "#0b0d0f";
  }

  try {
    const savedTheme = window.localStorage.getItem(themeStorageKey);
    if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
  } catch {
    // The selected theme still works when storage is unavailable.
  }
  updateThemeControls();

  function toggleTheme() {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    updateThemeControls();
    try {
      window.localStorage.setItem(themeStorageKey, root.dataset.theme);
    } catch {
      // Storage may be disabled by the browser; the current page remains themed.
    }
  }

  themeToggle?.addEventListener("click", toggleTheme);

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-navigation");

  function setMenuOpen(isOpen) {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    navigation.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  }

  menuButton?.addEventListener("click", () => {
    setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
  });
  navigation?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) setMenuOpen(false);
  }, { passive: true });

  document.querySelectorAll("#current-year, #vision-year").forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });

  const progress = document.querySelector(".scroll-progress span");
  let progressQueued = false;

  function updateScrollProgress() {
    if (!progress || progressQueued) return;
    progressQueued = true;
    window.requestAnimationFrame(() => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      const amount = range > 0 ? window.scrollY / range : 0;
      progress.style.transform = `scaleX(${Math.max(0, Math.min(1, amount))})`;
      progressQueued = false;
    });
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress, { passive: true });
  updateScrollProgress();

  const revealElements = document.querySelectorAll(".section-label, .about-copy, .portrait-column, .skill-card, .exploring-panel, .work-heading-row, .project-card, .project-empty, .timeline-item, .exploration-copy, .vision-inner > :not(.section-label), .contact-grid, .contact-bottom");
  revealElements.forEach((element) => element.classList.add("reveal"));

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-skill-filter]").forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
      const category = filterButton.dataset.skillFilter;
      document.querySelectorAll("[data-skill-filter]").forEach((button) => {
        const active = button === filterButton;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      document.querySelectorAll(".skill-card").forEach((card) => {
        card.hidden = category !== "all" && card.dataset.skillGroup !== category;
        if (!card.hidden) card.classList.add("is-visible");
      });
    });
  });

  const projectGrid = document.querySelector("#project-grid");
  const projects = Array.isArray(window.SAIF_PROJECTS) ? window.SAIF_PROJECTS : [];

  function safeWebUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const parsed = new URL(value, window.location.href);
      return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
    } catch {
      return null;
    }
  }

  function createProjectCard(project, index) {
    const article = document.createElement("article");
    article.className = "project-card reveal";
    article.dataset.revealDelay = String(index % 3);

    const visual = document.createElement("div");
    visual.className = "project-visual";
    const number = document.createElement("span");
    number.className = "project-index";
    number.textContent = `${String(index + 1).padStart(2, "0")} / SELECTED WORK`;
    visual.append(number);

    const imageUrl = safeWebUrl(project.image);
    if (typeof project.image === "string" && project.image.trim()) {
      const image = document.createElement("img");
      image.src = imageUrl || project.image;
      image.alt = typeof project.imageAlt === "string" ? project.imageAlt : "Project screenshot";
      image.loading = "lazy";
      image.width = 960;
      image.height = 640;
      visual.append(image);
    } else {
      const monogram = document.createElement("span");
      monogram.className = "project-monogram";
      monogram.setAttribute("aria-hidden", "true");
      monogram.textContent = String(project.title || "S").trim().charAt(0).toUpperCase();
      visual.append(monogram);
    }

    const content = document.createElement("div");
    content.className = "project-content";
    const topLine = document.createElement("div");
    topLine.className = "project-topline";
    const title = document.createElement("h3");
    title.textContent = String(project.title || "Untitled project");
    topLine.append(title);
    content.append(topLine);

    const description = document.createElement("p");
    description.className = "project-description";
    description.textContent = String(project.description || "");
    content.append(description);

    const technologies = Array.isArray(project.technologies) ? project.technologies : [];
    if (technologies.length) {
      const tags = document.createElement("ul");
      tags.className = "project-tech";
      tags.setAttribute("aria-label", "Technologies used");
      technologies.forEach((technology) => {
        const item = document.createElement("li");
        item.textContent = String(technology);
        tags.append(item);
      });
      content.append(tags);
    }

    const links = document.createElement("div");
    links.className = "project-links";
    [["Live demo", project.demoUrl], ["Source code", project.repoUrl]].forEach(([label, url]) => {
      const href = safeWebUrl(url);
      if (!href) return;
      const link = document.createElement("a");
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = label;
      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = " ↗";
      link.append(arrow);
      links.append(link);
    });
    if (links.childElementCount) content.append(links);

    article.append(visual, content);
    return article;
  }

  if (projectGrid) {
    if (projects.length) {
      projects.forEach((project, index) => projectGrid.append(createProjectCard(project, index)));
    } else {
      const empty = document.createElement("div");
      empty.className = "project-empty reveal is-visible";
      const mark = document.createElement("span");
      mark.className = "empty-mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = "S";
      const copy = document.createElement("div");
      copy.className = "project-empty-copy";
      const label = document.createElement("span");
      label.className = "mini-label";
      label.textContent = "A SPACE FOR WHAT’S NEXT";
      const heading = document.createElement("h3");
      heading.textContent = "The next project is taking shape.";
      const detail = document.createElement("p");
      detail.textContent = "I’m building my skills and working toward projects I can share here. In the meantime, my GitHub is the best place to follow along.";
      copy.append(label, heading, detail);
      const link = document.createElement("a");
      link.className = "empty-link";
      link.href = profile.github || "https://github.com/saif011hr";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "GitHub profile ↗";
      empty.append(mark, copy, link);
      projectGrid.append(empty);
    }
  }

  const palette = document.querySelector(".command-dialog");
  const paletteSearch = document.querySelector("#command-search");
  const paletteOpeners = document.querySelectorAll(".command-hint");
  const paletteItems = [...document.querySelectorAll(".command-item")];
  const closePaletteButton = document.querySelector(".dialog-close");

  function openPalette() {
    if (!palette || palette.open) return;
    palette.showModal();
    if (paletteSearch) {
      paletteSearch.value = "";
      paletteItems.forEach((item) => { item.hidden = false; });
      window.setTimeout(() => paletteSearch.focus(), 0);
    }
  }

  function closePalette() {
    if (palette?.open) palette.close();
  }

  paletteOpeners.forEach((button) => button.addEventListener("click", openPalette));
  closePaletteButton?.addEventListener("click", closePalette);
  palette?.addEventListener("click", (event) => {
    if (event.target === palette) closePalette();
  });
  palette?.querySelectorAll("a.command-item").forEach((link) => {
    link.addEventListener("click", closePalette);
  });
  document.querySelector("[data-command-theme]")?.addEventListener("click", () => {
    toggleTheme();
    closePalette();
  });

  paletteSearch?.addEventListener("input", () => {
    const query = paletteSearch.value.trim().toLowerCase();
    paletteItems.forEach((item) => {
      const label = `${item.dataset.commandLabel || ""} ${item.textContent || ""}`.toLowerCase();
      item.hidden = !label.includes(query);
    });
  });

  function visiblePaletteItems() {
    return paletteItems.filter((item) => !item.hidden);
  }

  paletteSearch?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const visible = visiblePaletteItems();
    if (!visible.length) return;
    event.preventDefault();
    const next = event.key === "ArrowDown" ? 0 : visible.length - 1;
    visible[next].focus();
  });

  paletteItems.forEach((item) => {
    item.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const visible = visiblePaletteItems();
      const index = visible.indexOf(item);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const next = visible[(index + direction + visible.length) % visible.length];
      if (!next) return;
      event.preventDefault();
      next.focus();
    });
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (palette?.open) closePalette();
      else openPalette();
    }
    if (event.key === "Escape") setMenuOpen(false);
  });

  if (finePointer.matches && !reducedMotion.matches) {
    const cursor = document.querySelector(".cursor-aura");
    let cursorQueued = false;
    let cursorX = 0;
    let cursorY = 0;
    window.addEventListener("pointermove", (event) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      if (!cursor || cursorQueued) return;
      cursorQueued = true;
      window.requestAnimationFrame(() => {
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        cursor.classList.add("is-visible");
        cursorQueued = false;
      });
    }, { passive: true });
    window.addEventListener("pointerout", (event) => {
      if (!event.relatedTarget) cursor?.classList.remove("is-visible");
    });
    document.querySelectorAll("a, button").forEach((element) => {
      element.addEventListener("pointerenter", () => cursor?.classList.add("is-hovering"));
      element.addEventListener("pointerleave", () => cursor?.classList.remove("is-hovering"));
    });

    const scene = document.querySelector("[data-interactive-scene]");
    const stage = scene?.querySelector(".monogram-stage");
    scene?.addEventListener("pointermove", (event) => {
      const rect = scene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      stage?.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
      stage?.style.setProperty("--tilt-y", `${(x * 8).toFixed(2)}deg`);
    }, { passive: true });
    scene?.addEventListener("pointerleave", () => {
      stage?.style.setProperty("--tilt-x", "0deg");
      stage?.style.setProperty("--tilt-y", "0deg");
    });

    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(950px) rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 2.2).toFixed(2)}deg) translateY(-2px)`;
      }, { passive: true });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }
})();
