/* ==== VARIABLES ==== */
export const mxlCache = {};
export const mxlCacheOrder = [];
export const miniOSMDs = {};

export let ultimaTab = ["indice", "indice"]; // por defecto (solo se pueden exportar let cuando solo se modifican en un modulo)

export const current = { slug: null, step: 0 }; // exportar a --> partitura e índice
export const selecc = { 
  zoom: +localStorage.getItem("zoomSeleccion") || 1, 
  item: null 
};  // exportar a --> selección y minipartituras

export const chkMain =  document.getElementById("chkSelect");

/* ===== HELPERS ===== */
const STORAGE_SCORE = "selectedScores";
const STORAGE_STEP = "selectedSteps";

function getArray(key){
  const v = JSON.parse(localStorage.getItem(key));
  return Array.isArray(v) ? v : [];
}

// export function saveArray(k,a){ localStorage.setItem(k,JSON.stringify(a)); }
export function saveScores(a){ localStorage.setItem(STORAGE_SCORE, JSON.stringify(a)); }
export function saveSteps(a){ localStorage.setItem(STORAGE_STEP, JSON.stringify(a)); }

export const steps = getArray(STORAGE_STEP);
export const scores = getArray(STORAGE_SCORE);
