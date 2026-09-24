/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - HỆ THỐNG PHÂN CA HÀNH CHÍNH (KHO & THU NGÂN)
 * Bảng tính: 1841 - CA HÀNH CHÍNH
 * Sheet lưu trữ chính: "phanca"
 * Hỗ trợ Web App API đồng bộ thời gian thực với GitHub Pages
 * =========================================================================
 */

// Tên sheet mục tiêu theo yêu cầu tuyệt đối
const TARGET_SHEET_NAME = "phanca";

// Danh sách 11 nhân viên chuẩn (2 nhóm)
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
 * Đảm bảo Sheet "phanca" luôn tồn tại và có đầy đủ dữ liệu cấu trúc
 */
function ensurePhanCaSheetReady() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(TARGET_SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(TARGET_SHEET_NAME);
  }

  // Nếu sheet phanca trống hoặc chưa có đủ dòng tháng (< 10 dòng)
  if (sheet.getLastRow() < 10) {
    const srcSheet = ss.getSheetByName('HC mới') || ss.getSheetByName('Trang tính1');
    if (srcSheet && srcSheet.getLastRow() >= 10) {
      sheet.clear();
      const range = srcSheet.getDataRange();
      const vals = range.getValues();
      sheet.getRange(1, 1, vals.length, vals[0].length).setValues(vals);
    } else {
      buildStandardTemplate(sheet);
    }
    formatSheetPhanCa(sheet);
  }

  return sheet;
}

/**
 * Khởi tạo dữ liệu mẫu đẹp mắt cho Sheet "phanca" nếu người dùng bấm trên menu
 */
function initializePhanCaSheet() {
  const sheet = ensurePhanCaSheetReady();
  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert('Thông báo', `Sheet "${TARGET_SHEET_NAME}" đã sẵn sàng và được đồng bộ dữ liệu chuẩn!`, SpreadsheetApp.getUi().ButtonSet.OK);
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
        cell.setBackground('#ede9fe').setFontColor('#6d28d9').setFontWeight('bold').setHorizontalAlignment('center');
      } else if (v === 'KHO') {
        cell.setBackground('#ffedd5').setFontColor('#c2410c').setFontWeight('bold').setHorizontalAlignment('center');
      } else if (v === 'X') {
        cell.setBackground('#fee2e2').setFontColor('#dc2626').setFontWeight('bold').setHorizontalAlignment('center');
      } else if (v === 'HC') {
        cell.setBackground('#e0f2fe').setFontColor('#0284c7').setFontWeight('bold').setHorizontalAlignment('center');
      }
    }
  }

  // Tinh chỉnh chiều cao các dòng cho cân xứng, gọn gàng (25px)
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
 * Xử lý GET request: Lấy dữ liệu hoặc Lưu dữ liệu (khi fetch POST gặp CORS redirect)
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'getData';

    if (action === 'ping') {
      return createJsonResponse({ status: 'ok', time: new Date().toISOString() });
    }

    // Hỗ trợ Lưu qua GET để 100% không bị chặn CORS
    if (action === 'saveSchedule') {
      let payload = {};
      if (e.parameter.data) {
        payload = JSON.parse(e.parameter.data);
      } else {
        payload = e.parameter;
      }
      payload.action = 'saveSchedule';
      const result = saveScheduleToSheet(payload);
      return createJsonResponse(result);
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

    return createJsonResponse({ status: 'error', message: 'Hành động không hợp lệ: ' + action });
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
    } else if (e.parameter) {
      payload = e.parameter;
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
 * Tìm kiếm khối tháng trong mảng dữ liệu sheet
 */
function findMonthInfo(values, targetMonth) {
  for (let r = 0; r < values.length; r++) {
    const val = String(values[r][1] || '').trim().toUpperCase(); // Cột B
    if (val === targetMonth) {
      // Tìm dòng header nhân viên
      let hRow = r + 2;
      for (let h = r; h < Math.min(r + 5, values.length); h++) {
        const dVal = String(values[h][3] || '').trim().toUpperCase(); // Cột D
        if (dVal.includes('NHÂN VIÊN') || dVal.includes('NHAN VIEN')) {
          hRow = h;
          break;
        }
      }

      // Quét danh sách nhân viên
      const staffList = [];
      let yCount = 0;
      for (let e = hRow + 1; e < Math.min(hRow + 18, values.length); e++) {
        let empName = String(values[e][3] || '').trim();
        if (empName && !empName.toUpperCase().startsWith('THÁNG')) {
          if (empName.toUpperCase() === 'Ý' || empName.toUpperCase() === 'Y') {
            yCount++;
            empName = (yCount === 1) ? 'GIANG Ý' : 'LÂM Ý';
          }
          staffList.push({ name: empName, row: e + 1 });
        } else {
          break;
        }
      }

      return {
        name: val,
        monthRow: r + 1,
        headerRow: hRow + 1,
        startEmpRow: hRow + 2,
        endEmpRow: hRow + 1 + staffList.length,
        staff: staffList
      };
    }
  }
  return null;
}

/**
 * Trích xuất toàn bộ dữ liệu phân ca từ Sheet "phanca"
 */
function extractAllScheduleData() {
  const sheet = ensurePhanCaSheetReady();
  const maxRow = Math.max(sheet.getLastRow(), 55);
  const maxCol = Math.max(sheet.getLastColumn(), 38);
  const values = sheet.getRange(1, 1, maxRow, maxCol).getValues();

  // Xác định vị trí các tháng
  const monthsFound = [];
  DEFAULT_MONTHS.forEach((mName) => {
    const info = findMonthInfo(values, mName);
    if (info) monthsFound.push(info);
  });

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

      m.staff.forEach((staffItem) => {
        const rIdx = staffItem.row - 1;
        const daysObj = {};
        DAYS.forEach((day, dIdx) => {
          const colIdx = w.dayStartCol - 1 + dIdx;
          const shiftVal = String(values[rIdx][colIdx] || '').trim();
          daysObj[day] = shiftVal;
        });

        scheduleResult[m.name][w.weekName][staffItem.name] = daysObj;
      });
    });
  });

  return {
    months: monthsFound.map(m => m.name),
    staff: (monthsFound.length > 0 && monthsFound[0].staff.length > 0) ? monthsFound[0].staff.map(s => s.name) : DEFAULT_STAFF.map(s => s.name),
    schedule: scheduleResult
  };
}

