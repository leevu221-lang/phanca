/**
 * ==========================================================================
 * MODULE: QUẢN LÝ & CHIA LỊCH TỜ RƠI (flyer.js)
 * Tương thích 100% - Không thay đổi hay ảnh hưởng đến logic phân ca hành chính
 * Dữ liệu Tờ Rơi được lưu NGAY LẬP TỨC vào Firebase Firestore (doc: flyer_master)
 *
 * Chức năng:
 *  1. Bảng phân lịch tờ rơi 5 cột: STT, Nhân viên, Thời gian & ngày, Địa điểm, Ghi chú
 *  2. Thêm / Xoá / Sửa Nhân viên & PG
 *  3. Chia lịch tờ rơi theo Nhóm, theo Ngày, theo Buổi
 *  4. Đồng bộ Realtime tức thì với Firebase Firestore (hoàn toàn độc lập với schedule_master)
 *  5. Xuất ảnh PNG sắc nét (html2canvas) & Sao chép định dạng Zalo
 * ==========================================================================
 */

// Key lưu trữ localStorage độc lập
const FLYER_STORAGE_STAFF = 'PHANCA_TOROI_STAFF_V1';
const FLYER_STORAGE_GROUPS = 'PHANCA_TOROI_GROUPS_V1';
const FLYER_STORAGE_SCHEDULE = 'PHANCA_TOROI_SCHEDULE_V1';
const FLYER_STORAGE_ASSIGNMENTS = 'PHANCA_TOROI_ASSIGNMENTS_V1';
const FLYER_STORAGE_ACTIVE_TAB = 'PHANCA_CURRENT_APP_TAB';

// Cấu hình Firebase Document độc lập (Tuyệt đối không chạm vào schedule_master)
const FLYER_FIRESTORE_COLLECTION = 'phanca_system';
const FLYER_FIRESTORE_DOC = 'flyer_master';

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
  currentView: 'list', // 'list' (Bảng phân lịch 5 cột), 'matrix' hoặc 'summary'
  filterGroup: 'all', // 'all', 'g1', 'g2', 'g3'...
  filterShift: 'all', // 'all', 'sang', 'chieu', 'toi'
  tableSearchQuery: '',
  tableDayFilter: 'all',
  tableShiftFilter: 'all',
  tableRoleFilter: 'all',
  staffList: [],
  groupList: [],
  scheduleData: {}, // { [weekKey]: { [dayIdx]: { [shiftId]: { [groupId]: [ staffId, ... ] } } } }
  assignmentsList: [], // Danh sách các dòng ca trực chi tiết cho Bảng Phân Lịch 5 cột
  editingStaffId: null,
  activeCellPicker: null
};

// Biến Firestore nội bộ cho Tờ Rơi
let flyerDb = null;
let isFlyerFirebaseReady = false;
let flyerSaveDebounce = null;

// ==========================================================================
// 1. KHỞI TẠO FIREBASE FIRESTORE ĐỘC LẬP & TỰ ĐỘNG LƯU NGAY LẬP TỨC
// ==========================================================================

function initFlyerFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps || !firebase.apps.length) {
        if (window.FIREBASE_CONFIG) {
          firebase.initializeApp(window.FIREBASE_CONFIG);
        }
      }
      flyerDb = firebase.firestore();
      isFlyerFirebaseReady = true;
      console.log('✅ Firebase Cloud Firestore cho Tờ Rơi đã khởi tạo');

      // Tự động đồng bộ bản ghi Tờ Rơi từ Firestore
      syncFlyerFromFirebase();

      // Thiết lập listener realtime lắng nghe thay đổi từ các máy khác
      setupFlyerRealtimeListener();
    }
  } catch (err) {
    console.warn('Lỗi kết nối Firebase Tờ Rơi:', err);
    updateFlyerSyncStatus('error');
  }
}

function updateFlyerSyncStatus(status = 'synced') {
  const badge = document.getElementById('flyerSyncStatusBadge');
  const text = document.getElementById('flyerSyncStatusText');
  if (!badge || !text) return;

  badge.className = 'flyer-sync-pill';
  if (status === 'saving') {
    badge.classList.add('saving');
    text.textContent = 'Firebase: Đang lưu...';
  } else if (status === 'error') {
    badge.classList.add('error');
    text.textContent = 'Firebase: Chưa đồng bộ';
  } else {
    text.textContent = 'Firebase: Đã lưu tức thì';
  }
}

/**
 * LƯU TỨC THÌ DỮ LIỆU TỜ RƠI LÊN FIREBASE CLOUD FIRESTORE
 * Lưu vào doc "flyer_master", TUYỆT ĐỐI KHÔNG CHẠM VÀO schedule_master
 */
async function saveFlyerToFirebase(silent = false) {
  if (!flyerDb || !isFlyerFirebaseReady) return;

  updateFlyerSyncStatus('saving');
  if (flyerSaveDebounce) clearTimeout(flyerSaveDebounce);

  flyerSaveDebounce = setTimeout(async () => {
    try {
      const colName = window.FIRESTORE_COLLECTION || FLYER_FIRESTORE_COLLECTION;
      const payload = {
        staffList: FlyerState.staffList,
        groupList: FlyerState.groupList,
        scheduleData: FlyerState.scheduleData,
        assignmentsList: FlyerState.assignmentsList,
        lastUpdated: new Date().toISOString()
      };

      await flyerDb.collection(colName).doc(FLYER_FIRESTORE_DOC).set(payload, { merge: true });
      updateFlyerSyncStatus('synced');
      if (!silent && typeof showToast === 'function') {
        showToast('☁️ Đã lưu tức thì vào Firebase Cloud!', 'success');
      }
    } catch (e) {
      console.error('Lỗi lưu Firebase Tờ Rơi:', e);
      updateFlyerSyncStatus('error');
    }
  }, 250);
}

/**
 * Tải dữ liệu Tờ Rơi từ Firebase Firestore
 */
async function syncFlyerFromFirebase() {
  if (!flyerDb || !isFlyerFirebaseReady) return;
  try {
    const colName = window.FIRESTORE_COLLECTION || FLYER_FIRESTORE_COLLECTION;
    const docSnap = await flyerDb.collection(colName).doc(FLYER_FIRESTORE_DOC).get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (Array.isArray(data.staffList) && data.staffList.length > 0) {
        FlyerState.staffList = data.staffList;
        saveFlyerStaff(true);
      }
      if (Array.isArray(data.groupList) && data.groupList.length > 0) {
        FlyerState.groupList = data.groupList;
        saveFlyerGroups(true);
      }
      if (data.scheduleData) {
        FlyerState.scheduleData = data.scheduleData;
        saveFlyerSchedule(true);
      }
      if (Array.isArray(data.assignmentsList)) {
        FlyerState.assignmentsList = data.assignmentsList;
        saveFlyerAssignments(true);
      }

      renderFlyerStats();
      renderFlyerTable();
      updateFlyerSyncStatus('synced');
    } else {
      // Khởi tạo bản ghi ban đầu trên Firebase
      saveFlyerToFirebase(true);
    }
  } catch (err) {
    console.warn('Lỗi đọc Firebase Tờ Rơi:', err);
    updateFlyerSyncStatus('error');
  }
}

