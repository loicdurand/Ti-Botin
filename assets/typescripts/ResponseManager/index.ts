import { normalizeAccents, pluralize, truncate } from '../utils/str';

import * as terms from '../lexic';
import ReponseGenerator from './ReponseGenerator';
import { AnalysisResult, Unite, User } from '../types';

// let index = 0;

const STORAGE_KEY = 'Ti-Botin@971';

export default class {

    private speed = 50; // Vitesse de "typing"

    private bubbleBuilder: Function;
    private bubble: HTMLElement;
    private responder = ReponseGenerator;

    constructor(bubbleBuilderFunction: (sens: "sent" | "received") => HTMLElement) {
        this.bubbleBuilder = bubbleBuilderFunction;
        this.bubble = bubbleBuilderFunction('received');
        return this;
    }

    public addLoader(): this {
        // affiche "chargement en cours..."
        this.addEmptySpans();
        return this;
    }

    public printVariedResultsMessage(results: ({ type: string, data: User[] | Unite[] })[], attrs: string[]) {

        if (results.filter(({ data }) => data.length).length === 0)
            return this.printErrorMessage();

        this.bubble.classList.remove('loading');
        // Ici, on a des résultats de différents types à afficher.
        // En 1er, on va s'occuper d'afficher les unités.
        // On commence par un petit message d'intro, 
        this.typeMessage(this.bubble, this.responder.message_intro, async () => {

            this.bubble.querySelector('.text')?.classList.remove('text');
            // On décortique les résultats concernant les unités
            const uniteResults = results.find(({ type }) => type === 'unite')?.data as Unite[];

            let len = uniteResults ? uniteResults.length : 0;
            // On met ensuite un titre, pour bien distinguer les sections.
            this.bubble.innerHTML += `
                <h3>1. ${pluralize(len, 'Unité')}</h3>
                <span class="text"></span>`;

            // On défini un contexte pour le message de réponse
            this.responder.varied_results_unite = {
                len: uniteResults.length,
                columns: uniteResults.map(u => u.found_column)
            };

            this.typeMessage(this.bubble, this.responder.varied_results_unite, () => {
                uniteResults.forEach(unite => {
                    this.bubble.innerHTML += this.addUniteCard(unite, attrs);
                });

                // Nos unités affichées, on vire le span.text précédent pour en créer un nouveau
                this.bubble.querySelector('.text')?.classList.remove('text');
                // On passe à l'affichage des utilisateurs
                this.bubble.innerHTML += `
                    <h3>2. ${pluralize(len, 'Personnel')}</h3>
                    <span class="text"></span>`;
                // Maj du contexte car on passe des unités aux utilisateurs
                const personResults = results.find(({ type }) => type === 'person')?.data as User[];
                this.responder.varied_results_user = {
                    len: personResults.length,
                    columns: personResults.map(u => u.found_column)
                };
                // Ne reste plus qu'à afficher
                this.typeMessage(this.bubble, this.responder.varied_results_user, () => {
                    personResults.forEach(person => {
                        this.bubble.innerHTML += this.addUserCard(person, attrs);
                    });
                });

            });

        });

    }

    public printUniteMessage(data: Unite[], attrs: string[]): void {

        console.log({ data, attrs });
        this.bubble.classList.remove('loading');
        const nb_results = data.length;
        // Cas facile: aucun résultat
        if (!nb_results) {
            this.typeMessage(this.bubble, this.responder.no_unite);
            // Cas facile: 1 seul résultat
        } else if (nb_results == 1) {
            this.typeMessage(this.bubble, this.responder.one_unite, () => {
                this.bubble.innerHTML += this.addUniteCard(data[0], attrs);
            });
        } else {
            const that = this;
            this.bubble.outerHTML = '';
            this.bubble = this.bubbleBuilder('input-bubble');
            this.typeMessage(this.bubble, this.responder.init_choose_unite, () => {
                this.bubble.appendChild(this.addSelector(data.map(unite => ({ id: '' + unite.code, label: `${unite.code} - ${unite.name}` })), attrs, function (this: HTMLInputElement, e: Event) {
                    const code = (e.target as HTMLInputElement)?.value;
                    const unite = data.find(unite => unite.code == +code);
                    if (unite) {
                        that.bubble.innerHTML = that.addUniteCard(unite, attrs);
                        that.bubble.classList.remove('input-bubble');
                        that.bubble.classList.add('message-received');
                    }
                }));
            });
        }
    }

