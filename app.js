/**
 * ==========================================================================
 * HỆ THỐNG PHÂN CA HÀNH CHÍNH - CLIENT LOGIC (app.js)
 * Tương thích Google Apps Script Web App & GitHub Pages
 * Tone Pastel Xanh Dương • Xuất Ảnh Tuần & Tháng • Đồng Bộ Realtime
 * ==========================================================================
 */

// Cấu hình danh sách nhân viên mặc định ban đầu (theo ca mẫu chuẩn)
const DEFAULT_STAFF_G1 = ['NHẠN', 'MẠNH', 'MI', 'MỸ', 'GIANG Ý', 'NGỌC ANH'];
const DEFAULT_STAFF_G2 = ['THẮM', 'MY', 'PHÚC', 'ĐẠI', 'LÂM Ý'];

// Danh sách nhân viên hoạt động hiện tại (có thể thêm, bớt, đổi nhóm động)
let STAFF_GROUP_1 = [...DEFAULT_STAFF_G1];
let STAFF_GROUP_2 = [...DEFAULT_STAFF_G2];
let ALL_STAFF = [...STAFF_GROUP_1, ...STAFF_GROUP_2];

const STAFF_STORAGE_KEY = 'PHANCA_CUSTOM_STAFF';

/**
 * Đọc danh sách nhân viên tùy chỉnh từ localStorage (nếu có)
 */
function loadCustomStaffList() {
  try {
    const saved = localStorage.getItem(STAFF_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.group1) && parsed.group1.length > 0 &&
          Array.isArray(parsed.group2) && parsed.group2.length > 0) {
        STAFF_GROUP_1 = parsed.group1.map(s => String(s).trim().toUpperCase()).filter(Boolean);
        STAFF_GROUP_2 = parsed.group2.map(s => String(s).trim().toUpperCase()).filter(Boolean);
        ALL_STAFF = [...STAFF_GROUP_1, ...STAFF_GROUP_2];
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc custom staff list:', e);
  }
}

/**
 * Lưu danh sách nhân viên tùy chỉnh vào localStorage
 */
function saveCustomStaffList() {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify({
      group1: STAFF_GROUP_1,
      group2: STAFF_GROUP_2
    }));
  } catch (e) {
    console.error('Lỗi lưu custom staff list:', e);
  }
}

/**
 * Cập nhật danh sách nhân viên vào ô chọn dropdown "Phân Ca Ai"
 */
function updateAssignStaffDropdown() {
  const select = document.getElementById('assignStaffSelect');
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = `
    <optgroup label="🔵 Nhóm 1 (Hành Chính 1)">
      ${STAFF_GROUP_1.map(s => `<option value="${s}">${s}</option>`).join('')}
    </optgroup>
    <optgroup label="🟢 Nhóm 2 (Hành Chính 2)">
      ${STAFF_GROUP_2.map(s => `<option value="${s}">${s}</option>`).join('')}
    </optgroup>
  `;
  if (ALL_STAFF.includes(currentVal)) {
    select.value = currentVal;
  } else if (ALL_STAFF.length > 0) {
    select.value = ALL_STAFF[0];
  }
}

/**
 * Đảm bảo dữ liệu phân ca trong AppState luôn có đủ slot cho tất cả nhân viên
 */
function ensureStaffScheduleIntegrity() {
  MONTHS.forEach((m) => {
    if (!AppState.schedule[m]) AppState.schedule[m] = {};
    WEEKS.forEach((w) => {
      if (!AppState.schedule[m][w]) AppState.schedule[m][w] = {};
      ALL_STAFF.forEach((staff) => {
        if (!AppState.schedule[m][w][staff]) {
          AppState.schedule[m][w][staff] = { T2: '', T3: '', T4: '', T5: '', T6: '', T7: '', CN: '' };
        }
      });
    });
  });
}

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const WEEKS = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
const MONTHS = [
  'THÁNG 01', 'THÁNG 02', 'THÁNG 03', 'THÁNG 04', 'THÁNG 05', 'THÁNG 06',
  'THÁNG 07', 'THÁNG 08', 'THÁNG 09', 'THÁNG 10', 'THÁNG 11', 'THÁNG 12'
];

/**
 * Tự động lấy chuỗi tên tháng hiện tại theo thời gian thực hệ thống (ví dụ: 'THÁNG 10')
 */
function getCurrentMonthString() {
  const m = new Date().getMonth() + 1;
  return `THÁNG ${String(m).padStart(2, '0')}`;
}

// ==========================================================================
// CẤU HÌNH CA MẪU TUẦN 1 VÀ MA TRẬN XOAY TUA 4 TUẦN CÂN BẰNG TUYỆT ĐỐI
// Đảm bảo: Mỗi nhóm đều có đúng 1 KHO và 1 TN mỗi ngày (T2 -> CN)
// ==========================================================================

// Lịch nghỉ cố định mặc định (để trống để mặc định không có 'x', khớp với ca mẫu tuần 1)
const DEFAULT_OFF_DAYS = {};

// Định nghĩa 6 Slot xoay ca chuẩn theo Ca Mẫu Tuần 1 (Nhóm 1 - 6 nhân viên)
// Đảm bảo mỗi ngày từ T2 -> CN đều có đúng 1 TN và 1 KHO
const GROUP1_SLOTS = [
  { T2: 'TN', T3: '', T4: '', T5: '', T6: 'KHO', T7: '', CN: 'TN' },  // Slot 0: NHẠN (2 TN, 1 KHO)
  { T2: '', T3: 'TN', T4: 'KHO', T5: '', T6: '', T7: '', CN: 'KHO' }, // Slot 1: MẠNH (1 TN, 2 KHO) - T3: TN
  { T2: 'KHO', T3: '', T4: '', T5: 'TN', T6: '', T7: '', CN: '' },    // Slot 2: MI (1 TN, 1 KHO)
  { T2: '', T3: 'KHO', T4: '', T5: '', T6: 'TN', T7: '', CN: '' },    // Slot 3: MỸ (1 TN, 1 KHO)
  { T2: '', T3: '', T4: 'TN', T5: '', T6: '', T7: 'KHO', CN: '' },    // Slot 4: GIANG Ý (1 TN, 1 KHO)
  { T2: '', T3: '', T4: '', T5: 'KHO', T6: '', T7: 'TN', CN: '' }     // Slot 5: NGỌC ANH (1 TN, 1 KHO)
];

// Định nghĩa 5 Slot xoay ca chuẩn theo Ca Mẫu Tuần 1 (Nhóm 2 - 5 nhân viên)
// Đảm bảo mỗi ngày từ T2 -> CN đều có đúng 1 TN và 1 KHO
const GROUP2_SLOTS = [
  { T2: 'TN', T3: '', T4: '', T5: 'KHO', T6: '', T7: '', CN: 'TN' },  // Slot 0: THẮM (2 TN, 1 KHO)
  { T2: '', T3: 'TN', T4: '', T5: '', T6: 'TN', T7: '', CN: 'KHO' },  // Slot 1: MY (2 TN, 1 KHO)
  { T2: 'KHO', T3: '', T4: 'TN', T5: '', T6: 'KHO', T7: '', CN: '' }, // Slot 2: PHÚC (1 TN, 2 KHO)
  { T2: '', T3: 'KHO', T4: '', T5: 'TN', T6: '', T7: 'KHO', CN: '' }, // Slot 3: ĐẠI (1 TN, 2 KHO)
  { T2: '', T3: '', T4: 'KHO', T5: '', T6: '', T7: 'TN', CN: '' }     // Slot 4: LÂM Ý (1 TN, 1 KHO)
];

// Ma trận hoán vị xoay tua 4 tuần tối ưu toán học:
// - Mỗi ngày (T2, T3, T4, T5, T6, T7, CN) mỗi nhóm đều có ĐÚNG 1 KHO và 1 TN
// - Luân phiên 100%: Nhân viên trực ở Tuần n (ví dụ Nhạn & Mỹ trực Thứ 2 Tuần 1) sẽ được XOAY HOÀN TOÀN sang người khác ở Tuần n+1 (Tuần 2 chuyển sang Ngọc Anh & Giang Ý)!
// - Tuyệt đối không trùng lặp người trực cùng một thứ giữa 2 tuần liên tiếp
// - Nhóm 1: Tất cả 6 nhân viên đều có 4-5 ca TN, 4-5 ca KHO (Tổng ca: 9-10 ca/người)
// - Nhóm 2: Tất cả 5 nhân viên đều có 5-6 ca TN, 5-6 ca KHO (Tổng ca: 11-12 ca/người)
const GROUP1_PERMUTATIONS = [
  [0, 1, 2, 3, 4, 5], // Tuần 1 (T2: Nhạn & Mỹ trực TN & KHO)
  [4, 5, 1, 2, 0, 3], // Tuần 2 (T2: Xoay sang Ngọc Anh & Giang Ý trực; 0 trùng ngày với Tuần 1)
  [3, 0, 5, 1, 4, 2], // Tuần 3 (T2: Xoay sang Mạnh & Đại trực; 0 trùng ngày với Tuần 2)
  [2, 4, 0, 5, 3, 1]  // Tuần 4 (T2: Xoay sang Mỹ & Nhạn; 0 trùng ngày với Tuần 3)
];

const GROUP2_PERMUTATIONS = [
  [0, 1, 2, 3, 4], // Tuần 1 (T2: Thắm & Phúc trực)
  [1, 4, 3, 2, 0], // Tuần 2 (T2: Xoay sang Mi & Lâm Ý trực, không trùng Thắm & Phúc)
  [2, 1, 0, 4, 3], // Tuần 3 (T2: Xoay sang Phúc & Thắm trực)
  [3, 2, 4, 0, 1]  // Tuần 4 (T2: Xoay sang Lâm Ý & My trực)
];

/**
 * Tính toán ngày theo định dạng DD/MM cho các thứ (T2 -> CN) trong tuần được chọn
 * Ví dụ: T6 tuần 4 tháng 09 -> 25/09
 */
