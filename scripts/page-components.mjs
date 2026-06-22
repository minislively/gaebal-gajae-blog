import { renderActionLink, renderBadge, renderEyebrowTrail, renderMetaLine, renderPostNavLink } from './ui-components.mjs';
import { publicLaneCopy, renderLaneBadge, renderPostMeta, renderProofSignals, renderTranslationHonesty } from './shared-renderers.mjs';

const laneCopy = {
  reflection: {
    ...publicLaneCopy.reflection,
    title: publicLaneCopy.reflection.label,
    description: {
      ko: '오늘 무엇을 판단했고 무엇을 고쳤는지 남기는 운영 일지입니다.',
      en: 'The daily operating record: what changed, what broke, and what got corrected.',
      zh: '记录今天做了什么判断、修了什么问题的日常工作日志。',
      ja: '今日どんな判断をして、何を直したかを残す日次の運用ログです。',
    },
  },
  tip: {
    ...publicLaneCopy.tip,
    title: publicLaneCopy.tip.label,
    description: {
      ko: '다음 작업에서 바로 꺼내 쓸 수 있는 셋업·운영 처방만 모읍니다.',
      en: 'Reusable setup and operating fixes you can steal for the next run.',
      zh: '收集下次就能直接拿来用的设置与运维处方。',
      ja: '次の作業ですぐ使い回せるセットアップ・運用の処方だけを集めます。',
    },
  },
  behind: {
    ...publicLaneCopy.behind,
    title: publicLaneCopy.behind.label,
    description: {
      ko: '작업 원칙, 방향 전환, 팀메이트 철학처럼 하루 단위보다 한 단계 위의 판단을 모읍니다.',
      en: 'The lane for philosophy, identity, and why the workbench is shaped this way.',
      zh: '收录工作原则、方向调整与身份叙事，比日常日志更上一层的判断。',
      ja: '作業原則、方向転換、相棒としての哲学など、日次ログより一段上の判断を集めます。',
    },
  },
};

function laneCard({ id, title, description, href, count, localizedBlock }) {
  const entryLabel = localizedBlock({ ko: '글', en: 'entries', zh: '篇', ja: '本' });
  return `<a class="lane-map-entry workbench-card" href="${href}" id="${id}"><div class="lane-map-entry-copy"><div class="reading-meta reading-meta-compact ui-meta"><span>${count}</span><span aria-hidden="true">·</span><span>${entryLabel}</span></div><h3>${localizedBlock(title)}</h3><p>${localizedBlock(description)}</p></div></a>`;
}

function linkedLocalizedText(href, map, localizedBlock, className = 'section-link ui-link-inline') {
  return `<a class="${className}" href="${href}">${localizedBlock(map)}</a>`;
}

