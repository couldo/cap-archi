# CAP-ARCHI v4 — PWA hybride adaptative

## Installation GitHub Pages

Importer **le contenu** de ce dossier à la racine du dépôt public `cap-archi`, puis activer Settings > Pages > Deploy from a branch > main / (root). Ouvrir dans Safari puis Partager > Sur l’écran d’accueil.

## Fonctionnement

- **Règles locales** : fonctionnent après la mise en cache de la PWA, sans réseau. Dix scénarios et diagnostic fondés sur le support de formation Communication et relations interpersonnelles (pages 4–17), plus CAP-ARCHI.
- **Hybride expérimental** : après action explicite de l’utilisateur, charge WebLLM via CDN, sélectionne un petit modèle annoncé par sa configuration, puis télécharge les poids du modèle. Les réponses sont calculées localement via WebGPU, si le navigateur et la mémoire le permettent.
- Les fichiers du modèle **ne sont pas inclus dans le ZIP** : ils peuvent peser des centaines de Mo voire plus. L’application n’offre pas de garantie de compatibilité avec Safari sur iPhone 13 ou iPhone 17. Le cache navigateur peut être évincé.
- Aucun texte n’est envoyé par le code à un service d’inférence. Les bibliothèques et modèles sont toutefois téléchargés depuis des serveurs tiers. Vérifier l’usage avec les politiques de sécurité de l’organisation.
- Les résultats génératifs ne sont **pas fiables sans relecture** : ils peuvent inventer ou modifier des éléments malgré les consignes. L’analyse automatique ne couvre que quelques signaux.

## Source et règles

Le support PDF original n’est pas redistribué dans ce dépôt public. Les règles sont reformulées et associées aux pages pertinentes. CAP-ARCHI est une adaptation métier, distincte de la méthode de formation.

## Confidentialité

Les brouillons sont conservés en `localStorage` si l’utilisateur clique sur Enregistrer, sans chiffrement applicatif. Éviter les informations sensibles et ne jamais ajouter de clés API dans GitHub.

## Limites

Le mode IA est une preuve de concept, pas un modèle embarqué prêt à l’emploi sur tous les iPhone. Le téléchargement nécessite Internet. Pour un déploiement totalement autonome, il faudrait packager et tester un modèle compatible, vérifier les licences et prévoir un stockage adapté.
