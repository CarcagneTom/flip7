# Flip7

Version web du jeu de cartes Flip 7, réalisée en binôme pour le module Web 3
de ma licence informatique (2025-2026).

## Ce que fait le projet

On peut jouer une partie de Flip 7 dans le navigateur, avec des joueurs humains
ou des IA (niveau facile ou difficile). La partie s'arrête quand un joueur atteint
200 points. Les résultats sont enregistrés dans une base de données MariaDB et une
page affiche les statistiques des parties.

## Lancer le projet

Il faut un serveur Apache avec PHP (extension mysqli) et une base MariaDB.
J'utilisais l'environnement Docker fourni en cours, qui n'est pas inclus ici.

1. Copier `php/config.example.php` en `php/config.php` et y mettre les identifiants
   de la base.
2. Créer la base de données et les tables utilisées dans `php/stats.php`.
3. Placer le dossier dans la racine du serveur web et ouvrir `index.html`.

Le logo officiel du jeu n'est pas inclus, il est remplacé par un titre.

## Répartition du travail

Projet réalisé avec Pierre Fey-Hoareau.

- Moi : le moteur de jeu en JavaScript (classes `Game`, `Deck`, `Card`, `Player`),
  les deux IA, la gestion de l'interface (`UIManager`), l'enregistrement des parties
  dans la base de données (`php/stats.php` et l'appel depuis le JavaScript)
  et le mode sombre.
- Pierre : la structure HTML et la base du CSS, la page de statistiques
  (calcul et affichage des statistiques des joueurs) et la suppression
  des joueurs dans l'écran de configuration.

Le développement a été fait sur le GitLab de l'université ; ce dépôt contient
la version finale.
