/* Hero campaign carousel — đổi campaign mới = sửa mảng HERO_CAMPAIGNS + đổi ảnh,
   không cần sửa CSS/markup. */
(function () {
  var HERO_CAMPAIGNS = [
    {
      tag: "Brand",
      headline: "Power your<br>digital life",
      sub: "Technology designed for the way you live.",
      image: "images/products/akenxi_headphone01/AKENXI_Headphone_Web_01.jpg",
      alt: "AKENXI — tai nghe chụp tai màu đen",
      ctaText: "Explore Products",
      ctaHref: "san-pham.html",
      ctaSecondaryText: "Discover AKENXI",
      ctaSecondaryHref: "ve-chung-toi.html",
    },
    {
      tag: "Audio",
      headline: "Sound.<br>Your way.",
      image: "images/products/akenxi_earphone01/AKENXI_web_01.jpg",
      alt: "AKENXI — tai nghe true wireless",
      ctaText: "Khám phá Audio",
      ctaHref: "san-pham.html",
      graphic: "waveform",
    },
    {
      tag: "Charging",
      headline: "Power<br>without limits.",
      image: "images/products/akenxi_charger100W_01/AKENXI_100W_Web_01.jpg",
      alt: "AKENXI — củ sạc nhanh 100W",
      ctaText: "Khám phá Charging",
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

  HERO_CAMPAIGNS.forEach(function (c, i) {
    var slide = document.createElement("div");
    slide.className = "hero-slide" + (i === 0 ? " is-active" : "");

    var subHtml = c.sub ? '<p class="hero-sub">' + c.sub + "</p>" : "";

    var ctaRow = "";
    if (c.ctaText || c.ctaSecondaryText) {
      var primary = c.ctaText
        ? '<a class="btn btn-primary" href="' + c.ctaHref + '">' + c.ctaText + "</a>"
        : "";
      var secondary = c.ctaSecondaryText
        ? '<a class="btn btn-outline" href="' + c.ctaSecondaryHref + '">' + c.ctaSecondaryText + "</a>"
        : "";
      ctaRow = '<div class="hero-cta-row">' + primary + secondary + "</div>";
    }

    slide.innerHTML =
      '<img src="' + c.image + '" alt="' + c.alt + '" loading="' + (i === 0 ? "eager" : "lazy") + '">' +
      '<div class="hero-copy"><div class="container">' +
        '<span class="hero-tag">' + c.tag + "</span>" +
        '<h1 class="display">' + c.headline + "</h1>" +
        subHtml +
        ctaRow +
      "</div></div>" +
      (c.graphic === "waveform" ? waveformHtml() : "");
    slidesEl.appendChild(slide);

    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", "Xem campaign " + c.tag);
    dot.addEventListener("click", function () { go(i); restart(); });
    dotsEl.appendChild(dot);
  });

  var slideEls = slidesEl.querySelectorAll(".hero-slide");
  var dotEls = dotsEl.querySelectorAll(".hero-dot");

  function go(i) {
    index = i;
    slideEls.forEach(function (el, n) { el.classList.toggle("is-active", n === i); });
    dotEls.forEach(function (el, n) { el.classList.toggle("is-active", n === i); });
  }

  function next() { go((index + 1) % HERO_CAMPAIGNS.length); }

  function stop() {
    if (timer) { window.clearInterval(timer); timer = null; }
  }

  function start() {
    if (reduceMotion || HERO_CAMPAIGNS.length < 2) return;
    stop();   // luôn dọn interval cũ trước — tránh chồng nhiều interval khi
              // mouseenter/mouseleave/focusin/focusout dồn dập lúc di chuột qua lại
              // ở rìa hero, vốn là nguyên nhân khiến campaign nhảy liên tục
    timer = window.setInterval(next, 6000);
  }

  function restart() { stop(); start(); }

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);

  start();
})();
