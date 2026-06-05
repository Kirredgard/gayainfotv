# Mise en ligne GitHub + Supabase

## 1. Créer le projet Supabase
1. Va dans Supabase et crée un nouveau projet.
2. Dans **SQL Editor**, colle puis exécute le contenu du fichier `supabase-schema.sql`.
3. Dans **Authentication > Users**, crée ton compte administrateur avec une adresse e-mail et un mot de passe.

## 2. Configurer le site
Ouvre `supabase-config.js` et remplace :

```js
const GAYA_SUPABASE_URL = "https://TON-PROJET.supabase.co";
const GAYA_SUPABASE_ANON_KEY = "REMPLACE_PAR_TA_CLE_ANON_PUBLIC";
```

par les valeurs de **Project Settings > API** dans Supabase.

## 3. Connexion admin
La page `admin.html` utilise maintenant Supabase Auth.

Utilise l'adresse e-mail et le mot de passe créés dans Supabase.
Les anciens mots de passe en dur ont été retirés du code.

## 4. GitHub
Tu peux envoyer ce dossier sur GitHub. Conseil : commence avec un dépôt privé.

## 5. Hébergement
Pour un site statique : GitHub Pages, Netlify ou Vercel fonctionnent.
Après déploiement, vérifie :
- `index.html` charge les contenus ;
- `admin.html` permet la connexion ;
- un enregistrement depuis l'admin met bien à jour le site.
