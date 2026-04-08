/*--================== TU CÓDIGO REAL ==================*/

import {miniOSMDs, chkMain, current} from "./state.js";
import {scores, steps, saveScores, saveSteps} from "./state.js";
import {selecc} from "./state.js";

import {limpiarPartitura} from "./partitura.js";
import {actualizarchkIndice, actualizarMiniPartituras, eliminarMiniPartitura} from "./MiniPartituras.js";
import { exportarPDFVectorial } from "./exportarpdf.js";

const SelUI = {  
  zoomLabel: document.getElementById("zoomLabel"),
  btnClearAll: document.getElementById("btnClearAll"),
  btnClearAllSeleccion: document.getElementById("btnClearAllSeleccion"),
  btnZoomSelIn: document.getElementById("btnZoomSelIn"),
  btnZoomSelOut: document.getElementById("btnZoomSelOut"),
  btnUpSel: document.getElementById("btnUpSel"),
  btnDownSel: document.getElementById("btnDownSel"),
  btnRemoveSel: document.getElementById("btnRemoveSel"),
  btnExportPDF: document.getElementById("btnExportPDF"),
}


/* ===== FUNCIONES ===== */

function desmarcarTodos(){
  // 1️⃣ Limpiar arrays en memoria - 2️⃣ Guardar en localStorage
  scores.length = 0;
  steps.length = 0;
  saveScores(scores);
  saveSteps(steps);

  // 3️⃣ Borrar mini partituras del DOM  && Limpiar objetos OSMD mini
  const selectedUl = document.getElementById("selected");
  const scorescontainer =  document.getElementById("scoresContainer"); 
  selectedUl.innerHTML = "";
  scorescontainer.innerHTML = "";
  Object.keys(miniOSMDs).forEach(k => delete miniOSMDs[k]);   //miniOSMDs.length = 0;
  
  actualizarchkIndice();
  actualizarEstadoBotonesDesmarcar();
  limpiarPartitura();
};

function aplicarZoomSeleccion() {
  Object.values(miniOSMDs).forEach(osmd => {
    osmd.zoom = selecc.zoom;
    osmd.render();
    //safeRender(osmd);
  });

  localStorage.setItem("zoomSeleccion", selecc.zoom);
  actualizarLabelZoomSeleccion();
};

export function actualizarEstadoBotonesDesmarcar() {
  const desmarcarBtns = [btnClearAll, btnClearAllSeleccion, btnZoomSelIn, btnZoomSelOut];
  desmarcarBtns.forEach(btn => {btn.disabled = scores.length === 0});
}

export function actualizarLabelZoomSeleccion(){SelUI.zoomLabel.textContent = "Ampliación: " + Math.round(selecc.zoom * 100) + "%"};


/*function moverArriba(slug) {
  const i = scores.indexOf(slug);
  if (i <= 0) return;

  [scores[i - 1], scores[i]] = [scores[i], scores[i - 1]]; // intercambiar en scores
  [steps[i - 1], steps[i]] = [steps[i], steps[i - 1]]; // intercambiar en steps
  saveScores(scores);
  saveSteps(steps);

  actualizarMiniPartituras();
}

function moverAbajo(slug) {
const i = scores.indexOf(slug);
if (i === -1 || i >= scores.length - 1) return;

[scores[i + 1], scores[i]] = [scores[i], scores[i + 1]];
[steps[i + 1], steps[i]] = [steps[i], steps[i + 1]];

saveScores(scores);
saveSteps(steps);

actualizarMiniPartituras();
}
*/

function moverArriba(slug) {
  const i = scores.indexOf(slug);
  if (i <= 0) return;

  // ===== ARRAYS =====
  [scores[i - 1], scores[i]] = [scores[i], scores[i - 1]];
  [steps[i - 1], steps[i]] = [steps[i], steps[i - 1]];
  saveScores(scores);
  saveSteps(steps);

  // ===== DOM (lista) =====
  const li = document.querySelector(`#selected li[data-slug="${slug}"]`);
  const prevLi = li.previousElementSibling;
  if (prevLi) li.parentNode.insertBefore(li, prevLi);

  // ===== DOM (partituras) =====
  const div = document.querySelector(`#scoresContainer .score[data-slug="${slug}"]`);
  const prevDiv = div.previousElementSibling;
  if (prevDiv) div.parentNode.insertBefore(div, prevDiv);

  actualizarToolbarSeleccion(); //actualizarBotonesMover();
}

