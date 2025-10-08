import { normalizeAccents } from '../utils/str';
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

    private bubble: HTMLElement;
    private id: number;
    private responder = new ReponseGenerator();

    constructor(bubble: HTMLElement) {
        this.bubble = bubble
        this.id = index++;
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
            this.bubble.innerHTML = `
                ${this.responder.one_user}
                ${this.addUserCard(data[0], attrs)}
            `
        } else {

            if (!this.userIsConnected) {
                prompt(``)
            }
        }
    }

    public printUnknownMessage(): this {
        this.bubble.innerHTML = this.responder.unknown;
        return this;
    }

    private userIsConnected() {
        return localStorage.getItem(`response-manager#${this.id}_unite`) !== null;
    }

    private addEmptySpans() {
        this.bubble.id = `bubble-${this.id}`;
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            this.bubble.appendChild(span);
        }
        this.bubble.classList.add('loading');
    }

    private addUserCard(user: User, attrs: string[]) {
        let cardCls: string[] = [];

        // Traitement des demandes de TPH
        if (['numero', 'telephone', 'tel', 'tph', 'fix', 'fixe', 'port', 'portable', 'mobile', 'neo', 'neogend', 'neo2'].find(attr => attrs.map(normalizeAccents).includes(attr))) {
            console.log("ok");
            if (['fix', 'fixe'].find(attr => attrs.includes(attr))) {
                cardCls.push('display-fixe');
            }
            if (['port', 'portable', 'mobile', 'neo', 'neogend', 'neo2'].find(attr => attrs.includes(attr))) {
                cardCls.push('display-port');
            }
            if (!cardCls.length) {
                cardCls.push('display-fixe');
                cardCls.push('display-port')
            }
        }
        const fonctions = {
            'C': "Commandant d'unité",
            'A': "Commandant d'unité en second"
        }
        return /*html*/`
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
}