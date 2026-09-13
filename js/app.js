/**
 * MAIN APPLICATION COORDINATOR
 * Module: app.js
 * Nhiệm vụ:
 * 1. Khởi tạo toàn bộ luồng ứng dụng và nạp dữ liệu laptop.
 * 2. Kết nối: Home Page -> Questionnaire -> Mapping -> Requirements -> Hard Filter -> Scoring -> Top 3 -> Result View.
 * 3. Tích hợp sẵn Bộ Test Cases Tự Động (Test Suite) phục vụ kiểm thử 8 kịch bản từ tài liệu đặc tả.
 */

let cachedLaptops = [];
let questionnaire = null;

async function initApp() {
  console.log('[3T Laptop Advisor] Đang khởi tạo ứng dụng...');

  try {
    // 1. Nạp và chuẩn hóa dữ liệu laptop từ file JSON tĩnh
    const loadedList = await window.LaptopAPI.fetchLaptops();
    if (!Array.isArray(loadedList) || loadedList.length === 0) {
      throw new Error('Dữ liệu tải về rỗng.');
    }
    cachedLaptops = loadedList;
    console.log(`[3T Laptop Advisor] Đã nạp thành công ${cachedLaptops.length} laptop từ file JSON.`);
  } catch (err) {
    console.error('[3T Laptop Advisor] Lỗi khi tải file laptop_file.json:', err);
  }

  // 2. Khởi tạo Questionnaire UI Controller
  questionnaire = new window.QuestionnaireController((userAnswers) => {
    handleQuestionnaireCompleted(userAnswers);
  });
  window.questionnaire = questionnaire;
  window.cachedLaptops = cachedLaptops;

  // Nút floating "Tư vấn thêm" đã chuyển sang thẻ <a> với href Zalo trực tiếp trong HTML
  // Không cần gắn sự kiện click nữa.
}

/**
 * Xử lý khi người dùng hoàn thành Questionnaire
 * @param {Object} userAnswers 
 */
function handleQuestionnaireCompleted(userAnswers) {
  console.log('[Questionnaire Output]:', userAnswers);

  // B1: Xây dựng Requirement theo nhánh người dùng đã chọn
  let reqResult;
  if (userAnswers.hasKnownConfig) {
    reqResult = window.LaptopMapping.buildRequirementsForKnownBranch(userAnswers);
  } else {
    reqResult = window.LaptopMapping.buildRequirementsForUnknownBranch(userAnswers);
  }

  const { industryGroup, requirements } = reqResult;
  console.log(`[Industry Matched]: ${industryGroup.name}`, industryGroup);
  console.log('[Calculated Requirements]:', requirements);

  // B2: Lấy ma trận trọng số theo Ưu tiên
  const weights = window.LaptopWeights.getWeightsByPriority(userAnswers.priorityKey);
  console.log(`[Applied Weights - ${weights.label}]:`, weights);

  // B3: Chạy Scoring & Ranking Engine
  const topLaptops = window.LaptopScoring.rankLaptops(cachedLaptops, userAnswers, requirements, weights);
  console.log('[Top 3 Results]:', topLaptops);

  // B4: Render kết quả ra màn hình
  window.LaptopResultView.renderResults(topLaptops);
}

/**
 * =========================================================================
 * AUTOMATED TEST SUITE: KIỂM THỬ 8 TEST CASES THEO ĐẶC TẢ
 * Có thể gọi trực tiếp trong browser console: window.runAllLaptopTests()
 * =========================================================================
 */
