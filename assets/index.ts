import * as L from 'leaflet';

import chargement_de_la_carte from "./typescripts/chargement_carte";

let signets: Set<number> = new Set();  // IDs des signets (simule session)

async function onReady(selector: string): Promise<any> {
  while (document.querySelector(selector) === null)
    await new Promise(resolve => requestAnimationFrame(resolve));
  return document.querySelector(selector);
};

function addSignetToUI(unites: any[]) {
  unites.forEach(unite => {
    const signets = document.getElementById('signets-list');
    const li = document.createElement('li');
    li.className = 'signet-item';
    li.innerHTML = `<strong>${unite.name}</strong> - ${unite.code}`;
    // li.onclick = () => map.setView([+unite.lat, +unite.lon], 12);  // Zoom sur clic signet
    signets?.insertBefore(li, signets.firstChild);
  });
}

function markAsSurveilled(id: number) {
  // Ex: Ajoute classe ou badge
  const item = document.querySelector(`[onclick*="setView"]`);  // À raffiner
  if (item) item.classList.add('surveillance');
}

async function handleMarkerClick(adresse_id: number) {

  // Fetch API Symfony
  const response = await fetch(`/export/api/unite/${adresse_id}`);
  if (!response.ok) return;
  const unites = await response.json();

  // Ajoute signet si absent
  if (!signets.has(adresse_id)) {
    signets.add(adresse_id);
    addSignetToUI(unites);
  }

  // Marque en surveillance (update UI)
  markAsSurveilled(adresse_id);

  // Optionnel : Popup détails
  // L.popup()
  //   .setLatLng([+adresse.lat, +adresse.lon])
  //   .setContent(`<b>${adresse.nom}</b><br>${adresse.details}`)
  //   .openOn(map);
}

onReady('#map').then(async () => {

  const map = await chargement_de_la_carte(handleMarkerClick);

  // Prompt send
  document.getElementById('send-btn')?.addEventListener('click', async () => {
    const input = document.getElementById('prompt-input') as HTMLInputElement;
    const query = input.value.trim();
    if (!query) return;

    // Fetch recherche API
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `q=${encodeURIComponent(query)}`
    });
    // const unites = await res.json();

    // Clear markers + add new
    // pointsLayer.clearLayers();
    // addMarkers(unites);

    input.value = '';
  });
});