const state = {
  modules: [], demo: null, activeId: 'overview', rankingPeriod: '60m',
  rankingWindow: '1年', rankingSegment: '窗口边界段', rankingMetric: '中位段幅', rankingSession: '仅日盘',
  factorCategory: '均值回归', factorView: '按品种看因子', factorType: '全部类型',
  composerPaused: false
};

function stateButton(label, key, value, selected) {
  return `<button type="button" data-action="set-state" data-key="${key}" data-value="${value}" class="${selected ? 'selected' : ''}">${label}</button>`;
}

function downloadText(filename, content, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

async function fetchJson(sources) {
  const failures = [];
  for (const source of sources) {
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      failures.push(`${source}: ${error.message}`);
    }
  }
  throw new Error(failures.join('；'));
}

function metricCards(module) {
  return `<div class="metric-grid">${module.metrics.map((item, index) => `
    <article class="metric-card tone-${index + 1}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><i></i></article>
  `).join('')}</div>`;
}

function pageHeader(module) {
  const trailing = module.kind === 'ranking'
    ? '<div class="trend-ranking-formula"><span>趋势更顺</span><strong>穿越次数 ↓ / 中位段幅 ↑</strong></div>'
    : module.kind === 'composer'
      ? `<button type="button" class="primary-action hero-action" data-action="toggle-composer">${state.composerPaused ? '继续组合研究' : '暂停组合研究'}</button>`
      : '<span class="demo-chip">合成数据演示</span>';
  const metrics = ['ranking', 'composer'].includes(module.kind) ? '' : metricCards(module);
  return `<header class="page-header research-module-hero">
    <div><span class="eyebrow">${escapeHtml(module.eyebrow)}</span><h1>${escapeHtml(module.title)}</h1><p>${escapeHtml(module.subtitle)}</p></div>
    ${trailing}
  </header>${metrics}`;
}

function sparkline(values, color = '#5ed6c8') {
  const min = Math.min(...values); const max = Math.max(...values); const range = max - min || 1;
  const points = values.map((value, index) => `${index * (220 / (values.length - 1))},${76 - ((value - min) / range) * 62}`).join(' ');
  return `<svg class="sparkline" viewBox="0 0 220 86" preserveAspectRatio="none" aria-hidden="true">
    <line x1="0" y1="76" x2="220" y2="76" class="chart-axis"/><polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" vector-effect="non-scaling-stroke"/>
  </svg>`;
}