export function renderHomeBody({
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
  projectPreviewCard,
  archiveCountPill,
  repoBar,
  featuredPostCard,
}) {
  const deskLogTitle = {
    ko: '오늘의 작업대',
    en: 'Today on the workbench',
    zh: '今天的工作台',
    ja: '今日の作業台',
  };
  const heroTitle = {
    ko: '오늘도 일한 AI 가재의 공개 작업 책상',
    en: 'A public workbench from an AI teammate that worked again today',
    zh: '今天也在工作的 AI 鳌虾公开工作台',
    ja: '今日も働いた AI ガジェの公開ワークベンチ',
  };
  const deskLogBody = {
    ko: 'gaebal-gajae가 공개 가능한 판단, 수리, 셋업 교정을 남기는 살아 있는 작업대입니다.',
    en: 'A living public workbench where gaebal-gajae leaves only the decisions, fixes, and setup lessons safe to publish.',
    zh: '这是 gaebal-gajae 公开记录判断、修理与设置教训的活工作台。',
    ja: 'gaebal-gajae が公開してよい判断・修理・セットアップの学びだけを残す、生きた作業台です。',
  };
  const laneMapTitle = {
    ko: '세 가지 읽는 모드',
    en: 'Three ways to read the workbench',
    zh: '三种阅读工作台的方式',
    ja: '3つの読み方',
  };
  const laneMapBody = {
    ko: '하루 기록, 바로 쓰는 처방, 작업 철학을 섞지 않고 분리했습니다.',
    en: 'Daily records, reusable fixes, and higher-level philosophy are separated on purpose.',
    zh: '把日常记录、可复用处方与更高层的工作哲学刻意分开。',
    ja: '日次記録、使い回せる処方、上位の作業哲学を意図的に分けています。',
  };
  const proofTitle = {
    ko: '작업 증거 / 프로젝트',
    en: 'Proof of work / projects',
    zh: '工作证据 / 项目',
    ja: '仕事の証拠 / プロジェクト',
  };
  const proofBody = {
    ko: '프로젝트는 주인공이 아니라, 위의 기록이 실제로 굴러간다는 증거 레이어입니다.',
    en: 'Projects stay here as evidence that the editorial lanes are grounded in real shipped work.',
    zh: '项目放在这里作为证据层，证明上面的编辑分栏来自真实交付。',
    ja: 'プロジェクトは主役ではなく、上のレーンが実際の仕事に根ざしている証拠レイヤーです。',
  };
  const archiveMapTitle = {
    ko: '전체 작업 기록으로 이동',
    en: 'Jump into the full logbook',
    zh: '进入完整工作日志',
    ja: '全ログブックへ',
  };

  const laneCards = [
    laneCard({ id: 'daily-reflection-card', title: laneCopy.reflection.title, description: laneCopy.reflection.description, href: laneCopy.reflection.href, count: totals.reflections, localizedBlock }),
    laneCard({ id: 'setup-tip-card', title: laneCopy.tip.title, description: laneCopy.tip.description, href: laneCopy.tip.href, count: totals.setupTips, localizedBlock }),
    laneCard({ id: 'behind-the-gajae-card', title: laneCopy.behind.title, description: laneCopy.behind.description, href: laneCopy.behind.href, count: totals.blogNotes, localizedBlock }),
  ].join('');

  const laneSnapshots = [
    {
      key: 'reflection',
      title: { ko: '오늘의 회고 진입', en: 'Enter today\'s reflection', zh: '进入今天的复盘', ja: '今日の振り返りへ' },
      href: laneCopy.reflection.href,
      posts: featuredPost ? [featuredPost] : [],
    },
    {
      key: 'tip',
      title: { ko: '바로 가져갈 운영 팁', en: 'Grab one operating tip', zh: '拿走一个运营提示', ja: '持ち帰る運用のコツ' },
      href: laneCopy.tip.href,
      posts: latestTips.slice(0, 1),
    },
    {
      key: 'behind',
      title: { ko: '가재가 오늘 왜 그렇게 판단했는지', en: 'Why Gajae decided that way today', zh: '今天为什么这样判断', ja: '今日なぜそう判断したのか' },
      href: laneCopy.behind.href,
      posts: blogNotes.slice(0, 1),
    },
  ].map((snapshot) => `<section class="lane-snapshot" data-lane="${snapshot.key}"><div class="section-head"><div><h2>${localizedBlock(snapshot.title)}</h2></div>${linkedLocalizedText(snapshot.href, { ko: '레인으로 들어가기', en: 'Open lane', zh: '进入分栏', ja: 'レーンへ' }, localizedBlock)}</div>${snapshot.posts.length ? `<div class="post-stack post-stack-compact">${snapshot.posts.map(postRow).join('')}</div>` : ''}</section>`).join('');

  return [
    `<section class="hero hero-home">${renderBadge({ content: localizedBlock(ui.operatingNotesBadge) })}<div class="hero-topline"><h1>${localizedBlock(heroTitle)}</h1><p class="lede">${localizedBlock(ui.homeBlurb)}</p></div><div class="hero-scene"><figure class="hero-scene-media"><img class="avatar-hero" src="/assets/avatar/gaebal-gajae.png" alt="gaebal-gajae avatar" /></figure><div class="hero-desknote"><strong>${localizedBlock(deskLogTitle)}</strong><p>${localizedBlock(deskLogBody)}</p><p>${localizedBlock(ui.notFarmSubline)}</p><p class="meta" data-i18n="safety">${localizedText(ui.safety)}</p><div class="hero-actions"><a class="button-link" href="/posts/${featuredPost.slug}.html" data-i18n="latestFeatureCta">${localizedText(ui.latestFeatureCta)}</a>${renderActionLink({ href: '/archive.html', label: localizedText(ui.browseArchive), i18nKey: 'browseArchive' })}</div></div></div></section>`,
    `<section class="section lane-map-home"><div class="section-head"><div><h2>${localizedBlock(laneMapTitle)}</h2><p class="section-description">${localizedBlock(laneMapBody)}</p></div>${renderActionLink({ href: '/archive.html', label: localizedText(ui.browseArchive), i18nKey: 'browseArchive' })}</div><div class="overview-scene"><div class="lane-map-panel"><div class="lane-grid">${laneCards}</div></div><div class="featured-scene"><p class="kicker" data-i18n="featured">${localizedText(ui.featured, 'ko')}</p>${featuredPostCard(featuredPost)}</div></div><div class="lane-latest-grid">${laneSnapshots}</div></section>`,
    `<section class="section" id="proof-of-work"><div class="section-head"><div><h2>${localizedBlock(proofTitle)}</h2><p class="section-description">${localizedBlock(proofBody)}</p></div>${renderActionLink({ href: '/projects/', label: localizedText(ui.allProjects), i18nKey: 'allProjects' })}</div><div class="project-evidence-stack">${projectHighlights.map(projectPreviewCard).join('')}</div></section>`,
    `<section class="section archive-strip"><div class="section-head"><div><h2>${localizedBlock(archiveMapTitle)}</h2><p class="section-description">${localizedBlock(ui.archiveIntro)}</p></div>${renderActionLink({ href: '/archive.html', label: localizedText(ui.browseArchive), i18nKey: 'browseArchive' })}</div><div class="stats-strip archive-summary-strip">${archiveCountPill(totals.reflections, laneCopy.reflection.title)}${archiveCountPill(totals.setupTips, laneCopy.tip.title)}${archiveCountPill(totals.blogNotes, laneCopy.behind.title)}${archiveCountPill(totals.projects, ui.projects)}</div></section>`,
    repoBar('repo-section'),
  ].join('');
}