    public printPersonMessage(data: User[], attrs: string[]) {
        this.bubble.classList.remove('loading');
        const nb_results = data.length;
        // Cas facile: aucun résultat
        if (!nb_results) {
            this.typeMessage(this.bubble, this.responder.no_result);
            // Cas facile: 1 seul résultat
        } else if (nb_results == 1) {
            // @TODO: this.responder.one_user | this.responder.one_user_with_precisions
            this.typeMessage(this.bubble, this.responder.one_user, () => {
                this.bubble.innerHTML += this.addUserCard(data[0], attrs);
            });
        } else {
            const that = this;
            const this_func = this.printPersonMessage;

            if (!this.isKnownUnite()) {

                // this.typeMessage(this.bubble, this.responder.init_ask_unite, () => {
                // this.bubble = this.bubbleBuilder('input-bubble');
                this.bubble.classList.add('input-bubble')
                this.typeMessage(this.bubble, this.responder.init_ask_unite);
                this.bubble.appendChild(this.addPrompt(function (this: HTMLInputElement, e: Event) {
                    localStorage.setItem(`${STORAGE_KEY}_unite`, this.value);
                    that.bubble = that.bubbleBuilder('received');
                    this_func.apply(that, [data, attrs]);
                }));
                // });


            } else {
                const userInSameUnite = data.find(user => user.code_unite == localStorage.getItem(`${STORAGE_KEY}_unite`))
                if (userInSameUnite) {
                    this.typeMessage(this.bubble, this.responder.one_user, () => {
                        this.bubble.innerHTML += this.addUserCard(userInSameUnite, attrs);
                    });
                } else {
                    this.bubble.outerHTML = '';
                    this.bubble = this.bubbleBuilder('input-bubble');
                    this.typeMessage(this.bubble, this.responder.init_choose_user, () => {
                        this.bubble.appendChild(this.addSelector(data.map(user => ({ id: user.id, label: `${user.prenom} ${user.nom.toUpperCase()}` })), attrs, function (this: HTMLInputElement, e: Event) {

                            const value = (e.target as HTMLInputElement)?.value;
                            const user = data.find(user => user.id == value);
                            if (user) {
                                that.bubble.innerHTML = that.addUserCard(user, attrs);
                                that.bubble.classList.remove('input-bubble');
                                that.bubble.classList.add('message-received');
                            }
                            // this_func.apply(that, [[user], attrs]);
                        }));
                    });

                }
            }
        }
    }

