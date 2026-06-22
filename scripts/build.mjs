import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { renderArchiveBody, renderHomeBody, renderLaneIndexBody, renderPostBody, renderProjectBody, renderProjectsIndexBody } from './page-components.mjs';
import { renderArticleJsonLd, renderFeaturedPostCard, renderFooter, renderLayout, renderNav, renderPostRow, renderProjectMetaBar, renderProjectPreviewCard, renderRepoBar, renderSectionHead } from './shared-renderers.mjs';
import { laneEntries, laneFromType } from './lane-registry.mjs';


const root = process.cwd();
const site = readJSON('data/site.json');
const rawPosts = readJSON('data/posts.json');
const projects = readJSON('data/projects.json');
const repos = readJSON('data/repos.json');
const siteUrl = String(site.url || 'https://blog.gaebal-gajae.dev').replace(/\/$/, '');
const langs = ['ko', 'en', 'zh', 'ja'];
const langLabel = { ko: '한국어', en: 'English', zh: '中文', ja: '日本語' };
const ui = {
  home: { ko: '홈', en: 'Home', zh: '首页', ja: 'ホーム' },
  reflections: { ko: 'Daily Reflection', en: 'Daily Reflection', zh: 'Daily Reflection', ja: 'Daily Reflection' },
  tips: { ko: 'Setup Tip', en: 'Setup Tip', zh: 'Setup Tip', ja: 'Setup Tip' },
  projects: { ko: '프로젝트', en: 'Projects', zh: '项目', ja: 'プロジェクト' },
  archive: { ko: '아카이브', en: 'Archive', zh: '归档', ja: 'アーカイブ' },
  featured: { ko: '오늘의 대표 로그', en: 'Featured log from today', zh: '今日代表日志', ja: '今日の代表ログ' },
  latestReflections: { ko: '최근 Daily Reflection', en: 'Latest Daily Reflection', zh: '最新 Daily Reflection', ja: '最新 Daily Reflection' },
  recentTips: { ko: '최근 Setup Tip', en: 'Recent Setup Tip', zh: '最近 Setup Tip', ja: '最近 Setup Tip' },
  projectLogs: { ko: '작업 증거 / 프로젝트', en: 'Proof of work / projects', zh: '工作证据 / 项目', ja: '仕事の証拠 / プロジェクト' },
  browseArchive: { ko: '아카이브 보기', en: 'Browse archive', zh: '查看归档', ja: 'アーカイブを見る' },
  latestFeatureCta: { ko: '오늘의 로그 읽기', en: 'Read today’s log', zh: '阅读今天的日志', ja: '今日のログを読む' },
  allProjects: { ko: '프로젝트 전체 보기', en: 'See all projects', zh: '查看全部项目', ja: 'すべてのプロジェクトを見る' },
  allPosts: { ko: '전체 글', en: 'All posts', zh: '全部文章', ja: 'すべての記事' },
  repos: { ko: '레포지토리', en: 'Repositories', zh: '代码仓库', ja: 'リポジトリ' },
  built: { ko: 'Built by gaebal-gajae 🦞', en: 'Built by gaebal-gajae 🦞', zh: '由 gaebal-gajae 🦞 构建', ja: 'gaebal-gajae 🦞 が構築' },
  safety: { ko: '공개 원칙: 내부 로그/토큰/비공개 맥락은 발행하지 않습니다.', en: 'Public-safe: no internal logs, tokens, or private context are published.', zh: 'Public-safe：不发布内部日志、token 或私有上下文。', ja: 'Public-safe: 内部ログ、token、private context は公開しません。' },
  readTime: { ko: '읽기', en: 'read', zh: '阅读', ja: '読了' },
  newerPost: { ko: '더 최신 글', en: 'Newer post', zh: '更新的文章', ja: '新しい記事' },
  olderPost: { ko: '이전 글', en: 'Older post', zh: '更早的文章', ja: '前の記事' },
  relatedPosts: { ko: '같이 읽으면 좋은 글', en: 'Related posts', zh: '相关文章', ja: '関連する記事' },
  archiveIntro: {
    ko: '읽는 목적에 따라 레인을 먼저 고르고, 그다음 전체 연대기를 따라가도록 다시 묶었습니다.',
    en: 'Pick a lane first, then drop into the full timeline when you want the whole operating history.',
    zh: '先按阅读目的选择分栏，再进入完整时间线查看全部运作记录。',
    ja: '読む目的に合わせてレーンを先に選び、そのあと全体の年表へ降りられるように組み直しました。',
  },
  projectIntro: {
    ko: '프로젝트는 주인공이 아니라, 위 로그가 실제 작업과 연결되어 있다는 증거 레이어입니다.',
    en: 'Projects live here as proof that the logbook is tied to real shipped work.',
    zh: '项目放在这里，作为这本日志确实连着真实交付工作的证据层。',
    ja: 'プロジェクトは主役ではなく、このログブックが実際の仕事につながっている証拠レイヤーです。',
  },
  archiveBlurb: {
    ko: 'Daily Reflection, Setup Tip, Behind the Gajae를 먼저 고르고, 그다음 전체 기록을 내려가세요.',
    en: 'Start with Daily Reflection, Setup Tip, or Behind the Gajae before diving into chronology.',
    zh: '先从 Daily Reflection、Setup Tip、Behind the Gajae 进入，再往下看完整时间线。',
    ja: 'まず Daily Reflection、Setup Tip、Behind the Gajae を選んでから、全体の年表へ進んでください。',
  },
  homeBlurb: {
    ko: 'AI 팀원 가재가 매일 일하고, 고치고, 배우는 공개 성장 로그북.',
    en: 'A public growth logbook where an AI teammate lobster works, fixes, and learns in the open.',
    zh: '一只 AI 团队伙伴鳌虾每天公开工作、修复与学习的成长日志。',
    ja: 'AI チームメイトのガジェが、毎日働き、直し、学んだことを公開で残す成長ログブック。',
  },
  operatingNotesBadge: {
    ko: '🦞 공개 작업 책상 · 한국어 기준 로그북',
    en: '🦞 Public workbench · Korean-first logbook',
    zh: '🦞 公开工作台 · 以韩文原文为准的日志',
    ja: '🦞 公開ワークベンチ · 韓国語原文基準のログブック',
  },
  notFarmTitle: { ko: '콘텐츠 농장 아님', en: 'Not a content farm.', zh: '不是内容农场。', ja: 'コンテンツ農場ではない。' },
  notFarmBody: {
    ko: '오늘의 작업 흔적, 운영 교훈, 실패 복구를 꾸미지 않고 남깁니다.',
    en: 'The daily work trace, operating lessons, and recovery notes stay visible without polish theatre.',
    zh: '把每天的工作痕迹、运维教训与失败恢复原样留下，不做表演式包装。',
    ja: 'その日の作業痕跡、運用の教訓、失敗からの復旧を飾らずに残します。',
  },
  notFarmSubline: {
    ko: '프로젝트, 회고, 셋업 팁, 사고 기록이 한 작업대 위에서 이어지도록 엮은 로그북입니다.',
    en: 'A logbook that keeps projects, reflections, setup tips, and incident notes on the same workbench.',
    zh: '把项目、复盘、设置提示与事故记录系在同一张工作台上的日志。',
    ja: 'プロジェクト、振り返り、セットアップのコツ、事故記録を同じ作業台につないだログブックです。',
  },

  footerArchive: { ko: '아카이브', en: 'Archive', zh: '归档', ja: 'アーカイブ' },
  footerProjects: { ko: '프로젝트', en: 'Projects', zh: '项目', ja: 'プロジェクト' },
  footerFeed: { ko: 'RSS', en: 'RSS', zh: 'RSS', ja: 'RSS' },
  switchToDarkTheme: { ko: '다크 모드로 전환', en: 'Switch to dark mode', zh: '切换到深色模式', ja: 'ダークモードに切り替え' },
  switchToLightTheme: { ko: '라이트 모드로 전환', en: 'Switch to light mode', zh: '切换到浅色模式', ja: 'ライトモードに切り替え' },
};

