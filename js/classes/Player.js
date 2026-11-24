/**
 * Classe Player
 * Représente un joueur
 * Gère sa main, son score, ses différents états durant la manche et les statistiques
 */
class Player{

    /**
     * Crée un nouveau Joueur
     * @param {string} name 
     */
    constructor(name){

        /** @type {Card[]} La main du joueur (tableau de cartes) */
        this.hand = [];

        /** @type {string} Le nom du joueur */
        this.name= name;

        /** @type {number} Le score du joueur durant la partie */
        this.score = 0;

        /** @type {boolean} true si le joueur est encore actif dans la manche en cours */
        this.isStanding= true; 

        /** @type {boolean} true si le joueur est encore dans la partie */
        this.isActive= true; 

        /** @type {boolean} true si le joueur a réussi un Flip 7 */
        this.flip7 = false;

        /** @type {boolean} true si le joueur a pioché un doublon */
        this.isBust = false;

        /** @type {number} Nombre de cartes "Seconde Chance" en possession du joueur */
        this.hasSecondChance = 0;

        /** @type {boolean} true si le joueur a quitté la partie (remplacé par une IA) */
        this.hasQuit = false;

        //utile pour les stats

        /** @type {number} Nombre de parties jouées par ce joueur */
        this.nbGame = 0;

        /** @type {number} Meilleur score jamais atteint par ce joueur */
        this.record = 0;

        /** @type {number} Nombre total de cartes piochées depuis toujours */
        this.nbCard = 0;

        /** @type {number} Nombre de parties gagnées par ce joueur */
        this.gamesV = 0;
    }

   /**
    * Ajoute une carte à la main du joueur
    * Incrémente le compteur total de carte piochées
    * @param {Card} card - La carte à ajouter à la main
    */
    addCard(card){
        this.hand.push(card);

        //met à jour dans le local storage le nombre de cartes piochées depuis toujours ( pour les stats )
        this.nbCard +=1 ;                                   
        let statI = localStorage.getItem("ListeStats");
        statI = (!statI) ? [] : JSON.parse(statI);
        for(let i = 0; i < statI.length;i++){
            if(statI[i].pseudo == this.name){ 
                statI[i].NBC = this.nbCard;
            }
        }
        localStorage.setItem("ListeStats", JSON.stringify(statI));
    }

   /**
    * Retourne un tableau avec les valeurs des cartes number présent dans la main du joueur
    * @returns {number[]} Un tableau contenant les valeurs numériques des cartes number
    */
    getHandValues(){
        let handValues =[];
        for (let i = 0; i < this.hand.length; i++) {
            if (this.hand[i].type=="number") {
                handValues.push(this.hand[i].value)
            }
        }
        return handValues;
    }

    /*
    Permet de calculer la somme des cartes de type number à partir des cartes number du joueur
    - retourne la somme des cartes du tableau
    */
   /**
    * Calcule le score actuel du joueur en fonction de sa main
    *       - Somme les cartes de type Number
    *       - Applique les bonus +
    *       - Applique le bonus * 
    *       - Applique le bonus du Flip 7 (+15)  
    * @returns {number} Le score calculé à partir de la main du joueur
    */
    computeScore(){
    // Somme des cartes number
    let handValues = this.getHandValues();
    let score = 0;
    for (let i = 0; i < handValues.length; i++) {
        score += handValues[i];
    }

    // Recherche des bonus dans la main
    let hasDouble = false;
    let bonusAdd = 0;

    //additionneur
    for (let i = 0; i < this.hand.length; i++) {
        if (this.hand[i].type == "bonus") {
            let v = this.hand[i].value;
            if (v == "*2") {
                hasDouble = true;
            } else if (v == "+2") {
                bonusAdd += 2;
            } else if (v == "+4") {
                bonusAdd += 4;
            } else if (v == "+6") {
                bonusAdd += 6;
            } else if (v == "+8") {
                bonusAdd += 8;
            } else if (v == "+10") {
                bonusAdd += 10;
            }
        }
    }

    //Multiplicateur
    if (hasDouble) {
        score = score * 2;
    }
    score += bonusAdd;

    //Flip7
    if (this.flip7) {
        score += 15;
    }

    return score;
}

   /**
    * Verifie si le joueur possède déja une même carte number dans sa main
    * @param {number} value - La valeur de la carte à rechercher
    * @returns {boolean} true si le joueur possède déjà cette valeur, false sinon
    */
    hasCard(value){
        let handValues = this.getHandValues();
        for (let i = 0; i < handValues.length; i++) {
            if (handValues[i]==value) {
                return true;
            }
        }
        return false;
    }

    /** Remet à zero les attributs pour une nouvelle manche */
    reset() {
        this.hand = [];
        this.isStanding=true;
        this.flip7 = false;
        this.isBust = false;
        this.hasSecondChance = 0;
    }
}