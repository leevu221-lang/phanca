/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - HỆ THỐNG PHÂN CA HÀNH CHÍNH (KHO & THU NGÂN)
 * Bảng tính: 1841 - CA HÀNH CHÍNH
 * Sheet lưu trữ chính: "phanca"
 * Hỗ trợ Web App API đồng bộ thời gian thực với GitHub Pages
 * =========================================================================
 */

// Tên sheet mục tiêu theo yêu cầu
const TARGET_SHEET_NAME = "phanca";

// Danh sách nhân viên chuẩn
const DEFAULT_STAFF = [
  { name: 'NHẠN', group: 1, defaultOff: ['T3', 'CN'] },
  { name: 'MẠNH', group: 1, defaultOff: ['T2', 'CN'] },
  { name: 'MI', group: 1, defaultOff: ['T4', 'CN'] },
  { name: 'MỸ', group: 1, defaultOff: ['T4', 'CN'] },
  { name: 'GIANG Ý', group: 1, defaultOff: ['T5', 'CN'] },
  { name: 'NGỌC ANH', group: 1, defaultOff: ['T6', 'CN'] },
  { name: 'THẮM', group: 2, defaultOff: ['T2', 'CN'] },
  { name: 'MY', group: 2, defaultOff: ['T7', 'CN'] },
  { name: 'PHÚC', group: 2, defaultOff: ['T3', 'CN'] },
  { name: 'ĐẠI', group: 2, defaultOff: ['T7', 'CN'] },
  { name: 'LÂM Ý', group: 2, defaultOff: ['T6', 'CN'] }
];

const DEFAULT_MONTHS = ['THÁNG 09', 'THÁNG 10', 'THÁNG 11', 'THÁNG 12'];
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const WEEKS = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];

/**
 * Menu tự động khi mở Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🗓️ Phân Ca Hành Chính')
    .addItem('🌐 Mở Web Phân Ca (GitHub)', 'openWebAppUrlDialog')
    .addSeparator()
    .addItem('🔄 Khởi Tạo / Đồng Bộ Sheet "phanca"', 'initializePhanCaSheet')
    .addItem('🏷️ Chuẩn Hóa Tên "Ý" -> Giang Ý & Lâm Ý', 'standardizeStaffNames')
    .addSeparator()
    .addItem('ℹ️ Hướng Dẫn & Cài Đặt Web App', 'showDeploymentGuide')
    .addToUi();
}

/**
 * Tạo hoặc lấy Sheet "phanca"
 */
function getOrCreateTargetSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(TARGET_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TARGET_SHEET_NAME);
  }
  return sheet;
}

/**
 * Khởi tạo dữ liệu mẫu đẹp mắt cho Sheet "phanca" nếu chưa có dữ liệu
 */
function initializePhanCaSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateTargetSheet();

  // Kiểm tra nếu sheet "HC mới" có dữ liệu mẫu thì có thể sao chép qua
  const srcSheet = ss.getSheetByName('HC mới') || ss.getSheetByName('Trang tính1');

  if (sheet.getLastRow() < 4) {
    if (srcSheet && srcSheet.getLastRow() >= 10) {
      // Sao chép từ sheet gốc sang "phanca"
      const range = srcSheet.getDataRange();
      const vals = range.getValues();
      sheet.clear();
      sheet.getRange(1, 1, vals.length, vals[0].length).setValues(vals);
    } else {
      // Tự xây dựng khung bảng chuẩn 4 tháng, 4 tuần
      buildStandardTemplate(sheet);
    }
    formatSheetPhanCa(sheet);
  }

  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert('Thông báo', `Sheet "${TARGET_SHEET_NAME}" đã sẵn sàng và được đồng bộ định dạng!`, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Xây dựng cấu trúc chuẩn cho sheet phanca
 */
function buildStandardTemplate(sheet) {
  sheet.clear();
  let currentRow = 2;

  DEFAULT_MONTHS.forEach((monthName) => {
    // Dòng tháng và tuần
    sheet.getRange(currentRow, 2).setValue(monthName).setFontWeight('bold').setFontSize(11);
    sheet.getRange(currentRow, 4).setValue('Tuần 1').setFontWeight('bold');
    sheet.getRange(currentRow, 13).setValue('Tuần 2').setFontWeight('bold');
    sheet.getRange(currentRow, 22).setValue('Tuần 3').setFontWeight('bold');
    sheet.getRange(currentRow, 31).setValue('Tuần 4').setFontWeight('bold');

    // Dòng Header Nhân Viên và Các Thứ (T2 -> CN)
    const headerRow = currentRow + 2;
    [4, 13, 22, 31].forEach((col) => {
      sheet.getRange(headerRow, col).setValue('NHÂN VIÊN').setFontWeight('bold');
      DAYS.forEach((day, dIdx) => {
        sheet.getRange(headerRow, col + 1 + dIdx).setValue(day).setFontWeight('bold');
      });
    });

    // Dòng từng nhân viên
    let empRow = headerRow + 1;
    DEFAULT_STAFF.forEach((staff) => {
      [4, 13, 22, 31].forEach((col) => {
        sheet.getRange(empRow, col).setValue(staff.name);
        // Đặt dấu ngày nghỉ mặc định 'x'
        DAYS.forEach((day, dIdx) => {
          if (staff.defaultOff.includes(day)) {
            sheet.getRange(empRow, col + 1 + dIdx).setValue('x');
          }
        });
      });
      empRow++;
    });

    currentRow = empRow + 2; // Khoảng cách giữa các tháng
  });
}

/**
 * Định dạng thẩm mỹ Pastel Xanh Dương cho Sheet "phanca"
 */
function formatSheetPhanCa(sheet) {
  const maxRow = sheet.getLastRow();
  const maxCol = Math.max(sheet.getLastColumn(), 38);
  if (maxRow < 2) return;

  const dataRange = sheet.getRange(1, 1, maxRow, maxCol);
  dataRange.setFontFamily('Arial');

  // Quét màu các ô ca
  const vals = dataRange.getValues();
  for (let r = 0; r < vals.length; r++) {
    for (let c = 0; c < vals[r].length; c++) {
      const v = String(vals[r][c] || '').trim().toUpperCase();
      const cell = sheet.getRange(r + 1, c + 1);

      if (v === 'TN') {
        cell.setBackground('#dbeafe').setFontColor('#0284c7').setFontWeight('bold').setHorizontalAlignment('center');
      } else if (v === 'KHO') {
        cell.setBackground('#dcfce7').setFontColor('#15803d').setFontWeight('bold').setHorizontalAlignment('center');
      } else if (v === 'X') {
        cell.setBackground('#fee2e2').setFontColor('#dc2626').setFontWeight('bold').setHorizontalAlignment('center');
      } else if (v === 'HC') {
        cell.setBackground('#ede9fe').setFontColor('#6d28d9').setFontWeight('bold').setHorizontalAlignment('center');
      }
    }
  }

  // Tinh chỉnh chiều cao các dòng cho cân xứng, gọn gàng
  try {
    sheet.setRowHeights(1, maxRow, 25);
  } catch (e) {}
}

/**
 * =========================================================================
 * API WEB APP (doGet & doPost) để Website GitHub kết nối trực tiếp
 * =========================================================================
 */

/**
 * Xử lý GET request: Lấy dữ liệu phân ca gửi cho Website GitHub
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'getData';

    if (action === 'ping') {
      return createJsonResponse({ status: 'ok', time: new Date().toISOString() });
    }

    if (action === 'getData') {
      const data = extractAllScheduleData();
      return createJsonResponse({
        status: 'success',
        sheet: TARGET_SHEET_NAME,
        updatedAt: new Date().toISOString(),
        months: data.months,
        staff: data.staff,
        schedule: data.schedule
      });
    }

    return createJsonResponse({ status: 'error', message: 'Hành động không hợp lệ' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.message, stack: err.stack });
  }
}

/**
 * Xử lý POST request: Nhận phân ca từ Website GitHub và lưu vào sheet "phanca"
 */
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.data) {
      payload = JSON.parse(e.parameter.data);
    }

    const action = payload.action || 'saveSchedule';

    if (action === 'saveSchedule') {
      const result = saveScheduleToSheet(payload);
      return createJsonResponse(result);
    }

    return createJsonResponse({ status: 'error', message: 'Action không hợp lệ: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: 'Lỗi ghi dữ liệu: ' + err.message });
  }
}

