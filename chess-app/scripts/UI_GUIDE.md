# Soát và nâng cấp UI/UX (app học cờ, điện thoại là chính)

Người dùng gửi bài https://www.kimi.ai/resources/ui-ux-design-skills-for-agents và muốn "update lại UI/UX". Bài đó chỉ là
danh sách skill; các quy tắc cụ thể dưới đây lấy từ hai skill nó giới thiệu (ui-craft của educlopez, apple-design-skill theo
Apple HIG). Áp dụng chúng cho app này. Giữ phong cách hiện tại (Noto Sans, bảng màu gọn kiểu Cloudscape, sáng/tối), không làm lại từ đầu.

## Quy tắc (con số, không phải tính từ)

Chữ
- Thang cỡ chữ: chọn 4-6 cỡ và chỉ dùng chúng (gợi ý 12, 14, 16, 20, 28px). Gom các cỡ lẻ (13, 15, 0.92rem, 0.85rem...) về thang.
- Cỡ tối thiểu trên điện thoại: chữ đọc 16px (bài học có thể 17px), nhãn phụ không dưới 12px. Ô nhập liệu ≥16px (tránh iOS zoom).
- Line-height: chữ thường 1.5-1.65; tiêu đề ≥24px 1.15-1.2; nhãn/UI dày 1.3-1.4. Tiêu đề lớn letter-spacing -0.01 đến -0.02em.
- Độ dài dòng văn bản đọc: max-width ~65ch (trên máy tính bảng/desktop).
- Hai độ đậm là đủ (400 và 600). Đậm 600-700 dành cho nhãn/nút 13-16px.
- Sentence case. KHÔNG viết hoa toàn bộ cho nhãn dài (hiện có "MỤC TIÊU: THỦ HÒA", "TỰ TAY ĐÁNH VỚI MÁY"...): đổi thành chữ thường
  có nhấn, hoặc chỉ giữ viết hoa cho nhãn ngắn 11-13px với letter-spacing +0.05em.
- Số liệu (đồng hồ, điểm, đếm) dùng font-variant-numeric: tabular-nums. Dùng "…" thay "...".
- text-wrap: balance cho tiêu đề, pretty cho đoạn văn.

Khoảng cách và bố cục
- Thang khoảng cách: 4, 8, 12, 16, 24, 32, 48. Không dùng giá trị lẻ ngoài thang.
- Trong nhóm < giữa các nhóm < giữa các phần (ví dụ nhãn 4px, ô 16px, phần 32-48px).
- Tối đa 4 cấp phân cấp; hai cấp liền nhau chênh ≥1.5 lần về cỡ hoặc độ đậm.
- Không card trong card. Bo góc khác nhau theo loại: ô nhập/chip ~6px, card ~10-12px, sheet/modal ~14-16px.
- Bóng nhiều lớp nhẹ ở nền sáng; nền tối thay bằng viền 1px trắng độ trong thấp.
- z-index theo thang ngữ nghĩa (dropdown 10, sticky 20, backdrop 30, modal 40, toast 50, tooltip 60), không 999.

Chạm và thao tác (điện thoại)
- Mọi vùng bấm ≥44×44px (chip nước đi, nút ◀ ▶, dấu tiến độ, liên kết "làm ›"...). Phần tử nhỏ thì mở rộng vùng bấm bằng pseudo-element.
- Hành động chính ở vùng ngón cái (dưới), hành động phá hủy (xóa dữ liệu, xin thua) tách xa và có xác nhận.
- Phần tử cố định ở dưới phải có padding-bottom: env(safe-area-inset-bottom). Dùng 100dvh thay 100vh.
- Vuốt chỉ cho thao tác hoàn tác được, luôn có nút tương đương.

Màu và độ tương phản
- 90% trung tính, một màu nhấn. Chữ thường ≥4.5:1, chữ ≥18px hoặc đậm ≥3:1. Trạng thái hover/active/focus tương phản cao hơn trạng thái nghỉ.
- Màu không bao giờ là tín hiệu duy nhất (đúng/sai cần thêm chữ hoặc biểu tượng).
- Biểu tượng: SVG một bộ thống nhất, không dùng emoji làm icon tính năng (hiện có 📖 🎬 ♟ trong card trang Học...).

Chuyển động
- Phản hồi ≤100ms; hover/màu 120ms; dropdown/tab 200ms; sheet/modal 250-300ms; thoát nhanh hơn vào (~75%).
- Easing mặc định cubic-bezier(0.22, 1, 0.36, 1); không ease-in, không bounce. Chỉ animate transform và opacity. Không "transition: all".
- Tôn trọng prefers-reduced-motion (tắt trượt/scale, giữ fade ngắn; spinner vẫn quay).
- Thao tác lặp hàng trăm lần (đi quân, bấm chip) không cần animation.

Trạng thái và phản hồi
- Mọi chờ đợi có dấu hiệu ngay (skeleton/spinner/thanh tiến độ); mọi danh sách trống có câu giải thích và lối đi tiếp; lỗi nói rõ sai gì và làm gì, không xin lỗi.
- Nhãn nút nói rõ việc sẽ xảy ra ("Lưu ván", không "OK"). Không alert() / confirm() trình duyệt: dùng hộp xác nhận trong app.
- Focus nhìn thấy được (focus-visible ring 2px), không outline: none trơn. Escape đóng sheet; sheet bẫy focus và trả focus.
- aria-live="polite" cho phản hồi đúng/sai của bài tập.

## Cách làm
1. Chạy app (`npx vite --port <CỔNG> --strictPort` trong chess-app), chụp màn hình Pixel 7 sáng và tối các trang chính TRƯỚC khi sửa
   (Học: tổng quan, một slide chữ, một bài tập, tổng kết; Tập; Chơi: chọn ván và đang chơi, luyện cờ tàn; Phân tích: danh sách và một ván;
   Cài đặt; Sách; Từng nước một). Xem ảnh, lập danh sách vi phạm theo quy tắc trên (Trước / Sau / Vì sao).
2. Sửa: ưu tiên CSS chung (src/index.css, tokens ở :root) và thành phần dùng chung (src/components/ui.tsx...). Sửa trang khi cần.
   Đổi icon emoji sang SVG nhỏ cùng phong cách với icon thanh tab trong src/App.tsx.
3. Không đổi hành vi hay nội dung bài học; không đổi logic. Không chạy git, không chạy `vite build`.
4. `npx tsc --noEmit -p tsconfig.app.json` sạch; chụp lại SAU, mở ảnh xem; không có lỗi console.

## Báo cáo (tiếng Việt, ngắn)
Bảng Trước / Sau / Vì sao các thay đổi chính, theo mức độ (quan trọng, nên làm, nhỏ). Những gì cố ý chưa làm và vì sao. Đường dẫn ảnh SAU.