function renderOverview(module) {
  const cards = [
    ['01', '发现值得交易的市场', '消息评分与趋势流畅度先回答“研究哪个品种”。'],
    ['02', '把判断变成规则', '策略研究室把交易语言转成可审计的结构化信号。'],
    ['03', '提高研究吞吐量', 'Loop与因子组合持续提出候选，但不降低晋级门槛。'],
    ['04', '隔离研究与执行', '模拟盘验证状态机；公开版不连接真实账户。']
  ];
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack">
    <article class="hero-panel"><div><span class="panel-kicker">END-TO-END RESEARCH</span><h2>策略设计是主线，因子与AI是研究加速器</h2><p>核心技术指标先定义可解释的交易逻辑，因子挖掘负责寻找适用状态，自动研究负责扩大实验覆盖，因果回测负责最终裁判。</p></div><div class="system-orbit"><b>假设</b><span>因子</span><span>回测</span><span>验证</span><i>冻结版本</i></div></article>
    <div class="capability-grid">${cards.map(card => `<article><span>${card[0]}</span><h3>${card[1]}</h3><p>${card[2]}</p></article>`).join('')}</div>
    <article class="panel"><div class="panel-heading"><div><span class="panel-kicker">RESEARCH PIPELINE</span><h2>研究闭环</h2></div><span class="status-pill good">边界可追溯</span></div>
      <div class="research-pipeline"><div><b>市场输入</b><small>行情 / 消息 / 基本面</small></div><i>→</i><div><b>品种筛选</b><small>趋势流畅度</small></div><i>→</i><div><b>策略与因子</b><small>核心逻辑 + 辅助过滤</small></div><i>→</i><div><b>因果验证</b><small>下一根执行</small></div><i>→</i><div><b>候选晋级</b><small>封存样本</small></div></div>
    </article>
  </section></div>`;
}

function renderMessage(module) {
  const dimensions = [['价格趋势', 82, 'positive'], ['供需变化', 64, 'positive'], ['库存与基差', 42, 'warning'], ['持仓流向', 71, 'positive'], ['事件情绪', 56, 'neutral']];
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack">
    <article class="panel score-panel"><div class="score-dial"><div><strong>+38</strong><span>综合分</span></div><small>偏多 · 但价格已部分反映</small></div><div class="score-bars">${dimensions.map(item => `<div><span>${item[0]}</span><b><i class="${item[2]}" style="width:${item[1]}%"></i></b><strong>${item[1]}</strong></div>`).join('')}</div></article>
    <div class="two-column"><article class="panel"><div class="panel-heading"><div><span class="panel-kicker">EVIDENCE</span><h2>结构化证据</h2></div><span class="status-pill">评分时点 14:30</span></div><div class="evidence-list"><div><i class="good"></i><span><b>趋势结构</b><small>中周期均线保持上行，回撤未破坏主结构</small></span><em>高可信</em></div><div><i class="warn"></i><span><b>库存与基差</b><small>数据方向支持，但更新时间晚于价格变化</small></span><em>待确认</em></div><div><i class="good"></i><span><b>近期事件</b><small>事件冲击与成交量同步，尚未出现反向吸收</small></span><em>中可信</em></div></div></article>
    <article class="panel pricing-card"><span class="panel-kicker">PRICED IN?</span><h2>信息是否已经定价</h2><div class="pricing-scale"><i></i><b style="left:64%"></b></div><div><span>未反映</span><strong>部分反映</strong><span>充分反映</span></div><p>评分只进入策略过滤层。即使基本面偏多，如果价格空间不足或趋势结构已经破坏，策略仍然等待。</p></article></div>
  </section></div>`;
}

