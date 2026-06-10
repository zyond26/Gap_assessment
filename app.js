// --- CONFIGURATION & STATE SYSTEM ---
const state = {
    currentTab: 'tab-dashboard',
    simulationMode: 'noncompliant', // 'noncompliant' or 'compliant'
    isRemediating: false,
    requirements: [
        {
            id: 1,
            title: "Yêu cầu 1: Cơ chế kiểm soát an ninh mạng",
            compliant: false,
            gapDesc: "Tồn tại rule cho phép Dev Zone kết nối ANY cổng vào DB Zone; chưa rà soát rule 6 tháng/lần.",
            risk: "high",
            remediation: "Thiết lập tường lửa chặn mọi truy cập mặc định, chỉ mở cổng DB (5432) cho Core App và kích hoạt rà soát định kỳ.",
            specDesc: "Thiết lập và duy trì các cấu hình kiểm soát an ninh mạng (tường lửa, bộ định tuyến) nhằm bảo vệ Môi trường dữ liệu chủ thẻ (CDE) khỏi các truy cập trái phép từ bên ngoài và phân tách các vùng mạng nội bộ.",
            riskImpact: "Kẻ tấn công từ vùng mạng ít an toàn (như Development hoặc Office) có thể trực tiếp truy cập và tấn công cơ sở dữ liệu thẻ mà không bị tường lửa chặn đứng.",
            steps: [
                "SSH connection established with Palo Alto NGFW Border (172.16.4.1)...",
                "Executing command: 'no rule-id Rule-Dev-to-DB-Temp' -> Removed.",
                "Executing command: 'add rule-id CDE-DB-Secure source:Core-App-VLAN port:5432 destination:DB-VLAN action:ALLOW' -> Active.",
                "Enabling automated 180-day firewall rules check cron-job...",
                "Firewall network access control checks: PASSED."
            ]
        },
        {
            id: 2,
            title: "Yêu cầu 2: Cấu hình an toàn cho mọi thiết bị",
            compliant: false,
            gapDesc: "Switch nội bộ còn dùng mật khẩu mặc định (admin/admin); chưa có bộ tài liệu Hardening Standards.",
            risk: "high",
            remediation: "Đổi toàn bộ mật khẩu mặc định thiết bị mạng và biên soạn bộ quy chuẩn System Hardening dựa trên CIS Benchmarks.",
            specDesc: "Áp dụng cấu hình an toàn cho tất cả các thành phần hệ thống. Thay đổi mật khẩu mặc định của nhà sản xuất, vô hiệu hóa các cổng/dịch vụ không cần thiết và thực hiện hardening hệ điều hành/phần mềm.",
            riskImpact: "Hacker dễ dàng chiếm quyền quản trị thiết bị bằng các tài khoản mặc định được công bố công khai trên mạng, từ đó xâm nhập sâu vào hệ thống NTDPay.",
            steps: [
                "Scanning internal switch infrastructure for default credentials...",
                "Device: Corp-Switch-01 -> Found defaults (admin/admin). Resetting credentials...",
                "Password updated to complex hash (length: 16, salt enabled).",
                "Applying CIS Benchmarks Rocky Linux hardening template to Nginx and Core OS...",
                "Disabling unneeded system services (postfix, cups, bluetooth): SUCCESS."
            ]
        },
        {
            id: 3,
            title: "Yêu cầu 3: Bảo vệ dữ liệu chủ thẻ lưu trữ",
            compliant: false,
            gapDesc: "Khóa mật mã DEK lưu ở dạng rõ trong file xml; log lỗi ứng dụng ghi nhận số thẻ PAN và CVV dạng rõ.",
            risk: "critical",
            remediation: "Di chuyển khóa DEK vào thiết bị HSM vật lý và áp dụng bộ lọc làm sạch log để chặn ghi nhận số PAN/CVV gốc.",
            specDesc: "Bảo vệ dữ liệu tài khoản chủ thẻ lưu trữ tĩnh (Data-at-Rest). Mã hóa số thẻ PAN bằng thuật toán mạnh (AES-256), bảo vệ khóa mã hóa trong thiết bị HSM, áp dụng mặt nạ che số thẻ và cấm lưu trữ mã CVV2 sau xác thực.",
            riskImpact: "Số thẻ và CVV bị lộ dưới dạng rõ trong tệp cấu hình hoặc log. Nếu máy chủ bị xâm nhập hoặc tệp sao lưu bị mất cắp, dữ liệu thẻ của hàng loạt khách hàng sẽ bị lợi dụng.",
            steps: [
                "Establishing secure vault integration with Thales HSM (172.16.4.99)...",
                "Moving database encryption keys (DEK) to HSM protected storage...",
                "Purging cleartext key from db-config.xml and configuring gRPC key-rotation provider...",
                "Injecting log-scrubbing filter regex: 'PANMaskingFilter[\\d{12,19}]' -> Enabled.",
                "Data-at-rest encryption settings: COMPLIANT."
            ]
        },
        {
            id: 4,
            title: "Yêu cầu 4: Mã hóa dữ liệu truyền trên mạng công cộng",
            compliant: false,
            gapDesc: "Máy chủ API Gateway chấp nhận bắt tay TLS 1.0 và 1.1; sử dụng các bộ mã hóa Cipher Suites yếu.",
            risk: "high",
            remediation: "Cấu hình Nginx chỉ chấp nhận TLS 1.2 và 1.3, vô hiệu hóa hoàn toàn các giao thức lỗi thời.",
            specDesc: "Mã hóa dữ liệu chủ thẻ khi truyền tải qua mạng công cộng (Internet) hoặc mạng không tin cậy. Sử dụng giao thức bảo mật mạnh (TLS 1.2/1.3) và các bộ mã hóa an toàn, loại bỏ giao thức cũ.",
            riskImpact: "Tin tặc có thể thực hiện tấn công nghe lén (Man-in-the-Middle) trên đường truyền Internet để bắt và giải mã thông tin thẻ của khách hàng khi họ thực hiện thanh toán.",
            steps: [
                "Opening Nginx site configuration: /etc/nginx/conf.d/payment.conf...",
                "Modifying: 'ssl_protocols TLSv1.2 TLSv1.3;'",
                "Disabling unsecure ciphers (3DES, RC4, MD5)...",
                "Testing configuration file: 'nginx -t' -> Syntax OK.",
                "Reloading web server: 'systemctl reload nginx' -> Active (TLS 1.2/1.3 only)."
            ]
        },
        {
            id: 5,
            title: "Yêu cầu 5: Bảo vệ hệ thống khỏi mã độc",
            compliant: true,
            gapDesc: "Đã cài đặt phần mềm diệt virus cơ bản cho toàn bộ máy trạm văn phòng.",
            risk: "none",
            remediation: "Duy trì cập nhật mẫu nhận diện mã độc hàng ngày và mở rộng cài đặt EDR lên toàn bộ máy chủ CDE.",
            specDesc: "Triển khai các giải pháp phòng chống mã độc (Antivirus, EDR, XDR) trên toàn bộ hệ thống, đảm bảo các phần mềm này liên tục hoạt động, được cập nhật cơ sở dữ liệu mẫu nhận diện thường xuyên.",
            riskImpact: "Mã độc, Trojan hoặc các phần mềm gián điệp (Spyware/Skimmers) có thể lây nhiễm vào máy chủ, ghi lại thao tác bàn phím hoặc đánh cắp dữ liệu thẻ trong bộ nhớ RAM ứng dụng."
        },
        {
            id: 6,
            title: "Yêu cầu 6: Phát triển và duy trì hệ thống an toàn",
            compliant: false,
            gapDesc: "Sử dụng thư viện log4j dính lỗ hổng Log4Shell nghiêm trọng; thiếu quét mã nguồn tự động trong CI/CD.",
            risk: "critical",
            remediation: "Nâng cấp Log4j lên phiên bản bảo mật; tích hợp công cụ quét tĩnh SAST (SonarQube) vào Jenkins pipeline.",
            specDesc: "Phát triển và duy trì các hệ thống và ứng dụng an toàn. Xây dựng quy trình SSDLC, vá các lỗ hổng bảo mật định kỳ, rà quét lỗ hổng mã nguồn (SAST/DAST) trước khi đưa lên môi trường Production.",
            riskImpact: "Các lỗ hổng bảo mật nghiêm trọng chưa được vá (như Log4Shell) sẽ trở thành bàn đạp để hacker thực thi mã từ xa, chiếm quyền Root điều khiển toàn bộ ứng dụng thanh toán.",
            steps: [
                "Parsing pom.xml file of Core Payment App...",
                "Replacing dependency: 'log4j-core-2.14.1' -> 'log4j-core-2.17.1'...",
                "Triggering project rebuild and unit tests -> All green.",
                "Injecting SonarQube static analysis check block into Jenkins CI/CD pipeline...",
                "Automated vulnerability patch deployment: COMPLETE."
            ]
        },
        {
            id: 7,
            title: "Yêu cầu 7: Hạn chế truy cập theo nhu cầu nghiệp vụ",
            compliant: false,
            gapDesc: "Tài khoản DB của app có quyền SUPERUSER; nhân viên CS có thể nhìn thấy PAN gốc trên CS Portal.",
            risk: "high",
            remediation: "Hạ quyền tài khoản ứng dụng trong Postgres; áp dụng mặt nạ (Masking) che giấu số thẻ trên CS Portal.",
            specDesc: "Hạn chế quyền truy cập vào dữ liệu chủ thẻ theo nguyên tắc đặc quyền tối thiểu (Least Privilege). Chỉ những người dùng có nhiệm vụ thực sự cần thiết mới được cấp quyền truy cập dữ liệu thẻ.",
            riskImpact: "Cấp quyền truy cập quá rộng cho phép các tài khoản không liên quan (hoặc tài khoản bị chiếm đoạt) đọc được dữ liệu thẻ thô, gây rò rỉ dữ liệu từ bên trong tổ chức.",
            steps: [
                "Connecting to PostgreSQL DB (172.16.4.60)...",
                "Revoking broad privileges: 'ALTER USER pay_user NOSUPERUSER;'",
                "Granting minimal SELECT/INSERT/UPDATE privileges on transactions schema...",
                "Updating CS Portal search UI scripts to enforce 6-first/4-last PAN masking.",
                "Least privilege access matrices: ACTIVE."
            ]
        },
        {
            id: 8,
            title: "Yêu cầu 8: Định danh và xác thực tài khoản",
            compliant: false,
            gapDesc: "Thiếu xác thực đa yếu tố (MFA) cho VPN và Bastion Host; chính sách mật khẩu AD GPO chỉ dài 8 ký tự.",
            risk: "high",
            remediation: "Kích hoạt MFA (OTP Google Authenticator) cho VPN/Bastion và tăng độ dài mật khẩu AD tối thiểu lên 12 ký tự.",
            specDesc: "Xác định danh tính và xác thực quyền truy cập vào các thành phần hệ thống. Cấp Unique ID riêng cho mỗi nhân sự, áp dụng chính sách mật khẩu mạnh và bắt buộc xác thực đa yếu tố (MFA) đối với mọi truy cập quản trị từ xa.",
            riskImpact: "Không có MFA, tin tặc chỉ cần dò ra mật khẩu (hoặc mua lại mật khẩu bị lộ) là có thể đăng nhập trực tiếp vào hệ thống quản trị Bastion Host hoặc mạng VPN nội bộ của NTDPay.",
            steps: [
                "Modifying Active Directory Domain Password Policy...",
                "Updating Group Policy (GPO): Minimum Password Length = 12 characters.",
                "Integrating Google Authenticator RADIUS daemon into FortiGate VPN...",
                "Enabling MFA check rules for SSH log-in sessions on Bastion Host.",
                "Multi-factor authentication check: VERIFIED."
            ]
        },
        {
            id: 9,
            title: "Yêu cầu 9: Hạn chế tiếp cận vật lý dữ liệu thẻ",
            compliant: true,
            gapDesc: "Máy chủ đặt tại Viettel IDC đạt chuẩn an ninh Rated 3 vật lý.",
            risk: "none",
            remediation: "Duy trì giám sát ra vào phòng máy và ghi nhận lịch sử ra vào máy chủ vật lý.",
            specDesc: "Hạn chế tiếp cận vật lý đối với dữ liệu chủ thẻ. Đặt thiết bị CDE trong phòng Datacenter an toàn, kiểm soát cửa ra vào bằng camera, thẻ từ/sinh trắc học, quản lý thiết bị lưu trữ vật lý và sao lưu ngoại tuyến.",
            riskImpact: "Đối tượng xấu có thể tiếp cận trực tiếp máy chủ vật lý, cắm thiết bị lưu trữ USB để sao chép dữ liệu hoặc đánh cắp ổ đĩa cứng chứa cơ sở dữ liệu giao dịch thẻ."
        },
        {
            id: 10,
            title: "Yêu cầu 10: Ghi nhật ký và giám sát truy cập",
            compliant: false,
            gapDesc: "Logs SIEM chỉ lưu giữ 3 tháng do thiếu ổ đĩa; chưa kết nối log từ Active Directory và Tường lửa về SIEM.",
            risk: "high",
            remediation: "Nâng cấp ổ đĩa SIEM, lưu logs lạnh 1 năm và cấu hình winlogbeat/syslog forward logs về Wazuh SIEM.",
            specDesc: "Ghi nhật ký và giám sát tất cả các truy cập vào tài nguyên mạng và dữ liệu chủ thẻ. Thiết lập hệ thống SIEM tập trung log từ mọi máy chủ, tường lửa, cơ sở dữ liệu và lưu giữ logs trong vòng 1 năm.",
            riskImpact: "Thiếu cơ chế ghi nhật ký tập trung làm tê liệt khả năng phát hiện sự cố an ninh của đội SOC, đồng thời làm mất dấu vết điều tra nguyên nhân khi xảy ra vụ việc rò rỉ dữ liệu.",
            steps: [
                "Extending SIEM Wazuh partition storage to 2TB...",
                "Configuring AD Domain controller EventLog shipper (winlogbeat)...",
                "Setting Palo Alto NGFW syslog forward server to Wazuh (port 514 secure)...",
                "Enabling automated daily log checking script for SOC operators.",
                "Log retention policy modified: 90-day hot, 275-day cold (AWS S3) -> ACTIVE."
            ]
        },
        {
            id: 11,
            title: "Yêu cầu 11: Kiểm tra an ninh hệ thống thường xuyên",
            compliant: true,
            gapDesc: "Đã có quy trình rà quét lỗ hổng ứng dụng định kỳ nội bộ trước khi release sản phẩm.",
            risk: "none",
            remediation: "Tiến hành quét lỗ hổng bởi đối tác ASV 3 tháng/lần và thực hiện kiểm thử xâm nhập Penetration Testing hàng năm.",
            specDesc: "Thường xuyên kiểm tra an ninh hệ thống và mạng lưới. Thực hiện quét lỗ hổng định kỳ (bởi ASV cho bên ngoài, và công cụ chuyên dụng cho nội bộ), kiểm thử xâm nhập (Penetration Testing) ít nhất 1 lần/năm.",
            riskImpact: "Hệ thống tồn tại các lỗ hổng bảo mật mới hoặc các lỗi cấu hình mạng phát sinh theo thời gian mà không được phát hiện sớm, tạo điều kiện cho hacker khai thác bất ngờ."
        },
        {
            id: 12,
            title: "Yêu cầu 12: Quản lý an toàn thông tin tổ chức",
            compliant: true,
            gapDesc: "Có chính sách bảo mật chung ban hành và theo dõi rủi ro cơ bản.",
            risk: "none",
            remediation: "Cập nhật chính sách an toàn thông tin định kỳ hàng năm và phổ biến diễn tập kịch bản ứng phó sự cố cho nhân viên.",
            specDesc: "Quản lý an toàn thông tin bằng các chính sách và chương trình cụ thể. Ban hành bộ chính sách bảo mật tổng thể, đánh giá rủi ro định kỳ, đào tạo nhận thức an toàn thông tin cho nhân sự và xây dựng kế hoạch ứng phó sự cố.",
            riskImpact: "Khi xảy ra sự cố tấn công mạng, nhân sự không có quy trình phản ứng chuẩn (Incident Response Plan) sẽ xử lý chậm chạp, hoảng loạn làm trầm trọng thêm mức độ rò rỉ dữ liệu thẻ."
        }
    ],
    assets: {
        user: {
            name: "Trình duyệt Khách hàng",
            ip: "Động (Dynamic IP)",
            os: "Windows / macOS / iOS / Android",
            purpose: "Gửi yêu cầu giao dịch thanh toán từ phía người dùng cuối",
            scope: "In-Scope (Điểm đầu nhận dữ liệu thẻ)",
            securityNonCompliant: [
                "Bắt tay HTTPS bằng TLS 1.0/1.1 có nguy cơ bị nghe lén dữ liệu truyền tải.",
                "CVV2 được nhập trực tiếp qua widget chưa được bảo mật chống keylogger."
            ],
            securityCompliant: [
                "Chỉ bắt tay bằng TLS 1.3 mã hóa cực mạnh.",
                "Giao diện nhập liệu sử dụng Hosted Fields an toàn của NTDPay."
            ]
        },
        admin: {
            name: "Thiết bị Kỹ sư vận hành (VPN Admin)",
            ip: "192.168.45.12 (Văn phòng / Từ xa)",
            os: "Windows 11 Enterprise",
            purpose: "Thiết bị dùng để quản trị hệ thống và vận hành kỹ thuật từ xa",
            scope: "In-Scope (Connected)",
            securityNonCompliant: [
                "Kết nối VPN về máy chủ CDE chỉ yêu cầu mật khẩu tĩnh, không có MFA.",
                "Dùng chung một SSH Key quản trị, tăng rủi ro mạo danh."
            ],
            securityCompliant: [
                "Kết nối VPN bắt buộc nhập mã xác thực OTP Token 6 chữ số (MFA).",
                "Đăng nhập qua Bastion bằng SSH Key được định danh cá nhân độc lập."
            ]
        },
        waf: {
            name: "AWS WAF & Application Load Balancer",
            ip: "52.74.12.98 (Public IP)",
            os: "AWS Managed Service",
            purpose: "Lọc lưu lượng tấn công ứng dụng web (OWASP Top 10) và cân bằng tải",
            scope: "In-Scope (CDE)",
            securityNonCompliant: [
                "Cấu hình WAF cơ bản, chưa cập nhật luật chặn các hành vi scan tự động.",
                "Chấp nhận kết nối TLS 1.0 và TLS 1.1 từ phía người dùng."
            ],
            securityCompliant: [
                "Cập nhật các ruleset ngăn chặn SQL Injection, XSS và log4j exploit tự động.",
                "Tắt hoàn toàn TLS 1.0 và 1.1; chỉ cho phép cipher mạnh."
            ]
        },
        web: {
            name: "Web Server (Nginx Cluster)",
            ip: "10.0.1.10 (AWS Private Subnet)",
            os: "Ubuntu Server 22.04",
            purpose: "Lưu trữ mã nguồn trang tĩnh và định cấu hình máy chủ Web",
            scope: "In-Scope (CDE)",
            securityNonCompliant: [
                "Chưa được cấu hình cài đặt EDR/Antivirus để kiểm soát mã độc.",
                "Cấu hình hardening chưa tối ưu, lộ phiên bản Nginx trong tiêu đề HTTP."
            ],
            securityCompliant: [
                "Cài đặt Wazuh Agent giám sát toàn vẹn tệp tin (FIM).",
                "Định cấu hình hardening bảo mật (server_tokens off) che giấu phiên bản."
            ]
        },
        apigw: {
            name: "API Gateway Server (Nginx)",
            ip: "10.0.1.15 (AWS Private Subnet)",
            os: "Rocky Linux 9.2",
            purpose: "Điểm tiếp nhận và điều phối các lệnh API giao dịch từ WAF về Core IDC",
            scope: "In-Scope (CDE)",
            securityNonCompliant: [
                "Cấu hình Nginx chưa tắt TLS 1.0/1.1.",
                "Chưa được cấu hình cài EDR để phát hiện mã độc tấn công."
            ],
            securityCompliant: [
                "Nginx cấu hình chỉ chấp nhận SSL Protocols TLSv1.2 TLSv1.3.",
                "Đã cài đặt Wazuh Agent giám sát tiến trình và tệp cấu hình."
            ]
        },
        napas: {
            name: "Cổng NAPAS & Các ngân hàng thanh toán",
            ip: "203.162.4.8 (External IP)",
            os: "NAPAS Managed Hardware",
            purpose: "Tổ chức chuyển mạch giao dịch tài chính quốc tế và nội địa",
            scope: "Out-of-Scope (Bên thứ ba)",
            securityNonCompliant: [
                "Giao tiếp qua đường truyền Leased-line nhưng chưa được NTDPay mã hóa gói tin ở lớp ứng dụng (chỉ dựa vào bảo mật đường truyền)."
            ],
            securityCompliant: [
                "Mã hóa gói tin giao dịch chuẩn ISO 8583 bằng khóa đối tác được sinh và bảo vệ bởi HSM."
            ]
        },
        "cde-fw": {
            name: "Palo Alto NGFW (Tường lửa CDE)",
            ip: "172.16.4.1 (Viettel IDC)",
            os: "PAN-OS 11.0",
            purpose: "Tường lửa phân tách hoàn toàn vùng CDE an toàn khỏi các phân vùng mạng khác",
            scope: "In-Scope (Connected)",
            securityNonCompliant: [
                "Quy tắc cấu hình lỏng lẻo: Chấp nhận kết nối ANY từ Dev Zone vào DB Zone.",
                "Chưa rà soát rule tường lửa trong vòng 12 tháng qua."
            ],
            securityCompliant: [
                "Đóng toàn bộ cổng ANY. Chỉ chấp nhận kết nối cổng 5432 từ IP Core App.",
                "Thiết lập lịch rà soát rule tự động định kỳ 6 tháng một lần."
            ]
        },
        core: {
            name: "Payment Core Application Server",
            ip: "172.16.4.50 (Viettel IDC CDE Zone)",
            os: "Red Hat Enterprise Linux 9.0",
            purpose: "Xử lý logic thanh toán, giải mã gói tin giao dịch, kết nối Napas",
            scope: "In-Scope (CDE - Cực kỳ quan trọng)",
            securityNonCompliant: [
                "Ứng dụng Java dùng thư viện Log4j v2.14.1 dính lỗi Log4Shell.",
                "Lưu khóa giải mã dữ liệu DEK dạng văn bản rõ trong db-config.xml.",
                "Ghi nhận số PAN thẻ gốc và mã bảo mật CVV vào tệp error.log khi giao dịch lỗi."
            ],
            securityCompliant: [
                "Thư viện Log4j được nâng cấp lên phiên bản an toàn >= 2.17.1.",
                "Khóa giải mã được cất riêng trong HSM, ứng dụng gọi qua gRPC an toàn.",
                "Logs hệ thống được lọc tự động, che giấu số PAN (Masking) và xóa bỏ CVV."
            ]
        },
        hsm: {
            name: "Hardware Security Module (HSM)",
            ip: "172.16.4.99 (Viettel IDC Physical)",
            os: "Thales PayShield OS",
            purpose: "Thiết bị mật mã chuyên dụng quản lý khóa chính và sinh token dữ liệu thẻ",
            scope: "In-Scope (CDE)",
            securityNonCompliant: [
                "HSM hoạt động độc lập nhưng chưa được ứng dụng Core Payment khai thác triệt để (mới chỉ dùng ký số giao dịch).",
                "Khóa DEK chưa được tạo và lưu trữ an toàn bên trong HSM."
            ],
            securityCompliant: [
                "Lưu trữ khóa chính và thực hiện mọi thao tác giải mã/mã hóa PAN trực tiếp trong HSM.",
                "Sinh mã token ngẫu nhiên an toàn cho các giao dịch lưu thẻ."
            ]
        },
        db: {
            name: "PostgreSQL Database Cluster",
            ip: "172.16.4.60 (Viettel IDC DB Zone)",
            os: "Red Hat Enterprise Linux 9.0",
            purpose: "Lưu trữ thông tin lịch sử giao dịch và token liên kết thẻ",
            scope: "In-Scope (CDE - Cực kỳ nhạy cảm)",
            securityNonCompliant: [
                "Tài khoản kết nối DB của app (pay_user) được cấp quyền tối cao SUPERUSER.",
                "Đĩa cứng lưu trữ vật lý của cơ sở dữ liệu chưa được mã hóa toàn bộ đĩa (Full Disk Encryption)."
            ],
            securityCompliant: [
                "Tài khoản `pay_user` chỉ được cấp quyền SELECT/INSERT/UPDATE giới hạn.",
                "Kích hoạt mã hóa đĩa vật lý (dm-crypt/LUKS) và mã hóa cột dữ liệu thẻ."
            ]
        },
        bastion: {
            name: "Bastion Host (Jump Box)",
            ip: "172.16.1.10 (Management Zone)",
            os: "Rocky Linux 9.2",
            purpose: "Cổng duy nhất cho quản trị viên đăng nhập để truy cập CDE từ xa",
            scope: "In-Scope (Connected)",
            securityNonCompliant: [
                "Đăng nhập Bastion chỉ yêu cầu mật khẩu tĩnh, không có xác thực hai lớp (MFA).",
                "Chính sách mật khẩu lỏng lẻo, dùng chung SSH Key truy cập."
            ],
            securityCompliant: [
                "Bắt buộc xác thực đa yếu tố (MFA - Google Authenticator OTP) khi đăng nhập.",
                "Mỗi quản trị viên đăng nhập bằng SSH key cá nhân riêng biệt có ghi nhật ký."
            ]
        },
        ad: {
            name: "Active Directory Domain Controller",
            ip: "172.16.1.15 (Management Zone)",
            os: "Windows Server 2022",
            purpose: "Quản lý định danh tài khoản, phân quyền truy cập hệ thống",
            scope: "In-Scope (Connected)",
            securityNonCompliant: [
                "Chính sách mật khẩu AD GPO chỉ dài 8 ký tự, không bắt buộc đổi định kỳ.",
                "Chưa được kết nối chuyển tiếp event log bảo mật về SIEM."
            ],
            securityCompliant: [
                "Cấu hình AD GPO yêu cầu mật khẩu dài tối thiểu 12 ký tự, thay đổi sau 90 ngày.",
                "Cài winlogbeat chuyển toàn bộ log bảo mật về SIEM tập trung."
            ]
        },
        siem: {
            name: "Wazuh SIEM Manager Server",
            ip: "172.16.1.20 (Management Zone)",
            os: "Ubuntu Server 22.04",
            purpose: "Thu thập nhật ký logs, phân tích sự cố an ninh tập trung",
            scope: "In-Scope (Connected)",
            securityNonCompliant: [
                "SIEM chưa kết nối logs từ Active Directory và Tường lửa biên Palo Alto.",
                "Dung lượng đĩa nhỏ, logs chỉ lưu trữ 3 tháng rồi tự động xóa."
            ],
            securityCompliant: [
                "Kết nối toàn diện logs AD và Palo Alto về SIEM Wazuh.",
                "Tăng ổ đĩa, lưu trữ logs nóng 90 ngày và đẩy logs nén lưu trữ lạnh đủ 1 năm."
            ]
        },
        backup: {
            name: "Backup Server (Lưu trữ sao lưu)",
            ip: "172.16.1.30 (Management Zone)",
            os: "Red Hat Enterprise Linux 9.0",
            purpose: "Lưu giữ tệp tin sao lưu cơ sở dữ liệu và hệ thống định kỳ",
            scope: "In-Scope (Connected)",
            securityNonCompliant: [
                "Bản sao lưu lưu trữ dạng rõ hoặc không sử dụng khóa mã hóa HSM bảo vệ.",
                "Quy trình quản lý media chưa chặt chẽ, thiếu kiểm kê."
            ],
            securityCompliant: [
                "Bản sao lưu được mã hóa nén trước khi lưu bằng thuật toán AES-256.",
                "Quy chế quản lý media được ban hành chính thức, ghi nhật ký di chuyển."
            ]
        }
    }
};