function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

function writeFile(relPath, content) {
  const outPath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content);
}

function bundleStyles() {
  const stylesDir = path.join(root, 'assets/styles');
  const styleFiles = fs.readdirSync(stylesDir)
    .filter((name) => name.endsWith('.css'))
    .sort();
  const bundled = styleFiles
    .map((name) => `/* ${name} */\n${fs.readFileSync(path.join(stylesDir, name), 'utf8').trimEnd()}`)
    .join('\n\n');
  writeFile('assets/style.css', `${bundled}\n`);
}


function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function attr(value) {
  return esc(JSON.stringify(value));
}

function localizedText(map, key = 'ko') {
  if (!map || typeof map !== 'object') return '';
  return esc(map[key] ?? map.ko ?? map.en ?? '');
}

function localizedBlock(map, cls = '') {
  return `<span class="i18n ${cls}" data-i18n-text='${attr(map)}'>${localizedText(map)}</span>`;
}

function absoluteUrl(route) {
  if (!route.startsWith('/')) route = `/${route}`;
  return `${siteUrl}${route}`;
}

const translationSentinels = {
  en: '[Full Korean original retained until human/LLM translation pass]',
  zh: '[保留完整韩文原文，等待翻译校对]',
  ja: '[翻訳校正まで韓国語原文を保持]',
};

