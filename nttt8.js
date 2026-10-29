/**
 * ==========================================================================
 * MODULE: TAB 8NTTT - SƠ ĐỒ PHÂN CÔNG NHÂN VIÊN PHỤ TRÁCH NGÀNH HÀNG (nttt8.js)
 * Thiết kế lại giao diện tab "8NTTT" theo đúng bố cục hình mẫu chuẩn siêu thị
 * Bảo toàn 100% dữ liệu phân công hiện có và không ảnh hưởng các tab khác.
 * ==========================================================================
 */

const NTTT8_STORAGE_CELLS_KEY = 'PHANCA_8NTTT_CELLS_V1';
const NTTT8_STORAGE_RULES_KEY = 'PHANCA_8NTTT_RULES_V1';
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
  searchQuery: '',
  selectedStaff: '',
  editingCellId: null,
  zoomMode: 'actual', // 'actual' (100% cuộn ngang rõ chữ) hoặc 'fit' (Toàn sơ đồ)
  zoomScale: 1,
  lastSyncedFingerprint: '',
  isExportingImage: false,
  isCopyingImage: false,
  previewBlob: null,
  previewObjectUrl: '',
  previewDisplayMode: 'fit'
};

// ==========================================================================
// 1. QUẢN LÝ DỮ LIỆU & ĐỒNG BỘ FIREBASE (BẢO TOÀN DỮ LIỆU HIỆN CÓ)
// ==========================================================================

