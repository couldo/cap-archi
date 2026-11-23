CAP-ARCHI PWA iPhone — version 1.0

INSTALLATION SUR IPHONE
1. Décompresser le ZIP sur ordinateur.
2. Déployer le contenu du dossier cap-archi-pwa sur un hébergement HTTPS statique (par exemple GitHub Pages, Netlify ou serveur interne autorisé).
3. Ouvrir l'adresse HTTPS dans Safari sur l'iPhone.
4. Toucher Partager puis « Sur l'écran d'accueil » / « Ajouter à l'écran d'accueil ».
5. Lancer CAP-ARCHI depuis son icône.

IMPORTANT
- Ouvrir index.html directement depuis l'app Fichiers ne permet pas une installation PWA complète : HTTPS est nécessaire pour le service worker.
- L'application propose un diagnostic lexical local et une trame CAP-ARCHI. Elle ne réalise PAS de reformulation IA autonome.
- Pour une reformulation IA, utiliser « Copier la consigne IA » ou « Partager » puis transmettre volontairement le texte à un assistant autorisé.
- Les brouillons sont stockés dans localStorage sur l'appareil, sans chiffrement applicatif. Ne pas stocker d'informations sensibles ou réglementées sans validation de votre organisation.
- Les données ne sont pas envoyées automatiquement vers un serveur.
- L'utilisation hors ligne est disponible après le premier chargement HTTPS réussi.