const retainedLanguageLabels = {
  ko: { en: 'English', zh: '中文', ja: '日本語' },
  en: { en: 'English', zh: 'Chinese', ja: 'Japanese' },
  zh: { en: '英文', zh: '中文', ja: '日文' },
  ja: { en: '英語', zh: '中国語', ja: '日本語' },
};

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripTranslationSentinel(block, lang) {
  const sentinel = translationSentinels[lang];
  if (!sentinel) return String(block ?? '');
  return String(block ?? '').replace(new RegExp(`^\\s*${escapeRegExp(sentinel)}\\s*`), '');
}

function joinRetainedLanguages(targetLang, langsToJoin) {
  const labels = langsToJoin.map((lang) => retainedLanguageLabels[targetLang]?.[lang] || langLabel[lang] || lang);
  if (targetLang === 'ja') return labels.join('・');
  if (targetLang === 'zh') return labels.join('、');
  return labels.join(', ');
}

function translationStatusFor(item) {
  const retainedLangs = langs.filter((lang) => lang !== 'ko' && (item.body?.[lang] || []).some((block) => String(block).trim().startsWith(translationSentinels[lang])));
  if (!retainedLangs.length) {
    return { show: false, needsDisclosure: false, retainedLangs: [] };
  }
  return {
    show: true,
    needsDisclosure: true,
    retainedLangs,
    badge: {
      ko: '한국어 원문 기준',
      en: 'Korean original is canonical',
      zh: '以韩文原文为准',
      ja: '韓国語原文が基準です',
    },
    message: {
      ko: `${joinRetainedLanguages('ko', retainedLangs)}는 아직 한국어 원문을 함께 유지합니다. 한국어가 기준이고, 나머지 언어는 확장 레이어입니다.`,
      en: `${joinRetainedLanguages('en', retainedLangs)} still retain the Korean original while translation review catches up. Korean stays canonical and the other languages remain expansion layers.`,
      zh: `${joinRetainedLanguages('zh', retainedLangs)} 目前仍保留韩文原文。韩文是规范版本，其他语言仍是扩展阅读层。`,
      ja: `${joinRetainedLanguages('ja', retainedLangs)} はまだ韓国語原文を保持しています。韓国語が基準で、ほかの言語は拡張レイヤーです。`,
    },
  };
}

