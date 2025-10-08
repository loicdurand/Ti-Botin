export default class {

    private unknown_hints: string[];
    private no_result_hints: string[];
    private one_result_hints: string[];
    private one_user_hints: string[];
    private one_unite_hints: string[];

    constructor() {
        this.unknown_hints = [
            "Euh... Comment dire. Je n'ai rien compris!",
            "Je ne pas vous vexer, mais je n'ai rien compris à votre demande.",
            "Pardon?",
            "plaît-il?",
            "Pourriez-vous reformuler votre demande, s'il vous plaît?"
        ];
        this.no_result_hints = [
            "Je n'ai trouvé aucun résultat.Êtes-vous sûr de votre saisie?",
            "Aïe! Je n'ai pas trouvé de réponse pour vous...",
            "Zut, je n'ai rien trouvé..."
        ];
        this.one_result_hints = [
            "J'ai trouvé ce que vous cherchez:",
            "Un résultat trouvé:",
            "Et voilà!",
            "Tada!"
        ];
        this.one_user_hints = [
            ...this.one_result_hints,
            "Voici l'utilisateur recherché:",
            "L'utilisateur recherché est:"
        ];
        this.one_unite_hints = [
            ...this.one_result_hints,
            "Voici l'unité recherchée:",
            "L'unité recherchée est:"
        ]
        return this;
    }

    get unknown() {
        const max = this.unknown_hints.length - 1;
        return this.unknown_hints[this.randomIntFromInterval(0, max)];
    }

    get no_result() {
        const max = this.no_result_hints.length - 1;
        return this.no_result_hints[this.randomIntFromInterval(0, max)];
    }

    get one_user() {
        const max = this.one_user_hints.length - 1;
        return this.one_user_hints[this.randomIntFromInterval(0, max)];
    }

    get one_unite() {
        const max = this.one_unite_hints.length - 1;
        return this.one_unite_hints[this.randomIntFromInterval(0, max)];
    }

    private randomIntFromInterval(min: number, max: number) { // min and max included 
        return min === max ? min : Math.floor(Math.random() * (max - min + 1) + min);
    }
};