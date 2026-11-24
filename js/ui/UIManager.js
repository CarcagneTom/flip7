/**
 * Gère l'affichage de l'interface utilisateur
 * Responsable de la navigation entre les écrans, de l'affichage des joueurs et des popups (choix de cible, messages)
 */
class UIManager {

    /**
     * Masque tous les écrans de l'application.
     * Parcourt tous les éléments ayant la classe "screen" et leur ajoute la classe "hidden"
     */
    hideAllScreens(){
        let screens = document.querySelectorAll(".screen");
        for (let index = 0; index < screens.length; index++) {
            screens[index].classList.add("hidden");
        }
    }

    /**
     * Affiche un écran spécifique en masquant tous les autres.
     * @param {string} id - L'id HTML de l'écran à afficher
     */
    showScreen(id){
        this.hideAllScreens();
        document.getElementById(id).classList.remove("hidden");
    }

    /**
     * Met à jour l'affichage complet de la zone de jeu
     * Informations affichées pour chaque joueur :
     *      - Nom et score total
     *      - Icone coeur si le joueur possède une seconde chance
     *      - Toutes les cartes actuellement en main
     *      - Mise en évidence visuelle du joueur actif 
     *      - Grisage des joueurs inactifs, bust ou arrêtés 
     * @param {Player[]} players - Le tableau de tous les joueurs de la partie
     * @param {number} currentPlayerIndex - L'index du joueur dont c'est le tour
     * @param {number} nbround - Le numéro de la manche en cours
     */
    displayPlayers(players, currentPlayerIndex,nbround) {
        let zone = document.getElementById("players-zone");
        zone.innerHTML = "";

         // Mise à jour des infos de manche et du joueur actif
        document.getElementById("current-round-info").innerHTML = "Manche " + nbround;
        document.getElementById("current-player-info").innerHTML = "Tour de : " + players[currentPlayerIndex].name;

        for (let i = 0; i < players.length; i++) {
            let p = players[i];

            // Création du bloc joueur
            let div = document.createElement("div");
            div.id = "player-" + i;
            div.classList.add("player-card");

            // Mise en évidence du joueur dont c'est le tour
            if (i === currentPlayerIndex) {
                div.classList.add("active-player");
            }

            // Grisage des joueurs qui ne peuvent plus jouer 
            if (!p.isStanding || p.isBust) {
               div.classList.add("player-inactive");
            }

            // Titre : nom + score + icone seconde chance 
            let titre = document.createElement("h3");
            titre.innerHTML = p.name + " - " + p.score + " pts";
            if (p.hasSecondChance) {
                titre.innerHTML += " &#9829;";
            }

            div.appendChild(titre);

            // Affichage de la main du joueur
            let cartes = document.createElement("div");
            cartes.classList.add("player-hand");

            for (let j = 0; j < p.hand.length; j++) {
                let carte = document.createElement("span");
                carte.classList.add("carte");
                carte.innerHTML = p.hand[j].value;
                cartes.appendChild(carte); 
            }

            div.appendChild(cartes); 
            zone.appendChild(div);   
        }
    }

    /**
     * Affiche une popup de choix de cible pour les cartes spéciales
     * Génère un bouton par joueur cible possible
     * @param {Player[]} cibles - La liste des joueurs pouvant être ciblés
     * @param {string} message - Le titre affiché dans la popup
     * @param {Function} callback - Fonction appelée avec le joueur choisi en paramètre
     */
    showTargetChoice(cibles,message, callback) {
        let overlay = document.getElementById("overlay-target");
        let boutons = document.getElementById("popup-target-list");
        let titre = document.getElementById("popup-target-title");

        titre.textContent = message;
        boutons.innerHTML= "";

        for (let i = 0; i < cibles.length; i++) {
            let joueur = cibles[i];
            let btn = document.createElement("button");
            btn.textContent = joueur.name;

            btn.addEventListener("click", function(){
                overlay.classList.add("hidden");
                callback(joueur);
            });

            boutons.appendChild(btn);
            
        }
        overlay.classList.remove("hidden");
    }

    /**
     * Affiche une popup de message avec un bouton de confirmation
     * Utilisée pour les messages d'information, d'erreur ou de transition
     * @param {string} message - Le message à afficher dans la popup
     * @param {Function|null} callback - Fonction exécutée après confirmation (peut être null)
     */
    showOverlay(message, callback) {
        let titre = document.getElementById("overlay-title");
        titre.textContent = message;
        document.getElementById("overlay").classList.remove("hidden");

        document.getElementById("overlay-btn").onclick = function() {
            document.getElementById("overlay").classList.add("hidden");
            if (callback) {
                callback();
            }
        };
    }


}