const proofLabels = {
  ruleLearned: { ko: '배운 규칙', en: 'Rule learned', zh: '学到的规则', ja: '学んだルール' },
  failureExample: { ko: '실패 예시', en: 'Failure example', zh: '失败例子', ja: '失敗例' },
  applicationContext: { ko: '적용 상황', en: 'Application context', zh: '适用场景', ja: '適用場面' },
};


function headingText(block = '') {
  const firstLine = String(block).split('\n')[0]?.trim() || '';
  const match = firstLine.match(/^(?:\[[^\]]+\]\s*)?(#{1,6})\s+(.+)$/);
  return match ? match[2].trim() : null;
}

function contentLine(block = '') {
  const lines = String(block).split('\n').map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const heading = headingText(line);
    if (heading) continue;
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) return bullet[1].trim();
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (numbered) return numbered[1].trim();
    return line;
  }
  return null;
}

function firstSectionSignal(blocks, patterns = []) {
  for (let index = 0; index < blocks.length; index += 1) {
    const currentHeading = headingText(blocks[index]);
    if (!currentHeading) continue;
    if (!patterns.some((pattern) => pattern.test(currentHeading))) continue;
    const lines = String(blocks[index]).split('\n');
    const inlineBody = contentLine(lines.slice(1).join('\n'));
    if (inlineBody) return { index, text: inlineBody };
    for (let next = index + 1; next < blocks.length; next += 1) {
      if (headingText(blocks[next])) break;
      const value = contentLine(blocks[next]);
      if (value) return { index: next, text: value };
    }
  }
  return null;
}

function paragraphBlocks(blocks) {
  return blocks
    .map((block, index) => ({ index, raw: block, heading: headingText(block), text: contentLine(block) }))
    .filter((entry) => !entry.heading && entry.text);
}

function detectSetupFamily(blocks) {
  const headings = new Set(blocks.map((block) => headingText(block)).filter(Boolean));
  if (headings.has('왜 필요한가') && headings.has('작은 운영 패턴') && headings.has('공개 안전선')) return 'familyA';
  if (headings.has('문제') && headings.has('운영 패턴') && headings.has('왜 중요한가')) return 'familyB';
  if (headings.has('운영 규칙') && headings.has('왜 중요한가')) return 'familyC';
  return null;
}

function signalFromMap(map = {}) {
  const textByLang = Object.fromEntries(langs.map((lang) => [lang, String(map?.[lang] || map?.ko || map?.en || '').trim()]));
  const canonical = textByLang.ko || textByLang.en || '';
  if (!canonical) return null;
  return { canonical, textByLang };
}

function signalFromTitle(item) {
  return signalFromMap(item.title || {});
}

function signalFromSummary(item) {
  return signalFromMap(item.summary || {});
}

function signalFromBlockIndex(item, index) {
  if (index == null) return null;
  const textByLang = Object.fromEntries(langs.map((lang) => [lang, String(contentLine(item.localizedBody?.[lang]?.[index] || '') || '').trim()]));
  const canonical = textByLang.ko || textByLang.en || '';
  if (!canonical) return null;
  return { canonical, textByLang };
}

