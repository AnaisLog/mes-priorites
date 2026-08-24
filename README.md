# Priorités — Matrice d'Eisenhower

Application une-vue : tu notes une tâche, tu coches "important / pas
important" et "urgent / pas urgent", et elle se range automatiquement dans
la bonne case de la matrice d'Eisenhower.

⚠️ L'« identifiant » n'est **pas** un vrai compte sécurisé : c'est juste un
nom qui sert de clé pour ranger tes tâches dans le navigateur (via
`localStorage`). Il n'y a pas de mot de passe, et les données restent
propres à l'appareil/navigateur utilisé — rien n'est envoyé sur un serveur.

## 1. Créer le dépôt GitHub

1. Crée un nouveau dépôt sur GitHub (par exemple `mes-priorites`), vide,
   sans README ni licence.
2. Sur ton ordinateur, dans ce dossier :

```bash
git init
git add .
git commit -m "Première version"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/mes-priorites.git
git push -u origin main
```

## 2. Adapter le chemin de base

Ouvre `vite.config.js` et remplace `"/matrice-eisenhower/"` par
`"/mes-priorites/"` (le nom **exact** de ton dépôt, avec les slashs).
Recommit et repush ce changement si tu l'as fait après le premier push.

## 3. Activer GitHub Pages

1. Dans le dépôt GitHub : **Settings → Pages**.
2. Sous "Build and deployment", choisis **Source : GitHub Actions**.
3. Le workflow (`.github/workflows/deploy.yml`, déjà inclus) se déclenche
   automatiquement à chaque `push` sur `main` et publie le site.
4. Après une minute ou deux, l'URL apparaît en haut de la page Pages,
   du type `https://ton-pseudo.github.io/mes-priorites/`.

## Développer en local (optionnel)

```bash
npm install
npm run dev
```
