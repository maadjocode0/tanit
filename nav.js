function setupNavDropdown() {
  const dropdown = document.querySelector(".nav-dropdown");
  const toggle = document.getElementById("navToggle");
  if (!dropdown || !toggle) return;

  function setOpen(open) {
    dropdown.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!dropdown.classList.contains("open"));
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

document.addEventListener("DOMContentLoaded", setupNavDropdown);
