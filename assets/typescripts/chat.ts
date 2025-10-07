import nlp from 'compromise';

const words: { [key: string]: string } = {};

const orgs: string[] = ['unite', 'service', 'departement', 'bta', 'brigade', 'cgd', 'cie', 'compagnie', 'gpt', 'ggd', 'comgend', 'br', 'sr', 'solc', 'dsolc', 'sag'];
orgs.forEach(org => words[org] = 'Organization');

const attrs: string[] = ['numero', 'num', 'n°', 'telephone', 'tel', 'fixe', 'fix', 'portable', 'mobile', 'port', 'email', 'courriel', 'e-mail', 'mail', 'adresse'];
attrs.forEach(attr => words[attr] = 'Attribute');

const prenoms: string[] = ['Loïc', 'loic', 'Michel', 'michel', 'Jean-Michel', 'jean-michel', 'jean michel', 'j michel', 'j-m'];
prenoms.forEach(prenom => words[prenom] = 'FirstName');

function pipe(...fns: Function[]) {
    return function (x: any) {
        return fns.reduce((v, f) => f(v), x)
    }
}

function sansAccent(str: string): string {

    str ||= '';

    const // 
        accents = [
            /[\xC0-\xC6]/g, /[\xE0-\xE6]/g, // A, a
            /[\xC8-\xCB]/g, /[\xE8-\xEB]/g, // E, e
            /[\xCC-\xCF]/g, /[\xEC-\xEF]/g, // I, i
            /[\xD2-\xD8]/g, /[\xF2-\xF8]/g, // O, o
            /[\xD9-\xDC]/g, /[\xF9-\xFC]/g, // U, u
            /[\xD1]/g, /[\xF1]/g, // N, n
            /[\xC7]/g, /[\xE7]/g, // C, c
        ]
        , noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];

    for (var i = 0; i < accents.length; i++)
        str = str.replace(accents[i], noaccent[i]);

    return str;
}

function sanitize(query: string): string {
    return pipe(
        sansAccent,
        (q: string) => q.toLowerCase(),
        (q: string) => q.replace(/'/, ' ')
    )(query);
}
// Étendre pour le français
nlp.extend({
    words,
});

export default function analyzeMessage(query: string) {
    const message = sanitize(query);
    const doc = nlp(message);

    // Détection des entités
    const people = doc.people().out('array'); // Ex. : ['Thomas']
    const organizations = doc.organizations().out('array'); // Ex. : ['unité marketing']
    const attributes = doc.match('#Attribute').out('array'); // Ex. : ['numéro', 'portable']

    // Logique pour déterminer le type et les termes
    let type, term;
    if (people.length > 0) {
        type = 'person';
        term = people[0];
    } else if (organizations.length > 0) {
        const re = new RegExp(orgs.join('|'), 'gi');
        type = 'unite';
        term = organizations[0].replace(re, '').trim();
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
