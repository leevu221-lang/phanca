/**
 * ==========================================================================
 * MODULE: QUẢN LÝ & CHIA LỊCH TỜ RƠI (flyer.js)
 * Tương thích 100% - Không thay đổi logic phân ca hiện tại
 * Chức năng:
 *  1. Thêm / Xoá / Sửa Nhân viên & PG
 *  2. Chia lịch tờ rơi theo Nhóm, theo Ngày, theo Buổi
 *  3. Bảng lịch trực quan (Matrix View) + Bảng tổng hợp công
 *  4. Phân công nhanh hàng loạt & Thuật toán chia tự động
 *  5. Xuất ảnh PNG sắc nét (html2canvas) & Sao chép định dạng Zalo
 * ==========================================================================
 */

// Key lưu trữ localStorage độc lập
const FLYER_STORAGE_STAFF = 'PHANCA_TOROI_STAFF_V1';
const FLYER_STORAGE_GROUPS = 'PHANCA_TOROI_GROUPS_V1';
const FLYER_STORAGE_SCHEDULE = 'PHANCA_TOROI_SCHEDULE_V1';
const FLYER_STORAGE_ACTIVE_TAB = 'PHANCA_CURRENT_APP_TAB';

// Cấu hình danh mục Buổi mặc định
const FLYER_SHIFTS = [
  { id: 'sang', name: 'Buổi Sáng', time: '07:30 - 09:30', icon: 'fa-sun', color: '#0284c7' },
  { id: 'chieu', name: 'Buổi Chiều', time: '16:30 - 18:30', icon: 'fa-cloud-sun', color: '#d97706' },
  { id: 'toi', name: 'Buổi Tối', time: '19:00 - 21:00', icon: 'fa-moon', color: '#6366f1' }
];

// Danh sách thứ trong tuần
const FLYER_DAYS = [
  { key: 0, code: 'T2', name: 'Thứ Hai', short: 'T2' },
  { key: 1, code: 'T3', name: 'Thứ Ba', short: 'T3' },
  { key: 2, code: 'T4', name: 'Thứ Tư', short: 'T4' },
  { key: 3, code: 'T5', name: 'Thứ Năm', short: 'T5' },
  { key: 4, code: 'T6', name: 'Thứ Sáu', short: 'T6' },
  { key: 5, code: 'T7', name: 'Thứ Bảy', short: 'T7' },
  { key: 6, code: 'CN', name: 'Chủ Nhật', short: 'CN' }
];

// Nhóm mặc định ban đầu
const DEFAULT_FLYER_GROUPS = [
  { id: 'g1', name: 'Nhóm 1', location: 'Tuyến Chợ & Khu Dân Cư', color: '#0284c7' },
  { id: 'g2', name: 'Nhóm 2', location: 'Tuyến Trường Học & Công Viên', color: '#059669' },
  { id: 'g3', name: 'Nhóm 3', location: 'Tuyến Ngã Tư & Trung Tâm', color: '#d97706' }
];

// Nhân sự mặc định ban đầu (Đồng bộ mẫu nhân viên sẵn có và thêm PG mẫu)
const DEFAULT_FLYER_STAFF = [
  { id: 'nv_1', name: 'NHẠN', role: 'NV', group: 'Nhóm 1', phone: '', note: '' },
  { id: 'nv_2', name: 'MẠNH', role: 'NV', group: 'Nhóm 1', phone: '', note: '' },
  { id: 'nv_3', name: 'MI', role: 'NV', group: 'Nhóm 1', phone: '', note: '' },
  { id: 'nv_4', name: 'MỸ', role: 'NV', group: 'Nhóm 1', phone: '', note: '' },
  { id: 'nv_5', name: 'GIANG Ý', role: 'NV', group: 'Nhóm 1', phone: '', note: '' },
  { id: 'nv_6', name: 'NGỌC ANH', role: 'NV', group: 'Nhóm 1', phone: '', note: '' },
  { id: 'nv_7', name: 'THẮM', role: 'NV', group: 'Nhóm 2', phone: '', note: '' },
  { id: 'nv_8', name: 'MY', role: 'NV', group: 'Nhóm 2', phone: '', note: '' },
  { id: 'nv_9', name: 'PHÚC', role: 'NV', group: 'Nhóm 2', phone: '', note: '' },
  { id: 'nv_10', name: 'ĐẠI', role: 'NV', group: 'Nhóm 2', phone: '', note: '' },
  { id: 'nv_11', name: 'LÂM Ý', role: 'NV', group: 'Nhóm 2', phone: '', note: '' },
  { id: 'pg_1', name: 'PG BÍCH TRÂM', role: 'PG', group: 'Nhóm 1', phone: '0901234567', note: 'Chuyên ca sáng/chiều' },
  { id: 'pg_2', name: 'PG MAI LINH', role: 'PG', group: 'Nhóm 2', phone: '0912345678', note: 'Chuyên ca chiều/tối' },
  { id: 'pg_3', name: 'PG NHƯ Ý', role: 'PG', group: 'Nhóm 3', phone: '0987654321', note: 'Chuyên cuối tuần' }
];

// Trạng thái của Module Tờ Rơi
const FlyerState = {
  currentWeek: 'Tuần 1',
  currentMonth: 'THÁNG 10',
  currentView: 'list', // 'list' (mặc định dễ nhìn), 'matrix' hoặc 'summary'
  filterGroup: 'all', // 'all', 'g1', 'g2', 'g3'...
  filterShift: 'all', // 'all', 'sang', 'chieu', 'toi'
  staffList: [],
  groupList: [],
  scheduleData: {}, // { [weekKey]: { [dayIdx]: { [shiftId]: { [groupId]: [ staffId, ... ] } } } }
  editingStaffId: null,
  activeCellPicker: null // { dayIdx, shiftId, groupId }
};

// ==========================================================================
// 1. KHỞI TẠO VÀ LƯU TRỮ DỮ LIỆU
// ==========================================================================

function initFlyerModule() {
  loadFlyerStaff();
  loadFlyerGroups();
  loadFlyerSchedule();

  // Đồng bộ tháng hiện tại từ selectMonth nếu có
  const selectMonth = document.getElementById('selectMonth');
  if (selectMonth && selectMonth.value) {
    FlyerState.currentMonth = selectMonth.value;
  }

  setupFlyerNavTabs();
  setupFlyerControls();
  setupFlyerQuickAssign();
  setupFlyerStaffModal();
  setupFlyerCellPicker();

  renderFlyerStats();
  renderFlyerTable();
  updateFlyerMonthLabel();
}

function getFlyerWeekKey() {
  return `${FlyerState.currentMonth}_${FlyerState.currentWeek}`;
}

function loadFlyerStaff() {
  try {
    const raw = localStorage.getItem(FLYER_STORAGE_STAFF);
    if (raw) {
      FlyerState.staffList = JSON.parse(raw);
    } else {
      // Nếu chưa có, lấy từ ALL_STAFF của app.js nếu có sẵn
      if (typeof ALL_STAFF !== 'undefined' && Array.isArray(ALL_STAFF) && ALL_STAFF.length > 0) {
        FlyerState.staffList = ALL_STAFF.map((name, idx) => ({
          id: 'nv_' + (idx + 1),
          name: name,
          role: 'NV',
          group: (typeof STAFF_GROUP_2 !== 'undefined' && STAFF_GROUP_2.includes(name)) ? 'Nhóm 2' : 'Nhóm 1',
          phone: '',
          note: ''
        }));
        // Thêm 2 PG mẫu
        FlyerState.staffList.push(
          { id: 'pg_1', name: 'PG BÍCH TRÂM', role: 'PG', group: 'Nhóm 1', phone: '0901234567', note: 'Chuyên ca sáng/chiều' },
          { id: 'pg_2', name: 'PG MAI LINH', role: 'PG', group: 'Nhóm 2', phone: '0912345678', note: 'Chuyên ca chiều/tối' }
        );
      } else {
        FlyerState.staffList = [...DEFAULT_FLYER_STAFF];
      }
      saveFlyerStaff();
    }
  } catch (e) {
    console.error('Lỗi nạp FlyerStaff:', e);
    FlyerState.staffList = [...DEFAULT_FLYER_STAFF];
  }
}

