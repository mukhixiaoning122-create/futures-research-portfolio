const state = { modules: [], demo: null, activeId: 'overview', rankingPeriod: '60m' };

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
  return `<header class="page-header">
    <div><span class="eyebrow">${escapeHtml(module.eyebrow)}</span><h1>${escapeHtml(module.title)}</h1><p>${escapeHtml(module.subtitle)}</p></div>
    <span class="demo-chip">SYNTHETIC DATA</span>
  </header>${metricCards(module)}`;
}

function principlePanel(module) {
  return `<aside class="principle-panel">
    <div class="principle-title"><span>设计理念</span><i>WHY</i></div>
    <p>${escapeHtml(module.principle)}</p>
    <div class="implementation-list"><h3>实现原理</h3>${module.implementation.map((item, index) => `
      <div><b>${String(index + 1).padStart(2, '0')}</b><span>${escapeHtml(item)}</span></div>`).join('')}</div>
  </aside>`;
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
  </section>${principlePanel(module)}</div>`;
}

function renderMessage(module) {
  const dimensions = [['价格趋势', 82, 'positive'], ['供需变化', 64, 'positive'], ['库存与基差', 42, 'warning'], ['持仓流向', 71, 'positive'], ['事件情绪', 56, 'neutral']];
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack">
    <article class="panel score-panel"><div class="score-dial"><div><strong>+38</strong><span>综合分</span></div><small>偏多 · 但价格已部分反映</small></div><div class="score-bars">${dimensions.map(item => `<div><span>${item[0]}</span><b><i class="${item[2]}" style="width:${item[1]}%"></i></b><strong>${item[1]}</strong></div>`).join('')}</div></article>
    <div class="two-column"><article class="panel"><div class="panel-heading"><div><span class="panel-kicker">EVIDENCE</span><h2>结构化证据</h2></div><span class="status-pill">评分时点 14:30</span></div><div class="evidence-list"><div><i class="good"></i><span><b>趋势结构</b><small>中周期均线保持上行，回撤未破坏主结构</small></span><em>高可信</em></div><div><i class="warn"></i><span><b>库存与基差</b><small>数据方向支持，但更新时间晚于价格变化</small></span><em>待确认</em></div><div><i class="good"></i><span><b>近期事件</b><small>事件冲击与成交量同步，尚未出现反向吸收</small></span><em>中可信</em></div></div></article>
    <article class="panel pricing-card"><span class="panel-kicker">PRICED IN?</span><h2>信息是否已经定价</h2><div class="pricing-scale"><i></i><b style="left:64%"></b></div><div><span>未反映</span><strong>部分反映</strong><span>充分反映</span></div><p>评分只进入策略过滤层。即使基本面偏多，如果价格空间不足或趋势结构已经破坏，策略仍然等待。</p></article></div>
  </section>${principlePanel(module)}</div>`;
}

