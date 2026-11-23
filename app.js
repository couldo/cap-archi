'use strict';
const $=id=>document.getElementById(id);
const names={balanced:'Équilibré',diplomatic:'Diplomatique',firm:'Ferme',si:'Orientation SI',metier:'Prérequis métier',risk:'Alerte / Risque',no:'Dire non',depa:'D.E.P.A.',request:'Demande délicate',disagree:'Désaccord'};
const keys=Object.keys(names);let variants={},selected='balanced';
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200)}
function clean(s){return s.replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim()}
function splitMessage(s){let lines=clean(s).split('\n').map(x=>x.trim()).filter(Boolean);let hello=/^(bonjour|bonsoir|hello|salut)(\s|,|!|$)/i.test(lines[0]||'');if(hello)lines.shift();while(lines.length&&/^(merci( pour votre retour)?[.!]?|cordialement[,.]?|bien cordialement[,.]?)$/i.test(lines.at(-1)))lines.pop();return {hello,body:lines.join(' ')} }
function sentences(t){return (t.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(x=>x.trim()).filter(Boolean)}
function normalize(s){return s.replace(/\s+([?!;:])/g,' $1').replace(/\s+([,.])/g,'$1').replace(/\s{2,}/g,' ').trim()}
function rephrase(s,mode){let t=s.trim();const rules=[[/\bavez vosu\b/gi,'avez-vous'],[/\bavez vous\b/gi,'avez-vous'],[/\bpouvez vous\b/gi,'pouvez-vous'],[/\best ce que\b/gi,'est-ce que'],[/\bje veux\b/gi,mode==='diplomatic'?'je souhaiterais':mode==='firm'?'je demande':'je souhaite'],[/\bil faut\b/gi,mode==='firm'?'il est nécessaire de':'il conviendrait de'],[/\bvous devez\b/gi,mode==='diplomatic'?'pourriez-vous':'vous devez'],[/\bASAP\b/gi,'dès que possible']];for(const [a,b] of rules)t=t.replace(a,b);if(mode==='diplomatic'){t=t.replace(/\bPouvez-vous\b/g,'Pourriez-vous').replace(/\bMerci de\b/g,'Je vous remercie de bien vouloir');}if(mode==='firm'){t=t.replace(/\bPourriez-vous\b/g,'Pouvez-vous').replace(/\bje souhaiterais\b/gi,'je souhaite');}return normalize(t.charAt(0).toUpperCase()+t.slice(1))}
function extract(s){let m=splitMessage(s),ss=sentences(m.body);let asks=ss.filter(x=>/[?]/.test(x)||/\b(pouvez-vous|pourriez-vous|confirmer|préciser|identifier|transmettre|indiquer|demande|besoin)\b/i.test(x));let objectives=ss.filter(x=>/\b(objectif|afin de|pour disposer|permettre de|vision claire|dans le cadre)\b/i.test(x));let rest=ss.filter(x=>!asks.includes(x)&&!objectives.includes(x));return {asks,objectives,rest,body:m.body,hello:m.hello}}
function addPeriod(s){return /[.!?]$/.test(s)?s:s+'.'}
function generate(mode,src){let e=extract(src),isMail=$('channel').value==='Mail professionnel',brief=$('brief').checked,withHello=$('greeting').checked;let lines=[],changes=[],warnings=[];let asks=e.asks.map(x=>rephrase(x,mode));let objectives=e.objectives.map(x=>rephrase(x,mode));let rest=e.rest.map(x=>rephrase(x,mode));if(isMail&&withHello)lines.push('Bonjour,');
if(['balanced','diplomatic','firm','no','depa','request','disagree'].includes(mode)){
 if(mode==='diplomatic'&&objectives.length)lines.push(objectives.join(' '));
 if(rest.length)lines.push(rest.join(' '));
 if(asks.length)lines.push(asks.join(' '));
 if(mode!=='diplomatic'&&objectives.length)lines.push(objectives.join(' '));
 changes.push(mode==='diplomatic'?'Demandes formulées de manière plus souple.':mode==='firm'?'Demandes formulées plus directement, sans inventer de délai.':'Formulations corrigées et demandes rendues plus lisibles.');
 if(mode==='no'){changes.push('Dire non : clarification, reformulation, limite empathique et alternative — sans inventer de refus.');warnings.push('Le refus et l’alternative doivent être fournis par la source ; sinon, les préciser avant envoi.');}
 if(mode==='depa'){changes.push('D.E.P.A. : décrire les faits, exprimer sobrement le ressenti utile, proposer, présenter les avantages.');warnings.push('Aucun sentiment, solution ou avantage n’est inventé : compléter seulement si pertinent et vérifié.');}
 if(mode==='request'){changes.push('Demande délicate : une demande précise à la fois, sans pression et avec possibilité de plan B.');warnings.push('Si plusieurs demandes sont présentes, vérifier leur priorité.');}
 if(mode==='disagree'){changes.push('Désaccord : privilégier les faits et une position en « je », sans accusation.');warnings.push('Vérifier que la divergence est étayée par des faits dans la source.');}
 
}else{
 if(rest.length)lines.push(rest.join(' '));
 if(objectives.length)lines.push(objectives.join(' '));
 if(asks.length)lines.push(asks.join(' '));
 if(mode==='si'){changes.push('Lecture orientée contexte, demande et périmètre SI.');warnings.push('Aucune orientation d’architecture n’est créée si elle n’est pas explicitement présente dans la source.');}
 if(mode==='metier'){changes.push('Demandes d’information conservées sans transférer leur vérification à l’AE.');warnings.push('Le responsable de chaque action doit être confirmé : aucune attribution métier/projet/AE n’est inventée.');}
 if(mode==='risk'){changes.push('Les éléments de vigilance restent limités aux faits exprimés.');warnings.push('Aucun risque, impact ou niveau de criticité n’est ajouté sans information source.');}
}
if(!e.asks.length)warnings.push('Aucune demande explicite détectée : la version reste proche du texte source.');
if(/\b(tous|ensemble|exhaustif|complet|complétude)\b/i.test(src))warnings.push('Vérifier l’existence d’un périmètre de référence pour confirmer la complétude.');
if(/\b(champ|flux|application)\b/i.test(src))warnings.push('Vérifier que les objets visés (champs, applications, flux) sont correctement délimités.');
if(!brief&&isMail)lines.push(mode==='firm'?'Merci de votre retour.':'Merci pour votre retour.');
if(!lines.length||lines.every(x=>x==='Bonjour,'))lines.push(src.trim());
let output=lines.join('\n\n');
 if(mode==='request'){output=output.replace(/Pourriez-vous me confirmer/gi,'Pouvez-vous me confirmer').replace(/pourriez-vous préciser/gi,'pouvez-vous préciser');}
 if(mode==='disagree'){output=output.replace(/vous devez/gi,'je propose de').replace(/vous n’avez pas/gi,'je constate que vous n’avez pas');}
 if(mode==='depa'&&e.objectives.length&&e.asks.length){const first=e.objectives.map(x=>rephrase(x,mode)).join(' ');output=output.replace(first,'').replace(/\n{3,}/g,'\n\n').trim();output=output.replace(/^(Bonjour,\n\n)?/,(_,g)=>(g||'')+first+'\n\n');}
 if(brief)output=output.replace(/\n\nMerci[^\n]*$/,'');
return {output,changes,warnings};}
function render(){const tabs=$('tabs');tabs.replaceChildren();keys.forEach(k=>{const b=document.createElement('button');b.type='button';b.className='scenario-tab'+(k===selected?' active':'');b.textContent=names[k];b.addEventListener('click',()=>{variants[selected].output=$('output').value;selected=k;render()});tabs.appendChild(b)});$('output').value=variants[selected].output;$('changes').textContent=variants[selected].changes.join(' ');$('warnings').textContent=variants[selected].warnings.join(' ')||'Relire la formulation avant envoi.';$('scenario').value=selected;$('diagnostic').textContent=diagnose($('source').value).join(' · ');}
function run(){const src=$('source').value.trim();if(!src){toast('Ajoute un texte source.');return;}selected=$('scenario').value;variants={};keys.forEach(k=>variants[k]=generate(k,src));$('results').hidden=false;render();$('results').scrollIntoView({behavior:'smooth',block:'start'});}
$('generate').addEventListener('click',run);$('scenario').addEventListener('change',()=>{if(!Object.keys(variants).length)return;variants[selected].output=$('output').value;selected=$('scenario').value;render()});
$('source').addEventListener('input',()=>{$('count').textContent=$('source').value.length+' caractères'});
$('clear').addEventListener('click',()=>{$('source').value='';$('count').textContent='0 caractère';$('results').hidden=true});
$('example').addEventListener('click',()=>{$('source').value='Bonjour,\n\nPouvez-vous me confirmer que l’ensemble des champs des applications SAE a bien été repris ?\n\nSi certains champs n’ont pas été repris, pourriez-vous préciser lesquels ?\n\nL’objectif est de disposer d’une vision claire du périmètre effectivement couvert.\n\nMerci pour votre retour.';$('count').textContent=$('source').value.length+' caractères';$('results').hidden=true;});
$('restore').addEventListener('click',()=>{$('output').value=$('source').value;variants[selected].output=$('output').value;toast('Source restaurée dans le résultat')});
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('output').value);toast('Brouillon copié')}catch{ $('output').select();toast('Sélectionne et copie le texte')}});
$('share').addEventListener('click',async()=>{const t=$('output').value;try{if(navigator.share)await navigator.share({text:t,title:'CAP-ARCHI'});else{await navigator.clipboard.writeText(t);toast('Texte copié')}}catch(e){if(e.name!=='AbortError')toast('Partage indisponible')}});
const storeKey='cap-archi-v2-drafts';function readDrafts(){try{return JSON.parse(localStorage.getItem(storeKey)||'[]')}catch{return []}}function showDrafts(){const root=$('drafts');root.replaceChildren();const ds=readDrafts();if(!ds.length){root.textContent='Aucun brouillon enregistré.';return;}ds.forEach((d,i)=>{const box=document.createElement('div');box.className='saved-draft';const title=document.createElement('div');title.textContent=(d.date||'')+' · '+(d.source||'').slice(0,75);const load=document.createElement('button');load.textContent='Ouvrir';load.className='secondary';load.onclick=()=>{$('source').value=d.source;$('source').dispatchEvent(new Event('input'));selected=d.scenario||'balanced';$('scenario').value=selected;run();$('output').value=d.output;variants[selected].output=d.output;toast('Brouillon chargé')};const del=document.createElement('button');del.textContent='Supprimer';del.className='link';del.onclick=()=>{const a=readDrafts();a.splice(i,1);localStorage.setItem(storeKey,JSON.stringify(a));showDrafts()};box.append(title,load,del);root.append(box)})}
$('save').addEventListener('click',()=>{const a=readDrafts();a.unshift({date:new Date().toLocaleDateString('fr-FR'),source:$('source').value,output:$('output').value,scenario:selected});try{localStorage.setItem(storeKey,JSON.stringify(a.slice(0,30)));showDrafts();toast('Enregistré localement')}catch{toast('Stockage local indisponible')}});
$('deleteAll').addEventListener('click',()=>{if(confirm('Supprimer tous les brouillons locaux ?')){localStorage.removeItem(storeKey);showDrafts()}});
showDrafts();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});