// --- DOM ELEMENTS ---
const dom = {
    tabs: document.querySelectorAll('.nav-menu button'),
    tabContents: document.querySelectorAll('.tab-content'),
    complianceRing: document.getElementById('compliance-ring'),
    complianceScoreVal: document.getElementById('compliance-score-val'),
    txtCompliantCount: document.getElementById('txt-compliant-count'),
    txtNoncompliantCount: document.getElementById('txt-noncompliant-count'),
    btnRemediateAll: document.getElementById('btn-remediate-all'),
    btnModeNoncompliant: document.getElementById('btn-mode-noncompliant'),
    btnModeCompliant: document.getElementById('btn-mode-compliant'),
    systemStatusBadge: document.getElementById('system-status-badge'),
    requirementsContainer: document.getElementById('requirements-container'),

    // Simulator
    paymentForm: document.getElementById('payment-form'),
    cardHolder: document.getElementById('card-holder'),
    cardNumber: document.getElementById('card-number'),
    cardExpiry: document.getElementById('card-expiry'),
    cardCvv: document.getElementById('card-cvv'),
    previewNumber: document.getElementById('preview-number'),
    previewName: document.getElementById('preview-name'),
    previewExpiry: document.getElementById('preview-expiry'),
    btnSubmitPayment: document.getElementById('btn-submit-payment'),
    consoleLogs: document.getElementById('console-logs'),
    dbTableBody: document.getElementById('db-table-body'),
    btnConsoleLogs: document.getElementById('btn-console-logs'),
    btnConsoleDb: document.getElementById('btn-console-db'),
    securityWarningsContent: document.getElementById('security-warnings-content'),
    securityWarningsPanel: document.getElementById('security-warnings-panel'),

    // Network Map
    netNodes: document.querySelectorAll('.net-node'),
    nodeDetailsPanel: document.getElementById('node-details-panel'),
    zoneViettelCde: document.querySelector('.zone-viettel-cde'),

    // Scanner & Tools
    btnStartScan: document.getElementById('btn-start-scan'),
    scanProgressArea: document.getElementById('scan-progress-area'),
    scanProgressBar: document.getElementById('scan-progress-bar'),
    scanStatusText: document.getElementById('scan-status-text'),
    scanReportContainer: document.getElementById('scan-report-container'),
    btnPrintReport: document.getElementById('btn-print-report')
};

// --- PROGRESS RING CALCULATION ---
const RING_RADIUS = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function initProgressRing() {
    dom.complianceRing.style.strokeDasharray = `${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`;
    dom.complianceRing.style.strokeDashoffset = RING_CIRCUMFERENCE;
}

function updateProgressRing(percent) {
    const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
    dom.complianceRing.style.strokeDashoffset = offset;

    // Change color dynamic
    if (percent < 50) {
        dom.complianceRing.setAttribute('stroke', '#ef4444'); // Red
    } else if (percent < 90) {
        dom.complianceRing.setAttribute('stroke', '#f59e0b'); // Orange
    } else {
        dom.complianceRing.setAttribute('stroke', '#10b981'); // Green
    }
}