function renderTrendRanking(module) {
  const periods = ['15m', '30m', '60m', '120m', '240m', '日线', '周线'];
  const sessions = ['仅日盘', '夜盘至23:00', '夜盘至次日01:00', '夜盘至次日02:30'];
  const baseRows = [
    ['合成品种 A', 'SYN.A8888', 3, 2, 1, '7.82%', '5.40%～10.16%', '8.21%'],
    ['合成品种 B', 'SYN.B8888', 4, 2, 2, '6.41%', '4.88%～8.05%', '6.76%'],
    ['合成品种 C', 'SYN.C8888', 6, 3, 3, '4.93%', '3.21%～6.44%', '5.17%'],
  ];
  const windows = ['1周','1个月','3个月','半年','1年','自定义'];
  const shift = periods.indexOf(state.rankingPeriod) + sessions.indexOf(state.rankingSession)
    + windows.indexOf(state.rankingWindow) + (state.rankingSegment === '完整穿越段' ? 2 : 0);
  const rows = baseRows.map((row, index) => {
    const up = row[3] + shift % 2;
    const down = row[4] + (shift + index) % 2;
    return [...row.slice(0, 2), up + down, up, down, ...row.slice(5)];
  });
  const metricIndex = { 总数: 2, 上穿: 3, 下穿: 4, 中位段幅: 5, 平均段幅: 7 }[state.rankingMetric];
  const ascending = ['总数', '上穿', '下穿'].includes(state.rankingMetric);
  const rowsSorted = [...rows].sort((a, b) => ascending ? a[metricIndex] - b[metricIndex] : parseFloat(b[metricIndex]) - parseFloat(a[metricIndex]));
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack">
    <article class="panel ranking-controls"><div class="control-block full"><label>时间范围</label><div class="choice-row">${['1周','1个月','3个月','半年','1年','自定义'].map(value=>stateButton(value,'rankingWindow',value,value===state.rankingWindow)).join('')}</div></div><div class="control-block"><label>K 线周期</label><div class="choice-row">${periods.map(period => `<button type="button" data-action="change-ranking-period" data-period="${period}" class="${period === state.rankingPeriod ? 'selected' : ''}">${period}</button>`).join('')}</div><small>30分钟：发现7个交易日 → 后续10个交易日　Top5保持Top7：55.0%</small><small>60分钟：发现7个交易日 → 后续15个交易日　Top5保持Top7：70.0%</small></div><div class="control-block"><label>段幅口径</label><div class="choice-row">${['窗口边界段','完整穿越段'].map(value=>stateButton(value,'rankingSegment',value,value===state.rankingSegment)).join('')}</div><small>${state.rankingSegment === '窗口边界段' ? '首段从所选窗口起点算到第一次穿越' : '向前追溯上一次穿越，保留完整首段'}</small></div><div class="control-block full"><label>交易时段分组</label><div class="choice-row">${sessions.map(value=>stateButton(value,'rankingSession',value,value===state.rankingSession)).join('')}</div></div><div class="control-block full control-actions"><div><label>排名口径</label><div class="choice-row">${['总数','上穿','下穿','中位段幅','平均段幅'].map(value=>stateButton(value,'rankingMetric',value,value===state.rankingMetric)).join('')}</div></div><button type="button" class="primary-action" data-action="demo-scan">开始扫描</button></div></article>
    <article class="trend-ranking-card"><header><div><span>${state.rankingMetric}${ascending?'升序':'降序'}</span><h2>${state.rankingSession}</h2></div><strong>${rowsSorted.length}</strong></header><div class="trend-table-wrap"><table><thead><tr><th>排名</th><th>品种</th><th>使用合约</th><th>总数</th><th>上穿</th><th>下穿</th><th>中位段幅</th><th>典型区间（P25～P75）</th><th>平均段幅</th></tr></thead><tbody>${rowsSorted.map((row,index)=>`<tr><td><b>${index+1}</b></td><td><strong>${row[0]}</strong><small>${row[1].split('8')[0]}</small></td><td><code>${row[1]}</code><small>主连</small></td>${row.slice(2).map((value,i)=>`<td class="${i===metricIndex-2?'active-metric':''}">${value}</td>`).join('')}</tr>`).join('')}</tbody></table></div></article>
    <article class="method-note"><strong>算法口径</strong><span>实体连续两根确认穿越 MA20；最后未反穿段按最新已完成K线计算。穿越次数越少、中位段幅越大，代表趋势段更完整。</span></article>
  </section></div>`;
}

function renderStrategy(module) {
  const backtest = state.demo.causal_backtest;
  const equity = sparkline([100, 101, 100.6, 102.4, 103.1, 102.8, 105.2, 106.4, 105.9, 108.2, 109.1]);
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack">
    <div class="two-column strategy-layout"><article class="panel strategy-form"><div class="panel-heading"><div><span class="panel-kicker">NATURAL LANGUAGE → SPEC</span><h2>研究输入</h2></div><span class="status-pill good">示例策略</span></div><label>策略思路<textarea readonly>60分钟趋势保持上行时，等待30分钟回踩结束；价格重新站回短均线后进入，趋势结构破坏后退出。</textarea></label><div class="form-grid"><label>决策周期<strong>30 / 60 分钟</strong></label><label>执行口径<strong>下一根K线开盘</strong></label><label>方向来源<strong>60m 已完成K线</strong></label><label>风险约束<strong>空间 + 波动否决</strong></label></div><button type="button" class="primary-action" data-action="generate-spec">生成结构化策略 <span>→</span></button></article>
    <article class="panel"><div class="panel-heading"><div><span class="panel-kicker">CAUSAL AUDIT</span><h2>策略审计</h2></div><span class="status-pill good">通过</span></div><div class="audit-list"><div><i>✓</i><span><b>未来索引</b><small>未发现负索引或 i+1 访问</small></span></div><div><i>✓</i><span><b>执行错位</b><small>信号与执行至少间隔一根K线</small></span></div><div><i>✓</i><span><b>危险调用</b><small>未发现文件、网络和动态执行越权</small></span></div><div class="rejected"><i>×</i><span><b>示例拒绝信号</b><small>同K线执行 · 已记录原因</small></span></div></div></article></div>
    <article class="panel performance-panel"><div class="panel-heading"><div><span class="panel-kicker">BACKTEST REPORT</span><h2>因果回测结果</h2></div><span class="status-pill">合成数据 · API绑定</span></div><div class="performance-body"><div class="equity-chart">${equity}<span>净值（示意）</span></div><div class="performance-stats"><div><span>合法信号</span><strong>${backtest.accepted_signals}</strong></div><div><span>拒绝信号</span><strong>${backtest.rejected_signals}</strong></div><div><span>完成交易</span><strong>${backtest.trades.length}</strong></div><div><span>示例净点数</span><strong>${backtest.realized_points_after_example_cost.toFixed(1)}</strong></div></div></div><p class="panel-footnote">指标来自同仓库研究核心生成的确定性合成报告；净值曲线仅示意报告界面，不代表真实回测或实盘收益。</p></article>
  </section></div>`;
}

