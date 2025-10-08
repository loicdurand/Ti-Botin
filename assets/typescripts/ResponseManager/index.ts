import ReponseGenerator from './ReponseGenerator';

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

    public printPersonMessage(data: Object[]) {
        const nb_results = data.length;
        // Cas facile: aucun résultat
        if (!nb_results) {
            this.bubble.innerHTML = this.responder.no_result;
            // Cas facile: 1 seul résultat
        } else if (nb_results == 1) {

        } else {

            if (!this.userIsConnected) {
                prompt(``)
            }
        }
    }

    public printUnknownMessage(): this {
        this.bubble.innerHTML = this.responder.no_result;
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
}