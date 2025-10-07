import nlp from 'compromise';
import utils from './utils';

type Words = { [key: string]: string }

export default class Chat {
    private orgs: string[] = [];
    private words: Words = {};
    private nlp = nlp;

    constructor() {
        return this;
    }

    public addWords(
        values: string[] = [],
        category: ('Organization' | 'City' | 'Attribute' | 'FirstName' | 'Name')
    ) {
        if (category === 'Organization')
            values.forEach(val => this.orgs.push(val));
        values.forEach(val => this.words[val] = category);
        return this;
    }

    public analyzeMessage(query: string) {

        this.extends();
        const message = this.sanitize(query);
        const doc = this.nlp(message);

        // Détection des entités
        const people = doc.people().out('array'); // Ex. : ['Thomas']
        const organizations = doc.organizations().out('array'); // Ex. : ['unité marketing']
        const cities = doc.places().out('array');
        const attributes = doc.match('#Attribute').out('array'); // Ex. : ['numéro', 'portable']
        console.log({ organizations });

        // Logique pour déterminer le type et les termes
        let type, term;
        if (people.length > 0) {
            type = 'person';
            term = people[0];
        } else if (organizations.length > 0) {
            //const re = new RegExp('(le|la|les|l|de|des|d)[\s-\']', 'gi');
            type = 'unite';
            term = [organizations, cities].join(' ');//.replace(re, '').trim();
        } else {
            type = 'unknown';
            term = null;
        }

        // Mappe les attributs (ex. : "numéro portable" -> "telephone_portable")
        let mappedAttributes = [];
        if (attributes.includes('numero') && attributes.includes('portable')) {
            mappedAttributes.push('telephone_portable');
        } else if (attributes.includes('email')) {
            mappedAttributes.push('email');
        } else if (attributes.includes('adresse')) {
            mappedAttributes.push('adresse');
        }

        return {
            type,
            term,
            mappedAttributes: mappedAttributes.join(' '),
            attributes: attributes.join(' '),
            message
        };
    }

    private extends(): Chat {

        this.nlp.extend({
            words: this.words,
        });

        return this;
    }

    private sanitize(query: string): string {
        return utils.pipe(
            utils.string.sansAccent,
            (q: string) => q.toLowerCase(),
            (q: string) => q.replace(/['-]/g, ' ')
        )(query);
    }
}







