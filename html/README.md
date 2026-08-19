# Akenxi — demo web thương hiệu công nghệ AKENXI

Trang tĩnh HTML/CSS/JS thuần, giao diện premium-tech kiểu Hoco/Acefast/Ugreen: ảnh/mô
hình sản phẩm lớn, nền graphite tối cho hero, nhiều khoảng trắng, chuyển động tiết chế.
Hero trang chủ là **carousel 4 campaign**: slide đầu ("Brand") dùng mô hình tai nghe 3D
tương tác (three.js, `js/main.js`), 3 slide sau (Audio/Charging/New Product) dùng ảnh
sản phẩm — tự chuyển mỗi 5 giây, dừng khi hover/focus, vuốt được trên mobile, đổi
campaign ảnh chỉ cần sửa data trong `js/hero.js` — xem mục "Hero campaign" bên dưới.

## Chạy

```bash
cd html
python3 -m http.server 8917
# mở http://localhost:8917
```

## Cấu trúc

Website nhiều trang (mỗi mục menu là một file HTML riêng, không phải anchor cùng trang):

```
index.html                     Trang chủ: hero campaign + danh mục + showcase + bán chạy +
                                technology + brand story + mosaic + đánh giá + nhận tin
san-pham.html                  Sản phẩm: page hero + bộ lọc + 12 sản phẩm
san-pham-chi-tiet.html         Trang chi tiết mẫu: ảnh lớn + USP + CTA + Highlights + Technologys
ve-chung-toi.html              Về chúng tôi: câu chuyện + số liệu + ưu điểm + 6 chi nhánh
tin-tuc.html                   Tin tức: 6 bài viết
lien-he.html                   Liên hệ: form tư vấn + hotline/email/địa chỉ
thanh-toan.html                Thanh toán: thông tin nhận hàng + phương thức + xác nhận
css/style.css                  Design token, layout, responsive
js/hero.js                     Hero carousel: mảng PHOTO_CAMPAIGNS (Audio/Charging/New
                                Product) + điều khiển chung (autoplay, dot, vuốt). Slide
                                "Brand" (3D) nằm tĩnh trong index.html, không sinh bởi JS
js/main.js, js/vendor/three/,
models/Headphone.glb           Mô hình tai nghe 3D cho slide "Brand" của hero — xem mục
                                "Mô hình 3D" bên dưới
js/cart.js                     Giỏ hàng: thêm/xoá/số lượng, localStorage, drawer + toast
js/checkout.js                 Thanh toán: tỉnh/phường, phương thức, xác nhận, xoá giỏ
area/provinces.json            34 tỉnh/thành (rút gọn từ xevip/html/area/provinces.json)
area/wards/<mã tỉnh>.json      Phường/xã theo tỉnh, tải khi chọn tỉnh (3.321 phường/xã)
images/products/*.webp         Ảnh sản phẩm demo cũ (tham khảo từ baseus.vn), không còn dùng
                                cho category — mọi tile category giờ dùng ảnh AKENXI thật
images/products/akenxi_*/      Ảnh chụp sản phẩm AKENXI thật, 1 thư mục / sản phẩm
images/office/*.jpg            Ảnh showroom/văn phòng AKENXI — dùng cho brand story + mosaic
images/speaker_product/*.jpg   Ảnh loa karaoke AKENXI — dùng cho category Accessories
images/akenxi-icon-green.svg,
images/akenxi-icon-white.svg,
images/akenxi-icon-black.svg   Icon AKENXI (mark tròn), 3 biến thể màu — dùng làm favicon +
                                mọi chỗ cần logo dạng vuông/nhỏ trên nền khác nhau
images/akenxi-signature-green.svg,
images/akenxi-signature-white.svg,
images/akenxi-signature-black.svg   Logo AKENXI chính thức (icon + wordmark), 3 biến thể màu —
                                dùng trong header/footer, chọn theo nền sáng/tối
images/qr-bank.svg, qr-momo.svg   Mã QR giả (SVG tự sinh) cho 2 cách chuyển khoản
js/ui.js                       Menu mobile, reveal khi cuộn, highlight menu theo section
fonts/inter-*.woff2            Inter (latin / latin-ext / vietnamese)
images/akenxi-full-transparent.svg   Logo AKENXI dùng trong header/footer mọi trang
images/logo2-full.png, logo2.png   Bản logo dự phòng (favicon dùng logo2.png)
```

