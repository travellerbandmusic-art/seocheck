/**
 * توابع کمکی و Utilities
 */

const Utils = {
    /**
     * نرمال‌سازی متن (حذف فاصله‌های اضافی و نیم‌فاصله)
     */
    normalizeText(text) {
        if (!text) return '';

        // تبدیل نیم‌فاصله به فاصله و نرمال‌سازی فاصله‌ها
        let t = text.replace(/\u200c/g, ' ').replace(/\s+/g, ' ').trim();

        // نرمال‌سازی حروف عربی به معادل فارسی (YE, KAF)
        t = t.replace(/\u064A/g, '\u06CC') // ي -> ی
             .replace(/\u0643/g, '\u06A9') // ك -> ک
             .replace(/\u06D5/g, '\u0627'); // ۥ غیرمعمول -> ا (فقط محافظه‌کارانه)

        // حذف علامت‌هایات حرکات و اعراب (diacritics) برای پردازش کلمه
        t = t.replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, '');

        return t.toLowerCase();
    },

    /**
     * نمایش متن با نیم‌فاصله
     */
    displayText(text) {
        return text.replace(/\u200c/g, '‌');
    },

    /**
     * استخراج متن خالص از HTML
     */
    extractText(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    },

    /**
     * شمارش تعداد کلمات
     */
    countWords(text) {
        if (!text) return 0;

        // استفاده از extractWords برای شمارش صحیح کلمات فارسی/انگلیسی
        const words = this.extractWords(text);
        return words.length;
    },

    /**
     * پیدا کردن موقعیت‌های کلمه کلیدی در متن
     */
    findKeyword(text, keyword) {
        if (!keyword) return [];

        const normalizedText = this.normalizeText(text || '');
        const normalizedKeyword = this.normalizeText(keyword || '');
        if (!normalizedKeyword) return [];

        // ساخت regex یونیکد-آگاه برای جستجوی عبارت به‌صورت whole-word
        // از Unicode property escapes (\p{L}) و flag 'u' استفاده می‌کنیم
        try {
            const esc = this.escapeRegExp(normalizedKeyword);
            const re = new RegExp(`(^|[^\\p{L}0-9])${esc}([^\\p{L}0-9]|$)`, 'giu');
            const positions = [];
            let match;
            while ((match = re.exec(normalizedText)) !== null) {
                // index در match.index ممکن است به ابتدای گروه اول اشاره کند؛
                // برای برگرداندن موقعیت کلیدواژه، محاسبه offset مناسب لازم است
                const fullMatch = match[0];
                const beforeGroup = match[1] || '';
                const keywordIndex = match.index + beforeGroup.length;
                positions.push(keywordIndex);
                // جلوگیری از infinite loop برای عبارات صفر طولی
                if (re.lastIndex === match.index) re.lastIndex++;
            }
            return positions;
        } catch (e) {
            // اگر regex یونیکد پشتیبانی نشد، fallback ساده
            const positions = [];
            let idx = 0;
            while ((idx = normalizedText.indexOf(normalizedKeyword, idx)) !== -1) {
                positions.push(idx);
                idx += normalizedKeyword.length;
            }
            return positions;
        }
    },

    /**
     * Escapes string for use inside RegExp
     */
    escapeRegExp(string) {
        return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * بررسی وجود کلمه کلیدی در بخش خاص HTML
     */
    hasKeywordInSection(html, keyword, selector) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const elements = temp.querySelectorAll(selector);

        for (let element of elements) {
            if (element.tagName === 'IMG') {
                const altText = element.getAttribute('alt') || '';
                if (this.findKeyword(altText, keyword).length > 0) {
                    return {
                        found: true,
                        text: this.displayText(altText.trim())
                    };
                }
            } else {
                const text = element.textContent || element.innerText;
                if (this.findKeyword(text, keyword).length > 0) {
                    return {
                        found: true,
                        text: this.displayText(text.trim())
                    };
                }
            }
        }

        return { found: false, text: '' };
    },

    /**
     * دریافت اولین پاراگراف محتوا (بدون H1)
     */
    getFirstParagraph(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // حذف عناوین H1
        temp.querySelectorAll('h1').forEach(h1 => h1.remove());
        
        const paragraphs = temp.querySelectorAll('p');
        for (let p of paragraphs) {
            const text = (p.textContent || p.innerText).trim();
            if (text.length > 0) {
                return text;
            }
        }
        
        return '';
    },

    /**
     * تقسیم متن به جملات
     */
    splitIntoSentences(text) {
        return text
            .split(/[.!?؟۔]\s+/)
            .filter(sentence => sentence.trim().length > 0);
    },

    /**
     * استخراج پاراگراف‌ها از HTML
     */
    extractParagraphs(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return Array.from(temp.querySelectorAll('p'))
            .map(p => (p.textContent || '').trim())
            .filter(p => p.length > 0);
    },

    /**
     * Debounce برای محدود کردن فراخوانی توابع
     */
    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Escape کاراکترهای خاص برای استفاده در HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * محاسبه درصد
     */
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return (value / total) * 100;
    },

    /**
     * فرمت کردن عدد به دو رقم اعشار
     */
    formatDecimal(number, decimals = 2) {
        return Number(number).toFixed(decimals);
    },

    /**
     * استخراج کلمات از متن با در نظر گیری زبان فارسی و انگلیسی
     */
    extractWords(text) {
        const normalizedText = this.normalizeText(text);
        
        // حذف علائم نگارشی و اعداد
        const cleanText = normalizedText
            .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D\u0020-\u007F\u00A0-\u00FF]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        // تقسیم به کلمات
        const words = cleanText.split(/\s+/)
            .filter(word => word.length > 1) // حذف کلمات تک حرفی
            .filter(word => !/^\d+$/.test(word)); // حذف اعداد خالص
        
        return words;
    },

    /**
     * تولید n-gram (ترکیبات کلمات)
     */
    generateNGrams(words, n = 2) {
        const ngrams = [];
        for (let i = 0; i <= words.length - n; i++) {
            const ngram = words.slice(i, i + n).join(' ');
            ngrams.push(ngram);
        }
        return ngrams;
    },

    /**
     * شمارش تکرار کلمات و ترکیبات
     */
    countWordFrequencies(text) {
        const words = this.extractWords(text);
        const wordCounts = {};
        
        // شمارش کلمات تکی
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
        
        // شمارش bigrams (ترکیبات دو کلمه‌ای)
        const bigrams = this.generateNGrams(words, 2);
        bigrams.forEach(bigram => {
            wordCounts[bigram] = (wordCounts[bigram] || 0) + 1;
        });
        
        // شمارش trigrams (ترکیبات سه کلمه‌ای)
        const trigrams = this.generateNGrams(words, 3);
        trigrams.forEach(trigram => {
            wordCounts[trigram] = (wordCounts[trigram] || 0) + 1;
        });
        
        return wordCounts;
    },

    /**
     * فیلتر کردن کلمات غیرمرتبط (حروف اضافه، ضمایر، و غیره)
     */
    filterRelevantWords(wordCounts) {
        const stopWords = new Set([
            // حروف اضافه فارسی
            'از', 'در', 'به', 'با', 'برای', 'که', 'این', 'آن', 'را', 'را', 'را',
            'است', 'بود', 'خواهد', 'بوده', 'شده', 'می', 'نمی', 'باید', 'نباید',
            'هم', 'همه', 'هر', 'هیچ', 'چند', 'چقدر', 'چگونه', 'کجا', 'کی',
            'من', 'تو', 'او', 'ما', 'شما', 'آنها', 'خود', 'خودش', 'خودت',
            'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه', 'ده',
            'همچنین', 'همچنین', 'همچنین', 'همچنین', 'همچنین', 'همچنین',
            'لذا', 'بنابراین', 'از', 'این', 'رو', 'که', 'در', 'آن', 'است',
            'کلمات', 'کلمه', 'کلمات', 'کلمه', 'کلمات', 'کلمه',
            // کلمات انگلیسی رایج
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'can', 'cannot', 'could', 'should', 'would', 'may', 'might', 'must',
            'here', 'there', 'where', 'when', 'why', 'how', 'what', 'who', 'which'
        ]);
        
        const filtered = {};
        Object.entries(wordCounts).forEach(([word, count]) => {
            const lowerWord = word.toLowerCase();
            
            // بررسی کلمات بی‌معنا و فیلترهای اضافی
            if (this.isMeaningfulWord(word) && 
                !stopWords.has(lowerWord) && 
                count > 1 && 
                word.length > 2 &&
                this.isRelevantPhrase(word)) {
                filtered[word] = count;
            }
        });
        
        return filtered;
    },

    /**
     * بررسی اینکه آیا عبارت مرتبط است یا نه
     */
    isRelevantPhrase(phrase) {
        // حذف عبارات با کلمات غیرمرتبط
        const irrelevantPatterns = [
            /است که/, /بود که/, /خواهد که/, /می باشد/, /نمی باشد/,
            /این که/, /آن که/, /همه که/, /هر که/, /چند که/,
            /است در/, /بود در/, /خواهد در/, /می در/, /نمی در/,
            /است به/, /بود به/, /خواهد به/, /می به/, /نمی به/,
            /است از/, /بود از/, /خواهد از/, /می از/, /نمی از/,
            /است با/, /بود با/, /خواهد با/, /می با/, /نمی با/,
            /است برای/, /بود برای/, /خواهد برای/, /می برای/, /نمی برای/,
            // الگوهای جدید
            /برای که/, /برای این/, /برای آن/, /برای همه/, /برای هر/,
            /در که/, /در این/, /در آن/, /در همه/, /در هر/,
            /به که/, /به این/, /به آن/, /به همه/, /به هر/,
            /از که/, /از این/, /از آن/, /از همه/, /از هر/,
            /با که/, /با این/, /با آن/, /با همه/, /با هر/,
            // عبارات ناقص
            /^بهینه‌سازی برای$/, /^سئو برای$/, /^محتوا برای$/,
            /^طراحی برای$/, /^توسعه برای$/, /^بازاریابی برای$/
        ];
        
        // بررسی الگوهای غیرمرتبط
        for (let pattern of irrelevantPatterns) {
            if (pattern.test(phrase)) {
                return false;
            }
        }
        
        // بررسی کلمات تکراری در عبارت
        const words = phrase.split(' ');
        const uniqueWords = new Set(words);
        if (words.length > uniqueWords.size) {
            return false;
        }
        
        // بررسی وجود حداقل یک کلمه معنادار
        const meaningfulWords = words.filter(word => 
            word.length > 2 && 
            !['است', 'بود', 'خواهد', 'می', 'نمی', 'که', 'این', 'آن', 'را', 'برای', 'در', 'به', 'از', 'با'].includes(word)
        );
        
        // بررسی اینکه عبارت کامل و معنادار باشد
        if (meaningfulWords.length === 0) {
            return false;
        }
        
        // بررسی عدم وجود عبارات ناقص
        const incompletePatterns = [
            /^.+ برای$/, /^.+ در$/, /^.+ به$/, /^.+ از$/, /^.+ با$/,
            /^برای .+$/, /^در .+$/, /^به .+$/, /^از .+$/, /^با .+$/
        ];
        
        for (let pattern of incompletePatterns) {
            if (pattern.test(phrase)) {
                return false;
            }
        }
        
        return true;
    },

    /**
     * بررسی اینکه آیا کلمه معنادار است یا نه
     */
    isMeaningfulWord(word) {
        // حذف کلمات تک حرفی
        if (word.length <= 1) return false;
        
        // حذف کلمات فقط عدد
        if (/^\d+$/.test(word)) return false;
        
        // حذف کلمات فقط علائم نگارشی
        if (/^[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D\u0020-\u007F\u00A0-\u00FF]+$/.test(word)) return false;
        
        // حذف کلمات تکراری (مثل "آآآ" یا "هههه")
        if (/(.)\1{2,}/.test(word)) return false;
        
        // حذف کلمات با حروف مخلوط بی‌معنا
        if (word.length > 2 && /^[aeiouAEIOU]+$/.test(word)) return false;
        
        // حذف کلمات با اعداد مخلوط بی‌معنا
        if (/\d{2,}/.test(word) && word.length < 4) return false;
        
        // بررسی کلمات ترکیبی فارسی-انگلیسی بی‌معنا
        if (word.length > 3) {
            const persianChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D]/;
            const englishChars = /[a-zA-Z]/;
            const hasPersian = persianChars.test(word);
            const hasEnglish = englishChars.test(word);
            
            // اگر هم فارسی و هم انگلیسی دارد، بررسی کن که معنادار باشد
            if (hasPersian && hasEnglish) {
                // حذف کلمات مثل "آآآa" یا "testتست"
                if (word.length < 6) return false;
            }
        }
        
        return true;
    },

    /**
     * پیشنهاد کلمات کلیدی بر اساس تکرار و NLP
     */
    suggestKeywords(text, maxSuggestions = 10) {
        const wordCounts = this.countWordFrequencies(text);
        const filteredCounts = this.filterRelevantWords(wordCounts);
        
        // فیلتر کردن فقط ترکیبات دو و سه کلمه‌ای
        const meaningfulPhrases = {};
        Object.entries(filteredCounts).forEach(([word, count]) => {
            const wordCount = word.split(' ').length;
            if (wordCount >= 2 && wordCount <= 3) {
                meaningfulPhrases[word] = count;
            }
        });
        
        // بهبود عبارات ناقص
        const enhancedPhrases = this.enhanceIncompletePhrases(meaningfulPhrases, text);
        
        // استفاده از NLP برای بهبود کیفیت
        const nlpEnhanced = this.enhanceWithNLP(enhancedPhrases, text);
        
        // مرتب‌سازی بر اساس کیفیت و تکرار
        const sortedWords = Object.entries(nlpEnhanced)
            .sort(([,a], [,b]) => {
                // اولویت بر اساس کیفیت، سپس تکرار
                if (a.quality !== b.quality) {
                    return b.quality - a.quality;
                }
                return b.frequency - a.frequency;
            })
            .slice(0, maxSuggestions);
        
        return sortedWords.map(([word, data]) => ({
            keyword: word,
            frequency: data.frequency,
            type: word.split(' ').length === 2 ? 'دو کلمه' : 'سه کلمه',
            quality: data.quality,
            relevance: data.relevance
        }));
    },

    /**
     * بهبود عبارات ناقص
     */
    enhanceIncompletePhrases(phrases, text) {
        const enhanced = {};
        const plainText = this.extractText(text);
        
        Object.entries(phrases).forEach(([phrase, count]) => {
            // بررسی عبارات ناقص
            if (this.isIncompletePhrase(phrase)) {
                // جستجو برای عبارات کامل مشابه
                const completePhrase = this.findCompletePhrase(phrase, plainText);
                if (completePhrase && completePhrase !== phrase) {
                    enhanced[completePhrase] = count;
                }
            } else {
                enhanced[phrase] = count;
            }
        });
        
        return enhanced;
    },

    /**
     * بررسی اینکه آیا عبارت ناقص است یا نه
     */
    isIncompletePhrase(phrase) {
        const incompletePatterns = [
            /^.+ برای$/, /^.+ در$/, /^.+ به$/, /^.+ از$/, /^.+ با$/,
            /^برای .+$/, /^در .+$/, /^به .+$/, /^از .+$/, /^با .+$/
        ];
        
        return incompletePatterns.some(pattern => pattern.test(phrase));
    },

    /**
     * پیدا کردن عبارت کامل مشابه
     */
    findCompletePhrase(incompletePhrase, text) {
        const words = incompletePhrase.split(' ');
        const firstWord = words[0];
        const lastWord = words[words.length - 1];
        
        // جستجو برای عبارات کامل که شامل کلمات ناقص هستند
        const sentences = text.split(/[.!?؟۔]\s+/);
        
        for (let sentence of sentences) {
            const sentenceWords = sentence.toLowerCase().split(/\s+/);
            
            for (let i = 0; i <= sentenceWords.length - words.length; i++) {
                const candidate = sentenceWords.slice(i, i + words.length).join(' ');
                
                if (candidate.includes(firstWord) && candidate.includes(lastWord)) {
                    // بررسی اینکه آیا عبارت کامل‌تر است
                    if (candidate.length > incompletePhrase.length && 
                        this.isRelevantPhrase(candidate)) {
                        return candidate;
                    }
                }
            }
        }
        
        return null;
    },

    /**
     * بهبود پیشنهادات با استفاده از NLP
     */
    enhanceWithNLP(phrases, originalText) {
        const enhanced = {};
        
        Object.entries(phrases).forEach(([phrase, frequency]) => {
            const quality = this.calculateKeywordQuality(phrase, frequency);
            const relevance = this.calculateRelevance(phrase, originalText);
            
            enhanced[phrase] = {
                frequency,
                quality,
                relevance
            };
        });
        
        return enhanced;
    },

    /**
     * محاسبه ارتباط عبارت با متن اصلی
     */
    calculateRelevance(phrase, text) {
        let relevance = 0;
        
        // بررسی حضور در عناوین
        const titleMatches = this.findInTitles(phrase, text);
        if (titleMatches > 0) relevance += 3;
        
        // بررسی حضور در ابتدای پاراگراف‌ها
        const paragraphMatches = this.findInParagraphStarts(phrase, text);
        if (paragraphMatches > 0) relevance += 2;
        
        // بررسی تراکم در متن
        const density = this.calculatePhraseDensity(phrase, text);
        if (density > 0.5) relevance += 2;
        else if (density > 0.3) relevance += 1;
        
        // بررسی هم‌آیندی با کلمات مهم
        const cooccurrence = this.calculateCooccurrence(phrase, text);
        if (cooccurrence > 0) relevance += 1;
        
        return relevance;
    },

    /**
     * پیدا کردن عبارت در عناوین
     */
    findInTitles(phrase, text) {
        const temp = document.createElement('div');
        temp.innerHTML = text;
        const headings = temp.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        let matches = 0;
        headings.forEach(heading => {
            const headingText = heading.textContent.toLowerCase();
            if (headingText.includes(phrase.toLowerCase())) {
                matches++;
            }
        });
        
        return matches;
    },

    /**
     * پیدا کردن عبارت در ابتدای پاراگراف‌ها
     */
    findInParagraphStarts(phrase, text) {
        const temp = document.createElement('div');
        temp.innerHTML = text;
        const paragraphs = temp.querySelectorAll('p');
        
        let matches = 0;
        paragraphs.forEach(p => {
            const paragraphText = p.textContent.toLowerCase();
            const firstWords = paragraphText.split(' ').slice(0, 5).join(' ');
            if (firstWords.includes(phrase.toLowerCase())) {
                matches++;
            }
        });
        
        return matches;
    },

    /**
     * محاسبه تراکم عبارت در متن
     */
    calculatePhraseDensity(phrase, text) {
        const plainText = this.extractText(text);
        const totalWords = this.countWords(plainText);
        const phraseWords = phrase.split(' ').length;
        const phraseCount = this.findKeyword(plainText, phrase).length;
        
        return (phraseCount * phraseWords) / totalWords;
    },

    /**
     * محاسبه هم‌آیندی با کلمات مهم
     */
    calculateCooccurrence(phrase, text) {
        const importantWords = [
            'سئو', 'seo', 'بهینه', 'بهینه‌سازی', 'optimization', 'گوگل', 'google',
            'محتوا', 'content', 'بازاریابی', 'marketing', 'دیجیتال', 'digital',
            'وب', 'web', 'سایت', 'website', 'طراحی', 'design', 'توسعه', 'development',
            'کلمات', 'keywords', 'کلیدی', 'key', 'مهم', 'important', 'اصلی', 'main'
        ];
        
        const plainText = this.extractText(text);
        let cooccurrence = 0;
        
        importantWords.forEach(word => {
            if (plainText.toLowerCase().includes(word.toLowerCase())) {
                cooccurrence++;
            }
        });
        
        return cooccurrence;
    },

    /**
     * تشخیص کلمه کلیدی اصلی
     */
    detectMainKeyword(text, maxSuggestions = 3) {
        const suggestions = this.suggestKeywords(text, maxSuggestions * 2);
        
        // فیلتر کردن فقط بهترین پیشنهادات
        const mainKeywords = suggestions
            .filter(s => s.quality >= 6 && s.relevance >= 4)
            .slice(0, maxSuggestions);
        
        return mainKeywords;
    },

    /**
     * تشخیص کلمات کلیدی فرعی
     */
    detectSecondaryKeywords(text, maxSuggestions = 5) {
        const suggestions = this.suggestKeywords(text, maxSuggestions * 2);
        
        // فیلتر کردن کلمات فرعی (کیفیت متوسط)
        const secondaryKeywords = suggestions
            .filter(s => s.quality >= 4 && s.relevance >= 2)
            .slice(0, maxSuggestions);
        
        return secondaryKeywords;
    },

    /**
     * محاسبه کیفیت کلمه کلیدی
     */
    calculateKeywordQuality(keyword, frequency) {
        let quality = 0;
        
        // امتیاز بر اساس طول
        const wordCount = keyword.split(' ').length;
        if (wordCount === 2) quality += 3;
        else if (wordCount === 3) quality += 2;
        
        // امتیاز بر اساس تکرار
        if (frequency >= 3) quality += 2;
        else if (frequency >= 2) quality += 1;
        
        // امتیاز بر اساس وجود کلمات کلیدی مهم
        const importantWords = [
            'سئو', 'seo', 'بهینه', 'بهینه‌سازی', 'optimization', 'گوگل', 'google',
            'محتوا', 'content', 'بازاریابی', 'marketing', 'دیجیتال', 'digital',
            'وب', 'web', 'سایت', 'website', 'طراحی', 'design', 'توسعه', 'development'
        ];
        
        const hasImportantWord = importantWords.some(word => 
            keyword.toLowerCase().includes(word.toLowerCase())
        );
        
        if (hasImportantWord) quality += 2;
        
        // امتیاز بر اساس عدم وجود کلمات غیرمرتبط
        const irrelevantWords = ['است', 'بود', 'خواهد', 'می', 'نمی', 'که', 'این', 'آن'];
        const hasIrrelevantWord = irrelevantWords.some(word => 
            keyword.toLowerCase().includes(word.toLowerCase())
        );
        
        if (!hasIrrelevantWord) quality += 1;
        
        return quality;
    }
};

// Export برای استفاده در سایر ماژول‌ها
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}