// Règles issues du support « Communication et relations interpersonnelles », pages 4–17.
const RULES=[
 ['Assertivité (p. 7 et 13)','Un tiers délicatesse, un tiers énergie, un tiers écoute : ferme sans être fermé, écouter et proposer une alternative si elle existe.'],
 ['Faits / opinions / ressentis (p. 11)','Distinguer ce qui est vérifiable, ce qui relève d’une interprétation et ce qui est ressenti.'],
 ['Dire non (p. 12)','Clarifier, reformuler, poser sa limite avec empathie, proposer une solution réaliste.'],
 ['Demande délicate (p. 14)','Définir le besoin précis, simplifier, une demande à la fois, accepter oui/non, prévoir un plan B.'],
 ['Vocabulaire (p. 15)','Préférer « je » à un « tu/vous » accusateur ; éviter jamais, toujours et les généralisations.'],
 ['D.E.P.A. (p. 16)','Décrire les faits, exprimer sobrement les sentiments utiles, proposer une solution, présenter les avantages.'],
 ['Critique reçue (p. 17)','Écouter sans se justifier immédiatement, distinguer faits/opinions, reformuler les faits.'],
 ['CAP-ARCHI (adaptation métier)','Contexte, Analyse, Position d’architecture, Attendus/responsabilités, Risques/alternatives, Conclusion. Ne pas imposer les six rubriques.']
];
function diagnose(s){const out=[];
 if(/\b(jamais|toujours|encore une fois|tout le monde|personne ne)\b/i.test(s))out.push('Généralisation à vérifier (p. 15)');
 if(/\b(tu n’as|vous n’avez|tu dois|vous devez|c’est votre faute)\b/i.test(s))out.push('Formulation potentiellement accusatrice (p. 15)');
 if(/\b(je pense|à mon avis|il me semble)\b/i.test(s))out.push('Opinion : distinguer des faits (p. 11)');
 if(/\b(inquiet|frustré|déçu|préoccupé)\b/i.test(s))out.push('Ressenti : exprimer sobrement si utile (p. 11 et 16)');
 if(/\b(tous|ensemble|exhaustif|complétude)\b/i.test(s))out.push('Périmètre de référence à confirmer');
 if(/\b(urgent|asap|immédiatement)\b/i.test(s))out.push('Urgence : vérifier le délai et son fondement');
 if((s.match(/\?/g)||[]).length>2)out.push('Plusieurs demandes : envisager une priorisation (p. 14)');
 if(/\b(métier|projet|architecte|AE|sûreté)\b/i.test(s))out.push('Responsabilités : vérifier les rôles sans les attribuer automatiquement');
 if($('disc').value!=='unknown')out.push('DISC : adaptation indicative, non diagnostic psychologique');
 return out.length?out:['Aucun signal sensible détecté automatiquement ; une relecture humaine reste nécessaire'];}
const book=$('rulebook');RULES.forEach(([title,description])=>{let p=document.createElement('p');let b=document.createElement('strong');b.textContent=title+' — ';p.append(b,document.createTextNode(description));book.appendChild(p)});
$('disc').addEventListener('change',()=>{if(!$('results').hidden)render()});
