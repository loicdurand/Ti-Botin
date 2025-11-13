import { normalizeAccents } from './typescripts/utils/str';
import { buildTree } from './typescripts/utils/obj';
import { getParent } from './typescripts/utils/document';
import * as terms from './typescripts/lexic';
import chargement_de_la_carte from "./typescripts/chargement_carte";
import ResponseManager from "./typescripts/ResponseManager";
import Chat from "./typescripts/ChatAnalyser";
import { Point } from './typescripts/types';

import { AnalysisResult, User, Unite, FetchResult } from './typescripts/types';

// let signets: Set<number> = new Set();  // IDs des signets (simule session)

document.addEventListener('DOMContentLoaded', async () => {

  // Prompt send
  const send = document.getElementById('send-btn') as HTMLButtonElement;
  const input = document.getElementById('prompt-input') as HTMLInputElement;

  send?.addEventListener('click', handleSendEvent);
  input?.addEventListener('keyup', e => {
    if ((e as KeyboardEvent).key === 'Enter') handleSendEvent();
  });

  document.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    if (!target)
      return;

    if (target.matches('#liste-personnels-bubble .column-radios input')) {

      handleListePersonnelsAffinerUniteClick(target as HTMLInputElement);

    } else if (target.matches('.entity-card *')) {
      const entity_card = getParent(target, '.entity-card') as HTMLElement;// bubble.querySelector('.entity-card') as HTMLElement;
      if (target.matches('section section + .entity-card *')) {
        const ctnr = document.getElementById('bubble-container');
        ctnr?.classList.add('big');
      } else {
        entity_card.classList.toggle('expanded');
      }
    } else if (target.matches('#map')) {
      document.getElementById('bubble-container')?.classList.remove('big');
    }else if(target.matches('footer.prompt-bar img')){
      openSmallWindow();
    }
  })

  const map = await chargement_de_la_carte(handleMarkerClick);

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

  }

  async function handleListePersonnelsAffinerUniteClick(target: HTMLInputElement) {

    const label = target.nextElementSibling?.innerHTML?.replace(/^.*-\s/, '') || '';
    const complement = target.dataset.liste

    input.value = `Établis la liste des personnels ${complement} au sein de ${label}`;
    send.dispatchEvent(new Event('click'));

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

  const fonction_terms = Object.keys(chat_data.commandement_terms).map(key => chat_data.commandement_terms[key]).flat();
  const liste_terms = Object.keys(chat_data.liste_terms).map(key => chat_data.liste_terms[key]).flat();
  const liste_actions = chat_data.liste_actions;

  const chat = new Chat()
    .addWords(chat_data.communes, 'City')
    .addWords([...chat_data.unites, 'marie-galante', 'unite', 'service', 'departement', 'brigade', 'compagnie', 'cie', 'gpt', 'ggd', 'sag', 'comgend'], 'Organization')
    .addWords([
      ...terms.TELEPHONE_TERMS,
      ...terms.MAIL_TERMS,
      ...terms.ADRESSE_TERMS,
      ...fonction_terms
    ], 'Attribute')
    .addWords(chat_data.prenoms.map(normalizeAccents), 'FirstName')
    .addWords(chat_data.noms.map(normalizeAccents), 'Name')
    .addWords(liste_terms, 'Liste')
    .addWords(liste_actions, 'Action')
    .addAliasses(chat_data.communes_alias, "City")
    .addAliasses(orgAliasses, 'Organization');

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

      let analyzed: AnalysisResult = chat.analyzeMessage(message);
      if (analyzed.type == "unknown") {
        if (chat?.getContext()?.hasOwnProperty('name')) {
          analyzed.type = 'unite';
          analyzed.term = (chat?.getContext() as Unite)?.name
        } else if (chat?.getContext()?.hasOwnProperty('liste')) {
          analyzed = { ...analyzed, ...chat.getContext(), action: analyzed.action, use_context: true };
        }
      }
      console.log(analyzed);

      // Si la demande concerne une liste de personnels,
      // on traite ça dans une autre fonction "getListeOf"
      if (analyzed.liste) {
        chat.setContext(analyzed);
        return getListeOf(analyzed, responsemanager);
      }

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
        console.log({ type });
        analyzed.type = type;
        analyzed.term = type == 'person' ? (chat.getContext() as User).prenom + ' ' + (chat.getContext() as User).nom : (chat.getContext() as Unite).name;
      }

      const { type: response_type, data }: FetchResult = json;

      if (response_type == "person") {
        if (data.length === 1) {
          if (analyzed.attributes.filter(attr => fonction_terms.includes(attr))) {
            chat.setContext({ name: (data[0] as User).unite } as Unite);
          } else {
            chat.setContext(data[0] as User);
          }
        }
        responsemanager.printPersonMessage(data as User[], analyzed.attributes);
      } else if (response_type == "unite") {
        if (data.length === 1) chat.setContext(data[0] as Unite);
        responsemanager.printUniteMessage(data as Unite[], analyzed.attributes);
      } else {
        responsemanager.printUnknownMessage();
      }

    }, 1000);

    //input.value = '';
  }




});

async function getListeOf(analyzed: AnalysisResult, responsemanager: ResponseManager) {
  // Fetch recherche API
  const fetch_url = '/export/api/get-list-of';
  const res = await fetch(fetch_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `q=${encodeURIComponent(JSON.stringify(analyzed))}`
  });

  if (!res.ok)
    return false;

  let json = await res.json();
  const { data, words, url } = json;

  console.log({ data });

  responsemanager.printListeMessage(data, words, analyzed, url);
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

function openSmallWindow() {

  const url = window.location.href;
  const features = 'popup,width=520,height=994,right=0,top=100,toolbar=no,menubar=no,scrollbars=no,status=no';
  const smallWindow = window.open(url, 'smallWindow', features);

  if (!smallWindow) {
    alert('La fenêtre a été bloquée par le navigateur. Vérifiez vos paramètres de pop-ups.');
  }
}