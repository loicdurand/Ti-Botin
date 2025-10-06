import L, { pointsLayer } from 'leaflet';
import axios from "axios";


async function fetchUnites() {
    const { data } = await axios.get("/export/api/unites");
    return data;
}

// Fonction pour créer une icône SVG custom avec nombre
// function createNumberIcon(number) {
//     // SVG basique : cercle rouge avec nombre centré en blanc
//     const svg = `
//                 <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
//                     <circle cx="15" cy="15" r="14" fill="#ff0000" stroke="#cc0000" stroke-width="1"/>
//                     <text x="15" y="19" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${number}</text>
//                 </svg>
//             `;
//     return L.divIcon({
//         html: svg,
//         className: 'custom-number-icon',  // Classe CSS optionnelle pour styling global
//         iconSize: [30, 30],  // Taille de l'icône
//         iconAnchor: [15, 30],  // Ancrage : bas du cercle au point exact
//         popupAnchor: [0, -30]  // Position du popup au-dessus
//     });
// }

export default async () => {

    let deptCode = '971';

    // Initialiser la carte centrée sur la France par défaut
    const map = L.map('map').setView([16.25, -61.56], 10);  // Centre approx. France, zoom national

    // Ajouter les tuiles OpenStreetMap (gratuit, open-source)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // URL du GeoJSON des départements (tous inclus, simplifié)
    const geoJsonUrl = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-avec-outre-mer.geojson';

    // Group pour les points (optionnel, pour les toggler si besoin)
    const pointsLayer = L.layerGroup().addTo(map);

    const { data: unites } = await fetchUnites();

    if (unites.length) {
        unites.forEach(point => {
            const marker = L.marker([point.lat, point.lng], {
                //icon: createNumberIcon(point.id)
            }).addTo(pointsLayer);
            if (point.label) {
                marker.bindPopup(`<b>${point.label}</b><br>Lat: ${(+point.lat).toFixed(4)}, Lng: ${(+point.lng).toFixed(4)}`);
            }
        });
    }

    // Charger et afficher le département
    fetch(geoJsonUrl)
        .then(response => response.json())
        .then(geoJson => {
            // Filtrer la feature pour le code département
            const deptFeature = geoJson.features.find(feature => feature.properties.code === deptCode);

            if (!deptFeature) {
                console.error(`Département ${deptCode} non trouvé.`);
                return;
            }

            // Ajouter la layer GeoJSON avec style personnalisé (bordure rouge, remplissage semi-transparent)
            const deptLayer = L.geoJSON(deptFeature, {
                style: {
                    color: '#ff0000',  // Bordure rouge
                    weight: 3,
                    opacity: 0.8,
                    fillColor: '#ffcccc',  // Remplissage rose clair
                    fillOpacity: 0.5
                },
                onEachFeature: (feature, layer) => {
                    // Popup avec nom du département (optionnel)
                    layer.bindPopup(`Département : ${feature.properties.nom}`);
                }
            }).addTo(map);

            // Centrer et zoomer sur le département
            map.fitBounds(deptLayer.getBounds(), { padding: [20, 20] });
        })
        .catch(error => console.error('Erreur chargement GeoJSON:', error));

};