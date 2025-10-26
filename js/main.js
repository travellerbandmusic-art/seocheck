/* filepath: js/main.js */
/* ...existing code... */
async function performAnalysisAndUpdateUI(htmlContent, keyword) {
  // ...existing code...

  if (typeof SEOAnalyzer !== 'undefined' && typeof UIHandler !== 'undefined') {
    try {
      const bodyDensityResult = SEOAnalyzer.analyzeKeywordDensityExcludingHeadings(htmlContent, keyword, { returnDetails: false });
      UIHandler.showToolResult && UIHandler.showToolResult('keyword-density-body', bodyDensityResult);

      const headingDensityResult = SEOAnalyzer.analyzeHeadingKeywordDensity(htmlContent, keyword, { returnDetails: true });
      UIHandler.showToolResult && UIHandler.showToolResult('keyword-density-headings', headingDensityResult);
    } catch (e) {
      console.error('SEO analysis error:', e);
    }
  }

  // ...existing code...
}
/* ...existing code... */