function renderTrendRanking(module) {
  const periodScale = { '60m': 1, '120m': 0.93, '240m': 0.86 }[state.rankingPeriod] || 1;
  const rows = [
    ['合成品种 A', 86, 0.78, 2, '8.4%', '顺畅上行'], ['合成品种 B', 74, 0.66, 4, '12.1%', '趋势可用'],
    ['合成品种 C', 61, 0.51, 7, '18.6%', '反复偏多'], ['合成品种 D', 43, 0.32, 11, '24.2%', '噪声较高']
  ].map(row => [row[0], Math.round(row[1] * periodScale), (row[2] * periodScale).toFixed(2), row[3], row[4], row[5]]);
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack">
    <article class="panel"><div class="panel-heading"><div><span class="panel-kicker">UNIVERSE RANKING</span><h2>${state.rankingPeriod.replace('m', '')}分钟趋势适配度</h2></div><div class="segmented">${['60m', '120m', '240m'].map(period => `<button type="button" data-action="change-ranking-period" data-period="${period}" class="${period === state.rankingPeriod ? 'active' : ''}">${period}</button>`).join('')}</div></div>
      <div class="ranking-table"><div class="table-row table-head"><span>品种</span><span>流畅度</span><span>路径效率</span><span>MA20穿越</span><span>最大回撤</span><span>判断</span></div>${rows.map((row, index) => `<div class="table-row"><span><b class="rank">${index + 1}</b>${row[0]}</span><span><strong>${row[1]}</strong><i class="rank-bar"><em style="width:${row[1]}%"></em></i></span><span>${row[2]}</span><span>${row[3]}次</span><span>${row[4]}</span><span class="${index < 2 ? 'positive-text' : 'muted-text'}">${row[5]}</span></div>`).join('')}</div>
    </article>
    <div class="factor-formulas"><article><span>01</span><h3>路径效率</h3><strong>|终点−起点| ÷ Σ|逐K变化|</strong><p>同样涨幅下，绕路越少越适合趋势跟随。</p></article><article><span>02</span><h3>MA20穿越惩罚</h3><strong>有效穿越次数 + 幅度</strong><p>频繁上下穿说明方向不稳定，不因最终上涨而忽略过程。</p></article><article><span>03</span><h3>回撤与恢复</h3><strong>深度 × 持续时间</strong><p>区分健康回踩和破坏趋势结构的深度回撤。</p></article><article><span>04</span><h3>斜率一致性</h3><strong>短 / 中窗口同向率</strong><p>减少只靠最后几根K线制造的伪趋势。</p></article></div>
    <article class="design-note"><b>为什么删除小实体？</b><p>开收盘变化很小的K线常是低信息节点。研究路径可暂时压缩这些节点，减少无效状态切换；但每根有效K线仍保存原始索引，回测执行不会改变真实时间。</p></article>
  </section>${principlePanel(module)}</div>`;
}

function renderStrategy(module) {
  const backtest = state.demo.causal_backtest;
  const equity = sparkline([100, 101, 100.6, 102.4, 103.1, 102.8, 105.2, 106.4, 105.9, 108.2, 109.1]);
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack">
    <div class="two-column strategy-layout"><article class="panel strategy-form"><div class="panel-heading"><div><span class="panel-kicker">NATURAL LANGUAGE → SPEC</span><h2>研究输入</h2></div><span class="status-pill good">示例策略</span></div><label>策略思路<textarea readonly>60分钟趋势保持上行时，等待30分钟回踩结束；价格重新站回短均线后进入，趋势结构破坏后退出。</textarea></label><div class="form-grid"><label>决策周期<strong>30 / 60 分钟</strong></label><label>执行口径<strong>下一根K线开盘</strong></label><label>方向来源<strong>60m 已完成K线</strong></label><label>风险约束<strong>空间 + 波动否决</strong></label></div><button type="button" class="primary-action" data-action="generate-spec">生成结构化策略 <span>→</span></button></article>
    <article class="panel"><div class="panel-heading"><div><span class="panel-kicker">CAUSAL AUDIT</span><h2>策略审计</h2></div><span class="status-pill good">通过</span></div><div class="audit-list"><div><i>✓</i><span><b>未来索引</b><small>未发现负索引或 i+1 访问</small></span></div><div><i>✓</i><span><b>执行错位</b><small>信号与执行至少间隔一根K线</small></span></div><div><i>✓</i><span><b>危险调用</b><small>未发现文件、网络和动态执行越权</small></span></div><div class="rejected"><i>×</i><span><b>示例拒绝信号</b><small>同K线执行 · 已记录原因</small></span></div></div></article></div>
    <article class="panel performance-panel"><div class="panel-heading"><div><span class="panel-kicker">BACKTEST REPORT</span><h2>因果回测结果</h2></div><span class="status-pill">合成数据 · API绑定</span></div><div class="performance-body"><div class="equity-chart">${equity}<span>净值（示意）</span></div><div class="performance-stats"><div><span>合法信号</span><strong>${backtest.accepted_signals}</strong></div><div><span>拒绝信号</span><strong>${backtest.rejected_signals}</strong></div><div><span>完成交易</span><strong>${backtest.trades.length}</strong></div><div><span>示例净点数</span><strong>${backtest.realized_points_after_example_cost.toFixed(1)}</strong></div></div></div><p class="panel-footnote">指标来自同仓库研究核心生成的确定性合成报告；净值曲线仅示意报告界面，不代表真实回测或实盘收益。</p></article>
  </section>${principlePanel(module)}</div>`;
}