// --- APP RENDER FUNCTIONS ---
function calculateCompliance() {
    const total = state.requirements.length;
    const compliantCount = state.requirements.filter(r => r.compliant).length;
    const nonCompliantCount = total - compliantCount;
    const percent = Math.round((compliantCount / total) * 100);

    // Update State Counters
    document.getElementById('stat-gaps-count').innerText = `${nonCompliantCount === 0 ? 0 : nonCompliantCount * 2 - 1} Gaps`;

    let criticalCount = 0;
    state.requirements.forEach(r => {
        if (!r.compliant && r.risk === 'critical') criticalCount++;
    });
    document.getElementById('stat-critical-count').innerText = `${criticalCount} Rủi Ro`;

    // Update Sidebar Rings & Text
    dom.complianceScoreVal.innerText = `${percent}%`;
    dom.txtCompliantCount.innerText = `${compliantCount} / ${total} Đạt`;
    dom.txtNoncompliantCount.innerText = `${nonCompliantCount} / ${total} Lỗi`;
    updateProgressRing(percent);

    // Update System Status Badge & Viettel CDE Box SVG class
    if (percent === 100) {
        dom.systemStatusBadge.className = "status-badge green";
        dom.systemStatusBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Hệ thống Đạt chuẩn PCI DSS`;
        if (dom.zoneViettelCde) dom.zoneViettelCde.classList.add('secure-zone');
        toggleSimulationMode('compliant', false);
    } else {
        dom.systemStatusBadge.className = "status-badge red";
        dom.systemStatusBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Hệ thống có rủi ro cao`;
        if (dom.zoneViettelCde) dom.zoneViettelCde.classList.remove('secure-zone');
        toggleSimulationMode('noncompliant', false);
    }

    // Sync interactive SAQ progress & network threat styling if functions exist
    if (typeof updateSaqProgress === 'function') {
        updateSaqProgress(percent, compliantCount, total);
    }
    if (typeof updateNetworkThreatStatus === 'function') {
        updateNetworkThreatStatus();
    }
}

function renderRequirements() {
    dom.requirementsContainer.innerHTML = '';

    state.requirements.forEach(req => {
        const item = document.createElement('div');
        item.className = 'requirement-item';
        item.setAttribute('data-req-id', req.id);

        const badgeClass = req.compliant ? 'green' : 'red';
        const badgeIcon = req.compliant ? '<i class="fa-solid fa-check"></i>' : `${req.id}`;

        const riskTag = req.compliant
            ? '<span class="req-risk-tag none">Đạt</span>'
            : `<span class="req-risk-tag ${req.risk}">${req.risk}</span>`;

        let actionBtn = '';
        if (req.compliant) {
            actionBtn = '<button class="btn btn-remediate compliant-btn" onclick="event.stopPropagation();"><i class="fa-solid fa-check"></i> Đã xử lý</button>';
        } else {
            actionBtn = `<button class="btn btn-remediate" id="btn-remed-${req.id}" onclick="event.stopPropagation(); remediateRequirement(${req.id})"><i class="fa-solid fa-wrench"></i> Khắc phục</button>`;
        }

        item.innerHTML = `
            <div class="req-header" onclick="toggleRequirementExpand(${req.id})">
                <div class="req-left">
                    <div class="req-badge ${badgeClass}">${badgeIcon}</div>
                    <div class="req-info">
                        <span class="req-title">${req.title} <i class="fa-solid fa-chevron-down req-toggle-icon"></i></span>
                        <span class="req-gap-desc">${req.compliant ? 'Kiểm soát đang hoạt động tốt, tuân thủ hoàn toàn.' : req.gapDesc}</span>
                    </div>
                </div>
                <div class="req-right">
                    ${riskTag}
                    ${actionBtn}
                </div>
            </div>
            <div class="req-details-collapsible">
                <div class="req-details-grid">
                    <div class="req-detail-section spec-sec">
                        <h5><i class="fa-solid fa-circle-info"></i> Chi tiết Yêu cầu PCI DSS</h5>
                        <p>${req.specDesc}</p>
                    </div>
                    <div class="req-detail-section risk-sec ${req.compliant ? 'compliant-risk' : ''}">
                        <h5><i class="fa-solid fa-triangle-exclamation"></i> ${req.compliant ? 'Hiện trạng rủi ro (Đã khắc phục)' : 'Nguy cơ & Rủi ro hoạt động'}</h5>
                        <p>${req.compliant ? 'Không phát hiện rủi ro hoạt động. Thiết bị và ứng dụng đang được giám sát chặt chẽ.' : req.riskImpact}</p>
                    </div>
                    ${req.remediation ? `
                    <div class="req-detail-section remedy-sec" style="grid-column: span 2;">
                        <h5><i class="fa-solid fa-screwdriver-wrench"></i> Lộ trình & Phương án khắc phục</h5>
                        <p style="margin-bottom: 8px;"><strong>Giải pháp đề xuất:</strong> ${req.remediation}</p>
                        ${req.steps ? `
                        <div style="font-size: 11px; margin-top: 6px;">
                            <strong style="color: var(--text-primary); display: block; margin-bottom: 4px;">Quy trình cấu hình hệ thống:</strong>
                            <ul style="margin: 0; padding-left: 15px; color: var(--text-secondary);">
                                ${req.steps.map(step => `<li>${step}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        dom.requirementsContainer.appendChild(item);
    });
}

window.toggleRequirementExpand = function (reqId) {
    const item = document.querySelector(`.requirement-item[data-req-id="${reqId}"]`);
    if (item) {
        item.classList.toggle('expanded');
    }
};

// Global functions for inline click events
window.remediateRequirement = function (reqId) {
    if (state.isRemediating) return;

    const reqIndex = state.requirements.findIndex(r => r.id === reqId);
    if (reqIndex === -1) return;

    const targetReq = state.requirements[reqIndex];
    const targetBtn = document.getElementById(`btn-remed-${reqId}`);

    state.isRemediating = true;
    if (targetBtn) {
        targetBtn.disabled = true;
        targetBtn.className = "btn btn-primary";
        targetBtn.innerHTML = `<i class="fa-solid fa-sync fa-spin"></i> Đang sửa...`;
    }

    // Switch console to Logs tab
    dom.btnConsoleLogs.click();
    clearConsole();

    addConsoleLog(`[HỆ THỐNG] Khởi động kịch bản khắc phục lỗi bảo mật Yêu cầu ${reqId}...`, "info");

    // Step-by-step console logs simulation
    let step = 0;
    const steps = targetReq.steps || ["Đang thiết lập kết nối an toàn...", "Áp dụng bản vá kỹ thuật...", "Kiểm tra cấu hình..."];

    const interval = setInterval(() => {
        if (step < steps.length) {
            addConsoleLog(`[REMEDIATION] ${steps[step]}`, "info");
            step++;
        } else {
            clearInterval(interval);

            // Finish remediation
            state.requirements[reqIndex].compliant = true;
            renderRequirements();
            calculateCompliance();
            state.isRemediating = false;

            addConsoleLog(`[SUCCESS] Yêu cầu ${reqId} đã đạt trạng thái tuân thủ thành công!`, "success");
        }
    }, 400);
};

// --- REMEDIATE ALL BUTTON ---
dom.btnRemediateAll.addEventListener('click', () => {
    if (state.isRemediating) return;

    state.isRemediating = true;
    dom.btnConsoleLogs.click();
    clearConsole();
    addConsoleLog("[COMPLIANCE] Bắt đầu triển khai chiến dịch khắc phục lỗi toàn hệ thống (Remediation Campaign)...", "warning");

    let currentIdx = 0;

    function remediateNext() {
        const nonCompliantReqs = state.requirements.filter(r => !r.compliant);
        if (nonCompliantReqs.length === 0) {
            state.isRemediating = false;
            calculateCompliance();
            addConsoleLog("[SUCCESS] Toàn bộ hệ thống CDE của NTDPay đã đạt 100% tuân thủ tiêu chuẩn PCI DSS v4.0!", "success");
            return;
        }

        const req = nonCompliantReqs[0];
        addConsoleLog(`[COMPLIANCE] Đang xử lý Yêu cầu ${req.id}: ${req.title}...`, "info");

        setTimeout(() => {
            req.compliant = true;
            renderRequirements();
            calculateCompliance();
            addConsoleLog(`[SUCCESS] Đã vá thành công Yêu cầu ${req.id}.`, "success");
            remediateNext();
        }, 300);
    }

    remediateNext();
});

// --- TAB SWITCHING LOGIC ---
function initTabs() {
    dom.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            // Toggle buttons
            dom.tabs.forEach(btn => btn.classList.remove('active'));
            tab.classList.add('active');

            // Toggle contents
            dom.tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetTab).classList.add('active');

            state.currentTab = targetTab;

            // Update Title Texts
            let title = '';
            let subtitle = '';

            if (targetTab === 'tab-dashboard') {
                title = 'Bảng Điều Khiển Tuân Thủ PCI DSS v4.0';
                subtitle = 'Giám sát hiện trạng khoảng cách bảo mật và quản lý khắc phục hệ thống NTDPay';
            } else if (targetTab === 'tab-simulator') {
                title = 'Mô Phỏng Luồng Giao Dịch Thẻ';
                subtitle = 'Thực hiện thanh toán giả định và phân tích luồng truyền dữ liệu qua CDE';
            } else if (targetTab === 'tab-network') {
                title = 'Sơ Đồ Kiến Trúc Mạng CDE';
                subtitle = 'Hệ thống ranh giới bảo mật mạng CDE tại AWS Cloud và Viettel IDC';
            } else if (targetTab === 'tab-scanner') {
                title = 'Quét Lỗ Hổng & Kiểm Thử Phòng Thủ';
                subtitle = 'Dò quét các mã số lỗi CVE và giả lập các cuộc tấn công mạng an ninh vào NTDPay';
            } else if (targetTab === 'tab-saq') {
                title = 'Tự Đánh Giá Tuân Thủ SAQ';
                subtitle = 'Xác định loại báo cáo tự đánh giá SAQ phù hợp và điền bảng hỏi kiểm toán';
            } else if (targetTab === 'tab-policies') {
                title = 'Thư Viện Chính Sách Bảo Mật';
                subtitle = 'Hệ thống quy trình và tài liệu quy chuẩn an toàn thông tin của NTDPay';
            } else if (targetTab === 'tab-report') {
                title = 'Báo Cáo Đánh Giá Khoảng Cách PCI DSS';
                subtitle = 'Báo cáo chi tiết hiện trạng, rủi ro và lộ trình tuân thủ PCI DSS v4.0.1 của NTDPay';
            }

            document.getElementById('page-title-text').innerText = title;
            document.getElementById('page-subtitle-text').innerText = subtitle;
        });
    });
}

// --- SIMULATOR MODE TOGGLE ---
function toggleSimulationMode(mode, updateRequirements = true) {
    state.simulationMode = mode;

    if (mode === 'compliant') {
        dom.btnModeCompliant.classList.add('active');
        dom.btnModeNoncompliant.classList.remove('active');

        if (updateRequirements) {
            state.requirements.forEach(r => r.compliant = true);
            renderRequirements();
            calculateCompliance();
        }

        // Secure all SVG nodes visually
        document.querySelectorAll('.critical-node').forEach(node => node.classList.add('secured'));
    } else {
        dom.btnModeNoncompliant.classList.add('active');
        dom.btnModeCompliant.classList.remove('active');

        if (updateRequirements) {
            const gapIds = [1, 2, 3, 4, 6, 7, 8, 10];
            state.requirements.forEach(r => {
                if (gapIds.includes(r.id)) r.compliant = false;
            });
            renderRequirements();
            calculateCompliance();
        }

        // Remove Secure class from SVG nodes
        document.querySelectorAll('.critical-node').forEach(node => node.classList.remove('secured'));
    }

    // Update Warnings Panel
    updateSecurityWarningsPanel();

    // Update node details panel if one is selected
    const activeNodeElement = document.querySelector('.net-node.selected-node');
    if (activeNodeElement) {
        showNodeDetails(activeNodeElement.getAttribute('data-node'));
    }
}

function updateSecurityWarningsPanel() {
    if (!dom.securityWarningsContent) return;

    if (state.simulationMode === 'noncompliant') {
        if (dom.securityWarningsPanel) dom.securityWarningsPanel.classList.remove('secure-panel');
        dom.securityWarningsContent.innerHTML = `
            <div class="alert-banner alert-danger">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>PHÁT HIỆN 5 LỖ HỔNG NGUY HẠI (GAPS)</span>
            </div>
            <ul class="threat-list">
                <li>
                    <i class="fa-solid fa-circle-xmark icon-danger"></i>
                    <div>
                        <strong>Rò rỉ dữ liệu thẻ (PAN/CVV):</strong>
                        <span>Số thẻ thô và mã CVV bị ghi rõ trong Logs và Postgres CSDL.</span>
                    </div>
                </li>
                <li>
                    <i class="fa-solid fa-circle-xmark icon-danger"></i>
                    <div>
                        <strong>Mã hóa truyền tải yếu:</strong>
                        <span>AWS WAF/ALB chấp nhận bắt tay TLS 1.0/1.1 có thể bị nghe lén dữ liệu.</span>
                    </div>
                </li>
                <li>
                    <i class="fa-solid fa-circle-xmark icon-danger"></i>
                    <div>
                        <strong>Lộ khóa giải mã chính (DEK):</strong>
                        <span>Khóa giải mã thẻ để dạng thô trong config, chưa được đưa vào HSM bảo vệ.</span>
                    </div>
                </li>
                <li>
                    <i class="fa-solid fa-circle-xmark icon-danger"></i>
                    <div>
                        <strong>Thiếu xác thực hai lớp (MFA):</strong>
                        <span>Truy cập quản trị Bastion Host và VPN không yêu cầu MFA (OTP).</span>
                    </div>
                </li>
                <li>
                    <i class="fa-solid fa-circle-xmark icon-danger"></i>
                    <div>
                        <strong>Lỗ hổng Log4Shell (CVE-2021-44228):</strong>
                        <span>Thư viện Java Log4j v2.14.1 trên Core App cho phép hacker chiếm quyền điều khiển.</span>
                    </div>
                </li>
            </ul>
        `;
    } else {
        if (dom.securityWarningsPanel) dom.securityWarningsPanel.classList.add('secure-panel');
        dom.securityWarningsContent.innerHTML = `
            <div class="alert-banner alert-success">
                <i class="fa-solid fa-circle-check"></i>
                <span>ĐẠT CHỨNG NHẬN PCI DSS V4.0 LEVEL 1</span>
            </div>
            <ul class="threat-list">
                <li>
                    <i class="fa-solid fa-circle-check icon-success"></i>
                    <div>
                        <strong>Mã hóa HSM & Token hóa:</strong>
                        <span>Số thẻ PAN được chuyển thành Token qua HSM. Nhật ký Logs hoàn toàn sạch (scrubbed).</span>
                    </div>
                </li>
                <li>
                    <i class="fa-solid fa-circle-check icon-success"></i>
                    <div>
                        <strong>Truyền tải TLS 1.3 bảo mật:</strong>
                        <span>Đóng hoàn toàn TLS 1.0/1.1, chỉ cho phép các Cipher Suites bảo mật cao.</span>
                    </div>
                </li>
                <li>
                    <i class="fa-solid fa-circle-check icon-success"></i>
                    <div>
                        <strong>Bảo vệ khóa trong HSM vật lý:</strong>
                        <span>Khóa giải mã lưu an toàn trong Thales HSM, mã hóa lớp DB.</span>
                    </div>
                </li>
                <li>
                    <i class="fa-solid fa-circle-check icon-success"></i>
                    <div>
                        <strong>MFA OTP Google Authenticator:</strong>
                        <span>Truy cập VPN và Bastion bắt buộc xác thực 2 lớp mã OTP.</span>
                    </div>
                </li>
                <li>
                    <i class="fa-solid fa-circle-check icon-success"></i>
                    <div>
                        <strong>Nâng cấp thư viện & Jenkins SAST:</strong>
                        <span>Đã vá Log4j lên bản 2.17.1 và tự động quét mã nguồn SonarQube CI/CD.</span>
                    </div>
                </li>
            </ul>
        `;
    }
}

dom.btnModeNoncompliant.addEventListener('click', () => toggleSimulationMode('noncompliant'));
dom.btnModeCompliant.addEventListener('click', () => toggleSimulationMode('compliant'));

// --- PAYMENT FORM REALTIME PREVIEW ---
dom.cardHolder.addEventListener('input', (e) => {
    let val = e.target.value.toUpperCase();
    e.target.value = val;
    dom.previewName.innerText = val || "NGUYEN VAN A";
});

