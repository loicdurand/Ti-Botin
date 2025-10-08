export default class {

    private no_result_hints: string[];

    constructor() {
        this.no_result_hints = [
            "Je n'ai trouvé aucun résultat.Êtes-vous sûr de votre saisie?",
            "Aïe! Je n'ai pas trouvé de réponse pour vous...",
            "Zut, je n'ai rien trouvé..."
        ];
        return this;
    }

    get no_result() {
        const max = this.no_result_hints.length - 1;
        return this.no_result_hints[this.randomIntFromInterval(0, max)];
    }

    private randomIntFromInterval(min: number, max: number) { // min and max included 
        return min === max ? min : Math.floor(Math.random() * (max - min + 1) + min);
    }
};