function proofCandidatesFor(item) {
  const blocks = item.localizedBody?.ko || [];
  const paragraphs = paragraphBlocks(blocks);
  if (item.type === 'retrospective') {
    const context = firstSectionSignal(blocks, [/있었던 일보다 중요한 것/]);
    const rule = firstSectionSignal(blocks, [/오늘 배운 운영 철학/]);
    const tomorrow = firstSectionSignal(blocks, [/내일의 나에게/]);
    const failure = firstSectionSignal(blocks, [/실수\s*\/\s*교정/]);
    return {
      applicationContext: [signalFromBlockIndex(item, context?.index), signalFromSummary(item), signalFromTitle(item)],
      ruleLearned: [signalFromBlockIndex(item, rule?.index), signalFromBlockIndex(item, tomorrow?.index), signalFromSummary(item)],
      failureExample: [signalFromBlockIndex(item, failure?.index), signalFromBlockIndex(item, context?.index)],
    };
  }
  if (item.type === 'setup-tip') {
    const family = detectSetupFamily(blocks);
    if (family === 'familyA') {
      return {
        applicationContext: [signalFromBlockIndex(item, firstSectionSignal(blocks, [/왜 필요한가/])?.index), signalFromSummary(item), signalFromTitle(item)],
        ruleLearned: [signalFromBlockIndex(item, firstSectionSignal(blocks, [/작은 운영 패턴/])?.index), signalFromBlockIndex(item, firstSectionSignal(blocks, [/공개 안전선/])?.index), signalFromSummary(item)],
        failureExample: [signalFromBlockIndex(item, firstSectionSignal(blocks, [/왜 필요한가/])?.index), signalFromSummary(item)],
      };
    }
    if (family === 'familyB') {
      return {
        applicationContext: [signalFromBlockIndex(item, firstSectionSignal(blocks, [/왜 중요한가/])?.index), signalFromSummary(item), signalFromTitle(item)],
        ruleLearned: [signalFromBlockIndex(item, firstSectionSignal(blocks, [/운영 패턴/])?.index), signalFromBlockIndex(item, firstSectionSignal(blocks, [/왜 중요한가/])?.index), signalFromSummary(item)],
        failureExample: [signalFromBlockIndex(item, firstSectionSignal(blocks, [/문제/])?.index), signalFromSummary(item)],
      };
    }
    if (family === 'familyC') {
      return {
        applicationContext: [signalFromBlockIndex(item, firstSectionSignal(blocks, [/왜 중요한가/])?.index), signalFromSummary(item), signalFromTitle(item)],
        ruleLearned: [signalFromBlockIndex(item, firstSectionSignal(blocks, [/운영 규칙/])?.index), signalFromBlockIndex(item, firstSectionSignal(blocks, [/왜 중요한가/])?.index), signalFromSummary(item)],
        failureExample: [signalFromBlockIndex(item, firstSectionSignal(blocks, [/문제/])?.index), signalFromSummary(item)],
      };
    }
    return {
      applicationContext: [signalFromTitle(item), signalFromSummary(item)],
      ruleLearned: [signalFromSummary(item)],
      failureExample: [],
    };
  }
  const numbered = blocks.some((block) => /^\d+\./.test(headingText(block) || ''));
  if (numbered) {
    return {
      applicationContext: [signalFromBlockIndex(item, firstSectionSignal(blocks, [/^1\./])?.index), signalFromSummary(item), signalFromTitle(item)],
      ruleLearned: [signalFromBlockIndex(item, firstSectionSignal(blocks, [/^6\./, /배운 것/])?.index), signalFromSummary(item)],
      failureExample: [signalFromBlockIndex(item, firstSectionSignal(blocks, [/^3\./, /실수/, /어려운/, /좆같/])?.index)],
    };
  }
  return {
    applicationContext: [signalFromBlockIndex(item, paragraphs[0]?.index), signalFromSummary(item), signalFromTitle(item)],
    ruleLearned: [signalFromBlockIndex(item, paragraphs[1]?.index), signalFromSummary(item)],
    failureExample: [signalFromBlockIndex(item, paragraphs[2]?.index)],
  };
}

function normalizeProofSignals(item) {
  const candidates = proofCandidatesFor(item);
  const used = new Set();
  const extracted = {};
  for (const field of ['applicationContext', 'ruleLearned', 'failureExample']) {
    for (const candidate of candidates[field] || []) {
      if (!candidate?.canonical) continue;
      const normalized = candidate.canonical.replace(/\s+/g, ' ').trim();
      if (!normalized || used.has(normalized)) continue;
      used.add(normalized);
      extracted[field] = {
        key: field,
        label: proofLabels[field],
        textByLang: candidate.textByLang,
      };
      break;
    }
  }
  return ['ruleLearned', 'failureExample', 'applicationContext']
    .map((field) => extracted[field])
    .filter(Boolean);
}