/**
 * Lắng nghe cập nhật realtime cho Tờ Rơi
 */
function setupFlyerRealtimeListener() {
  if (!flyerDb || !isFlyerFirebaseReady) return;
  try {
    const colName = window.FIRESTORE_COLLECTION || FLYER_FIRESTORE_COLLECTION;
    flyerDb.collection(colName).doc(FLYER_FIRESTORE_DOC).onSnapshot((doc) => {
      if (doc.metadata && doc.metadata.hasPendingWrites) return; // Bỏ qua cập nhật từ chính máy này
      if (doc.exists) {
        const data = doc.data();
        let changed = false;

        if (Array.isArray(data.staffList)) {
          FlyerState.staffList = data.staffList;
          saveFlyerStaff(true);
          changed = true;
        }
        if (Array.isArray(data.groupList)) {
          FlyerState.groupList = data.groupList;
          saveFlyerGroups(true);
          changed = true;
        }
        if (data.scheduleData) {
          FlyerState.scheduleData = data.scheduleData;
          saveFlyerSchedule(true);
          changed = true;
        }
        if (Array.isArray(data.assignmentsList)) {
          FlyerState.assignmentsList = data.assignmentsList;
          saveFlyerAssignments(true);
          changed = true;
        }

        if (changed) {
          renderFlyerStats();
          renderFlyerTable();
          updateFlyerSyncStatus('synced');
        }
      }
    }, err => {
      console.warn('Lỗi realtime listener Tờ Rơi:', err);
    });
  } catch (err) {
    console.warn('Lỗi setup listener realtime Tờ Rơi:', err);
  }
}

// ==========================================================================
// 2. KHỞI TẠO VÀ LƯU TRỮ DỮ LIỆU CỤC BỘ
// ==========================================================================

function initFlyerModule() {
  loadFlyerStaff();
  loadFlyerGroups();
  loadFlyerSchedule();
  loadFlyerAssignments();

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
  setupFlyerTableFilters();

  renderFlyerStats();
  renderFlyerTable();
  updateFlyerMonthLabel();

  // Khởi tạo kết nối Firebase riêng biệt
  initFlyerFirebase();
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
      if (typeof ALL_STAFF !== 'undefined' && Array.isArray(ALL_STAFF) && ALL_STAFF.length > 0) {
        FlyerState.staffList = ALL_STAFF.map((name, idx) => ({
          id: 'nv_' + (idx + 1),
          name: name,
          role: 'NV',
          group: (typeof STAFF_GROUP_2 !== 'undefined' && STAFF_GROUP_2.includes(name)) ? 'Nhóm 2' : 'Nhóm 1',
          phone: '',
          note: ''
        }));
        FlyerState.staffList.push(
          { id: 'pg_1', name: 'PG BÍCH TRÂM', role: 'PG', group: 'Nhóm 1', phone: '0901234567', note: 'Chuyên ca sáng/chiều' },
          { id: 'pg_2', name: 'PG MAI LINH', role: 'PG', group: 'Nhóm 2', phone: '0912345678', note: 'Chuyên ca chiều/tối' },
          { id: 'pg_3', name: 'PG NHƯ Ý', role: 'PG', group: 'Nhóm 3', phone: '0987654321', note: 'Chuyên cuối tuần' }
        );
      } else {
        FlyerState.staffList = [...DEFAULT_FLYER_STAFF];
      }
      saveFlyerStaff(true);
    }
  } catch (e) {
    FlyerState.staffList = [...DEFAULT_FLYER_STAFF];
  }
}

function saveFlyerStaff(skipFirebase = false) {
  try {
    localStorage.setItem(FLYER_STORAGE_STAFF, JSON.stringify(FlyerState.staffList));
    if (!skipFirebase) saveFlyerToFirebase();
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
      saveFlyerGroups(true);
    }
  } catch (e) {
    FlyerState.groupList = [...DEFAULT_FLYER_GROUPS];
  }
}

function saveFlyerGroups(skipFirebase = false) {
  try {
    localStorage.setItem(FLYER_STORAGE_GROUPS, JSON.stringify(FlyerState.groupList));
    if (!skipFirebase) saveFlyerToFirebase();
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
    }
  } catch (e) {
    FlyerState.scheduleData = {};
  }
}

function saveFlyerSchedule(skipFirebase = false) {
  try {
    localStorage.setItem(FLYER_STORAGE_SCHEDULE, JSON.stringify(FlyerState.scheduleData));
    if (!skipFirebase) saveFlyerToFirebase();
  } catch (e) {
    console.error('Lỗi lưu FlyerSchedule:', e);
  }
}

function loadFlyerAssignments() {
  try {
    const raw = localStorage.getItem(FLYER_STORAGE_ASSIGNMENTS);
    if (raw) {
      FlyerState.assignmentsList = JSON.parse(raw);
    } else {
      FlyerState.assignmentsList = [];
      initDemoAssignments();
    }
  } catch (e) {
    FlyerState.assignmentsList = [];
    initDemoAssignments();
  }
}

function saveFlyerAssignments(skipFirebase = false) {
  try {
    localStorage.setItem(FLYER_STORAGE_ASSIGNMENTS, JSON.stringify(FlyerState.assignmentsList));
    if (!skipFirebase) saveFlyerToFirebase();
  } catch (e) {
    console.error('Lỗi lưu FlyerAssignments:', e);
  }
}

/**
 * Khởi tạo dữ liệu mẫu đẹp mắt cho Bảng Phân Lịch Tờ Rơi 5 Cột
 */
