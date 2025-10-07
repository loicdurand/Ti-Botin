import nlp from 'compromise';
import utils from './utils';

type Words = { [key: string]: string }
type Category = 'Organization' | 'City' | 'Attribute' | 'FirstName' | 'Name';

export default class Chat {
    private aliasses: Record<Category, { commune: string, aliasses: string[] }[]> = {
        Organization: [],
        City: [],
        Attribute: [],
        FirstName: [],
        Name: []
    };
    private words: Words = {};
    private nlp = nlp;

    constructor() {
        return this;
    }

    public addWords(
        values: string[] = [],
        category: Category
    ) {
        // if (category === 'Organization')
        //     values.forEach(val => this.orgs.push(val));
        values.forEach(val => this.words[val] = category);
        return this;
    }

    public addAliasses(
        values: ({
            "commune": string,
            "aliasses": string[]
        })[] = [],
        category: Category
    ) {
        this.aliasses[category] = [];
        values.forEach(value => this.aliasses[category].push(value));
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

        // Logique pour déterminer le type et les termes
        let type, term, city;
        if (people.length > 0) {
            type = 'person';
            term = people.join(' ');
            city = null;
        } else if (organizations.length > 0) {
            type = 'unite';
            term = organizations.join(' ');
            city = this.replaceAlias(cities.join(' '));
        } else {
            type = 'unknown';
            term = null;
            city = null;
        }

        // Mappe les attributs (ex. : "numéro portable" -> "telephone_portable")
        // let mappedAttributes = [];
        // if (attributes.includes('numero') && attributes.includes('portable')) {
        //     mappedAttributes.push('telephone_portable');
        // } else if (attributes.includes('email')) {
        //     mappedAttributes.push('email');
        // } else if (attributes.includes('adresse')) {
        //     mappedAttributes.push('adresse');
        // }

        return {
            type,
            term,
            city,
            // mappedAttributes: mappedAttributes.join(' '),
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
            // utils.string.sansAccent,
            // (q: string) => q.toLowerCase(),
            // (q: string) => q.replace(/['-]/g, ' ')
            (q: string) => q.replaceAll(/[\?\.]?$/g, '')
        )(query);
    }

    private replaceAlias(city: string) {

        if (!city || city === null)
            return null;

        const alias_exists = this.aliasses.City.find(({ commune, aliasses }) => {
            return aliasses.includes(city.trim());
        });

        if (alias_exists === null || !alias_exists)
            return city;

        return alias_exists.commune;
    }
}







