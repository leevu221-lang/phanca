/**
 * ==========================================================================
 * MODULE: TAB 8NTTT - SƠ ĐỒ PHÂN CÔNG NHÂN VIÊN PHỤ TRÁCH NGÀNH HÀNG (nttt8.js)
 * Thiết kế lại giao diện tab "8NTTT" theo đúng bố cục hình mẫu chuẩn siêu thị
 * Bảo toàn 100% dữ liệu phân công hiện có và không ảnh hưởng các tab khác.
 * ==========================================================================
 */

const NTTT8_STORAGE_CELLS_KEY = 'PHANCA_8NTTT_CELLS_V1';
const NTTT8_STORAGE_RULES_KEY = 'PHANCA_8NTTT_RULES_V1';
const NTTT8_STORAGE_STAFF_KEY = 'PHANCA_8NTTT_STAFF_V1';
const NTTT8_STORAGE_PG_KEY = 'PHANCA_8NTTT_PG_V1';
const NTTT8_STORAGE_ASSIGNMENTS_KEY = 'PHANCA_8NTTT_ASSIGNMENTS_V1';
const NTTT8_FIRESTORE_COLLECTION = 'phanca_system';
const NTTT8_FIRESTORE_DOC = 'nttt8_master';

/**
 * Danh sách nhân viên & PG hiện có từ dữ liệu gốc của dự án (Không tạo dữ liệu giả)
 */
const NTTT8_KNOWN_STAFF = [
  'PHÚC', 'XUYÊN', 'TRANG', 'Ý', 'MỸ', 'MY', 'MẠNH', 'THẮM',
  'THẠCH VŨ', 'KHANG HI', 'HI', 'NHẠN', 'MI', 'ĐẠI', 'BĂNG BLUSTONE',
  'TRINH', 'LAM', 'TÍN', 'OANH', 'ĐƯỢC', 'N.ANH', 'TRÂM', 'ÁI',
  'THANH', 'THƯ'
];

/**
 * Danh sách Nhân viên chính thức khởi tạo từ dữ liệu phân công hiện có trên sơ đồ 8NTTT
 */
const DEFAULT_NTTT8_STAFF_LIST = [
  { id: 'emp_01', code: 'NV001', name: 'PHÚC', phone: '', title: 'Nhân viên bán hàng', department: 'Điện máy - Điện lạnh', status: 'active', note: 'Phụ trách Tủ lạnh Samsung, Tủ đông, Bục máy giặt' },
  { id: 'emp_02', code: 'NV002', name: 'XUYÊN', phone: '', title: 'Nhân viên bán hàng', department: 'Điện máy - Điện lạnh', status: 'active', note: 'Phụ trách Tủ lạnh Hitachi, Aqua, Haier, Máy giặt Aqua/Haier' },
  { id: 'emp_03', code: 'NV003', name: 'TRANG', phone: '', title: 'Nhân viên bán hàng', department: 'Điện máy - Gia dụng', status: 'active', note: 'Phụ trách Tủ lạnh Sharp/Toshiba, Máy giặt Toshiba, GD Kangaroo/Toshiba' },
  { id: 'emp_04', code: 'NV004', name: 'Ý', phone: '', title: 'Nhân viên bán hàng', department: 'Điện máy - Điện lạnh', status: 'active', note: 'Phụ trách Bục tủ lạnh, Tủ lạnh Panasonic' },
  { id: 'emp_05', code: 'NV005', name: 'MỸ', phone: '', title: 'Nhân viên bán hàng', department: 'Phụ kiện & Viễn thông', status: 'active', note: 'Phụ trách Vách loa, Vách phụ kiện, Basus, Anker, Camera, Đồng hồ' },
  { id: 'emp_06', code: 'NV006', name: 'MY', phone: '', title: 'Nhân viên bán hàng', department: 'Gia dụng', status: 'active', note: 'Phụ trách Vách bếp điện, bếp gas, Vách hãng Junger/Hafele/Sunhouse' },
  { id: 'emp_07', code: 'NV007', name: 'MẠNH', phone: '', title: 'Nhân viên bán hàng', department: 'Điện máy - Điện lạnh', status: 'active', note: 'Phụ trách Vách tủ lạnh Panasonic/Samsung, Vách máy lạnh & máy nước nóng' },
  { id: 'emp_08', code: 'NV008', name: 'THẮM', phone: '', title: 'Nhân viên bán hàng', department: 'Gia dụng', status: 'active', note: 'Phụ trách Gia dụng 07' },
  { id: 'emp_09', code: 'NV009', name: 'THẠCH VŨ', phone: '', title: 'Nhân viên bán hàng', department: 'Gia dụng', status: 'active', note: 'Phụ trách Gia dụng 06' },
  { id: 'emp_10', code: 'NV010', name: 'KHANG HI', phone: '', title: 'Nhân viên bán hàng', department: 'Gia dụng', status: 'active', note: 'Phụ trách Gia dụng 05' },
  { id: 'emp_11', code: 'NV011', name: 'HI', phone: '', title: 'Nhân viên bán hàng', department: 'Gia dụng', status: 'active', note: 'Phụ trách MLN Mutoshi, MLN Hoà Phát' },
  { id: 'emp_12', code: 'NV012', name: 'NHẠN', phone: '', title: 'Nhân viên bán hàng', department: 'Gia dụng', status: 'active', note: 'Phụ trách Gia dụng 04' },
  { id: 'emp_13', code: 'NV013', name: 'MI', phone: '', title: 'Nhân viên bán hàng', department: 'Gia dụng', status: 'active', note: 'Phụ trách Gia dụng 03' },
  { id: 'emp_14', code: 'NV014', name: 'ĐẠI', phone: '', title: 'Nhân viên bán hàng', department: 'Gia dụng', status: 'active', note: 'Phụ trách Gia dụng 02' },
  { id: 'emp_15', code: 'NV015', name: 'BĂNG BLUSTONE', phone: '', title: 'Nhân viên bán hàng', department: 'Gia dụng', status: 'active', note: 'Phụ trách Gia dụng 01' },
  { id: 'emp_16', code: 'NV016', name: 'TRINH', phone: '', title: 'Nhân viên bán hàng', department: 'Gia dụng', status: 'active', note: 'Phụ trách Kệ gia dụng, GD Sunhouse, Robot, MLN Sunhouse' },
  { id: 'emp_17', code: 'NV017', name: 'LAM', phone: '', title: 'Nhân viên bán hàng', department: 'Gia dụng', status: 'active', note: 'Phụ trách MLN Karofi, MLN Kangaroo' },
  { id: 'emp_18', code: 'NV018', name: 'TÍN', phone: '', title: 'Nhân viên bán hàng', department: 'Điện máy - Tivi & Loa', status: 'active', note: 'Phụ trách Vách hãng Toshiba/Samsung, Kệ loa Karaoke, Bục hãng Xiaomi/Hesensi/Toshiba/TCL' },
  { id: 'emp_19', code: 'NV019', name: 'OANH', phone: '', title: 'Nhân viên bán hàng', department: 'Điện máy - Điện lạnh & Tivi', status: 'active', note: 'Phụ trách Vách tủ lạnh LG, Vách hãng LG, Máy giặt LG, Bục hãng LG/Samsung' },
  { id: 'emp_20', code: 'NV020', name: 'ĐƯỢC', phone: '', title: 'Nhân viên bán hàng', department: 'Điện máy - Điện lạnh', status: 'active', note: 'Phụ trách Máy giặt Electrolux, Hisense, Samsung, Panasonic' },
  { id: 'emp_21', code: 'NV021', name: 'N.ANH', phone: '', title: 'Nhân viên bán hàng', department: 'ICT - Điện thoại & Laptop', status: 'active', note: 'Phụ trách Vách phụ kiện, Laptop 1..6' },
  { id: 'emp_22', code: 'NV022', name: 'TRÂM', phone: '', title: 'Nhân viên bán hàng', department: 'ICT - Điện thoại & Laptop', status: 'active', note: 'Phụ trách Smartphone, Motorola, Realme, BTN Motorola/Table/Vivo/Realme' },
  { id: 'emp_23', code: 'NV023', name: 'ÁI', phone: '', title: 'Nhân viên bán hàng', department: 'ICT - Điện thoại & Laptop', status: 'active', note: 'Phụ trách Vivo' },
  { id: 'emp_24', code: 'NV024', name: 'THANH', phone: '', title: 'Nhân viên bán hàng', department: 'ICT - Điện thoại & Laptop', status: 'active', note: 'Phụ trách Xiaomi, BTN Xiaomi' },
  { id: 'emp_25', code: 'NV025', name: 'THƯ', phone: '', title: 'Nhân viên bán hàng', department: 'ICT - Điện thoại & Laptop', status: 'active', note: 'Phụ trách BTN Oppo, Oppo, BTN Samsung, BTN Honor, BTN Apple, Samsung, Apple' }
];

/**
 * Danh sách PG Hỗ Trợ độc lập (Quản lý riêng biệt theo Thương hiệu & Ngành hàng)
 */
const DEFAULT_NTTT8_PG_LIST = [
  { id: 'pg_01', code: 'PG001', name: 'PG SAMSUNG', brand: 'SAMSUNG', category: 'Tủ lạnh & Máy giặt', supportAreas: 'Khu vực A, Khu vực B', phone: '', status: 'active', note: 'Hỗ trợ ngành hàng Samsung' },
  { id: 'pg_02', code: 'PG002', name: 'PG LG', brand: 'LG', category: 'Tủ lạnh, Máy giặt & Tivi', supportAreas: 'Khu vực A, Khu vực B', phone: '', status: 'active', note: 'Hỗ trợ ngành hàng LG' },
  { id: 'pg_03', code: 'PG003', name: 'PG TOSHIBA', brand: 'TOSHIBA', category: 'Tủ lạnh, Máy giặt & Gia dụng', supportAreas: 'Khu vực A, Khu vực B', phone: '', status: 'active', note: 'Hỗ trợ ngành hàng Toshiba' },
  { id: 'pg_04', code: 'PG004', name: 'PG AQUA', brand: 'AQUA', category: 'Tủ lạnh & Máy giặt', supportAreas: 'Khu vực A, Khu vực B', phone: '', status: 'active', note: 'Hỗ trợ ngành hàng Aqua' },
  { id: 'pg_05', code: 'PG005', name: 'PG PANASONIC', brand: 'PANASONIC', category: 'Tủ lạnh & Máy giặt', supportAreas: 'Khu vực A, Khu vực B, Khu vực C', phone: '', status: 'active', note: 'Hỗ trợ ngành hàng Panasonic' },
  { id: 'pg_06', code: 'PG006', name: 'PG SUNHOUSE', brand: 'SUNHOUSE', category: 'Gia dụng & Máy lọc nước', supportAreas: 'Khu vực A', phone: '', status: 'active', note: 'Hỗ trợ kệ Gia dụng & MLN Sunhouse' },
  { id: 'pg_07', code: 'PG007', name: 'PG KANGAROO', brand: 'KANGAROO', category: 'Gia dụng & Máy lọc nước', supportAreas: 'Khu vực A, Khu vực B', phone: '', status: 'active', note: 'Hỗ trợ Gia dụng & MLN Kangaroo' },
  { id: 'pg_08', code: 'PG008', name: 'PG OPPO', brand: 'OPPO', category: 'Điện thoại & Tablet', supportAreas: 'Khu vực D', phone: '', status: 'active', note: 'Hỗ trợ bàn trải nghiệm & quầy Oppo' }
];

/**
 * Nội dung bảng quy định VẬN HÀNH gốc của dự án
 */
const DEFAULT_NTTT8_OPERATION_RULES = {
  title: 'VẬN HÀNH',
  line1Prefix: '1/ KHU VỰC BẠN NÀO PHỤ TRÁCH VÀO CA VỆ SINH, KIỂM TRA ĐÚNG 8NTT, GỬI HÌNH TRỰC TIẾP LÊN ROOM 8NTT ',
  line1Highlight: '( KO TẠO ALBUM, KO TẠO GHI CHÚ)',
  line1Suffix: '. CUỐI CA CHECK LẠI TRƯỚC KHI VỀ.',
  line2: '2/ ƯU TIÊN SỐ 1 PHỤC VỤ HỔ TRỢ KHÁCH HÀNG, XỬ LÝ CV XONG THÌ HOÀN TẤT BÁO CÁO.',
  line3: '3/ BẮT BUỘC HOÀN TẤT BÁO CÁO MỖI NGÀY LÀM VIỆC.',
  line4: '4/ PHÁT SINH SAI PHẠM XỬ LÝ THEO TRIỂN KHAI ĐÃ THỐNG NHẤT :',
  sub1: '- LẦN 1 : NHẮC NHỞ MIỆNG.',
  sub2: '- LẦN 2 TRONG THÁNG : BB XLKL KHIỂN TRÁCH BẰNG MIỆNG.',
  sub3: '- LẦN 3 TRONG THÁNG : BB XLKL ÚP HRM KHIỂN TRÁCH BẰNG VĂN BẢN'
};

/**
 * Cấu trúc dữ liệu gốc của toàn bộ các ô phân công trên sơ đồ 8NTTT
 * Tọa độ lưới CSS Grid: 35 cột x 40 hàng khớp 100% với sơ đồ mẫu
 */