/**
 * Lưu dữ liệu phân ca vào sheet "phanca"
 * @param {Object} payload { month, week, schedule: { [week]: { [staff]: { T2, T3... } } } }
 */
function saveScheduleToSheet(payload) {
  // ĐẢM BẢO 100% SHEET ĐÍCH LÀ "phanca"
  const sheet = ensurePhanCaSheetReady();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setActiveSheet(sheet);

  const maxRow = Math.max(sheet.getLastRow(), 55);
  const maxCol = Math.max(sheet.getLastColumn(), 38);
  const values = sheet.getRange(1, 1, maxRow, maxCol).getValues();

  const targetMonth = (payload.month || 'THÁNG 09').trim().toUpperCase();
  const targetWeek = payload.week; // 'Tuần 1', 'Tuần 2', ... hoặc null nếu lưu cả tháng
  const scheduleData = payload.schedule || {};

  // Tìm khối tháng trong sheet "phanca"
  let monthInfo = findMonthInfo(values, targetMonth);

  // Nếu vẫn không tìm thấy, ép khởi tạo lại template chuẩn
  if (!monthInfo) {
    buildStandardTemplate(sheet);
    const updatedValues = sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 55), 38).getValues();
    monthInfo = findMonthInfo(updatedValues, targetMonth);
  }

  if (!monthInfo) {
    return { status: 'error', message: `Không tìm thấy khối ${targetMonth} trên sheet "${TARGET_SHEET_NAME}"` };
  }

  const weekColsMap = {
    'Tuần 1': { nameCol: 4, dayStart: 5 },
    'Tuần 2': { nameCol: 13, dayStart: 14 },
    'Tuần 3': { nameCol: 22, dayStart: 23 },
    'Tuần 4': { nameCol: 31, dayStart: 32 }
  };

  let totalUpdatedCells = 0;
  const weeksToProcess = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];

  weeksToProcess.forEach((wName) => {
    // Nếu chỉ lưu 1 tuần cụ thể
    if (targetWeek && targetWeek !== 'all' && targetWeek !== wName) return;

    const wConfig = weekColsMap[wName];
    if (!wConfig) return;

    // Lấy dữ liệu tuần tương ứng
    let weekSchedule = {};
    if (scheduleData[wName]) {
      weekSchedule = scheduleData[wName];
    } else if (targetWeek === wName) {
      weekSchedule = scheduleData;
    }

    if (!weekSchedule) return;

    // Duyệt qua từng nhân viên đã tìm thấy trong tháng
    monthInfo.staff.forEach((staffItem) => {
      const cleanTargetName = staffItem.name.trim().toUpperCase();

      // Tìm ca của nhân viên này trong weekSchedule
      let empShifts = weekSchedule[cleanTargetName];
      if (!empShifts) {
        // Thử tìm theo key không dấu hoặc tên gần đúng
        const foundKey = Object.keys(weekSchedule).find(k => k.trim().toUpperCase() === cleanTargetName);
        if (foundKey) empShifts = weekSchedule[foundKey];
      }

      if (empShifts) {
        const rowRange = sheet.getRange(staffItem.row, wConfig.dayStart, 1, 7);
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

          // Cập nhật định dạng màu sắc cho 7 ngày của dòng này
          for (let d = 0; d < 7; d++) {
            const cell = sheet.getRange(staffItem.row, wConfig.dayStart + d);
            const val = String(newVals[d] || '').trim().toUpperCase();
            if (val === 'TN') {
              cell.setBackground('#ede9fe').setFontColor('#6d28d9').setFontWeight('bold').setHorizontalAlignment('center');
            } else if (val === 'KHO') {
              cell.setBackground('#ffedd5').setFontColor('#c2410c').setFontWeight('bold').setHorizontalAlignment('center');
            } else if (val === 'X') {
              cell.setBackground('#fee2e2').setFontColor('#dc2626').setFontWeight('bold').setHorizontalAlignment('center');
            } else if (val === 'HC') {
              cell.setBackground('#e0f2fe').setFontColor('#0284c7').setFontWeight('bold').setHorizontalAlignment('center');
            } else {
              cell.setBackground('#ffffff').setFontColor('#000000').setFontWeight('normal').setHorizontalAlignment('center');
            }
          }
        }
      }
    });
  });

  // Tinh chỉnh chiều cao các dòng gọn gàng, cân đối
  try {
    sheet.setRowHeights(monthInfo.startEmpRow, monthInfo.endEmpRow - monthInfo.startEmpRow + 1, 25);
  } catch (e) {}

  return {
    status: 'success',
    message: `Đã lưu thành công vào đúng sheet "${TARGET_SHEET_NAME}"! Cập nhật ${totalUpdatedCells} ô ca.`,
    updatedCells: totalUpdatedCells,
    targetSheet: TARGET_SHEET_NAME,
    timestamp: new Date().toISOString()
  };
}