function getWeekDates(monthName, weekName) {
  const mMatch = String(monthName || '').match(/\d+/);
  const monthNum = mMatch ? parseInt(mMatch[0], 10) : 9;
  const year = 2026;

  const wMatch = String(weekName || '').match(/\d+/);
  const weekIdx = wMatch ? Math.max(0, parseInt(wMatch[0], 10) - 1) : 0;

  // Ngày 1 của tháng
  const firstDay = new Date(year, monthNum - 1, 1);
  const dayOfWeek = firstDay.getDay(); // 0: CN, 1: T2, 2: T3, ...
  
  // Thứ 2 của tuần 1 trong tháng
  const diff = (dayOfWeek === 0) ? -6 : (1 - dayOfWeek);
  const mondayWeek1 = new Date(year, monthNum - 1, 1 + diff);

  // Thứ 2 của tuần được chọn
  const weekMonday = new Date(mondayWeek1);
  weekMonday.setDate(mondayWeek1.getDate() + (weekIdx * 7));

  const result = {};
  DAYS.forEach((d, idx) => {
    const curDate = new Date(weekMonday);
    curDate.setDate(weekMonday.getDate() + idx);
    const dayStr = String(curDate.getDate()).padStart(2, '0');
    const mStr = String(curDate.getMonth() + 1).padStart(2, '0');
    result[d] = `${dayStr}/${mStr}`;
  });
  return result;
}

/**
 * Cập nhật ngày dưới các cột T2, T3... trong header bảng tuần
 */
function updateTableDateHeaders() {
  const dates = getWeekDates(AppState.currentMonth, AppState.currentWeek);
  DAYS.forEach((d) => {
    const el = document.getElementById(`dateHeader_${d}`);
    if (el) {
      el.textContent = dates[d] || '';
    }
  });
}

/**
 * Sinh lịch 4 tuần xoay tua cân bằng kết hợp cơ chế Đôn Ca Domino khi nhân viên nghỉ OFF ('x')
 * @param {string} [targetMonth] - Tháng cần xoay tua (mặc định lấy tháng hiện tại)
 * @returns {Object} Lịch 4 tuần đã được xoay tua và đôn ca domino
 */
function generateBalanced4WeeksSchedule(targetMonth) {
  const month = targetMonth || AppState.currentMonth || 'THÁNG 09';
  const result = {};
  const dominoLog = {}; // Lưu lịch sử đôn ca để hiển thị chú thích trực quan

  WEEKS.forEach((wName, wIdx) => {
    result[wName] = {};
    dominoLog[wName] = {};

    // Lấy dữ liệu hiện tại của tuần trong tháng (nơi người dùng đã tick các ngày 'x')
    const existingWeekData = (AppState.schedule && AppState.schedule[month] && AppState.schedule[month][wName])
      ? AppState.schedule[month][wName]
      : {};

    // 1. Khởi tạo dữ liệu: Giữ nguyên 100% các ô đã đánh dấu nghỉ OFF ('x' hoặc 'X')
    ALL_STAFF.forEach((staff) => {
      result[wName][staff] = {};
      DAYS.forEach((d) => {
        const curVal = String(existingWeekData[staff]?.[d] || '').trim();
        if (curVal.toUpperCase() === 'X') {
          result[wName][staff][d] = 'x';
        } else if (curVal.toUpperCase() === 'HC') {
          result[wName][staff][d] = 'HC';
        } else {
          result[wName][staff][d] = '';
        }
      });
    });

    // 2. Thuật toán gán ca, Bù ca và Đôn ca toàn tuần đảm bảo:
    //    - Nếu ngày nghỉ OFF ('x') trùng với ngày ca TN hoặc KHO theo lịch thì BÙ qua ngày khác trong tuần cho nhân viên đó, không bỏ qua luôn.
    //    - Mỗi nhân viên giữ nguyên đủ số ca phân bổ chuẩn của mình trong tuần (TN và KHO).
    //    - Không trực cùng 1 loại ca 2 ngày liền kề nhau.
    //    - Tổng số ngày trực (TN + KHO) tối đa không quá 3 ngày/tuần (không ai bị dồn 4 ngày).
    //    - Tôn trọng 100% các ngày đăng ký nghỉ OFF ('x').
    //    - Mỗi ngày luôn có đủ 1 TN và 1 KHO cho mỗi nhóm.
    function processGroupWeek(staffList, permutations, slots) {
      const N = staffList.length;
      const planned = {};
      const targetTN = {}, targetKHO = {};
      staffList.forEach(s => { targetTN[s] = 0; targetKHO[s] = 0; });

      DAYS.forEach((d) => {
        let tn = null, kho = null;
        staffList.forEach((staff, sIdx) => {
          const slotIdx = (wIdx < permutations.length && sIdx < permutations[wIdx].length)
            ? permutations[wIdx][sIdx]
            : (sIdx % slots.length);
          const slot = slots[slotIdx];
          const shift = slot ? (slot[d] || '') : '';
          if (shift === 'TN') { tn = staff; targetTN[staff]++; }
          if (shift === 'KHO') { kho = staff; targetKHO[staff]++; }
        });
        planned[d] = { tn, kho };
      });

      const isOff = (staff, d) => String(existingWeekData[staff]?.[d] || '').trim().toUpperCase() === 'X';

      function solveAssignment(exactQuota, allowConsecutive) {
        const countTN = {}, countKHO = {};
        staffList.forEach(s => { countTN[s] = 0; countKHO[s] = 0; });
        const assignment = {};

        function backtrack(dayIdx) {
          if (dayIdx === 7) return true;
          const day = DAYS[dayIdx];
          const prevDay = dayIdx > 0 ? DAYS[dayIdx - 1] : null;

          // Sắp xếp ưu tiên ứng viên nhận ca TN:
          // 1. Người đã được lên kế hoạch ngày này (nếu không nghỉ OFF)
          // 2. Người đang thiếu ca TN so với định mức (cần bù ca)
          const tnCands = [...staffList].sort((a, b) => {
            if (a === planned[day].tn && !isOff(a, day)) return -1;
            if (b === planned[day].tn && !isOff(b, day)) return 1;
            const diffA = targetTN[a] - countTN[a];
            const diffB = targetTN[b] - countTN[b];
            return diffB - diffA;
          });

          for (const tnStaff of tnCands) {
            if (isOff(tnStaff, day)) continue;
            if (exactQuota && countTN[tnStaff] >= targetTN[tnStaff]) continue;
            if (!exactQuota && countTN[tnStaff] >= 2) continue;
            if (!exactQuota && (countTN[tnStaff] + countKHO[tnStaff] >= 3)) continue;
            if (!allowConsecutive && prevDay && assignment[prevDay]?.TN === tnStaff) continue;

            countTN[tnStaff]++;

            // Sắp xếp ưu tiên ứng viên nhận ca KHO
            const khoCands = [...staffList].sort((a, b) => {
              if (a === planned[day].kho && !isOff(a, day)) return -1;
              if (b === planned[day].kho && !isOff(b, day)) return 1;
              const diffA = targetKHO[a] - countKHO[a];
              const diffB = targetKHO[b] - countKHO[b];
              return diffB - diffA;
            });

            for (const khoStaff of khoCands) {
              if (khoStaff === tnStaff) continue;
              if (isOff(khoStaff, day)) continue;
              if (exactQuota && countKHO[khoStaff] >= targetKHO[khoStaff]) continue;
              if (!exactQuota && countKHO[khoStaff] >= 2) continue;
              if (!exactQuota && (countTN[khoStaff] + countKHO[khoStaff] >= 3)) continue;
              if (!allowConsecutive && prevDay && assignment[prevDay]?.KHO === khoStaff) continue;

              countKHO[khoStaff]++;
              assignment[day] = { TN: tnStaff, KHO: khoStaff };

              if (backtrack(dayIdx + 1)) return true;

              countKHO[khoStaff]--;
              delete assignment[day];
            }

            countTN[tnStaff]--;
          }
          return false;
        }

        const success = backtrack(0);
        return { success, assignment };
      }

      // Ưu tiên 1: Đảm bảo đúng định mức ca được bù ngày khác (exactQuota) + không trực 2 ngày liền kề cùng ca
      let res = solveAssignment(true, false);
      // Dự phòng 2: Cho phép 2 ngày liền kề nếu số ngày nghỉ OFF gây nghẽn nhưng vẫn giữ đúng định mức ca bù
      if (!res.success) res = solveAssignment(true, true);
      // Dự phòng 3: Nới lỏng định mức nhưng vẫn khống chế TN<=2, KHO<=2, Tổng ca<=3, không liền kề
      if (!res.success) res = solveAssignment(false, false);
      // Dự phòng 4: Cho phép nới lỏng liền kề
      if (!res.success) res = solveAssignment(false, true);

      if (res.success && res.assignment) {
        DAYS.forEach((d) => {
          const { TN: actualTN, KHO: actualKHO } = res.assignment[d];
          if (actualTN) {
            result[wName][actualTN][d] = 'TN';
            if (actualTN !== planned[d].tn) {
              if (!dominoLog[wName][actualTN]) dominoLog[wName][actualTN] = {};
              dominoLog[wName][actualTN][d] = (planned[d].tn && isOff(planned[d].tn, d))
                ? `Trực thay TN cho ${planned[d].tn} (do ${planned[d].tn} nghỉ OFF; ${planned[d].tn} được bù sang ngày khác)`
                : `Bù đổi ca TN ngày này`;
            }
          }
          if (actualKHO) {
            result[wName][actualKHO][d] = 'KHO';
            if (actualKHO !== planned[d].kho) {
              if (!dominoLog[wName][actualKHO]) dominoLog[wName][actualKHO] = {};
              dominoLog[wName][actualKHO][d] = (planned[d].kho && isOff(planned[d].kho, d))
                ? `Trực thay KHO cho ${planned[d].kho} (do ${planned[d].kho} nghỉ OFF; ${planned[d].kho} được bù sang ngày khác)`
                : `Bù đổi ca KHO ngày này`;
            }
          }
        });
      }
    }

    // Xử lý toàn tuần cho cả 2 nhóm nhân viên
    processGroupWeek(STAFF_GROUP_1, GROUP1_PERMUTATIONS, GROUP1_SLOTS);
    processGroupWeek(STAFF_GROUP_2, GROUP2_PERMUTATIONS, GROUP2_SLOTS);
  });

  result._dominoLog = dominoLog;
  return result;
}

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
const AppState = {
  currentMonth: getCurrentMonthString(), // Tự động chọn tháng hiện tại theo hệ thống (ví dụ: 'THÁNG 10')
  currentWeek: 'all',                   // Mặc định chọn chế độ 'Cả Tháng'
  activeStamp: 'none',                  // 'none', 'TN', 'KHO', 'HC', 'x', 'CLEAR'
  schedule: {},                         // { [month]: { [week]: { [staff]: { T2: '', T3: 'x', ... } } } }
  history: [],                          // Undo stack
  unsavedChangesCount: 0,
  scriptUrl: localStorage.getItem('PHANCA_APPS_SCRIPT_URL') || '',
  isSyncing: false
};

const CACHE_KEY = 'PHANCA_LOCAL_CACHE';
const CACHE_VERSION_KEY = 'PHANCA_CACHE_VERSION';
const CURRENT_CACHE_VERSION = 'v11_compensate_off_shifts_to_other_days';

