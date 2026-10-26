(() => {
  "use strict";
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const loader = $("#loader");
  const site = $("#site");
  const loaderOpenBtn = $("#loaderOpenBtn");
  const loaderStatus = $("#loaderStatus");
  const music = $("#birthdayMusic");
  const musicToggle = $("#musicToggle");
  const musicLabel = $("#musicLabel");

  if (music) {
    music.volume = 0.8;
  }

  const musicFallbackSources = [
    "assets/music.mp3",
    "assets/birthday-music.mp3",
    "music.mp3",
    "birthday-music.mp3"
  ];

  let userManuallyPaused = false;

  const playBirthdayMusic = async () => {
    if (!music) return false;

    // 1. Try playing existing source / current source
    try {
      await music.play();
      return true;
    } catch (e) {
      // Current source failed, try known fallback locations
    }

    // 2. Try iterating candidates
    for (const source of musicFallbackSources) {
      try {
        music.src = source;
        music.load();
        await music.play();
        return true;
      } catch (e) {
        // Continue to next candidate
      }
    }
    return false;
  };

  const updateMusicUI = (isPlaying) => {
    if (musicLabel) {
      musicLabel.textContent = isPlaying ? "Music on" : "Music off";
    }
    if (musicToggle) {
      musicToggle.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    }
  };

  if (music) {
    music.addEventListener("play", () => updateMusicUI(true));
    music.addEventListener("pause", () => {
      if (music.paused) updateMusicUI(false);
    });
  }

  // Handle first user interaction to start music if autoplay was blocked by browser
  const gestureEvents = ["pointerdown", "touchstart", "touchend", "click", "keydown", "scroll"];
  const cleanupAutoPlayListeners = () => {
    gestureEvents.forEach(evt => {
      window.removeEventListener(evt, onFirstInteraction, true);
    });
  };

  const onFirstInteraction = async () => {
    if (userManuallyPaused) {
      cleanupAutoPlayListeners();
      return;
    }
    if (music && music.paused) {
      const success = await playBirthdayMusic();
      if (success) {
        cleanupAutoPlayListeners();
      }
    } else {
      cleanupAutoPlayListeners();
    }
  };

  // Loader dismiss and open surprise logic
  let loaderDismissed = false;
  const dismissLoader = () => {
    if (loaderDismissed || !loader) return;
    loaderDismissed = true;
    loader.classList.add("done");
    if (site) site.classList.add("ready");
    window.setTimeout(() => loader.remove(), 800);
  };

  const handleOpenSurprise = async () => {
    if (music && music.paused && !userManuallyPaused) {
      await playBirthdayMusic();
    }
    dismissLoader();
  };

  if (loaderOpenBtn) {
    loaderOpenBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleOpenSurprise();
    });
  }

  if (loader) {
    loader.addEventListener("click", () => {
      handleOpenSurprise();
    });
  }

  // Autoplay attempt:
  // If browser permits direct unmuted autoplay, music plays right away and loader auto-dismisses after 2s!
  // If browser blocks unmuted autoplay (standard browser policy), loader shows button and first tap starts music.
  const initAutoplay = () => {
    gestureEvents.forEach(evt => {
      window.addEventListener(evt, onFirstInteraction, { capture: true, passive: true });
    });

    if (music && music.paused && !userManuallyPaused) {
      playBirthdayMusic().then((started) => {
        if (started) {
          cleanupAutoPlayListeners();
          window.setTimeout(dismissLoader, 2050);
        } else {
          if (loaderStatus) {
            loaderStatus.textContent = "Your surprise is ready! ♡";
          }
          window.setTimeout(dismissLoader, 4500);
        }
      }).catch(() => {
        window.setTimeout(dismissLoader, 4500);
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAutoplay);
  } else {
    initAutoplay();
  }
  window.addEventListener("load", () => {
    if (music && music.paused && !userManuallyPaused) {
      playBirthdayMusic().then((started) => {
        if (started) {
          cleanupAutoPlayListeners();
          dismissLoader();
        }
      }).catch(() => {});
    }
  });

  // Scroll reveal, with a fallback for browsers without IntersectionObserver.
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  // Photo lightbox with previous/next controls.
  const photoCards = $$(".polaroid");
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxCaption = $("#lightboxCaption");
  let activePhoto = 0;
  const showPhoto = index => {
    activePhoto = (index + photoCards.length) % photoCards.length;
    const card = photoCards[activePhoto];
    const image = $("img", card);
    lightboxImage.src = card.dataset.photo;
    lightboxImage.alt = image ? image.alt : card.dataset.caption;
    lightboxCaption.textContent = card.dataset.caption || "";
  };
  const openLightbox = index => {
    showPhoto(index);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $("#lightboxClose").focus();
  };
  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  photoCards.forEach((card, index) => card.addEventListener("click", () => openLightbox(index)));
  $("#lightboxClose").addEventListener("click", closeLightbox);
  $("#photoPrev").addEventListener("click", () => showPhoto(activePhoto - 1));
  $("#photoNext").addEventListener("click", () => showPhoto(activePhoto + 1));
  lightbox.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", event => {
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showPhoto(activePhoto - 1);
    if (event.key === "ArrowRight") showPhoto(activePhoto + 1);
  });

  // Envelope opens and folds gracefully; never overlaps heading.
  const letterStage = $("#letterStage");
  const envelope = $("#envelopeButton");
  const envelopeHint = $("#envelopeHint");
  const letterFoldBtn = $("#letterFoldBtn");
  const letterInstruction = $("#letterInstruction");

  const toggleLetter = (forceState) => {
    const isCurrentlyOpen = letterStage.classList.contains("open");
    const open = typeof forceState === "boolean" ? forceState : !isCurrentlyOpen;
    letterStage.classList.toggle("open", open);
    envelope.classList.toggle("open", open);
    envelope.setAttribute("aria-expanded", String(open));
    if (envelopeHint) {
      envelopeHint.textContent = open ? "Letter is open ♡" : "Tap to open";
    }
    if (letterInstruction) {
      letterInstruction.textContent = open
        ? "A few words written just for you ♡"
        : "Tap the envelope to read what's waiting inside.";
    }
  };

  envelope.addEventListener("click", () => toggleLetter());
  if (letterFoldBtn) {
    letterFoldBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleLetter(false);
    });
  }

  // Cake wish and a small, lightweight confetti burst.
  const wishButton = $("#wishButton");
  const cake = $(".cake");
  let wished = false;
  wishButton.addEventListener("click", () => {
    if (wished) return;
    wished = true;
    cake.classList.add("blown");
    $("#wishMessage").classList.add("wish-celebrated");
    wishButton.textContent = "Wish sent with love";
    wishButton.disabled = true;
    const layer = $("#confettiLayer");
    const colors = ["#ec4899", "#f9a8d4", "#c084fc", "#fda4af", "#fff"];
    for (let i = 0; i < 42; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.setProperty("--confetti", colors[i % colors.length]);
      piece.style.setProperty("--dx", `${Math.round(Math.random() * 380 - 190)}px`);
      piece.style.setProperty("--dy", `${Math.round(Math.random() * 320 + 100)}px`);
      piece.style.setProperty("--rot", `${Math.round(Math.random() * 900 - 450)}deg`);
      piece.style.left = `${50 + Math.random() * 20 - 10}%`;
      piece.style.animationDelay = `${Math.random() * 0.22}s`;
      layer.appendChild(piece);
      window.setTimeout(() => piece.remove(), 1900);
    }
  });

  // Top-bar Music Toggle
  if (musicToggle && music) {
    musicToggle.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (music.paused) {
        userManuallyPaused = false;
        musicLabel.textContent = "Loading...";
        const success = await playBirthdayMusic();
        if (success) {
          cleanupAutoPlayListeners();
        } else {
          musicLabel.textContent = "Add music file";
          musicToggle.setAttribute("aria-pressed", "false");
        }
      } else {
        userManuallyPaused = true;
        music.pause();
        cleanupAutoPlayListeners();
      }
    });
  }

  // Replay the experience from the beginning.
  $("#replayButton").addEventListener("click", () => {
    toggleLetter(false);
    cake.classList.remove("blown");
    wished = false;
    wishButton.disabled = false;
    wishButton.textContent = "Make a wish";
    $("#wishMessage").textContent = "May all your dreams come true, Jaggu!";
    $("#wishMessage").classList.remove("wish-celebrated");
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
})();