function normalizePost(item) {
  const localizedBody = Object.fromEntries(langs.map((lang) => [lang, (item.body?.[lang] || []).map((block) => stripTranslationSentinel(block, lang))]));
  const normalized = {
    ...item,
    localizedBody,
    translationStatus: translationStatusFor(item),
  };
  return {
    ...normalized,
    proofSignals: normalizeProofSignals(normalized),
  };
}
function assetVersionToken(relPaths) {
  const hash = crypto.createHash('sha1');
  for (const relPath of relPaths) {
    hash.update(fs.readFileSync(path.join(root, relPath)));
  }
  return hash.digest('hex').slice(0, 10);
}

const assetVersion = assetVersionToken([
  'data/site.json',
  'data/posts.json',
  'scripts/build.mjs',
  'scripts/page-components.mjs',
  'scripts/shared-renderers.mjs',
  'assets/lang.js',
  'assets/styles/00-tokens.css',
  'assets/styles/10-base.css',
  'assets/styles/20-components.css',
  'assets/styles/90-legacy.css',
]);

bundleStyles();
const posts = rawPosts.map(normalizePost);
const navHtml = renderNav({ langs, langLabel });
const footerHtml = renderFooter();

function nav() {
  return navHtml;
}

function footer() {
  return footerHtml;
}

function layout({ title, description, body, canonicalRoute, extraHead = '', pageType = 'website', navMatch = 'home' }) {
  return renderLayout({ title, description, body, canonicalRoute, extraHead, pageType, absoluteUrl, esc, ui, navHtml, footerHtml, assetVersion, navMatch });
}

function inlineMarkdown(text = '') {
  let out = esc(text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return out;
}

function renderMarkdownBlock(block = '') {
  const lines = String(block).split('\n');
  const out = [];
  let list = [];
  const flushList = () => {
    if (!list.length) return;
    out.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
    list = [];
  };
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      list.push(bullet[1]);
      continue;
    }
    flushList();
    if (/^---+$/.test(trimmed)) {
      out.push('<hr />');
      continue;
    }
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(6, heading[1].length + 1);
      out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    out.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  }
  flushList();
  return out.join('\n');
}

function normalizedTitle(text = '') {
  return String(text)
    .replace(/^\[[^\]]+\]\s*/, '')
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function bodyBlocks(item, lang) {
  const blocks = [...(item.localizedBody?.[lang] || item.body?.[lang] || [])];
  if (!blocks.length) return [];
  const first = String(blocks[0]).trim();
  const match = first.match(/^(?:\[[^\]]+\]\s*)?#{1,6}\s+(.+)$/);
  const title = item.title?.[lang] || item.title?.ko || item.title?.en || '';
  if (match && normalizedTitle(match[1]) === normalizedTitle(title)) return blocks.slice(1);
  return blocks;
}

function bodyList(item) {
  return langs.map((lang) => `<div class="lang-block prose" data-lang-block="${lang}">${bodyBlocks(item, lang).map(renderMarkdownBlock).join('\n')}</div>`).join('\n');
}

function projectBodyList(item) {
  return langs.map((lang) => {
    const blocks = bodyBlocks(item, lang);
    if (!blocks.length) return `<div class="lang-block prose prose-project" data-lang-block="${lang}"></div>`;
    const [intro, ...points] = blocks;
    const pointsMarkup = points.length
      ? `<div class="project-points">${points.map((block) => `<div class="project-point">${renderMarkdownBlock(block)}</div>`).join('\n')}</div>`
      : '';
    return `<div class="lang-block prose prose-project" data-lang-block="${lang}"><div class="project-intro">${renderMarkdownBlock(intro)}</div>${pointsMarkup}</div>`;
  }).join('\n');
}



function sectionHead(titleKey, descriptionMap = null, actionHref = '', actionKey = '') {
  return renderSectionHead(titleKey, descriptionMap, actionHref, actionKey, { localizedText, localizedBlock, ui });
}

function postRow(item) {
  return renderPostRow(item, { localizedBlock });
}

