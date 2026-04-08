import {miniOSMDs, ultimaTab} from "./state.js";
/* ================== funcionamiento PESTAÑAS ================== */

const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");
const toolbars = document.querySelectorAll(".toolbar");


tabs.forEach(tab => {
  tab.onclick = () => {
    const id = tab.dataset.tab;

    // registrar ultima Tab
    ultimaTab[0] = ultimaTab[1];
    ultimaTab[1] = id;
    console.log(ultimaTab);

    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));
    toolbars.forEach(tb => tb.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(id).classList.add("active");
    document.getElementById("toolbar-" + id).classList.add("active");

    // 👇 SOLUCIÓN OSMD
    //if (id === "selección") {setTimeout(() => {Object.values(miniOSMDs).forEach(osmd => osmd.render())}, 50)};
    Object.values(miniOSMDs).forEach(osmd => {
      try {
        if (osmd.IsReadyToRender()) {
          osmd.render();
        }
      } catch (e) {
        console.warn("OSMD no listo:", e);
      }
    });
  };
});

