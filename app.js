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

// Lịch nghỉ cố định (Dấu 'x') theo bảng tính Google Sheet gốc
const DEFAULT_OFF_DAYS = {
  'NHẠN': ['T3', 'CN'],
  'MẠNH': ['T2', 'CN'],
  'MI': ['T4', 'CN'],
  'MỸ': ['T4', 'CN'],
  'GIANG Ý': ['T5', 'CN'],
  'NGỌC ANH': ['T6', 'CN'],
  'THẮM': ['T2', 'CN'],
  'MY': ['T7', 'CN'],
  'PHÚC': ['T3', 'CN'],
  'ĐẠI': ['T7', 'CN'],
  'LÂM Ý': ['T6', 'CN']
};

// Dữ liệu ca mẫu cho Tháng 9 từ Google Sheet gốc (để có ngay dữ liệu khi mở web)
const INITIAL_SEPTEMBER_SHIFTS = {
  'Tuần 1': {
    'NHẠN': { 'T2': 'TN', 'T3': 'x', 'T4': '', 'T5': '', 'T6': 'KHO', 'T7': '', 'CN': 'TN' },
    'MẠNH': { 'T2': 'x', 'T3': 'TN', 'T4': 'KHO', 'T5': '', 'T6': '', 'T7': '', 'CN': 'KHO' },
    'MI': { 'T2': 'KHO', 'T3': '', 'T4': 'x', 'T5': '', 'T6': 'TN', 'T7': '', 'CN': '' },
    'MỸ': { 'T2': '', 'T3': 'KHO', 'T4': 'x', 'T5': '', 'T6': '', 'T7': 'TN', 'CN': '' },
    'GIANG Ý': { 'T2': '', 'T3': '', 'T4': 'TN', 'T5': 'x', 'T6': '', 'T7': 'KHO', 'CN': '' },
    'NGỌC ANH': { 'T2': '', 'T3': '', 'T4': '', 'T5': 'KHO', 'T6': 'x', 'T7': '', 'CN': 'TN' },
    'THẮM': { 'T2': 'TN', 'T3': '', 'T4': '', 'T5': 'KHO', 'T6': '', 'T7': '', 'CN': 'TN' },
    'MY': { 'T2': '', 'T3': 'TN', 'T4': '', 'T5': '', 'T6': 'TN', 'T7': 'x', 'CN': 'KHO' },
    'PHÚC': { 'T2': 'KHO', 'T3': 'x', 'T4': 'TN', 'T5': '', 'T6': 'KHO', 'T7': '', 'CN': '' },
    'ĐẠI': { 'T2': '', 'T3': 'KHO', 'T4': '', 'T5': 'TN', 'T6': '', 'T7': 'x', 'CN': 'KHO' },
    'LÂM Ý': { 'T2': '', 'T3': '', 'T4': 'KHO', 'T5': '', 'T6': 'x', 'T7': 'TN', 'CN': '' }
  }
};

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