function renderResearchLoop(module) {
  const loop = state.demo.research_loop;
  const completedStage = loop.stage === 'promoted' ? 7 : loop.stage === 'holdout' ? 6 : 5;
  const stages = module.stages.map((stage, index) => `<div class="loop-stage ${index < completedStage ? 'complete' : index === completedStage ? 'active' : ''}"><span>${index < completedStage ? '✓' : index + 1}</span><b>${stage}</b><small>${['两角色并行', '假设转规则', '静态+动态', '允许修改', '只做判断', '仅打开一次', '保存可迁移结论'][index]}</small></div>${index < module.stages.length - 1 ? '<i class="loop-link">→</i>' : ''}`).join('');
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack">
    <article class="panel loop-panel"><div class="panel-heading"><div><span class="panel-kicker">CANDIDATE LIFECYCLE</span><h2>一次研究循环怎么跑</h2></div><span class="running-pill"><i></i> 本轮已晋级</span></div><div class="loop-flow">${stages}</div><div class="loop-rule"><b>晋级纪律</b><span>训练集可以改策略</span><i>≠</i><span>验证集只判断</span><i>→</i><span>达标才开封存样本</span></div></article>
    <div class="two-column"><article class="panel"><div class="panel-heading"><div><span class="panel-kicker">EXPERIMENT QUEUE</span><h2>候选实验</h2></div><span class="status-pill">报告候选 ${escapeHtml(loop.candidate)}</span></div><div class="candidate-table"><div><span><b>${escapeHtml(loop.candidate)}</b><small>验证集评分</small></span><em class="promoted">已达标</em><strong>${loop.validation_score.toFixed(2)}</strong></div><div><span><b>${escapeHtml(loop.candidate)}</b><small>一次性封存样本评分</small></span><em class="promoted">已晋级</em><strong>${loop.holdout_score.toFixed(2)}</strong></div><div><span><b>${escapeHtml(loop.lineage[0])}</b><small>候选血统起点</small></span><em class="validating">前序版本</em><strong>—</strong></div><div><span><b>失败账本</b><small>未达门槛的结论单独沉淀</small></span><em class="failed">记录</em><strong>${loop.failure_ledger_size}</strong></div></div></article>
    <article class="panel memory-panel"><div class="panel-heading"><div><span class="panel-kicker">RESEARCH MEMORY</span><h2>记忆分层</h2></div></div><div class="memory-columns"><div><b>冠军记忆</b><p>只保存通过研究门槛、可迁移的方法结论。</p><span>✓ 方向与时机分离</span><span>✓ 支撑空间作为硬过滤</span></div><div><b>失败账本</b><p>记录失败条件，防止Loop重复寻找同一种伪规律。</p><span>× 参数峰值过窄</span><span>× 跨月份方向翻转</span></div></div><div class="sealed-note">封存样本结果不会写回研究提示，避免模型围绕最终答案继续拟合。</div></article></div>
  </section>${principlePanel(module)}</div>`;
}

function renderLevels(module) {
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack"><article class="panel level-chart-panel"><div class="panel-heading"><div><span class="panel-kicker">PRICE STRUCTURE</span><h2>多周期支撑压力区域</h2></div><span class="status-pill">60m 背景 / 30m 触发</span></div><div class="price-chart"><div class="level resistance" style="top:18%"><span>压力区 · 2.4 ATR</span></div><div class="level pivot" style="top:42%"><span>前高转换区</span></div><div class="level support" style="top:72%"><span>支撑区 · 强度 0.78</span></div><svg viewBox="0 0 800 260" preserveAspectRatio="none"><polyline points="0,210 55,194 110,202 165,164 220,174 275,132 330,146 385,118 440,127 495,91 550,104 605,72 660,82 715,48 800,60" fill="none" stroke="#67d9cc" stroke-width="4" vector-effect="non-scaling-stroke"/></svg><i class="current-price">现价</i></div></article><div class="factor-formulas"><article><span>01</span><h3>触碰质量</h3><strong>次数 × 反应幅度</strong><p>多次无效触碰会削弱区域，而不是机械增强。</p></article><article><span>02</span><h3>有效空间</h3><strong>目标距离 ÷ 当前波动</strong><p>空间不足时，即使方向正确也不值得交易。</p></article><article><span>03</span><h3>突破确认</h3><strong>收盘确认 + 回踩反应</strong><p>区分瞬时刺穿与结构性突破。</p></article><article><span>04</span><h3>时间衰减</h3><strong>近期证据权重更高</strong><p>旧位置仍保留，但需要新价格行为重新确认。</p></article></div></section>${principlePanel(module)}</div>`;
}

