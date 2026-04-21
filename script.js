/* =============================================
   JOSHIA 21 ANS — script.js
   =============================================

   CE FICHIER CONTIENT :
   1.  Animation d'intro (séquence d'ouverture avec GSAP)
   2.  Comportement de la navbar au scroll
   3.  Barre de progression au scroll
   4.  Animations "reveal" au scroll (IntersectionObserver)
   5.  Compteur "Ensemble depuis..." (mis à jour chaque seconde)
   6.  Message de l'anniversaire (carte 3 de la section "Pour Toi")
   7.  Contrôle de la musique (play/pause)
   8.  Gestion des overlays (galerie + message)
   9.  Animation de l'enveloppe
   10. Lightbox (visionneuse de photos)
   11. Confettis au chargement
   12. Étincelles au clic (♡ ✦ ✿...)
   13. Polaroïds → ouvre la galerie au clic
   14. Parallaxe du blob hero au scroll

   BIBLIOTHÈQUES UTILISÉES :
   - GSAP (GreenSock) : animations fluides
   - ScrollTrigger   : animations déclenchées au scroll
   - canvas-confetti : confettis colorés
   ============================================= */


/* ════════════════════════════════════════════
   1. ANIMATION D'INTRO (SÉQUENCE GSAP)
   ════════════════════════════════════════════
   → gsap.registerPlugin() : active l'extension ScrollTrigger
   → gsap.timeline()       : crée une séquence d'animations dans l'ordre
   → .to(élément, options) : anime un élément vers ces propriétés
   → '+=X'  : commence X secondes après la fin de l'étape précédente
   → '-=X'  : commence X secondes AVANT la fin de l'étape précédente
   → .call(fonction) : appelle une fonction à ce point de la séquence
   ════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger); /* Active l'extension ScrollTrigger de GSAP */

const introTl = gsap.timeline(); /* Crée la timeline d'intro */

