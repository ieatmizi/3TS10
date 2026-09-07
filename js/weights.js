/**
 * PRIORITY & WEIGHTS MATRIX MODULE
 * Module: weights.js
 * Nhiệm vụ:
 * Định nghĩa trọng số ma trận (0.00 - 1.00) theo Weighted Sum Model cho từng mục tiêu ưu tiên.
 * Lưu ý: Priority KHÔNG tạo requirement mới, chỉ thay đổi WEIGHT trong quá trình scoring.
 */

const WEIGHTS_CONFIG = {
  // Trọng số cơ sở (Base)
  'base': {
    id: 'base',
    label: 'Cơ bản / Mặc định',
    cpu: 0.20,
    ram: 0.15,
    gpu: 0.15,
    ssd: 0.10,
    battery: 0.10,
    weight: 0.10,
    display: 0.10,
    price: 0.10
  },

  // Ưu tiên: Hiệu năng cao
  'hieu_nang_cao': {
    id: 'hieu_nang_cao',
    label: 'Hiệu năng cao',
    cpu: 0.28,
    ram: 0.20,
    gpu: 0.22,
    ssd: 0.10,
    battery: 0.07,
    weight: 0.05,
    display: 0.05,
    price: 0.03
  },

  // Ưu tiên: Mỏng nhẹ
  'mong_nhe': {
    id: 'mong_nhe',
    label: 'Mỏng nhẹ',
    cpu: 0.15,
    ram: 0.15,
    gpu: 0.08,
    ssd: 0.10,
    battery: 0.18,
    weight: 0.22,
    display: 0.07,
    price: 0.05
  },

  // Ưu tiên: Giá tốt
  'gia_tot': {
    id: 'gia_tot',
    label: 'Giá tốt',
    cpu: 0.16,
    ram: 0.12,
    gpu: 0.08,
    ssd: 0.10,
    battery: 0.10,
    weight: 0.08,
    display: 0.10,
    price: 0.26
  },

  // Ưu tiên: Màn hình đẹp
  'man_hinh_dep': {
    id: 'man_hinh_dep',
    label: 'Màn hình đẹp',
    cpu: 0.18,
    ram: 0.15,
    gpu: 0.12,
    ssd: 0.10,
    battery: 0.08,
    weight: 0.05,
    display: 0.25,
    price: 0.07
  },

  // Ưu tiên: Pin lâu
  'pin_lau': {
    id: 'pin_lau',
    label: 'Pin lâu',
    cpu: 0.17,
    ram: 0.15,
    gpu: 0.10,
    ssd: 0.10,
    battery: 0.25,
    weight: 0.12,
    display: 0.06,
    price: 0.05
  }
};

/**
 * Lấy bộ trọng số tương ứng theo ID ưu tiên
 * @param {string} priorityKey 
 * @returns {Object} Trọng số của các tiêu chí
 */
function getWeightsByPriority(priorityKey) {
  if (priorityKey && WEIGHTS_CONFIG[priorityKey]) {
    return WEIGHTS_CONFIG[priorityKey];
  }
  return WEIGHTS_CONFIG.base;
}

window.LaptopWeights = {
  WEIGHTS_CONFIG,
  getWeightsByPriority
};
