document.addEventListener("DOMContentLoaded", () => {
  const navContainer = document.getElementById("nav-insert");

  if (!navContainer) return;

  const navbarHTML = `
    <header>
      <div class="nav-container">
        <a href="index.html" class="logo">THE WILDMAN SHOW</a>
        <nav>
          <a href="/index.html" class="nav-link">HOME</a>
          <a href="/functions/booking/booking.html" class="nav-link">BOOKING</a>
        </nav>
      </div>
    </header>
  `;

  navContainer.innerHTML = navbarHTML;
});
