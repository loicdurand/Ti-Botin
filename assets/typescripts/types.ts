export type Words = { [key: string]: string }
export type Category = 'Organization' | 'City' | 'Attribute' | 'FirstName' | 'Name';

export type Point = {
    id: number,
    label: string,
    lat: string,
    lng: string
};

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
    parent: string
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