    public async printListeMessage(data: Unite[], words: { [K in 'statut' | 'qualification']: string[] }, analyzed: AnalysisResult, url: string) {
        this.bubble.classList.remove('loading');
        this.bubble.id = "liste-personnels-bubble";
        const nb_unites = data.length;
        // On défini le contexte pour notre message
        this.responder.list_unite_intro = {
            len: nb_unites,
            term: analyzed.term,
            city: analyzed.city
        };
        // On affiche une petite intro
        await this.typeMessage(this.bubble, this.responder.list_unite_intro);

        // CAS 1: LA VILLE N'A PAS ÉTÉ PRÉCISÉE: Ex: liste des opj de cgd -> On fait préciser
        if (data.length > 1) {
            // boucle sur les unités trouvées
            let i = 0;
            for (const unite of data) {
                i++;
                const len = unite?.users?.length || 0;
                this.responder.list_users_intro = {
                    len,
                    words,
                    unite: unite.cn
                };
                this.bubble.querySelector('.text')?.classList.remove('text');
                this.bubble.innerHTML += `
                    <h3>${i}. ${unite.code} - <strong>${unite.name}</strong></h3>
                    <span class="text"></span>`;

                await this.typeMessage(this.bubble, this.responder.list_users_intro);

                // if (!len && unite.children?.length) {
                //     this.bubble.querySelector('.text')?.classList.remove('text');
                //     this.bubble.innerHTML += '<br/><br/><span class="text bold"></span>';
                //     await this.typeMessage(this.bubble, `Souhaitez-vous afficher les résultats pour les ${unite.children?.length} unités filles?`);
                // }

            };

            this.bubble.querySelector('.text')?.classList.remove('text');
            this.bubble.innerHTML += '<br/><br/><span class="text bold"></span>';
            await this.typeMessage(this.bubble, this.responder.init_choose_list_unites);


            let statut = '';
            let qualification = ''
            if (words.hasOwnProperty('statut'))
                statut = ' ayant le statut de ' + words['statut'].join(', ');
            if (words.hasOwnProperty('qualification'))
                qualification = ' étant ' + words['qualification'].map(w => w.toUpperCase()).join(', ');
            const phrase = [statut, qualification].filter(Boolean).join(' et')
            this.bubble.classList.add('input-bubble');
            this.bubble.appendChild(this.addSelector(data.map(unite => ({ id: '' + unite.code, label: `${unite.code} - ${unite.name}` })), phrase.split(' '), function (this: HTMLInputElement, e: Event) {
                const code = (e.target as HTMLInputElement)?.value;
                const unite = data.find(unite => unite.code == +code);
                if (unite) {
                    console.log(unite);
                }
            }));
        } else {

            // C2: UNE SEULE UNITÉ EN RÉSULTAT:
            // ON AFFICHE UN ARBRE SEMBLABLE À CELUI DE L'ANNUAIRE GEND
            const unite = data[0];
            const len = unite?.users?.length || 0;
            this.responder.list_users_intro = {
                len,
                words,
                unite: unite.cn
            };
            this.bubble.querySelector('.text')?.classList.remove('text');

            const unite_card = await this.addUniteCard(unite, []);
            this.bubble.innerHTML += unite_card + '<br/><span class="text"></span>';

            await this.typeMessage(this.bubble, this.responder.list_users_intro);
            this.bubble.querySelector('.text')?.classList.remove('text');
            document.getElementById('bubble-container')?.classList.add('big');
            const tree = await this.renderTreeToHTML(unite, false);
            this.bubble.appendChild(tree);

            // Si la demande était d'exporter uneliste, on ajoute un lien de téléchargement
            if (analyzed?.action?.length) {
                this.bubble.querySelector('.text')?.classList.remove('text');
                const a = document.createElement('a');
                a.setAttribute('href', url);
                a.setAttribute('download', 'export_liste.pdf');
                a.textContent = " télécharger cette liste au format PDF";
                this.bubble.innerHTML += unite_card + '<br/><span class="text"></span>';
                await this.typeMessage(this.bubble, "Comme vous l'avez demandé, voici le lien pour");
                this.bubble.querySelector('.text')?.appendChild(a);

            }

        }
    }

    public printUnknownMessage(): this {
        this.bubble.classList.remove('loading');
        this.typeMessage(this.bubble, this.responder.unknown);
        return this;
    }

    public printErrorMessage(): this {
        this.bubble.classList.remove('loading');
        this.typeMessage(this.bubble, this.responder.error);
        return this;
    }

    private async renderTreeToHTML(unite: Unite, with_title: boolean = true) {

        const section = document.createElement('section');
        const h4 = document.createElement('h4');
        h4.innerHTML = `${unite.code} -  <strong>${unite.name}</strong>`;
        section.appendChild(h4);

        if (unite?.users?.length) {
            const table = await table_template(unite.users as User[]);
            section.appendChild(table);
            if (!with_title) {
                const span = document.createElement('span');
                span.classList.add('visible');
                span.innerHTML = "Ci-dessous, je présente le résultat de la recherche pour les unités filles&nbsp;&darr;"
                section.appendChild(span);
            }

        } else
            section.innerHTML += '<span>Aucun personnel à afficher pour cette unité.</span>';

        if (!unite.hasOwnProperty('children')) {
            return section;
        }

        if (unite.children && unite.children.length > 0) {

            const p = document.createElement('p');

            let i = 0;
            for (const child of unite.children) {
                const subtree = await this.renderTreeToHTML(child)

                p.appendChild(subtree);
                p.innerHTML += this.addUniteCard(child, []);

            };

            section.appendChild(p);
        }

        return section;
    }

    private isKnownUnite() {
        return localStorage.getItem(`${STORAGE_KEY}_unite`) !== null;
    }

