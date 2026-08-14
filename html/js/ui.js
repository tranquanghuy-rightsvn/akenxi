/* Header đổi nền khi cuộn, menu mobile, highlight menu theo section, reveal khi cuộn tới */
(function () {
  var header = document.getElementById("siteHeader");
  var nav = document.getElementById("mainNav");
  var toggle = document.getElementById("navToggle");

  /* ------------------------------- Header -------------------------------- */

  function onScroll() {
    header.classList.toggle("is-stuck", window.scrollY > 10);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------- Menu mobile ------------------------------ */

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
  });

  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* -------------------- Reveal các section khi cuộn tới ------------------ */

  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (!entry.isIntersecting) return;
          var delay = (entry.target.dataset.delay || i * 70) + "ms";
          entry.target.style.transitionDelay = delay;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* --------------------- Highlight menu theo section --------------------- */

  var links = [].slice.call(nav.querySelectorAll('a[href^="#"]'));
  var targets = links
    .map(function (a) {
      return { link: a, el: document.querySelector(a.getAttribute("href")) };
    })
    .filter(function (t) { return t.el; });

  if ("IntersectionObserver" in window && targets.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var hit = targets.find(function (t) { return t.el === entry.target; });
          if (!hit) return;
          links.forEach(function (a) { a.classList.remove("is-active"); });
          hit.link.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    targets.forEach(function (t) { navObserver.observe(t.el); });
  }
  /* --------- Slider sản phẩm bán chạy: trượt bằng transform + kéo tay ------- */

  [].forEach.call(document.querySelectorAll("[data-slider]"), function (slider) {
    var track = slider.querySelector("[data-slider-track]");
    var prev = slider.querySelector("[data-slider-prev]");
    var next = slider.querySelector("[data-slider-next]");
    if (!track || !track.children.length) return;

    var index = 0;
    var dragging = false;
    var startX = 0;
    var dragDx = 0;
    var pitch = 0;   // bề rộng 1 thẻ + gap
    var maxIndex = 0;

    function measure() {
      var card = track.children[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      pitch = card + gap;
      var perView = Math.max(1, Math.round((track.parentNode.clientWidth + gap) / pitch));
      maxIndex = Math.max(0, track.children.length - perView);
      if (index > maxIndex) index = maxIndex;
    }

    function apply(extra) {
      var x = -index * pitch + (extra || 0);
      track.style.transform = "translate3d(" + x + "px, 0, 0)";
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex;
    }

    function go(dir) {
      index = Math.min(Math.max(index + dir, 0), maxIndex);
      apply();
    }

    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });

    /* kéo bằng chuột / vuốt bằng ngón tay */

    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      dragDx = 0;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      dragDx = e.clientX - startX;
      // hơi "cứng" lại khi kéo quá hai đầu
      if ((index === 0 && dragDx > 0) || (index === maxIndex && dragDx < 0)) dragDx *= 0.35;
      apply(dragDx);
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
      if (Math.abs(dragDx) > pitch * 0.2) {
        index = Math.min(Math.max(index - Math.round(dragDx / pitch), 0), maxIndex);
        if (Math.abs(dragDx) > pitch * 0.2 && Math.round(dragDx / pitch) === 0) {
          index = Math.min(Math.max(index + (dragDx < 0 ? 1 : -1), 0), maxIndex);
        }
      }
      dragDx = 0;
      apply();
    }

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("pointerleave", endDrag);

    // đừng để kéo xong lại kích hoạt link/nút bên trong
    track.addEventListener("click", function (e) {
      if (Math.abs(dragDx) > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    window.addEventListener("resize", function () { measure(); apply(); });

    measure();
    apply();
  });
})();
