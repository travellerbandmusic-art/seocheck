/**
 * ماژول تحلیل SEO
 */

const SEOAnalyzer = {
    /**
     * تحلیل کامل محتوا
     */
    analyze(content, mainKeyword, secondaryKeywords) {
        const plainText = Utils.extractText(content);
        const totalWords = Utils.countWords(plainText);
        const keywordCount = Utils.findKeyword(plainText, mainKeyword).length;
        const keywordDensity = Utils.calculatePercentage(keywordCount, totalWords);

        return {
            totalWords,
            keywordCount,
            keywordDensity,
            checks: this.performSEOChecks(content, plainText, mainKeyword, secondaryKeywords, totalWords, keywordCount, keywordDensity),
            readabilityChecks: this.performReadabilityChecks(content, plainText)
        };
    },

    /**
     * انجام چک‌های SEO
     */
    performSEOChecks(content, plainText, mainKeyword, secondaryKeywords, totalWords, keywordCount, keywordDensity) {
        const checks = [];

        // چک عنوان H1
        checks.push(this.checkH1Keyword(content, mainKeyword));

        // چک تصاویر
        checks.push(this.checkImageAlt(content, mainKeyword));

        // چک پاراگراف اول
        checks.push(this.checkFirstParagraph(content, mainKeyword));

        // چک تراکم کلمه کلیدی
        checks.push(this.checkKeywordDensity(keywordDensity, keywordCount, totalWords));

        // چک کلمات کلیدی فرعی
        checks.push(this.checkSecondaryKeywords(plainText, secondaryKeywords));

        // چک رنگ آبی
        checks.push(this.checkBlueKeyword(content, mainKeyword));

        // چک نسبت تصویر به متن
        checks.push(this.checkImageRatio(content, totalWords));

        // چک لینک‌دهی با کلمات کلیدی
        checks.push(this.checkKeywordLinking(content, mainKeyword, secondaryKeywords));

        // تشخیص کلمه کلیدی اصلی
        checks.push(this.detectMainKeyword(plainText));

        // تشخیص کلمات کلیدی فرعی
        checks.push(this.detectSecondaryKeywords(plainText));

        return checks;
    },

    /**
     * چک کلمه کلیدی در H1
     */
    checkH1Keyword(content, mainKeyword) {
        const h1Check = Utils.hasKeywordInSection(content, mainKeyword, 'h1');
        
        return {
            status: h1Check.found ? CONFIG.CHECK_STATUS.SUCCESS : CONFIG.CHECK_STATUS.ERROR,
            title: 'کلمه کلیدی در عنوان (H1)',
            tooltip: 'عنوان اصلی مقاله (H1) باید حتماً شامل کلمه کلیدی باشد. این مهم‌ترین تگ برای سئو است.',
            desc: h1Check.found ? 'عنوان شامل کلمه کلیدی است ✓' : 'عنوان H1 باید شامل کلمه کلیدی اصلی باشد',
            detail: h1Check.found ? `عنوان: "${h1Check.text}"` : null
        };
    },

    /**
     * چک متن جایگزین تصاویر
     */
    checkImageAlt(content, mainKeyword) {
        const imgCheck = Utils.hasKeywordInSection(content, mainKeyword, 'img');
        
        return {
            status: imgCheck.found ? CONFIG.CHECK_STATUS.SUCCESS : CONFIG.CHECK_STATUS.WARNING,
            title: 'کلمه کلیدی در زیرنویس تصاویر',
            tooltip: 'استفاده از کلمه کلیدی در متن جایگزین (alt) تصاویر به بهبود سئو تصاویر و دسترسی‌پذیری کمک می‌کند.',
            desc: imgCheck.found 
                ? 'حداقل یک تصویر دارای alt با کلمه کلیدی است ✓' 
                : 'توصیه می‌شود از کلمه کلیدی در متن جایگزین (alt) تصاویر استفاده کنید',
            detail: imgCheck.found ? `Alt: "${imgCheck.text}"` : null
        };
    },

    /**
     * چک پاراگراف اول
     */
    checkFirstParagraph(content, mainKeyword) {
        const firstPara = Utils.getFirstParagraph(content);
        const inFirstPara = Utils.findKeyword(firstPara, mainKeyword).length > 0;
        
        return {
            status: inFirstPara ? CONFIG.CHECK_STATUS.SUCCESS : CONFIG.CHECK_STATUS.ERROR,
            title: 'کلمه کلیدی در پاراگراف اول',
            tooltip: 'پاراگراف اول مقاله (بدون در نظر گرفتن عنوان H1) باید حتماً شامل کلمه کلیدی باشد تا موضوع مقاله از ابتدا مشخص شود.',
            desc: inFirstPara 
                ? 'پاراگراف اول شامل کلمه کلیدی است ✓' 
                : 'پاراگراف اول باید حتماً شامل کلمه کلیدی باشد',
            detail: inFirstPara ? Utils.displayText(firstPara.substring(0, 80)) + '...' : null
        };
    },

    /**
     * چک تراکم کلمه کلیدی
     */
    checkKeywordDensity(density, keywordCount, totalWords) {
        const { MIN_KEYWORD_DENSITY, MAX_KEYWORD_DENSITY } = CONFIG.SEO_LIMITS;
        const densityOK = density >= MIN_KEYWORD_DENSITY && density <= MAX_KEYWORD_DENSITY;
        
        let status, desc;
        if (densityOK) {
            status = CONFIG.CHECK_STATUS.SUCCESS;
            desc = `تراکم مناسب: ${Utils.formatDecimal(density)}% ✓`;
        } else if (density < MIN_KEYWORD_DENSITY) {
            status = CONFIG.CHECK_STATUS.WARNING;
            desc = `تراکم کم: ${Utils.formatDecimal(density)}% (باید بین ${MIN_KEYWORD_DENSITY} تا ${MAX_KEYWORD_DENSITY} درصد باشد)`;
        } else {
            status = CONFIG.CHECK_STATUS.ERROR;
            desc = `تراکم زیاد: ${Utils.formatDecimal(density)}% (خطر Keyword Stuffing)`;
        }
        
        return {
            status,
            title: 'تراکم کلمه کلیدی',
            tooltip: `تراکم مناسب کلمه کلیدی بین ${MIN_KEYWORD_DENSITY} تا ${MAX_KEYWORD_DENSITY} درصد است. کمتر از این باعث ضعف سئو و بیشتر از این باعث Keyword Stuffing می‌شود.`,
            desc,
            detail: `${keywordCount} بار از ${totalWords} کلمه`
        };
    },

    /**
     * چک کلمات کلیدی فرعی
     */
    checkSecondaryKeywords(plainText, secondaryKeywords) {
        if (secondaryKeywords.length === 0) {
            return {
                status: CONFIG.CHECK_STATUS.WARNING,
                title: 'کلمات کلیدی فرعی',
                tooltip: 'کلمات کلیدی فرعی به جذب ترافیک از جستجوهای مرتبط کمک می‌کنند. حداقل 70% از کلمات فرعی باید در متن باشند.',
                desc: 'هیچ کلمه کلیدی فرعی تعریف نشده است',
                detail: 'لطفاً کلمات کلیدی فرعی را در بالا وارد کنید'
            };
        }

        const foundSecondary = secondaryKeywords.filter(kw => 
            Utils.findKeyword(plainText, kw).length > 0
        );
        
        const percentage = (foundSecondary.length / secondaryKeywords.length) * 100;
        const isGood = percentage >= CONFIG.SEO_LIMITS.MIN_SECONDARY_KEYWORD_PERCENTAGE;
        
        return {
            status: isGood ? CONFIG.CHECK_STATUS.SUCCESS : CONFIG.CHECK_STATUS.WARNING,
            title: 'کلمات کلیدی فرعی',
            tooltip: 'کلمات کلیدی فرعی به جذب ترافیک از جستجوهای مرتبط کمک می‌کنند. حداقل 70% از کلمات فرعی باید در متن باشند.',
            desc: `${foundSecondary.length} از ${secondaryKeywords.length} کلمه فرعی در متن یافت شد`,
            detail: foundSecondary.length > 0 
                ? `یافت شده: ${foundSecondary.map(k => Utils.displayText(k)).join('، ')}`
                : 'هیچ کلمه فرعی در متن یافت نشد'
        };
    },

    /**
     * چک رنگ آبی برای کلمه کلیدی
     */
    checkBlueKeyword(content, mainKeyword) {
        const temp = document.createElement('div');
        temp.innerHTML = content;
        const blueElements = temp.querySelectorAll(
            '[style*="color"][style*="blue"], ' +
            '[style*="color: rgb(0, 0, 255)"], ' +
            '[style*="color:#00f"], ' +
            '[style*="color: #0000ff"]'
        );
        
        let hasBlueKeyword = false;
        for (let element of blueElements) {
            if (Utils.findKeyword(element.textContent, mainKeyword).length > 0) {
                hasBlueKeyword = true;
                break;
            }
        }
        
        return {
            status: hasBlueKeyword ? CONFIG.CHECK_STATUS.SUCCESS : CONFIG.CHECK_STATUS.WARNING,
            title: 'رنگ آبی برای کلمه کلیدی',
            tooltip: 'رنگ آبی برای کلمه کلیدی باعث تمایز بصری و جلب توجه خواننده می‌شود و به یادآوری موضوع اصلی کمک می‌کند.',
            desc: hasBlueKeyword 
                ? 'کلمه کلیدی به رنگ آبی است ✓' 
                : 'توصیه می‌شود کلمه کلیدی اصلی را به رنگ آبی نمایش دهید'
        };
    },

    /**
     * چک نسبت تصویر به متن
     */
    checkImageRatio(content, totalWords) {
        const temp = document.createElement('div');
        temp.innerHTML = content;
        const imageCount = temp.querySelectorAll('img').length;
        const wordsPerImage = imageCount > 0 ? totalWords / imageCount : totalWords;
        const imageRatioOK = imageCount > 0 && wordsPerImage <= CONFIG.SEO_LIMITS.MAX_ACCEPTABLE_WORDS_PER_IMAGE;
        
        let status, desc, detail;
        
        if (imageCount === 0) {
            status = CONFIG.CHECK_STATUS.ERROR;
            desc = 'هیچ تصویری در محتوا وجود ندارد';
            detail = 'لطفاً تصویر به محتوا اضافه کنید';
        } else if (imageRatioOK) {
            status = CONFIG.CHECK_STATUS.SUCCESS;
            desc = `نسبت مناسب: ${imageCount} تصویر برای ${totalWords} کلمه ✓`;
            detail = null;
        } else {
            status = CONFIG.CHECK_STATUS.WARNING;
            desc = `نسبت نامناسب: ${Math.round(wordsPerImage)} کلمه به ازای هر تصویر`;
            detail = `توصیه می‌شود حداقل ${Math.ceil(totalWords / CONFIG.SEO_LIMITS.WORDS_PER_IMAGE)} تصویر داشته باشید`;
        }
        
        return {
            status,
            title: 'نسبت تصویر به متن',
            tooltip: 'برای خوانایی بهتر و جلوگیری از خستگی خواننده، توصیه می‌شود هر 300 تا 400 کلمه یک تصویر در محتوا قرار گیرد.',
            desc,
            detail
        };
    },

    /**
     * چک لینک‌دهی با کلمات کلیدی
     */
    checkKeywordLinking(content, mainKeyword, secondaryKeywords) {
        const temp = document.createElement('div');
        temp.innerHTML = content;
        const allLinks = temp.querySelectorAll('a[href]');
        
        if (allLinks.length === 0) {
            return {
                status: CONFIG.CHECK_STATUS.WARNING,
                title: 'لینک‌دهی با کلمات کلیدی',
                tooltip: 'استفاده از کلمات کلیدی در لینک‌ها به بهبود سئو و تجربه کاربری کمک می‌کند. لینک‌ها باید با کلمات کلیدی اصلی یا فرعی مرتبط باشند.',
                desc: 'هیچ لینکی در محتوا یافت نشد',
                detail: 'توصیه می‌شود حداقل یک لینک مرتبط با کلمات کلیدی اضافه کنید'
            };
        }

        // بررسی لینک‌های حاوی کلمه کلیدی اصلی
        const mainKeywordLinks = Array.from(allLinks).filter(link => {
            const linkText = link.textContent.toLowerCase().trim();
            const mainKeywordLower = mainKeyword.toLowerCase();
            return linkText.includes(mainKeywordLower);
        });

        // بررسی لینک‌های حاوی کلمات کلیدی فرعی
        const secondaryKeywordLinks = Array.from(allLinks).filter(link => {
            const linkText = link.textContent.toLowerCase().trim();
            return secondaryKeywords.some(keyword => 
                linkText.includes(keyword.toLowerCase())
            );
        });

        const totalKeywordLinks = new Set([...mainKeywordLinks, ...secondaryKeywordLinks]).size;
        const keywordLinkPercentage = (totalKeywordLinks / allLinks.length) * 100;

        let status, desc, detail;
        
        if (keywordLinkPercentage >= 50) {
            status = CONFIG.CHECK_STATUS.SUCCESS;
            desc = `${totalKeywordLinks} از ${allLinks.length} لینک با کلمات کلیدی مرتبط است ✓`;
            detail = `درصد لینک‌های مرتبط: ${Math.round(keywordLinkPercentage)}%`;
        } else if (keywordLinkPercentage >= 25) {
            status = CONFIG.CHECK_STATUS.WARNING;
            desc = `${totalKeywordLinks} از ${allLinks.length} لینک با کلمات کلیدی مرتبط است`;
            const percentage = Math.round(keywordLinkPercentage);
            detail = `توصیه: لینک‌های بیشتری با کلمات کلیدی مرتبط کنید (درصد فعلی: ${percentage}%)`;
        } else {
            status = CONFIG.CHECK_STATUS.WARNING;
            desc = `${totalKeywordLinks} از ${allLinks.length} لینک با کلمات کلیدی مرتبط است`;
            const percentage = Math.round(keywordLinkPercentage);
            detail = `توصیه: لینک‌های بیشتری با کلمات کلیدی اصلی یا فرعی اضافه کنید (درصد فعلی: ${percentage}%)`;
        }

        return {
            status,
            title: 'لینک‌دهی با کلمات کلیدی',
            tooltip: 'استفاده از کلمات کلیدی در لینک‌ها به بهبود سئو و تجربه کاربری کمک می‌کند. لینک‌ها باید با کلمات کلیدی اصلی یا فرعی مرتبط باشند.',
            desc,
            detail
        };
    },

    /**
     * انجام چک‌های خوانایی
     */
    performReadabilityChecks(content, plainText) {
        const checks = [];
        
        // چک جملات طولانی
        checks.push(this.checkSentenceLength(plainText));
        
        // چک پاراگراف‌های طولانی
        checks.push(this.checkParagraphLength(content));
        
        return checks;
    },

    /**
     * چک طول جملات
     */
    checkSentenceLength(plainText) {
        const sentences = Utils.splitIntoSentences(plainText);
        const longSentences = sentences.filter(s => 
            Utils.countWords(s) > CONFIG.SEO_LIMITS.MAX_SENTENCE_WORDS
        );
        
        let status, desc;
        if (longSentences.length === 0) {
            status = CONFIG.CHECK_STATUS.SUCCESS;
            desc = 'تمام جملات در طول مناسب هستند ✓';
        } else if (longSentences.length <= 3) {
            status = CONFIG.CHECK_STATUS.WARNING;
            desc = `${longSentences.length} جمله طولانی (بیش از ${CONFIG.SEO_LIMITS.MAX_SENTENCE_WORDS} کلمه) یافت شد`;
        } else {
            status = CONFIG.CHECK_STATUS.ERROR;
            desc = `${longSentences.length} جمله طولانی (بیش از ${CONFIG.SEO_LIMITS.MAX_SENTENCE_WORDS} کلمه) یافت شد`;
        }
        
        return {
            status,
            title: 'طول جملات',
            tooltip: `جملات بلند (بیش از ${CONFIG.SEO_LIMITS.MAX_SENTENCE_WORDS} کلمه) خوانایی را کاهش می‌دهند. سعی کنید جملات را کوتاه‌تر و واضح‌تر بنویسید.`,
            desc,
            detail: longSentences.length > 0 
                ? 'برای مشاهده جملات طولانی، دکمه زیر را فعال کنید' 
                : null
        };
    },

    /**
     * چک طول پاراگراف‌ها
     */
    checkParagraphLength(content) {
        const paragraphs = Utils.extractParagraphs(content);
        const longParagraphs = paragraphs.filter(p => 
            Utils.countWords(p) > CONFIG.SEO_LIMITS.MAX_PARAGRAPH_WORDS
        );
        
        let status, desc;
        if (longParagraphs.length === 0) {
            status = CONFIG.CHECK_STATUS.SUCCESS;
            desc = 'تمام پاراگراف‌ها در طول مناسب هستند ✓';
        } else if (longParagraphs.length <= 2) {
            status = CONFIG.CHECK_STATUS.WARNING;
            desc = `${longParagraphs.length} پاراگراف طولانی (بیش از ${CONFIG.SEO_LIMITS.MAX_PARAGRAPH_WORDS} کلمه) یافت شد`;
        } else {
            status = CONFIG.CHECK_STATUS.ERROR;
            desc = `${longParagraphs.length} پاراگراف طولانی (بیش از ${CONFIG.SEO_LIMITS.MAX_PARAGRAPH_WORDS} کلمه) یافت شد`;
        }
        
        return {
            status,
            title: 'طول پاراگراف‌ها',
            tooltip: `پاراگراف‌های بلند (بیش از ${CONFIG.SEO_LIMITS.MAX_PARAGRAPH_WORDS} کلمه) خواننده را خسته می‌کنند. سعی کنید پاراگراف‌ها را به بخش‌های کوچک‌تر تقسیم کنید.`,
            desc,
            detail: longParagraphs.length > 0 
                ? 'برای مشاهده پاراگراف‌های طولانی، دکمه زیر را فعال کنید' 
                : null
        };
    },

    /**
     * تشخیص کلمه کلیدی اصلی
     */
    detectMainKeyword(plainText) {
        const suggestions = Utils.detectMainKeyword(plainText, 3);
        
        if (suggestions.length === 0) {
            return {
                status: CONFIG.CHECK_STATUS.WARNING,
                title: 'تشخیص کلمه کلیدی اصلی',
                tooltip: 'کلمه کلیدی اصلی مهم‌ترین عبارت در محتوا است که باید در عنوان، پاراگراف اول و چندین بار در متن تکرار شود.',
                desc: 'هیچ کلمه کلیدی اصلی مناسب یافت نشد',
                detail: 'محتوا باید حداقل 200 کلمه داشته باشد و شامل عبارات معنادار باشد',
                suggestions: []
            };
        }

        const suggestionText = suggestions
            .map(s => `${s.keyword} (کیفیت: ${s.quality}, ارتباط: ${s.relevance})`)
            .join('، ');

        return {
            status: CONFIG.CHECK_STATUS.SUCCESS,
            title: 'تشخیص کلمه کلیدی اصلی',
            tooltip: 'کلمه کلیدی اصلی مهم‌ترین عبارت در محتوا است که باید در عنوان، پاراگراف اول و چندین بار در متن تکرار شود.',
            desc: `پیشنهادات کلمه کلیدی اصلی: ${suggestionText}`,
            detail: suggestions.map(s => 
                `${s.keyword}: ${s.frequency} بار (کیفیت: ${s.quality}, ارتباط: ${s.relevance})`
            ).join('\n'),
            suggestions: suggestions
        };
    },

    /**
     * تشخیص کلمات کلیدی فرعی
     */
    detectSecondaryKeywords(plainText) {
        const suggestions = Utils.detectSecondaryKeywords(plainText, 5);
        
        if (suggestions.length === 0) {
            return {
                status: CONFIG.CHECK_STATUS.WARNING,
                title: 'تشخیص کلمات کلیدی فرعی',
                tooltip: 'کلمات کلیدی فرعی عبارات مرتبط با موضوع اصلی هستند که به بهبود سئو و جذب ترافیک بیشتر کمک می‌کنند.',
                desc: 'هیچ کلمه کلیدی فرعی مناسب یافت نشد',
                detail: 'محتوا باید شامل عبارات متنوع و مرتبط با موضوع باشد',
                suggestions: []
            };
        }

        const suggestionText = suggestions
            .map(s => `${s.keyword} (کیفیت: ${s.quality})`)
            .join('، ');

        return {
            status: CONFIG.CHECK_STATUS.SUCCESS,
            title: 'تشخیص کلمات کلیدی فرعی',
            tooltip: 'کلمات کلیدی فرعی عبارات مرتبط با موضوع اصلی هستند که به بهبود سئو و جذب ترافیک بیشتر کمک می‌کنند.',
            desc: `پیشنهادات کلمات کلیدی فرعی: ${suggestionText}`,
            detail: suggestions.map(s => 
                `${s.keyword}: ${s.frequency} بار (کیفیت: ${s.quality}, ارتباط: ${s.relevance})`
            ).join('\n'),
            suggestions: suggestions
        };
    },

    /**
     * محاسبه امتیاز کلی SEO
     */
    calculateScore(checks) {
        // فیلتر کردن چک‌هایی که در محاسبه امتیاز تأثیر ندارند
        const scoreAffectingChecks = checks.filter(c => 
            c.title !== 'لینک‌دهی با کلمات کلیدی' && 
            c.title !== 'تشخیص کلمه کلیدی اصلی' &&
            c.title !== 'تشخیص کلمات کلیدی فرعی'
        );
        
        const successCount = scoreAffectingChecks.filter(c => 
            c.status === CONFIG.CHECK_STATUS.SUCCESS
        ).length;
        
        return Math.round((successCount / scoreAffectingChecks.length) * 100);
    }
};

// Export برای استفاده در سایر ماژول‌ها
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOAnalyzer;
}