/**
 * Tạo kết quả JSON chuẩn (CORS enabled)
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Trích xuất toàn bộ dữ liệu phân ca từ Sheet "phanca"
 */
function extractAllScheduleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(TARGET_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 4) {
    // Nếu sheet phanca trống, dùng tạm sheet HC mới hoặc Trang tính1
    sheet = ss.getSheetByName('HC mới') || ss.getSheetByName('Trang tính1') || sheet;
  }

  if (!sheet) {
    return { months: DEFAULT_MONTHS, staff: DEFAULT_STAFF.map(s => s.name), schedule: {} };
  }

  const maxRow = sheet.getLastRow();
  const maxCol = Math.max(sheet.getLastColumn(), 38);
  const values = sheet.getRange(1, 1, maxRow, maxCol).getValues();

  // Xác định vị trí các tháng
  const monthsFound = [];
  for (let r = 0; r < maxRow; r++) {
    const val = String(values[r][1] || '').trim().toUpperCase(); // Cột B
    if (val.startsWith('THÁNG') || val.startsWith('THANG')) {
      // Tìm dòng header nhân viên
      let hRow = r + 2;
      for (let h = r; h < Math.min(r + 5, maxRow); h++) {
        const dVal = String(values[h][3] || '').trim().toUpperCase(); // Cột D
        if (dVal.includes('NHÂN VIÊN') || dVal.includes('NHAN VIEN')) {
          hRow = h;
          break;
        }
      }

      // Quét nhân viên
      const staffList = [];
      let endRow = hRow + 1;
      for (let e = hRow + 1; e < Math.min(hRow + 18, maxRow); e++) {
        const empName = String(values[e][3] || '').trim();
        if (empName && !empName.toUpperCase().startsWith('THÁNG')) {
          staffList.push(empName);
          endRow = e;
        } else {
          break;
        }
      }

      monthsFound.push({
        name: val,
        monthRow: r + 1,
        headerRow: hRow + 1,
        startEmpRow: hRow + 2,
        endEmpRow: endRow + 1,
        staff: staffList
      });
    }
  }

  // Cột các tuần
  const weekDefs = [
    { weekIndex: 1, weekName: 'Tuần 1', nameCol: 4, dayStartCol: 5 },
    { weekIndex: 2, weekName: 'Tuần 2', nameCol: 13, dayStartCol: 14 },
    { weekIndex: 3, weekName: 'Tuần 3', nameCol: 22, dayStartCol: 23 },
    { weekIndex: 4, weekName: 'Tuần 4', nameCol: 31, dayStartCol: 32 }
  ];

  const scheduleResult = {};

  monthsFound.forEach((m) => {
    scheduleResult[m.name] = {};

    weekDefs.forEach((w) => {
      scheduleResult[m.name][w.weekName] = {};

      for (let r = m.startEmpRow - 1; r < m.endEmpRow; r++) {
        let empName = String(values[r][w.nameCol - 1] || values[r][3] || '').trim();
        if (!empName) continue;

        // Chuẩn hóa nếu có 2 nhân viên tên "Ý"
        if (empName === 'Ý') {
          empName = (r - m.startEmpRow < 6) ? 'GIANG Ý' : 'LÂM Ý';
        }

        const daysObj = {};
        DAYS.forEach((day, dIdx) => {
          const colIdx = w.dayStartCol - 1 + dIdx;
          const shiftVal = String(values[r][colIdx] || '').trim();
          daysObj[day] = shiftVal;
        });

        scheduleResult[m.name][w.weekName][empName] = daysObj;
      }
    });
  });

  return {
    months: monthsFound.map(m => m.name),
    staff: (monthsFound.length > 0 && monthsFound[0].staff.length > 0) ? monthsFound[0].staff : DEFAULT_STAFF.map(s => s.name),
    schedule: scheduleResult
  };
}

/**
 * Lưu dữ liệu phân ca vào sheet "phanca"
 * @param {Object} payload { month, week, schedule: { [staffName]: { T2: 'TN', T3: '', ... } } }
 */
