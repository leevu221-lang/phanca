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
  { id: 'cangay', name: 'Cả Ngày', time: 'Cả Ngày', icon: 'fa-star', color: '#16a34a' },
  { id: 'sang', name: 'Ca Sáng', time: '7:00', icon: 'fa-sun', color: '#0284c7' },
  { id: 'chieu', name: 'Ca Chiều', time: '15:00', icon: 'fa-cloud-sun', color: '#d97706' },
  { id: 'toi', name: 'Ca Tối', time: '19:00', icon: 'fa-moon', color: '#6366f1' }
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
  { id: 'g1', name: 'TÊN NHÓM 1', location: 'Tuyến Chợ & Khu Dân Cư', color: '#0284c7' },
  { id: 'g2', name: 'NHÓM 2', location: 'Tuyến Trường Học & Công Viên', color: '#059669' },
  { id: 'g3', name: 'Nhóm 3', location: 'Tuyến Ngã Tư & Trung Tâm', color: '#d97706' }
];

// Nhân sự mặc định ban đầu (Khớp danh sách nhân sự chuẩn mẫu theo yêu cầu)
const DEFAULT_FLYER_STAFF = [
  { id: 'nv_1', name: 'NGUYỄN THÚY HOA', role: 'NV', group: 'TÊN NHÓM 1', phone: '', note: '' },
  { id: 'nv_2', name: 'PHẠM VĂN ĐẠI', role: 'NV', group: 'TÊN NHÓM 1', phone: '', note: '' },
  { id: 'nv_3', name: 'LÂM THỊ NHƯ Ý', role: 'NV', group: 'TÊN NHÓM 1', phone: '', note: '' },
  { id: 'nv_4', name: 'NGÔ THỊ BÉ THẮM', role: 'NV', group: 'TÊN NHÓM 1', phone: '', note: '' },
  { id: 'nv_5', name: 'NGUYỄN DIỄM MY', role: 'NV', group: 'TÊN NHÓM 1', phone: '', note: '' },
  { id: 'nv_6', name: 'HUỲNH HOÀNG PHÚC', role: 'NV', group: 'TÊN NHÓM 1', phone: '', note: '' },
  { id: 'nv_7', name: 'VÕ VŨ LINH', role: 'NV', group: 'TÊN NHÓM 1', phone: '', note: '' },
  { id: 'nv_8', name: 'KHANG HI', role: 'NV', group: 'TÊN NHÓM 1', phone: '', note: '' },
  { id: 'nv_9', name: 'LÊ THỊ MINH THÙY', role: 'NV', group: 'TÊN NHÓM 1', phone: '', note: '' },
  { id: 'pg_1', name: 'LAM (PG)', role: 'PG', group: 'TÊN NHÓM 1', phone: '', note: '' },
  { id: 'pg_2', name: 'NHƯ (PG)', role: 'PG', group: 'TÊN NHÓM 1', phone: '', note: '' }
];

// Trạng thái của Module Tờ Rơi
const FlyerState = {
  activeGroup: 'g1', // 'g1' (TÊN NHÓM 1), 'g2' (NHÓM 2), hoặc 'all' (Tất cả nhóm)
  currentWeek: 'Tuần 1',
  currentMonth: 'THÁNG 10',
  currentView: 'list', // 'list' (Bảng phân lịch chuẩn mẫu), 'matrix' hoặc 'summary'
  tableDateTitle: '22/10', // Tiêu đề ngày hiển thị trên cột 3 (mặc định 22/10 theo mẫu)
  currentDateKey: '2026-10-22', // Khóa ngày chuẩn dạng YYYY-MM-DD
  calYear: 2026,
  calMonth: 9, // 0-based: 9 = Tháng 10
  filterGroup: 'all',
  filterShift: 'all',
  tableSearchQuery: '',
  tableDayFilter: 'all',
  tableShiftFilter: 'all',
  tableRoleFilter: 'all',
  staffList: [],
  groupList: [],
  scheduleData: {},
  assignmentsList: [],
  editingStaffId: null,
  activeCellPicker: null
};

// Biến Firestore nội bộ cho Tờ Rơi
let flyerDb = null;
let isFlyerFirebaseReady = false;
let flyerSaveDebounce = null;
let isFlyerSaving = false;
let pendingFlyerForce = false;
let pendingFlyerSilent = true;
let pendingFlyerSaveAfterInFlight = null;
let unsubscribeFlyerListener = null;
let isInitialFlyerSnapshot = true;
const FLYER_CLIENT_ID = 'flyer_client_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);

function recordFlyerQuota(type, count = 1) {
  if (typeof window !== 'undefined' && typeof window.recordQuotaUsage === 'function') {
    window.recordQuotaUsage(type, count);
  }
}

// ==========================================================================
// 1. KHỞI TẠO FIREBASE FIRESTORE ĐỘC LẬP & ĐỒNG BỘ TỐI ƯU QUOTA
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

      // Chỉ đăng ký 1 listener realtime duy nhất (vừa nhận snapshot đầu tiên = 1 read, vừa lắng nghe thay đổi)
      // Không gọi đồng thời .get() + .onSnapshot() để tránh nhân đôi lượt đọc khi tải trang
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

let lastSavedFlyerSignature = null;

/**
 * Lấy chữ ký băm (hash signature) đại diện cho toàn bộ dữ liệu Tờ Rơi hiện tại
 * Dùng để Dirty Check: chỉ khi nào dữ liệu thực sự thay đổi mới cho phép ghi lên Firebase
 */
function getFlyerDataSignature(customData = null) {
  try {
    if (customData) {
      return JSON.stringify({
        staff: Array.isArray(customData.staffList) ? customData.staffList : (FlyerState.staffList || []),
        groups: Array.isArray(customData.groupList) ? customData.groupList : (FlyerState.groupList || []),
        sched: customData.scheduleData || FlyerState.scheduleData || {},
        assign: Array.isArray(customData.assignmentsList) ? customData.assignmentsList : (FlyerState.assignmentsList || []),
        title: customData.customTableTitle || FlyerState.customTableTitle || localStorage.getItem('flyer_custom_table_title') || ''
      });
    }
    return JSON.stringify({
      staff: FlyerState.staffList || [],
      groups: FlyerState.groupList || [],
      sched: FlyerState.scheduleData || {},
      assign: FlyerState.assignmentsList || [],
      title: FlyerState.customTableTitle || localStorage.getItem('flyer_custom_table_title') || ''
    });
  } catch (e) {
    return null;
  }
}

/**
 * Thực thi ghi dữ liệu Tờ Rơi lên Firestore (tuần tự, chỉ cập nhật signature sau khi ghi thành công)
 */
async function executeFlyerSaveToFirebase() {
  if (!flyerDb || !isFlyerFirebaseReady) return false;

  const force = pendingFlyerForce;
  const silent = pendingFlyerSilent;
  pendingFlyerForce = false;
  pendingFlyerSilent = true;

  const nowSig = getFlyerDataSignature();
  if (!force && lastSavedFlyerSignature && nowSig === lastSavedFlyerSignature) {
    recordFlyerQuota('avoided', 1);
    updateFlyerSyncStatus('synced');
    return false;
  }

  if (isFlyerSaving) {
    pendingFlyerSaveAfterInFlight = {
      force: (pendingFlyerSaveAfterInFlight && pendingFlyerSaveAfterInFlight.force) || force,
      silent: (pendingFlyerSaveAfterInFlight ? pendingFlyerSaveAfterInFlight.silent : true) && silent
    };
    return false;
  }

  isFlyerSaving = true;
  try {
    const colName = window.FIRESTORE_COLLECTION || FLYER_FIRESTORE_COLLECTION;
    const payload = {
      staffList: FlyerState.staffList || [],
      groupList: FlyerState.groupList || [],
      scheduleData: FlyerState.scheduleData || {},
      assignmentsList: FlyerState.assignmentsList || [],
      customTableTitle: FlyerState.customTableTitle || localStorage.getItem('flyer_custom_table_title') || 'BẢNG PHÂN LỊCH TỜ RƠI',
      updatedBy: FLYER_CLIENT_ID,
      lastUpdated: new Date().toISOString()
    };

    await flyerDb.collection(colName).doc(FLYER_FIRESTORE_DOC).set(payload, { merge: true });
    lastSavedFlyerSignature = nowSig;
    recordFlyerQuota('write', 1);
    updateFlyerSyncStatus('synced');

    if (!silent && typeof showToast === 'function') {
      showToast('☁️ Đã lưu dữ liệu lên Firebase Cloud!', 'success');
    }
    return true;
  } catch (e) {
    console.error('Lỗi lưu Firebase Tờ Rơi:', e);
    updateFlyerSyncStatus('error');
    return false;
  } finally {
    isFlyerSaving = false;
    if (pendingFlyerSaveAfterInFlight) {
      const nextReq = pendingFlyerSaveAfterInFlight;
      pendingFlyerSaveAfterInFlight = null;
      if (nextReq.force || getFlyerDataSignature() !== lastSavedFlyerSignature) {
        saveFlyerToFirebase(nextReq.force, nextReq.silent);
      }
    }
  }
}

/**
 * LƯU DỮ LIỆU TỜ RƠI LÊN FIREBASE CLOUD FIRESTORE
 * Có Dirty Check + Debounce 400ms: CHỈ LƯU KHI THAY ĐỔI DỮ LIỆU ĐỂ TRÁNH VƯỢT GÓI QUOTA FIREBASE
 * Mặc định silent = true (không hiện toast gây phiền khi tự động lưu)
 */
async function saveFlyerToFirebase(force = false, silent = true) {
  if (!flyerDb || !isFlyerFirebaseReady) return false;

  const currentSig = getFlyerDataSignature();
  if (!force && lastSavedFlyerSignature && currentSig === lastSavedFlyerSignature) {
    if (flyerSaveDebounce) {
      clearTimeout(flyerSaveDebounce);
      flyerSaveDebounce = null;
      pendingFlyerForce = false;
      pendingFlyerSilent = true;
      updateFlyerSyncStatus('synced');
    }
    recordFlyerQuota('avoided', 1);
    return false;
  }

  pendingFlyerForce = pendingFlyerForce || force;
  pendingFlyerSilent = pendingFlyerSilent && silent;
  updateFlyerSyncStatus('saving');

  if (flyerSaveDebounce) clearTimeout(flyerSaveDebounce);

  return new Promise((resolve) => {
    flyerSaveDebounce = setTimeout(async () => {
      flyerSaveDebounce = null;
      const res = await executeFlyerSaveToFirebase();
      resolve(res);
    }, 400);
  });
}

function flushPendingFlyerSave() {
  if (flyerSaveDebounce) {
    clearTimeout(flyerSaveDebounce);
    flyerSaveDebounce = null;
    executeFlyerSaveToFirebase();
  }
}

