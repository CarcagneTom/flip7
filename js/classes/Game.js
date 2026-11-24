/**
 * Classe Game
 * Gère le déroulement complet d'une partie : les manches, les tours, les actions des joueurs et la condition de fin de partie
 */
class Game{
    /**
     * Crée une nouvelle partie avec les joueurs donnés
     * @param {Player[]} players - Le tableau des joueurs participant à la partie
     */
    constructor(players){

        /** @type {Player[]} Liste de tous les joueurs de la partie */
        this.players = players;

        /** @type {Deck} La pioche de la manche en cours */
        this.deck = new Deck();

        /** @type {number} Index du joueur dont c'est le tour */
        this.currentPlayerIndex = 0;

        /** @type {boolean} true si la manche en cours est terminée */
        this.roundOver = false;

        /** @type {boolean} true si la partie est terminée */
        this.gameOver = false;

        /** @type {number} Numéro de la manche actuelle */
        this.nbround = 1;
    }

   /**
    * Initialise une nouvelle manche :
    * - recrée et melange la pioche
    * - remet les etats des joueurs à zéro
    * - relance la manche
    */
    startRound(){
        this.deck = new Deck();
        this.deck.shuffle();
        this.roundOver=false;
        this.currentPlayerIndex = Math.floor(Math.random() * this.players.length);

        for (let i = 0; i < this.players.length; i++) {
            this.players[i].reset();
        }
    }

   /**
    * Vérifie si la manche est terminée :
    * Si au moins un joueur peut encore jouer alors la manche continue
    * @returns {boolean} true si la manche est terminée, false sinon
    */
    checkRoundOver() {
        let actifs = this.getActivePlayers();
        if (actifs.length < 1) {
            return true;
        } else {
            return false;
        }
    }

   /**
    * Termine la manche et calcule les scores des joueurs
    * Si la manche n'est pas finie, rien
    * Sinon :
    *       - ajoute le score des joueurs
    *       - pas de points si bust
    */
    endRound(){
        for (let i = 0; i < this.players.length; i++) {
            let p = this.players[i];
            if (!p.isBust) {
                p.score += p.computeScore(); 
            }

            //bloc relatif au stats
            if(p.score > p.record){
               p.record = p.score;
               let statIR = localStorage.getItem("ListeStats");
               statIR = (!statIR) ? [] : JSON.parse(statIR);
               for ( let j = 0; j < statIR.length; j++){
                    if(p.name == statIR[j].pseudo){
                        statIR[j].record = p.record;
                
                    }
               }
               localStorage.setItem("ListeStats", JSON.stringify(statIR));
            }
            
            
        }
    }
    