function saveFlyerStaff() {
  try {
    localStorage.setItem(FLYER_STORAGE_STAFF, JSON.stringify(FlyerState.staffList));
  } catch (e) {
    console.error('Lỗi lưu FlyerStaff:', e);
  }
}

function loadFlyerGroups() {
  try {
    const raw = localStorage.getItem(FLYER_STORAGE_GROUPS);
    if (raw) {
      FlyerState.groupList = JSON.parse(raw);
    } else {
      FlyerState.groupList = [...DEFAULT_FLYER_GROUPS];
      saveFlyerGroups();
    }
  } catch (e) {
    FlyerState.groupList = [...DEFAULT_FLYER_GROUPS];
  }
}

function saveFlyerGroups() {
  try {
    localStorage.setItem(FLYER_STORAGE_GROUPS, JSON.stringify(FlyerState.groupList));
  } catch (e) {
    console.error('Lỗi lưu FlyerGroups:', e);
  }
}

function loadFlyerSchedule() {
  try {
    const raw = localStorage.getItem(FLYER_STORAGE_SCHEDULE);
    if (raw) {
      FlyerState.scheduleData = JSON.parse(raw);
    } else {
      FlyerState.scheduleData = {};
      initDemoFlyerSchedule();
    }
  } catch (e) {
    FlyerState.scheduleData = {};
  }
}

function saveFlyerSchedule() {
  try {
    localStorage.setItem(FLYER_STORAGE_SCHEDULE, JSON.stringify(FlyerState.scheduleData));
  } catch (e) {
    console.error('Lỗi lưu FlyerSchedule:', e);
  }
}

/**
 * Khởi tạo dữ liệu mẫu cho tuần đầu để người dùng thấy ngay bảng lịch đẹp mắt
 */
function initDemoFlyerSchedule() {
  const weekKey = getFlyerWeekKey();
  if (!FlyerState.scheduleData[weekKey]) {
    FlyerState.scheduleData[weekKey] = {};
  }
  const sched = FlyerState.scheduleData[weekKey];

  // Gán mẫu ca Sáng Thứ 2: Nhóm 1 (NHẠN, PG BÍCH TRÂM), Nhóm 2 (THẮM)
  // Gán mẫu ca Chiều Thứ 2: Nhóm 1 (MẠNH), Nhóm 2 (MY, PG MAI LINH)
  const assignDemo = (dayIdx, shiftId, groupId, staffNames) => {
    if (!sched[dayIdx]) sched[dayIdx] = {};
    if (!sched[dayIdx][shiftId]) sched[dayIdx][shiftId] = {};
    if (!sched[dayIdx][shiftId][groupId]) sched[dayIdx][shiftId][groupId] = [];

    staffNames.forEach(name => {
      const found = FlyerState.staffList.find(s => s.name === name);
      if (found) {
        sched[dayIdx][shiftId][groupId].push(found.id);
      }
    });
  };

  assignDemo(0, 'sang', 'g1', ['NHẠN', 'PG BÍCH TRÂM']);
  assignDemo(0, 'sang', 'g2', ['THẮM']);
  assignDemo(0, 'chieu', 'g1', ['MẠNH']);
  assignDemo(0, 'chieu', 'g2', ['MY', 'PG MAI LINH']);

  assignDemo(1, 'sang', 'g1', ['MI']);
  assignDemo(1, 'chieu', 'g2', ['PHÚC', 'PG BÍCH TRÂM']);
  assignDemo(2, 'sang', 'g1', ['MỸ', 'PG MAI LINH']);
  assignDemo(4, 'chieu', 'g1', ['GIANG Ý', 'NGỌC ANH']);
  assignDemo(5, 'sang', 'g1', ['NHẠN', 'PG BÍCH TRÂM']);
  assignDemo(5, 'toi', 'g2', ['ĐẠI', 'LÂM Ý', 'PG MAI LINH']);
  assignDemo(6, 'sang', 'g1', ['MẠNH', 'PG BÍCH TRÂM']);
  assignDemo(6, 'chieu', 'g2', ['THẮM', 'PG MAI LINH']);

  saveFlyerSchedule();
}

// ==========================================================================
// 2. CHUYỂN ĐỔI TAB (PHÂN CA HÀNH CHÍNH & TỜ RƠI)
// ==========================================================================

function setupFlyerNavTabs() {
  const tabSchedule = document.getElementById('tabNavSchedule');
  const tabFlyer = document.getElementById('tabNavFlyer');
  const sectionSchedule = document.getElementById('sectionSchedule');
  const sectionFlyer = document.getElementById('sectionFlyer');

  function switchTab(tabName) {
    if (tabName === 'flyer') {
      if (tabSchedule) tabSchedule.classList.remove('active');
      if (tabFlyer) tabFlyer.classList.add('active');
      if (sectionSchedule) sectionSchedule.style.display = 'none';
      if (sectionFlyer) sectionFlyer.style.display = 'block';

      // Cập nhật lại giao diện và kích thước bảng
      renderFlyerStats();
      renderFlyerTable();
      updateFlyerMonthLabel();
      localStorage.setItem(FLYER_STORAGE_ACTIVE_TAB, 'flyer');
    } else {
      if (tabFlyer) tabFlyer.classList.remove('active');
      if (tabSchedule) tabSchedule.classList.add('active');
      if (sectionFlyer) sectionFlyer.style.display = 'none';
      if (sectionSchedule) sectionSchedule.style.display = 'block';
      localStorage.setItem(FLYER_STORAGE_ACTIVE_TAB, 'schedule');
    }
  }

  if (tabSchedule) {
    tabSchedule.addEventListener('click', () => switchTab('schedule'));
  }
  if (tabFlyer) {
    tabFlyer.addEventListener('click', () => switchTab('flyer'));
  }

  // Khôi phục tab đã chọn từ localStorage hoặc URL hash
  const savedTab = localStorage.getItem(FLYER_STORAGE_ACTIVE_TAB);
  const isHashToroi = (typeof window !== 'undefined' && window.location && window.location.hash === '#toroi');
  if (isHashToroi || savedTab === 'flyer') {
    switchTab('flyer');
  }

  // Lắng nghe sự thay đổi của tháng từ dropdown hệ thống chính để đồng bộ
  const selectMonth = document.getElementById('selectMonth');
  if (selectMonth) {
    selectMonth.addEventListener('change', (e) => {
      FlyerState.currentMonth = e.target.value;
      updateFlyerMonthLabel();
      renderFlyerStats();
      renderFlyerTable();
    });
  }
}

function updateFlyerMonthLabel() {
  const el = document.getElementById('flyerCurrentMonthDisplay');
  if (el) el.textContent = FlyerState.currentMonth;
  const bannerMonth = document.getElementById('flyerBannerMonth');
  if (bannerMonth) bannerMonth.textContent = `${FlyerState.currentMonth} - ${FlyerState.currentWeek}`;
}

// ==========================================================================
// 3. ĐIỀU KHIỂN & BỘ LỌC (WEEK, FILTER, VIEW SWITCHER)
// ==========================================================================