function renderResearchLoop(module) {
  const loop = state.demo.research_loop;
  const completedStage = loop.stage === 'promoted' ? 7 : loop.stage === 'holdout' ? 6 : 5;
  const stages = module.stages.map((stage, index) => `<div class="loop-stage ${index < completedStage ? 'complete' : index === completedStage ? 'active' : ''}"><span>${index < completedStage ? '✓' : index + 1}</span><b>${stage}</b><small>${['两角色并行', '假设转规则', '静态+动态', '允许修改', '只做判断', '仅打开一次', '保存可迁移结论'][index]}</small></div>${index < module.stages.length - 1 ? '<i class="loop-link">→</i>' : ''}`).join('');
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack">
    <article class="panel loop-panel"><div class="panel-heading"><div><span class="panel-kicker">CANDIDATE LIFECYCLE</span><h2>一次研究循环怎么跑</h2></div><span class="running-pill"><i></i> 本轮已晋级</span></div><div class="loop-flow">${stages}</div><div class="loop-rule"><b>晋级纪律</b><span>训练集可以改策略</span><i>≠</i><span>验证集只判断</span><i>→</i><span>达标才开封存样本</span></div></article>
    <div class="two-column"><article class="panel"><div class="panel-heading"><div><span class="panel-kicker">EXPERIMENT QUEUE</span><h2>候选实验</h2></div><span class="status-pill">报告候选 ${escapeHtml(loop.candidate)}</span></div><div class="candidate-table"><div><span><b>${escapeHtml(loop.candidate)}</b><small>验证集评分</small></span><em class="promoted">已达标</em><strong>${loop.validation_score.toFixed(2)}</strong></div><div><span><b>${escapeHtml(loop.candidate)}</b><small>一次性封存样本评分</small></span><em class="promoted">已晋级</em><strong>${loop.holdout_score.toFixed(2)}</strong></div><div><span><b>${escapeHtml(loop.lineage[0])}</b><small>候选血统起点</small></span><em class="validating">前序版本</em><strong>—</strong></div><div><span><b>失败账本</b><small>未达门槛的结论单独沉淀</small></span><em class="failed">记录</em><strong>${loop.failure_ledger_size}</strong></div></div></article>
    <article class="panel memory-panel"><div class="panel-heading"><div><span class="panel-kicker">RESEARCH MEMORY</span><h2>记忆分层</h2></div></div><div class="memory-columns"><div><b>冠军记忆</b><p>只保存通过研究门槛、可迁移的方法结论。</p><span>✓ 方向与时机分离</span><span>✓ 支撑空间作为硬过滤</span></div><div><b>失败账本</b><p>记录失败条件，防止Loop重复寻找同一种伪规律。</p><span>× 参数峰值过窄</span><span>× 跨月份方向翻转</span></div></div><div class="sealed-note">封存样本结果不会写回研究提示，避免模型围绕最终答案继续拟合。</div></article></div>
  </section></div>`;
}

function renderLevels(module) {
  const factors = [
    { id:'001', symbol:'合成品种A', category:'均值回归', type:'状态转折', condition:'15分钟收盘价由MA20上方转到下方', metrics:['77.3%','0.85 ATR','0.37 ATR','2.28'], evidence:'较稳定证据 · 66个样本 · 12个月' },
    { id:'002', symbol:'合成品种A', category:'均值回归', type:'跨周期组合', condition:'15分钟最近1根为阴线，同时30分钟最近1根为阴线', metrics:['57.4%','1.06 ATR','0.52 ATR','2.03'], evidence:'较稳定证据 · 101个样本 · 13个月' },
    { id:'003', symbol:'合成品种B', category:'趋势研究（中高周期）', type:'单状态', condition:'60/120/240分钟趋势状态同向，观察未来5根240分钟路径', metrics:['68.2%','61.5%','64.8%','1.74'], evidence:'初步证据 · 48个样本 · 10个月' },
    { id:'004', symbol:'合成品种C', category:'趋势研究（低周期）', type:'跨周期组合', condition:'30分钟触发转强，60/120分钟背景保持上行', metrics:['63.6%','58.1%','60.4%','1.86'], evidence:'较稳定证据 · 72个样本 · 11个月' },
  ];
  const visible = factors
    .filter(item => item.category === state.factorCategory && (state.factorType === '全部类型' || item.type === state.factorType))
    .sort((a, b) => state.factorView === '按品种看因子' ? a.symbol.localeCompare(b.symbol, 'zh-CN') || a.id.localeCompare(b.id) : a.type.localeCompare(b.type, 'zh-CN') || a.id.localeCompare(b.id));
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack factor-desk"><div class="factor-switches"><div class="choice-row wide">${['均值回归','趋势研究（中高周期）','趋势研究（低周期）'].map(value=>stateButton(value,'factorCategory',value,value===state.factorCategory)).join('')}</div><div class="choice-row wide">${['按品种看因子','按因子看品种'].map(value=>stateButton(value,'factorView',value,value===state.factorView)).join('')}</div></div><section class="factor-filter-bar"><label>品种<select disabled><option>全部品种</option></select></label><label>因子类型<select data-state-select="factorType"><option ${state.factorType==='全部类型'?'selected':''}>全部类型</option><option ${state.factorType==='单状态'?'selected':''}>单状态</option><option ${state.factorType==='状态转折'?'selected':''}>状态转折</option><option ${state.factorType==='跨周期组合'?'selected':''}>跨周期组合</option></select></label><label>统计方向<select disabled><option>多空全部</option></select></label><div><span>当前视图</span><strong>${state.factorView}</strong></div></section><div class="factor-card-grid">${visible.map(item=>`<article class="evidence-card"><header><span class="factor-sequence"><small>因子</small><strong>${item.id}</strong></span><div><b>${item.symbol} · ${item.category} · ${item.type}</b><code>synthetic_factor_${item.id}</code></div><em>偏多</em></header><h3>${item.condition}</h3><dl><div><dt>${item.category==='均值回归'?'方向一致率':'5根路径胜率'}</dt><dd>${item.metrics[0]}</dd></div><div><dt>${item.category==='均值回归'?'剩余有利空间':'5根强趋势胜率'}</dt><dd>${item.metrics[1]}</dd></div><div><dt>${item.category==='均值回归'?'最大不利波动':'5根退出盈利率'}</dt><dd>${item.metrics[2]}</dd></div><div><dt>空间赔率</dt><dd>${item.metrics[3]}</dd></div></dl><footer><span>${item.evidence}</span></footer><details><summary>查看公式与历史样本</summary><p><b>精确条件：</b>${item.condition}；信号只使用当时已完成K线。</p><p><b>成功样本：</b>下一根开盘后按预期方向扩展，有利空间覆盖风险空间。</p><p><b>失败样本：</b>触发后先出现超过阈值的不利波动，原始索引保留复核。</p></details><div class="sample-actions"><button type="button" data-action="show-samples">查看全部样本</button><button type="button" data-action="download-factor-md" data-factor="${item.id}">下载样本说明MD</button></div></article>`).join('') || '<article class="empty-factor-state">当前筛选下没有合成证据，请切换因子类型。</article>'}</div><article class="method-note"><strong>研究口径</strong><span>下一根K线开盘仅用于离线研究假设；方向一致率、路径胜率和空间赔率都不是完整交易胜率。</span></article></section></div>`;
}

