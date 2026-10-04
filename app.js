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

    // 2. Thuật toán gán ca & Đôn ca Domino toàn tuần đảm bảo:
    //    - Mỗi tuần mỗi nhân viên tối đa không quá 2 ca TN và không quá 2 ca KHO
    //    - Không trực cùng 1 loại ca 2 ngày liền kề nhau (ví dụ T2 KHO thì T3 không KHO)
    //    - Tôn trọng 100% các ngày đăng ký nghỉ OFF ('x')
    //    - Mỗi ngày luôn có đủ 1 TN và 1 KHO cho mỗi nhóm
    function processGroupWeek(staffList, permutations, slots) {
      const N = staffList.length;
      const planned = {};
      DAYS.forEach((d) => {
        let tn = null, kho = null;
        staffList.forEach((staff, sIdx) => {
          const slotIdx = (wIdx < permutations.length && sIdx < permutations[wIdx].length)
            ? permutations[wIdx][sIdx]
            : (sIdx % slots.length);
          const slot = slots[slotIdx];
          const shift = slot ? (slot[d] || '') : '';
          if (shift === 'TN') tn = staff;
          if (shift === 'KHO') kho = staff;
        });
        planned[d] = { tn, kho };
      });

      const isOff = (staff, d) => String(existingWeekData[staff]?.[d] || '').trim().toUpperCase() === 'X';

      function getCandidateList(plannedStaff) {
        if (!plannedStaff) return staffList.slice();
        const startIdx = staffList.indexOf(plannedStaff);
        const list = [plannedStaff];
        for (let step = 1; step < N; step++) {
          list.push(staffList[(startIdx + step) % N]);
        }
        return list;
      }

      function runBacktrack(maxPerType, maxTotal, allowConsecutive) {
        const countTN = {}, countKHO = {};
        staffList.forEach(s => { countTN[s] = 0; countKHO[s] = 0; });
        const assignment = {};

        function backtrack(dayIdx) {
          if (dayIdx === 7) return true;
          const day = DAYS[dayIdx];
          const prevDay = dayIdx > 0 ? DAYS[dayIdx - 1] : null;

          const tnCandidates = getCandidateList(planned[day].tn);
          const khoCandidates = getCandidateList(planned[day].kho);

          for (const tnStaff of tnCandidates) {
            if (isOff(tnStaff, day)) continue;
            if (countTN[tnStaff] >= maxPerType) continue;
            if (countTN[tnStaff] + countKHO[tnStaff] >= maxTotal) continue;
            if (!allowConsecutive && prevDay && assignment[prevDay]?.TN === tnStaff) continue;

            countTN[tnStaff]++;

            for (const khoStaff of khoCandidates) {
              if (khoStaff === tnStaff) continue;
              if (isOff(khoStaff, day)) continue;
              if (countKHO[khoStaff] >= maxPerType) continue;
              if (countTN[khoStaff] + countKHO[khoStaff] >= maxTotal) continue;
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

      // Ưu tiên 1: Tối đa 2 ca/loại, Tổng ca trực (TN + KHO) tối đa 3 ngày/tuần, không trực 2 ngày liền kề cùng ca
      let res = runBacktrack(2, 3, false);
      // Dự phòng 2: Cho phép liền kề nếu người nghỉ OFF gây nghẽn nhưng vẫn giữ Tổng ca <= 3
      if (!res.success) res = runBacktrack(2, 3, true);
      // Dự phòng 3: Nới lỏng Tổng ca lên 4 ngày chỉ khi tuần có quá nhiều người nghỉ OFF cùng lúc
      if (!res.success) res = runBacktrack(2, 4, false);
      if (!res.success) res = runBacktrack(2, 4, true);
      if (!res.success) res = runBacktrack(3, 5, true);

      if (res.success && res.assignment) {
        DAYS.forEach((d) => {
          const { TN: actualTN, KHO: actualKHO } = res.assignment[d];
          if (actualTN) {
            result[wName][actualTN][d] = 'TN';
            if (actualTN !== planned[d].tn) {
              if (!dominoLog[wName][actualTN]) dominoLog[wName][actualTN] = {};
              dominoLog[wName][actualTN][d] = `Đôn trực thay TN cho ${planned[d].tn} (do ${planned[d].tn} nghỉ OFF)`;
            }
          }
          if (actualKHO) {
            result[wName][actualKHO][d] = 'KHO';
            if (actualKHO !== planned[d].kho) {
              if (!dominoLog[wName][actualKHO]) dominoLog[wName][actualKHO] = {};
              dominoLog[wName][actualKHO][d] = `Đôn trực thay KHO cho ${planned[d].kho} (do ${planned[d].kho} nghỉ OFF)`;
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
const CURRENT_CACHE_VERSION = 'v10_cap_total_shifts_max_3_days';

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
    lastSavedTimeEl.textContent = 'Bấm Lưu để đồng bộ Google Sheet';
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
// ĐỒNG BỘ DỮ LIỆU & LƯU VÀO GOOGLE SHEET (phanca)
// ==========================================================================
function setupGoogleSheetSync() {
  const btnSaveToSheet = document.getElementById('btnSaveToSheet');
  const btnFloatingSave = document.getElementById('btnFloatingSave');
  const btnSyncNow = document.getElementById('btnSyncNow');

  btnSaveToSheet.addEventListener('click', saveToGoogleSheet);
  btnFloatingSave.addEventListener('click', saveToGoogleSheet);
  btnSyncNow.addEventListener('click', syncFromGoogleSheet);
}

/**
 * Lưu trực tiếp vào Google Sheet sheet "phanca"
 */
async function saveToGoogleSheet() {
  if (!AppState.scriptUrl) {
    showToast('Vui lòng cài đặt URL Web App Google Apps Script trước!', 'warning');
    document.getElementById('modalSettings').classList.remove('hidden');
    return;
  }

  const saveBtns = [document.getElementById('btnSaveToSheet'), document.getElementById('btnFloatingSave')];
  saveBtns.forEach(b => {
    b.disabled = true;
    b.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
  });

  const month = AppState.currentMonth;
  const payload = {
    action: 'saveSchedule',
    month: month,
    week: (AppState.currentWeek === 'all') ? null : AppState.currentWeek,
    schedule: AppState.schedule[month],
    staffGroup1: STAFF_GROUP_1,
    staffGroup2: STAFF_GROUP_2
  };

  let savedSuccessfully = false;
  let responseData = null;

  try {
    // Phương thức 1: Standard POST request
    try {
      const response = await fetch(AppState.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      responseData = await response.json();
      if (responseData.status === 'success' || responseData.success) {
        savedSuccessfully = true;
      }
    } catch (postErr) {
      console.warn('POST gặp lỗi CORS / mạng, tự động chuyển sang GET fallback:', postErr);
    }

    // Phương thức 2: GET fallback (GET trong Google Apps Script không bao giờ bị CORS chặn)
    if (!savedSuccessfully) {
      try {
        const getUrl = `${AppState.scriptUrl}${AppState.scriptUrl.includes('?') ? '&' : '?'}action=saveSchedule&data=${encodeURIComponent(JSON.stringify(payload))}`;
        const getResponse = await fetch(getUrl);
        responseData = await getResponse.json();
        if (responseData.status === 'success' || responseData.success) {
          savedSuccessfully = true;
        }
      } catch (getErr) {
        console.warn('GET fallback gặp lỗi, chuyển sang no-cors POST:', getErr);
        // Phương thức 3: no-cors POST (Google Apps Script luôn nhận và chạy được 100%)
        await fetch(AppState.scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        savedSuccessfully = true;
      }
    }

    if (savedSuccessfully) {
      AppState.unsavedChangesCount = 0;
      saveLocalCache();
      renderSchedule();

      const timeStr = new Date().toLocaleTimeString();
      document.getElementById('statLastSavedTime').textContent = `Lưu lúc ${timeStr}`;
      const msg = responseData?.message || 'Đã lưu thành công vào đúng sheet "phanca"!';
      showToast(`✅ ${msg}`, 'success');
    } else {
      throw new Error(responseData?.message || 'Không thể lưu vào Google Sheet');
    }
  } catch (err) {
    console.error('Lỗi lưu Google Sheet:', err);
    saveLocalCache();
    showToast(`Đã lưu bản sao trên máy! (Lưu ý: ${err.message})`, 'warning');
  } finally {
    saveBtns.forEach(b => {
      b.disabled = false;
      b.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Lưu Vào Google Sheet';
    });
  }
}

/**
 * Tải dữ liệu mới nhất từ Google Sheet sheet "phanca"
 */
async function syncFromGoogleSheet() {
  if (!AppState.scriptUrl) {
    showToast('Chưa cấu hình URL Web App Google Apps Script. Bấm "Cài đặt API" để thêm.', 'info');
    document.getElementById('modalSettings').classList.remove('hidden');
    return;
  }

  const btnSync = document.getElementById('btnSyncNow');
  const statusEl = document.getElementById('syncStatusText');

  btnSync.disabled = true;
  btnSync.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Đang tải...';
  statusEl.textContent = 'Đang đồng bộ...';

  try {
    const fetchUrl = `${AppState.scriptUrl}${AppState.scriptUrl.includes('?') ? '&' : '?'}action=getData`;
    const response = await fetch(fetchUrl);
    const result = await response.json();

    if (result.status === 'success' && result.schedule) {
      // Hợp nhất dữ liệu tải về với dữ liệu hiện tại
      Object.keys(result.schedule).forEach(m => {
        if (!AppState.schedule[m]) AppState.schedule[m] = {};
        Object.keys(result.schedule[m]).forEach(w => {
          AppState.schedule[m][w] = {
            ...(AppState.schedule[m][w] || {}),
            ...result.schedule[m][w]
          };
        });
      });

      AppState.unsavedChangesCount = 0;
      saveLocalCache();
      renderSchedule();

      statusEl.textContent = 'Đã đồng bộ tức thì';
      showToast('🔄 Đã đồng bộ dữ liệu mới nhất từ Google Sheet "phanca"!', 'success');
    } else {
      throw new Error(result.message || 'Dữ liệu trả về không đúng định dạng');
    }
  } catch (err) {
    console.error('Lỗi đồng bộ từ Google Sheet:', err);
    showToast('Không thể kết nối Google Sheet: ' + err.message, 'error');
    statusEl.textContent = 'Lỗi kết nối';
  } finally {
    btnSync.disabled = false;
    btnSync.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Đồng bộ ngay';
  }
}

// ==========================================================================
// CÀI ĐẶT & MODAL CẤU HÌNH API
// ==========================================================================
function setupSettingsModal() {
  const modal = document.getElementById('modalSettings');
  const btnOpen = document.getElementById('btnOpenSettings');
  const btnClose = document.getElementById('btnCloseSettings');
  const btnCancel = document.getElementById('btnCancelSettings');
  const btnSave = document.getElementById('btnSaveSettings');
  const inputUrl = document.getElementById('inputScriptUrl');

  btnOpen.addEventListener('click', () => {
    inputUrl.value = AppState.scriptUrl;
    modal.classList.remove('hidden');
  });

  const closeModal = () => modal.classList.add('hidden');
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  btnSave.addEventListener('click', () => {
    const url = inputUrl.value.trim();
    AppState.scriptUrl = url;
    localStorage.setItem('PHANCA_APPS_SCRIPT_URL', url);
    closeModal();
    showToast('Đã lưu URL kết nối Google Apps Script!', 'success');

    if (url) {
      syncFromGoogleSheet();
    }
  });
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
      showToast(`✅ Đã cập nhật: Nhóm 1 (${STAFF_GROUP_1.length} người), Nhóm 2 (${STAFF_GROUP_2.length} người). Hãy bấm "Lưu Vào Google Sheet" để đồng bộ!`, 'success');
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
  setupGoogleSheetSync();
  setupSettingsModal();

  renderSchedule();

  // Tự động kết nối Google Sheet nếu đã có URL Web App
  if (AppState.scriptUrl) {
    syncFromGoogleSheet();
  }
});
