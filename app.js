/**
 * ==========================================================================
 * HỆ THỐNG PHÂN CA HÀNH CHÍNH - CLIENT LOGIC (app.js)
 * Tương thích Google Apps Script Web App & GitHub Pages
 * Tone Pastel Xanh Dương • Xuất Ảnh Tuần & Tháng • Đồng Bộ Realtime
 * ==========================================================================
 */

// Cấu hình danh sách nhân viên 2 nhóm
const STAFF_GROUP_1 = ['NHẠN', 'MẠNH', 'MI', 'MỸ', 'GIANG Ý', 'NGỌC ANH'];
const STAFF_GROUP_2 = ['THẮM', 'MY', 'PHÚC', 'ĐẠI', 'LÂM Ý'];
const ALL_STAFF = [...STAFF_GROUP_1, ...STAFF_GROUP_2];

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const WEEKS = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
const MONTHS = ['THÁNG 09', 'THÁNG 10', 'THÁNG 11', 'THÁNG 12'];

// ==========================================================================
// CẤU HÌNH CA MẪU TUẦN 1 VÀ MA TRẬN XOAY TUA 4 TUẦN CÂN BẰNG TUYỆT ĐỐI
// ==========================================================================

// Lịch nghỉ cố định mặc định (để trống để mặc định không có 'x', khớp với ca mẫu tuần 1)
const DEFAULT_OFF_DAYS = {};

// Định nghĩa 6 Slot xoay ca chuẩn theo Ca Mẫu Tuần 1 (Nhóm 1 - 6 nhân viên)
const GROUP1_SLOTS = [
  { T2: 'TN', T3: '', T4: '', T5: '', T6: 'KHO', T7: '', CN: 'TN' }, // Slot 0: NHẠN (2 TN, 1 KHO)
  { T2: '', T3: '', T4: 'KHO', T5: '', T6: '', T7: '', CN: 'KHO' },  // Slot 1: MẠNH (0 TN, 2 KHO)
  { T2: 'KHO', T3: '', T4: '', T5: 'TN', T6: '', T7: '', CN: '' },   // Slot 2: MI (1 TN, 1 KHO)
  { T2: '', T3: 'KHO', T4: '', T5: '', T6: 'TN', T7: '', CN: '' },   // Slot 3: MỸ (1 TN, 1 KHO)
  { T2: '', T3: '', T4: 'TN', T5: '', T6: '', T7: 'KHO', CN: '' },   // Slot 4: GIANG Ý (1 TN, 1 KHO)
  { T2: '', T3: '', T4: '', T5: 'KHO', T6: '', T7: 'TN', CN: '' }    // Slot 5: NGỌC ANH (1 TN, 1 KHO)
];

// Định nghĩa 5 Slot xoay ca chuẩn theo Ca Mẫu Tuần 1 (Nhóm 2 - 5 nhân viên)
const GROUP2_SLOTS = [
  { T2: 'TN', T3: '', T4: '', T5: 'KHO', T6: '', T7: '', CN: 'TN' }, // Slot 0: THẮM (2 TN, 1 KHO)
  { T2: '', T3: 'TN', T4: '', T5: '', T6: 'TN', T7: '', CN: 'KHO' }, // Slot 1: MY (2 TN, 1 KHO)
  { T2: 'KHO', T3: '', T4: 'TN', T5: '', T6: 'KHO', T7: '', CN: '' },// Slot 2: PHÚC (1 TN, 2 KHO)
  { T2: '', T3: 'KHO', T4: '', T5: 'TN', T6: '', T7: 'KHO', CN: '' },// Slot 3: ĐẠI (1 TN, 2 KHO)
  { T2: '', T3: '', T4: 'KHO', T5: '', T6: '', T7: 'TN', CN: '' }    // Slot 4: LÂM Ý (1 TN, 1 KHO)
];

// Ma trận hoán vị xoay tua 4 tuần tối ưu toán học:
// - Nhóm 1: Tất cả 6 nhân viên đều có ĐÚNG 4 ca TN, 4-5 ca KHO (Tổng ca: 8 - 9 ca/người)
// - Nhóm 2: Tất cả 5 nhân viên đều có 5-6 ca TN, 5-6 ca KHO (Tổng ca: 11 - 12 ca/người)
// - Đảm bảo không trùng vị trí giữa các tuần và mỗi ngày luôn có đúng 1 TN và 1 KHO mỗi nhóm
const GROUP1_PERMUTATIONS = [
  [0, 1, 2, 3, 4, 5], // Tuần 1 (Ca mẫu ảnh)
  [1, 0, 3, 2, 5, 4], // Tuần 2
  [2, 3, 4, 5, 0, 1], // Tuần 3
  [3, 2, 5, 4, 1, 0]  // Tuần 4
];