function renderComposer(module) {
  const tasks = [['合成品种A','独立策略研究','从趋势因子独立形成完整策略'],['合成品种A','母策略演化','允许增加、删除或替换单个策略结构'],['合成品种B','独立策略研究','从趋势因子独立形成完整策略'],['合成品种B','母策略演化','允许增加、删除或替换单个策略结构'],['合成品种C','独立策略研究','从趋势因子独立形成完整策略'],['合成品种D','独立策略研究','从趋势因子独立形成完整策略']];
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack composer-workbench"><section class="composer-status-band"><div><span>运行状态</span><strong>研究中</strong></div><div><span>当前品种</span><strong>合成品种B</strong></div><div><span>研究路径</span><strong>独立策略研究</strong></div><div><span>当前阶段</span><strong>validation</strong></div></section><section class="composer-section"><div class="section-head"><div><span class="eyebrow">RESEARCH QUEUE</span><h2>品种与研究路径</h2></div></div><div class="composer-task-grid">${tasks.map(task=>`<article><strong>${task[0]}</strong><span>${task[1]}</span><small>${task[2]}</small></article>`).join('')}</div></section><section class="composer-section"><div class="section-head"><div><span class="eyebrow">PROMOTED STRATEGIES</span><h2>已晋级策略</h2></div></div><div class="composer-run-list"><article><header><div><strong>合成品种A</strong><span>母策略演化</span></div><em>已评估</em></header><div class="composer-hypothesis"><b>删除进场结构</b><p>移除一个低覆盖进场条件，检验是否改善交易覆盖与验证段表现。</p><small>trend_transition_synthetic</small></div><dl><div><dt>候选交易</dt><dd>333</dd></div><div><dt>当前母策略交易</dt><dd>305</dd></div><div><dt>候选收益</dt><dd>21559.00</dd></div><div><dt>收益改善</dt><dd>718.00</dd></div><div><dt>候选回撤</dt><dd>3959.00</dd></div><div><dt>验证段收益改善</dt><dd>264.00</dd></div><div><dt>盈利月份</dt><dd>11/14</dd></div><div><dt>可实现空间赔率</dt><dd>2.35</dd></div></dl><div class="composer-decision"><strong>已晋级并进入下一轮研究</strong></div><label class="strategy-handoff">策略 JSON<input value="synthetic/promoted_strategy.json" readonly/><button type="button" data-action="open-strategy">导入策略研究室</button></label><button class="secondary-action">下载持仓路径CSV</button></article></div></section><article class="method-note"><strong>组合逻辑</strong><span>不是给因子分配权重。每轮只研究进场、退出或反手中的一个结构，候选先与母策略或当前冠军比较，再通过验证段和月度稳定性门槛。</span></article></section></div>`;
}

