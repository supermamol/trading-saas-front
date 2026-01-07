const STORAGE_KEY = "ui-theme";

function applyTheme(theme) {
  document.body.classList.toggle("theme-dark", theme === "dark");
  document.body.classList.toggle("theme-light", theme === "light");
  localStorage.setItem(STORAGE_KEY, theme);
}

// init
const saved = localStorage.getItem(STORAGE_KEY) || "dark";
applyTheme(saved);

// écoute des événements venant de la toolbar
document.addEventListener("toggle-theme", () => {
  const isDark = document.body.classList.contains("theme-dark");
  applyTheme(isDark ? "light" : "dark");
});
