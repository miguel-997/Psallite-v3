import {loadMXLWithLatinChords} from "./musicxml-latin.js";
import {miniOSMDs} from "./state.js";
import {scores, steps, saveScores, saveSteps} from "./state.js";
import {selecc} from "./state.js";

import {abrirPartitura} from "./partitura.js";
import {actualizarEstadoBotonesDesmarcar, actualizarToolbarSeleccion} from "./seleccion.js";


const selectedUl = document.getElementById("selected");
const scorescontainer =  document.getElementById("scoresContainer"); 

/* ==== FUNCIONES ==== */

export async function actualizarMiniPartituras() {
  const data = await fetch("partituras.json").then(r => r.json());

  for (let key in miniOSMDs) {delete miniOSMDs[key]}
  scorescontainer.innerHTML = "";
  selectedUl.innerHTML = "";

  scores.forEach((slug, i) => {crearMiniPartitura(data, slug, i)});
  actualizarchkIndice();
  actualizarEstadoBotonesDesmarcar();
}

/*
export function cargarMiniPartitura(chk,slug,step){
  const i = scores.indexOf(slug);

  if (chk.checked && i === -1){añadirMiniPartitura(slug, step)}
  if (!chk.checked && i !== -1){eliminarMiniPartitura(slug)}
}
*/

export function actualizarchkIndice(slug = false, sg = 0) {
  if (sg === 0) {
    const listaUI = document.getElementById("lista");  
    const items = listaUI.querySelectorAll("li");

    items.forEach(li => {
      const slug = li.dataset.slug;
      const chkIndice = li.querySelector("input[type='checkbox']");
      chkIndice.checked = scores.includes(slug);
    }) } 
  else { //El equivalente breve a actualizarchkIndice()
    const li = document.querySelector(`#lista li[data-slug="${slug}"]`);
    const chkIndice = li.querySelector("input[type='checkbox']");
    if (sg === 1) { chkIndice.checked = true} 
    else if (sg === -1) {chkIndice.checked = false}
  }  
}

/* Mejoras cargarIndice*/

export async function añadirMiniPartitura(slug, step) {
  const data = await fetch("partituras.json").then(r => r.json());

  scores.push(slug);
  steps.push(step);
  saveScores(scores);
  saveSteps(steps);

  const i = scores.indexOf(slug);
  crearMiniPartitura(data, slug, i);

  //actualizarchkIndice(slug, 1);
  actualizarEstadoBotonesDesmarcar();
}

async function crearMiniPartitura(data, slug, i) {
  const part = data.find(p => p.slug === slug);
  if (!part) return;

  const step = steps[i] ?? 0;

  /* ===== Lista superior ===== */

  const li = document.createElement("li");
  li.dataset.slug = slug;

  li.onclick = () => seleccionarItem(slug);

  const a = document.createElement("a");
  a.href = "#";
  a.textContent = part.name;
  a.onclick = e => {
    e.stopPropagation(); // 👈 importante
    e.preventDefault();
    abrirPartitura(slug, part.maxUp, part.maxDown);
  };

  /* Botones subir y bajar (selección) 
  const btnUp = document.createElement("button");
  btnUp.textContent = "🔼";
  btnUp.className = "move";
  
  const btnDown = document.createElement("button");
  btnDown.textContent = "🔽";
  btnDown.className = "move";

  const iActual = scores.indexOf(slug);
  if (iActual === 0) btnUp.disabled = true;
  if (iActual === scores.length - 1) btnDown.disabled = true; */

  /*
  const btn = document.createElement("button");
  btn.textContent = "✖";
  btn.className = "remove";

  btn.onclick = () => {
    if (slug === current.slug) { chkSelect(chkMain).checked = false }; // limpiarPartitura(); };
    eliminarMiniPartitura(slug);
  }
  */

  /*btnUp.onclick = () => moverArriba(slug);
  btnDown.onclick = () => moverAbajo(slug);

  const controls = document.createElement("span");
  controls.className = "controls";
  controls.appendChild(btnUp);
  controls.appendChild(btnDown);
  
  li.appendChild(controls); */
  li.appendChild(a);
  /*li.appendChild(btn); */
  selectedUl.appendChild(li);

  /* ===== Partitura ===== */

  const div = document.createElement("div");
  div.className = "score";
  div.dataset.slug = slug;

  const h3 = document.createElement("h3");
  h3.textContent = part.name;
  h3.style.textAlign = "center";

  const scoreDiv = document.createElement("div");

  div.appendChild(h3);
  div.appendChild(scoreDiv);
  scorescontainer.appendChild(div);

  const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(scoreDiv, {
    autoResize: true,
    drawTitle: false
  });

  miniOSMDs[slug] = osmd;

  const path = `scores/${slug}/${step}.mxl`;
  await loadMXLWithLatinChords(osmd, path, selecc.zoom);

  actualizarToolbarSeleccion(); //actualizarBotonesMover();
}

export function eliminarMiniPartitura(slug) {
  const i = scores.indexOf(slug);
  if (i !== -1) {
    scores.splice(i,1);
    steps.splice(i,1);
    saveScores(scores);
    saveSteps(steps);
  };
  
  const li = document.querySelector(`#selected li[data-slug="${slug}"]`); // borrar DOM lista
  if (li) li.remove();

  const div = document.querySelector(`#scoresContainer .score[data-slug="${slug}"]`); // borrar DOM partitura
  if (div) div.remove();

  miniOSMDs[slug].clear();   // borrar osmd
  delete miniOSMDs[slug];

  //actualizarchkIndice(slug, -1);
  actualizarEstadoBotonesDesmarcar();
}

export async function actualizarMiniPartitura(slug) {
  if (!miniOSMDs[slug]) return;

  const i = scores.indexOf(slug);
  if (i === -1) return;

  const step = steps[i] ?? 0;
  const path = `scores/${slug}/${step}.mxl`;

  loadMXLWithLatinChords(miniOSMDs[slug], path, selecc.zoom);
  //osmd.zoom = selecc.zoom;
  //osmd.load(path).then(() => osmd.render());
};

function seleccionarItem(slug) {
  selecc.item = slug;

  document.querySelectorAll("#selected li").forEach(li => {li.classList.remove("active")}); // quitar selección anterior
  const li = document.querySelector(`#selected li[data-slug="${slug}"]`);   // marcar el actual
  if (li) li.classList.add("active");

  actualizarToolbarSeleccion();
}


// actualizarMiniPartituras();