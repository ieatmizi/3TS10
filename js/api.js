/**
 * API & DATA NORMALIZATION LAYER
 * Module: api.js
 * Nhiệm vụ:
 * 1. Fetch dữ liệu từ file JSON tĩnh (local mock/production data).
 * 2. Parse dữ liệu thô từ file JSON (RAM, SSD, Wh pin, OS...) sang schema chuẩn.
 * 3. Chuẩn hóa dữ liệu thô (raw data) sang Schema thống nhất mà Scoring Engine yêu cầu (normalizeLaptopData).
 * 4. Hỗ trợ hàm mapping CPU/GPU/Display Tier (1 - 5) linh hoạt.
 */

const API_CONFIG = {
  LAPTOPS_ENDPOINT: './data/laptop_file.json',
  TIMEOUT_MS: 8000
};

// Khởi tạo RegExp một lần ở ngoài module để tối ưu hiệu năng
const RAM_REGEX = /(\d+)\s*gb/i;
const SSD_TB_REGEX = /(\d+(?:\.\d+)?)\s*tb/i;
const SSD_GB_REGEX = /(\d+)\s*gb/i;

/**
 * Parse chuỗi RAM (vd: "16GB", "32 GB", 16) thành số nguyên GB
 * @param {string|number} ramValue
 * @returns {number} RAM tính theo GB
 */
function parseRAM(ramValue) {
  if (typeof ramValue === 'number') return ramValue;
  if (!ramValue) return 8;
  const match = RAM_REGEX.exec(ramValue);
  if (match) return parseInt(match[1], 10);
  const num = parseInt(ramValue, 10);
  return isNaN(num) ? 8 : num;
}

/**
 * Parse chuỗi SSD (vd: "512GB", "1TB", "2TB", 512) thành số nguyên GB
 * @param {string|number} ssdValue
 * @returns {number} SSD tính theo GB (1TB = 1024GB)
 */
function parseSSD(ssdValue) {
  if (typeof ssdValue === 'number') return ssdValue;
  if (!ssdValue) return 512;
  const tbMatch = SSD_TB_REGEX.exec(ssdValue);
  if (tbMatch) return Math.round(parseFloat(tbMatch[1]) * 1024);
  const gbMatch = SSD_GB_REGEX.exec(ssdValue);
  if (gbMatch) return parseInt(gbMatch[1], 10);
  const num = parseInt(ssdValue, 10);
  return isNaN(num) ? 512 : num;
}

/**
 * Chuyển đổi an toàn chuỗi số (hỗ trợ cả dấu phẩy 54,8 và dấu chấm 54.8) sang float
 */
function parseSafeFloat(val, defaultVal = 0) {
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  if (!val) return defaultVal;
  const cleaned = String(val).replace(',', '.').replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultVal : parsed;
}

/**
 * Parse một bản ghi JSON thô thành đối tượng trung gian tương thích với normalizeLaptopData
 * @param {Object} raw - Bản ghi từ file JSON tĩnh
 * @returns {Object} rawLaptop tương thích schema
 */
