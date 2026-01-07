/* =========================
   A Pustulância de Hadar — Lógica Compartilhada
   - Navegação simples
   - Rolagens (d20, d6, d100)
   - Sorteio de Tesouro ND 0–4 (baseado no Guia do Mestre)
   Observação: isto é uma implementação "jogável" e prática.
   ========================= */

function goTo(page){
  window.location.href = page;
}

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

function randInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roll(d){
  return randInt(1, d);
}
function rollMany(n, d){
  let total = 0;
  const rolls = [];
  for(let i=0;i<n;i++){
    const r = roll(d);
    rolls.push(r);
    total += r;
  }
  return { total, rolls };
}

/* ---------- UI helpers ---------- */
function writeLog(targetId, html){
  const el = document.getElementById(targetId);
  if(!el) return;
  el.innerHTML = html;
}

function appendLog(targetId, html){
  const el = document.getElementById(targetId);
  if(!el) return;
  el.innerHTML = el.innerHTML + html;
}

/* =========================
   Tesouro ND 0–4 (Guia do Mestre)
   Implementação simplificada: moedas + chance de tesouro em itens
   ========================= */

/*
  Filosofia:
  - A DMG possui tabelas detalhadas (por ND, por tipo, por tesouro individual/tesouro de tesouro).
  - Aqui entrego um gerador prático que segue a *estrutura* do ND 0–4:
    • Moedas com variação por d100
    • Chance de itens via "Tabela A" (itens comuns menores) e pequenos consumíveis
  - Você pode ajustar probabilidades sem quebrar o fluxo do jogo.

  Se quiser fidelidade 1:1 com as tabelas do livro, dá para expandir este módulo depois
  com as tabelas exatas transcritas (desde que você tenha licença/uso permitido).
*/

const itemTableA = [
  "Poção de cura (comum)",
  "Pergaminho de magia (cantrip) — escolha do conjurador",
  "Pergaminho de magia (1º nível) — escolha do conjurador",
  "Poção de escalada",
  "Poção de amizade animal",
  "Poção de resistência (tipo aleatório)",
  "Flechas +1 (1d4 + 1 unidades)",
  "Óleo de escorregar",
  "Pó do desaparecimento (pequena porção)",
  "Bolsa encantada de sal (purifica alimento/água 1x/dia; efeito menor)"
];

const minorTrinkets = [
  "Um medalhão com uma gota violeta solidificada que pulsa de leve",
  "Um dado de osso gravado com constelações que não existem",
  "Uma fita dourada manchada de tinta roxa — cheira a incenso queimado",
  "Um sinete oxidado com o símbolo de um olho aberto em uma estrela negra",
  "Uma vela que derrama cera escura, mas ilumina dourado"
];

function coinBundleToText(coins){
  const parts = [];
  if(coins.cp) parts.push(`${coins.cp} cp`);
  if(coins.sp) parts.push(`${coins.sp} sp`);
  if(coins.ep) parts.push(`${coins.ep} ep`);
  if(coins.gp) parts.push(`${coins.gp} gp`);
  if(coins.pp) parts.push(`${coins.pp} pp`);
  return parts.length ? parts.join(", ") : "—";
}

/* Tabela de moedas ND 0–4 (prática, inspirada no padrão do DMG):
   - d100 determina o "patamar" de moedas
*/
function treasureCR0to4(){
  const d100 = roll(100);
  const coins = { cp:0, sp:0, ep:0, gp:0, pp:0 };
  const notes = [];

  // Patamares (propositadamente baixos; ND 0–4)
  if(d100 <= 30){
    // pouco ou nada
    coins.cp = rollMany(5,6).total;     // 5d6 cp
    notes.push("Bolso leve: moedas pequenas e sujas de fuligem.");
  }else if(d100 <= 60){
    coins.cp = rollMany(4,6).total * 10; // 4d6 x10 cp
    coins.sp = rollMany(2,6).total;      // 2d6 sp
    notes.push("Alguma prata entre cacos e amuletos baratos.");
  }else if(d100 <= 85){
    coins.sp = rollMany(4,6).total * 10; // 4d6 x10 sp
    coins.gp = rollMany(2,6).total;      // 2d6 gp
    notes.push("Prata suficiente para virar assunto na taverna.");
  }else{
    coins.gp = rollMany(4,6).total * 10; // 4d6 x10 gp
    notes.push("Um achado raro para gente pequena… e perigoso de carregar.");
  }

  // Chance de itens (consumíveis / Tabela A simplificada)
  const itemChance = roll(100);
  const items = [];

  if(itemChance >= 75){
    items.push(itemTableA[randInt(0, itemTableA.length-1)]);
    if(roll(100) >= 85){
      items.push(itemTableA[randInt(0, itemTableA.length-1)]);
      notes.push("Houve mais de um brilho arcano entre os escombros.");
    }
  }else if(itemChance >= 55){
    items.push("1 trinket estranho: " + minorTrinkets[randInt(0, minorTrinkets.length-1)]);
  }else{
    notes.push("Nada além de poeira e um eco de má sorte.");
  }

  return {
    d100,
    coins,
    items,
    notes
  };
}

function renderTreasure(result){
  const coinsText = coinBundleToText(result.coins);
  const itemsText = result.items.length ? `<ul>${result.items.map(i=>`<li>${i}</li>`).join("")}</ul>` : "<em>Sem itens.</em>";
  const notesText = result.notes.length ? `<ul>${result.notes.map(n=>`<li>${n}</li>`).join("")}</ul>` : "";
  return `
    <div class="details">
      <h3>Tesouro Sorteado (ND 0–4)</h3>
      <p><span class="tag">d100: ${result.d100}</span></p>
      <p><strong>Moedas:</strong> ${coinsText}</p>
      <p><strong>Itens:</strong> ${itemsText}</p>
      ${notesText}
      <small class="muted">Dica: o Mestre pode trocar/ajustar o item para combinar com a cena.</small>
    </div>
  `;
}

function doTreasure(targetId){
  const res = treasureCR0to4();
  writeLog(targetId, renderTreasure(res));
}

/* =========================
   Interação simples por "seções"
   ========================= */

function showOnly(sectionId){
  $all("[data-scene]").forEach(s => s.style.display = "none");
  const el = document.getElementById(sectionId);
  if(el) el.style.display = "block";
  window.scrollTo({top:0, behavior:"smooth"});
}

function toggleDetails(id){
  const el = document.getElementById(id);
  if(!el) return;
  const isHidden = el.style.display === "none" || !el.style.display;
  el.style.display = isHidden ? "block" : "none";
}

// ===============================
// HADAR: Estado de campanha (localStorage)
// Cole este bloco no FINAL do script.js
// ===============================
function setRunState(key, value) {
  try { localStorage.setItem("hadar_" + key, JSON.stringify(value)); }
  catch (e) { /* ignore */ }
}

function getRunState(key, fallback = null) {
  try {
    const raw = localStorage.getItem("hadar_" + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function choosePath(path) {
  // path: "resgate" | "combate" | "investigacao"
  setRunState("path", path);
  setRunState("pathFlags", {}); // limpa flags anteriores
  goTo(`fase2_${path}.html`);
}

function completePath(path, flags = {}) {
  setRunState("path", path);
  const prev = getRunState("pathFlags", {});
  setRunState("pathFlags", Object.assign({}, prev, flags));
}