function initDemoAssignments() {
  const weekKey = getFlyerWeekKey();
  FlyerState.assignmentsList = [
    {
      id: 'as_1',
      staffId: 'nv_1',
      staffName: 'NHẠN',
      role: 'NV',
      phone: '',
      dayIdx: 0,
      dayName: 'Thứ Hai',
      dayShort: 'T2',
      shiftId: 'sang',
      shiftName: 'Buổi Sáng',
      shiftTime: '07:30 - 09:30',
      groupId: 'g1',
      groupName: 'Nhóm 1',
      location: 'Nhóm 1 - Tuyến Chợ & Khu Dân Cư',
      note: '500 tờ • Phát cổng chợ',
      weekKey
    },
    {
      id: 'as_2',
      staffId: 'pg_1',
      staffName: 'PG BÍCH TRÂM',
      role: 'PG',
      phone: '0901234567',
      dayIdx: 0,
      dayName: 'Thứ Hai',
      dayShort: 'T2',
      shiftId: 'sang',
      shiftName: 'Buổi Sáng',
      shiftTime: '07:30 - 09:30',
      groupId: 'g1',
      groupName: 'Nhóm 1',
      location: 'Nhóm 1 - Tuyến Chợ & Khu Dân Cư',
      note: '500 tờ • Đối diện bách hóa',
      weekKey
    },
    {
      id: 'as_3',
      staffId: 'nv_7',
      staffName: 'THẮM',
      role: 'NV',
      phone: '',
      dayIdx: 0,
      dayName: 'Thứ Hai',
      dayShort: 'T2',
      shiftId: 'sang',
      shiftName: 'Buổi Sáng',
      shiftTime: '07:30 - 09:30',
      groupId: 'g2',
      groupName: 'Nhóm 2',
      location: 'Nhóm 2 - Tuyến Trường Học & Công Viên',
      note: '500 tờ',
      weekKey
    },
    {
      id: 'as_4',
      staffId: 'nv_2',
      staffName: 'MẠNH',
      role: 'NV',
      phone: '',
      dayIdx: 0,
      dayName: 'Thứ Hai',
      dayShort: 'T2',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '16:30 - 18:30',
      groupId: 'g1',
      groupName: 'Nhóm 1',
      location: 'Nhóm 1 - Tuyến Chợ & Khu Dân Cư',
      note: '500 tờ • Giờ tan tầm',
      weekKey
    },
    {
      id: 'as_5',
      staffId: 'nv_8',
      staffName: 'MY',
      role: 'NV',
      phone: '',
      dayIdx: 0,
      dayName: 'Thứ Hai',
      dayShort: 'T2',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '16:30 - 18:30',
      groupId: 'g2',
      groupName: 'Nhóm 2',
      location: 'Nhóm 2 - Tuyến Trường Học & Công Viên',
      note: '500 tờ • Cổng trường cấp 3',
      weekKey
    },
    {
      id: 'as_6',
      staffId: 'pg_2',
      staffName: 'PG MAI LINH',
      role: 'PG',
      phone: '0912345678',
      dayIdx: 0,
      dayName: 'Thứ Hai',
      dayShort: 'T2',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '16:30 - 18:30',
      groupId: 'g2',
      groupName: 'Nhóm 2',
      location: 'Nhóm 2 - Tuyến Trường Học & Công Viên',
      note: '500 tờ • Cổng trường cấp 2',
      weekKey
    },
    {
      id: 'as_7',
      staffId: 'nv_3',
      staffName: 'MI',
      role: 'NV',
      phone: '',
      dayIdx: 1,
      dayName: 'Thứ Ba',
      dayShort: 'T3',
      shiftId: 'sang',
      shiftName: 'Buổi Sáng',
      shiftTime: '07:30 - 09:30',
      groupId: 'g1',
      groupName: 'Nhóm 1',
      location: 'Nhóm 1 - Tuyến Chợ & Khu Dân Cư',
      note: '500 tờ',
      weekKey
    },
    {
      id: 'as_8',
      staffId: 'nv_9',
      staffName: 'PHÚC',
      role: 'NV',
      phone: '',
      dayIdx: 1,
      dayName: 'Thứ Ba',
      dayShort: 'T3',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '16:30 - 18:30',
      groupId: 'g2',
      groupName: 'Nhóm 2',
      location: 'Nhóm 2 - Tuyến Trường Học & Công Viên',
      note: '500 tờ',
      weekKey
    },
    {
      id: 'as_9',
      staffId: 'pg_3',
      staffName: 'PG NHƯ Ý',
      role: 'PG',
      phone: '0987654321',
      dayIdx: 5,
      dayName: 'Thứ Bảy',
      dayShort: 'T7',
      shiftId: 'toi',
      shiftName: 'Buổi Tối',
      shiftTime: '19:00 - 21:00',
      groupId: 'g3',
      groupName: 'Nhóm 3',
      location: 'Nhóm 3 - Tuyến Ngã Tư & Trung Tâm',
      note: '500 tờ • Phố đi bộ',
      weekKey
    }
  ];

  saveFlyerAssignments(true);
}

// ==========================================================================
// 3. CHUYỂN ĐỔI TAB & ĐỒNG BỘ GIAO DIỆN
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

  const savedTab = localStorage.getItem(FLYER_STORAGE_ACTIVE_TAB);
  const isHashToroi = (typeof window !== 'undefined' && window.location && window.location.hash === '#toroi');
  if (isHashToroi || savedTab === 'flyer') {
    switchTab('flyer');
  }

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
  const tableTitle = document.getElementById('flyerScheduleTableTitle');
  if (tableTitle) tableTitle.textContent = `BẢNG PHÂN LỊCH TỜ RƠI • ${FlyerState.currentMonth} - ${FlyerState.currentWeek.toUpperCase()}`;
}

// ==========================================================================
// 4. BỘ LỌC & ĐIỀU KHIỂN
// ==========================================================================

function setupFlyerControls() {
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

  // Bộ lọc Nhóm phía trên
  const groupFilters = document.querySelectorAll('.flyer-filter-group-btn');
  groupFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      groupFilters.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      FlyerState.filterGroup = e.target.dataset.group;
      renderFlyerTable();
    });
  });

  // Bộ lọc Buổi phía trên
  const shiftFilters = document.querySelectorAll('.flyer-filter-shift-btn');
  shiftFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      shiftFilters.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      FlyerState.filterShift = e.target.dataset.shift;
      renderFlyerTable();
    });
  });

  // Chuyển chế độ xem (Bảng Danh Sách 5 Cột / Bảng Lưới / Tổng Hợp Công)
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

  // Nút hành động chính
  const btnOpenStaff = document.getElementById('btnFlyerOpenStaffModal');
  if (btnOpenStaff) btnOpenStaff.addEventListener('click', openFlyerStaffModal);

  const btnAutoSchedule = document.getElementById('btnFlyerAutoSchedule');
  if (btnAutoSchedule) btnAutoSchedule.addEventListener('click', openFlyerAutoScheduleModal);

  const btnExportImage = document.getElementById('btnFlyerExportImage');
  if (btnExportImage) btnExportImage.addEventListener('click', exportFlyerScheduleImage);

  const btnCopyZalo = document.getElementById('btnFlyerCopyZalo');
  if (btnCopyZalo) btnCopyZalo.addEventListener('click', openFlyerZaloModal);

  const btnClearWeek = document.getElementById('btnFlyerClearWeek');
  if (btnClearWeek) btnClearWeek.addEventListener('click', confirmClearFlyerWeek);
}