## Hero campaign

Trang chủ dùng carousel cross-fade 4 campaign, tự chuyển slide mỗi ~5 giây (dừng khi
hover/focus, tắt hẳn autoplay nếu `prefers-reduced-motion`), có chấm điều hướng bên dưới
và vuốt trái/phải để đổi slide trên mobile (bỏ qua khi vuốt bắt đầu trong canvas 3D, vì
đó là cử chỉ kéo-để-xoay mô hình).

- **Slide 1 "Brand"** nằm tĩnh trong `index.html` (`[data-slide-brand]`) — nền gradient
  graphite kiểu studio + mô hình tai nghe 3D tương tác (three.js, xem mục "Mô hình 3D").
  Không sinh bởi JS vì `js/main.js` cần tìm thấy `#headphoneCanvas` ngay khi trang tải.
- **3 slide sau** (Audio/Charging/New Product) sinh bởi [`js/hero.js`](js/hero.js) từ mảng
  `PHOTO_CAMPAIGNS` — mỗi phần tử gồm `tag`, `headline` (hỗ trợ `<br>`), `image`, `alt`,
  tuỳ chọn `ctaText`/`ctaHref`/`graphic:"waveform"`. Đổi campaign ảnh chỉ cần sửa mảng này.

## Mô hình 3D (slide "Brand")

- **Đứng tự nhiên:** trục cao của model gốc là Z nên bọc trong group quay `rotation.x = -90°`,
  sau đó căn tâm + scale vừa khung.
- **Góc mặc định:** `BASE_ROT_Y = -Math.PI / 6` (nghiêng 30°) — đổi dấu/giá trị hằng này để chỉnh góc và chiều quay.
- **Màu đen:** `paintBlack()` clone vật liệu, gán màu/độ nhám theo tên bộ phận, tắt `transmission` của bản gốc.
- **Ánh sáng studio trung tính:** key trên trước, fill dưới trái, rim sau — không đèn màu.
- **Xoay theo scroll:** `progress = scrollY / innerHeight` → `rotation.y`, làm mượt bằng lerp mỗi frame;
  kéo chuột/chạm trên canvas xoay thêm (`pointerdown/move/up`, có `setPointerCapture`).
- **Nền:** gradient graphite kiểu studio (`.hero-slide-3d`) thay cho sàn caro/bóng đổ CSS của
  bản cũ — không còn floor/shadow riêng, phù hợp nền tối thay vì nền trắng.
- Render loop tạm dừng khi hero ra khỏi viewport (`IntersectionObserver`), và tôn trọng
  `prefers-reduced-motion`.

## Giỏ hàng

- Bấm **Thêm vào giỏ** ở bất kỳ thẻ sản phẩm → badge trên icon giỏ tăng, hiện toast xác nhận.
- Bấm icon giỏ ở header → drawer trượt từ phải: ảnh, tên, giá, tăng/giảm số lượng, xoá, tổng tiền.
- Giỏ lưu trong `localStorage` (`akenxi_cart_v1`) nên giữ nguyên khi đổi trang / tải lại,
  và tự đồng bộ nếu mở nhiều tab. Nút Thanh toán chỉ hiện toast (demo, chưa có backend).
- Dữ liệu sản phẩm nằm ngay trên nút: `data-id / data-name / data-price / data-img`.

## Thanh toán

- Nút **Thanh toán** trong drawer giỏ hàng → `thanh-toan.html` (giỏ trống thì chỉ hiện toast).
- Form nhận hàng: họ tên, số điện thoại, **Tỉnh/Thành phố → Phường/Xã** (select phụ thuộc),
  địa chỉ cụ thể, ghi chú. Có kiểm tra bắt buộc và định dạng số điện thoại.
- 3 phương thức: **COD**, **chuyển khoản ngân hàng**, **Momo**. Hai cách chuyển khoản hiện
  **mã QR (giả)** + số tài khoản/ví và checkbox **“Tôi đã thanh toán”** (bắt buộc tích);
  COD không có checkbox này.