function saveScheduleToSheet(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(TARGET_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TARGET_SHEET_NAME);
    buildStandardTemplate(sheet);
  }

  // Quét cấu trúc sheet "phanca"
  const maxRow = Math.max(sheet.getLastRow(), 55);
  const maxCol = Math.max(sheet.getLastColumn(), 38);
  const values = sheet.getRange(1, 1, maxRow, maxCol).getValues();

  const targetMonth = (payload.month || 'THÁNG 09').trim().toUpperCase();
  const targetWeek = payload.week; // 'Tuần 1', 'Tuần 2', ... hoặc null nếu lưu cả tháng
  const scheduleData = payload.schedule; // { [week]: { [staff]: { T2, T3... } } } hoặc { [staff]: { T2... } }

  // Tìm khối tháng trong sheet
  let monthInfo = null;
  for (let r = 0; r < values.length; r++) {
    const val = String(values[r][1] || '').trim().toUpperCase();
    if (val === targetMonth) {
      let hRow = r + 2;
      for (let h = r; h < Math.min(r + 5, maxRow); h++) {
        const dVal = String(values[h][3] || '').trim().toUpperCase();
        if (dVal.includes('NHÂN VIÊN') || dVal.includes('NHAN VIEN')) {
          hRow = h;
          break;
        }
      }
      monthInfo = {
        monthRow: r + 1,
        headerRow: hRow + 1,
        startEmpRow: hRow + 2,
        endEmpRow: hRow + 12
      };
      break;
    }
  }

  if (!monthInfo) {
    // Nếu chưa có tháng đó, tạo thêm hoặc trả về thông báo
    return { status: 'error', message: `Không tìm thấy khối ${targetMonth} trên sheet "${TARGET_SHEET_NAME}"` };
  }

  const weekColsMap = {
    'Tuần 1': { nameCol: 4, dayStart: 5 },
    'Tuần 2': { nameCol: 13, dayStart: 14 },
    'Tuần 3': { nameCol: 22, dayStart: 23 },
    'Tuần 4': { nameCol: 31, dayStart: 32 }
  };

  let totalUpdatedCells = 0;

  // Lấy danh sách tuần cần ghi
  const weeksToProcess = targetWeek ? [targetWeek] : ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];

  weeksToProcess.forEach((wName) => {
    const wConfig = weekColsMap[wName];
    if (!wConfig) return;

    const weekSchedule = targetWeek ? scheduleData : (scheduleData[wName] || {});
    if (!weekSchedule) return;

    // Duyệt qua từng nhân viên trong tháng
    let yFoundCount = 0;
    for (let r = monthInfo.startEmpRow; r <= monthInfo.endEmpRow; r++) {
      let sheetEmpName = String(sheet.getRange(r, wConfig.nameCol).getValue() || sheet.getRange(r, 4).getValue() || '').trim().toUpperCase();
      if (!sheetEmpName) continue;

      if (sheetEmpName === 'Ý') {
        yFoundCount++;
        sheetEmpName = (yFoundCount === 1) ? 'GIANG Ý' : 'LÂM Ý';
      }

      // Tìm dữ liệu tương ứng của nhân viên này
      let empShifts = weekSchedule[sheetEmpName];
      if (!empShifts) {
        // Thử tìm theo key không dấu hoặc tên gần đúng
        const foundKey = Object.keys(weekSchedule).find(k => k.trim().toUpperCase() === sheetEmpName);
        if (foundKey) empShifts = weekSchedule[foundKey];
      }

      if (empShifts) {
        const rowRange = sheet.getRange(r, wConfig.dayStart, 1, 7);
        const currentVals = rowRange.getValues()[0];
        const newVals = [...currentVals];
        let changed = false;

        DAYS.forEach((day, dIdx) => {
          if (empShifts[day] !== undefined) {
            const newVal = String(empShifts[day] || '').trim();
            if (newVals[dIdx] !== newVal) {
              newVals[dIdx] = newVal;
              changed = true;
              totalUpdatedCells++;
            }
          }
        });

        if (changed) {
          rowRange.setValues([newVals]);
          // Định dạng ô
          for (let d = 0; d < 7; d++) {
            const cell = sheet.getRange(r, wConfig.dayStart + d);
            const val = String(newVals[d] || '').trim().toUpperCase();
            if (val === 'TN') {
              cell.setBackground('#dbeafe').setFontColor('#0284c7').setFontWeight('bold').setHorizontalAlignment('center');
            } else if (val === 'KHO') {
              cell.setBackground('#dcfce7').setFontColor('#15803d').setFontWeight('bold').setHorizontalAlignment('center');
            } else if (val === 'X') {
              cell.setBackground('#fee2e2').setFontColor('#dc2626').setFontWeight('bold').setHorizontalAlignment('center');
            } else if (val === 'HC') {
              cell.setBackground('#ede9fe').setFontColor('#6d28d9').setFontWeight('bold').setHorizontalAlignment('center');
            } else {
              cell.setBackground('#ffffff').setFontColor('#000000').setFontWeight('normal').setHorizontalAlignment('center');
            }
          }
        }
      }
    }
  });

  return {
    status: 'success',
    message: `Đã lưu thành công vào sheet "${TARGET_SHEET_NAME}"! Cập nhật ${totalUpdatedCells} ô ca.`,
    updatedCells: totalUpdatedCells,
    timestamp: new Date().toISOString()
  };
}