dom.cardNumber.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    let formatted = '';

    for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += val[i];
    }

    e.target.value = formatted;
    dom.previewNumber.innerText = formatted || "•••• •••• •••• ••••";
});

dom.cardExpiry.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    e.target.value = val;
    dom.previewExpiry.innerText = val || "12/28";
});

// --- CONSOLE UTILITIES ---
function clearConsole() {
    dom.consoleLogs.innerHTML = '';
}

function addConsoleLog(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = 'log-line';

    let colorClass = 'log-info';
    if (type === 'success') colorClass = 'log-success';
    if (type === 'warning') colorClass = 'log-warning';
    if (type === 'danger') colorClass = 'log-danger';

    line.innerHTML = `<span class="log-time">[${time}]</span> <span class="${colorClass}">${message}</span>`;
    dom.consoleLogs.appendChild(line);
    dom.consoleLogs.scrollTop = dom.consoleLogs.scrollHeight;
}

// Console Tabs
dom.btnConsoleLogs.addEventListener('click', () => {
    dom.btnConsoleLogs.classList.add('active');
    dom.btnConsoleDb.classList.remove('active');
    dom.consoleLogs.classList.add('active');
    dom.consoleLogs.nextElementSibling.classList.remove('active');
});

dom.btnConsoleDb.addEventListener('click', () => {
    dom.btnConsoleDb.classList.add('active');
    dom.btnConsoleLogs.classList.remove('active');
    dom.consoleLogs.nextElementSibling.classList.add('active');
    dom.consoleLogs.classList.remove('active');
});

// --- FLOW ANIMATION PROCESS ---
let transactionCounter = 1;

