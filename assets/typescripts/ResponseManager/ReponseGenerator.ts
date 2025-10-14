import { stat } from "fs";
import { Unite } from "../types";
import { pluralize } from "../utils/str";

const hints = {

    context: {
        current: null,
        args: null
    },

    // Pas de résultat
    unknown_hints: [
        "Euh... Comment dire. Je n'ai rien compris!",
        "Je ne pas vous vexer, mais je n'ai rien compris à votre demande.",
        "Pardon?",
        "plaît-il?",
        "Votre demande n'est pas assez précise pour moi. Veuillez reformuler.",
        "Pourriez-vous reformuler votre demande, s'il vous plaît?"
    ],
    error_hints: [
        "Votre recherche amène un résultat pour le moins... surprenant. Pouvez-vous préciser ce que vous recherchez?",
        "J'ai besoin de davantage de précisisions. Les termes que vous avez saisis ne me suffisent pas à vous apporter une réponse",
        "Désolé, j'ai besoin que vous complétiez votre demande.",
        "Je comprends les termes que vous avez saisis mais la réponse renvoyée par le serveur est surprenante. Pourriez-vous reformuler?"
    ],
    no_result_hints: [
        "Je n'ai trouvé aucun résultat.Êtes-vous sûr de votre saisie?",
        "Aïe! Je n'ai pas trouvé de réponse pour vous...",
        "Zut, je n'ai rien trouvé..."
    ],
    no_unite_hints: [
        "Je n'ai trouvé aucune unité. Êtes-vous sûr de votre saisie?",
        "Aïe! Je n'ai pas trouvé cette unité...",
        "Mince... Si votre saisie était correcte, alors j'ai besoin d'une mise à jour!",
        "Aucune unité trouvée",
        "Je ne connais pas cette unité!"
    ],
    // 1 seul résultat
    one_result_hints: [
        "J'ai trouvé ce que vous cherchez:",
        "Un résultat trouvé:",
        "Voici ce que j'ai trouvé:",
        "Et voilà!",
        "Tada!"
    ],
    one_unite_hints: [
        "Et l'unité recherchée est:",
        "Cette unité correspond à vos critères",
        "La pêche a été bonne. J'ai trouvée cette unité:",
        "Voici l'unité recherchée:",
        "L'unité recherchée est:"
    ],
    one_user_hints: [
        "Voici l'utilisateur recherché:",
        "L'utilisateur recherché est:"
    ],
    one_user_with_precisions_hints: [
        "Vous n'avez pas précisé si téléphone fixe ou mobile: J'ai mis les deux!",
        "Je vous ai mis les numéro de fixe et de mobile, au cas où.",
        "Et voilà! Vous trouverez le numéro de fixe et de mobile.",
        "Dans le doute, j'ai mis le numro de fixe et de mobile!"
    ],
    // Plusieurs résultats
    init_many_results_hints: [
        "J'ai touvé plusieurs résultats. Choisissez dans la liste ci-dessous, s'il vous plaît.",
        "Plusieurs résultats. Choisissez dans la liste!",
        "Veuillez compléter l'action ci-dessous.",
        "Cette liste présente les unités correspondant à vos critères. Choisissez celle que vous souhaitez afficher.",
        "Choisissez dans la liste l'unité que vous recherchez:",
    ],
    init_choose_user_hints: [
        "J'ai trouvé plusieurs personnes correspondant à votre recherche. Sélectionnez celle que vous voulez:",
        "Vous avez l'embarras du choix. Qui recherchez-vous?",
        "Ôtez-moi d'un doute. Vous cherchez qui?",
        "Je n'ai pas trouvé de personne correspondant à votre recherche dans votre unité. Voici la liste étendue des résultats.",
        "Hum... Qui choisir?"
    ],
    init_choose_unite_hints: [
        "J'ai trouvé plusieurs unités correspondant à votre recherche. Sélectionnez celle que vous voulez:",
        "Vous avez l'embarras du choix. Quel unité recherchez-vous?",
        "Ôtez-moi d'un doute. Vous cherchez quel unité?",
        "Hum... Laquelle choisir?"
    ],
    init_ask_unite_hints: [
        "Indiquez-nous le code de votre unité. Ainsi, lorsque vous demanderez les infos d'une personne en ne fournissant que son prénom, vous obtiendrez en priorité les informations de personnes dans votre unité.",
        "Quel le code de votre unité? Celà nous permettra de vous fournir des réponses plus pertinentes",
        "Améliorons votre expérience utilisateur! Quel est le code votre unité?"
    ],
    // Divers 
    message_intro_hints: [
        "J'ai trouvé des résultats variés. Les voici:",
        "Votre recherche a donné plusieurs types de résultats. Je vais vous les présenter en séparant unités et personnes.",
        "Vos critères ont donné plusieurs types de résulats. Je vous les présente ci-dessous:",
        "Cette recherche a donné des résulats qui portent sur des unités et des personnes. Je vous détaille ça en dessous."
    ],
    // Résultats variés (unités et personnes)
    varied_results_unite_hints: (args: { len: number, columns: string[] }) => {
        const n = args.len;
        const cols = [...new Set(args.columns.map(col => {
            switch (col) {
                case 'telephone_number': return pluralize(n, 'le numéro', 'les numéros');
                case 'code': return pluralize(n, 'le code', 'les codes');
                default: return false;
            }
        }))].filter(Boolean).join(' et ');

        return [
            `J'ai trouvé ${n} ${pluralize(n, 'unité')} dont ${cols} ${pluralize(n, 'correspond', 'correspondent')} à la valeur que vous avez saisie.`,
            `La valeur que vous avez saisie concorde avec ${cols} de ${pluralize(n, 'cette unité', 'ces unités')}:`
        ];
    },

    varied_results_user_hints: (args: { len: number, columns: string[] }) => {
        const n = args.len;
        const cols = args.columns.map(col => {
            switch (col) {
                case 'tph': return pluralize(n, 'le numéro de fixe', 'les numéros de fixe') + ' de téléphone';
                case 'port': return pluralize(n, 'le numéro de portable', 'les numéros de portable');
                default: return false;
            }
        }).filter(Boolean).join(' et ');

        return [
            `J'ai trouvé ${n} ${pluralize(n, 'personnel')} dont ${cols} ${pluralize(n, 'correspond', 'correspondent')} à la valeur que vous avez saisie.`,
            `La valeur que vous avez saisie concorde avec ${cols} de ${pluralize(n, 'ce personnel', 'ces personnels')}:`
        ];
    },

    list_unite_intro_hints: ({ len: n, term, city }: { len: number, term: string, city: string | null }) => {
        if (city === null && term.toLowerCase() !== 'comgendgp')
            return [
                `Vous n'avez pas précisé de ville dans laquelle lancer ma recherche. Je vous fournis donc une liste des ${term.toUpperCase()} que j'ai pu trouver.
                Au total, j'ai compté ${n} ${pluralize(n, 'unité')}:
                `
            ];
        else
            return [
                `J'ai trouvé ${n} ${pluralize(n, 'unité')} correspondant à vos critères de recherche.`
            ];
    },

    list_users_intro_hints: ({ len: n, words, unite }: { len: number, words: { [K in 'statut' | 'qualification']: string[] }, unite: string }) => {
        let statut = '';
        let qualification = ''
        if (words.hasOwnProperty('statut'))
            statut = ' ayant le statut de ' + words['statut'].join(', ');
        if (words.hasOwnProperty('qualification'))
            qualification = ' étant ' + words['qualification'].map(w => w.toUpperCase()).join(', ');

        return [
            `${unite} ${n ? `compte ${n}` : 'ne compte aucun'} ${pluralize(n, 'personnel')}${[statut, qualification].filter(Boolean).join(' et')}.`
        ];
    }

};

