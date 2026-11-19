/* =========================================================
   AIMS Research Lab: theme bootstrap
   Loaded synchronously in <head> so the right theme is applied
   before first paint (no flash). The toggle lives in main.js.
   Saved choice → localStorage "aims-theme"; otherwise follow the OS.
   ========================================================= */
(function () {
  var t;
  try { t = localStorage.getItem("aims-theme"); } catch (e) {}
  if (t !== "light" && t !== "dark") {
    t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", t);
})();