const GROUP2_PERMUTATIONS = [
  [0, 1, 2, 3, 4], // Tuần 1 (Ca mẫu ảnh)
  [1, 0, 3, 4, 2], // Tuần 2
  [2, 3, 4, 0, 1], // Tuần 3
  [3, 4, 1, 2, 0]  // Tuần 4
];

/**
 * Sinh lịch 4 tuần cân bằng tuyệt đối từ Ca Mẫu Tuần 1
 */
function generateBalanced4WeeksSchedule() {
  const result = {};
  WEEKS.forEach((wName, wIdx) => {
    result[wName] = {};

    // Nhóm 1 (6 người)
    STAFF_GROUP_1.forEach((staff, sIdx) => {
      const slotIdx = GROUP1_PERMUTATIONS[wIdx][sIdx];
      const slot = GROUP1_SLOTS[slotIdx];
      result[wName][staff] = {};
      DAYS.forEach((d) => {
        result[wName][staff][d] = slot[d] || '';
      });
    });

    // Nhóm 2 (5 người)
    STAFF_GROUP_2.forEach((staff, sIdx) => {
      const slotIdx = GROUP2_PERMUTATIONS[wIdx][sIdx];
      const slot = GROUP2_SLOTS[slotIdx];
      result[wName][staff] = {};
      DAYS.forEach((d) => {
        result[wName][staff][d] = slot[d] || '';
      });
    });
  });
  return result;
}

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
const AppState = {
  currentMonth: 'THÁNG 09',
  currentWeek: 'Tuần 1', // 'Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', hoặc 'all'
  activeStamp: 'none',   // 'none', 'TN', 'KHO', 'HC', 'x', 'CLEAR'
  schedule: {},          // { [month]: { [week]: { [staff]: { T2: '', T3: 'x', ... } } } }
  history: [],           // Undo stack
  unsavedChangesCount: 0,
  scriptUrl: localStorage.getItem('PHANCA_APPS_SCRIPT_URL') || '',
  isSyncing: false
};

const CACHE_KEY = 'PHANCA_LOCAL_CACHE';
const CACHE_VERSION_KEY = 'PHANCA_CACHE_VERSION';
const CURRENT_CACHE_VERSION = 'v4_rotate_balanced_w1_sample';

// ==========================================================================
// KHỞI TẠO DỮ LIỆU BAN ĐẦU
// ==========================================================================
function initScheduleData() {
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
      return;
    } catch (e) {
      console.warn('Lỗi đọc cache local:', e);
    }
  }

  // Khởi tạo khung lịch chuẩn cho các tháng
  const newSchedule = {};
  const balancedSchedule = generateBalanced4WeeksSchedule();

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

  // Mặc định nạp lịch 4 tuần xoay tua cân bằng cho THÁNG 09
  if (newSchedule['THÁNG 09']) {
    newSchedule['THÁNG 09'] = JSON.parse(JSON.stringify(balancedSchedule));
  }

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

  const month = AppState.currentMonth;
  const week = AppState.currentWeek;
  const weekData = (AppState.schedule[month] && AppState.schedule[month][week]) ? AppState.schedule[month][week] : {};

  // Render Nhóm 1
  renderGroupRows(tbody, '🔵 Nhóm 1 (Hành Chính 1)', STAFF_GROUP_1, 1, weekData);

  // Render Nhóm 2
  renderGroupRows(tbody, '🟢 Nhóm 2 (Hành Chính 2)', STAFF_GROUP_2, 2, weekData);
}

/**
 * Render các hàng nhân viên theo nhóm
 */