introTl
  /* Étape 1 : le bouquet apparaît et grossit légèrement */
  .to('#bouquet-img', {
    opacity: 1,          /* Passe de invisible à visible */
    scale: 1.05,         /* Grossit de 5% */
    duration: 1.8,       /* ← Durée en secondes — augmente pour ralentir */
    ease: 'power2.out'   /* Courbe d'accélération */
  })
  /* Étape 2 : le bouquet revient à sa taille normale */
  .to('#bouquet-img', { scale: 1, duration: 0.4, ease: 'power1.out' })
  /* Étape 3 : l'intro monte et disparaît (après 0.8s d'attente) */
  .to('#intro-bouquet', {
    opacity: 0,
    y: -40,              /* Remonte de 40px en disparaissant */
    duration: 1,
    ease: 'power2.inOut',
    onComplete: () => {  /* Une fois terminé : cache complètement l'élément */
      const intro = document.getElementById('intro-bouquet');
      if (intro) intro.style.display = 'none';
    }
  }, '+=0.8') /* ← Délai avant cet étape — augmente pour plus de pause sur le bouquet */
  /* Étape 4 : badge de date (rose en haut) apparaît */
  .to('.hero-badge',  { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
  /* Étape 5 : grand titre "Joyeux 21 ans, Chérie" */
  .to('.hero-title',  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.2')
  /* Étape 6 : nom, tagline et bouton "Découvrir" apparaissent en décalé */
  .to(['.hero-sub', '.hero-tagline', '.hero-cta'], {
    opacity: 1,
    stagger: 0.18, /* ← Décalage entre chaque élément (en secondes) */
    duration: 0.7,
    ease: 'power2.out'
  }, '-=0.4')
  /* Étape 7 : blob photo apparaît */
  .to('.hero-blob', { opacity: 1, duration: 1, ease: 'power2.out' }, '-=0.6')
  /* Étape 8 : badges décoratifs (❤ 21 ✦) autour du blob */
  .to(['.deco-1', '.deco-2', '.deco-3'], {
    opacity: 1, stagger: 0.15, duration: 0.5, ease: 'back.out(1.5)'
  }, '-=0.5')
  /* Étape 9 : indicateur de scroll en bas */
  .to('.hero-scroll', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2')
  /* Étape 10 : lance les confettis */
  .call(launchConfetti);


/* ════════════════════════════════════════════
   2. COMPORTEMENT DE LA NAVBAR AU SCROLL
   ════════════════════════════════════════════
   → Ajoute la classe "scrolled" quand on scrolle > 60px
   → Cette classe active le fond blanc translucide (voir style.css #navbar.scrolled)
   → Pour changer le seuil : modifie le 60 dans window.scrollY > 60
   ════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    /* Ajoute "scrolled" si on a scrollé plus de 60px, sinon l'enlève */
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  updateProgressBar(); /* Met aussi à jour la barre de progression */
});


/* ════════════════════════════════════════════
   3. BARRE DE PROGRESSION
   ════════════════════════════════════════════
   → Calcule la position de scroll en % et met à jour la largeur de la barre
   → Appelée à chaque événement "scroll"
   ════════════════════════════════════════════ */
function updateProgressBar() {
  const el = document.getElementById('progress-bar');
  if (!el) return;
  const scrollTop  = window.scrollY;                                       /* Pixels scrollés */
  const docHeight  = document.documentElement.scrollHeight - window.innerHeight; /* Max scrollable */
  el.style.width   = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
}


/* ════════════════════════════════════════════
   4. ANIMATIONS "REVEAL" AU SCROLL
   ════════════════════════════════════════════
   → IntersectionObserver surveille les éléments avec la classe "reveal"
   → Quand un élément entre dans la vue : la classe "visible" est ajoutée
   → La classe "visible" déclenche l'animation CSS (voir style.css .reveal.visible)
   → "stagger" : décalage progressif entre les éléments frères
   → threshold: 0.12 = l'élément doit être visible à 12% avant de déclencher
   ════════════════════════════════════════════ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return; /* Ignore si pas encore dans la vue */
    /* Calcule l'index de l'élément parmi ses frères pour créer un décalage */
    const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
    const idx = siblings.indexOf(entry.target);
    /* Délai progressif : 0ms, 80ms, 160ms... selon la position */
    setTimeout(() => entry.target.classList.add('visible'), idx * 80);
    revealObs.unobserve(entry.target); /* Ne surveille plus cet élément après déclenchement */
  });
}, { threshold: 0.12 }); /* ← Sensibilité (0 = dès qu'il apparaît, 1 = entièrement visible) */

/* Surveille tous les éléments avec la classe "reveal" */
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


/* ════════════════════════════════════════════
   5. COMPTEUR "ENSEMBLE DEPUIS..."
   ════════════════════════════════════════════
   → Calcule la différence entre maintenant et la date de début
   → Se met à jour toutes les secondes (setInterval)
   → Les valeurs sont injectées dans les éléments HTML via leur id

   POUR CHANGER LA DATE DE DÉBUT :
   → Modifie la valeur de startDate ci-dessous
   → Format : new Date('AAAA-MM-JJTHH:MM:SS')
   ════════════════════════════════════════════ */
const startDate = new Date('2024-12-23T00:00:00'); /* ← DATE DE DÉBUT DE LA RELATION */

function updateTimer() {
  const diff = Date.now() - startDate.getTime(); /* Différence en millisecondes */

  /* Fonction utilitaire : convertit un nombre et l'affiche sur 2 chiffres (ex: 7 → "07") */
  const pad = (n) => String(Math.floor(n)).padStart(2, '0');

  /* Calculs des unités de temps */
  const days    = pad(diff / 86400000);               /* 1 jour = 86 400 000 ms */
  const hours   = pad((diff % 86400000) / 3600000);   /* 1 heure = 3 600 000 ms */
  const minutes = pad((diff % 3600000)  / 60000);     /* 1 minute = 60 000 ms */
  const seconds = pad((diff % 60000)    / 1000);      /* 1 seconde = 1 000 ms */

  /* Met à jour les éléments HTML */
  setNum('days',    days);
  setNum('hours',   hours);
  setNum('minutes', minutes);
  setNum('seconds', seconds);
}

