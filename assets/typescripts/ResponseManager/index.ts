import { normalizeAccents } from '../utils/str';
import * as terms from '../lexic';
import ReponseGenerator from './ReponseGenerator';

type User = {
    code_unite: string,
    fonction: string,
    grade: string,
    id: string,
    mail: string,
    nom: string,
    port: string,
    prenom: string,
    qualification: string,
    specificite: string,
    tph: string,
    unite: string
}

let index = 0;

export default class {

    private bubbleBuilder: Function;
    private bubble: HTMLElement;
    private id: number;
    private storeKey: string;
    private responder = new ReponseGenerator();

    constructor(bubbleBuilderFunction: (sens: "sent" | "received") => HTMLElement) {
        this.bubbleBuilder = bubbleBuilderFunction;
        this.bubble = bubbleBuilderFunction('received');
        this.id = index++;
        this.storeKey = `response-manager#${this.id}`;
        return this;
    }

    public addLoader(): this {
        // affiche "chargement en cours..."
        this.addEmptySpans();
        return this;
    }

    public printPersonMessage(data: User[], attrs: string[]) {
        this.bubble.classList.remove('loading');
        const nb_results = data.length;
        // Cas facile: aucun résultat
        if (!nb_results) {
            this.bubble.innerHTML = this.responder.no_result;
            // Cas facile: 1 seul résultat
        } else if (nb_results == 1) {
            this.bubble.innerHTML = this.addUserCard(data[0], attrs);
        } else {
            console.log(localStorage.getItem(`${this.storeKey}_unite`));

            if (!this.isKnownUnite()) {
                const that = this;
                const storeKey = this.storeKey;
                const this_func = this.printPersonMessage;

                this.bubble.innerHTML = this.responder.init_many_results;
                this.bubble = this.bubbleBuilder('input-bubble');
                this.bubble.innerHTML = this.responder.init_ask_unite;
                this.bubble.appendChild(this.addPrompt(function (this: HTMLInputElement, e: Event) {
                    localStorage.setItem(`${storeKey}_unite`, this.value);
                    this_func.apply(that, [data, attrs]);
                }))
            } else {
                const userInSameUnite = data.find(user => user.code_unite == localStorage.getItem(`${this.storeKey}_unite`))
                if (userInSameUnite) {
                    this.bubble.innerHTML = this.addUserCard(userInSameUnite, attrs);
                }
            }
        }
    }

    public printUnknownMessage(): this {
        this.bubble.innerHTML = this.responder.unknown;
        return this;
    }

    private isKnownUnite() {
        return localStorage.getItem(`${this.storeKey}_unite`) !== null;
    }

    private addEmptySpans() {
        this.bubble.id = `bubble-${this.id}`;
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            this.bubble.appendChild(span);
        }
        this.bubble.classList.add('loading');
    }

    private addUserCard(user: User, attrs: string[]): string {
        let message = this.responder.one_user;
        let cardCls: string[] = [];

        // Traitement des demandes de TPH
        if (terms.TELEPHONE_TERMS.find(attr => attrs.map(normalizeAccents).includes(attr))) {
            console.log("ok");
            if (terms.FIXES_TERMS.find(attr => attrs.includes(attr))) {
                cardCls.push('display-fixe');
            }
            if (terms.MOBILE_TERMS.find(attr => attrs.includes(attr))) {
                cardCls.push('display-port');
            }
            if (!cardCls.length) {
                if (user.tph)
                    message = this.responder.one_user_with_precisions;
                cardCls.push('display-fixe');
                cardCls.push('display-port');
            }
        }
        // Traitement des demandes concernant l'e-mail
        if (terms.MAIL_TERMS.find(attr => attrs.includes(attr))) {
            cardCls.push('display-mail');
        }

        // Si rien demandé, on affiche toutes les données
        if (!cardCls.length)
            cardCls = ['display-fixe', 'display-port', 'display-mail'];

        const fonctions = {
            'C': "Commandant d'unité",
            'A': "Commandant d'unité en second"
        }
        return /*html*/`
        ${message}
        <div class="user-card ${cardCls.join(' ')}" data-id="${user.id}">
        <div class="user-header">
            <span class="user-grade">${user.grade}</span>&nbsp;
            <strong>${user.prenom} ${user.nom}</strong>
        </div>
        <div class="user-details">
            ${['C', 'A'].includes(user.fonction) ?
                `<div class="user-fonction user-attribute display-unite">${fonctions[user.fonction as ('A' | 'C')]}</div>` : ''
            }
            <div class="user-unit user-attribute display-unite">${user.unite} (${user.code_unite})</div>
        </div>
        <div class="user-contact" title="Mail: ${user.mail}&#10;Téléphone: ${user.tph}&#10;Portable: ${user.port}&#10;Qualification: ${user.qualification}&#10;Spécificité: ${user.specificite}">
            <div class="user-attribute display-mail"><span class="user-contact-icon">📧</span>&nbsp;${user.mail}</div>
            <div class="user-attribute display-numero-fixe"><span class="user-contact-icon">📞</span>&nbsp;${user.tph}</div>
            <div class="user-attribute display-numero-port"><span class="user-contact-icon">📱</span>&nbsp;${user.port}</div>
        </div>
    </div>
    `;
    }

    private addPrompt(cb: ((this: HTMLInputElement, ev: Event) => any) | null): HTMLInputElement {
        const input = document.createElement('input')
        input.setAttribute('type', 'number');
        input.setAttribute('name', 'prompt-input');
        input.setAttribute('placeholder', 'Votre code unité...');
        input.classList.add('prompt-input');
        if (cb)
            input.addEventListener('change', cb);
        return input;

    }
}