function runPaymentSimulation() {
    const rawPan = dom.cardNumber.value.replace(/\s/g, '');
    const rawCvv = dom.cardCvv.value;
    const name = dom.cardHolder.value;
    const expiry = dom.cardExpiry.value;

    if (rawPan.length < 13 || rawCvv.length < 3 || name === '') {
        alert("Vui lòng nhập đầy đủ thông tin thẻ tín dụng hợp lệ!");
        return;
    }

    dom.btnSubmitPayment.disabled = true;
    dom.btnSubmitPayment.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> Đang kết nối CDE...`;

    clearConsole();
    addConsoleLog("[CLIENT] Đang khởi tạo mã hóa gói tin request thanh toán từ ứng dụng Khách hàng...", "info");

    // 1. Client to API Gateway
    const conn1 = document.getElementById('conn-client-apigw');
    const nodeClient = document.getElementById('node-client');
    const nodeApiGw = document.getElementById('node-apigw');

    nodeClient.className = 'flow-node active';
    nodeApiGw.className = 'flow-node';

    const dot = conn1.querySelector('.flow-dot');
    dot.style.animation = 'flow-right 0.8s forwards';

    setTimeout(() => {
        dot.style.animation = '';
        nodeClient.className = 'flow-node success';
        nodeApiGw.className = 'flow-node active';

        if (state.simulationMode === 'noncompliant') {
            addConsoleLog("[API GATEWAY] Tiếp nhận request. WARNING: Giao thức bắt tay sử dụng TLS 1.0 (Không an toàn!)", "warning");
        } else {
            addConsoleLog("[API GATEWAY] Xác thực gói tin thành công. TLS 1.3 bảo mật cao (ECDHE-RSA-AES256-GCM-SHA384).", "success");
        }

        // 2. API Gateway to Payment Core
        const conn2 = document.getElementById('conn-apigw-core');
        const nodeCore = document.getElementById('node-core');

        const dot2 = conn2.querySelector('.flow-dot');
        dot2.style.animation = 'flow-right 0.8s forwards';

        setTimeout(() => {
            dot2.style.animation = '';
            nodeApiGw.className = 'flow-node success';
            nodeCore.className = 'flow-node active';

            addConsoleLog("[PAYMENT CORE] Tiếp nhận thông tin thẻ vào vùng bộ nhớ RAM đệm an toàn.", "info");

            // Split: HSM and Database
            const connHsm = document.getElementById('conn-core-hsm');
            const connDb = document.getElementById('conn-core-db');
            const nodeHsm = document.getElementById('node-hsm');
            const nodeDb = document.getElementById('node-db');

            connHsm.classList.add('active');
            connDb.classList.add('active');

            const dotH = connHsm.querySelector('.flow-dot-hsm');
            const dotD = connDb.querySelector('.flow-dot-db');

            dotH.style.animation = 'flow-right 0.8s forwards';
            dotD.style.animation = 'flow-right 0.8s forwards';

            setTimeout(() => {
                dotH.style.animation = '';
                dotD.style.animation = '';
                nodeHsm.className = 'flow-node small active';
                nodeDb.className = 'flow-node small active';

                let dbPan = '';
                let dbCvv = '';
                let dbStatus = '';

                if (state.simulationMode === 'noncompliant') {
                    addConsoleLog("[HSM KEY] ERROR: Khóa giải mã DEK được tải từ file db-config.xml dạng Plaintext rõ!", "danger");
                    addConsoleLog(`[APPLICATION LOG] CRITICAL: Đã ghi nhận số thẻ rõ [${rawPan}] và CVV [${rawCvv}] vào tệp application.log!`, "danger");
                    addConsoleLog("[POSTGRES DB] Thực hiện ghi nhận thông tin giao dịch vào đĩa cứng (Plaintext)...", "info");

                    dbPan = rawPan;
                    dbCvv = rawCvv;
                    dbStatus = "RỦI RO: Plaintext";
                } else {
                    addConsoleLog("[HSM KEY] SUCCESS: HSM thực hiện mã hóa số thẻ và sinh Token ngẫu nhiên.", "success");
                    const maskedPan = rawPan.substring(0, 6) + "XXXXXX" + rawPan.substring(rawPan.length - 4);
                    addConsoleLog(`[APPLICATION LOG] SUCCESS: Ghi log giao dịch lỗi. PAN đã mask: [${maskedPan}], CVV omitted.`, "success");
                    addConsoleLog("[POSTGRES DB] Ghi nhận dữ liệu Token và thông tin giao dịch đã được mã hóa...", "success");

                    dbPan = rawPan.substring(0, 4) + " " + rawPan.substring(4, 6) + "XX XXXX " + rawPan.substring(rawPan.length - 4) + " (Token)";
                    dbCvv = "[OMITTED]";
                    dbStatus = "AN TOÀN: Tokenized (HSM)";
                }

                insertDbRecord(transactionCounter, name, dbPan, dbCvv, dbStatus);

                setTimeout(() => {
                    nodeHsm.className = 'flow-node small success';
                    nodeDb.className = 'flow-node small success';
                    nodeCore.className = 'flow-node success';

                    if (state.simulationMode === 'noncompliant') {
                        addConsoleLog(`[NAPAS] Giao dịch định tuyến thành công tới NAPAS. Giao dịch VNP-${transactionCounter} RỦI RO LỘ THÔNG TIN!`, "warning");
                    } else {
                        addConsoleLog(`[NAPAS] Định tuyến giao dịch thành công qua kênh truyền mã hóa. Giao dịch VNP-${transactionCounter} AN TOÀN!`, "success");
                    }

                    dom.btnSubmitPayment.disabled = false;
                    dom.btnSubmitPayment.innerHTML = `<i class="fa-solid fa-lock"></i> Thanh Toán Ngay (150,000 đ)`;
                    transactionCounter++;
                }, 1000);

            }, 800);

        }, 800);

    }, 800);
}

function insertDbRecord(id, name, pan, cvv, status) {
    const emptyRow = dom.dbTableBody.querySelector('td[colspan]');
    if (emptyRow) {
        dom.dbTableBody.innerHTML = '';
    }

    const row = document.createElement('tr');
    const time = new Date().toLocaleTimeString();
    const isSecure = state.simulationMode === 'compliant';

    row.innerHTML = `
        <td>VNP-00${id}</td>
        <td>${time}</td>
        <td>${name}</td>
        <td>${pan}</td>
        <td>${cvv}</td>
        <td style="color: ${isSecure ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: 600;">${status}</td>
    `;

    dom.dbTableBody.insertBefore(row, dom.dbTableBody.firstChild);
}

dom.btnSubmitPayment.addEventListener('click', runPaymentSimulation);

// --- INTERACTIVE NETWORK DIAGRAM MAP ---
function initNetworkMap() {
    dom.netNodes.forEach(node => {
        node.addEventListener('click', () => {
            dom.netNodes.forEach(n => n.classList.remove('selected-node'));
            node.classList.add('selected-node');

            const nodeId = node.getAttribute('data-node');
            showNodeDetails(nodeId);
        });
    });
}

function showNodeDetails(nodeId) {
    const asset = state.assets[nodeId];
    if (!asset) return;

    const isSecure = state.simulationMode === 'compliant';
    const securityRules = isSecure ? asset.securityCompliant : asset.securityNonCompliant;

    let rulesHtml = '';
    securityRules.forEach(rule => {
        const icon = isSecure ? 'fa-circle-check secure-rule' : 'fa-triangle-exclamation risk-rule';
        const itemClass = isSecure ? 'secure-rule' : 'risk-rule';
        rulesHtml += `
            <div class="sec-rule-item ${itemClass}">
                <i class="fa-solid ${icon}"></i>
                <span>${rule}</span>
            </div>
        `;
    });

    const statusBadge = isSecure
        ? `<span class="dot green" style="box-shadow: 0 0 6px var(--color-success)"></span> <span style="color: var(--color-success); font-weight: 600;">Tuân Thủ (Compliant)</span>`
        : `<span class="dot red" style="box-shadow: 0 0 6px var(--color-danger)"></span> <span style="color: var(--color-danger); font-weight: 600;">Chưa Tuân Thủ (Gap)</span>`;

    dom.nodeDetailsPanel.innerHTML = `
        <div class="node-detail-header">
            <div class="node-detail-icon"><i class="${getNodeIcon(nodeId)}"></i></div>
            <div class="node-detail-title">
                <h4>${asset.name}</h4>
                <span>IP: ${asset.ip}</span>
            </div>
        </div>
        
        <div class="node-meta-grid">
            <div class="meta-row">
                <span class="label">Hệ điều hành:</span>
                <span class="val">${asset.os}</span>
            </div>
            <div class="meta-row">
                <span class="label">Mục đích:</span>
                <span class="val" style="text-align: right; max-width: 65%;">${asset.purpose}</span>
            </div>
            <div class="meta-row">
                <span class="label">Phạm vi PCI:</span>
                <span class="val">${asset.scope}</span>
            </div>
            <div class="meta-row">
                <span class="label">Trạng thái an ninh:</span>
                <span class="val">${statusBadge}</span>
            </div>
        </div>
        
        <div class="node-security-status">
            <h5>Phân Tích Cấu HÌnh Chi Tiết</h5>
            ${rulesHtml}
        </div>
    `;

    // Append direct remediation shortcut button for vulnerable CDE devices
    if (typeof nodeRequirementMap !== 'undefined') {
        const reqId = nodeRequirementMap[nodeId];
        if (reqId) {
            const req = state.requirements.find(r => r.id === reqId);
            if (req && !req.compliant) {
                dom.nodeDetailsPanel.innerHTML += `
                    <button class="btn btn-danger btn-block mt-15" onclick="remediateRequirement(${reqId})" style="animation: pulse-red-border-saq 2s infinite;">
                        <i class="fa-solid fa-wrench animate-spin"></i> Vá lỗi thiết bị này
                    </button>
                `;
            }
        }
    }
}

function getNodeIcon(nodeId) {
    switch (nodeId) {
        case 'user': return 'fa-solid fa-laptop';
        case 'admin': return 'fa-solid fa-user-shield';
        case 'waf': return 'fa-solid fa-shield-halved';
        case 'web': return 'fa-solid fa-server';
        case 'apigw': return 'fa-solid fa-gears';
        case 'napas': return 'fa-solid fa-building-columns';
        case 'cde-fw': return 'fa-solid fa-shield';
        case 'core': return 'fa-solid fa-microchip';
        case 'hsm': return 'fa-solid fa-key';
        case 'db': return 'fa-solid fa-database';
        case 'bastion': return 'fa-solid fa-door-open';
        case 'ad': return 'fa-solid fa-users-gear';
        case 'siem': return 'fa-solid fa-magnifying-glass-chart';
        case 'backup': return 'fa-solid fa-hard-drive';
        default: return 'fa-solid fa-server';
    }
}

// --- CONFIG & SCAN LOGIC ---
const VULNERABILITIES = [
    {
        cve: "CVE-2021-44228",
        title: "Lỗ hổng Log4Shell (Apache Log4j)",
        desc: "Thực thi mã từ xa (RCE) thông qua log, điểm CVSS 10.0.",
        reqId: 6,
        ip: "172.16.4.50 (Payment Core)"
    },
    {
        cve: "CVE-2023-35122",
        title: "Giao thức truyền tải yếu (TLS 1.0/1.1 Active)",
        desc: "Lưu lượng truyền dữ liệu qua WAF/API Gateway có thể bị giải mã nghe lén.",
        reqId: 4,
        ip: "10.0.1.15 (API Gateway)"
    },
    {
        cve: "CVE-2022-29155",
        title: "Lưu cấu hình Plaintext khóa chính (DEK)",
        desc: "Khóa DEK lưu dạng rõ trong xml giúp hacker chiếm quyền DB có thể giải mã toàn bộ dữ liệu thẻ.",
        reqId: 3,
        ip: "172.16.4.50 (Payment Core)"
    },
    {
        cve: "CVE-2022-42889",
        title: "Lạm dụng quyền DB tối cao (SUPERUSER)",
        desc: "Tài khoản DB của app có quyền SUPERUSER, tăng nguy cơ leo thang đặc quyền khi bị SQL Injection.",
        reqId: 7,
        ip: "172.16.4.60 (PostgreSQL DB)"
    },
    {
        cve: "CVE-2023-22809",
        title: "Quy tắc tường lửa lỏng lẻo (Palo Alto NGFW)",
        desc: "Cho phép Dev Zone truy cập vô điều kiện (ANY port) vào vùng DB Zone.",
        reqId: 1,
        ip: "172.16.4.1 (Palo Alto NGFW)"
    },
    {
        cve: "CVE-2023-32409",
        title: "Thiếu xác thực đa yếu tố (MFA Disabled)",
        desc: "Kết nối quản trị Bastion Host và VPN chỉ yêu cầu mật khẩu tĩnh, dễ bị brute-force.",
        reqId: 8,
        ip: "172.16.1.10 (Bastion Host)"
    },
    {
        cve: "CVE-2023-28685",
        title: "Cấu hình Default Credentials",
        desc: "Switch nội bộ sử dụng mật khẩu mặc định (admin/admin).",
        reqId: 2,
        ip: "192.168.45.1 (Switch)"
    },
    {
        cve: "CVE-2023-38545",
        title: "Không giới hạn logs và giám sát tập trung",
        desc: "Logs chỉ lưu trữ 3 tháng và chưa gửi logs AD/Firewall về SIEM.",
        reqId: 10,
        ip: "172.16.1.20 (Wazuh SIEM)"
    }
];

state.isScanning = false;

function runSecurityScan() {
    if (state.isScanning) return;

    state.isScanning = true;
    dom.btnStartScan.disabled = true;
    dom.btnStartScan.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Đang quét...`;

    dom.scanProgressArea.style.display = 'block';
    dom.scanProgressBar.style.width = '0%';
    dom.scanProgressBar.innerText = '0%';
    dom.scanStatusText.innerText = 'Bắt đầu khởi động quét an ninh NTDPay CDE...';

    let progress = 0;
    const scanSteps = [
        { limit: 15, text: "Đang quét ranh giới mạng CDE (AWS DMZ Subnets)..." },
        { limit: 35, text: "Đang rà soát quy tắc Firewall Palo Alto (172.16.4.1)..." },
        { limit: 55, text: "Đang kiểm tra chứng chỉ SSL/TLS trên API Gateway..." },
        { limit: 75, text: "Đang kiểm toán mã nguồn & phiên bản thư viện Java Core App..." },
        { limit: 90, text: "Đang dò mật khẩu mặc định & xác thực MFA trên AD/VPN..." },
        { limit: 100, text: "Tổng hợp kết quả quét an ninh..." }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 5) + 3;
        if (progress > 100) progress = 100;

        dom.scanProgressBar.style.width = `${progress}%`;
        dom.scanProgressBar.innerText = `${progress}%`;

        if (stepIdx < scanSteps.length && progress >= scanSteps[stepIdx].limit) {
            dom.scanStatusText.innerText = scanSteps[stepIdx].text;
            stepIdx++;
        }

        if (progress === 100) {
            clearInterval(interval);
            state.isScanning = false;
            dom.btnStartScan.disabled = false;
            dom.btnStartScan.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> Quét Lại Hệ Thống`;
            renderScanReport();
        }
    }, 150);
}

function renderScanReport() {
    dom.scanReportContainer.innerHTML = '';

    // Check which vulnerabilities are active
    const activeVuls = VULNERABILITIES.map(vul => {
        const req = state.requirements.find(r => r.id === vul.reqId);
        return {
            ...vul,
            patched: req ? req.compliant : true
        };
    });

    const totalVuls = activeVuls.length;
    const patchedCount = activeVuls.filter(v => v.patched).length;
    const activeCount = totalVuls - patchedCount;

    const header = document.createElement('div');
    header.className = 'scan-report-header mb-15';
    header.innerHTML = `
        <h4 style="font-family: var(--font-heading); margin-bottom: 5px;">KẾT QUẢ QUÉT AN NINH</h4>
        <div style="display: flex; gap: 15px; font-size: 11px;">
            <span class="text-danger" style="font-weight: 700;">${activeCount} LỖ HỔNG HOẠT ĐỘNG</span>
            <span class="text-success" style="font-weight: 700;">${patchedCount} ĐÃ ĐƯỢC VÁ</span>
        </div>
    `;
    dom.scanReportContainer.appendChild(header);

    if (activeCount === 0) {
        const cleanMessage = document.createElement('div');
        cleanMessage.className = 'text-center py-20';
        cleanMessage.innerHTML = `
            <i class="fa-solid fa-circle-check" style="font-size: 44px; color: var(--color-success); margin-bottom: 15px; display: block;"></i>
            <strong style="color: var(--color-success); display: block; font-size: 13px;">HỆ THỐNG HOÀN TOÀN SẠCH & AN TOÀN</strong>
            <p class="text-muted mt-5" style="font-size: 11px;">Không tìm thấy bất kỳ CVE lỗ hổng nào hoạt động. NTDPay đáp ứng 100% tiêu chuẩn PCI DSS v4.0.1</p>
        `;
        dom.scanReportContainer.appendChild(cleanMessage);
        return;
    }

    activeVuls.forEach(vul => {
        const item = document.createElement('div');
        item.className = `cve-item ${vul.patched ? 'patched' : ''}`;
        item.innerHTML = `
            <div class="cve-left">
                <span class="cve-badge">${vul.cve}</span>
                <span class="cve-title">${vul.title}</span>
                <span class="cve-desc">${vul.desc}</span>
                <span class="text-muted" style="font-size: 9px; margin-top: 2px;">Thiết bị: ${vul.ip}</span>
            </div>
            <div class="cve-status">${vul.patched ? 'Đã Vá' : 'Nguy Hiểm'}</div>
        `;
        dom.scanReportContainer.appendChild(item);
    });
}

// Attack Simulation Actions
window.runAttack = function (attackType) {
    const isCompliant = state.simulationMode === 'compliant';
    const breachModal = document.getElementById('breach-modal');
    const defenseToast = document.getElementById('defense-toast');

    // Expose logs
    dom.tabs.forEach(btn => {
        if (btn.getAttribute('data-tab') === 'tab-simulator') {
            btn.click();
        }
    });
    dom.btnConsoleLogs.click();
    clearConsole();
    addConsoleLog(`[WARNING] Kích hoạt giả lập tấn công an ninh mạng: [${attackType.toUpperCase()}]...`, "warning");

    setTimeout(() => {
        if (attackType === 'sql') {
            if (!isCompliant) {
                addConsoleLog("[EXPLOIT] Phát hiện payload SQL Injection lách qua API Gateway thành công...", "danger");
                addConsoleLog("[EXPLOIT] SQLi Payload: 'SELECT * FROM cardholders UNION SELECT PAN, CVV FROM secret_data'...", "danger");
                addConsoleLog("[DATABASE] DB Server phản hồi truy vấn. Rò rỉ dữ liệu bảng cardholder...", "danger");

                document.getElementById('breach-modal-attack-type').innerText = "SQL Injection (SQLi) - DB Data Extraction";
                document.getElementById('breach-modal-damage').innerText = "Rò rỉ và đánh cắp 10,000 số thẻ tín dụng rõ (Plaintext PAN & CVV2) từ CSDL PostgreSQL!";
                document.getElementById('breach-modal-cause').innerText = "Tài khoản DB 'pay_user' chạy quyền SUPERUSER (Yêu cầu 7), số thẻ PAN/CVV lưu rõ trong DB không mã hóa (Yêu cầu 3).";
                document.getElementById('breach-modal-fix').innerText = "Hạ quyền tài khoản DB xuống tối thiểu, cất khóa giải mã vào HSM và kích hoạt mã hóa cột DB.";

                breachModal.style.display = 'flex';
            } else {
                addConsoleLog("[DEFENSE] AWS WAF phát hiện ký tự SQLi nguy hại: 'UNION SELECT'...", "success");
                addConsoleLog("[DEFENSE] Tự động chặn IP nguồn. Phản hồi lỗi HTTP 403 Forbidden...", "success");

                document.getElementById('defense-toast-text').innerText = "AWS WAF đã phát hiện payload SQLi độc hại và lập tức chặn địa chỉ IP nguồn (HTTP 403 Forbidden).";
                defenseToast.classList.add('active');
                setTimeout(() => defenseToast.classList.remove('active'), 5000);
            }
        } else if (attackType === 'log4j') {
            if (!isCompliant) {
                addConsoleLog("[EXPLOIT] Gửi payload JNDI LDAP độc hại vào HTTP User-Agent header...", "danger");
                addConsoleLog("[EXPLOIT] Core app ghi log payload, kích hoạt kết nối ngược về máy chủ hacker...", "danger");
                addConsoleLog("[EXPLOIT] Thiết lập kết nối Reverse Shell thành công! Hacker lấy được quyền Root...", "danger");

                document.getElementById('breach-modal-attack-type').innerText = "Log4Shell Exploitation (CVE-2021-44228)";
                document.getElementById('breach-modal-damage').innerText = "Hacker thực thi mã từ xa (RCE), chiếm quyền điều khiển (Root Shell) máy chủ Core Application!";
                document.getElementById('breach-modal-cause').innerText = "Ứng dụng Java Core Payment sử dụng thư viện Log4j v2.14.1 có lỗ hổng nghiêm trọng chưa vá (Yêu cầu 6).";
                document.getElementById('breach-modal-fix').innerText = "Nâng cấp Log4j lên phiên bản bảo mật >= 2.17.1 và kích hoạt quét SonarQube tự động trong Jenkins pipeline.";

                breachModal.style.display = 'flex';
            } else {
                addConsoleLog("[DEFENSE] Core app kiểm tra thư viện Log4j v2.17.1 (Đã vá lỗi)...", "success");
                addConsoleLog("[DEFENSE] Bỏ qua JNDI LDAP lookup. Payload bị xử lý như chuỗi string an toàn...", "success");

                document.getElementById('defense-toast-text').innerText = "Wazuh SIEM/EDR đã phát hiện và chặn đứng nỗ lực kết nối shell ngược (Reverse Shell) của payload Log4j.";
                defenseToast.classList.add('active');
                setTimeout(() => defenseToast.classList.remove('active'), 5000);
            }
        } else if (attackType === 'mitm') {
            if (!isCompliant) {
                addConsoleLog("[EXPLOIT] Hacker cấu hình máy ảo bắt gói tin (Sniffing) tại đường truyền public...", "danger");
                addConsoleLog("[EXPLOIT] Bắt gói tin HTTPS sử dụng TLS 1.0 bắt tay yếu...", "danger");
                addConsoleLog("[EXPLOIT] Phân tích và bóc tách dữ liệu thẻ PAN/CVV dạng thô truyền trên đường truyền...", "danger");

                document.getElementById('breach-modal-attack-type').innerText = "Man-in-the-Middle (MITM) Packet Sniffing";
                document.getElementById('breach-modal-damage').innerText = "Nghe lén và thu thập toàn bộ dữ liệu thẻ thô truyền tải trên mạng công cộng của khách hàng!";
                document.getElementById('breach-modal-cause').innerText = "API Gateway chấp nhận kết nối TLS 1.0/1.1 và các cipher suite yếu (Yêu cầu 4).";
                document.getElementById('breach-modal-fix').innerText = "Cấu hình Nginx chỉ chấp nhận TLS 1.2 và 1.3, loại bỏ hoàn toàn các giao thức cũ không an toàn.";

                breachModal.style.display = 'flex';
            } else {
                addConsoleLog("[DEFENSE] Khách hàng bắt tay bảo mật qua giao thức TLS 1.3...", "success");
                addConsoleLog("[DEFENSE] Mã hóa TLS 1.3 Perfect Forward Secrecy hoạt động. Bắt gói tin thất bại...", "success");

                document.getElementById('defense-toast-text').innerText = "Mọi gói tin truyền dữ liệu đều được mã hóa bắt buộc qua TLS 1.3 bảo mật, hacker chỉ thu được dữ liệu rác vô nghĩa.";
                defenseToast.classList.add('active');
                setTimeout(() => defenseToast.classList.remove('active'), 5000);
            }
        } else if (attackType === 'brute') {
            if (!isCompliant) {
                addConsoleLog("[EXPLOIT] Hacker thực hiện quét IP VPN/Bastion Host (172.16.1.10)...", "danger");
                addConsoleLog("[EXPLOIT] Chạy từ điển mật khẩu brute-force SSH. Phát hiện password AD yếu (123456aA)...", "danger");
                addConsoleLog("[EXPLOIT] Đăng nhập SSH thành công! Không có lớp xác thực MFA cản trở...", "danger");

                document.getElementById('breach-modal-attack-type').innerText = "SSH Brute-Force on Bastion Host";
                document.getElementById('breach-modal-damage').innerText = "Hacker dò ra mật khẩu quản trị viên, đăng nhập thành công vào Bastion Host và truy cập vùng CDE!";
                document.getElementById('breach-modal-cause').innerText = "Bastion Host và VPN không bật xác thực đa yếu tố (MFA - Yêu cầu 8), chính sách mật khẩu AD GPO lỏng lẻo chỉ dài 8 ký tự.";
                document.getElementById('breach-modal-fix').innerText = "Bật MFA Google Authenticator cho VPN/Bastion và tăng độ dài mật khẩu AD GPO tối thiểu lên 12 ký tự.";

                breachModal.style.display = 'flex';
            } else {
                addConsoleLog("[DEFENSE] Phát hiện 5 lần đăng nhập sai liên tiếp SSH từ cùng IP nguồn...", "success");
                addConsoleLog("[DEFENSE] Bắt buộc nhập mã OTP Google Authenticator MFA. Tự động khóa IP tạm thời...", "success");

                document.getElementById('defense-toast-text').innerText = "Hệ thống yêu cầu xác thực OTP 6 số (MFA). Nỗ lực dò quét mật khẩu SSH hoàn toàn thất bại và bị khóa IP tạm thời.";
                defenseToast.classList.add('active');
                setTimeout(() => defenseToast.classList.remove('active'), 5000);
            }
        }
    }, 1200);
};

window.closeBreachModal = function () {
    document.getElementById('breach-modal').style.display = 'none';
};

window.closeDefenseToast = function () {
    document.getElementById('defense-toast').classList.remove('active');
};

// --- INITIALIZE APPLICATION ---
function init() {
    initProgressRing();
    initTabs();
    calculateCompliance();
    renderRequirements();
    initNetworkMap();
    updateSecurityWarningsPanel();

    // New tab features init
    initPolicyLibrary();
    initReportLibrary();
    initSaqSelector();
    initSocMonitor();
    updateNetworkThreatStatus();

    // Scanner Events
    if (dom.btnStartScan) {
        dom.btnStartScan.addEventListener('click', runSecurityScan);
    }

    // Print Report Event
    if (dom.btnPrintReport) {
        dom.btnPrintReport.addEventListener('click', () => {
            window.print();
        });
    }
}

// --- NEW PORTAL DATABASES (SAQ & POLICIES) ---
const POLICIES = [
    {
        id: 1,
        title: "Chính Sách Quản Lý Khóa Mật Mã",
        code: "DP-SEC-POL-03",
        version: "1.0",
        icon: "fa-solid fa-key",
        content: `
            <h1>Chính Sách Quản Lý Khóa Mật Mã & Mã Hóa Dữ Liệu</h1>
            <p><strong>Mã tài liệu:</strong> DP-SEC-POL-03 | <strong>Phiên bản:</strong> 1.0 | <strong>Hiệu lực:</strong> 10/06/2026</p>
            <hr style="border: 0; border-top: 1px solid var(--border-glass); margin: 15px 0;">
            <h2>1. Mục đích</h2>
            <p>Chính sách này quy định các nguyên tắc quản lý khóa mật mã (khóa chính, khóa mã hóa dữ liệu) nhằm bảo vệ thông tin thẻ tín dụng (PAN) lưu trữ tĩnh trên hệ thống NTDPay đáp ứng Yêu cầu 3 của tiêu chuẩn PCI DSS v4.0.</p>
            <h2>2. Phạm vi áp dụng</h2>
            <p>Áp dụng cho toàn bộ thiết bị HSM, máy chủ Core Payment, CSDL PostgreSQL và các nhân sự quản trị khóa (Custodians) tại NTDPay.</p>
            <h2>3. Nội dung quy định</h2>
            <h3>3.1. Phân tầng khóa mật mã (Key Hierarchy)</h3>
            <ul>
                <li><strong>LSK (Local Storage Key):</strong> Khóa cục bộ được lưu trong phân vùng bảo mật của thiết bị HSM vật lý (Thales PayShield).</li>
                <li><strong>KEK (Key Encrypting Key):</strong> Khóa dùng để mã hóa và bảo vệ các khóa làm việc (Working Keys) hoặc khóa DEK. KEK được lưu trữ và quản lý hoàn toàn bên trong HSM.</li>
                <li><strong>DEK (Data Encrypting Key):</strong> Khóa trực tiếp mã hóa số thẻ PAN sử dụng thuật toán mã hóa AES-256-GCM. DEK được lưu trong DB PostgreSQL dưới dạng mã hóa bởi KEK.</li>
            </ul>
            <h3>3.2. Quản lý Custodians (Kiểm soát kép)</h3>
            <p>Mọi thao tác khởi tạo, xuất khóa, hoặc khôi phục khóa chính bắt buộc phải tuân theo nguyên tắc <strong>Dual Control (Kiểm soát kép)</strong> và <strong>Split Knowledge (Chia sẻ tri thức)</strong>:</p>
            <ul>
                <li>Tối thiểu phải có 02 người giữ khóa (Custodians) từ các phòng ban độc lập đồng thời xác thực qua Smartcard vật lý và mật khẩu độc lập để mở khóa mật mã HSM.</li>
                <li>Không một cá nhân nào được phép sở hữu toàn bộ khóa chính hoặc mật khẩu giải mật HSM.</li>
            </ul>
            <div class="policy-note">
                <strong>Lưu ý kiểm toán:</strong> Biên bản bàn giao khóa mật mã và kiểm kê khóa phải được lưu trữ tối thiểu 1 năm để phục vụ đánh giá QSA Audit hàng năm.
            </div>
        `
    },
    {
        id: 2,
        title: "Chính Sách Kiểm Sách Truy Cập & MFA",
        code: "DP-SEC-POL-08",
        version: "1.0",
        icon: "fa-solid fa-user-shield",
        content: `
            <h1>Chính Sách Kiểm Soát Truy Cập & Xác Thực Đa Yếu Tố (MFA)</h1>
            <p><strong>Mã tài liệu:</strong> DP-SEC-POL-08 | <strong>Phiên bản:</strong> 1.0 | <strong>Hiệu lực:</strong> 10/06/2026</p>
            <hr style="border: 0; border-top: 1px solid var(--border-glass); margin: 15px 0;">
            <h2>1. Nguyên tắc chung</h2>
            <p>NTDPay áp dụng nguyên tắc <strong>"Least Privilege" (Đặc quyền tối thiểu)</strong> và <strong>"Need-to-Know" (Cần biết mới cung cấp)</strong> đối với tất cả tài khoản truy cập vào Môi trường dữ liệu chủ thẻ (CDE) đáp ứng Yêu cầu 7 và Yêu cầu 8 của PCI DSS.</p>
            <h2>2. Quy định kỹ thuật</h2>
            <h3>2.1. Xác thực đa yếu tố (MFA) bắt buộc</h3>
            <ul>
                <li>Mọi kết nối quản trị từ xa (VPN SSL) của kỹ sư vào hệ thống mạng NTDPay bắt buộc phải xác thực lớp thứ hai bằng mã OTP biến động sinh ra từ Google Authenticator.</li>
                <li>Mọi phiên đăng nhập SSH/RDP vào máy chủ trong CDE qua Bastion Host bắt buộc xác thực qua SSH Key cá nhân kết hợp mã MFA cá nhân. Không sử dụng chung tài khoản quản trị (như shared-root or administrator).</li>
            </ul>
            <h3>2.2. Chính sách mật khẩu Active Directory (GPO)</h3>
            <ul>
                <li>Độ dài mật khẩu tối thiểu: 12 ký tự (bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt).</li>
                <li>Thời hạn thay đổi mật khẩu bắt buộc: Tối đa 90 ngày.</li>
                <li>Khóa tài khoản (Account Lockout): Tự động khóa tài khoản trong 30 phút sau 5 lần nhập sai mật khẩu liên tiếp.</li>
            </ul>
            <div class="policy-note">
                <strong>Quy định nghiêm ngặt:</strong> Cấm chia sẻ tài khoản SSH Key hoặc mật khẩu quản trị dưới mọi hình thức. Mọi hành vi vi phạm sẽ bị xử lý kỷ luật lao động mức cao nhất.
            </div>
        `
    },
    {
        id: 3,
        title: "Kế Hoạch Ứng Phó Sự Cố An Ninh",
        code: "DP-SEC-PLAN-12",
        version: "1.0",
        icon: "fa-solid fa-kit-medical",
        content: `
            <h1>Kế Hoạch Ứng Phó Sự Cố Bảo Mật & Rò Rỉ Dữ Liệu</h1>
            <p><strong>Mã tài liệu:</strong> DP-SEC-PLAN-12 | <strong>Phiên bản:</strong> 1.0 | <strong>Hiệu lực:</strong> 10/06/2026</p>
            <hr style="border: 0; border-top: 1px solid var(--border-glass); margin: 15px 0;">
            <h2>1. Mục tiêu</h2>
            <p>Đảm bảo phản ứng nhanh chóng, giảm thiểu tối đa thiệt hại khi phát hiện hành vi xâm nhập trái phép hoặc rò rỉ dữ liệu thẻ thanh toán (Data Breach) của NTDPay đáp ứng Yêu cầu 12.10 của PCI DSS v4.0.</p>
            <h2>2. Các bước phản ứng sự cố (IR Steps)</h2>
            <ol>
                <li><strong>Chuẩn bị (Preparation):</strong> Đội SOC liên tục trực giám sát 24/7 qua Wazuh SIEM, chuẩn bị các kịch bản ứng phó khẩn cấp và công cụ sao lưu.</li>
                <li><strong>Phát hiện & Xác minh (Detection & Identification):</strong> SOC phân tích log cảnh báo, xác định sự cố (Ví dụ: SQLi thành công hoặc Core App bị chiếm quyền RCE). Xác định phạm vi ảnh hưởng.</li>
                <li><strong>Ngăn chặn (Containment):</strong>
                    <ul>
                        <li>Lập tức cô lập mạng máy chủ bị tấn công bằng Palo Alto NGFW (chuyển sang VLAN cách ly).</li>
                        <li>Khóa tài khoản quản trị bị xâm nhập. Thu hồi tất cả phiên kết nối API tạm thời.</li>
                    </ul>
                </li>
                <li><strong>Khắc phục tận gốc (Eradication):</strong> Tiến hành vá lỗ hổng hệ thống (ví dụ: vá thư viện Log4j lên bản 2.17.1, hạ quyền db_user khỏi SUPERUSER, chặn IP tấn công).</li>
                <li><strong>Phục hồi (Recovery):</strong> Khôi phục dữ liệu sạch từ phân vùng Backup offline AES-256. Kiểm tra tính toàn vẹn hệ thống trước khi cho chạy lại dịch vụ.</li>
                <li><strong>Bài học kinh nghiệm (Lessons Learned):</strong> Họp rút kinh nghiệm, báo cáo cơ quan chức năng và tổ chức thẻ quốc tế (Visa/Mastercard/Napas) trong vòng 24 giờ kể từ khi phát hiện rò rỉ dữ liệu thẻ rõ.</li>
            </ol>
            <div class="policy-note">
                <strong>Đường dây nóng sự cố:</strong> Khi phát hiện rò rỉ thông tin thẻ, nhân viên lập tức liên hệ đội ứng cứu khẩn cấp CERT qua số nội bộ 911 hoặc email cert@NTDPay.vn.
            </div>
        `
    },
    {
        id: 4,
        title: "Chính Sách Phân Tách Mạng CDE",
        code: "DP-SEC-POL-01",
        version: "1.0",
        icon: "fa-solid fa-network-wired",
        content: `
            <h1>Chính Sách Phân Tách Mạng & Bảo Vệ Vùng CDE</h1>
            <p><strong>Mã tài liệu:</strong> DP-SEC-POL-01 | <strong>Phiên bản:</strong> 1.0 | <strong>Hiệu lực:</strong> 10/06/2026</p>
            <hr style="border: 0; border-top: 1px solid var(--border-glass); margin: 15px 0;">
            <h2>1. Mục đích</h2>
            <p>Thiết lập và quản lý ranh giới an toàn cho Môi trường dữ liệu chủ thẻ (CDE) của NTDPay, đảm bảo vùng CDE được cô lập hoàn toàn khỏi mạng nội bộ văn phòng và Internet, đáp ứng Yêu cầu 1 của PCI DSS.</p>
            <h2>2. Quy định phân tách mạng</h2>
            <h3>2.1. Phân vùng mạng (Network Segmentation)</h3>
            <ul>
                <li><strong>Vùng Công Cộng (Public Zone):</strong> Chỉ đặt AWS ALB tiếp nhận HTTPS. Mọi kết nối trực tiếp đến web server bị cấm.</li>
                <li><strong>Vùng AWS DMZ (Semi-Secure Subnet):</strong> Đặt API Gateway. Chỉ nhận dữ liệu từ ALB và chuyển tiếp qua kênh VPN IPsec mã hóa kép về Viettel DC CDE.</li>
                <li><strong>Vùng CDE Zone (Secure Subnet tại Viettel IDC):</strong> Chứa Core Payment và Database. Vùng này cô lập logic hoàn toàn. Cấm mọi kết nối trực tiếp từ Internet hoặc mạng văn phòng.</li>
                <li><strong>Vùng Quản Trị (Management Zone):</strong> Đặt AD, Bastion Host, SIEM. Chỉ kết nối tới CDE thông qua các cổng dịch vụ được cấu hình cụ thể trên Palo Alto NGFW.</li>
            </ul>
            <h3>2.2. Kiểm soát tường lửa biên (NGFW Rules)</h3>
            <ul>
                <li>Chính sách tường lửa mặc định chặn tất cả lưu lượng đi vào và đi ra (Default Deny).</li>
                <li>Chỉ cho phép kết nối cổng 5432 (Postgres) từ máy chủ Core App đến máy chủ Database.</li>
                <li>Cấm mọi rule cho phép dải IP Dev hoặc IP văn phòng kết nối trực tiếp vào Database CDE.</li>
                <li>Đánh giá rà soát luật tường lửa bắt buộc thực hiện tự động định kỳ 6 tháng/lần.</li>
            </ul>
            <div class="policy-note">
                <strong>Bắt buộc rà quét segmentation:</strong> Kiểm thử phân tách mạng (Segmentation Proof Testing) phải được thực hiện tối thiểu 6 tháng/lần và sau mọi thay đổi cấu hình mạng lớn để đảm bảo ranh giới bảo mật không bị rò rỉ.
            </div>
        `
    }
];

// SAQ_QUESTIONS removed

const POTENTIAL_ALERTS_DANGER = [
    { rule: "100201", level: 12, desc: "Phát hiện payload SQL Injection 'UNION SELECT' trên API Gateway", host: "10.0.1.15 (API Gateway)", status: "Alerted" },
    { rule: "100315", level: 15, desc: "Khai thác thành công Log4Shell RCE. Reverse Shell established", host: "172.16.4.50 (Payment Core)", status: "Alerted" },
    { rule: "100802", level: 10, desc: "SSH brute-force login: Đăng nhập sai 15 lần liên tiếp từ IP lạ", host: "172.16.1.10 (Bastion Host)", status: "Alerted" },
    { rule: "100344", level: 11, desc: "Phát hiện số thẻ rõ (PAN) ghi vào tệp logs thô tại Core payment", host: "172.16.4.50 (Payment Core)", status: "Alerted" },
    { rule: "100780", level: 12, desc: "Tài khoản DB 'pay_user' SUPERUSER thực thi lệnh TRUNCATE thẻ", host: "172.16.4.60 (PostgreSQL DB)", status: "Alerted" },
    { rule: "100411", level: 8, desc: "Cảnh báo gói tin HTTPS giải mã thành công qua bắt tay TLS 1.0", host: "52.74.12.98 (AWS ALB)", status: "Alerted" },
    { rule: "100109", level: 9, desc: "Tường lửa Palo Alto: Cho phép gói tin ANY cổng vào CDE Database", host: "172.16.4.1 (Palo Alto NGFW)", status: "Alerted" },
    { rule: "100550", level: 13, desc: "[FIM Req 11.5] Thay đổi trái phép phát hiện trên tệp cấu hình hệ thống: /etc/nginx/nginx.conf bởi user root", host: "10.0.1.10 (Web Server)", status: "Alerted" }
];

const POTENTIAL_ALERTS_SECURE = [
    { rule: "200201", level: 3, desc: "AWS WAF: Chặn đứng payload SQL Injection từ IP 198.51.100.45", host: "52.74.12.98 (AWS ALB)", status: "Blocked" },
    { rule: "200315", level: 2, desc: "Java VM: Bỏ qua payload JNDI LDAP lookup. An toàn.", host: "172.16.4.50 (Payment Core)", status: "Blocked" },
    { rule: "200802", level: 3, desc: "Bastion SSH: Yêu cầu Google Authenticator MFA. Login denied.", host: "172.16.1.10 (Bastion Host)", status: "Blocked" },
    { rule: "200344", level: 2, desc: "LogScrubberFilter: Làm sạch 1 dòng log. Masking PAN thành công.", host: "172.16.4.50 (Payment Core)", status: "Blocked" },
    { rule: "200780", level: 2, desc: "Postgres: Tài khoản pay_user bị từ chối quyền DROP TABLE.", host: "172.16.4.60 (PostgreSQL DB)", status: "Blocked" },
    { rule: "200411", level: 3, desc: "Nginx: Từ chối kết nối TLS 1.1. Bắt buộc TLS 1.3.", host: "10.0.1.15 (API Gateway)", status: "Blocked" },
    { rule: "200550", level: 2, desc: "[FIM Req 11.5] Wazuh Agent phát hiện sửa đổi tệp tin chính đáng bởi user admin: /etc/nginx/nginx.conf", host: "10.0.1.10 (Web Server)", status: "Blocked" }
];

const nodeRequirementMap = {
    'cde-fw': 1,
    'waf': 4,
    'apigw': 4,
    'core': 6,
    'db': 7,
    'bastion': 8,
    'admin': 8,
    'ad': 8,
    'siem': 10,
    'backup': 3
};

let activePolicyId = 1;

// --- LIVE SOC ALERTS SIMULATION ---
function initSocMonitor() {
    const socAlertsBody = document.getElementById('soc-alerts-body');
    const socMonitorHeader = document.querySelector('.soc-monitor-header');

    if (!socAlertsBody) return;

    setInterval(() => {
        const isCompliant = state.simulationMode === 'compliant';
        const sourcePool = isCompliant ? POTENTIAL_ALERTS_SECURE : POTENTIAL_ALERTS_DANGER;
        const randomAlert = sourcePool[Math.floor(Math.random() * sourcePool.length)];

        if (socMonitorHeader) {
            if (isCompliant) {
                socMonitorHeader.classList.add('secured');
            } else {
                socMonitorHeader.classList.remove('secured');
            }
        }

        const emptyRow = socAlertsBody.querySelector('td[colspan]');
        if (emptyRow) {
            socAlertsBody.innerHTML = '';
        }

        const time = new Date().toLocaleTimeString();
        const levelClass = randomAlert.level >= 10 ? 'critical' : (randomAlert.level >= 5 ? 'warning' : 'info');
        const statusClass = randomAlert.status === 'Blocked' ? 'blocked' : 'alerted';

        const row = document.createElement('tr');
        row.className = 'new-alert';
        row.innerHTML = `
            <td>${time}</td>
            <td>${randomAlert.rule}</td>
            <td><span class="soc-level-badge ${levelClass}">Level ${randomAlert.level}</span></td>
            <td>${randomAlert.desc}</td>
            <td>${randomAlert.host}</td>
            <td class="soc-status-txt ${statusClass}">${randomAlert.status}</td>
        `;

        socAlertsBody.insertBefore(row, socAlertsBody.firstChild);

        while (socAlertsBody.children.length > 7) {
            socAlertsBody.removeChild(socAlertsBody.lastChild);
        }

        setTimeout(() => {
            row.classList.remove('new-alert');
        }, 1500);

    }, 4000);
}

// --- NETWORK MAP THREAT GLOW UPDATE ---
function updateNetworkThreatStatus() {
    Object.keys(nodeRequirementMap).forEach(nodeId => {
        const reqId = nodeRequirementMap[nodeId];
        const req = state.requirements.find(r => r.id === reqId);
        const nodeElement = document.getElementById(`node-net-${nodeId}`);

        if (nodeElement) {
            if (req && !req.compliant) {
                nodeElement.classList.add('threat-active');
            } else {
                nodeElement.classList.remove('threat-active');
            }
        }
    });
}

// --- SAQ-D QUESTIONNAIRE HANDLERS ---
function updateSaqProgress(percent, compliantCount, total) {
    const aocContainer = document.getElementById('saq-aoc-container');

    if (aocContainer) {
        if (percent === 100) {
            const dateStr = new Date().toLocaleDateString('vi-VN');
            aocContainer.innerHTML = `
                <div class="aoc-cert-card">
                    <div class="aoc-cert-header">
                        <div class="aoc-cert-title"><i class="fa-solid fa-ribbon" style="color: #f1c40f; margin-right: 6px;"></i>Attestation of Compliance (AoC)</div>
                        <div class="aoc-cert-badge">PCI DSS v4.0.1</div>
                    </div>
                    <div class="aoc-cert-body">
                        <div class="aoc-cert-column">
                            <div>
                                <span class="aoc-cert-label">Đơn vị được đánh giá (Merchant):</span>
                                <div class="aoc-cert-value">Công ty Cổ phần Công nghệ Thanh toán Việt Nam (NTDPay)</div>
                            </div>
                            <div>
                                <span class="aoc-cert-label">Hạ tầng đánh giá:</span>
                                <div class="aoc-cert-value">Cổng thanh toán & Ví điện tử (CDE Subnets)</div>
                            </div>
                            <div>
                                <span class="aoc-cert-label">Ngày đánh giá & Cấp phát:</span>
                                <div class="aoc-cert-value">${dateStr}</div>
                            </div>
                        </div>
                        <div class="aoc-cert-column">
                            <div>
                                <span class="aoc-cert-label">Tổ chức đánh giá độc lập (QSA):</span>
                                <div class="aoc-cert-value">Antigravity Cyber Security Consulting</div>
                            </div>
                            <div>
                                <span class="aoc-cert-label">Trạng thái tuân thủ (Status):</span>
                                <div class="aoc-cert-value" style="color: var(--color-success);"><i class="fa-solid fa-circle-check"></i> ĐÃ TUÂN THỦ (COMPLIANT)</div>
                            </div>
                            <div>
                                <span class="aoc-cert-label">Chữ ký số QSA:</span>
                                <div class="aoc-cert-value" style="font-family: var(--font-mono); font-size: 9px; color: #a855f7;">[SIGNED_BY_ANTIGRAVITY_QSA_ID_2026]</div>
                            </div>
                        </div>
                    </div>
                    <div class="aoc-cert-stamp">
                        <i class="fa-solid fa-stamp"></i>
                        <span>APPROVED</span>
                        <span style="font-size: 6px; margin-top: 2px;">QSA AUDIT</span>
                    </div>
                </div>
            `;
        } else {
            aocContainer.innerHTML = `
                <div class="aoc-locked-card" style="background: rgba(239, 68, 68, 0.03); border: 1px dashed rgba(239, 68, 68, 0.25); border-radius: 10px; padding: 15px; display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 28px; color: var(--color-danger); filter: drop-shadow(0 0 5px rgba(239,68,68,0.3));"><i class="fa-solid fa-stamp"></i></div>
                    <div>
                        <h5 style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0;">Attestation of Compliance (AoC) chưa được mở khóa</h5>
                        <p style="font-size: 11px; line-height: 1.45; color: var(--text-secondary); margin: 0;">Hệ thống NTDPay hiện chưa đáp ứng 100% tuân thủ tiêu chuẩn PCI DSS. Hãy khắc phục tất cả khoảng cách bảo mật (Gaps) tại Bảng điều khiển chính hoặc chuyển đổi Chế độ mô phỏng sang "Đã tuân thủ" để mở khóa bản chứng nhận tuân thủ chính thức từ chuyên gia QSA.</p>
                    </div>
                </div>
            `;
        }
    }
}

// --- SECURITY POLICIES LIBRARY HANDLERS ---
function initPolicyLibrary() {
    const menuContainer = document.getElementById('policy-menu-container');
    const copyBtn = document.getElementById('btn-copy-policy');

    if (!menuContainer) return;

    menuContainer.innerHTML = '';
    POLICIES.forEach(p => {
        const btn = document.createElement('button');
        btn.className = `policy-menu-btn ${p.id === activePolicyId ? 'active' : ''}`;
        btn.id = `btn-policy-item-${p.id}`;
        btn.onclick = () => selectPolicy(p.id);
        btn.innerHTML = `
            <i class="${p.icon}"></i>
            <span>${p.title}</span>
        `;
        menuContainer.appendChild(btn);
    });

    loadActivePolicy();

    if (copyBtn) {
        copyBtn.onclick = () => {
            const docBody = document.getElementById('doc-body-content');
            if (docBody) {
                const textToCopy = docBody.innerText;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Đã sao chép!`;
                    copyBtn.className = "btn btn-success btn-sm";

                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                        copyBtn.className = "btn btn-primary btn-sm";
                    }, 2000);
                }).catch(err => {
                    console.error("Lỗi copy: ", err);
                    alert("Không thể sao chép văn bản tự động!");
                });
            }
        };
    }
}

