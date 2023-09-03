# Rave

Le but de ce projet est de réaliser une application de transfert de timbre en ReactNative. Le transfert de timbre sera réalisé par un réseau de neurones, le modèle RAVE développé par Antoine Caillon à l’ircam. 
Vous pouvez trouvez une démonstration très similaire à cette application à l’adresse suivante : https://caillonantoine.github.io/ravejs/. 

Puisqu’il est difficile de faire réaliser les calculs du modèle au téléphone directement, un serveur python sera mis en place pour la partie calcul et renverra les clips audio transformés. 
En résumé l’application permettra :
De se connecter au serveur
D’enregistrer et de sauvegarder des clips avec le micro du téléphone
D’envoyer ces clips et d’écouter / sauver le résultat sur le téléphone