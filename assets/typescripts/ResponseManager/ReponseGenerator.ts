export default class {

    private unknown_hints: string[];
    private no_result_hints: string[];
    private one_result_hints: string[];
    private one_user_hints: string[];
    private one_user_with_precisions_hints: string[];
    private init_many_results_hints: string[];
    private init_ask_unite_hints: string[];
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
        this.one_user_with_precisions_hints = [
            "Vous n'avez pas précisé si téléphone fixe ou mobile: J'ai mis les deux!",
            "Je vous ai mis les numéro de fixe et de mobile, au cas où.",
            "Et voilà! Vous trouverez le numéro de fixe et de mobile.",
            "Dans le doute, j'ai mis le numro de fixe et de mobile!"
        ];
        this.init_many_results_hints = [
            "J'ai touvé plusieurs résultats. Complétez l'action ci-dessous, s'il vous plaît.",
            "Plusieurs résultats. Aidez-moi à affiner tout ça!",
            "Veuillez compléter l'action ci-dessous."
        ];
        this.init_ask_unite_hints = [
            "Indiquez-nous le code de votre unité. Ainsi, lorsque vous demanderez les infos d'une personne en ne fournissant que son prénom, vous obtiendrez en priorité les informations de personnes dans votre unité.",
            "Quel le code de votre unité? Celà nous permettra de vous fournir des réponses plus pertinentes",
            "Améliorons votre expérience utilisateur! Quel est le code votre unité?"
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

    get one_user_with_precisions() {
        const max = this.one_user_with_precisions_hints.length - 1;
        return this.one_user_with_precisions_hints[this.randomIntFromInterval(0, max)];
    }

    get init_many_results() {
        const max = this.init_many_results_hints.length - 1;
        return this.init_many_results_hints[this.randomIntFromInterval(0, max)];
    }

    get init_ask_unite() {
        const max = this.init_ask_unite_hints.length - 1;
        return this.init_ask_unite_hints[this.randomIntFromInterval(0, max)];
    }

    get one_unite() {
        const max = this.one_unite_hints.length - 1;
        return this.one_unite_hints[this.randomIntFromInterval(0, max)];
    }

    private randomIntFromInterval(min: number, max: number) { // min and max included 
        return min === max ? min : Math.floor(Math.random() * (max - min + 1) + min);
    }
};