/**
 * مدیریت رابط کاربری
 */

const UIHandler = {
    // وضعیت‌های هایلایت
    highlightStates: {
        sentences: false,
        paragraphs: false
    },

    // المان‌های DOM
    elements: {
        scoreCircle: null,
        scoreLabel: null,
        scoreDesc: null,
        wordCount: null,
        keywordCount: null,
        checksList: null,
        readabilityChecks: null,
        infoModal: null,
        infoTitle: null,
        infoBody: null,
        closeModalBtn: null,
        mainKeyword: null,
        secondaryKeywords: null
    },

    /**
     * مقداردهی اولیه
     */
    init() {
        this.cacheElements();
        this.attachEventListeners();
    },

    /**
     * ذخیره‌سازی المان‌های DOM
     */
    cacheElements() {
        this.elements = {
            scoreCircle: document.getElementById('scoreCircle'),
            scoreLabel: document.getElementById('scoreLabel'),
            scoreDesc: document.getElementById('scoreDesc'),
            wordCount: document.getElementById('wordCount'),
            keywordCount: document.getElementById('keywordCount'),
            checksList: document.getElementById('checksList'),
            readabilityChecks: document.getElementById('readabilityChecks'),
            infoModal: document.getElementById('infoModal'),
            infoTitle: document.getElementById('infoTitle'),
            infoBody: document.getElementById('infoBody'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            mainKeyword: document.getElementById('mainKeyword'),
            secondaryKeywords: document.getElementById('secondaryKeywords')
        };
    },

    /**
     * اتصال Event Listeners
     */
    attachEventListeners() {
        // بستن مودال
        this.elements.closeModalBtn.addEventListener('click', () => {
            this.closeInfoModal();
        });

        // کلیک روی پس‌زمینه مودال
        this.elements.infoModal.addEventListener('click', (e) => {
            if (e.target.id === 'infoModal') {
                this.closeInfoModal();
            }
        });

        // کلید Escape برای بستن مودال
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeInfoModal();
            }
        });
    },

    /**
     * نمایش وضعیت بدون کلمه کلیدی
     */
    showNoKeywordState() {
        this.elements.keywordCount.textContent = '0';
        this.elements.scoreCircle.textContent = '--';
        this.elements.scoreLabel.textContent = CONFIG.MESSAGES.NO_KEYWORD.label;
        this.elements.scoreDesc.textContent = CONFIG.MESSAGES.NO_KEYWORD.desc;
        this.elements.checksList.innerHTML = '';
        this.elements.readabilityChecks.innerHTML = '';
    },

    /**
     * نمایش پیشنهادات کلمات کلیدی
     */
    showKeywordSuggestions(suggestions, plainText) {
        const wordCount = Utils.countWords(plainText);
        
        // به‌روزرسانی آمار
        this.elements.wordCount.textContent = wordCount;
        this.elements.keywordCount.textContent = '0';
        
        // نمایش امتیاز
        this.elements.scoreCircle.textContent = '💡';
        this.elements.scoreCircle.style.borderColor = '#667eea';
        this.elements.scoreCircle.style.background = 'rgba(102, 126, 234, 0.2)';
        this.elements.scoreLabel.textContent = 'پیشنهاد کلمات کلیدی';
        this.elements.scoreDesc.textContent = 'کلمات پرتکرار در متن یافت شد';
        
        // نمایش پیشنهادات
        const suggestionCheck = {
            status: CONFIG.CHECK_STATUS.SUCCESS,
            title: 'پیشنهاد کلمات کلیدی',
            tooltip: 'بر اساس تحلیل محتوا، کلمات پرتکرار به عنوان کلمات کلیدی پیشنهاد می‌شوند.',
            desc: `بر اساس ${wordCount} کلمه، ${suggestions.length} پیشنهاد یافت شد`,
            detail: suggestions.map(s => 
                `${s.keyword}: ${s.frequency} بار (${s.type})`
            ).join('\n'),
            suggestions: suggestions
        };
        
        this.elements.checksList.innerHTML = this.createCheckHTML(suggestionCheck);
        
        // اتصال event listeners
        this.elements.checksList.querySelectorAll('.keyword-suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const keyword = e.currentTarget.getAttribute('data-keyword');
                this.handleKeywordSuggestionClick(keyword);
            });
        });
        
        // پاک کردن بخش خوانایی
        this.elements.readabilityChecks.innerHTML = '';
    },

    /**
     * به‌روزرسانی نمایش نتایج تحلیل
     */
    updateAnalysisResults(results, mainKeyword) {
        // به‌روزرسانی آمار
        this.elements.wordCount.textContent = results.totalWords;
        this.elements.keywordCount.textContent = results.keywordCount;

        // محاسبه امتیاز
        const score = SEOAnalyzer.calculateScore(results.checks);
        this.updateScore(score);

        // نمایش چک‌های SEO
        this.renderChecks(results.checks, this.elements.checksList);

        // نمایش چک‌های خوانایی
        this.renderChecks(results.readabilityChecks, this.elements.readabilityChecks);
    },

    /**
     * به‌روزرسانی نمایش امتیاز
     */
    updateScore(score) {
        this.elements.scoreCircle.textContent = score;

        let colors, message;
        if (score >= CONFIG.SCORE_THRESHOLDS.EXCELLENT) {
            colors = CONFIG.STATUS_COLORS.success;
            message = CONFIG.MESSAGES.EXCELLENT;
        } else if (score >= CONFIG.SCORE_THRESHOLDS.GOOD) {
            colors = CONFIG.STATUS_COLORS.warning;
            message = CONFIG.MESSAGES.GOOD;
        } else {
            colors = CONFIG.STATUS_COLORS.error;
            message = CONFIG.MESSAGES.POOR;
        }

        this.elements.scoreCircle.style.borderColor = colors.border;
        this.elements.scoreCircle.style.background = colors.background;
        this.elements.scoreLabel.textContent = message.label;
        this.elements.scoreDesc.textContent = message.desc;
    },

    /**
     * رندر کردن چک‌ها
     */
    renderChecks(checks, container) {
        const isReadabilitySection = container.id === 'readabilityChecks';
        
        if (isReadabilitySection) {
            container.innerHTML = checks.map(check => this.createReadabilityCheckHTML(check)).join('');
            
            // اتصال event listeners به آیکون‌های چشم
            container.querySelectorAll('.readability-check-eye').forEach(icon => {
                icon.addEventListener('click', (e) => {
                    const type = e.target.getAttribute('data-type');
                    this.toggleReadabilityHighlight(type);
                });
            });
        } else {
            container.innerHTML = checks.map(check => this.createCheckHTML(check)).join('');
        }
        
        // اتصال event listeners به آیکون‌های اطلاعات
        container.querySelectorAll('.check-info').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const title = e.target.getAttribute('data-title');
                const tooltip = e.target.getAttribute('data-tooltip');
                this.showInfoModal(title, tooltip);
            });
        });
        
        // اتصال event listeners به پیشنهادات کلمات کلیدی
        container.querySelectorAll('.keyword-suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const keyword = e.currentTarget.getAttribute('data-keyword');
                this.handleKeywordSuggestionClick(keyword);
            });
        });
    },

    /**
     * ساخت HTML برای یک چک
     */
    createCheckHTML(check) {
        const icon = CONFIG.STATUS_ICONS[check.status];
        const escapedTitle = Utils.escapeHtml(check.title);
        const escapedTooltip = Utils.escapeHtml(check.tooltip);
        
        let suggestionsHTML = '';
        if (check.suggestions && check.suggestions.length > 0) {
            // تعیین کلاس CSS بر اساس نوع چک
            const suggestionsClass = check.title.includes('اصلی') ? 'main-keyword-suggestions' : 
                                   check.title.includes('فرعی') ? 'secondary-keyword-suggestions' : 
                                   'keyword-suggestions';
            
            suggestionsHTML = `
                <div class="keyword-suggestions ${suggestionsClass}">
                    ${check.suggestions.map(suggestion => `
                        <div class="keyword-suggestion-item" data-keyword="${Utils.escapeHtml(suggestion.keyword)}">
                            <div class="keyword-suggestion-text">${Utils.escapeHtml(suggestion.keyword)}</div>
                            <div class="keyword-suggestion-meta">
                                <span class="keyword-suggestion-count">${suggestion.frequency}</span>
                                <span class="keyword-suggestion-type">${suggestion.type}</span>
                                ${suggestion.quality ? `<span class="keyword-suggestion-quality">Q:${suggestion.quality}</span>` : ''}
                                ${suggestion.relevance ? `<span class="keyword-suggestion-relevance">R:${suggestion.relevance}</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        return `
            <div class="check-item">
                <div class="check-header">
                    <div class="check-icon ${check.status}">${icon}</div>
                    <div class="check-title">${check.title}</div>
                    <div class="check-info" data-title="${escapedTitle}" data-tooltip="${escapedTooltip}">ℹ</div>
                </div>
                <div class="check-desc">${check.desc}</div>
                ${check.detail ? `<div class="check-detail">${check.detail}</div>` : ''}
                ${suggestionsHTML}
            </div>
        `;
    },

    /**
     * ساخت HTML برای چک‌های خوانایی
     */
    createReadabilityCheckHTML(check) {
        const icon = CONFIG.STATUS_ICONS[check.status];
        const escapedTitle = Utils.escapeHtml(check.title);
        const escapedTooltip = Utils.escapeHtml(check.tooltip);
        
        // تعیین نوع آیکون چشم بر اساس عنوان
        let eyeType = '';
        if (check.title.includes('جملات')) {
            eyeType = 'sentences';
        } else if (check.title.includes('پاراگراف')) {
            eyeType = 'paragraphs';
        }
        
        return `
            <div class="readability-check-item">
                <div class="readability-check-header">
                    <div class="readability-check-icon ${check.status}">${icon}</div>
                    <div class="readability-check-title">${check.title}</div>
                    ${eyeType ? `<div class="readability-check-eye" data-type="${eyeType}" title="نمایش ${check.title}">👁️</div>` : ''}
                    <div class="check-info" data-title="${escapedTitle}" data-tooltip="${escapedTooltip}">ℹ</div>
                </div>
                <div class="readability-check-desc">${check.desc}</div>
                ${check.detail ? `<div class="check-detail">${check.detail}</div>` : ''}
            </div>
        `;
    },

    /**
     * نمایش مودال اطلاعات
     */
    showInfoModal(title, body) {
        this.elements.infoTitle.innerHTML = title;
        this.elements.infoBody.innerHTML = body;
        this.elements.infoModal.classList.add('active');
    },

    /**
     * بستن مودال اطلاعات
     */
    closeInfoModal() {
        this.elements.infoModal.classList.remove('active');
    },


    /**
     * اعمال هایلایت‌ها به محتوا
     */
    applyHighlights() {
        const editor = window.editorInstance;
        if (!editor) return;

        const body = editor.getBody();
        
        // پاک کردن تمام هایلایت‌های قبلی
        this.clearHighlights(body);
        
        // اعمال هایلایت پاراگراف‌ها
        if (this.highlightStates.paragraphs) {
            this.highlightLongParagraphs(body);
        }
        
        // اعمال هایلایت جملات
        if (this.highlightStates.sentences) {
            this.highlightLongSentences(body);
        }
    },

    /**
     * پاک کردن تمام هایلایت‌ها
     */
    clearHighlights(body) {
        body.querySelectorAll('p').forEach(p => {
            p.style.background = '';
            p.style.borderRight = '';
            p.style.borderBottom = '';
            p.style.padding = '';
        });
    },

    /**
     * هایلایت پاراگراف‌های طولانی
     */
    highlightLongParagraphs(body) {
        body.querySelectorAll('p').forEach(p => {
            const wordCount = Utils.countWords((p.textContent || '').trim());
            if (wordCount > CONFIG.SEO_LIMITS.MAX_PARAGRAPH_WORDS) {
                p.style.background = 'rgba(245, 158, 11, 0.2)';
                p.style.borderRight = '4px solid #f59e0b';
                p.style.padding = '10px';
            }
        });
    },

    /**
     * هایلایت جملات طولانی
     */
    highlightLongSentences(body) {
        body.querySelectorAll('p').forEach(p => {
            const text = (p.textContent || '').trim();
            const sentences = Utils.splitIntoSentences(text);
            
            for (let sentence of sentences) {
                const wordCount = Utils.countWords(sentence.trim());
                if (wordCount > CONFIG.SEO_LIMITS.MAX_SENTENCE_WORDS) {
                    p.style.background = 'rgba(239, 68, 68, 0.2)';
                    p.style.borderBottom = '2px solid #ef4444';
                    break;
                }
            }
        });
    },

    /**
     * فعال/غیرفعال کردن هایلایت خوانایی
     */
    toggleReadabilityHighlight(type) {
        if (type === 'sentences') {
            this.highlightStates.sentences = !this.highlightStates.sentences;
        } else if (type === 'paragraphs') {
            this.highlightStates.paragraphs = !this.highlightStates.paragraphs;
        }
        
        // به‌روزرسانی آیکون چشم
        const eyeIcon = document.querySelector(`[data-type="${type}"]`);
        if (eyeIcon) {
            eyeIcon.classList.toggle('active');
            eyeIcon.textContent = this.highlightStates[type] ? '👁️‍🗨️' : '👁️';
        }
        
        this.applyHighlights();
    },

    /**
     * مدیریت کلیک روی پیشنهاد کلمه کلیدی
     */
    handleKeywordSuggestionClick(keyword) {
        // بررسی اینکه آیا کلمه کلیدی اصلی خالی است یا نه
        const currentMainKeyword = this.elements.mainKeyword.value.trim();
        
        if (!currentMainKeyword) {
            // اگر کلمه کلیدی اصلی خالی است، آن را تنظیم کن
            this.elements.mainKeyword.value = keyword;
            this.elements.mainKeyword.focus();
            
            // نمایش پیام موفقیت
            this.showTemporaryMessage('کلمه کلیدی اصلی تنظیم شد: ' + keyword, 'success');
        } else {
            // اگر کلمه کلیدی اصلی پر است، به کلمات فرعی اضافه کن
            const currentSecondary = this.elements.secondaryKeywords.value.trim();
            const secondaryArray = currentSecondary ? currentSecondary.split(',').map(k => k.trim()) : [];
            
            // بررسی اینکه آیا کلمه قبلاً اضافه شده یا نه
            if (!secondaryArray.includes(keyword)) {
                secondaryArray.push(keyword);
                this.elements.secondaryKeywords.value = secondaryArray.join(', ');
                this.elements.secondaryKeywords.focus();
                
                // نمایش پیام موفقیت
                this.showTemporaryMessage('کلمه کلیدی فرعی اضافه شد: ' + keyword, 'success');
            } else {
                // نمایش پیام هشدار
                this.showTemporaryMessage('این کلمه قبلاً اضافه شده است', 'warning');
            }
        }
        
        // اجرای تحلیل مجدد
        if (window.MainApp && window.MainApp.analyzeContent) {
            window.MainApp.analyzeContent();
        }
    },

    /**
     * نمایش پیام موقت
     */
    showTemporaryMessage(message, type = 'info') {
        // ایجاد عنصر پیام
        const messageEl = document.createElement('div');
        messageEl.className = `temporary-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#667eea'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-family: 'Vazir', Tahoma, sans-serif;
            font-size: 14px;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        
        // اضافه کردن انیمیشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageEl);
        
        // حذف پیام بعد از 3 ثانیه
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }, 3000);
    },

    /**
     * دریافت مقادیر کلمات کلیدی
     */
    getKeywords() {
        return {
            mainKeyword: this.elements.mainKeyword.value.trim(),
            secondaryKeywords: this.elements.secondaryKeywords.value
                .split(',')
                .map(k => k.trim())
                .filter(k => k.length > 0)
        };
    }
};

// Export برای استفاده در سایر ماژول‌ها
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIHandler;
}