function renderGammaLab(module) {
  const bars = [-22, -34, -58, -91, -74, -40, 18, 46, 65, 39, 20];
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack"><article class="panel gamma-panel"><div class="panel-heading"><div><span class="panel-kicker">LOCAL GEX PROFILE</span><h2>现价附近执行价分布</h2></div><span class="status-pill warn">代理口径</span></div><div class="gex-chart"><div class="zero-line"></div>${bars.map((value, index) => `<div class="gex-column"><i class="${value < 0 ? 'negative' : 'positive'}" style="height:${Math.abs(value)}%"></i><span>${96 + index}</span></div>`).join('')}<b class="spot-line">现价 101.4</b></div><div class="gamma-summary"><div><span>负GEX集中区</span><strong>98—101</strong><small>可能放大已有方向的对冲流</small></div><div><span>最大Gamma墙</span><strong>103</strong><small>观察价格接近后的波动变化</small></div><div><span>策略方向</span><strong>由趋势给出</strong><small>GEX不单独生成多空信号</small></div></div></article><article class="design-note warning"><b>边界说明</b><p>公开演示采用Call正、Put负的代理聚合，用于说明Local GEX研究流程；它不代表真实做市商净仓位，也不承诺负GEX一定产生趋势行情。</p></article></section></div>`;
}