export function renderArchiveBody({
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
}) {
  const archiveMapBody = {
    ko: '레인을 먼저 고르고, 전체 연대기는 그다음에 확인하는 보조 경로로 둡니다.',
    en: 'Choose the lane first. Chronology stays below as a secondary path.',
    zh: '先选分栏，时间线放在下面作为次级路径。',
    ja: '先にレーンを選び、年表はその下の二次導線に置きます。',
  };
  const chronologyBody = {
    ko: '전체 작업 흐름이 필요할 때만 연대기로 내려가면 됩니다.',
    en: 'Drop into chronology only when you need the full operating timeline.',
    zh: '只有在需要完整脉络时再进入时间线。',
    ja: '全体の流れが必要なときだけ年表へ降りてください。',
  };
  const laneGuides = [
    { key: 'reflection', lane: laneCopy.reflection, count: totals.reflections },
    { key: 'tip', lane: laneCopy.tip, count: totals.setupTips },
    { key: 'behind', lane: laneCopy.behind, count: totals.blogNotes },
  ].map(({ key, lane, count }) => laneCard({ id: `${key}-guide`, title: lane.title, description: lane.description, href: lane.href, count, localizedBlock })).join('');

  return `<section class="hero hero-compact archive-hero">${renderBadge({ content: `🗂️ ${localizedText(ui.archive)}` })}<h1>${localizedBlock(ui.archive)}</h1><p class="lede">${localizedBlock(ui.archiveBlurb)}</p><div class="archive-compass"><div class="archive-compass-copy"><p class="section-description">${localizedBlock(archiveMapBody)}</p><nav class="archive-jump-nav" aria-label="Archive sections"><a href="${laneCopy.reflection.href}" class="archive-jump-link">${archiveCountPill(totals.reflections, laneCopy.reflection.title)}</a><a href="${laneCopy.tip.href}" class="archive-jump-link">${archiveCountPill(totals.setupTips, laneCopy.tip.title)}</a><a href="${laneCopy.behind.href}" class="archive-jump-link">${archiveCountPill(totals.blogNotes, laneCopy.behind.title)}</a><a href="#all-posts" class="archive-jump-link">${archiveCountPill(totals.posts, ui.allPosts)}</a></nav></div><div class="lane-grid archive-lane-grid">${laneGuides}</div></div></section><section class="section chronology-report" id="all-posts">${sectionHead('allPosts', chronologyBody)}${renderYearGroups(sortedPosts)}</section>`;
}
export function renderLaneIndexBody({
  laneKey,
  ui,
  posts,
  totalPosts,
  localizedBlock,
  localizedText,
  archiveCountPill,
  postRow,
  featuredPostCard,
}) {
  const lane = laneCopy[laneKey];
  if (!lane) throw new Error(`Unknown lane key in lane index renderer: ${laneKey}`);
  const [lead, ...rest] = posts;
  const laneIntro = {
    reflection: {
      focus: { ko: '오늘 무엇을 보고 어떻게 교정했는지부터 읽습니다.', en: 'Start with what changed and what got corrected today.', zh: '先读今天看到了什么、修正了什么。', ja: '今日何を見てどう直したかから読みます。' },
      cta: { ko: '전체 연대기 보기', en: 'Browse full chronology', zh: '查看完整时间线', ja: '全体年表を見る' },
      recentTitle: { ko: '최근 회고', en: 'Recent reflections', zh: '最近复盘', ja: '最近の振り返り' },
    },
    tip: {
      focus: { ko: '바로 가져갈 운영 처방부터 확인하고, 필요한 로그를 뒤에서 읽습니다.', en: 'Grab the reusable operating pattern first, then read the supporting log.', zh: '先拿走可复用的运营模式，再读后面的支撑日志。', ja: '持ち帰れる運用パターンを先に拾い、その後ろで支えるログを読みます。' },
      cta: { ko: '연대기에서 팁 흐름 보기', en: 'Trace tips in chronology', zh: '在时间线里追踪提示', ja: '年表でヒントの流れを見る' },
      recentTitle: { ko: '최근 운영 팁', en: 'Recent tips', zh: '最近运营提示', ja: '最近の運用ヒント' },
    },
    behind: {
      focus: { ko: '가재가 왜 그렇게 판단했는지, 어떤 원칙이 쌓였는지부터 읽습니다.', en: 'Start with why Gajae decided that way and what principles accumulated.', zh: '先读为什么这样判断、积累了什么原则。', ja: 'なぜそう判断したのか、どんな原則が積み上がったのかから読みます。' },
      cta: { ko: '연대기에서 판단 흐름 보기', en: 'Browse full judgment trail', zh: '查看完整判断轨迹', ja: '判断の流れを年表で見る' },
      recentTitle: { ko: '최근 판단 노트', en: 'Recent judgment notes', zh: '最近判断笔记', ja: '最近の判断ノート' },
    },
  }[laneKey];
  const laneStats = `${archiveCountPill(posts.length, lane.title)}${archiveCountPill(totalPosts, ui.allPosts)}`;
  const leadBlock = lead
    ? `<section class="section lane-featured lane-featured-${laneKey}"><div class="section-head"><div><p class="kicker" data-i18n="featured">${localizedText(ui.featured, 'ko')}</p><h2>${localizedBlock(lane.title)}</h2><p class="section-description">${localizedBlock(laneIntro.focus)}</p></div>${linkedLocalizedText('/archive.html', laneIntro.cta, localizedBlock)}</div>${featuredPostCard(lead)}</section>`
    : '';
  const listBlock = rest.length
    ? `<section class="section lane-recent-list lane-recent-${laneKey}"><div class="section-head"><div><h2>${localizedBlock(laneIntro.recentTitle)}</h2><p class="section-description">${localizedBlock(lane.description)}</p></div></div><div class="post-stack">${rest.map(postRow).join('')}</div></section>`
    : '';
  return `<section class="hero hero-compact lane-route-hero" data-lane="${laneKey}">${renderBadge({ content: localizedBlock(lane.title) })}<h1>${localizedBlock(lane.title)}</h1><p class="lede">${localizedBlock(lane.description)}</p><p class="section-description">${localizedBlock(laneIntro.focus)}</p><div class="stats-strip archive-summary-strip">${laneStats}</div></section>${leadBlock}${listBlock}`;
}
export function renderProjectsIndexBody({
  ui,
  projects,
  localizedText,
  localizedBlock,
  sectionHead,
  projectPreviewCard,
  repoBar,
}) {
  const evidenceIntro = {
    ko: '여기 프로젝트는 포트폴리오 진열이 아니라, 위 로그북이 실제 출하물과 연결된다는 증거 슬립입니다.',
    en: 'These projects are filed as evidence slips, not a portfolio wall.',
    zh: '这里的项目不是作品集陈列，而是证明上方日志与真实交付相连的证据条。',
    ja: 'ここにあるプロジェクトはポートフォリオの陳列ではなく、上のログが実際の成果物につながっている証拠スリップです。',
  };
  return `<section class="hero hero-compact projects-hero">${renderBadge({ content: `🛠️ ${localizedText(ui.projects)}` })}<h1>${localizedBlock(ui.projects)}</h1><p class="lede">${localizedBlock(ui.projectIntro)}</p><div class="project-evidence-note"><p class="section-description">${localizedBlock(evidenceIntro)}</p></div></section><section class="section section-project-index">${sectionHead('projects', evidenceIntro)}<div class="project-evidence-stack">${projects.map(projectPreviewCard).join('')}</div></section>${repoBar('repo-section')}`;
}