function setupFlyerTableFilters() {
  const searchInput = document.getElementById('flyerTableSearchInput');
  const dayFilter = document.getElementById('flyerTableDayFilter');
  const shiftFilter = document.getElementById('flyerTableShiftFilter');
  const roleFilter = document.getElementById('flyerTableRoleFilter');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      FlyerState.tableSearchQuery = e.target.value.trim().toLowerCase();
      renderFlyerScheduleTable();
    });
  }
  if (dayFilter) {
    dayFilter.addEventListener('change', (e) => {
      FlyerState.tableDayFilter = e.target.value;
      renderFlyerScheduleTable();
    });
  }
  if (shiftFilter) {
    shiftFilter.addEventListener('change', (e) => {
      FlyerState.tableShiftFilter = e.target.value;
      renderFlyerScheduleTable();
    });
  }
  if (roleFilter) {
    roleFilter.addEventListener('change', (e) => {
      FlyerState.tableRoleFilter = e.target.value;
      renderFlyerScheduleTable();
    });
  }
}

// ==========================================================================
// 5. HIỂN THỊ THỐNG KÊ (QUICK STATS)
// ==========================================================================

function renderFlyerStats() {
  const statStaff = document.getElementById('statFlyerStaff');
  const statStaffDesc = document.getElementById('statFlyerStaffDesc');
  const statShifts = document.getElementById('statFlyerShifts');
  const statShiftsDesc = document.getElementById('statFlyerShiftsDesc');
  const statGroups = document.getElementById('statFlyerGroups');
  const statTotalFlyers = document.getElementById('statFlyerTotalCount');

  const nvCount = FlyerState.staffList.filter(s => s.role === 'NV').length;
  const pgCount = FlyerState.staffList.filter(s => s.role === 'PG').length;
  if (statStaff) statStaff.textContent = `${FlyerState.staffList.length} Người`;
  if (statStaffDesc) statStaffDesc.textContent = `NV: ${nvCount} • PG: ${pgCount}`;

  // Đếm ca trong tuần đang chọn
  const weekKey = getFlyerWeekKey();
  const weekAssignments = FlyerState.assignmentsList.filter(as => as.weekKey === weekKey || !as.weekKey);

  let morningCount = 0;
  let afternoonCount = 0;
  let eveningCount = 0;

  weekAssignments.forEach(as => {
    if (as.shiftId === 'sang') morningCount++;
    if (as.shiftId === 'chieu') afternoonCount++;
    if (as.shiftId === 'toi') eveningCount++;
  });

  if (statShifts) statShifts.textContent = `${weekAssignments.length} Lượt`;
  if (statShiftsDesc) statShiftsDesc.textContent = `Sáng: ${morningCount} • Chiều: ${afternoonCount} • Tối: ${eveningCount}`;

  if (statGroups) statGroups.textContent = `${FlyerState.groupList.length} Nhóm`;

  const estimatedFlyers = weekAssignments.length * 500;
  if (statTotalFlyers) statTotalFlyers.textContent = `${estimatedFlyers.toLocaleString('vi-VN')} Tờ`;
}

// ==========================================================================
// 6. BẢNG PHÂN LỊCH TỜ RƠI 5 CỘT (STT, NHÂN VIÊN, THỜI GIAN & NGÀY, ĐỊA ĐIỂM, GHI CHÚ)
// ==========================================================================

function renderFlyerTable() {
  // Luôn cập nhật Bảng Phân Lịch 5 cột chuẩn
  renderFlyerScheduleTable();

  if (FlyerState.currentView === 'summary') {
    renderFlyerSummaryTable();
  } else if (FlyerState.currentView === 'matrix') {
    renderFlyerMatrixTable();
  }
}

/**
 * Hiển thị chính xác Bảng Phân Lịch Tờ Rơi 5 Cột theo yêu cầu
 * Cột 1: STT
 * Cột 2: Nhân viên (Họ tên, Vai trò [NV]/[PG], SĐT)
 * Cột 3: Thời gian & Ngày (Buổi Sáng/Chiều/Tối + Giờ + Thứ)
 * Cột 4: Địa điểm (Tên nhóm & Tuyến đường phát)
 * Cột 5: Ghi chú (Mục tiêu tờ rơi, dặn dò...)
 * Cột 6: Thao tác (Sửa, Xóa)
 */