async function runAllLaptopTests() {
  console.group('🧪 BẮT ĐẦU CHẠY 8 TEST CASES KIỂM THỬ HỆ THỐNG TƯ VẤN LAPTOP');

  const laptops = cachedLaptops.length > 0 ? cachedLaptops : await window.LaptopAPI.fetchLaptops();
  const resultsSummary = [];

  function assert(testName, condition, detail) {
    if (condition) {
      console.log(`%c[PASS] ${testName}`, 'color: #10b981; font-weight: bold;', detail);
      resultsSummary.push({ test: testName, status: 'PASS', detail });
    } else {
      console.error(`%c[FAIL] ${testName}`, 'color: #ef4444; font-weight: bold;', detail);
      resultsSummary.push({ test: testName, status: 'FAIL', detail });
    }
  }

  // TEST 1: Windows + Business + Học tập/Văn phòng + Tác vụ cơ bản + Giá tốt
  {
    const answers = {
      osChoice: 'windows',
      majorText: 'Quản trị kinh doanh',
      hasKnownConfig: false,
      budgetKey: 'duoi_15',
      purposes: ['hoc_tap'],
      intensityKey: 'co_ban',
      priorityKey: 'gia_tot'
    };
    const reqResult = window.LaptopMapping.buildRequirementsForUnknownBranch(answers);
    const weights = window.LaptopWeights.getWeightsByPriority(answers.priorityKey);
    const top = window.LaptopScoring.rankLaptops(laptops, answers, reqResult.requirements, weights);
    
    assert(
      'TEST 1: Windows + Business + Học tập + Cơ bản + Giá tốt (<15M)',
      top.length > 0 && top.every(l => l.os === 'Windows' && l.price < 15000000),
      { topFound: top.map(l => `${l.name} (${l.price.toLocaleString()}đ)`) }
    );
  }

  // TEST 2: Windows + IT + Lập trình + Nhiều tab/Đa nhiệm + Hiệu năng cao
  {
    const answers = {
      osChoice: 'windows',
      majorText: 'Khoa học máy tính',
      hasKnownConfig: false,
      budgetKey: '15_25',
      purposes: ['lap_trinh'],
      intensityKey: 'da_nhiem',
      priorityKey: 'hieu_nang_cao'
    };
    const reqResult = window.LaptopMapping.buildRequirementsForUnknownBranch(answers);
    const weights = window.LaptopWeights.getWeightsByPriority(answers.priorityKey);
    const top = window.LaptopScoring.rankLaptops(laptops, answers, reqResult.requirements, weights);
    
    assert(
      'TEST 2: Windows + IT + Lập trình + Đa nhiệm + Hiệu năng cao (15-25M)',
      top.length > 0 && reqResult.requirements.ramGB === 16 && top.every(l => l.os === 'Windows'),
      { reqRAM: reqResult.requirements.ramGB, topFound: top.map(l => `${l.name} - Score: ${l.finalScore}`) }
    );
  }

  // TEST 3: Windows + Design + Đồ họa/Dựng phim + Phần mềm nặng + Màn hình đẹp
  {
    const answers = {
      osChoice: 'windows',
      majorText: 'Thiết kế đồ họa',
      hasKnownConfig: false,
      budgetKey: '25_35',
      purposes: ['do_hoa'],
      intensityKey: 'nang',
      priorityKey: 'man_hinh_dep'
    };
    const reqResult = window.LaptopMapping.buildRequirementsForUnknownBranch(answers);
    const weights = window.LaptopWeights.getWeightsByPriority(answers.priorityKey);
    const top = window.LaptopScoring.rankLaptops(laptops, answers, reqResult.requirements, weights);
    
    assert(
      'TEST 3: Windows + Design + Đồ họa + Nặng + Màn hình đẹp (25-35M)',
      top.length > 0 && reqResult.requirements.displayTier === 4 && weights.display === 0.25,
      { reqDisplayTier: reqResult.requirements.displayTier, displayWeight: weights.display, topFound: top.map(l => l.name) }
    );
  }

  // TEST 4: Windows + IT + Lập trình + Chơi game + Tác vụ rất nặng + Hiệu năng cao
  {
    const answers = {
      osChoice: 'windows',
      majorText: 'Hệ thống thông tin',
      hasKnownConfig: false,
      budgetKey: 'tren_35',
      purposes: ['lap_trinh', 'gaming'],
      intensityKey: 'rat_nang',
      priorityKey: 'hieu_nang_cao'
    };
    const reqResult = window.LaptopMapping.buildRequirementsForUnknownBranch(answers);
    const weights = window.LaptopWeights.getWeightsByPriority(answers.priorityKey);
    const top = window.LaptopScoring.rankLaptops(laptops, answers, reqResult.requirements, weights);
    
    assert(
      'TEST 4: Windows + IT + Lập trình + Game + Rất nặng (RAM 32GB, CPU T5, GPU T4)',
      reqResult.requirements.ramGB === 32 && reqResult.requirements.cpuTier === 5 && reqResult.requirements.gpuTier === 4,
      { finalReq: reqResult.requirements, topFound: top.map(l => l.name) }
    );
  }

  // TEST 5: macOS + Business + Học tập/Văn phòng + Tác vụ cơ bản + Mỏng nhẹ
  {
    const answers = {
      osChoice: 'macos',
      majorText: 'Kế toán',
      hasKnownConfig: false,
      budgetKey: '15_25',
      purposes: ['hoc_tap'],
      intensityKey: 'co_ban',
      priorityKey: 'mong_nhe'
    };
    const reqResult = window.LaptopMapping.buildRequirementsForUnknownBranch(answers);
    const weights = window.LaptopWeights.getWeightsByPriority(answers.priorityKey);
    const top = window.LaptopScoring.rankLaptops(laptops, answers, reqResult.requirements, weights);
    
    assert(
      'TEST 5: macOS + Business + Mỏng nhẹ (Chỉ trả về MacBook)',
      top.length > 0 && top.every(l => l.os === 'macOS'),
      { topFound: top.map(l => `${l.name} (${l.os})`) }
    );
  }

  // TEST 6: Budget thấp (<15M) nhưng yêu cầu macOS -> Kiểm tra NO-MATCH
  {
    const answers = {
      osChoice: 'macos',
      majorText: 'IT',
      hasKnownConfig: false,
      budgetKey: 'duoi_15', // Không có Macbook nào dưới 15M trong mock data
      purposes: ['lap_trinh'],
      intensityKey: 'co_ban',
      priorityKey: 'gia_tot'
    };
    const reqResult = window.LaptopMapping.buildRequirementsForUnknownBranch(answers);
    const weights = window.LaptopWeights.getWeightsByPriority(answers.priorityKey);
    const top = window.LaptopScoring.rankLaptops(laptops, answers, reqResult.requirements, weights);
    
    assert(
      'TEST 6: Hard Filter No-Match (macOS dưới 15M) -> Kết quả phải là mảng rỗng (length = 0)',
      top.length === 0,
      { countReturned: top.length }
    );
  }

  // TEST 7: Ngành học tự do "Công nghệ thực phẩm" -> Fallback OTHER
  {
    const majorGroup = window.LaptopMapping.getIndustryGroup('Công nghệ thực phẩm');
    assert(
      'TEST 7: Ngành học lạ không có trong từ khóa -> Fallback nhóm OTHER an toàn',
      majorGroup.id === 'OTHER' && majorGroup.baseline.ramGB === 8,
      { fallbackGroupId: majorGroup.id, baseline: majorGroup.baseline }
    );
  }

  // TEST 8: Multi-purpose "Lập trình" + "Chơi game" -> MAX criteria test
  {
    const answers = {
      osChoice: 'windows',
      majorText: 'Ngôn ngữ Anh',
      hasKnownConfig: false,
      budgetKey: '25_35',
      purposes: ['lap_trinh', 'gaming'], // Lập trình (GPU T1, SSD 512) + Gaming (GPU T4, SSD 1TB)
      intensityKey: 'co_ban',
      priorityKey: 'hieu_nang_cao'
    };
    const reqResult = window.LaptopMapping.buildRequirementsForUnknownBranch(answers);
    assert(
      'TEST 8: Chọn nhiều mục đích (Lập trình + Gaming) -> Requirement = MAX từng tiêu chí',
      reqResult.requirements.gpuTier === 4 && reqResult.requirements.ssdGB === 1024 && reqResult.requirements.ramGB === 16,
      { mergedRequirement: reqResult.requirements }
    );
  }

  console.table(resultsSummary);
  console.groupEnd();
  return resultsSummary;
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  window.runAllLaptopTests = runAllLaptopTests;

  // --- Hamburger Mobile Menu Toggle ---
  const hamburgerBtn = document.getElementById('hamburger-toggle');
  const navMenu = document.getElementById('main-nav-menu');
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      navMenu.classList.toggle('mobile-open');
    });

    // Close menu when a nav link or CTA button is clicked
    navMenu.querySelectorAll('.nav-link, .btn-header-start').forEach(el => {
      el.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('mobile-open');
      });
    });
  }
});