function parseRawLaptopRecord(raw) {
  if (!raw || typeof raw !== 'object') return {};

  const name = raw.name || raw.title || 'Laptop';
  const isApple = (raw.brand_name && raw.brand_name.toLowerCase() === 'apple') || 
                  (name && (name.toLowerCase().includes('macbook') || name.toLowerCase().includes('apple')));
  const os = raw.os || (isApple ? 'macOS' : 'Windows');

  const ramGB = parseRAM(raw.ram !== undefined && raw.ram !== null ? raw.ram : raw.ramGB);
  const ssdGB = parseSSD(raw.ssd !== undefined && raw.ssd !== null ? raw.ssd : raw.ssdGB);

  // Dung lượng pin (Wh) – hỗ trợ chuỗi có dấu phẩy
  const batteryWhr = parseSafeFloat(
    raw.battery_capacity_whr !== undefined && raw.battery_capacity_whr !== null 
      ? raw.battery_capacity_whr 
      : (raw.batteryWhr || raw.batteryHours || raw.battery), 
    50
  );

  const weightKg = parseSafeFloat(
    raw.laptop_weight !== undefined && raw.laptop_weight !== null 
      ? raw.laptop_weight 
      : (raw.weightKg || raw.weight), 
    1.8
  );

  const price = parseSafeFloat(
    raw.price_vnd !== undefined && raw.price_vnd !== null 
      ? raw.price_vnd 
      : (raw.price), 
    0
  );

  const display = raw.screen_size 
    ? `${raw.screen_size} inch` 
    : (raw.display || raw.screen || '');

  return {
    ...raw,
    name: name,
    brand: raw.brand_name || raw.brand || '',
    os: os,
    cpu: raw.cpu_name || raw.cpu || raw.processor || '',
    gpu: raw.gpu_name || raw.gpu || raw.graphics || '',
    ramGB: ramGB,
    ssdGB: ssdGB,
    batteryWhr: batteryWhr,
    weightKg: weightKg,
    price: price,
    display: display,
    productUrl: raw.product_link || raw.productUrl || raw.url || raw.link || '#'
  };
}

/**
 * Chuẩn hóa CPU sang Tier 1 - 5 (nếu chưa có sẵn cpuTier)
 */
function normalizeCPU(cpuName, existingTier = null) {
  if (existingTier && existingTier >= 1 && existingTier <= 5) {
    return existingTier;
  }
  if (!cpuName) return 2;
  const name = cpuName.toLowerCase();
  if (name.includes('m4 max') || name.includes('m4 pro') || name.includes('m3 max') || name.includes('m3 pro') || name.includes('ultra 9') || name.includes('i9') || name.includes('ryzen 9') || name.includes('ryzen ai 9')) return 5;
  if (name.includes('m4') || name.includes('m3') || name.includes('ultra 7') || name.includes('i7') || name.includes('ryzen 7') || name.includes('ryzen ai 7')) return 4;
  if (name.includes('ultra 5') || name.includes('i5') || name.includes('ryzen 5') || name.includes('m1') || name.includes('m2')) return 3;
  if (name.includes('i3') || name.includes('ryzen 3')) return 2;
  return 2;
}

/**
 * Chuẩn hóa GPU sang Tier 1 - 5 (nếu chưa có sẵn gpuTier)
 */
function normalizeGPU(gpuName, existingTier = null) {
  if (existingTier && existingTier >= 1 && existingTier <= 5) {
    return existingTier;
  }
  if (!gpuName) return 1;
  const name = gpuName.toLowerCase();
  if (name.includes('rtx 4070') || name.includes('rtx 4080') || name.includes('rtx 4090') || name.includes('m4 max') || name.includes('m3 max')) return 5;
  if (name.includes('rtx 4050') || name.includes('rtx 4060') || name.includes('rtx 3060') || name.includes('m4 pro') || name.includes('m3 pro')) return 4;
  if (name.includes('rtx 3050') || name.includes('rtx 2050') || name.includes('gtx') || name.includes('discrete')) return 3;
  if (name.includes('iris') || name.includes('arc') || name.includes('apple m') || name.includes('radeon 6') || name.includes('radeon 7') || name.includes('radeon 8') || name.includes('radeon') || name.includes('m4') || name.includes('m3') || name.includes('m2') || name.includes('m1')) return 2;
  return 1;
}

/**
 * Chuẩn hóa màn hình Display sang Tier 1 - 5
 */
function normalizeDisplay(displayName, existingTier = null) {
  if (existingTier && existingTier >= 1 && existingTier <= 5) {
    return existingTier;
  }
  if (!displayName) return 2;
  const name = displayName.toLowerCase();
  if (name.includes('liquid retina xdr') || (name.includes('oled') && name.includes('240hz')) || name.includes('3.2k')) return 5;
  if (name.includes('oled') || name.includes('2.8k') || name.includes('retina')) return 4;
  if (name.includes('144hz') || name.includes('100% srgb') || name.includes('2k')) return 3;
  return 2;
}

