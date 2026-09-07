/**
 * MAPPING & REQUIREMENT BUILDER MODULE
 * Module: mapping.js
 * Nhiệm vụ:
 * 1. Industry Mapping (5 nhóm ngành với từ khóa nhận diện và baseline config).
 * 2. Purpose Mapping (Yêu cầu theo mục đích chính và quy tắc MAX khi chọn nhiều mục đích).
 * 4. Branch "RỒI" Requirement Builder (Trích xuất yêu cầu trực tiếp từ lựa chọn của user).
 */

const INDUSTRY_CONFIG = {
  BUSINESS: {
    id: 'BUSINESS',
    name: 'Kinh tế / Quản trị / Marketing',
    keywords: [
      'kinh tế', 'tài chính', 'kế toán', 'quản trị kinh doanh', 'qtkd',
      'marketing', 'thương mại', 'kinh doanh', 'ngân hàng', 'audit',
      'logistics', 'quản trị', 'nhân sự', 'kinh doanh quốc tế'
    ],
    baseline: {
      ramGB: 8,
      cpuTier: 2,
      gpuTier: 1,
      ssdGB: 512,
      displayTier: 2,
      batteryHours: 50,
      weightKg: 2.0
    }
  },
  IT_TECH: {
    id: 'IT_TECH',
    name: 'Công nghệ thông tin / Kỹ thuật máy tính',
    keywords: [
      'công nghệ thông tin', 'cntt', 'it', 'information technology',
      'hệ thống thông tin', 'httt', 'khoa học máy tính', 'computer science',
      'kỹ thuật máy tính', 'software', 'lập trình', 'an toàn thông tin',
      'mạng máy tính', 'data', 'trí tuệ nhân tạo', 'ai'
    ],
    baseline: {
      ramGB: 16,
      cpuTier: 3,
      gpuTier: 1,
      ssdGB: 512,
      displayTier: 2,
      batteryHours: 50,
      weightKg: 2.0
    }
  },
  DESIGN: {
    id: 'DESIGN',
    name: 'Thiết kế đồ họa / Kiến trúc / Multimedia',
    keywords: [
      'thiết kế đồ họa', 'đồ họa', 'graphic design', 'multimedia',
      'kiến trúc', 'mỹ thuật', 'thiết kế', 'animation', 'nội thất', 'ui/ux'
    ],
    baseline: {
      ramGB: 16,
      cpuTier: 3,
      gpuTier: 3,
      ssdGB: 512,
      displayTier: 4,
      batteryHours: 50,
      weightKg: 2.2
    }
  },
  MEDIA: {
    id: 'MEDIA',
    name: 'Truyền thông / Báo chí / PR',
    keywords: [
      'truyền thông', 'báo chí', 'pr', 'quan hệ công chúng',
      'communications', 'sáng tạo nội dung', 'media', 'phát thanh'
    ],
    baseline: {
      ramGB: 16,
      cpuTier: 3,
      gpuTier: 2,
      ssdGB: 512,
      displayTier: 3,
      batteryHours: 50,
      weightKg: 2.0
    }
  },
  OTHER: {
    id: 'OTHER',
    name: 'Khác / Tổng quát',
    keywords: [],
    baseline: {
      ramGB: 8,
      cpuTier: 2,
      gpuTier: 1,
      ssdGB: 512,
      displayTier: 2,
      batteryHours: 50,
      weightKg: 2.0
    }
  }
};

