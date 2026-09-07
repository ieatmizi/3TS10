/**
 * SCORING & FILTERING ENGINE
 * Module: scoring.js
 * Nhiệm vụ:
 * 1. Áp dụng Hard Filter (Hệ điều hành, Ngân sách) - Không cứu laptop vi phạm.
 * 2. Normalization các tiêu chí về thang điểm 0 - 100.
 * 3. Tính Final Match Score theo mô hình Weighted Sum Model.
 * 4. Xếp hạng và trích xuất Top 1 - 3 laptop phù hợp nhất.
 * 5. Tạo giải thích chi tiết (Explanation) minh bạch cho từng kết quả.
 */

const BUDGET_BOUNDS = {
  'duoi_15': { min: 8000000, max: 15000000, label: 'Dưới 15 triệu' },
  '15_25': { min: 15000000, max: 25000000, label: '15 – 25 triệu' },
  '25_35': { min: 25000000, max: 35000000, label: '25 – 35 triệu' },
  'tren_35': { min: 35000000, max: 60000000, label: 'Trên 35 triệu' }
};

/**
 * Chuyển đổi Tier (1 - 5) sang thang điểm 20 - 100
 */
function tierToScore(tier) {
  const safeTier = Math.max(1, Math.min(5, Number(tier) || 1));
  return safeTier * 20; // T1=20, T2=40, T3=60, T4=80, T5=100
}

/**
 * 1. HARD FILTER: Lọc theo Hệ điều hành và Khoảng ngân sách (Ràng buộc chặt chẽ)
 */
function applyHardFilters(laptops, userFilters) {
  const { osChoice, budgetKey } = userFilters;

  return laptops.filter(laptop => {
    // 1. Kiểm tra Hệ điều hành (Hard Filter)
    if (osChoice === 'windows' && laptop.os !== 'Windows') return false;
    if (osChoice === 'macos' && laptop.os !== 'macOS') return false;
    // Nếu chọn 'any' hoặc 'khong_quan_trong', cho phép cả Windows & macOS

    // 2. Kiểm tra Ngân sách (Hard Filter - Tuyệt đối chỉ nằm trong mức đã chọn)
    const price = Number(laptop.price);

    // Máy bắt buộc phải có giá hợp lệ (> 0)
    if (!price || price <= 0 || isNaN(price)) {
      return false;
    }

    if (budgetKey === 'duoi_15') {
      // Dưới 15 triệu: phải < 15.000.000
      if (price >= 15000000) return false;
    } else if (budgetKey === '15_25') {
      // 15 - 25 triệu: 15.000.000 <= price <= 25.000.000
      if (price < 15000000 || price > 25000000) return false;
    } else if (budgetKey === '25_35') {
      // 25 - 35 triệu: 25.000.000 <= price <= 35.000.000
      if (price < 25000000 || price > 35000000) return false;
    } else if (budgetKey === 'tren_35') {
      // Trên 35 triệu: price > 35.000.000
      if (price <= 35000000) return false;
    }

    return true;
  });
}

/**
 * 2. NORMALIZATION: Chuẩn hóa từng thông số sang điểm số 0 - 100
 */
function calculateNormalizedScores(laptop, requirements, budgetKey) {
  const req = requirements || {
    ramGB: 8,
    cpuTier: 2,
    gpuTier: 1,
    ssdGB: 512,
    batteryHours: 50,
    weightKg: 2.0,
    displayTier: 2
  };

  // RAM Score: min(100, actualRAM / requiredRAM * 100)
  const reqRAM = req.ramGB || 8;
  const ramScore = Math.min(100, Math.round((laptop.ramGB / reqRAM) * 100));

  // SSD Score: min(100, actualSSD / requiredSSD * 100)
  const reqSSD = req.ssdGB || 512;
  const ssdScore = Math.min(100, Math.round((laptop.ssdGB / reqSSD) * 100));

  // CPU Score: min(100, actualCPUScore / requiredCPUScore * 100)
  const reqCPUTier = req.cpuTier || 2;
  const cpuScore = Math.min(100, Math.round((tierToScore(laptop.cpuTier) / tierToScore(reqCPUTier)) * 100));

  // GPU Score: min(100, actualGPUScore / requiredGPUScore * 100)
  const reqGPUTier = req.gpuTier || 1;
  const gpuScore = Math.min(100, Math.round((tierToScore(laptop.gpuTier) / tierToScore(reqGPUTier)) * 100));

  // Battery Score: min(100, actualBatteryHours / requiredBatteryHours * 100)
  const reqBattery = req.batteryHours || 50;
  const batteryScore = Math.min(100, Math.round((laptop.batteryHours / reqBattery) * 100));

  // Weight Score: min(100, requiredWeight / actualWeight * 100) - Máy càng nhẹ càng tốt
  const reqWeight = req.weightKg || 2.0;
  const weightScore = Math.min(100, Math.round((reqWeight / laptop.weightKg) * 100));

  // Display Score: min(100, actualDisplayScore / requiredDisplayScore * 100)
  const reqDisplayTier = req.displayTier || 2;
  const displayScore = Math.min(100, Math.round((tierToScore(laptop.displayTier) / tierToScore(reqDisplayTier)) * 100));

  // Price Score: Càng thấp trong khoảng ngân sách -> điểm càng cao
  const budgetInfo = BUDGET_BOUNDS[budgetKey] || { min: 10000000, max: 30000000 };
  const minB = budgetInfo.min;
  const maxB = budgetInfo.max;
  let priceScore = 100;
  if (maxB > minB) {
    const rawPriceRatio = (laptop.price - minB) / (maxB - minB);
    priceScore = Math.round(100 - (rawPriceRatio * 100));
    priceScore = Math.max(0, Math.min(100, priceScore));
  }

  return {
    ramScore,
    ssdScore,
    cpuScore,
    gpuScore,
    batteryScore,
    weightScore,
    displayScore,
    priceScore
  };
}