function renderComposer(module) {
  const factors = [['核心趋势', 88, '决定方向'], ['趋势流畅度', 76, '选择品种'], ['支撑压力空间', 81, '过滤进场'], ['消息与基本面', 58, '调整置信度'], ['Local GEX', 67, '判断放大环境']];
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack"><article class="panel composer-panel"><div class="panel-heading"><div><span class="panel-kicker">EXPLAINABLE COMBINATION</span><h2>因子不是投票，而是分工</h2></div><span class="status-pill good">候选可回测</span></div><div class="composer-grid"><div class="factor-stack">${factors.map((item, index) => `<div><span><i>${index === 0 ? 'CORE' : `F0${index}`}</i><b>${item[0]}</b><small>${item[2]}</small></span><em><u style="width:${item[1]}%"></u></em><strong>${item[1]}</strong></div>`).join('')}</div><div class="decision-core"><span>组合决策</span><strong>趋势延续候选</strong><p>60m方向成立 · 30m等待回踩完成<br/>上方空间充足 · 负Local GEX放大环境</p><button type="button" class="primary-action" data-action="open-strategy">送入策略研究室 →</button></div></div></article><div class="three-column"><article class="panel mini-process"><span>ENTRY</span><h3>进场研究</h3><p>关键技术指标决定触发；空间和流畅度负责过滤。</p><b>等待30m确认</b></article><article class="panel mini-process"><span>HOLD</span><h3>持有保护</h3><p>正常回撤不退出；趋势弱化与明确反转分层处理。</p><b>保护状态开启</b></article><article class="panel mini-process"><span>EXIT</span><h3>退出与反手</h3><p>退出不等于立即反手，反向策略需独立满足条件。</p><b>当前无反手</b></article></div></section>${principlePanel(module)}</div>`;
}

function renderGammaLab(module) {
  const bars = [-22, -34, -58, -91, -74, -40, 18, 46, 65, 39, 20];
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack"><article class="panel gamma-panel"><div class="panel-heading"><div><span class="panel-kicker">LOCAL GEX PROFILE</span><h2>现价附近执行价分布</h2></div><span class="status-pill warn">代理口径</span></div><div class="gex-chart"><div class="zero-line"></div>${bars.map((value, index) => `<div class="gex-column"><i class="${value < 0 ? 'negative' : 'positive'}" style="height:${Math.abs(value)}%"></i><span>${96 + index}</span></div>`).join('')}<b class="spot-line">现价 101.4</b></div><div class="gamma-summary"><div><span>负GEX集中区</span><strong>98—101</strong><small>可能放大已有方向的对冲流</small></div><div><span>最大Gamma墙</span><strong>103</strong><small>观察价格接近后的波动变化</small></div><div><span>策略方向</span><strong>由趋势给出</strong><small>GEX不单独生成多空信号</small></div></div></article><article class="design-note warning"><b>边界说明</b><p>公开演示采用Call正、Put负的代理聚合，用于说明Local GEX研究流程；它不代表真实做市商净仓位，也不承诺负GEX一定产生趋势行情。</p></article></section>${principlePanel(module)}</div>`;
}

function renderPeriodLab(module) {
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack"><div class="period-grid"><article class="panel period-card slow"><div class="period-label"><span>60 MIN</span><b>环境方向</b><em>上行</em></div>${sparkline([100,101,102,101.8,103.4,104.2,105.5,106.1], '#67d9cc')}<div class="state-tags"><span>MA20斜率 +</span><span>结构高点抬升</span><span>穿越较少</span></div></article><article class="panel period-card fast"><div class="period-label"><span>30 MIN</span><b>进入时机</b><em class="waiting">等待</em></div>${sparkline([100,101.4,101.1,102.3,101.8,102.1,102.7,103.2], '#f1bd69')}<div class="state-tags"><span>回踩进行中</span><span>小实体已压缩</span><span>等待重新转强</span></div></article></div><article class="panel holding-panel"><div class="panel-heading"><div><span class="panel-kicker">POSITION PROTECTION</span><h2>持仓状态机</h2></div><span class="status-pill good">保护中</span></div><div class="state-machine"><div class="done"><span>1</span><b>建立方向</b><small>60m环境成立</small></div><i>→</i><div class="done"><span>2</span><b>等待触发</b><small>30m回踩结束</small></div><i>→</i><div class="active"><span>3</span><b>持仓保护</b><small>容忍正常回撤</small></div><i>→</i><div><span>4</span><b>趋势弱化</b><small>减仓或退出</small></div><i>→</i><div><span>5</span><b>明确反转</b><small>独立评估反手</small></div></div></article><article class="design-note"><b>删除小实体不是删除时间</b><p>状态序列忽略低信息实体，但保留源K线索引。信号仍然在原始时间轴生成，执行仍然遵守下一根K线规则，因此不会制造未来函数。</p></article></section>${principlePanel(module)}</div>`;
}

