// --- ELEMENTS DEL DOM ---
const gridVideos = document.getElementById('grid-videos');              // On es pinten les targetes
const pantallaLlista = document.getElementById('pantalla-llista');      // Secció de la llista
const pantallaReproductor = document.getElementById('pantalla-reproductor'); // Secció del vídeo
const video = document.getElementById('meu-video');                     // L'element de vídeo
const videoTitle = document.getElementById('video-title');              // El títol al reproductor
const videoDesc = document.getElementById('video-desc');                // La descripció al reproductor
const playPauseBtn = document.getElementById('play-pause');             // Botó de Play/Pausa
const seekBar = document.getElementById('seek-bar');                    // Barra de progrés
const muteBtn = document.getElementById('mute-btn');                    // Botó de silenci
const fullScreenBtn = document.getElementById('full-screen-btn');       // Botó de pantalla completa
const btnBack = document.getElementById('btn-back');                    // Botó per tornar enrere
const volumeBar = document.getElementById('volume-bar');                // Barra de volum
const volumeContainer = document.querySelector('.volume-container');    // Contenidor del volum

// --- MEMÒRIA (LOCAL STORAGE) ---
let videosVistos = JSON.parse(localStorage.getItem('fcb_vistos')) || []; // Recupero vistos
let progressioVideos = JSON.parse(localStorage.getItem('fcb_progressio')) || {}; // Recupero temps
let videoActualTitol = "";                                              // Variable per al títol actual

// --- INICI ---
renderitzarLlista('Masculí');                                           // Carrego homes per defecte

// --- FUNCIONS ---
function renderitzarLlista(categoria) {
    gridVideos.innerHTML = '';                                          // Buido la graella actual
    document.getElementById('titol-categoria').innerText = categoria;   // Cambio el títol de la web
    const filtrats = dadesVideos.filter(v => v.categoria === categoria); // Filtro els vídeos del data.js

    filtrats.forEach(v => {                                             // Recorrem cada vídeo del grup
        const card = document.createElement('div');                     // Creo el div de la targeta
        const esVist = videosVistos.includes(v.titol);                  // Miro si ja l'he vist
        card.className = `video-card ${esVist ? 'vist' : ''}`;          // Li poso classe 'vist' si toca
        card.innerHTML = `
            <div class="poster-container">
                <img src="${v.poster}" alt="${v.titol}">
                ${esVist ? '<span class="icon-vist">⚽</span>' : ''} 
            </div>
            <span style="margin-left:15px; font-weight:bold; font-size:1.1rem;">${v.titol}</span>
        `;                                                              // Pico el HTML de la targeta
        card.onclick = () => obrirReproductor(v);                       // Clico per anar al reproductor
        gridVideos.appendChild(card);                                   // Afegeixo la card al grid
    });
}

function obrirReproductor(v) {
    videoActualTitol = v.titol;                                         // Guardo quin vídeo reprodueixo
    pantallaLlista.classList.add('hidden');                             // Amago la llista
    pantallaReproductor.classList.remove('hidden');                     // Mostro el vídeo
    video.src = v.file;                                                 // Carrego el fitxer mp4
    videoTitle.innerText = v.titol;                                     // Poso el títol al h2
    videoDesc.innerText = v.descripcio;                                 // Poso la descripció al p

    video.onloadedmetadata = () => {                                    // Quan el vídeo estigui llest...
        const tempsGuardat = progressioVideos[videoActualTitol];        // Busco si hi ha temps desat
        if (tempsGuardat > 0) video.currentTime = tempsGuardat;         // Si n'hi ha, salto al minut
        video.play();                                                   // Engego el play
        playPauseBtn.innerText = '⏸';                                  // Icono de pausa
    };
}

video.ontimeupdate = () => {                                            // Mentre el vídeo avança...
    seekBar.value = (video.currentTime / video.duration) * 100 || 0;    // Actualitzo la barra
    let m = Math.floor(video.currentTime / 60);                         // Calculo minuts
    let s = Math.floor(video.currentTime % 60);                         // Calculo segons
    document.getElementById('timer').innerText = `${m}:${s < 10 ? '0' : ''}${s}`; // Poso el temps 0:00
    
    if (videoActualTitol && video.currentTime > 0) {                    // Si estic mirant...
        progressioVideos[videoActualTitol] = video.currentTime;         // Guardo el segon actual
        localStorage.setItem('fcb_progressio', JSON.stringify(progressioVideos)); // Ho deso al navegador
    }
};

video.onended = () => {                                                 // Al final del vídeo...
    if (!videosVistos.includes(videoActualTitol)) {                     // Si no estava vist...
        videosVistos.push(videoActualTitol);                            // L'afegeixo a l'array
        localStorage.setItem('fcb_vistos', JSON.stringify(videosVistos)); // Guardo els vistos
    }
};

// --- EVENTS ---
playPauseBtn.onclick = () => {                                          // En clicar Play/Pausa...
    if (video.paused) { video.play(); playPauseBtn.innerText = '⏸'; }     // Si parat, play
    else { video.pause(); playPauseBtn.innerText = '▶'; }                // Si en marxa, pausa
};

muteBtn.onclick = (e) => {                                              // En clicar l'altaveu...
    e.stopPropagation();                                                // Aturo propagació del clic
    if (!volumeContainer.classList.contains('show')) {                  // Si barra tancada...
        volumeContainer.classList.add('show');                          // La mostro
    } else {                                                            // Si barra ja oberta...
        video.muted = !video.muted;                                     // Silencio o activo so
        muteBtn.innerText = video.muted ? '🔇' : '🔊';                 // Cambio la icona
        volumeBar.value = video.muted ? 0 : video.volume;               // Ajusto la barra visual
    }
};

volumeBar.oninput = () => {                                             // En moure el volum...
    video.volume = volumeBar.value;                                     // Cambio volum real
    video.muted = video.volume === 0;                                   // Si és 0, faig mute
    muteBtn.innerText = video.volume === 0 ? '🔇' : '🔊';              // Icona segons volum
};

document.addEventListener('click', (e) => {                             // Si clico a la pantalla...
    if (!volumeContainer.contains(e.target)) volumeContainer.classList.remove('show'); // Tanco volum
});

seekBar.oninput = () => { video.currentTime = (seekBar.value / 100) * video.duration; }; // Seek manual

btnBack.onclick = () => {                                               // En clicar tornar enrere...
    video.pause();                                                      // Parem el vídeo
    pantallaReproductor.classList.add('hidden');                        // Amago reproductor
    pantallaLlista.classList.remove('hidden');                          // Mostro llista
    renderitzarLlista(dadesVideos.find(v => v.titol === videoActualTitol).categoria); // Refresco grid
};

fullScreenBtn.onclick = () => {                                         // En clicar pantalla completa...
    if (video.requestFullscreen) video.requestFullscreen();             // Fullscreen estàndard
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen(); // Fullscreen Safari/iOS
};

document.getElementById('btn-masculi').onclick = () => {                // Botó Masculí...
    document.getElementById('btn-masculi').classList.add('active');     // Activo botó
    document.getElementById('btn-femeni').classList.remove('active');   // Desactivo l'altre
    renderitzarLlista('Masculí');                                       // Pinto homes
};

document.getElementById('btn-femeni').onclick = () => {                 // Botó Femení...
    document.getElementById('btn-femeni').classList.add('active');      // Activo botó
    document.getElementById('btn-masculi').classList.remove('active');  // Desactivo l'altre
    renderitzarLlista('Femení');                                        // Pinto dones
};