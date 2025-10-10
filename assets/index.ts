import { normalizeAccents } from './typescripts/utils/str';
import * as terms from './typescripts/lexic';
import chargement_de_la_carte from "./typescripts/chargement_carte";
import ResponseManager from "./typescripts/ResponseManager";
import Chat from "./typescripts/chat";

let signets: Set<number> = new Set();  // IDs des signets (simule session)

document.addEventListener('DOMContentLoaded', async () => {

  const map = await chargement_de_la_carte(handleMarkerClick);

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
    .addWords([...terms.TELEPHONE_TERMS, ...terms.MAIL_TERMS, ...terms.ADRESSE_TERMS], 'Attribute')
    .addWords(chat_data.prenoms.map(normalizeAccents), 'FirstName')
    .addWords(chat_data.noms.map(normalizeAccents), 'Name')
    .addAliasses(chat_data.communes_alias, "City")
    .addAliasses(orgAliasses, 'Organization');

  // Prompt send
  const send = document.getElementById('send-btn') as HTMLButtonElement;
  const input = document.getElementById('prompt-input') as HTMLInputElement;

  send?.addEventListener('click', handleSendEvent);
  input?.addEventListener('keyup', e => {
    if ((e as KeyboardEvent).key === 'Enter') handleSendEvent();
  });

  async function handleSendEvent() {

    const message = input.value.trim();
    if (!message) return;

    const sent_bubble = addBubbleToTUI('sent');
    sent_bubble.textContent = message;

    const responsemanager = new ResponseManager(addBubbleToTUI);
    responsemanager.addLoader();

    const analyzed = chat.analyzeMessage(message);
    console.log(analyzed);

    // Fetch recherche API
    const res = await fetch('/export/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `q=${encodeURIComponent(JSON.stringify(analyzed))}`
    });

    if (!res.ok)
      return false;

    const data = await res.json();

    console.log(data);
    if (analyzed.type == "person")
      responsemanager.printPersonMessage(data, analyzed.attributes);
    else if (analyzed.type == "unite")
      responsemanager.printUniteMessage(data, analyzed.attributes);
    else
      responsemanager.printUnknownMessage();

    input.value = '';
  }

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

  function addBubbleToTUI(sens: 'sent' | 'received' | 'input-bubble'): HTMLElement {
    const bubbleCtnr = document.querySelector('#bubble-container .row');
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    if (sens === 'received' || sens === 'input-bubble')
      bubble.classList.add('typing');
    if (sens === 'input-bubble') {
      bubble.classList.add('input-bubble');
      bubble.classList.add('received');
    } else {
      bubble.classList.add(`message-${sens}`);
    }
    const span = document.createElement('span');
    span.classList.add('text');
    bubble.appendChild(span);
    bubbleCtnr?.appendChild(bubble);
    return bubble;

  }


});