/* Hero campaign carousel — slide "Brand" (mô hình 3D) đã nằm sẵn trong index.html
   (xem js/main.js). File này chỉ dựng các slide ảnh còn lại + điều khiển chung
   (autoplay, dot, vuốt). Đổi campaign ảnh = sửa mảng PHOTO_CAMPAIGNS, không cần
   sửa CSS/markup. */
(function () {
  var PHOTO_CAMPAIGNS = [
    {
      tag: "Âm thanh",
      headline: "Sound.<br>Your way.",
      image: "images/products/akenxi_earphone01/AKENXI_web_01.jpg",
      alt: "AKENXI — tai nghe true wireless",
      ctaText: "Khám phá Âm thanh",
      ctaHref: "san-pham.html",
      graphic: "waveform",
    },
    {
      tag: "Sạc nhanh",
      headline: "Power<br>without limits.",
      image: "images/products/akenxi_charger100W_01/AKENXI_100W_Web_01.jpg",
      alt: "AKENXI — củ sạc nhanh 100W",
      ctaText: "Khám phá Sạc nhanh",
      ctaHref: "san-pham.html",
    },
    {
      tag: "New Product",
      headline: "Coming<br>soon.",
      image: "images/products/akenxi_cable02/AKENXI_Cable_Web_01_1600x1600.jpg",
      alt: "AKENXI — sản phẩm sắp ra mắt",
      ctaText: "",
      ctaHref: "",
    },
  ];

  var root = document.getElementById("heroSlider");
  if (!root) return;

  var slidesEl = root.querySelector("[data-hero-slides]");
  var dotsEl = root.querySelector("[data-hero-dots]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var index = 0;
  var timer = null;

  // 6 cột cao thấp xen kẽ, đủ để gợi ý waveform mà không rối mắt
  var WAVEFORM_HEIGHTS = [18, 38, 26, 52, 30, 44];

  function waveformHtml() {
    return (
      '<div class="hero-waveform" aria-hidden="true">' +
      WAVEFORM_HEIGHTS.map(function (h) {
        return '<span style="height:' + h + 'px"></span>';
      }).join("") +
      "</div>"
    );
  }

  // Dựng các slide ảnh (Audio/Charging/New Product) — slide "Brand" (3D) đã có sẵn trong HTML
  PHOTO_CAMPAIGNS.forEach(function (c) {
    var slide = document.createElement("div");
    slide.className = "hero-slide";

    var ctaRow = c.ctaText
      ? '<div class="hero-cta-row"><a class="btn btn-primary" href="' + c.ctaHref + '">' + c.ctaText + "</a></div>"
      : "";

    slide.innerHTML =
      '<img src="' + c.image + '" alt="' + c.alt + '" loading="lazy">' +
      '<div class="hero-copy"><div class="container">' +
        '<span class="hero-tag">' + c.tag + "</span>" +
        '<h1 class="display">' + c.headline + "</h1>" +
        ctaRow +
      "</div></div>" +
      (c.graphic === "waveform" ? waveformHtml() : "");
    slidesEl.appendChild(slide);
  });

  // Toàn bộ slide theo đúng thứ tự DOM: Brand (3D, tĩnh) rồi tới các slide ảnh
  var slideEls = root.querySelectorAll(".hero-slide");
  var TAGS = ["Brand"].concat(PHOTO_CAMPAIGNS.map(function (c) { return c.tag; }));

  TAGS.forEach(function (tag, i) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", "Xem campaign " + tag);
    dot.addEventListener("click", function () { go(i); restart(); });
    dotsEl.appendChild(dot);
  });

  var dotEls = dotsEl.querySelectorAll(".hero-dot");
  var prevBtn = root.querySelector("[data-hero-prev]");
  var nextBtn = root.querySelector("[data-hero-next]");
  var total = slideEls.length;

  function go(i) {
    index = (i + total) % total;
    slideEls.forEach(function (el, n) { el.classList.toggle("is-active", n === index); });
    dotEls.forEach(function (el, n) { el.classList.toggle("is-active", n === index); });
  }

  function next() { go(index + 1); }
  function prev() { go(index - 1); }

  function stop() {
    if (timer) { window.clearInterval(timer); timer = null; }
  }

  function start() {
    if (reduceMotion || total < 2) return;
    stop();   // luôn dọn interval cũ trước — tránh chồng nhiều interval khi
              // mouseenter/mouseleave/focusin/focusout dồn dập lúc di chuột qua lại
              // ở rìa hero, vốn là nguyên nhân khiến campaign nhảy liên tục
    timer = window.setInterval(next, 5000);
  }

  function restart() { stop(); start(); }

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);

  // Nút điều hướng 2 bên — chỉ hiển thị ở desktop (CSS ẩn trên mobile)
  if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });
  if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });

  /* Vuốt để đổi campaign trên mobile — áp dụng cho toàn bộ hero kể cả vùng mô
     hình 3D, vì ở mobile canvas đã bị `pointer-events: none` (css/style.css) nên
     không còn tranh chấp với thao tác kéo-xoay (chỉ bật ở desktop). */
  var touchStartX = null;
  var touchStartY = null;

  root.addEventListener("touchstart", function (e) {
    var t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  root.addEventListener("touchend", function (e) {
    if (touchStartX === null) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStartX;
    var dy = t.clientY - touchStartY;
    touchStartX = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next(); else prev();
      restart();
    }
  });

  start();
})();
