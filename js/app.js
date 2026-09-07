/**
 * MAIN APPLICATION COORDINATOR
 * Module: app.js
 * Nhiệm vụ:
 * 1. Khởi tạo toàn bộ luồng ứng dụng và nạp dữ liệu laptop.
 * 2. Kết nối: Home Page -> Questionnaire -> Mapping -> Requirements -> Hard Filter -> Scoring -> Top 3 -> Result View.
 * 3. Tích hợp sẵn Bộ Test Cases Tự Động (Test Suite) phục vụ kiểm thử 8 kịch bản từ tài liệu đặc tả.
 */

/**
 * DANH SÁCH LAPTOP DỰ PHÒNG (MOCK FALLBACK)
 * Được kích hoạt tự động nếu quá trình tải laptop_file.json gặp lỗi (CORS / 404 / mở qua file://)
 * Đảm bảo đầy đủ các hệ điều hành, phân khúc giá và cấu hình.
 */
const MOCK_LAPTOPS = [
  {
    id: 'mock-1',
    name: 'ASUS Vivobook 15 X1504VA',
    brand: 'Asus',
    os: 'Windows',
    price: 13990000,
    ramGB: 16,
    ssdGB: 512,
    cpu: 'Intel Core i5 1335U',
    cpuTier: 3,
    gpu: 'Intel Iris Xe Graphics (tích hợp)',
    gpuTier: 2,
    isDedicatedGpu: false,
    batteryHours: 42,
    weightKg: 1.7,
    display: '15.6 inch FHD',
    displayTier: 2,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://cellphones.com.vn'
  },
  {
    id: 'mock-2',
    name: 'Lenovo IdeaPad Slim 3 14IAH8',
    brand: 'Lenovo',
    os: 'Windows',
    price: 12490000,
    ramGB: 16,
    ssdGB: 512,
    cpu: 'Intel Core i5 12450H',
    cpuTier: 3,
    gpu: 'Intel UHD Graphics',
    gpuTier: 1,
    isDedicatedGpu: false,
    batteryHours: 47,
    weightKg: 1.43,
    display: '14.0 inch FHD',
    displayTier: 2,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://fptshop.com.vn'
  },
  {
    id: 'mock-3',
    name: 'Acer Nitro V 15 ANV15',
    brand: 'Acer',
    os: 'Windows',
    price: 19290000,
    ramGB: 16,
    ssdGB: 512,
    cpu: 'Intel Core i5 13420H',
    cpuTier: 3,
    gpu: 'NVIDIA GeForce RTX 4050 6GB',
    gpuTier: 4,
    isDedicatedGpu: true,
    batteryHours: 57,
    weightKg: 2.1,
    display: '15.6 inch 144Hz',
    displayTier: 3,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://cellphones.com.vn'
  },
  {
    id: 'mock-4',
    name: 'ASUS Vivobook S 14 OLED S5406MA',
    brand: 'Asus',
    os: 'Windows',
    price: 24490000,
    ramGB: 16,
    ssdGB: 512,
    cpu: 'Intel Core Ultra 5 125H',
    cpuTier: 3,
    gpu: 'Intel Arc Graphics (tích hợp)',
    gpuTier: 2,
    isDedicatedGpu: false,
    batteryHours: 75,
    weightKg: 1.3,
    display: '14.0 inch 3K OLED 120Hz',
    displayTier: 4,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://cellphones.com.vn'
  },
  {
    id: 'mock-5',
    name: 'Apple MacBook Air M1 13 inch',
    brand: 'Apple',
    os: 'macOS',
    price: 15990000,
    ramGB: 8,
    ssdGB: 256,
    cpu: 'Apple M1 8-Core',
    cpuTier: 3,
    gpu: 'Apple M1 7-Core GPU',
    gpuTier: 2,
    isDedicatedGpu: false,
    batteryHours: 49.9,
    weightKg: 1.29,
    display: '13.3 inch Retina',
    displayTier: 4,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://cellphones.com.vn'
  },
  {
    id: 'mock-6',
    name: 'Lenovo Yoga Slim 7 14IMH9',
    brand: 'Lenovo',
    os: 'Windows',
    price: 28990000,
    ramGB: 32,
    ssdGB: 1024,
    cpu: 'Intel Core Ultra 7 155H',
    cpuTier: 4,
    gpu: 'Intel Arc Graphics (tích hợp)',
    gpuTier: 2,
    isDedicatedGpu: false,
    batteryHours: 65,
    weightKg: 1.39,
    display: '14.0 inch 2.8K OLED 120Hz',
    displayTier: 4,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://fptshop.com.vn'
  },
  {
    id: 'mock-7',
    name: 'Apple MacBook Air M2 13 inch',
    brand: 'Apple',
    os: 'macOS',
    price: 26490000,
    ramGB: 16,
    ssdGB: 512,
    cpu: 'Apple M2 8-Core',
    cpuTier: 3,
    gpu: 'Apple M2 10-Core GPU',
    gpuTier: 2,
    isDedicatedGpu: false,
    batteryHours: 52.6,
    weightKg: 1.24,
    display: '13.6 inch Liquid Retina',
    displayTier: 4,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://cellphones.com.vn'
  },
  {
    id: 'mock-8',
    name: 'ASUS ROG Zephyrus G16 GU605',
    brand: 'Asus',
    os: 'Windows',
    price: 54990000,
    ramGB: 32,
    ssdGB: 1024,
    cpu: 'Intel Core Ultra 9 185H',
    cpuTier: 5,
    gpu: 'NVIDIA GeForce RTX 4070 8GB',
    gpuTier: 5,
    isDedicatedGpu: true,
    batteryHours: 90,
    weightKg: 1.85,
    display: '16.0 inch 2.5K OLED 240Hz',
    displayTier: 5,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://cellphones.com.vn'
  },
  {
    id: 'mock-9',
    name: 'Apple MacBook Pro 14 inch M3 Pro',
    brand: 'Apple',
    os: 'macOS',
    price: 49990000,
    ramGB: 18,
    ssdGB: 512,
    cpu: 'Apple M3 Pro 11-Core',
    cpuTier: 5,
    gpu: 'Apple M3 Pro 14-Core GPU',
    gpuTier: 4,
    isDedicatedGpu: false,
    batteryHours: 70,
    weightKg: 1.61,
    display: '14.2 inch Liquid Retina XDR',
    displayTier: 5,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://cellphones.com.vn'
  },
  {
    id: 'mock-10',
    name: 'Acer Predator Helios Neo 16',
    brand: 'Acer',
    os: 'Windows',
    price: 32990000,
    ramGB: 16,
    ssdGB: 512,
    cpu: 'Intel Core i7 14700HX',
    cpuTier: 4,
    gpu: 'NVIDIA GeForce RTX 4060 8GB',
    gpuTier: 4,
    isDedicatedGpu: true,
    batteryHours: 90,
    weightKg: 2.6,
    display: '16.0 inch 2K 165Hz',
    displayTier: 3,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://fptshop.com.vn'
  }
];

