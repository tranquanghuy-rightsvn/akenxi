/* Hero campaign carousel — dùng ảnh sản phẩm, không dùng mô hình 3D. */
(function () {
  var CAMPAIGNS = [
    { tag: "Kết nối", headline: "Connect<br>your way.", image: "images/products/akenxi_cable01/AKENXI_cable_06.jpg", alt: "Cáp sạc AKENXI", ctaText: "Khám phá Cáp", ctaHref: "san-pham.html?cat=Cáp" },
    { tag: "Âm thanh", headline: "Sound.<br>Your way.", image: "images/products/akenxi_earphone02/AKENXI_web_05_1800x1800.png", alt: "Tai nghe AKENXI", ctaText: "Khám phá Âm thanh", ctaHref: "san-pham.html?cat=Âm thanh" },
    { tag: "Âm thanh", headline: "Hear<br>every detail.", image: "images/products/akenxi_earphone01/AKENXI_web_01_cutout.png", alt: "Tai nghe AKENXI", ctaText: "Khám phá Âm thanh", ctaHref: "san-pham.html?cat=Âm thanh" },
    { tag: "Âm thanh", headline: "Sound<br>in style.", image: "images/products/akenxi_earphone01/AKENXI_web_04.jpg", alt: "Tai nghe AKENXI", ctaText: "Khám phá Âm thanh", ctaHref: "san-pham.html?cat=Âm thanh" },
    { tag: "New Product", headline: "Coming<br>soon.", image: "images/products/akenxi_newProduct/akenxi_newProduct.jpg", alt: "Sản phẩm mới AKENXI", ctaText: "", ctaHref: "" }
  ];

  var root = document.getElementById("heroSlider");
  if (!root) return;
  var slidesEl = root.querySelector("[data-hero-slides]");
  var dotsEl = root.querySelector("[data-hero-dots]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var index = 0;
  var timer = null;

  CAMPAIGNS.forEach(function (campaign, i) {
    var slide = document.createElement("div");
    slide.className = "hero-slide is-photo-slide" + (i === 0 ? " is-active" : "");
    var cta = campaign.ctaText ? '<div class="hero-cta-row"><a class="btn btn-primary" href="' + campaign.ctaHref + '">' + campaign.ctaText + "</a></div>" : "";
    slide.innerHTML = '<div class="hero-slide-media is-photo"><img src="' + campaign.image + '" alt="' + campaign.alt + '" loading="' + (i === 0 ? "eager" : "lazy") + '"></div><div class="hero-copy"><div class="container hero-slide-text"><span class="hero-tag">' + campaign.tag + '</span><h1 class="display">' + campaign.headline + '</h1>' + cta + '</div></div>';
    slidesEl.appendChild(slide);

    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", "Xem campaign " + campaign.tag);
    dot.addEventListener("click", function () { go(i); restart(); });
    dotsEl.appendChild(dot);
  });

  var slideEls = root.querySelectorAll(".hero-slide");
  var dotEls = dotsEl.querySelectorAll(".hero-dot");
  function go(i) {
    index = (i + slideEls.length) % slideEls.length;
    slideEls.forEach(function (el, n) { el.classList.toggle("is-active", n === index); });
    dotEls.forEach(function (el, n) { el.classList.toggle("is-active", n === index); });
  }
  function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
  function start() { if (reduceMotion || slideEls.length < 2) return; stop(); timer = window.setInterval(function () { go(index + 1); }, 5000); }
  function restart() { stop(); start(); }
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);

  var startX = null;
  var startY = null;
  root.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button === 0) {
      startX = e.clientX;
      startY = e.clientY;
      root.setPointerCapture(e.pointerId);
    }
  });
  root.addEventListener("pointerup", function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    startX = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { go(index + (dx < 0 ? 1 : -1)); restart(); }
  });
  root.addEventListener("pointercancel", function (e) { startX = null; if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId); });
  start();
})();