function moverAbajo(slug) {
  const i = scores.indexOf(slug);
  if (i === -1 || i >= scores.length - 1) return;

  // ===== ARRAYS =====
  [scores[i + 1], scores[i]] = [scores[i], scores[i + 1]];
  [steps[i + 1], steps[i]] = [steps[i], steps[i + 1]];
  saveScores(scores);
  saveSteps(steps);

  // ===== DOM (lista) =====
  const li = document.querySelector(`#selected li[data-slug="${slug}"]`);
  const nextLi = li.nextElementSibling;
  if (nextLi) li.parentNode.insertBefore(nextLi, li);

  // ===== DOM (partituras) =====
  const div = document.querySelector(`#scoresContainer .score[data-slug="${slug}"]`);
  const nextDiv = div.nextElementSibling;
  if (nextDiv) div.parentNode.insertBefore(nextDiv, div);

  actualizarToolbarSeleccion(); //actualizarBotonesMover();
}

/*export function actualizarBotonesMover() {
  const items = document.querySelectorAll("#selected li");

  items.forEach((li, index) => {
    const btnUp = li.querySelector("button:nth-child(1)");
    const btnDown = li.querySelector("button:nth-child(2)");

    if (btnUp) btnUp.disabled = index === 0;
    if (btnDown) btnDown.disabled = index === items.length - 1;
  });
}
*/

export function actualizarToolbarSeleccion() {
  const btnUp = document.getElementById("btnUpSel");
  const btnDown = document.getElementById("btnDownSel");
  const btnRemove = document.getElementById("btnRemoveSel");

  if (!selecc.item) {
    btnUp.disabled = true;
    btnDown.disabled = true;
    btnRemove.disabled = true;
    return;
  }

  const items = document.querySelectorAll("#selected li");
  const lista = Array.from(items).map(li => li.dataset.slug);

  const i = lista.indexOf(selecc.item);

  btnUp.disabled = i === 0;
  btnDown.disabled = i === lista.length - 1;
  btnRemove.disabled = false;
}

function quitarSel(){
  if (selecc.item) {
    eliminarMiniPartitura(selecc.item);
    actualizarchkIndice(selecc.item, -1);
    if (selecc.item === current.slug) { chkMain.checked = false }; // limpiarPartitura(); };
  }

}

/* ===== BOTONES ZOOM y DESMARCAR - actualizar cantos===== */
SelUI.btnClearAll.onclick = desmarcarTodos;
SelUI.btnClearAllSeleccion.onclick = desmarcarTodos;

SelUI.btnZoomSelIn.onclick = () => {
  selecc.zoom += 0.1;
  aplicarZoomSeleccion();
};

SelUI.btnZoomSelOut.onclick = () => {
  selecc.zoom = Math.max(0.5, selecc.zoom - 0.1);
  aplicarZoomSeleccion();
};

/* ==== BOTONES SUBIR/BAJAR ETIQUETAS - QUITAR - EXPORTAR ==== */
SelUI.btnUpSel.onclick = () => { if (selecc.item) moverArriba(selecc.item) };
SelUI.btnDownSel.onclick = () => { if (selecc.item) moverAbajo(selecc.item) };
SelUI.btnRemoveSel.onclick = () => { quitarSel() };
SelUI.btnExportPDF.onclick = () => {exportarPDFVectorial()};


// Detectar clic fuera de la lista de selección
document.addEventListener("click", (e) => {
  const ul = document.getElementById("selected");
  const ul1 = document.getElementById("btnUpSel");
  const ul2 = document.getElementById("btnDownSel");

  if (!ul.contains(e.target) && !ul1.contains(e.target) && !ul2.contains(e.target)) {
    document.querySelectorAll("#selected li").forEach(li => li.classList.remove("active"));
    selecc.item = null;
    actualizarToolbarSeleccion();
  }
});

actualizarMiniPartituras();
actualizarLabelZoomSeleccion();
