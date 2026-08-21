/* Trang chi tiết sản phẩm — đọc ?id=... trên URL, tra trong window.PRODUCTS
   (js/products-data.js) rồi đổ dữ liệu vào khung HTML có sẵn trong
   san-pham-chi-tiet.html. Thêm sản phẩm mới = thêm vào products-data.js,
   không cần tạo file HTML riêng cho từng sản phẩm. */
(function () {
  var products = window.PRODUCTS || [];
  if (!products.length) return;

  var id = new URLSearchParams(window.location.search).get("id");
  var product = products.filter(function (p) { return p.id === id; })[0] || products[0];

  var ICONS = {
    anc: '<path d="M3 12h3l3-7 4 14 3-9 2 4h3"></path>',
    battery: '<path d="M4 12a8 8 0 1 1 2.5 5.8L4 20"></path><path d="M12 8v4l3 2"></path>',
    driver: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle>',
    bluetooth: '<path d="M8.5 16.5a5 5 0 0 1 7 0"></path><path d="M5.5 13.5a9 9 0 0 1 13 0"></path><path d="M2.5 10.5a13 13 0 0 1 19 0"></path><circle cx="12" cy="19.5" r="1.2" fill="currentColor" stroke="none"></circle>',
    waterproof: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"></path>',
    touch: '<path d="M9 12V5a1.5 1.5 0 0 1 3 0v6"></path><path d="M12 6a1.5 1.5 0 0 1 3 0v5"></path><path d="M15 8a1.5 1.5 0 0 1 3 0v6"></path><path d="M9 12l-1.5-1.5a1.6 1.6 0 0 0-2.4 2.1L8 16.5A6 6 0 0 0 13 20h1a6 6 0 0 0 6-6v-2"></path>',
    bolt: '<path d="M13 3 4 14h6l-1 7 9-11h-6l1-7z"></path>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"></path>',
    plug: '<path d="M9 2v4M15 2v4M6 8h12l-1 5a5 5 0 0 1-5 4h0a5 5 0 0 1-5-4L6 8z"></path><path d="M10 17v2a2 2 0 0 0 4 0v-2"></path>',
    magnet: '<path d="M6 4v7a6 6 0 0 0 12 0V4"></path><path d="M6 4h4M14 4h4M6 8h4M14 8h4"></path>',
  };

  function formatPrice(n) {
    return n.toLocaleString("vi-VN") + "₫";
  }

  document.title = product.name + " — Akenxi";

  var tagEl = document.querySelector("[data-pd-tag]");
  var nameEl = document.querySelector("[data-pd-name]");
  var uspEl = document.querySelector("[data-pd-usp]");
  var priceEl = document.querySelector("[data-pd-price]");
  var oldPriceEl = document.querySelector("[data-pd-old-price]");
  var addBtn = document.querySelector("[data-pd-add]");
  var mainImg = document.getElementById("pdMainImg");
  var thumbsEl = document.querySelector("[data-pd-thumbs]");
  var highlightsEl = document.querySelector("[data-pd-highlights]");
  var techEl = document.querySelector("[data-pd-tech]");

  if (tagEl) tagEl.textContent = product.tag;
  if (nameEl) nameEl.textContent = product.name;
  if (uspEl) uspEl.textContent = product.usp;
  if (priceEl) priceEl.textContent = formatPrice(product.price);
  if (oldPriceEl) oldPriceEl.textContent = formatPrice(product.oldPrice);

  if (addBtn) {
    addBtn.setAttribute("data-id", product.id);
    addBtn.setAttribute("data-name", product.name);
    addBtn.setAttribute("data-price", product.price);
    addBtn.setAttribute("data-img", product.images[0]);
  }

  if (mainImg) {
    mainImg.src = product.images[0];
    mainImg.alt = product.name;
  }

  if (thumbsEl) {
    thumbsEl.innerHTML = "";
    product.images.forEach(function (src, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      if (i === 0) btn.className = "is-active";
      btn.setAttribute("data-img", src);
      btn.innerHTML = '<img src="' + src + '" alt="" loading="lazy">';
      btn.addEventListener("click", function () {
        mainImg.src = src;
        thumbsEl.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
      });
      thumbsEl.appendChild(btn);
    });
  }

  if (highlightsEl) {
    highlightsEl.innerHTML = product.highlights.map(function (h) {
      var img = product.images[h.img] || product.images[0];
      return (
        '<div class="pd-highlight reveal"><div class="pd-highlight-media">' +
        '<img src="' + img + '" alt="' + h.title + '" loading="lazy" decoding="async"></div>' +
        "<h3>" + h.title + "</h3><p>" + h.desc + "</p></div>"
      );
    }).join("");
  }

  if (techEl) {
    techEl.innerHTML = product.tech.map(function (t) {
      var icon = ICONS[t.icon] || ICONS.bolt;
      return (
        '<div class="tech-card reveal"><span class="tech-ico">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + icon + "</svg></span>" +
        "<h3>" + t.title + "</h3><p>" + t.desc + "</p></div>"
      );
    }).join("");
  }
})();
