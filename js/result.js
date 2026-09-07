/**
 * RESULTS & CARD RENDERING MODULE
 * Module: result.js
 * Nhiệm vụ:
 * 1. Render giao diện Kết quả Top 1 - 3 máy tính (bám sát Mockup 5).
 * 2. Hiển thị thông số chi tiết (CPU, RAM, SSD, GPU, Pin, Trọng lượng).
 * 3. Hiển thị thang điểm phù hợp (Match Score %) và lý do giải thích minh bạch.
 * 4. Xử lý trường hợp No-Match (Không có máy phù hợp mà không nới lỏng requirement).
 * 5. Nút "Xem chi tiết" mở trực tiếp laptop.productUrl.
 * 6. Hiển thị nút floating "Tư vấn thêm" CHỈ khi ở trang kết quả gợi ý.
 */

const RANK_BADGES = [
  { label: '★ PHÙ HỢP NHẤT', class: 'badge-mint' },
  { label: 'CÂN BẰNG NHẤT', class: 'badge-pink' },
  { label: 'HIỆU NĂNG TỐT', class: 'badge-yellow' }
];

function formatPriceVND(price) {
  if (!price && price !== 0) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(price)
    .replace('₫', 'đ');
}

/**
 * Tạo thẻ HTML của một laptop trong Top 3
 */
function createLaptopCardHTML(laptop, rankIndex) {
  const badgeInfo = RANK_BADGES[rankIndex] || { label: `#${rankIndex + 1} GỢI Ý`, class: 'badge-mint' };
  const formattedPrice = formatPriceVND(laptop.price);

  // Tạo danh sách lý do giải thích
  const explanationsHTML = (laptop.explanations || [])
    .map(exp => `<li><span class="bullet-icon">✓</span> ${exp}</li>`)
    .join('');

  return `
    <div class="result-laptop-card">
      <div class="card-top-badge ${badgeInfo.class}">
        ${badgeInfo.label}
      </div>

      <div class="laptop-img-wrapper">
        <div class="retro-laptop-frame">
          <img src="${laptop.image}" alt="${laptop.name}" class="laptop-thumbnail" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'" />
          <div class="screen-watermark">3T</div>
        </div>
      </div>

      <div class="laptop-title-section">
        <h3 class="laptop-name">${laptop.name}</h3>
        <div class="laptop-price">${formattedPrice}</div>
      </div>

      <div class="laptop-match-score">
        <div class="score-label">Độ tương thích: <strong>${Math.round(laptop.finalScore)}%</strong></div>
        <div class="score-progress-track">
          <div class="score-progress-fill" style="width: ${Math.min(100, Math.round(laptop.finalScore))}%;"></div>
        </div>
      </div>

      <table class="specs-mini-table">
        <tbody>
          <tr>
            <td class="spec-label">CPU</td>
            <td class="spec-value">${laptop.cpu}</td>
          </tr>
          <tr>
            <td class="spec-label">RAM</td>
            <td class="spec-value">${laptop.ramGB}GB</td>
          </tr>
          <tr>
            <td class="spec-label">Ổ CỨNG</td>
            <td class="spec-value">${laptop.ssdGB >= 1024 ? (laptop.ssdGB / 1024) + 'TB' : laptop.ssdGB + 'GB SSD'}</td>
          </tr>
          <tr>
            <td class="spec-label">ĐỒ HỌA</td>
            <td class="spec-value">${laptop.gpu}</td>
          </tr>
          <tr>
            <td class="spec-label">PIN / CÂN NẶNG</td>
            <td class="spec-value">~${laptop.batteryHours} giờ | ${laptop.weightKg}kg</td>
          </tr>
        </tbody>
      </table>

      <div class="laptop-explanation-box">
        <div class="exp-heading">Phù hợp với bạn vì:</div>
        <ul class="exp-list">
          ${explanationsHTML}
        </ul>
      </div>

      <div class="card-actions">
        <a href="${laptop.productUrl}" target="_blank" rel="noopener noreferrer" class="btn-detail-link">
          <span>XEM CHI TIẾT</span>
          <svg class="external-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>
  `;
}

/**
 * Render toàn bộ danh sách kết quả ra View
 * @param {Array<Object>} topLaptops - Danh sách tối đa 3 laptop đã xếp hạng
 */
function renderResults(topLaptops) {
  const homeContainer = document.getElementById('home-view-container');
  const questionnaireContainer = document.getElementById('questionnaire-view-container');
  const resultContainer = document.getElementById('result-view-container');
  const cardsContainer = document.getElementById('result-cards-grid');
  const emptyContainer = document.getElementById('result-empty-state');
  const resultCountTag = document.getElementById('result-count-tag');
  const btnFloatingConsult = document.getElementById('btn-floating-consult');

  if (homeContainer) homeContainer.classList.add('hidden');
  if (questionnaireContainer) questionnaireContainer.classList.add('hidden');
  if (!resultContainer) return;

  resultContainer.classList.remove('hidden');

  // HIỆN nút floating "Tư vấn thêm" ở trang kết quả
  if (btnFloatingConsult) {
    btnFloatingConsult.classList.remove('hidden');
  }

  if (!topLaptops || topLaptops.length === 0) {
    // Trạng thái No-Match (Không nới tiêu chí)
    if (cardsContainer) cardsContainer.innerHTML = '';
    if (cardsContainer) cardsContainer.classList.add('hidden');
    if (emptyContainer) emptyContainer.classList.remove('hidden');
    if (resultCountTag) resultCountTag.textContent = '00 GỢI Ý PHÙ HỢP';
  } else {
    if (emptyContainer) emptyContainer.classList.add('hidden');
    if (cardsContainer) {
      cardsContainer.classList.remove('hidden');
      cardsContainer.innerHTML = topLaptops.map((laptop, idx) => createLaptopCardHTML(laptop, idx)).join('');
    }
    if (resultCountTag) {
      const countPadded = String(topLaptops.length).padStart(2, '0');
      resultCountTag.textContent = `${countPadded} GỢI Ý PHÙ HỢP`;
    }
  }

  // Cuộn mượt về đầu trang kết quả
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.LaptopResultView = {
  formatPriceVND,
  createLaptopCardHTML,
  renderResults
};