function selectPolicy(policyId) {
    activePolicyId = policyId;

    document.querySelectorAll('.policy-menu-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-policy-item-${policyId}`);
    if (activeBtn) activeBtn.classList.add('active');

    loadActivePolicy();
}

function loadActivePolicy() {
    const policy = POLICIES.find(p => p.id === activePolicyId);
    const docTitle = document.getElementById('doc-title');
    const docMetadata = document.getElementById('doc-metadata');
    const docBodyContent = document.getElementById('doc-body-content');

    if (!policy || !docBodyContent) return;

    if (docTitle) docTitle.innerText = policy.title;
    if (docMetadata) docMetadata.innerText = `Mã tài liệu: ${policy.code} | Phiên bản: ${policy.version} | NTDPay Security standards`;

    docBodyContent.innerHTML = policy.content;
}

// --- SAQ TYPES & WIZARD SELECTOR LOGIC ---
const SAQ_TYPES_DATA = {
    'saq-a': {
        title: "SAQ A (Bản tự đánh giá A) - Thuê ngoài 100%",
        description: "Dành cho thương nhân kinh doanh qua E-commerce hoặc đặt hàng qua thư/điện thoại (Card-not-present), đã ủy quyền (outsource) hoàn toàn chức năng xử lý dữ liệu thẻ cho đơn vị cung cấp dịch vụ bên thứ ba được chứng nhận chuẩn PCI DSS.",
        complexity: "Dễ (Low)",
        controls: "24 Kiểm soát (Req 2, 8, 12)",
        criteria: [
            "Chỉ xử lý các giao dịch không xuất trình thẻ (Card-Not-Present).",
            "Mọi khâu xử lý dữ liệu thẻ được thuê ngoài hoàn toàn cho bên thứ ba đạt chuẩn PCI DSS.",
            "Không lưu trữ, xử lý hoặc truyền tải bất kỳ dữ liệu chủ thẻ nào trên hệ thống của mình.",
            "Trang thanh toán TMĐT hoàn toàn nằm ngoài máy chủ doanh nghiệp (chuyển hướng 100% hoặc dùng iFrame/Hosted Fields bảo mật)."
        ],
        auditReq: "Nộp bản tự đánh giá SAQ A và AoC (Attestation of Compliance) hàng năm cho ngân hàng thanh toán."
    },
    'saq-a-ep': {
        title: "SAQ A-EP (Bản tự đánh giá A-EP) - Web ảnh hưởng thanh toán",
        description: "Dành cho thương nhân kinh doanh qua E-commerce, thuê ngoài xử lý thanh toán, nhưng sở hữu website trực tiếp tạo ra form nhập liệu thẻ (Direct Post hoặc API) gửi thẳng dữ liệu thẻ về cổng thanh toán từ trình duyệt.",
        complexity: "Trung bình (Medium)",
        controls: "191 Kiểm soát (Req 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12)",
        criteria: [
            "Chỉ thực hiện thanh toán trực tuyến qua thương mại điện tử (E-commerce).",
            "Thuê ngoài xử lý dữ liệu thẻ cho đối tác thứ ba đạt chuẩn PCI DSS.",
            "Form nhập dữ liệu thẻ chạy trên website của doanh nghiệp nhưng dữ liệu truyền trực tiếp tới cổng thanh toán (không đi sâu qua server lưu trữ).",
            "Không lưu trữ dữ liệu thẻ dưới dạng điện tử tĩnh."
        ],
        auditReq: "Nộp bản tự đánh giá SAQ A-EP, AoC hàng năm và bắt buộc quét lỗ hổng mạng ASV hàng quý (ASV Scan Req 11.3.2)."
    },
    'saq-b': {
        title: "SAQ B (Bản tự đánh giá B) - Cà thẻ cơ học",
        description: "Dành cho cửa hàng vật lý chỉ sử dụng máy in dấu thẻ vật lý (imprint) hoặc các thiết bị POS độc lập kết nối qua đường điện thoại quay số (dial-out terminals).",
        complexity: "Dễ (Low)",
        controls: "41 Kiểm soát (Req 3, 4, 7, 9, 12)",
        criteria: [
            "Chỉ chấp nhận thanh toán trực tiếp tại quầy hoặc qua điện thoại.",
            "Chỉ dùng máy cà thẻ cơ học hoặc máy POS quay số không kết nối internet.",
            "Không lưu trữ dữ liệu thẻ điện tử tĩnh."
        ],
        auditReq: "Nộp bản tự đánh giá SAQ B và AoC hàng năm."
    },
    'saq-b-ip': {
        title: "SAQ B-IP (Bản tự đánh giá B-IP) - POS kết nối IP",
        description: "Dành cho thương nhân sử dụng thiết bị thanh toán POS standalone đã được chứng nhận đạt chuẩn PTS kết nối mạng Internet qua IP/Wi-Fi/Cellular.",
        complexity: "Trung bình thấp (Medium-Low)",
        controls: "82 Kiểm soát (Req 1, 2, 3, 4, 7, 8, 9, 11, 12)",
        criteria: [
            "Chỉ sử dụng thiết bị thanh toán POS kết nối mạng IP trực tiếp tới cổng thanh toán.",
            "Thiết bị POS không kết nối với bất kỳ hệ thống nào khác trong mạng nội bộ.",
            "Không lưu trữ dữ liệu thẻ điện tử tĩnh."
        ],
        auditReq: "Nộp bản tự đánh giá SAQ B-IP, AoC hàng năm."
    },
    'saq-c-vt': {
        title: "SAQ C-VT (Bản tự đánh giá C-VT) - Virtual Terminal",
        description: "Dành cho các doanh nghiệp nhập thủ công thông tin thẻ khách hàng từng giao dịch một vào cổng thanh toán thông qua trang quản trị (Virtual Terminal) bằng trình duyệt web.",
        complexity: "Trung bình thấp (Medium-Low)",
        controls: "84 Kiểm soát (Req 1, 2, 3, 7, 8, 9, 11, 12)",
        criteria: [
            "Chỉ nhập thủ công dữ liệu thẻ qua Virtual Terminal trên trình duyệt.",
            "Thiết bị nhập liệu không lưu trữ dữ liệu thẻ và không kết nối thiết bị quét thẻ.",
            "Không lưu trữ dữ liệu thẻ dưới dạng điện tử."
        ],
        auditReq: "Nộp bản tự đánh giá SAQ C-VT và AoC hàng năm."
    },
    'saq-c': {
        title: "SAQ C (Bản tự đánh giá C) - Ứng dụng thanh toán Internet",
        description: "Dành cho thương nhân có hệ thống ứng dụng thanh toán (như POS tích hợp máy tính bán hàng) kết nối Internet, không lưu trữ dữ liệu thẻ tĩnh điện tử.",
        complexity: "Trung bình cao (Medium-High)",
        controls: "160 Kiểm soát (Req 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)",
        criteria: [
            "Sử dụng phần mềm ứng dụng thanh toán cài đặt nội bộ kết nối Internet.",
            "Ứng dụng thanh toán không lưu trữ dữ liệu thẻ tĩnh.",
            "Không áp dụng cho e-commerce."
        ],
        auditReq: "Nộp bản tự đánh giá SAQ C, AoC hàng năm và quét lỗ hổng ASV hàng quý."
    },
    'saq-p2pe': {
        title: "SAQ P2PE (Bản tự đánh giá P2PE) - Giải pháp mã hóa P2PE chuẩn",
        description: "Dành cho các doanh nghiệp thanh toán tại quầy sử dụng các thiết bị thanh toán thuộc giải pháp Point-to-Point Encryption (P2PE) đã được phê duyệt và công nhận bởi hội đồng PCI SSC.",
        complexity: "Dễ (Low)",
        controls: "33 Kiểm soát (Req 3, 9, 12)",
        criteria: [
            "Sử dụng thiết bị phần cứng thuộc giải pháp P2PE được PCI SSC cấp phép.",
            "Không lưu trữ dữ liệu thẻ điện tử tĩnh."
        ],
        auditReq: "Nộp bản tự đánh giá SAQ P2PE và AoC hàng năm."
    },
    'saq-d-merchant': {
        title: "SAQ D Merchant (Doanh nghiệp mặc định) - Bản đầy đủ",
        description: "Bản tự đánh giá đầy đủ nhất dành cho mọi doanh nghiệp bán hàng (Merchants) không đáp ứng tiêu chuẩn của 8 loại SAQ trên. Ví dụ: Doanh nghiệp tự lưu trữ dữ liệu thẻ hoặc có kết nối API phức tạp từ server-to-server.",
        complexity: "Cao nhất (High)",
        controls: "329 Kiểm soát (Đầy đủ 12 yêu cầu PCI DSS)",
        criteria: [
            "Tự lưu trữ dữ liệu thẻ điện tử tĩnh (PAN, CVV, Exp Date).",
            "Tự xây dựng hạ tầng xử lý dữ liệu thẻ trực tiếp trên máy chủ.",
            "Hoặc không đáp ứng bất kỳ tiêu chuẩn rút gọn nào của các SAQ trên."
        ],
        auditReq: "Nộp bản tự đánh giá SAQ D Merchant hàng năm, quét lỗ hổng nội bộ/ASV ngoại vi hàng quý, và thực hiện Penetration Testing thường niên."
    },
    'saq-d-service': {
        title: "SAQ D Service Provider (Nhà cung cấp dịch vụ) - Bản đầy đủ",
        description: "Dành cho tất cả các nhà cung cấp dịch vụ (Service Providers) được định nghĩa bởi các tổ chức thẻ quốc tế (như cổng thanh toán, đơn vị ví điện tử, đơn vị trung chuyển mạng CDE, trung tâm dữ liệu).",
        complexity: "Cao nhất (High)",
        controls: "360+ Kiểm soát (Đầy đủ 12 yêu cầu và các phụ lục bổ sung)",
        criteria: [
            "Là nhà cung cấp dịch vụ thanh toán (Payment Service Provider - PSP).",
            "Hạ tầng có liên quan đến việc truyền tải, xử lý, lưu trữ hoặc ảnh hưởng trực tiếp đến an ninh dữ liệu thẻ của các khách hàng doanh nghiệp khác."
        ],
        auditReq: "Nộp bản tự đánh giá SAQ D Service Provider hàng năm, quét lỗ hổng ASV và nội bộ hàng quý, kiểm thử xâm nhập 6 tháng/lần, và thường xuyên được đánh giá bởi bên thứ ba (QSA Audit)."
    }
};

let wizardStep = 1;
const wizardAnswers = {};
let currentWizardQuestionId = "q1";
const wizardHistory = [];

const WIZARD_QUESTIONS = [
    {
        id: "q1",
        step: 1,
        text: "Doanh nghiệp của bạn đóng vai trò gì trong chuỗi thanh toán thẻ?",
        options: [
            {
                title: "Thương nhân bán hàng (Merchant)",
                desc: "Doanh nghiệp bán sản phẩm, dịch vụ và chấp nhận thanh toán thẻ trực tiếp từ khách hàng.",
                icon: "fa-solid fa-store",
                next: "q2",
                action: () => { wizardAnswers.isServiceProvider = false; }
            },
            {
                title: "Nhà cung cấp dịch vụ (Service Provider)",
                desc: "Đơn vị cung cấp cổng thanh toán, ví điện tử, hosting, bảo mật hoặc xử lý giao dịch cho các doanh nghiệp khác.",
                icon: "fa-solid fa-server",
                next: "result",
                recommend: "saq-d-service",
                action: () => { wizardAnswers.isServiceProvider = true; }
            }
        ]
    },
    {
        id: "q2",
        step: 2,
        text: "Hệ thống của bạn có lưu trữ dữ liệu thẻ (PAN, CVV, ngày hết hạn) dưới dạng điện tử tĩnh không?",
        options: [
            {
                title: "Có lưu trữ dữ liệu thẻ",
                desc: "Lưu số thẻ tín dụng thô (PAN, CVV) trong Cơ sở dữ liệu Postgres, các tệp log thô, hoặc ổ đĩa sao lưu.",
                icon: "fa-solid fa-database text-danger",
                next: "result",
                recommend: "saq-d-merchant",
                action: () => { wizardAnswers.storesData = true; }
            },
            {
                title: "Không lưu trữ dữ liệu thẻ",
                desc: "Mọi thông tin thẻ thô được chuyển thành Token bảo mật hoặc outsource hoàn toàn, không lưu trữ dữ liệu thẻ thô tĩnh.",
                icon: "fa-solid fa-shield-halved text-success",
                next: "q3",
                action: () => { wizardAnswers.storesData = false; }
            }
        ]
    },
    {
        id: "q3",
        step: 3,
        text: "Doanh nghiệp của bạn tiếp nhận dữ liệu thẻ qua kênh giao dịch nào?",
        options: [
            {
                title: "Thương mại điện tử (E-commerce)",
                desc: "Giao dịch trực tuyến qua trang web thương mại điện tử hoặc ứng dụng di động (Card-not-present).",
                icon: "fa-solid fa-globe",
                next: "q4_ecom",
                action: () => { wizardAnswers.channel = "ecommerce"; }
            },
            {
                title: "Điểm bán lẻ vật lý (POS/MOTO)",
                desc: "Thanh toán trực tiếp tại cửa hàng qua thiết bị POS hoặc nhận thông tin thẻ qua điện thoại/thư giấy.",
                icon: "fa-solid fa-credit-card",
                next: "q4_retail",
                action: () => { wizardAnswers.channel = "retail"; }
            }
        ]
    },
    {
        id: "q4_ecom",
        step: 4,
        text: "Website/App thương mại điện tử của bạn tích hợp thanh toán như thế nào?",
        options: [
            {
                title: "Chuyển hướng (Redirect) / iFrame bảo mật",
                desc: "Khách hàng được chuyển hướng sang cổng thanh toán hoặc nhập thẻ trong iFrame/Hosted Fields bảo mật. Server của bạn hoàn toàn không tiếp nhận dữ liệu thẻ.",
                icon: "fa-solid fa-external-link-alt",
                next: "result",
                recommend: "saq-a"
            },
            {
                title: "Form nhập liệu tại Web (Direct Post / API)",
                desc: "Khách hàng nhập thẻ trực tiếp trên form của website bạn. Trình duyệt gửi trực tiếp dữ liệu tới cổng thanh toán, nhưng server web của bạn có ảnh hưởng tới form nhập liệu.",
                icon: "fa-solid fa-file-code",
                next: "result",
                recommend: "saq-a-ep"
            },
            {
                title: "Tích hợp API Server-to-Server",
                desc: "Dữ liệu thẻ được gửi về server của bạn xử lý và lưu trữ đệm trước khi gọi API gửi sang cổng thanh toán.",
                icon: "fa-solid fa-network-wired",
                next: "result",
                recommend: "saq-d-merchant"
            }
        ]
    },
    {
        id: "q4_retail",
        step: 4,
        text: "Thiết bị hoặc hình thức nhận thông tin thẻ của cửa hàng là gì?",
        options: [
            {
                title: "POS cơ học hoặc Máy POS quay số",
                desc: "Chỉ dùng máy in dấu thẻ vật lý hoặc thiết bị POS standalone kết nối qua đường điện thoại quay số (không có internet).",
                icon: "fa-solid fa-phone-alt",
                next: "result",
                recommend: "saq-b"
            },
            {
                title: "Thiết bị POS standalone kết nối mạng IP",
                desc: "Máy POS đơn lẻ kết nối Internet qua IP/Wi-Fi/4G để truyền dữ liệu và không liên kết với hệ thống máy chủ nội bộ nào khác.",
                icon: "fa-solid fa-wifi",
                next: "result",
                recommend: "saq-b-ip"
            },
            {
                title: "Virtual Terminal (Trình duyệt Web)",
                desc: "Nhân viên nhập thủ công thông tin thẻ khách hàng vào trang quản trị cổng thanh toán qua trình duyệt web trên một máy tính duy nhất.",
                icon: "fa-solid fa-desktop",
                next: "result",
                recommend: "saq-c-vt"
            },
            {
                title: "Hệ thống POS tích hợp",
                desc: "Phần mềm POS cài đặt trên máy tính bán hàng, kết nối Internet và tích hợp sâu với mạng nội bộ cửa hàng.",
                icon: "fa-solid fa-cash-register",
                next: "result",
                recommend: "saq-c"
            },
            {
                title: "Giải pháp mã hóa P2PE chuẩn",
                desc: "Sử dụng các thiết bị thanh toán và giải pháp mã hóa Point-to-Point Encryption (P2PE) đã được hội đồng PCI SSC phê duyệt chính thức.",
                icon: "fa-solid fa-key",
                next: "result",
                recommend: "saq-p2pe"
            }
        ]
    }
];

function resetSaqWizard() {
    currentWizardQuestionId = "q1";
    wizardHistory.length = 0;

    const introDiv = document.getElementById('saq-wizard-intro');
    const questionsDiv = document.getElementById('saq-wizard-questions');
    const resPanel = document.getElementById('saq-result-panel');

    if (introDiv) introDiv.style.display = 'block';
    if (questionsDiv) questionsDiv.style.display = 'none';
    if (resPanel) resPanel.style.display = 'none';
}
window.resetSaqWizard = resetSaqWizard;

function initSaqSelector() {
    const startBtn = document.getElementById('btn-start-saq-wizard');
    const introDiv = document.getElementById('saq-wizard-intro');
    const questionsDiv = document.getElementById('saq-wizard-questions');
    const selectDropdown = document.getElementById('saq-flow-select');

    if (startBtn) {
        startBtn.onclick = () => {
            if (introDiv && questionsDiv) {
                introDiv.style.display = 'none';
                questionsDiv.style.display = 'block';
                currentWizardQuestionId = "q1";
                wizardHistory.length = 0;
                renderWizardQuestion();

                // Hide the result panel while wizard is active
                const resPanel = document.getElementById('saq-result-panel');
                if (resPanel) resPanel.style.display = 'none';
            }
        };
    }

    const resetBtn = document.getElementById('btn-reset-wizard');
    if (resetBtn) {
        resetBtn.onclick = () => {
            resetSaqWizard();
        };
    }

    const prevBtn = document.getElementById('btn-prev-wizard');
    if (prevBtn) {
        prevBtn.onclick = () => {
            if (wizardHistory.length > 0) {
                currentWizardQuestionId = wizardHistory.pop();
                renderWizardQuestion();
            }
        };
    }

    if (selectDropdown) {
        selectDropdown.onchange = (e) => {
            // Reset the wizard to initial/intro state if dropdown is changed manually
            if (introDiv) introDiv.style.display = 'block';
            if (questionsDiv) questionsDiv.style.display = 'none';
            showSaqResult(e.target.value);
        };

        // Initial call
        const resPanel = document.getElementById('saq-result-panel');
        if (resPanel && resPanel.style.display !== 'block') {
            showSaqResult(selectDropdown.value);
        }
    }
}

function renderWizardQuestion() {
    const q = WIZARD_QUESTIONS.find(item => item.id === currentWizardQuestionId);
    if (!q) return;

    const questionText = document.getElementById('wizard-question-text');
    const optionsContainer = document.getElementById('wizard-options-container');
    const stepInfo = document.getElementById('wizard-step-info');
    const prevBtn = document.getElementById('btn-prev-wizard');

    if (questionText) questionText.innerText = q.text;

    let totalQuestions = 4;
    let currentStepNum = q.step;
    const questionId = q.id; // Capture locally to prevent race conditions

    // Update Stepper visually
    const stepperSteps = document.querySelectorAll('.saq-stepper .stepper-step');
    stepperSteps.forEach((step) => {
        const stepVal = parseInt(step.getAttribute('data-step'));
        if (stepVal < currentStepNum) {
            step.className = 'stepper-step completed';
            const dot = step.querySelector('.step-dot');
            if (dot) dot.innerHTML = '<i class="fa-solid fa-check"></i>';
        } else if (stepVal === currentStepNum) {
            step.className = 'stepper-step active';
            const dot = step.querySelector('.step-dot');
            if (dot) dot.innerHTML = getStepIcon(stepVal);
        } else {
            step.className = 'stepper-step';
            const dot = step.querySelector('.step-dot');
            if (dot) dot.innerHTML = getStepIcon(stepVal);
        }
    });

    if (stepInfo) stepInfo.innerText = `Bước ${currentStepNum} / ${totalQuestions}`;
    if (prevBtn) {
        prevBtn.style.display = wizardHistory.length > 0 ? 'inline-block' : 'none';
    }

    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        q.options.forEach((opt, idx) => {
            const card = document.createElement('div');
            card.className = 'wizard-card-option';
            card.onclick = () => {
                if (opt.action) opt.action();
                wizardHistory.push(questionId);

                if (opt.next === 'result') {
                    showWizardResult(opt.recommend);
                } else {
                    currentWizardQuestionId = opt.next;
                    renderWizardQuestion();
                }
            };

            card.innerHTML = `
                <div class="wizard-option-icon">
                    <i class="${opt.icon}"></i>
                </div>
                <div class="wizard-option-content">
                    <div class="wizard-option-title">${opt.title}</div>
                    <div class="wizard-option-desc">${opt.desc}</div>
                </div>
            `;
            optionsContainer.appendChild(card);
        });
    }
}