/**
 * Chuẩn hóa tên hai nhân viên "Ý" thành "GIANG Ý" và "LÂM Ý" trên toàn bộ sheet "phanca"
 */
function standardizeStaffNames() {
  const sheet = getOrCreateTargetSheet();
  const maxRow = sheet.getLastRow();
  if (maxRow < 4) return;

  const cols = [4, 13, 22, 31];
  let changed = 0;

  for (let r = 1; r <= maxRow; r++) {
    cols.forEach(col => {
      const cell = sheet.getRange(r, col);
      const val = String(cell.getValue() || '').trim().toUpperCase();
      if (val === 'Ý') {
        // Xác định dòng 1 hay dòng 2 trong khối
        const prevVal = String(sheet.getRange(r - 1, col).getValue() || '').trim().toUpperCase();
        if (prevVal.includes('MỸ') || prevVal.includes('MI')) {
          cell.setValue('GIANG Ý');
          changed++;
        } else {
          cell.setValue('LÂM Ý');
          changed++;
        }
      }
    });
  }

  SpreadsheetApp.getUi().alert('Hoàn thành', `Đã chuẩn hóa ${changed} tên nhân viên thành "GIANG Ý" và "LÂM Ý"!`, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Hiển thị hộp thoại chứa link Web App GitHub
 */
function openWebAppUrlDialog() {
  const githubUrl = "https://leevu221-lang.github.io/phanca/";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 15px; color: #1e293b;">
      <h3 style="color: #0284c7; margin-top: 0;">🌐 Web Phân Ca Hành Chính (GitHub)</h3>
      <p>Truy cập link bên dưới để phân ca trực quan và đồng bộ tức thì với Google Sheet:</p>
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 12px; border-radius: 8px; margin: 15px 0;">
        <a href="${githubUrl}" target="_blank" style="color: #0369a1; font-weight: bold; text-decoration: none; word-break: break-all;">
          ${githubUrl} ↗
        </a>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        Mẹo: Bạn có thể lưu link này vào Bookmark trên điện thoại hoặc máy tính để phân ca bất cứ lúc nào!
      </p>
      <button onclick="google.script.host.close()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; float: right;">Đóng</button>
    </div>
  `;
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(480).setHeight(260), 'Hệ Thống Phân Ca');
}

/**
 * Hướng dẫn triển khai Web App
 */
function showDeploymentGuide() {
  const msg = 
    "HƯỚNG DẪN TRIỂN KHAI WEB APP ĐỒNG BỘ 2 CHIỀU:\n\n" +
    "1. Bấm vào nút 'Triển khai' (Deploy) màu xanh ở góc phải trên Apps Script.\n" +
    "2. Chọn 'Triển khai mới' (New deployment).\n" +
    "3. Bấm vào icon bánh răng ⚙️ > Chọn 'Ứng dụng web' (Web app).\n" +
    "4. Cấu hình:\n" +
    "   - Mô tả: Phân Ca API\n" +
    "   - Thực thi dưới dạng (Execute as): 'Tôi' (Me)\n" +
    "   - Ai có quyền truy cập (Who has access): 'Bất kỳ ai' (Anyone)\n" +
    "5. Bấm 'Triển khai' (Deploy) và Sao chép URL Web App.\n" +
    "6. Mở link GitHub Pages, bấm icon ⚙️ Cài đặt và dán URL Web App vào để kết nối!";
  SpreadsheetApp.getUi().alert('⚙️ Hướng Dẫn Triển Khai', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
