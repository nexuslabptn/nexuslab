# 🚀 NEXUSLAB - PHÒNG THÍ NGHIỆM KHOA HỌC ẢO (GITHUB PAGES & MULTI-PLATFORM)

> **Hệ sinh thái học liệu số & phòng thí nghiệm khoa học ảo chuẩn SGK GDPT 2018 (Vật Lý - Hóa Học - Sinh Học).**
> **Sẵn sàng đưa lên GitHub và kích hoạt GitHub Pages trong 1 phút!**

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **Chạy Trực Tiếp Trên Web (GitHub Pages):** Tương thích 100% khi chạy trên `https://<username>.github.io/<tên-repo>/`. Toàn bộ đường dẫn học liệu, tài nguyên và mô phỏng đều sử dụng Relative Path chuẩn.
2. **Tải Ứng Dụng Đa Nền Tảng Trực Tiếp Trên Web:**
   - 📱 **Android (.APK):** [`downloads/NexusLab.apk`](downloads/NexusLab.apk) (821 KB) - Cài đặt ngay cho mọi điện thoại và tablet Android.
   - 💻 **Windows (.ZIP):** [`downloads/NexusLab-Windows-x64.zip`](downloads/NexusLab-Windows-x64.zip) (92 MB) - Bản di động giải nén chạy ngay `NexusLab.exe`, đồ họa WebGL 60 FPS, F11 Fullscreen.
   - 🍏 **macOS (.ZIP):** [`downloads/NexusLab-macOS.zip`](downloads/NexusLab-macOS.zip) (90 MB) - Ứng dụng gốc `NexusLab.app` tối ưu cho Apple Silicon (M1/M2/M3/M4).
3. **An Toàn 100% Với Giới Hạn GitHub (100MB Limit):** Tất cả các file tải về đều đã được nén tối ưu dưới 95 MB, đảm bảo lệnh `git push` lên GitHub diễn ra mượt mà và không bao giờ bị báo lỗi vượt quá dung lượng.
4. **Hỗ Trợ 100% Học Liệu & Công Cụ:**
   - 29 bài thí nghiệm chuẩn SGK Vật Lý (8 bài), Hóa Học (9 bài), Sinh Học (12 bài).
   - 3 phòng thí nghiệm tự do: `lysand.html` (Mạch điện & Khúc xạ), `hoasand.html` (Pha chế & Phản ứng), `sinhsand.html` (Di truyền Menđen & ADN 3D).
   - Bộ công cụ Giáo viên: Bút vẽ màn hình, Laser pointer, Tra cứu công thức nhanh.

---

## 🚀 HƯỚNG DẪN 3 BƯỚC ĐẨY LÊN GITHUB & KÍCH HOẠT WEB

### Bước 1: Tạo Repository Mới Trên GitHub
1. Truy cập [github.com/new](https://github.com/new).
2. Đặt tên repository (ví dụ: `nexuslab` hoặc `nexuslab-app`).
3. Chọn chế độ **Public**, **không** tích chọn "Add a README file" (vì đã có sẵn file này).
4. Nhấn **Create repository**.

### Bước 2: Đẩy Thư Mục Này Lên GitHub
Mở Terminal tại thư mục `nexuslab-github` và chạy:

```bash
# 1. Khởi tạo Git và liên kết với repo GitHub của bạn
git init
git branch -M main
git remote add origin https://github.com/<TÊN-TÀI-KHOẢN-CỦA-BẠN>/<TÊN-REPO>.git

# 2. Thêm toàn bộ file và commit
git add .
git commit -m "feat: initial commit NexusLab Web & Multiplatform Apps"

# 3. Đẩy lên GitHub
git push -u origin main
```

### Bước 3: Bật Web Miễn Phí Trên GitHub Pages
1. Vào repository trên GitHub -> Chọn tab **Settings** (Cài đặt).
2. Ở cột menu bên trái, chọn mục **Pages**.
3. Tại phần **Build and deployment**:
   - Mục **Source**: Chọn **Deploy from a branch**.
   - Mục **Branch**: Chọn `main` và thư mục `/ (root)`.
   - Nhấn **Save**.
4. Chờ khoảng 1-2 phút, bạn sẽ nhận được đường dẫn trang web trực tuyến:
   👉 **`https://<tên-tài-khoản>.github.io/<tên-repo>/`**

---

## 💻 KIỂM TRA CHẠY THỬ TRÊN MÁY TÍNH (LOCAL)

Nếu muốn chạy thử trước khi đưa lên GitHub:
```bash
# Sử dụng server Node tích hợp
node server.js
```
Truy cập: [http://localhost:8080/index.html](http://localhost:8080/index.html)

---

## 🛠️ NGUYÊN BẢN SOURCE MÃ NGUỒN APP (`app-source/`)

Thư mục `app-source/` chứa đầy đủ mã nguồn để build lại APK và Desktop apps nếu bạn muốn nâng cấp sau này:
- `app-source/android/`: Mã nguồn dự án Android Studio & AndroidManifest.
- `app-source/electron-main.js`: Mã nguồn ứng dụng Desktop cho Windows & macOS.
- `app-source/scripts/build-android.sh`: Script biên dịch APK.
- `app-source/scripts/build-windows.js`: Script biên dịch Windows.
- `app-source/scripts/build-macos.js`: Script biên dịch macOS.

---
*Bản quyền © 2026-2027 NexusLab Virtual Science Suite.*