function getStepIcon(step) {
    switch (step) {
        case 1: return '<i class="fa-solid fa-user-tie"></i>';
        case 2: return '<i class="fa-solid fa-database"></i>';
        case 3: return '<i class="fa-solid fa-route"></i>';
        case 4: return '<i class="fa-solid fa-network-wired"></i>';
        case 5: return '<i class="fa-solid fa-award"></i>';
        default: return '<i class="fa-solid fa-circle"></i>';
    }
}

function showWizardResult(saqType) {
    const questionsDiv = document.getElementById('saq-wizard-questions');
    if (questionsDiv) questionsDiv.style.display = 'none';

    // Highlight step 5 (Khuyến Nghị) as completed when result is shown
    const stepperSteps = document.querySelectorAll('.saq-stepper .stepper-step');
    stepperSteps.forEach((step) => {
        const stepVal = parseInt(step.getAttribute('data-step'));
        if (stepVal <= 5) {
            step.className = 'stepper-step completed';
            const dot = step.querySelector('.step-dot');
            if (dot) dot.innerHTML = '<i class="fa-solid fa-check"></i>';
        }
    });

    const dropdown = document.getElementById('saq-flow-select');
    if (dropdown) {
        let selectVal = saqType;
        if (saqType === 'saq-d-merchant') selectVal = 'saq-d-merchant';
        else if (saqType === 'saq-d-service') selectVal = 'saq-d-service';
        else if (!saqType.startsWith('saq-')) selectVal = 'saq-' + saqType;
        dropdown.value = selectVal;
    }

    showSaqResult(saqType);
}