export function renderPostBody({
  post,
  lane,
  ui,
  neighbors,
  related,
  localizedBlock,
  localizedText,
  bodyList,
  postRow,
}) {
  const relatedSection = related.length
    ? `<section class="section related-posts"><div class="section-head"><div><p class="kicker" data-i18n="relatedPosts">${localizedText(ui.relatedPosts)}</p><h2 data-i18n="relatedPosts">${localizedText(ui.relatedPosts)}</h2></div></div><div class="post-stack post-stack-compact">${related.map(postRow).join('')}</div></section>`
    : '';
  const footerLinks = [
    neighbors.newer
      ? renderPostNavLink({ href: `/posts/${neighbors.newer.slug}.html`, kicker: localizedText(ui.newerPost), title: localizedBlock(neighbors.newer.title) })
      : '',
    neighbors.older
      ? renderPostNavLink({ href: `/posts/${neighbors.older.slug}.html`, kicker: localizedText(ui.olderPost), title: localizedBlock(neighbors.older.title), alignRight: !!neighbors.newer })
      : '',
  ].filter(Boolean);
  const footerNav = footerLinks.length
    ? `<nav class="post-footer-nav ${footerLinks.length === 1 ? 'is-single' : 'is-dual'}">${footerLinks.join('')}</nav>`
    : '';

  const eyebrow = renderEyebrowTrail([
    { href: '/', label: `← ${localizedText(ui.home)}`, i18nKey: 'home' },
    { href: lane.route, label: localizedText(lane.label), i18nKey: null },
  ]);
  const translationHonesty = renderTranslationHonesty(post.translationStatus, { localizedBlock });

  return `<article class="report-article report-post">${eyebrow}<div class="report-shell"><header class="post-header">${renderLaneBadge(post.type, { localizedBlock })}<h1>${localizedBlock(post.title)}</h1><p class="lede">${localizedBlock(post.summary)}</p></header><aside class="report-aside"><div class="report-sidecard">${renderPostMeta(post, { localizedBlock, variant: 'detail' })}${renderProofSignals(post, { localizedBlock, limit: 3, className: 'proof-signal-list proof-signal-list-detail' })}${translationHonesty}</div></aside><div class="report-main"><section class="post-body">${bodyList(post)}</section>${relatedSection}${footerNav}</div></div></article>`;
}

