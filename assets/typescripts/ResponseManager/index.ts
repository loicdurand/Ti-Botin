import { normalizeAccents, pluralize } from '../utils/str';
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

    public async printListeMessage(data: Unite[], words: { [K in 'statut' | 'qualification']: string[] }, analyzed: AnalysisResult) {
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
            this.bubble.innerHTML += `
                    <h3>${unite.code} - <strong>${unite.name}</strong></h3>
                    <span class="text"></span>`;

            await this.typeMessage(this.bubble, this.responder.list_users_intro);
            this.bubble.querySelector('.text')?.classList.remove('text');
            // this.bubble.innerHTML += '<br/>';
            // const section = document.createElement('section');
            document.getElementById('bubble-container')?.classList.add('big');

            this.bubble.appendChild(this.renderTreeToHTML(unite, false));
            // this.bubble.appendChild(section);
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

    private renderTreeToHTML(unite: Unite, with_title: boolean = true) {

        const section = document.createElement('section');
        if (with_title) {
            const h4 = document.createElement('h4');
            h4.innerHTML = `${unite.code} -  <strong>${unite.name}</strong>`;
            section.appendChild(h4);
        }

        if (unite?.users?.length)
            section.appendChild(table_template(unite.users as User[]));
        else
            section.innerHTML += '<span>Aucun personnel à afficher pour cette unité.</span>';

        if (!unite.hasOwnProperty('children')) {
            return section;
        }

        if (unite.children && unite.children.length > 0) {
            const p = document.createElement('p');
            unite.children.forEach(child => {
                p.appendChild(this.renderTreeToHTML(child));
            });
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
            <div class="entity-attribute display-mail"><span class="entity-contact-icon">📧</span>&nbsp;${unite.mail}</div>
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
            <strong>${user.prenom} ${user.nom}</strong>
        </div>
        <div class="entity-details">
            ${['C', 'A'].includes(user.fonction) ?
                `<div class="entity-fonction entity-attribute display-unite">${fonctions[user.fonction as ('A' | 'C')]}</div>` : ''
            }
            <div class="entity-unit display-unite">${user.unite} (${user.code_unite})</div>
        </div>
        <div class="entity-contact" title="Mail: ${user.mail}&#10;Téléphone: ${user.tph}&#10;Portable: ${user.port}&#10;Qualification: ${user.qualification}&#10;Spécificité: ${user.specificite}">
            <div class="entity-attribute display-mail"><span class="entity-contact-icon">📧</span>&nbsp;${user.mail}</div>
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

function table_template(users: User[]): HTMLTableElement {

    const fonctions = {
        'C': {
            short: "CDU",
            long: "Commandant d'unité"
        },
        'A': {
            short: "2nd",
            long: "Commandant d'unité en second"
        },
        'S': {
            short: "2nd",
            long: "Second"
        }
    },
        getFn = (user: User) => ({
            short: fonctions.hasOwnProperty(user.fonction) ? fonctions[user.fonction as ('C' | 'A' | 'S')].short : "",
            long: fonctions.hasOwnProperty(user.fonction) ? fonctions[user.fonction as ('C' | 'A' | 'S')].long : ""
        });

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    ['Fonction', 'Grade', 'Nom Prénom', 'Spéc.', 'Tph fixe', 'Néo', 'Mail'].map(term => {
        const th = document.createElement('th');
        th.setAttribute('scope', 'col');
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
        const td0 = document.createElement('td');
        td0.setAttribute('title', getFn(user).long);
        td0.textContent = getFn(user).short;
        tr.appendChild(td0);

        const td1 = document.createElement('td');
        td1.textContent = user.grade;
        tr.appendChild(td1);

        const td2 = document.createElement('td');
        td2.textContent = user.prenom + ' ' + user.nom;
        tr.appendChild(td2);

        const td3 = document.createElement('td');
        td3.textContent = user.qualification + (user.specificite != "" ? " " + user.specificite : "");
        tr.appendChild(td3);

        const td4 = document.createElement('td');
        td4.textContent = user.tph.replace(/\s/g, '.');
        tr.appendChild(td4);

        const td5 = document.createElement('td');
        td5.textContent = user.port.replace(/\s/g, '.');
        tr.appendChild(td5);

        const td6 = document.createElement('td');
        td6.setAttribute('title', user.mail);
        td6.textContent = user.mail.replace(/@gend.*$/, '@gend...');
        tr.appendChild(td6);

        tbody.appendChild(tr);

    });

    table.appendChild(tbody);

    return table;
}