/* Met à jour un élément par son id, et ajoute une animation "tick" si la valeur change */
function setNum(id, val) {
  const el = document.getElementById(id);
  if (!el || el.textContent === val) return; /* Rien à faire si valeur identique */
  el.textContent = val;
  el.classList.add('tick');                  /* Ajoute la classe pour l'animation de rebond */
  setTimeout(() => el.classList.remove('tick'), 200); /* Enlève la classe après 200ms */
}

updateTimer();                      /* Premier appel immédiat */
setInterval(updateTimer, 1000);     /* Puis toutes les secondes */


/* ════════════════════════════════════════════
   6. MESSAGE DE L'ANNIVERSAIRE (CARTE 3)
   ════════════════════════════════════════════
   → Affiche automatiquement un message selon la date actuelle :
     - Avant l'anniversaire : "Plus que X jours !"
     - Le jour J            : "C'est aujourd'hui !"
     - Après l'anniversaire : "Il y a X jours / X mois tu avais tes 21 ans"

   POUR CHANGER LA DATE D'ANNIVERSAIRE :
   → Modifie la valeur de bday ci-dessous
   → Format : new Date('AAAA-MM-JJTHH:MM:SS')
   ════════════════════════════════════════════ */
(function() {
  const el = document.getElementById('bday-display'); /* La div de la carte anniversaire */
  if (!el) return;

  const bday = new Date('2026-02-10T00:00:00'); /* ← DATE D'ANNIVERSAIRE ICI */
  const diff = Math.floor((Date.now() - bday.getTime()) / 86400000); /* Jours écoulés depuis l'anniv */

  if (diff < 0) {
    /* Avant l'anniversaire */
    const daysLeft = Math.abs(diff);
    el.textContent = 'Plus que ' + daysLeft + ' jour' + (daysLeft > 1 ? 's' : '') + ' ! 🎂';
  } else if (diff === 0) {
    /* Le jour J ! */
    el.textContent = "C'est aujourd'hui ! Joyeux anniversaire ! 🎂";
  } else {
    /* Après l'anniversaire */
    const months = Math.floor(diff / 30);
    el.textContent = months < 1
      ? 'Il y a ' + diff + ' jours tu avais tes 21 ans ✨'
      : 'Tu as maintenant 21 ans depuis ' + months + ' mois ✨';
  }
})();


/* ════════════════════════════════════════════
   7. CONTRÔLE DE LA MUSIQUE
   ════════════════════════════════════════════
   → Le bouton musique dans la nav appelle toggleMusic()
   → La musique démarre aussi automatiquement au premier clic sur la page
   → Pour changer le volume : modifie audio.volume (entre 0 et 1)
   → Pour désactiver l'auto-play : supprime le bloc "document.addEventListener" en bas
   ════════════════════════════════════════════ */
let musicOn = false;                                   /* État de la musique (on/off) */
const audio    = document.getElementById('bg-music'); /* Élément audio HTML */
const musicBtn = document.getElementById('music-btn'); /* Bouton dans la nav */

/* Appelé par le bouton musique dans la nav (onclick="toggleMusic(event)") */
function toggleMusic(e) {
  if (e) e.stopPropagation(); /* Empêche le clic de remonter vers le document */
  musicOn ? pauseMusic() : playMusic(); /* Alterne play/pause */
}

/* Lance la musique */
function playMusic() {
  if (!audio) return;
  audio.volume = 0.4;          /* ← Volume (0 = muet, 1 = maximum) */
  audio.play().catch(() => {}); /* .catch évite une erreur si le navigateur bloque */
  musicOn = true;
  if (musicBtn) {
    musicBtn.classList.add('playing');                       /* Active le style "en cours" */
    musicBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'; /* Change l'icône en pause */
  }
}

/* Met en pause la musique */
function pauseMusic() {
  if (!audio) return;
  audio.pause();
  musicOn = false;
  if (musicBtn) {
    musicBtn.classList.remove('playing');                    /* Désactive le style */
    musicBtn.innerHTML = '<i class="fa-solid fa-music"></i>'; /* Remet l'icône musique */
  }
}

