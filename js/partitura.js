import {loadMXLWithLatinChords} from "./musicxml-latin.js";
import {current, chkMain} from "./state.js";
import {scores, steps, saveSteps} from "./state.js";
import {actualizarMiniPartitura, añadirMiniPartitura, eliminarMiniPartitura, actualizarchkIndice} from "./MiniPartituras.js"

const Main = {
  osmd: null,
  zoom: 1,
  playing: false,
  synth: null,
  maxUp: 3,
  maxDown: 5
}

/* === getElementById (botones, etc) === */
const BTN = {
  up: document.getElementById("btnUp"),
  down: document.getElementById("btnDown"),
  reset: document.getElementById("btnReset"),
  zoomIn: document.getElementById("btnZoomIn"),
  zoomOut: document.getElementById("btnZoomOut"),
  play: document.getElementById("btnPlay")
}

const MainUI = {
  zoomLabel: document.getElementById("zoomLabelMain"),
  score: document.getElementById("score"),
  tonoLabel: document.getElementById("tonoLabel")
}


/* ===== ESTADO GLOBAL PARTITURA ===== */

function initOSMD(){
  if (Main.osmd) return;

  Main.osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("score", {
    autoResize: true
    //drawingParameters: "compact"
  });
}

export async function abrirPartitura(slug, up, down){
  // cambiar de pestaña
  document.querySelector('.tab[data-tab="partitura"]').click();

  if (current.slug !== slug) {
    current.slug = slug;
    Main.maxUp = up;
    Main.maxDown = down;
    Main.zoom= 1;
    actualizarLabelZoomMain();
    initOSMD();

    MainUI.score.innerHTML = ""

    const i = scores.indexOf(slug);
    current.step = i !== -1 ? steps[i] : 0;  //Main.step = i !== -1 ? (steps[i] ?? 0) : 0;
    await loadStep(current.step);

    /*Sincronizar Checkbox de la pestaña partitura*/
    chkMain.checked = scores.includes(current.slug);
    setEstadoBotonesPartitura(true);
  };
}

export function limpiarPartitura() {
  if (Main.osmd) {Main.osmd.clear()};

  MainUI.score.innerHTML = `
    <p id="emptyMessage" style="text-align:center; color:#777;">
      No hay partitura cargada
    </p>
  `;

  current.slug = null;
  current.step = 0;
  Main.zoom = 1;
  actualizarLabelZoomMain();

  if (Main.playing) {
    Tone.Transport.stop();
    BTN.play.textContent = "▶ Play";
    Main.playing = false;
  }

  chkMain.checked = false;
  setEstadoBotonesPartitura(false);
}

export function setEstadoBotonesPartitura(activa) {
  const controls = [
    chkMain,
    BTN.down, BTN.up, BTN.reset, BTN.zoomIn, BTN.zoomOut, BTN.play
  ];
  controls.forEach(btn => btn.disabled = !activa);
}


/*Actualizar-cargar un tono*/
async function loadStep(step){
  current.step = step;

  const path = `scores/${current.slug}/${current.step}.mxl`;
  await loadMXLWithLatinChords(Main.osmd, path, Main.zoom);

  const i = scores.indexOf(current.slug);
  if (i !== -1){
    steps[i] = current.step;
    saveSteps(steps);
  };
  actualizarMiniPartitura(current.slug);

  let signo ="";
  if (current.step>0) signo ="+";
  MainUI.tonoLabel.textContent = "Tono: " + signo + current.step/2; //Actualizar Label tono
}

/*Zoom*/
function actualizarLabelZoomMain(){ MainUI.zoomLabel.textContent = "Ampliación: " + Math.round(Main.zoom * 100) + "%" };

function aplicarZoomMain() {
  if (!Main.osmd) return;

  Main.osmd.zoom = Main.zoom;
  Main.osmd.render();   //safeRender(Main.osmd);
  actualizarLabelZoomMain();
};

function initPartituraEvents(){  // BOTONES PESTAÑA PARTITURA
    chkMain.onchange = () => { 
      //cargarMiniPartitura(chkMain, current.slug, Main.step); 
      const i = scores.indexOf(current.slug);
      if (chkMain.checked && i === -1){
        añadirMiniPartitura(current.slug, current.step);
        actualizarchkIndice(current.slug, 1);
      };
      if (!chkMain.checked && i !== -1){
        eliminarMiniPartitura(current.slug);
        actualizarchkIndice(current.slug, -1);
      };
    };

    /*botones transposición*/
    BTN.up.onclick = () => current.step < Main.maxUp && loadStep(current.step + 1);
    BTN.down.onclick = () => current.step > -Main.maxDown && loadStep(current.step - 1);
    BTN.reset.onclick = () => loadStep(0);

    BTN.zoomIn.onclick = () => { 
    Main.zoom += 0.1;
    aplicarZoomMain(); 
    };

    BTN.zoomOut.onclick = () => { 
    Main.zoom = Math.max(0.5, Main.zoom - 0.1)
    aplicarZoomMain(); 
    };

    /*Midi*/
    BTN.play.onclick = async () => {
    if (!current.slug) return;

    if (!Main.playing){
        await Tone.start();
        if (!Main.synth) Main.synth = new Tone.PolySynth().toDestination();

        const midiPath = `scores/${current.slug}/${current.slug}.mid`;
        const buffer = await fetch(midiPath).then(r => r.arrayBuffer());
        const midi = new Midi(buffer);

        Tone.Transport.cancel();
        Tone.Transport.stop();

        midi.tracks.forEach(track => {
        track.notes.forEach(note => {
            Tone.Transport.schedule(time => {
            Main.synth.triggerAttackRelease(
                Tone.Frequency(note.midi + current.step, "midi"),
                note.duration,
                time,
                note.velocity
            );
            }, note.time);
        });
        });

        Tone.Transport.start();
        BTN.play.textContent = "⏸ Stop";
    } else {
        Tone.Transport.stop();
        BTN.play.textContent = "▶ Play";
    }

    Main.playing = !Main.playing;
    };
}

initPartituraEvents();
setEstadoBotonesPartitura(false);