   /**
    * Vérifie si la partie est terminée 
    * Si un joueur atteint 200 points alors la partie est finie
    * @returns {boolean} true si un joueur a atteint 200 points, false sinon
    */
    checkGameOver(){
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].score>=200) {
                return true;
            }   
            
        }
        return false;
    }

    /**
     * Retourne le joueur actuel (celui qui doit jouer)
     * @returns {Player} Le joueur actuel
     */
    getCurrentPlayer(){
        return this.players[this.currentPlayerIndex];
    }

    /*
    Passe au joueur suivant :
        - incrémente l'index
        - revient au début si on dépasse le tableau
    */
    /**
     * Passe au joueur suivant encore actif
     * S'arrête dès qu'un joueur avec isStanding à true est trouvé
     */
    nextPlayer(){
        let count = 0;
        do {
            this.currentPlayerIndex++;
            if (this.currentPlayerIndex >= this.players.length) {
                this.currentPlayerIndex = 0;
            }
            count++;
        } while (!this.getCurrentPlayer().isStanding && count < this.players.length);
    }

    /**
     * Fait piocher une carte à un joueur :
     *      - si aucun joueur précisé alors on prend le joueur actuel
     *      - si carte bonus on l'ajoute directement à la main
     *      - si carte spéciale on renvoie l'action à traiter ailleurs
     *      - si carte number :
     *          - vérifie doublon :
     *              - si seconde chance alors le bonus est consommé
     *              - sinon fin du tour
     *      - vérifie si flip7, 7 cartes différentes alors fin du tour + bonus
     * @param {Player} player - Le joueur qui pioche 
     * @returns {Card-string-Object} Le résultat de l'action
     */
    playerDrawCard(player){
        player = player || this.getCurrentPlayer();
        let card = this.deck.draw();

        

        if (card.type=="bonus") {
            player.addCard(card);
            return card;
        }
        if (card.type=="special") {
            return { action: "special", card: card };
        }

        //Verifie que le joueur a déja la carte 
        if (card.type == "number" && player.hasCard(card.value)) {
            //Utilisation de la seconde chance pour le joueur
            if (player.hasSecondChance) {
                player.hasSecondChance-=1;
                return "second_chance_used";
            }
            //bust en cas de doublons donc fin de manche pour le joueur
            player.addCard(card);
            player.isStanding = false;
            player.isBust = true;
            return { action: "bust", value: card.value };
        }
        player.addCard(card);

        //Verifie si le joueur fait flip7
        if (player.getHandValues().length==7) {
            player.isStanding = false;
            player.flip7 = true;
            return "flip7";
        }

        return card;
    }

    /**
     * Retourne la liste des joueurs encore actifs dans la manche.
     * @returns {Player[]} Tableau des joueurs pouvant encore jouer
     */
    getActivePlayers(){
        let actifs=[];
        for(let i=0; i<this.players.length;i++){
            let p = this.players[i];
            if (!p.isBust && p.isStanding && !p.flip7) {
                actifs.push(p);
            }
        }
        return actifs;
    }

    /**
     * Force un joueur à s'arrêter pour cette manche.
     * @param {Player} target - Le joueur à stopper
     */
    applyStop(target){
        target.isStanding=false;
    }

    /**
     * Donne une "Seconde Chance" à un joueur.
     * @param {Player} target - Le joueur qui reçoit la seconde chance
     */
    applySecondChance(target) {
        target.hasSecondChance += 1;
    }

    /**
     * Force un joueur à piocher 3 cartes consécutives
     * S'arrête si le joueur est bust ou réalise un Flip 7
     * @param {Player} target - Le joueur qui doit piocher 3 cartes
     * @returns {Array} Tableau des résultats des 3 tirages
     */
    applyFlipThree(target) {
        let results = [];
        for (let i = 0; i < 3; i++) {
            let result = this.playerDrawCard(target);
            results.push(result);
            if (result == "bust" || result == "flip7") {
                break;
            }
        }
        return results;
    }

    /** Remet complètement la partie à zéro pour une nouvelle partie */
    reset() {
        this.deck = new Deck();
        this.currentPlayerIndex = 0;
        this.roundOver = false;
        this.gameOver = false;
        this.nbround = 1;
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].reset();
            this.players[i].score = 0;
        }    
    }

    /**
     * Remplace un joueur humain par une IA de niveau difficile
     * Utilisé quand un joueur humain quitte la partie en cours
     * @param {Player} player - Le joueur humain à remplacer
     * @returns {AIPlayerHard} L'IA créée en remplacement
     */
    replaceByAI(player) {
        let ai = new AIPlayerHard(player.name);
        ai.hand = player.hand;
        ai.score = player.score;
        ai.isStanding = player.isStanding;
        ai.isActive = true;        
        ai.isBust = player.isBust;
        ai.hasSecondChance = player.hasSecondChance;

        let index = this.players.indexOf(player);
        this.players[index] = ai;
        return ai;
    }

    /**
     * Vérifie si tous les joueurs humains ont quitté la partie
     * @returns {boolean} true si tous les humains ont quitté, false sinon
     */
    allHumansQuit() {
        for (let i = 0; i < this.players.length; i++) {
            let p = this.players[i];

            if (!p.level && !p.hasQuit) {
                return false;
            }
        }
        return true;
    }

}