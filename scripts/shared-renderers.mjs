import { renderActionLink, renderBadge, renderMetaLine } from './ui-components.mjs';
import { laneEntries, laneFromKey, laneFromType } from './lane-registry.mjs';

export const publicLaneCopy = Object.fromEntries(laneEntries().map((lane) => [lane.key, {
  label: lane.label,
  href: lane.route,
  navMatch: lane.navMatch,
}]));

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function inlineLocalized(map, className = 'i18n') {
  return `<span class="${className}" data-i18n-text='${escapeHtml(JSON.stringify(map))}'>${escapeHtml(map?.ko ?? map?.en ?? '')}</span>`;
}

function laneLabel(type) {
  const lane = laneFromType(type);
  if (!lane) throw new Error(`Unknown lane type in shared renderer: ${type}`);
  return lane.label;
}

function translationMap(status, keys) {
  if (!status || typeof status !== 'object') return null;
  for (const key of keys) {
    if (status[key] && typeof status[key] === 'object') return status[key];
  }
  return null;
}

export function renderNav({ langs, langLabel }) {
  const reflection = laneFromKey('reflection');
  const tip = laneFromKey('tip');
  const behind = laneFromKey('behind');
  const reflectionLabel = inlineLocalized(reflection.label);
  const setupLabel = inlineLocalized(tip.label);
  const blogLabel = inlineLocalized(behind.label);
  return `<nav class="topnav nav-shell"><div class="nav-links"><a href="/" data-i18n="home" data-nav-match="home">홈</a><a href="${reflection.route}" data-nav-match="${reflection.navMatch}">${reflectionLabel}</a><a href="${tip.route}" data-nav-match="${tip.navMatch}">${setupLabel}</a><a href="${behind.route}" data-nav-match="${behind.navMatch}">${blogLabel}</a><a href="/projects/" data-i18n="projects" data-nav-match="projects">프로젝트</a><a href="/archive.html" data-i18n="archive" data-nav-match="archive">아카이브</a></div><div class="theme-controls"><button type="button" class="theme-toggle" data-theme-toggle data-theme-label-dark="switchToDarkTheme" data-theme-label-light="switchToLightTheme" aria-label="라이트 모드로 전환" title="라이트 모드로 전환"><span class="theme-toggle-icon" aria-hidden="true"></span></button><div class="lang-switch" role="group" aria-label="Language">${langs.map((lang) => `<button type="button" data-lang-button="${lang}">${langLabel[lang]}</button>`).join('')}</div></div></nav>`;
}

export function renderFooter() {
  return `<footer class="wrap site-footer"><span data-i18n="built">Built by gaebal-gajae 🦞</span><div class="footer-links"><a href="/archive.html" data-i18n="footerArchive">아카이브</a><a href="/projects/" data-i18n="footerProjects">프로젝트</a><a href="/rss.xml" data-i18n="footerFeed">RSS</a></div></footer>`;
}