function renderFlyerScheduleTable() {
  const tbody = document.getElementById('flyerScheduleTableBody');
  if (!tbody) return;

  const weekKey = getFlyerWeekKey();
  let list = FlyerState.assignmentsList.filter(as => as.weekKey === weekKey || !as.weekKey);

  // Áp dụng bộ lọc
  const q = FlyerState.tableSearchQuery;
  const dayF = FlyerState.tableDayFilter;
  const shiftF = FlyerState.tableShiftFilter;
  const roleF = FlyerState.tableRoleFilter;

  list = list.filter(item => {
    const matchSearch = !q ||
      item.staffName.toLowerCase().includes(q) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.note && item.note.toLowerCase().includes(q));

    const matchDay = (dayF === 'all') || (String(item.dayIdx) === String(dayF));
    const matchShift = (shiftF === 'all') || (item.shiftId === shiftF);
    const matchRole = (roleF === 'all') || (item.role === roleF);

    return matchSearch && matchDay && matchShift && matchRole;
  });

  // Sắp xếp: Theo thứ tự ngày (T2 -> CN), rồi theo buổi (Sáng -> Chiều -> Tối)
  const shiftOrder = { 'sang': 1, 'chieu': 2, 'toi': 3 };
  list.sort((a, b) => {
    if (a.dayIdx !== b.dayIdx) return a.dayIdx - b.dayIdx;
    return (shiftOrder[a.shiftId] || 0) - (shiftOrder[b.shiftId] || 0);
  });

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #94a3b8; padding: 36px 20px;">
          <div style="font-size: 2rem; margin-bottom: 8px;">📂</div>
          <strong style="color: #64748b; font-size: 0.95rem;">Chưa có ca phân lịch nào phù hợp bộ lọc.</strong>
          <p style="font-size: 0.8rem; margin-top: 4px;">Hãy bấm nút <strong>[+ Thêm Ca Lập Lịch]</strong> ở trên để thêm ca trực mới.</p>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  list.forEach((item, idx) => {
    const isPG = item.role === 'PG';
    const avatarClass = isPG ? 'avatar-pg' : 'avatar-nv';
    const roleBadge = isPG
      ? `<span class="flyer-badge-pg"><i class="fa-solid fa-sparkles"></i> PG</span>`
      : `<span class="flyer-badge-nv"><i class="fa-solid fa-user-tie"></i> NV</span>`;

    const shiftInfo = FLYER_SHIFTS.find(s => s.id === item.shiftId) || { color: '#0284c7', icon: 'fa-sun' };
    const initial = item.staffName ? item.staffName.charAt(0).toUpperCase() : 'N';

    html += `
      <tr>
        <!-- 1. STT -->
        <td style="text-align: center;">
          <span class="flyer-stt-badge">${idx + 1}</span>
        </td>

        <!-- 2. Nhân Viên -->
        <td>
          <div class="flyer-staff-cell">
            <div class="flyer-staff-avatar ${avatarClass}">${initial}</div>
            <div class="flyer-staff-info-box">
              <span class="flyer-staff-name-title">
                ${roleBadge} <strong>${item.staffName}</strong>
              </span>
              ${item.phone ? `<span class="flyer-staff-subinfo"><i class="fa-solid fa-phone" style="font-size: 0.7rem;"></i> ${item.phone}</span>` : ''}
            </div>
          </div>
        </td>

        <!-- 3. Thời Gian & Ngày -->
        <td>
          <div class="flyer-datetime-cell">
            <span class="flyer-datetime-main" style="color: ${shiftInfo.color};">
              <i class="fa-solid ${shiftInfo.icon}"></i> ${item.shiftName} (${item.shiftTime})
            </span>
            <span class="flyer-datetime-sub">
              <i class="fa-regular fa-calendar"></i> <strong>${item.dayName}</strong> (${item.dayShort})
            </span>
          </div>
        </td>

        <!-- 4. Địa Điểm -->
        <td>
          <div class="flyer-location-cell">
            <span class="flyer-location-group-tag" style="color: #0369a1;">
              <i class="fa-solid fa-location-dot text-rose"></i> ${item.location || item.groupName}
            </span>
          </div>
        </td>

        <!-- 5. Ghi Chú -->
        <td>
          <div class="flyer-note-cell">
            ${item.note ? `<span class="flyer-note-tag"><i class="fa-regular fa-note-sticky text-amber"></i> ${item.note}</span>` : '<span style="color: #cbd5e1;">-</span>'}
          </div>
        </td>

        <!-- 6. Thao Tác -->
        <td style="text-align: center;">
          <div style="display: flex; gap: 6px; justify-content: center;">
            <button type="button" class="btn btn-secondary btn-sm" title="Chỉnh sửa ca này" onclick="openFlyerAssignmentModal('${item.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="btn btn-secondary btn-sm" style="color: #e11d48;" title="Xóa ca này" onclick="deleteFlyerAssignment('${item.id}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ==========================================================================
// 7. THAO TÁC THÊM / SỬA / XÓA CA TRỰC (TỰ ĐỘNG LƯU FIREBASE NGAY LẬP TỨC)
// ==========================================================================

function openFlyerAssignmentModal(editId = null) {
  const modal = document.getElementById('modalFlyerAssignmentForm');
  const title = document.getElementById('assignmentModalTitle');
  const idInput = document.getElementById('assignmentEditId');
  const staffSelect = document.getElementById('assignModalStaffSelect');
  const daySelect = document.getElementById('assignModalDaySelect');
  const shiftSelect = document.getElementById('assignModalShiftSelect');
  const locationInput = document.getElementById('assignModalLocationInput');
  const noteInput = document.getElementById('assignModalNoteInput');

  if (!modal) return;

  // Cập nhật danh sách nhân viên vào dropdown
  if (staffSelect) {
    staffSelect.innerHTML = FlyerState.staffList.map(s => {
      const roleText = s.role === 'PG' ? 'PG' : 'Nhân viên';
      return `<option value="${s.id}">${s.name} (${roleText} • ${s.group || ''})</option>`;
    }).join('');
  }

  if (editId) {
    const item = FlyerState.assignmentsList.find(as => as.id === editId);
    if (item) {
      if (title) title.textContent = `✏️ Chỉnh Sửa Ca Phân Lịch: ${item.staffName}`;
      if (idInput) idInput.value = item.id;
      if (staffSelect) staffSelect.value = item.staffId;
      if (daySelect) daySelect.value = String(item.dayIdx);
      if (shiftSelect) shiftSelect.value = item.shiftId;
      if (locationInput) locationInput.value = item.location || '';
      if (noteInput) noteInput.value = item.note || '';
    }
  } else {
    if (title) title.textContent = '➕ Thêm Ca Phân Lịch Tờ Rơi Mới';
    if (idInput) idInput.value = '';
    if (daySelect) daySelect.value = '0';
    if (shiftSelect) shiftSelect.value = 'sang';
    if (locationInput) locationInput.value = 'Nhóm 1 - Tuyến Chợ & Khu Dân Cư';
    if (noteInput) noteInput.value = '500 tờ';
  }

  modal.classList.remove('hidden');
}

function closeFlyerAssignmentModal() {
  const modal = document.getElementById('modalFlyerAssignmentForm');
  if (modal) modal.classList.add('hidden');
}

function saveFlyerAssignmentFromModal() {
  const idInput = document.getElementById('assignmentEditId');
  const staffSelect = document.getElementById('assignModalStaffSelect');
  const daySelect = document.getElementById('assignModalDaySelect');
  const shiftSelect = document.getElementById('assignModalShiftSelect');
  const locationInput = document.getElementById('assignModalLocationInput');
  const noteInput = document.getElementById('assignModalNoteInput');

  const staffId = staffSelect ? staffSelect.value : '';
  const dayIdx = daySelect ? parseInt(daySelect.value, 10) : 0;
  const shiftId = shiftSelect ? shiftSelect.value : 'sang';
  const location = locationInput ? locationInput.value.trim() : '';
  const note = noteInput ? noteInput.value.trim() : '';
  const editId = idInput ? idInput.value : '';

  const staff = FlyerState.staffList.find(s => s.id === staffId);
  if (!staff) {
    if (typeof showToast === 'function') showToast('Vui lòng chọn nhân viên / PG!', 'warning');
    return;
  }

  const dayInfo = FLYER_DAYS[dayIdx] || { name: 'Thứ Hai', short: 'T2' };
  const shiftInfo = FLYER_SHIFTS.find(s => s.id === shiftId) || { name: 'Buổi Sáng', time: '07:30 - 09:30' };
  const weekKey = getFlyerWeekKey();

  if (editId) {
    // Cập nhật ca đã có
    const item = FlyerState.assignmentsList.find(as => as.id === editId);
    if (item) {
      item.staffId = staff.id;
      item.staffName = staff.name;
      item.role = staff.role;
      item.phone = staff.phone || '';
      item.dayIdx = dayIdx;
      item.dayName = dayInfo.name;
      item.dayShort = dayInfo.short;
      item.shiftId = shiftId;
      item.shiftName = shiftInfo.name;
      item.shiftTime = shiftInfo.time;
      item.location = location || (staff.group + ' - ' + (location || 'Tuyến phát'));
      item.note = note;
      item.weekKey = weekKey;
    }
    if (typeof showToast === 'function') showToast(`✅ Đã cập nhật ca cho ${staff.name}!`, 'success');
  } else {
    // Thêm ca mới
    const newAssignment = {
      id: 'as_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role,
      phone: staff.phone || '',
      dayIdx,
      dayName: dayInfo.name,
      dayShort: dayInfo.short,
      shiftId,
      shiftName: shiftInfo.name,
      shiftTime: shiftInfo.time,
      groupId: 'g1',
      groupName: staff.group || 'Nhóm 1',
      location: location || (staff.group + ' - Tuyến phát'),
      note,
      weekKey
    };
    FlyerState.assignmentsList.push(newAssignment);
    if (typeof showToast === 'function') showToast(`✅ Đã thêm ca phát tờ rơi cho ${staff.name}!`, 'success');
  }

  // Lưu cục bộ và LƯU NGAY LẬP TỨC LÊN FIREBASE
  saveFlyerAssignments(false);

  closeFlyerAssignmentModal();
  renderFlyerStats();
  renderFlyerTable();
}

function deleteFlyerAssignment(assignmentId) {
  const item = FlyerState.assignmentsList.find(as => as.id === assignmentId);
  if (!item) return;

  const confirmMsg = `Bạn có chắc muốn xóa ca trực của "${item.staffName}" vào ${item.dayName} (${item.shiftName})?`;
  if (typeof confirm === 'function' && !confirm(confirmMsg)) return;

  FlyerState.assignmentsList = FlyerState.assignmentsList.filter(as => as.id !== assignmentId);

  // Lưu cục bộ và LƯU NGAY LẬP TỨC LÊN FIREBASE
  saveFlyerAssignments(false);

  renderFlyerStats();
  renderFlyerTable();

  if (typeof showToast === 'function') {
    showToast(`Đã xóa ca phát tờ rơi của ${item.staffName}!`, 'info');
  }
}

// ==========================================================================
// 8. BẢNG MA TRẬN & BẢNG TỔNG HỢP CÔNG
// ==========================================================================

function renderFlyerMatrixTable() {
  const tbody = document.getElementById('flyerMatrixTableBody');
  if (!tbody) return;

  const weekKey = getFlyerWeekKey();
  const weekAssignments = FlyerState.assignmentsList.filter(as => as.weekKey === weekKey || !as.weekKey);

  const now = new Date();
  const todayDayOfWeek = (now.getDay() + 6) % 7;

  let html = '';
  const shiftsToRender = FlyerState.filterShift === 'all'
    ? FLYER_SHIFTS
    : FLYER_SHIFTS.filter(s => s.id === FlyerState.filterShift);

  shiftsToRender.forEach(shift => {
    html += `<tr>`;
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

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const isToday = (dayIdx === todayDayOfWeek);
      html += `<td class="${isToday ? 'today-cell' : ''}">`;
      html += `<div class="flyer-cell-content">`;

      const groupsToRender = FlyerState.filterGroup === 'all'
        ? FlyerState.groupList
        : FlyerState.groupList.filter(g => g.id === FlyerState.filterGroup);

      groupsToRender.forEach((group, gIdx) => {
        const slotItems = weekAssignments.filter(as => as.dayIdx === dayIdx && as.shiftId === shift.id && (as.groupId === group.id || as.location.includes(group.name)));

        html += `
          <div class="flyer-group-slot">
            <div class="flyer-group-header">
              <span class="flyer-group-tag group-${(gIdx % 4) + 1}" style="color: ${group.color};">
                <i class="fa-solid fa-users-viewfinder"></i> ${group.name}
              </span>
              <button type="button" class="flyer-btn-add-mini" title="Thêm nhanh" onclick="openFlyerAssignmentModal()">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
            <div class="flyer-assigned-list">
        `;

        if (slotItems.length === 0) {
          html += `<div class="flyer-empty-slot"><i class="fa-regular fa-circle-dot"></i> Trống ca</div>`;
        } else {
          slotItems.forEach(item => {
            const isPG = item.role === 'PG';
            const pillClass = isPG ? 'pill-pg' : 'pill-nv';
            const roleBadge = isPG ? '<span class="flyer-badge-pg">PG</span>' : '<span class="flyer-badge-nv">NV</span>';

            html += `
              <div class="flyer-assigned-pill ${pillClass}">
                <div class="flyer-pill-left">
                  ${roleBadge}
                  <span title="${item.staffName}">${item.staffName}</span>
                </div>
                <button type="button" class="flyer-pill-remove" title="Xóa ca này" onclick="deleteFlyerAssignment('${item.id}')">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            `;
          });
        }

        html += `</div></div>`;
      });

      html += `</div></td>`;
    }

    html += `</tr>`;
  });

  tbody.innerHTML = html;
}

function renderFlyerSummaryTable() {
  const container = document.getElementById('flyerSummaryTableContainer');
  if (!container) return;

  const weekKey = getFlyerWeekKey();
  const weekAssignments = FlyerState.assignmentsList.filter(as => as.weekKey === weekKey || !as.weekKey);

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

  weekAssignments.forEach(as => {
    if (statsMap[as.staffId]) {
      if (as.shiftId === 'sang') statsMap[as.staffId].sang++;
      if (as.shiftId === 'chieu') statsMap[as.staffId].chieu++;
      if (as.shiftId === 'toi') statsMap[as.staffId].toi++;
      statsMap[as.staffId].total++;
    }
  });

  const staffArray = Object.values(statsMap);
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
// 9. CÔNG CỤ PHÂN CÔNG NHANH & TỰ ĐỘNG CHIA LỊCH
// ==========================================================================

function setupFlyerQuickAssign() {
  updateFlyerGroupDropdowns();

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
      dayChips.forEach((c, idx) => c.classList.toggle('selected', idx < 5));
    });
  }
  if (btnSelectWeekend) {
    btnSelectWeekend.addEventListener('click', () => {
      dayChips.forEach((c, idx) => c.classList.toggle('selected', idx >= 5));
    });
  }

  renderQuickAssignStaffCheckboxes();

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

  const groupInfo = FlyerState.groupList.find(g => g.id === groupId) || { name: 'Nhóm 1', location: 'Tuyến Chợ' };

  const selectedDays = [];
  document.querySelectorAll('.flyer-day-chip.selected').forEach(c => {
    selectedDays.push(parseInt(c.dataset.day, 10));
  });

  if (selectedDays.length === 0) {
    if (typeof showToast === 'function') showToast('Vui lòng chọn ít nhất 1 ngày!', 'warning');
    return;
  }

  const selectedStaffIds = [];
  document.querySelectorAll('input[name="quickStaff"]:checked').forEach(cb => {
    selectedStaffIds.push(cb.value);
  });

  if (selectedStaffIds.length === 0) {
    if (typeof showToast === 'function') showToast('Vui lòng chọn ít nhất 1 nhân viên / PG!', 'warning');
    return;
  }

  const targetShifts = shiftVal === 'all'
    ? FLYER_SHIFTS
    : FLYER_SHIFTS.filter(s => s.id === shiftVal);

  const weekKey = getFlyerWeekKey();
  let addedCount = 0;

  selectedDays.forEach(dayIdx => {
    const dayInfo = FLYER_DAYS[dayIdx];
    targetShifts.forEach(shift => {
      selectedStaffIds.forEach(staffId => {
        const staff = FlyerState.staffList.find(s => s.id === staffId);
        if (!staff) return;

        // Tránh trùng ca cùng người cùng buổi cùng ngày
        const exists = FlyerState.assignmentsList.some(as =>
          as.weekKey === weekKey && as.dayIdx === dayIdx && as.shiftId === shift.id && as.staffId === staff.id
        );

        if (!exists) {
          FlyerState.assignmentsList.push({
            id: 'as_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            staffId: staff.id,
            staffName: staff.name,
            role: staff.role,
            phone: staff.phone || '',
            dayIdx,
            dayName: dayInfo.name,
            dayShort: dayInfo.short,
            shiftId: shift.id,
            shiftName: shift.name,
            shiftTime: shift.time,
            groupId: groupInfo.id,
            groupName: groupInfo.name,
            location: `${groupInfo.name} - ${groupInfo.location}`,
            note: '500 tờ',
            weekKey
          });
          addedCount++;
        }
      });
    });
  });

  saveFlyerAssignments(false);
  renderFlyerStats();
  renderFlyerTable();

  if (typeof showToast === 'function') {
    showToast(`✅ Đã phân công ${addedCount} ca phát tờ rơi & lưu tức thì Firebase!`, 'success');
  }
}

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

  const pool = [...FlyerState.staffList];
  if (pool.length === 0) {
    if (typeof showToast === 'function') showToast('Chưa có nhân viên / PG nào để chia lịch!', 'warning');
    return;
  }

  const shiftsToSchedule = targetShift === 'all'
    ? FLYER_SHIFTS
    : FLYER_SHIFTS.filter(s => s.id === targetShift);

  const groupsToSchedule = targetGroup === 'all'
    ? FlyerState.groupList
    : FlyerState.groupList.filter(g => g.id === targetGroup);

  const weekKey = getFlyerWeekKey();

  // Xóa các ca cũ của tuần này nếu chia lại
  FlyerState.assignmentsList = FlyerState.assignmentsList.filter(as => as.weekKey !== weekKey && as.weekKey);

  let staffCursor = 0;
  let totalAssigned = 0;

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const dayInfo = FLYER_DAYS[dayIdx];
    shiftsToSchedule.forEach(shift => {
      groupsToSchedule.forEach(group => {
        for (let i = 0; i < countPerSlot; i++) {
          const staff = pool[staffCursor % pool.length];
          staffCursor++;

          FlyerState.assignmentsList.push({
            id: 'as_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            staffId: staff.id,
            staffName: staff.name,
            role: staff.role,
            phone: staff.phone || '',
            dayIdx,
            dayName: dayInfo.name,
            dayShort: dayInfo.short,
            shiftId: shift.id,
            shiftName: shift.name,
            shiftTime: shift.time,
            groupId: group.id,
            groupName: group.name,
            location: `${group.name} - ${group.location}`,
            note: '500 tờ',
            weekKey
          });
          totalAssigned++;
        }
      });
    });
  }

  saveFlyerAssignments(false);
  renderFlyerStats();
  renderFlyerTable();

  if (typeof showToast === 'function') {
    showToast(`⚡ Đã chia đều ${totalAssigned} ca & lưu tức thì lên Firebase!`, 'success');
  }
}

function confirmClearFlyerWeek() {
  const weekKey = getFlyerWeekKey();
  if (typeof confirm === 'function' && !confirm(`Bạn có chắc muốn xóa toàn bộ lịch tờ rơi của "${FlyerState.currentMonth} - ${FlyerState.currentWeek}"?`)) {
    return;
  }

  FlyerState.assignmentsList = FlyerState.assignmentsList.filter(as => as.weekKey !== weekKey && as.weekKey);
  FlyerState.scheduleData[weekKey] = {};

  saveFlyerAssignments(false);
  saveFlyerSchedule(false);

  renderFlyerStats();
  renderFlyerTable();

  if (typeof showToast === 'function') {
    showToast('Đã xóa toàn bộ lịch tuần và cập nhật Firebase.', 'info');
  }
}

// ==========================================================================
// 10. QUẢN LÝ NHÂN VIÊN & PG (THÊM / XOÁ / SỬA)
// ==========================================================================

function setupFlyerStaffModal() {
  const modal = document.getElementById('modalFlyerStaffManager');
  const btnClose = document.getElementById('btnCloseFlyerStaffModal');
  const btnSaveStaff = document.getElementById('btnSaveFlyerStaff');
  const btnSyncFromMain = document.getElementById('btnSyncStaffFromMain');
  const searchInput = document.getElementById('flyerStaffSearch');
  const filterRole = document.getElementById('flyerStaffRoleFilter');

  if (btnClose) btnClose.addEventListener('click', closeFlyerStaffModal);
  if (btnSaveStaff) btnSaveStaff.addEventListener('click', handleSaveStaffForm);
  if (btnSyncFromMain) btnSyncFromMain.addEventListener('click', handleSyncStaffFromMain);
  if (searchInput) searchInput.addEventListener('input', renderFlyerStaffTableModal);
  if (filterRole) filterRole.addEventListener('change', renderFlyerStaffTableModal);
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

  const existing = FlyerState.staffList.find(s => s.name === name && s.id !== FlyerState.editingStaffId);
  if (existing) {
    if (typeof showToast === 'function') showToast(`Tên "${name}" đã tồn tại trong danh sách!`, 'warning');
    return;
  }

  if (FlyerState.editingStaffId) {
    const staff = FlyerState.staffList.find(s => s.id === FlyerState.editingStaffId);
    if (staff) {
      staff.name = name;
      staff.role = role;
      staff.group = groupVal;
      staff.phone = phone;
      staff.note = note;

      // Cập nhật tên trong các ca trực
      FlyerState.assignmentsList.forEach(as => {
        if (as.staffId === staff.id) {
          as.staffName = name;
          as.role = role;
          as.phone = phone;
        }
      });
    }
    if (typeof showToast === 'function') showToast(`Đã cập nhật thông tin "${name}" & lưu Firebase!`, 'success');
  } else {
    const newStaff = {
      id: (role === 'PG' ? 'pg_' : 'nv_') + Date.now(),
      name,
      role,
      group: groupVal,
      phone,
      note
    };
    FlyerState.staffList.push(newStaff);
    if (typeof showToast === 'function') showToast(`Đã thêm thành công "${name}" & lưu Firebase!`, 'success');
  }

  saveFlyerStaff(false);
  saveFlyerAssignments(false);
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

  FlyerState.staffList = FlyerState.staffList.filter(s => s.id !== staffId);
  FlyerState.assignmentsList = FlyerState.assignmentsList.filter(as => as.staffId !== staffId);

  saveFlyerStaff(false);
  saveFlyerAssignments(false);
  renderFlyerStaffTableModal();

  if (typeof showToast === 'function') showToast(`Đã xóa "${staff.name}" & cập nhật Firebase!`, 'info');
}

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

  saveFlyerStaff(false);
  renderFlyerStaffTableModal();

  if (typeof showToast === 'function') {
    showToast(`Đã đồng bộ thêm ${addedCount} nhân viên & lưu Firebase!`, 'success');
  }
}

// ==========================================================================
// 11. XUẤT ẢNH PNG & SAO CHÉP ZALO
// ==========================================================================

async function exportFlyerScheduleImage() {
  if (typeof html2canvas === 'undefined') {
    if (typeof showToast === 'function') showToast('Không tìm thấy thư viện html2canvas!', 'error');
    return;
  }

  let exportElement = document.getElementById('flyerScheduleTableContainer');
  if (FlyerState.currentView === 'matrix') {
    exportElement = document.getElementById('flyerTableContainer') || exportElement;
  }
  if (!exportElement) exportElement = document.getElementById('flyerScheduleTableContainer');
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
    link.download = `Bang_Phan_Lich_To_Roi_${safeMonth}_${safeWeek}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    if (typeof showToast === 'function') {
      showToast('✅ Đã xuất ảnh bảng lịch thành công và tải về máy!', 'success');
    }
  } catch (err) {
    console.error('Lỗi xuất ảnh:', err);
    if (typeof showToast === 'function') {
      showToast('Lỗi khi tạo ảnh: ' + err.message, 'error');
    }
  }
}

