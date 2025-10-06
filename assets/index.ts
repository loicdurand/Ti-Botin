import * as L from 'leaflet';
import axios from "axios";

interface Adresse {
  id: string,
  lat: string,
  lng: string,
  label: string
}

async function onReady(selector: string): Promise<any> {
  while (document.querySelector(selector) === null)
    await new Promise(resolve => requestAnimationFrame(resolve));
  return document.querySelector(selector);
};

async function fetchAdresses(): Promise<Adresse[]> {
  const { data } = await axios.get("/export/api/adresses");
  return data;
}

async function chargement_de_la_carte() {

  const deptCode = '971';

  const adresses = await fetchAdresses();

  // Initialiser la carte centrée sur la France par défaut
  const map = L.map('map').setView([16.25, -61.56], 10);  // Centre approx. France, zoom national

  // Ajouter les tuiles OpenStreetMap (gratuit, open-source)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // URL du GeoJSON des départements (tous inclus, simplifié)
  const geoJsonUrl = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-avec-outre-mer.geojson';

  // Group pour les points
  const pointsLayer = L.layerGroup().addTo(map);
  console.log({ adresses });
  if (adresses.length) {
    adresses.forEach(point => {
      const marker = L.marker([+point.lat, +point.lng], {
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
      const deptFeature = geoJson.features.find((feature: any) => feature.properties.code === deptCode);

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

onReady('#map').then(chargement_de_la_carte);