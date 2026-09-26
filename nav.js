const globalStylesheet = document.createElement("link");
globalStylesheet.rel = "stylesheet";
globalStylesheet.href = new URL("global.css", document.currentScript.src).href;
document.head.appendChild(globalStylesheet);

document.addEventListener("DOMContentLoaded", () => {
  const navContainer = document.getElementById("nav-insert");

  if (!navContainer) return;

  const navbarHTML = `
    <header>
      <div class="nav-container">
        <a href="index.html" class="logo">THE WILDMAN SHOW</a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
          <span></span>
          <span></span>
          <span></span>
          <span class="sr-only">Toggle navigation</span>
        </button>
        <nav id="site-nav" class="site-nav">
          <a href="/index.html" class="nav-link">HOME</a>
          <a href="/functions/booking/booking.html" class="nav-link">BOOKING</a>
          <a href="/functions/music/music.html" class="nav-link">MUSIC</a>
          <a href="/functions/gallery/gallery.html" class="nav-link">GALLERY</a>
        </nav>
        <div class="nav-actions">
          <button class="nav-action" type="button" aria-label="Account">
            <span class="action-label">ACCOUNT</span>
            <span class="action-short" aria-hidden="true">&#128100;</span>
          </button>
          <button class="nav-action" type="button" aria-label="Cart">
            <span class="action-label">CART</span>
            <span class="action-short" aria-hidden="true">&#128722;</span>
          </button>
        </div>
      </div>
    </header>
  `;

  navContainer.innerHTML = navbarHTML;

  const menuToggle = navContainer.querySelector(".menu-toggle");
  const siteNav = navContainer.querySelector(".site-nav");

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  siteNav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    });
  });
});