/**
 * Chuẩn hóa tên hai nhân viên "Ý" thành "GIANG Ý" và "LÂM Ý" trên toàn bộ sheet "phanca"
 */
function standardizeStaffNames() {
  const sheet = ensurePhanCaSheetReady();
  const maxRow = sheet.getLastRow();
  if (maxRow < 4) return;

  const cols = [4, 13, 22, 31];
  let changed = 0;

  for (let r = 1; r <= maxRow; r++) {
    cols.forEach(col => {
      const cell = sheet.getRange(r, col);
      const val = String(cell.getValue() || '').trim().toUpperCase();
      if (val === 'Ý' || val === 'Y') {
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
      <p>Truy cập link bên dưới để phân ca trực quan và đồng bộ tức thì với Google Sheet "phanca":</p>
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 12px; border-radius: 8px; margin: 15px 0;">
        <a href="${githubUrl}" target="_blank" style="color: #0369a1; font-weight: bold; text-decoration: none; word-break: break-all;">
          ${githubUrl} ↗
        </a>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        Mẹo: Mọi thao tác lưu từ Web sẽ tự động được ghi thẳng vào sheet "phanca".
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
    "HƯỚNG DẪN TRIỂN KHAI WEB APP ĐỒNG BỘ VÀO SHEET PHANCA:\n\n" +
    "1. Bấm nút 'Triển khai' (Deploy) màu xanh ở góc phải trên Apps Script.\n" +
    "2. Chọn 'Triển khai mới' (New deployment).\n" +
    "3. Bấm icon bánh răng ⚙️ > Chọn 'Ứng dụng web' (Web app).\n" +
    "4. Cấu hình:\n" +
    "   - Mô tả: API Phân Ca\n" +
    "   - Thực thi dưới dạng (Execute as): 'Tôi' (Me)\n" +
    "   - Ai có quyền truy cập (Who has access): 'Bất kỳ ai' (Anyone)\n" +
    "5. Bấm 'Triển khai' (Deploy) và Sao chép URL Web App.\n" +
    "6. Mở link GitHub Pages, bấm ⚙️ Cài đặt API và dán URL vào để kết nối!";
  SpreadsheetApp.getUi().alert('⚙️ Hướng Dẫn Triển Khai', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
