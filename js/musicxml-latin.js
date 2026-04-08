// ---------- CIFRADO LATINO ----------
import { mxlCache, mxlCacheOrder } from "./state.js";
import { acorde } from "./ajustes.js";

const noteMap = {C: "Do", D: "Re", E: "Mi", F: "Fa", G: "Sol", A: "La", B: "Si"};


  function harmonyToLatinText(harmony) {
    const rootStep = harmony.getElementsByTagName("root-step")[0];
    if (!rootStep) return null;
  
    let chord = noteMap[rootStep.textContent] || rootStep.textContent;
  
    const alter = harmony.getElementsByTagName("root-alter")[0];
    if (alter) {
      const a = parseInt(alter.textContent);
      if (a === 1) chord += "#";
      if (a === -1) chord += "b";
    }
  
    const kind = harmony.getElementsByTagName("kind")[0];
    if (kind) {
      const k = kind.textContent;
      if (k.startsWith("minor")) chord += "m";
      else if (k === "dominant") chord += "7";
      else if (k === "major-seventh") chord += "maj7";
      else if (k === "minor-seventh") chord += "m7";
      else if (k === "diminished") chord += "dim";
      else if (k === "augmented") chord += "+";
    }
  
    const bass = harmony.getElementsByTagName("bass-step")[0];
    if (bass) {
      chord += "/" + (noteMap[bass.textContent] || bass.textContent);
    }
  
    return chord;
  }
  
  function convertMusicXML(xmlText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "application/xml");
  
    [...xml.getElementsByTagName("harmony")].forEach(harmony => {
      const text = harmonyToLatinText(harmony);
      if (!text) return;
  
      harmony.setAttribute("print-object", "no");
  
      const direction = xml.createElement("direction");
      direction.setAttribute("placement", "above");
  
      const directionType = xml.createElement("direction-type");
      const words = xml.createElement("words");
      words.setAttribute("font-size", "12");
      words.textContent = text;
  
      directionType.appendChild(words);
      direction.appendChild(directionType);
  
      harmony.parentNode.insertBefore(direction, harmony);
    });
  
    return new XMLSerializer().serializeToString(xml);
  }

function GuardarCache(xml, path) {
  // guadar caché
  mxlCache[path] = xml;
  mxlCacheOrder.push(path);

  // ⚠️ Limitar tamaño de caché
  if (mxlCacheOrder.length > 50) {
    // nos quedamos solo con las últimas 7
    const recent = mxlCacheOrder.slice(-7);
    
    // eliminar del cache los antiguos
    for (let key of mxlCacheOrder) { if (!recent.includes(key)) delete mxlCache[key] }

    // actualizar el orden de la caché
    mxlCacheOrder.length = 0;
    mxlCacheOrder.push(...recent);
  };
}

async function safeRender(osmd) {
  const parent = osmd.container;
  if (parent.offsetWidth > 0 && parent.offsetHeight > 0) {
    await osmd.render();
  }
}

export async function loadMXLWithLatinChords(osmd, path, zoom) {
  let converted;

  // 🔥 CACHE
  if (mxlCache[path]) {
    // Ya está procesado
    converted = mxlCache[path];
    // actualizar orden LRU
    const idx = mxlCacheOrder.indexOf(path);
    if (idx !== -1) mxlCacheOrder.splice(idx, 1);
    mxlCacheOrder.push(path);
  } else {
    // Primera vez → hacer todo el proceso
    const buffer = await fetch(path).then(r => r.arrayBuffer());
    const zip = await JSZip.loadAsync(buffer);

    const containerText = await zip
      .file("META-INF/container.xml")
      .async("text");

    const containerXML = new DOMParser().parseFromString(containerText, "application/xml");
    const rootfile = containerXML
      .getElementsByTagName("rootfile")[0]
      .getAttribute("full-path");

    const scoreXMLText = await zip.file(rootfile).async("text");
    if (acorde==='true') {converted = convertMusicXML(scoreXMLText)}
    else {converted = scoreXMLText}

    // ⚠️ Guardar y Limitar tamaño de caché
    GuardarCache(converted, path);
  }

  if (acorde==='true') { // Configuración OSMD (esto sí se ejecuta siempre)
    osmd.rules.DefaultColorChordSymbol = "#FFFFFF";  
    osmd.EngravingRules.ChordSymbolTextHeight = 0.3;
    osmd.EngravingRules.ChordSymbolYOffset = -0.4;
    osmd.EngravingRules.ChordSymbolRelativeXOffset = -3;
  }
  await osmd.load(converted);
  osmd.zoom = zoom; 
  await osmd.render();
  // safeRender(osmd);
}

/*async function loadMXLWithAmerican(osmd, path, zoom) {
  let converted;

  // 🔥 CACHE
  if (mxlCache[path]) {
    // Ya está procesado
    converted = mxlCache[path];

    // actualizar orden LRU
    const idx = mxlCacheOrder.indexOf(path);
    if (idx !== -1) mxlCacheOrder.splice(idx, 1);
    mxlCacheOrder.push(path);
  } else {
    // Primera vez → hacer todo el proceso
    const buffer = await fetch(path).then(r => r.arrayBuffer());
    const zip = await JSZip.loadAsync(buffer);

    const containerText = await zip
      .file("META-INF/container.xml")
      .async("text");

    const containerXML = new DOMParser().parseFromString(
      containerText,
      "application/xml"
    );

    const rootfile = containerXML
      .getElementsByTagName("rootfile")[0]
      .getAttribute("full-path");

    const scoreXMLText = await zip.file(rootfile).async("text");

    converted = scoreXMLText;

    // ⚠️ Guardar y Limitar tamaño de caché
    GuardarCache(converted, path);
  }

  await osmd.load(converted);
  osmd.zoom = zoom; 
  await osmd.render();
  //safeRender(osmd);
}*/

/*async function loadMXLWithAmericanChords(osmd, path, zoom) {
  let xml;

  // 🔥 Usar caché si existe
  if (mxlCache[path]) {
    xml = mxlCache[path];

    // actualizar orden LRU
    const idx = mxlCacheOrder.indexOf(path);
    if (idx !== -1) mxlCacheOrder.splice(idx, 1);
    mxlCacheOrder.push(path);
  } else {
    // descargar como ArrayBuffer
    xml = await fetch(path).then(r => r.arrayBuffer());
    // ⚠️ Limitar tamaño de caché
    GuardarCache(xml, path);
  }

  // cargar en OSMD
  await osmd.load(xml);
  osmd.zoom = zoom;
  osmd.render();
}*/

/*export async function loadMXL(osmd, path, zoom, latin = true) {
  latin = false;
  if (latin) {loadMXLWithLatinChords(osmd, path, zoom)} 
  else {// loadMXLWithAmerican(osmd, path, zoom);
    osmd.zoom = zoom;
    osmd.load(path).then(() => osmd.render());
  };
}*/
