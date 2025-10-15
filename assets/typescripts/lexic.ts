export const FIXES_TERMS = [
    'fix', 'fixe'
];

export const MOBILE_TERMS = [
    'port', 'portable', 'mobile', 'neo', 'neogend', 'neo2'
];

export const TELEPHONE_TERMS = [
    ...FIXES_TERMS,
    ...MOBILE_TERMS,
    'numero', 'num', 'n°', 'telephone', 'tel', 'tph'
];

export const MAIL_TERMS = [
    'email', 'courriel', 'e-mail', 'mail'
];

export const ADRESSE_TERMS = [
    'adresse', 'postale', 'rue', 'commune', 'ville', 'endroit', 'lieu', 'trouve'
];

export const RECHERCHE_CDU_TERMS = [
    'commande', 'commandant', 'cdt', 'c1'
]
export const RECHERCHE_ADJOINT_TERMS = [
    'c2', 'adjoint'
];
export const RECHERCHE_FONCTION_TERMS = [
    ...RECHERCHE_CDU_TERMS, ...RECHERCHE_ADJOINT_TERMS
];