function setupFlyerControls() {
  // Chuyển tuần (Tuần 1, Tuần 2, Tuần 3, Tuần 4)
  const weekPills = document.querySelectorAll('.flyer-week-pill');
  weekPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      weekPills.forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      FlyerState.currentWeek = e.target.dataset.week;
      updateFlyerMonthLabel();
      renderFlyerStats();
      renderFlyerTable();
    });
  });

  // Nút mũi tên tuần trước / tuần sau
  const btnPrevWeek = document.getElementById('btnFlyerPrevWeek');
  const btnNextWeek = document.getElementById('btnFlyerNextWeek');

  const weeks = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
  if (btnPrevWeek) {
    btnPrevWeek.addEventListener('click', () => {
      let idx = weeks.indexOf(FlyerState.currentWeek);
      idx = (idx - 1 + weeks.length) % weeks.length;
      FlyerState.currentWeek = weeks[idx];
      updateActiveWeekPill();
      renderFlyerStats();
      renderFlyerTable();
      updateFlyerMonthLabel();
    });
  }
  if (btnNextWeek) {
    btnNextWeek.addEventListener('click', () => {
      let idx = weeks.indexOf(FlyerState.currentWeek);
      idx = (idx + 1) % weeks.length;
      FlyerState.currentWeek = weeks[idx];
      updateActiveWeekPill();
      renderFlyerStats();
      renderFlyerTable();
      updateFlyerMonthLabel();
    });
  }

  function updateActiveWeekPill() {
    weekPills.forEach(p => {
      p.classList.toggle('active', p.dataset.week === FlyerState.currentWeek);
    });
  }

  // Lọc theo Nhóm
  const groupFilters = document.querySelectorAll('.flyer-filter-group-btn');
  groupFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      groupFilters.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      FlyerState.filterGroup = e.target.dataset.group;
      renderFlyerTable();
    });
  });

  // Lọc theo Buổi
  const shiftFilters = document.querySelectorAll('.flyer-filter-shift-btn');
  shiftFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      shiftFilters.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      FlyerState.filterShift = e.target.dataset.shift;
      renderFlyerTable();
    });
  });

  // Chuyển chế độ xem (Dạng Danh Sách / Bảng Lưới / Tổng Hợp Công)
  const btnViewList = document.getElementById('btnFlyerViewList');
  const btnViewMatrix = document.getElementById('btnFlyerViewMatrix');
  const btnViewSummary = document.getElementById('btnFlyerViewSummary');
  const listWrap = document.getElementById('flyerListViewWrap');
  const matrixWrap = document.getElementById('flyerMatrixViewWrap');
  const summaryWrap = document.getElementById('flyerSummaryViewWrap');

  function setFlyerView(view) {
    FlyerState.currentView = view;
    if (btnViewList) btnViewList.classList.toggle('active', view === 'list');
    if (btnViewMatrix) btnViewMatrix.classList.toggle('active', view === 'matrix');
    if (btnViewSummary) btnViewSummary.classList.toggle('active', view === 'summary');

    if (listWrap) listWrap.style.display = (view === 'list') ? 'block' : 'none';
    if (matrixWrap) matrixWrap.style.display = (view === 'matrix') ? 'block' : 'none';
    if (summaryWrap) summaryWrap.style.display = (view === 'summary') ? 'block' : 'none';

    renderFlyerTable();
  }

  if (btnViewList) btnViewList.addEventListener('click', () => setFlyerView('list'));
  if (btnViewMatrix) btnViewMatrix.addEventListener('click', () => setFlyerView('matrix'));
  if (btnViewSummary) btnViewSummary.addEventListener('click', () => setFlyerView('summary'));

  // Thu gọn / Mở rộng hộp công cụ phân ca nhanh
  const toggleBtn = document.getElementById('btnToggleFlyerHub');
  const hubBody = document.getElementById('flyerHubBody');
  if (toggleBtn && hubBody) {
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = hubBody.classList.toggle('collapsed');
      toggleBtn.innerHTML = isCollapsed
        ? '<i class="fa-solid fa-chevron-down"></i> Mở rộng'
        : '<i class="fa-solid fa-chevron-up"></i> Thu gọn';
    });
  }

  // Các nút hành động chính
  const btnOpenStaff = document.getElementById('btnFlyerOpenStaffModal');
  if (btnOpenStaff) {
    btnOpenStaff.addEventListener('click', openFlyerStaffModal);
  }

  const btnAutoSchedule = document.getElementById('btnFlyerAutoSchedule');
  if (btnAutoSchedule) {
    btnAutoSchedule.addEventListener('click', openFlyerAutoScheduleModal);
  }

  const btnExportImage = document.getElementById('btnFlyerExportImage');
  if (btnExportImage) {
    btnExportImage.addEventListener('click', exportFlyerScheduleImage);
  }

  const btnCopyZalo = document.getElementById('btnFlyerCopyZalo');
  if (btnCopyZalo) {
    btnCopyZalo.addEventListener('click', openFlyerZaloModal);
  }

  const btnClearWeek = document.getElementById('btnFlyerClearWeek');
  if (btnClearWeek) {
    btnClearWeek.addEventListener('click', confirmClearFlyerWeek);
  }
}

// ==========================================================================
// 4. HIỂN THỊ THỐNG KÊ (QUICK STATS)
// ==========================================================================

function renderFlyerStats() {
  const statStaff = document.getElementById('statFlyerStaff');
  const statStaffDesc = document.getElementById('statFlyerStaffDesc');
  const statShifts = document.getElementById('statFlyerShifts');
  const statGroups = document.getElementById('statFlyerGroups');
  const statTotalFlyers = document.getElementById('statFlyerTotalCount');

  // Đếm NV & PG
  const nvCount = FlyerState.staffList.filter(s => s.role === 'NV').length;
  const pgCount = FlyerState.staffList.filter(s => s.role === 'PG').length;
  if (statStaff) statStaff.textContent = `${FlyerState.staffList.length} Người`;
  if (statStaffDesc) statStaffDesc.textContent = `NV: ${nvCount} • PG: ${pgCount}`;

  // Đếm số ca tuần này
  const weekKey = getFlyerWeekKey();
  const sched = FlyerState.scheduleData[weekKey] || {};
  let totalAssignedShifts = 0;
  let morningCount = 0;
  let afternoonCount = 0;
  let eveningCount = 0;

  for (let d = 0; d < 7; d++) {
    const dayData = sched[d] || {};
    FLYER_SHIFTS.forEach(shift => {
      const shiftData = dayData[shift.id] || {};
      Object.keys(shiftData).forEach(gId => {
        const staffIds = shiftData[gId] || [];
        totalAssignedShifts += staffIds.length;
        if (shift.id === 'sang') morningCount += staffIds.length;
        if (shift.id === 'chieu') afternoonCount += staffIds.length;
        if (shift.id === 'toi') eveningCount += staffIds.length;
      });
    });
  }

  if (statShifts) statShifts.textContent = `${totalAssignedShifts} Lượt`;
  const statShiftsDesc = document.getElementById('statFlyerShiftsDesc');
  if (statShiftsDesc) statShiftsDesc.textContent = `Sáng: ${morningCount} • Chiều: ${afternoonCount} • Tối: ${eveningCount}`;

  if (statGroups) statGroups.textContent = `${FlyerState.groupList.length} Nhóm`;

  // Giả định trung bình 1 ca phát 500 tờ rơi
  const estimatedFlyers = totalAssignedShifts * 500;
  if (statTotalFlyers) statTotalFlyers.textContent = `${estimatedFlyers.toLocaleString('vi-VN')} Tờ`;
}

// ==========================================================================
// 5. HIỂN THỊ DẠNG DANH SÁCH (LIST VIEW / MẶC ĐỊNH DỄ NHÌN) & BẢNG MA TRẬN
// ==========================================================================

function renderFlyerTable() {
  if (FlyerState.currentView === 'summary') {
    renderFlyerSummaryTable();
    return;
  }
  if (FlyerState.currentView === 'matrix') {
    renderFlyerMatrixTable();
    return;
  }
  // Mặc định: Dạng Danh Sách (List View)
  renderFlyerListView();
}

/**
 * Hiển thị lịch phát tờ rơi dạng danh sách ngày - buổi - nhóm (RẤT DỄ NHÌN)
 */
