// js/exportar.js
// exporta bien en vectorial

import { scores, steps } from "./state.js";
import { loadMXLWithLatinChords } from "./musicxml-latin.js";

export async function exportarPDFVectorial() {

  if (!scores.length) {
    alert("No hay partituras seleccionadas.");
    return;
  }

  const pdf = new jspdf.jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // 📦 contenedor oculto
  const hiddenDiv = document.createElement("div");
  hiddenDiv.style.position = "absolute";
  hiddenDiv.style.left = "-1999px";
  hiddenDiv.style.width = "800px"; // ancho base controlado
  document.body.appendChild(hiddenDiv);

  for (let i = 0; i < scores.length; i++) {

    const slug = scores[i];
    const step = steps[i] ?? 0;

    const scoreDiv = document.createElement("div");
    hiddenDiv.appendChild(scoreDiv);
    const path = `scores/${slug}/${step}.mxl`;
    scoreDiv.innerHTML = "";

    const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(scoreDiv, {
      autoResize: false,
      drawTitle: false
    });

    // 🔥 escala
    const scale = 0.8;
    await loadMXLWithLatinChords(osmd, path, scale);

    const finalSvg = scoreDiv.querySelector("svg");

    if (i > 0) pdf.addPage();

    await pdf.svg(finalSvg.cloneNode(true), {
      x: 0,
      y: 0,
      width: 210,
      height: 300
    });

    scoreDiv.remove();
  }

  hiddenDiv.remove();

  pdf.save("partituras.pdf");
}