function openFlyerZaloModal() {
  const modal = document.getElementById('modalFlyerZalo');
  const textarea = document.getElementById('flyerZaloContent');
  const btnCopy = document.getElementById('btnCopyZaloText');
  const btnClose = document.getElementById('btnCloseFlyerZalo');

  if (!modal || !textarea) return;

  const text = generateZaloFlyerScheduleText();
  textarea.value = text;
  modal.classList.remove('hidden');

  if (btnClose) btnClose.onclick = () => modal.classList.add('hidden');

  if (btnCopy) {
    btnCopy.onclick = () => {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') {
          showToast('📋 Đã sao chép lịch! Bạn có thể dán ngay vào nhóm Zalo.', 'success');
        }
      }).catch(() => {
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
  const weekAssignments = FlyerState.assignmentsList.filter(as => as.weekKey === weekKey || !as.weekKey);

  let text = `📢 KẾ HOẠCH PHÁT TỜ RƠI • ${FlyerState.currentMonth} - ${FlyerState.currentWeek.toUpperCase()}\n`;
  text += `════════════════════════════════════\n\n`;

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const day = FLYER_DAYS[dayIdx];
    const dayItems = weekAssignments.filter(as => as.dayIdx === dayIdx);

    text += `📅 ${day.name.toUpperCase()} (${day.short}):\n`;

    if (dayItems.length === 0) {
      text += `  ⚪ Không có ca phát tờ rơi\n\n`;
      continue;
    }

    FLYER_SHIFTS.forEach(shift => {
      const shiftItems = dayItems.filter(as => as.shiftId === shift.id);
      if (shiftItems.length > 0) {
        text += `  ⏰ ${shift.name} (${shift.time}):\n`;
        shiftItems.forEach(item => {
          text += `    • ${item.staffName} (${item.role}): ${item.location} [${item.note || '500 tờ'}]\n`;
        });
      }
    });

    text += `\n`;
  }

  text += `════════════════════════════════════\n`;
  text += `👉 Lưu ý: Mọi người có mặt trước 10 phút, kiểm tra số lượng tờ rơi và trang phục chỉnh chu. Chúc cả nhà ngày làm việc hiệu quả! ❤️`;

  return text;
}