function renderFlyerListView() {
  const container = document.getElementById('flyerListContainer');
  if (!container) return;

  const weekKey = getFlyerWeekKey();
  const sched = FlyerState.scheduleData[weekKey] || {};

  const now = new Date();
  const todayDayOfWeek = (now.getDay() + 6) % 7; // T2=0 ... CN=6

  const shiftsToRender = FlyerState.filterShift === 'all'
    ? FLYER_SHIFTS
    : FLYER_SHIFTS.filter(s => s.id === FlyerState.filterShift);

  const groupsToRender = FlyerState.filterGroup === 'all'
    ? FlyerState.groupList
    : FlyerState.groupList.filter(g => g.id === FlyerState.filterGroup);

  let html = '';

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const day = FLYER_DAYS[dayIdx];
    const isToday = (dayIdx === todayDayOfWeek);

    // Tính tổng số lượt ca trong ngày
    let dayTotalShifts = 0;
    shiftsToRender.forEach(shift => {
      const shiftData = (sched[dayIdx] && sched[dayIdx][shift.id]) || {};
      groupsToRender.forEach(group => {
        const staffIds = shiftData[group.id] || [];
        dayTotalShifts += staffIds.length;
      });
    });

    html += `
      <div class="flyer-list-day-card ${isToday ? 'is-today' : ''}">
        <div class="flyer-list-day-header ${isToday ? 'today-header' : ''}">
          <div class="flyer-list-day-title">
            <div class="flyer-day-badge-icon">
              <i class="fa-solid fa-calendar-day"></i>
            </div>
            <div class="flyer-day-title-text">
              <span>${day.name.toUpperCase()}</span>
              <span style="font-size: 0.85rem; color: #64748b; font-weight: 700;">(${day.short})</span>
              ${isToday ? '<span class="flyer-badge-today">Hôm Nay</span>' : ''}
            </div>
          </div>
          <div class="flyer-list-day-meta">
            <span class="badge ${dayTotalShifts > 0 ? 'bg-blue-subtle text-blue' : ''}" style="padding: 4px 10px; border-radius: 8px; font-weight: 700;">
              <i class="fa-solid fa-users"></i> ${dayTotalShifts} ca phát • ${groupsToRender.length} nhóm
            </span>
          </div>
        </div>

        <div class="flyer-list-day-body">
    `;

    // Render từng buổi trong ngày
    shiftsToRender.forEach(shift => {
      const shiftData = (sched[dayIdx] && sched[dayIdx][shift.id]) || {};

      html += `
        <div class="flyer-list-shift-row">
          <div class="flyer-list-shift-label">
            <div class="flyer-list-shift-title" style="color: ${shift.color}">
              <i class="fa-solid ${shift.icon}"></i> ${shift.name}
            </div>
            <div class="flyer-list-shift-time">${shift.time}</div>
          </div>

          <div class="flyer-list-groups-grid">
      `;

      groupsToRender.forEach((group) => {
        const staffIds = shiftData[group.id] || [];

        html += `
          <div class="flyer-list-group-card">
            <div class="flyer-list-group-header">
              <div>
                <span class="flyer-list-group-title" style="color: ${group.color};">
                  <i class="fa-solid fa-users-viewfinder"></i> ${group.name}
                </span>
                <span class="flyer-list-group-location">(${group.location})</span>
              </div>
              <button type="button" class="flyer-btn-add-mini" title="Thêm người vào ${group.name} - ${shift.name}" onclick="openFlyerCellPicker(${dayIdx}, '${shift.id}', '${group.id}')">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>

            <div class="flyer-list-staff-chips">
        `;

        if (staffIds.length === 0) {
          html += `<div class="flyer-list-empty-msg"><i class="fa-regular fa-circle-dot"></i> Chưa có người phát</div>`;
        } else {
          staffIds.forEach(staffId => {
            const staff = FlyerState.staffList.find(s => s.id === staffId);
            if (!staff) return;

            const isPG = staff.role === 'PG';
            const pillClass = isPG ? 'pill-pg' : 'pill-nv';
            const roleBadge = isPG ? '<span class="flyer-badge-pg">PG</span>' : '<span class="flyer-badge-nv">NV</span>';

            html += `
              <div class="flyer-assigned-pill ${pillClass}">
                <div class="flyer-pill-left">
                  ${roleBadge}
                  <strong title="${staff.name}">${staff.name}</strong>
                  ${staff.phone ? `<span style="font-size: 0.72rem; opacity: 0.85;">(${staff.phone})</span>` : ''}
                </div>
                <button type="button" class="flyer-pill-remove" title="Xóa ${staff.name} khỏi ca này" onclick="removeStaffFromFlyerSlot(${dayIdx}, '${shift.id}', '${group.id}', '${staff.id}', event)">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            `;
          });
        }

        html += `
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

/**
 * Hiển thị lịch dạng bảng lưới ma trận tuần
 */
function renderFlyerMatrixTable() {
  const tbody = document.getElementById('flyerMatrixTableBody');
  if (!tbody) return;

  const weekKey = getFlyerWeekKey();
  const sched = FlyerState.scheduleData[weekKey] || {};

  // Xác định ngày hôm nay trong tuần để highlight
  const now = new Date();
  const todayDayOfWeek = (now.getDay() + 6) % 7; // Chuyển CN=0 thành T2=0 ... CN=6

  let html = '';

  // Lọc các ca
  const shiftsToRender = FlyerState.filterShift === 'all'
    ? FLYER_SHIFTS
    : FLYER_SHIFTS.filter(s => s.id === FlyerState.filterShift);

  shiftsToRender.forEach(shift => {
    html += `<tr>`;

    // Cột tiêu đề Buổi
    html += `
      <td class="shift-header-cell">
        <div class="flyer-shift-meta">
          <span class="flyer-shift-name" style="color: ${shift.color}">
            <i class="fa-solid ${shift.icon}"></i> ${shift.name}
          </span>
          <span class="flyer-shift-time">${shift.time}</span>
        </div>
      </td>
    `;

    // 7 Cột Ngày (T2 -> CN)
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const isToday = (dayIdx === todayDayOfWeek);
      html += `<td class="${isToday ? 'today-cell' : ''}">`;
      html += `<div class="flyer-cell-content">`;

      // Lọc các nhóm cần hiển thị
      const groupsToRender = FlyerState.filterGroup === 'all'
        ? FlyerState.groupList
        : FlyerState.groupList.filter(g => g.id === FlyerState.filterGroup);

      groupsToRender.forEach((group, gIdx) => {
        const assignedIds = (sched[dayIdx] && sched[dayIdx][shift.id] && sched[dayIdx][shift.id][group.id]) || [];

        html += `
          <div class="flyer-group-slot">
            <div class="flyer-group-header">
              <span class="flyer-group-tag group-${(gIdx % 4) + 1}" style="color: ${group.color};">
                <i class="fa-solid fa-users-viewfinder"></i> ${group.name}
              </span>
              <button type="button" class="flyer-btn-add-mini" title="Thêm nhân viên/PG vào ${group.name} - ${shift.name}" onclick="openFlyerCellPicker(${dayIdx}, '${shift.id}', '${group.id}')">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
            <div class="flyer-assigned-list">
        `;

        if (assignedIds.length === 0) {
          html += `<div class="flyer-empty-slot"><i class="fa-regular fa-circle-dot"></i> Trống ca</div>`;
        } else {
          assignedIds.forEach(staffId => {
            const staff = FlyerState.staffList.find(s => s.id === staffId);
            if (!staff) return;

            const isPG = staff.role === 'PG';
            const pillClass = isPG ? 'pill-pg' : 'pill-nv';
            const roleBadge = isPG ? '<span class="flyer-badge-pg">PG</span>' : '<span class="flyer-badge-nv">NV</span>';

            html += `
              <div class="flyer-assigned-pill ${pillClass}">
                <div class="flyer-pill-left">
                  ${roleBadge}
                  <span title="${staff.name} (${staff.group || ''})">${staff.name}</span>
                </div>
                <button type="button" class="flyer-pill-remove" title="Xóa ${staff.name} khỏi ca này" onclick="removeStaffFromFlyerSlot(${dayIdx}, '${shift.id}', '${group.id}', '${staff.id}', event)">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            `;
          });
        }

        html += `
            </div>
          </div>
        `;
      });

      html += `</div></td>`;
    }

    html += `</tr>`;
  });

  tbody.innerHTML = html;
}

// ==========================================================================
// 6. BẢNG TỔNG HỢP CÔNG & SẢN LƯỢNG (SUMMARY VIEW)
// ==========================================================================

function renderFlyerSummaryTable() {
  const container = document.getElementById('flyerSummaryTableContainer');
  if (!container) return;

  const weekKey = getFlyerWeekKey();
  const sched = FlyerState.scheduleData[weekKey] || {};

  // Thống kê từng người
  const statsMap = {};
  FlyerState.staffList.forEach(s => {
    statsMap[s.id] = {
      staff: s,
      sang: 0,
      chieu: 0,
      toi: 0,
      total: 0
    };
  });

  for (let d = 0; d < 7; d++) {
    const dayData = sched[d] || {};
    FLYER_SHIFTS.forEach(shift => {
      const shiftData = dayData[shift.id] || {};
      Object.keys(shiftData).forEach(gId => {
        const ids = shiftData[gId] || [];
        ids.forEach(staffId => {
          if (statsMap[staffId]) {
            statsMap[staffId][shift.id]++;
            statsMap[staffId].total++;
          }
        });
      });
    });
  }

  const staffArray = Object.values(statsMap);
  // Sắp xếp: Ai nhiều ca nhất lên đầu
  staffArray.sort((a, b) => b.total - a.total);

  let html = `
    <table class="flyer-summary-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Nhân Viên / PG</th>
          <th>Vai Trò</th>
          <th>Nhóm Phụ Trách</th>
          <th>🌅 Ca Sáng</th>
          <th>☀️ Ca Chiều</th>
          <th>🌙 Ca Tối</th>
          <th>⭐ Tổng Ca</th>
          <th>📦 Tờ Rơi Dự Kiến</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (staffArray.length === 0) {
    html += `<tr><td colspan="9" style="text-align: center; color: #94a3b8; padding: 20px;">Chưa có dữ liệu nhân sự.</td></tr>`;
  } else {
    staffArray.forEach((item, idx) => {
      const isPG = item.staff.role === 'PG';
      const roleBadge = isPG ? `<span class="flyer-badge-pg">PG</span>` : `<span class="flyer-badge-nv">Nhân viên</span>`;
      const flyers = item.total * 500;

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${item.staff.name}</strong></td>
          <td>${roleBadge}</td>
          <td><span style="color: #0369a1; font-weight: 700;">${item.staff.group || 'Chưa gán'}</span></td>
          <td>${item.sang > 0 ? `<span style="font-weight: 700; color: #0284c7;">${item.sang}</span>` : '0'}</td>
          <td>${item.chieu > 0 ? `<span style="font-weight: 700; color: #d97706;">${item.chieu}</span>` : '0'}</td>
          <td>${item.toi > 0 ? `<span style="font-weight: 700; color: #6366f1;">${item.toi}</span>` : '0'}</td>
          <td><strong style="color: #059669; font-size: 1.05rem;">${item.total} ca</strong></td>
          <td><strong>${flyers.toLocaleString('vi-VN')} tờ</strong></td>
        </tr>
      `;
    });
  }

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// ==========================================================================
// 7. THAO TÁC TRỰC TIẾP TRÊN Ô LỊCH (CELL PICKER & REMOVE)
// ==========================================================================

function openFlyerCellPicker(dayIdx, shiftId, groupId) {
  FlyerState.activeCellPicker = { dayIdx, shiftId, groupId };

  const modal = document.getElementById('modalFlyerCellPicker');
  const title = document.getElementById('cellPickerTitle');
  const listContainer = document.getElementById('cellPickerStaffList');
  if (!modal || !listContainer) return;

  const dayInfo = FLYER_DAYS[dayIdx];
  const shiftInfo = FLYER_SHIFTS.find(s => s.id === shiftId);
  const groupInfo = FlyerState.groupList.find(g => g.id === groupId);

  if (title) {
    title.innerHTML = `Gán Người Cho <strong>${groupInfo ? groupInfo.name : ''}</strong> • ${dayInfo ? dayInfo.name : ''} (${shiftInfo ? shiftInfo.name : ''})`;
  }

  const weekKey = getFlyerWeekKey();
  const sched = FlyerState.scheduleData[weekKey] || {};
  const currentAssigned = (sched[dayIdx] && sched[dayIdx][shiftId] && sched[dayIdx][shiftId][groupId]) || [];

  let html = '';
  FlyerState.staffList.forEach(staff => {
    const isChecked = currentAssigned.includes(staff.id);
    const isPG = staff.role === 'PG';
    const roleBadge = isPG ? `<span class="flyer-badge-pg">PG</span>` : `<span class="flyer-badge-nv">NV</span>`;

    html += `
      <label class="flyer-staff-option">
        <input type="checkbox" value="${staff.id}" ${isChecked ? 'checked' : ''} onchange="toggleStaffInFlyerSlot(${dayIdx}, '${shiftId}', '${groupId}', '${staff.id}', this.checked)">
        ${roleBadge}
        <span style="font-weight: 700; flex: 1;">${staff.name}</span>
        <span style="font-size: 0.74rem; color: #64748b;">${staff.group || ''}</span>
      </label>
    `;
  });

  listContainer.innerHTML = html;
  modal.classList.remove('hidden');
}

function closeFlyerCellPicker() {
  const modal = document.getElementById('modalFlyerCellPicker');
  if (modal) modal.classList.add('hidden');
  FlyerState.activeCellPicker = null;
}

function toggleStaffInFlyerSlot(dayIdx, shiftId, groupId, staffId, isAdd) {
  const weekKey = getFlyerWeekKey();
  if (!FlyerState.scheduleData[weekKey]) FlyerState.scheduleData[weekKey] = {};
  const sched = FlyerState.scheduleData[weekKey];
  if (!sched[dayIdx]) sched[dayIdx] = {};
  if (!sched[dayIdx][shiftId]) sched[dayIdx][shiftId] = {};
  if (!sched[dayIdx][shiftId][groupId]) sched[dayIdx][shiftId][groupId] = [];

  const list = sched[dayIdx][shiftId][groupId];
  if (isAdd) {
    if (!list.includes(staffId)) list.push(staffId);
  } else {
    const idx = list.indexOf(staffId);
    if (idx !== -1) list.splice(idx, 1);
  }

  saveFlyerSchedule();
  renderFlyerStats();
  renderFlyerTable();
}

function removeStaffFromFlyerSlot(dayIdx, shiftId, groupId, staffId, event) {
  if (event) event.stopPropagation();

  const weekKey = getFlyerWeekKey();
  const sched = FlyerState.scheduleData[weekKey];
  if (!sched || !sched[dayIdx] || !sched[dayIdx][shiftId] || !sched[dayIdx][shiftId][groupId]) return;

  const list = sched[dayIdx][shiftId][groupId];
  const idx = list.indexOf(staffId);
  if (idx !== -1) {
    list.splice(idx, 1);
    saveFlyerSchedule();
    renderFlyerStats();
    renderFlyerTable();
    if (typeof showToast === 'function') {
      showToast('Đã xóa nhân sự khỏi ca trực', 'info');
    }
  }
}

function setupFlyerCellPicker() {
  const btnClose = document.getElementById('btnCloseCellPicker');
  const btnDone = document.getElementById('btnDoneCellPicker');
  if (btnClose) btnClose.addEventListener('click', closeFlyerCellPicker);
  if (btnDone) btnDone.addEventListener('click', closeFlyerCellPicker);
}

// ==========================================================================
// 8. CÔNG CỤ PHÂN CÔNG NHANH HÀNG LOẠT (QUICK BATCH ASSIGN)
// ==========================================================================

function setupFlyerQuickAssign() {
  // Cập nhật danh sách chọn nhóm trong form phân ca nhanh
  updateFlyerGroupDropdowns();

  // Nút chọn ngày nhanh
  const dayChips = document.querySelectorAll('.flyer-day-chip');
  dayChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
    });
  });

  const btnSelectAllDays = document.getElementById('btnFlyerSelectAllDays');
  const btnSelectWeekdays = document.getElementById('btnFlyerSelectWeekdays');
  const btnSelectWeekend = document.getElementById('btnFlyerSelectWeekend');

  if (btnSelectAllDays) {
    btnSelectAllDays.addEventListener('click', () => {
      dayChips.forEach(c => c.classList.add('selected'));
    });
  }
  if (btnSelectWeekdays) {
    btnSelectWeekdays.addEventListener('click', () => {
      dayChips.forEach((c, idx) => {
        c.classList.toggle('selected', idx < 5);
      });
    });
  }
  if (btnSelectWeekend) {
    btnSelectWeekend.addEventListener('click', () => {
      dayChips.forEach((c, idx) => {
        c.classList.toggle('selected', idx >= 5);
      });
    });
  }

  // Render danh sách chọn nhân viên đa năng trong Form
  renderQuickAssignStaffCheckboxes();

  // Nút Áp Dụng Lịch Nhanh
  const btnApply = document.getElementById('btnApplyQuickFlyerAssign');
  if (btnApply) {
    btnApply.addEventListener('click', handleApplyQuickAssign);
  }
}

function updateFlyerGroupDropdowns() {
  const selects = [
    document.getElementById('quickAssignGroupSelect'),
    document.getElementById('staffGroupSelect')
  ];

  selects.forEach(select => {
    if (!select) return;
    select.innerHTML = FlyerState.groupList.map(g => `<option value="${g.id}">${g.name} (${g.location})</option>`).join('');
  });
}

function renderQuickAssignStaffCheckboxes() {
  const container = document.getElementById('quickAssignStaffList');
  if (!container) return;

  let html = '';
  FlyerState.staffList.forEach(staff => {
    const isPG = staff.role === 'PG';
    const roleBadge = isPG ? `<span class="flyer-badge-pg">PG</span>` : `<span class="flyer-badge-nv">NV</span>`;

    html += `
      <label class="flyer-staff-option">
        <input type="checkbox" name="quickStaff" value="${staff.id}">
        ${roleBadge}
        <span style="font-weight: 700; flex: 1;">${staff.name}</span>
        <span style="font-size: 0.74rem; color: #64748b;">${staff.group || ''}</span>
      </label>
    `;
  });

  container.innerHTML = html;
}

function handleApplyQuickAssign() {
  const groupSelect = document.getElementById('quickAssignGroupSelect');
  const shiftSelect = document.getElementById('quickAssignShiftSelect');
  const groupId = groupSelect ? groupSelect.value : 'g1';
  const shiftVal = shiftSelect ? shiftSelect.value : 'all';

  // Lấy các ngày đã chọn
  const selectedDays = [];
  document.querySelectorAll('.flyer-day-chip.selected').forEach(c => {
    selectedDays.push(parseInt(c.dataset.day, 10));
  });

  if (selectedDays.length === 0) {
    if (typeof showToast === 'function') showToast('Vui lòng chọn ít nhất 1 ngày!', 'warning');
    return;
  }

  // Lấy danh sách nhân viên đã chọn
  const selectedStaffIds = [];
  document.querySelectorAll('input[name="quickStaff"]:checked').forEach(cb => {
    selectedStaffIds.push(cb.value);
  });

  if (selectedStaffIds.length === 0) {
    if (typeof showToast === 'function') showToast('Vui lòng chọn ít nhất 1 nhân viên / PG!', 'warning');
    return;
  }

  // Các buổi áp dụng
  const targetShifts = shiftVal === 'all'
    ? FLYER_SHIFTS.map(s => s.id)
    : [shiftVal];

  const weekKey = getFlyerWeekKey();
  if (!FlyerState.scheduleData[weekKey]) FlyerState.scheduleData[weekKey] = {};
  const sched = FlyerState.scheduleData[weekKey];

  let appliedCount = 0;
  selectedDays.forEach(dayIdx => {
    if (!sched[dayIdx]) sched[dayIdx] = {};
    targetShifts.forEach(shiftId => {
      if (!sched[dayIdx][shiftId]) sched[dayIdx][shiftId] = {};
      if (!sched[dayIdx][shiftId][groupId]) sched[dayIdx][shiftId][groupId] = [];

      const slot = sched[dayIdx][shiftId][groupId];
      selectedStaffIds.forEach(staffId => {
        if (!slot.includes(staffId)) {
          slot.push(staffId);
          appliedCount++;
        }
      });
    });
  });

  saveFlyerSchedule();
  renderFlyerStats();
  renderFlyerTable();

  if (typeof showToast === 'function') {
    showToast(`✅ Đã phân công thành công ${appliedCount} lượt ca phát tờ rơi!`, 'success');
  }
}

// ==========================================================================
// 9. QUẢN LÝ NHÂN VIÊN & PG (THÊM / XOÁ / SỬA)
// ==========================================================================

function setupFlyerStaffModal() {
  const modal = document.getElementById('modalFlyerStaffManager');
  const btnClose = document.getElementById('btnCloseFlyerStaffModal');
  const btnSaveStaff = document.getElementById('btnSaveFlyerStaff');
  const btnSyncFromMain = document.getElementById('btnSyncStaffFromMain');
  const searchInput = document.getElementById('flyerStaffSearch');
  const filterRole = document.getElementById('flyerStaffRoleFilter');

  if (btnClose) {
    btnClose.addEventListener('click', closeFlyerStaffModal);
  }

  if (btnSaveStaff) {
    btnSaveStaff.addEventListener('click', handleSaveStaffForm);
  }

  if (btnSyncFromMain) {
    btnSyncFromMain.addEventListener('click', handleSyncStaffFromMain);
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderFlyerStaffTableModal);
  }

  if (filterRole) {
    filterRole.addEventListener('change', renderFlyerStaffTableModal);
  }
}

function openFlyerStaffModal() {
  const modal = document.getElementById('modalFlyerStaffManager');
  if (!modal) return;

  resetStaffForm();
  renderFlyerStaffTableModal();
  modal.classList.remove('hidden');
}

function closeFlyerStaffModal() {
  const modal = document.getElementById('modalFlyerStaffManager');
  if (modal) modal.classList.add('hidden');
  resetStaffForm();
  // Cập nhật lại dropdown và bảng ngoài màn hình chính
  renderQuickAssignStaffCheckboxes();
  renderFlyerStats();
  renderFlyerTable();
}

function resetStaffForm() {
  FlyerState.editingStaffId = null;
  const nameInput = document.getElementById('staffNameInput');
  const roleSelect = document.getElementById('staffRoleSelect');
  const groupSelect = document.getElementById('staffGroupSelect');
  const phoneInput = document.getElementById('staffPhoneInput');
  const noteInput = document.getElementById('staffNoteInput');
  const formTitle = document.getElementById('flyerStaffFormTitle');
  const btnSave = document.getElementById('btnSaveFlyerStaff');

  if (nameInput) nameInput.value = '';
  if (roleSelect) roleSelect.value = 'NV';
  if (groupSelect) groupSelect.value = 'g1';
  if (phoneInput) phoneInput.value = '';
  if (noteInput) noteInput.value = '';
  if (formTitle) formTitle.textContent = '➕ Thêm Nhân Viên / PG Mới:';
  if (btnSave) btnSave.innerHTML = '<i class="fa-solid fa-plus"></i> Thêm Nhân Sự';
}

function renderFlyerStaffTableModal() {
  const tbody = document.getElementById('flyerStaffTableBody');
  if (!tbody) return;

  const searchInput = document.getElementById('flyerStaffSearch');
  const filterRole = document.getElementById('flyerStaffRoleFilter');
  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const roleVal = filterRole ? filterRole.value : 'all';

  let list = FlyerState.staffList.filter(s => {
    const matchQuery = !query || s.name.toLowerCase().includes(query) || (s.phone && s.phone.includes(query));
    const matchRole = (roleVal === 'all') || (s.role === roleVal);
    return matchQuery && matchRole;
  });

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;">Không tìm thấy nhân viên / PG nào phù hợp.</td></tr>`;
    return;
  }

  let html = '';
  list.forEach((staff, idx) => {
    const isPG = staff.role === 'PG';
    const avatarClass = isPG ? 'avatar-pg' : 'avatar-nv';
    const roleBadge = isPG
      ? `<span class="flyer-badge-pg"><i class="fa-solid fa-sparkles"></i> PG</span>`
      : `<span class="flyer-badge-nv"><i class="fa-solid fa-user-tie"></i> Nhân viên</span>`;
    const initial = staff.name.charAt(0).toUpperCase();

    html += `
      <tr>
        <td style="font-weight: 700; color: #64748b;">${idx + 1}</td>
        <td>
          <div style="display: flex; align-items: center;">
            <div class="flyer-staff-avatar ${avatarClass}">${initial}</div>
            <div>
              <strong style="color: #0f172a; font-size: 0.95rem;">${staff.name}</strong>
              ${staff.note ? `<div style="font-size: 0.75rem; color: #64748b;">${staff.note}</div>` : ''}
            </div>
          </div>
        </td>
        <td>${roleBadge}</td>
        <td><span style="font-weight: 700; color: #0369a1;">${staff.group || 'Chưa gán'}</span></td>
        <td>${staff.phone ? `<span style="font-family: monospace; font-size: 0.85rem;">${staff.phone}</span>` : '<span style="color: #cbd5e1;">-</span>'}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn btn-secondary btn-sm" title="Sửa thông tin" onclick="editFlyerStaff('${staff.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="btn btn-secondary btn-sm" style="color: #e11d48;" title="Xóa nhân sự" onclick="deleteFlyerStaff('${staff.id}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function handleSaveStaffForm() {
  const nameInput = document.getElementById('staffNameInput');
  const roleSelect = document.getElementById('staffRoleSelect');
  const groupSelect = document.getElementById('staffGroupSelect');
  const phoneInput = document.getElementById('staffPhoneInput');
  const noteInput = document.getElementById('staffNoteInput');

  const name = nameInput ? nameInput.value.trim().toUpperCase() : '';
  const role = roleSelect ? roleSelect.value : 'NV';
  const groupVal = groupSelect ? groupSelect.options[groupSelect.selectedIndex].text.split(' (')[0] : 'Nhóm 1';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const note = noteInput ? noteInput.value.trim() : '';

  if (!name) {
    if (typeof showToast === 'function') showToast('Vui lòng nhập họ tên nhân viên / PG!', 'warning');
    return;
  }

  // Kiểm tra trùng tên nếu thêm mới hoặc sửa
  const existing = FlyerState.staffList.find(s => s.name === name && s.id !== FlyerState.editingStaffId);
  if (existing) {
    if (typeof showToast === 'function') showToast(`Tên "${name}" đã tồn tại trong danh sách!`, 'warning');
    return;
  }

  if (FlyerState.editingStaffId) {
    // Cập nhật nhân sự
    const staff = FlyerState.staffList.find(s => s.id === FlyerState.editingStaffId);
    if (staff) {
      staff.name = name;
      staff.role = role;
      staff.group = groupVal;
      staff.phone = phone;
      staff.note = note;
    }
    if (typeof showToast === 'function') showToast(`Đã cập nhật thông tin "${name}"!`, 'success');
  } else {
    // Thêm mới
    const newStaff = {
      id: (role === 'PG' ? 'pg_' : 'nv_') + Date.now(),
      name,
      role,
      group: groupVal,
      phone,
      note
    };
    FlyerState.staffList.push(newStaff);
    if (typeof showToast === 'function') showToast(`Đã thêm thành công "${name}" (${role})!`, 'success');
  }

  saveFlyerStaff();
  resetStaffForm();
  renderFlyerStaffTableModal();
}

function editFlyerStaff(staffId) {
  const staff = FlyerState.staffList.find(s => s.id === staffId);
  if (!staff) return;

  FlyerState.editingStaffId = staffId;
  const nameInput = document.getElementById('staffNameInput');
  const roleSelect = document.getElementById('staffRoleSelect');
  const groupSelect = document.getElementById('staffGroupSelect');
  const phoneInput = document.getElementById('staffPhoneInput');
  const noteInput = document.getElementById('staffNoteInput');
  const formTitle = document.getElementById('flyerStaffFormTitle');
  const btnSave = document.getElementById('btnSaveFlyerStaff');

  if (nameInput) nameInput.value = staff.name;
  if (roleSelect) roleSelect.value = staff.role;
  if (phoneInput) phoneInput.value = staff.phone || '';
  if (noteInput) noteInput.value = staff.note || '';

  if (groupSelect) {
    for (let i = 0; i < groupSelect.options.length; i++) {
      if (groupSelect.options[i].text.includes(staff.group)) {
        groupSelect.selectedIndex = i;
        break;
      }
    }
  }

  if (formTitle) formTitle.textContent = `✏️ Chỉnh Sửa Nhân Sự: ${staff.name}`;
  if (btnSave) btnSave.innerHTML = '<i class="fa-solid fa-check"></i> Lưu Thay Đổi';

  if (nameInput) nameInput.focus();
}

function deleteFlyerStaff(staffId) {
  const staff = FlyerState.staffList.find(s => s.id === staffId);
  if (!staff) return;

  const confirmMsg = `Bạn có chắc muốn xóa "${staff.name}" (${staff.role}) khỏi hệ thống tờ rơi?\nThao tác này cũng sẽ xóa người này khỏi các ca trực đã gán.`;
  if (typeof confirm === 'function' && !confirm(confirmMsg)) return;

  // Xóa khỏi danh sách nhân sự
  FlyerState.staffList = FlyerState.staffList.filter(s => s.id !== staffId);
  saveFlyerStaff();

  // Xóa người này khỏi mọi tuần trong scheduleData
  Object.keys(FlyerState.scheduleData).forEach(wKey => {
    const weekSched = FlyerState.scheduleData[wKey];
    for (let d = 0; d < 7; d++) {
      if (weekSched[d]) {
        FLYER_SHIFTS.forEach(shift => {
          if (weekSched[d][shift.id]) {
            Object.keys(weekSched[d][shift.id]).forEach(gId => {
              const list = weekSched[d][shift.id][gId];
              const idx = list.indexOf(staffId);
              if (idx !== -1) list.splice(idx, 1);
            });
          }
        });
      }
    }
  });

  saveFlyerSchedule();
  renderFlyerStaffTableModal();
  if (typeof showToast === 'function') showToast(`Đã xóa "${staff.name}" thành công!`, 'info');
}

/**
 * Đồng bộ danh sách nhân viên từ phân ca hành chính chính
 */
function handleSyncStaffFromMain() {
  if (typeof ALL_STAFF === 'undefined' || !Array.isArray(ALL_STAFF) || ALL_STAFF.length === 0) {
    if (typeof showToast === 'function') showToast('Không tìm thấy danh sách nhân viên từ phân ca hành chính!', 'warning');
    return;
  }

  let addedCount = 0;
  ALL_STAFF.forEach(name => {
    const exists = FlyerState.staffList.some(s => s.name.toUpperCase() === name.toUpperCase());
    if (!exists) {
      const isGroup2 = (typeof STAFF_GROUP_2 !== 'undefined' && STAFF_GROUP_2.includes(name));
      FlyerState.staffList.push({
        id: 'nv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: name,
        role: 'NV',
        group: isGroup2 ? 'Nhóm 2' : 'Nhóm 1',
        phone: '',
        note: 'Đồng bộ từ Phân ca hành chính'
      });
      addedCount++;
    }
  });

  saveFlyerStaff();
  renderFlyerStaffTableModal();

  if (typeof showToast === 'function') {
    showToast(`Đã đồng bộ thêm ${addedCount} nhân viên từ hệ thống Phân Ca Hành Chính!`, 'success');
  }
}

// ==========================================================================
// 10. THUẬT TOÁN TỰ ĐỘNG CHIA LỊCH CÂN BẰNG (AUTO-SCHEDULE)
// ==========================================================================

function openFlyerAutoScheduleModal() {
  const modal = document.getElementById('modalFlyerAutoSchedule');
  if (modal) modal.classList.remove('hidden');

  const btnConfirm = document.getElementById('btnConfirmAutoFlyerSchedule');
  const btnClose = document.getElementById('btnCloseAutoFlyerSchedule');

  if (btnClose) {
    btnClose.onclick = () => modal.classList.add('hidden');
  }

  if (btnConfirm) {
    btnConfirm.onclick = () => {
      runAutoBalanceFlyerSchedule();
      modal.classList.add('hidden');
    };
  }
}

function runAutoBalanceFlyerSchedule() {
  const peoplePerShiftSelect = document.getElementById('autoFlyerPeoplePerShift');
  const targetGroupSelect = document.getElementById('autoFlyerTargetGroup');
  const targetShiftSelect = document.getElementById('autoFlyerTargetShift');

  const countPerSlot = peoplePerShiftSelect ? parseInt(peoplePerShiftSelect.value, 10) : 2;
  const targetGroup = targetGroupSelect ? targetGroupSelect.value : 'all';
  const targetShift = targetShiftSelect ? targetShiftSelect.value : 'all';

  const weekKey = getFlyerWeekKey();
  if (!FlyerState.scheduleData[weekKey]) FlyerState.scheduleData[weekKey] = {};
  const sched = FlyerState.scheduleData[weekKey];

  const pool = [...FlyerState.staffList];
  if (pool.length === 0) {
    if (typeof showToast === 'function') showToast('Chưa có nhân viên / PG nào để chia lịch!', 'warning');
    return;
  }

  const shiftsToSchedule = targetShift === 'all'
    ? FLYER_SHIFTS.map(s => s.id)
    : [targetShift];

  const groupsToSchedule = targetGroup === 'all'
    ? FlyerState.groupList.map(g => g.id)
    : [targetGroup];

  // Xoay tua đều danh sách nhân sự
  let staffCursor = 0;
  let totalAssigned = 0;

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    if (!sched[dayIdx]) sched[dayIdx] = {};
    shiftsToSchedule.forEach(shiftId => {
      if (!sched[dayIdx][shiftId]) sched[dayIdx][shiftId] = {};
      groupsToSchedule.forEach(groupId => {
        sched[dayIdx][shiftId][groupId] = [];

        // Gán đủ số người cho slot này
        for (let i = 0; i < countPerSlot; i++) {
          const pickedStaff = pool[staffCursor % pool.length];
          staffCursor++;
          sched[dayIdx][shiftId][groupId].push(pickedStaff.id);
          totalAssigned++;
        }
      });
    });
  }

  saveFlyerSchedule();
  renderFlyerStats();
  renderFlyerTable();

  if (typeof showToast === 'function') {
    showToast(`⚡ Đã tự động chia đều ${totalAssigned} ca phát tờ rơi cho cả tuần!`, 'success');
  }
}

// ==========================================================================
// 11. XÓA / ĐẶT LẠI LỊCH TUẦN
// ==========================================================================

function confirmClearFlyerWeek() {
  const weekKey = getFlyerWeekKey();
  if (typeof confirm === 'function' && !confirm(`Bạn có chắc muốn xóa toàn bộ lịch tờ rơi của "${FlyerState.currentMonth} - ${FlyerState.currentWeek}"?`)) {
    return;
  }

  FlyerState.scheduleData[weekKey] = {};
  saveFlyerSchedule();
  renderFlyerStats();
  renderFlyerTable();

  if (typeof showToast === 'function') {
    showToast('Đã làm mới và xóa toàn bộ lịch của tuần này.', 'info');
  }
}

// ==========================================================================
// 12. SAO CHÉP LỊCH ĐỊNH DẠNG ZALO (ZALO TEXT EXPORT)
// ==========================================================================

function openFlyerZaloModal() {
  const modal = document.getElementById('modalFlyerZalo');
  const textarea = document.getElementById('flyerZaloContent');
  const btnCopy = document.getElementById('btnCopyZaloText');
  const btnClose = document.getElementById('btnCloseFlyerZalo');

  if (!modal || !textarea) return;

  const text = generateZaloFlyerScheduleText();
  textarea.value = text;
  modal.classList.remove('hidden');

  if (btnClose) {
    btnClose.onclick = () => modal.classList.add('hidden');
  }

  if (btnCopy) {
    btnCopy.onclick = () => {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') {
          showToast('📋 Đã sao chép lịch! Bạn có thể dán ngay vào nhóm Zalo.', 'success');
        }
      }).catch(err => {
        textarea.select();
        document.execCommand('copy');
        if (typeof showToast === 'function') {
          showToast('📋 Đã sao chép lịch vào bộ nhớ tạm!', 'success');
        }
      });
    };
  }
}

function generateZaloFlyerScheduleText() {
  const weekKey = getFlyerWeekKey();
  const sched = FlyerState.scheduleData[weekKey] || {};

  let text = `📢 KẾ HOẠCH PHÁT TỜ RƠI • ${FlyerState.currentMonth} - ${FlyerState.currentWeek.toUpperCase()}\n`;
  text += `════════════════════════════════════\n\n`;

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const day = FLYER_DAYS[dayIdx];
    text += `📅 ${day.name.toUpperCase()} (${day.short}):\n`;

    let hasShift = false;
    FLYER_SHIFTS.forEach(shift => {
      const shiftData = (sched[dayIdx] && sched[dayIdx][shift.id]) || {};
      let shiftText = '';

      FlyerState.groupList.forEach(group => {
        const staffIds = shiftData[group.id] || [];
        if (staffIds.length > 0) {
          const names = staffIds.map(id => {
            const s = FlyerState.staffList.find(st => st.id === id);
            return s ? `${s.name} (${s.role})` : '';
          }).filter(Boolean);

          shiftText += `   • ${group.name} [${group.location}]: ${names.join(', ')}\n`;
        }
      });

      if (shiftText) {
        hasShift = true;
        text += `  ⏰ ${shift.name} (${shift.time}):\n${shiftText}`;
      }
    });

    if (!hasShift) {
      text += `  ⚪ Không có ca phát tờ rơi\n`;
    }
    text += `\n`;
  }

  text += `════════════════════════════════════\n`;
  text += `👉 Lưu ý: Mọi người có mặt trước 10 phút, kiểm tra số lượng tờ rơi và trang phục chỉnh chu. Chúc cả nhà ngày làm việc hiệu quả! ❤️`;

  return text;
}

// ==========================================================================
// 13. XUẤT ẢNH PNG LỊCH TỜ RƠI (HTML2CANVAS)
// ==========================================================================

async function exportFlyerScheduleImage() {
  if (typeof html2canvas === 'undefined') {
    if (typeof showToast === 'function') showToast('Không tìm thấy thư viện html2canvas!', 'error');
    return;
  }

  let exportElement = document.getElementById('flyerListContainer');
  if (FlyerState.currentView === 'matrix') {
    exportElement = document.getElementById('flyerTableContainer') || exportElement;
  }
  if (!exportElement) exportElement = document.getElementById('flyerTableContainer');
  if (!exportElement) return;

  if (typeof showToast === 'function') {
    showToast('📸 Đang tạo ảnh lịch tờ rơi chất lượng cao...', 'info');
  }

  try {
    const canvas = await html2canvas(exportElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const link = document.createElement('a');
    const safeMonth = FlyerState.currentMonth.replace(/\s+/g, '_');
    const safeWeek = FlyerState.currentWeek.replace(/\s+/g, '_');
    link.download = `Lich_Phat_To_Roi_${safeMonth}_${safeWeek}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    if (typeof showToast === 'function') {
      showToast('✅ Đã xuất ảnh lịch tờ rơi thành công và tải về máy!', 'success');
    }
  } catch (err) {
    console.error('Lỗi xuất ảnh:', err);
    if (typeof showToast === 'function') {
      showToast('Lỗi khi tạo ảnh: ' + err.message, 'error');
    }
  }
}

// ==========================================================================
// 14. KHỞI CHẠY TỰ ĐỘNG KHI TẢI TRANG
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Chạy sau khi app.js đã load dữ liệu ban đầu
  setTimeout(() => {
    initFlyerModule();
  }, 100);
});

// Cho phép gọi các hàm toàn cục từ HTML onclick
window.openFlyerCellPicker = openFlyerCellPicker;
window.removeStaffFromFlyerSlot = removeStaffFromFlyerSlot;
window.editFlyerStaff = editFlyerStaff;
window.deleteFlyerStaff = deleteFlyerStaff;
window.toggleStaffInFlyerSlot = toggleStaffInFlyerSlot;
window.openFlyerStaffModal = openFlyerStaffModal;
window.closeFlyerStaffModal = closeFlyerStaffModal;
window.openFlyerAutoScheduleModal = openFlyerAutoScheduleModal;
window.FlyerState = FlyerState;
