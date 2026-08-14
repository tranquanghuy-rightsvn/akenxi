/* Giỏ hàng: thêm/xoá/đổi số lượng, lưu localStorage, dùng chung cho mọi trang */
(function () {
  var KEY = "akenxi_cart_v1";

  var drawer = document.querySelector("[data-cart-drawer]");
  var overlay = document.querySelector("[data-cart-overlay]");
  var itemsEl = document.querySelector("[data-cart-items]");
  var totalEl = document.querySelector("[data-cart-total]");
  var toastEl = document.querySelector("[data-toast]");
  var countEls = document.querySelectorAll("[data-cart-count]");

  /* ------------------------------- Dữ liệu -------------------------------- */

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  var cart = read();

  function money(n) {
    return n.toLocaleString("vi-VN") + "₫";
  }

  function count() {
    return cart.reduce(function (s, it) { return s + it.qty; }, 0);
  }

  function total() {
    return cart.reduce(function (s, it) { return s + it.price * it.qty; }, 0);
  }

  /* ------------------------------- Hiển thị ------------------------------- */

  function renderBadge() {
    var n = count();
    [].forEach.call(countEls, function (el) {
      el.textContent = n;
      el.hidden = n === 0 && el.classList.contains("badge");
    });
  }

  function renderItems() {
    if (!itemsEl) return;

    if (!cart.length) {
      itemsEl.innerHTML =
        '<p class="cart-empty">Giỏ hàng đang trống.<br>Chọn phụ kiện bạn cần rồi bấm “Thêm vào giỏ”.</p>';
    } else {
      itemsEl.innerHTML = cart
        .map(function (it, i) {
          return (
            '<div class="cart-item">' +
              '<img src="' + it.img + '" alt="' + it.name + '" width="64" height="64" loading="lazy">' +
              '<div class="cart-item-main">' +
                '<p class="cart-item-name">' + it.name + "</p>" +
                '<p class="cart-item-price">' + money(it.price) + "</p>" +
                '<div class="qty">' +
                  '<button type="button" data-qty="-1" data-i="' + i + '" aria-label="Giảm số lượng">−</button>' +
                  "<span>" + it.qty + "</span>" +
                  '<button type="button" data-qty="1" data-i="' + i + '" aria-label="Tăng số lượng">+</button>' +
                "</div>" +
              "</div>" +
              '<button class="cart-item-del" type="button" data-del="' + i + '" aria-label="Xoá khỏi giỏ">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
                  '<path d="M6 6l12 12M18 6L6 18"></path>' +
                "</svg>" +
              "</button>" +
            "</div>"
          );
        })
        .join("");
    }

    if (totalEl) totalEl.textContent = money(total());
  }

  function render() {
    renderBadge();
    renderItems();
  }

  /* -------------------------------- Drawer -------------------------------- */

  function openCart() {
    if (!drawer) return;
    drawer.hidden = false;
    overlay.hidden = false;
    void drawer.offsetWidth; // buộc reflow để transition chạy từ trạng thái ẩn
    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(function () {
      if (!drawer.classList.contains("is-open")) {
        drawer.hidden = true;
        overlay.hidden = true;
      }
    }, 280);
  }

  /* --------------------------------- Toast -------------------------------- */

  var toastTimer;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    void toastEl.offsetWidth;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
      setTimeout(function () { toastEl.hidden = true; }, 250);
    }, 2200);
  }

  /* ------------------------------- Hành động ------------------------------ */

  function add(data) {
    var found = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === data.id) { found = cart[i]; break; }
    }
    if (found) found.qty += 1;
    else cart.push({ id: data.id, name: data.name, price: data.price, img: data.img, qty: 1 });

    write(cart);
    render();
    toast("Đã thêm “" + data.name + "” vào giỏ");
  }

  document.addEventListener("click", function (e) {
    var addBtn = e.target.closest("[data-add-to-cart]");
    if (addBtn) {
      add({
        id: addBtn.dataset.id,
        name: addBtn.dataset.name,
        price: parseInt(addBtn.dataset.price, 10) || 0,
        img: addBtn.dataset.img,
      });
      return;
    }

    if (e.target.closest("[data-cart-open]")) { openCart(); return; }
    if (e.target.closest("[data-cart-close]") || e.target.closest("[data-cart-overlay]")) { closeCart(); return; }

    var qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      var i = +qtyBtn.dataset.i;
      var d = +qtyBtn.dataset.qty;
      if (cart[i]) {
        cart[i].qty += d;
        if (cart[i].qty < 1) cart.splice(i, 1);
        write(cart);
        render();
      }
      return;
    }

    var delBtn = e.target.closest("[data-del]");
    if (delBtn) {
      cart.splice(+delBtn.dataset.del, 1);
      write(cart);
      render();
      return;
    }

    if (e.target.closest("[data-cart-checkout]")) {
      if (!cart.length) { toast("Giỏ hàng đang trống"); return; }
      window.location.href = "thanh-toan.html";
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeCart();
  });

  // đồng bộ khi mở nhiều tab
  window.addEventListener("storage", function (e) {
    if (e.key === KEY) { cart = read(); render(); }
  });

  render();
})();
