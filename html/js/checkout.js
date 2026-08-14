/* Trang thanh toán: đơn hàng, địa chỉ tỉnh/phường, phương thức thanh toán, xác nhận */
(function () {
  var KEY = "akenxi_cart_v1";

  var form = document.querySelector("[data-checkout-form]");
  if (!form) return;

  var summary = document.querySelector("[data-checkout-summary]");
  var emptyEl = document.querySelector("[data-checkout-empty]");
  var doneEl = document.querySelector("[data-checkout-done]");
  var itemsEl = document.querySelector("[data-order-items]");
  var subEl = document.querySelector("[data-order-subtotal]");
  var grandEl = document.querySelector("[data-order-grand]");
  var errEl = document.querySelector("[data-error]");
  var provinceSel = form.querySelector("[data-province]");
  var wardSel = form.querySelector("[data-ward]");

  function read() {
    try {
      var list = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  var cart = read();

  function money(n) { return n.toLocaleString("vi-VN") + "₫"; }
  function total() { return cart.reduce(function (s, it) { return s + it.price * it.qty; }, 0); }

  /* ----------------------------- Tóm tắt đơn hàng --------------------------- */

  function renderOrder() {
    if (!cart.length) {
      form.hidden = true;
      if (summary) summary.hidden = true;
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    itemsEl.innerHTML = cart
      .map(function (it) {
        return (
          '<div class="order-item">' +
            '<img src="' + it.img + '" alt="' + it.name + '" width="52" height="52" loading="lazy">' +
            '<div><p class="order-item-name">' + it.name + "</p>" +
            '<p class="order-item-qty">' + it.qty + " × " + money(it.price) + "</p></div>" +
            '<span class="order-item-sum">' + money(it.price * it.qty) + "</span>" +
          "</div>"
        );
      })
      .join("");

    subEl.textContent = money(total());
    grandEl.textContent = money(total());
  }

  /* ------------------------ Địa chỉ: tỉnh -> phường ------------------------ */

  function fillProvinces() {
    fetch("area/provinces.json")
      .then(function (r) { return r.json(); })
      .then(function (list) {
        provinceSel.innerHTML =
          '<option value="">Chọn tỉnh/thành</option>' +
          list
            .map(function (p) {
              return '<option value="' + p.code + '">' + p.name + "</option>";
            })
            .join("");
      })
      .catch(function () {
        provinceSel.innerHTML = '<option value="">Không tải được danh sách tỉnh</option>';
      });
  }

  function fillWards(code) {
    wardSel.disabled = true;
    wardSel.innerHTML = '<option value="">Đang tải…</option>';

    fetch("area/wards/" + code + ".json")
      .then(function (r) { return r.json(); })
      .then(function (list) {
        wardSel.innerHTML =
          '<option value="">Chọn phường/xã</option>' +
          list
            .map(function (w) {
              return '<option value="' + w.code + '">' + w.name + "</option>";
            })
            .join("");
        wardSel.disabled = false;
      })
      .catch(function () {
        wardSel.innerHTML = '<option value="">Không tải được danh sách phường/xã</option>';
      });
  }

  provinceSel.addEventListener("change", function () {
    if (!provinceSel.value) {
      wardSel.disabled = true;
      wardSel.innerHTML = '<option value="">Chọn tỉnh/thành trước</option>';
      return;
    }
    fillWards(provinceSel.value);
  });

  /* -------------------------- Phương thức thanh toán ----------------------- */

  var details = form.querySelectorAll("[data-pay-detail]");

  var payConfirm = form.querySelector("[data-pay-confirm]");

  function showPayDetail(value) {
    [].forEach.call(details, function (d) {
      d.hidden = d.getAttribute("data-pay-detail") !== value;
    });
    // COD thì không cần tích "Tôi đã thanh toán"
    if (payConfirm) {
      payConfirm.hidden = value === "cod";
      if (value === "cod") payConfirm.querySelector("input").checked = false;
    }
  }

  [].forEach.call(form.querySelectorAll('input[name="payment"]'), function (r) {
    r.addEventListener("change", function () { showPayDetail(r.value); });
  });

  /* --------------------------------- Xác nhận ------------------------------ */

  var PAY_LABEL = {
    cod: "Chuyển tiền khi nhận hàng (COD)",
    bank: "Chuyển khoản qua thẻ ngân hàng",
    momo: "Chuyển khoản qua Momo",
  };

  function fail(msg, field) {
    errEl.textContent = msg;
    errEl.hidden = false;
    if (field) field.focus();
    return false;
  }

  function validate() {
    errEl.hidden = true;
    var f = form.elements;

    if (!f.name.value.trim()) return fail("Vui lòng nhập họ và tên.", f.name);
    var phone = f.phone.value.replace(/[\s.]/g, "");
    if (!/^0\d{9,10}$/.test(phone)) return fail("Số điện thoại chưa đúng (10–11 số, bắt đầu bằng 0).", f.phone);
    if (!f.province.value) return fail("Vui lòng chọn tỉnh/thành phố.", f.province);
    if (!f.ward.value) return fail("Vui lòng chọn phường/xã.", f.ward);
    if (!f.address.value.trim()) return fail("Vui lòng nhập địa chỉ cụ thể.", f.address);

    var pay = form.querySelector('input[name="payment"]:checked').value;
    if (pay !== "cod" && !f.paid.checked) {
      return fail("Vui lòng tích “Tôi đã thanh toán” sau khi chuyển khoản.", f.paid);
    }
    return true;
  }

  function orderCode() {
    return "AK" + Date.now().toString(36).toUpperCase().slice(-6);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var f = form.elements;
    var pay = form.querySelector('input[name="payment"]:checked').value;
    var address = [
      f.address.value.trim(),
      wardSel.options[wardSel.selectedIndex].text,
      provinceSel.options[provinceSel.selectedIndex].text,
    ].join(", ");

    var rows = [
      ["Mã đơn hàng", orderCode()],
      ["Người nhận", f.name.value.trim() + " · " + f.phone.value.trim()],
      ["Địa chỉ", address],
      ["Thanh toán", PAY_LABEL[pay]],
      ["Tổng cộng", money(total())],
    ];
    if (f.note.value.trim()) rows.push(["Ghi chú", f.note.value.trim()]);

    document.querySelector("[data-done-info]").innerHTML = rows
      .map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; })
      .join("");

    // xoá giỏ hàng
    try { localStorage.setItem(KEY, "[]"); } catch (err) {}
    cart = [];
    [].forEach.call(document.querySelectorAll("[data-cart-count]"), function (el) {
      el.textContent = "0";
      if (el.classList.contains("badge")) el.hidden = true;
    });
    var drawerItems = document.querySelector("[data-cart-items]");
    if (drawerItems) {
      drawerItems.innerHTML = '<p class="cart-empty">Giỏ hàng đang trống.</p>';
      var t = document.querySelector("[data-cart-total]");
      if (t) t.textContent = "0₫";
    }

    form.hidden = true;
    if (summary) summary.hidden = true;
    doneEl.hidden = false;
    window.scrollTo({ top: 0, behavior: document.hidden ? "instant" : "smooth" });
  });

  renderOrder();
  if (cart.length) fillProvinces();
})();
