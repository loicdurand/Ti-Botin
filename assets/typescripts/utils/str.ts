export function sansAccent(str: string): string {

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