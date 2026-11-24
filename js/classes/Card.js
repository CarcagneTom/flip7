/**
 * Classe Card 
 * Gère le type de la carte (number,bonus,special) et la valeur des cartes
 */
class Card{
    /**
     * Crée une nouvelle carte
     * @param {string} type - Le type de la carte : "number", "bonus" ou "special"
     * @param {string-number} value - La valeur de la carte 
     */
    constructor(type,value){
        // Initialise le type (number,bonus,special)
        this.type = type;
        // Initialise la valeur de la carte
        this.value = value;
    }

    /**
     * Retourne le type et la valeur de la carte
     * @returns {string} La carte sous le format "type : valeur" 
     */
    toString(){
        return this.type + " : " + this.value;
    }
}