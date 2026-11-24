//      Variables globales

/** @type {UIManager} Gestionnaire d'interface */
let ui= new UIManager();

/** @type {Player[]} Liste des joueurs au lancement de partie */
let players = [];

/** @type {Game|null} Partie en cours, null si aucune partie */
let game = null;


//      Chargement de la page
document.addEventListener("DOMContentLoaded", function() {

    // Raccourci clavier Ctrl+D pour activer/désactiver le mode sombre
    document.addEventListener("keydown", function(e) {
        if (e.ctrlKey && e.key === "d") {
            document.body.classList.toggle("dark");
        }
    });

    // Affichage de l'écran d'accueil au démarrage
    ui.showScreen("screen-home"); 
    
    //      Écran Statistiques

    /**
     * Affiche les statistiques de tous les joueurs enregistrés dans le localStorage
     * Crée un bloc HTML par joueur avec ses données
     */
    document.getElementById("btn-stats").addEventListener("click",function() {
        ui.showScreen("screen-stats");
        let stats = JSON.parse(localStorage.getItem("ListeStats"));
        stats.forEach(element => {
            let statDiv = document.createElement("div");
            statDiv.id = "sttd";
            statDiv.innerHTML ="<div id=\"celluleStat\">" +"<p id=\"nameOfMen\">"+ element.pseudo +"</p>"
            +"<p class = \"statSatelite\"> nombre de parties: "+ element.nbGames +"</p>"
            +"<p class = \"statSatelite\"> record de points: "+ element.reccord +"</p>"
            +"<p class = \"statSatelite\"> total cartes piochées: "+ element.NBC +"</p>"
            +"<p class = \"statSatelite\"> nombre parties gagnées: "+ element.NBV +"</p>"
            +"<p class = \"statSatelite\"> nombre parties perdues: "+ element.NBP +"</p>"+ "</div>";
            document.getElementById("stats-content").appendChild(statDiv);
        });
    });

    /**
     * Retour à l'accueil depuis l'écran statistiques
     * Vide le contenu affiché pour éviter les doublons lors du prochain affichage
     */
    document.getElementById("btn-back-home-stats").addEventListener("click",function() {
        document.getElementById("stats-content").innerHTML = "";
        ui.showScreen("screen-home");
    });

    // Bouton d'accès à l'écran de configuration
    document.getElementById("btn-play").addEventListener("click",function() {
        ui.showScreen("screen-setup");
    });

    //      Synchronisation avec la base de données


    //on recupere les element de la bdd dans le localstorage
    fetch("php/stats.php").then(reponse => reponse.json())
        .then(data => {
        if(data.status === "OK"){                    
            let st = localStorage.getItem("ListeStats");     
            st = (!st) ? [] : JSON.parse(st);
            for(let i = 0; i < data.data.length; i++){
                let tp = data.data[i].type;
                let psd = data.data[i].pseudo;
                let v = data.data[i].value;
                let isHere = st.some(player => player.pseudo === psd);
                if(!isHere && psd != null){
                    st.push({
                        pseudo : psd, 
                        nbGames : 0, 
                        reccord : (tp === "max_points") ? v : 0,
                        NBC : 0, 
                        NBV : 0, 
                        NBP : 0
                    });
                }
            }
            localStorage.setItem("ListeStats", JSON.stringify(st));
        }
    }); 
 

    //          Écran Configuration | ajout de joueurs

    /**
     * Ajoute un joueur (humain ou IA) à la liste de la partie
     * Validations effectuées :
     *      - Nom non vide
     *      - Nom respectant le regex /^_?[A-Z](-?[a-z0-9]+)*$/ et max 18 car
     *      - Max 5 joueurs
     */
    document.getElementById("btn-add-player").addEventListener("click",function() {
        
        let name = document.getElementById("players-name").value;
        let type = document.getElementById("player-type").value;
        let typeFrenchName;
        let valideName = false;

        //vérification d'ajout d'un joueur 
        if(name ==""){
            ui.showOverlay("Veuillez entrer un nom", null);
            return;
        }
        if(!name.match(/^_?[A-Z](-?[a-z0-9]+)*$/) || name.length > 18) {
            ui.showOverlay("Nom Invalide\n Il doit commencer par une majuscule\n Max 18 caractères", null);
            return;
        }
        
        if (players.length>=5) {
            ui.showOverlay("Maximum de 5 joueurs", null);
            return;
        }

        //creation du Joueur
        let player;
        if (type=="human") {
            player = new Player(name);
            typeFrenchName = "Joueur";
            valideName = true;
        }
        else if (type=="easy") {
            player = new AIPlayerEasy(name);
            typeFrenchName = "IA Facile";
            valideName = true;
        }
        else if (type=="hard") {
            player = new AIPlayerHard(name);
            typeFrenchName = "IA Difficile";
            valideName = true;
        }

        if(valideName == true){
            players.push(player);
        }

        // Selection du type de Joueur
        let div = document.createElement("div");
        div.textContent = name + "("+typeFrenchName+")";
        if(type=="human"){
            div.classList.toggle("celluleJoueur");
        }
        if(type=="hard"){
            div.classList.toggle("celluleJoueurIAD");
        }
        if(type=="easy"){
            div.classList.toggle("celluleJoueurIAF");
        }


        //creation du bouton rmv
        let buttonRm = document.createElement("button");
        buttonRm.id = "btn-rm";
        buttonRm.textContent = "✕";
        div.appendChild(buttonRm)

        div.addEventListener("click", function() {
            buttonRm.classList.toggle("hidden");
        });

        buttonRm.addEventListener("click", function(e) {
            players = players.filter(p => p !== player);
            div.remove();
        });


        document.getElementById("players-list").appendChild(div);
        div.appendChild(buttonRm);

        // Enregistrement dans le localStorage si le joueur est nouveau
        if(valideName == true){
           
        
            let statistiques = localStorage.getItem("ListeStats");     
            statistiques = (!statistiques) ? [] : JSON.parse(statistiques);
            let isHere = statistiques.some(player => player.pseudo === name);
            if(!isHere){
                statistiques.push({pseudo : name, nbGames: 0, reccord : player.record, NBC : player.nbCard, NBV : 0, NBP : 0});
                
                localStorage.setItem("ListeStats", JSON.stringify(statistiques));
                
            }
               
        }

        document.getElementById("players-name").value ="";
    });

    /**
     * Retour à l'accueil depuis l'écran de configuration
     * Réinitialise la liste des joueurs et l'affichage
     */
    document.getElementById("btn-back-home").addEventListener("click",function() {
        ui.showScreen("screen-home");
        resetGameData();
    });

    //          Lancement de la partie

    /**
     * Lance la partie si au moins 2 joueurs sont présents
     * Crée l'instance Game, démarre la première manche
     * Lance le tour de l'IA si le premier joueur est une IA
     */
    document.getElementById("btn-start-game").addEventListener("click",function() {
        if (players.length<2) {
            ui.showOverlay("Il faut au moins 2 joueurs", null);
            return;
        }

        game = new Game(players);
        game.startRound();
        ui.showScreen("screen-game");
        ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
        playAITurn();
    });

    //          Actions de jeu | Piocher

    /**
     * Le joueur humain actif pioche une carte.
     * Le résultat est traité par handleDrawResult().
     */
    document.getElementById("btn-draw").addEventListener("click", function() {
        let current = game.getCurrentPlayer();
        let result = game.playerDrawCard(current);
        handleDrawResult(current, result);
    });

    //          Traitement du résultat d'un tirage
    /**
     * Traite le résultat d'une carte piochée et met à jour l'interface
     * Cas gérés :
     *      - "bust" ou action "bust", le joueur est éliminé (doublon)
     * - action "second_chance_used", la seconde chance absorbe le doublon
     * - "flip7", le joueur a réussi Flip 7, fin de manche
     * - action "special", carte spéciale (stop, second_chance, flip_three)
     * - sinon, carte normale, passage au joueur suivant
     *
     * @param {Player} current - Le joueur qui vient de piocher
     * @param {*} result - Le résultat retourné par playerDrawCard()
     * @param {Function|undefined} callback - Fonction à appeler après traitement (utilisée par handleFlipThree)
     */
    function handleDrawResult(current, result, callback) {
        // Doublon le joueur est éliminé
        if (result == "bust" || (result && result.action == "bust")) {
            let value = (result.action == "bust") ? result.value : "?";
            ui.showOverlay(current.name + " est éliminé ! (doublon : " + value + ")", function() {
                ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
                if (callback) { callback(); return; }
                game.nextPlayer();
                if (game.checkRoundOver()) { handleEndRound(); return; }
                ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
                playAITurn();
            });
        // Seconde chance utilisée pour absorber un doublon
        } else if (result && result.action == "second_chance_used") {
            ui.showOverlay(current.name + " a utilisé sa seconde chance ! (doublon : " + result.value + ")", function() {
                if (callback) { callback(); return; }
                game.nextPlayer();
                if (game.checkRoundOver()) { handleEndRound(); return; }
                ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
                playAITurn();
            });
        //Flip 7 réussi, fin de manche immédiate
        } else if (result == "flip7") {
            ui.showOverlay(current.name + " a fait Flip 7 !", function() {
                ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
                if (callback) { callback(); return; }
                handleEndRound();
            });

        // Carte spéciale piochée
        } else if (result != null && result.action == "special") {
            let cibles = game.getActivePlayers();

            if (result.card.value == "second_chance") {
                game.applySecondChance(current);
                ui.showOverlay(current.name + " a pioché une seconde chance !", function() {
                    if (callback) { callback(); return; }
                    game.nextPlayer();
                    if (game.checkRoundOver()) { handleEndRound(); return; }
                    ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
                    playAITurn();
                });
            // Stop ou Flip Three : nécessite de choisir une cible
            } else {
                let message;
                if (result.card.value == "stop") {
                    message = "Choisissez un joueur à stopper :";
                } else if (result.card.value == "flip_three") {
                    message = "Choisissez un joueur à qui faire piocher 3 cartes :";
                }

                /**
                 * Applique l'effet de la carte spéciale sur la cible choisie
                 * @param {Player} cible - Le joueur ciblé
                 */
                function handleEffect(cible){
                    if (result.card.value == "stop") {
                        game.applyStop(cible);
                        ui.showOverlay(cible.name + " a été stoppé !", function() {
                            if (callback) { callback(); return; }
                            game.nextPlayer();
                            if (game.checkRoundOver()) { handleEndRound(); return; }
                            ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
                            playAITurn();
                        });

                    } else if (result.card.value == "flip_three") {
                        handleFlipThree(cible, 3, callback);
                    }
                }

                // Si c'est une IA, elle choisit sa cible automatiquement
                if (current.level) {
                    let cible = current.chooseTarget(cibles, result.card);
                    let nameSpecialCard = result.card.value === "stop" ? "Stop" : "Flip Three";
                    ui.showOverlay(current.name + " a utilisé " + nameSpecialCard + " sur " + cible.name,function() {
                        handleEffect(cible);
                    });
                } else {
                    // Si c'est un humain, overlay de sélection de cible
                    ui.showTargetChoice(cibles, message, handleEffect);
                }
            }

        // Carte Number, passage au joueur suivant
        } else {
            if (callback) { callback(); return; }
            game.nextPlayer();
            if (game.checkRoundOver()) { handleEndRound(); return; }
            ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
            playAITurn();
        }
    }

     /**
     * Fait piocher jusqu'à 3 cartes à la cible d'un Flip Three, récursivement.
     * S'arrête si :
     *      - Les 3 cartes ont été piochées
     *      - La cible est bust, a fait flip7, ou s'est arrêtée
     *
     * @param {Player} cible - Le joueur qui doit piocher
     * @param {number} count - Nombre de cartes restant à piocher
     * @param {Function|undefined} callback - Callback transmis depuis handleDrawResult
     */
    function handleFlipThree(cible, count, callback) {
        if (count == 0 || cible.isBust || cible.flip7 || !cible.isStanding) {
            if (callback) { callback(); return; }
            game.nextPlayer();
            if (game.checkRoundOver()) { handleEndRound(); return; }
            ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
            playAITurn();
            return;
        }

        let result = game.playerDrawCard(cible);
        handleDrawResult(cible, result, function() {
            handleFlipThree(cible, count - 1, callback);
        });
    }

    //              Actions de jeu | S'arrêter

    /**
     * Le joueur humain actif choisit de s'arrêter pour cette manche
     * Passage au joueur suivant
     */
    document.getElementById("btn-stop").addEventListener("click", function() {
        let current = game.getCurrentPlayer();
        game.applyStop(current);
        game.nextPlayer();
        if (game.checkRoundOver()) {
            handleEndRound();
            return;
        }
        ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
        playAITurn();
    });
    

    //              Actions de jeu | Quitter

    /**
     * Le joueur humain actif quitte la partie en cours.
     * Il est remplacé par une IA difficile
     * Si tous les humains ont quitté alors la partie se termine
     */
    document.getElementById("btn-quit-game").addEventListener("click",function() {
        let current = game.getCurrentPlayer();
        current.hasQuit = true;

        // Fin de partie car tous les humains ont quitté 
        if (game.allHumansQuit()) {
            ui.showOverlay("Tous les joueurs ont quitté la partie", function() {
                game.reset();
                resetGameData();
                ui.showScreen("screen-home");
            });
            return;
        }

        // Remplacement par une IA difficile
        let ai = game.replaceByAI(current);
        ui.showOverlay(current.name + " a quitté. Il est remplacé par une IA.", function() {
            ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
            playAITurn();
        });
    });


    //              Tour de l'IA

    /**
     * Gère automatiquement le tour d'un joueur IA
     * Si le joueur actif est humain on réactive les boutons et s'arrête
     * Si c'est une IA, désactive les boutons et attend 1s
     *
     * L'IA appelle decide() pour choisir entre "stop" et "draw", puis le résultat est traité par handleDrawResult()
     */
    function playAITurn() {
        let current = game.getCurrentPlayer();

        // Humain Joue : on réactive les boutons
        if (!current.level) {
            document.getElementById("btn-draw").disabled = false;
            document.getElementById("btn-stop").disabled = false;
            return;
        }

        // IA joue : on désactive les boutons 
        document.getElementById("btn-draw").disabled = true;
        document.getElementById("btn-stop").disabled = true;

        setTimeout(function() {
            let decision = current.decide(game.deck);

            if (decision == "stop") {
                game.applyStop(current);
                game.nextPlayer();
                if (game.checkRoundOver()) {
                    handleEndRound();
                    return;
                }
                ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
                playAITurn();
            } else {
                let result = game.playerDrawCard(current);
                handleDrawResult(current, result);
            }
        }, 1000);
    }

    //                  Fin de manche | Fin de partie

    /**
     * Gère la fin d'une manche
     * Calcule les scores via endRound(), puis :
     *      - Si un joueur atteint 200 points, fin de partie, mise à jour des stats
     *      - Sinon, nouvelle manche
     *
     * Statistiques mises à jour dans le localStorage :
     * - nbGames : incrémenté pour tous les joueurs
     * - NBV (victoires) : incrémenté pour le gagnant
     * - NBP (défaites) : incrémenté pour les autres
     */
    function handleEndRound(){
        game.endRound();
        game.nbround++;
        if (game.checkGameOver()) {
            // Recherche du gagnant (score le plus élevé)
            let winner = game.players[0];
            for (let i = 1; i < game.players.length; i++) {
                if (game.players[i].score > winner.score) {
                    winner = game.players[i];
                }
            }

            // Mise à jour les stats de tous les joueurs
            let statIG = localStorage.getItem("ListeStats");
            statIG = (!statIG) ? [] : JSON.parse(statIG);

            for (let i = 0; i < game.players.length; i++) {
                let joueur = game.players[i];
                for (let k = 0; k < statIG.length; k++) {
                    if (joueur.name == statIG[k].pseudo) {
                        statIG[k].nbGames++;
                        if (joueur.name == winner.name) {
                            statIG[k].NBV++;
                        } else {
                            statIG[k].NBP++;
                        }
                    }
                }
            }
            localStorage.setItem("ListeStats", JSON.stringify(statIG));

            // Affichage fin de partie
            game.gameOver = true;
            ui.showOverlay("Fin de la partie, " + winner.name + " a gagné !", function() {
                game.reset();
                resetGameData();
                ui.showScreen("screen-home");
            });

        } else {
            // Nouvelle manche
            ui.showOverlay("Fin de la manche !", function() {
                game.startRound();
                ui.displayPlayers(game.players, game.currentPlayerIndex, game.nbround);
                playAITurn();
            });
        }
    }

    //                  Réinitialisation

    /**
     * Remet à zéro les données de configuration de partie
     * Vide le tableau des joueurs, l'instance de jeu et le DOM de la liste des joueurs
     */
    function resetGameData() {
        players = [];                                    
        game = null;                                     
        document.getElementById("players-list").innerHTML = ""; 
    }
   
});
