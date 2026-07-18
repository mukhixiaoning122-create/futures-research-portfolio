const text = (id, value) => { document.getElementById(id).textContent = value; };

const loadDemo = async () => {
  const sources = ['/api/demo', './demo-data.json'];
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
};

loadDemo()
  .then((data) => {
    const causal = data.causal_backtest;
    const mtf = data.multi_timeframe;
    const factor = data.factor_combination;
    const loop = data.research_loop;
    text('signals', `${causal.accepted_signals} accepted / ${causal.rejected_signals} rejected`);
    text('causal-copy', causal.rejection_reasons.join('；'));
    text('mtf-decision', mtf.decision);
    text('mtf-copy', `${mtf.completed_30m_bars}根30m → ${mtf.completed_60m_bars}根已完成60m；移除${mtf.removed_low_information_indices.length}根低信息实体。`);
    text('factor-score', `${factor.score.toFixed(3)} · ${factor.decision}`);
    text('factor-copy', factor.explanation);
    text('loop-stage', loop.stage);
    text('loop-copy', `验证集 ${loop.validation_score}，一次性封存样本 ${loop.holdout_score}，血统 ${loop.lineage.join(' → ')}。`);
  })
  .catch((error) => {
    document.querySelectorAll('.card p:last-child').forEach((node) => {
      node.textContent = `演示接口未启动：${error.message}`;
    });
  });