function renderSimulation(module) {
  const slots = [['01', '趋势延续演示', 'RUNNING', '多头观察'], ['02', '30/60协同候选', 'WAITING', '等待触发'], ['03', '支撑压力过滤', 'FLAT', '无持仓'], ['04', '空槽位', 'EMPTY', '未接入']];
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack"><div class="slot-grid">${slots.map((slot, index) => `<article class="slot-card ${index === 3 ? 'empty' : ''}"><header><span>SLOT ${slot[0]}</span><i class="${slot[2].toLowerCase()}">${slot[2]}</i></header><h3>${slot[1]}</h3><p>${slot[3]}</p><div><span>策略版本</span><strong>${index === 3 ? '—' : `demo-v${index + 1}`}</strong></div><div><span>订单状态</span><strong>${index === 0 ? '已完成' : '无活动订单'}</strong></div></article>`).join('')}</div><article class="panel isolation-panel"><div><span class="panel-kicker">RESEARCH SIDE</span><h2>研究系统</h2><p>频繁迭代策略、因子与页面，不直接操作账户。</p></div><i>冻结版本<br/>＋ 哈希校验<br/>→</i><div><span class="panel-kicker">EXECUTION SIDE</span><h2>独立执行服务</h2><p>只加载确认版本，管理订单、持仓对账和断线恢复。</p></div></article></section>${principlePanel(module)}</div>`;
}

function renderSettings(module) {
  const settings = [['行情与数据', '合成演示数据', '真实行情连接未包含'], ['研究模型', '静态演示模式', '页面不调用任何大模型API'], ['策略执行', '完全隔离', '没有柜台、账户和报单能力'], ['时间边界', '已完成K线', '信号形成后下一根执行'], ['研究存储', '候选与失败分离', '封存样本不进入研究记忆']];
  return `${pageHeader(module)}<div class="content-with-aside"><section class="content-stack"><article class="panel settings-panel"><div class="panel-heading"><div><span class="panel-kicker">PUBLIC CONFIGURATION</span><h2>当前展示环境</h2></div><span class="status-pill good">安全边界开启</span></div>${settings.map(item => `<div class="setting-row"><span><b>${item[0]}</b><small>${item[2]}</small></span><strong>${item[1]}</strong><i>LOCKED</i></div>`).join('')}</article><article class="panel architecture-strip"><div><b>Browser UI</b><small>模块展示与研究解释</small></div><i>→</i><div><b>FastAPI / Static JSON</b><small>本地动态或Pages静态</small></div><i>→</i><div><b>Research Core</b><small>因果回测与候选纪律</small></div><i>╳</i><div class="disabled"><b>Broker</b><small>公开版未接入</small></div></article></section>${principlePanel(module)}</div>`;
}

const renderers = {
  overview: renderOverview, message: renderMessage, ranking: renderTrendRanking, strategy: renderStrategy,
  loop: renderResearchLoop, levels: renderLevels, composer: renderComposer, gamma: renderGammaLab,
  period: renderPeriodLab, simulation: renderSimulation, settings: renderSettings
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
  document.getElementById('module-root').focus({ preventScroll: true });
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-scrim').classList.remove('show');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function handleWorkbenchAction(event) {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const action = control.dataset.action;
  if (action === 'change-ranking-period') {
    state.rankingPeriod = control.dataset.period;
    renderActiveModule();
  } else if (action === 'generate-spec') {
    control.innerHTML = '结构化策略已生成 <span>✓</span>';
    control.classList.add('completed-action');
    control.disabled = true;
  } else if (action === 'open-strategy') {
    location.hash = 'strategy-research';
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

boot();
