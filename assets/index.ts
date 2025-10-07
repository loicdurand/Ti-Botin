import chargement_de_la_carte from "./typescripts/chargement_carte";
import Chat from "./typescripts/chat";

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

  let chat_data: any = {};
  const chat_response = await fetch('/export/api/chat-data');
  if (chat_response.ok)
    chat_data = await chat_response.json();

  chat_data.communes_alias.map(({ aliasses }: any) => {
    aliasses.forEach((alias: string) => chat_data.communes.push(alias));
  });

  const deptCode = '971';
  const deptLettres = {
    '971': 'gp'
  }

  const orgAliasses = [
    { value: 'bta', aliasses: ['brigade', 'unite'] },
    { value: 'cgd', aliasses: ['cie', 'compagnie'] },
    { value: 'ggd', aliasses: ['groupement'] },
    { value: `comgend${deptLettres[deptCode]}`, aliasses: ['comgend'] }
  ];

  const chat = new Chat()
    .addWords(chat_data.communes, 'City')
    .addWords([...chat_data.unites, 'marie-galante', 'unite', 'service', 'departement', 'brigade', 'compagnie', 'cie', 'gpt', 'ggd', 'sag', 'comgend'], 'Organization')
    .addWords(['numero', 'num', 'n°', 'telephone', 'tel', 'fixe', 'fix', 'portable', 'mobile', 'port', 'email', 'courriel', 'e-mail', 'mail', 'adresse'], 'Attribute')
    .addWords(chat_data.prenoms, 'FirstName')
    .addWords(chat_data.noms, 'Name')
    .addAliasses(chat_data.communes_alias, "City")
    .addAliasses(orgAliasses, 'Organization');

  // Prompt send
  document.getElementById('send-btn')?.addEventListener('click', async () => {

    // const messages = [
    //   // "tel port de nicolas yuikety",
    //   // "j'ai besoin du tel de Loïc Durand",
    //   // "Donne moi l'email de Jean-Michel", // ok
    //   // "email John", // ok
    //   // "email John Doe", // ok
    //   // "Passe-moi le numéro de téléphone portable de Thomas", // ok
    //   // "tel br pap",
    //   // "tel de la solc", // ok
    //   // "Donne moi l'email de la BTA Baie-Mahault", // ok
    //   // "email sag", // ok
    //   // "email cie moule",
    //   // "Passe-moi le numéro de téléphone du comgend",
    //   "Quel est le numéro de la bta de grand bourg?",
    //   // "Quel est le numéro de la bta des saintes?"

    // ];

    // messages.forEach(message => {
    //   const result = chat.analyzeMessage(message);
    //   console.log(result); // communes_alias
    // });

    // return false;

    const input = document.getElementById('prompt-input') as HTMLInputElement;
    const message = input.value.trim();
    if (!message) return;

    // Test
    const result = chat.analyzeMessage(message);
    console.log(result);

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