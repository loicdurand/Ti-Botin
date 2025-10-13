import { normalizeAccents } from './typescripts/utils/str';
import { getParent } from './typescripts/utils/document';
import * as terms from './typescripts/lexic';
import chargement_de_la_carte from "./typescripts/chargement_carte";
import ResponseManager from "./typescripts/ResponseManager";
import Chat from "./typescripts/ChatAnalyser";
import { Point } from './typescripts/types';

import { AnalysisResult, User, Unite, FetchResult } from './typescripts/types';

// let signets: Set<number> = new Set();  // IDs des signets (simule session)

document.addEventListener('DOMContentLoaded', async () => {

  document.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    if (!target)
      return;

    if (target.matches('.entity-card *')) {
      const bubble = getParent(target, '.bubble') as HTMLElement;
      const entity_card = bubble.querySelector('.entity-card') as HTMLElement;
      entity_card.classList.toggle('expanded');
    }
  })

  const map = await chargement_de_la_carte(handleMarkerClick);

  // function markAsSurveilled(id: number) {
  //   // Ex: Ajoute classe ou badge
  //   const item = document.querySelector(`[onclick*="setView"]`);  // À raffiner
  //   if (item) item.classList.add('surveillance');
  // }

  async function handleMarkerClick(point: Point) {
    const { id: adresse_id, label } = point;
    const sent_bubble = addBubbleToTUI('sent');
    sent_bubble.textContent = `Recherche les infos concernant ${label}`;
    setTimeout(() => {
      sent_bubble.classList.add('appear');
    }, 100);

    const responsemanager = new ResponseManager(addBubbleToTUI);
    responsemanager.addLoader();
    // Fetch API Symfony
    const response = await fetch(`/export/api/unite/${adresse_id}`);
    if (!response.ok) return;
    const unites = await response.json();

    map.setView([+unites[0].lat, +unites[0].lng], 11)
    responsemanager.printUniteMessage(unites, []);

    // Ajoute signet si absent
    // if (!signets.has(adresse_id)) {
    //   signets.add(adresse_id);
    //   addSignetToUI(unites);
    // }

    // Marque en surveillance (update UI)
    // markAsSurveilled(adresse_id);

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
    .addWords([
      ...terms.TELEPHONE_TERMS,
      ...terms.MAIL_TERMS,
      ...terms.ADRESSE_TERMS,
      ...Object.keys(chat_data.commandement_terms).map(key => chat_data.commandement_terms[key]).flat()
    ], 'Attribute')
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

  async function handleSendEvent(): Promise<void> {

    const message = input.value.trim();
    if (!message) return;

    const sent_bubble = addBubbleToTUI('sent');
    sent_bubble.textContent = message;
    setTimeout(() => {
      sent_bubble.classList.add('appear');
    }, 100);

    setTimeout(async () => {
      const responsemanager = new ResponseManager(addBubbleToTUI);
      responsemanager.addLoader();

      const analyzed: AnalysisResult = chat.analyzeMessage(message);

      console.log(analyzed);

      // Fetch recherche API
      const fetch_url = analyzed.type === 'number' ? '/export/api/find-by-number' : '/export/api/search';
      const res = await fetch(fetch_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `q=${encodeURIComponent(JSON.stringify(analyzed))}`
      });

      if (!res.ok)
        return false;

      let json = await res.json();

      if (analyzed.type === 'number') {

        const results: FetchResult[] = json.filter((result: FetchResult) => result.data.length > 0);

        if (results.length === 1) {
          json = results[0];
        } else {

          responsemanager.printVariedResultsMessage(results, analyzed.attributes);

          return;

        }
      }

      if (analyzed.type == "unknown" && analyzed.attributes.length > 0 && chat.getContext() !== null) {
        const type = chat.getContext()?.hasOwnProperty('prenom') ? 'person' : 'unite';
        analyzed.type = type;
        analyzed.term = type == 'person' ? (chat.getContext() as User).prenom + ' ' + (chat.getContext() as User).nom : (chat.getContext() as Unite).name;
      }

      const { type: response_type, data }: FetchResult = json;

      console.log(data);

      if (response_type == "person") {
        if (data.length === 1) chat.setContext(data[0] as User);
        responsemanager.printPersonMessage(data as User[], analyzed.attributes);
      } else if (response_type == "unite") {
        if (data.length === 1) chat.setContext(data[0] as Unite);
        responsemanager.printUniteMessage(data as Unite[], analyzed.attributes);
      } else {
        responsemanager.printUnknownMessage();
      }

    }, 1000);

    // input.value = '';
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