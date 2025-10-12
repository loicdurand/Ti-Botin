export type Words = { [key: string]: string }
export type Category = 'Organization' | 'City' | 'Attribute' | 'FirstName' | 'Name';

export type AnalysisResult = {
    type: 'unite' | 'person' | 'number' | 'unknown';
    term: string | null;
    city: string | null;
    number: string | null;
    attributes: string[];
    message: string;
}

export type Point = {
    id: number,
    label: string,
    lat: string,
    lng: string
};

// Définition des types retournés par les fetchs

export type Unite = {
    code: number,
    name: string,
    cn: string, // Nom long
    lat: string,
    lng: string,
    label: string, // Nom de l'unité ou de la caserne si pls unités au même endroit
    subdivision: string,
    capacite_judiciaire: number,
    tph: string,
    mail: string,
    parent: string,
    found_column: string // Indique si personne trouvée par son TPH, mobile,
}

export type User = {
    code_unite: string,
    fonction: string,
    grade: string,
    grade_long: string,
    id: string,
    mail: string,
    nom: string,
    port: string,
    prenom: string,
    qualification: string,
    specificite: string,
    tph: string,
    unite: string,
    statut_corps: string
}

export type FetchResult = {
    type: 'person' | 'unite';
    data: User[] | Unite[];
}
