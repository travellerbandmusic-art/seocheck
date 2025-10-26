/* filepath: js/ui-handler.js */
/* ...existing code... */
const UIHandler = {
  // ...existing code...

  showToolResult(toolKey, result) {
    try {
      let container = document.getElementById('seo-tools-results');
      if (!container) {
        container = document.createElement('div');
        container.id = 'seo-tools-results';
        container.style.margin = '12px auto';
        container.style.maxWidth = '900px';
        document.body.appendChild(container);
      }

      const id = `tool-${toolKey}`;
      let card = document.getElementById(id);
      if (!card) {
        card = document.createElement('div');
        card.id = id;
        card.style.border = '1px solid #ddd';
        card.style.padding = '8px';
        card.style.marginBottom = '8px';
        card.style.borderRadius = '4px';
        card.style.background = '#fff';
        container.appendChild(card);
      }

      const title = document.createElement('div');
      title.style.fontWeight = '600';
      title.style.marginBottom = '6px';
      title.textContent = toolKey.replace(/-/g, ' ');

      const body = document.createElement('div');
      body.style.fontSize = '13px';
      body.style.color = '#333';

      const ok = result && result.stuffing === true ? false : (result && result.ok !== undefined ? result.ok : true);
      const status = document.createElement('div');
      status.textContent = `Status: ${ok ? 'OK' : 'Issue'}`;
      status.style.color = ok ? 'green' : 'crimson';
      status.style.marginBottom = '6px';

      const summary = document.createElement('pre');
      summary.style.whiteSpace = 'pre-wrap';
      summary.style.fontSize = '12px';
      summary.style.margin = '0';

      const display = {
        scope: result.scope,
        message: result.message,
        words: result.words ?? result.totalHeadingWords,
        occurrences: result.occurrences ?? result.totalKeywordOccurrences,
        density: result.density ?? result.overallHeadingDensity,
        headingsWithKeyword: result.headingsWithKeyword,
        stuffing: result.stuffing
      };
      summary.textContent = JSON.stringify(display, null, 2);

      card.innerHTML = '';
      card.appendChild(title);
      card.appendChild(status);
      card.appendChild(summary);

      if (result.details && Array.isArray(result.details)) {
        const det = document.createElement('details');
        const s = document.createElement('summary');
        s.textContent = 'Details';
        det.appendChild(s);
        const dl = document.createElement('div');
        dl.style.fontSize = '12px';
        dl.style.marginTop = '6px';
        dl.textContent = JSON.stringify(result.details, null, 2);
        det.appendChild(dl);
        card.appendChild(det);
      }
    } catch (e) {
      console.error('UIHandler.showToolResult error', e);
    }
  },

  // ...existing code...
};
/* ...existing code... */
export default UIHandler;