/**
 * 3. WEIGHTED SUM: Tính Final Score
 */
function computeFinalScore(scores, weights) {
  const finalScore = (
    scores.cpuScore * weights.cpu +
    scores.ramScore * weights.ram +
    scores.gpuScore * weights.gpu +
    scores.ssdScore * weights.ssd +
    scores.batteryScore * weights.battery +
    scores.weightScore * weights.weight +
    scores.displayScore * weights.display +
    scores.priceScore * weights.price
  );

  return Math.round(finalScore * 10) / 10; // Làm tròn 1 chữ số thập phân
}

/**
 * 4. EXPLANATION BUILDER: Tạo danh sách lý do thuyết phục & minh bạch
 */
function generateExplanations(laptop, requirements) {
  const req = requirements || {};
  const explanations = [];

  // RAM explanation
  if (laptop.ramGB >= (req.ramGB || 8)) {
    explanations.push(`RAM ${laptop.ramGB}GB đáp ứng mượt mà yêu cầu tác vụ`);
  } else {
    explanations.push(`RAM ${laptop.ramGB}GB (chưa đạt mức mong muốn ${req.ramGB}GB)`);
  }

  // CPU explanation
  if (laptop.cpuTier >= (req.cpuTier || 2)) {
    explanations.push(`CPU ${laptop.cpu} đáp ứng tốt mức hiệu năng xử lý`);
  } else {
    explanations.push(`CPU ${laptop.cpu} (hiệu năng ở mức cơ bản)`);
  }

  // SSD explanation
  if (laptop.ssdGB >= (req.ssdGB || 512)) {
    explanations.push(`SSD ${laptop.ssdGB >= 1024 ? (laptop.ssdGB / 1024) + 'TB' : laptop.ssdGB + 'GB'} thoải mái lưu trữ dữ liệu`);
  }

  // GPU explanation
  if (laptop.gpuTier >= (req.gpuTier || 1)) {
    if (laptop.gpuTier >= 3) {
      explanations.push(`Card đồ họa rời (${laptop.gpu}) tối ưu đồ họa / gaming`);
    } else {
      explanations.push(`Đồ họa ${laptop.gpu} hoạt động ổn định, tiết kiệm điện`);
    }
  }

  // Battery & Weight
  if (laptop.batteryHours >= 70 || laptop.weightKg <= 1.5) {
    explanations.push(`Thời lượng pin ~${laptop.batteryHours}h & trọng lượng nhẹ (${laptop.weightKg}kg) tiện mang lên giảng đường`);
  }

  // Display
  if (laptop.displayTier >= 3) {
    explanations.push(`Màn hình sắc nét (${laptop.display}) hiển thị chân thực`);
  }

  return explanations;
}

/**
 * 5. RANKING PIPELINE CHÍNH
 * Nhận raw laptops list -> Hard Filter -> Normalization -> Weighted Scoring -> Ranking -> Top 3
 */
function rankLaptops(laptops, userAnswers, requirements, weights) {
  // B1: Hard Filter
  const filteredLaptops = applyHardFilters(laptops, {
    osChoice: userAnswers.osChoice,
    budgetKey: userAnswers.budgetKey
  });

  if (!filteredLaptops || filteredLaptops.length === 0) {
    return [];
  }

  // B2 & B3: Scoring & Explanations
  const scoredLaptops = filteredLaptops.map(laptop => {
    const scores = calculateNormalizedScores(laptop, requirements, userAnswers.budgetKey);
    const finalScore = computeFinalScore(scores, weights);
    const explanations = generateExplanations(laptop, requirements);

    return {
      ...laptop,
      scores,
      finalScore,
      explanations
    };
  });

  // B4: Sort descending theo Final Score
  scoredLaptops.sort((a, b) => b.finalScore - a.finalScore);

  // B5: Lấy tối đa Top 3 (Không nới lỏng requirement nếu chỉ có 1 hoặc 2 máy)
  return scoredLaptops.slice(0, 3);
}

window.LaptopScoring = {
  BUDGET_BOUNDS,
  tierToScore,
  applyHardFilters,
  calculateNormalizedScores,
  computeFinalScore,
  generateExplanations,
  rankLaptops
};