/**
 * Kiểm tra xem một tháng đã có bất kỳ ca trực nào chưa
 */
function isMonthPopulated(month) {
  if (!AppState.schedule || !AppState.schedule[month]) return false;
  for (const w of WEEKS) {
    if (!AppState.schedule[month][w]) continue;
    for (const s of ALL_STAFF) {
      for (const d of DAYS) {
        if (AppState.schedule[month][w][s]?.[d]) return true;
      }
    }
  }
  return false;
}

// ==========================================================================
// KHỞI TẠO DỮ LIỆU BAN ĐẦU
// ==========================================================================
function initScheduleData() {
  // Luôn đặt tháng hiện tại theo thời gian thực và tuần mặc định là 'all' (Cả Tháng)
  AppState.currentMonth = getCurrentMonthString();
  AppState.currentWeek = 'all';

  // Tải danh sách nhân viên tùy chỉnh từ localStorage (nếu có)
  loadCustomStaffList();

  // Kiểm tra phiên bản cache (nếu cũ thì xóa để cập nhật lịch xoay tua mới)
  const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
  if (cachedVersion !== CURRENT_CACHE_VERSION) {
    localStorage.removeItem(CACHE_KEY);
    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
  }

  // Thử khôi phục từ localStorage trước
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      AppState.schedule = JSON.parse(cached);
      ensureStaffScheduleIntegrity();
      updateAssignStaffDropdown();

      // Nếu tháng hiện tại chưa có dữ liệu, tự động nạp lịch xoay tua cân bằng cho tháng đó
      if (!isMonthPopulated(AppState.currentMonth)) {
        AppState.schedule[AppState.currentMonth] = JSON.parse(JSON.stringify(generateBalanced4WeeksSchedule(AppState.currentMonth)));
        saveLocalCache();
      }
      return;
    } catch (e) {
      console.warn('Lỗi đọc cache local:', e);
    }
  }

  // Khởi tạo khung lịch chuẩn cho các tháng
  const newSchedule = {};

  MONTHS.forEach((m) => {
    newSchedule[m] = {};
    WEEKS.forEach((w) => {
      newSchedule[m][w] = {};
      ALL_STAFF.forEach((staff) => {
        newSchedule[m][w][staff] = {};
        DAYS.forEach((d) => {
          newSchedule[m][w][staff][d] = '';
        });
      });
    });
  });

  // Mặc định nạp lịch 4 tuần xoay tua cân bằng cho tháng hiện tại và THÁNG 09, THÁNG 10
  [AppState.currentMonth, 'THÁNG 09', 'THÁNG 10'].forEach(m => {
    if (newSchedule[m]) {
      newSchedule[m] = JSON.parse(JSON.stringify(generateBalanced4WeeksSchedule(m)));
    }
  });

  AppState.schedule = newSchedule;
  saveLocalCache();
}

function saveLocalCache() {
  try {
    localStorage.setItem('PHANCA_LOCAL_CACHE', JSON.stringify(AppState.schedule));
  } catch (e) {
    console.error('Không thể lưu localStorage:', e);
  }
}