const PURPOSE_CONFIG = {
  'hoc_tap': {
    id: 'hoc_tap',
    label: 'Học tập / Văn phòng',
    requirement: {
      ramGB: 8,
      cpuTier: 2,
      gpuTier: 1,
      ssdGB: 512,
      displayTier: 2,
      batteryHours: 50,
      weightKg: 2.0
    }
  },
  'lap_trinh': {
    id: 'lap_trinh',
    label: 'Lập trình',
    requirement: {
      ramGB: 16,
      cpuTier: 3,
      gpuTier: 1,
      ssdGB: 512,
      displayTier: 2,
      batteryHours: 50,
      weightKg: 2.0
    }
  },
  'do_hoa': {
    id: 'do_hoa',
    label: 'Đồ họa / Dựng phim',
    requirement: {
      ramGB: 16,
      cpuTier: 4,
      gpuTier: 4,
      ssdGB: 1024,
      displayTier: 4,
      batteryHours: 55,
      weightKg: 2.2
    }
  },
  'gaming': {
    id: 'gaming',
    label: 'Chơi game',
    requirement: {
      ramGB: 16,
      cpuTier: 4,
      gpuTier: 4,
      ssdGB: 1024,
      displayTier: 3,
      batteryHours: 45,
      weightKg: 2.3
    }
  }
};

const INTENSITY_CONFIG = {
  'co_ban': {
    id: 'co_ban',
    label: 'Tác vụ cơ bản',
    requirement: {
      ramGB: 8,
      cpuTier: 2,
      gpuTier: 1,
      ssdGB: 256
    }
  },
  'da_nhiem': {
    id: 'da_nhiem',
    label: 'Nhiều tab / Đa nhiệm',
    requirement: {
      ramGB: 16,
      cpuTier: 3,
      gpuTier: 1,
      ssdGB: 512
    }
  },
  'nang': {
    id: 'nang',
    label: 'Phần mềm nặng',
    requirement: {
      ramGB: 16,
      cpuTier: 4,
      gpuTier: 3,
      ssdGB: 512
    }
  },
  'rat_nang': {
    id: 'rat_nang',
    label: 'Tác vụ rất nặng',
    requirement: {
      ramGB: 32,
      cpuTier: 5,
      gpuTier: 4,
      ssdGB: 1024
    }
  },
  'chuyen_nganh': {
    id: 'chuyen_nganh',
    label: 'Phần mềm chuyên ngành',
    requirement: {
      ramGB: 16,
      cpuTier: 4,
      // GPU phụ thuộc vào ngành/mục đích đã chọn (null để giữ nguyên)
      gpuTier: null,
      ssdGB: 512
    }
  }
};

/**
 * Xác định nhóm ngành từ chuỗi text tự do do người dùng nhập
 * @param {string} inputMajor 
 * @returns {Object} Industry Group Object
 */
function getIndustryGroup(inputMajor) {
  if (!inputMajor || typeof inputMajor !== 'string') {
    return INDUSTRY_CONFIG.OTHER;
  }
  const cleanInput = inputMajor.trim().toLowerCase();
  if (!cleanInput) return INDUSTRY_CONFIG.OTHER;

  for (const groupKey of ['IT_TECH', 'DESIGN', 'MEDIA', 'BUSINESS']) {
    const group = INDUSTRY_CONFIG[groupKey];
    for (const kw of group.keywords) {
      if (cleanInput.includes(kw)) {
        return group;
      }
    }
  }
  return INDUSTRY_CONFIG.OTHER;
}

/**
 * Hợp nhất (Merge) hai đối tượng requirement theo quy tắc MAX từng tiêu chí
 */
function mergeMaxRequirements(reqA, reqB) {
  if (!reqA) return { ...reqB };
  if (!reqB) return { ...reqA };

  return {
    ramGB: Math.max(reqA.ramGB || 8, reqB.ramGB || 8),
    cpuTier: Math.max(reqA.cpuTier || 1, reqB.cpuTier || 1),
    gpuTier: Math.max(reqA.gpuTier || 1, reqB.gpuTier || 1),
    ssdGB: Math.max(reqA.ssdGB || 256, reqB.ssdGB || 256),
    displayTier: Math.max(reqA.displayTier || 1, reqB.displayTier || 1),
    batteryHours: Math.max(reqA.batteryHours || 50, reqB.batteryHours || 50),
    weightKg: Math.max(reqA.weightKg || 2.0, reqB.weightKg || 2.0)
  };
}