    private addEmptySpans() {
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            this.bubble.appendChild(span);
        }
        this.bubble.classList.add('loading');
    }

    private addUniteCard(unite: Unite, attrs: string[]): string {

        let cardCls: string[] = [];

        // Traitement des demandes de TPH
        if (terms.TELEPHONE_TERMS.find(attr => attrs.map(normalizeAccents).includes(attr))) {
            cardCls.push('display-fixe');
        }

        // Traitement des demandes concernant l'e-mail
        if (terms.MAIL_TERMS.find(attr => attrs.includes(attr))) {
            cardCls.push('display-mail');
        }

        if (terms.ADRESSE_TERMS.find(attr => attrs.includes(attr))) {
            cardCls.push('display-adresse');
        }

        // Si rien demandé, on affiche toutes les données
        if (!cardCls.length)
            cardCls = ['display-fixe', 'display-mail', 'display-adresse'];

        return /*html*/`
        <div class="entity-card ${cardCls.join(' ')}" data-id="${unite.code}">
        <div class="entity-header" title="${unite.cn}">
            <span class="entity-code">${unite.code}</span>&nbsp;-&nbsp
            <strong>${unite.name}</strong>
        </div>
        <div class="entity-contact" title="Mail: ${unite.mail}&#10;Téléphone: ${unite.tph}">
            <div class="entity-attribute display-mail"><span class="entity-contact-icon">📧</span>&nbsp;
                <a href="mailto:${unite.mail}">${unite.mail}</a></div>
            <div class="entity-attribute display-numero-fixe"><span class="entity-contact-icon">📞</span>&nbsp;${unite.tph}</div>
        </div>
        <div class="entity-other">
            <div class="entity-attribute">Subdivision:&nbsp;${unite.subdivision}</div>
        </div>
    </div>
    `;
    }

    private addUserCard(user: User, attrs: string[]): string {

        let cardCls: string[] = [];

        // Traitement des demandes de TPH
        if (terms.TELEPHONE_TERMS.find(attr => attrs.map(normalizeAccents).includes(attr))) {

            if (terms.FIXES_TERMS.find(attr => attrs.includes(attr))) {
                cardCls.push('display-fixe');
            }
            if (terms.MOBILE_TERMS.find(attr => attrs.includes(attr))) {
                cardCls.push('display-port');
            }
            if (!cardCls.length && user.tph) {
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
        <div class="entity-card ${cardCls.join(' ')}" data-id="${user.id}">
        <div class="entity-header">
            <span class="entity-grade" title="${user.grade_long}">${user.grade}</span>&nbsp;
            <strong>${user.prenom} ${user.nom}</strong>&nbsp;(${user.nigend})
        </div>
        <div class="entity-details">
            ${['C', 'A'].includes(user.fonction) ?
                `<div class="entity-fonction entity-attribute display-unite">${fonctions[user.fonction as ('A' | 'C')]}</div>` : ''
            }
            <div class="entity-unit display-unite">${user.unite} (${user.code_unite})</div>
        </div>
        <div class="entity-contact" title="Mail: ${user.mail}&#10;Téléphone: ${user.tph}&#10;Portable: ${user.port}&#10;Qualification: ${user.qualification}&#10;Spécificité: ${user.specificite}">
            <div class="entity-attribute display-mail"><span class="entity-contact-icon">📧</span>&nbsp;<a href="mailto:${user.mail}">${user.mail}</a></div>
            <div class="entity-attribute display-numero-fixe"><span class="entity-contact-icon">📞</span>&nbsp;${user.tph}</div>
            <div class="entity-attribute display-numero-port"><span class="entity-contact-icon">📱</span>&nbsp;${user.port}</div>
        </div>
        <div class="entity-other">
            <div class="entity-attribute">Qualification:&nbsp;<strong>${user.qualification}</strong></div>
            <div class="entity-attribute">Statut:&nbsp;${user.statut_corps}</div>
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

    private addSelector(data: { id: string, label: string }[], complements: string[], cb: ((this: HTMLInputElement, ev: Event) => any) | null): HTMLElement {
        const group = document.createElement('group')
        group.classList.add('column-radios');
        data.forEach(({ id, label }) => {
            const div = document.createElement('div')
            const input = document.createElement('input')
            input.setAttribute('type', 'radio');
            input.setAttribute('name', 'entity-radio');
            input.setAttribute('value', id);
            input.dataset.liste = complements.join(' ');
            input.classList.add('prompt-input');
            if (cb)
                input.addEventListener('change', cb);
            div.appendChild(input);

            const input_label = document.createElement('label');
            input_label.textContent = label
            div.appendChild(input_label);
            group.appendChild(div);
        });


        return group;
    }

    private async typeMessage(element: HTMLElement, text: string, cb: Function | null = null): Promise<void> {
        return new Promise((resolve) => {
            const max_duration = 1000;
            const speed = this.speed * text.length > max_duration ? Math.round(max_duration / text.length) : this.speed;
            const textSpan = element.querySelector('.text');
            let i = 0;

            function typeChar() {
                if (i < text.length) {
                    if (textSpan === null)
                        return;
                    textSpan.textContent += text.charAt(i); // Ajoute un char
                    textSpan.classList.add('visible'); // Rend visible avec la transition CSS
                    i++;
                    setTimeout(typeChar, speed);
                } else {
                    // Fin du typing : virer la classe et le curseur
                    element.classList.remove('typing');
                    element.style.setProperty('--after-display', 'none'); // Ou via CSS si tu préfères
                    setTimeout(() => {
                        const bubbleCtnr = document.querySelector('#bubble-container .row');
                        bubbleCtnr && setTimeout(() => {
                            bubbleCtnr.scrollTop = bubbleCtnr.scrollHeight;
                        }, 300);
                        resolve(cb && cb());

                    }, 300); // Appel du callback s'il y en a un
                }
            }

            typeChar(); // Lance le premier timeout
        })
    }
}

async function table_template(users: User[]): Promise<HTMLTableElement> {

    const fonctions = {
        'C': "Commandant d'unité",
        'A': "Commandant d'unité en second",
        'S': "Second"
    };

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    ['Grade', 'Nom Prénom', 'Spéc.', 'Tph fixe', 'Néo', 'Mail'].map(term => {
        const th = document.createElement('th');
        th.setAttribute('scope', 'col');
        if (['Spéc.', 'Tph fixe', 'Néo'].includes(term))
            th.classList.add('on-compact-hide');
        th.textContent = term;
        if (term === 'Spéc.')
            th.setAttribute('title', 'Spécificité');
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    users.map(user => {
        const tr = document.createElement('tr');

        const td1 = document.createElement('td');
        td1.innerHTML = ['C', 'A', 'S'].includes(user.fonction) ?
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"/></svg>' : '';
        td1.innerHTML += user.grade;
        if (user.fonction === 'C') {
            td1.classList.add('gold');
            td1.setAttribute('title', fonctions[user.fonction as 'C'])
        } else if (['A', 'S'].includes(user.fonction)) {
            td1.classList.add('silver');
            td1.setAttribute('title', fonctions[user.fonction as 'C' | 'A']);
        }
        tr.appendChild(td1);

        const td2 = document.createElement('td');
        td2.setAttribute('title', user.prenom + ' ' + user.nom + ' (' + user.nigend + ')');
        td2.textContent = truncate(user.prenom + ' ' + user.nom, 24) + ' (' + user.nigend + ')';
        tr.appendChild(td2);

        const td3 = document.createElement('td');
        td3.textContent = user.qualification + (user.specificite != "" ? " " + user.specificite : "");
        td3.classList.add('on-compact-hide');
        tr.appendChild(td3);

        const td4 = document.createElement('td');
        td4.textContent = user.tph.replace(/\s/g, '.');
        td4.classList.add('on-compact-hide');
        tr.appendChild(td4);

        const td5 = document.createElement('td');
        td5.textContent = user.port.replace(/\s/g, '.');
        td5.classList.add('on-compact-hide');
        tr.appendChild(td5);

        const td6 = document.createElement('td');
        const a = document.createElement('a');
        a.setAttribute('href', `mailto:${user.mail}`);
        a.innerHTML = '<span class="entity-contact-icon">📧</span>&nbsp;' + user.mail.replace(/@gend.*$/, '');
        td6.appendChild(a);
        td6.setAttribute('title', user.mail);
        tr.appendChild(td6);

        tbody.appendChild(tr);

    });

    table.appendChild(tbody);

    return table;
}