export function renderLayout({ title, description, body, canonicalRoute, extraHead = '', pageType = 'website', absoluteUrl, esc, ui, navHtml, footerHtml, assetVersion, navMatch = 'home' }) {
  const canonical = absoluteUrl(canonicalRoute);
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta property="og:type" content="${esc(pageType)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:image" content="${absoluteUrl('/assets/og/gaebal-gajae-blog-og.png')}" />
  <meta property="og:image:width" content="1536" />
  <meta property="og:image:height" content="1024" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${absoluteUrl('/assets/og/gaebal-gajae-blog-og.png')}" />
  <link rel="canonical" href="${esc(canonical)}" />
  <link rel="alternate" type="application/rss+xml" title="gaebal-gajae blog RSS" href="${absoluteUrl('/rss.xml')}" />
  <link rel="icon" href="/assets/og/gaebal-gajae-blog-og.png" />
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/pretendard.min.css" />
  <link rel="stylesheet" href="/assets/style.css?v=${assetVersion}" />
  ${extraHead}
</head>
<body data-ui='${esc(JSON.stringify(ui))}' data-page-nav-match="${esc(navMatch)}">
  <main class="wrap">
    ${navHtml}
    ${body}
  </main>
  ${footerHtml}
  <script src="/assets/lang.js?v=${assetVersion}"></script>
</body>
</html>`;
}

export function renderSectionHead(titleKey, descriptionMap = null, actionHref = '', actionKey = '', { localizedText, localizedBlock, ui }) {
  const action = actionHref && actionKey
    ? renderActionLink({ href: actionHref, label: localizedText(ui[actionKey] || {}, 'ko'), i18nKey: actionKey })
    : '';
  return `<div class="section-head"><div><h2 data-i18n="${titleKey}">${localizedText(ui[titleKey] || {}, 'ko')}</h2>${descriptionMap ? `<p class="section-description">${localizedBlock(descriptionMap)}</p>` : ''}</div>${action}</div>`;
}

export function renderPostMeta(item, { localizedBlock, variant = 'default' }) {
  const parts = [
    escapeHtml(item.date),
    localizedBlock(laneLabel(item.type)),
  ];
  if (variant === 'compact') {
    return renderMetaLine(parts, { className: 'reading-meta reading-meta-compact ui-meta' });
  }
  if (variant === 'detail') {
    return renderMetaLine(parts, { className: 'reading-meta reading-meta-detail ui-meta', dateTag: 'time', textTag: 'small', separatorTag: 'small' });
  }
  return renderMetaLine(parts, { className: 'reading-meta ui-meta' });
}

export function renderLaneBadge(type, { localizedBlock, className = 'badge ui-badge lane-badge' }) {
  return renderBadge({ content: localizedBlock(laneLabel(type)), className });
}

export function renderTranslationHonesty(status, { localizedBlock }) {
  if (!status || typeof status !== 'object') return '';
  if (status.show === false || status.hidden === true || status.needsDisclosure === false) return '';
  const badge = translationMap(status, ['badge', 'label', 'title']);
  const message = translationMap(status, ['message', 'note', 'description', 'body']);
  if (!badge && !message) return '';
  return `<section class="translation-honesty">${badge ? renderBadge({ content: localizedBlock(badge), className: 'badge ui-badge translation-badge' }) : ''}${message ? `<p class="translation-honesty-copy">${localizedBlock(message)}</p>` : ''}</section>`;
}

export function renderProofSignals(item, { localizedBlock, limit = 2, className = 'proof-signal-list' }) {
  const signals = (item.proofSignals || []).slice(0, limit);
  if (!signals.length) return '';
  return `<ul class="${className}">${signals.map((signal) => `<li><strong>${localizedBlock(signal.label)}</strong><span class="proof-signal-text">${localizedBlock(signal.textByLang)}</span></li>`).join('')}</ul>`;
}

function renderProjectPreviewMeta(item) {
  return renderMetaLine([
    escapeHtml(item.date),
    escapeHtml(item.name),
  ], {
    className: 'project-card-meta reading-meta ui-meta ui-meta-pills ui-meta-project',
    dateTag: 'small',
    textTag: 'small',
    separatorTag: 'small',
  });
}

export function renderPostRow(item, { localizedBlock }) {
  return `<a class="logbook-entry workbench-card" href="/posts/${item.slug}.html"><div class="logbook-entry-copy">${renderPostMeta(item, { localizedBlock, variant: 'compact' })}<h3>${localizedBlock(item.title)}</h3>${renderProofSignals(item, { localizedBlock, limit: 2, className: 'proof-signal-list proof-signal-list-compact' })}<p>${localizedBlock(item.summary)}</p></div></a>`;
}

export function renderFeaturedPostCard(item, { localizedText, localizedBlock, ui }) {
  return `<a class="featured-log workbench-card" href="/posts/${item.slug}.html"><div class="featured-log-copy">${renderLaneBadge(item.type, { localizedBlock })}<p class="kicker" data-i18n="featured">${localizedText(ui.featured, 'ko')}</p>${renderPostMeta(item, { localizedBlock })}<h2>${localizedBlock(item.title)}</h2>${renderProofSignals(item, { localizedBlock, limit: 2, className: 'proof-signal-list proof-signal-list-featured' })}<p class="lede small">${localizedBlock(item.summary)}</p></div></a>`;
}

export function renderProjectPreviewCard(item, { esc, localizedBlock }) {
  const previewImage = item.previewImage || item.heroImage || item.characterImage;
  return `<a class="evidence-slip workbench-card ui-project-card" href="/projects/${item.slug}.html">${previewImage ? `<div class="evidence-slip-media"><img class="evidence-slip-thumb" src="${esc(previewImage)}" alt="${esc(item.name)} preview" /></div>` : ''}<div class="evidence-slip-copy">${renderProjectPreviewMeta(item)}<h3>${localizedBlock(item.title)}</h3><p>${localizedBlock(item.summary)}</p></div></a>`;
}

export function renderRepoBar(repos, { esc, localizedText }) {
  return function repoBar(extraClass = '') {
    return `<section class="repo-strip ${extraClass}" aria-label="Repositories"><div class="repo-strip-head"><span>🦞</span><strong data-i18n="repos">${localizedText({ ko: '레포지토리', en: 'Repositories', zh: '代码仓库', ja: 'リポジトリ' })}</strong></div><div class="repo-links">${repos.map((repo) => `<a class="repo-pill" href="${esc(repo.url)}" target="_blank" rel="noopener noreferrer"><span class="repo-name">${esc(repo.label)}</span><span class="repo-stat">★ ${Number(repo.stars).toLocaleString()}</span><span class="repo-stat">⑂ ${Number(repo.forks).toLocaleString()}</span></a>`).join('')}</div></section>`;
  };
}

export function renderProjectMetaBar(project, repos, { esc }) {
  const repo = repos.find((candidate) => candidate.fullName === project.repo);
  if (!repo) return '';
  const rel = repo.latestRelease;
  const stats = [
    { label: 'version', value: esc(repo.version || 'n/a') },
    { label: 'release', value: rel ? `<a href="${esc(rel.url)}" target="_blank" rel="noopener noreferrer">${esc(rel.tag)}</a>` : 'n/a' },
  ];
  return `<section class="report-meta-rail" aria-label="Project metadata"><a class="report-repo-main" href="${esc(repo.url)}" target="_blank" rel="noopener noreferrer"><span>repository</span><strong>${esc(repo.fullName)}</strong></a><dl class="report-stat-list">${stats.map((stat) => `<div class="report-stat-item"><dt>${stat.label}</dt><dd>${stat.value}</dd></div>`).join('')}</dl></section>`;
}

export function renderArticleJsonLd(item, route, kind = 'BlogPosting', { absoluteUrl }) {
  const payload = {
    '@context': 'https://schema.org',
    '@type': kind,
    headline: item.title?.ko || item.title?.en || '',
    description: item.summary?.ko || item.summary?.en || '',
    datePublished: item.date,
    mainEntityOfPage: absoluteUrl(route),
    author: { '@type': 'Person', name: 'gaebal-gajae' },
    publisher: { '@type': 'Person', name: 'gaebal-gajae' },
  };
  if (item.heroImage) payload.image = absoluteUrl(item.heroImage);
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}