/**
 * Chuẩn hóa một bản ghi laptop về Data Schema chuẩn nội bộ
 * @param {Object} rawLaptop - Dữ liệu đã qua parseRawLaptopRecord
 * @returns {Object} Normalized Laptop Schema
 */
function normalizeLaptopData(rawLaptop) {
  const ramGB = Number(rawLaptop.ramGB || rawLaptop.memory || rawLaptop.ram || 8);
  const ssdGB = Number(rawLaptop.ssdGB || rawLaptop.storage || rawLaptop.ssd || 512);
  const price = Number(rawLaptop.price || 0);
  const batteryWhr = Number(rawLaptop.batteryWhr || rawLaptop.batteryHours || rawLaptop.battery || 50);
  const weightKg = Number(rawLaptop.weightKg || rawLaptop.weight || 1.8);
  
  const cpuTier = normalizeCPU(rawLaptop.cpu || rawLaptop.processor, rawLaptop.cpuTier);
  const gpuTier = normalizeGPU(rawLaptop.gpu || rawLaptop.graphics, rawLaptop.gpuTier);
  const displayTier = normalizeDisplay(rawLaptop.display || rawLaptop.screen, rawLaptop.displayTier);

  return {
    id: rawLaptop.id || `lp-${Math.random().toString(36).substr(2, 9)}`,
    name: rawLaptop.name || rawLaptop.title || 'Laptop',
    price: price,
    os: (rawLaptop.os || (rawLaptop.name && rawLaptop.name.includes('MacBook') ? 'macOS' : 'Windows')),
    ramGB: ramGB,
    ssdGB: ssdGB,
    cpu: rawLaptop.cpu || rawLaptop.processor || `CPU Tier ${cpuTier}`,
    cpuTier: cpuTier,
    gpu: rawLaptop.gpu || rawLaptop.graphics || (gpuTier > 2 ? 'Card đồ họa rời' : 'Card đồ họa tích hợp'),
    gpuTier: gpuTier,
    isDedicatedGpu: gpuTier >= 3,
    batteryWhr: batteryWhr,
    weightKg: weightKg,
    display: rawLaptop.display || rawLaptop.screen || `Màn hình Tier ${displayTier}`,
    displayTier: displayTier,
    image: rawLaptop.image || rawLaptop.imageUrl || './img/laptop-default.jpg',
    productUrl: rawLaptop.productUrl || rawLaptop.url || rawLaptop.link || '#'
  };
}

/**
 * Lấy danh sách laptop từ nguồn JSON tĩnh và chuẩn hóa trong 1 lượt .map()
 * @returns {Promise<Array<Object>>} Danh sách laptop đã qua chuẩn hóa
 */
async function fetchLaptops() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

    const response = await fetch(API_CONFIG.LAPTOPS_ENDPOINT, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const rawJson = await response.json();
    let rawList = [];
    if (Array.isArray(rawJson)) {
      rawList = rawJson;
    } else if (rawJson && Array.isArray(rawJson.laptop_full_cleaned_final)) {
      rawList = rawJson.laptop_full_cleaned_final;
    } else if (rawJson && typeof rawJson === 'object') {
      const foundArray = Object.values(rawJson).find(Array.isArray);
      rawList = foundArray || [];
    }

    if (!Array.isArray(rawList)) {
      throw new Error('Dữ liệu JSON trả về không phải là mảng.');
    }

    // Parse raw -> normalize trong đúng 1 lượt .map() duy nhất
    return rawList.map(item => normalizeLaptopData(parseRawLaptopRecord(item)));
  } catch (error) {
    console.error('[API Fetch Error]:', error);
    throw error;
  }
}

// Export đối tượng API để sử dụng trong app.js
window.LaptopAPI = {
  fetchLaptops,
  parseRawLaptopRecord,
  normalizeLaptopData,
  normalizeCPU,
  normalizeGPU,
  normalizeDisplay,
  API_CONFIG
};