/**
 * Xây dựng Requirement cho nhánh "CHƯA" (User chưa biết cấu hình)
 * Quy tắc: Final Requirement = MAX(Industry Baseline, MAX(Purposes), Intensity)
 */
function buildRequirementsForUnknownBranch(answers) {
  const { majorText, purposes = [], intensityKey } = answers;

  // 1. Lấy baseline từ nhóm ngành
  const industryGroup = getIndustryGroup(majorText);
  let finalReq = { ...industryGroup.baseline };

  // 2. Gộp các Mục đích chính (Purposes) theo phép MAX
  if (Array.isArray(purposes) && purposes.length > 0) {
    let combinedPurposeReq = null;
    for (const pKey of purposes) {
      const pConfig = PURPOSE_CONFIG[pKey];
      if (pConfig) {
        combinedPurposeReq = mergeMaxRequirements(combinedPurposeReq, pConfig.requirement);
      }
    }
    if (combinedPurposeReq) {
      finalReq = mergeMaxRequirements(finalReq, combinedPurposeReq);
    }
  }

  // 3. Điều chỉnh theo Cường độ sử dụng (Intensity)
  if (intensityKey && INTENSITY_CONFIG[intensityKey]) {
    const intReq = INTENSITY_CONFIG[intensityKey].requirement;
    finalReq.ramGB = Math.max(finalReq.ramGB, intReq.ramGB || 8);
    finalReq.cpuTier = Math.max(finalReq.cpuTier, intReq.cpuTier || 1);
    finalReq.ssdGB = Math.max(finalReq.ssdGB, intReq.ssdGB || 256);
    
    // Nếu intensity có chỉ định GPU riêng (khác null) thì mới so sánh MAX
    if (intReq.gpuTier !== null && intReq.gpuTier !== undefined) {
      finalReq.gpuTier = Math.max(finalReq.gpuTier, intReq.gpuTier);
    }
  }

  return {
    industryGroup,
    requirements: finalReq
  };
}

/**
 * Xây dựng Requirement cho nhánh "RỒI" (User đã biết cấu hình)
 * 4 câu: Ngân sách, RAM, Cấu hình (SSD, GPU rời, Pin 10h), Ưu tiên
 */
function buildRequirementsForKnownBranch(answers) {
  const { majorText, ramChoice, configChoices = [] } = answers;
  const industryGroup = getIndustryGroup(majorText);

  // Mặc định baseline theo ngành
  const finalReq = { ...industryGroup.baseline };

  // 1. Phân tích RAM đã chọn
  if (ramChoice === 'ram_8') finalReq.ramGB = 8;
  else if (ramChoice === 'ram_16') finalReq.ramGB = 16;
  else if (ramChoice === 'ram_32') finalReq.ramGB = 32;
  else if (ramChoice === 'ram_64') finalReq.ramGB = 64;

  // 2. Phân tích Cấu hình bổ sung (Multi-select)
  if (Array.isArray(configChoices)) {
    for (const item of configChoices) {
      if (item === 'ssd_256') finalReq.ssdGB = Math.max(finalReq.ssdGB, 256);
      if (item === 'ssd_512') finalReq.ssdGB = Math.max(finalReq.ssdGB, 512);
      if (item === 'ssd_1024') finalReq.ssdGB = Math.max(finalReq.ssdGB, 1024);
      if (item === 'gpu_dedicated') finalReq.gpuTier = Math.max(finalReq.gpuTier, 3); // Cần Card đồ họa rời (Tier >= 3)
      if (item === 'battery_10h') finalReq.batteryHours = Math.max(finalReq.batteryHours, 70);
    }
  }

  return {
    industryGroup,
    requirements: finalReq
  };
}

window.LaptopMapping = {
  INDUSTRY_CONFIG,
  PURPOSE_CONFIG,
  INTENSITY_CONFIG,
  getIndustryGroup,
  mergeMaxRequirements,
  buildRequirementsForUnknownBranch,
  buildRequirementsForKnownBranch
};
