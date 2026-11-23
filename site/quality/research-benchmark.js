'use strict';
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = n => Number(n).toLocaleString('en-US');
  const CACHE_VER = '20261123-uav-dres';
  const colors = ['#1a73e8', '#8ab4f8', '#aecbfa'];
  const sourceColors = ['#1a73e8', '#4285f4', '#12b5cb', '#34a853', '#5f6368', '#9aa0a6'];
  const base = new URL('.', document.currentScript.src);
  let language = 'zh', dataset = null, summary = null, report = null, failed = false, selectedSource = null;
  const tr = (zh, en) => language === 'zh' ? zh : en;
  const splitName = s => ({train: tr('训练', 'Train'), val: tr('验证', 'Validation'), test: tr('测试', 'Test')})[s];
  const splits = ['train', 'val', 'test'];

  function alignment() {
    if (!report || !dataset || !summary?.audit?.metadata_sha256) return false;
    return (
      dataset.records === report.counts.records &&
      splits.every(s => dataset.splits[s] === report.splits[s].records) &&
      Object.entries(report.metadata_sha256 || {}).every(([k, v]) => summary.audit.metadata_sha256[k] === v)
    );
  }

  function renderBenchmark() {
    const status = $('#benchmark-status');
    if (!report) {
      if (failed && status) {
        status.hidden = false;
        status.textContent = tr('划分核验数据暂不可用，请刷新重试。', 'Split audit report unavailable.');
      }
      return;
    }
    const aligned = alignment();
    if (status) {
      status.hidden = !dataset || aligned;
      if (!aligned) status.textContent = tr('划分核验数据与统计摘要不一致，请刷新。', 'Split audit mismatch. Please reload.');
    }

    $('#benchmark-splits').innerHTML =
      `<thead><tr><th scope="col">${tr('划分', 'Split')}</th><th scope="col">${tr('记录数', 'Records')}</th><th scope="col">${tr('图像数', 'Frames')}</th><th scope="col">${tr('分组数', 'Groups')}</th></tr></thead><tbody>` +
      splits.map((s, i) => `<tr><th scope="row"><span class="legend-dot" style="background:${colors[i]}"></span>${splitName(s)}</th>${['records', 'rgb_images', 'source_groups'].map(k => `<td>${num(report.splits[s][k])}</td>`).join('')}</tr>`).join('') +
      `</tbody><tfoot><tr><th scope="row">${tr('合计', 'Total')}</th>${['records', 'rgb_images', 'source_groups'].map(k => `<td>${num(report.counts[k])}</td>`).join('')}</tr></tfoot>`;

    $('#benchmark-stack').innerHTML =
      `<div class="stack" aria-hidden="true">${splits.map((s, i) => `<span style="width:${100 * report.splits[s].records / report.counts.records}%;background:${colors[i]}"></span>`).join('')}</div>` +
      `<div class="split-legend">${splits.map(s => `<span>${splitName(s)} <strong>${(100 * report.splits[s].records / report.counts.records).toFixed(1)}%</strong></span>`).join('')}</div>`;

    const metaRows = Object.entries(report.metadata_sha256 || {})
      .map(([k, v]) => `<dt><code>${esc(k)}</code></dt><dd>${esc(v)}</dd>`)
      .join('');
    $('#benchmark-hashes').innerHTML =
      `<dt>${tr('全量记录摘要', 'Population SHA-256')}</dt><dd>${esc(report.population_sha256)}</dd>` +
      `<dt>${tr('固定划分摘要', 'Frozen split SHA-256')}</dt><dd>${esc(report.frozen_split_sha256)}</dd>` +
      metaRows;
  }

  function selectSource(source, transient = false) {
    if (!dataset) return;
    if (!transient) selectedSource = selectedSource === source ? null : source;
    const active = transient ? source : selectedSource;
    $$('#source-pie [data-source]').forEach(el => {
      el.classList.toggle('source-muted', !!active && el.dataset.source !== active);
      el.classList.toggle('source-active', el.dataset.source === active);
      if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', String(el.dataset.source === selectedSource));
    });
    const valEl = $('#source-center-value'), lblEl = $('#source-center-label'), shrEl = $('#source-center-share');
    if (!valEl || !lblEl || !shrEl) return;
    valEl.textContent = active ? num(dataset.sources[active]) : num(Object.keys(dataset.sources).length);
    lblEl.textContent = active ? active : tr('数据源', 'sources');
    shrEl.textContent = active ? (100 * dataset.sources[active] / dataset.records).toFixed(1) + '%' : num(dataset.records) + ' ' + tr('条记录', 'records');
  }

  function renderPie() {
    if (!dataset || !$('#source-pie')) return;
    const items = Object.entries(dataset.sources).sort((a, b) => b[1] - a[1]);
    let offset = 0;
    const circles = items.map(([source, count], i) => {
      const share = 100 * count / dataset.records;
      const c = `<circle class="source-segment" data-source="${esc(source)}" cx="130" cy="130" r="94" pathLength="100" fill="none" stroke="${sourceColors[i % sourceColors.length]}" stroke-width="34" stroke-dasharray="${share} ${100 - share}" stroke-dashoffset="${-offset}" transform="rotate(-90 130 130)"><title>${esc(source)}: ${num(count)} (${share.toFixed(2)}%)</title></circle>`;
      offset += share;
      return c;
    }).join('');
    $('#source-pie').innerHTML = `<div class="source-donut-layout"><svg class="source-donut" viewBox="0 0 260 260" role="img" aria-label="${tr('各来源占比', 'Source share')}"><g>${circles}</g><text id="source-center-value" x="130" y="122" text-anchor="middle"></text><text id="source-center-label" x="130" y="146" text-anchor="middle"></text><text id="source-center-share" x="130" y="166" text-anchor="middle"></text></svg><div class="source-legend">${items.map(([source, count], i) => `<button type="button" data-source="${esc(source)}" aria-pressed="false"><span class="legend-dot" style="background:${sourceColors[i % sourceColors.length]}"></span><span>${esc(source)}</span><strong>${num(count)}</strong><small>${(100 * count / dataset.records).toFixed(1)}%</small></button>`).join('')}</div></div>`;
    selectSource(selectedSource, true);
  }

  $('#source-pie')?.addEventListener('pointerover', e => { const t = e.target.closest('[data-source]'); if (t) selectSource(t.dataset.source, true); });
  $('#source-pie')?.addEventListener('pointerleave', () => selectSource(selectedSource, true));
  $('#source-pie')?.addEventListener('click', e => { const t = e.target.closest('[data-source]'); if (t) selectSource(t.dataset.source); });

  function changePanel(button, focus = false) {
    $$('.workspace-tabs [role=tab]').forEach(b => {
      const active = b === button;
      b.setAttribute('aria-selected', String(active));
      b.tabIndex = active ? 0 : -1;
      $('#panel-' + b.dataset.panel).hidden = !active;
    });
    if (focus) button.focus();
  }

  $$('.workspace-tabs [role=tab]').forEach((b, i) => {
    b.addEventListener('click', () => changePanel(b));
    b.addEventListener('keydown', e => {
      const tabs = $$('.workspace-tabs [role=tab]');
      const target = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (target !== null) { e.preventDefault(); changePanel(tabs[target], true); }
    });
  });

  const COPY_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 5.5V3.8A1.3 1.3 0 0 0 9.2 2.5H3.8A1.3 1.3 0 0 0 2.5 3.8v5.4a1.3 1.3 0 0 0 1.3 1.3h1.7"/></svg>';
  const CHECK_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3.5 8.5 6.8 11.8 12.8 4.8"/></svg>';

  $$('#benchmark pre, #bibtex').forEach(pre => {
    if (pre.parentElement?.classList.contains('code-card')) return;
    const card = document.createElement('div');
    card.className = 'code-card';
    const head = document.createElement('div');
    head.className = 'code-card-head';
    const langTag = document.createElement('span');
    langTag.className = 'code-card-lang';
    langTag.textContent = pre.dataset.langLabel || 'Code';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy-btn';
    button.dataset.zh = '复制';
    button.dataset.en = 'Copy';
    button.innerHTML = `${COPY_ICON}<span class="copy-label">复制</span>`;
    head.append(langTag, button);
    pre.parentNode.insertBefore(card, pre);
    card.append(head, pre);

    let resetTimer = null;
    button.addEventListener('click', async () => {
      const text = pre.querySelector('code').textContent;
      try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
        else {
          const input = document.createElement('textarea');
          input.value = text;
          input.style.cssText = 'position:fixed;opacity:0';
          document.body.append(input);
          input.select();
          const copied = document.execCommand('copy');
          input.remove();
          if (!copied) throw Error('copy failed');
        }
        button.classList.add('is-copied');
        button.innerHTML = `${CHECK_ICON}<span class="copy-label">${tr('已复制', 'Copied')}</span>`;
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          button.classList.remove('is-copied');
          button.innerHTML = `${COPY_ICON}<span class="copy-label">${tr('复制', 'Copy')}</span>`;
        }, 2000);
      } catch {
        button.innerHTML = `${COPY_ICON}<span class="copy-label">${tr('请手动复制', 'Select to copy')}</span>`;
      }
    });
  });

  window.UAVResearch = {
    setContext(lang, data, stats) {
      const changed = language !== lang || dataset !== data;
      language = lang;
      dataset = data;
      summary = stats;
      renderBenchmark();
      if (changed) renderPie();
    },
  };

  fetch(new URL('research/split-report.json?v=' + CACHE_VER, base), {cache: 'default', signal: AbortSignal.timeout(20000)})
    .then(r => { if (!r.ok) throw Error('HTTP ' + r.status); return r.json(); })
    .then(data => { report = data; renderBenchmark(); })
    .catch(() => { failed = true; renderBenchmark(); });
})();