- Nút **Xác nhận** → hiện mã đơn + thông tin nhận hàng, đồng thời **xoá sạch giỏ hàng**
  (localStorage, badge, drawer).
- Dữ liệu địa chỉ: dùng `provinces.json` của `xevip/html/area/` (bộ 34 tỉnh mới, đã kèm danh sách
  phường/xã) tách thành 1 file tỉnh + 34 file phường để tải theo nhu cầu.
  Không dùng `districts.json` vì đó là bộ quận/huyện theo hệ 63 tỉnh cũ, ghép vào 34 tỉnh mới sẽ
  sai dữ liệu (ví dụ Bắc Ninh mới gồm cả Bắc Giang cũ nhưng file cũ chỉ có quận/huyện Bắc Ninh).

## Slider sản phẩm bán chạy

12 sản phẩm trong một track `overflow-x` + `scroll-snap`, hiển thị **4 → 2 → 1** item
theo breakpoint (980px, 600px). Slider **trượt bằng `transform`** (bỏ `scroll-behavior`/`scroll-snap` vì animate `scrollLeft`
bị snap kéo lại gây giật): `.slider-view` cắt khung, `.slider-track` là flex row với
`transition: transform .45s`, mỗi lần bấm mũi tên trượt **đúng 1 sản phẩm**, nút tự disable ở hai đầu.
Kéo chuột / vuốt ngón tay cũng trượt được (pointer events, nhả tay snap về thẻ gần nhất);
`touch-action: pan-y` giữ cuộn dọc bình thường nên không còn hiện tượng khoá con lăn của trang.

## Các section

Hero campaign (4 slide, slide 1 là mô hình 3D) → danh mục lớn (6: Audio/Charging/Power/Cables/Mobile/Accessories) →
showcase Audio → sản phẩm bán chạy (12) → showcase Charging → AKENXI Technology (4) →
brand story → mosaic gallery (4 ảnh showroom) → đánh giá khách hàng (3) → đăng ký nhận tin → footer.
Ảnh sản phẩm AKENXI thật nằm ở `images/products/akenxi_*/` (kể cả category Power dùng
`akenxi_charger02` và Mobile dùng `akenxi_mobile`); một số nội dung khác (đánh giá,
chi nhánh, bài viết) vẫn là nội dung minh hoạ do chưa có số liệu thật.

## Tinh chỉnh nhanh

| Muốn đổi | Sửa ở |
| --- | --- |
| Campaign hero ảnh (nội dung/ảnh) | mảng `PHOTO_CAMPAIGNS` trong `js/hero.js` |
| Nội dung slide "Brand" (3D) | trực tiếp trong `index.html`, khối `[data-slide-brand]` |
| Thời gian tự chuyển slide hero | `5000` (ms) trong `start()`, `js/hero.js` |
| Góc/kích thước mô hình 3D | `BASE_ROT_Y` / hằng `2.45` trong `js/main.js` |
| Chiều cao header / logo | `--header-h`, `.logo-img` trong `css/style.css` (có override mobile) |
| Màu thương hiệu / chữ / giá | `--accent` (`#007F66`), `--text`, `--price` trong `css/style.css` |
| Cỡ chữ tiêu đề lớn (hero/showcase/story) | class `.display` trong `css/style.css` |
| Nút liên hệ nhanh (Zalo/phone/Messenger) | `.quick-contact` trong `css/style.css`, markup ở cuối mỗi trang |
| Danh mục lớn (ảnh/tên) | `.cat-grid-big` trong `index.html` |
| Product showcase (spotlight) | `.showcase-row` trong `index.html` |
| AKENXI Technology (4 pillar) | `.tech-grid` trong `index.html` (dùng lại ở `san-pham-chi-tiet.html`) |
| Mosaic gallery | `.mosaic-grid` trong `index.html` + ảnh trong `images/office/` |
| Trang chi tiết sản phẩm mẫu | `san-pham-chi-tiet.html` + `.pd-*` trong `css/style.css` |
| Danh sách sản phẩm (tên/giá/ảnh) | các `<article class="prod-card">` trong `index.html` / `san-pham.html` |
| Số item hiển thị của slider | `grid-auto-columns` của `.slider-track` trong từng media query |
| Breakpoint responsive | cuối `css/style.css` (1120 / 980 / 820 / 600 / 360px) |
