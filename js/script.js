(function () {
  var rm = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ===== BG CANVAS: floating sparkle dust ===== */
  var bgC = document.getElementById("bgCanvas");
  var bgCtx = bgC.getContext("2d");
  var dust = [];
  function resizeBg() {
    bgC.width = innerWidth;
    bgC.height = innerHeight;
  }
  resizeBg();
  window.addEventListener("resize", resizeBg);
  function mkDust() {
    return {
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.8 + 0.4,
      o: Math.random() * 0.6 + 0.1,
      sp: Math.random() * 0.4 + 0.1,
      drift: Math.random() * 1.2 - 0.6,
      twinkle: Math.random() * Math.PI * 2,
      tw: Math.random() * 0.03 + 0.01,
    };
  }
  for (var i = 0; i < 60; i++) dust.push(mkDust());
  function animBg() {
    bgCtx.clearRect(0, 0, bgC.width, bgC.height);
    dust.forEach(function (d) {
      d.y -= d.sp;
      d.x += d.drift;
      d.twinkle += d.tw;
      var alpha = d.o * (0.5 + 0.5 * Math.sin(d.twinkle));
      bgCtx.beginPath();
      bgCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      bgCtx.fillStyle = "rgba(196,154,60," + alpha + ")";
      bgCtx.fill();
      if (d.y < -10 || d.x < -10 || d.x > bgC.width + 10) {
        Object.assign(d, mkDust());
        d.y = innerHeight + 10;
        d.x = Math.random() * innerWidth;
      }
    });
    requestAnimationFrame(animBg);
  }
  if (!rm) animBg();

  /* ===== CONFETTI CANVAS ===== */
  var cfC = document.getElementById("confettiCanvas");
  var cfCtx = cfC.getContext("2d");
  cfC.width = innerWidth;
  cfC.height = innerHeight;
  window.addEventListener("resize", function () {
    cfC.width = innerWidth;
    cfC.height = innerHeight;
  });
  var cfPieces = [];
  var cfColors = ["#D4A0A8", "#C49A3C", "#7B2D3A", "#E8C96A", "#5C6B4C", "#F0C8CC", "#ce99a0"];
  function burstConfetti(x, y, n) {
    for (var i = 0; i < (n || 60); i++) {
      var angle = Math.random() * Math.PI * 2;
      var spd = 3 + Math.random() * 7;
      cfPieces.push({
        x: x || cfC.width / 2,
        y: y || cfC.height * 0.5,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 4,
        w: 6 + Math.random() * 8,
        h: 3 + Math.random() * 5,
        color: cfColors[Math.floor(Math.random() * cfColors.length)],
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.25,
        life: 1,
        decay: 0.012 + Math.random() * 0.012,
      });
    }
  }
  function animCf() {
    cfCtx.clearRect(0, 0, cfC.width, cfC.height);
    cfPieces = cfPieces.filter(function (p) {
      return p.life > 0;
    });
    cfPieces.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18;
      p.vx *= 0.98;
      p.rot += p.rotV;
      p.life -= p.decay;
      cfCtx.save();
      cfCtx.globalAlpha = Math.max(0, p.life);
      cfCtx.translate(p.x, p.y);
      cfCtx.rotate(p.rot);
      cfCtx.fillStyle = p.color;
      cfCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cfCtx.restore();
    });
    requestAnimationFrame(animCf);
  }
  if (!rm) animCf();

  /* ===== INTRO ===== */
  var introScreen = document.getElementById("introScreen");
  var envWrap = document.getElementById("envWrap");
  // add sparks
  if (!rm) {
    [
      [-70, -45],
      [75, -25],
      [-95, 35],
      [85, 45],
      [5, -80],
      [60, 60],
      [-50, 65],
    ].forEach(function (p, i) {
      var s = document.createElement("span");
      s.className = "intro-star";
      s.style.left = "calc(50% + " + p[0] + "px)";
      s.style.top = "calc(50% + " + p[1] + "px)";
      s.style.animationDelay = i * 0.18 + "s";
      introScreen.querySelector(".intro-inner").appendChild(s);
    });
  }
  function startEnvelopeFall() {
    envWrap.classList.add("falling");
    var dur = rm ? 0 : 1200;
    setTimeout(function () {
      envWrap.classList.remove("falling");
      envWrap.style.opacity = "1";
      envWrap.style.transform = "none";
      envWrap.classList.add("landed");
    }, dur);
  }
  if (rm) {
    introScreen.classList.add("hide");
    startEnvelopeFall();
  } else {
    setTimeout(function () {
      introScreen.classList.add("hide");
      startEnvelopeFall();
    }, 2600);
  }

  /* ===== MUSIC ===== */

  let musicOn = true;

  // Ganti dengan file MP3 milikmu
  const bgMusic = new Audio("music/hbd.mp3");

  bgMusic.loop = true;
  bgMusic.volume = 0.14;
  bgMusic.preload = "auto";

  // Mulai musik
  function startMusic() {
    bgMusic.play().catch((err) => {
      console.log("Gagal memutar musik:", err);
    });

    document.getElementById("musicBtn").classList.add("show");
  }

  // Toggle musik
  document.getElementById("musicBtn").addEventListener("click", function (e) {
    e.stopPropagation();

    musicOn = !musicOn;

    this.classList.toggle("muted", !musicOn);
    this.setAttribute("aria-pressed", musicOn);

    if (musicOn) {
      bgMusic.play();
    } else {
      bgMusic.pause();
    }
  });

  // Autoplay setelah interaksi pertama
  document.addEventListener(
    "click",
    function initMusic() {
      startMusic();
      document.removeEventListener("click", initMusic);
    },
    { once: true },
  );

  /* ===== ENVELOPE ===== */
  var envelope = document.getElementById("envelope");
  var envScreen = document.getElementById("envelopeScreen");
  var seal = document.getElementById("seal");
  var cardScreen = document.getElementById("cardScreen");
  var opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;
    envelope.classList.add("open");
    envWrap.classList.add("opening");
    startMusic();
    var flapDur = rm ? 0 : 1150;
    setTimeout(function () {
      envScreen.classList.add("dismissed");
      var fadeDur = rm ? 0 : 980;
      setTimeout(function () {
        cardScreen.removeAttribute("aria-hidden");
        cardScreen.classList.add("visible");
        document.body.classList.remove("locked");
        // stagger list items
        document.querySelectorAll(".app-list li").forEach(function (li, i) {
          setTimeout(
            function () {
              li.classList.add("visible");
            },
            200 + i * 160,
          );
        });
      }, fadeDur);
    }, flapDur);
  }
  seal.addEventListener("click", openEnvelope);
  seal.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openEnvelope();
    }
  });

  /* ===== SCROLL REVEAL ===== */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );
    reveals.forEach(function (el) {
      obs.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ===== CAKE SCENE ===== */
  document.getElementById("cakeAnnounce").addEventListener("click", function () {
    document.getElementById("cakeScene").classList.add("show");
    document.getElementById("cakeScene").removeAttribute("aria-hidden");
    document.body.classList.add("locked");
  });

  var blown = false;
  var cakeBtn = document.getElementById("cakeBtn");
  var cakeHint = document.getElementById("cakeHint");
  var wishMsg = document.getElementById("wishMsg");
  var cakeScene = document.getElementById("cakeScene");
  var giftScene = document.getElementById("giftScene");

  function blowCandle() {
    if (blown) return;
    blown = true;
    cakeBtn.classList.add("out");
    cakeHint.textContent = "";
    // confetti burst at cake position
    var r = cakeBtn.getBoundingClientRect();
    burstConfetti(r.left + r.width / 2, r.top + r.height * 0.4, 55);

    setTimeout(function () {
      wishMsg.classList.add("show");
    }, 700);

    setTimeout(function () {
      cakeScene.style.transition = "opacity .85s ease,visibility .85s ease";
      cakeScene.style.opacity = "0";
      cakeScene.style.visibility = "hidden";
      setTimeout(function () {
        cakeScene.classList.remove("show");
        cakeScene.style.cssText = "";
        giftScene.classList.add("show");
        // confetti again
        burstConfetti(innerWidth / 2, innerHeight * 0.45, 45);
      }, 870);
    }, 3600);
  }
  cakeBtn.addEventListener("click", blowCandle);
  cakeBtn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      blowCandle();
    }
  });

  /* ===== BALLOONS ===== */
  var balloonLayer = document.getElementById("balloonLayer");
  var blnColors = ["#CE99A0", "#C49A3C", "#7B2D3A", "#E8C96A", "#5C6B4C", "#F0C8CC", "#a0c4b8", "#f4a261"];
  var blnInterval = null;

  function spawnBalloon() {
    var b = document.createElement("div");
    b.className = "bln";
    var left = 4 + Math.random() * 92;
    var color = blnColors[Math.floor(Math.random() * blnColors.length)];
    var dur = 8 + Math.random() * 7;
    var sway = Math.random() * 60 - 30 + "px";
    var size = 44 + Math.random() * 32;
    b.style.cssText = "left:" + left + "vw;background:" + color + ";color:" + color + ";width:" + size + "px;height:" + size * 1.25 + "px;animation-duration:" + dur + "s;";
    b.style.setProperty("--sw", sway);
    // shine
    var shine = document.createElement("div");
    shine.className = "bln-shine";
    b.appendChild(shine);
    balloonLayer.appendChild(b);
    setTimeout(
      function () {
        if (b.parentNode) b.remove();
      },
      dur * 1000 + 300,
    );
  }

  function startBalloons() {
    if (rm) return;
    for (var i = 0; i < 8; i++) setTimeout(spawnBalloon, i * 120);
    blnInterval = setInterval(spawnBalloon, 550);
  }

  /* ===== GIFT BOX ===== */
  var giftOpened = false;
  var giftWrap = document.getElementById("giftWrap");
  var gsHint = document.getElementById("gsHint");

  function openGift() {
    if (giftOpened) return;
    giftOpened = true;
    giftWrap.classList.add("opened");
    if (gsHint) gsHint.style.opacity = "0";
    // big confetti burst
    burstConfetti(innerWidth / 2, innerHeight * 0.42, 80);
    setTimeout(function () {
      burstConfetti(innerWidth / 2, innerHeight * 0.42, 60);
    }, 400);
    startBalloons();
  }
  giftWrap.addEventListener("click", openGift);
  giftWrap.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openGift();
    }
  });
})();