function loadNTTT8Data() {
  // Khởi tạo từ dữ liệu gốc
  const baseCells = DEFAULT_NTTT8_CELLS.map(c => ({ ...c }));

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

function saveNTTT8DataToStorage(syncToCloud = true) {
  try {
    const overridesMap = buildNTTT8OverridesMap();
    localStorage.setItem(NTTT8_STORAGE_CELLS_KEY, JSON.stringify(overridesMap));
    localStorage.setItem(NTTT8_STORAGE_RULES_KEY, JSON.stringify(NTTT8State.rules));

    if (syncToCloud) {
      syncNTTT8ToFirestore(overridesMap, NTTT8State.rules);
    }
  } catch (e) {
    console.error('[8NTTT] Lỗi lưu dữ liệu:', e);
  }
}

async function syncNTTT8ToFirestore(overridesMap, rulesObj) {
  try {
    if (typeof firebase === 'undefined' || !firebase.firestore) return;
    const db = firebase.firestore();
    const payloadStr = JSON.stringify({ cells: overridesMap, rules: rulesObj });
    if (payloadStr === NTTT8State.lastSyncedFingerprint) return;

    NTTT8State.lastSyncedFingerprint = payloadStr;
    await db.collection(NTTT8_FIRESTORE_COLLECTION).doc(NTTT8_FIRESTORE_DOC).set({
      cells: overridesMap,
      rules: rulesObj,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn('[8NTTT] Đồng bộ Firestore tạm hoãn:', e);
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
          rules: data.rules || DEFAULT_NTTT8_OPERATION_RULES
        });
        if (incomingStr === NTTT8State.lastSyncedFingerprint) return;
        NTTT8State.lastSyncedFingerprint = incomingStr;

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

        renderNTTT8AssignmentGrid();
        populateNTTT8StaffFilter();
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

function formatCellDisplayLabel(cell) {
  if (cell.displayOverride && cell.displayOverride.trim() !== '') {
    return cell.displayOverride;
  }
  const area = (cell.area || '').trim();
  const staff = (cell.staff || '').trim();
  if (area && staff) {
    // Đối với các ô dọc (Cột 1, Cột 17) hoặc ô hẹp cần xuống dòng rõ ràng để không tràn ô khi xuất ảnh
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

function escapeHtmlNTTT8(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render một ô phân công (AssignmentCell / CategoryLabel / WarehouseColumn)
 */
function createAssignmentCellHTML(cell, highlightState) {
  const isStatic = cell.type === 'static';
  const labelText = formatCellDisplayLabel(cell);
  const safeHtmlLabel = escapeHtmlNTTT8(labelText).replace(/\n/g, '<br>');

  let extraClasses = `${cell.bgClass || 'bg-nttt-white'} ${cell.borderClass || 'b-box'}`;
  if (isStatic) extraClasses += ' nttt8-static';
  if (highlightState === 'highlighted') extraClasses += ' nttt8-highlighted';
  if (highlightState === 'dimmed') extraClasses += ' nttt8-dimmed';

  let innerContent = `<span>${safeHtmlLabel}</span>`;
  if (cell.orientation === 'walkway') {
    innerContent = `<span class="nttt8-walkway-label">${safeHtmlLabel}</span>`;
  } else if (cell.orientation === 'vertical') {
    innerContent = `<span class="nttt8-vertical-label">${safeHtmlLabel}</span>`;
  } else if (cell.orientation === 'tilted') {
    innerContent = `<span class="nttt8-tilted-label">${safeHtmlLabel}</span>`;
  }

  const clickAttr = isStatic ? '' : `onclick="openNTTT8CellEditModal('${cell.id}')"`;
  const titleAttr = isStatic
    ? escapeHtmlNTTT8(labelText.replace(/\n+/g, ' '))
    : escapeHtmlNTTT8(`${cell.area}${cell.staff ? ' - Phụ trách: ' + cell.staff : ''} (Nhấn để chỉnh sửa)`);

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
      const cellText = `${cell.area} ${cell.staff} ${cell.displayOverride || ''}`.toUpperCase();
      const cellStaff = (cell.staff || '').trim().toUpperCase();

      const matchQuery = !query || cellText.includes(query);
      const matchStaff = !staffFilter || cellStaff === staffFilter || cellText.includes(`- ${staffFilter}`);

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
  const staffSet = new Set(NTTT8_KNOWN_STAFF);

  // Tích hợp nhân viên từ danh sách hiện có của dự án (ALL_STAFF trong app.js và FlyerState.staffList)
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
  selectEl.innerHTML = `<option value="">👤 Tất cả nhân viên (${sortedStaff.length})</option>` +
    sortedStaff.map(name => `<option value="${escapeHtmlNTTT8(name)}">${escapeHtmlNTTT8(name)} (${staffCounts[name]} vị trí)</option>`).join('');

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
// 4. CHỨC NĂNG CHỈNH SỬA PHÂN CÔNG TRỰC TIẾP TRÊN SƠ ĐỒ (CÓ XÁC NHẬN)
// ==========================================================================

function openNTTT8CellEditModal(cellId) {
  const cell = NTTT8State.cells.find(c => c.id === cellId);
  if (!cell || cell.type === 'static') return;

  NTTT8State.editingCellId = cellId;

  const modal = document.getElementById('modal8NTTTEditCell');
  const areaInput = document.getElementById('nttt8EditAreaInput');
  const staffInput = document.getElementById('nttt8EditStaffInput');
  const pillsContainer = document.getElementById('nttt8QuickStaffPills');

  if (!modal || !areaInput || !staffInput) return;

  areaInput.value = cell.area || '';
  staffInput.value = cell.staff || '';

  if (pillsContainer) {
    const allStaff = getAllNTTT8StaffList();
    pillsContainer.innerHTML = allStaff.map(name => {
      const isSelected = (cell.staff || '').trim().toUpperCase() === name;
      return `<button type="button" class="nttt8-staff-chip ${isSelected ? 'selected' : ''}" onclick="selectNTTT8QuickStaff('${escapeHtmlNTTT8(name)}')">${escapeHtmlNTTT8(name)}</button>`;
    }).join('');
  }

  modal.classList.remove('hidden');
  setTimeout(() => staffInput.focus(), 50);
}

function selectNTTT8QuickStaff(staffName) {
  const staffInput = document.getElementById('nttt8EditStaffInput');
  if (staffInput) {
    staffInput.value = staffName;
  }
  const pills = document.querySelectorAll('#nttt8QuickStaffPills .nttt8-staff-chip');
  pills.forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.trim().toUpperCase() === staffName.toUpperCase());
  });
}

function closeNTTT8CellEditModal() {
  NTTT8State.editingCellId = null;
  const modal = document.getElementById('modal8NTTTEditCell');
  if (modal) modal.classList.add('hidden');
}

function confirmSaveNTTT8CellEdit() {
  if (!NTTT8State.editingCellId) return;
  const cell = NTTT8State.cells.find(c => c.id === NTTT8State.editingCellId);
  if (!cell) return;

  const areaInput = document.getElementById('nttt8EditAreaInput');
  const staffInput = document.getElementById('nttt8EditStaffInput');

  const newArea = areaInput ? areaInput.value.trim().toUpperCase() : cell.area;
  const newStaff = staffInput ? staffInput.value.trim().toUpperCase() : cell.staff;

  if (!newArea && !newStaff) {
    alert('Vui lòng nhập tên ngành hàng/khu vực hoặc tên nhân viên phụ trách.');
    return;
  }

  cell.area = newArea;
  cell.staff = newStaff;
  // Xóa displayOverride cố định để hiển thị đúng cặp Tên ngành hàng - Nhân viên mới
  if (cell.displayOverride) {
    delete cell.displayOverride;
  }

  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();
  closeNTTT8CellEditModal();

  if (typeof showToast === 'function') {
    showToast(`Đã cập nhật ô "${newArea}${newStaff ? ' - ' + newStaff : ''}"`);
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
  NTTT8State.rules = { ...DEFAULT_NTTT8_OPERATION_RULES };
  loadNTTT8Data();
  saveNTTT8DataToStorage(true);
  renderNTTT8AssignmentGrid();
  populateNTTT8StaffFilter();

  if (typeof showToast === 'function') {
    showToast('Đã khôi phục sơ đồ 8NTTT về dữ liệu gốc');
  }
}

// ==========================================================================
// 5. XUẤT ẢNH PNG SƠ ĐỒ 8NTTT – HIỂN THỊ POPUP XEM TRƯỚC & SAO CHÉP CLIPBOARD
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
 * Tạo ảnh PNG sơ đồ 8NTTT trong bộ nhớ và mở Popup Xem Trước (Không tự động tải về, không lưu DB)
 */
async function exportNTTT8DiagramImage() {
  if (NTTT8State.isExportingImage) return;

  const gridEl = document.getElementById('nttt8AssignmentGrid');
  if (!gridEl) {
    alert('Không tìm thấy sơ đồ phân công 8NTTT để xuất ảnh.');
    return;
  }

  NTTT8State.isExportingImage = true;
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
      resInfo.textContent = `Ảnh PNG gốc sắc nét (${canvas.width} × ${canvas.height} px • ${sizeKb} KB)`;
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
    applyNTTT8ZoomTransform();
    if (viewportEl) {
      viewportEl.scrollLeft = prevScrollLeft;
      viewportEl.scrollTop = prevScrollTop;
    }
    NTTT8State.isExportingImage = false;
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml || '<i class="fa-solid fa-camera"></i> <span>XUẤT ẢNH</span>';
    }
  }
}

// ==========================================================================
// 6. KHỞI TẠO & GẮN SỰ KIỆN TAB 8NTTT
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

  // Đóng popup xem trước ảnh khi nhấn phím Escape và giải phóng tài nguyên tạm
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const previewModal = document.getElementById('modal8NTTTImagePreview');
      if (previewModal && !previewModal.classList.contains('hidden')) {
        closeNTTT8ImagePreviewModal();
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNTTT8Module();
});