let cachedLaptops = [];
let questionnaire = null;

async function initApp() {
  console.log('[3T Laptop Advisor] Đang khởi tạo ứng dụng...');

  const fallbackBanner = document.getElementById('data-fallback-banner');

  try {
    // 1. Nạp và chuẩn hóa dữ liệu laptop từ file JSON tĩnh
    const loadedList = await window.LaptopAPI.fetchLaptops();
    if (!Array.isArray(loadedList) || loadedList.length === 0) {
      throw new Error('Dữ liệu tải về rỗng.');
    }
    cachedLaptops = loadedList;
    console.log(`[3T Laptop Advisor] Đã nạp thành công ${cachedLaptops.length} laptop từ file JSON.`);
    if (fallbackBanner) fallbackBanner.classList.add('hidden');
  } catch (err) {
    console.warn('[3T Laptop Advisor] Không thể tải file laptop_file.json (offline / CORS / file://), kích hoạt MOCK_LAPTOPS dự phòng...', err);
    // Gán thực sự mảng Mock Fallback để hệ thống tiếp tục hoạt động
    cachedLaptops = MOCK_LAPTOPS;
    if (fallbackBanner) fallbackBanner.classList.remove('hidden');
  }

  // 2. Khởi tạo Questionnaire UI Controller
  questionnaire = new window.QuestionnaireController((userAnswers) => {
    handleQuestionnaireCompleted(userAnswers);
  });
  window.questionnaire = questionnaire;
  window.cachedLaptops = cachedLaptops;

  // Gắn sự kiện cho nút floating "Tư vấn thêm" -> dẫn đến Fanpage ITB Club trên Facebook
  const btnFloatingConsult = document.getElementById('btn-floating-consult');
  if (btnFloatingConsult) {
    btnFloatingConsult.addEventListener('click', () => {
      window.open('https://www.facebook.com/itbclub.uel', '_blank', 'noopener,noreferrer');
    });
  }
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

  let laptops = cachedLaptops;
  if (!laptops || laptops.length === 0) {
    try {
      laptops = await window.LaptopAPI.fetchLaptops();
    } catch (e) {
      laptops = MOCK_LAPTOPS;
    }
  }
  if (!laptops || laptops.length === 0) {
    laptops = MOCK_LAPTOPS;
  }

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
});
