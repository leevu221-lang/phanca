# 🗓️ HỆ THỐNG PHÂN CA HÀNH CHÍNH (KHO & THU NGÂN)
> **Bảng tính Google Sheets:** [1841 - CA HÀNH CHÍNH](https://docs.google.com/spreadsheets/d/1WLIgBZ6PrfODGCrlvGMSSl-C-6xGkA7vRfrln15EJds/edit?usp=sharing)  
> **Sheet đích lưu trữ:** `phanca`  
> **Giao diện:** Web App chuẩn phong cách **Tone Pastel Xanh Dương**  
> **Link GitHub Pages:** [https://leevu221-lang.github.io/phanca/](https://leevu221-lang.github.io/phanca/)

---

## ✨ 1. Tính Năng Nổi Bật

1. **Giao Diện Pastel Xanh Dương (Pastel Blue UI):**
   - Thiết kế hiện đại, kính mờ Glassmorphism, chuẩn thẩm mỹ, dịu mắt, thao tác mượt mà trên cả máy tính và điện thoại.
   - Nhãn ca màu pastel trực quan:
     - 💳 **TN (Thu Ngân):** Xanh dương pastel thanh lịch (`#e0f2fe`)
     - 📦 **KHO (Phụ Kho):** Xanh bạc hà pastel tươi mát (`#d1fae5`)
     - 🏢 **HC (Hành Chính):** Tím hoa cà pastel (`#e0e7ff`)
     - 🏖️ **x (Nghỉ Off):** Hồng san hô pastel dịu nhẹ (`#ffe4e6`)

2. **Phân Ca "Ai" Đa Năng & Thông Minh:**
   - **Form Phân Ca "Ai":** Chọn nhân viên (Ai) ➔ Chọn ca (TN, KHO, HC, x, hoặc Xoá) ➔ Chọn các thứ trong tuần (T2 đến CN) ➔ Bấm **Áp Dụng Ca** (có tùy chọn giữ nguyên ngày nghỉ `x`).
   - **Bút Chọn Ca Nhanh (Stamp Brush):** Click chọn bút (ví dụ: Bút TN, Bút KHO, Bút x) rồi nhấp trực tiếp vào bất kỳ ô nào trên bảng để gán ca tức thì.
   - **⚡ Xoay Tua Tự Động 4 Tuần:** Chọn người trực TN & KHO Tuần 1, hệ thống tự động xoay đều 4 tuần cho cả 2 nhóm, không ai bị trùng ca, giữ nguyên 100% ngày nghỉ `x`.

3. **Lưu Tức Thì Vào Google Sheet Sheet `phanca`:**
   - Bấm nút **💾 Lưu Vào Google Sheet** ➔ Dữ liệu ca làm việc lập tức được ghi vào sheet `phanca` trên Google Sheet.
   - Các ô được tự động tô màu pastel và căn giữa chuyên nghiệp ngay trên Google Sheet.

4. **Xuất Ảnh Bảng Phân Ca Chất Lượng Cao (PNG):**
   - **📸 Xuất Ảnh Tuần Này:** Tạo ảnh thẻ tuần hiện tại sắc nét, có tiêu đề ngày tháng, phân nhóm rõ ràng, tải về 1-click để gửi Zalo / nhóm làm việc.
   - **🖼️ Xuất Ảnh Cả Tháng:** Tạo ảnh toàn cảnh cả tháng (Tuần 1, 2, 3, 4) khổ lớn chuẩn in ấn hoặc trình chiếu.

5. **Đồng Bộ Hai Chiều Tức Thì (Instant Sync):**
   - Nút **🔄 Đồng Bộ Ngay** tải dữ liệu mới nhất từ Google Sheet về Web.
   - Khi bấm **Lưu**, dữ liệu đẩy ngược lên Google Sheet ngay lập tức.
   - Tự động lưu cache offline trên máy, không sợ mất dữ liệu khi mất kết nối mạng.

---

## 🚀 2. Hướng Dẫn Cài Đặt Google Apps Script (2 Phút)

### Bước 1: Mở Trình Soạn Thảo Apps Script
1. Mở file Google Sheets: [1841 - CA HÀNH CHÍNH](https://docs.google.com/spreadsheets/d/1WLIgBZ6PrfODGCrlvGMSSl-C-6xGkA7vRfrln15EJds/edit?usp=sharing)
2. Trên thanh menu trên cùng, chọn: **Tiện ích mở rộng (Extensions)** > **Apps Script**.

### Bước 2: Dán Mã Nguồn `Code.gs`
1. Mở file `Code.gs` trong thư mục dự án này, sao chép toàn bộ nội dung.
2. Dán đè vào file `Code.gs` trên trình duyệt Apps Script.
3. Bấm biểu tượng 💾 **Lưu dự án (Save project)**.

### Bước 3: Triển Khai Dưới Dạng Web App (Cực Kỳ Quan Trọng)
1. Ở góc trên bên phải màn hình Apps Script, bấm nút **Triển khai (Deploy)** > chọn **Triển khai mới (New deployment)**.
2. Bấm vào biểu tượng bánh răng ⚙️ (chọn loại triển khai) > chọn **Ứng dụng web (Web app)**.
3. Thiết lập chính xác như sau:
   - **Mô tả:** `API Phân Ca Hanh Chinh`
   - **Thực thi dưới dạng (Execute as):** `Tôi (Me - leevu221@gmail.com)`
   - **Ai có quyền truy cập (Who has access):** `Bất kỳ ai (Anyone)` *(Để trang web trên GitHub có thể gửi và nhận dữ liệu)*
4. Bấm **Triển khai (Deploy)**.
5. Cấp quyền truy cập nếu Google yêu cầu:
   - Chọn tài khoản Google của bạn.
   - Bấm **Nâng cao (Advanced)** > Bấm **Đi tới... (không an toàn)** > Bấm **Cho phép (Allow)**.
6. **Sao chép URL Ứng dụng web** (có dạng `https://script.google.com/macros/s/.../exec`).

### Bước 4: Kết Nối Trên Giao Diện Web GitHub
1. Mở trang web: [https://leevu221-lang.github.io/phanca/](https://leevu221-lang.github.io/phanca/)
2. Bấm vào nút ⚙️ **Cài đặt API** ở góc trên bên phải.
3. Dán URL Web App vừa sao chép ở Bước 3 vào ô và bấm **Lưu Cấu Hình**.
4. Xong! Hệ thống sẽ lập tức kết nối và đồng bộ hai chiều trực tiếp với sheet `phanca`.

---

## 👥 3. Danh Sách Nhân Viên & Nhóm

- **🔵 Nhóm 1 (6 người):** `NHẠN`, `MẠNH`, `MI`, `MỸ`, `GIANG Ý`, `NGỌC ANH`
- **🟢 Nhóm 2 (5 người):** `THẮM`, `MY`, `PHÚC`, `ĐẠI`, `LÂM Ý`

### Lịch Nghỉ Cố Định (Dấu 'x'):
- `NHẠN`: T3 & CN
- `MẠNH`: T2 & CN
- `MI`: T4 & CN
- `MỸ`: T4 & CN
- `GIANG Ý`: T5 & CN
- `NGỌC ANH`: T6 & CN
- `THẮM`: T2 & CN
- `MY`: T7 & CN
- `PHÚC`: T3 & CN
- `ĐẠI`: T7 & CN
- `LÂM Ý`: T6 & CN

---

## 🛠️ 4. Cấu Trúc Dự Án

```
phanca/
├── index.html       # Giao diện chính của Web App
├── style.css        # Hệ thống giao diện Pastel Xanh Dương & Glassmorphism
├── app.js           # Xử lý logic phân ca, xuất ảnh tuần/tháng, đồng bộ Google Sheet
├── Code.gs          # Mã nguồn Apps Script Web App API chạy trên Google Sheets
└── README.md        # Hướng dẫn chi tiết
```