// ==========================================================================
// RENDER BẢNG PHÂN CA
// ==========================================================================
function renderSchedule() {
  const isAllWeeks = AppState.currentWeek === 'all';
  const singleViewContainer = document.getElementById('singleWeekView');
  const allWeeksContainer = document.getElementById('allWeeksMonthView');
  const exportTitle = document.getElementById('exportScheduleTitle');

  // Cập nhật tiêu đề xuất ảnh
  if (isAllWeeks) {
    exportTitle.textContent = `BẢNG PHÂN CA HÀNH CHÍNH - TOÀN BỘ ${AppState.currentMonth}`;
    singleViewContainer.classList.add('hidden');
    allWeeksContainer.classList.remove('hidden');
    renderAllWeeksView(allWeeksContainer);
  } else {
    exportTitle.textContent = `BẢNG PHÂN CA HÀNH CHÍNH - ${AppState.currentWeek.toUpperCase()} - ${AppState.currentMonth}`;
    allWeeksContainer.classList.add('hidden');
    singleViewContainer.classList.remove('hidden');
    renderSingleWeekView();
  }

  // Cập nhật ngày đồng bộ ở góc bảng
  const now = new Date();
  document.getElementById('exportDateStamp').textContent = 
    `Đồng bộ: ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  // Cập nhật thống kê nhanh
  updateStats();
}

/**
 * Render bảng xem 1 tuần cụ thể
 */
function renderSingleWeekView() {
  const tbody = document.getElementById('scheduleTableBodySingle');
  tbody.innerHTML = '';

  // Cập nhật ngày tháng dưới tiêu đề T2, T3...
  updateTableDateHeaders();

  const month = AppState.currentMonth;
  const week = AppState.currentWeek;
  const weekData = (AppState.schedule[month] && AppState.schedule[month][week]) ? AppState.schedule[month][week] : {};

  // Render Nhóm 1
  renderGroupRows(tbody, '🔵 Nhóm 1 (Hành Chính 1)', STAFF_GROUP_1, 1, weekData, week);

  // Render Nhóm 2
  renderGroupRows(tbody, '🟢 Nhóm 2 (Hành Chính 2)', STAFF_GROUP_2, 2, weekData, week);
}

/**
 * Render các hàng nhân viên theo nhóm
 */
function renderGroupRows(tbody, groupTitle, staffList, groupNum, weekData, weekName) {
  const currentWeek = weekName || AppState.currentWeek;

  // Dòng tiêu đề nhóm
  const groupRow = document.createElement('tr');
  groupRow.className = `group-separator-row group-${groupNum}`;
  groupRow.innerHTML = `<td colspan="13"><i class="fa-solid fa-users"></i> ${groupTitle}</td>`;
  tbody.appendChild(groupRow);

  staffList.forEach((staffName, idx) => {
    const tr = document.createElement('tr');
    const staffShifts = weekData[staffName] || {};

    let tnCount = 0;
    let khoCount = 0;
    let offCount = 0;

    let daysHtml = '';
    DAYS.forEach((day) => {
      const shiftVal = String(staffShifts[day] || '').trim();
      const upperVal = shiftVal.toUpperCase();

      if (upperVal === 'TN') tnCount++;
      else if (upperVal === 'KHO') khoCount++;
      else if (upperVal === 'X') offCount++;

      let cellContent = '';
      if (upperVal === 'TN') {
        cellContent = '<span class="shift-badge badge-tn">TN</span>';
      } else if (upperVal === 'KHO') {
        cellContent = '<span class="shift-badge badge-kho">KHO</span>';
      } else if (upperVal === 'HC') {
        cellContent = '<span class="shift-badge badge-hc">HC</span>';
      } else if (upperVal === 'X') {
        cellContent = '<span class="shift-badge badge-off">x</span>';
      } else {
        cellContent = '<span class="shift-empty">-</span>';
      }

      const isSunday = day === 'CN';
      daysHtml += `
        <td class="shift-cell ${isSunday ? 'col-sunday' : ''}" 
            data-staff="${staffName}" 
            data-day="${day}" 
            data-week="${currentWeek}">
          ${cellContent}
        </td>
      `;
    });

    const initial = staffName.charAt(0);
    const avatarClass = groupNum === 2 ? 'staff-avatar avatar-g2' : 'staff-avatar';

    tr.innerHTML = `
      <td class="col-stt">${idx + 1}</td>
      <td class="col-name">
        <div class="staff-name-cell">
          <span class="${avatarClass}">${initial}</span>
          <span>${staffName}</span>
        </div>
      </td>
      <td class="col-group">
        <span class="badge ${groupNum === 1 ? 'pill-group-1' : 'pill-group-2'}" style="font-size: 0.72rem; padding: 2px 6px;">
          Nhóm ${groupNum}
        </span>
      </td>
      ${daysHtml}
      <td class="col-summary"><strong>${tnCount}</strong></td>
      <td class="col-summary"><strong>${khoCount}</strong></td>
      <td class="col-summary text-danger"><strong>${offCount}</strong></td>
    `;

    tbody.appendChild(tr);
  });
}

/**
 * Render chế độ xem cả tháng (4 tuần) - cũng chia thành 2 nhóm như xem 1 tuần
 */
function renderAllWeeksView(container) {
  container.innerHTML = '';
  const month = AppState.currentMonth;

  WEEKS.forEach((weekName) => {
    const weekBlock = document.createElement('div');
    weekBlock.className = 'month-week-block table-responsive';

    const weekData = (AppState.schedule[month] && AppState.schedule[month][weekName]) ? AppState.schedule[month][weekName] : {};
    const weekDates = getWeekDates(month, weekName);

    let daysThHtml = '';
    DAYS.forEach((d) => {
      const isSun = d === 'CN';
      daysThHtml += `
        <th class="col-day ${isSun ? 'col-sunday' : ''}">
          <div class="day-header-wrapper">
            <span class="day-label">${d}</span>
            <span class="day-sub-date">${weekDates[d] || ''}</span>
          </div>
        </th>
      `;
    });

    const titleDiv = document.createElement('div');
    titleDiv.className = 'week-block-title';
    titleDiv.innerHTML = `<i class="fa-regular fa-calendar-check"></i> ${weekName} - ${month} (${weekDates['T2']} - ${weekDates['CN']})`;

    const table = document.createElement('table');
    table.className = 'schedule-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th class="col-stt">STT</th>
          <th class="col-name">NHÂN VIÊN</th>
          <th class="col-group">NHÓM</th>
          ${daysThHtml}
          <th class="col-summary">TN</th>
          <th class="col-summary">KHO</th>
          <th class="col-summary">Nghỉ</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    // Render Nhóm 1
    renderGroupRows(tbody, '🔵 Nhóm 1 (Hành Chính 1)', STAFF_GROUP_1, 1, weekData, weekName);

    // Render Nhóm 2
    renderGroupRows(tbody, '🟢 Nhóm 2 (Hành Chính 2)', STAFF_GROUP_2, 2, weekData, weekName);

    table.appendChild(tbody);
    weekBlock.appendChild(titleDiv);
    weekBlock.appendChild(table);
    container.appendChild(weekBlock);
  });
}

/**
 * Cập nhật các ô số liệu thống kê
 */
function updateStats() {
  const month = AppState.currentMonth;
  const isAll = (AppState.currentWeek === 'all');
  let tnTotal = 0;
  let khoTotal = 0;

  if (isAll) {
    WEEKS.forEach((w) => {
      const weekData = (AppState.schedule[month] && AppState.schedule[month][w]) ? AppState.schedule[month][w] : {};
      ALL_STAFF.forEach((staff) => {
        const shifts = weekData[staff] || {};
        DAYS.forEach((day) => {
          const v = String(shifts[day] || '').toUpperCase();
          if (v === 'TN') tnTotal++;
          if (v === 'KHO') khoTotal++;
        });
      });
    });
  } else {
    const week = AppState.currentWeek;
    const weekData = (AppState.schedule[month] && AppState.schedule[month][week]) ? AppState.schedule[month][week] : {};
    ALL_STAFF.forEach((staff) => {
      const shifts = weekData[staff] || {};
      DAYS.forEach((day) => {
        const v = String(shifts[day] || '').toUpperCase();
        if (v === 'TN') tnTotal++;
        if (v === 'KHO') khoTotal++;
      });
    });
  }

  document.getElementById('statTotalStaff').textContent = `${ALL_STAFF.length} Người`;
  const statStaffDescEl = document.getElementById('statStaffDesc');
  if (statStaffDescEl) {
    statStaffDescEl.textContent = `Nhóm 1: ${STAFF_GROUP_1.length} • Nhóm 2: ${STAFF_GROUP_2.length}`;
  }
  document.getElementById('statTNCount').textContent = `${tnTotal} Ca`;
  document.getElementById('statKHOCount').textContent = `${khoTotal} Ca`;

  // Trạng thái lưu
  const saveStateEl = document.getElementById('statSaveState');
  const lastSavedTimeEl = document.getElementById('statLastSavedTime');
  const floatingBar = document.getElementById('floatingSaveBar');
  const unsavedBadge = document.getElementById('unsavedChangesBadge');
  const btnReset = document.getElementById('btnResetChanges');

  if (AppState.unsavedChangesCount > 0) {
    saveStateEl.textContent = `Chưa lưu (${AppState.unsavedChangesCount})`;
    saveStateEl.style.color = '#e11d48';
    lastSavedTimeEl.textContent = 'Bấm Lưu để đồng bộ Firebase';
    floatingBar.classList.add('visible');
    unsavedBadge.textContent = `${AppState.unsavedChangesCount} thay đổi chưa lưu`;
    btnReset.disabled = false;
  } else {
    saveStateEl.textContent = 'Đã đồng bộ';
    saveStateEl.style.color = '#059669';
    floatingBar.classList.remove('visible');
    btnReset.disabled = true;
  }
}

// ==========================================================================
// TƯƠNG TÁC Ô LỊCH & BÚT CHỌN CA NHANH
// ==========================================================================
function setupTableInteractions() {
  document.addEventListener('click', (e) => {
    const cell = e.target.closest('.shift-cell');
    if (!cell) return;

    const staff = cell.dataset.staff;
    const day = cell.dataset.day;
    const week = cell.dataset.week;
    const month = AppState.currentMonth;

    if (!staff || !day || !week || !month) return;

    const currentShift = String(AppState.schedule[month]?.[week]?.[staff]?.[day] || '');
    let newShift = currentShift;

    // Nếu đang bật Bút chọn ca nhanh (Stamp Brush)
    if (AppState.activeStamp !== 'none') {
      if (AppState.activeStamp === 'CLEAR') {
        newShift = '';
      } else {
        // Toggle: Click lần 1 gán ca, Click lần 2 nếu ô đã là ca đó thì xóa thành ô trống
        if (currentShift.trim().toUpperCase() === AppState.activeStamp.trim().toUpperCase()) {
          newShift = '';
        } else {
          newShift = AppState.activeStamp;
        }
      }
    } else {
      // Chuột thường: xoay vòng ca (Trống -> TN -> KHO -> HC -> x -> Trống)
      const cycle = ['', 'TN', 'KHO', 'HC', 'x'];
      const nextIdx = (cycle.indexOf(currentShift) + 1) % cycle.length;
      newShift = cycle[nextIdx];
    }

    if (newShift !== currentShift) {
      applyCellChange(month, week, staff, day, newShift);
    }
  });
}

function applyCellChange(month, week, staff, day, newShift) {
  if (!AppState.schedule[month]) AppState.schedule[month] = {};
  if (!AppState.schedule[month][week]) AppState.schedule[month][week] = {};
  if (!AppState.schedule[month][week][staff]) AppState.schedule[month][week][staff] = {};

  AppState.schedule[month][week][staff][day] = newShift;
  AppState.unsavedChangesCount++;

  saveLocalCache();
  renderSchedule();

  // Hiệu ứng âm thanh nhẹ hoặc rung haptic nếu có
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(10);
  }
}

// ==========================================================================
// FORM PHÂN CA "AI" (AI LÀM CA NÀO)
// ==========================================================================
function setupAssignForm() {
  updateAssignStaffDropdown();
  const btnApplyShift = document.getElementById('btnApplyShift');
  const btnApplyWorkDaysOnly = document.getElementById('btnApplyWorkDaysOnly');

  function executeFormAssign(skipOffDays) {
    const staff = document.getElementById('assignStaffSelect').value;
    const shift = document.getElementById('assignShiftSelect').value;
    const checkedDays = Array.from(document.querySelectorAll('#daysCheckboxes input:checked')).map(cb => cb.value);

    if (!staff) {
      showToast('Vui lòng chọn nhân viên!', 'error');
      return;
    }
    if (checkedDays.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 thứ trong tuần!', 'error');
      return;
    }

    const month = AppState.currentMonth;
    const week = (AppState.currentWeek === 'all') ? 'Tuần 1' : AppState.currentWeek;

    let appliedCount = 0;
    checkedDays.forEach((day) => {
      const currentVal = AppState.schedule[month]?.[week]?.[staff]?.[day] || '';

      // Bỏ qua ngày nghỉ 'x' nếu người dùng chọn tùy chọn này
      if (skipOffDays && currentVal.toUpperCase() === 'X') {
        return;
      }

      if (currentVal !== shift) {
        if (!AppState.schedule[month]) AppState.schedule[month] = {};
        if (!AppState.schedule[month][week]) AppState.schedule[month][week] = {};
        if (!AppState.schedule[month][week][staff]) AppState.schedule[month][week][staff] = {};

        AppState.schedule[month][week][staff][day] = shift;
        appliedCount++;
      }
    });

    if (appliedCount > 0) {
      AppState.unsavedChangesCount += appliedCount;
      saveLocalCache();
      renderSchedule();
      showToast(`Đã gán ca "${shift || 'Trống'}" cho ${staff} (${appliedCount} ngày)!`, 'success');
    } else {
      showToast(`Không có ngày nào cần thay đổi cho ${staff}.`, 'info');
    }
  }

  btnApplyShift.addEventListener('click', () => executeFormAssign(false));
  btnApplyWorkDaysOnly.addEventListener('click', () => executeFormAssign(true));
}

// ==========================================================================
// BÚT CHỌN CA NHANH (STAMP BRUSHES)
// ==========================================================================
function setupStampBrushes() {
  const stampButtons = document.querySelectorAll('.stamp-btn');
  stampButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      stampButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      AppState.activeStamp = btn.dataset.stamp;

      // Cập nhật con trỏ chuột
      if (AppState.activeStamp === 'none') {
        document.body.style.cursor = 'default';
      } else {
        document.body.style.cursor = 'crosshair';
      }
    });
  });
}

// ==========================================================================
// TỰ ĐỘNG XOAY TUA CA 4 TUẦN (KHO & TN)
// ==========================================================================
// ==========================================================================
// TỰ ĐỘNG XOAY TUA CA 4 TUẦN (KHO & TN) CÂN BẰNG TUYỆT ĐỐI
// ==========================================================================
function setupAutoRotateModal() {
  const modal = document.getElementById('modalAutoRotate');
  const btnOpen = document.getElementById('btnAutoRotateModal');
  const btnClose = document.getElementById('btnCloseAutoRotate');
  const btnCancel = document.getElementById('btnCancelAutoRotate');
  const btnExecute = document.getElementById('btnExecuteAutoRotate');
  const btnTabSummary = document.getElementById('btnTabRotateSummary');
  const btnTabDetail = document.getElementById('btnTabRotateDetail');
  const tabSummaryContent = document.getElementById('rotateTabSummaryContent');
  const tabDetailContent = document.getElementById('rotateTabDetailContent');
  const targetMonthText = document.getElementById('rotateTargetMonthText');

  if (!modal || !btnOpen) return;

  btnOpen.addEventListener('click', () => {
    if (targetMonthText) {
      targetMonthText.textContent = AppState.currentMonth;
    }
    updateRotatePreview();
    modal.classList.remove('hidden');
  });

  const closeModal = () => modal.classList.add('hidden');
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  // Chuyển đổi Tab trong Modal
  if (btnTabSummary && btnTabDetail) {
    btnTabSummary.addEventListener('click', () => {
      btnTabSummary.classList.add('active');
      btnTabDetail.classList.remove('active');
      if (tabSummaryContent) tabSummaryContent.classList.remove('hidden');
      if (tabDetailContent) tabDetailContent.classList.add('hidden');
    });

    btnTabDetail.addEventListener('click', () => {
      btnTabDetail.classList.add('active');
      btnTabSummary.classList.remove('active');
      if (tabDetailContent) tabDetailContent.classList.remove('hidden');
      if (tabSummaryContent) tabSummaryContent.classList.add('hidden');
    });
  }

  // Bấm Áp Dụng Xoay Tua
  if (btnExecute) {
    btnExecute.addEventListener('click', () => {
      executeAutoRotate();
      closeModal();
    });
  }
}

/**
 * Hiển thị dữ liệu xem trước xoay tua ca 4 tuần và bảng cân bằng
 */
function updateRotatePreview() {
  const month = AppState.currentMonth || 'THÁNG 09';
  const balancedSchedule = generateBalanced4WeeksSchedule(month);
  const dominoLog = balancedSchedule._dominoLog || {};
  const summaryBody = document.getElementById('rotateSummaryBody');
  const detailBody = document.getElementById('rotateDetailBody');

  if (!summaryBody || !detailBody) return;

  // 1. RENDER BẢNG TỔNG KẾT CÂN BẰNG THÁNG
  summaryBody.innerHTML = '';
  ALL_STAFF.forEach((staff, idx) => {
    const isG1 = STAFF_GROUP_1.includes(staff);
    const groupName = isG1 ? 'Nhóm 1' : 'Nhóm 2';
    const groupBadge = isG1 ? 'pill-group-1' : 'pill-group-2';

    let totalTN = 0;
    let totalKHO = 0;
    let totalOff = 0;
    const weekShiftsSummary = [];

    WEEKS.forEach(wName => {
      let wTN = 0;
      let wKHO = 0;
      let wOff = 0;
      DAYS.forEach(d => {
        const val = balancedSchedule[wName]?.[staff]?.[d];
        if (val === 'TN') { wTN++; totalTN++; }
        else if (val === 'KHO') { wKHO++; totalKHO++; }
        else if (val === 'x' || val === 'X') { wOff++; totalOff++; }
      });
      let weekStr = `${wTN} TN, ${wKHO} KHO`;
      if (wOff > 0) weekStr += `, <span style="color: #dc2626; font-weight:700;">${wOff} OFF</span>`;
      weekShiftsSummary.push(weekStr);
    });

    const totalShifts = totalTN + totalKHO;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color: #64748b; font-weight: 600;">${idx + 1}</td>
      <td style="text-align: left; font-weight: 700; color: #0f172a;">${staff}</td>
      <td><span class="badge ${groupBadge}" style="font-size: 0.72rem; padding: 2px 6px;">${groupName}</span></td>
      <td style="font-size: 0.78rem; color: #334155;">${weekShiftsSummary[0]}</td>
      <td style="font-size: 0.78rem; color: #334155;">${weekShiftsSummary[1]}</td>
      <td style="font-size: 0.78rem; color: #334155;">${weekShiftsSummary[2]}</td>
      <td style="font-size: 0.78rem; color: #334155;">${weekShiftsSummary[3]}</td>
      <td><strong style="color: #6d28d9; font-size: 0.95rem;">${totalTN}</strong></td>
      <td><strong style="color: #ea580c; font-size: 0.95rem;">${totalKHO}</strong></td>
      <td><strong style="color: #0284c7; font-size: 0.95rem;">${totalShifts}</strong></td>
      <td><span style="background: #ecfdf5; color: #059669; font-weight: 700; font-size: 0.72rem; padding: 3px 8px; border-radius: 9999px;">${totalOff > 0 ? `✓ Có ${totalOff} OFF` : '✓ Cân bằng'}</span></td>
    `;
    summaryBody.appendChild(tr);
  });

  // 2. RENDER BẢNG CHI TIẾT 4 TUẦN
  detailBody.innerHTML = '';
  WEEKS.forEach((wName) => {
    const weekDates = getWeekDates(AppState.currentMonth, wName);
    const sepRow = document.createElement('tr');
    sepRow.style.background = '#f0f7ff';
    sepRow.innerHTML = `<td colspan="11" style="text-align: left; font-weight: 800; color: #0369a1; padding: 6px 12px;"><i class="fa-solid fa-calendar-check"></i> ${wName.toUpperCase()} (${weekDates['T2']} - ${weekDates['CN']})</td>`;
    detailBody.appendChild(sepRow);

    ALL_STAFF.forEach((staff) => {
      const shifts = balancedSchedule[wName]?.[staff] || {};

      let wTN = 0;
      let wKHO = 0;
      let daysHtml = '';

      DAYS.forEach(d => {
        const val = shifts[d] || '';
        const dominoNote = dominoLog[wName]?.[staff]?.[d] || '';
        if (val === 'TN') {
          wTN++;
          if (dominoNote) {
            daysHtml += `<td><span class="shift-badge badge-tn" title="${dominoNote}" style="border: 2px solid #f59e0b; box-shadow: 0 0 5px rgba(245,158,11,0.5); cursor: help;">TN ⚡</span></td>`;
          } else {
            daysHtml += `<td><span class="shift-badge badge-tn">TN</span></td>`;
          }
        } else if (val === 'KHO') {
          wKHO++;
          if (dominoNote) {
            daysHtml += `<td><span class="shift-badge badge-kho" title="${dominoNote}" style="border: 2px solid #f59e0b; box-shadow: 0 0 5px rgba(245,158,11,0.5); cursor: help;">KHO ⚡</span></td>`;
          } else {
            daysHtml += `<td><span class="shift-badge badge-kho">KHO</span></td>`;
          }
        } else if (val === 'x' || val === 'X') {
          daysHtml += `<td><span class="shift-badge badge-off" title="Ngày nghỉ OFF đã đánh dấu (giữ nguyên)">x</span></td>`;
        } else if (val === 'HC') {
          daysHtml += `<td><span class="shift-badge badge-hc">HC</span></td>`;
        } else {
          daysHtml += `<td style="color: #cbd5e1;">-</td>`;
        }
      });

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600; color: #64748b; font-size: 0.75rem;">${wName}</td>
        <td style="text-align: left; font-weight: 700; color: #0f172a;">${staff}</td>
        ${daysHtml}
        <td><strong style="color: #6d28d9;">${wTN}</strong></td>
        <td><strong style="color: #ea580c;">${wKHO}</strong></td>
      `;
      detailBody.appendChild(tr);
    });
  });
}

/**
 * Thực thi áp dụng xoay tua ca 4 tuần cân bằng vào lịch hiện tại
 */
function executeAutoRotate() {
  const month = AppState.currentMonth;
  const balancedSchedule = generateBalanced4WeeksSchedule(month);
  const dominoLog = balancedSchedule._dominoLog || {};

  if (!AppState.schedule[month]) {
    AppState.schedule[month] = {};
  }

  let totalDominoCount = 0;
  let totalOffCount = 0;

  WEEKS.forEach((wName) => {
    AppState.schedule[month][wName] = JSON.parse(JSON.stringify(balancedSchedule[wName]));
    ALL_STAFF.forEach((staff) => {
      DAYS.forEach((d) => {
        if (dominoLog[wName]?.[staff]?.[d]) {
          totalDominoCount++;
        }
        if (AppState.schedule[month][wName][staff]?.[d] === 'x') {
          totalOffCount++;
        }
      });
    });
  });

  AppState.unsavedChangesCount += 25;
  saveLocalCache();
  renderSchedule();

  let msg = `⚡ Đã xoay tua 4 tuần cho ${month}!`;
  if (totalOffCount > 0) {
    msg += ` Giữ nguyên ${totalOffCount} ngày OFF ('x')`;
    if (totalDominoCount > 0) {
      msg += ` & tự động đôn ${totalDominoCount} ca domino`;
    }
    msg += ` thành công.`;
  } else {
    msg += ` Cân bằng ca TN & KHO thành công.`;
  }
  showToast(msg, 'success');
}

// ==========================================================================
// XUẤT ẢNH BẢNG PHÂN CA (THEO TUẦN VÀ THEO THÁNG)
// ==========================================================================
function setupImageExport() {
  const btnExportWeek = document.getElementById('btnExportWeek');
  const btnExportMonth = document.getElementById('btnExportMonth');
  const modalImagePreview = document.getElementById('modalImagePreview');
  const btnCloseImageModal = document.getElementById('btnCloseImageModal');
  const btnClosePreviewBtn = document.getElementById('btnClosePreviewBtn');

  const closePreview = () => modalImagePreview.classList.add('hidden');
  btnCloseImageModal.addEventListener('click', closePreview);
  btnClosePreviewBtn.addEventListener('click', closePreview);

  // Xuất ảnh Tuần này
  btnExportWeek.addEventListener('click', async () => {
    // Đảm bảo đang ở chế độ xem 1 tuần
    if (AppState.currentWeek === 'all') {
      AppState.currentWeek = 'Tuần 1';
      updateActiveWeekTab('Tuần 1');
      renderSchedule();
    }
    await generateAndExportImage(`Bang_Phan_Ca_${AppState.currentWeek}_${AppState.currentMonth}.png`, `Xem Trước Ảnh Phân Ca: ${AppState.currentWeek} - ${AppState.currentMonth}`);
  });

  // Xuất ảnh Cả Tháng
  btnExportMonth.addEventListener('click', async () => {
    // Chuyển sang chế độ xem cả tháng
    AppState.currentWeek = 'all';
    updateActiveWeekTab('all');
    renderSchedule();
    await generateAndExportImage(`Bang_Phan_Ca_Ca_Thang_${AppState.currentMonth}.png`, `Xem Trước Ảnh Phân Ca Toàn Bộ: ${AppState.currentMonth}`);
  });
}

async function generateAndExportImage(fileName, modalTitle) {
  const captureEl = document.getElementById('scheduleExportArea');
  if (!captureEl) return;

  const exportButtons = document.getElementById('exportHeaderButtons');
  const exportHeaderLegends = document.getElementById('exportHeaderLegends');

  showToast('📸 Đang tạo ảnh chất lượng cao...', 'info');

  try {
    // Tạm ẩn 2 nút xuất ảnh và hiện legend trên ảnh để ảnh chụp chuẩn chỉnh
    if (exportButtons) exportButtons.style.display = 'none';
    if (exportHeaderLegends) exportHeaderLegends.classList.remove('hidden');

    // Đợi 100ms để DOM ổn định
    await new Promise(r => setTimeout(r, 100));

    const canvas = await html2canvas(captureEl, {
      scale: 2, // 2x resolution cho hình ảnh sắc nét
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1440
    });

    // Khôi phục lại giao diện hiển thị web
    if (exportButtons) exportButtons.style.display = 'flex';
    if (exportHeaderLegends) exportHeaderLegends.classList.add('hidden');

    const imgDataUrl = canvas.toDataURL('image/png');

    // Hiển thị Preview Modal
    const imgEl = document.getElementById('exportedImageElement');
    const downloadLink = document.getElementById('btnDownloadImageLink');
    const titleEl = document.getElementById('imageModalTitle');

    imgEl.src = imgDataUrl;
    downloadLink.href = imgDataUrl;
    downloadLink.download = fileName;
    titleEl.textContent = modalTitle;

    document.getElementById('modalImagePreview').classList.remove('hidden');

    // Tự động tải về máy luôn
    const autoLink = document.createElement('a');
    autoLink.download = fileName;
    autoLink.href = imgDataUrl;
    autoLink.click();

    showToast('✅ Đã xuất ảnh thành công và tải về máy!', 'success');
  } catch (err) {
    if (exportButtons) exportButtons.style.display = 'flex';
    if (exportHeaderLegends) exportHeaderLegends.classList.add('hidden');
    console.error('Lỗi khi xuất ảnh:', err);
    showToast('Lỗi khi tạo ảnh: ' + err.message, 'error');
  }
}

// ==========================================================================
// ĐỒNG BỘ DỮ LIỆU & LƯU TRỮ FIREBASE CLOUD FIRESTORE
// Tối ưu hóa cực hạn số lượt đọc / ghi (Guaranteed < 1% gói miễn phí Spark)
// ==========================================================================

let db = null;
let isFirebaseReady = false;
const CLIENT_ID = 'phanca_client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
let lastSavedDataSignature = '';
let broadcastChannel = null;
let unsubscribeFirestoreListener = null;

const QUOTA_STORAGE_KEY = 'PHANCA_QUOTA_STATS';
const MAX_READS_PER_DAY = 50000;
const MAX_WRITES_PER_DAY = 20000;

/**
 * Khởi tạo kênh BroadcastChannel chia sẻ dữ liệu đa tab nội bộ trình duyệt
 * Giúp mở 5-10 tab không tốn thêm bất kỳ 1 lượt đọc Firebase nào (0ms latency)
 */
function initBroadcastChannel() {
  try {
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('phanca_sync_channel');
      broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_SCHEDULE' && event.data.sender !== CLIENT_ID) {
          console.log('[Multi-tab] Nhận dữ liệu cập nhật từ tab khác:', event.data);
          applyRemoteData(event.data.payload, false);
          showToast('⚡ Đã đồng bộ tức thì từ tab khác (0 reads Firebase)!', 'info');
        }
      };
    }
  } catch (e) {
    console.warn('BroadcastChannel không khả dụng:', e);
  }
}

/**
 * Quản lý & theo dõi số lượt Đọc / Ghi hàng ngày (Daily Quota Tracker)
 */
function getQuotaStats() {
  const today = new Date().toISOString().slice(0, 10);
  const defaultStats = { date: today, reads: 0, writes: 0, avoidedWrites: 0 };
  try {
    const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    if (parsed.date !== today) {
      localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(defaultStats));
      return defaultStats;
    }
    return parsed;
  } catch (e) {
    return defaultStats;
  }
}

function recordQuotaUsage(type, count = 1) {
  const stats = getQuotaStats();
  if (type === 'read') stats.reads += count;
  else if (type === 'write') stats.writes += count;
  else if (type === 'avoided') stats.avoidedWrites += count;

  try {
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {}
  updateQuotaUI();
}

function updateQuotaUI() {
  const stats = getQuotaStats();
  const readsEl = document.getElementById('quotaReadsToday');
  const writesEl = document.getElementById('quotaWritesToday');
  const avoidedEl = document.getElementById('quotaAvoidedWrites');
  const readsProg = document.getElementById('quotaReadsProgress');
  const writesProg = document.getElementById('quotaWritesProgress');
  const readsPct = document.getElementById('quotaReadsPercent');
  const writesPct = document.getElementById('quotaWritesPercent');

  if (readsEl) readsEl.textContent = Number(stats.reads).toLocaleString();
  if (writesEl) writesEl.textContent = Number(stats.writes).toLocaleString();
  if (avoidedEl) avoidedEl.textContent = Number(stats.avoidedWrites).toLocaleString();

  const readPercent = ((stats.reads / MAX_READS_PER_DAY) * 100);
  const writePercent = ((stats.writes / MAX_WRITES_PER_DAY) * 100);

  if (readsProg) {
    readsProg.style.width = Math.max(0.5, Math.min(100, readPercent)) + '%';
  }
  if (writesProg) {
    writesProg.style.width = Math.max(0.5, Math.min(100, writePercent)) + '%';
  }
  if (readsPct) {
    readsPct.textContent = `Sử dụng: ${readPercent.toFixed(2)}% (Hạn mức 50,000)`;
  }
  if (writesPct) {
    writesPct.textContent = `Sử dụng: ${writePercent.toFixed(2)}% (Hạn mức 20,000)`;
  }
}

/**
 * Tạo chữ ký dữ liệu (Signature Hash) phục vụ Dirty Checking chống ghi thừa
 */
function getDataSignature() {
  return JSON.stringify({
    schedule: AppState.schedule,
    staffGroup1: STAFF_GROUP_1,
    staffGroup2: STAFF_GROUP_2
  });
}

/**
 * Áp dụng dữ liệu nhận được từ Firebase hoặc từ BroadcastChannel
 */
function applyRemoteData(data, shouldUpdateSignature = true) {
  if (!data || !data.schedule) return;

  // Cập nhật danh sách nhân viên nếu có thay đổi
  if (Array.isArray(data.staffGroup1) && data.staffGroup1.length > 0 &&
      Array.isArray(data.staffGroup2) && data.staffGroup2.length > 0) {
    STAFF_GROUP_1 = data.staffGroup1.map(s => String(s).trim().toUpperCase()).filter(Boolean);
    STAFF_GROUP_2 = data.staffGroup2.map(s => String(s).trim().toUpperCase()).filter(Boolean);
    ALL_STAFF = [...STAFF_GROUP_1, ...STAFF_GROUP_2];
    saveCustomStaffList();
    updateAssignStaffDropdown();
  }

  // Cập nhật ma trận phân ca
  Object.keys(data.schedule).forEach(m => {
    if (!AppState.schedule[m]) AppState.schedule[m] = {};
    Object.keys(data.schedule[m]).forEach(w => {
      AppState.schedule[m][w] = {
        ...(AppState.schedule[m][w] || {}),
        ...data.schedule[m][w]
      };
    });
  });

  ensureStaffScheduleIntegrity();
  AppState.unsavedChangesCount = 0;
  saveLocalCache();
  renderSchedule();
  updateStats();

  if (shouldUpdateSignature) {
    lastSavedDataSignature = getDataSignature();
  }

  const timeStr = new Date().toLocaleTimeString();
  const lastSavedEl = document.getElementById('statLastSavedTime');
  if (lastSavedEl) lastSavedEl.textContent = `Đồng bộ lúc ${timeStr}`;

  const statusEl = document.getElementById('syncStatusText');
  if (statusEl) statusEl.textContent = 'Firebase kết nối';
}

/**
 * Khởi tạo Firebase SDK & Cloud Firestore với IndexedDB offline persistence
 */
function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK chưa được tải');
    return false;
  }
  if (!window.FIREBASE_CONFIG) {
    console.warn('Cấu hình FIREBASE_CONFIG chưa được khai báo');
    return false;
  }

  try {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(window.FIREBASE_CONFIG);
    }
    db = firebase.firestore();

    // Kích hoạt persistence để lưu cache cục bộ offline, giảm tối đa số lượt đọc
    db.enablePersistence({ synchronizeTabs: true }).catch(err => {
      if (err.code === 'failed-precondition') {
        console.log('Firebase Persistence: Đang có tab khác quản lý IndexedDB');
      } else if (err.code === 'unimplemented') {
        console.log('Firebase Persistence: Trình duyệt không hỗ trợ persistence');
      }
    });

    isFirebaseReady = true;
    console.log('✅ Firebase Cloud Firestore đã khởi tạo thành công');
    return true;
  } catch (err) {
    console.error('Lỗi khởi tạo Firebase:', err);
    return false;
  }
}

/**
 * Thiết lập các nút bấm lưu & đồng bộ Firebase
 */
function setupFirebaseSync() {
  const btnSaveToSheet = document.getElementById('btnSaveToSheet');
  const btnFloatingSave = document.getElementById('btnFloatingSave');
  const btnSyncNow = document.getElementById('btnSyncNow');

  if (btnSaveToSheet) btnSaveToSheet.addEventListener('click', () => saveToFirebase(true, false));
  if (btnFloatingSave) btnFloatingSave.addEventListener('click', () => saveToFirebase(true, false));
  if (btnSyncNow) btnSyncNow.addEventListener('click', () => syncFromFirebase(true));
}

/**
 * LƯU TOÀN BỘ PHÂN CA LÊN FIREBASE (CHỈ TỐN ĐÚNG 1 LƯỢT GHI!)
 * Có dirty-check: Nếu không có thay đổi mới -> 0 lượt ghi!
 */
async function saveToFirebase(showFeedback = true, force = false) {
  if (!isFirebaseReady && !initFirebase()) {
    showToast('Không thể kết nối Firebase! Vui lòng kiểm tra mạng hoặc cấu hình.', 'error');
    return false;
  }

  const saveBtns = [
    document.getElementById('btnSaveToSheet'),
    document.getElementById('btnFloatingSave'),
    document.getElementById('btnForceSaveFirebase')
  ].filter(Boolean);

  const resetSaveButtons = () => {
    saveBtns.forEach(b => {
      b.disabled = false;
      if (b.id === 'btnFloatingSave') {
        b.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Lưu Lên Firebase';
      } else if (b.id === 'btnForceSaveFirebase') {
        b.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Ghi Đè Lưu Lên Firebase';
      } else {
        b.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> <span>Lưu Lên Firebase</span>';
      }
    });
  };

  // 1. DIRTY CHECK: Kiểm tra xem dữ liệu có thực sự thay đổi không
  const currentSignature = getDataSignature();
  if (!force && lastSavedDataSignature && currentSignature === lastSavedDataSignature) {
    recordQuotaUsage('avoided', 1);
    if (showFeedback) {
      showToast('⚡ Dữ liệu không có thay đổi mới! Đã bỏ qua lệnh ghi để tiết kiệm Quota Firebase.', 'info');
    }
    return true;
  }

  saveBtns.forEach(b => {
    b.disabled = true;
    b.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
  });

  try {
    const colName = window.FIRESTORE_COLLECTION || 'phanca_system';
    const docName = window.FIRESTORE_DOC_MASTER || 'schedule_master';

    const payload = {
      version: '2.0',
      updatedAt: new Date().toISOString(),
      updatedBy: CLIENT_ID,
      staffGroup1: STAFF_GROUP_1,
      staffGroup2: STAFF_GROUP_2,
      schedule: AppState.schedule
    };

    // Ghi đúng 1 document duy nhất chứa toàn bộ lịch cả năm & nhân viên
    await db.collection(colName).doc(docName).set(payload);

    // Ghi nhận 1 lượt ghi vào Quota Tracker
    recordQuotaUsage('write', 1);

    lastSavedDataSignature = currentSignature;
    AppState.unsavedChangesCount = 0;
    saveLocalCache();
    renderSchedule();
    updateStats();

    // Phát tín hiệu qua BroadcastChannel cho các tab khác trong cùng trình duyệt
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({
          type: 'SYNC_SCHEDULE',
          sender: CLIENT_ID,
          payload: payload
        });
      } catch (e) {}
    }

    const timeStr = new Date().toLocaleTimeString();
    const lastSavedEl = document.getElementById('statLastSavedTime');
    if (lastSavedEl) lastSavedEl.textContent = `Lưu lúc ${timeStr}`;

    const statusEl = document.getElementById('syncStatusText');
    if (statusEl) statusEl.textContent = 'Firebase đã lưu';

    if (showFeedback) {
      showToast('✅ Đã lưu thành công lên Firebase Firestore (Tốn đúng 1 lượt ghi)!', 'success');
    }
    return true;
  } catch (err) {
    console.error('Lỗi lưu Firebase:', err);
    saveLocalCache();
    showToast(`Lỗi lưu Firebase: ${err.message}. Đã lưu bản sao trên máy!`, 'warning');
    return false;
  } finally {
    resetSaveButtons();
  }
}

/**
 * ĐỒNG BỘ TOÀN BỘ DỮ LIỆU TỪ FIREBASE (CHỈ TỐN ĐÚNG 1 LƯỢT ĐỌC!)
 */
async function syncFromFirebase(showFeedback = true) {
  if (!isFirebaseReady && !initFirebase()) {
    console.warn('Firebase chưa sẵn sàng để đồng bộ');
    return false;
  }

  const btnSync = document.getElementById('btnSyncNow');
  const btnForce = document.getElementById('btnForceSyncFirebase');
  const statusEl = document.getElementById('syncStatusText');

  if (btnSync) {
    btnSync.disabled = true;
    btnSync.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Đang tải...';
  }
  if (btnForce) {
    btnForce.disabled = true;
    btnForce.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tải...';
  }
  if (statusEl) statusEl.textContent = 'Đang đọc Firebase...';

  try {
    const colName = window.FIRESTORE_COLLECTION || 'phanca_system';
    const docName = window.FIRESTORE_DOC_MASTER || 'schedule_master';

    // Đọc đúng 1 document duy nhất (1 lượt đọc cho toàn bộ 12 tháng)
    const docSnap = await db.collection(colName).doc(docName).get();
    recordQuotaUsage('read', 1);

    if (docSnap.exists) {
      const data = docSnap.data();
      applyRemoteData(data, true);

      if (statusEl) statusEl.textContent = 'Firebase kết nối';
      if (showFeedback) {
        showToast('🔄 Đã đồng bộ toàn bộ lịch 12 tháng từ Firebase (Chỉ tốn đúng 1 lượt đọc)!', 'success');
      }
    } else {
      // Lần đầu tiên chạy: Tự động khởi tạo dữ liệu gốc lên Firestore (1 lượt ghi)
      console.log('Document schedule_master chưa tồn tại, khởi tạo dữ liệu ban đầu...');
      await saveToFirebase(false, true);
      if (statusEl) statusEl.textContent = 'Firebase sẵn sàng';
      if (showFeedback) {
        showToast('✨ Đã khởi tạo dữ liệu phân ca gốc lên Firebase Cloud Firestore!', 'info');
      }
    }
    return true;
  } catch (err) {
    console.error('Lỗi đọc Firebase:', err);
    if (statusEl) statusEl.textContent = 'Lỗi kết nối';
    if (showFeedback) {
      showToast('Không thể kết nối Firebase: ' + err.message, 'error');
    }
    return false;
  } finally {
    if (btnSync) {
      btnSync.disabled = false;
      btnSync.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> <span>Đồng bộ Firebase</span>';
    }
    if (btnForce) {
      btnForce.disabled = false;
      btnForce.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Đồng Bộ Lại Từ Firebase';
    }
  }
}

/**
 * Lắng nghe thay đổi thời gian thực (Realtime Listener) từ Firebase
 * Lọc bỏ sự kiện của chính máy này để tránh vòng lặp đọc ghi
 */
function setupFirestoreRealtimeListener() {
  if (!isFirebaseReady && !initFirebase()) return;

  try {
    if (unsubscribeFirestoreListener) {
      unsubscribeFirestoreListener();
      unsubscribeFirestoreListener = null;
    }

    const colName = window.FIRESTORE_COLLECTION || 'phanca_system';
    const docName = window.FIRESTORE_DOC_MASTER || 'schedule_master';

    unsubscribeFirestoreListener = db.collection(colName).doc(docName).onSnapshot(
      { includeMetadataChanges: true },
      (snap) => {
        // Bỏ qua nếu là sự kiện ghi local của chính tab này
        if (snap.metadata.hasPendingWrites) return;
        if (!snap.exists) return;

        const data = snap.data();
        // Bỏ qua nếu chính client này vừa ghi lên server
        if (data.updatedBy === CLIENT_ID) return;

        // Đây là thay đổi từ thiết bị khác / quản lý khác
        recordQuotaUsage('read', 1);
        applyRemoteData(data, false);
        showToast('🔄 Dữ liệu phân ca vừa được cập nhật từ thiết bị khác!', 'info');
      },
      (err) => {
        console.warn('Realtime listener thông báo:', err);
      }
    );
  } catch (err) {
    console.warn('Không thể cài đặt Realtime listener:', err);
  }
}

/**
 * Xuất dữ liệu bản sao lưu JSON về máy tính
 */
function exportBackupJson() {
  try {
    const backupData = {
      appName: 'PHANCA_SYSTEM',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      staffGroup1: STAFF_GROUP_1,
      staffGroup2: STAFF_GROUP_2,
      schedule: AppState.schedule
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `phanca_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('💾 Đã tải tệp sao lưu JSON về máy tính thành công!', 'success');
  } catch (err) {
    showToast('Lỗi khi xuất sao lưu: ' + err.message, 'error');
  }
}

/**
 * Nhập dữ liệu từ tệp bản sao lưu JSON
 */
function importBackupJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || !parsed.schedule) {
        throw new Error('Tệp không đúng định dạng dữ liệu phân ca!');
      }

      if (confirm('Bạn có chắc chắn muốn nạp toàn bộ dữ liệu từ tệp này và cập nhật lên Firebase?')) {
        applyRemoteData(parsed, false);
        await saveToFirebase(true, true);
        showToast('✅ Đã khôi phục dữ liệu từ tệp JSON thành công!', 'success');
      }
    } catch (err) {
      alert('Lỗi đọc tệp sao lưu: ' + err.message);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

// ==========================================================================
// CÀI ĐẶT & MODAL CƠ SỞ DỮ LIỆU & QUOTA
// ==========================================================================
function setupSettingsModal() {
  const modal = document.getElementById('modalSettings');
  const btnOpen = document.getElementById('btnOpenSettings');
  const btnClose = document.getElementById('btnCloseSettings');
  const btnCancel = document.getElementById('btnCancelSettings');

  const btnForceSync = document.getElementById('btnForceSyncFirebase');
  const btnForceSave = document.getElementById('btnForceSaveFirebase');
  const btnExport = document.getElementById('btnExportBackupJson');
  const inputRestore = document.getElementById('inputRestoreBackupJson');
  const btnResetQuota = document.getElementById('btnResetQuotaCounter');

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      updateQuotaUI();
      modal.classList.remove('hidden');
    });
  }

  const closeModal = () => modal.classList.add('hidden');
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (btnForceSync) btnForceSync.addEventListener('click', () => syncFromFirebase(true));
  if (btnForceSave) btnForceSave.addEventListener('click', () => saveToFirebase(true, true));
  if (btnExport) btnExport.addEventListener('click', exportBackupJson);
  if (inputRestore) inputRestore.addEventListener('change', importBackupJson);

  if (btnResetQuota) {
    btnResetQuota.addEventListener('click', () => {
      if (confirm('Đặt lại bộ đếm số lượt đọc/ghi hôm nay trên máy này?')) {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify({ date: today, reads: 0, writes: 0, avoidedWrites: 0 }));
        updateQuotaUI();
        showToast('Đã đặt lại bộ đếm quota hôm nay!', 'info');
      }
    });
  }
}

