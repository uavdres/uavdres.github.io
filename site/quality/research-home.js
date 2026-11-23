'use strict';
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const base = new URL('.', document.currentScript.src);
  const CACHE_VER = '20261123-toplinks';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n = x => Number(x).toLocaleString('en-US');
  const pct = (x, t) => (t ? 100 * x / t : 0).toFixed(1) + '%';
  const classesZH = {
    animals: '动物', bicycle: '自行车', boat: '小船', bridge: '桥梁', building: '建筑',
    bus: '公共汽车', car: '汽车', motor: '摩托车', people: '行人 / 骑乘者', ship: '船舶',
    'traffic-light': '交通信号灯', 'traffic-sign': '交通标志', tree: '树木', tricycle: '三轮车', truck: '卡车',
  };
  const colors = ['#1a73e8', '#8ab4f8', '#aecbfa'];
  const DEFAULT_PLATFORMS = [
    {id: 'arxiv', group: 'publication', zh: 'arXiv', en: 'arXiv', short_zh: 'arXiv', short_en: 'arXiv', desc_zh: '论文预印本与技术报告', desc_en: 'Preprint paper & technical report', url: '', code: ''},
    {id: 'github', group: 'publication', zh: 'GitHub', en: 'GitHub', short_zh: 'GitHub', short_en: 'GitHub', desc_zh: '读取器、评测工具与基准代码', desc_en: 'Data reader, evaluation & baselines', url: '', code: ''},
    {id: 'huggingface', group: 'mirror', zh: 'Hugging Face', en: 'Hugging Face', short_zh: 'Hugging Face', short_en: 'Hugging Face', desc_zh: '数据集主仓库与标准数据卡', desc_en: 'Dataset Hub & dataset card', url: '', code: ''},
    {id: 'kaggle', group: 'mirror', zh: 'Kaggle', en: 'Kaggle', short_zh: 'Kaggle', short_en: 'Kaggle', desc_zh: 'Kaggle Datasets 在线镜像', desc_en: 'Kaggle Datasets mirror', url: '', code: ''},
    {id: 'gdrive', group: 'mirror', zh: '谷歌网盘', en: 'Google Drive', short_zh: '谷歌网盘', short_en: 'Google Drive', desc_zh: 'Google Drive 完整归档包', desc_en: 'Full archive on Google Drive', url: '', code: ''},
    {id: 'baidu', group: 'mirror', zh: '百度网盘', en: 'Baidu Netdisk', short_zh: '百度网盘', short_en: 'Baidu Netdisk', desc_zh: '网盘镜像归档', desc_en: 'Dataset archive mirror', url: '', code: ''},
    {id: 'pan123', group: 'mirror', zh: '123网盘', en: '123 Cloud Drive', short_zh: '123网盘', short_en: '123 Cloud Drive', desc_zh: '直连高速下载镜像归档', desc_en: 'High-speed direct mirror', url: '', code: ''},
  ];
  const PLATFORM_ICONS = {
    arxiv: '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="5,6 12.5,12 5,18" fill="none" stroke="#5f6368" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><polyline points="19,6 11.5,12 19,18" fill="none" stroke="#b31b1b" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><line x1="9" y1="9.2" x2="15" y2="14.8" stroke="#b31b1b" stroke-width="2.6" stroke-linecap="round"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="#24292f"/><polygon points="7.4,9.6 8.6,5.8 11.1,8.2" fill="#24292f"/><polygon points="16.6,9.6 15.4,5.8 12.9,8.2" fill="#24292f"/><circle cx="12" cy="12.3" r="5.6" fill="#ffffff"/><polygon points="8.3,10.2 9.1,7.3 11.2,9.1" fill="#ffffff"/><polygon points="15.7,10.2 14.9,7.3 12.8,9.1" fill="#ffffff"/><circle cx="10.2" cy="12.2" r="0.95" fill="#24292f"/><circle cx="13.8" cy="12.2" r="0.95" fill="#24292f"/><rect x="10.1" y="16.5" width="3.8" height="4.8" rx="1.6" fill="#ffffff"/></svg>',
    huggingface: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="11.5" r="8.8" fill="#ffd21e" stroke="#d9a100" stroke-width="0.9"/><circle cx="8.8" cy="9.8" r="1.2" fill="#202124"/><circle cx="15.2" cy="9.8" r="1.2" fill="#202124"/><circle cx="6.8" cy="12.2" r="1.25" fill="#ff8a65" opacity="0.6"/><circle cx="17.2" cy="12.2" r="1.25" fill="#ff8a65" opacity="0.6"/><path d="M8.5,13.2 Q12,16.4 15.5,13.2" fill="none" stroke="#202124" stroke-width="1.5" stroke-linecap="round"/><rect x="3.4" y="13.6" width="4.4" height="5.2" rx="2.2" transform="rotate(-24 5.6 16.2)" fill="#ffd21e" stroke="#c88d00" stroke-width="0.9"/><rect x="16.2" y="13.6" width="4.4" height="5.2" rx="2.2" transform="rotate(24 18.4 16.2)" fill="#ffd21e" stroke="#c88d00" stroke-width="0.9"/></svg>',
    kaggle: '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="7.5" y1="4.5" x2="7.5" y2="19.5" stroke="#20beff" stroke-width="3" stroke-linecap="round"/><polyline points="16.8,8.5 10.2,14 17.2,19.5" fill="none" stroke="#20beff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    gdrive: '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="9,4 15,4 21.5,15.2 15.5,15.2" fill="#fbbc04"/><polygon points="2.5,15.2 9,4 12,9.2 5.5,20.4" fill="#34a853"/><polygon points="5.5,20.4 8.5,15.2 21.5,15.2 18.5,20.4" fill="#4285f4"/></svg>',
    baidu: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="14.2" r="4.4" fill="#06a7ff"/><circle cx="13.2" cy="11.6" r="5.3" fill="#06a7ff"/><circle cx="17.2" cy="14.6" r="3.9" fill="#06a7ff"/><rect x="7.8" y="14.2" width="9.6" height="4.4" fill="#06a7ff"/><circle cx="12" cy="14.6" r="2.3" fill="#ffffff"/><circle cx="9.3" cy="11.2" r="1.15" fill="#f43f5e"/><circle cx="12" cy="10.2" r="1.15" fill="#f43f5e"/><circle cx="14.7" cy="11.2" r="1.15" fill="#f43f5e"/></svg>',
    pan123: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1.5" y="3.5" width="21" height="17" rx="5.5" fill="#2563eb"/><text x="12" y="15.3" text-anchor="middle" fill="#ffffff" font-family="DM Sans, Arial, sans-serif" font-size="9.5" font-weight="700" letter-spacing="-0.4">123</text></svg>',
  };
  let lang = 'zh', dataset = null, summary = null, samples = [], mode = 'overlay', limit = 6;
  let platforms = DEFAULT_PLATFORMS.slice();
  let selectedSourceChip = '', activeHeroIndex = 0;
  let loading = true, galleryFailed = false, statisticsFailed = false;
  let activeSample = null, heroGroups = [], upstreamSources = [], copyState = '', galleryKey = '';

  const initialLang = new URLSearchParams(location.search).get('lang');
  try { lang = initialLang || localStorage.getItem('uav-research-language') || 'zh'; } catch { lang = initialLang || 'zh'; }
  if (!['zh', 'en'].includes(lang)) lang = 'zh';

  const tr = (zh, en) => lang === 'zh' ? zh : en;
  const cl = x => lang === 'zh' ? (classesZH[x] || x) : x;
  const viewShort = x => x === 'oblique_depth' ? tr('倾斜', 'Oblique') : tr('垂直', 'Vertical');
  const view = x => x === 'oblique_depth' ? tr('倾斜视角（深度）', 'Oblique (Depth)') : tr('垂直视角（相对高度）', 'Vertical (Relative Height)');
  const splitLabel = x => ({train: tr('训练', 'Train'), val: tr('验证', 'Validation'), test: tr('测试', 'Test')})[x] || x;
  const modeLabel = x => ({rgb: 'RGB', d_fixed: tr('D 几何图', 'D geometry'), mask: tr('目标掩码', 'Target mask'), overlay: tr('掩码叠加', 'Mask overlay')})[x];
  const translation = r => r.gloss_zh || (r.expression_en === r.translation_en ? r.translation_zh : '');
  const expression = r => lang === 'zh' ? (translation(r) || r.expression_en) : r.expression_en;
  const geometryNote = () => tr(
    'D：紫色 → 黄色，倾斜视角（oblique_depth）表示远 → 近，垂直视角（vertical_relative_height）表示低 → 高（基于 D_valid 有效区 p02–p98 独立拉伸，无效像素显示为黑色）。',
    'D: purple → yellow indicates far → near for oblique_depth and low → high for vertical_relative_height (scaled over valid D_valid p02–p98; invalid pixels shown in black).'
  );

  async function json(url, cache = 'default') {
    const r = await fetch(url, {cache, signal: AbortSignal.timeout(20000)});
    if (!r.ok) throw Error('HTTP ' + r.status);
    return r.json();
  }

  const prefetched = new Set();
  function pickAssetUrl(r, k, maxW = 480) {
    const variants = r.assets?.[k]?.filter(x => x.width <= maxW) || [];
    const asset = variants[variants.length - 1] || r.assets?.[k]?.[0];
    return asset ? new URL(r.asset_base + asset.file, base).href : '';
  }

  function prefetchUrl(href) {
    if (!href || prefetched.has(href)) return;
    prefetched.add(href);
    const img = new Image();
    img.decoding = 'async';
    img.src = href;
  }

  function prefetchSample(r, maxW = 480, kinds = ['rgb', 'd_fixed', 'mask', 'overlay']) {
    if (!r) return;
    const dprW = Math.min(maxW, (window.devicePixelRatio || 1) > 1.25 ? maxW : Math.min(maxW, 320));
    kinds.forEach(k => prefetchUrl(pickAssetUrl(r, k, maxW === 640 ? 640 : dprW)));
  }

  function image(r, k, w = 480, eager = false, sizesOverride = '') {
    const variants = r.assets?.[k]?.filter(x => x.width <= w) || [];
    const asset = variants[variants.length - 1] || r.assets?.[k]?.[0];
    const url = a => new URL(r.asset_base + a.file, base).href;
    const src = asset ? url(asset) : '';
    const sizes = sizesOverride || (w > 480 ? '(min-width:720px) 26vw, 46vw' : '(min-width:1024px) 340px, (min-width:720px) 46vw, 92vw');
    const responsive = variants.length ? ` srcset="${esc(variants.map(a => url(a) + ' ' + a.width + 'w').join(', '))}" sizes="${sizes}"` : '';
    const callout = k === 'overlay' && r.target_region;
    return `<span class="image-stage"${callout ? ` data-target-id="${esc(r.id)}" data-target-label="${esc(cl(r.class_name))}"` : ''}><img src="${esc(src)}"${responsive} data-kind="${esc(k)}" alt="${esc(cl(r.class_name) + ' · ' + modeLabel(k) + ' · ' + r.id)}" width="${asset?.width || w}" height="${asset?.height || w}" loading="${eager ? 'eager' : 'lazy'}" fetchpriority="${eager ? 'high' : 'auto'}" decoding="async">${callout ? '<svg class="target-leader" aria-hidden="true"></svg><span class="target-label" aria-hidden="true"></span>' : ''}</span>`;
  }

  document.addEventListener('error', e => {
    if (e.target.tagName !== 'IMG') return;
    const im = e.target;
    im.hidden = true;
    if (!im.parentNode.querySelector('.image-error')) {
      const p = document.createElement('p');
      p.className = 'image-error';
      p.textContent = tr('图像暂不可用', 'Image temporarily unavailable');
      im.parentNode.append(p);
    }
  }, true);

  function panels(r, eager = false) {
    const heroSizes = '(min-width:1024px) 270px, (min-width:720px) 24vw, 46vw';
    return ['rgb', 'd_fixed', 'mask', 'overlay']
      .map((k, i) => `<div class="figure-panel"><button type="button" data-record="${esc(r.id)}" aria-label="${esc(tr('放大查看', 'Inspect') + ' · ' + cl(r.class_name) + ' · ' + modeLabel(k))}">${image(r, k, 480, eager, heroSizes)}</button><span class="panel-sublabel">(${String.fromCharCode(97 + i)}) ${esc(modeLabel(k))}</span></div>`)
      .join('');
  }

  function modalPanels(r) {
    return ['rgb', 'd_fixed', 'mask', 'overlay']
      .map((k, i) => `<div class="figure-panel">${image(r, k, 640, true)}<span class="panel-sublabel">(${String.fromCharCode(97 + i)}) ${esc(modeLabel(k))}</span></div>`)
      .join('');
  }

  function syncLabels() { window.UAVTargetLabels?.sync(samples); }

  function renderUpstreamSources() {
    const refs = $('#figure-sources');
    if (!refs) return;
    refs.innerHTML = upstreamSources
      .map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a>`)
      .join('');
  }

  function renderPlatforms() {
    const heroHost = $('#hero-platforms');
    if (!heroHost) return;

    heroHost.innerHTML = platforms.map(p => {
      const label = lang === 'zh' ? (p.short_zh || p.zh) : (p.short_en || p.en);
      const icon = PLATFORM_ICONS[p.id] || '';
      const url = (p.url || '').trim();
      if (url) {
        const destination = new URL(url);
        if (p.id === 'baidu' && p.code) destination.searchParams.set('pwd', p.code);
        return `<a class="platform-pill is-live" href="${esc(destination.href)}" target="_blank" rel="noopener noreferrer"><span class="plat-icon">${icon}</span><span>${esc(label)}</span><span class="plat-arrow" aria-hidden="true">↗</span></a>`;
      }
      const tip = tr('数据集正式发布后开放访问', 'Available upon official release');
      return `<span class="platform-pill is-pending" aria-disabled="true" title="${esc(tip)}"><span class="plat-icon">${icon}</span><span>${esc(label)}</span></span>`;
    }).join('');
  }

  function renderHero() {
    if (!heroGroups.length) return;
    const available = heroGroups.map(spec => ({spec, r: samples.find(x => x.id === spec.id)})).filter(x => x.r);
    if (!available.length) return;
    if (activeHeroIndex >= available.length) activeHeroIndex = 0;

    const switcher = $('#hero-switcher');
    switcher.innerHTML = available.map(({r}, idx) =>
      `<button type="button" role="tab" aria-selected="${idx === activeHeroIndex}" data-hero-idx="${idx}">${esc(r.source)} ${esc(cl(r.class_name))}</button>`
    ).join('');

    const {r} = available[activeHeroIndex];
    const host = $('#hero-panels');
    const keepSSR = host.dataset.ssrId === r.id && lang === 'zh';
    if (!keepSSR) {
      delete host.dataset.ssrId;
      host.innerHTML = `<div class="figure-grid">${panels(r, true)}</div>`;
    } else {
      delete host.dataset.ssrId;
    }

    const zhText = translation(r);
    $('#hero-caption').innerHTML =
      `<div class="spotlight-quote"><span class="spotlight-expr-en" lang="en">“${esc(r.expression_en)}”</span>` +
      (lang === 'zh' && zhText ? `<span class="spotlight-expr-zh" lang="zh-CN">${esc(zhText)}</span>` : '') +
      `</div><span class="spotlight-meta">${esc(r.source)} / ${esc(splitLabel(r.split))} / ${esc(viewShort(r.view))}</span>`;

    renderUpstreamSources();
    syncLabels();
  }

  function renderSourceChips() {
    const host = $('#source-chips');
    if (!host) return;
    const srcs = ['CODrone', 'RIS-LAD', 'FlyAwareV2', 'DDOS', 'UAVid', 'UAVPal'].filter(s => samples.some(r => r.source === s));
    const chips = [
      {val: '', label: tr('全部来源', 'All sources')},
      ...srcs.map(s => ({val: s, label: s})),
    ];
    host.innerHTML = chips
      .map(c => `<button type="button" data-source-chip="${esc(c.val)}" aria-pressed="${selectedSourceChip === c.val}">${esc(c.label)}</button>`)
      .join('');
  }

  function options() {
    const el = $('#sample-class'), v = el.value;
    const vals = [...new Set(samples.map(r => r.class_name))].sort();
    el.innerHTML = `<option value="">${tr('全部类别', 'All categories')}</option>` +
      vals.map(x => `<option value="${esc(x)}">${esc(cl(x))}</option>`).join('');
    el.value = v;

    const vel = $('#sample-view'), vv = vel.value;
    vel.innerHTML = `<option value="">${tr('全部视角', 'All views')}</option><option value="oblique_depth">${tr('倾斜视角（深度）', 'Oblique (Depth)')}</option><option value="vertical_relative_height">${tr('垂直视角（相对高度）', 'Vertical (Relative Height)')}</option>`;
    vel.value = vv;
    renderSourceChips();
  }

  function renderGallery() {
    const clsVal = $('#sample-class').value;
    const viewVal = $('#sample-view').value;
    const filtered = samples.filter(r =>
      (!clsVal || r.class_name === clsVal) &&
      (!selectedSourceChip || r.source === selectedSourceChip) &&
      (!viewVal || r.view === viewVal)
    );
    $('#gallery').setAttribute('aria-busy', String(loading));
    const shown = filtered.slice(0, limit);
    const key = lang + '|' + mode + '|' + shown.map(r => r.id).join('|');
    if (key !== galleryKey || !shown.length) {
      galleryKey = key;
      $('#gallery').innerHTML = shown.map(r => `
        <article class="exhibit-card" data-id="${esc(r.id)}">
          <button class="exhibit-media" type="button" data-record="${esc(r.id)}" aria-label="${esc(tr('查看四模态对照', 'Open four-panel comparison') + ' · ' + cl(r.class_name))}">
            ${image(r, mode, 480)}
          </button>
          <div class="exhibit-info">
            <div class="exhibit-head">
              <h3>${esc(cl(r.class_name))}</h3>
              <span class="exhibit-tag">${esc(r.source)} / ${esc(viewShort(r.view))}</span>
            </div>
            <p class="exhibit-expr" lang="${lang === 'zh' && translation(r) ? 'zh-CN' : 'en'}">${esc(expression(r))}</p>
          </div>
        </article>`).join('') ||
        `<p class="empty">${loading ? tr('正在加载代表性样本…', 'Loading representative examples…') : galleryFailed ? tr('样本数据暂不可用，请刷新重试。', 'Examples are temporarily unavailable.') : tr('当前筛选组合暂无匹配样本，可重置筛选条件。', 'No examples match these filters. Try resetting.')}</p>`;
    }
    syncLabels();
    $('#sample-count').textContent = loading
      ? tr('正在加载…', 'Loading…')
      : tr(`显示 ${shown.length} / ${filtered.length} 个样本`, `Showing ${shown.length} of ${filtered.length} examples`);
    $('#load-more').hidden = loading || shown.length >= filtered.length;
    $('#reset-filters').hidden = !(clsVal || selectedSourceChip || viewVal);
    $$('#display-modes button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  }

  function showSample(r) {
    activeSample = r;
    $('#dialog-title').textContent = `${cl(r.class_name)} — ${r.source} (${splitLabel(r.split)})`;
    $('#dialog-content').innerHTML =
      `<div class="figure-grid">${modalPanels(r)}</div>` +
      `<p class="dialog-expression" lang="en">“${esc(r.expression_en)}”</p>` +
      (lang === 'zh' && translation(r) ? `<p class="dialog-translation" lang="zh-CN">${esc(translation(r))}</p>` : '') +
      `<p class="footnote">${geometryNote()}</p>` +
      `<p class="dialog-meta">${esc(r.id)}  /  ${esc(splitLabel(r.split))}  /  ${esc(view(r.view))}</p>`;
    if (!$('#sample-dialog').open) $('#sample-dialog').showModal();
    syncLabels();
  }

  function filterToExamples({cls = '', src = ''} = {}) {
    $('#sample-class').value = cls;
    selectedSourceChip = src;
    $('#sample-view').value = '';
    limit = 12;
    renderSourceChips();
    renderGallery();
    $('#examples')?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  function consistentSummary() {
    const a = summary?.audit;
    if (!a || !dataset || a.actual_population !== dataset.records) return false;
    return ['class', 'source', 'split'].every((k, i) => {
      const d = dataset[['classes', 'sources', 'splits'][i]], s = a.counts[k];
      return d && s && Object.keys(d).length === Object.keys(s).length && Object.entries(d).every(([x, v]) => s[x] === v);
    });
  }

  function renderStatistics() {
    if (!dataset) return;
    for (const [key, value] of Object.entries({
      records: dataset.records,
      groups: dataset.rgb_groups,
      classes: Object.keys(dataset.classes).length,
      sources: Object.keys(dataset.sources).length,
    })) {
      $$(`[data-stat="${key}"]`).forEach(e => e.textContent = n(value));
    }

    const total = dataset.records;
    const classes = Object.entries(dataset.classes).sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...classes.map(x => x[1]));
    $('#class-bars').innerHTML = classes
      .map(([key, count]) => `<div class="bar-row"><button type="button" class="bar-filter" data-filter-class="${esc(key)}" title="${esc(cl(key) + ': ' + n(count))}">${esc(cl(key))}</button><span class="bar-track" aria-hidden="true"><span class="bar-fill" style="width:${100 * count / max}%"></span></span><span class="bar-count">${n(count)}</span><span class="bar-share">${pct(count, total)}</span></div>`)
      .join('') + `<div class="axis" aria-hidden="true"><span>0</span><span>${n(Math.round(max / 2))}</span><span>${n(max)}</span></div>`;

    $('#split-chart').innerHTML =
      '<div class="stack" role="img" aria-label="' + esc(['train', 'val', 'test'].map(k => `${splitLabel(k)} ${n(dataset.splits[k] || 0)}`).join(', ')) + '">' +
      ['train', 'val', 'test'].map((k, i) => `<span style="width:${100 * (dataset.splits[k] || 0) / Math.max(1, total)}%;background:${colors[i]}"></span>`).join('') +
      '</div><div class="split-legend">' +
      ['train', 'val', 'test'].map((k, i) => `<div class="legend-item"><span class="legend-dot" style="background:${colors[i]}"></span>${splitLabel(k)}<b>${n(dataset.splits[k] || 0)}</b><small>${pct(dataset.splits[k] || 0, total)}</small></div>`).join('') +
      '</div>';

    const valid = consistentSummary();
    if (valid) {
      const counts = summary.audit.counts.D_role || {}, keys = ['oblique_depth', 'vertical_relative_height'];
      const a = 100 * (counts[keys[0]] || 0) / Math.max(1, total);
      $('#view-chart').innerHTML = `<div class="view-inner"><svg class="donut" viewBox="0 0 160 160" role="img" aria-label="${esc(tr('视角占比', 'View share'))}"><circle cx="80" cy="80" r="58" fill="none" stroke="#aecbfa" stroke-width="18"/><circle cx="80" cy="80" r="58" pathLength="100" fill="none" stroke="${colors[0]}" stroke-width="18" stroke-dasharray="${a} ${100 - a}" transform="rotate(-90 80 80)"/><text x="80" y="81" text-anchor="middle" font-size="20" font-weight="500">${n(total)}</text><text x="80" y="98" text-anchor="middle" font-size="11" fill="#5f6368">${tr('条记录', 'records')}</text></svg><div class="view-legend">${keys.map((k, i) => `<p><span class="legend-dot" style="background:${i ? '#aecbfa' : colors[0]}"></span>${esc(view(k))}<br><strong>${n(counts[k] || 0)}</strong><small>(${pct(counts[k] || 0, total)})</small></p>`).join('')}</div></div>`;

      const srcSplit = summary.audit.source_split_counts || {};
      const srcList = Object.entries(dataset.sources).sort((a, b) => b[1] - a[1]);
      $('#source-table').innerHTML =
        `<thead><tr><th scope="col">${tr('来源', 'Source')}</th><th scope="col">${splitLabel('train')}</th><th scope="col">${splitLabel('val')}</th><th scope="col">${splitLabel('test')}</th><th scope="col">${tr('合计', 'Total')}</th><th scope="col">${tr('占比', 'Share')}</th></tr></thead><tbody>` +
        srcList.map(([key, count]) => `<tr><th scope="row"><button type="button" class="table-filter" data-filter-source="${esc(key)}">${esc(key)}</button></th><td>${n(srcSplit[key]?.train || 0)}</td><td>${n(srcSplit[key]?.val || 0)}</td><td>${n(srcSplit[key]?.test || 0)}</td><td>${n(count)}</td><td>${pct(count, total)}</td></tr>`).join('') +
        `</tbody><tfoot><tr><th scope="row">${tr('合计', 'Total')}</th><td>${n(dataset.splits.train)}</td><td>${n(dataset.splits.val)}</td><td>${n(dataset.splits.test)}</td><td>${n(total)}</td><td>100%</td></tr></tfoot>`;

      const matrix = summary.audit.class_split_counts || {};
      const highest = Math.max(1, ...Object.values(matrix).flatMap(x => Object.values(x)));
      $('#matrix-table').innerHTML =
        `<thead><tr><th scope="col">${tr('类别', 'Category')}</th><th scope="col">${splitLabel('train')}</th><th scope="col">${splitLabel('val')}</th><th scope="col">${splitLabel('test')}</th><th scope="col">${tr('合计', 'Total')}</th><th scope="col">${tr('占比', 'Share')}</th></tr></thead><tbody>` +
        classes.map(([key, rowTotal]) => `<tr><th scope="row">${esc(cl(key))}</th>${['train', 'val', 'test'].map(k => { const c = matrix[key]?.[k] || 0, ratio = c / highest; return `<td class="matrix-cell" style="background:rgba(26,115,232,${(.03 + .22 * ratio).toFixed(3)});color:#202124">${n(c)}</td>`; }).join('')}<td>${n(rowTotal)}</td><td>${pct(rowTotal, total)}</td></tr>`).join('') +
        `</tbody><tfoot><tr><th scope="row">${tr('合计', 'Total')}</th>${['train', 'val', 'test'].map(k => `<td>${n(dataset.splits[k])}</td>`).join('')}<td>${n(total)}</td><td>100%</td></tr></tfoot>`;
    }

    const note = $('#version-note');
    if (note) {
      note.textContent = tr(
        '说明：RIS-LAD 的原生指代样本源自 CODrone 航拍图像，在划分阶段统一纳入 CODrone 场景聚类分组，从而确保跨划分在图像、源帧分组与场景聚类层面均无重叠。',
        'Note: Native referring records from RIS-LAD share underlying aerial frames with CODrone and are partitioned under unified scene clusters, ensuring zero cross-split overlap.'
      );
    }
    $('#export-stats').disabled = false;
  }

  function applyLanguage() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = lang === 'zh' ? 'UAV-DRES — 无人机 RGB-D 指代分割基准数据集' : 'UAV-DRES — Aerial RGB-D Referring Benchmark';
    $$('[data-zh][data-en]').forEach(e => {
      const target = e.querySelector('.copy-label') || e;
      if (target === e && e.children.length > 0 && e.querySelector('span:not(.dl-meta)')) {
        e.querySelector('span:not(.dl-meta)').textContent = e.dataset[lang];
      } else {
        target.textContent = e.dataset[lang];
      }
    });
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    if (statisticsFailed) $('#data-status').textContent = tr('统计数据暂不可用，请刷新重试。', 'Statistics are temporarily unavailable.');
    options();
    renderPlatforms();
    renderHero();
    renderGallery();
    renderStatistics();
    window.UAVResearch?.setContext(lang, dataset, summary);
    if (activeSample && $('#sample-dialog').open) showSample(activeSample);
  }

  // Stats tabs
  $$('#stats-tabs [role=tab]').forEach((b, i) => {
    const activate = btn => {
      $$('#stats-tabs [role=tab]').forEach(x => {
        const on = x === btn;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        $('#spanel-' + x.dataset.spanel).hidden = !on;
      });
    };
    b.addEventListener('click', () => activate(b));
    b.addEventListener('keydown', e => {
      const tabs = $$('#stats-tabs [role=tab]');
      const t = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : null;
      if (t !== null) { e.preventDefault(); activate(tabs[t]); tabs[t].focus(); }
    });
  });

  // Hero scene switcher + hover/focus predictive prefetch
  $('#hero-switcher').addEventListener('click', e => {
    const b = e.target.closest('[data-hero-idx]');
    if (!b) return;
    activeHeroIndex = Number(b.dataset.heroIdx);
    renderHero();
  });
  const warmHeroTab = e => {
    const b = e.target.closest('[data-hero-idx]');
    if (!b) return;
    const spec = heroGroups[Number(b.dataset.heroIdx)];
    if (spec) prefetchSample(samples.find(x => x.id === spec.id), 480);
  };
  $('#hero-switcher').addEventListener('pointerenter', warmHeroTab, true);
  $('#hero-switcher').addEventListener('focusin', warmHeroTab);

  // Hover predictive prefetch for modality switcher and lightbox modal
  const warmModality = e => {
    const b = e.target.closest('[data-mode]');
    if (!b || b.dataset.mode === mode) return;
    const targetMode = b.dataset.mode;
    $$('#gallery .exhibit-card').forEach(card => {
      const r = samples.find(x => x.id === card.dataset.id);
      if (r) prefetchSample(r, 480, [targetMode]);
    });
  };
  $('#display-modes').addEventListener('pointerenter', warmModality, true);
  $('#display-modes').addEventListener('focusin', warmModality);

  const warmCardModal = e => {
    const card = e.target.closest('.exhibit-card');
    if (!card) return;
    const r = samples.find(x => x.id === card.dataset.id);
    if (r) prefetchSample(r, 640);
  };
  $('#gallery').addEventListener('pointerenter', warmCardModal, true);
  $('#gallery').addEventListener('focusin', warmCardModal);

  // Source filter chips
  $('#source-chips').addEventListener('click', e => {
    const b = e.target.closest('[data-source-chip]');
    if (!b) return;
    selectedSourceChip = b.dataset.sourceChip;
    limit = 6;
    renderSourceChips();
    renderGallery();
  });

  $$('[data-lang]').forEach(b => b.addEventListener('click', () => {
    lang = b.dataset.lang;
    try { localStorage.setItem('uav-research-language', lang); } catch {}
    const u = new URL(location.href);
    u.searchParams.set('lang', lang);
    history.replaceState(null, '', u);
    applyLanguage();
  }));

  ['#sample-class', '#sample-view'].forEach(s => $(s).addEventListener('change', () => { limit = 6; renderGallery(); }));
  $('#reset-filters').addEventListener('click', () => {
    $('#sample-class').value = '';
    $('#sample-view').value = '';
    selectedSourceChip = '';
    limit = 6;
    renderSourceChips();
    renderGallery();
  });
  $$('#display-modes button').forEach(b => b.addEventListener('click', () => { mode = b.dataset.mode; renderGallery(); }));
  $('#load-more').addEventListener('click', () => { limit += 6; renderGallery(); });
  $('#gallery').addEventListener('click', e => { const b = e.target.closest('[data-record]'); if (b) { const r = samples.find(x => x.id === b.dataset.record); if (r) showSample(r); } });
  $('#hero-panels').addEventListener('click', e => { const b = e.target.closest('[data-record]'); if (b) { const r = samples.find(x => x.id === b.dataset.record); if (r) showSample(r); } });
  $('#class-bars').addEventListener('click', e => { const b = e.target.closest('[data-filter-class]'); if (b) filterToExamples({cls: b.dataset.filterClass}); });
  $('#source-table').addEventListener('click', e => { const b = e.target.closest('[data-filter-source]'); if (b) filterToExamples({src: b.dataset.filterSource}); });
  $('#close-dialog').addEventListener('click', () => $('#sample-dialog').close());
  $('#sample-dialog').addEventListener('click', e => {
    if (e.target === $('#sample-dialog')) {
      const r = e.target.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
    }
  });
  $('#sample-dialog').addEventListener('close', () => { activeSample = null; });

  $('#export-stats').addEventListener('click', () => {
    if (!dataset) return;
    const rows = [['dimension', 'value', 'count']];
    const dims = {
      category: dataset.classes,
      source: dataset.sources,
      split: dataset.splits,
      ...(consistentSummary() ? {geometry: summary.audit.counts.D_role} : {}),
    };
    for (const [dim, obj] of Object.entries(dims)) {
      for (const [key, count] of Object.entries(obj)) rows.push([dim, key, count]);
    }
    rows.push(['total', 'referring_records', dataset.records], ['total', 'unique_rgb_images', dataset.rgb_groups], ['total', 'source_groups', dataset.source_groups || 6278]);
    const csv = '\uFEFF' + rows.map(r => r.map(v => '"' + String(v).replaceAll('"', '""') + '"').join(',')).join('\r\n');
    const u = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'})), a = document.createElement('a');
    a.href = u;
    a.download = 'uav-rgbd-statistics.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  });

  const bibTemplate = $('#bibtex code').textContent;
  function updateBibtexUrl() {
    const siteUrl = new URL('../', base).href;
    $('#bibtex code').textContent = bibTemplate.replace('__SITE__', siteUrl);
  }
  updateBibtexUrl();

  async function loadStatistics() {
    const [d, s] = await Promise.allSettled([
      json(new URL('v11/dataset.json?v=' + CACHE_VER, base)),
      json(new URL('v11/summary.json?v=' + CACHE_VER, base)),
    ]);
    if (d.status === 'fulfilled') dataset = d.value;
    if (s.status === 'fulfilled') summary = s.value;
    if (!dataset) {
      statisticsFailed = true;
      $('#data-status').hidden = false;
      $('#data-status').textContent = tr('统计数据暂不可用，请刷新重试。', 'Statistics are temporarily unavailable.');
    }
    renderStatistics();
    window.UAVResearch?.setContext(lang, dataset, summary);
  }

  async function loadExamples() {
    try {
      const manifest = await json(new URL('showcase-data-v11.json?v=' + CACHE_VER, base));
      if (manifest.schema_version !== 2 || !manifest.items?.length) throw Error('Invalid showcase data');
      samples = manifest.items.map(r => ({...r, asset_base: manifest.asset_base}));
      heroGroups = manifest.hero_groups || [];
      upstreamSources = manifest.upstream_sources || [];
      loading = false;
      options();
      renderHero();
      renderGallery();
      const warmRemainingHero = () => {
        heroGroups.slice(1).forEach(spec => prefetchSample(samples.find(x => x.id === spec.id), 480));
      };
      if (typeof requestIdleCallback === 'function') requestIdleCallback(warmRemainingHero, {timeout: 1800});
      else setTimeout(warmRemainingHero, 900);
    } catch {
      galleryFailed = true;
      loading = false;
      renderGallery();
    }
  }

  async function loadReleaseLinks() {
    try {
      const cfg = await json(new URL('release-links.json?v=' + CACHE_VER, base));
      if (Array.isArray(cfg?.platforms) && cfg.platforms.length) {
        platforms = cfg.platforms;
        renderPlatforms();
        updateBibtexUrl();
      }
    } catch {}
  }

  applyLanguage();
  Promise.allSettled([loadReleaseLinks(), loadStatistics(), loadExamples()]);
})();
