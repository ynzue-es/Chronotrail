# Chronotrail ⛰️

> Ton chrono de trail, avant la course.

Chronotrail est une web app gratuite et open-source qui prédit ton temps de course sur trail à partir d'un fichier GPX. Upload ton parcours, renseigne ton allure de référence sur plat, et obtiens une prédiction de temps avec un plan de splits détaillé.

## Comment ça marche

Chronotrail utilise le modèle **km-effort** (popularisé par l'UTMB) : chaque 100 m de dénivelé positif équivaut à 1 km de plat. Un trail de 20 km avec 800 m D+ correspond donc à 28 km-effort. Multiplié par ton allure de référence, ça donne ton temps prédit.

Simple, explicable, sans boîte noire.

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS** + **shadcn/ui**
- **Phosphor Icons**
- Parsing GPX côté client, zéro backend pour la V1

## Roadmap

- [x] V1 : Upload GPX + km-effort + splits
- [ ] Carte interactive + profil altimétrique
- [ ] Connexion Strava pour calibration auto
- [ ] Modèle personnalisé basé sur l'historique
