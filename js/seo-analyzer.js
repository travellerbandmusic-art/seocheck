/* filepath: js/seo-analyzer.js */
/* ...existing code... */
const SEOAnalyzer = {
  // ...existing code...

  // helper: remove heading tags and their contents from HTML
  _stripHeadings(html) {
    if (!html) return '';
    return html.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, ' ');
  },

  // helper: extract heading texts as array from HTML
  _extractHeadings(html) {
    if (!html) return [];
    const matches = html.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi);
    if (!matches) return [];
    return matches.map(h => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  },

  // helper: strip tags and normalize whitespace
  _textFromHtml(html) {
    if (!html) return '';
    const t = html.replace(/<[^>]+>/g, ' ');
    return t.replace(/\s+/g, ' ').trim();
  },

  // count occurrences of keyword with word-boundary and case-insensitive
  _countKeywordOccurrences(text, keyword) {
    if (!text || !keyword) return 0;
    const k = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${k}\\b`, 'gi');
    const matches = text.match(re);
    return matches ? matches.length : 0;
  },

  // updated keyword density analyzer: analyze full content EXCLUDING headings
  analyzeKeywordDensityExcludingHeadings(htmlContent, keyword, options = {}) {
    const cfg = (typeof CONFIG !== 'undefined' && CONFIG.keywordDensity) ? CONFIG.keywordDensity : {};
    const raw = this._stripHeadings(htmlContent);
    const text = this._textFromHtml(raw);
    const words = text ? text.split(/\s+/).length : 0;
    const occurrences = this._countKeywordOccurrences(text, keyword);
    const density = words > 0 ? (occurrences / words) * 100 : 0;

    const result = {
      scope: 'body-excluding-headings',
      words,
      occurrences,
      density,
      ok: !(cfg.maxPercent && density > cfg.maxPercent),
      message: ''
    };

    if (cfg.minPercent && density < cfg.minPercent) {
      result.message = `Density under recommended (${cfg.minPercent}%).`;
    } else if (cfg.maxPercent && density > cfg.maxPercent) {
      result.message = `Density above recommended (${cfg.maxPercent}%) — possible overuse.`;
    } else {
      result.message = 'OK';
    }

    if (options.returnDetails) {
      result.textSample = text.slice(0, 1000);
    }
    return result;
  },

  // NEW: analyze keyword density inside headings and check keyword-stuffing rules
  analyzeHeadingKeywordDensity(htmlContent, keyword, options = {}) {
    const cfg = (typeof CONFIG !== 'undefined' && CONFIG.headingDensity) ? CONFIG.headingDensity : {};
    const maxHeadingDensityPercent = options.maxHeadingDensityPercent ?? cfg.maxPercent ?? 30;
    const maxHeadingsWithKeywordPercent = options.maxHeadingsWithKeywordPercent ?? cfg.maxHeadingsWithKeywordPercent ?? 50;

    const headings = this._extractHeadings(htmlContent);
    const headingCount = headings.length;
    let totalHeadingWords = 0;
    let totalKeywordOccurrences = 0;
    let headingsWithKeyword = 0;
    const details = [];

    for (const h of headings) {
      const hText = h;
      const words = hText ? hText.split(/\s+/).length : 0;
      const occ = this._countKeywordOccurrences(hText, keyword);
      const density = words > 0 ? (occ / words) * 100 : 0;
      if (occ > 0) headingsWithKeyword++;
      totalHeadingWords += words;
      totalKeywordOccurrences += occ;
      details.push({ heading: hText, words, occurrences: occ, density });
    }

    const overallHeadingDensity = totalHeadingWords > 0 ? (totalKeywordOccurrences / totalHeadingWords) * 100 : 0;
    const headingsWithKeywordPercent = headingCount > 0 ? (headingsWithKeyword / headingCount) * 100 : 0;

    const anyHeadingTooDense = details.some(d => d.density > maxHeadingDensityPercent);
    const stuffing = anyHeadingTooDense || (headingsWithKeywordPercent > maxHeadingsWithKeywordPercent);

    const result = {
      scope: 'headings',
      headingCount,
      totalHeadingWords,
      totalKeywordOccurrences,
      overallHeadingDensity,
      headingsWithKeyword,
      headingsWithKeywordPercent,
      stuffing,
      details: options.returnDetails ? details : undefined,
      message: stuffing ? 'Keyword stuffing detected in headings' : 'OK'
    };

    return result;
  },

  // ...existing code...
};
/* ...existing code... */
export default SEOAnalyzer;
