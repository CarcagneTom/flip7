/**
 * Classe AIPlayerHard
 * Hérite de la classe Player, gère la logique d'une IA difficile
 */
class AIPlayerHard extends Player {
    /**
     * Crée une IA de niveau difficile
     * Appelle le constructeur de Player pour initialiser les attributs
     * @param {string} name - Le nom de l'IA
     */
    constructor(name){
        super(name);

        /** @type {string} Le niveau de difficulté de l'IA */
        this.level="Hard";
    }

    /**
     * Elle compte le nombre de cartes de valeur >= 8 dans sa main. Si ce nombre atteint un seuil aléatoire entre 2 et 3, elle s'arrête (les cartes >= 8 sont les plus communes dans le jeu, donc le risque de doublon est plus élevé)
     * Si elle a plus de 3 ou 4 cartes (aléatoirement défini) :
     * Si son score est inférieur à 16, elle pioche pour tenter un Flip 7 (16 est le score minimum pour avoir 7 cartes différentes)
     * Sinon, elle a 3/4 de chances de s'arrêter et 1/4 de continuer
     * Sinon elle pioche (main encore trop petite pour prendre de risque)
     * @param {Deck} deck - La pioche actuelle  
     * @returns "draw" pour piocher, "stop" pour s'arrêter
     */
    decide(deck){
        let handValues = this.getHandValues();
        let c =0;
        // Vérification des cartes qui sont le plus communes
        // Si elle il y a 2 ou 3 cartes de ces valeurs présente alors l'IA stop ça manche
        for (let i = 0; i < handValues.length; i++) {
            if (handValues[i] >= 8) {
                c += 1;
            }
        }
        if (c>=Math.floor(Math.random() * (3 - 2 + 1) + 2)) {
            return "stop";
        }
        // Si 3 ou 4 cartes alors :
        if (this.hand.length > Math.floor(Math.random() * (4 - 3 + 1) + 3)) {
            // si le score est inférieur à 16 alors on pioche, car c'est la plus petite combinaison de Point qui peut donner un Flip 7
            if (this.computeScore()<16) {
                return "draw";
            }else{
                // au dessus de 3 ou 4 carte on a 1/4 de stop car la chance d'avoir un doublon est trop importante
                if(Math.random() < 0.75){
                    return "stop";
                }else{
                    return "draw";
                }
            }
        }else{
            return "draw";
        }
    }

    /**
     * Permet de choisir une cible lors de l'utilisation d'une carte spéciale
     * Carte Stop : elle choisit le joueur avec le score le plus élevé
     * Carte Flip Three : elle choisit le joueur avec le plus de cartes en main
     * @param {Player[]} cibles - La liste des joueurs pouvant être ciblés
     * @param {Card} card - La carte spéciale jouée 
     * @returns {Player} Le joueur choisi comme cible 
     */
    chooseTarget(cibles, card){
        let autres = [];
        // Filtre pour s'exclure des joueurs 
        for (let i = 0; i < cibles.length; i++) {
            if (cibles[i] !== this) {
                autres.push(cibles[i]);
            }
        }

        // Si aucun autre joueur se choisit elle même
        if (autres.length === 0) {
            return cibles[0];
        }

        // Carte "stop" on cible le joueur ayant le score le plus élevé
        if (card.value == "stop") {
            let best = autres[0];
            for (let i = 1; i < autres.length; i++) {
                if (autres[i].computeScore() > best.computeScore()) {
                    best = autres[i];
                }
            }
            return best;
        }

        // Carte "flip_three" on cible le joueur ayant le plus de cartes en main
        if (card.value == "flip_three") {
            let cible = autres[0];
            for (let i = 1; i < autres.length; i++) {
                if (autres[i].hand.length > cible.hand.length) {
                    cible = autres[i];
                }
            }
            return cible;
        }

        return autres[0];
    }
}