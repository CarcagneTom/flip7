/**
 * Classe AIPlayerEasy
 * Hérite de la classe Player, gère la logique d'une IA simple
 */
class AIPlayerEasy extends Player {

    /**
     * Crée une IA de niveau facile
     * Appelle le constructeur de Player pour initialis les attributs
     * @param {string} name - Le nom de l'IA
     */
    constructor(name){
        super(name);

        /** @type {string} Le niveau de difficulté de l'IA */
        this.level="Easy";
    }

    /*
    Logique d'une ia basique :
        - Si l'IA a peu de cartes elle pioche
        - Si elle a peu de cartes elle choisis aléatoirement entre piocher et s'arrêter
    - prend en parametre la pioche 
    */

    /**
     * L'IA pioche obligatoirement au moins 1 carte
     * Si elle a entre 1 et 7 (choisi aléatoirement) cartes elle a 1/2 chance de s'arrêter
     * Si elle a plus que le nombre aléatoire choisi de cartes elle s'arrête 
     * L'aléatoire permet de donner un comportement imprévisible à l'IA, plus agréable pour les joueurs
     * @param {Deck} deck - La pioche actuelle  
     * @returns "draw" pour piocher, "stop" pour s'arrêter
     */
    decide(deck){
        let random = Math.random() * (7 - 1) + 1;
        if (this.hand.length>random){
            if(Math.random() < 0.5){
                return "stop";
            }else{
                return "draw";
            }
        }else{
            return "draw";
        }
    }

    /**
     * Permet de choisir une cible lors de l'utilisation d'une carte spéciale
     * Elle choisit aléatoirement parmi les joueurs (se retire des joueurs possibles si possible)
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

        // Si aucun autre joueur se choisit elle-même
        if (autres.length === 0) {
            return cibles[0];
        }

        // Choisis aléatoirement parmi les joueurs 
        let index = Math.floor(Math.random() * autres.length);
        return autres[index];
    }
}
