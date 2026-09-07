/**
 * QUESTIONNAIRE UI CONTROLLER
 * Module: questionnaire.js
 * Nhiệm vụ:
 * 1. Quản lý trạng thái chuyển bước (Home -> Step 1 -> Step 2 -> Step 3 -> Kết quả).
 * 2. KHÔNG CHỌN SẴN MẶC ĐỊNH bất kỳ câu hỏi nào.
 * 3. Chỉ kích hoạt hiệu ứng chọn khi người dùng chủ động tương tác.
 * 4. Bắt buộc kiểm tra (Strict Form Validation): Không câu trả lời nào được để trống trước khi chuyển bước.
 * 5. Cập nhật thanh tiến trình (Progress Bar 01 | 02 | 03).
 * 6. Ẩn nút floating "Tư vấn thêm" ở trang chủ và các bước câu hỏi.
 */

class QuestionnaireController {
  constructor(onCompleteCallback) {
    this.currentStep = 1;
    this.totalSteps = 3;
    this.onComplete = onCompleteCallback;

    // State câu trả lời của người dùng - MẶC ĐỊNH TRỐNG (KHÔNG CHỌN SẴN)
    this.state = {
      osChoice: null, // null | 'windows' | 'macos' | 'any'
      majorText: '',
      hasKnownConfig: null, // null | true ('roi') | false ('chua')

      // Step 3
      budgetKey: null, // null | 'duoi_15' | '15_25' | '25_35' | 'tren_35'
      priorityKey: null, // null | 'hieu_nang_cao' | 'mong_nhe' | 'gia_tot' | 'man_hinh_dep' | 'pin_lau'

      // Nhánh Chưa biết cấu hình:
      purposes: [], // Multi-select: ['hoc_tap', 'lap_trinh', 'do_hoa', 'gaming']
      intensityKey: null, // null | 'co_ban' | 'da_nhiem' | 'nang' | 'rat_nang' | 'chuyen_nganh'

      // Nhánh Đã biết cấu hình:
      ramChoice: null, // null | 'ram_8' | 'ram_16' | 'ram_32' | 'ram_64'
      configChoices: [] // Multi-select: ['ssd_256', 'ssd_512', 'ssd_1024', 'gpu_dedicated', 'battery_10h']
    };

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.homeView = document.getElementById('home-view-container');
    this.questionnaireView = document.getElementById('questionnaire-view-container');
    this.resultView = document.getElementById('result-view-container');
    this.btnFloatingConsult = document.getElementById('btn-floating-consult');

    this.stepContainers = {
      1: document.getElementById('step-1-container'),
      2: document.getElementById('step-2-container'),
      3: document.getElementById('step-3-container')
    };

    this.progressBar = document.getElementById('main-progress-bar');
    this.progressSteps = document.querySelectorAll('.progress-step-item');

    this.btnBack = document.getElementById('btn-global-back');
    this.btnNext = document.getElementById('btn-global-next');
    this.btnNextText = document.getElementById('btn-next-text');

    // Nút bắt đầu từ Home
    this.btnStartHero = document.getElementById('btn-start-consult');
    this.btnStartHeader = document.getElementById('btn-header-consult');
    this.brandHomeLinks = document.querySelectorAll('.brand-home-trigger');

    // Input ngành học
    this.inputMajor = document.getElementById('input-major-search');
    this.majorChips = document.querySelectorAll('.major-chip-btn');

    // Nhánh cấu hình Step 2
    this.branchCards = document.querySelectorAll('.branch-choice-card');

    // Containers của 2 nhánh ở Step 3
    this.branchUnknownContainer = document.getElementById('branch-unknown-content');
    this.branchKnownContainer = document.getElementById('branch-known-content');
  }

