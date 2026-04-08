//import { actualizarMiniPartituras } from "./MiniPartituras.js";
//import { miniOSMDs, mxlCache, mxlCacheOrder } from "./state.js";
import { ultimaTab } from "./state.js";

//const STORAGE_ACORDE = "acordelatin"
export let acorde = localStorage.getItem("acordelatin") || 'true';

// const radioA = document.querySelector('input[name="acordelatin"][value=true]');
// radioA.checked = true; // siempre marcado acorde latino (no hay persistencia)

const radios = document.querySelectorAll('input[name="acordelatin"]');  
// 🔥 IMPORTANTE: marcar correctamente al iniciar
radios.forEach(r => {
    if (r.value === acorde) {r.checked = acorde};
});
  
const btnAplicar = document.getElementById("btnAplicar");
btnAplicar.addEventListener("click", () => {
    // escuchar cambios
    radios.forEach(r => {
        if (r.checked && r.value !== acorde) {
            acorde = r.value;
            localStorage.setItem("acordelatin", acorde);
            const STORAGE_TAB = "storage_tab";
            localStorage.setItem(STORAGE_TAB, ultimaTab[0]);
            
            console.log("miVariable ahora es", acorde);
            location.reload();
            /*mxlCache.length = 0;
            mxlCacheOrder.length =0;
            Object.keys(miniOSMDs).forEach(k => delete miniOSMDs[k]);
            actualizarMiniPartituras();*/
        }
    }); 
    const tabAnterior = document.querySelector(`.tab[data-tab="${ultimaTab[0]}"]`);
    if (tabAnterior) tabAnterior.click(); 
    console.log("hola");
});

// 🔥 volver a la pestaña anterior
document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_TAB = "storage_tab";
    const ultab = localStorage.getItem(STORAGE_TAB);
  
    if (ultab) {
      const tabAnterior = document.querySelector(`.tab[data-tab="${ultab}"]`);
      if (tabAnterior) tabAnterior.click();
      localStorage.removeItem(STORAGE_TAB); // opcional (limpia después)
    }
  });