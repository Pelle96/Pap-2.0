// contenitore
var carousel = document.querySelector(".carousel-3d");
// carte scorrevoli
var cards = [...carousel.querySelectorAll(".card-container")];
const CARDS = cards.length;
// opzioni
const MAX_VISIBILITY = 3;
const AUTO_SCROLL = true;
const AUTO_SCROLL_TIMER = 3000; //milliseconds
const INFINITE_SCROLL = true;
// frecce dx e sx
var navLeft = carousel.querySelector(".nav.left");
var navRight = carousel.querySelector(".nav.right");
// indice di carta attiva iniziale (si aggiorna nell'utilizzo)
var activeIndex = 0;

// funzionalità frecce
navRight.addEventListener("click", () => {
  activeIndex++;
  if (activeIndex >= CARDS) activeIndex = 0;
  updateCarousel();
});
navLeft.addEventListener("click", () => {
  activeIndex--;
  if (activeIndex < 0) activeIndex = CARDS - 1;
  updateCarousel();
});

// funzione di aggiornamento carosello
function updateCarousel() {
  if (!INFINITE_SCROLL) {
    // nascondi freccia sx se sulla prima carta
    if (activeIndex > 0) {
      navLeft.classList.remove("hidden");
    } else {
      navLeft.classList.add("hidden");
    }

    // nascondi freccia dx se sull'ultima carta
    if (activeIndex < CARDS - 1) {
      navRight.classList.remove("hidden");
    } else {
      navRight.classList.add("hidden");
    }
  }
  // aggiorna le proprietà di ogni card
  cards.forEach((c, i) => {
    function setStyles(index) {
      styles["--active"] = index === activeIndex ? 1 : 0;
      styles["--offset"] = (activeIndex - index) / 3;
      styles["--direction"] = Math.sign(activeIndex - index);
      styles["--abs-offset"] = Math.abs(activeIndex - index) / 3;
      styles["pointer-events"] = activeIndex === index ? "auto" : "none";
      styles["opacity"] =
        Math.abs(activeIndex - index) >= MAX_VISIBILITY ? "0" : "1";
      styles["display"] =
        Math.abs(activeIndex - index) >= MAX_VISIBILITY ? "none" : "block";
    }

    let styles = {};
    setStyles(i);

    if (INFINITE_SCROLL) {
      if (activeIndex < MAX_VISIBILITY - 1) {
        if (CARDS - i <= MAX_VISIBILITY - 1 - activeIndex) {
          setStyles(i - CARDS);
        }
      } else if (activeIndex > CARDS - MAX_VISIBILITY) {
        if (i + 1 <= activeIndex + MAX_VISIBILITY - CARDS) {
          setStyles(CARDS + i);
        }
      }
    }

    let stylesString = "";
    Object.entries(styles).forEach(
      (st) => (stylesString += `${st[0]}: ${st[1]}; `)
    );

    c.setAttribute("style", stylesString);
  });
}

updateCarousel();

// auto scroll
var autoScroll = null;
if (AUTO_SCROLL) {
  var autoScroll = setInterval(scroll, AUTO_SCROLL_TIMER);
  // disattiva quando hover con il mouse
  carousel.addEventListener("mouseover", () => clearInterval(autoScroll));
  // riattiva all'uscita del mouse
  carousel.addEventListener(
    "mouseout",
    () => (autoScroll = setInterval(scroll, AUTO_SCROLL_TIMER))
  );
}
// funzione per scrollare una carta alla volta
function scroll() {
  if (activeIndex < CARDS - 1) {
    navRight.click();
  } else {
    for (let i = 1; i < CARDS; i++) {
      navLeft.click();
    }
  }
}
