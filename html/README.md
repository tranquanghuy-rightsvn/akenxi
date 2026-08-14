# Akenxi — demo web bán phụ kiện điện thoại

Trang tĩnh HTML/CSS/JS thuần, giao diện trắng phẳng tối giản (không gradient, không nền caro).
Hero theo mẫu `hero-text.png`: dòng nhỏ "Giao hàng toàn quốc" màu nhấn kèm icon xe →
tiêu đề đen đậm → phụ đề → nút pill **Mua ngay**; text chạy vào từ bên trái khi tải trang.
Bên phải là mô hình 3D `Headphone.glb`:
tai nghe **màu đen, dựng đứng, mặc định nghiêng 30°** quanh trục thẳng đứng (góc 3/4, không chính diện).
Trang cuộn bình thường — cuộn tới đâu tai nghe xoay tới đó; kéo chuột trên mô hình để xoay tay.

## Chạy

Cần HTTP server (ES modules + fetch `.glb` không chạy với `file://`):

```bash
cd html
python3 -m http.server 8917
# mở http://localhost:8917
```

## Cấu trúc

Website nhiều trang (mỗi mục menu là một file HTML riêng, không phải anchor cùng trang):

```
index.html                     Trang chủ: hero 3D + danh mục + bán chạy + đánh giá + nhận tin
san-pham.html                  Sản phẩm: page hero + bộ lọc + 8 sản phẩm
ve-chung-toi.html              Về chúng tôi: câu chuyện + số liệu + ưu điểm + 6 chi nhánh
tin-tuc.html                   Tin tức: 6 bài viết
lien-he.html                   Liên hệ: form tư vấn + hotline/email/địa chỉ
thanh-toan.html                Thanh toán: thông tin nhận hàng + phương thức + xác nhận
css/style.css                  Design token, layout, responsive
js/cart.js                     Giỏ hàng: thêm/xoá/số lượng, localStorage, drawer + toast
js/checkout.js                 Thanh toán: tỉnh/phường, phương thức, xác nhận, xoá giỏ
area/provinces.json            34 tỉnh/thành (rút gọn từ xevip/html/area/provinces.json)
area/wards/<mã tỉnh>.json      Phường/xã theo tỉnh, tải khi chọn tỉnh (3.321 phường/xã)
images/products/*.webp         12 ảnh sản phẩm (tham khảo từ baseus.vn, đã resize/nén)
images/categories/*.webp       6 ảnh danh mục, crop vuông 360×360
images/qr-bank.svg, qr-momo.svg   Mã QR giả (SVG tự sinh) cho 2 cách chuyển khoản
js/main.js                     three.js: load GLB, vật liệu đen, ánh sáng, xoay theo scroll
js/ui.js                       Menu mobile, reveal khi cuộn, highlight menu theo section
js/vendor/three/               three.js r169 (local, không CDN)
fonts/inter-*.woff2            Inter (latin / latin-ext / vietnamese)
images/logo.png                Logo Akenxi đã bỏ nền trắng + crop sát viền (270×120)
images/logo-full.png           Bản full-res đã bỏ nền (991×440) để dùng lại khi cần
images/favicon.png             Favicon 64×64 cắt từ khối hình của logo
models/Headphone.glb           Mô hình tai nghe
```

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

Hero (kèm 4 badge cam kết nổi quanh mô hình 3D) → danh mục (6) → sản phẩm bán chạy (4) → vì sao chọn Akenxi (4)
→ đánh giá khách hàng (3) → đăng ký nhận tin → footer.
Tên, giá và ảnh sản phẩm tham khảo từ baseus.vn cho giống thật — đây là tài sản của Baseus,
chỉ dùng cho bản demo nội bộ, cần thay bằng ảnh/nội dung của bạn trước khi phát hành.
Các số liệu khác (đánh giá, chi nhánh, bài viết) là nội dung minh hoạ.

## Mô hình 3D

- **Đứng tự nhiên:** trục cao của model gốc là Z nên bọc trong group quay `rotation.x = -90°`,
  sau đó căn tâm + scale vừa khung.
- **Góc mặc định:** `BASE_ROT_Y = -Math.PI / 6` (nghiêng 30°) — đổi dấu/giá trị hằng này để chỉnh góc và chiều quay.
- **Màu đen:** `paintBlack()` clone vật liệu, gán màu/độ nhám theo tên bộ phận (đệm cao su nhám,
  vòng đầu bán mờ, chi tiết còn lại hơi ánh kim) và tắt `transmission` của bản gốc.
- **Ánh sáng trung tính** kiểu ảnh sản phẩm: key trên trước, fill dưới trái, rim sau — không đèn màu.
- **Xoay theo scroll:** `progress = scrollY / innerHeight` → `rotation.y`, làm mượt bằng lerp mỗi frame.
- **Sàn caro phối cảnh:** `.model-floor` — mặt phẳng CSS `rotateX(64deg)` trong `perspective: 420px`,
  kẻ ô bằng 2 lớp `repeating-linear-gradient`, mask mờ dần về phía xa để tan vào nền trắng.
- **Bóng mờ:** không dùng shadow map — `.model-shadow` gồm 2 lớp CSS (bóng tiếp xúc + bóng khuếch tán)
  với animation "thở" khớp nhịp mô hình bay lơ lửng.
- Render loop tạm dừng khi hero ra khỏi viewport, và tôn trọng `prefers-reduced-motion`.

## Tinh chỉnh nhanh

| Muốn đổi | Sửa ở |
| --- | --- |
| Góc mặc định của tai nghe | `BASE_ROT_Y` trong `js/main.js` |
| Độ xoay khi cuộn | `SPIN_PER_VIEWPORT` trong `js/main.js` |
| Độ cao mô hình (chỗ chừa cho bóng) | `BASE_Y` trong `js/main.js` |
| Kích thước mô hình | hằng `2.45` trong `const scale = 2.45 / …` |
| Độ đậm bóng mờ | `.model-shadow::before` / `::after` |
| Màu thương hiệu / màu giá | `--accent` (lấy từ logo: `#03624f`), `--price` |
| Vị trí 4 badge quanh tai nghe | `.b-tl` / `.b-tr` / `.b-bl` / `.b-br` trong `css/style.css` |
| Hiệu ứng text hero chạy vào | `@keyframes hero-in` + các `animation-delay` trong `css/style.css` |
| Nút liên hệ nhanh (Zalo/phone/Messenger) | `.quick-contact` trong `css/style.css`, markup ở cuối mỗi trang |
| Sàn caro 3D | `.model-floor` (perspective, rotateX, cỡ ô 48px) |
| Sinh lại 5 trang từ template | script `build_pages.py` trong scratchpad của session |
| Danh mục + ảnh danh mục | `CATEGORIES` trong `build_pages.py` + `images/categories/` |
| Mã QR chuyển khoản | thay `images/qr-bank.svg` / `qr-momo.svg` bằng QR thật |
| Danh sách sản phẩm (tên/giá/ảnh) | `PRODUCTS` trong `build_pages.py`, rồi chạy lại script |
| Số item hiển thị của slider | `grid-auto-columns` của `.slider-track` trong từng media query |
| Breakpoint responsive | cuối `css/style.css` (1120 / 980 / 820 / 600 / 360px) — từ 980px trở xuống tai nghe nằm dưới phần chữ; header giữ logo trái, tìm kiếm + giỏ hàng + ☰ bên phải ở mọi kích thước |