/* Auto-play au premier clic sur n'importe où dans la page
   (les navigateurs bloquent l'auto-play tant que l'utilisateur n'a pas interagi) */
document.addEventListener('click', function autoPlay(e) {
  if (!musicOn && !e.target.closest('#music-btn')) {
    playMusic(); /* Lance la musique au premier clic */
  }
  document.removeEventListener('click', autoPlay); /* Ne s'exécute qu'une seule fois */
});


/* ════════════════════════════════════════════
   8. GESTION DES OVERLAYS (GALERIE & MESSAGE)
   ════════════════════════════════════════════
   → openOverlay('gallery') → ouvre l'overlay avec id="overlay-gallery"
   → openOverlay('note')    → ouvre l'overlay avec id="overlay-note"
   → closeOverlay('gallery') / closeOverlay('note') → ferment respectivement
   → La touche Échap ferme tous les overlays ouverts
   ════════════════════════════════════════════ */

/* Ouvre une fenêtre overlay (ajoute la classe "active") */
function openOverlay(name) {
  const el = document.getElementById('overlay-' + name); /* ex: "overlay-gallery" */
  if (!el) return;
  el.classList.add('active');            /* Rend l'overlay visible (voir style.css .overlay.active) */
  document.body.style.overflow = 'hidden'; /* Bloque le scroll de la page en dessous */
}

/* Ferme une fenêtre overlay */
function closeOverlay(name) {
  const el = document.getElementById('overlay-' + name);
  if (!el) return;
  el.classList.remove('active');         /* Cache l'overlay */
  document.body.style.overflow = '';     /* Réactive le scroll de la page */
}

/* Ferme tous les overlays et le lightbox avec la touche Échap */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.overlay.active').forEach(ov => ov.classList.remove('active'));
  closeLightbox();
  document.body.style.overflow = '';
});


/* ════════════════════════════════════════════
   9. ANIMATION DE L'ENVELOPPE
   ════════════════════════════════════════════
   → Appelée quand on clique sur l'enveloppe (onclick="openEnvelope()")
   → Ajoute la classe "open" sur l'enveloppe (CSS fait l'animation du rabat)
   → Puis ouvre l'overlay du message après 600ms (durée de l'animation CSS)
   ════════════════════════════════════════════ */
function openEnvelope() {
  const env = document.getElementById('envelope'); /* L'élément enveloppe */
  if (!env) return;
  if (!env.classList.contains('open')) {
    env.classList.add('open');                   /* Déclenche l'animation CSS (rabat s'ouvre) */
    setTimeout(() => openOverlay('note'), 600);  /* ← Délai avant l'ouverture du message (ms) */
  } else {
    openOverlay('note'); /* Déjà ouverte → ouvre directement le message */
  }
}


/* ════════════════════════════════════════════
   10. LIGHTBOX — VISIONNEUSE DE PHOTOS
   ════════════════════════════════════════════
   → openLightbox(src) : affiche une photo en grand plein écran
   → closeLightbox()   : ferme la visionneuse
   → Appelées via onclick="openLightbox(this.src)" dans la galerie HTML
   ════════════════════════════════════════════ */

/* Ouvre le lightbox avec l'image src donnée */
function openLightbox(src) {
  const lb  = document.getElementById('lightbox');     /* Le conteneur lightbox */
  const img = document.getElementById('lightbox-img'); /* La balise <img> */
  if (!lb || !img) return;
  img.src = src;                         /* Charge l'image cliquée */
  lb.classList.add('open');              /* Affiche le lightbox (voir style.css .lightbox.open) */
  document.body.style.overflow = 'hidden'; /* Bloque le scroll */
}

/* Ferme le lightbox */
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open'); /* Cache le lightbox */
  document.body.style.overflow = '';
}


/* ════════════════════════════════════════════
   11. CONFETTIS
   ════════════════════════════════════════════
   → Lance des confettis colorés au chargement (appelé à la fin de l'intro GSAP)
   → Utilise la bibliothèque canvas-confetti
   → Pour changer les couleurs : modifie le tableau "colors"
   → Pour changer la quantité : modifie "particleCount"
   → Pour changer la direction : modifie "angle" (0=droite, 90=haut, 180=gauche)
   ════════════════════════════════════════════ */