function renderPeriodLab(module) {
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack"><div class="period-grid"><article class="panel period-card slow"><div class="period-label"><span>60 MIN</span><b>环境方向</b><em>上行</em></div>${sparkline([100,101,102,101.8,103.4,104.2,105.5,106.1], '#67d9cc')}<div class="state-tags"><span>MA20斜率 +</span><span>结构高点抬升</span><span>穿越较少</span></div></article><article class="panel period-card fast"><div class="period-label"><span>30 MIN</span><b>进入时机</b><em class="waiting">等待</em></div>${sparkline([100,101.4,101.1,102.3,101.8,102.1,102.7,103.2], '#f1bd69')}<div class="state-tags"><span>回踩进行中</span><span>小实体已压缩</span><span>等待重新转强</span></div></article></div><article class="panel holding-panel"><div class="panel-heading"><div><span class="panel-kicker">POSITION PROTECTION</span><h2>持仓状态机</h2></div><span class="status-pill good">保护中</span></div><div class="state-machine"><div class="done"><span>1</span><b>建立方向</b><small>60m环境成立</small></div><i>→</i><div class="done"><span>2</span><b>等待触发</b><small>30m回踩结束</small></div><i>→</i><div class="active"><span>3</span><b>持仓保护</b><small>容忍正常回撤</small></div><i>→</i><div><span>4</span><b>趋势弱化</b><small>减仓或退出</small></div><i>→</i><div><span>5</span><b>明确反转</b><small>独立评估反手</small></div></div></article><article class="design-note"><b>删除小实体不是删除时间</b><p>状态序列忽略低信息实体，但保留源K线索引。信号仍然在原始时间轴生成，执行仍然遵守下一根K线规则，因此不会制造未来函数。</p></article></section></div>`;
}

function renderSimulation(module) {
  const slots = [['01', '趋势延续演示', 'RUNNING', '多头观察'], ['02', '30/60协同候选', 'WAITING', '等待触发'], ['03', '支撑压力过滤', 'FLAT', '无持仓'], ['04', '空槽位', 'EMPTY', '未接入']];
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack"><div class="slot-grid">${slots.map((slot, index) => `<article class="slot-card ${index === 3 ? 'empty' : ''}"><header><span>SLOT ${slot[0]}</span><i class="${slot[2].toLowerCase()}">${slot[2]}</i></header><h3>${slot[1]}</h3><p>${slot[3]}</p><div><span>策略版本</span><strong>${index === 3 ? '—' : `demo-v${index + 1}`}</strong></div><div><span>订单状态</span><strong>${index === 0 ? '已完成' : '无活动订单'}</strong></div></article>`).join('')}</div><article class="panel isolation-panel"><div><span class="panel-kicker">RESEARCH SIDE</span><h2>研究系统</h2><p>频繁迭代策略、因子与页面，不直接操作账户。</p></div><i>冻结版本<br/>＋ 哈希校验<br/>→</i><div><span class="panel-kicker">EXECUTION SIDE</span><h2>独立执行服务</h2><p>只加载确认版本，管理订单、持仓对账和断线恢复。</p></div></article></section></div>`;
}

const renderers = {
  overview: renderOverview, message: renderMessage, ranking: renderTrendRanking, strategy: renderStrategy,
  loop: renderResearchLoop, levels: renderLevels, composer: renderComposer, gamma: renderGammaLab,
  period: renderPeriodLab, simulation: renderSimulation
};

function renderNavigation() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = state.modules.map(module => `<a href="#${module.id}" data-module="${module.id}"><span>${module.icon}</span><b>${module.title}</b></a>`).join('');
}

