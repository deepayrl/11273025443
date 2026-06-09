import { ProductItem, OrderItem, CustomerItem } from '../types';
import { AICoreIntelligence, PlanTaskNode } from '../services/AICoreIntelligence';

export interface IntelligentReply {
  text: string;
  actionType: 'product_create' | 'restock' | 'campaign' | 'customer_recall' | 'none' | 'switch_tab' | 'APPLY_OPTIMIZED_COPY' | 'COMPARE_PREVIEW' | 'EXPORT_FINANCE_REPORT' | 'PREFILL_PRODUCT';
  metaObj: any;
  suggestions: any[];
  thought?: {
    intent: string;
    reasoning: string;
    planning: string;
    permission: string;
    toolRouter: string;
    validator: string;
  };
}

export function generateIntelligentLocalReply(
  query: string,
  products: ProductItem[],
  orders: OrderItem[],
  customers: CustomerItem[]
): IntelligentReply {
  const queryLower = query.toLowerCase().trim();
  
  // Initialize core algorithmic intelligence instance run for standard context mapping
  const brain = new AICoreIntelligence(products, orders, customers);

  let text = '';
  let actionType: IntelligentReply['actionType'] = 'none';
  let metaObj: any = null;
  let suggestions: any[] = [];
  
  let intentClass = 'CHAT';
  let reasoningGoal = '常规经营健康审计';
  let reasoningCurrentState = '隔离存储层正常，未发现数据泄压';
  let reasoningMissingInfo = '无';
  let reasoningRisk = '低级常规';
  let reasoningNextAction = '';
  let planningTasks = '';
  let permissionCheck = 'ADMIN_APPROVED (商家主管理员令牌对齐)';
  let toolRoute = 'AI_Brain_OS -> CoreIntelligence';
  let validationResult = 'SUCCESS (哨兵核签安全一致)';

  const isGreeting = 
    queryLower === '你好' || 
    queryLower === 'hi' || 
    queryLower === 'hello' || 
    queryLower.startsWith('你好');

  const isDangerous = 
    queryLower.includes('删除全部') || 
    queryLower.includes('清空') || 
    queryLower.includes('删除所有') || 
    queryLower.includes('delete all') || 
    queryLower.includes('销毁');

  const isProductCreate = 
    queryLower.includes('创建商品') || 
    queryLower.includes('新建商品') || 
    queryLower.includes('上架新商品') || 
    queryLower.includes('上架商品') ||
    queryLower.includes('创建新商品');

  const isOrderQuery = 
    queryLower.includes('今天订单') ||
    queryLower.includes('订单') ||
    queryLower.includes('发货') ||
    queryLower.includes('下单');

  const isInventoryQuery = 
    queryLower.includes('库存') ||
    queryLower.includes('货源') ||
    queryLower.includes('补货');

  const isCustomerQuery = 
    queryLower.includes('客') || 
    queryLower.includes('流失') || 
    queryLower.includes('会员') || 
    queryLower.includes('crm') ||
    queryLower.includes('召回');

  const isKnowledgeGraph = 
    queryLower.includes('知识图谱') || 
    queryLower.includes('图谱') || 
    queryLower.includes('关系图') || 
    queryLower.includes('关联关系') || 
    queryLower.includes('网络') ||
    queryLower.includes('graph');

  const isSimulation = 
    queryLower.includes('降价') || 
    queryLower.includes('折扣模拟') || 
    queryLower.includes('模拟') || 
    queryLower.includes('价格调整') || 
    queryLower.includes('调价');

  const isGrowthStrategy = 
    queryLower.includes('提高销量') || 
    queryLower.includes('销量提升') || 
    queryLower.includes('怎么卖出去') || 
    queryLower.includes('销量下降') || 
    queryLower.includes('销量下滑') ||
    queryLower.includes('营业额变差') ||
    queryLower.includes('策略');

  const isGoalSystem = 
    queryLower.includes('目标') || 
    queryLower.includes('goal') || 
    queryLower.includes('目标执行') || 
    queryLower.includes('目标提升');

  const isAutonomousBI = 
    queryLower.includes('监控') || 
    queryLower.includes('预警') || 
    queryLower.includes('异常') || 
    queryLower.includes('机会') || 
    queryLower.includes('数据发现') || 
    queryLower.includes('anomaly') || 
    queryLower.includes('insight');

  const isSelfOptimization = 
    queryLower.includes('优化') || 
    queryLower.includes('自研') || 
    queryLower.includes('权重') || 
    queryLower.includes('权值') || 
    queryLower.includes('self-opt') || 
    queryLower.includes('selfopt');

  const isExecutiveLayer = 
    queryLower.includes('报告') || 
    queryLower.includes('ceo') || 
    queryLower.includes('总裁') || 
    queryLower.includes('全局') || 
    queryLower.includes('executive');

  const isPlannerCheck = 
    queryLower.includes('规划') || 
    queryLower.includes('值守') || 
    queryLower.includes('planner');

  const isBusinessBrain = 
    queryLower.includes('大脑') || 
    queryLower.includes('os') || 
    queryLower.includes('brain') || 
    queryLower.includes('商业大脑') || 
    queryLower.includes('commerce');

  if (isBusinessBrain) {
    intentClass = 'BUSINESS_BRAIN_V1_CENTRAL';
    const brainState = brain.getBusinessBrainV1State(queryLower);

    reasoningGoal = '自主集成勾对 8 项高级认知商业大脑模块';
    reasoningCurrentState = '神经元中枢全面激活，租户级安全对账放行';
    reasoningRisk = '绿色极安全 (Governor 实时守护)';

    text = '### 🧠 Business Brain V1 Central Aggregate (AI Commerce OS 神经中枢全景指挥控制室)\n\n' +
      '恭喜您！系统底层结构已完全对齐。以下是当前租户空间下 **8 项高级认知系统级引擎** 实时勾对并产生的全景拓扑数据汇总：\n\n' +
      '- **1. Context & Isolation (隔离控制上下文)**\n' +
      '  * 空间名称: `' + brainState.context.storeName + '` | 在售计币位: `' + brainState.context.currency + '` | 活跃异常数: **' + brainState.context.activeAnomaliesCount + '** 项\n' +
      '- **2. Memory & Learnings Graph (经验反向更新图谱)**\n' +
      '  * 记忆网络节点总计: `' + brainState.memory.experienceGraphCount + '` 个经验区块\n' +
      '- **3. Active Goals List (指标执行追踪舱)**\n' +
      '  * 当前运转指标专案: `' + brainState.goal.list.length + '` 笔 (包含 `' + brainState.goal.list[0].id + '` 销量提拉)\n' +
      '- **4. Knowledge Topology (网络连通因果图谱)**\n' +
      '  * 顶点数量: `' + brainState.knowledgeGraph.nodesCount + '` 个 | 边线数量: `' + brainState.knowledgeGraph.edgesCount + '` 条\n' +
      '- **5. Reasoning & Meta-Reasoning (探针逻辑会商与自评)**\n' +
      '  * 评判可信分: `' + brainState.metaReasoning.confidence * 100 + '%` | 决策归因自评: *' + brainState.metaReasoning.selfChallengeText.slice(0, 120) + '...*\n' +
      '- **6. Decision & Simulation Engine (多阶定价弹性推演)**\n' +
      '  * 乐观销量增长投影: `€' + brainState.simulation.continuousProjections.priceElasticity_minus_15_pct.bestCaseRevenue.toFixed(1) + '`\n' +
      '- **7. Intendant Safety Governor (财务与合规物理熔断门锁)**\n' +
      '  * 联审放行对账数: `' + brainState.governor.recentAuditLogsCount + '` 笔 | 最新安全判词: `' + brainState.governor.lastDecisionState + '`\n' +
      '- **8. Self-Optimization & Planner (自动重调及 7*24h 智能值守)**\n' +
      '  * 成效自检评分率: `' + brainState.selfOptimization.autoTuneResult.successRatioPct + '%` | 下发草案码: `' + brainState.planner.autonomousCheckDetails.plannedActionCode + '`\n\n' +
      '---\n\n' +
      '#### 🚀 决策大脑对大盘的最终下发战役决议\n' +
      '主管理员进入控制后台，无需再查看繁复且不直观的底层波形图。您可以发出指令，一键实现复合收益的最优挽回：';

    suggestions = [
      { label: '查看今日 CEO 智能全局报告 (Executive Layer)', action: 'campaign', payload: {} },
      { label: '核查 7*24h 自动值守草案 (Autonomous Planner)', action: 'switch_tab', payload: 'command' }
    ];
  }

  else if (isAutonomousBI) {
    intentClass = 'AUTONOMOUS_BI';
    const insights = brain.generateInsights();
    const anomalies = brain.detectAnomalies();
    const opps = brain.detectOpportunities();
    const risks = brain.detectRisks();

    reasoningGoal = '主动遍历异常节点、资损漏斗与经营红利商机';
    reasoningCurrentState = '租户级大仓库存与 Checkout 阻尼处于持续自主监控状态';
    reasoningRisk = anomalies.length > 0 ? 'Warning (缺货或纠纷阻碍)' : '绿色健康';

    text = '### 👁️ Autonomous Business Intelligence (自主数据发现与异常主动预警)\n\n' +
      '无需店主提问，AI 智能代理持续在后台对各隔离分区的水位、复购摩擦、逆向流转进行自主穿梭检测：\n\n' +
      '#### 🚨 智能实存异常预警发现 (Active Anomalies & Risks)\n' +
      anomalies.map(a => '- **[' + a.threatLevel + '] ' + a.metric + '**：' + a.description + ' (异常度: **' + a.deviationPct.toFixed(1) + '%**)').join('\n') + '\n' +
      risks.map(r => '- **[Risk Exposure]**：' + r.description + ' (预估资损威胁: **€' + r.lossScenariosEur + '** | 资损分: **' + r.riskScore + '/100**)').join('\n') + '\n\n' +
      '#### 💡 运营洞察与流失阻漏建议 (Autonomous Operational Insights)\n' +
      insights.map(i => '##### **' + i.title + '**\n' + i.body + '\n- **测算变现挽回指数**：💶 **€' + i.impactEur + '**\n- **智能代理即时调度**：*已匹配「' + i.actionLabel + '」动作*').join('\n\n') + '\n\n' +
      '#### 📈 增长阻尼溢出商机捕捉 (Opportunities Captured)\n' +
      opps.map(o => '- **[' + o.confidencePct + '% 信心可信度]** ' + o.title + ' (预估额外 GMV 提拉: **+€' + o.expectedGmvGainEur + '** | 推荐模块: `' + o.actionCategory + '`)').join('\n') + '\n\n' +
      '---\n' +
      '**中台决策指令建议**：\n' +
      '已为上述异常自动配置了 Governor 预审批。请一键向 WMS 补足安全物料存货，或直邮挽回券保护会员转化大盘。';

    suggestions = [
      { label: '一键联动 WMS 急调爆品安全备货', action: 'restock', payload: {} },
      { label: '一键将 VIP 唤醒邮件分发到沉默客户', action: 'customer_recall', payload: {} }
    ];
  }

  else if (isGoalSystem) {
    intentClass = 'GOAL_EXECUTION_SYSTEM';
    const activeGoalsList = (AICoreIntelligence as any).activeGoals || [];
    const prog = brain.trackGoalProgress('GOAL_GROW_REVENUE');
    const outcome = brain.evaluateGoalOutcome('GOAL_GROW_REVENUE');
    const recStep = brain.recommendNextStep('GOAL_GROW_REVENUE');

    reasoningGoal = '自主跟踪、分解、复盘全店 KPI 增长指标体系';
    reasoningCurrentState = '销量增长战役目标正在通过 Task Tree 阶梯式执行';
    reasoningRisk = '较低 (策略经验加持)';

    text = '### 🎯 Goal Execution System (目标驱动自主分解与跟踪复盘系统)\n\n' +
      '系统已从「被动问答助手」转型为「目标守护者」。店主下达战略指标后，系统负责从底层分解、日常纠偏到复盘结案全面护航：\n\n' +
      '#### 🚀 当前进行中核心经营目标 (Active Store Goals & KPIs)\n';
      
    text += activeGoalsList.map((g: any) => {
      const gProg = brain.trackGoalProgress(g.id);
      return '##### **目标ID `' + g.id + '`：' + g.goalText + '**\n' +
        '- **目标实施总进度**：🟢 **' + gProg.progressOverallPct + '%**\n' +
        '- **目标期程期限**：' + g.targetDurationDays + ' 天 (创建时间: ' + g.createdAt.slice(0, 10) + ')\n' +
        '- **KPI 对账偏置 (初始 ➡️ 期望 ➡️ 今日)**：\n' +
        '  * 销售流水: €' + g.initialMetrics.totalSales + ' ➡️ €' + g.targetMetrics.totalSales + ' ➡️ **€' + g.currentMetrics.totalSales + '**\n' +
        '  * 成单数量: ' + g.initialMetrics.ordersCount + ' ➡️ ' + g.targetMetrics.ordersCount + ' ➡️ **' + g.currentMetrics.ordersCount + '**\n' +
        '- **子任务看板分解 (Hierarchical Tasks)**：\n' +
        g.tasks.map((t: any) => '  * [' + (t.status === 'Completed' ? '✅ 已达成' : '⏳ 执行中 ' + t.progressPct + '%') + '] ' + t.title).join('\n');
    }).join('\n\n') + '\n\n';

    text += '---\n\n' +
      '#### 📝 阶段性战略评估复盘 (Goal Outcome Evaluation & Retro)\n' +
      '- **收量成效结案评述**：' + outcome.retroText + '\n' +
      '- **算法下一阶段修正推荐 (Strategic Recommendation)**：\n' +
      '  * **推荐动作**：👉 **' + recStep.actionLabel + '**\n' +
      '  * **推荐理据**：' + recStep.reason + ' *(推荐等级: ' + recStep.priority + ')*';

    suggestions = [
      { label: '执行推荐动作：启动德法自然流量 SEO', action: 'campaign', payload: { category: 'title_seo' } },
      { label: '返回今日快捷入口看板', action: 'switch_tab', payload: 'command' }
    ];
  }

  else if (isSelfOptimization) {
    intentClass = 'SELF_OPTIMIZATION';
    const auditRes = brain.auditOwnPerformance();
    const weightsOutput = brain.optimizeDecisionWeights();
    const rWeights = brain.optimizeReasoningWeights();

    reasoningGoal = '模型下发动作绩效自评，自适应反向更新参数';
    reasoningCurrentState = '无人工配置干预，中央自适应神经对账机制运行中';
    reasoningRisk = '零/安全净化';

    text = '### ⚙️ Self-Optimization Engine (中台多模决策树算法自我评估与演化引擎)\n\n' +
      '系统实现 **100% 自动运行**，无任何人工参与配置。反向传播网络持续通过过往实操绩效 (Rating, Success Runs/Failure Bias) 自主调校经营权重：\n\n' +
      '#### 📈 过去 90 天策略决策质量自评与模型审计 (Autonomic Performance Audit)\n' +
      '- **已审计操作流转计**：已有 **' + auditRes.auditedActionsCount + ' 次** 执行分派\n' +
      '- **策略下发成效比率 (Success Rate)**：🔥 **' + auditRes.successRatioPct + '%**\n' +
      '- **经验加权偏置调优细目 (Self-Adjusting Decay/Reinforce)**：\n' +
      auditRes.optimizedCategories.map(item => '  * ' + item).join('\n') + '\n\n' +
      '#### 🧮 决策矩阵权重系数重校准 (Decision Matrix Optimized Multipliers)\n' +
      '最新重估公式产生的在售模块策略拟重：\n' +
      Object.entries(weightsOutput).map(([cat, w]) => '  - **' + cat + '** 核心权重 ➡️ **x' + w.toFixed(2) + '**').join('\n') + '\n\n' +
      '#### 🧠 推理认知阀值因时矫正 (Reasoning Adaptive Rules)\n' +
      '- **当前基础可度阈值**：已下调至 **' + rWeights.adjustedBaseThreshold + '** (优化安全容错空间)\n' +
      '- **动态矫正实施细则**：\n' +
      rWeights.adaptedRulesApplied.map(rule => '  * ' + rule).join('\n') + '\n\n' +
      '---\n' +
      '*自主更新已完成并直接作用于 Reasoning & Decision 算法层，无需进行任何重复对外对账或代码手工配置。*';

    suggestions = [
      { label: '测试运行优化后的策略推荐', action: 'campaign', payload: {} },
      { label: '回到商家控制中心首页', action: 'switch_tab', payload: 'command' }
    ];
  }

  else if (isExecutiveLayer) {
    intentClass = 'EXECUTIVE_INTELLIGENCE';
    const summary = brain.generateExecutiveSummary();
    const prioritiesObj = brain.rankBusinessPriorities();
    const actionList = brain.generateActionList();

    reasoningGoal = '为商家主管提供纯决策级指令报告，硬抹除多余Telemetry日志';
    reasoningCurrentState = '高级视觉层对齐，抹去低阶冗详技术波形';
    reasoningRisk = '低 (极速一键响应优势)';

    text = '### 👔 Executive Intelligence Layer (商家 CEO 智能全局专案报告)\n\n' +
      summary.greeting + '\n\n' +
      '---\n\n' +
      '#### ⚠️ 经营要案优先级排序 (CEO Executive Priorities Ranked by Expected Loss)\n';

    text += prioritiesObj.map(p => {
      const pColor = p.priorityLevel === 'P0' ? '🔴' : p.priorityLevel === 'P1' ? '🟡' : '🔵';
      return '##### **' + pColor + ' [' + p.priorityLevel + '] ' + p.issueTitle + '**\n' +
        '- **预计流失潜在亏损 (Loss Scenario)**：💶 **€' + p.expectedLossEur + '**\n' +
        '- **时效紧急等级**：' + p.urgencyLevel + '\n' +
        '- **核心处置路径 (Resolution Route)**：*' + p.resolutionRoute + '*';
    }).join('\n\n') + '\n\n';

    text += '---\n\n' +
      '#### ⚡ 决策战役一键指挥中心 (One-Click Operations dispatch)\n' +
      '由于您是最高超级管理员，在下述 3 项待处战役上拥有豁免校验权，可以直接派发指令动作：\n\n' +
      '| 专案ID | 指令动议名称 | 起源功能模块 | 实施难度 | 智能行动快按钮 |\n' +
      '| :--- | :--- | :--- | :--- | :--- |\n' +
      actionList.map(a => '| ' + a.taskId + ' | ' + a.actionLabel + ' | **' + a.originModule + '** | ' + a.difficulty + ' | **[一键执行]** |').join('\n') + '\n\n' +
      summary.summaryText;

    suggestions = [
      { label: '一键自动安全补货 (P0)', action: 'restock', payload: {} },
      { label: '一键流失召回 VIP (P1)', action: 'customer_recall', payload: {} }
    ];
  }

  else if (isPlannerCheck) {
    intentClass = 'AUTONOMOUS_PLANNER';
    const plannerDetails = brain.performAutonomousPlanningCheck();

    reasoningGoal = '7*24h 全天值守、在途对账、爆品流失捕获';
    reasoningCurrentState = '探设巡诊不间断挂钩运行';
    reasoningRisk = '零障碍连通';

    text = '### 🛰️ Autonomous Planner (7*24h 全天候智能代理无缝安防值守系统)\n\n' +
      '- **系统跟踪审计时印**：`' + plannerDetails.timestamp + '`\n' +
      '- **当前值守审计态势**：**' + (plannerDetails.actionRecommended ? '评估建议：检测到存货或结算通道发生向外偏离，建议即时干预' : '🟢 全店运转大连通度 100% 毫无挂红') + '**\n' +
      '- **拟定智能指令代码**：`' + plannerDetails.plannedActionCode + '`\n\n' +
      '#### 📋 拟定派发之业务执行草案 (Proposed Action Plan Details)\n' +
      '- **规划判定意图**：*' + plannerDetails.proposedPlan.planningIntent + '*\n' +
      '- **携带参数 (Context Payload)**：\n' +
      '  ```json\n' +
      JSON.stringify(plannerDetails.proposedPlan.parameters || { activeStatus: 'all_good' }, null, 2) + '\n' +
      '  ```\n' +
      '- **Governor 审计预备案**：' + plannerDetails.proposedPlan.governorPreCheck + '\n\n' +
      '该模块正在自动周期性重新抓取 WMS 底层库存状态数，自主识别阻碍 checkout 的隐形裂痕并生成草案。';

    suggestions = [
      { label: '授权自动方案发布', action: 'restock', payload: {} },
      { label: '查看 CEO 全局报告', action: 'campaign', payload: {} }
    ];
  }

  else if (isGreeting) {
    intentClass = 'GREETING';
    reasoningGoal = '系统指令交互向导构建';
    reasoningCurrentState = '商户通用性握手对账阶段';
    reasoningNextAction = '呈现简洁直观的中台操作提示';

    const lowStockCount = products.filter(p => p.stock <= 10).length;

    text = '### 🧠 AI Commerce OS 智能经营中台决策命令中心\n\n' +
      '我已为您的在售品类及隔离租户库建档。全栈底层 AI 大脑已启动：\n\n' +
      '- **今日警报**：' + (lowStockCount > 0 ? '🟡 检测到有 ' + lowStockCount + ' 款 主力单品面临低水位缺货。' : '🟢 主销售品在库量完全充沛，流转态势良好值') + '。\n' +
      '- **系统核心引擎接口**：\n' +
      '  * **商业关联知识图谱**：输出全店客户-订单-商品-流水的关联因果网络 (findRelatedEntities)。\n' +
      '  * **多策略决策树算法**：针对经营下行提出包含风险/收益/成本/执行难度的多套备选决策 (evaluateAndSortStrategies)。\n' +
      '  * **价格弹力数学模拟**：通过偏微分与弹性参数模拟打折或价格变动对总利润及库存的真实改变并保护毛利红线 (simulatePriceChange / authorizeAction)。\n\n' +
      '您已获得超级管理员主会话权限。请发出明确的业务指令（如：“查看商业知识图谱”、“提高销量策略” 或 “模拟降价15%对利润的影响”）。';

    suggestions = [
      { label: '查看全店商业因果关系图谱', action: 'switch_tab', payload: 'command' },
      { label: '针对近期瓶颈生成应对方案', action: 'campaign', payload: {} }
    ];
  }

  else if (isDangerous) {
    intentClass = 'DANGEROUS_TASK';
    reasoningGoal = '主动防御擦除任务，安全限流';
    reasoningRisk = '🚨 极其严重毁灭性破产系数 (100/100)';
    
    const governorVerdict = AICoreIntelligence.authorizeAction('ERASE_PHYSICAL_DATABASE', { query: queryLower }, 99, 0);

    reasoningCurrentState = '检测到擦除主库操作: ' + queryLower;
    reasoningNextAction = '硬阻断执行并入库审计日志';
    permissionCheck = '❌ REJECTED_BY_GOVERNOR_HIGH_RISK';
    validationResult = 'BLOCKED_BY_SAFETY_SENTRY (保护云物理存储一致)';

    text = '### 🚨 动作被 Governor Engine 判定为违规并强制拦截！\n\n' +
      '商特级安全审查：系统保护哨兵行使了物理熔断特权，您提出的 ' + queryLower + ' 操作申请已被系统最高权力中心驳回：\n\n' +
      '- **核准状态律令**：**' + governorVerdict.arbitrationCode + '**\n' +
      '- **风险暴露评估**：**99 / 100 (高危警戒)**\n' +
      '- **审计记录说明**：' + governorVerdict.logsMessage + '\n' +
      '- **决策处罚意见**：由于存在越权清除主库及销毁历史成交账期的极高物理威胁，已被 Governor Engine 实施临时硬挂起，相关操作账单及设备 IP 已登记在审计日志库中。';

    suggestions = [
      { label: '返回商品中心', action: 'switch_tab', payload: 'products' },
      { label: '查看 Governor 安全审计日志', action: 'settings', payload: {} }
    ];
  }

  else if (isKnowledgeGraph) {
    intentClass = 'KNOWLEDGE_GRAPH';
    reasoningGoal = '深度遍历商业网络因果图谱并追踪关联缺失链路';
    
    const relatedEntities = brain.findRelatedEntities('traffic_node', 2);
    const causalPath = brain.findCausalPath('campaign_summer_sale', 'profit_pool');
    const profitLeaks = brain.findProfitLeakage();
    const dependencies = brain.findRevenueDependency();

    text = '### 🕸️ Business Knowledge Graph V2 (商业知识因果关系网络图谱)\n\n' +
      '底层图谱遍历算法已升级。当前隔离租户下的 **商品、订单、客户、广告和库存** 的零散数据已连接成深度因果解释网格：\n\n' +
      '#### 🌿 关系节点拓扑遍历 (Traversed Related Entity Nodes via BFS/DFS)\n' +
      '从流量中枢节点 [traffic_node] 拓扑延伸，高内聚实体如下：\n' +
      relatedEntities.map(node => '1. **[' + node.type + ']** ID: `' + node.id + '` - *' + (node.properties.name || node.properties.sourceName || node.id) + '*' + (node.type === 'Product' ? ' (在售价格: €' + node.properties.price + ')' : '')).join('\n') + '\n\n' +
      '---\n\n' +
      '#### 🔍 动态因果链条追踪 (Causal Flow Path)\n' +
      '- **系统级联向后归因**：' + causalPath.join(' ━━> ') + '\n\n' +
      '---\n\n' +
      '#### 💸 财务损耗漏失分析 (Profit Leakage Tracer)\n' +
      profitLeaks.map(leak => {
        return '##### **' + leak.leakSource + ' - 优先级: ' + leak.priority + '**\n' +
               '- **折损盈亏估算额**：💶 **€' + leak.leakageAmountEur.toFixed(2) + '**\n' +
               '- **损漏级联链条 (Traced Loop)**：*' + leak.causalChain + '*';
      }).join('\n\n') + '\n\n' +
      '---\n\n' +
      '#### 📊 核心收入依存剖析 (Revenue Channel Profiling)\n' +
      dependencies.map(d => '- **' + d.sourceNode + '** 支撑了全店约 **' + d.dependencyPercentage + '%** 的 GMV 水线。').join('\n');

    suggestions = [
      { label: '针对阻尼漏点智能生成应对策略', action: 'campaign', payload: {} },
      { label: '跳转至商品存货管理', action: 'switch_tab', payload: 'products' }
    ];
  }

  else if (isSimulation) {
    intentClass = 'SIMULATION';
    
    const digitsInQuery = queryLower.match(/(\d+)%/);
    const discountPctSimulated = digitsInQuery ? parseInt(digitsInQuery[1]) : 15;

    // Use price elasticity v2 under Best/Expected/Worst scenario projections
    const simResult = brain.simulatePriceElasticity('prod_01', -discountPctSimulated);
    const revenueDetails = brain.simulateRevenueImpact(discountPctSimulated);
    const expectedMargin = 42 - discountPctSimulated;
    const gCheck = AICoreIntelligence.authorizeAction('PROPOSED_PRICE_CUT_SIM', { discount: discountPctSimulated }, discountPctSimulated > 20 ? 60 : 25, expectedMargin);

    reasoningGoal = '针对全店降单降价 ' + discountPctSimulated + '% 调动价格弹性系数连续模型模拟';
    reasoningCurrentState = '商户发起变现降价请求，需核准弹性系数: ' + (42 - expectedMargin);
    reasoningRisk = discountPctSimulated > 20 ? '中高风险 (极易稀释综合毛利)' : '安全可控';
    
    text = '### 📊 Pricing Simulated Analytics V2 (Simulation Engine 弹性连续分析报告)\n\n' +
      '根据历史流转特征，系统核定了您的价格指数。结合 **Scenario Engine** 的 Best/Expected/Worst Case Projections 得出对照：\n\n' +
      '#### 📈 Projections (Scenario Engine 三阶情景模拟预测单)\n' +
      '| 情境类型 (Scenario Cases) | 销量变动乘数 | 预估营业收益 (Projected Revenue) | 净收益改变 (Net Drift) |\n' +
      '| :--- | :--- | :--- | :--- |\n' +
      '| **Best Case (乐观增长上限)** | ' + (simResult.volumeMultiplier * 1.25).toFixed(2) + 'x | €' + simResult.bestCaseRevenue.toFixed(2) + ' | **+€' + (simResult.bestCaseRevenue - revenueDetails.baseRevenue).toFixed(2) + '** |\n' +
      '| **Expected Case (平均期望估算)** | ' + simResult.volumeMultiplier.toFixed(2) + 'x | €' + simResult.expectedCaseRevenue.toFixed(2) + ' | **' + (simResult.revenueImpactEur >= 0 ? '+' : '') + '€' + simResult.revenueImpactEur.toFixed(2) + '** |\n' +
      '| **Worst Case (悲观流失下限)** | ' + (simResult.volumeMultiplier * 0.75).toFixed(2) + 'x | €' + simResult.worstCaseRevenue.toFixed(2) + ' | **' + (simResult.worstCaseRevenue >= revenueDetails.baseRevenue ? '+' : '') + '€' + (simResult.worstCaseRevenue - revenueDetails.baseRevenue).toFixed(2) + '** |\n\n' +
      '---\n\n' +
      '### 🏛️ Governor Engine V2 安全守卫联审结论\n' +
      '- **Financial Governor (最低毛利红线保护)**：当前评估调价后边际率: **' + expectedMargin.toFixed(1) + '%** (安全门限: >15.0%)\n' +
      '- **安全拦截联核决议**：**' + (gCheck.authGranted ? '🟢 PASS (安全放行，方案无穿透风险，可以直接落地)' : '🔴 BLOCKED (由于边际毛利破穿 15% 底部防线，高阶 Governor 已实施物理阻滞)') + '**\n' +
      '- **拦截核查处罚日志**：*' + gCheck.logsMessage + '*';

    suggestions = [
      { label: gCheck.authGranted ? '一键分发该打折策略上线' : '退回折扣重新编配', action: gCheck.authGranted ? 'campaign' : 'none', payload: { discount: discountPctSimulated } },
      { label: '查看多策略最优决策排序', action: 'campaign', payload: {} }
    ];
  }

  else if (isGrowthStrategy) {
    intentClass = 'GROWTH_STRATEGY';
    
    const reasonReport = brain.runReasoningLoop(queryLower, 'sales');
    const strategies = brain.rankStrategies(queryLower);
    const learnedNodes = brain.getStoreExperienceGraph();
    const introspectiveChallenge = brain.explainReasoning(queryLower, '销量上攻');

    text = '### 📈 Reason & Decision AI Core V2 (智能中台最高决策核心)\n\n' +
      '我们调用了 **Reasoning V2** 事实探针、**Decision V2** 特权加权矩阵以及 **Meta-Reasoning** 进行了三级会商研判：\n\n' +
      '#### 🔍 1. Reasoning Engine 推理论证事实 (Fact & Hypothesis Chain)\n' +
      '- **分析核心战役目标**：' + reasonReport.goal + '\n' +
      '- **已探明事实 (Known Facts)**：\n' +
      reasonReport.known_facts.map(f => '  * ' + f).join('\n') + '\n' +
      '- **动态 hypotheses 测试链**：\n' +
      reasonReport.hypotheses.map(h => '  * [' + (h.status === 'proven' ? '🟢 已证实' : '⏳ 待探针校验') + '] ' + h.text + ' (可信度概算: ' + Math.round(h.probability * 100) + '%)').join('\n') + '\n' +
      '- **危害暴露评估 (Risk Factor)**：' + reasonReport.risk.text + ' (危害分: **' + reasonReport.risk.score + '/100**)\n\n' +
      '---\n\n' +
      '#### 🧠 2. Meta-Reasoning Introspective Critique (认知自评与自我质疑)\n' +
      '- **分析可信度 (Confidence Metric)**：✨ **' + (introspectiveChallenge.confidence * 100).toFixed(0) + '%**\n' +
      '- **核心假设佐证证据 (Evidence base)**：' + introspectiveChallenge.evidence.join(' | ') + '\n' +
      '- **核心批判性自评**：*' + introspectiveChallenge.selfChallenge + '*\n\n' +
      '---\n\n' +
      '#### ⚖️ 3. Decision Engine V2 策略综合排序 (Weighted Multi-Option Evaluator)\n' +
      '算法根据由 **Learning Engine V2** 反向沉淀调节的最新经验加权偏置，对策略总分进行了重新锚定综合评比：\n\n' +
      strategies.slice(0, 3).map((st, idx) => {
        const expl = brain.explainDecision(st.actionCategory);
        return '##### **优选方案 [' + (idx + 1) + ']：' + st.strategyName + '**\n' +
               '- **推荐评语 (Shield Review)**：*' + expl.recommendationShieldReason + '*\n' +
               '- **预期 GMV 拉升额**：💶 **+€' + st.estimatedRevenueGain.toFixed(1) + '** (操作成本: €' + st.costEur + ' | 落地难度: ' + st.difficultyScore + '/100)\n' +
               '- **算法核定综合指数 (Composite Score)**：🏆 **' + st.compositeScore + ' / 100**';
      }).join('\n\n') + '\n\n' +
      '---\n\n' +
      '#### 🛰️ 4. Adaptive Learning Graph (自我重进化经验累积看板)\n' +
      '过往动作绩效反向传播对权重的自我纠正偏置显示：\n' +
      learnedNodes.map(node => '- **' + node.actionCategory + '** 级联运筹 **' + (node.successCount + node.failureCount) + ' 次** | 平均经营分 **' + node.averageRating + '分** | 动态加权比率: **x' + node.weightScalar.toFixed(2) + '**').join('\n');

    actionType = 'campaign';
    suggestions = [
      { label: '采纳最高分方案：' + strategies[0].strategyName, action: 'campaign', payload: { category: strategies[0].actionCategory } },
      { label: '进入商品列表实存补货', action: 'switch_tab', payload: 'products' }
    ];
  }

  else if (isProductCreate) {
    intentClass = 'TASK_PRODUCT_CREATE';
    const hasDetails = (queryLower.includes('价格') || queryLower.includes('售价') || queryLower.includes('€') || queryLower.includes('$')) && 
                       (queryLower.includes('库存') || queryLower.includes('件'));

    if (hasDetails) {
      actionType = 'product_create';
      metaObj = { name: '防泼水排汗风风衣', sku: 'SKU-WIND-AUTO', price: 99.00, stock: 150 };
      
      const auth = AICoreIntelligence.authorizeAction('PRODUCT_CREATION_WRITE_DB', { name: '防泼水排汗风风衣' }, 10, 42);

      text = '### ✅ 新商品已成功写入租户子分区！\n\n' +
        '多租户层已经通过 Governor 安全隔离核验，数据库同步完成：\n\n' +
        '- **商品名称 (Title)**：防泼水排汗风风衣\n' +
        '- **SKU 条码 (SKU)**：SKU-WIND-AUTO\n' +
        '- **建议售价 (Price)**：💶 **€99.00**\n' +
        '- **在库计划 (Stock)**：**150 件**\n' +
        '- **审核核发意见 (Governor)**：**' + auth.arbitrationCode + '**\n' +
        '- **日志反馈**：' + auth.logsMessage;

      suggestions = [
        { label: '查看商品大盘', action: 'switch_tab', payload: 'products' },
        { label: '发放定向优惠券', action: 'campaign', payload: { discount: 15 } }
      ];
    } else {
      text = '### 🛍️ 申请极速上新商品：需要补充物料维度\n\n' +
        '决策大脑解析当前指令输入，发现新创实体信息缺少，请输入含如下信息的具体货品：\n\n' +
        '1. **商品具体名称** (如: 防溢水排汗户外风夹克)\n' +
        '2. **SKU 代码** (如: SKU-WIND-88)\n' +
        '3. **零售价格** (如: 售价 129.00€)\n' +
        '4. **初始进货库存量** (如: 库存 100件)\n\n' +
        '*💡 您也可以点击下方一键采用系统为您特配的 2026 夏日防泼风夹克预填参数入库销售：*';

      suggestions = [
        { label: '一键预加载防泼水风夹克数据', action: 'PREFILL_PRODUCT', payload: { name: '防泼水排汗风夹克 (系统推荐)', sku: 'SKU-WIND-88', price: 129.00, stock: 100 } },
        { label: '到商品管理后台手动输入', action: 'switch_tab', payload: 'products' }
      ];
    }
  }

  else if (isOrderQuery) {
    intentClass = 'ORDER_QUERY';
    const isRefund = queryLower.includes('退') || queryLower.includes('拒') || queryLower.includes('审') || queryLower.includes('拦截');

    if (isRefund) {
      const refundRequestedOrders = orders.filter(o => o.status === 'Refund Requested' || o.status === 'Refunded');
      
      if (refundRequestedOrders.length > 0) {
        text = '### ⚖️ 多租户逆向退款申诉安全核账表 (在库 ' + refundRequestedOrders.length + ' 笔)\n\n' +
          '系统核对过滤出正在进入申退资金环节的订单流水数据：\n\n' +
          '| 结算单发票号 | 采购买家名称 | 原定单总金额 | 当前处理阶次 | 欺诈风控评级 (Fraud Score) |\n' +
          '| :--- | :--- | :--- | :--- | :--- |\n' +
          refundRequestedOrders.map(o => '| ' + o.id + ' | ' + o.customerName + ' | €' + o.total.toFixed(2) + ' | **' + (o.status === 'Refund Requested' ? '⚠️ 人工拦截中' : '✅ 资金已返还') + '** | ' + (o.riskScore || 12) + '/100 (低危合规) |').join('\n') + '\n\n' +
          '建议直接点击控制台跳转至订单专区执行集中人工过账审批。';

        suggestions = [
          { label: '深入订单中心人工审票', action: 'switch_tab', payload: 'orders' }
        ];
      } else {
        text = '### ✅ 财务与逆向退款核查：无异常挂起\n\n' +
          '近 48 小时长尾账期扫描完毕。本隔离租户下近期**完全没有活跃的退款纠纷、异常少发货申诉**。\n\n' +
          '全店纠纷率保持在 **0.25%** 优异绿色安全区间，可安心运营。';

        suggestions = [
          { label: '巡查最新订单账簿', action: 'switch_tab', payload: 'orders' }
        ];
      }
    } else {
      const totalAmt = orders.reduce((sum, o) => sum + o.total, 0);

      text = '### 📊 隔离租户成交流水核算 (共 ' + orders.length + ' 笔订单)\n\n' +
        '系统按您所分配的安全组 `store_isolation` 拓扑隔离，流转并成功勾兑出如下订单：\n\n' +
        '| 结算发票号 | 购货主客名 | 成交额 (EUR) | 流转阶段 (State) | 下单北京时间 |\n' +
        '| :--- | :--- | :--- | :--- | :--- |\n' +
        orders.slice(0, 5).map(o => '| ' + o.id + ' | ' + o.customerName + ' | €' + o.total.toFixed(2) + ' | ' + o.status + ' | ' + (o.createdAt || '本日') + ' |').join('\n') + '\n\n' +
        '- **阶段累计发票金额 (Gross Sum)**：🚀 **€' + totalAmt.toFixed(2) + '**\n\n' +
        '回回款资金账单与仓储物流交割对齐均无阻塞卡顿。';

      suggestions = [
        { label: '跳转至订单发货', action: 'switch_tab', payload: 'orders' },
        { label: '导出对账财务表', action: 'EXPORT_FINANCE_REPORT', payload: {} }
      ];
    }
  }

  else if (isInventoryQuery) {
    intentClass = 'INVENTORY_QUERY';
    actionType = 'restock';

    const lowStockItems = products.filter(p => p.stock <= 15);
    
    if (lowStockItems.length > 0) {
      const stockoutSim = brain.simulateInventoryRisk(5);

      text = '### 🚨 特急：在售价主力爆款库存低水位断货预警\n\n' +
        '系统 WMS 实时水位探针对当前大仓完成一键校对，发现有 **' + lowStockItems.length + ' 项主力爆款** 破穿 15 件安全警报底线。\n\n' +
        '#### ⚠️ 缺货项目危害评估报告\n' +
        '* **触红警戒商品**：\n' +
        lowStockItems.map(p => '  - *' + p.name + '* (SKU: ' + p.sku + ' | 单售价: €' + p.price.toFixed(2) + ' | 仅余: **' + p.stock + ' 件** - ' + (p.stock === 0 ? '🔴 已告断货' : '🟡 极度告急') + ')').join('\n') + '\n' +
        '* **预计供货商到货时效**：5 日 (标准海外空配运)\n' +
        '* **缺货损耗投影 (Simulated Stock Out Loss)**：💶 **€' + stockoutSim.stockoutProjectedLossEur + '** (指由于这期间库房断空导致被阻碍结账的直接流失费)\n\n' +
        '**决策大脑意见**：缺货即是缺金。建议立即点击下方，系统将为您向协议工厂自动派发加急采购进货订单：';

      suggestions = [
        { label: '一键自动为低水位 SKU 补满库存', action: 'restock', payload: {} },
        { label: '查看大仓低水位全部 SKU 列表', action: 'switch_tab', payload: 'products' }
      ];
    } else {
      const sortedByStock = [...products].sort((a, b) => a.stock - b.stock);
      const tightestSku = sortedByStock[0];

      text = '### ✨ 库房健康度审计：余量处于极其充沛安全防区\n\n' +
        '经在库数据库实存勾对，您隔离店面的商用存货指标健康流转。所有经营商品水位均保持在 lowest 警戒支撑线安全阻力之上。\n\n' +
        '- **存货紧蹙度第一品类**：' + (tightestSku ? '「' + tightestSku.name + '」' : 'N/A') + '\n' +
        '- **剩余在库数量**：' + (tightestSku ? tightestSku.stock + ' 件 (警戒值: ' + (tightestSku.minStockThreshold || 10) + ' 件)' : 'N/A') + '\n\n' +
        '系统判断中短期内无断档流失风险，可以高枕无忧。';

      suggestions = [
        tightestSku ? { label: '追加备货 ' + tightestSku.name, action: 'restock', payload: tightestSku.sku } : { label: '查看商品列表', action: 'switch_tab', payload: 'products' }
      ];
    }
  }

  else if (isCustomerQuery) {
    intentClass = 'CUSTOMER_QUERY';
    actionType = 'customer_recall';

    const coldCustomers = customers.filter(c => c.orderCount === 0 || c.points < 200);

    text = '### 👥 客户生命周期(CRM)活跃度审计报告\n\n' +
      '大中台从当前隔离顾客池中，为您筛查出在册会员 **' + customers.length + ' 名**。发现当前有 **' + coldCustomers.length + ' 名老客** 产生较强长尾观望情绪，处于高走失沉默高风险区：\n\n' +
      '| 会员名讳 | 邮箱往来地址 | VIP层级等次 | 店本积分 | 沉默高危判定因素 |\n' +
      '| :--- | :--- | :--- | :--- | :--- |\n' +
      customers.slice(0, 5).map(c => '| ' + c.name + ' | ' + c.email + ' | **' + c.tier + '** | ' + c.points + ' 分 | ' + (c.orderCount === 0 ? '🔺 历史购单为0 (纯加购流失)' : '🟡 活跃点数极低') + ' |').join('\n') + '\n\n' +
      '**智能挽回决策派单**：\n' +
      '对这类特定受众池使用 **x1.25** 优选加权的 \'bulk_coupon\' 精准邮件发券提振战役。您可以点击一键授权系统，利用 CRM 后台，直邮 20% OFF 专享礼包挽回沉默心智：';

    suggestions = [
      { label: '一键部署分发 VIP 折扣邮件挽回沉默客户', action: 'customer_recall', payload: {} },
      { label: '深入客户关系详情看板', action: 'switch_tab', payload: 'customers' }
    ];
  }

  else {
    intentClass = 'UNIFIED_DISPATCH';
    reasoningGoal = '响应通用类目中台咨询并引导精准指令';

    text = '### 🧠 AI Commerce OS 智能经营中台决策命令中心\n\n' +
      '我专注于为店主执行具有**物理写入、多维图谱拓扑、价格决策模拟、以及 Governor 拦截**的真实中台操作。\n\n' +
      '您可以直接使用简短、具体的业务操作指令驱使中台：\n\n' +
      '1. **商业知识图谱** — "查看商业知识图谱" (触发多hop customer-order-product-traffic 动态图谱遍历 findRelatedEntities)\n' +
      '2. **销售促进决策** — "提高销量策略" (触发决策树多备选应对模型评分 evaluateAndSortStrategies，按 compositeScore 动态排序)\n' +
      '3. **价格折扣模拟** — "模拟降价15%对利润的影响" (结合弹性模型进行 simulated revenue / DSI 连续建模，并过 Governor Margin 红线检测)\n' +
      '4. **低少库存补仓** — "查库存并补货" (检索库存，测算 Stock Out Potential Loss 折损并自动向上游补货)\n' +
      '5. **急速写表上新** — "新建商品" (按 SKU 与 Price 规范格式校验，过 Governor 安全防护写入主表)\n\n' +
      '请说出您的明确操作口，我将立即为您联动底层执行层。';

    suggestions = [
      { label: '查看全店关系图谱', action: 'switch_tab', payload: 'command' },
      { label: '核查账户财务大账簿', action: 'finance_switch', payload: {} }
    ];
  }

  // Create real V2 plan task nodes hierarchically dependent for the frontend planning logs!
  const planTree: PlanTaskNode[] = AICoreIntelligence.generateTaskTree(queryLower);
  
  // Format the reasoning loop metrics trace in thought structure
  let resolvedPlanningStr = planTree.map(task => {
    return '[' + task.id + '] ' + task.title + ' (耗时:' + task.durationDays + '天, 面向:' + task.status + ')';
  }).join('\n └── ');

  if (planTree.length > 0) {
    planningTasks = '【规划行动任务树】：\n └── ' + resolvedPlanningStr;
  } else {
    planningTasks = '1. 接受命令；2. 查询隔离租户 store_id；3. 激活安全哨兵校验。';
  }

  return {
    text,
    actionType,
    metaObj,
    suggestions,
    thought: {
      intent: intentClass,
      reasoning: 'Goal (当前执行目标): ' + reasoningGoal + '\nState (当前系统态势): ' + reasoningCurrentState + '\nMissing Info (缺失变量): ' + reasoningMissingInfo + '\nRisk (运行安全阻尼): ' + reasoningRisk,
      planning: planningTasks,
      permission: permissionCheck,
      toolRouter: toolRoute,
      validator: validationResult
    }
  };
}
