// CAP-ARCHI v4: optional browser-side WebLLM. No server-side prompt inference.
// Remote JavaScript/model downloads occur ONLY after the user explicitly starts loading AI.
const $ = id => document.getElementById(id);
const status = msg => { $('aiStatus').textContent = msg; };
const engineMode = $('engineMode');
let webllm = null, aiEngine = null, loading = false;
const supported = !!(navigator.gpu && navigator.gpu.requestAdapter && typeof WebAssembly !== 'undefined');
status(supported ? 'WebGPU détecté : essai de mini-IA possible (compatibilité et mémoire non garanties).' : 'WebGPU indisponible dans ce navigateur. Le moteur à règles reste pleinement opérationnel.');
if (!supported) {engineMode.querySelector('[value="hybrid"]').disabled=true;}
engineMode.addEventListener('change',()=>{
  $('aiControls').hidden=engineMode.value!=='hybrid';
  if(engineMode.value==='rules'){$('aiResult').hidden=true;status('Mode à règles : disponible sans réseau.');}
  else status(aiEngine?'Mini-IA locale prête.':'Mini-IA expérimentale : charger un modèle pour l’activer.');
});
const escapeHTML = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function loadAI(){
 if(loading||aiEngine)return;
 if(!supported){status('WebGPU non disponible : utilisez les règles.');return;}
 loading=true;$('loadAI').disabled=true;
 try{
  status('Chargement du moteur WebLLM depuis le réseau…');
  // Version pinned; the library and model assets are downloaded from third-party hosts.
  webllm=await import('https://esm.run/@mlc-ai/web-llm@0.2.80');
  const list=webllm.prebuiltAppConfig?.model_list||[];
  // Select small instruct models actually advertised by this library, not invented model IDs.
  const candidates=list.filter(m=>/0[.,]5B|0[.,]6B|0[.,]8B|1B|1[.,]5B|360M|135M/i.test(m.model_id||'') && /Instruct|Chat/i.test(m.model_id||''));
  const models=(candidates.length?candidates:list.filter(m=>/Instruct|Chat/i.test(m.model_id||''))).sort((a,b)=>{
   const score=m=>{const z=(m.model_id||'').match(/(\d+(?:\.\d+)?)\s*(M|B)/i);return z?Number(z[1])*(z[2].toUpperCase()==='B'?1000:1):99999};return score(a)-score(b)
  });
  if(!models.length)throw Error('Aucun modèle compatible annoncé par le moteur.');
  $('aiModel').replaceChildren();models.slice(0,10).forEach(m=>{const o=document.createElement('option');o.value=m.model_id;o.textContent=m.model_id;$('aiModel').append(o)});
  const id=$('aiModel').value;
  status('Téléchargement et initialisation de '+id+'… Cette étape peut prendre plusieurs minutes.');
  aiEngine=await webllm.CreateMLCEngine(id,{initProgressCallback:p=>status('Mini-IA : '+(p.text||Math.round((p.progress||0)*100)+' %'))});
  status('Mini-IA prête sur cet appareil : génération exécutée dans le navigateur.');
 }catch(e){status('Mini-IA non disponible : '+(e?.message||String(e))+' — Les règles restent disponibles.');aiEngine=null;}
 finally{loading=false;$('loadAI').disabled=!!aiEngine;}
}
$('loadAI').addEventListener('click',loadAI);
$('unloadAI').addEventListener('click',async()=>{try{await aiEngine?.unload?.()}catch{}aiEngine=null;$('loadAI').disabled=false;$('aiResult').hidden=true;status('Modèle libéré de la mémoire (les fichiers téléchargés peuvent rester en cache).')});
const forbidden=[/\b(décid[ée]|valid[ée]|approuv[ée])\b/i];
function review(source,out){const warnings=[];
 const a=source.toLowerCase(),b=out.toLowerCase();
 for(const term of ['demain','aujourd’hui','sous 48 heures','obligatoire','validé','approuvé','risque critique'])if(b.includes(term)&&!a.includes(term))warnings.push('Information possiblement ajoutée : « '+term+' ».');
 if(/\b(métier|projet|sûreté|architecte)\b/i.test(out)&&!/\b(métier|projet|sûreté|architecte)\b/i.test(source))warnings.push('Rôle mentionné dans le résultat mais absent de la source : vérifier les responsabilités.');
 if(/\b(toujours|jamais)\b/i.test(out)&&!/\b(toujours|jamais)\b/i.test(source))warnings.push('Généralisation ajoutée.');
 return warnings.length?warnings.join('\n'):'Contrôles automatiques limités : relire les faits, objets, engagements et responsabilités avant utilisation.';
}
async function infer(){
 const source=$('source').value.trim();if(!source){status('Ajoutez un texte source.');return;}
 if(!aiEngine){status('Les variantes à règles sont disponibles. Chargez d’abord la mini-IA pour une variante générative.');return;}
 const scenario=$('scenario').selectedOptions[0]?.textContent||'Équilibré';
 const task=`Tu es un assistant de rédaction professionnelle en français, pour un architecte d’entreprise. Réécris le texte sans ajouter de faits, décisions, dates, délais, risques, opinions, émotions, responsabilités ou engagements. Ne transforme pas une question en affirmation. Respecte le canal ${$('channel').value}, l’objectif ${$('goal').value}, le destinataire ${$('audience').value}, le scénario ${scenario}. Principes : 1/3 délicatesse, 1/3 énergie, 1/3 écoute ; distinguer faits, opinions et ressentis ; demandes claires, courtes et non accusatrices ; « je » plutôt que « tu » accusateur ; D.E.P.A. uniquement si ses composantes sont présentes ; pour dire non, ne pas inventer de refus ni d’alternative ; préserver la séparation métier / projet / AE / sûreté. N’utilise pas de titres CAP-ARCHI dans un mail court. Donne uniquement le texte final.`;
 status('Génération IA locale en cours…');$('generate').disabled=true;
 try{
  const r=await aiEngine.chat.completions.create({messages:[{role:'system',content:task},{role:'user',content:'TEXTE SOURCE :\n'+source}],temperature:0.25,max_tokens:650});
  const out=(r.choices?.[0]?.message?.content||'').trim();if(!out)throw Error('Réponse vide');
  $('aiOutput').value=out;$('aiReview').textContent=review(source,out);$('aiResult').hidden=false;
  status('Reformulation IA locale terminée. Comparez avec les variantes à règles et vérifiez le contenu.');
 }catch(e){status('Génération IA échouée : '+(e?.message||String(e))+'. Les variantes à règles restent utilisables.');}
 finally{$('generate').disabled=false;}
}
$('generate').addEventListener('click',()=>{if(engineMode.value==='hybrid')void infer()});
$('aiCopy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('aiOutput').value);status('Proposition IA copiée.')}catch{status('Copie indisponible : sélectionnez le texte.')}});
$('aiAdopt').addEventListener('click',()=>{$('output').value=$('aiOutput').value;status('Proposition IA placée dans le brouillon modifiable ; la source reste intacte.')});