function renderActiveModule() {
  const requested = location.hash.replace('#', '') || 'overview';
  const module = state.modules.find(item => item.id === requested) || state.modules[0];
  state.activeId = module.id;
  document.querySelectorAll('[data-module]').forEach(link => link.classList.toggle('active', link.dataset.module === module.id));
  document.getElementById('current-module').textContent = module.title;
  document.title = `${module.title} · 期货趋势研究`;
  const renderer = renderers[module.kind] || renderOverview;
  document.getElementById('module-root').innerHTML = renderer(module);
  if (module.kind === 'composer') {
    const values = document.querySelectorAll('.composer-status-band strong');
    if (values.length === 4) { values[0].textContent = state.composerPaused ? '已暂停' : '研究中'; values[3].textContent = state.composerPaused ? 'paused' : 'validation'; }
  }
  if (module.kind === 'levels') {
    document.querySelectorAll('.evidence-card').forEach(card => {
      const trend = card.querySelector('header b')?.textContent.includes('趋势研究');
      const formula = document.createElement('code');
      formula.className = 'factor-formula';
      formula.textContent = trend
        ? 'path_success_5 = I(favorable_path_5 > adverse_path_5); entry = open_(t+1)'
        : 'signal_t = I(state_t ≠ state_(t-1)); entry = open_(t+1)';
      card.querySelector('details')?.insertBefore(formula, card.querySelector('details p'));
    });
  }
  document.getElementById('module-root').focus({ preventScroll: true });
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-scrim').classList.remove('show');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function handleWorkbenchAction(event) {
  const control = event.target.closest('[data-action]');
  if (!control) {
    const csvButton = event.target.closest('.secondary-action');
    if (csvButton?.textContent.includes('持仓路径CSV')) {
      downloadText('synthetic_holding_path.csv', 'bar,time,position,event\n1,09:00,1,entry\n2,09:30,1,hold\n3,10:00,0,exit\n', 'text/csv;charset=utf-8');
    }
    return;
  }
  const action = control.dataset.action;
  if (action === 'change-ranking-period') {
    state.rankingPeriod = control.dataset.period;
    renderActiveModule();
  } else if (action === 'set-state') {
    state[control.dataset.key] = control.dataset.value;
    renderActiveModule();
  } else if (action === 'demo-scan') {
    control.textContent = '扫描完成 · 合成结果已更新';
    control.disabled = true;
  } else if (action === 'toggle-composer') {
    state.composerPaused = !state.composerPaused;
    control.textContent = state.composerPaused ? '继续组合研究' : '暂停组合研究';
    const values = document.querySelectorAll('.composer-status-band strong');
    if (values.length === 4) { values[0].textContent = state.composerPaused ? '已暂停' : '研究中'; values[3].textContent = state.composerPaused ? 'paused' : 'validation'; }
  } else if (action === 'generate-spec') {
    control.innerHTML = '结构化策略已生成 <span>✓</span>';
    control.classList.add('completed-action');
    control.disabled = true;
  } else if (action === 'open-strategy') {
    location.hash = 'strategy-research';
  } else if (action === 'show-samples') {
    const details = control.closest('.evidence-card')?.querySelector('details');
    if (details) { details.open = true; details.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    control.textContent = '已展开代表样本';
  } else if (action === 'download-factor-md') {
    const card = control.closest('.evidence-card');
    const title = card?.querySelector('header b')?.textContent || `因子 ${control.dataset.factor}`;
    const condition = card?.querySelector('h3')?.textContent || '';
    const formula = card?.querySelector('.factor-formula')?.textContent || '';
    const metrics = [...(card?.querySelectorAll('dl div') || [])].map(item => `- ${item.querySelector('dt')?.textContent}: ${item.querySelector('dd')?.textContent}`).join('\n');
    downloadText(`factor_${control.dataset.factor}_samples.md`, `# ${title}\n\n## 精确条件\n${condition}\n\n## 离线公式\n\`${formula}\`\n\n## 证据指标\n${metrics}\n\n## 代表样本\n- 成功：下一根开盘后有利路径覆盖风险空间。\n- 失败：触发后先出现超过阈值的不利波动。\n\n> 合成数据；所有样本保留原始已完成K线索引。\n`);
  }
}

async function boot() {
  try {
    const demoSources = location.hostname.endsWith('github.io')
      ? ['./demo-data.json']
      : ['/api/demo', './demo-data.json'];
    const [modules, demo] = await Promise.all([
      fetchJson(['./assets/modules.json']),
      fetchJson(demoSources)
    ]);
    state.modules = modules; state.demo = demo;
    renderNavigation(); renderActiveModule();
  } catch (error) {
    document.getElementById('module-root').innerHTML = `<div class="fatal-error"><b>展示数据加载失败</b><p>${escapeHtml(error.message)}</p></div>`;
  }
}

window.addEventListener('hashchange', renderActiveModule);
document.getElementById('mobile-menu').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-scrim').classList.add('show');
});
document.getElementById('sidebar-scrim').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-scrim').classList.remove('show');
});
document.getElementById('module-root').addEventListener('click', handleWorkbenchAction);
document.getElementById('module-root').addEventListener('change', event => {
  const select = event.target.closest('[data-state-select]');
  if (!select) return;
  state[select.dataset.stateSelect] = select.value;
  renderActiveModule();
});

boot();
