/* Lọc lưới sản phẩm theo danh mục (san-pham.html). Đọc ?cat=... trên URL để
   tự chọn sẵn 1 danh mục khi đến từ tile "Danh mục sản phẩm" ở trang chủ. */
(function () {
  var list = document.querySelector("[data-filter-list]");
  var grid = document.querySelector("[data-prod-grid]");
  var countEl = document.querySelector("[data-filter-count]");
  if (!list || !grid) return;

  var chips = list.querySelectorAll("[data-filter]");
  var cards = grid.querySelectorAll(".prod-card");

  function apply(cat) {
    var n = 0;
    cards.forEach(function (card) {
      var match = cat === "Tất cả" || card.getAttribute("data-category") === cat;
      card.style.display = match ? "" : "none";
      if (match) n++;
    });
    chips.forEach(function (chip) {
      chip.classList.toggle("is-on", chip.getAttribute("data-filter") === cat);
    });
    if (countEl) countEl.textContent = n + " sản phẩm";
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      apply(chip.getAttribute("data-filter"));
    });
  });

  var fromUrl = new URLSearchParams(window.location.search).get("cat");
  var initial = "Tất cả";
  if (fromUrl) {
    var found = Array.prototype.filter.call(chips, function (c) {
      return c.getAttribute("data-filter") === fromUrl;
    })[0];
    if (found) initial = fromUrl;
  }
  apply(initial);
})();
