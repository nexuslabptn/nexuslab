/**
 * deploy.js — Hướng dẫn & Công Cụ Hỗ Trợ Đưa Website Lên Domain Riêng (Internet)
 * Chạy bằng lệnh: node deploy.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('\n================================================================');
console.log('🚀 NEXUSLAB - CÔNG CỤ & HƯỚNG DẪN TRIỂN KHAI LÊN DOMAIN RIÊNG');
console.log('================================================================\n');

console.log('Website NexusLab gồm 36+ trang HTML/JS tĩnh hoàn chỉnh.');
console.log('Bạn có thể đưa lên Internet với tên miền riêng hoàn toàn MIỄN PHÍ theo các cách sau:\n');

console.log('----------------------------------------------------------------');
console.log('🌟 CÁCH 1: NETLIFY DROP (DỄ NHẤT & NHANH NHẤT - 1 PHÚT LÀ XONG)');
console.log('----------------------------------------------------------------');
console.log('1. Mở trình duyệt và truy cập: https://app.netlify.com/drop');
console.log('2. Đăng ký/Đăng nhập (miễn phí bằng Google hoặc GitHub).');
console.log('3. Kéo thả toàn bộ thư mục dự án "d:\\NHAN\\2026-2027" vào khung upload trên web.');
console.log('4. Web sẽ online ngay lập tức trên Internet!');
console.log('5. Gắn Domain riêng:');
console.log('   - Vào "Site configuration" -> "Domain management" -> "Add a custom domain".');
console.log('   - Điền tên miền của bạn (ví dụ: yourdomain.com).');
console.log('   - Vào trang quản lý DNS của nhà cung cấp tên miền (Mắt Bão, TênTên, Cloudflare, v.v.):');
console.log('     + Bản ghi A: @ -> 75.2.60.5');
console.log('     + Bản ghi CNAME: www -> your-site-name.netlify.app');
console.log('   - Netlify sẽ tự động cấp chứng chỉ bảo mật SSL (HTTPS) miễn phí trọn đời!\n');

console.log('----------------------------------------------------------------');
console.log('🌟 CÁCH 2: VERCEL (TỐC ĐỘ CAO, CHUYÊN NGHIỆP, TỰ ĐỘNG CDN)');
console.log('----------------------------------------------------------------');
console.log('1. Mở trình duyệt và truy cập: https://vercel.com');
console.log('2. Đăng nhập -> Bấm "Add New..." -> "Project".');
console.log('3. Tải dự án lên hoặc cài đặt Vercel CLI bằng lệnh:');
console.log('     npx vercel');
console.log('4. Gắn Domain riêng:');
console.log('   - Vào Project Settings -> "Domains" -> Nhập tên miền của bạn.');
console.log('   - Cấu hình DNS:');
console.log('     + Bản ghi A: @ -> 76.76.21.21');
console.log('     + Bản ghi CNAME: www -> cname.vercel-dns.com\n');

console.log('----------------------------------------------------------------');
console.log('🌟 CÁCH 3: CLOUDFLARE PAGES (BĂNG THÔNG VÔ HẠN, CDN VIỆT NAM)');
console.log('----------------------------------------------------------------');
console.log('1. Truy cập: https://pages.cloudflare.com');
console.log('2. Chọn "Upload assets" -> Kéo thả thư mục dự án lên.');
console.log('3. Bấm "Custom Domains" và nhập tên miền riêng. Hệ thống tự động kích hoạt DNS & SSL 100%!\n');

console.log('================================================================');
console.log('Tệp cấu hình vercel.json và netlify.toml đã được tạo sẵn trong thư mục!');
console.log('================================================================\n');