// ==========================================================================
// ĐIỀU KHIỂN THÁNG & TUẦN (TABS & SELECT)
// ==========================================================================
function setupMonthAndWeekControls() {
  const selectMonth = document.getElementById('selectMonth');
  selectMonth.value = AppState.currentMonth;

  selectMonth.addEventListener('change', (e) => {
    AppState.currentMonth = e.target.value;
    renderSchedule();
  });

  const weekTabs = document.querySelectorAll('.week-tab');
  weekTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const weekVal = tab.dataset.week;
      AppState.currentWeek = weekVal;
      updateActiveWeekTab(weekVal);
      renderSchedule();
    });
  });

  // Đồng bộ trạng thái active của tab theo AppState.currentWeek (mặc định 'all' - Cả Tháng)
  updateActiveWeekTab(AppState.currentWeek);

  // Hoàn tác thay đổi
  document.getElementById('btnResetChanges').addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn huỷ bỏ các thay đổi chưa lưu và nạp lại lịch ban đầu?')) {
      localStorage.removeItem('PHANCA_LOCAL_CACHE');
      initScheduleData();
      AppState.unsavedChangesCount = 0;
      renderSchedule();
      showToast('Đã hoàn tác toàn bộ thay đổi!', 'info');
    }
  });
}

function updateActiveWeekTab(weekVal) {
  document.querySelectorAll('.week-tab').forEach(t => {
    if (t.dataset.week === weekVal) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });
}

