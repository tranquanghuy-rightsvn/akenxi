/* Hero campaign carousel — slide "Brand" (mô hình 3D) đã nằm sẵn trong index.html
   (xem js/main.js). File này chỉ dựng các slide ảnh còn lại + điều khiển chung
   (autoplay, nút prev/next, kéo/vuốt). Đổi campaign ảnh = sửa mảng
   PHOTO_CAMPAIGNS, không cần sửa CSS/markup. */
(function () {
  var PHOTO_CAMPAIGNS = [
    {
      tag: "Âm thanh",
      headline: "Sound.<br>Your way.",
      image: "images/products/akenxi_earphone01/AKENXI_web_01.jpg",
      imageDesktop: "images/products/akenxi_earphone01/AKENXI_web_01_cutout.png",
      alt: "AKENXI — tai nghe true wireless",
      ctaText: "Khám phá Âm thanh",
      ctaHref: "san-pham.html",
    },
    {
      tag: "Sạc nhanh",
      headline: "Power<br>without limits.",
      image: "images/products/akenxi_charger100W_01/AKENXI_100W_Web_02.jpg",
      imageDesktop: "images/products/akenxi_charger100W_01/AKENXI_100W_Web_02_cutout.png",
      alt: "AKENXI — củ sạc nhanh 100W",
      ctaText: "Khám phá Sạc nhanh",
      ctaHref: "san-pham.html",
    },
    {
      tag: "New Product",
      headline: "Coming<br>soon.",
      image: "images/products/akenxi_charger02/AKENXI_product_1.jpeg",
      imageDesktop: "images/products/akenxi_charger02/AKENXI_product_1.png",
      alt: "AKENXI — pin sạc dự phòng MagSafe sắp ra mắt",
      ctaText: "",
      ctaHref: "",
    },
  ];

  var root = document.getElementById("heroSlider");
  if (!root) return;

  var slidesEl = root.querySelector("[data-hero-slides]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var index = 0;
  var timer = null;

  // Dựng các slide ảnh (Audio/Charging/New Product) — slide "Brand" (3D) đã có sẵn trong HTML.
  // Dùng chung cấu trúc với slide Brand: .hero-slide-media là lớp nền tràn viền
  // (bleed hết chiều cao hero, nửa phải màn hình ở desktop — xem css/style.css),
  // .hero-copy nổi lên trên với chữ nằm bên trái. Class is-photo-slide cho phép
  // css/style.css đổi nền hero (desktop) sang trùng màu nền graphite của slide
  // Brand. Mobile giữ nguyên ảnh gốc (.jpg, full-bleed cover). Desktop dùng bản
  // đã tách nền (imageDesktop, .png trong suốt) để không lộ hình chữ nhật trắng
  // của ảnh gốc trên nền hero.
  PHOTO_CAMPAIGNS.forEach(function (c) {
    var slide = document.createElement("div");
    slide.className = "hero-slide is-photo-slide";

    var ctaRow = c.ctaText
      ? '<div class="hero-cta-row"><a class="btn btn-primary" href="' + c.ctaHref + '">' + c.ctaText + "</a></div>"
      : "";

    slide.innerHTML =
      '<div class="hero-slide-media is-photo">' +
        '<picture>' +
          '<source media="(min-width: 981px)" srcset="' + c.imageDesktop + '">' +
          '<img src="' + c.image + '" alt="' + c.alt + '" loading="lazy">' +
        '</picture>' +
      "</div>" +
      '<div class="hero-copy"><div class="container hero-slide-text">' +
        '<span class="hero-tag">' + c.tag + "</span>" +
        '<h1 class="display">' + c.headline + "</h1>" +
        ctaRow +
      "</div></div>";
    slidesEl.appendChild(slide);
  });

  // Toàn bộ slide theo đúng thứ tự DOM: Brand (3D, tĩnh) rồi tới các slide ảnh
  var slideEls = root.querySelectorAll(".hero-slide");
  var prevBtn = root.querySelector("[data-hero-prev]");
  var nextBtn = root.querySelector("[data-hero-next]");
  var total = slideEls.length;

  function go(i) {
    index = (i + total) % total;
    slideEls.forEach(function (el, n) { el.classList.toggle("is-active", n === index); });
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

  /* Kéo/vuốt để đổi campaign — dùng Pointer Events nên cùng 1 đoạn code chạy cho
     cả chuột (desktop) lẫn cảm ứng (mobile), không cần tách riêng touch/mouse.
     Mô hình 3D không còn tự bắt kéo-xoay nữa (xem js/main.js) nên không tranh
     chấp: pointerdown trên canvas vẫn nổi bọt lên tới root bình thường. */
  var dragStartX = null;
  var dragStartY = null;
  var dragging = false;

  root.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  });

  root.addEventListener("pointerup", function (e) {
    if (!dragging) return;
    dragging = false;
    var dx = e.clientX - dragStartX;
    var dy = e.clientY - dragStartY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next(); else prev();
      restart();
    }
  });

  root.addEventListener("pointercancel", function () { dragging = false; });

  start();
})();
