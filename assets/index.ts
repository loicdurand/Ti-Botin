import chargement_de_la_carte from "./typescripts/chargement_carte";

let signets: Set<number> = new Set();  // IDs des signets (simule session)

document.addEventListener('DOMContentLoaded', async () => {

  const map = await chargement_de_la_carte(handleMarkerClick);

  function addSignetToUI(unites: any[]) {
    const signets = document.getElementById('signets-list');
    const li = document.createElement('li');
    li.className = 'signet-item';
    const unite = unites[0];

    if (unites.length == 1) {
      li.innerHTML = `<strong>${unite.name}</strong> - ${unite.code}`;
      li.onclick = () => map.setView([+unite.lat, +unite.lon], 11);  // Zoom sur clic signet
      signets?.insertBefore(li, signets.firstChild);
    } else {
      const h3 = document.createElement('h3');
      h3.innerHTML = unite.label;
      li.appendChild(h3);
      const ul = document.createElement('ul');
      unites.forEach(unite => {
        const sub_li = document.createElement('li');
        sub_li.innerHTML = `<strong>${unite.name}</strong> - ${unite.code}`;
        sub_li.onclick = () => map.setView([+unite.lat, +unite.lon], 11);  // Zoom sur clic signet
        ul.appendChild(sub_li);
      });
      li.appendChild(ul);
      signets?.insertBefore(li, signets.firstChild);

    }
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

  }

  // Prompt send
  document.getElementById('send-btn')?.addEventListener('click', async () => {
    const input = document.getElementById('prompt-input') as HTMLInputElement;
    const query = input.value.trim();
    if (!query) return;

    console.log({ query });

    // Fetch recherche API
    // const res = await fetch('/api/search', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: `q=${encodeURIComponent(query)}`
    // });
    // const unites = await res.json();

    // Clear markers + add new
    // pointsLayer.clearLayers();
    // addMarkers(unites);

    input.value = '';
  });
});