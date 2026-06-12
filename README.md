# NTDPay - PCI DSS Gap Assessment & Payment Simulation

![PCI DSS Compliant Intent](https://img.shields.io/badge/PCI--DSS-v4.0%20Compliant-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Language](https://img.shields.io/badge/languages-HTML%20%7C%20CSS%20%7C%20JS-blue.svg)

## 📝 Giới thiệu Dự án
** NTDPay là một dự án nghiên cứu và mô phỏng hệ thống thanh toán trực tuyến bảo mật, kết hợp với tài liệu **Đánh giá khoảng cách bảo mật (Gap Assessment)** theo tiêu chuẩn **PCI DSS (Payment Card Industry Data Security Standard)**. 

Dự án này được xây dựng nhằm mục đích giáo dục, phân tích kiến trúc an toàn thông tin và đưa ra các giải pháp kỹ thuật tối ưu nhằm bảo vệ Dữ liệu chủ thẻ (CHD) và Dữ liệu xác thực nhạy cảm (SAD) tuân thủ nghiêm ngặt theo các yêu cầu khắt khe của hội đồng PCI.


## 🛠 Cấu trúc Thư mục
* `index.html` & `style.css`: Giao diện người dùng (Frontend) mô phỏng form thu thập thông tin thẻ thanh toán an toàn.
* `app.js`: Xử lý logic truyền tải dữ liệu, áp dụng các nguyên tắc mã hóa và kiểm soát luồng dữ liệu thẻ.
* `PCI_DSS_Gap_Assessment_Report_DieuPay.md`: Báo cáo chi tiết đánh giá mức độ sẵn sàng, phân tích các điểm thiếu hụt (Gaps) đối với 12 yêu cầu của PCI DSS và đề xuất lộ trình khắc phục cho hệ thống DieuPay.


## 🔄 Luồng dữ liệu & Kiến trúc An toàn (Cardholder Data Flow)

Hệ thống áp dụng mô hình giảm thiểu phạm vi (Scope Reduction) và bảo mật đa lớp theo tiêu chuẩn PCI DSS:

1. **Thu thập dữ liệu (Inbound):** Khách hàng nhập liệu qua giao diện HTTPS mã hóa (TLS 1.3). Hệ thống khuyến nghị cấu nghị sử dụng iframe/Hosted Fields để chuyển giao trách nhiệm xử lý dữ liệu thẻ trực tiếp cho Gateway chuẩn PCI Level 1.
2. **Xử lý trên ứng dụng (`app.js`):** Kiểm tra định dạng dữ liệu (Validation) mà không ghi log (No logging) thông tin nhạy cảm. Mã CVV/CVC chỉ tồn tại trong bộ nhớ tạm thời phục vụ giao dịch thời gian thực.
3. **Lưu trữ dữ liệu (Storage):** * Toàn bộ mã **SAD (CVV/Mã PIN)** bị xóa bỏ ngay sau khi nhận phản hồi từ tổ chức tài chính.
    * Số thẻ **PAN** (nếu lưu trữ) bắt buộc phải được băm (Hashing) hoặc Token hóa (Tokenization) kết hợp che mặt (Masking) dạng `4111 11XX XXXX 1111`.


## 📊 Tóm tắt Báo cáo Đánh giá Khoảng cách (Gap Assessment)
Tài liệu `PCI_DSS_Gap_Assessment_Report_DieuPay.md` tập trung phân tích 6 nhóm mục tiêu cốt lõi với 12 yêu cầu của PCI DSS:

* **Xây dựng và duy trì mạng lưới bảo mật:** Thiết lập Firewall, cấu hình chặn truy cập trái phép.
* **Bảo vệ dữ liệu chủ thẻ:** Mã hóa dữ liệu khi lưu trữ và khi truyền tải trên mạng công cộng.
* **Quản lý lỗ hổng bảo mật:** Sử dụng phần mềm diệt virus và phát triển hệ thống an toàn.
* **Kiểm soát truy cập mạnh mẽ:** Phân quyền truy cập dựa trên nhu cầu công việc (Need-to-know) và áp dụng Xác thực đa yếu tố (MFA).
* **Theo dõi và kiểm tra hệ thống:** Ghi vết (Log) toàn bộ quyền truy cập vào tài nguyên mạng và dữ liệu thẻ.
* **Duy trì chính sách an toàn thông tin:** Thiết lập chính sách bảo mật cho toàn bộ nhân sự và đối tác liên quan.

## 🚀 Hướng dẫn Triển khai & Kiểm thử
Để chạy thử nghiệm giao diện mô phỏng thanh toán cục bộ:

1. Clone repository về máy cá nhân:
   ```bash
   git clone [https://github.com/zyond26/Gap_assessment.git](https://github.com/zyond26/Gap_assessment.git)
Mở file index.html trên trình duyệt hoặc sử dụng extension Live Server trên VS Code để kiểm tra luồng hoạt động của ứng dụng.

🔒 Tuyên bố miễn trừ trách nhiệm (Disclaimer)
Dự án này phục vụ cho mục đích học tập, nghiên cứu và đánh giá lý thuyết (Education ^^). Không sử dụng mã nguồn mô phỏng này trực tiếp cho môi trường production thật khi chưa qua kiểm thử độc lập bởi các kiểm toán viên PCI QSA (Qualified Security Assessor).
