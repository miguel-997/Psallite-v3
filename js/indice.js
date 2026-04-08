import {current, scores, steps, chkMain} from "./state.js";
import {abrirPartitura} from "./partitura.js";
import { añadirMiniPartitura, eliminarMiniPartitura } from "./MiniPartituras.js";

let filtroactivo = "todo";
let textoBusqueda = "";

/* ===== ÍNDICE ===== */
async function cargarIndice(){
  const data = await fetch("partituras.json").then(r => r.json());
  const listaUI = document.getElementById("lista");

  listaUI.innerHTML = "";
  let dataFiltrada;

  const ORDEN_CATEGORIAS = ["LH", "ordinario", "adviento", "navidad", "cuaresma", "pascua", "LH"]
  const ORDEN_MOMENTOS = ["entrada", "himnoLH", "ofertorio", "comunión", "salida", "."];
  const LABELS_CATEGORIAS = {
    "ordinario": "TIEMPO ORDINARIO",
    "adviento": "ADVIENTO",
    "navidad": "NAVIDAD",
    "cuaresma": "CUARESMA",
    "pascua": "PASCUA",
    "LH": "LITURGIA DE LAS HORAS"
  };

  function crearItem(p) {
    const li = document.createElement("li");
    li.dataset.slug = p.slug;

    const chkIndice = document.createElement("input");
    chkIndice.type = "checkbox";
    chkIndice.checked = scores.includes(p.slug);
    
    // Al marcar/desmarcar la checkbox
    chkIndice.onchange = () => {
      const i = scores.indexOf(p.slug);
      let stp = 0;
      // actualizar chkMain y cargar MiniPartitura
      if (p.slug === current.slug) { stp = current.step;
        if (chkIndice.checked) {chkMain.checked = true}//limpiarPartitura()} 
        else {chkMain.checked = false} 
      }
      //cargarMiniPartitura(chkIndice, p.slug, 0);
      if (chkIndice.checked && i === -1){añadirMiniPartitura(p.slug, stp)}
      if (!chkIndice.checked && i !== -1){eliminarMiniPartitura(p.slug)}
    };

    const a = document.createElement("a");
    a.href = "#";
    a.textContent = p.name;

    a.onclick = (e) => {
      e.preventDefault();
      abrirPartitura(p.slug, p.maxUp, p.maxDown);
    };

    li.appendChild(chkIndice);
    li.appendChild(a);
    listaUI.appendChild(li);
  }

  function crearCategoria(cat, misa = false) {
    const dataCateg = dataFiltrada.filter(p => p.categoria === cat);

    // Título de categoría
    const h2 = document.createElement("h3");
    const cat2 = LABELS_CATEGORIAS[cat] || cat;
    h2.textContent = cat2;
    listaUI.appendChild(h2);

    // agrupar por momento
    ORDEN_MOMENTOS.forEach(mom => {
      const subgrupo = dataCateg.filter(p => p.momento === mom);
      if (subgrupo.length === 0) return;
      
      if (mom !== ".") {
        if (mom==="himnoLH") {mom = "Himnos LH"};
        const h4 = document.createElement("h4");
        h4.textContent = mom.charAt(0).toUpperCase() + mom.slice(1);
        listaUI.appendChild(h4);
      }
      subgrupo.forEach(p => crearItem(p));
    });
      
    // momento misa (ordinario de la misa)
    if (misa || cat === "ordinario") {
      const dataMisa = dataFiltrada.filter(p => p.categoria === "misa");
      if (dataMisa.length === 0) return;

      const h4 = document.createElement("h4");
      h4.textContent = "Ordinario de la misa";
      listaUI.appendChild(h4);

      const ORDEN_MISA = ["kyrie", "gloria", "aleluya", "santo", "cordero"];
      ORDEN_MISA.forEach(mom => {
        const subgrupo = dataMisa.filter(p => p.momento === mom);
        if (subgrupo.length === 0) return;
        subgrupo.forEach(p => crearItem(p));
      })
    };
  /* data.forEach(p => {crearItem(p)} ); */
  };

  if (filtroactivo === "todo") { dataFiltrada = data;} 
  else if (filtroactivo === "LH") {dataFiltrada = data.filter(p => p.momento === "himnoLH" || p.categoria === "LH")}
  else { dataFiltrada = data.filter(p => p.categoria === filtroactivo || p.categoria === "misa") }; 

  if (textoBusqueda) {
    dataFiltrada = dataFiltrada.filter(p => p.name.toLowerCase().includes(textoBusqueda));
  };

  if (filtroactivo === "todo") { ORDEN_CATEGORIAS.slice(1).forEach(cat => crearCategoria(cat)) } 
  else if (filtroactivo === "LH") {ORDEN_CATEGORIAS.slice(0,-1).forEach(cat => crearCategoria(cat))}
  else { crearCategoria(filtroactivo, true) };
};


/* ========== MENÚ DESPLEGABLE ========= */

const btnFiltro = document.getElementById("btnFiltro");
const menuFiltro = document.getElementById("menuFiltro");

// abrir/cerrar menú
btnFiltro.onclick = () => {
  actualizarMenuActivo();
  menuFiltro.style.display = 
    menuFiltro.style.display === "block" ? "none" : "block";
};

function actualizarMenuActivo() {
  const opciones = menuFiltro.querySelectorAll("div");

  opciones.forEach(op => {
    if (op.dataset.filter === filtroactivo) {
      op.textContent = "✔ " + op.textContent.replace("✔ ", "");
    } else {
      op.textContent = op.textContent.replace("✔ ", "");
    }
  });
};

// seleccionar opción
menuFiltro.addEventListener("click", (e) => {
  if (!e.target.dataset.filter) return;

  filtroactivo = e.target.dataset.filter;

  localStorage.setItem("filtroPartituras", filtroactivo);   //🔥 guardar en localStorage

  btnFiltro.textContent = "Mostrar: " + e.target.textContent + " ▾"; //cambiar texto del botón
  menuFiltro.style.display = "none";
  cargarIndice();
});

/* ===== CARGAR FILTRO GUARDADO ===== */

//document.addEventListener("DOMContentLoaded", () => { ... });
filtroactivo = localStorage.getItem("filtroPartituras") || "todo"; // usar el filtro guardado o "todo" por defecto
const textos = { // 🔥 actualizar texto del botón según filtro
  "todo": "Todo",
  "ordinario": "Tiempo Ordinario",
  "adviento": "Adviento",
  "navidad": "Navidad",
  "cuaresma": "Cuaresma",
  "pascua": "Pascua",
  "LH": "Liturgia de las horas"
};

btnFiltro.textContent = "Mostrar: " + (textos[filtroactivo] || "Todo") + " ▾";

/* ===== BUSCADOR ===== */
const inputBuscador = document.getElementById("buscador");

inputBuscador.addEventListener("input", (e) => {
  textoBusqueda = e.target.value.toLowerCase();
  cargarIndice();
  console.log("buscando:", textoBusqueda);
});

cargarIndice();