const DEFAULT_NTTT8_CELLS = [
  // ================= KHU VỰC ĐỈNH (HÀNG 1) =================
  {
    id: 'top_wc',
    zone: 'A',
    type: 'static',
    area: 'WC',
    staff: '',
    displayOverride: 'WC',
    col: '1 / 2',
    row: '1 / 2',
    bgClass: 'bg-nttt-white text-nttt-red',
    borderClass: 'b-box',
    orientation: 'tilted'
  },
  {
    id: 'top_vach_hitachi',
    zone: 'A',
    type: 'assignment',
    area: 'VÁCH TỦ LẠNH HITACHI',
    staff: 'XUYÊN',
    col: '2 / 7',
    row: '1 / 2',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  {
    id: 'top_vach_aqua',
    zone: 'B',
    type: 'assignment',
    area: 'VÁCH TỦ LẠNH AQUA',
    staff: 'XUYÊN',
    col: '7 / 12',
    row: '1 / 2',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  {
    id: 'top_vach_lg',
    zone: 'B',
    type: 'assignment',
    area: 'VÁCH TỦ LẠNH LG',
    staff: 'OANH',
    col: '12 / 17',
    row: '1 / 2',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  {
    id: 'top_cua_kho',
    zone: 'C',
    type: 'static',
    area: 'CỬA KHO',
    staff: '',
    displayOverride: 'CỬA KHO',
    col: '17 / 18',
    row: '1 / 2',
    bgClass: 'bg-nttt-white text-nttt-red',
    borderClass: 'b-box'
  },

  // ================= KHU VỰC A1: CỘT PHÂN LOẠI NGÀNH HÀNG DỌC BÊN TRÁI (CỘT 1) =================
  {
    id: 'left_spacer_top',
    zone: 'A',
    type: 'static',
    area: '',
    staff: '',
    displayOverride: '',
    col: '1 / 2',
    row: '2 / 3',
    bgClass: 'bg-nttt-white',
    borderClass: 'b-box'
  },
  {
    id: 'left_vach_sharp',
    zone: 'A',
    type: 'category_vertical',
    area: 'VÁCH TỦ LẠNH SHARP',
    staff: 'TRANG',
    col: '1 / 2',
    row: '3 / 7',
    bgClass: 'bg-nttt-purple',
    borderClass: 'b-box',
    orientation: 'vertical'
  },
  {
    id: 'left_vach_toshiba',
    zone: 'A',
    type: 'category_vertical',
    area: 'VÁCH TỦ LẠNH TOSHIBA',
    staff: 'TRANG',
    col: '1 / 2',
    row: '7 / 11',
    bgClass: 'bg-nttt-purple',
    borderClass: 'b-box',
    orientation: 'vertical'
  },
  {
    id: 'left_vach_bep',
    zone: 'A',
    type: 'category_vertical',
    area: 'VÁCH BẾP ĐIỆN, BẾP GAS',
    staff: 'MY',
    col: '1 / 2',
    row: '11 / 15',
    bgClass: 'bg-nttt-purple',
    borderClass: 'b-box',
    orientation: 'vertical'
  },
  {
    id: 'left_vach_my',
    zone: 'A',
    type: 'category_vertical',
    area: 'VÁCH',
    staff: 'MY',
    col: '1 / 2',
    row: '15 / 19',
    bgClass: 'bg-nttt-purple',
    borderClass: 'b-box',
    orientation: 'vertical'
  },
  {
    id: 'left_vach_hang_gd',
    zone: 'A',
    type: 'category_vertical',
    area: 'VÁCH HÃNG : JUNGER, HAFALE, SUNHOUSE, KANGAROO, BLUESTONE, PRIMRE, COMFEE.',
    staff: 'MY',
    col: '1 / 2',
    row: '19 / 31',
    bgClass: 'bg-nttt-purple',
    borderClass: 'b-box',
    orientation: 'vertical'
  },
  {
    id: 'left_vach_hang_toshiba',
    zone: 'A',
    type: 'category_vertical',
    area: 'VÁCH HÃNG TOSHIBA',
    staff: 'TÍN',
    col: '1 / 2',
    row: '31 / 34',
    bgClass: 'bg-nttt-blue-strong',
    borderClass: 'b-box',
    orientation: 'tilted'
  },
  {
    id: 'left_vach_hang_lg',
    zone: 'A',
    type: 'category_vertical',
    area: 'VÁCH HÃNG LG',
    staff: 'OANH',
    col: '1 / 2',
    row: '34 / 37',
    bgClass: 'bg-nttt-blue-strong',
    borderClass: 'b-box',
    orientation: 'tilted'
  },
  {
    id: 'left_vach_hang_samsung',
    zone: 'A',
    type: 'category_vertical',
    area: 'VÁCH HÃNG SAMSUNG',
    staff: 'TÍN',
    col: '1 / 2',
    row: '37 / 40',
    bgClass: 'bg-nttt-blue-strong',
    borderClass: 'b-box',
    orientation: 'tilted'
  },

  // ================= KHU VỰC A2: KHỐI NGÀNH HÀNG BÊN TRÁI (CỘT 2..9) =================
  // Hàng kệ 1 (Row 3)
  {
    id: 'a_buc_tl_1',
    zone: 'A',
    type: 'assignment',
    area: 'BỤC TỦ LẠNH',
    staff: 'Ý',
    col: '2 / 6',
    row: '3 / 4',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  {
    id: 'a_tl_aqua',
    zone: 'A',
    type: 'assignment',
    area: 'TỦ LẠNH AQUA',
    staff: 'XUYÊN',
    col: '6 / 10',
    row: '3 / 4',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  // Hàng kệ 2 (Row 5)
  {
    id: 'a_buc_tl_2',
    zone: 'A',
    type: 'assignment',
    area: 'BỤC TỦ LẠNH',
    staff: 'Ý',
    col: '2 / 6',
    row: '5 / 6',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  {
    id: 'a_tl_toshiba',
    zone: 'A',
    type: 'assignment',
    area: 'TỦ LẠNH TOSHIBA',
    staff: 'TRANG',
    col: '6 / 10',
    row: '5 / 6',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  // Hàng kệ 3 (Row 7)
  {
    id: 'a_tl_panasonic',
    zone: 'A',
    type: 'assignment',
    area: 'TỦ LẠNH PANASONIC',
    staff: 'Ý',
    col: '2 / 6',
    row: '7 / 8',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  {
    id: 'a_tl_haier',
    zone: 'A',
    type: 'assignment',
    area: 'TỦ LẠNH HAIER',
    staff: 'XUYÊN',
    col: '6 / 10',
    row: '7 / 8',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  // Nhóm Gia dụng 07 -> 01 (Rows 9, 11, 13, 15, 17, 19, 21)
  {
    id: 'a_gd_07',
    zone: 'A',
    type: 'assignment',
    area: 'GIA DỤNG 07',
    staff: 'THẮM',
    col: '2 / 10',
    row: '9 / 10',
    bgClass: 'bg-nttt-cream',
    borderClass: 'b-box'
  },
  {
    id: 'a_gd_06',
    zone: 'A',
    type: 'assignment',
    area: 'GIA DỤNG 06',
    staff: 'THẠCH VŨ',
    col: '2 / 10',
    row: '11 / 12',
    bgClass: 'bg-nttt-cream',
    borderClass: 'b-box'
  },
  {
    id: 'a_gd_05',
    zone: 'A',
    type: 'assignment',
    area: 'GIA DỤNG 05',
    staff: 'KHANG HI',
    col: '2 / 10',
    row: '13 / 14',
    bgClass: 'bg-nttt-cream',
    borderClass: 'b-box'
  },
  {
    id: 'a_gd_04',
    zone: 'A',
    type: 'assignment',
    area: 'GIA DỤNG 04',
    staff: 'NHẠN',
    col: '2 / 10',
    row: '15 / 16',
    bgClass: 'bg-nttt-cream',
    borderClass: 'b-box'
  },
  {
    id: 'a_gd_03',
    zone: 'A',
    type: 'assignment',
    area: 'GIA DỤNG 03',
    staff: 'MI',
    col: '2 / 10',
    row: '17 / 18',
    bgClass: 'bg-nttt-cream',
    borderClass: 'b-box'
  },
  {
    id: 'a_gd_02',
    zone: 'A',
    type: 'assignment',
    area: 'GIA DỤNG 02',
    staff: 'ĐẠI',
    col: '2 / 10',
    row: '19 / 20',
    bgClass: 'bg-nttt-cream',
    borderClass: 'b-box'
  },
  {
    id: 'a_gd_01',
    zone: 'A',
    type: 'assignment',
    area: 'GIA DỤNG 01',
    staff: 'BĂNG BLUSTONE',
    col: '2 / 10',
    row: '21 / 22',
    bgClass: 'bg-nttt-cream',
    borderClass: 'b-box'
  },
  // Hàng kệ 11 (Row 23): Gia dụng Kangaroo & Toshiba
  {
    id: 'a_gd_kangaroo',
    zone: 'A',
    type: 'assignment',
    area: 'GIA DỤNG KANGAROO',
    staff: 'TRANG',
    col: '2 / 6',
    row: '23 / 24',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  {
    id: 'a_gd_toshiba',
    zone: 'A',
    type: 'assignment',
    area: 'GIA DỤNG TOSHIBA',
    staff: 'TRANG',
    col: '6 / 10',
    row: '23 / 24',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  // Hàng kệ 12 (Row 25): Kệ gia dụng & Gia dụng Sunhouse
  {
    id: 'a_ke_gd',
    zone: 'A',
    type: 'assignment',
    area: 'KỆ GIA DỤNG',
    staff: 'TRINH',
    col: '2 / 6',
    row: '25 / 26',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  {
    id: 'a_gd_sunhouse',
    zone: 'A',
    type: 'assignment',
    area: 'GIA DỤNG SUNHOUSE',
    staff: 'TRINH',
    col: '6 / 10',
    row: '25 / 26',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  // Hàng kệ 13 (Row 27): Robot & MLN Sunhouse
  {
    id: 'a_robot',
    zone: 'A',
    type: 'assignment',
    area: 'ROBOT',
    staff: 'TRINH',
    col: '2 / 6',
    row: '27 / 28',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  {
    id: 'a_mln_sunhouse',
    zone: 'A',
    type: 'assignment',
    area: 'MLN SUNHOUSE',
    staff: 'TRINH',
    col: '6 / 10',
    row: '27 / 28',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  // Hàng kệ 14 (Row 29): MLN Mutoshi, MLN Toshiba, MLN Hoà Phát
  {
    id: 'a_mln_mutoshi',
    zone: 'A',
    type: 'assignment',
    area: 'MLN MUTOSHI',
    staff: 'HI',
    col: '2 / 5',
    row: '29 / 30',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  {
    id: 'a_mln_toshiba',
    zone: 'A',
    type: 'assignment',
    area: 'MLN TOSHIBA',
    staff: 'TRANG',
    col: '5 / 8',
    row: '29 / 30',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  {
    id: 'a_mln_hoaphat',
    zone: 'A',
    type: 'assignment',
    area: 'MLN HOÀ PHÁT',
    staff: 'HI',
    col: '8 / 10',
    row: '29 / 30',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  // Hàng kệ 15..18 (Rows 31, 33, 35, 37): Kệ loa Karaoke, Bục hãng Haier, Aqua, Xiaomi
  {
    id: 'a_ke_loa_karaoke',
    zone: 'A',
    type: 'assignment',
    area: 'KỆ LOA KARAOKE',
    staff: 'TÍN',
    col: '2 / 10',
    row: '31 / 32',
    bgClass: 'bg-nttt-orange',
    borderClass: 'b-box'
  },
  {
    id: 'a_buc_haier',
    zone: 'A',
    type: 'assignment',
    area: 'BỤC HÃNG HAIER',
    staff: 'XUYÊN',
    col: '2 / 10',
    row: '33 / 34',
    bgClass: 'bg-nttt-orange',
    borderClass: 'b-box'
  },
  {
    id: 'a_buc_aqua',
    zone: 'A',
    type: 'assignment',
    area: 'BỤC HÃNG AQUA',
    staff: 'XUYÊN',
    col: '2 / 10',
    row: '35 / 36',
    bgClass: 'bg-nttt-orange',
    borderClass: 'b-box'
  },
  {
    id: 'a_buc_xiaomi',
    zone: 'A',
    type: 'assignment',
    area: 'BỤC HÃNG XIAOMI',
    staff: 'TÍN',
    col: '2 / 10',
    row: '37 / 38',
    bgClass: 'bg-nttt-orange',
    borderClass: 'b-box'
  },
  // Hàng kệ 19 (Row 39): Bục hãng Samsung gộp ngang qua Cột 2..16
  {
    id: 'ab_buc_samsung',
    zone: 'A',
    type: 'assignment',
    area: 'BỤC HÃNG SAMSUNG',
    staff: 'OANH',
    col: '2 / 17',
    row: '39 / 40',
    bgClass: 'bg-nttt-green',
    borderClass: 'b-box'
  },

  // ================= LỐI ĐI GIỮA (CỘT 10) =================
  {
    id: 'walkway_duong_di',
    zone: 'B',
    type: 'static',
    area: 'ĐƯỜNG ĐI',
    staff: '',
    displayOverride: 'Đ\nƯ\nỜ\nN\nG\n\nĐ\nI',
    col: '10 / 11',
    row: '2 / 39',
    bgClass: 'bg-nttt-white',
    borderClass: 'b-box',
    orientation: 'walkway'
  },

  // ================= KHU VỰC B: KHỐI NGÀNH HÀNG TRUNG TÂM (CỘT 11..16) =================
  {
    id: 'b_tl_samsung',
    zone: 'B',
    type: 'assignment',
    area: 'TỦ LẠNH SAMSUNG',
    staff: 'PHÚC',
    col: '11 / 17',
    row: '3 / 4',
    bgClass: 'bg-nttt-purple',
    borderClass: 'b-box'
  },
  {
    id: 'b_tu_dong_02',
    zone: 'B',
    type: 'assignment',
    area: 'TỦ ĐÔNG 02',
    staff: 'PHÚC',
    col: '11 / 17',
    row: '5 / 6',
    bgClass: 'bg-nttt-purple',
    borderClass: 'b-box'
  },
  {
    id: 'b_tu_dong_03',
    zone: 'B',
    type: 'assignment',
    area: 'TỦ ĐÔNG 03',
    staff: 'PHÚC',
    col: '11 / 17',
    row: '7 / 8',
    bgClass: 'bg-nttt-purple',
    borderClass: 'b-box'
  },
  {
    id: 'b_buc_may_giat',
    zone: 'B',
    type: 'assignment',
    area: 'BỤC MÁY GIẶT',
    staff: 'PHÚC',
    col: '11 / 17',
    row: '9 / 10',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },
  // Hàng Máy giặt Electrolux & Hisense (Row 11)
  {
    id: 'b_mg_electrolux',
    zone: 'B',
    type: 'assignment',
    area: 'MÁY GIẶT ELECTROLUX',
    staff: 'ĐƯỢC',
    col: '11 / 14',
    row: '11 / 12',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },
  {
    id: 'b_mg_hisense',
    zone: 'B',
    type: 'assignment',
    area: 'MÁY GIẶT HISENSE',
    staff: 'ĐƯỢC',
    col: '14 / 17',
    row: '11 / 12',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },
  // Hàng Máy giặt Samsung & Panasonic (Row 13)
  {
    id: 'b_mg_samsung',
    zone: 'B',
    type: 'assignment',
    area: 'MÁY GIẶT SAMSUNG',
    staff: 'ĐƯỢC',
    col: '11 / 14',
    row: '13 / 14',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },
  {
    id: 'b_mg_panasonic',
    zone: 'B',
    type: 'assignment',
    area: 'MÁY GIẶT PANASONIC',
    staff: 'ĐƯỢC',
    col: '14 / 17',
    row: '13 / 14',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },
  // Hàng Máy giặt Aqua & Haier (Row 15)
  {
    id: 'b_mg_aqua',
    zone: 'B',
    type: 'assignment',
    area: 'MÁY GIẶT AQUA',
    staff: 'XUYÊN',
    displayOverride: 'MÁY GIẶT AQUA - XUYÊN-',
    col: '11 / 14',
    row: '15 / 16',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },
  {
    id: 'b_mg_haier',
    zone: 'B',
    type: 'assignment',
    area: 'MÁY GIẶT HAIER',
    staff: 'XUYÊN',
    col: '14 / 17',
    row: '15 / 16',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },
  // Máy giặt Toshiba (Row 17) & Máy giặt LG (Row 19)
  {
    id: 'b_mg_toshiba',
    zone: 'B',
    type: 'assignment',
    area: 'MÁY GIẶT TOSHIBA',
    staff: 'TRANG',
    col: '11 / 17',
    row: '17 / 18',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },
  {
    id: 'b_mg_lg',
    zone: 'B',
    type: 'assignment',
    area: 'MÁY GIẶT LG',
    staff: 'OANH',
    col: '11 / 17',
    row: '19 / 20',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },
  // Khối Bán hàng, Giao hàng, HTKT, Trang trí, Thu ngân (Hồng phấn #F4CCCC, Rows 21..26)
  {
    id: 'b_kv_giasoc',
    zone: 'B',
    type: 'assignment',
    area: 'KHU VỰC GIÁ SỐC/ MÙA VỤ',
    staff: '',
    displayOverride: 'KHU VỰC GIÁ SỐC/\nMÙA VỤ',
    col: '11 / 13',
    row: '21 / 26',
    bgClass: 'bg-nttt-pink',
    borderClass: 'b-box'
  },
  {
    id: 'b_ban_giaohang',
    zone: 'B',
    type: 'assignment',
    area: 'BÀN GIAO HÀNG',
    staff: '',
    displayOverride: 'BÀN\nGIAO HÀNG',
    col: '13 / 14',
    row: '21 / 26',
    bgClass: 'bg-nttt-pink',
    borderClass: 'b-box'
  },
  {
    id: 'b_htkt',
    zone: 'B',
    type: 'assignment',
    area: 'HTKT',
    staff: '',
    displayOverride: 'HTKT',
    col: '14 / 15',
    row: '21 / 26',
    bgClass: 'bg-nttt-pink',
    borderClass: 'b-box'
  },
  {
    id: 'b_trang_tri',
    zone: 'B',
    type: 'assignment',
    area: 'TRANG TRÍ',
    staff: '',
    displayOverride: 'TRANG TRÍ',
    col: '15 / 16',
    row: '21 / 26',
    bgClass: 'bg-nttt-pink',
    borderClass: 'b-box'
  },
  {
    id: 'b_thu_ngan',
    zone: 'B',
    type: 'assignment',
    area: 'THU NGÂN',
    staff: '',
    displayOverride: 'THU NGÂN',
    col: '16 / 17',
    row: '21 / 26',
    bgClass: 'bg-nttt-pink',
    borderClass: 'b-box'
  },
  // Hàng MLN Karofi & Kangaroo (Row 29)
  {
    id: 'b_mln_karofi',
    zone: 'B',
    type: 'assignment',
    area: 'MLN KAROFI',
    staff: 'LAM',
    col: '11 / 14',
    row: '29 / 30',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  {
    id: 'b_mln_kangaroo',
    zone: 'B',
    type: 'assignment',
    area: 'MLN KANGAROO',
    staff: 'LAM',
    col: '14 / 17',
    row: '29 / 30',
    bgClass: 'bg-nttt-green-light',
    borderClass: 'b-box'
  },
  // Các Bục hãng trung tâm dưới (Rows 31, 33, 35, 37)
  {
    id: 'b_buc_hesensi',
    zone: 'B',
    type: 'assignment',
    area: 'BỤC HÃNG HESENSI',
    staff: 'TÍN',
    col: '11 / 17',
    row: '31 / 32',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },
  {
    id: 'b_buc_toshiba',
    zone: 'B',
    type: 'assignment',
    area: 'BỤC HÃNG TOSHIBA',
    staff: 'TÍN',
    col: '11 / 17',
    row: '33 / 34',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },
  {
    id: 'b_buc_tcl',
    zone: 'B',
    type: 'assignment',
    area: 'BỤC HÃNG TCL',
    staff: 'TÍN',
    col: '11 / 17',
    row: '35 / 36',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },
  {
    id: 'b_buc_lg',
    zone: 'B',
    type: 'assignment',
    area: 'BỤC HÃNG LG',
    staff: 'OANH',
    col: '11 / 17',
    row: '37 / 38',
    bgClass: 'bg-nttt-blue',
    borderClass: 'b-box'
  },

  // ================= KHU VỰC C: CỘT CỬA KHO & VÁCH PHỤ TRÁCH DỌC (CỘT 17) =================
  {
    id: 'c_vach_tl_panasonic',
    zone: 'C',
    type: 'warehouse_vertical',
    area: 'VÁCH TỦ LẠNH PANASONIC',
    staff: 'MẠNH',
    col: '17 / 18',
    row: '2 / 7',
    bgClass: 'bg-nttt-orange',
    borderClass: 'b-box',
    orientation: 'vertical'
  },
  {
    id: 'c_vach_tl_samsung',
    zone: 'C',
    type: 'warehouse_vertical',
    area: 'VÁCH TỦ LẠNH SAMSUNG',
    staff: 'MẠNH',
    col: '17 / 18',
    row: '7 / 11',
    bgClass: 'bg-nttt-orange',
    borderClass: 'b-box',
    orientation: 'vertical'
  },
  {
    id: 'c_vach_may_lanh',
    zone: 'C',
    type: 'warehouse_vertical',
    area: 'VÁCH MÁY LẠNH, MÁY NƯỚC NÓNG',
    staff: 'MẠNH',
    col: '17 / 18',
    row: '11 / 26',
    bgClass: 'bg-nttt-orange',
    borderClass: 'b-box',
    orientation: 'vertical'
  },
  {
    id: 'c_vach_loa_my',
    zone: 'C',
    type: 'assignment',
    area: 'VÁCH LOA',
    staff: 'MỸ',
    col: '17 / 18',
    row: '26 / 28',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'c_vach_pk_my',
    zone: 'C',
    type: 'warehouse_vertical',
    area: 'VÁCH PHỤ KIỆN',
    staff: 'MỸ',
    col: '17 / 18',
    row: '28 / 32',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box',
    orientation: 'vertical'
  },

  // ================= KHU VỰC D: NHÓM LAPTOP, ĐIỆN THOẠI, PHỤ KIỆN & BTV BÊN PHẢI =================
  // Dãy 1 (Row 31): Vách phụ kiện, Laptop 1-2, Smartphone, Motorola, Realme, Vivo, Xiaomi
  {
    id: 'd_vach_pk_1',
    zone: 'D',
    type: 'assignment',
    area: 'VÁCH PHỤ KIỆN',
    staff: 'N.ANH',
    col: '18 / 20',
    row: '31 / 32',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_vach_pk_2',
    zone: 'D',
    type: 'assignment',
    area: 'VÁCH PHỤ KIỆN',
    staff: 'N.ANH',
    col: '20 / 22',
    row: '31 / 32',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_laptop_1',
    zone: 'D',
    type: 'assignment',
    area: 'LAPTOP 1',
    staff: 'N.ANH',
    col: '22 / 24',
    row: '31 / 32',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_laptop_2',
    zone: 'D',
    type: 'assignment',
    area: 'LAPTOP 2',
    staff: 'N.ANH',
    col: '24 / 26',
    row: '31 / 32',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_smartphone',
    zone: 'D',
    type: 'assignment',
    area: 'SMARTPHONE',
    staff: 'TRÂM',
    col: '26 / 28',
    row: '31 / 32',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_motorola',
    zone: 'D',
    type: 'assignment',
    area: 'MOTOROLA',
    staff: 'TRÂM',
    col: '28 / 30',
    row: '31 / 32',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_realme',
    zone: 'D',
    type: 'assignment',
    area: 'REALME',
    staff: 'TRÂM',
    col: '30 / 32',
    row: '31 / 32',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_vivo',
    zone: 'D',
    type: 'assignment',
    area: 'VIVO',
    staff: 'ÁI',
    col: '32 / 34',
    row: '31 / 32',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_xiaomi_wall',
    zone: 'D',
    type: 'assignment',
    area: 'XIAOMI',
    staff: 'THANH',
    col: '34 / 36',
    row: '31 / 34',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },

  // Dãy 2 (Row 33): Phụ kiện Basus, Anker, Camera, Laptop 3-4, BTN Xiaomi, BTN Motorola, BTN Table
  {
    id: 'd_pk_basus',
    zone: 'D',
    type: 'assignment',
    area: 'PHỤ KIỆN BASUS',
    staff: 'MỸ',
    col: '17 / 19',
    row: '33 / 34',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_pk_anker',
    zone: 'D',
    type: 'assignment',
    area: 'PHỤ KIỆN ANKER',
    staff: 'MỸ',
    col: '19 / 21',
    row: '33 / 34',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_camera',
    zone: 'D',
    type: 'assignment',
    area: 'CAMERA',
    staff: 'MỸ',
    col: '21 / 22',
    row: '33 / 34',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_laptop_3',
    zone: 'D',
    type: 'assignment',
    area: 'LAPTOP 3',
    staff: 'N.ANH',
    col: '22 / 24',
    row: '33 / 34',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_laptop_4',
    zone: 'D',
    type: 'assignment',
    area: 'LAPTOP 4',
    staff: 'N.ANH',
    col: '24 / 26',
    row: '33 / 34',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btn_xiaomi_1',
    zone: 'D',
    type: 'assignment',
    area: 'BTN XIAOMI',
    staff: 'THANH',
    col: '26 / 28',
    row: '33 / 34',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btn_xiaomi_2',
    zone: 'D',
    type: 'assignment',
    area: 'BTN XIAOMI',
    staff: 'THANH',
    col: '28 / 30',
    row: '33 / 34',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btn_motorola',
    zone: 'D',
    type: 'assignment',
    area: 'BTN MOTOROLA',
    staff: 'TRÂM',
    col: '30 / 32',
    row: '33 / 34',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btn_table',
    zone: 'D',
    type: 'assignment',
    area: 'BTN TABLE',
    staff: 'TRÂM',
    col: '32 / 34',
    row: '33 / 34',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },

  // Dãy 3 (Row 35): Đồng hồ thời trang, Laptop 5-6, BTN Oppo, BTN Vivo, BTN Realme, Oppo
  {
    id: 'd_dong_ho',
    zone: 'D',
    type: 'assignment',
    area: 'ĐỒNG HỒ THỜI TRANG',
    staff: 'MỸ',
    col: '17 / 22',
    row: '35 / 36',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_laptop_5',
    zone: 'D',
    type: 'assignment',
    area: 'LAPTOP 5',
    staff: 'N.ANH',
    col: '22 / 24',
    row: '35 / 36',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_laptop_6',
    zone: 'D',
    type: 'assignment',
    area: 'LAPTOP 6',
    staff: 'N.ANH',
    col: '24 / 26',
    row: '35 / 36',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btn_oppo_1',
    zone: 'D',
    type: 'assignment',
    area: 'BTN OPPO',
    staff: 'THƯ',
    col: '26 / 28',
    row: '35 / 36',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btn_oppo_2',
    zone: 'D',
    type: 'assignment',
    area: 'BTN OPPO',
    staff: 'THƯ',
    col: '28 / 30',
    row: '35 / 36',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btn_vivo',
    zone: 'D',
    type: 'assignment',
    area: 'BTN VIVO',
    staff: 'TRÂM',
    col: '30 / 32',
    row: '35 / 36',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btn_realme',
    zone: 'D',
    type: 'assignment',
    area: 'BTN REALME',
    staff: 'TRÂM',
    col: '32 / 34',
    row: '35 / 36',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_oppo_wall',
    zone: 'D',
    type: 'assignment',
    area: 'OPPO',
    staff: 'THƯ',
    col: '34 / 36',
    row: '34 / 37',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },

  // Dãy 4 (Row 37): BTV 1, BTV 2, BTN Samsung, BTN Honor, BTN Apple, Samsung
  {
    id: 'd_btv_1',
    zone: 'D',
    type: 'assignment',
    area: 'BTV 1',
    staff: '',
    displayOverride: 'BTV 1',
    col: '18 / 19',
    row: '37 / 38',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btv_2',
    zone: 'D',
    type: 'assignment',
    area: 'BTV 2',
    staff: '',
    displayOverride: 'BTV 2',
    col: '20 / 21',
    row: '37 / 38',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btn_samsung_1',
    zone: 'D',
    type: 'assignment',
    area: 'BTN SAMSUNG',
    staff: 'THƯ',
    col: '26 / 28',
    row: '37 / 38',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btn_samsung_2',
    zone: 'D',
    type: 'assignment',
    area: 'BTN SAMSUNG',
    staff: 'THƯ',
    col: '28 / 30',
    row: '37 / 38',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btn_honor',
    zone: 'D',
    type: 'assignment',
    area: 'BTN HONOR',
    staff: 'THƯ',
    col: '30 / 32',
    row: '37 / 38',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btn_apple',
    zone: 'D',
    type: 'assignment',
    area: 'BTN APPLE',
    staff: 'THƯ',
    col: '32 / 34',
    row: '37 / 38',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_samsung_wall',
    zone: 'D',
    type: 'assignment',
    area: 'SAMSUNG',
    staff: 'THƯ',
    col: '34 / 36',
    row: '37 / 39',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },

  // Dãy 5 (Row 39): BTV 3, BTV 4, Apple
  {
    id: 'd_btv_3',
    zone: 'D',
    type: 'assignment',
    area: 'BTV 3',
    staff: '',
    displayOverride: 'BTV 3',
    col: '18 / 19',
    row: '39 / 40',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_btv_4',
    zone: 'D',
    type: 'assignment',
    area: 'BTV 4',
    staff: '',
    displayOverride: 'BTV 4',
    col: '20 / 21',
    row: '39 / 40',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  },
  {
    id: 'd_apple_wall',
    zone: 'D',
    type: 'assignment',
    area: 'APPLE',
    staff: 'THƯ',
    col: '34 / 36',
    row: '39 / 41',
    bgClass: 'bg-nttt-yellow',
    borderClass: 'b-box'
  }
];

/**
 * Các hàng vạch chia kệ (Tick dividers) đúng như trên hình mẫu sơ đồ
 */
const NTTT8_TICK_ROWS = [
  // Khu vực A (Cột 2..9)
  { col: '2 / 10', row: '2 / 3', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '4 / 5', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '6 / 7', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '8 / 9', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '10 / 11', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '12 / 13', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '14 / 15', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '16 / 17', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '18 / 19', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '20 / 21', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '22 / 23', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '24 / 25', kind: 'cols-8-sparse', count: 3 },
  { col: '2 / 10', row: '26 / 27', kind: 'cols-8-sparse', count: 3 },
  { col: '2 / 10', row: '28 / 29', kind: 'cols-8-sparse', count: 3 },
  { col: '2 / 10', row: '30 / 31', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '32 / 33', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '34 / 35', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '36 / 37', kind: 'cols-8', count: 8 },
  { col: '2 / 10', row: '38 / 39', kind: 'cols-8', count: 8 },

  // Khu vực B (Cột 11..16)
  { col: '11 / 17', row: '2 / 3', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '4 / 5', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '6 / 7', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '8 / 9', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '10 / 11', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '12 / 13', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '14 / 15', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '16 / 17', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '18 / 19', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '20 / 21', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '30 / 31', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '32 / 33', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '34 / 35', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '36 / 37', kind: 'cols-6-left1', count: 2 },
  { col: '11 / 17', row: '38 / 39', kind: 'cols-6-left1', count: 2 },

  // Đường nối dọc giữa BTV 1-3 và BTV 2-4
  { col: '18 / 19', row: '38 / 39', kind: 'btv-connector', count: 1 },
  { col: '20 / 21', row: '38 / 39', kind: 'btv-connector', count: 1 }
];

const NTTT8State = {
  cells: [],
  rules: { ...DEFAULT_NTTT8_OPERATION_RULES },
  staffList: [],
  pgList: [],
  areaAssignments: {}, // { [cellId]: { cellId, mainStaffId, pgIds: [], note: '', unassignedByUser: false } }
  searchQuery: '',
  selectedStaff: '',
  editingCellId: null,
  editingCellPgIds: [],
  zoomMode: 'actual', // 'actual' (100% cuộn ngang rõ chữ) hoặc 'fit' (Toàn sơ đồ)
  zoomScale: 1,
  showStaffOnMap: true,
  showPgOnMap: true,
  exportContentMode: 'with_assignment', // 'with_assignment' | 'no_assignment' | 'original_sample'
  activeManagerTab: 'staff', // 'staff' | 'pg' | 'assign' | 'quick'
  quickSelectedStaffIds: new Set(),
  quickSelectedCellIds: new Set(),
  quickPreviewList: [],
  pendingReassignAction: null,
  lastSyncedFingerprint: '',
  isExportingImage: false,
  isCopyingImage: false,
  previewBlob: null,
  previewObjectUrl: '',
  previewDisplayMode: 'fit'
};

// ==========================================================================
// 1. QUẢN LÝ DỮ LIỆU QUAN HỆ (NHÂN VIÊN, PG, PHÂN CÔNG) & ĐỒNG BỘ FIREBASE
// ==========================================================================

function findStaffByIdNTTT8(staffId) {
  if (!staffId) return null;
  return NTTT8State.staffList.find(s => s.id === staffId) || null;
}

function findStaffByNameNTTT8(name) {
  const norm = String(name || '').trim().toUpperCase();
  if (!norm) return null;
  return NTTT8State.staffList.find(s => String(s.name || '').trim().toUpperCase() === norm) || null;
}

function findPgByIdNTTT8(pgId) {
  if (!pgId) return null;
  return NTTT8State.pgList.find(p => p.id === pgId) || null;
}

function generateNextStaffCodeNTTT8() {
  const existingCodes = new Set(
    [...NTTT8State.staffList, ...NTTT8State.pgList].map(item => String(item.code || '').trim().toUpperCase())
  );
  let num = NTTT8State.staffList.length + 1;
  while (existingCodes.has(`NV${String(num).padStart(3, '0')}`)) {
    num++;
  }
  return `NV${String(num).padStart(3, '0')}`;
}

function generateNextPgCodeNTTT8() {
  const existingCodes = new Set(
    [...NTTT8State.staffList, ...NTTT8State.pgList].map(item => String(item.code || '').trim().toUpperCase())
  );
  let num = NTTT8State.pgList.length + 1;
  while (existingCodes.has(`PG${String(num).padStart(3, '0')}`)) {
    num++;
  }
  return `PG${String(num).padStart(3, '0')}`;
}

function isDuplicateEntityCodeNTTT8(code, ignoreId = '') {
  const norm = String(code || '').trim().toUpperCase();
  if (!norm) return false;
  const dupStaff = NTTT8State.staffList.some(
    s => s.id !== ignoreId && String(s.code || '').trim().toUpperCase() === norm
  );
  const dupPg = NTTT8State.pgList.some(
    p => p.id !== ignoreId && String(p.code || '').trim().toUpperCase() === norm
  );
  return dupStaff || dupPg;
}

function ensureStaffRegisteredByNameNTTT8(staffName) {
  const cleanName = String(staffName || '').trim().toUpperCase();
  if (!cleanName) return null;
  let existing = findStaffByNameNTTT8(cleanName);
  if (existing) return existing;

  const newStaff = {
    id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    code: generateNextStaffCodeNTTT8(),
    name: cleanName,
    phone: '',
    title: 'Nhân viên bán hàng',
    department: 'Bán hàng siêu thị',
    status: 'active',
    note: ''
  };
  NTTT8State.staffList.push(newStaff);
  return newStaff;
}

/**
 * Đồng bộ liên kết quan hệ 2 chiều giữa areaAssignments[cell.id], staffList và cells
 * Khi đổi tên nhân viên trong staffList, cell.staff tự động cập nhật theo mainStaffId.
 */
function syncNTTT8RelationalState() {
  if (!NTTT8State.areaAssignments || typeof NTTT8State.areaAssignments !== 'object') {
    NTTT8State.areaAssignments = {};
  }

  NTTT8State.cells.forEach(cell => {
    if (cell.type === 'static') return;

    let rec = NTTT8State.areaAssignments[cell.id];
    if (!rec) {
      const matchedStaff = cell.staff ? ensureStaffRegisteredByNameNTTT8(cell.staff) : null;
      rec = {
        cellId: cell.id,
        mainStaffId: matchedStaff ? matchedStaff.id : '',
        pgIds: [],
        note: '',
        unassignedByUser: false
      };
      NTTT8State.areaAssignments[cell.id] = rec;
    } else {
      if (!Array.isArray(rec.pgIds)) rec.pgIds = [];
      // Lọc bỏ các pgId không còn tồn tại trong pgList
      rec.pgIds = rec.pgIds.filter(pid => Boolean(findPgByIdNTTT8(pid)));

      if (rec.mainStaffId) {
        const staffObj = findStaffByIdNTTT8(rec.mainStaffId);
        if (staffObj) {
          cell.staff = staffObj.name;
          if (cell.id === 'b_mg_aqua' && cell.displayOverride === 'MÁY GIẶT AQUA - XUYÊN-' && staffObj.name !== 'XUYÊN') {
            delete cell.displayOverride;
          }
        } else {
          rec.mainStaffId = '';
          cell.staff = '';
        }
      } else if (cell.staff && !rec.unassignedByUser) {
        const matched = ensureStaffRegisteredByNameNTTT8(cell.staff);
        if (matched) {
          rec.mainStaffId = matched.id;
          cell.staff = matched.name;
        }
      } else if (!rec.mainStaffId) {
        cell.staff = '';
      }
    }
  });
}

function loadNTTT8Data() {
  const baseCells = DEFAULT_NTTT8_CELLS.map(c => ({ ...c }));
  let loadedStaff = DEFAULT_NTTT8_STAFF_LIST.map(s => ({ ...s }));
  let loadedPg = DEFAULT_NTTT8_PG_LIST.map(p => ({ ...p }));
  let loadedAssignments = {};

  try {
    const savedStaffRaw = localStorage.getItem(NTTT8_STORAGE_STAFF_KEY);
    if (savedStaffRaw) {
      const parsedStaff = JSON.parse(savedStaffRaw);
      if (Array.isArray(parsedStaff) && parsedStaff.length > 0) {
        loadedStaff = parsedStaff;
      }
    }
  } catch (e) {
    console.warn('[8NTTT] Không thể đọc danh sách nhân viên từ localStorage:', e);
  }

  try {
    const savedPgRaw = localStorage.getItem(NTTT8_STORAGE_PG_KEY);
    if (savedPgRaw) {
      const parsedPg = JSON.parse(savedPgRaw);
      if (Array.isArray(parsedPg)) {
        loadedPg = parsedPg;
      }
    }
  } catch (e) {
    console.warn('[8NTTT] Không thể đọc danh sách PG từ localStorage:', e);
  }

  try {
    const savedRaw = localStorage.getItem(NTTT8_STORAGE_CELLS_KEY);
    if (savedRaw) {
      const savedMap = JSON.parse(savedRaw);
      if (savedMap && typeof savedMap === 'object') {
        baseCells.forEach(cell => {
          if (cell.type !== 'static' && savedMap[cell.id]) {
            if (typeof savedMap[cell.id].area === 'string') cell.area = savedMap[cell.id].area;
            if (typeof savedMap[cell.id].staff === 'string') cell.staff = savedMap[cell.id].staff;
            if (typeof savedMap[cell.id].displayOverride === 'string') {
              cell.displayOverride = savedMap[cell.id].displayOverride;
            }
          }
        });
      }
    }
  } catch (e) {
    console.warn('[8NTTT] Không thể đọc dữ liệu tùy chỉnh từ localStorage:', e);
  }

  try {
    const savedAssignRaw = localStorage.getItem(NTTT8_STORAGE_ASSIGNMENTS_KEY);
    if (savedAssignRaw) {
      const parsedAssign = JSON.parse(savedAssignRaw);
      if (parsedAssign && typeof parsedAssign === 'object') {
        loadedAssignments = parsedAssign;
      }
    }
  } catch (e) {
    console.warn('[8NTTT] Không thể đọc dữ liệu phân công từ localStorage:', e);
  }

  try {
    const savedRules = localStorage.getItem(NTTT8_STORAGE_RULES_KEY);
    if (savedRules) {
      const parsedRules = JSON.parse(savedRules);
      if (parsedRules && typeof parsedRules === 'object') {
        NTTT8State.rules = { ...DEFAULT_NTTT8_OPERATION_RULES, ...parsedRules };
      }
    }
  } catch (e) {
    console.warn('[8NTTT] Không thể đọc quy định vận hành từ localStorage:', e);
  }

  NTTT8State.cells = baseCells;
  NTTT8State.staffList = loadedStaff;
  NTTT8State.pgList = loadedPg;
  NTTT8State.areaAssignments = loadedAssignments;
  syncNTTT8RelationalState();
}

function buildNTTT8OverridesMap() {
  const map = {};
  NTTT8State.cells.forEach(cell => {
    if (cell.type === 'static') return;
    map[cell.id] = {
      area: cell.area,
      staff: cell.staff,
      displayOverride: cell.displayOverride || ''
    };
  });
  return map;
}

function setNTTT8ManagerSyncBadge(status, text) {
  const badge = document.getElementById('nttt8ManagerSyncStatus');
  if (!badge) return;
  badge.classList.remove('saving', 'error');
  if (status === 'saving') {
    badge.classList.add('saving');
    badge.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${escapeHtmlNTTT8(text || 'Đang lưu...')}`;
  } else if (status === 'error') {
    badge.classList.add('error');
    badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${escapeHtmlNTTT8(text || 'Lỗi lưu dữ liệu')}`;
  } else {
    badge.innerHTML = `<i class="fa-solid fa-cloud-check"></i> ${escapeHtmlNTTT8(text || 'Đã lưu & đồng bộ')}`;
  }
}

function saveNTTT8DataToStorage(syncToCloud = true) {
  try {
    setNTTT8ManagerSyncBadge('saving', 'Đang lưu dữ liệu...');
    syncNTTT8RelationalState();
    const overridesMap = buildNTTT8OverridesMap();
    localStorage.setItem(NTTT8_STORAGE_CELLS_KEY, JSON.stringify(overridesMap));
    localStorage.setItem(NTTT8_STORAGE_RULES_KEY, JSON.stringify(NTTT8State.rules));
    localStorage.setItem(NTTT8_STORAGE_STAFF_KEY, JSON.stringify(NTTT8State.staffList));
    localStorage.setItem(NTTT8_STORAGE_PG_KEY, JSON.stringify(NTTT8State.pgList));
    localStorage.setItem(NTTT8_STORAGE_ASSIGNMENTS_KEY, JSON.stringify(NTTT8State.areaAssignments));

    if (syncToCloud) {
      syncNTTT8ToFirestore(overridesMap, NTTT8State.rules);
    } else {
      setNTTT8ManagerSyncBadge('saved', 'Đã lưu bền vững');
    }
    return true;
  } catch (e) {
    console.error('[8NTTT] Lỗi lưu dữ liệu:', e);
    setNTTT8ManagerSyncBadge('error', 'Lưu thất bại - Đã giữ nguyên dữ liệu nhập');
    return false;
  }
}

async function syncNTTT8ToFirestore(overridesMap, rulesObj) {
  try {
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      setNTTT8ManagerSyncBadge('saved', 'Đã lưu trên trình duyệt');
      return;
    }
    const db = firebase.firestore();
    const payloadObj = {
      cells: overridesMap,
      rules: rulesObj,
      staffList: NTTT8State.staffList,
      pgList: NTTT8State.pgList,
      areaAssignments: NTTT8State.areaAssignments
    };
    const payloadStr = JSON.stringify(payloadObj);
    if (payloadStr === NTTT8State.lastSyncedFingerprint) {
      setNTTT8ManagerSyncBadge('saved', 'Đã lưu & đồng bộ');
      return;
    }

    NTTT8State.lastSyncedFingerprint = payloadStr;
    await db.collection(NTTT8_FIRESTORE_COLLECTION).doc(NTTT8_FIRESTORE_DOC).set({
      ...payloadObj,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    setNTTT8ManagerSyncBadge('saved', 'Đã lưu & đồng bộ Cloud');
  } catch (e) {
    console.warn('[8NTTT] Đồng bộ Firestore tạm hoãn:', e);
    setNTTT8ManagerSyncBadge('saved', 'Đã lưu cục bộ (Chờ mạng)');
  }
}

function listenNTTT8FirestoreChanges() {
  try {
    if (typeof firebase === 'undefined' || !firebase.firestore) return;
    const db = firebase.firestore();
    db.collection(NTTT8_FIRESTORE_COLLECTION).doc(NTTT8_FIRESTORE_DOC)
      .onSnapshot(doc => {
        if (!doc.exists) return;
        const data = doc.data();
        if (!data) return;

        const incomingStr = JSON.stringify({
          cells: data.cells || {},
          rules: data.rules || DEFAULT_NTTT8_OPERATION_RULES,
          staffList: data.staffList || NTTT8State.staffList,
          pgList: data.pgList || NTTT8State.pgList,
          areaAssignments: data.areaAssignments || NTTT8State.areaAssignments
        });
        if (incomingStr === NTTT8State.lastSyncedFingerprint) return;
        NTTT8State.lastSyncedFingerprint = incomingStr;

        if (Array.isArray(data.staffList) && data.staffList.length > 0) {
          NTTT8State.staffList = data.staffList;
          localStorage.setItem(NTTT8_STORAGE_STAFF_KEY, JSON.stringify(NTTT8State.staffList));
        }

        if (Array.isArray(data.pgList)) {
          NTTT8State.pgList = data.pgList;
          localStorage.setItem(NTTT8_STORAGE_PG_KEY, JSON.stringify(NTTT8State.pgList));
        }

        if (data.areaAssignments && typeof data.areaAssignments === 'object') {
          NTTT8State.areaAssignments = data.areaAssignments;
          localStorage.setItem(NTTT8_STORAGE_ASSIGNMENTS_KEY, JSON.stringify(NTTT8State.areaAssignments));
        }

        if (data.cells && typeof data.cells === 'object') {
          localStorage.setItem(NTTT8_STORAGE_CELLS_KEY, JSON.stringify(data.cells));
          NTTT8State.cells.forEach(cell => {
            if (cell.type !== 'static' && data.cells[cell.id]) {
              if (typeof data.cells[cell.id].area === 'string') cell.area = data.cells[cell.id].area;
              if (typeof data.cells[cell.id].staff === 'string') cell.staff = data.cells[cell.id].staff;
              if (typeof data.cells[cell.id].displayOverride === 'string') {
                cell.displayOverride = data.cells[cell.id].displayOverride;
              }
            }
          });
        }

        if (data.rules && typeof data.rules === 'object') {
          NTTT8State.rules = { ...DEFAULT_NTTT8_OPERATION_RULES, ...data.rules };
          localStorage.setItem(NTTT8_STORAGE_RULES_KEY, JSON.stringify(NTTT8State.rules));
        }

        syncNTTT8RelationalState();
        renderNTTT8AssignmentGrid();
        populateNTTT8StaffFilter();
        refreshOpenNTTT8ManagerViews();
      }, err => {
        console.warn('[8NTTT] Lắng nghe Firestore:', err);
      });
  } catch (e) {
    console.warn('[8NTTT] Không thể khởi tạo listener Firestore:', e);
  }
}

// ==========================================================================
// 2. CÁC COMPONENT HIỂN THỊ SƠ ĐỒ (AssignmentCell, CategoryLabel, WarehouseColumn, OperationRules)
// ==========================================================================

function getEffectiveCellForRenderNTTT8(cell) {
  if (NTTT8State.isExportingImage && NTTT8State.exportContentMode === 'original_sample') {
    const orig = DEFAULT_NTTT8_CELLS.find(c => c.id === cell.id);
    if (orig) return orig;
  }
  return cell;
}

function shouldShowStaffNameOnMapNTTT8() {
  if (NTTT8State.isExportingImage) {
    if (NTTT8State.exportContentMode === 'no_assignment') return false;
    if (NTTT8State.exportContentMode === 'original_sample') return true;
  }
  return Boolean(NTTT8State.showStaffOnMap);
}

function shouldShowPgNameOnMapNTTT8() {
  if (NTTT8State.isExportingImage) {
    if (NTTT8State.exportContentMode === 'no_assignment') return false;
    if (NTTT8State.exportContentMode === 'original_sample') return false;
  }
  return Boolean(NTTT8State.showPgOnMap);
}

function formatCellDisplayLabel(rawCell) {
  const cell = getEffectiveCellForRenderNTTT8(rawCell);
  if (cell.type === 'static') {
    return cell.displayOverride || cell.area || '';
  }

  const showStaff = shouldShowStaffNameOnMapNTTT8();
  const area = (cell.area || '').trim();
  const staff = showStaff ? (cell.staff || '').trim() : '';

  if (!showStaff) {
    if (cell.displayOverride && !cell.staff) {
      return cell.displayOverride;
    }
    return area;
  }

  if (cell.displayOverride && cell.displayOverride.trim() !== '') {
    return cell.displayOverride;
  }

  if (area && staff) {
    if (
      cell.orientation === 'vertical' ||
      cell.orientation === 'tilted' ||
      cell.id === 'c_vach_loa_my' ||
      cell.id === 'd_camera' ||
      cell.id === 'd_xiaomi_wall' ||
      cell.id === 'd_oppo_wall' ||
      cell.id === 'd_samsung_wall' ||
      cell.id === 'd_apple_wall'
    ) {
      return `${area} -\n${staff}`;
    }
    return `${area} - ${staff}`;
  }
  return area || staff || '';
}

function getAssignedPgNamesForCellNTTT8(cellId) {
  const assign = NTTT8State.areaAssignments ? NTTT8State.areaAssignments[cellId] : null;
  if (!assign || !Array.isArray(assign.pgIds) || assign.pgIds.length === 0) return [];
  const names = [];
  assign.pgIds.forEach(pid => {
    const pg = findPgByIdNTTT8(pid);
    if (pg && pg.status !== 'inactive') {
      names.push(pg.name);
    }
  });
  return names;
}

function escapeHtmlNTTT8(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render một ô phân công (AssignmentCell / CategoryLabel / WarehouseColumn)
 * Tích hợp hiển thị tên Nhân viên chính và PG hỗ trợ (nếu có) mà không làm mất đường kẻ viền.
 */
function createAssignmentCellHTML(cell, highlightState) {
  const isStatic = cell.type === 'static';
  const labelText = formatCellDisplayLabel(cell);
  const safeHtmlLabel = escapeHtmlNTTT8(labelText).replace(/\n/g, '<br>');

  let extraClasses = `${cell.bgClass || 'bg-nttt-white'} ${cell.borderClass || 'b-box'}`;
  if (isStatic) extraClasses += ' nttt8-static';
  if (highlightState === 'highlighted') extraClasses += ' nttt8-highlighted';
  if (highlightState === 'dimmed') extraClasses += ' nttt8-dimmed';

  const showPg = !isStatic && shouldShowPgNameOnMapNTTT8();
  const pgNames = showPg ? getAssignedPgNamesForCellNTTT8(cell.id) : [];
  const assignRec = !isStatic && NTTT8State.areaAssignments ? NTTT8State.areaAssignments[cell.id] : null;
  const showUnassignedBadge =
    !isStatic &&
    shouldShowStaffNameOnMapNTTT8() &&
    !cell.staff &&
    assignRec &&
    assignRec.unassignedByUser;

  let mainSpan = `<span>${safeHtmlLabel}</span>`;
  if (cell.orientation === 'walkway') {
    mainSpan = `<span class="nttt8-walkway-label">${safeHtmlLabel}</span>`;
  } else if (cell.orientation === 'vertical') {
    mainSpan = `<span class="nttt8-vertical-label">${safeHtmlLabel}</span>`;
  } else if (cell.orientation === 'tilted') {
    mainSpan = `<span class="nttt8-tilted-label">${safeHtmlLabel}</span>`;
  }

  let subLines = '';
  if (showUnassignedBadge) {
    subLines += `<span class="nttt8-cell-unassigned-line">CHƯA PHÂN CÔNG</span>`;
  }
  if (pgNames.length > 0) {
    subLines += `<span class="nttt8-cell-pg-line">✨ ${escapeHtmlNTTT8(pgNames.join(', '))}</span>`;
  }

  const innerContent = subLines
    ? `<div class="nttt8-cell-content-stack">${mainSpan}${subLines}</div>`
    : mainSpan;

  const clickAttr = isStatic ? '' : `onclick="openNTTT8CellEditModal('${cell.id}')"`;
  const allPgNames = !isStatic ? getAssignedPgNamesForCellNTTT8(cell.id) : [];
  const noteStr = assignRec && assignRec.note ? ` • Ghi chú: ${assignRec.note}` : '';
  const pgStr = allPgNames.length > 0 ? ` • PG hỗ trợ: ${allPgNames.join(', ')}` : '';
  const titleAttr = isStatic
    ? escapeHtmlNTTT8(labelText.replace(/\n+/g, ' '))
    : escapeHtmlNTTT8(
        `${cell.area} - NV chính: ${cell.staff || 'CHƯA PHÂN CÔNG'}${pgStr}${noteStr} (Nhấn để chỉnh sửa)`
      );

  return `
    <div
      class="nttt8-cell ${extraClasses}"
      style="grid-column: ${cell.col}; grid-row: ${cell.row};"
      data-cell-id="${cell.id}"
      data-staff="${escapeHtmlNTTT8(cell.staff)}"
      title="${titleAttr}"
      ${clickAttr}
    >
      ${innerContent}
    </div>
  `;
}

/**
 * Bật / tắt tùy chọn hiển thị tên Nhân viên hoặc tên PG trên sơ đồ
 */
function toggleNTTT8MapDisplayOption(kind, checked) {
  if (kind === 'staff') {
    NTTT8State.showStaffOnMap = Boolean(checked);
  } else if (kind === 'pg') {
    NTTT8State.showPgOnMap = Boolean(checked);
  }
  renderNTTT8AssignmentGrid();
}

/**
 * Render bảng quy định VẬN HÀNH (OperationRules) ở góc trên bên phải
 */
function createOperationRulesHTML() {
  const r = NTTT8State.rules || DEFAULT_NTTT8_OPERATION_RULES;
  return `
    <div
      class="nttt8-operation-box"
      style="grid-column: 19 / 33; grid-row: 1 / 13;"
      onclick="openNTTT8RulesEditModal()"
      title="Bảng quy định VẬN HÀNH (Nhấn để chỉnh sửa nếu cần)"
    >
      <div class="nttt8-operation-header">${escapeHtmlNTTT8(r.title)}</div>
      <div class="nttt8-operation-body">
        <p>
          ${escapeHtmlNTTT8(r.line1Prefix)}<span class="vh-highlight-red">${escapeHtmlNTTT8(r.line1Highlight)}</span>${escapeHtmlNTTT8(r.line1Suffix)}
        </p>
        <p>${escapeHtmlNTTT8(r.line2)}</p>
        <p>${escapeHtmlNTTT8(r.line3)}</p>
        <p>${escapeHtmlNTTT8(r.line4)}</p>
        <ul class="vh-sublist">
          <li>${escapeHtmlNTTT8(r.sub1)}</li>
          <li>${escapeHtmlNTTT8(r.sub2)}</li>
          <li>${escapeHtmlNTTT8(r.sub3)}</li>
        </ul>
      </div>
    </div>
  `;
}

/**
 * Render các hàng vạch chia cột kệ (Tick rows) giữa các dãy ngành hàng
 */
function createTickRowsHTML() {
  return NTTT8_TICK_ROWS.map(t => {
    if (t.kind === 'btv-connector') {
      return `<div class="nttt8-btv-connector" style="grid-column: ${t.col}; grid-row: ${t.row}; border: 1px solid #333333; background: #ffffff; height: 11px; box-sizing: border-box;"></div>`;
    }
    const cells = Array.from({ length: t.count }, () => `<div class="nttt8-tick-cell"></div>`).join('');
    return `
      <div class="nttt8-tick-row ${t.kind}" style="grid-column: ${t.col}; grid-row: ${t.row};">
        ${cells}
      </div>
    `;
  }).join('');
}

/**
 * Tạo các ô lưới trống (.nttt8-empty-grid-cell) cho toàn bộ vùng chưa có phần tử
 * (bên dưới VẬN HÀNH, bên dưới khối hồng phấn, xung quanh BTV 1..4...)
 * để giữ nguyên 100% đường kẻ lưới bảng tính trên giao diện web và khi xuất ảnh.
 */
function parseGridSpanNTTT8(spanStr) {
  const parts = String(spanStr || '').split('/').map(s => parseInt(s.trim(), 10));
  return [parts[0] || 1, parts[1] || 2];
}

function createEmptyGridCellsHTML() {
  const totalRows = 40;
  const totalCols = 35;
  const occupied = Array.from({ length: totalRows + 1 }, () => Array(totalCols + 1).fill(false));

  const markOccupied = (colSpanStr, rowSpanStr) => {
    const [c1, c2] = parseGridSpanNTTT8(colSpanStr);
    const [r1, r2] = parseGridSpanNTTT8(rowSpanStr);
    for (let r = Math.max(1, r1); r < Math.min(totalRows + 1, r2); r++) {
      for (let c = Math.max(1, c1); c < Math.min(totalCols + 1, c2); c++) {
        occupied[r][c] = true;
      }
    }
  };

  NTTT8State.cells.forEach(cell => markOccupied(cell.col, cell.row));
  NTTT8_TICK_ROWS.forEach(tick => markOccupied(tick.col, tick.row));
  // Khung VẬN HÀNH (Cột 19..33, Hàng 1..13)
  markOccupied('19 / 33', '1 / 13');

  const emptyHtml = [];
  for (let r = 1; r <= totalRows; r++) {
    for (let c = 1; c <= totalCols; c++) {
      if (!occupied[r][c]) {
        emptyHtml.push(
          `<div class="nttt8-empty-grid-cell" style="grid-column: ${c} / ${c + 1}; grid-row: ${r} / ${r + 1};"></div>`
        );
      }
    }
  }
  return emptyHtml.join('');
}

/**
 * Render toàn bộ lưới sơ đồ phân công 8NTTT (AssignmentGrid)
 */
function renderNTTT8AssignmentGrid() {
  const gridEl = document.getElementById('nttt8AssignmentGrid');
  if (!gridEl) return;

  const query = (NTTT8State.searchQuery || '').trim().toUpperCase();
  const staffFilter = (NTTT8State.selectedStaff || '').trim().toUpperCase();
  const hasFilter = Boolean(query || staffFilter);

  const emptyCellsHtml = createEmptyGridCellsHTML();

  const cellsHtml = NTTT8State.cells.map(cell => {
    let highlightState = 'normal';
    if (hasFilter && cell.type !== 'static') {
      const pgNames = getAssignedPgNamesForCellNTTT8(cell.id).join(' ');
      const cellText = `${cell.area} ${cell.staff} ${pgNames} ${cell.displayOverride || ''}`.toUpperCase();
      const cellStaff = (cell.staff || '').trim().toUpperCase();

      const matchQuery = !query || cellText.includes(query);
      let matchStaff = true;
      if (staffFilter) {
        if (staffFilter.startsWith('PG:')) {
          const targetPgName = staffFilter.slice(3).trim();
          matchStaff = pgNames.toUpperCase().includes(targetPgName);
        } else {
          matchStaff = cellStaff === staffFilter || cellText.includes(`- ${staffFilter}`);
        }
      }

      if (matchQuery && matchStaff) {
        highlightState = 'highlighted';
      } else {
        highlightState = 'dimmed';
      }
    }
    return createAssignmentCellHTML(cell, highlightState);
  }).join('');

  const ticksHtml = createTickRowsHTML();
  const rulesHtml = createOperationRulesHTML();

  gridEl.innerHTML = emptyCellsHtml + cellsHtml + ticksHtml + rulesHtml;
  applyNTTT8ZoomTransform();
}

// ==========================================================================
// 3. BỘ LỌC NHÂN VIÊN & THU PHÓNG (TOÀN SƠ ĐỒ / PHÓNG TO)
// ==========================================================================

function getAllNTTT8StaffList() {
  const staffSet = new Set();
  NTTT8State.staffList.forEach(s => {
    if (s && s.name && s.status !== 'inactive') {
      staffSet.add(s.name.trim().toUpperCase());
    }
  });
  NTTT8_KNOWN_STAFF.forEach(s => staffSet.add(s));

  if (typeof ALL_STAFF !== 'undefined' && Array.isArray(ALL_STAFF)) {
    ALL_STAFF.forEach(s => {
      if (s && String(s).trim()) staffSet.add(String(s).trim().toUpperCase());
    });
  }

  NTTT8State.cells.forEach(c => {
    if (c.staff && c.staff.trim()) {
      staffSet.add(c.staff.trim().toUpperCase());
    }
  });

  return Array.from(staffSet).sort((a, b) => a.localeCompare(b, 'vi'));
}

function populateNTTT8StaffFilter() {
  const selectEl = document.getElementById('nttt8StaffFilterSelect');
  if (!selectEl) return;

  const currentVal = NTTT8State.selectedStaff;
  const staffCounts = {};
  NTTT8State.cells.forEach(c => {
    const s = (c.staff || '').trim().toUpperCase();
    if (s) staffCounts[s] = (staffCounts[s] || 0) + 1;
  });

  const sortedStaff = Object.keys(staffCounts).sort((a, b) => a.localeCompare(b, 'vi'));
  let html = `<option value="">👤 Tất cả nhân viên (${sortedStaff.length})</option>`;
  html += sortedStaff
    .map(name => `<option value="${escapeHtmlNTTT8(name)}">👔 ${escapeHtmlNTTT8(name)} (${staffCounts[name]} vị trí)</option>`)
    .join('');

  // Thêm nhóm lọc theo PG đang hỗ trợ khu vực (nếu có)
  const pgCounts = {};
  Object.values(NTTT8State.areaAssignments || {}).forEach(rec => {
    (rec.pgIds || []).forEach(pid => {
      const pg = findPgByIdNTTT8(pid);
      if (pg) {
        pgCounts[pg.name] = (pgCounts[pg.name] || 0) + 1;
      }
    });
  });
  const sortedPg = Object.keys(pgCounts).sort((a, b) => a.localeCompare(b, 'vi'));
  if (sortedPg.length > 0) {
    html += `<optgroup label="✨ Lọc theo PG hỗ trợ">`;
    html += sortedPg
      .map(pgName => `<option value="PG:${escapeHtmlNTTT8(pgName)}">✨ ${escapeHtmlNTTT8(pgName)} (${pgCounts[pgName]} khu vực)</option>`)
      .join('');
    html += `</optgroup>`;
  }

  selectEl.innerHTML = html;
  selectEl.value = currentVal;
}

function applyNTTT8ZoomTransform() {
  const viewport = document.getElementById('nttt8ScrollViewport');
  const stage = document.getElementById('nttt8ZoomStage');
  const grid = document.getElementById('nttt8AssignmentGrid');
  const label = document.getElementById('nttt8ZoomLevelText');
  const btnFit = document.getElementById('btn8NTTTZoomFit');
  const btnActual = document.getElementById('btn8NTTTZoomActual');

  if (!viewport || !stage || !grid) return;

  if (NTTT8State.zoomMode === 'fit') {
    const availWidth = Math.max(280, viewport.clientWidth - 12);
    const naturalWidth = Math.max(1713, grid.scrollWidth || 1713);
    const scale = Math.min(1, Math.max(0.22, availWidth / naturalWidth));
    NTTT8State.zoomScale = scale;
  }

  const scale = NTTT8State.zoomScale;
  if (Math.abs(scale - 1) < 0.01) {
    stage.style.transform = 'none';
    stage.style.width = '100%';
    stage.style.height = 'auto';
  } else {
    const naturalW = Math.max(1713, grid.offsetWidth || 1713);
    const naturalH = grid.offsetHeight || 820;
    stage.style.transform = `scale(${scale})`;
    stage.style.width = `${Math.ceil(naturalW * scale)}px`;
    stage.style.height = `${Math.ceil(naturalH * scale)}px`;
  }

  if (label) {
    label.textContent = `${Math.round(scale * 100)}%`;
  }
  if (btnFit && btnActual) {
    btnFit.classList.toggle('active', NTTT8State.zoomMode === 'fit');
    btnActual.classList.toggle('active', NTTT8State.zoomMode === 'actual' && Math.abs(scale - 1) < 0.02);
  }
}

function setNTTT8ZoomMode(mode) {
  NTTT8State.zoomMode = mode;
  if (mode === 'actual') {
    NTTT8State.zoomScale = 1;
  }
  applyNTTT8ZoomTransform();
}

function stepNTTT8Zoom(delta) {
  NTTT8State.zoomMode = 'manual';
  const next = Math.min(1.5, Math.max(0.3, Math.round((NTTT8State.zoomScale + delta) * 20) / 20));
  NTTT8State.zoomScale = next;
  applyNTTT8ZoomTransform();
}

// ==========================================================================
// 4. CHỨC NĂNG CHỈNH SỬA PHÂN CÔNG TRỰC TIẾP TRÊN SƠ ĐỒ (NHÂN VIÊN CHÍNH + PG HỖ TRỢ)
// ==========================================================================

function openNTTT8CellEditModal(cellId) {
  const cell = NTTT8State.cells.find(c => c.id === cellId);
  if (!cell || cell.type === 'static') return;

  NTTT8State.editingCellId = cellId;
  const assignRec = NTTT8State.areaAssignments[cellId] || {
    cellId,
    mainStaffId: '',
    pgIds: [],
    note: '',
    unassignedByUser: false
  };
  NTTT8State.editingCellPgIds = Array.isArray(assignRec.pgIds) ? [...assignRec.pgIds] : [];

  const modal = document.getElementById('modal8NTTTEditCell');
  const areaInput = document.getElementById('nttt8EditAreaInput');
  const staffInput = document.getElementById('nttt8EditStaffInput');
  const mainStaffSelect = document.getElementById('nttt8EditMainStaffSelect');
  const pillsContainer = document.getElementById('nttt8QuickStaffPills');
  const pgPillsContainer = document.getElementById('nttt8EditCellPgPills');
  const noteInput = document.getElementById('nttt8EditCellNoteInput');

  if (!modal || !areaInput || !staffInput) return;

  areaInput.value = cell.area || '';
  staffInput.value = cell.staff || '';
  if (noteInput) noteInput.value = assignRec.note || '';

  if (mainStaffSelect) {
    const activeStaff = NTTT8State.staffList.filter(s => s.status !== 'inactive');
    mainStaffSelect.innerHTML =
      `<option value="">-- CHƯA PHÂN CÔNG --</option>` +
      activeStaff
        .map(s => `<option value="${escapeHtmlNTTT8(s.id)}">${escapeHtmlNTTT8(s.code)} - ${escapeHtmlNTTT8(s.name)} (${escapeHtmlNTTT8(s.department || 'NV')})</option>`)
        .join('');
    const matchedStaff = findStaffByIdNTTT8(assignRec.mainStaffId) || findStaffByNameNTTT8(cell.staff);
    mainStaffSelect.value = matchedStaff ? matchedStaff.id : '';
  }

  if (pillsContainer) {
    const allStaff = getAllNTTT8StaffList();
    pillsContainer.innerHTML = allStaff
      .map(name => {
        const isSelected = (cell.staff || '').trim().toUpperCase() === name;
        return `<button type="button" class="nttt8-staff-chip ${isSelected ? 'selected' : ''}" onclick="selectNTTT8QuickStaff('${escapeHtmlNTTT8(name)}')">${escapeHtmlNTTT8(name)}</button>`;
      })
      .join('');
  }

  renderNTTT8EditCellPgPills(pgPillsContainer);

  modal.classList.remove('hidden');
  setTimeout(() => staffInput.focus(), 50);
}

function renderNTTT8EditCellPgPills(container) {
  const el = container || document.getElementById('nttt8EditCellPgPills');
  if (!el) return;
  const activePgs = NTTT8State.pgList.filter(p => p.status !== 'inactive');
  if (activePgs.length === 0) {
    el.innerHTML = `<span style="font-size: 11.5px; color: #64748b;">Chưa có PG đang hoạt động. Hãy thêm PG trong mục Quản lý Nhân viên & PG.</span>`;
    return;
  }
  el.innerHTML = activePgs
    .map(pg => {
      const selected = NTTT8State.editingCellPgIds.includes(pg.id);
      const brandLabel = pg.brand ? ` (${pg.brand})` : '';
      return `<button type="button" class="nttt8-staff-chip ${selected ? 'selected' : ''}" onclick="toggleNTTT8EditCellPg('${escapeHtmlNTTT8(pg.id)}')">✨ ${escapeHtmlNTTT8(pg.name)}${escapeHtmlNTTT8(brandLabel)}</button>`;
    })
    .join('');
}

function toggleNTTT8EditCellPg(pgId) {
  const idx = NTTT8State.editingCellPgIds.indexOf(pgId);
  if (idx >= 0) {
    NTTT8State.editingCellPgIds.splice(idx, 1);
  } else {
    NTTT8State.editingCellPgIds.push(pgId);
  }
  renderNTTT8EditCellPgPills();
}

function onChangeNTTT8CellMainStaffSelect(staffId) {
  const staffObj = findStaffByIdNTTT8(staffId);
  const staffInput = document.getElementById('nttt8EditStaffInput');
  if (staffInput) {
    staffInput.value = staffObj ? staffObj.name : '';
  }
  selectNTTT8QuickStaff(staffObj ? staffObj.name : '');
}

function selectNTTT8QuickStaff(staffName) {
  const staffInput = document.getElementById('nttt8EditStaffInput');
  if (staffInput) {
    staffInput.value = staffName;
  }
  const mainStaffSelect = document.getElementById('nttt8EditMainStaffSelect');
  if (mainStaffSelect) {
    const matched = findStaffByNameNTTT8(staffName);
    mainStaffSelect.value = matched ? matched.id : '';
  }
  const pills = document.querySelectorAll('#nttt8QuickStaffPills .nttt8-staff-chip');
  pills.forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.trim().toUpperCase() === String(staffName || '').toUpperCase());
  });
}

function clearNTTT8CellAssignmentInModal() {
  const staffInput = document.getElementById('nttt8EditStaffInput');
  const mainStaffSelect = document.getElementById('nttt8EditMainStaffSelect');
  if (staffInput) staffInput.value = '';
  if (mainStaffSelect) mainStaffSelect.value = '';
  NTTT8State.editingCellPgIds = [];
  selectNTTT8QuickStaff('');
  renderNTTT8EditCellPgPills();
}

function closeNTTT8CellEditModal() {
  NTTT8State.editingCellId = null;
  NTTT8State.editingCellPgIds = [];
  const modal = document.getElementById('modal8NTTTEditCell');
  if (modal) modal.classList.add('hidden');
}

function confirmSaveNTTT8CellEdit() {
  if (!NTTT8State.editingCellId) return;
  const cell = NTTT8State.cells.find(c => c.id === NTTT8State.editingCellId);
  if (!cell) return;

  const areaInput = document.getElementById('nttt8EditAreaInput');
  const staffInput = document.getElementById('nttt8EditStaffInput');
  const noteInput = document.getElementById('nttt8EditCellNoteInput');

  const newArea = areaInput ? areaInput.value.trim().toUpperCase() : cell.area;
  const newStaff = staffInput ? staffInput.value.trim().toUpperCase() : '';
  const newNote = noteInput ? noteInput.value.trim() : '';

  if (!newArea) {
    alert('Vui lòng nhập tên ngành hàng / khu vực.');
    return;
  }

  cell.area = newArea;
  cell.staff = newStaff;
  if (cell.displayOverride) {
    delete cell.displayOverride;
  }

  const matchedStaff = newStaff ? ensureStaffRegisteredByNameNTTT8(newStaff) : null;
  NTTT8State.areaAssignments[cell.id] = {
    cellId: cell.id,
    mainStaffId: matchedStaff ? matchedStaff.id : '',
    pgIds: [...NTTT8State.editingCellPgIds],
    note: newNote,
    unassignedByUser: !matchedStaff
  };

  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  refreshOpenNTTT8ManagerViews();
  closeNTTT8CellEditModal();

  if (typeof showToast === 'function') {
    showToast(`Đã cập nhật khu vực "${newArea}${newStaff ? ' - ' + newStaff : ' (CHƯA PHÂN CÔNG)'}"`);
  }
}

// Chỉnh sửa bảng quy định VẬN HÀNH (nếu người dùng muốn cập nhật)
function openNTTT8RulesEditModal() {
  const modal = document.getElementById('modal8NTTTEditRules');
  if (!modal) return;

  const r = NTTT8State.rules || DEFAULT_NTTT8_OPERATION_RULES;
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('nttt8RuleTitleInput', r.title);
  setVal('nttt8Rule1PrefixInput', r.line1Prefix);
  setVal('nttt8Rule1RedInput', r.line1Highlight);
  setVal('nttt8Rule1SuffixInput', r.line1Suffix);
  setVal('nttt8Rule2Input', r.line2);
  setVal('nttt8Rule3Input', r.line3);
  setVal('nttt8Rule4Input', r.line4);
  setVal('nttt8RuleSub1Input', r.sub1);
  setVal('nttt8RuleSub2Input', r.sub2);
  setVal('nttt8RuleSub3Input', r.sub3);

  modal.classList.remove('hidden');
}

function closeNTTT8RulesEditModal() {
  const modal = document.getElementById('modal8NTTTEditRules');
  if (modal) modal.classList.add('hidden');
}

function confirmSaveNTTT8RulesEdit() {
  const getVal = (id, fallback) => {
    const el = document.getElementById(id);
    return el && el.value.trim() ? el.value.trim() : fallback;
  };

  NTTT8State.rules = {
    title: getVal('nttt8RuleTitleInput', DEFAULT_NTTT8_OPERATION_RULES.title),
    line1Prefix: getVal('nttt8Rule1PrefixInput', DEFAULT_NTTT8_OPERATION_RULES.line1Prefix),
    line1Highlight: getVal('nttt8Rule1RedInput', DEFAULT_NTTT8_OPERATION_RULES.line1Highlight),
    line1Suffix: getVal('nttt8Rule1SuffixInput', DEFAULT_NTTT8_OPERATION_RULES.line1Suffix),
    line2: getVal('nttt8Rule2Input', DEFAULT_NTTT8_OPERATION_RULES.line2),
    line3: getVal('nttt8Rule3Input', DEFAULT_NTTT8_OPERATION_RULES.line3),
    line4: getVal('nttt8Rule4Input', DEFAULT_NTTT8_OPERATION_RULES.line4),
    sub1: getVal('nttt8RuleSub1Input', DEFAULT_NTTT8_OPERATION_RULES.sub1),
    sub2: getVal('nttt8RuleSub2Input', DEFAULT_NTTT8_OPERATION_RULES.sub2),
    sub3: getVal('nttt8RuleSub3Input', DEFAULT_NTTT8_OPERATION_RULES.sub3)
  };

  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  closeNTTT8RulesEditModal();

  if (typeof showToast === 'function') {
    showToast('Đã lưu bảng quy định VẬN HÀNH');
  }
}

function resetNTTT8ToDefaultData() {
  if (!confirm('Bạn có chắc chắn muốn khôi phục sơ đồ 8NTTT về dữ liệu phân công gốc ban đầu không?')) {
    return;
  }
  localStorage.removeItem(NTTT8_STORAGE_CELLS_KEY);
  localStorage.removeItem(NTTT8_STORAGE_RULES_KEY);
  localStorage.removeItem(NTTT8_STORAGE_STAFF_KEY);
  localStorage.removeItem(NTTT8_STORAGE_PG_KEY);
  localStorage.removeItem(NTTT8_STORAGE_ASSIGNMENTS_KEY);
  NTTT8State.rules = { ...DEFAULT_NTTT8_OPERATION_RULES };
  loadNTTT8Data();
  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  refreshOpenNTTT8ManagerViews();

  if (typeof showToast === 'function') {
    showToast('Đã khôi phục sơ đồ 8NTTT về dữ liệu gốc');
  }
}

// ==========================================================================
// 5. DASHBOARD QUẢN LÝ NHÂN VIÊN, PG HỖ TRỢ & PHÂN CÔNG KHU VỰC
// ==========================================================================

function getAssignableCellsNTTT8() {
  return NTTT8State.cells.filter(c => c.type !== 'static');
}

function getAreasAssignedToStaffNTTT8(staffId) {
  if (!staffId) return [];
  return getAssignableCellsNTTT8().filter(cell => {
    const rec = NTTT8State.areaAssignments[cell.id];
    return rec && rec.mainStaffId === staffId;
  });
}

function getAreasAssignedToPgNTTT8(pgId) {
  if (!pgId) return [];
  return getAssignableCellsNTTT8().filter(cell => {
    const rec = NTTT8State.areaAssignments[cell.id];
    return rec && Array.isArray(rec.pgIds) && rec.pgIds.includes(pgId);
  });
}

function updateNTTT8DashboardKpis() {
  const totalStaffEl = document.getElementById('nttt8KpiTotalStaff');
  const activeStaffEl = document.getElementById('nttt8KpiActiveStaff');
  const totalPgEl = document.getElementById('nttt8KpiTotalPg');
  const activePgEl = document.getElementById('nttt8KpiActivePg');
  const assignedCountEl = document.getElementById('nttt8KpiAssignedCount');
  const assignedSubEl = document.getElementById('nttt8KpiAssignedSub');
  const unassignedCountEl = document.getElementById('nttt8KpiUnassignedCount');

  const totalStaff = NTTT8State.staffList.length;
  const activeStaff = NTTT8State.staffList.filter(s => s.status !== 'inactive').length;
  const totalPg = NTTT8State.pgList.length;
  const activePg = NTTT8State.pgList.filter(p => p.status !== 'inactive').length;

  const assignableCells = getAssignableCellsNTTT8();
  let assignedAreas = 0;
  let unassignedAreas = 0;
  let areasWithPg = 0;

  assignableCells.forEach(cell => {
    const rec = NTTT8State.areaAssignments[cell.id];
    if (rec && rec.mainStaffId && findStaffByIdNTTT8(rec.mainStaffId)) {
      assignedAreas++;
    } else {
      unassignedAreas++;
    }
    if (rec && Array.isArray(rec.pgIds) && rec.pgIds.length > 0) {
      areasWithPg++;
    }
  });

  if (totalStaffEl) totalStaffEl.textContent = String(totalStaff);
  if (activeStaffEl) activeStaffEl.textContent = `${activeStaff} đang làm việc`;
  if (totalPgEl) totalPgEl.textContent = String(totalPg);
  if (activePgEl) activePgEl.textContent = `${activePg} đang hoạt động`;
  if (assignedCountEl) assignedCountEl.textContent = `${assignedAreas} / ${assignableCells.length}`;
  if (assignedSubEl) assignedSubEl.textContent = `${areasWithPg} khu vực có PG hỗ trợ`;
  if (unassignedCountEl) unassignedCountEl.textContent = String(unassignedAreas);
}

function refreshOpenNTTT8ManagerViews() {
  updateNTTT8DashboardKpis();
  populateNTTT8ManagerFilterDropdowns();
  renderNTTT8StaffTable();
  renderNTTT8PgTable();
  renderNTTT8AreaAssignmentTable();
  renderNTTT8QuickSetupLists();
  renderNTTT8QuickPreviewTable();
}

function openNTTT8StaffPgManagerModal(initialTab = 'staff') {
  const modal = document.getElementById('modal8NTTTStaffPgManager');
  if (!modal) return;
  syncNTTT8RelationalState();
  refreshOpenNTTT8ManagerViews();
  switchNTTT8ManagerTab(initialTab || 'staff');
  modal.classList.remove('hidden');
}

function closeNTTT8StaffPgManagerModal() {
  const modal = document.getElementById('modal8NTTTStaffPgManager');
  if (modal) modal.classList.add('hidden');
}

function switchNTTT8ManagerTab(tabName) {
  NTTT8State.activeManagerTab = tabName;
  const tabs = {
    staff: { btn: 'btn8NTTTTabStaff', pane: 'nttt8PaneStaff' },
    pg: { btn: 'btn8NTTTTabPg', pane: 'nttt8PanePg' },
    assign: { btn: 'btn8NTTTTabAssign', pane: 'nttt8PaneAssign' },
    quick: { btn: 'btn8NTTTTabQuick', pane: 'nttt8PaneQuick' }
  };

  Object.keys(tabs).forEach(key => {
    const btnEl = document.getElementById(tabs[key].btn);
    const paneEl = document.getElementById(tabs[key].pane);
    const isActive = key === tabName;
    if (btnEl) btnEl.classList.toggle('active', isActive);
    if (paneEl) paneEl.classList.toggle('hidden', !isActive);
  });

  if (tabName === 'quick') {
    if (NTTT8State.quickSelectedStaffIds.size === 0) {
      NTTT8State.staffList
        .filter(s => s.status !== 'inactive')
        .forEach(s => NTTT8State.quickSelectedStaffIds.add(s.id));
    }
    if (NTTT8State.quickSelectedCellIds.size === 0) {
      getAssignableCellsNTTT8().forEach(c => NTTT8State.quickSelectedCellIds.add(c.id));
    }
    renderNTTT8QuickSetupLists();
    renderNTTT8QuickPreviewTable();
  }
}

function filterNTTT8UnassignedAreas() {
  switchNTTT8ManagerTab('assign');
  const statusSelect = document.getElementById('nttt8AssignStatusFilter');
  if (statusSelect) {
    statusSelect.value = 'unassigned';
  }
  renderNTTT8AreaAssignmentTable();
}

function triggerAddNTTT8StaffFromTop() {
  switchNTTT8ManagerTab('staff');
  resetNTTT8StaffForm();
  const nameInput = document.getElementById('nttt8StaffNameInput');
  if (nameInput) nameInput.focus();
}

function triggerAddNTTT8PgFromTop() {
  switchNTTT8ManagerTab('pg');
  resetNTTT8PgForm();
  const nameInput = document.getElementById('nttt8PgNameInput');
  if (nameInput) nameInput.focus();
}

function populateNTTT8ManagerFilterDropdowns() {
  // Bộ phận Nhân viên
  const deptSelect = document.getElementById('nttt8StaffTableDeptFilter');
  if (deptSelect) {
    const cur = deptSelect.value || 'all';
    const depts = Array.from(
      new Set(NTTT8State.staffList.map(s => (s.department || '').trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'vi'));
    deptSelect.innerHTML =
      `<option value="all">Tất cả nhóm / bộ phận (${depts.length})</option>` +
      depts.map(d => `<option value="${escapeHtmlNTTT8(d)}">${escapeHtmlNTTT8(d)}</option>`).join('');
    deptSelect.value = depts.includes(cur) ? cur : 'all';
  }

  // Thương hiệu & Ngành hàng PG
  const brandSelect = document.getElementById('nttt8PgBrandFilter');
  if (brandSelect) {
    const cur = brandSelect.value || 'all';
    const brands = Array.from(
      new Set(NTTT8State.pgList.map(p => (p.brand || '').trim().toUpperCase()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'vi'));
    brandSelect.innerHTML =
      `<option value="all">Tất cả thương hiệu (${brands.length})</option>` +
      brands.map(b => `<option value="${escapeHtmlNTTT8(b)}">${escapeHtmlNTTT8(b)}</option>`).join('');
    brandSelect.value = brands.includes(cur) ? cur : 'all';
  }

  const catSelect = document.getElementById('nttt8PgCategoryFilter');
  if (catSelect) {
    const cur = catSelect.value || 'all';
    const cats = Array.from(
      new Set(NTTT8State.pgList.map(p => (p.category || '').trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'vi'));
    catSelect.innerHTML =
      `<option value="all">Tất cả ngành hàng (${cats.length})</option>` +
      cats.map(c => `<option value="${escapeHtmlNTTT8(c)}">${escapeHtmlNTTT8(c)}</option>`).join('');
    catSelect.value = cats.includes(cur) ? cur : 'all';
  }

  // Dropdown lọc Nhân viên & PG trong Tab 3 (Phân công khu vực)
  const assignStaffFilter = document.getElementById('nttt8AssignStaffFilter');
  if (assignStaffFilter) {
    const cur = assignStaffFilter.value || 'all';
    assignStaffFilter.innerHTML =
      `<option value="all">Tất cả nhân viên chính</option>` +
      NTTT8State.staffList
        .map(s => `<option value="${escapeHtmlNTTT8(s.id)}">${escapeHtmlNTTT8(s.code)} - ${escapeHtmlNTTT8(s.name)}</option>`)
        .join('');
    assignStaffFilter.value = cur;
  }

  const assignPgFilter = document.getElementById('nttt8AssignPgFilter');
  if (assignPgFilter) {
    const cur = assignPgFilter.value || 'all';
    assignPgFilter.innerHTML =
      `<option value="all">Tất cả PG hỗ trợ</option>` +
      NTTT8State.pgList
        .map(p => `<option value="${escapeHtmlNTTT8(p.id)}">${escapeHtmlNTTT8(p.code)} - ${escapeHtmlNTTT8(p.name)}</option>`)
        .join('');
    assignPgFilter.value = cur;
  }
}

// -------------------- TAB 1: QUẢN LÝ NHÂN VIÊN --------------------

function showFormErrorNTTT8(elId, message) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (!message) {
    el.textContent = '';
    el.classList.add('hidden');
  } else {
    el.textContent = message;
    el.classList.remove('hidden');
  }
}

function resetNTTT8StaffForm() {
  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v;
  };
  setVal('nttt8StaffEditId', '');
  setVal('nttt8StaffCodeInput', generateNextStaffCodeNTTT8());
  setVal('nttt8StaffNameInput', '');
  setVal('nttt8StaffPhoneInput', '');
  setVal('nttt8StaffTitleInput', 'Nhân viên bán hàng');
  setVal('nttt8StaffDeptInput', '');
  setVal('nttt8StaffStatusSelect', 'active');
  setVal('nttt8StaffNoteInput', '');

  const titleEl = document.getElementById('nttt8StaffFormTitle');
  if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-user-plus"></i> Thêm Nhân Viên Chính Thức';
  const submitText = document.getElementById('btn8NTTTStaffSubmitText');
  if (submitText) submitText.textContent = 'Thêm Nhân Viên';
  const cancelBtn = document.getElementById('btn8NTTTStaffCancelEdit');
  if (cancelBtn) cancelBtn.classList.add('hidden');
  showFormErrorNTTT8('nttt8StaffFormError', '');
}

function editNTTT8StaffEntry(staffId) {
  const staff = findStaffByIdNTTT8(staffId);
  if (!staff) return;

  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v || '';
  };
  setVal('nttt8StaffEditId', staff.id);
  setVal('nttt8StaffCodeInput', staff.code);
  setVal('nttt8StaffNameInput', staff.name);
  setVal('nttt8StaffPhoneInput', staff.phone);
  setVal('nttt8StaffTitleInput', staff.title);
  setVal('nttt8StaffDeptInput', staff.department);
  setVal('nttt8StaffStatusSelect', staff.status || 'active');
  setVal('nttt8StaffNoteInput', staff.note);

  const titleEl = document.getElementById('nttt8StaffFormTitle');
  if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-user-pen"></i> Chỉnh Sửa Nhân Viên: ${escapeHtmlNTTT8(staff.name)}`;
  const submitText = document.getElementById('btn8NTTTStaffSubmitText');
  if (submitText) submitText.textContent = 'Cập Nhật Nhân Viên';
  const cancelBtn = document.getElementById('btn8NTTTStaffCancelEdit');
  if (cancelBtn) cancelBtn.classList.remove('hidden');
  showFormErrorNTTT8('nttt8StaffFormError', '');
}

function saveNTTT8StaffEntry() {
  const editId = (document.getElementById('nttt8StaffEditId')?.value || '').trim();
  const rawCode = (document.getElementById('nttt8StaffCodeInput')?.value || '').trim().toUpperCase();
  const code = rawCode || generateNextStaffCodeNTTT8();
  const name = (document.getElementById('nttt8StaffNameInput')?.value || '').trim().toUpperCase();
  const phone = (document.getElementById('nttt8StaffPhoneInput')?.value || '').trim();
  const title = (document.getElementById('nttt8StaffTitleInput')?.value || '').trim() || 'Nhân viên bán hàng';
  const department = (document.getElementById('nttt8StaffDeptInput')?.value || '').trim() || 'Bán hàng siêu thị';
  const status = document.getElementById('nttt8StaffStatusSelect')?.value === 'inactive' ? 'inactive' : 'active';
  const note = (document.getElementById('nttt8StaffNoteInput')?.value || '').trim();

  if (!name) {
    showFormErrorNTTT8('nttt8StaffFormError', 'Vui lòng nhập Họ và tên nhân viên.');
    return;
  }

  if (isDuplicateEntityCodeNTTT8(code, editId)) {
    showFormErrorNTTT8('nttt8StaffFormError', `Mã nhân viên "${code}" đã tồn tại. Vui lòng chọn mã khác.`);
    return;
  }

  const dupName = NTTT8State.staffList.find(
    s => s.id !== editId && String(s.name || '').trim().toUpperCase() === name
  );
  if (dupName && !editId) {
    showFormErrorNTTT8(
      'nttt8StaffFormError',
      `Nhân viên "${name}" đã có trong danh sách (Mã: ${dupName.code}). Hãy chỉnh sửa nhân viên đó hoặc thêm ký hiệu phân biệt.`
    );
    return;
  }

  if (editId) {
    const existing = findStaffByIdNTTT8(editId);
    if (!existing) return;

    const assignedAreas = getAreasAssignedToStaffNTTT8(editId);
    if (status === 'inactive' && existing.status !== 'inactive' && assignedAreas.length > 0) {
      // Cảnh báo khi nhân viên chuyển sang ngừng hoạt động nhưng vẫn đang phụ trách khu vực
      openNTTT8ReassignConfirmModal({
        kind: 'deactivate_staff',
        entityId: editId,
        entityName: name,
        updatedFields: { code, name, phone, title, department, status, note },
        affectedCells: assignedAreas
      });
      return;
    }

    existing.code = code;
    existing.name = name;
    existing.phone = phone;
    existing.title = title;
    existing.department = department;
    existing.status = status;
    existing.note = note;
  } else {
    NTTT8State.staffList.push({
      id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      code,
      name,
      phone,
      title,
      department,
      status,
      note
    });
  }

  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  resetNTTT8StaffForm();
  refreshOpenNTTT8ManagerViews();

  if (typeof showToast === 'function') {
    showToast(editId ? `Đã cập nhật nhân viên "${name}"` : `Đã thêm nhân viên "${name}" (${code})`);
  }
}

function deleteNTTT8StaffEntry(staffId) {
  const staff = findStaffByIdNTTT8(staffId);
  if (!staff) return;

  const assignedAreas = getAreasAssignedToStaffNTTT8(staffId);
  if (assignedAreas.length > 0) {
    openNTTT8ReassignConfirmModal({
      kind: 'delete_staff',
      entityId: staffId,
      entityName: staff.name,
      affectedCells: assignedAreas
    });
    return;
  }

  if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên "${staff.name}" (${staff.code}) khỏi danh sách không?`)) {
    return;
  }

  NTTT8State.staffList = NTTT8State.staffList.filter(s => s.id !== staffId);
  NTTT8State.quickSelectedStaffIds.delete(staffId);
  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  refreshOpenNTTT8ManagerViews();

  if (typeof showToast === 'function') {
    showToast(`Đã xóa nhân viên "${staff.name}"`);
  }
}

function renderNTTT8StaffTable() {
  const tbody = document.getElementById('nttt8StaffTableBody');
  if (!tbody) return;

  const query = (document.getElementById('nttt8StaffTableSearch')?.value || '').trim().toUpperCase();
  const statusFilter = document.getElementById('nttt8StaffTableStatusFilter')?.value || 'all';
  const deptFilter = document.getElementById('nttt8StaffTableDeptFilter')?.value || 'all';

  const filtered = NTTT8State.staffList.filter(s => {
    if (statusFilter !== 'all' && (s.status || 'active') !== statusFilter) return false;
    if (deptFilter !== 'all' && (s.department || '') !== deptFilter) return false;
    if (query) {
      const hay = `${s.code} ${s.name} ${s.phone || ''} ${s.title || ''} ${s.department || ''} ${s.note || ''}`.toUpperCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #64748b; font-weight: 600;">Không tìm thấy nhân viên phù hợp với bộ lọc.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(s => {
      const areas = getAreasAssignedToStaffNTTT8(s.id);
      const areaHtml =
        areas.length > 0
          ? `<div class="nttt8-area-pill-list">${areas
              .slice(0, 4)
              .map(a => `<span class="nttt8-area-pill">${escapeHtmlNTTT8(a.area)}</span>`)
              .join('')}${areas.length > 4 ? `<span class="nttt8-area-pill">+${areas.length - 4} khu vực</span>` : ''}</div>`
          : `<span style="color: #94a3b8; font-size: 11.5px;">Chưa phụ trách khu vực</span>`;

      const isActive = s.status !== 'inactive';
      return `
        <tr>
          <td><span class="nttt8-code-badge">${escapeHtmlNTTT8(s.code)}</span></td>
          <td><strong style="color: #0f172a;">${escapeHtmlNTTT8(s.name)}</strong></td>
          <td>${escapeHtmlNTTT8(s.title || 'Nhân viên bán hàng')}</td>
          <td>${escapeHtmlNTTT8(s.department || '—')}</td>
          <td>${escapeHtmlNTTT8(s.phone || '—')}</td>
          <td><strong>${areas.length} vị trí:</strong> ${areaHtml}</td>
          <td>
            <span class="nttt8-status-badge ${isActive ? 'active' : 'inactive'}">
              ${isActive ? '🟢 Đang làm việc' : '🔴 Ngừng làm việc'}
            </span>
          </td>
          <td>${escapeHtmlNTTT8(s.note || '—')}</td>
          <td>
            <div class="nttt8-table-action-btns">
              <button type="button" class="nttt8-btn" onclick="editNTTT8StaffEntry('${escapeHtmlNTTT8(s.id)}')" title="Sửa thông tin nhân viên">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="nttt8-btn" style="color: #dc2626;" onclick="deleteNTTT8StaffEntry('${escapeHtmlNTTT8(s.id)}')" title="Xóa nhân viên">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// -------------------- TAB 2: QUẢN LÝ PG HỖ TRỢ --------------------

function resetNTTT8PgForm() {
  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v;
  };
  setVal('nttt8PgEditId', '');
  setVal('nttt8PgCodeInput', generateNextPgCodeNTTT8());
  setVal('nttt8PgNameInput', '');
  setVal('nttt8PgBrandInput', '');
  setVal('nttt8PgCategoryInput', '');
  setVal('nttt8PgSupportAreasInput', 'Khu vực A, Khu vực B');
  setVal('nttt8PgPhoneInput', '');
  setVal('nttt8PgStatusSelect', 'active');
  setVal('nttt8PgNoteInput', '');

  const titleEl = document.getElementById('nttt8PgFormTitle');
  if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-star"></i> Thêm PG Hỗ Trợ Ngành Hàng / Thương Hiệu';
  const submitText = document.getElementById('btn8NTTTPgSubmitText');
  if (submitText) submitText.textContent = 'Thêm PG Hỗ Trợ';
  const cancelBtn = document.getElementById('btn8NTTTPgCancelEdit');
  if (cancelBtn) cancelBtn.classList.add('hidden');
  showFormErrorNTTT8('nttt8PgFormError', '');
}

function editNTTT8PgEntry(pgId) {
  const pg = findPgByIdNTTT8(pgId);
  if (!pg) return;

  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v || '';
  };
  setVal('nttt8PgEditId', pg.id);
  setVal('nttt8PgCodeInput', pg.code);
  setVal('nttt8PgNameInput', pg.name);
  setVal('nttt8PgBrandInput', pg.brand);
  setVal('nttt8PgCategoryInput', pg.category);
  setVal('nttt8PgSupportAreasInput', pg.supportAreas);
  setVal('nttt8PgPhoneInput', pg.phone);
  setVal('nttt8PgStatusSelect', pg.status || 'active');
  setVal('nttt8PgNoteInput', pg.note);

  const titleEl = document.getElementById('nttt8PgFormTitle');
  if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen"></i> Chỉnh Sửa PG: ${escapeHtmlNTTT8(pg.name)}`;
  const submitText = document.getElementById('btn8NTTTPgSubmitText');
  if (submitText) submitText.textContent = 'Cập Nhật PG';
  const cancelBtn = document.getElementById('btn8NTTTPgCancelEdit');
  if (cancelBtn) cancelBtn.classList.remove('hidden');
  showFormErrorNTTT8('nttt8PgFormError', '');
}

function saveNTTT8PgEntry() {
  const editId = (document.getElementById('nttt8PgEditId')?.value || '').trim();
  const rawCode = (document.getElementById('nttt8PgCodeInput')?.value || '').trim().toUpperCase();
  const code = rawCode || generateNextPgCodeNTTT8();
  const name = (document.getElementById('nttt8PgNameInput')?.value || '').trim().toUpperCase();
  const brand = (document.getElementById('nttt8PgBrandInput')?.value || '').trim().toUpperCase();
  const category = (document.getElementById('nttt8PgCategoryInput')?.value || '').trim();
  const supportAreas = (document.getElementById('nttt8PgSupportAreasInput')?.value || '').trim();
  const phone = (document.getElementById('nttt8PgPhoneInput')?.value || '').trim();
  const status = document.getElementById('nttt8PgStatusSelect')?.value === 'inactive' ? 'inactive' : 'active';
  const note = (document.getElementById('nttt8PgNoteInput')?.value || '').trim();

  if (!name) {
    showFormErrorNTTT8('nttt8PgFormError', 'Vui lòng nhập Họ và tên PG hỗ trợ.');
    return;
  }

  if (isDuplicateEntityCodeNTTT8(code, editId)) {
    showFormErrorNTTT8('nttt8PgFormError', `Mã PG "${code}" đã bị trùng. Vui lòng chọn mã khác.`);
    return;
  }

  if (editId) {
    const existing = findPgByIdNTTT8(editId);
    if (!existing) return;

    const assignedCells = getAreasAssignedToPgNTTT8(editId);
    if (status === 'inactive' && existing.status !== 'inactive' && assignedCells.length > 0) {
      const shouldRemove = confirm(
        `PG "${name}" hiện đang hỗ trợ ${assignedCells.length} khu vực trên sơ đồ.\nBạn có muốn gỡ PG này khỏi các khu vực đó khi chuyển sang trạng thái Ngừng hoạt động không?`
      );
      if (shouldRemove) {
        Object.values(NTTT8State.areaAssignments).forEach(rec => {
          if (Array.isArray(rec.pgIds)) {
            rec.pgIds = rec.pgIds.filter(id => id !== editId);
          }
        });
      }
    }

    existing.code = code;
    existing.name = name;
    existing.brand = brand;
    existing.category = category;
    existing.supportAreas = supportAreas;
    existing.phone = phone;
    existing.status = status;
    existing.note = note;
  } else {
    NTTT8State.pgList.push({
      id: `pg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      code,
      name,
      brand,
      category,
      supportAreas,
      phone,
      status,
      note
    });
  }

  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  resetNTTT8PgForm();
  refreshOpenNTTT8ManagerViews();

  if (typeof showToast === 'function') {
    showToast(editId ? `Đã cập nhật PG "${name}"` : `Đã thêm PG "${name}" (${code})`);
  }
}

function deleteNTTT8PgEntry(pgId) {
  const pg = findPgByIdNTTT8(pgId);
  if (!pg) return;

  const assignedCells = getAreasAssignedToPgNTTT8(pgId);
  const extraWarn =
    assignedCells.length > 0
      ? `\nLưu ý: PG này đang hỗ trợ ${assignedCells.length} khu vực (${assignedCells.map(c => c.area).join(', ')}) và sẽ được gỡ khỏi các khu vực đó.`
      : '';

  if (!confirm(`Bạn có chắc chắn muốn xóa PG "${pg.name}" (${pg.code}) không?${extraWarn}`)) {
    return;
  }

  NTTT8State.pgList = NTTT8State.pgList.filter(p => p.id !== pgId);
  Object.values(NTTT8State.areaAssignments).forEach(rec => {
    if (Array.isArray(rec.pgIds)) {
      rec.pgIds = rec.pgIds.filter(id => id !== pgId);
    }
  });

  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  refreshOpenNTTT8ManagerViews();

  if (typeof showToast === 'function') {
    showToast(`Đã xóa PG "${pg.name}"`);
  }
}

function renderNTTT8PgTable() {
  const tbody = document.getElementById('nttt8PgTableBody');
  if (!tbody) return;

  const query = (document.getElementById('nttt8PgTableSearch')?.value || '').trim().toUpperCase();
  const brandFilter = document.getElementById('nttt8PgBrandFilter')?.value || 'all';
  const catFilter = document.getElementById('nttt8PgCategoryFilter')?.value || 'all';
  const statusFilter = document.getElementById('nttt8PgStatusFilter')?.value || 'all';

  const filtered = NTTT8State.pgList.filter(p => {
    if (brandFilter !== 'all' && (p.brand || '').toUpperCase() !== brandFilter) return false;
    if (catFilter !== 'all' && (p.category || '') !== catFilter) return false;
    if (statusFilter !== 'all' && (p.status || 'active') !== statusFilter) return false;
    if (query) {
      const hay = `${p.code} ${p.name} ${p.brand || ''} ${p.category || ''} ${p.supportAreas || ''} ${p.phone || ''} ${p.note || ''}`.toUpperCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 20px; color: #64748b; font-weight: 600;">Không tìm thấy PG phù hợp với bộ lọc.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(p => {
      const assignedAreas = getAreasAssignedToPgNTTT8(p.id);
      const assignedHtml =
        assignedAreas.length > 0
          ? `<div class="nttt8-area-pill-list">${assignedAreas
              .map(a => `<span class="nttt8-pg-pill">${escapeHtmlNTTT8(a.area)}</span>`)
              .join('')}</div>`
          : `<span style="color: #94a3b8; font-size: 11.5px;">Chưa gán vào ô</span>`;

      const isActive = p.status !== 'inactive';
      return `
        <tr>
          <td><span class="nttt8-code-badge pg">${escapeHtmlNTTT8(p.code)}</span></td>
          <td><strong style="color: #5b21b6;">✨ ${escapeHtmlNTTT8(p.name)}</strong></td>
          <td><strong>${escapeHtmlNTTT8(p.brand || '—')}</strong></td>
          <td>${escapeHtmlNTTT8(p.category || '—')}</td>
          <td>${escapeHtmlNTTT8(p.supportAreas || '—')}</td>
          <td><strong>${assignedAreas.length} khu vực:</strong> ${assignedHtml}</td>
          <td>${escapeHtmlNTTT8(p.phone || '—')}</td>
          <td>
            <span class="nttt8-status-badge ${isActive ? 'active' : 'inactive'}">
              ${isActive ? '🟢 Đang hoạt động' : '🔴 Ngừng hoạt động'}
            </span>
          </td>
          <td>${escapeHtmlNTTT8(p.note || '—')}</td>
          <td>
            <div class="nttt8-table-action-btns">
              <button type="button" class="nttt8-btn" onclick="editNTTT8PgEntry('${escapeHtmlNTTT8(p.id)}')" title="Chỉnh sửa PG">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="nttt8-btn" style="color: #dc2626;" onclick="deleteNTTT8PgEntry('${escapeHtmlNTTT8(p.id)}')" title="Xóa PG">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// -------------------- HỘP THOẠI XỬ LÝ KHU VỰC KHI XÓA / NGỪNG HOẠT ĐỘNG NHÂN VIÊN --------------------

function openNTTT8ReassignConfirmModal(actionPayload) {
  NTTT8State.pendingReassignAction = actionPayload;
  const modal = document.getElementById('modal8NTTTStaffReassignConfirm');
  const titleEl = document.getElementById('nttt8ReassignModalTitle');
  const descEl = document.getElementById('nttt8ReassignModalDesc');
  const boxEl = document.getElementById('nttt8ReassignAffectedAreasBox');
  const selectEl = document.getElementById('nttt8ReassignReplacementSelect');
  if (!modal || !selectEl) return;

  const { kind, entityId, entityName, affectedCells } = actionPayload;
  if (titleEl) {
    titleEl.textContent =
      kind === 'delete_staff'
        ? `Xử Lý Khu Vực Trước Khi Xóa Nhân Viên "${entityName}"`
        : `Cảnh Báo Nhân Viên "${entityName}" Ngừng Làm Việc`;
  }
  if (descEl) {
    descEl.textContent =
      kind === 'delete_staff'
        ? `Nhân viên "${entityName}" hiện đang phụ trách ${affectedCells.length} khu vực. Vui lòng chọn phương án xử lý các khu vực này trước khi xóa:`
        : `Nhân viên "${entityName}" đang phụ trách ${affectedCells.length} khu vực. Khi chuyển sang trạng thái Ngừng làm việc, bạn muốn xử lý các khu vực này như thế nào?`;
  }
  if (boxEl) {
    boxEl.innerHTML = affectedCells.map(c => `• Khu ${escapeHtmlNTTT8(c.zone)}: ${escapeHtmlNTTT8(c.area)}`).join('<br>');
  }

  const otherActiveStaff = NTTT8State.staffList.filter(s => s.id !== entityId && s.status !== 'inactive');
  let optsHtml = `<option value="__UNASSIGN__">⚠️ Gỡ phân công (Chuyển ${affectedCells.length} khu vực về "CHƯA PHÂN CÔNG")</option>`;
  if (kind === 'deactivate_staff') {
    optsHtml += `<option value="__KEEP__">📌 Giữ nguyên phân công hiện tại và chỉ đổi trạng thái</option>`;
  }
  otherActiveStaff.forEach(s => {
    optsHtml += `<option value="${escapeHtmlNTTT8(s.id)}">🔄 Chuyển giao toàn bộ cho: ${escapeHtmlNTTT8(s.code)} - ${escapeHtmlNTTT8(s.name)}</option>`;
  });
  selectEl.innerHTML = optsHtml;

  modal.classList.remove('hidden');
}

function closeNTTT8ReassignConfirmModal() {
  NTTT8State.pendingReassignAction = null;
  const modal = document.getElementById('modal8NTTTStaffReassignConfirm');
  if (modal) modal.classList.add('hidden');
}

function confirmExecuteNTTT8ReassignAction() {
  const payload = NTTT8State.pendingReassignAction;
  if (!payload) return;
  const choice = document.getElementById('nttt8ReassignReplacementSelect')?.value || '__UNASSIGN__';
  const { kind, entityId, updatedFields, affectedCells } = payload;

  if (choice === '__UNASSIGN__') {
    affectedCells.forEach(cell => {
      const rec = NTTT8State.areaAssignments[cell.id];
      if (rec) {
        rec.mainStaffId = '';
        rec.unassignedByUser = true;
      }
      cell.staff = '';
      if (cell.displayOverride) delete cell.displayOverride;
    });
  } else if (choice !== '__KEEP__') {
    const targetStaff = findStaffByIdNTTT8(choice);
    if (targetStaff) {
      affectedCells.forEach(cell => {
        const rec = NTTT8State.areaAssignments[cell.id];
        if (rec) {
          rec.mainStaffId = targetStaff.id;
          rec.unassignedByUser = false;
        }
        cell.staff = targetStaff.name;
        if (cell.displayOverride) delete cell.displayOverride;
      });
    }
  }

  if (kind === 'delete_staff') {
    NTTT8State.staffList = NTTT8State.staffList.filter(s => s.id !== entityId);
    NTTT8State.quickSelectedStaffIds.delete(entityId);
  } else if (kind === 'deactivate_staff' && updatedFields) {
    const existing = findStaffByIdNTTT8(entityId);
    if (existing) {
      Object.assign(existing, updatedFields);
    }
    resetNTTT8StaffForm();
  }

  closeNTTT8ReassignConfirmModal();
  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  refreshOpenNTTT8ManagerViews();

  if (typeof showToast === 'function') {
    showToast('Đã cập nhật trạng thái nhân sự và xử lý các khu vực liên quan.');
  }
}

// -------------------- TAB 3: PHÂN CÔNG KHU VỰC (NHÂN VIÊN CHÍNH + NHIỀU PG HỖ TRỢ) --------------------

function renderNTTT8AreaAssignmentTable() {
  const tbody = document.getElementById('nttt8AreaAssignTableBody');
  if (!tbody) return;

  const query = (document.getElementById('nttt8AssignSearchInput')?.value || '').trim().toUpperCase();
  const zoneFilter = document.getElementById('nttt8AssignZoneFilter')?.value || 'all';
  const statusFilter = document.getElementById('nttt8AssignStatusFilter')?.value || 'all';
  const staffFilter = document.getElementById('nttt8AssignStaffFilter')?.value || 'all';
  const pgFilter = document.getElementById('nttt8AssignPgFilter')?.value || 'all';

  const activeStaff = NTTT8State.staffList.filter(s => s.status !== 'inactive');
  const activePgs = NTTT8State.pgList.filter(p => p.status !== 'inactive');

  const assignableCells = getAssignableCellsNTTT8().filter(cell => {
    const rec = NTTT8State.areaAssignments[cell.id] || { mainStaffId: '', pgIds: [], note: '' };
    const hasStaff = Boolean(rec.mainStaffId && findStaffByIdNTTT8(rec.mainStaffId));
    const hasPg = Array.isArray(rec.pgIds) && rec.pgIds.length > 0;

    if (zoneFilter !== 'all' && cell.zone !== zoneFilter) return false;
    if (statusFilter === 'assigned' && !hasStaff) return false;
    if (statusFilter === 'unassigned' && hasStaff) return false;
    if (statusFilter === 'has_pg' && !hasPg) return false;
    if (statusFilter === 'no_pg' && hasPg) return false;
    if (staffFilter !== 'all' && rec.mainStaffId !== staffFilter) return false;
    if (pgFilter !== 'all' && (!Array.isArray(rec.pgIds) || !rec.pgIds.includes(pgFilter))) return false;

    if (query) {
      const pgNames = getAssignedPgNamesForCellNTTT8(cell.id).join(' ');
      const hay = `${cell.zone} ${cell.area} ${cell.staff || ''} ${pgNames} ${rec.note || ''}`.toUpperCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  if (assignableCells.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #64748b; font-weight: 600;">Không có khu vực nào khớp với điều kiện lọc.</td></tr>`;
    return;
  }

  tbody.innerHTML = assignableCells
    .map(cell => {
      const rec = NTTT8State.areaAssignments[cell.id] || { mainStaffId: '', pgIds: [], note: '' };
      const currentStaff = findStaffByIdNTTT8(rec.mainStaffId);
      const isAssigned = Boolean(currentStaff);

      const staffOptionsHtml =
        `<option value="">-- CHƯA PHÂN CÔNG --</option>` +
        activeStaff
          .map(
            s =>
              `<option value="${escapeHtmlNTTT8(s.id)}" ${rec.mainStaffId === s.id ? 'selected' : ''}>${escapeHtmlNTTT8(s.code)} - ${escapeHtmlNTTT8(s.name)}</option>`
          )
          .join('');

      const assignedPgPills = (rec.pgIds || [])
        .map(pid => {
          const pg = findPgByIdNTTT8(pid);
          if (!pg) return '';
          return `
            <span class="nttt8-pg-pill">
              ✨ ${escapeHtmlNTTT8(pg.name)}
              <button type="button" onclick="removeNTTT8PgFromArea('${escapeHtmlNTTT8(cell.id)}', '${escapeHtmlNTTT8(pg.id)}')" title="Gỡ PG này khỏi khu vực">&times;</button>
            </span>
          `;
        })
        .join('');

      const availablePgs = activePgs.filter(p => !(rec.pgIds || []).includes(p.id));
      const addPgSelectHtml =
        availablePgs.length > 0
          ? `<select class="nttt8-form-select" style="width: auto; min-width: 125px; padding: 3px 6px; font-size: 11.5px;" onchange="if(this.value){ addNTTT8PgToArea('${escapeHtmlNTTT8(cell.id)}', this.value); this.value=''; }">
              <option value="">+ Thêm PG hỗ trợ...</option>
              ${availablePgs
                .map(p => `<option value="${escapeHtmlNTTT8(p.id)}">✨ ${escapeHtmlNTTT8(p.name)} (${escapeHtmlNTTT8(p.brand || 'PG')})</option>`)
                .join('')}
            </select>`
          : '';

      return `
        <tr>
          <td><span class="nttt8-code-badge">Khu ${escapeHtmlNTTT8(cell.zone)}</span></td>
          <td><strong>${escapeHtmlNTTT8(cell.area)}</strong></td>
          <td>
            ${
              isAssigned
                ? `<span class="nttt8-status-badge active">✅ Đã phân công</span>`
                : `<span class="nttt8-status-badge unassigned">⚠️ CHƯA PHÂN CÔNG</span>`
            }
          </td>
          <td>
            <select class="nttt8-form-select" style="padding: 5px 8px; font-size: 12px;" onchange="assignNTTT8MainStaffToArea('${escapeHtmlNTTT8(cell.id)}', this.value)">
              ${staffOptionsHtml}
            </select>
          </td>
          <td>
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 5px;">
              ${assignedPgPills || '<span style="color: #94a3b8; font-size: 11px;">Chưa có PG</span>'}
              ${addPgSelectHtml}
            </div>
          </td>
          <td>
            <input type="text" class="nttt8-form-input" style="padding: 5px 8px; font-size: 12px;" value="${escapeHtmlNTTT8(rec.note || '')}" placeholder="Ghi chú..." onchange="updateNTTT8AreaNote('${escapeHtmlNTTT8(cell.id)}', this.value)">
          </td>
          <td style="text-align: center;">
            <button type="button" class="nttt8-btn" onclick="openNTTT8CellEditModal('${escapeHtmlNTTT8(cell.id)}')" title="Mở hộp thoại chỉnh sửa chi tiết khu vực này">
              <i class="fa-solid fa-sliders"></i>
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function assignNTTT8MainStaffToArea(cellId, staffId) {
  const cell = NTTT8State.cells.find(c => c.id === cellId);
  if (!cell) return;
  if (!NTTT8State.areaAssignments[cellId]) {
    NTTT8State.areaAssignments[cellId] = { cellId, mainStaffId: '', pgIds: [], note: '', unassignedByUser: false };
  }
  const staffObj = findStaffByIdNTTT8(staffId);
  NTTT8State.areaAssignments[cellId].mainStaffId = staffObj ? staffObj.id : '';
  NTTT8State.areaAssignments[cellId].unassignedByUser = !staffObj;
  cell.staff = staffObj ? staffObj.name : '';
  if (cell.displayOverride) delete cell.displayOverride;

  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  updateNTTT8DashboardKpis();
  renderNTTT8AreaAssignmentTable();
  renderNTTT8StaffTable();
}

function addNTTT8PgToArea(cellId, pgId) {
  if (!cellId || !pgId) return;
  if (!NTTT8State.areaAssignments[cellId]) {
    NTTT8State.areaAssignments[cellId] = { cellId, mainStaffId: '', pgIds: [], note: '', unassignedByUser: false };
  }
  const pgIds = NTTT8State.areaAssignments[cellId].pgIds || [];
  if (!pgIds.includes(pgId)) {
    pgIds.push(pgId);
  }
  NTTT8State.areaAssignments[cellId].pgIds = pgIds;

  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  updateNTTT8DashboardKpis();
  renderNTTT8AreaAssignmentTable();
  renderNTTT8PgTable();
}

function removeNTTT8PgFromArea(cellId, pgId) {
  const rec = NTTT8State.areaAssignments[cellId];
  if (!rec || !Array.isArray(rec.pgIds)) return;
  rec.pgIds = rec.pgIds.filter(id => id !== pgId);

  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  updateNTTT8DashboardKpis();
  renderNTTT8AreaAssignmentTable();
  renderNTTT8PgTable();
}

function updateNTTT8AreaNote(cellId, noteVal) {
  if (!NTTT8State.areaAssignments[cellId]) {
    NTTT8State.areaAssignments[cellId] = { cellId, mainStaffId: '', pgIds: [], note: '', unassignedByUser: false };
  }
  NTTT8State.areaAssignments[cellId].note = String(noteVal || '').trim();
  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
}

// -------------------- TAB 4: PHÂN CHIA KHU VỰC NHANH (CÓ XEM TRƯỚC & XÁC NHẬN TRƯỚC KHI LƯU) --------------------

function renderNTTT8QuickSetupLists() {
  const staffBox = document.getElementById('nttt8QuickStaffChecklist');
  const areaBox = document.getElementById('nttt8QuickAreaChecklist');
  const zoneScope = document.getElementById('nttt8QuickZoneSelect')?.value || 'all';

  if (staffBox) {
    const activeStaff = NTTT8State.staffList.filter(s => s.status !== 'inactive');
    staffBox.innerHTML = activeStaff
      .map(s => {
        const checked = NTTT8State.quickSelectedStaffIds.has(s.id);
        const curCount = getAreasAssignedToStaffNTTT8(s.id).length;
        return `
          <label class="nttt8-quick-check-item">
            <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleNTTT8QuickStaffItem('${escapeHtmlNTTT8(s.id)}', this.checked)">
            <span>${escapeHtmlNTTT8(s.name)} <small style="color:#64748b;">(${curCount} ô)</small></span>
          </label>
        `;
      })
      .join('');
  }

  if (areaBox) {
    const filteredAreas = getAssignableCellsNTTT8().filter(cell => {
      if (zoneScope === 'unassigned') {
        const rec = NTTT8State.areaAssignments[cell.id];
        return !rec || !rec.mainStaffId;
      }
      if (zoneScope !== 'all') return cell.zone === zoneScope;
      return true;
    });

    areaBox.innerHTML = filteredAreas
      .map(cell => {
        const checked = NTTT8State.quickSelectedCellIds.has(cell.id);
        return `
          <label class="nttt8-quick-check-item">
            <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleNTTT8QuickAreaItem('${escapeHtmlNTTT8(cell.id)}', this.checked)">
            <span>[Khu ${escapeHtmlNTTT8(cell.zone)}] ${escapeHtmlNTTT8(cell.area)}</span>
          </label>
        `;
      })
      .join('');
  }
}

function toggleNTTT8QuickStaffItem(staffId, checked) {
  if (checked) NTTT8State.quickSelectedStaffIds.add(staffId);
  else NTTT8State.quickSelectedStaffIds.delete(staffId);
}

function toggleNTTT8QuickAreaItem(cellId, checked) {
  if (checked) NTTT8State.quickSelectedCellIds.add(cellId);
  else NTTT8State.quickSelectedCellIds.delete(cellId);
}

function toggleAllNTTT8QuickStaff(selectAll) {
  NTTT8State.quickSelectedStaffIds.clear();
  if (selectAll) {
    NTTT8State.staffList
      .filter(s => s.status !== 'inactive')
      .forEach(s => NTTT8State.quickSelectedStaffIds.add(s.id));
  }
  renderNTTT8QuickSetupLists();
}

function toggleAllNTTT8QuickAreas(selectAll) {
  const zoneScope = document.getElementById('nttt8QuickZoneSelect')?.value || 'all';
  const targetCells = getAssignableCellsNTTT8().filter(cell => {
    if (zoneScope === 'unassigned') {
      const rec = NTTT8State.areaAssignments[cell.id];
      return !rec || !rec.mainStaffId;
    }
    if (zoneScope !== 'all') return cell.zone === zoneScope;
    return true;
  });

  if (selectAll) {
    targetCells.forEach(c => NTTT8State.quickSelectedCellIds.add(c.id));
  } else {
    targetCells.forEach(c => NTTT8State.quickSelectedCellIds.delete(c.id));
  }
  renderNTTT8QuickSetupLists();
}

function matchSupportPgsForAreaNTTT8(areaName) {
  const normArea = String(areaName || '').toUpperCase();
  const matchedIds = [];
  NTTT8State.pgList.forEach(pg => {
    if (pg.status === 'inactive') return;
    const brand = String(pg.brand || '').trim().toUpperCase();
    if (brand && normArea.includes(brand)) {
      matchedIds.push(pg.id);
    }
  });
  return matchedIds;
}

function loadCurrentNTTT8ToQuickPreview() {
  const selectedCells = getAssignableCellsNTTT8().filter(c => NTTT8State.quickSelectedCellIds.has(c.id));
  if (selectedCells.length === 0) {
    alert('Vui lòng chọn ít nhất 1 khu vực ở mục 2 để đưa vào bảng xem trước.');
    return;
  }

  NTTT8State.quickPreviewList = selectedCells.map(cell => {
    const rec = NTTT8State.areaAssignments[cell.id] || { mainStaffId: '', pgIds: [], note: '' };
    return {
      cellId: cell.id,
      zone: cell.zone,
      area: cell.area,
      oldStaffName: cell.staff || 'CHƯA PHÂN CÔNG',
      mainStaffId: rec.mainStaffId || '',
      pgIds: Array.isArray(rec.pgIds) ? [...rec.pgIds] : [],
      note: rec.note || ''
    };
  });

  renderNTTT8QuickPreviewTable();
}

/**
 * Tự động chia đều khu vực theo số lượng và khối lượng (độ rộng cột/hàng) cho danh sách nhân viên đã chọn
 * Chỉ tạo bản xem trước (Preview), KHÔNG tự động lưu khi người dùng chưa xác nhận.
 */
function generateNTTT8QuickAutoDistribution() {
  const chosenStaff = NTTT8State.staffList.filter(
    s => s.status !== 'inactive' && NTTT8State.quickSelectedStaffIds.has(s.id)
  );
  const chosenCells = getAssignableCellsNTTT8().filter(c => NTTT8State.quickSelectedCellIds.has(c.id));

  if (chosenStaff.length === 0) {
    alert('Vui lòng chọn ít nhất 1 nhân viên tham gia ở bước 1.');
    return;
  }
  if (chosenCells.length === 0) {
    alert('Vui lòng chọn ít nhất 1 khu vực cần phân công ở bước 2.');
    return;
  }

  const autoMatchPg = Boolean(document.getElementById('chk8NTTTQuickAutoMatchPg')?.checked);

  // Tính khối lượng từng khu vực dựa trên độ phủ lưới để chia cân bằng
  const workloads = {};
  chosenStaff.forEach(s => {
    workloads[s.id] = { count: 0, weight: 0 };
  });

  NTTT8State.quickPreviewList = chosenCells.map(cell => {
    const [c1, c2] = parseGridSpanNTTT8(cell.col);
    const [r1, r2] = parseGridSpanNTTT8(cell.row);
    const cellWeight = Math.max(1, (c2 - c1) * (r2 - r1));

    // Chọn nhân viên đang có tổng khối lượng thấp nhất
    chosenStaff.sort((a, b) => {
      if (workloads[a.id].count !== workloads[b.id].count) {
        return workloads[a.id].count - workloads[b.id].count;
      }
      return workloads[a.id].weight - workloads[b.id].weight;
    });

    const pickedStaff = chosenStaff[0];
    workloads[pickedStaff.id].count += 1;
    workloads[pickedStaff.id].weight += cellWeight;

    const existingRec = NTTT8State.areaAssignments[cell.id] || { pgIds: [], note: '' };
    const pgIds = autoMatchPg
      ? Array.from(new Set([...(existingRec.pgIds || []), ...matchSupportPgsForAreaNTTT8(cell.area)]))
      : [...(existingRec.pgIds || [])];

    return {
      cellId: cell.id,
      zone: cell.zone,
      area: cell.area,
      oldStaffName: cell.staff || 'CHƯA PHÂN CÔNG',
      mainStaffId: pickedStaff.id,
      pgIds,
      note: existingRec.note || ''
    };
  });

  renderNTTT8QuickPreviewTable();
  if (typeof showToast === 'function') {
    showToast(`Đã tạo bản xem trước phân công ${chosenCells.length} khu vực cho ${chosenStaff.length} nhân viên.`);
  }
}

function renderNTTT8QuickPreviewTable() {
  const tbody = document.getElementById('nttt8QuickPreviewTableBody');
  const summaryEl = document.getElementById('nttt8QuickPreviewSummary');
  if (!tbody) return;

  const list = NTTT8State.quickPreviewList || [];
  if (summaryEl) {
    if (list.length === 0) {
      summaryEl.textContent = 'Chưa có bản xem trước';
    } else {
      const assignedCount = list.filter(item => Boolean(item.mainStaffId)).length;
      const unassignedCount = list.length - assignedCount;
      summaryEl.textContent = `Đang xem trước ${list.length} khu vực (${assignedCount} đã gán, ${unassignedCount} CHƯA PHÂN CÔNG)`;
    }
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 18px; color: #64748b; font-weight: 600;">Nhấn nút <strong>"Chia Đều Tự Động & Xem Trước"</strong> hoặc <strong>"Nạp khu vực đã chọn"</strong> ở trên để xem trước và chỉnh sửa phân công.</td></tr>`;
    return;
  }

  const activeStaff = NTTT8State.staffList.filter(s => s.status !== 'inactive');
  const activePgs = NTTT8State.pgList.filter(p => p.status !== 'inactive');

  tbody.innerHTML = list
    .map((item, idx) => {
      const staffSelectHtml =
        `<option value="">⚠️ CHƯA PHÂN CÔNG</option>` +
        activeStaff
          .map(
            s =>
              `<option value="${escapeHtmlNTTT8(s.id)}" ${item.mainStaffId === s.id ? 'selected' : ''}>${escapeHtmlNTTT8(s.code)} - ${escapeHtmlNTTT8(s.name)}</option>`
          )
          .join('');

      const pgTags = (item.pgIds || [])
        .map(pid => {
          const pg = findPgByIdNTTT8(pid);
          if (!pg) return '';
          return `<span class="nttt8-pg-pill">✨ ${escapeHtmlNTTT8(pg.name)} <button type="button" onclick="removeNTTT8QuickPreviewPg(${idx}, '${escapeHtmlNTTT8(pg.id)}')">&times;</button></span>`;
        })
        .join('');

      const availPgs = activePgs.filter(p => !(item.pgIds || []).includes(p.id));
      const addPgSelect =
        availPgs.length > 0
          ? `<select class="nttt8-form-select" style="width:auto; min-width:115px; padding:2px 6px; font-size:11px;" onchange="if(this.value){ addNTTT8QuickPreviewPg(${idx}, this.value); this.value=''; }">
              <option value="">+ Gán PG...</option>
              ${availPgs.map(p => `<option value="${escapeHtmlNTTT8(p.id)}">✨ ${escapeHtmlNTTT8(p.name)}</option>`).join('')}
            </select>`
          : '';

      return `
        <tr>
          <td><span class="nttt8-code-badge">Khu ${escapeHtmlNTTT8(item.zone)}</span></td>
          <td><strong>${escapeHtmlNTTT8(item.area)}</strong></td>
          <td><span style="color:#475569; font-weight:700;">${escapeHtmlNTTT8(item.oldStaffName)}</span></td>
          <td>
            <select class="nttt8-form-select" style="padding: 4px 8px; font-size: 12px;" onchange="updateNTTT8QuickPreviewStaff(${idx}, this.value)">
              ${staffSelectHtml}
            </select>
          </td>
          <td>
            <div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
              ${pgTags || '<span style="color:#94a3b8; font-size:11px;">Không</span>'}
              ${addPgSelect}
            </div>
          </td>
          <td>
            <input type="text" class="nttt8-form-input" style="padding:4px 8px; font-size:12px;" value="${escapeHtmlNTTT8(item.note || '')}" placeholder="Ghi chú..." onchange="updateNTTT8QuickPreviewNote(${idx}, this.value)">
          </td>
          <td style="text-align: center;">
            <button type="button" class="nttt8-btn" style="color:#dc2626;" onclick="removeNTTT8QuickPreviewRow(${idx})" title="Bỏ khu vực này khỏi danh sách xem trước">&times;</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function updateNTTT8QuickPreviewStaff(idx, staffId) {
  if (!NTTT8State.quickPreviewList[idx]) return;
  NTTT8State.quickPreviewList[idx].mainStaffId = staffId || '';
  renderNTTT8QuickPreviewTable();
}

function addNTTT8QuickPreviewPg(idx, pgId) {
  const row = NTTT8State.quickPreviewList[idx];
  if (!row || !pgId) return;
  if (!row.pgIds.includes(pgId)) row.pgIds.push(pgId);
  renderNTTT8QuickPreviewTable();
}

function removeNTTT8QuickPreviewPg(idx, pgId) {
  const row = NTTT8State.quickPreviewList[idx];
  if (!row) return;
  row.pgIds = row.pgIds.filter(id => id !== pgId);
  renderNTTT8QuickPreviewTable();
}

function updateNTTT8QuickPreviewNote(idx, note) {
  if (!NTTT8State.quickPreviewList[idx]) return;
  NTTT8State.quickPreviewList[idx].note = String(note || '').trim();
}

function removeNTTT8QuickPreviewRow(idx) {
  NTTT8State.quickPreviewList.splice(idx, 1);
  renderNTTT8QuickPreviewTable();
}

function clearNTTT8QuickPreview() {
  NTTT8State.quickPreviewList = [];
  renderNTTT8QuickPreviewTable();
}

function confirmSaveNTTT8QuickAssignment() {
  const list = NTTT8State.quickPreviewList || [];
  if (list.length === 0) {
    alert('Chưa có dữ liệu phân công trong bảng xem trước để lưu.');
    return;
  }

  list.forEach(item => {
    const cell = NTTT8State.cells.find(c => c.id === item.cellId);
    if (!cell) return;
    const staffObj = findStaffByIdNTTT8(item.mainStaffId);
    NTTT8State.areaAssignments[cell.id] = {
      cellId: cell.id,
      mainStaffId: staffObj ? staffObj.id : '',
      pgIds: [...(item.pgIds || [])],
      note: item.note || '',
      unassignedByUser: !staffObj
    };
    cell.staff = staffObj ? staffObj.name : '';
    if (cell.displayOverride) delete cell.displayOverride;
  });

  NTTT8State.quickPreviewList = [];
  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  refreshOpenNTTT8ManagerViews();

  if (typeof showToast === 'function') {
    showToast(`Đã lưu phân công chính thức cho ${list.length} khu vực trên sơ đồ 8NTTT!`);
  }
}

// -------------------- NHẬP HÀNG LOẠT (DÁN NHIỀU DÒNG & FILE EXCEL/CSV) & XUẤT DANH SÁCH --------------------

function openNTTT8BulkImportModal(mode = 'staff') {
  const modal = document.getElementById('modal8NTTTBulkImport');
  const modeInput = document.getElementById('nttt8BulkImportMode');
  const titleEl = document.getElementById('nttt8BulkImportTitle');
  const hintEl = document.getElementById('nttt8BulkImportHint');
  const textarea = document.getElementById('nttt8BulkImportTextarea');
  if (!modal || !modeInput || !textarea) return;

  modeInput.value = mode === 'pg' ? 'pg' : 'staff';
  textarea.value = '';
  showFormErrorNTTT8('nttt8BulkImportError', '');

  if (mode === 'pg') {
    if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-paste" style="color:#7c3aed; margin-right:6px;"></i>Nhập Danh Sách PG Hỗ Trợ Nhiều Dòng';
    if (hintEl) {
      hintEl.innerHTML = 'Dán mỗi PG trên 1 dòng theo định dạng: <strong>Họ tên PG | Thương hiệu | Ngành hàng | Khu vực hỗ trợ | Số ĐT</strong> (hoặc chỉ cần nhập Họ tên PG).';
    }
    textarea.placeholder = 'VD:\nPG MINH THƯ | SAMSUNG | Tủ lạnh & Máy giặt | Khu vực A, Khu vực B | 0909123456\nPG HỒNG NGỌC | LG | Tivi & Tủ lạnh | Khu vực B';
  } else {
    if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-paste" style="color:#0284c7; margin-right:6px;"></i>Nhập Danh Sách Nhân Viên Nhiều Dòng';
    if (hintEl) {
      hintEl.innerHTML = 'Dán mỗi nhân viên trên 1 dòng theo định dạng: <strong>Họ và tên | Số ĐT | Chức danh | Nhóm/Bộ phận | Ghi chú</strong> (hoặc chỉ cần nhập Họ và tên).';
    }
    textarea.placeholder = 'VD:\nNGUYỄN VĂN AN | 0901234567 | Nhân viên bán hàng | Điện lạnh\nTRẦN THỊ BÌNH | 0912345678 | Tư vấn viên | Gia dụng\nLÊ HOÀNG NAM';
  }

  modal.classList.remove('hidden');
  setTimeout(() => textarea.focus(), 50);
}

function closeNTTT8BulkImportModal() {
  const modal = document.getElementById('modal8NTTTBulkImport');
  if (modal) modal.classList.add('hidden');
}

function parseNTTT8BulkLines(rawText, mode = 'staff') {
  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  let addedCount = 0;
  lines.forEach((line, index) => {
    // Bỏ qua dòng tiêu đề nếu người dùng copy cả header từ Excel
    const upperLine = line.toUpperCase();
    if (index === 0 && (upperLine.includes('HỌ VÀ TÊN') || upperLine.includes('MÃ NHÂN VIÊN') || upperLine.includes('MÃ PG'))) {
      return;
    }

    const parts = line.includes('\t')
      ? line.split('\t').map(s => s.trim())
      : line.includes('|')
      ? line.split('|').map(s => s.trim())
      : line.split(',').map(s => s.trim());

    if (mode === 'pg') {
      let code = '';
      let name = '';
      let brand = '';
      let category = '';
      let supportAreas = 'Khu vực A, Khu vực B';
      let phone = '';

      if (parts.length >= 2 && /^PG\d+/i.test(parts[0])) {
        code = parts[0].toUpperCase();
        name = (parts[1] || '').toUpperCase();
        brand = (parts[2] || '').toUpperCase();
        category = parts[3] || '';
        supportAreas = parts[4] || supportAreas;
        phone = parts[5] || '';
      } else {
        name = (parts[0] || '').toUpperCase();
        brand = (parts[1] || '').toUpperCase();
        category = parts[2] || '';
        supportAreas = parts[3] || supportAreas;
        phone = parts[4] || '';
      }

      if (!name) return;
      if (!code || isDuplicateEntityCodeNTTT8(code)) {
        code = generateNextPgCodeNTTT8();
      }
      NTTT8State.pgList.push({
        id: `pg_${Date.now()}_${addedCount}_${Math.random().toString(36).slice(2, 5)}`,
        code,
        name,
        brand,
        category,
        supportAreas,
        phone,
        status: 'active',
        note: ''
      });
      addedCount++;
    } else {
      let code = '';
      let name = '';
      let phone = '';
      let title = 'Nhân viên bán hàng';
      let department = 'Bán hàng siêu thị';
      let note = '';

      if (parts.length >= 2 && /^NV\d+/i.test(parts[0])) {
        code = parts[0].toUpperCase();
        name = (parts[1] || '').toUpperCase();
        phone = parts[2] || '';
        title = parts[3] || title;
        department = parts[4] || department;
        note = parts[5] || '';
      } else {
        name = (parts[0] || '').toUpperCase();
        phone = parts[1] || '';
        title = parts[2] || title;
        department = parts[3] || department;
        note = parts[4] || '';
      }

      if (!name) return;
      if (findStaffByNameNTTT8(name)) return; // Tránh trùng nhân viên đã có
      if (!code || isDuplicateEntityCodeNTTT8(code)) {
        code = generateNextStaffCodeNTTT8();
      }
      NTTT8State.staffList.push({
        id: `emp_${Date.now()}_${addedCount}_${Math.random().toString(36).slice(2, 5)}`,
        code,
        name,
        phone,
        title,
        department,
        status: 'active',
        note
      });
      addedCount++;
    }
  });

  return addedCount;
}

function confirmExecuteNTTT8BulkImport() {
  const mode = document.getElementById('nttt8BulkImportMode')?.value || 'staff';
  const rawText = document.getElementById('nttt8BulkImportTextarea')?.value || '';
  if (!rawText.trim()) {
    showFormErrorNTTT8('nttt8BulkImportError', 'Vui lòng dán ít nhất 1 dòng dữ liệu.');
    return;
  }

  const added = parseNTTT8BulkLines(rawText, mode);
  if (added === 0) {
    showFormErrorNTTT8('nttt8BulkImportError', 'Không có bản ghi mới nào được thêm (có thể tên đã tồn tại hoặc dữ liệu trống).');
    return;
  }

  saveNTTT8DataToStorage(true);
  populateNTTT8StaffFilter();
  refreshOpenNTTT8ManagerViews();
  closeNTTT8BulkImportModal();

  if (typeof showToast === 'function') {
    showToast(`Đã nhập thành công ${added} ${mode === 'pg' ? 'PG hỗ trợ' : 'nhân viên'} mới!`);
  }
}

function handleNTTT8CsvUpload(mode, inputEl) {
  const file = inputEl && inputEl.files ? inputEl.files[0] : null;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const content = String(e.target?.result || '');
    const added = parseNTTT8BulkLines(content, mode);
    inputEl.value = '';
    if (added > 0) {
      saveNTTT8DataToStorage(true);
      populateNTTT8StaffFilter();
      refreshOpenNTTT8ManagerViews();
      if (typeof showToast === 'function') {
        showToast(`Đã nhập ${added} ${mode === 'pg' ? 'PG' : 'nhân viên'} từ tệp "${file.name}"!`);
      }
    } else {
      alert('Không tìm thấy bản ghi mới hợp lệ trong tệp đã chọn.');
    }
  };
  reader.readAsText(file, 'utf-8');
}

function saveAllNTTT8ManagerChanges(closeAfter = false) {
  const ok = saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  refreshOpenNTTT8ManagerViews();
  if (ok && typeof showToast === 'function') {
    showToast('Đã lưu toàn bộ dữ liệu Nhân viên, PG và Phân công khu vực!');
  }
  if (ok && closeAfter) {
    closeNTTT8StaffPgManagerModal();
  }
}

function exportNTTT8StaffPgReportCsv() {
  const csvEscape = val => `"${String(val || '').replace(/"/g, '""')}"`;
  const lines = [];

  lines.push('=== 1. DANH SÁCH NHÂN VIÊN CHÍNH THỨC ===');
  lines.push(['Mã NV', 'Họ và tên', 'Số điện thoại', 'Chức danh', 'Nhóm / Bộ phận', 'Trạng thái', 'Số khu vực phụ trách', 'Ghi chú'].map(csvEscape).join(','));
  NTTT8State.staffList.forEach(s => {
    const areas = getAreasAssignedToStaffNTTT8(s.id).map(a => a.area).join('; ');
    lines.push([
      s.code,
      s.name,
      s.phone || '',
      s.title || '',
      s.department || '',
      s.status === 'inactive' ? 'Ngừng làm việc' : 'Đang làm việc',
      areas,
      s.note || ''
    ].map(csvEscape).join(','));
  });

  lines.push('');
  lines.push('=== 2. DANH SÁCH PG HỖ TRỢ ===');
  lines.push(['Mã PG', 'Họ và tên PG', 'Thương hiệu', 'Ngành hàng hỗ trợ', 'Khu vực có thể hỗ trợ', 'Khu vực đang được gán', 'Số điện thoại', 'Trạng thái', 'Ghi chú'].map(csvEscape).join(','));
  NTTT8State.pgList.forEach(p => {
    const areas = getAreasAssignedToPgNTTT8(p.id).map(a => a.area).join('; ');
    lines.push([
      p.code,
      p.name,
      p.brand || '',
      p.category || '',
      p.supportAreas || '',
      areas,
      p.phone || '',
      p.status === 'inactive' ? 'Ngừng hoạt động' : 'Đang hoạt động',
      p.note || ''
    ].map(csvEscape).join(','));
  });

  lines.push('');
  lines.push('=== 3. BẢNG PHÂN CÔNG KHU VỰC SƠ ĐỒ 8NTTT ===');
  lines.push(['Phân khu', 'Mã ô', 'Tên khu vực / Ngành hàng', 'Trạng thái', 'Nhân viên chính', 'PG hỗ trợ', 'Ghi chú phân công'].map(csvEscape).join(','));
  getAssignableCellsNTTT8().forEach(cell => {
    const rec = NTTT8State.areaAssignments[cell.id] || {};
    const staffObj = findStaffByIdNTTT8(rec.mainStaffId);
    const pgNames = getAssignedPgNamesForCellNTTT8(cell.id).join('; ');
    lines.push([
      `Khu ${cell.zone}`,
      cell.id,
      cell.area,
      staffObj ? 'Đã phân công' : 'CHƯA PHÂN CÔNG',
      staffObj ? `${staffObj.name} (${staffObj.code})` : 'CHƯA PHÂN CÔNG',
      pgNames,
      rec.note || ''
    ].map(csvEscape).join(','));
  });

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  link.href = url;
  link.download = `Danh-Sach-Nhan-Vien-PG-8NTTT-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  if (typeof showToast === 'function') {
    showToast('Đã xuất file danh sách Nhân viên, PG & Phân công khu vực (.CSV)');
  }
}

// ==========================================================================
// 6. XUẤT ẢNH PNG & IN SƠ ĐỒ 8NTTT – HIỂN THỊ POPUP XEM TRƯỚC & SAO CHÉP CLIPBOARD
// ==========================================================================


/**
 * Giải phóng tài nguyên ảnh tạm trong bộ nhớ trình duyệt khi đóng popup hoặc tạo ảnh mới
 */
function releaseNTTT8PreviewResources() {
  if (NTTT8State.previewObjectUrl) {
    try {
      URL.revokeObjectURL(NTTT8State.previewObjectUrl);
    } catch (e) {
      // Ignore revoke error
    }
    NTTT8State.previewObjectUrl = '';
  }
  NTTT8State.previewBlob = null;

  const previewImg = document.getElementById('nttt8PreviewImg');
  if (previewImg) {
    previewImg.removeAttribute('src');
  }
}

/**
 * Cập nhật thông báo trạng thái trong popup xem trước ảnh
 */
function setNTTT8PreviewStatus(type, message) {
  const banner = document.getElementById('nttt8PreviewStatusBanner');
  const icon = document.getElementById('nttt8PreviewStatusIcon');
  const text = document.getElementById('nttt8PreviewStatusText');
  if (!banner || !text) return;

  if (!type || !message) {
    banner.classList.add('hidden');
    banner.classList.remove('status-success', 'status-error');
    return;
  }

  banner.classList.remove('hidden', 'status-success', 'status-error');
  if (type === 'success') {
    banner.classList.add('status-success');
    if (icon) icon.className = 'fa-solid fa-circle-check';
  } else if (type === 'error') {
    banner.classList.add('status-error');
    if (icon) icon.className = 'fa-solid fa-triangle-exclamation';
  }
  text.textContent = message;
}

/**
 * Chuyển đổi chế độ hiển thị ảnh trong popup (chỉ co giãn bằng CSS, giữ nguyên độ phân giải gốc của Blob)
 */
function setNTTT8PreviewDisplayMode(mode) {
  NTTT8State.previewDisplayMode = mode === 'actual' ? 'actual' : 'fit';
  const previewImg = document.getElementById('nttt8PreviewImg');
  const btnFit = document.getElementById('btn8NTTTPreviewFit');
  const btnActual = document.getElementById('btn8NTTTPreviewActual');

  if (previewImg) {
    previewImg.classList.toggle('fit-mode', NTTT8State.previewDisplayMode === 'fit');
    previewImg.classList.toggle('actual-mode', NTTT8State.previewDisplayMode === 'actual');
  }
  if (btnFit) btnFit.classList.toggle('active', NTTT8State.previewDisplayMode === 'fit');
  if (btnActual) btnActual.classList.toggle('active', NTTT8State.previewDisplayMode === 'actual');
}

/**
 * Đóng popup xem trước ảnh và thu hồi bộ nhớ ảnh tạm
 */
function closeNTTT8ImagePreviewModal() {
  const modal = document.getElementById('modal8NTTTImagePreview');
  if (modal) modal.classList.add('hidden');
  setNTTT8PreviewStatus(null, '');
  releaseNTTT8PreviewResources();
}

/**
 * Chuyển canvas thành Blob PNG trong bộ nhớ trình duyệt (Không dùng chuỗi Base64 dài)
 */
function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (!canvas || typeof canvas.toBlob !== 'function') {
      reject(new Error('Canvas không hỗ trợ tạo Blob PNG.'));
      return;
    }
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Không thể tạo Blob PNG từ sơ đồ.'));
      }
    }, 'image/png');
  });
}

/**
 * Sao chép trực tiếp Blob PNG vào Clipboard qua Clipboard API
 */
async function copyImageToClipboard(blob) {
  if (!blob) {
    throw new Error('Không có dữ liệu ảnh để sao chép.');
  }
  if (!navigator.clipboard || typeof window.ClipboardItem === 'undefined') {
    throw new Error('Trình duyệt không hỗ trợ sao chép ảnh trực tiếp.');
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob
    })
  ]);
}

/**
 * Xử lý khi người dùng nhấn nút "SAO CHÉP ẢNH" trong popup
 */
async function copyNTTT8ImageToClipboard() {
  if (NTTT8State.isCopyingImage) return;
  if (!NTTT8State.previewBlob) {
    setNTTT8PreviewStatus(
      'error',
      'Không thể sao chép ảnh trên trình duyệt này. Vui lòng thử lại hoặc tải ảnh xuống.'
    );
    return;
  }

  NTTT8State.isCopyingImage = true;
  const btnCopy = document.getElementById('btn8NTTTCopyImage');
  const origHtml = btnCopy ? btnCopy.innerHTML : '';
  if (btnCopy) {
    btnCopy.disabled = true;
    btnCopy.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang sao chép...</span>';
  }

  try {
    await copyImageToClipboard(NTTT8State.previewBlob);
    const successMsg = 'Đã sao chép ảnh! Bạn có thể dán trực tiếp vào ứng dụng cần sử dụng.';
    setNTTT8PreviewStatus('success', successMsg);
    if (typeof showToast === 'function') {
      showToast(successMsg);
    }
  } catch (err) {
    console.warn('[8NTTT] Không thể sao chép ảnh vào clipboard:', err);
    const errorMsg = 'Không thể sao chép ảnh trên trình duyệt này. Vui lòng thử lại hoặc tải ảnh xuống.';
    setNTTT8PreviewStatus('error', errorMsg);
  } finally {
    NTTT8State.isCopyingImage = false;
    if (btnCopy) {
      btnCopy.disabled = false;
      btnCopy.innerHTML = origHtml || '<i class="fa-solid fa-copy"></i> <span>SAO CHÉP ẢNH</span>';
    }
  }
}

/**
 * Tải ảnh xuống máy khi người dùng chủ động nhấn nút "TẢI ẢNH XUỐNG"
 */
function downloadNTTT8PreviewImage() {
  if (!NTTT8State.previewBlob && !NTTT8State.previewObjectUrl) {
    alert('Chưa có ảnh được tạo để tải xuống.');
    return;
  }

  const downloadUrl = NTTT8State.previewObjectUrl || URL.createObjectURL(NTTT8State.previewBlob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  link.download = `So-Do-Phan-Cong-8NTTT-${dateStr}.png`;
  link.href = downloadUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();

  if (!NTTT8State.previewObjectUrl && downloadUrl) {
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  }

  if (typeof showToast === 'function') {
    showToast('Đã tải ảnh sơ đồ phân công 8NTTT xuống máy.');
  }
}

/**
 * Vẽ tăng cường 100% đường kẻ ngang, đường kẻ dọc, ô lưới trống và khung viền ngoài
 * trực tiếp từ tọa độ DOM thực tế (getBoundingClientRect) lên Canvas sau khi html2canvas chụp.
 * Khắc phục triệt để lỗi html2canvas làm mờ/mất đường kẻ 1px hoặc mất lưới vùng trống.
 */
function reinforceNTTT8CanvasBorders(canvas, gridEl, scale) {
  if (!canvas || !gridEl) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const gridRect = gridEl.getBoundingClientRect();
  if (!gridRect.width || !gridRect.height) return;

  ctx.save();

  const snap = val => Math.round(val * scale);
  const strokeBox = (rect, color, lineWidth) => {
    const x1 = snap(rect.left - gridRect.left);
    const y1 = snap(rect.top - gridRect.top);
    const x2 = snap(rect.right - gridRect.left);
    const y2 = snap(rect.bottom - gridRect.top);
    const w = Math.max(1, x2 - x1);
    const h = Math.max(1, y2 - y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x1 + 0.5, y1 + 0.5, w - 1, h - 1);
  };

  // 1. Vẽ lưới bảng tính (#d4d4d8) cho toàn bộ các ô trống (.nttt8-empty-grid-cell)
  const emptyLineW = Math.max(1, Math.round(scale * 0.75));
  const emptyCells = gridEl.querySelectorAll('.nttt8-empty-grid-cell');
  emptyCells.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      strokeBox(r, '#d4d4d8', emptyLineW);
    }
  });

  // 2. Vẽ đường kẻ các hàng vạch chia kệ (.nttt8-tick-row, .nttt8-btv-connector, .nttt8-tick-cell)
  const cellLineW = Math.max(1, Math.round(scale));
  const tickRows = gridEl.querySelectorAll('.nttt8-tick-row, .nttt8-btv-connector');
  tickRows.forEach(rowEl => {
    const r = rowEl.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      strokeBox(r, '#333333', cellLineW);
    }
    const tickCells = rowEl.querySelectorAll('.nttt8-tick-cell');
    tickCells.forEach((tc, idx) => {
      if (idx < tickCells.length - 1) {
        const tr = tc.getBoundingClientRect();
        const x = snap(tr.right - gridRect.left) + 0.5;
        const y1 = snap(tr.top - gridRect.top);
        const y2 = snap(tr.bottom - gridRect.top);
        ctx.beginPath();
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = cellLineW;
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
      }
    });
  });

  // 3. Vẽ đầy đủ 4 cạnh đường viền (#333333) cho tất cả các ô phân công & danh mục (.nttt8-cell)
  const cells = gridEl.querySelectorAll('.nttt8-cell');
  cells.forEach(cellEl => {
    const r = cellEl.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      strokeBox(r, '#333333', cellLineW);
    }
  });

  // 4. Vẽ khung viền bảng quy định VẬN HÀNH (.nttt8-operation-box & .nttt8-operation-header)
  const opBox = gridEl.querySelector('.nttt8-operation-box');
  if (opBox) {
    const r = opBox.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      strokeBox(r, '#333333', Math.max(2, Math.round(scale * 1.2)));
    }
    const opHeader = opBox.querySelector('.nttt8-operation-header');
    if (opHeader) {
      const hr = opHeader.getBoundingClientRect();
      if (hr.width > 0 && hr.height > 0) {
        strokeBox(hr, '#333333', cellLineW);
      }
    }
  }

  // 5. Vẽ đường viền bao ngoài cùng của toàn bộ sơ đồ (#222222)
  const outerLineW = Math.max(2, Math.round(scale * 1.5));
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = outerLineW;
  const halfOuter = outerLineW / 2;
  ctx.strokeRect(
    halfOuter,
    halfOuter,
    canvas.width - outerLineW,
    canvas.height - outerLineW
  );

  ctx.restore();
}

/**
 * Cơ chế vẽ dự phòng trực tiếp từ DOM thực tế sang Canvas 2D nếu html2canvas gặp sự cố trên trình duyệt
 */
function renderNTTT8LiveDomToCanvas(gridEl, scale) {
  const gridRect = gridEl.getBoundingClientRect();
  const fullW = Math.max(1713, Math.ceil(gridRect.width));
  const fullH = Math.max(700, Math.ceil(gridRect.height));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(fullW * scale);
  canvas.height = Math.round(fullH * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, fullW, fullH);

  const allBlocks = gridEl.querySelectorAll(
    '.nttt8-empty-grid-cell, .nttt8-tick-row, .nttt8-btv-connector, .nttt8-cell, .nttt8-operation-box'
  );
  allBlocks.forEach(el => {
    const r = el.getBoundingClientRect();
    const x = r.left - gridRect.left;
    const y = r.top - gridRect.top;
    const cs = window.getComputedStyle(el);
    ctx.fillStyle = cs.backgroundColor || '#ffffff';
    ctx.fillRect(x, y, r.width, r.height);

    if (el.classList.contains('nttt8-cell')) {
      const text = (el.innerText || '').trim();
      if (text) {
        ctx.fillStyle = cs.color || '#000000';
        ctx.font = `${cs.fontWeight || '800'} ${cs.fontSize || '11px'} Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines = text.split('\n');
        const lineH = parseFloat(cs.lineHeight) || 13;
        const startY = y + r.height / 2 - ((lines.length - 1) * lineH) / 2;
        lines.forEach((line, idx) => {
          ctx.fillText(line.trim(), x + r.width / 2, startY + idx * lineH);
        });
      }
    }
  });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  reinforceNTTT8CanvasBorders(canvas, gridEl, scale);
  return canvas;
}

/**
 * Chuyển đổi chế độ nội dung khi xuất ảnh / in sơ đồ:
 * - 'with_assignment': Kèm thông tin phân công (Nhân viên & PG đang bật)
 * - 'no_assignment': Chỉ hiện tên khu vực / ngành hàng (Không kèm tên NV & PG)
 * - 'original_sample': Chuẩn sơ đồ mẫu gốc
 */
function syncNTTT8ExportModeButtons() {
  const mode = NTTT8State.exportContentMode || 'with_assignment';
  const btnWith = document.getElementById('btn8NTTTExportModeWithAssign');
  const btnNo = document.getElementById('btn8NTTTExportModeNoAssign');
  const btnOrig = document.getElementById('btn8NTTTExportModeOriginal');
  if (btnWith) btnWith.classList.toggle('active', mode === 'with_assignment');
  if (btnNo) btnNo.classList.toggle('active', mode === 'no_assignment');
  if (btnOrig) btnOrig.classList.toggle('active', mode === 'original_sample');
}

async function switchNTTT8ExportContentMode(mode) {
  const validModes = ['with_assignment', 'no_assignment', 'original_sample'];
  NTTT8State.exportContentMode = validModes.includes(mode) ? mode : 'with_assignment';
  syncNTTT8ExportModeButtons();
  await exportNTTT8DiagramImage(NTTT8State.exportContentMode);
}

/**
 * In sơ đồ phân công 8NTTT (Hỗ trợ in kèm hoặc không kèm thông tin phân công)
 */
async function printNTTT8Diagram() {
  if (!NTTT8State.previewObjectUrl) {
    await exportNTTT8DiagramImage(NTTT8State.exportContentMode || 'with_assignment');
  }
  const imgUrl = NTTT8State.previewObjectUrl;
  if (!imgUrl) {
    window.print();
    return;
  }

  const printWin = window.open('', '_blank', 'width=1200,height=850');
  if (!printWin) {
    window.print();
    return;
  }

  const modeLabel =
    NTTT8State.exportContentMode === 'no_assignment'
      ? 'Sơ đồ khu vực (Không kèm tên phân công)'
      : 'Sơ đồ phân công nhân viên & PG - 8NTTT';

  printWin.document.open();
  printWin.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${modeLabel}</title>
  <style>
    @page { size: landscape; margin: 6mm; }
    html, body { margin: 0; padding: 0; background: #ffffff; font-family: Arial, sans-serif; text-align: center; }
    .print-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; }
    img { max-width: 100%; max-height: 95vh; width: auto; height: auto; object-fit: contain; border: 1px solid #222; }
  </style>
</head>
<body>
  <div class="print-wrap">
    <img src="${imgUrl}" alt="${modeLabel}" onload="setTimeout(function(){ window.focus(); window.print(); }, 180);" />
  </div>
</body>
</html>`);
  printWin.document.close();
}

/**
 * Tạo ảnh PNG sơ đồ 8NTTT trong bộ nhớ và mở Popup Xem Trước (Không tự động tải về, không lưu DB)
 */
async function exportNTTT8DiagramImage(requestedMode) {
  if (NTTT8State.isExportingImage) return;

  if (requestedMode && ['with_assignment', 'no_assignment', 'original_sample'].includes(requestedMode)) {
    NTTT8State.exportContentMode = requestedMode;
  }
  syncNTTT8ExportModeButtons();

  const gridEl = document.getElementById('nttt8AssignmentGrid');
  if (!gridEl) {
    alert('Không tìm thấy sơ đồ phân công 8NTTT để xuất ảnh.');
    return;
  }

  NTTT8State.isExportingImage = true;
  // Render lại lưới theo chế độ nội dung xuất ảnh đã chọn (kèm / không kèm thông tin phân công)
  renderNTTT8AssignmentGrid();

  const btn = document.getElementById('btn8NTTTExportImage');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang tạo ảnh...</span>';
  }

  const viewportEl = document.getElementById('nttt8ScrollViewport');
  const stageEl = document.getElementById('nttt8ZoomStage');
  const prevScrollLeft = viewportEl ? viewportEl.scrollLeft : 0;
  const prevScrollTop = viewportEl ? viewportEl.scrollTop : 0;
  const prevStageTransform = stageEl ? stageEl.style.transform : '';
  const prevStageWidth = stageEl ? stageEl.style.width : '';
  const prevStageHeight = stageEl ? stageEl.style.height : '';

  try {
    // Giải phóng ảnh tạm cũ (nếu có) trước khi tạo ảnh mới
    releaseNTTT8PreviewResources();
    setNTTT8PreviewStatus(null, '');

    // 1. Đợi toàn bộ font chữ tải xong trước khi đo kích thước và chụp DOM
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        // Ignore font readiness warning
      }
    }

    // 2. Đưa sơ đồ về trạng thái chuẩn 100% không cắt tràn, không biến dạng do zoom/scroll
    document.body.classList.add('exporting-8nttt-map');
    if (stageEl) {
      stageEl.style.transform = 'none';
      stageEl.style.width = '1713px';
      stageEl.style.height = 'auto';
    }
    if (viewportEl) {
      viewportEl.scrollLeft = 0;
      viewportEl.scrollTop = 0;
    }

    // Đợi 2 nhịp requestAnimationFrame để trình duyệt reflow đầy đủ toàn bộ lưới CSS Grid
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await new Promise(r => setTimeout(r, 80));

    const gridRect = gridEl.getBoundingClientRect();
    const fullWidth = Math.max(1713, Math.ceil(gridRect.width || gridEl.scrollWidth || 1713));
    const fullHeight = Math.max(700, Math.ceil(gridRect.height || gridEl.scrollHeight || 860));

    // Tính toán độ phân giải cao (ưu tiên 2.5x, đảm bảo không vượt giới hạn kích thước canvas của trình duyệt)
    const maxCanvasSide = 8192;
    const rawScale = Math.min(2.5, maxCanvasSide / Math.max(fullWidth, fullHeight));
    const exportScale = Math.max(2, Math.round(rawScale * 4) / 4);

    let canvas = null;
    if (typeof html2canvas === 'function') {
      try {
        canvas = await html2canvas(gridEl, {
          scale: exportScale,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: fullWidth,
          height: fullHeight,
          windowWidth: Math.max(1800, fullWidth + 80),
          windowHeight: Math.max(1200, fullHeight + 120),
          scrollX: -window.scrollX,
          scrollY: -window.scrollY
        });
        // Tăng cường 100% đường kẻ ngang, dọc, ô lưới trống và viền ngoài sắc nét tuyệt đối
        reinforceNTTT8CanvasBorders(canvas, gridEl, exportScale);
      } catch (h2cErr) {
        console.warn('[8NTTT] html2canvas gặp lỗi, chuyển sang vẽ trực tiếp từ DOM:', h2cErr);
        canvas = renderNTTT8LiveDomToCanvas(gridEl, exportScale);
      }
    } else {
      canvas = renderNTTT8LiveDomToCanvas(gridEl, exportScale);
    }

    const blob = await canvasToPngBlob(canvas);
    const objectUrl = URL.createObjectURL(blob);

    NTTT8State.previewBlob = blob;
    NTTT8State.previewObjectUrl = objectUrl;

    const previewImg = document.getElementById('nttt8PreviewImg');
    if (previewImg) {
      previewImg.src = objectUrl;
    }

    const resInfo = document.getElementById('nttt8PreviewResolutionInfo');
    if (resInfo) {
      const sizeKb = Math.max(1, Math.round(blob.size / 1024));
      const modeDesc =
        NTTT8State.exportContentMode === 'no_assignment'
          ? 'Không kèm phân công'
          : NTTT8State.exportContentMode === 'original_sample'
          ? 'Chuẩn mẫu gốc'
          : 'Kèm thông tin phân công';
      resInfo.textContent = `Ảnh PNG gốc sắc nét (${canvas.width} × ${canvas.height} px • ${sizeKb} KB • ${modeDesc})`;
    }

    setNTTT8PreviewDisplayMode('fit');

    const modal = document.getElementById('modal8NTTTImagePreview');
    if (modal) {
      modal.classList.remove('hidden');
    }
  } catch (e) {
    console.error('[8NTTT] Lỗi tạo ảnh sơ đồ:', e);
    alert('Có lỗi khi tạo ảnh sơ đồ 8NTTT. Vui lòng thử lại.');
  } finally {
    document.body.classList.remove('exporting-8nttt-map');
    if (stageEl) {
      stageEl.style.transform = prevStageTransform;
      stageEl.style.width = prevStageWidth;
      stageEl.style.height = prevStageHeight;
    }
    NTTT8State.isExportingImage = false;
    renderNTTT8AssignmentGrid();
    applyNTTT8ZoomTransform();
    if (viewportEl) {
      viewportEl.scrollLeft = prevScrollLeft;
      viewportEl.scrollTop = prevScrollTop;
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml || '<i class="fa-solid fa-camera"></i> <span>XUẤT ẢNH</span>';
    }
  }
}

// ==========================================================================
// 7. KHỞI TẠO & GẮN SỰ KIỆN TAB 8NTTT
// ==========================================================================

function initNTTT8Module() {
  loadNTTT8Data();
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  listenNTTT8FirestoreChanges();

  // Tìm kiếm theo từ khóa
  const searchInput = document.getElementById('nttt8SearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      NTTT8State.searchQuery = e.target.value || '';
      renderNTTT8AssignmentGrid();
    });
  }

  // Lọc theo nhân viên
  const staffSelect = document.getElementById('nttt8StaffFilterSelect');
  if (staffSelect) {
    staffSelect.addEventListener('change', e => {
      NTTT8State.selectedStaff = e.target.value || '';
      renderNTTT8AssignmentGrid();
    });
  }

  // Nút Toàn sơ đồ & Phóng to
  const btnFit = document.getElementById('btn8NTTTZoomFit');
  if (btnFit) {
    btnFit.addEventListener('click', () => setNTTT8ZoomMode('fit'));
  }

  const btnActual = document.getElementById('btn8NTTTZoomActual');
  if (btnActual) {
    btnActual.addEventListener('click', () => setNTTT8ZoomMode('actual'));
  }

  const btnZoomIn = document.getElementById('btn8NTTTZoomIn');
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => stepNTTT8Zoom(0.1));
  }

  const btnZoomOut = document.getElementById('btn8NTTTZoomOut');
  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => stepNTTT8Zoom(-0.1));
  }

  // Cập nhật tỷ lệ khi đổi kích thước màn hình ở chế độ Toàn sơ đồ
  window.addEventListener('resize', () => {
    const section = document.getElementById('section8NTTT');
    if (section && section.style.display !== 'none') {
      applyNTTT8ZoomTransform();
    }
  });

  // Đóng các popup theo thứ tự ưu tiên khi nhấn phím Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const previewModal = document.getElementById('modal8NTTTImagePreview');
      if (previewModal && !previewModal.classList.contains('hidden')) {
        closeNTTT8ImagePreviewModal();
        return;
      }
      const bulkModal = document.getElementById('modal8NTTTBulkImport');
      if (bulkModal && !bulkModal.classList.contains('hidden')) {
        closeNTTT8BulkImportModal();
        return;
      }
      const reassignModal = document.getElementById('modal8NTTTStaffReassignConfirm');
      if (reassignModal && !reassignModal.classList.contains('hidden')) {
        closeNTTT8ReassignConfirmModal();
        return;
      }
      const editCellModal = document.getElementById('modal8NTTTEditCell');
      if (editCellModal && !editCellModal.classList.contains('hidden')) {
        closeNTTT8EditModal();
        return;
      }
      const managerModal = document.getElementById('modal8NTTTStaffPgManager');
      if (managerModal && !managerModal.classList.contains('hidden')) {
        closeNTTT8StaffPgManagerModal();
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNTTT8Module();
});