function setupFlyerCellPicker() {
  const btnClose = document.getElementById('btnCloseCellPicker');
  const btnDone = document.getElementById('btnDoneCellPicker');
  if (btnClose) btnClose.addEventListener('click', () => {
    const modal = document.getElementById('modalFlyerCellPicker');
    if (modal) modal.classList.add('hidden');
  });
  if (btnDone) btnDone.addEventListener('click', () => {
    const modal = document.getElementById('modalFlyerCellPicker');
    if (modal) modal.classList.add('hidden');
  });
}

// ==========================================================================
// 12. KHỞI CHẠY TỰ ĐỘNG
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initFlyerModule();
  }, 100);
});

// Cho phép gọi các hàm toàn cục từ HTML onclick
window.openFlyerAssignmentModal = openFlyerAssignmentModal;
window.closeFlyerAssignmentModal = closeFlyerAssignmentModal;
window.saveFlyerAssignmentFromModal = saveFlyerAssignmentFromModal;
window.deleteFlyerAssignment = deleteFlyerAssignment;
window.openFlyerStaffModal = openFlyerStaffModal;
window.closeFlyerStaffModal = closeFlyerStaffModal;
window.openFlyerAutoScheduleModal = openFlyerAutoScheduleModal;
window.exportFlyerScheduleImage = exportFlyerScheduleImage;
window.saveFlyerToFirebase = saveFlyerToFirebase;
window.FlyerState = FlyerState;