function launchConfetti() {
  if (typeof confetti === 'undefined') return; /* Sécurité si la lib n'est pas chargée */

  /* Couleurs des confettis (à personnaliser) */
  const opts = {
    origin: { y: 0.55 }, /* Point d'origine (0 = haut, 1 = bas) */
    colors: ['#F0A7AF', '#F5E0A0', '#FEF3F4', '#D4747E', '#fff'] /* ← Couleurs */
  };

  /* Trois rafales depuis différents angles */
  confetti({ ...opts, particleCount: 60, spread: 50, angle: 60  }); /* Depuis la gauche */
  confetti({ ...opts, particleCount: 60, spread: 50, angle: 120 }); /* Depuis la droite */
  confetti({ ...opts, particleCount: 40, spread: 80, angle: 90  }); /* Depuis le centre */
}


/* ════════════════════════════════════════════
   12. ÉTINCELLES AU CLIC (♡ ✦ ✿...)
   ════════════════════════════════════════════
   → Crée 3 symboles animés à l'endroit où on clique
   → Ne se déclenche pas sur les boutons, liens, overlays et navbar
   → SPARKS = liste des symboles disponibles (à personnaliser)
   → spawnSpark(x, y) : crée un symbole à la position (x, y)
   ════════════════════════════════════════════ */

/* Liste des symboles qui peuvent apparaître au clic
   ↓ Modifie cette liste pour changer les symboles */
const SPARKS = ['♡', '✦', '✿', '❀', '✧', '❤', '★', '✨'];

/* Écoute les clics sur toute la page */
document.addEventListener('click', (e) => {
  /* Ignore les clics sur les éléments interactifs */
  if (e.target.closest('button, a, .overlay, .lightbox, #navbar, input')) return;

  /* Crée 3 étincelles légèrement décalées autour du point de clic */
  for (let i = 0; i < 3; i++) { /* ← Nombre d'étincelles par clic */
    spawnSpark(
      e.clientX + (Math.random() - 0.5) * 30, /* Position X aléatoire ± 15px */
      e.clientY + (Math.random() - 0.5) * 30  /* Position Y aléatoire ± 15px */
    );
  }
});

/* Crée et anime un symbole à la position (x, y) */
function spawnSpark(x, y) {
  const el = document.createElement('span');
  el.className = 'click-spark';
  el.textContent = SPARKS[Math.floor(Math.random() * SPARKS.length)]; /* Symbole aléatoire */
  el.style.left    = x + 'px';
  el.style.top     = y + 'px';
  el.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem'; /* Taille aléatoire entre 0.8 et 1.6rem */
  el.style.animationDuration = (0.7 + Math.random() * 0.5) + 's'; /* Durée aléatoire */
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200); /* Supprime l'élément après l'animation */
}


/* ════════════════════════════════════════════
   13. POLAROÏDS → OUVRE LA GALERIE AU CLIC
   ════════════════════════════════════════════
   → Un clic sur n'importe quel polaroïd ouvre la galerie complète
   ════════════════════════════════════════════ */
document.querySelectorAll('.polaroid').forEach(p => {
  p.addEventListener('click', () => openOverlay('gallery'));
});


/* ════════════════════════════════════════════
   14. PARALLAXE DU BLOB HERO AU SCROLL
   ════════════════════════════════════════════
   → La photo blob du hero descend légèrement quand on scrolle
   → Donne un effet de profondeur
   → Pour amplifier l'effet : augmente le 0.10 (ex: 0.15 ou 0.20)
   → Pour désactiver : supprime tout ce bloc
   ════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const blob = document.querySelector('.hero-blob');
  if (!blob) return;
  /* Déplace le blob vers le bas de 10% de la distance scrollée */
  blob.style.transform = 'translateY(' + (window.scrollY * 0.10) + 'px)';
}, { passive: true }); /* passive: true = améliore les performances du scroll */
