import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT : remplace "matrice-eisenhower" ci-dessous par le nom EXACT
// de ton dépôt GitHub, sinon les fichiers CSS/JS ne se chargeront pas
// une fois déployés sur GitHub Pages.
// Exemple : si ton dépôt est https://github.com/tonpseudo/mes-priorites
// alors base doit être "/mes-priorites/"
export default defineConfig({
  plugins: [react()],
  base: "/matrice-eisenhower/",
});
