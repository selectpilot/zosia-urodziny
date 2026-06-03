// ===== Inicjalizacja po załadowaniu =====
document.addEventListener('DOMContentLoaded', () => {
  // Personalizacja imienia
  document.querySelectorAll('.name').forEach(el => el.textContent = CONFIG.imie);
  document.title = `Niespodzianka dla ${CONFIG.imie} 🎂`;

  // Konfetti canvas
  const canvas = document.getElementById('confetti-canvas');
  const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });

  // ===== Przełączanie scen =====
  function goToScene(num) {
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`scene-${num}`);
    if (target) {
      target.classList.add('active');
      // delikatne konfetti przy przejściach
      if (num === 2) burstConfetti('soft');
    }
  }

  // Przyciski "data-next"
  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-next');
      goToScene(next);
    });
  });

  // ===== Scena 3: tort i świeczki =====
  const cake = document.getElementById('cake');
  const cakeHint = document.getElementById('cake-hint');
  const candles = document.querySelectorAll('.candle');
  let blowCount = 0;

  cake.addEventListener('click', () => {
    if (blowCount >= 3) return;
    candles[blowCount].classList.add('out');
    candles[blowCount].textContent = '💨';
    blowCount++;

    const remaining = 3 - blowCount;
    if (remaining > 0) {
      cakeHint.innerHTML = `Pozostało dmuchnięć: <strong>${remaining}</strong>`;
    } else {
      cakeHint.innerHTML = '✨ Życzenie złapane przez wszechświat ✨';
      burstConfetti('soft');
      setTimeout(() => goToScene(4), 1400);
    }
  });

  // ===== Scena 4: prezent =====
  const giftBtn = document.getElementById('gift-btn');
  giftBtn.addEventListener('click', () => {
    burstConfetti('big');
    setTimeout(() => {
      goToScene(5);
      setTimeout(() => burstConfetti('big'), 200);
    }, 400);
  });

  // ===== Scena 5: wypełnienie karty =====
  document.getElementById('gift-code').textContent = CONFIG.kodPodarunkowy;
  document.getElementById('card-amount').textContent = CONFIG.kwota;
  document.getElementById('valid-until').textContent = CONFIG.waznoscDo;
  document.getElementById('redeem-link').href = CONFIG.linkDoRealizacji;
  document.getElementById('from-name').textContent = CONFIG.podpis;

  // Kopiowanie kodu
  const copyBtn = document.getElementById('copy-btn');
  const copyStatus = document.getElementById('copy-status');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.kodPodarunkowy);
      copyStatus.textContent = '✓ Skopiowano!';
      setTimeout(() => copyStatus.textContent = '', 2500);
    } catch (e) {
      copyStatus.textContent = 'Skopiuj ręcznie 🙏';
    }
  });

  // ===== Muzyka: Happy Birthday w stylu pozytywki (Web Audio API) =====
  let audioCtx = null;
  let musicGain = null;
  let musicTimer = null;
  let musicPlaying = false;
  const musicBtn = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');

  // Nuty melodii Happy Birthday (częstotliwość w Hz, długość w sekundach)
  // Public domain od 2016 roku
  const NOTES = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, Bb4: 466.16, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99
  };

  const MELODY = [
    // Happy Birth-day to you
    ['C4', 0.4], ['C4', 0.2], ['D4', 0.6], ['C4', 0.6], ['F4', 0.6], ['E4', 1.0],
    // Happy Birth-day to you
    ['C4', 0.4], ['C4', 0.2], ['D4', 0.6], ['C4', 0.6], ['G4', 0.6], ['F4', 1.0],
    // Happy Birth-day dear Zo-siu
    ['C4', 0.4], ['C4', 0.2], ['C5', 0.6], ['A4', 0.6], ['F4', 0.6], ['E4', 0.6], ['D4', 1.0],
    // Happy Birth-day to you
    ['Bb4', 0.4], ['Bb4', 0.2], ['A4', 0.6], ['F4', 0.6], ['G4', 0.6], ['F4', 1.2]
  ];

  function playNote(freq, duration, startTime) {
    // Główny ton (sinus = miękki dźwięk pozytywki)
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;

    // Lekki wyższy harmoniczny dla "pozytywkowego" brzmienia
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 2;
    const gain2 = audioCtx.createGain();

    // Obwiednia (attack + decay) – jak młoteczek pozytywki
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.7);

    osc.connect(gain).connect(musicGain);
    osc2.connect(gain2).connect(musicGain);
    osc.start(startTime);
    osc2.start(startTime);
    osc.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  function playMelodyLoop() {
    if (!musicPlaying) return;
    let t = audioCtx.currentTime + 0.1;
    let totalDuration = 0;

    MELODY.forEach(([note, dur]) => {
      playNote(NOTES[note], dur * 0.95, t);
      t += dur;
      totalDuration += dur;
    });

    // Zapętl po zakończeniu (+ 2s pauzy)
    musicTimer = setTimeout(playMelodyLoop, (totalDuration + 2) * 1000);
  }

  function startMusic() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      musicGain = audioCtx.createGain();
      musicGain.gain.value = 0.25; // głośność ogólna
      musicGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    musicPlaying = true;
    musicBtn.classList.add('playing');
    musicIcon.textContent = '🔊';
    playMelodyLoop();
  }

  function stopMusic() {
    musicPlaying = false;
    musicBtn.classList.remove('playing');
    musicIcon.textContent = '🔇';
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
    if (audioCtx) audioCtx.suspend();
  }

  musicBtn.addEventListener('click', () => {
    if (musicPlaying) stopMusic(); else startMusic();
  });

  // Próbujemy autoplay od razu po załadowaniu strony.
  // Większość przeglądarek to zablokuje (polityka autoplay), ale spróbujmy –
  // a jeśli się nie uda, muzyka ruszy przy pierwszej interakcji (klik / dotyk / klawisz).
  function tryAutoplay() {
    startMusic();
    // Sprawdź po krótkiej chwili czy context faktycznie gra
    setTimeout(() => {
      if (audioCtx && audioCtx.state !== 'running') {
        // Autoplay zablokowany – pulsuj przycisk muzyki żeby zwrócić uwagę
        musicBtn.classList.add('attention');
      }
    }, 300);
  }

  // Spróbuj od razu
  tryAutoplay();

  // Plus fallback: każda interakcja użytkownika włącza muzykę jeśli jeszcze nie gra
  const enableOnInteraction = (e) => {
    if (e.target && e.target.closest && e.target.closest('#music-toggle')) return;
    if (!audioCtx || audioCtx.state !== 'running') {
      startMusic();
      musicBtn.classList.remove('attention');
    }
  };

  document.addEventListener('click',     enableOnInteraction, { once: true });
  document.addEventListener('touchstart', enableOnInteraction, { once: true });
  document.addEventListener('keydown',    enableOnInteraction, { once: true });

  // ===== Helpery konfetti =====
  function burstConfetti(type) {
    if (type === 'big') {
      const duration = 2500;
      const end = Date.now() + duration;
      const colors = ['#ff8eb3', '#ffd700', '#ffafd6', '#ff5e9c', '#fff8b8'];

      (function frame() {
        myConfetti({
          particleCount: 4,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors
        });
        myConfetti({
          particleCount: 4,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();

      // Wielki wybuch na środku
      myConfetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors
      });
    } else {
      myConfetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#ff8eb3', '#ffd700', '#ffafd6']
      });
    }
  }
});