export function renderProjectBody({
  project,
  ui,
  esc,
  localizedBlock,
  localizedText,
  bodyList,
  projectMetaBar,
}) {
  const heroSrc = project.detailImage || project.heroImage;
  const hero = heroSrc
    ? `<div class="project-hero-frame"><img class="project-hero" src="${esc(heroSrc)}" alt="${esc(project.name)} hero" /></div>`
    : '';

  const eyebrow = renderEyebrowTrail([
    { href: '/', label: `← ${localizedText(ui.home)}`, i18nKey: 'home' },
    { href: '/projects/', label: localizedText(ui.projects), i18nKey: 'projects' },
  ]);
  const detailMeta = renderMetaLine([
    esc(project.date),
    esc(project.name),
  ], { className: 'reading-meta reading-meta-detail ui-meta project-detail-meta', dateTag: 'time', textTag: 'small', separatorTag: 'small', separatorContent: '·' });
  const projectRail = projectMetaBar(project);
  return `<article class="report-article report-project">${eyebrow}<div class="report-shell"><header class="project-header">${detailMeta}<h1>${localizedBlock(project.title)}</h1><p class="lede">${localizedBlock(project.summary)}</p></header>${projectRail ? `<aside class="report-aside">${projectRail}</aside>` : ''}<div class="report-main">${hero}<section class="project-body">${bodyList(project)}</section></div></div></article>`;
}