// ==========================================================================
// TOAST THÔNG BÁO TIỆN ÍCH
// ==========================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-info-circle text-blue';
  if (type === 'success') icon = 'fa-circle-check text-emerald';
  if (type === 'error') icon = 'fa-circle-exclamation text-danger';
  if (type === 'warning') icon = 'fa-triangle-exclamation text-amber';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function closeAlert() {
  document.getElementById('alertBanner').classList.add('hidden');
}

// ==========================================================================
// QUẢN LÝ & THÊM DANH SÁCH NHÂN VIÊN TỪNG NHÓM
// ==========================================================================
function setupStaffManagerModal() {
  const modal = document.getElementById('modalStaffManager');
  const btnOpen = document.getElementById('btnOpenStaffModal');
  const btnQuickOpen = document.getElementById('btnQuickStaffModal');
  const statStaffCard = document.getElementById('statStaffCard');
  const btnClose = document.getElementById('btnCloseStaffModal');
  const btnCancel = document.getElementById('btnCancelStaffModal');
  const btnSave = document.getElementById('btnSaveStaffModal');
  const btnReset = document.getElementById('btnResetDefaultStaff');

  const inputG1 = document.getElementById('inputNewStaffG1');
  const btnAddG1 = document.getElementById('btnAddStaffG1');
  const listG1 = document.getElementById('staffListContainerG1');

  const inputG2 = document.getElementById('inputNewStaffG2');
  const btnAddG2 = document.getElementById('btnAddStaffG2');
  const listG2 = document.getElementById('staffListContainerG2');

  const countG1El = document.getElementById('modalCountG1');
  const countG2El = document.getElementById('modalCountG2');
  const countAllEl = document.getElementById('modalCountAll');
  const badgeG1El = document.getElementById('badgeCountG1');
  const badgeG2El = document.getElementById('badgeCountG2');

  const btnToggleBatch = document.getElementById('btnToggleBatchImport');
  const batchContent = document.getElementById('batchImportContent');
  const batchChevron = document.getElementById('batchImportChevron');
  const batchTextarea = document.getElementById('batchStaffTextarea');
  const batchTargetGroup = document.getElementById('batchTargetGroup');
  const btnExecuteBatch = document.getElementById('btnExecuteBatchImport');

  let tempG1 = [];
  let tempG2 = [];

  function openModal() {
    tempG1 = [...STAFF_GROUP_1];
    tempG2 = [...STAFF_GROUP_2];
    renderModalLists();
    modal.classList.remove('hidden');
    if (inputG1) inputG1.focus();
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  function renderModalLists() {
    if (countG1El) countG1El.textContent = `${tempG1.length} Nhân Viên`;
    if (countG2El) countG2El.textContent = `${tempG2.length} Nhân Viên`;
    if (countAllEl) countAllEl.textContent = `${tempG1.length + tempG2.length} Nhân Viên`;
    if (badgeG1El) badgeG1El.textContent = `${tempG1.length} Người`;
    if (badgeG2El) badgeG2El.textContent = `${tempG2.length} Người`;

    // Render Nhóm 1
    if (listG1) {
      listG1.innerHTML = '';
      if (tempG1.length === 0) {
        listG1.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px; font-size: 0.85rem;">Chưa có nhân viên nào trong Nhóm 1</div>';
      } else {
        tempG1.forEach((name, idx) => {
          const item = document.createElement('div');
          item.className = 'staff-item-row';
          const initial = name.charAt(0);
          item.innerHTML = `
            <div class="staff-item-left">
              <span class="staff-item-order">${idx + 1}</span>
              <div class="staff-avatar-circle g1">${initial}</div>
              <span class="staff-item-name">${name}</span>
            </div>
            <div class="staff-item-actions">
              <button type="button" class="btn-item-action btn-switch-group" data-group="1" data-idx="${idx}" title="Chuyển sang Nhóm 2">
                <i class="fa-solid fa-right-left"></i> Nhóm 2
              </button>
              <button type="button" class="btn-item-action btn-delete-staff" data-group="1" data-idx="${idx}" title="Xóa nhân viên">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          `;
          listG1.appendChild(item);
        });
      }
    }

    // Render Nhóm 2
    if (listG2) {
      listG2.innerHTML = '';
      if (tempG2.length === 0) {
        listG2.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px; font-size: 0.85rem;">Chưa có nhân viên nào trong Nhóm 2</div>';
      } else {
        tempG2.forEach((name, idx) => {
          const item = document.createElement('div');
          item.className = 'staff-item-row';
          const initial = name.charAt(0);
          item.innerHTML = `
            <div class="staff-item-left">
              <span class="staff-item-order">${idx + 1}</span>
              <div class="staff-avatar-circle g2">${initial}</div>
              <span class="staff-item-name">${name}</span>
            </div>
            <div class="staff-item-actions">
              <button type="button" class="btn-item-action btn-switch-group" data-group="2" data-idx="${idx}" title="Chuyển sang Nhóm 1">
                <i class="fa-solid fa-right-left"></i> Nhóm 1
              </button>
              <button type="button" class="btn-item-action btn-delete-staff" data-group="2" data-idx="${idx}" title="Xóa nhân viên">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          `;
          listG2.appendChild(item);
        });
      }
    }
  }

  // Thêm nhân viên vào Nhóm 1
  function addStaffG1() {
    if (!inputG1) return;
    const raw = inputG1.value.trim().toUpperCase();
    if (!raw) {
      showToast('Vui lòng nhập tên nhân viên!', 'warning');
      return;
    }
    if (tempG1.includes(raw) || tempG2.includes(raw)) {
      showToast(`Nhân viên "${raw}" đã tồn tại trong danh sách!`, 'warning');
      return;
    }
    tempG1.push(raw);
    inputG1.value = '';
    renderModalLists();
    showToast(`Đã thêm "${raw}" vào Nhóm 1`, 'info');
  }

  // Thêm nhân viên vào Nhóm 2
  function addStaffG2() {
    if (!inputG2) return;
    const raw = inputG2.value.trim().toUpperCase();
    if (!raw) {
      showToast('Vui lòng nhập tên nhân viên!', 'warning');
      return;
    }
    if (tempG1.includes(raw) || tempG2.includes(raw)) {
      showToast(`Nhân viên "${raw}" đã tồn tại trong danh sách!`, 'warning');
      return;
    }
    tempG2.push(raw);
    inputG2.value = '';
    renderModalLists();
    showToast(`Đã thêm "${raw}" vào Nhóm 2`, 'info');
  }

  if (btnAddG1) btnAddG1.addEventListener('click', addStaffG1);
  if (inputG1) inputG1.addEventListener('keydown', (e) => { if (e.key === 'Enter') addStaffG1(); });

  if (btnAddG2) btnAddG2.addEventListener('click', addStaffG2);
  if (inputG2) inputG2.addEventListener('keydown', (e) => { if (e.key === 'Enter') addStaffG2(); });

  // Event delegation cho chuyển nhóm & xóa
  if (modal) {
    modal.addEventListener('click', (e) => {
      const switchBtn = e.target.closest('.btn-switch-group');
      if (switchBtn) {
        const g = parseInt(switchBtn.dataset.group, 10);
        const idx = parseInt(switchBtn.dataset.idx, 10);
        if (g === 1) {
          const moved = tempG1.splice(idx, 1)[0];
          tempG2.push(moved);
          showToast(`Đã chuyển "${moved}" sang Nhóm 2`, 'info');
        } else {
          const moved = tempG2.splice(idx, 1)[0];
          tempG1.push(moved);
          showToast(`Đã chuyển "${moved}" sang Nhóm 1`, 'info');
        }
        renderModalLists();
        return;
      }

      const delBtn = e.target.closest('.btn-delete-staff');
      if (delBtn) {
        const g = parseInt(delBtn.dataset.group, 10);
        const idx = parseInt(delBtn.dataset.idx, 10);
        const targetName = (g === 1) ? tempG1[idx] : tempG2[idx];
        if (confirm(`Bạn có chắc muốn xóa nhân viên "${targetName}" khỏi danh sách?`)) {
          if (g === 1) tempG1.splice(idx, 1);
          else tempG2.splice(idx, 1);
          renderModalLists();
          showToast(`Đã xóa "${targetName}"`, 'info');
        }
        return;
      }
    });
  }

  // Toggle Batch Import
  if (btnToggleBatch && batchContent) {
    btnToggleBatch.addEventListener('click', () => {
      const isHidden = batchContent.classList.contains('hidden');
      if (isHidden) {
        batchContent.classList.remove('hidden');
        if (batchChevron) {
          batchChevron.classList.remove('fa-chevron-down');
          batchChevron.classList.add('fa-chevron-up');
        }
      } else {
        batchContent.classList.add('hidden');
        if (batchChevron) {
          batchChevron.classList.remove('fa-chevron-up');
          batchChevron.classList.add('fa-chevron-down');
        }
      }
    });
  }

  // Thực thi Batch Import
  if (btnExecuteBatch) {
    btnExecuteBatch.addEventListener('click', () => {
      const text = batchTextarea ? batchTextarea.value.trim() : '';
      if (!text) {
        showToast('Vui lòng dán danh sách tên nhân viên vào ô trước!', 'warning');
        return;
      }
      const names = text.split(/[\n,;]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
      if (names.length === 0) {
        showToast('Không tìm thấy tên nhân viên hợp lệ!', 'warning');
        return;
      }
      const targetG = batchTargetGroup ? batchTargetGroup.value : '1';
      let addedCount = 0;
      names.forEach(n => {
        if (!tempG1.includes(n) && !tempG2.includes(n)) {
          if (targetG === '1') tempG1.push(n);
          else tempG2.push(n);
          addedCount++;
        }
      });
      if (batchTextarea) batchTextarea.value = '';
      renderModalLists();
      showToast(`Đã nạp thêm ${addedCount} nhân viên vào Nhóm ${targetG}!`, 'success');
    });
  }

  // Khôi phục mặc định
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Khôi phục lại danh sách 11 nhân viên mặc định ban đầu theo ca mẫu?')) {
        tempG1 = [...DEFAULT_STAFF_G1];
        tempG2 = [...DEFAULT_STAFF_G2];
        renderModalLists();
        showToast('Đã khôi phục danh sách nhân viên mặc định', 'info');
      }
    });
  }

  // Lưu và áp dụng
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      if (tempG1.length === 0 || tempG2.length === 0) {
        showToast('Mỗi nhóm phải có ít nhất 1 nhân viên!', 'error');
        return;
      }

      STAFF_GROUP_1 = [...tempG1];
      STAFF_GROUP_2 = [...tempG2];
      ALL_STAFF = [...STAFF_GROUP_1, ...STAFF_GROUP_2];

      saveCustomStaffList();
      ensureStaffScheduleIntegrity();
      updateAssignStaffDropdown();
      renderSchedule();
      updateStats();

      AppState.unsavedChangesCount += 1;
      saveLocalCache();
      closeModal();
      showToast(`✅ Đã cập nhật: Nhóm 1 (${STAFF_GROUP_1.length} người), Nhóm 2 (${STAFF_GROUP_2.length} người). Hãy bấm "Lưu Lên Firebase" để đồng bộ!`, 'success');
    });
  }

  if (btnOpen) btnOpen.addEventListener('click', openModal);
  if (btnQuickOpen) btnQuickOpen.addEventListener('click', openModal);
  if (statStaffCard) statStaffCard.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);
}

// ==========================================================================
// KHỞI ĐỘNG ỨNG DỤNG KHI TẢI TRANG
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initScheduleData();
  setupMonthAndWeekControls();
  setupTableInteractions();
  setupAssignForm();
  setupStaffManagerModal();
  setupStampBrushes();
  setupAutoRotateModal();
  setupImageExport();
  setupFirebaseSync();
  setupSettingsModal();

  renderSchedule();

  // Khởi tạo kênh chia sẻ dữ liệu đa tab nội bộ trình duyệt (0 read, 0 write)
  initBroadcastChannel();

  // Cập nhật giao diện giám sát Quota hôm nay
  updateQuotaUI();

  // Khởi tạo Firebase Firestore và đồng bộ dữ liệu (ĐÚNG 1 LƯỢT ĐỌC DUY NHẤT CHO CẢ NĂM)
  initFirebase();
  syncFromFirebase(false);

  // Lắng nghe cập nhật realtime từ các thiết bị khác
  setupFirestoreRealtimeListener();
});