  bindEvents() {
    // 1. Chuyển từ Home sang Questionnaire
    if (this.btnStartHero) {
      this.btnStartHero.addEventListener('click', () => this.startQuestionnaire());
    }
    if (this.btnStartHeader) {
      this.btnStartHeader.addEventListener('click', () => this.startQuestionnaire());
    }
    this.brandHomeLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToHome();
      });
    });

    // 2. Điều hướng nút Back & Next trong Questionnaire
    if (this.btnBack) {
      this.btnBack.addEventListener('click', () => this.handleBack());
    }
    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => this.handleNext());
    }

    // 3. Step 1: Chọn OS (Single select)
    const osCards = document.querySelectorAll('.os-select-card');
    osCards.forEach(card => {
      card.addEventListener('click', () => {
        osCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.state.osChoice = card.dataset.os;
      });
    });

    // 4. Step 2: Input ngành học & Gợi ý phổ biến
    if (this.inputMajor) {
      this.inputMajor.addEventListener('input', (e) => {
        this.state.majorText = e.target.value;
        // Bỏ active của các chip nếu người dùng tự nhập khác
        this.majorChips.forEach(c => {
          if (c.dataset.major !== e.target.value) {
            c.classList.remove('active');
          }
        });
      });
    }

    this.majorChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const majorValue = chip.dataset.major;
        if (this.inputMajor) {
          this.inputMajor.value = majorValue;
          this.state.majorText = majorValue;
        }
        this.majorChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    // Step 2: Chọn nhánh "Rồi" hay "Chưa"
    this.branchCards.forEach(card => {
      card.addEventListener('click', () => {
        this.branchCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.state.hasKnownConfig = card.dataset.branch === 'roi';
        this.renderStep3BranchUI();
      });
    });

    // 5. Delegate events cho các button chọn trong Step 3
    document.addEventListener('click', (e) => {
      // Single select buttons (data-single-group)
      const singleBtn = e.target.closest('[data-single-group]');
      if (singleBtn) {
        const groupName = singleBtn.dataset.singleGroup;
        const groupValue = singleBtn.dataset.value;
        const parentSection = singleBtn.closest('.option-group-section') || singleBtn.parentElement;

        parentSection.querySelectorAll(`[data-single-group="${groupName}"]`).forEach(btn => {
          btn.classList.remove('active');
        });
        singleBtn.classList.add('active');

        if (groupName === 'budget') this.state.budgetKey = groupValue;
        if (groupName === 'priority') this.state.priorityKey = groupValue;
        if (groupName === 'intensity') this.state.intensityKey = groupValue;
        if (groupName === 'ram') this.state.ramChoice = groupValue;
      }

      // Multi select buttons (data-multi-group)
      const multiBtn = e.target.closest('[data-multi-group]');
      if (multiBtn) {
        const groupName = multiBtn.dataset.multiGroup;
        const groupValue = multiBtn.dataset.value;

        multiBtn.classList.toggle('active');
        const isActive = multiBtn.classList.contains('active');

        if (groupName === 'purposes') {
          if (isActive) {
            if (!this.state.purposes.includes(groupValue)) this.state.purposes.push(groupValue);
          } else {
            this.state.purposes = this.state.purposes.filter(p => p !== groupValue);
          }
        }

        if (groupName === 'config') {
          if (isActive) {
            if (!this.state.configChoices.includes(groupValue)) this.state.configChoices.push(groupValue);
          } else {
            this.state.configChoices = this.state.configChoices.filter(c => c !== groupValue);
          }
        }
      }
    });
  }

  startQuestionnaire() {
    if (this.homeView) this.homeView.classList.add('hidden');
    if (this.resultView) this.resultView.classList.add('hidden');
    if (this.btnFloatingConsult) this.btnFloatingConsult.classList.add('hidden');
    if (this.questionnaireView) this.questionnaireView.classList.remove('hidden');
    this.currentStep = 1;
    this.updateUI();
  }

  goToHome() {
    if (this.questionnaireView) this.questionnaireView.classList.add('hidden');
    if (this.resultView) this.resultView.classList.add('hidden');
    if (this.btnFloatingConsult) this.btnFloatingConsult.classList.add('hidden');
    if (this.homeView) this.homeView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderStep3BranchUI() {
    if (this.branchUnknownContainer && this.branchKnownContainer) {
      if (this.state.hasKnownConfig === true) {
        this.branchUnknownContainer.classList.add('hidden');
        this.branchKnownContainer.classList.remove('hidden');
      } else {
        this.branchUnknownContainer.classList.remove('hidden');
        this.branchKnownContainer.classList.add('hidden');
      }
    }
  }

  /**
   * KIỂM TRA HỢP LỆ (STRICT FORM VALIDATION) - KHÔNG ĐƯỢC ĐỂ TRỐNG
   */
  validateStep(stepNumber) {
    if (stepNumber === 1) {
      if (!this.state.osChoice) {
        alert('⚠️ Vui lòng chọn hệ điều hành bạn hay sử dụng để tiếp tục.');
        return false;
      }
      return true;
    }

    if (stepNumber === 2) {
      if (!this.state.majorText || !this.state.majorText.trim()) {
        alert('⚠️ Vui lòng nhập hoặc chọn ngành học của bạn.');
        if (this.inputMajor) this.inputMajor.focus();
        return false;
      }
      if (this.state.hasKnownConfig === null) {
        alert('⚠️ Vui lòng chọn bạn đã xác định cấu hình cần thiết chưa (Rồi / Chưa).');
        return false;
      }
      return true;
    }

    if (stepNumber === 3) {
      if (!this.state.budgetKey) {
        alert('⚠️ Vui lòng chọn khoảng Ngân sách mong muốn.');
        return false;
      }

      if (this.state.hasKnownConfig === true) {
        // Nhánh Đã biết cấu hình
        if (!this.state.ramChoice) {
          alert('⚠️ Vui lòng chọn dung lượng RAM mong muốn.');
          return false;
        }
        if (!this.state.configChoices || this.state.configChoices.length === 0) {
          alert('⚠️ Vui lòng chọn ít nhất 1 tiêu chí Cấu hình mong muốn.');
          return false;
        }
      } else {
        // Nhánh Chưa biết cấu hình
        if (!this.state.purposes || this.state.purposes.length === 0) {
          alert('⚠️ Vui lòng chọn ít nhất 1 Mục đích chính sử dụng máy.');
          return false;
        }
        if (!this.state.intensityKey) {
          alert('⚠️ Vui lòng chọn Cường độ sử dụng máy.');
          return false;
        }
      }

      if (!this.state.priorityKey) {
        alert('⚠️ Vui lòng chọn 1 mục tiêu Ưu tiên hàng đầu của bạn.');
        return false;
      }

      return true;
    }

    return true;
  }

  handleNext() {
    if (!this.validateStep(this.currentStep)) {
      return;
    }

    if (this.currentStep === 1) {
      this.currentStep = 2;
      this.updateUI();
    } else if (this.currentStep === 2) {
      this.renderStep3BranchUI();
      this.currentStep = 3;
      this.updateUI();
    } else if (this.currentStep === 3) {
      if (typeof this.onComplete === 'function') {
        this.onComplete(this.state);
      }
    }
  }

  handleBack() {
    if (this.currentStep === 1) {
      this.goToHome();
    } else if (this.currentStep > 1) {
      this.currentStep--;
      this.updateUI();
    }
  }

  goToStep(stepNumber) {
    if (this.homeView) this.homeView.classList.add('hidden');
    if (this.resultView) this.resultView.classList.add('hidden');
    if (this.btnFloatingConsult) this.btnFloatingConsult.classList.add('hidden');
    if (this.questionnaireView) this.questionnaireView.classList.remove('hidden');
    this.currentStep = stepNumber;
    this.updateUI();
  }

  updateUI() {
    // Ẩn nút Tư vấn thêm khi đang trả lời câu hỏi
    if (this.btnFloatingConsult) {
      this.btnFloatingConsult.classList.add('hidden');
    }

    // Hiển thị Container Step tương ứng
    Object.keys(this.stepContainers).forEach(key => {
      const container = this.stepContainers[key];
      if (container) {
        if (Number(key) === this.currentStep) {
          container.classList.remove('hidden');
        } else {
          container.classList.add('hidden');
        }
      }
    });

    // Cập nhật nút Back
    if (this.btnBack) {
      this.btnBack.style.visibility = 'visible';
    }

    // Cập nhật text nút Next
    if (this.btnNextText) {
      if (this.currentStep === 3) {
        this.btnNextText.textContent = 'XEM GỢI Ý MÁY →';
      } else {
        this.btnNextText.textContent = 'TIẾP THEO →';
      }
    }

    // Cập nhật thanh tiến trình (Progress Bar)
    this.progressSteps.forEach((stepEl, idx) => {
      const stepIndex = idx + 1;
      stepEl.classList.remove('active', 'completed');
      if (stepIndex < this.currentStep) {
        stepEl.classList.add('completed');
      } else if (stepIndex === this.currentStep) {
        stepEl.classList.add('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getState() {
    return { ...this.state };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
  }
}

window.QuestionnaireController = QuestionnaireController;