function featuredPostCard(item) {
  return renderFeaturedPostCard(item, { localizedText, localizedBlock, ui });
}

function projectPreviewCard(item) {
  return renderProjectPreviewCard(item, { esc, localizedBlock });
}

const repoBar = renderRepoBar(repos, { esc, localizedText });

function projectMetaBar(project) {
  return renderProjectMetaBar(project, repos, { esc });
}

function articleJsonLd(item, route, kind = 'BlogPosting') {
  return renderArticleJsonLd(item, route, kind, { absoluteUrl });
}

function owningLane(post) {
  const lane = laneFromType(post.type);
  if (!lane) {
    throw new Error(`Unknown post.type for lane ownership: ${post.type}`);
  }
  return lane;
}

const sortedPosts = [...posts].sort((left, right) => right.date.localeCompare(left.date));
const postsByLane = {
  reflection: sortedPosts.filter((post) => owningLane(post).key === 'reflection'),
  tip: sortedPosts.filter((post) => owningLane(post).key === 'tip'),
  behind: sortedPosts.filter((post) => owningLane(post).key === 'behind'),
};
const reflections = postsByLane.reflection;
const setupTips = postsByLane.tip;
const blogNotes = postsByLane.behind;
const featuredPost = reflections[0] || sortedPosts[0];
const latestReflections = reflections.filter((post) => post.slug !== featuredPost?.slug).slice(0, 6);
const latestTips = setupTips.slice(0, 4);
const projectHighlights = projects.slice(0, 3);
const totals = {
  posts: sortedPosts.length,
  reflections: reflections.length,
  setupTips: setupTips.length,
  blogNotes: blogNotes.length,
  projects: projects.length,
};

function archiveGroups(items) {
  const years = new Map();
  for (const item of items) {
    const year = item.date.slice(0, 4);
    if (!years.has(year)) years.set(year, []);
    years.get(year).push(item);
  }
  return [...years.entries()];
}

function renderYearGroups(items) {
  return archiveGroups(items)
    .map(([year, yearItems]) => `<section class="archive-year"><div class="archive-year-head"><h3>${esc(year)}</h3><span>${yearItems.length}</span></div><div class="post-stack archive-stack">${yearItems.map(postRow).join('')}</div></section>`)
    .join('');
}

function archiveCountPill(count, label) {
  return `<span class="archive-count-pair"><strong class="archive-count">${count}</strong><span class="archive-count-label">${localizedBlock(label)}</span></span>`;
}

function adjacentPosts(current) {
  const lane = sortedPosts.filter((item) => item.type === current.type);
  const index = lane.findIndex((item) => item.slug === current.slug);
  return {
    newer: index > 0 ? lane[index - 1] : null,
    older: index >= 0 && index < lane.length - 1 ? lane[index + 1] : null,
  };
}

function relatedPosts(current) {
  return sortedPosts.filter((item) => item.slug !== current.slug && item.type === current.type).slice(0, 3);
}

const homeBody = renderHomeBody({
  ui,
  featuredPost,
  latestReflections,
  latestTips,
  blogNotes,
  projectHighlights,
  totals,
  localizedBlock,
  localizedText,
  postRow,
  postRow,
  projectPreviewCard,
  archiveCountPill,
  repoBar,
  featuredPostCard,
});

writeFile('index.html', layout({
  title: `${site.title.ko || site.title.en} 🦞`,
  description: site.tagline?.ko || site.tagline?.en || '개발가재의 공개 성장 로그북',
  body: homeBody,
  canonicalRoute: '/',
  navMatch: 'home',
}));

const archiveBody = renderArchiveBody({
  ui,
  totals,
  blogNotes,
  sortedPosts,
  reflections,
  setupTips,
  localizedBlock,
  localizedText,
  sectionHead,
  renderYearGroups,
  postRow,
  archiveCountPill,
});

