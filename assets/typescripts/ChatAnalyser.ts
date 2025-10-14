import nlp from 'compromise';
import utils from './utils';

import { AnalysisResult, Words, Category, User, Unite } from './types';

export default class Chat {
    private aliasses: Record<Category, { value: string, aliasses: string[] }[]> = {
        Organization: [],
        City: [],
        Attribute: [],
        FirstName: [],
        Name: [],
        Fonction: [],
        Liste: []
    };
    private words: Words = {};
    private nlp = nlp;

    private context: User | Unite | null = null;

    constructor() {
        return this;
    }

    public getContext() {
        return this.context;
    }

    public setContext(context: User | Unite) {
        this.context = context;
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
            "value": string,
            "aliasses": string[]
        })[] = [],
        category: Category
    ) {
        this.aliasses[category] = [];
        values.forEach(value => this.aliasses[category].push(value));
        return this;
    }

    public analyzeMessage(query: string): AnalysisResult {

        this.extends();

        const message = this.sanitize(query);

        const doc = this.nlp(message);

        // Détection des entités
        const number = doc.numbers().out('array').join(' ') || null; // Ex. : ['6804']
        const people = doc.people().out('array'); // Ex. : ['Thomas']
        const organizations = doc.organizations().out('array'); // Ex. : ['unité marketing']
        const cities = doc.places().out('array');
        const attributes = doc.match('#Attribute').out('array'); // Ex. : ['numéro', 'portable'] 
        const listes = doc.match('#Liste').out('array'); // Ex: ['liste', 'personnels', 'opj']

        // Logique pour déterminer le type et les termes
        let // 
            type: 'number' | 'unite' | 'person' | 'liste' | 'unknown',
            term: string | null,
            city: string | null,
            liste: string | null;

        if (number !== null) {
            type = 'number';
            term = organizations.length > 0 ? this.replaceAlias(organizations.join(' '), 'Organization') : people.length > 0 ? people.join(' ') : null;
            city = this.replaceAlias(cities.join(' '), 'City');
            liste = null;
        } else if (organizations.length > 0) {
            type = 'unite';
            term = this.replaceAlias(organizations.join(' '), 'Organization');
            city = this.replaceAlias(cities.join(' '), 'City');
            liste = listes.join(' ');
        } else if (people.length > 0) {
            type = 'person';
            term = people.join(' ');
            city = null;
            liste = null;
        } else {
            type = 'unknown';
            term = null;
            city = null;
            liste = null;
        }

        return {
            type,
            term,
            city,
            number,
            attributes,
            liste
        };
    }

    private extends(): Chat {

        this.nlp.extend({
            tags: {
                Name: {
                    isA: 'Person', // Hérite de Person pour être détecté par doc.people()
                },
                Fonction: {
                    isA: 'Person'
                }
            },
            words: this.words,
        });

        return this;
    }

    private sanitize(query: string): string {
        return utils.pipe(
            utils.string.normalizeAccents,
            // (q: string) => q.replaceAll("-", ' '),
            // (q: string) => q.replaceAll("'", ' '),
            // (q: string) => q.replaceAll(",", ' '),
            (q: string) => q.replaceAll(/[-,']/g, ' '),
            (q: string) => q.replaceAll(/[\?\.]?$/g, '')
        )(query);
    }

    private replaceAlias(org: string, category: Category) {

        if (!org || org === null)
            return null;

        const alias_exists = this.aliasses[category].find(({ aliasses }) => {
            return aliasses.includes(org.trim());
        });

        if (alias_exists === null || !alias_exists)
            return org;

        return alias_exists.value;
    }
}







