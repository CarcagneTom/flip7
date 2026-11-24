/**
 * Classe Deck
 * Gère la création d'un deck qui comprend :
 *      - 79 cartes de type number
 *      - 6 cartes de type bonus
 *      - 6 cartes de type spécial
 */        
class Deck{

    /**
     * Crée un tableau qui contiendra les cartes
     * Construit le deck avec toutes les cartes nécessaires au jeu
     */
    constructor(){
        this.cards = [];
        this.build();
    }

    /**
     * Construit le deck avec toutes les cartes nécessaires au jeu
     *      - Cartes Number  : la carte 0 est unique, puis la carte i apparaît i fois (1 à 12)
     *      - Cartes Bonus   : Une carte de chaque valeur (*2, +2, +4, +6, +8, +10)
     *      - Cartes Special : 3 exemplaires de chaque (stop, second_chance, flip_three)
     */
    build(){
        // Ajout au tableau des 79 cartes number
        this.cards.push( new Card("number", 0) );
        for (let i = 1; i < 13; i++) {
            for (let j = 0; j < i; j++) {
                this.cards.push( new Card("number", i) );    
            }
        }
        // Ajout au tableau des 6 cartes bonus 
        this.cards.push( new Card("bonus","*2") );
        this.cards.push( new Card("bonus","+2") );
        this.cards.push( new Card("bonus","+4") );
        this.cards.push( new Card("bonus","+6") );
        this.cards.push( new Card("bonus","+8") );
        this.cards.push( new Card("bonus","+10") );

        // Ajout au tableau des 6 cartes special
        for (let i = 0; i < 3; i++) {
            this.cards.push( new Card("special","stop"));
            this.cards.push( new Card("special","second_chance") );
            this.cards.push( new Card("special","flip_three") );
        }
    }

    /**
     * Mélange aléatoire des cartes du deck
     * On parcourt le tableau à l'envers en échangeant aléatoirement avec une carte précédentes
     */
    shuffle() {
        let max = this.cards.length - 1;
        for (let i = max; i > 0; i--) {
            let random = Math.floor(Math.random() * (i + 1));
            let temp = this.cards[i];
            this.cards[i] = this.cards[random];
            this.cards[random] = temp;
        }
    }

   /**
    * Permet de retirer la dernière carte du deck
    @returns {Card} La carte retirée du dessus de la pioche
    */
    draw() {
        return this.cards.pop();
    }

    /**
     * Verifie si le deck est vide
     * @returns {boolean}
     */
    isEmpty(){
        if (this.cards.length==0) {
            return true;
        }else{
            return false;
        }
    }
}