hints.no_unite_hints = [
    ...hints.no_result_hints, ...hints.no_unite_hints
];

hints.one_unite_hints = [
    ...hints.one_result_hints, ...hints.one_unite_hints
];
hints.one_user_hints = [
    ...hints.one_result_hints, ...hints.one_user_hints
];
hints.init_choose_user_hints = [
    ...hints.init_many_results_hints, ...hints.init_choose_user_hints
];
hints.init_choose_unite_hints = [
    ...hints.init_many_results_hints, ...hints.init_choose_unite_hints
];
hints.one_unite_hints = [
    ...hints.one_result_hints, ...hints.one_unite_hints
];


const responder = {

    ...hints,

    get(target: any, prop: string) {
        let target_hints = target[`${prop}_hints`];
        if (target.context.current !== null) {
            switch (target.context.current) {
                case 'varied_results_unite':
                    target_hints = target.varied_results_unite_hints(target.context.args);
                    break;
                case 'varied_results_user':
                    target_hints = target.varied_results_user_hints(target.context.args);
                    break;
                case 'list_unite_intro':
                    target_hints = target.list_unite_intro_hints(target.context.args);
                    break;
                case 'list_users_intro':
                    target_hints = target.list_users_intro_hints(target.context.args);
                    break;
                default:
                    break;
            }
            target.context.current = null;
        }
        const max = target_hints.length - 1;
        return target_hints[this.randomIntFromInterval(0, max)];
    },

    set(target: any, prop: string, value: any) {
        target.context.current = prop;
        target.context.args = value;
        return true;
    },

    randomIntFromInterval(min: number, max: number) { // min and max included 
        return min === max ? min : Math.floor(Math.random() * (max - min + 1) + min);
    }
};

export default new Proxy(hints, responder);