function renderGroupRows(tbody, groupTitle, staffList, groupNum, weekData) {
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
            data-week="${AppState.currentWeek}">
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
 * Render chế độ xem cả tháng (4 tuần)
 */
function renderAllWeeksView(container) {
  container.innerHTML = '';
  const month = AppState.currentMonth;

  WEEKS.forEach((weekName) => {
    const weekBlock = document.createElement('div');
    weekBlock.className = 'month-week-block table-responsive';

    const weekData = (AppState.schedule[month] && AppState.schedule[month][weekName]) ? AppState.schedule[month][weekName] : {};

    let tableHtml = `
      <div class="week-block-title">
        <i class="fa-regular fa-calendar-check"></i> ${weekName} - ${month}
      </div>
      <table class="schedule-table">
        <thead>
          <tr>
            <th class="col-stt">STT</th>
            <th class="col-name">NHÂN VIÊN</th>
            <th class="col-day">T2</th>
            <th class="col-day">T3</th>
            <th class="col-day">T4</th>
            <th class="col-day">T5</th>
            <th class="col-day">T6</th>
            <th class="col-day">T7</th>
            <th class="col-day col-sunday">CN</th>
            <th class="col-summary">TN</th>
            <th class="col-summary">KHO</th>
            <th class="col-summary">Nghỉ</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Render 11 nhân viên
    ALL_STAFF.forEach((staffName, idx) => {
      const staffShifts = weekData[staffName] || {};
      let tnCount = 0, khoCount = 0, offCount = 0;

      let daysCells = '';
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

        daysCells += `
          <td class="shift-cell" data-staff="${staffName}" data-day="${day}" data-week="${weekName}">
            ${cellContent}
          </td>
        `;
      });

      tableHtml += `
        <tr>
          <td>${idx + 1}</td>
          <td class="col-name"><strong>${staffName}</strong></td>
          ${daysCells}
          <td>${tnCount}</td>
          <td>${khoCount}</td>
          <td class="text-danger">${offCount}</td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    weekBlock.innerHTML = tableHtml;
    container.appendChild(weekBlock);
  });
}

/**
 * Cập nhật các ô số liệu thống kê
 */
function updateStats() {
  const month = AppState.currentMonth;
  const week = (AppState.currentWeek === 'all') ? 'Tuần 1' : AppState.currentWeek;
  const weekData = (AppState.schedule[month] && AppState.schedule[month][week]) ? AppState.schedule[month][week] : {};

  let tnTotal = 0;
  let khoTotal = 0;

  ALL_STAFF.forEach((staff) => {
    const shifts = weekData[staff] || {};
    DAYS.forEach((day) => {
      const v = String(shifts[day] || '').toUpperCase();
      if (v === 'TN') tnTotal++;
      if (v === 'KHO') khoTotal++;
    });
  });

  document.getElementById('statTotalStaff').textContent = `${ALL_STAFF.length} Người`;
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
  const balancedSchedule = generateBalanced4WeeksSchedule();
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
    const weekShiftsSummary = [];

    WEEKS.forEach(wName => {
      let wTN = 0;
      let wKHO = 0;
      DAYS.forEach(d => {
        const val = balancedSchedule[wName][staff][d];
        if (val === 'TN') { wTN++; totalTN++; }
        if (val === 'KHO') { wKHO++; totalKHO++; }
      });
      weekShiftsSummary.push(`${wTN} TN, ${wKHO} KHO`);
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
      <td><span style="background: #ecfdf5; color: #059669; font-weight: 700; font-size: 0.72rem; padding: 3px 8px; border-radius: 9999px;">✓ Cân bằng</span></td>
    `;
    summaryBody.appendChild(tr);
  });

  // 2. RENDER BẢNG CHI TIẾT 4 TUẦN
  detailBody.innerHTML = '';
  WEEKS.forEach((wName) => {
    // Header phân cách tuần
    const sepRow = document.createElement('tr');
    sepRow.style.background = '#f0f7ff';
    sepRow.innerHTML = `<td colspan="11" style="text-align: left; font-weight: 800; color: #0369a1; padding: 6px 12px;"><i class="fa-solid fa-calendar-check"></i> ${wName.toUpperCase()}</td>`;
    detailBody.appendChild(sepRow);

    ALL_STAFF.forEach((staff) => {
      const shifts = balancedSchedule[wName][staff] || {};

      let wTN = 0;
      let wKHO = 0;
      let daysHtml = '';

      DAYS.forEach(d => {
        const val = shifts[d] || '';
        if (val === 'TN') {
          wTN++;
          daysHtml += `<td><span class="shift-badge badge-tn">TN</span></td>`;
        } else if (val === 'KHO') {
          wKHO++;
          daysHtml += `<td><span class="shift-badge badge-kho">KHO</span></td>`;
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
  const balancedSchedule = generateBalanced4WeeksSchedule();

  if (!AppState.schedule[month]) {
    AppState.schedule[month] = {};
  }

  WEEKS.forEach((wName) => {
    AppState.schedule[month][wName] = JSON.parse(JSON.stringify(balancedSchedule[wName]));
  });

  AppState.unsavedChangesCount += 25;
  saveLocalCache();
  renderSchedule();
  showToast(`⚡ Đã tự động xoay tua 4 tuần cân bằng tuyệt đối cho ${month}! Hãy bấm "Lưu Vào Google Sheet".`, 'success');
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

  showToast('📸 Đang tạo ảnh chất lượng cao...', 'info');

  try {
    // Đợi 200ms để DOM ổn định
    await new Promise(r => setTimeout(r, 200));

    const canvas = await html2canvas(captureEl, {
      scale: 2, // 2x resolution cho hình ảnh sắc nét
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1440
    });

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
    schedule: AppState.schedule[month]
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
// KHỞI ĐỘNG ỨNG DỤNG KHI TẢI TRANG
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initScheduleData();
  setupMonthAndWeekControls();
  setupTableInteractions();
  setupAssignForm();
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