function applyFlyerRemoteData(data) {
  if (!data) return false;
  let changed = false;

  if (Array.isArray(data.staffList) && data.staffList.length > 0) {
    FlyerState.staffList = data.staffList;
    saveFlyerStaff(true);
    changed = true;
  }
  if (Array.isArray(data.groupList) && data.groupList.length > 0) {
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
  if (data.customTableTitle) {
    FlyerState.customTableTitle = data.customTableTitle;
    try { localStorage.setItem('flyer_custom_table_title', data.customTableTitle); } catch (e) {}
    changed = true;
  }

  lastSavedFlyerSignature = getFlyerDataSignature();
  if (changed) {
    renderFlyerStats();
    renderFlyerTable();
  }
  updateFlyerSyncStatus('synced');
  return changed;
}

/**
 * Tải dữ liệu Tờ Rơi thủ công từ Firebase Firestore (Chỉ gọi khi người dùng yêu cầu làm mới thủ công)
 */
async function syncFlyerFromFirebase() {
  if (!flyerDb || !isFlyerFirebaseReady) return false;
  try {
    const colName = window.FIRESTORE_COLLECTION || FLYER_FIRESTORE_COLLECTION;
    const docSnap = await flyerDb.collection(colName).doc(FLYER_FIRESTORE_DOC).get();
    recordFlyerQuota('read', 1);
    if (docSnap.exists) {
      applyFlyerRemoteData(docSnap.data());
    } else {
      await saveFlyerToFirebase(true, true);
    }
    return true;
  } catch (err) {
    console.warn('Lỗi đọc Firebase Tờ Rơi:', err);
    updateFlyerSyncStatus('error');
    return false;
  }
}

/**
 * Lắng nghe cập nhật realtime cho Tờ Rơi (Quản lý lifecycle chặt chẽ, chống đăng ký trùng lặp)
 */
function setupFlyerRealtimeListener() {
  if (!flyerDb || !isFlyerFirebaseReady) return;
  try {
    if (unsubscribeFlyerListener) {
      unsubscribeFlyerListener();
      unsubscribeFlyerListener = null;
    }

    isInitialFlyerSnapshot = true;
    const colName = window.FIRESTORE_COLLECTION || FLYER_FIRESTORE_COLLECTION;
    unsubscribeFlyerListener = flyerDb.collection(colName).doc(FLYER_FIRESTORE_DOC).onSnapshot((doc) => {
      if (doc.metadata && doc.metadata.hasPendingWrites) return; // Bỏ qua cập nhật local của chính máy này
      if (flyerSaveDebounce || isFlyerSaving) return; // Không ghi đè khi người dùng đang có thao tác lưu chờ

      const wasInitial = isInitialFlyerSnapshot;
      isInitialFlyerSnapshot = false;

      if (doc.exists) {
        const data = doc.data();
        if (!wasInitial && data && data.updatedBy === FLYER_CLIENT_ID) {
          return; // Bỏ qua phản hồi từ chính lần ghi của trình duyệt này
        }

        recordFlyerQuota('read', 1);
        const incomingSig = getFlyerDataSignature(data);
        if (!wasInitial && incomingSig && incomingSig === lastSavedFlyerSignature) {
          return; // Dữ liệu không đổi so với bản hiện tại -> bỏ qua render lại
        }

        applyFlyerRemoteData(data);
      } else if (wasInitial && (!doc.metadata || !doc.metadata.fromCache)) {
        recordFlyerQuota('read', 1);
        // Khởi tạo bản ghi ban đầu trên Firebase nếu trên server thực sự chưa có
        saveFlyerToFirebase(true, true);
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

  // Ghi nhận chữ ký dữ liệu cục bộ ban đầu để chống ghi thừa khi dữ liệu chưa thay đổi
  lastSavedFlyerSignature = getFlyerDataSignature();

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
  renderFlyerGroupTabs();

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
  ensureDefaultGroups();
}

function ensureDefaultGroups() {
  if (!Array.isArray(FlyerState.groupList)) {
    FlyerState.groupList = [];
  }
  let g1 = FlyerState.groupList.find(g => g.id === 'g1');
  if (!g1) {
    g1 = { id: 'g1', name: 'TÊN NHÓM 1', location: 'Tuyến Chợ & Khu Dân Cư', color: '#0284c7' };
    FlyerState.groupList.unshift(g1);
  }

  let g2 = FlyerState.groupList.find(g => g.id === 'g2');
  if (!g2) {
    g2 = { id: 'g2', name: 'NHÓM 2', location: 'Tuyến Trường Học & Công Viên', color: '#059669' };
    FlyerState.groupList.push(g2);
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
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        FlyerState.assignmentsList = parsed;
      } else {
        FlyerState.assignmentsList = [];
        initDemoAssignments();
      }
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
 * Khởi tạo dữ liệu mẫu chuẩn 100% khớp bảng mẫu ảnh (Ngày 22/10: Ca sáng 7:00 & Ca chiều 15:00)
 */
function initDemoAssignments() {
  const weekKey = getFlyerWeekKey();
  const dateStr = FlyerState.tableDateTitle || '22/10';
  FlyerState.assignmentsList = [
    // 1. Ca sáng 7:00
    {
      id: 'as_1',
      staffId: 'nv_1',
      staffName: 'NGUYỄN THÚY HOA',
      role: 'NV',
      phone: '',
      dayIdx: 2,
      dayName: 'Thứ Tư',
      dayShort: 'T4',
      shiftId: 'sang',
      shiftName: 'Buổi Sáng',
      shiftTime: '7:00',
      dateStr: dateStr,
      location: '',
      note: '',
      weekKey
    },
    // 2. Ca chiều 15:00 (10 nhân sự đúng như mẫu)
    {
      id: 'as_2',
      staffId: 'nv_2',
      staffName: 'PHẠM VĂN ĐẠI',
      role: 'NV',
      phone: '',
      dayIdx: 2,
      dayName: 'Thứ Tư',
      dayShort: 'T4',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '15:00',
      dateStr: dateStr,
      location: '',
      note: '',
      weekKey
    },
    {
      id: 'as_3',
      staffId: 'nv_3',
      staffName: 'LÂM THỊ NHƯ Ý',
      role: 'NV',
      phone: '',
      dayIdx: 2,
      dayName: 'Thứ Tư',
      dayShort: 'T4',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '15:00',
      dateStr: dateStr,
      location: '',
      note: '',
      weekKey
    },
    {
      id: 'as_4',
      staffId: 'nv_4',
      staffName: 'NGÔ THỊ BÉ THẮM',
      role: 'NV',
      phone: '',
      dayIdx: 2,
      dayName: 'Thứ Tư',
      dayShort: 'T4',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '15:00',
      dateStr: dateStr,
      location: '',
      note: '',
      weekKey
    },
    {
      id: 'as_5',
      staffId: 'nv_5',
      staffName: 'NGUYỄN DIỄM MY',
      role: 'NV',
      phone: '',
      dayIdx: 2,
      dayName: 'Thứ Tư',
      dayShort: 'T4',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '15:00',
      dateStr: dateStr,
      location: '',
      note: '',
      weekKey
    },
    {
      id: 'as_6',
      staffId: 'nv_6',
      staffName: 'HUỲNH HOÀNG PHÚC',
      role: 'NV',
      phone: '',
      dayIdx: 2,
      dayName: 'Thứ Tư',
      dayShort: 'T4',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '15:00',
      dateStr: dateStr,
      location: '',
      note: '',
      weekKey
    },
    {
      id: 'as_7',
      staffId: 'nv_7',
      staffName: 'VÕ VŨ LINH',
      role: 'NV',
      phone: '',
      dayIdx: 2,
      dayName: 'Thứ Tư',
      dayShort: 'T4',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '15:00',
      dateStr: dateStr,
      location: '',
      note: '',
      weekKey
    },
    {
      id: 'as_8',
      staffId: 'nv_8',
      staffName: 'KHANG HI',
      role: 'NV',
      phone: '',
      dayIdx: 2,
      dayName: 'Thứ Tư',
      dayShort: 'T4',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '15:00',
      dateStr: dateStr,
      location: '',
      note: '',
      weekKey
    },
    {
      id: 'as_9',
      staffId: 'nv_9',
      staffName: 'LÊ THỊ MINH THÙY',
      role: 'NV',
      phone: '',
      dayIdx: 2,
      dayName: 'Thứ Tư',
      dayShort: 'T4',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '15:00',
      dateStr: dateStr,
      location: '',
      note: '',
      weekKey
    },
    {
      id: 'as_10',
      staffId: 'pg_1',
      staffName: 'LAM (PG)',
      role: 'PG',
      phone: '',
      dayIdx: 2,
      dayName: 'Thứ Tư',
      dayShort: 'T4',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '15:00',
      dateStr: dateStr,
      location: '',
      note: '',
      weekKey
    },
    {
      id: 'as_11',
      staffId: 'pg_2',
      staffName: 'NHƯ (PG)',
      role: 'PG',
      phone: '',
      dayIdx: 2,
      dayName: 'Thứ Tư',
      dayShort: 'T4',
      shiftId: 'chieu',
      shiftName: 'Buổi Chiều',
      shiftTime: '15:00',
      dateStr: dateStr,
      location: '',
      note: '',
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
  const tab8NTTT = document.getElementById('tabNav8NTTT');
  const sectionSchedule = document.getElementById('sectionSchedule');
  const sectionFlyer = document.getElementById('sectionFlyer');
  const section8NTTT = document.getElementById('section8NTTT');
  const navFlyerQuickActions = document.getElementById('navFlyerQuickActions');

  function switchTab(tabName) {
    if (tabSchedule) tabSchedule.classList.remove('active');
    if (tabFlyer) tabFlyer.classList.remove('active');
    if (tab8NTTT) tab8NTTT.classList.remove('active');

    if (sectionSchedule) sectionSchedule.style.display = 'none';
    if (sectionFlyer) sectionFlyer.style.display = 'none';
    if (section8NTTT) section8NTTT.style.display = 'none';

    if (tabName === 'flyer') {
      if (tabFlyer) tabFlyer.classList.add('active');
      if (sectionFlyer) sectionFlyer.style.display = 'block';
      if (navFlyerQuickActions) navFlyerQuickActions.style.display = 'flex';

      renderFlyerStats();
      renderFlyerTable();
      updateFlyerMonthLabel();
      localStorage.setItem(FLYER_STORAGE_ACTIVE_TAB, 'flyer');
    } else if (tabName === '8nttt') {
      if (tab8NTTT) tab8NTTT.classList.add('active');
      if (section8NTTT) section8NTTT.style.display = 'block';
      if (navFlyerQuickActions) navFlyerQuickActions.style.display = 'none';

      if (typeof renderNTTT8AssignmentGrid === 'function') {
        renderNTTT8AssignmentGrid();
      }
      localStorage.setItem(FLYER_STORAGE_ACTIVE_TAB, '8nttt');
    } else {
      if (tabSchedule) tabSchedule.classList.add('active');
      if (sectionSchedule) sectionSchedule.style.display = 'block';
      if (navFlyerQuickActions) navFlyerQuickActions.style.display = 'flex';
      localStorage.setItem(FLYER_STORAGE_ACTIVE_TAB, 'schedule');
    }
  }

  if (tabSchedule) {
    tabSchedule.addEventListener('click', () => switchTab('schedule'));
  }
  if (tabFlyer) {
    tabFlyer.addEventListener('click', () => switchTab('flyer'));
  }
  if (tab8NTTT) {
    tab8NTTT.addEventListener('click', () => switchTab('8nttt'));
  }

  const savedTab = localStorage.getItem(FLYER_STORAGE_ACTIVE_TAB);
  const hashVal = (typeof window !== 'undefined' && window.location && window.location.hash) ? window.location.hash.toLowerCase() : '';
  if (hashVal === '#8nttt' || savedTab === '8nttt') {
    switchTab('8nttt');
  } else if (hashVal === '#toroi' || savedTab === 'flyer') {
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

function normalizeFlyerDate(str) {
  if (!str) return '22/10';
  const clean = String(str).trim();
  const m = clean.match(/^(\d{1,2})[\/\-](\d{1,2})/);
  if (m) {
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    return `${d}/${mo}`;
  }
  return clean;
}

function initFlyerCalendar() {
  document.addEventListener('click', (e) => {
    const popover = document.getElementById('flyerCalendarPopover');
    const trigger = document.getElementById('flyerDateBadgeTrigger');
    if (!popover || popover.classList.contains('hidden')) return;
    if (!popover.contains(e.target) && !trigger?.contains(e.target)) {
      popover.classList.add('hidden');
    }
  });
}

function toggleFlyerCalendar(e) {
  if (e) e.stopPropagation();
  const popover = document.getElementById('flyerCalendarPopover');
  if (!popover) return;
  const isHidden = popover.classList.contains('hidden');
  if (isHidden) {
    const dStr = FlyerState.tableDateTitle || '22/10';
    const m = dStr.match(/^(\d{1,2})[\/\-](\d{1,2})/);
    if (m) {
      FlyerState.calMonth = parseInt(m[2], 10) - 1;
    }
    renderFlyerCalendar();
    popover.classList.remove('hidden');
  } else {
    popover.classList.add('hidden');
  }
}

function changeFlyerCalMonth(delta) {
  FlyerState.calMonth = (FlyerState.calMonth !== undefined ? FlyerState.calMonth : 9) + delta;
  if (FlyerState.calMonth < 0) {
    FlyerState.calMonth = 11;
    FlyerState.calYear = (FlyerState.calYear || 2026) - 1;
  } else if (FlyerState.calMonth > 11) {
    FlyerState.calMonth = 0;
    FlyerState.calYear = (FlyerState.calYear || 2026) + 1;
  }
  renderFlyerCalendar();
}

function renderFlyerCalendar() {
  const titleElem = document.getElementById('flyerCalMonthYearTitle');
  const gridElem = document.getElementById('flyerCalendarDaysGrid');
  if (!titleElem || !gridElem) return;

  const y = FlyerState.calYear || 2026;
  const m = (FlyerState.calMonth !== undefined) ? FlyerState.calMonth : 9;

  titleElem.textContent = `Tháng ${m + 1} / ${y}`;

  // Thứ 2 là 0 .. CN là 6
  const firstDay = new Date(y, m, 1).getDay();
  const startDay = (firstDay + 6) % 7;
  const totalDays = new Date(y, m + 1, 0).getDate();

  const now = new Date();
  const isCurrentMonthNow = (now.getFullYear() === y && now.getMonth() === m);
  const todayDate = now.getDate();

  const activeNorm = normalizeFlyerDate(FlyerState.tableDateTitle || '22/10');

  // Tập hợp các ngày đã có phân lịch
  const datesWithSchedule = new Set();
  FlyerState.assignmentsList.forEach(as => {
    if (as.dateStr) {
      datesWithSchedule.add(normalizeFlyerDate(as.dateStr));
    }
  });

  let html = '';
  for (let i = 0; i < startDay; i++) {
    html += `<div class="flyer-cal-day-cell empty"></div>`;
  }

  for (let d = 1; d <= totalDays; d++) {
    const normDay = `${d}/${m + 1}`;
    const isSelected = (normDay === activeNorm);
    const hasSched = datesWithSchedule.has(normDay);
    const isToday = (isCurrentMonthNow && d === todayDate);

    let classes = ['flyer-cal-day-cell'];
    if (isSelected) classes.push('selected');
    if (isToday) classes.push('today');
    if (hasSched) classes.push('has-schedule');

    html += `
      <div class="${classes.join(' ')}" onclick="selectFlyerDate(${y}, ${m}, ${d})" title="Ngày ${d}/${m + 1}/${y}${hasSched ? ' (Đã có lịch)' : ''}">
        <span>${d}</span>
        ${hasSched ? '<span class="flyer-cal-day-dot"></span>' : ''}
      </div>
    `;
  }

  gridElem.innerHTML = html;
}

function selectFlyerDate(year, month, day) {
  const dayStr = `${day}/${month + 1}`;
  const fullKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  FlyerState.calYear = year;
  FlyerState.calMonth = month;
  FlyerState.tableDateTitle = dayStr;
  FlyerState.currentDateKey = fullKey;

  const dateInput = document.getElementById('flyerTableDateTitleInput');
  if (dateInput) dateInput.value = dayStr;

  const popover = document.getElementById('flyerCalendarPopover');
  if (popover) popover.classList.add('hidden');

  renderFlyerScheduleTable();
  // Đã tắt lưu Firebase & tắt thông báo khi chuyển ngày để tránh vượt gói quota và không làm phiền người dùng
}

function selectFlyerDateToday() {
  const now = new Date();
  selectFlyerDate(now.getFullYear(), now.getMonth(), now.getDate());
}

function selectFlyerSample22() {
  selectFlyerDate(2026, 9, 22);
}

function generateDateKeyFromStr(dateStr) {
  const norm = normalizeFlyerDate(dateStr);
  const parts = norm.split('/');
  if (parts.length === 2) {
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = FlyerState.calYear || 2026;
    return `${y}-${m}-${d}`;
  }
  return '2026-10-22';
}

function copyFlyerScheduleFromDate(srcDateStr) {
  const targetDateStr = (FlyerState.tableDateTitle || '22/10').trim();
  const srcNorm = normalizeFlyerDate(srcDateStr || '22/10');
  const targetNorm = normalizeFlyerDate(targetDateStr);

  if (srcNorm === targetNorm) {
    if (typeof showToast === 'function') showToast(`Bạn đang ở chính ngày ${targetDateStr}!`, 'info');
    return;
  }

  // 1. Tìm các ca của Ngày A (Ngày nguồn)
  let srcItems = FlyerState.assignmentsList.filter(as => {
    return normalizeFlyerDate(as.dateStr || '22/10') === srcNorm;
  });

  // Nếu trong bộ nhớ chưa có ca nào của Ngày A, nhưng Ngày A là '22/10' mẫu
  if (srcItems.length === 0 && (srcNorm === '22/10' || srcNorm === '22-10')) {
    initDemoAssignments();
    srcItems = FlyerState.assignmentsList.filter(as => normalizeFlyerDate(as.dateStr || '22/10') === '22/10');
  }

  if (srcItems.length === 0) {
    if (typeof showToast === 'function') showToast(`Không tìm thấy dữ liệu ca của ngày ${srcDateStr} để sao chép!`, 'warning');
    return;
  }

  // Đảm bảo Ngày A có đầy đủ thuộc tính dateStr và dateKey rõ ràng để không bao giờ bị mất hoặc lẫn
  srcItems.forEach(it => {
    it.dateStr = srcDateStr;
    it.dateKey = it.dateKey || generateDateKeyFromStr(srcDateStr);
  });

  // 2. GIỮ NGUYÊN HOÀN TOÀN TẤT CẢ DỮ LIỆU NGÀY A VÀ CÁC NGÀY KHÁC!
  // Chỉ lọc bỏ các ca cũ của Ngày B (ngày đích) nếu trước đó Ngày B đã có ca
  const otherDaysItems = FlyerState.assignmentsList.filter(as => {
    return normalizeFlyerDate(as.dateStr || '22/10') !== targetNorm;
  });

  // 3. Deep-clone độc lập từng ca từ Ngày A sang Ngày B với ID mới tinh
  const targetDateKey = FlyerState.currentDateKey || generateDateKeyFromStr(targetDateStr);
  const clonedTargetItems = srcItems.map((item, idx) => ({
    id: 'as_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 6),
    staffId: item.staffId,
    staffName: item.staffName,
    role: item.role,
    phone: item.phone || '',
    dayIdx: item.dayIdx !== undefined ? item.dayIdx : 2,
    dayName: item.dayName || 'Thứ Tư',
    dayShort: item.dayShort || 'T4',
    shiftId: item.shiftId,
    shiftName: item.shiftName,
    shiftTime: item.shiftTime,
    groupId: item.groupId || 'g1',
    groupName: item.groupName || 'Nhóm 1',
    location: item.location || '',
    note: item.note || '',
    dateStr: targetDateStr,
    dateKey: targetDateKey,
    weekKey: item.weekKey || getFlyerWeekKey()
  }));

  // 4. Gộp lại: Dữ liệu Ngày A (và các ngày khác nguyên vẹn) + Dữ liệu mới độc lập của Ngày B
  FlyerState.assignmentsList = [...otherDaysItems, ...clonedTargetItems];

  // 5. Lưu ngay tức thì vào LocalStorage và Firebase
  saveFlyerAssignments(false);
  renderFlyerStats();
  renderFlyerTable();

  if (typeof showToast === 'function') {
    showToast(`✅ Đã sao chép lịch sang Ngày ${targetDateStr}! Dữ liệu ngày ${srcDateStr} vẫn được giữ nguyên 100%.`, 'success');
  }
}

function promptCopyFromAnyDate() {
  const otherScheduledDates = Array.from(new Set(
    FlyerState.assignmentsList.map(as => as.dateStr).filter(Boolean)
  ));
  const defaultDate = otherScheduledDates[0] || '22/10';
  const choice = prompt(`Nhập ngày bạn muốn sao chép sang ngày ${FlyerState.tableDateTitle}:\n(Các ngày đang có lịch: ${otherScheduledDates.join(', ')})`, defaultDate);
  if (choice && choice.trim()) {
    copyFlyerScheduleFromDate(choice.trim());
  }
}

function setupFlyerTableFilters() {
  const searchInput = document.getElementById('flyerTableSearchInput');
  const dateTitleInput = document.getElementById('flyerTableDateTitleInput');
  const shiftFilter = document.getElementById('flyerTableShiftFilter');
  const roleFilter = document.getElementById('flyerTableRoleFilter');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      FlyerState.tableSearchQuery = e.target.value.trim().toLowerCase();
      renderFlyerScheduleTable();
    });
  }
  if (dateTitleInput) {
    dateTitleInput.addEventListener('input', (e) => {
      FlyerState.tableDateTitle = e.target.value.trim();
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

  initFlyerCalendar();
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
// 6. BẢNG PHÂN LỊCH TỜ RƠI CHUẨN MẪU (VÀNG CHỮ ĐỎ - DÒNG XANH - TUYẾN ĐƯỜNG MERGE)
// ==========================================================================

function renderFlyerTable() {
  renderFlyerScheduleTable();

  if (FlyerState.currentView === 'summary') {
    renderFlyerSummaryTable();
  } else if (FlyerState.currentView === 'matrix') {
    renderFlyerMatrixTable();
  }
}

/**
 * Chuyển tab xem theo Nhóm (g1: TÊN NHÓM 1, g2: NHÓM 2, all: Tất cả nhóm)
 */
function switchFlyerGroup(groupId) {
  FlyerState.activeGroup = groupId;
  renderFlyerGroupTabs();
  renderFlyerScheduleTable();
}

/**
 * Cập nhật hiển thị tên các tab nhóm trên giao diện & trong popup
 */
function renderFlyerGroupTabs() {
  ensureDefaultGroups();
  const g1 = FlyerState.groupList.find(g => g.id === 'g1') || { name: 'TÊN NHÓM 1' };
  const g2 = FlyerState.groupList.find(g => g.id === 'g2') || { name: 'NHÓM 2' };

  const tabName1 = document.getElementById('tabName_g1');
  const tabName2 = document.getElementById('tabName_g2');
  if (tabName1) tabName1.textContent = g1.name;
  if (tabName2) tabName2.textContent = g2.name;

  const modalTab1 = document.getElementById('modalAddGroupName_g1');
  const modalTab2 = document.getElementById('modalAddGroupName_g2');
  if (modalTab1) modalTab1.textContent = g1.name;
  if (modalTab2) modalTab2.textContent = g2.name;

  const singleOpt1 = document.querySelector('#assignSingleGroupSelect option[value="g1"]');
  const singleOpt2 = document.querySelector('#assignSingleGroupSelect option[value="g2"]');
  if (singleOpt1) singleOpt1.textContent = g1.name;
  if (singleOpt2) singleOpt2.textContent = g2.name;

  const cur = FlyerState.activeGroup || 'g1';
  ['g1', 'g2', 'all'].forEach(id => {
    const btn = document.getElementById(`tabGroup_${id}`);
    if (btn) {
      if (id === cur) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });
}

/**
 * Mở modal đổi tiêu đề bảng (dành cho mobile & desktop, không dùng prompt bị trình duyệt chặn)
 */
function openEditGroupTitleModal() {
  const modal = document.getElementById('modalEditGroupTitle');
  if (!modal) return;
  const curName = FlyerState.customTableTitle || localStorage.getItem('flyer_custom_table_title') || 'BẢNG PHÂN LỊCH TỜ RƠI';
  const input = document.getElementById('editGroupTitleInput');
  if (input) input.value = curName;
  modal.classList.remove('hidden');
  setTimeout(() => {
    if (input) {
      input.focus();
      input.select();
    }
  }, 60);
}

function closeEditGroupTitleModal() {
  const modal = document.getElementById('modalEditGroupTitle');
  if (modal) modal.classList.add('hidden');
}

function setQuickGroupName(name) {
  const input = document.getElementById('editGroupTitleInput');
  if (input) {
    input.value = name;
    input.focus();
  }
}

function confirmSaveGroupTitleModal() {
  const input = document.getElementById('editGroupTitleInput');
  const newTitle = input ? input.value.trim() : '';

  if (!newTitle) {
    if (typeof showToast === 'function') showToast('⚠️ Vui lòng nhập tiêu đề bảng!', 'warning');
    return;
  }

  const trimmed = newTitle.toUpperCase();
  FlyerState.customTableTitle = trimmed;
  try {
    localStorage.setItem('flyer_custom_table_title', trimmed);
    saveFlyerToFirebase();
  } catch (e) {
    console.error(e);
  }

  renderFlyerScheduleTable();
  closeEditGroupTitleModal();

  if (typeof showToast === 'function') {
    showToast(`✅ Đã đổi tiêu đề bảng thành: "${trimmed}"`, 'success');
  }
}

function promptEditCurrentGroupName() {
  openEditGroupTitleModal();
}

function promptEditGroupName() {
  openEditGroupTitleModal();
}

/**
 * Sao chép nhanh toàn bộ lịch phân công từ nhóm này sang nhóm khác
 */
function copyFlyerScheduleFromGroup(srcGroupId = 'g1', targetGroupId = 'g2') {
  const dateTitle = (FlyerState.tableDateTitle || '22/10').trim();
  const activeNorm = normalizeFlyerDate(dateTitle);

  const srcItems = FlyerState.assignmentsList.filter(as => {
    return normalizeFlyerDate(as.dateStr || '22/10') === activeNorm && (as.groupId || 'g1') === srcGroupId;
  });

  if (srcItems.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Chưa có dữ liệu ở nhóm nguồn để sao chép!', 'warning');
    }
    return;
  }

  ensureDefaultGroups();
  const targetGroup = FlyerState.groupList.find(g => g.id === targetGroupId) || { id: targetGroupId, name: targetGroupId === 'g2' ? 'NHÓM 2' : 'TÊN NHÓM 1' };

  // Tạo danh sách nhân sự mới cho targetGroup
  const cloned = srcItems.map((item, idx) => ({
    id: 'as_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 6),
    staffId: item.staffId,
    staffName: item.staffName,
    role: item.role,
    phone: item.phone || '',
    dayIdx: item.dayIdx !== undefined ? item.dayIdx : 2,
    dayName: item.dayName || 'Thứ Tư',
    dayShort: item.dayShort || 'T4',
    shiftId: item.shiftId,
    shiftName: item.shiftName,
    shiftTime: item.shiftTime,
    groupId: targetGroupId,
    groupName: targetGroup.name,
    location: item.location || '',
    note: item.note || '',
    dateStr: item.dateStr || dateTitle,
    dateKey: item.dateKey || FlyerState.currentDateKey,
    weekKey: item.weekKey || getFlyerWeekKey()
  }));

  // Bỏ các ca cũ của targetGroup trong ngày này
  FlyerState.assignmentsList = FlyerState.assignmentsList.filter(as => {
    const isSameDate = normalizeFlyerDate(as.dateStr || '22/10') === activeNorm;
    const isTargetGroup = (as.groupId || 'g1') === targetGroupId;
    return !(isSameDate && isTargetGroup);
  });

  FlyerState.assignmentsList.push(...cloned);
  saveFlyerAssignments(false);
  renderFlyerScheduleTable();
  renderFlyerStats();

  if (typeof showToast === 'function') {
    showToast(`✅ Đã sao chép ${cloned.length} ca sang ${targetGroup.name}!`, 'success');
  }
}

/**
 * Hiển thị chính xác Bảng Phân Lịch Tờ Rơi Chuẩn Mẫu (Vàng chữ đỏ, Dòng xanh, Tuyến đường merge)
 * Hỗ trợ tiêu đề bảng: TÊN NHÓM 1 & NHÓM 2, tự động chụp vào file ảnh khi Xuất
 */
function renderFlyerScheduleTable() {
  const tbody = document.getElementById('flyerScheduleTableBody');
  const dateHeader = document.getElementById('flyerTableDateHeader');
  if (!tbody) return;

  const dateTitle = (FlyerState.tableDateTitle || '22/10').trim();
  if (dateHeader) {
    dateHeader.textContent = `NGÀY ${dateTitle}`;
  }

  // Cập nhật tiêu đề bảng
  const groupPill = document.getElementById('flyerTableGroupPill');
  const groupHeading = document.getElementById('flyerTableGroupHeading');
  const groupSub = document.getElementById('flyerTableGroupSub');

  const customTitle = FlyerState.customTableTitle || localStorage.getItem('flyer_custom_table_title') || 'BẢNG PHÂN LỊCH TỜ RƠI';

  if (groupPill) groupPill.style.display = 'none';
  if (groupHeading) groupHeading.textContent = customTitle;
  if (groupSub) groupSub.textContent = `BẢNG PHÂN LỊCH PHÁT TỜ RƠI CHI TIẾT • NGÀY ${dateTitle}`;

  // Ẩn thanh chọn nhóm
  const switcher = document.getElementById('flyerGroupSwitcherWrapper');
  if (switcher) switcher.style.display = 'none';

  const activeNorm = normalizeFlyerDate(dateTitle);

  // Lấy toàn bộ nhân sự trong ngày đang chọn (chung 1 bảng duy nhất)
  let rawList = FlyerState.assignmentsList.filter(as => {
    const asNorm = normalizeFlyerDate(as.dateStr || '22/10');
    return asNorm === activeNorm;
  });

  // Áp dụng bộ lọc tìm kiếm, ca, chức vụ
  const q = FlyerState.tableSearchQuery;
  const shiftF = FlyerState.tableShiftFilter;
  const roleF = FlyerState.tableRoleFilter;

  let filteredList = rawList.filter(item => {
    const matchSearch = !q ||
      item.staffName.toLowerCase().includes(q) ||
      (item.location && item.location.toLowerCase().includes(q));

    const matchShift = (shiftF === 'all') || (item.shiftId === shiftF);
    const matchRole = (roleF === 'all') || (item.role === roleF);

    return matchSearch && matchShift && matchRole;
  });

  if (filteredList.length === 0) {
    const isSearching = !!q || shiftF !== 'all' || roleF !== 'all';
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #64748b; padding: 40px 20px;">
          <div style="font-size: 2.2rem; margin-bottom: 10px;">📅</div>
          <strong style="color: #1e293b; font-size: 1rem;">
            ${isSearching ? 'Không có ca phân lịch nào phù hợp bộ lọc.' : `Chưa có lịch phát tờ rơi cho NGÀY ${dateTitle}`}
          </strong>
          <p style="font-size: 0.82rem; color: #64748b; margin: 6px 0 14px;">
            ${isSearching ? 'Hãy thử chọn lại ca trực hoặc từ khóa tìm kiếm.' : 'Bạn có thể bấm thêm nhân viên hoặc sao chép nhanh danh sách nhân sự từ ngày khác sang.'}
          </p>
          <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-primary btn-sm" onclick="openFlyerAssignmentModal()">
              <i class="fa-solid fa-plus"></i> Thêm Nhân Viên Cho Ngày Này
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="copyFlyerScheduleFromDate('22/10')" style="font-weight: 700; color: #0284c7;">
              <i class="fa-solid fa-copy"></i> Sao Chép Lịch Mẫu 22/10
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Hiển thị chung tất cả nhân viên trong 1 bảng duy nhất
  tbody.innerHTML = renderShiftsHtmlForList(filteredList, dateTitle);
}

/**
 * Tạo HTML hiển thị các ca và ô Tuyến Đường merge rowspan cho một danh sách ca trực
 */
function renderShiftsHtmlForList(itemsList, dateTitle) {
  const shiftKeys = ['cangay', 'sang', 'chieu', 'toi'];
  let html = '';
  let renderedShiftsCount = 0;

  shiftKeys.forEach(shiftId => {
    const shiftItems = itemsList.filter(it => it.shiftId === shiftId);
    if (shiftItems.length === 0) return;

    // Dòng ngăn cách xanh lá giữa các ca
    if (renderedShiftsCount > 0) {
      html += `
        <tr class="flyer-shift-divider">
          <td colspan="5"></td>
        </tr>
      `;
    }
    renderedShiftsCount++;

    let defaultShiftTime = '7:00';
    if (shiftId === 'cangay') defaultShiftTime = 'CẢ NGÀY';
    else if (shiftId === 'sang') defaultShiftTime = '7:00';
    else if (shiftId === 'chieu') defaultShiftTime = '15:00';
    else if (shiftId === 'toi') defaultShiftTime = '19:00';

    // Tuyến đường chung của ca
    const shiftLocation = shiftItems.find(it => it.location && it.location.trim())?.location || '';

    shiftItems.forEach((item, idx) => {
      let displayName = item.staffName.trim().toUpperCase();
      if (item.role === 'PG' && !displayName.includes('(PG)')) {
        displayName += ' (PG)';
      }

      const itemTime = item.shiftTime || defaultShiftTime;
      const timeText = (shiftId === 'cangay' || itemTime.toUpperCase() === 'CẢ NGÀY')
        ? `CẢ NGÀY ${item.dateStr || dateTitle}`
        : `${itemTime} NGÀY ${item.dateStr || dateTitle}`;

      html += `
        <tr>
          <!-- 1. STT: Đếm lại từ 1 cho từng ca y hệt ảnh mẫu -->
          <td class="td-stt"><strong>${idx + 1}</strong></td>

          <!-- 2. NHÂN VIÊN: In hoa đậm -->
          <td class="td-staff"><strong>${displayName}</strong></td>

          <!-- 3. THỜI GIAN & NGÀY: Căn giữa, in đậm -->
          <td class="td-datetime"><strong>${timeText}</strong></td>
      `;

      // 4. TUYẾN ĐƯỜNG: Ô gộp (rowspan) lớn bên phải
      if (idx === 0) {
        const formattedLoc = formatFlyerLocationHtml(shiftLocation);
        html += `
          <td class="td-location" rowspan="${shiftItems.length}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
              <strong style="white-space: pre-line; line-height: 1.65; flex: 1; text-align: left;">${formattedLoc}</strong>
              <button type="button" class="btn btn-secondary btn-sm no-export" style="font-size: 0.72rem; padding: 2px 6px; border: 1px solid #cbd5e1; flex-shrink: 0;" title="Chỉnh sửa tuyến đường cho ca này" onclick="openFlyerShiftLocationPrompt('${shiftId}', '${encodeURIComponent(shiftLocation)}')">
                <i class="fa-solid fa-pen text-blue"></i>
              </button>
            </div>
          </td>
        `;
      }

      // 5. THAO TÁC: Nút sửa / xóa (ẩn khi xuất ảnh)
      html += `
          <td class="td-actions no-export">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button type="button" class="btn btn-secondary btn-sm" style="padding: 2px 6px; font-size: 0.75rem;" title="Sửa ca của ${displayName}" onclick="openFlyerAssignmentModal('${item.id}')">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="btn btn-secondary btn-sm" style="padding: 2px 6px; font-size: 0.75rem; color: #dc2626;" title="Xóa ${displayName} khỏi ca này" onclick="deleteFlyerAssignment('${item.id}')">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
  });

  return html;
}

/**
 * Định dạng hiển thị tuyến đường:
 * - Hỗ trợ xuống dòng (\n -> <br>)
 * - Tự động tách dòng nếu người dùng nhập dính nhiều buổi (VD: ". 🌅 BUỔI CHIỀU : ")
 */
function formatFlyerLocationHtml(loc) {
  if (!loc) return '';
  let text = String(loc);

  // Tự động ngắt dòng nếu người dùng nhập nhiều buổi trong 1 ô mà quên bấm Enter
  text = text.replace(/([.!?])\s*(?=([🌅☀️🌙⭐📍🛵🏢🏬•\*]\s*)?(BUỔI SÁNG|BUỔI CHIỀU|BUỔI TỐI|CA SÁNG|CA CHIỀU|CA TỐI)\b)/gi, '$1\n');

  // Escape HTML để bảo vệ hiển thị an toàn
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Chuyển ký tự xuống dòng thành <br>
  return escaped.replace(/\r?\n/g, '<br>');
}

function resetFlyerToSample() {
  FlyerState.tableDateTitle = '22/10';
  const dateInput = document.getElementById('flyerTableDateTitleInput');
  if (dateInput) dateInput.value = '22/10';
  initDemoAssignments();
  saveFlyerAssignments(false);
  renderFlyerStats();
  renderFlyerTable();
  if (typeof showToast === 'function') {
    showToast('✅ Đã nạp lại bảng mẫu Ngày 22/10 chuẩn theo hình!', 'success');
  }
}

// ==========================================================================
// 6B. GIAO DIỆN CHỈNH SỬA TUYẾN ĐƯỜNG & CHỌN ICON ĐẸP
// ==========================================================================

const FLYER_ROUTE_ICONS = [
  '📍', '🗺️', '🛣️', '🏢', '🏬', '🏪', '🛒', '🛵', '🚗', '🚶',
  '🌅', '☀️', '🌙', '⭐', '✨', '🎯', '🚩', '📌', '📢', '🎁',
  '🏫', '🏥', '🏖️', '⚡', '🔔', '🏷️', '📦', '🟢'
];

const FLYER_ROUTE_TEMPLATES = [
  '☀️ BUỔI SÁNG : BỜ KÈ CHỢ P7, ĐƯỜNG TRƯƠNG PHÙNG XUÂN\n🌅 BUỔI CHIỀU : CẢNG CÁ P8, KCN MINH PHÚ, CHỢ P8',
  '📍 Tuyến Chợ & Khu Dân Cư',
  '🛵 Tuyến Trường Học & Công Viên',
  '🏢 Tuyến Ngã Tư & Trung Tâm',
  '🏬 Tuyến Bến Xe & Phố Đi Bộ'
];

function openFlyerShiftLocationPrompt(shiftId, currentLocEncoded) {
  const currentLoc = decodeURIComponent(currentLocEncoded || '');
  openFlyerLocationModal(shiftId, currentLoc);
}

function openFlyerLocationModal(shiftId, currentLoc = '') {
  const modal = document.getElementById('modalFlyerLocationModal');
  const shiftInput = document.getElementById('flyerLocModalShiftId');
  const textarea = document.getElementById('flyerLocModalInput');
  const shiftBadge = document.getElementById('flyerLocModalShiftBadge');
  const dateBadge = document.getElementById('flyerLocModalDateBadge');
  const iconGrid = document.getElementById('flyerIconPickerGrid');
  const sugList = document.getElementById('flyerLocSuggestionsList');

  if (!modal) return;

  const dateTitle = (FlyerState.tableDateTitle || '22/10').trim();

  let shiftName = 'Ca Sáng (7:00)';
  if (shiftId === 'cangay') shiftName = '⭐ CẢ NGÀY';
  else if (shiftId === 'sang') shiftName = '🌅 Ca Sáng (7:00)';
  else if (shiftId === 'chieu') shiftName = '☀️ Ca Chiều (15:00)';
  else if (shiftId === 'toi') shiftName = '🌙 Ca Tối (19:00)';

  if (shiftInput) shiftInput.value = shiftId;
  if (shiftBadge) shiftBadge.textContent = shiftName;
  if (dateBadge) dateBadge.textContent = `NGÀY ${dateTitle}`;

  // Render danh sách Icon Đẹp
  if (iconGrid) {
    iconGrid.innerHTML = FLYER_ROUTE_ICONS.map(icon => `
      <button type="button" class="flyer-icon-btn" onclick="insertIconToFlyerLocation('${icon}')" title="Chèn icon ${icon}">
        ${icon}
      </button>
    `).join('');
  }

  // Render gợi ý mẫu nhanh
  if (sugList) {
    sugList.innerHTML = FLYER_ROUTE_TEMPLATES.map(tpl => `
      <button type="button" class="flyer-template-pill" onclick="applyFlyerLocationTemplate('${tpl}')">
        ${tpl.replace(/\n/g, ' ⤶ ')}
      </button>
    `).join('');
  }

  // Đảm bảo nếu nội dung cũ dính liền buổi sáng & chiều thì tự tách dòng trong textarea
  let initialLoc = currentLoc;
  if (initialLoc && !initialLoc.includes('\n')) {
    initialLoc = initialLoc.replace(/([.!?])\s*(?=([🌅☀️🌙⭐📍🛵🏢🏬•\*]\s*)?(BUỔI SÁNG|BUỔI CHIỀU|BUỔI TỐI|CA SÁNG|CA CHIỀU|CA TỐI)\b)/gi, '$1\n');
  }

  if (textarea) {
    textarea.value = initialLoc;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }, 120);
  }

  modal.classList.remove('hidden');
}

function closeFlyerLocationModal() {
  const modal = document.getElementById('modalFlyerLocationModal');
  if (modal) modal.classList.add('hidden');
}

function insertIconToFlyerLocation(icon) {
  const textarea = document.getElementById('flyerLocModalInput');
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;

  const insertText = icon + ' ';
  textarea.value = val.substring(0, start) + insertText + val.substring(end);
  const newPos = start + insertText.length;
  textarea.focus();
  textarea.setSelectionRange(newPos, newPos);
}

function applyFlyerLocationTemplate(text) {
  const textarea = document.getElementById('flyerLocModalInput');
  if (!textarea) return;
  textarea.value = text;
  textarea.focus();
  textarea.setSelectionRange(text.length, text.length);
}

function saveFlyerLocationFromModal() {
  const shiftId = document.getElementById('flyerLocModalShiftId')?.value || 'sang';
  const textarea = document.getElementById('flyerLocModalInput');
  const newLoc = textarea ? textarea.value.trim() : '';

  const activeNorm = normalizeFlyerDate(FlyerState.tableDateTitle || '22/10');
  let updatedCount = 0;

  FlyerState.assignmentsList.forEach(item => {
    const itemNorm = normalizeFlyerDate(item.dateStr || '22/10');
    if (item.shiftId === shiftId && itemNorm === activeNorm) {
      item.location = newLoc;
      updatedCount++;
    }
  });

  saveFlyerAssignments(false);
  closeFlyerLocationModal();
  renderFlyerTable();

  if (typeof showToast === 'function') {
    showToast(`✅ Đã cập nhật tuyến đường (${updatedCount} nhân sự) ngày ${FlyerState.tableDateTitle}!`, 'success');
  }
}

// ==========================================================================
// 7. THAO TÁC THÊM / SỬA / XÓA CA TRỰC (CHỌN NHIỀU NHÂN VIÊN VÀ TỰ ĐỘNG LƯU FIREBASE)
// ==========================================================================

function openFlyerAssignmentModal(editId = null, presetDay = null, presetShift = null, presetLocation = null) {
  const modal = document.getElementById('modalFlyerAssignmentForm');
  const title = document.getElementById('assignmentModalTitle');
  const subtitle = document.getElementById('assignmentModalSubtitle');
  const idInput = document.getElementById('assignmentEditId');
  const multiWrap = document.getElementById('assignMultiStaffWrap');
  const singleWrap = document.getElementById('assignSingleStaffWrap');
  const saveBtnText = document.getElementById('btnSaveAssignmentModalText');

  if (!modal) return;

  const activeDate = (FlyerState.tableDateTitle || '22/10').trim();

  if (editId) {
    // Chế độ chỉnh sửa 1 ca cụ thể (bấm icon bút chì ở từng dòng)
    const item = FlyerState.assignmentsList.find(as => as.id === editId);
    if (!item) return;

    if (idInput) idInput.value = item.id;
    if (multiWrap) multiWrap.classList.add('hidden');
    if (singleWrap) singleWrap.classList.remove('hidden');

    if (title) title.textContent = '✏️ Chỉnh Sửa Ca Phân Lịch';
    if (subtitle) subtitle.textContent = `Cập nhật thông tin ca trực của nhân sự ngày ${activeDate}`;
    if (saveBtnText) saveBtnText.textContent = 'Lưu Thay Đổi';

    const nameDisplay = document.getElementById('assignSingleStaffNameDisplay');
    const singleShift = document.getElementById('assignSingleShiftSelect');
    const singleLoc = document.getElementById('assignSingleLocationInput');
    const singleNote = document.getElementById('assignSingleNoteInput');

    let displayName = item.staffName;
    if (item.role === 'PG' && !displayName.includes('(PG)')) displayName += ' (PG)';
    if (nameDisplay) nameDisplay.textContent = displayName;
    if (singleShift) singleShift.value = item.shiftId || 'sang';
    const singleGroup = document.getElementById('assignSingleGroupSelect');
    if (singleGroup) singleGroup.value = item.groupId || 'g1';
    if (singleLoc) singleLoc.value = item.location || '';
    if (singleNote) singleNote.value = item.note || '';

  } else {
    // Chế độ thêm nhiều nhân viên vào lịch theo checklist (Đúng theo yêu cầu người dùng)
    FlyerState.presetDayIdx = (typeof presetDay === 'number') ? presetDay : null;
    FlyerState.presetGroupId = presetLocation || null;

    if (idInput) idInput.value = '';
    if (multiWrap) multiWrap.classList.remove('hidden');
    if (singleWrap) singleWrap.classList.add('hidden');

    if (title) title.textContent = '👥 Chọn Nhân Viên Thêm Vào Lịch';
    if (subtitle) subtitle.textContent = `Tích chọn nhân viên để thêm nhanh vào Ngày ${activeDate}`;

    // Xác định ca trực mặc định
    let targetShift = presetShift || 'sang';
    if (!presetShift && FlyerState.tableShiftFilter && FlyerState.tableShiftFilter !== 'all') {
      targetShift = FlyerState.tableShiftFilter;
    }

    // Reset ô tìm kiếm và ô thêm nhanh trước khi render
    const searchInput = document.getElementById('assignStaffCheckSearch');
    if (searchInput) searchInput.value = '';
    const quickNameInput = document.getElementById('assignQuickNewStaffName');
    if (quickNameInput) quickNameInput.value = '';

    modal.classList.remove('hidden');
    selectFlyerAddShift(targetShift, false);
    renderMultiStaffChecklist();
    return;
  }

  modal.classList.remove('hidden');
}

function selectFlyerAddGroup(groupId, reRender = true) {
  const input = document.getElementById('assignModalGroupSelect');
  if (input) input.value = groupId;

  const pills = document.querySelectorAll('#flyerAddGroupPills .flyer-group-pill-btn');
  pills.forEach(pill => {
    if (pill.getAttribute('data-group') === groupId) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  if (reRender) {
    renderMultiStaffChecklist();
  }
}

function selectFlyerAddShift(shiftId, reRender = true) {
  const shiftInput = document.getElementById('assignModalShiftSelect');
  if (shiftInput) shiftInput.value = shiftId;

  // Cập nhật giao diện pills
  const pills = document.querySelectorAll('#flyerAddShiftPills .flyer-shift-pill');
  pills.forEach(pill => {
    if (pill.getAttribute('data-shift') === shiftId) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  if (reRender) {
    renderMultiStaffChecklist();
  }
}

function renderMultiStaffChecklist(autoCheckIds = []) {
  const container = document.getElementById('assignStaffChecklistContainer');
  if (!container) return;

  const currentShift = document.getElementById('assignModalShiftSelect')?.value || 'sang';
  const activeNorm = normalizeFlyerDate(FlyerState.tableDateTitle || '22/10');

  // Tập hợp các nhân sự đã có trong ca này của ngày đang xem (chung cả bảng)
  const staffIdsInThisShift = new Set();
  const staffNamesInThisShift = new Set();
  FlyerState.assignmentsList.forEach(as => {
    if (normalizeFlyerDate(as.dateStr || '22/10') === activeNorm &&
        as.shiftId === currentShift) {
      if (as.staffName && String(as.staffName).trim()) {
        staffNamesInThisShift.add(String(as.staffName).trim().toUpperCase());
      } else if (as.staffId) {
        staffIdsInThisShift.add(String(as.staffId));
      }
    }
  });

  if (!Array.isArray(FlyerState.staffList) || FlyerState.staffList.length === 0) {
    FlyerState.staffList = [...DEFAULT_FLYER_STAFF];
  }
  const staffList = FlyerState.staffList;

  if (staffList.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #64748b; padding: 24px 10px; font-size: 0.85rem;">
        Chưa có nhân sự nào trong danh mục. Hãy nhập tên ở ô thêm nhanh phía trên để tạo ngay.
      </div>
    `;
    updateStaffChecklistCount();
    return;
  }

  const autoCheckSet = new Set((autoCheckIds || []).map(id => String(id)));
  const searchQuery = (document.getElementById('assignStaffCheckSearch')?.value || '').toLowerCase().trim();

  let html = '';
  staffList.forEach(s => {
    const normName = String(s.name || '').trim().toUpperCase();
    const isInShift = staffNamesInThisShift.has(normName) || staffIdsInThisShift.has(String(s.id));
    const isAutoChecked = !isInShift && autoCheckSet.has(String(s.id));

    const roleBadge = s.role === 'PG'
      ? '<span class="flyer-badge-role role-pg">PG</span>'
      : '<span class="flyer-badge-role role-nv">NV</span>';

    const groupText = s.group ? `<span class="flyer-staff-check-group">• ${s.group}</span>` : '';
    const inShiftBadge = isInShift
      ? '<span class="flyer-staff-in-shift-badge"><i class="fa-solid fa-check"></i> Đã trong ca</span>'
      : '';

    const isMatch = !searchQuery || s.name.toLowerCase().includes(searchQuery) || (s.group && s.group.toLowerCase().includes(searchQuery));
    const displayStyle = isMatch ? 'display: flex;' : 'display: none;';

    html += `
      <label class="flyer-staff-check-item ${isInShift ? 'in-shift' : ''} ${isAutoChecked ? 'selected' : ''}" style="${displayStyle}" data-id="${s.id}" data-name="${s.name.toLowerCase()}" data-inshift="${isInShift ? '1' : '0'}">
        <input type="checkbox" value="${s.id}" class="flyer-staff-cb" ${isInShift ? 'disabled' : ''} ${isAutoChecked ? 'checked' : ''} onchange="onStaffChecklistChange(this)">
        <div class="flyer-staff-check-info">
          <span class="flyer-staff-check-name">${s.name}</span>
          ${roleBadge}
          ${groupText}
        </div>
        ${inShiftBadge}
      </label>
    `;
  });

  container.innerHTML = html;
  updateStaffChecklistCount();
}

/**
 * Thêm nhanh nhân viên / PG mới ngay trong popup Chọn Nhân Viên Thêm Vào Lịch
 */
function quickAddStaffInAssignmentModal() {
  const nameInput = document.getElementById('assignQuickNewStaffName');
  const roleSelect = document.getElementById('assignQuickNewStaffRole');
  const rawName = nameInput ? nameInput.value.trim().toUpperCase() : '';
  const role = roleSelect ? roleSelect.value : 'NV';

  if (!rawName) {
    if (typeof showToast === 'function') {
      showToast('⚠️ Vui lòng nhập họ tên nhân viên / PG cần thêm!', 'warning');
    }
    if (nameInput) nameInput.focus();
    return;
  }

  // Giữ lại các nhân sự đang được tick chọn hiện tại
  const currentCheckedIds = Array.from(
    document.querySelectorAll('#assignStaffChecklistContainer input.flyer-staff-cb:checked:not(:disabled)')
  ).map(cb => String(cb.value));

  if (!Array.isArray(FlyerState.staffList)) {
    FlyerState.staffList = [...DEFAULT_FLYER_STAFF];
  }

  let targetStaff = FlyerState.staffList.find(s => String(s.name || '').trim().toUpperCase() === rawName);
  if (!targetStaff) {
    targetStaff = {
      id: (role === 'PG' ? 'pg_' : 'nv_') + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: rawName,
      role: role,
      group: 'TÊN NHÓM 1',
      phone: '',
      note: ''
    };
    FlyerState.staffList.unshift(targetStaff);
    saveFlyerStaff(false);
    renderQuickAssignStaffCheckboxes();
    renderFlyerStats();
  }

  if (nameInput) nameInput.value = '';
  const searchInput = document.getElementById('assignStaffCheckSearch');
  if (searchInput) searchInput.value = '';

  if (!currentCheckedIds.includes(String(targetStaff.id))) {
    currentCheckedIds.push(String(targetStaff.id));
  }

  renderMultiStaffChecklist(currentCheckedIds);

  if (typeof showToast === 'function') {
    showToast(`✅ Đã thêm & tích chọn "${rawName}"! Bấm "Thêm Vào Lịch" để hoàn tất.`, 'success');
  }
}

function onStaffChecklistChange(checkbox) {
  if (checkbox) {
    const item = checkbox.closest('.flyer-staff-check-item');
    if (item) {
      if (checkbox.checked) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    }
  }
  updateStaffChecklistCount();
}

function updateStaffChecklistCount() {
  const checkedCbs = document.querySelectorAll('#assignStaffChecklistContainer input.flyer-staff-cb:checked:not(:disabled)');
  const count = checkedCbs.length;

  const countBadge = document.getElementById('assignSelectedCountBadge');
  if (countBadge) {
    countBadge.textContent = `Đã chọn: ${count} nhân sự`;
  }

  const saveBtnText = document.getElementById('btnSaveAssignmentModalText');
  if (saveBtnText) {
    saveBtnText.textContent = count > 0 ? `Thêm (${count}) Nhân Viên Vào Lịch` : 'Thêm Vào Lịch';
  }
}

function selectAllStaffChecklist(isSelectAll) {
  const container = document.getElementById('assignStaffChecklistContainer');
  if (!container) return;

  const items = container.querySelectorAll('.flyer-staff-check-item');
  items.forEach(item => {
    // Chỉ chọn những mục đang hiển thị và chưa có trong ca (không bị disabled)
    if (item.style.display !== 'none') {
      const cb = item.querySelector('input.flyer-staff-cb:not(:disabled)');
      if (cb) {
        cb.checked = isSelectAll;
        if (isSelectAll) {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      }
    }
  });

  updateStaffChecklistCount();
}

function filterMultiStaffChecklist() {
  const query = (document.getElementById('assignStaffCheckSearch')?.value || '').toLowerCase().trim();
  const container = document.getElementById('assignStaffChecklistContainer');
  if (!container) return;

  const items = container.querySelectorAll('.flyer-staff-check-item');
  items.forEach(item => {
    const name = item.getAttribute('data-name') || '';
    if (!query || name.includes(query)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

function deleteFlyerGroupShift(groupKey) {
  const itemsToDelete = FlyerState.assignmentsList.filter(item => {
    const locKey = (item.location || item.groupName || '').trim().toLowerCase();
    return `${item.dayIdx}__${item.shiftId}__${locKey}` === groupKey;
  });

  if (itemsToDelete.length === 0) return;

  const count = itemsToDelete.length;
  const shiftName = itemsToDelete[0].shiftName || '';
  const dayName = itemsToDelete[0].dayName || '';
  const confirmMsg = `Bạn có chắc muốn xóa ca trực ${dayName} (${shiftName}) gồm ${count} nhân viên khỏi bảng?`;
  if (typeof confirm === 'function' && !confirm(confirmMsg)) return;

  const idsToDelete = new Set(itemsToDelete.map(it => it.id));
  FlyerState.assignmentsList = FlyerState.assignmentsList.filter(it => !idsToDelete.has(it.id));

  // Lưu cục bộ và LƯU NGAY LẬP TỨC LÊN FIREBASE
  saveFlyerAssignments(false);

  renderFlyerStats();
  renderFlyerTable();

  if (typeof showToast === 'function') {
    showToast(`Đã xóa ca trực ${dayName} (${shiftName})!`, 'info');
  }
}

function closeFlyerAssignmentModal() {
  const modal = document.getElementById('modalFlyerAssignmentForm');
  if (modal) modal.classList.add('hidden');
}

function saveFlyerAssignmentFromModal() {
  const idInput = document.getElementById('assignmentEditId');
  const editId = idInput ? idInput.value : '';

  if (editId) {
    // Cập nhật ca đã có
    const item = FlyerState.assignmentsList.find(as => as.id === editId);
    if (item) {
      const singleShift = document.getElementById('assignSingleShiftSelect');
      const singleLoc = document.getElementById('assignSingleLocationInput');
      const singleNote = document.getElementById('assignSingleNoteInput');

      const shiftId = singleShift ? singleShift.value : item.shiftId;
      const shiftInfo = FLYER_SHIFTS.find(s => s.id === shiftId) || { name: 'Buổi Sáng', time: '07:30 - 09:30' };

      let defaultShiftTime = '7:00';
      if (shiftId === 'cangay') defaultShiftTime = 'CẢ NGÀY';
      else if (shiftId === 'sang') defaultShiftTime = '7:00';
      else if (shiftId === 'chieu') defaultShiftTime = '15:00';
      else if (shiftId === 'toi') defaultShiftTime = '19:00';

      item.shiftId = shiftId;
      item.shiftName = shiftInfo.name;
      item.shiftTime = defaultShiftTime;

      item.groupId = 'all';
      item.groupName = 'Chung';

      if (singleLoc && singleLoc.value.trim()) item.location = singleLoc.value.trim();
      if (singleNote) item.note = singleNote.value.trim();

      saveFlyerAssignments(false);
      closeFlyerAssignmentModal();
      renderFlyerStats();
      renderFlyerTable();

      if (typeof showToast === 'function') {
        showToast(`✅ Đã cập nhật ca cho ${item.staffName}!`, 'success');
      }
    }
    return;
  }

  // Thêm nhanh nhiều nhân viên đã tích chọn từ checklist
  const checkedCbs = Array.from(document.querySelectorAll('#assignStaffChecklistContainer input.flyer-staff-cb:checked:not(:disabled)'));
  if (checkedCbs.length === 0) {
    if (typeof showToast === 'function') {
      showToast('⚠️ Vui lòng tích chọn ít nhất 1 nhân sự để thêm vào lịch!', 'warning');
    }
    return;
  }

  const shiftSelect = document.getElementById('assignModalShiftSelect');
  const shiftId = shiftSelect ? shiftSelect.value : 'sang';


  const dateStr = (FlyerState.tableDateTitle || '22/10').trim();
  const dateKey = FlyerState.currentDateKey || '2026-10-22';
  const activeNorm = normalizeFlyerDate(dateStr);

  const shiftInfo = FLYER_SHIFTS.find(s => s.id === shiftId) || { name: 'Buổi Sáng', time: '07:30 - 09:30' };
  let defaultShiftTime = '7:00';
  let shiftDisplayName = 'Ca Sáng (7:00)';
  if (shiftId === 'cangay') { defaultShiftTime = 'CẢ NGÀY'; shiftDisplayName = 'CẢ NGÀY'; }
  else if (shiftId === 'sang') { defaultShiftTime = '7:00'; shiftDisplayName = 'Ca Sáng (7:00)'; }
  else if (shiftId === 'chieu') { defaultShiftTime = '15:00'; shiftDisplayName = 'Ca Chiều (15:00)'; }
  else if (shiftId === 'toi') { defaultShiftTime = '19:00'; shiftDisplayName = 'Ca Tối (19:00)'; }

  // Tìm tuyến đường hiện tại của ca này (dùng chung cho toàn bộ nhân sự trong ca)
  const existingShiftItems = FlyerState.assignmentsList.filter(as => {
    return normalizeFlyerDate(as.dateStr || '22/10') === activeNorm &&
      as.shiftId === shiftId;
  });
  const defaultLocation = (shiftId === 'chieu' ? 'Tuyến Công Viên & Bến Xe' : 'Tuyến Chợ & Khu Dân Cư');
  const commonLocation = existingShiftItems.find(it => it.location && it.location.trim())?.location || defaultLocation;

  const weekKey = getFlyerWeekKey();
  const staffPool = (Array.isArray(FlyerState.staffList) && FlyerState.staffList.length > 0)
    ? FlyerState.staffList
    : DEFAULT_FLYER_STAFF;

  // Tính thứ trong tuần theo ngày đang chọn (hoặc theo ô đã chọn từ bảng ma trận)
  let computedDayIdx = (typeof FlyerState.presetDayIdx === 'number' && FlyerState.presetDayIdx >= 0 && FlyerState.presetDayIdx <= 6)
    ? FlyerState.presetDayIdx
    : 2;
  if (typeof FlyerState.presetDayIdx !== 'number') {
    const mDate = activeNorm.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (mDate) {
      const dNum = parseInt(mDate[1], 10);
      const mNum = parseInt(mDate[2], 10) - 1;
      const yNum = FlyerState.calYear || 2026;
      const jsDay = new Date(yNum, mNum, dNum).getDay();
      if (!isNaN(jsDay)) {
        computedDayIdx = (jsDay + 6) % 7;
      }
    }
  }
  const dayObj = FLYER_DAYS[computedDayIdx] || FLYER_DAYS[0];
  const targetGroupId = FlyerState.presetGroupId || 'all';
  const targetGroupObj = FlyerState.groupList.find(g => g.id === targetGroupId);
  const targetGroupName = targetGroupObj ? targetGroupObj.name : 'Chung';

  let addedCount = 0;

  checkedCbs.forEach(cb => {
    const staffId = cb.value;
    const staff = staffPool.find(s => String(s.id) === String(staffId));
    if (!staff) return;

    const newAssignment = {
      id: 'as_' + Date.now() + '_' + addedCount + '_' + Math.random().toString(36).substr(2, 6),
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role || 'NV',
      phone: staff.phone || '',
      dayIdx: computedDayIdx,
      dayName: dayObj.name,
      dayShort: dayObj.short,
      shiftId,
      shiftName: shiftInfo.name,
      shiftTime: defaultShiftTime,
      groupId: targetGroupId,
      groupName: targetGroupName,
      location: commonLocation,
      note: '500 tờ',
      dateStr,
      dateKey,
      weekKey
    };

    FlyerState.assignmentsList.push(newAssignment);
    addedCount++;
  });

  FlyerState.presetDayIdx = null;
  FlyerState.presetGroupId = null;

  // Nếu bộ lọc hiện tại đang ẩn ca hoặc vai trò vừa thêm, tự động mở bộ lọc để hiển thị nhân viên vừa thêm
  if (FlyerState.tableShiftFilter && FlyerState.tableShiftFilter !== 'all' && FlyerState.tableShiftFilter !== shiftId) {
    FlyerState.tableShiftFilter = 'all';
    const shiftFilterEl = document.getElementById('flyerTableShiftFilter');
    if (shiftFilterEl) shiftFilterEl.value = 'all';
  }
  if (FlyerState.tableRoleFilter && FlyerState.tableRoleFilter !== 'all') {
    FlyerState.tableRoleFilter = 'all';
    const roleFilterEl = document.getElementById('flyerTableRoleFilter');
    if (roleFilterEl) roleFilterEl.value = 'all';
  }
  if (FlyerState.tableSearchQuery) {
    FlyerState.tableSearchQuery = '';
    const searchInputEl = document.getElementById('flyerTableSearchInput');
    if (searchInputEl) searchInputEl.value = '';
  }

  // Tự động lưu ngay lập tức lên Firebase và LocalStorage
  saveFlyerAssignments(false);

  closeFlyerAssignmentModal();
  renderFlyerStats();
  renderFlyerTable();

  if (typeof showToast === 'function') {
    showToast(`✅ Đã thêm thành công ${addedCount} nhân viên vào ${shiftDisplayName} ngày ${dateStr}!`, 'success');
  }
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

/**
 * Xóa toàn bộ lịch phát tờ rơi của ngày hôm đó
 * Đồng bộ ngay lập tức lên Firebase và LocalStorage
 */
function clearCurrentDayFlyerSchedule() {
  const dateTitle = (FlyerState.tableDateTitle || '22/10').trim();
  const activeNorm = normalizeFlyerDate(dateTitle);

  // Lấy danh sách các ca của ngày này
  const itemsInDay = FlyerState.assignmentsList.filter(as => {
    return normalizeFlyerDate(as.dateStr || '22/10') === activeNorm;
  });

  if (itemsInDay.length === 0) {
    if (typeof showToast === 'function') {
      showToast(`Lịch Ngày ${dateTitle} hiện tại chưa có ca nào để xóa!`, 'info');
    }
    return;
  }

  const confirmMsg = `Bạn có chắc chắn muốn XÓA TOÀN BỘ ${itemsInDay.length} ca phân lịch của NGÀY ${dateTitle}?\n\n⚠️ Lưu ý: Thao tác này sẽ đồng bộ ngay lập tức lên Firebase và xóa sạch lịch ngày ${dateTitle} (các ngày khác vẫn giữ nguyên 100%).`;
  if (typeof confirm === 'function' && !confirm(confirmMsg)) {
    return;
  }

  // Giữ lại toàn bộ ca của các ngày khác
  FlyerState.assignmentsList = FlyerState.assignmentsList.filter(as => {
    return normalizeFlyerDate(as.dateStr || '22/10') !== activeNorm;
  });

  // Tự động lưu ngay lập tức lên Firebase và LocalStorage
  saveFlyerAssignments(false);

  renderFlyerStats();
  renderFlyerTable();

  if (typeof showToast === 'function') {
    showToast(`🗑 Đã xóa sạch ${itemsInDay.length} ca phân lịch của NGÀY ${dateTitle}!`, 'success');
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
        const slotItems = weekAssignments.filter(as =>
          as.dayIdx === dayIdx &&
          as.shiftId === shift.id &&
          (as.groupId === group.id || (gIdx === 0 && (!as.groupId || as.groupId === 'all')) || (as.location && as.location.includes(group.name)))
        );

        html += `
          <div class="flyer-group-slot">
            <div class="flyer-group-header">
              <span class="flyer-group-tag group-${(gIdx % 4) + 1}" style="color: ${group.color};">
                <i class="fa-solid fa-users-viewfinder"></i> ${group.name}
              </span>
              <button type="button" class="flyer-btn-add-mini" title="Thêm nhanh" onclick="openFlyerAssignmentModal(null, ${dayIdx}, '${shift.id}', '${group.id}')">
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
  const dateStr = (FlyerState.tableDateTitle || '22/10').trim();
  const dateKey = FlyerState.currentDateKey || generateDateKeyFromStr(dateStr);
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
            id: 'as_' + Date.now() + '_' + addedCount + '_' + Math.random().toString(36).substr(2, 4),
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
            dateStr,
            dateKey,
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
  const dateStr = (FlyerState.tableDateTitle || '22/10').trim();
  const dateKey = FlyerState.currentDateKey || generateDateKeyFromStr(dateStr);

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
            id: 'as_' + Date.now() + '_' + totalAssigned + '_' + Math.random().toString(36).substr(2, 4),
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
            dateStr: dayIdx === 0 ? dateStr : `${dayInfo.short}`,
            dateKey,
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

  saveFlyerAssignments(true);
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
  const selectedOpt = (groupSelect && groupSelect.selectedIndex >= 0)
    ? groupSelect.options[groupSelect.selectedIndex]
    : null;
  const groupVal = selectedOpt ? selectedOpt.text.split(' (')[0] : 'Nhóm 1';
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

  saveFlyerStaff(true);
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

  saveFlyerStaff(true);
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

let lastFlyerCanvas = null;
let lastFlyerBlob = null;
let lastFlyerDataUrl = '';

function closeFlyerImagePreviewModal() {
  const modal = document.getElementById('modalFlyerImagePreview');
  if (modal) modal.classList.add('hidden');
}

function updateFlyerCopyStatus(isSuccess) {
  const banner = document.getElementById('flyerCopyStatusBanner');
  const icon = document.getElementById('flyerCopyStatusIcon');
  const text = document.getElementById('flyerCopyStatusText');
  if (!banner || !icon || !text) return;

  if (isSuccess) {
    banner.style.background = '#ecfdf5';
    banner.style.borderColor = '#10b981';
    banner.style.color = '#065f46';
    icon.className = 'fa-solid fa-circle-check';
    icon.style.color = '#10b981';
    text.innerHTML = 'ĐÃ TỰ ĐỘNG SAO CHÉP ẢNH VÀO CLIPBOARD! Mở Zalo và nhấn <strong>Ctrl + V</strong> (hoặc Cmd + V) để gửi ngay.';
  } else {
    banner.style.background = '#fffbeb';
    banner.style.borderColor = '#f59e0b';
    banner.style.color = '#92400e';
    icon.className = 'fa-solid fa-triangle-exclamation';
    icon.style.color = '#f59e0b';
    text.innerHTML = 'Trình duyệt chưa cấp quyền tự copy. Bạn hãy <strong>nhấp chuột phải vào ảnh chọn "Sao chép hình ảnh"</strong> hoặc bấm "Sao chép lại".';
  }
}

async function copyFlyerImageToClipboard() {
  if (!lastFlyerBlob && lastFlyerCanvas) {
    await new Promise((resolve) => {
      lastFlyerCanvas.toBlob(blob => {
        lastFlyerBlob = blob;
        resolve();
      }, 'image/png');
    });
  }

  if (lastFlyerBlob && navigator.clipboard && navigator.clipboard.write) {
    try {
      const item = new ClipboardItem({ 'image/png': lastFlyerBlob });
      await navigator.clipboard.write([item]);
      updateFlyerCopyStatus(true);
      if (typeof showToast === 'function') {
        showToast('📋 Đã sao chép ảnh vào bộ nhớ tạm! Nhấn Ctrl+V để dán.', 'success');
      }
      return true;
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  }

  updateFlyerCopyStatus(false);
  if (typeof showToast === 'function') {
    showToast('⚠️ Không thể tự động sao chép. Vui lòng nhấp chuột phải vào ảnh chọn "Sao chép hình ảnh"!', 'warning');
  }
  return false;
}

function downloadFlyerImageManual() {
  if (!lastFlyerDataUrl) return;
  const link = document.createElement('a');
  const safeDate = (FlyerState.tableDateTitle || '22-10').replace(/[\/\\]/g, '-');
  link.download = `Bang_Phan_Lich_To_Roi_Ngay_${safeDate}.png`;
  link.href = lastFlyerDataUrl;
  link.click();
  if (typeof showToast === 'function') {
    showToast('💾 Đã tải file ảnh về máy!', 'success');
  }
}

async function exportFlyerScheduleImage() {
  if (typeof html2canvas === 'undefined') {
    if (typeof showToast === 'function') showToast('Không tìm thấy thư viện html2canvas!', 'error');
    return;
  }

  const sourceElement = document.getElementById('flyerScheduleListTable');
  if (!sourceElement) return;

  if (typeof showToast === 'function') {
    showToast('📸 Đang tạo ảnh chuẩn Desktop & tự động sao chép...', 'info');
  }

  // 1. Tạo container ẩn giả lập màn hình Desktop chuẩn (rộng 1050px)
  // Dù người dùng đang mở trên điện thoại hay máy tính, ảnh xuất ra luôn ở chế độ Desktop
  const desktopWrapper = document.createElement('div');
  desktopWrapper.style.position = 'fixed';
  desktopWrapper.style.left = '-9999px';
  desktopWrapper.style.top = '0';
  desktopWrapper.style.width = '1050px';
  desktopWrapper.style.minWidth = '1050px';
  desktopWrapper.style.maxWidth = '1050px';
  desktopWrapper.style.background = '#ffffff';
  desktopWrapper.style.padding = '24px 20px';
  desktopWrapper.style.boxSizing = 'border-box';
  desktopWrapper.style.zIndex = '-9999';
  desktopWrapper.style.fontFamily = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  // 2. Clone bảng sang desktopWrapper
  const cloneTable = sourceElement.cloneNode(true);
  cloneTable.classList.add('is-exporting');

  // Loại bỏ tất cả nút sửa / xóa trong cột thao tác của clone
  cloneTable.querySelectorAll('.no-export').forEach(el => el.remove());

  // Thiết lập độ rộng cột Desktop chuẩn mẫu cho cloneTable
  cloneTable.style.width = '100%';
  cloneTable.style.minWidth = '1000px';
  cloneTable.style.maxWidth = '100%';
  cloneTable.style.borderCollapse = 'collapse';
  cloneTable.style.margin = '0 auto';
  cloneTable.style.background = '#ffffff';

  desktopWrapper.appendChild(cloneTable);
  document.body.appendChild(desktopWrapper);

  try {
    // 3. Render canvas bằng html2canvas với chuẩn kích thước Desktop (windowWidth: 1200)
    const canvas = await html2canvas(desktopWrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200,
      width: 1050
    });

    // Xóa ngay desktopWrapper khỏi DOM sau khi chụp
    if (document.body.contains(desktopWrapper)) {
      document.body.removeChild(desktopWrapper);
    }

    lastFlyerCanvas = canvas;
    lastFlyerDataUrl = canvas.toDataURL('image/png');

    // Hiển thị ảnh vào modal preview
    const previewImg = document.getElementById('flyerPreviewImg');
    if (previewImg) {
      previewImg.src = lastFlyerDataUrl;
    }

    const modal = document.getElementById('modalFlyerImagePreview');
    if (modal) {
      modal.classList.remove('hidden');
    }

    // Tự động sao chép ảnh vào clipboard (KHÔNG tự lưu tải về máy)
    canvas.toBlob(async (blob) => {
      lastFlyerBlob = blob;
      if (blob && navigator.clipboard && navigator.clipboard.write) {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          updateFlyerCopyStatus(true);
          if (typeof showToast === 'function') {
            showToast('📋 Đã tự động sao chép ảnh chuẩn Desktop! Bạn có thể dán (Ctrl+V) vào Zalo ngay.', 'success');
          }
        } catch (clipErr) {
          console.warn('Auto clipboard write prevented:', clipErr);
          updateFlyerCopyStatus(false);
        }
      } else {
        updateFlyerCopyStatus(false);
      }
    }, 'image/png');

  } catch (err) {
    if (document.body.contains(desktopWrapper)) {
      document.body.removeChild(desktopWrapper);
    }
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
  const dateTitle = (FlyerState.tableDateTitle || '22/10').trim();
  const weekKey = getFlyerWeekKey();
  const weekAssignments = FlyerState.assignmentsList.filter(as => as.weekKey === weekKey || !as.weekKey);

  let text = `📢 BẢNG PHÂN LỊCH TỜ RƠI • NGÀY ${dateTitle}\n`;
  text += `════════════════════════════════════\n\n`;

  const shiftKeys = ['cangay', 'sang', 'chieu', 'toi'];
  shiftKeys.forEach(shiftId => {
    const shiftItems = weekAssignments.filter(it => it.shiftId === shiftId);
    if (shiftItems.length === 0) return;

    let defaultTime = '7:00';
    let shiftName = 'CA SÁNG';
    if (shiftId === 'cangay') {
      defaultTime = 'CẢ NGÀY';
      shiftName = 'CẢ NGÀY';
    } else if (shiftId === 'sang') {
      defaultTime = '7:00';
      shiftName = 'CA SÁNG';
    } else if (shiftId === 'chieu') {
      defaultTime = '15:00';
      shiftName = 'CA CHIỀU';
    } else if (shiftId === 'toi') {
      defaultTime = '19:00';
      shiftName = 'CA TỐI';
    }

    const timeHeader = shiftId === 'cangay' ? `CẢ NGÀY ${dateTitle}` : `${defaultTime} NGÀY ${dateTitle}`;
    text += `⏰ ${shiftName} (${timeHeader}):\n`;
    shiftItems.forEach((item, idx) => {
      let displayName = item.staffName.trim().toUpperCase();
      if (item.role === 'PG' && !displayName.includes('(PG)')) {
        displayName += ' (PG)';
      }
      text += `  ${idx + 1}. ${displayName}\n`;
    });

    const shiftLoc = shiftItems.find(it => it.location && it.location.trim())?.location;
    if (shiftLoc) {
      text += `  📍 Tuyến đường: ${shiftLoc}\n`;
    }
    text += `\n`;
  });

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

window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    flushPendingFlyerSave();
  }
});
window.addEventListener('pagehide', flushPendingFlyerSave);

// Cho phép gọi các hàm toàn cục từ HTML onclick
window.flushPendingFlyerSave = flushPendingFlyerSave;
window.syncFlyerFromFirebase = syncFlyerFromFirebase;
window.openFlyerAssignmentModal = openFlyerAssignmentModal;
window.closeFlyerAssignmentModal = closeFlyerAssignmentModal;
window.saveFlyerAssignmentFromModal = saveFlyerAssignmentFromModal;
window.selectFlyerAddShift = selectFlyerAddShift;
window.selectFlyerAddGroup = selectFlyerAddGroup;
window.switchFlyerGroup = switchFlyerGroup;
window.promptEditCurrentGroupName = promptEditCurrentGroupName;
window.promptEditGroupName = promptEditGroupName;
window.openEditGroupTitleModal = openEditGroupTitleModal;
window.closeEditGroupTitleModal = closeEditGroupTitleModal;
if (typeof selectRenameGroupTab === 'function') {
  window.selectRenameGroupTab = selectRenameGroupTab;
}
window.setQuickGroupName = setQuickGroupName;
window.confirmSaveGroupTitleModal = confirmSaveGroupTitleModal;
window.copyFlyerScheduleFromGroup = copyFlyerScheduleFromGroup;
window.renderFlyerGroupTabs = renderFlyerGroupTabs;
window.renderMultiStaffChecklist = renderMultiStaffChecklist;
window.quickAddStaffInAssignmentModal = quickAddStaffInAssignmentModal;
window.onStaffChecklistChange = onStaffChecklistChange;
window.selectAllStaffChecklist = selectAllStaffChecklist;
window.filterMultiStaffChecklist = filterMultiStaffChecklist;
window.deleteFlyerAssignment = deleteFlyerAssignment;
window.deleteFlyerGroupShift = deleteFlyerGroupShift;
window.resetFlyerToSample = resetFlyerToSample;
window.openFlyerShiftLocationPrompt = openFlyerShiftLocationPrompt;
window.openFlyerLocationModal = openFlyerLocationModal;
window.closeFlyerLocationModal = closeFlyerLocationModal;
window.insertIconToFlyerLocation = insertIconToFlyerLocation;
window.applyFlyerLocationTemplate = applyFlyerLocationTemplate;
window.saveFlyerLocationFromModal = saveFlyerLocationFromModal;
window.formatFlyerLocationHtml = formatFlyerLocationHtml;
window.openFlyerStaffModal = openFlyerStaffModal;
window.closeFlyerStaffModal = closeFlyerStaffModal;
window.openFlyerAutoScheduleModal = openFlyerAutoScheduleModal;
window.exportFlyerScheduleImage = exportFlyerScheduleImage;
window.closeFlyerImagePreviewModal = closeFlyerImagePreviewModal;
window.copyFlyerImageToClipboard = copyFlyerImageToClipboard;
window.downloadFlyerImageManual = downloadFlyerImageManual;
window.toggleFlyerCalendar = toggleFlyerCalendar;
window.changeFlyerCalMonth = changeFlyerCalMonth;
window.selectFlyerDate = selectFlyerDate;
window.selectFlyerDateToday = selectFlyerDateToday;
window.selectFlyerSample22 = selectFlyerSample22;
window.copyFlyerScheduleFromDate = copyFlyerScheduleFromDate;
window.promptCopyFromAnyDate = promptCopyFromAnyDate;
window.clearCurrentDayFlyerSchedule = clearCurrentDayFlyerSchedule;
window.saveFlyerToFirebase = saveFlyerToFirebase;
window.FlyerState = FlyerState;