function showSaqResult(saqType) {
    const panel = document.getElementById('saq-result-panel');
    if (!panel) return;

    panel.style.display = 'block';

    let key = saqType;
    if (!SAQ_TYPES_DATA[key]) {
        if (SAQ_TYPES_DATA['saq-' + key]) {
            key = 'saq-' + key;
        } else if (key === 'd-merchant') {
            key = 'saq-d-merchant';
        } else if (key === 'd-service') {
            key = 'saq-d-service';
        } else {
            key = 'saq-d-merchant'; // Fallback
        }
    }

    const data = SAQ_TYPES_DATA[key];
    if (!data) return;

    let criteriaHtml = '';
    data.criteria.forEach(item => {
        criteriaHtml += `<li style="margin-bottom: 6px; font-size: 11.5px; color: var(--text-secondary); display: flex; align-items: flex-start; gap: 8px;"><i class="fa-solid fa-square-check" style="color: var(--color-success); margin-top: 3px; flex-shrink: 0;"></i><span>${item}</span></li>`;
    });

    panel.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div class="saq-badge-large" style="background: rgba(59, 130, 246, 0.15); border: 1px solid var(--color-primary); color: var(--color-primary); padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 14px; font-family: var(--font-heading); text-shadow: 0 0 8px rgba(59,130,246,0.3); flex-shrink: 0;">${key.toUpperCase().replace('SAQ-', 'SAQ ')}</div>
                <div>
                    <h4 style="font-family: var(--font-heading); font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 0;">${data.title}</h4>
                    <span style="font-size: 11px; color: var(--text-secondary);">Mức độ phức tạp: <strong style="color: ${data.complexity.includes('Cao') ? 'var(--color-danger)' : (data.complexity.includes('Trung') ? 'var(--color-warning)' : 'var(--color-success)')}">${data.complexity}</strong></span>
                </div>
            </div>
            <div style="text-align: right; min-width: 120px;">
                <span style="font-size: 10px; color: var(--text-secondary); display: block;">Kiểm soát bắt buộc:</span>
                <strong style="color: var(--color-primary); font-size: 12.5px; font-family: var(--font-heading);">${data.controls}</strong>
            </div>
        </div>
        <p style="font-size: 11.5px; line-height: 1.5; color: var(--text-primary); margin-bottom: 15px;"><strong>Mô tả:</strong> ${data.description}</p>
        
        <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-glass); border-radius: 6px; padding: 12px 15px; margin-bottom: 15px;">
            <h5 style="font-size: 11.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0;"><i class="fa-solid fa-list-check" style="color: var(--color-primary); margin-right: 6px;"></i>Tiêu chuẩn áp dụng (Eligibility Criteria):</h5>
            <ul style="list-style: none; padding-left: 0; margin: 0;">
                ${criteriaHtml}
            </ul>
        </div>

        <div style="border-left: 3px solid var(--color-primary); background: rgba(59, 130, 246, 0.03); padding: 8px 12px; border-radius: 0 6px 6px 0; display: flex; justify-content: space-between; align-items: center; gap: 15px;">
            <div>
                <h5 style="font-size: 11px; font-weight: 700; color: #93c5fd; margin: 0 0 4px 0;"><i class="fa-solid fa-circle-nodes" style="margin-right: 6px;"></i>Yêu cầu nộp hồ sơ của QSA/Tổ chức thẻ:</h5>
                <p style="font-size: 11px; line-height: 1.45; color: var(--text-secondary); margin: 0;">${data.auditReq}</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="resetSaqWizard()" style="padding: 6px 12px; font-size: 11px; flex-shrink: 0;">
                <i class="fa-solid fa-rotate-left"></i> Khảo sát lại
            </button>
        </div>
    `;
}

// --- REPORT TAB HANDLERS ---
let activeReportSection = 1;

window.selectReportSection = function (sectionNum) {
    activeReportSection = sectionNum;

    // Update active button styling
    document.querySelectorAll('.report-menu-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-report-sec-${sectionNum}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Toggle content visibility
    document.querySelectorAll('.report-section-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });

    const activeContent = document.getElementById(`report-sec-content-${sectionNum}`);
    if (activeContent) {
        activeContent.style.display = 'block';
        activeContent.classList.add('active');
        // Scroll to top of report body content
        const docBody = document.getElementById('report-doc-body-content');
        if (docBody) docBody.scrollTop = 0;
    }
};

function initReportLibrary() {
    const copyReportBtn = document.getElementById('btn-copy-report');
    if (copyReportBtn) {
        copyReportBtn.onclick = () => {
            const activeContent = document.getElementById(`report-sec-content-${activeReportSection}`);
            if (activeContent) {
                const textToCopy = activeContent.innerText;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = copyReportBtn.innerHTML;
                    copyReportBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Đã sao chép!`;
                    copyReportBtn.className = "btn btn-success btn-sm";

                    setTimeout(() => {
                        copyReportBtn.innerHTML = originalText;
                        copyReportBtn.className = "btn btn-primary btn-sm";
                    }, 2000);
                }).catch(err => {
                    console.error("Lỗi copy: ", err);
                    alert("Không thể sao chép văn bản tự động!");
                });
            }
        };
    }
}

window.addEventListener('DOMContentLoaded', init);