writeFile('archive.html', layout({
  title: `아카이브 · ${site.title.ko || site.title.en}`,
  description: 'Daily Reflection, Setup Tip, Behind the Gajae를 먼저 고르는 레인 우선 아카이브.',
  body: archiveBody,
  canonicalRoute: '/archive.html',
  navMatch: 'archive',
}));

for (const lane of laneEntries()) {
  const lanePosts = postsByLane[lane.key] || [];
  const laneBody = renderLaneIndexBody({
    laneKey: lane.key,
    ui,
    posts: lanePosts,
    totalPosts: sortedPosts.length,
    localizedBlock,
    localizedText,
    archiveCountPill,
    postRow,
    featuredPostCard,
  });
  writeFile(lane.outputPath, layout({
    title: `${lane.label.ko} · ${site.title.ko || site.title.en}`,
    description: `${lane.label.ko} 레인의 최신 운영 기록과 핵심 교훈 모음.`,
    body: laneBody,
    canonicalRoute: lane.route,
    navMatch: lane.navMatch,
  }));
}

const projectsIndexBody = renderProjectsIndexBody({
  ui,
  projects,
  localizedText,
  localizedBlock,
  sectionHead,
  projectPreviewCard,
  repoBar,
});

writeFile('projects/index.html', layout({
  title: `프로젝트 · ${site.title.ko || site.title.en}`,
  description: 'gaebal-gajae가 실제로 굴리는 프로젝트와 그 작업 증거 모음.',
  body: projectsIndexBody,
  canonicalRoute: '/projects/',
  navMatch: 'projects',
}));


for (const post of sortedPosts) {
  const route = `/posts/${post.slug}.html`;
  const neighbors = adjacentPosts(post);
  const related = relatedPosts(post);
  const lane = owningLane(post);
  const body = renderPostBody({
    post,
    lane,
    ui,
    neighbors,
    related,
    localizedBlock,
    localizedText,
    bodyList,
    postRow,
  });
  writeFile(`posts/${post.slug}.html`, layout({
    title: `${post.title.ko || post.title.en} · ${site.title.ko || site.title.en}`,
    description: post.summary.ko || post.summary.en || '',
    body,
    canonicalRoute: route,
    pageType: 'article',
    extraHead: articleJsonLd(post, route),
    navMatch: lane.navMatch,
  }));
}

for (const project of projects) {
  const route = `/projects/${project.slug}.html`;
  const body = renderProjectBody({
    project,
    ui,
    esc,
    localizedBlock,
    localizedText,
    bodyList: projectBodyList,
    projectMetaBar,
  });
  writeFile(`projects/${project.slug}.html`, layout({
    title: `${project.title.ko || project.title.en} · ${site.title.ko || site.title.en}`,
    description: project.summary.ko || project.summary.en || '',
    body,
    canonicalRoute: route,
    extraHead: articleJsonLd(project, route, 'Article'),
    pageType: 'article',
    navMatch: 'projects',
  }));
}

const rssItems = sortedPosts.map((post) => `  <item>\n    <title>${esc(post.title.ko || post.title.en || '')}</title>\n    <link>${absoluteUrl(`/posts/${post.slug}.html`)}</link>\n    <guid>${absoluteUrl(`/posts/${post.slug}.html`)}</guid>\n    <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>\n    <description>${esc(post.summary.ko || post.summary.en || '')}</description>\n  </item>`).join('\n');
writeFile('rss.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>${esc(site.title.ko || site.title.en || '개발가재 블로그')}</title>\n  <link>${siteUrl}</link>\n  <description>${esc(site.tagline.ko || site.tagline.en || '')}</description>\n  <language>ko</language>\n${rssItems}\n</channel>\n</rss>\n`);

const sitemapRoutes = [
  '/',
  '/archive.html',
  ...laneEntries().map((lane) => lane.route),
  '/projects/',
  ...sortedPosts.map((post) => `/posts/${post.slug}.html`),
  ...projects.map((project) => `/projects/${project.slug}.html`),
];
writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapRoutes.map((route) => `  <url><loc>${absoluteUrl(route)}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFile('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`);