// ==========================================================================
// KHỞI TẠO DỮ LIỆU BAN ĐẦU
// ==========================================================================
function initScheduleData() {
  // Thử khôi phục từ localStorage trước
  const cached = localStorage.getItem('PHANCA_LOCAL_CACHE');
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
  MONTHS.forEach((m) => {
    newSchedule[m] = {};
    WEEKS.forEach((w) => {
      newSchedule[m][w] = {};
      ALL_STAFF.forEach((staff) => {
        newSchedule[m][w][staff] = {};
        DAYS.forEach((d) => {
          // Điền ngày nghỉ 'x' mặc định
          const offDays = DEFAULT_OFF_DAYS[staff] || [];
          newSchedule[m][w][staff][d] = offDays.includes(d) ? 'x' : '';
        });
      });
    });
  });

  // Nạp dữ liệu mẫu Tháng 9
  if (INITIAL_SEPTEMBER_SHIFTS['Tuần 1']) {
    Object.keys(INITIAL_SEPTEMBER_SHIFTS['Tuần 1']).forEach((staff) => {
      if (newSchedule['THÁNG 09'] && newSchedule['THÁNG 09']['Tuần 1']) {
        newSchedule['THÁNG 09']['Tuần 1'][staff] = {
          ...newSchedule['THÁNG 09']['Tuần 1'][staff],
          ...INITIAL_SEPTEMBER_SHIFTS['Tuần 1'][staff]
        };
      }
    });
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

      let cellClass = 'shift-cell';
      let displayText = shiftVal;

      if (upperVal === 'TN') {
        cellClass += ' cell-shift-tn';
      } else if (upperVal === 'KHO') {
        cellClass += ' cell-shift-kho';
      } else if (upperVal === 'HC') {
        cellClass += ' cell-shift-hc';
      } else if (upperVal === 'X') {
        cellClass += ' cell-shift-off';
      } else {
        cellClass += ' cell-shift-empty';
        displayText = '-';
      }

      const isSunday = day === 'CN';
      daysHtml += `
        <td class="${cellClass} ${isSunday ? 'col-sunday' : ''}" 
            data-staff="${staffName}" 
            data-day="${day}" 
            data-week="${AppState.currentWeek}">
          ${displayText}
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
        <span class="badge ${groupNum === 1 ? 'pill-tn' : 'pill-kho'}" style="font-size: 0.72rem; padding: 2px 6px;">
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

        let cellClass = 'shift-cell';
        let displayText = shiftVal;

        if (upperVal === 'TN') cellClass += ' cell-shift-tn';
        else if (upperVal === 'KHO') cellClass += ' cell-shift-kho';
        else if (upperVal === 'HC') cellClass += ' cell-shift-hc';
        else if (upperVal === 'X') cellClass += ' cell-shift-off';
        else { cellClass += ' cell-shift-empty'; displayText = '-'; }

        daysCells += `
          <td class="${cellClass}" data-staff="${staffName}" data-day="${day}" data-week="${weekName}">
            ${displayText}
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
        newShift = AppState.activeStamp;
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
function setupAutoRotateModal() {
  const modal = document.getElementById('modalAutoRotate');
  const btnOpen = document.getElementById('btnAutoRotateModal');
  const btnClose = document.getElementById('btnCloseAutoRotate');
  const btnCancel = document.getElementById('btnCancelAutoRotate');
  const btnExecute = document.getElementById('btnExecuteAutoRotate');

  btnOpen.addEventListener('click', () => {
    modal.classList.remove('hidden');
    updateRotatePreview();
  });

  const closeModal = () => modal.classList.add('hidden');
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  // Live preview khi đổi chọn
  ['rotG1TN', 'rotG1KHO', 'rotG2TN', 'rotG2KHO'].forEach(id => {
    document.getElementById(id).addEventListener('change', updateRotatePreview);
  });

  btnExecute.addEventListener('click', () => {
    executeAutoRotate();
    closeModal();
  });
}

function calculateRotations() {
  const g1TN = document.getElementById('rotG1TN').value;
  const g1KHO = document.getElementById('rotG1KHO').value;
  const g2TN = document.getElementById('rotG2TN').value;
  const g2KHO = document.getElementById('rotG2KHO').value;

  const g1List = [...STAFF_GROUP_1];
  const g2List = [...STAFF_GROUP_2];

  let g1TnIdx = g1List.indexOf(g1TN);
  let g1KhoIdx = g1List.indexOf(g1KHO);
  let g2TnIdx = g2List.indexOf(g2TN);
  let g2KhoIdx = g2List.indexOf(g2KHO);

  const plan = [];
  WEEKS.forEach((wName, wIdx) => {
    const curG1TN = g1List[(g1TnIdx + wIdx) % g1List.length];
    let curG1KHO = g1List[(g1KhoIdx + wIdx) % g1List.length];
    // Tránh trùng người TN và KHO trong cùng 1 tuần
    if (curG1KHO === curG1TN) {
      curG1KHO = g1List[(g1KhoIdx + wIdx + 1) % g1List.length];
    }

    const curG2TN = g2List[(g2TnIdx + wIdx) % g2List.length];
    let curG2KHO = g2List[(g2KhoIdx + wIdx) % g2List.length];
    if (curG2KHO === curG2TN) {
      curG2KHO = g2List[(g2KhoIdx + wIdx + 1) % g2List.length];
    }

    plan.push({
      week: wName,
      g1TN: curG1TN,
      g1KHO: curG1KHO,
      g2TN: curG2TN,
      g2KHO: curG2KHO
    });
  });

  return plan;
}

function updateRotatePreview() {
  const plan = calculateRotations();
  const tbody = document.getElementById('rotatePreviewBody');
  tbody.innerHTML = '';

  plan.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.week}</strong></td>
      <td class="text-blue"><strong>${p.g1TN}</strong></td>
      <td class="text-emerald"><strong>${p.g1KHO}</strong></td>
      <td class="text-blue"><strong>${p.g2TN}</strong></td>
      <td class="text-emerald"><strong>${p.g2KHO}</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

function executeAutoRotate() {
  const plan = calculateRotations();
  const month = AppState.currentMonth;
  let filledCount = 0;

  plan.forEach(p => {
    const week = p.week;
    if (!AppState.schedule[month]) AppState.schedule[month] = {};
    if (!AppState.schedule[month][week]) AppState.schedule[month][week] = {};

    ALL_STAFF.forEach(staff => {
      if (!AppState.schedule[month][week][staff]) AppState.schedule[month][week][staff] = {};

      const isTN = (staff === p.g1TN || staff === p.g2TN);
      const isKHO = (staff === p.g1KHO || staff === p.g2KHO);

      DAYS.forEach(day => {
        const current = String(AppState.schedule[month][week][staff][day] || '').trim();

        // GIỮ NGUYÊN 100% NGÀY NGHỈ 'x'
        if (current.toUpperCase() === 'X') return;

        if (isTN) {
          AppState.schedule[month][week][staff][day] = 'TN';
          filledCount++;
        } else if (isKHO) {
          AppState.schedule[month][week][staff][day] = 'KHO';
          filledCount++;
        } else {
          // Nếu trước đó là TN hoặc KHO thì trả về ô trống
          if (current === 'TN' || current === 'KHO') {
            AppState.schedule[month][week][staff][day] = '';
            filledCount++;
          }
        }
      });
    });
  });

  AppState.unsavedChangesCount += filledCount;
  saveLocalCache();
  renderSchedule();
  showToast(`⚡ Đã tự động xoay tua ca 4 tuần cho ${month}! Hãy bấm "Lưu Vào Google Sheet".`, 'success');
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

  try {
    // Gửi POST request lên Google Apps Script Web App
    // Sử dụng standard fetch (GAS web app xử lý redirect và CORS)
    const response = await fetch(AppState.scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === 'success' || result.success) {
      AppState.unsavedChangesCount = 0;
      saveLocalCache();
      renderSchedule();

      const timeStr = new Date().toLocaleTimeString();
      document.getElementById('statLastSavedTime').textContent = `Lưu lúc ${timeStr}`;
      showToast(`✅ Đã lưu trực tiếp vào Google Sheet "phanca" thành công!`, 'success');
    } else {
      throw new Error(result.message || 'Lỗi không xác định từ Google Sheet');
    }
  } catch (err) {
    console.error('Lỗi lưu Google Sheet:', err);
    // Lưu vào local cache đảm bảo không mất dữ liệu
    saveLocalCache();
    showToast(`Đã lưu bản sao trên máy! (Lưu ý mạng: ${err.message})`, 'warning');
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
