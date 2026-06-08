import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Terminal, 
  Sparkles, 
  Search, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Play, 
  ChevronRight, 
  TrendingUp, 
  Plus, 
  Loader2,
  PhoneCall,
  DollarSign,
  Package,
  FileText,
  UserCheck
} from 'lucide-react';
import { IndustryType, ProductItem, OrderItem, CustomerItem } from '../types';

interface AICommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIndustry: IndustryType;
  products: ProductItem[];
  orders: OrderItem[];
  customers: CustomerItem[];
  onUpdateCustomers: (updated: CustomerItem[]) => void;
  addLog: (agent: string, action: string, details: string, type: 'info' | 'success' | 'warning' | 'error' | 'tool') => void;
  onSwitchTab: (tab: any) => void;
  onTriggerAddProductOpen: () => void;
  onBulkRestock: (sku: string, amount: number) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: any) => void;
  onAddNewProduct: (name: string, sku: string, price: number, stock: number) => void;
}

type CommandType = 
  | 'idle'
  | 'sales' 
  | 'orders' 
  | 'low_stock' 
  | 'profit' 
  | 'create_product' 
  | 'create_purchase' 
  | 'create_campaign' 
  | 'refunds' 
  | 'shipping' 
  | 'customers'
  | 'today_revenue'
  | 'generate_today_invoices'
  | 'payout_withdraw';

export default function AICommandCenter({
  isOpen,
  onClose,
  selectedIndustry,
  products,
  orders,
  customers,
  onUpdateCustomers,
  addLog,
  onSwitchTab,
  onTriggerAddProductOpen,
  onBulkRestock,
  onUpdateOrderStatus,
  onAddNewProduct
}: AICommandCenterProps) {
  const [query, setQuery] = useState('');
  const [activeCommand, setActiveCommand] = useState<CommandType>('idle');
  const [commandLogs, setCommandLogs] = useState<{ id: string; text: string; type: 'cmd' | 'resp' | 'success' | 'error' }[]>([]);

  // Live financial metrics for AI query center
  const calculatedSalesToday = useMemo(() => {
    const todayTotal = orders.reduce((sum, o) => sum + o.total, 0);
    return Math.round(todayTotal * 100) / 100 || 1280.00;
  }, [orders]);

  const ordersCount = orders.length || 12;
  const pendingInvoicesCount = orders.length || 8;
  const withdrawableAmount = 426.55;
  
  // Create product local state inside drawer
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodPrice, setProdPrice] = useState(199);
  const [prodStock, setProdStock] = useState(100);

  // Create campaign local state
  const [campName, setCampName] = useState('');
  const [campStart, setCampStart] = useState('2026-06-08');
  const [campEnd, setCampEnd] = useState('2026-06-15');

  // Trigger default logs on first open
  useEffect(() => {
    if (isOpen) {
      setCommandLogs([
        { id: '1', text: 'AI安全网关：系统控制命令通道已加密开启。', type: 'success' },
        { id: '2', text: '请输入操作命令，或直接点击下方快捷按钮执行。', type: 'resp' }
      ]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Search filter words & action execution router
  const executeCommand = (cmdKey: CommandType, labelText: string) => {
    setActiveCommand(cmdKey);
    const time = new Date().toTimeString().split(' ')[0];
    
    // Append standard tracking logs
    setCommandLogs(prev => [
      ...prev,
      { id: Date.now().toString() + '-cmd', text: `> ${labelText}`, type: 'cmd' }
    ]);

    addLog('AI Command Center', 'Execute Direct Command', `Instruction requested: [${labelText}]`, 'tool');

    // Logic router based on core industry context and explicit command requests
    switch (cmdKey) {
      case 'create_product':
        onSwitchTab('command');
        // Pre-populate input defaults
        setProdName('');
        setProdSku('SKU-' + selectedIndustry[0].toUpperCase() + Math.floor(100 + Math.random() * 900));
        setProdPrice(99.9);
        setProdStock(80);
        break;
      case 'create_purchase':
        break;
      case 'create_campaign':
        setCampName(selectedIndustry === 'retail' ? '夏季服饰首发大促' : '特惠菜品闪电营销');
        break;
      case 'today_revenue':
        setCommandLogs(prev => [
          ...prev,
          { id: Date.now().toString() + '-resp', text: '已极速获取最新今日营业额财报数据。您可以直接查看并点击快捷操作按钮。', type: 'resp' }
        ]);
        break;
      case 'generate_today_invoices':
        setCommandLogs(prev => [
          ...prev,
          { id: Date.now().toString() + '-resp', text: `已就绪今日待建发票草盘。共计 ${pendingInvoicesCount} 笔完结对公交易，可一键完成开票。`, type: 'resp' }
        ]);
        break;
      case 'payout_withdraw':
        setCommandLogs(prev => [
          ...prev,
          { id: Date.now().toString() + '-resp', text: `资金清分成功，当前可提现总额为 €${withdrawableAmount.toFixed(2)}。请一键发起对公 SEPA 转账结算。`, type: 'resp' }
        ]);
        break;
      default:
        break;
    }
  };

  // Human typed search parser
  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const trimmed = query.trim();
    setQuery('');

    // Local key term semantic map
    if (trimmed.includes('今天营业额') || trimmed.includes('营业额') || trimmed.includes('今天收入') || trimmed.includes('今日收入')) {
      executeCommand('today_revenue', trimmed);
    } else if (trimmed.includes('生成今天发票') || trimmed.includes('生成发票') || trimmed.includes('全部生成发票')) {
      executeCommand('generate_today_invoices', trimmed);
    } else if (trimmed.includes('提现') || trimmed.includes('提款') || trimmed.includes('钱包提现')) {
      executeCommand('payout_withdraw', trimmed);
    } else if (trimmed.includes('销售') || trimmed.includes('销售额') || trimmed.includes('今日销售')) {
      executeCommand('sales', trimmed);
    } else if (trimmed.includes('订单') || trimmed.includes('今日订单')) {
      executeCommand('orders', trimmed);
    } else if (trimmed.includes('库存') || trimmed.includes('库存不足')) {
      executeCommand('low_stock', trimmed);
    } else if (trimmed.includes('利润') || trimmed.includes('查看利润')) {
      executeCommand('profit', trimmed);
    } else if (trimmed.includes('商品') || trimmed.includes('创建商品')) {
      executeCommand('create_product', trimmed);
    } else if (trimmed.includes('采购') || trimmed.includes('采购单') || trimmed.includes('创建采购单')) {
      executeCommand('create_purchase', trimmed);
    } else if (trimmed.includes('营销') || trimmed.includes('活动') || trimmed.includes('营销活动')) {
      executeCommand('create_campaign', trimmed);
    } else if (trimmed.includes('退款') || trimmed.includes('退款订单')) {
      executeCommand('refunds', trimmed);
    } else if (trimmed.includes('待发') || trimmed.includes('发货') || trimmed.includes('待发货')) {
      executeCommand('shipping', trimmed);
    } else if (trimmed.includes('加分') || trimmed.includes('积分奖励') || trimmed.includes('赠送积分') || (trimmed.includes('积分') && (trimmed.includes('奖') || trimmed.includes('加') || trimmed.includes('送')))) {
      setCommandLogs(prev => [
        ...prev,
        { id: Date.now().toString() + '-cmd', text: `> ${trimmed}`, type: 'cmd' },
        { id: Date.now().toString() + '-resp', text: `⚠️ 根据企业合规审计规则，AI 自动批量加分功能已停用（作为后续 AI 联合流转组件预留）。系统已自动跳转至商家控制中心·客户中心，请点击名单右侧的「积分」按钮，由管理员手动输入变更分量。`, type: 'info' }
      ]);
      setActiveCommand('customers');
    } else if (trimmed.includes('客户') || trimmed.includes('排行') || trimmed.includes('客户排行')) {
      executeCommand('customers', trimmed);
    } else {
      // Fallback
      setCommandLogs(prev => [
        ...prev,
        { id: Date.now().toString() + '-cmd', text: `> ${trimmed}`, type: 'cmd' },
        { id: Date.now().toString() + '-resp', text: `⚠️ 校验到不满足系统支持的命令。支持快捷执行 and 模糊匹配销售、订单、库存、利润等指令。`, type: 'error' }
      ]);
    }
  };

  // Helper selectors for operational stats
  const lowStockItems = products.filter(p => p.stock <= p.minStockThreshold);
  const refundRequestedOrders = orders.filter(o => o.status === 'Refund Requested');
  const pendingShippingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'AI Confirmed');

  if (!isOpen) return null;

  return (
    <div 
      id="ai-cmd-drawer" 
      className="w-[420px] bg-slate-900 border-l border-slate-800 h-full flex flex-col shrink-0 overflow-hidden text-slate-100"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-white tracking-widest tracking-tight">AI命令中心</h3>
            <p className="text-[10px] text-slate-500 font-mono">SYSTEM INTEGRITY EXECUTIVE SHELL</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

        {/* Action log flow stream (Shows active command state instructions) */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 max-h-[140px] overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1">
          {commandLogs.map((log) => (
            <div key={log.id} className="leading-relaxed">
              {log.type === 'cmd' && <span className="text-indigo-400 font-semibold">{log.text}</span>}
              {log.type === 'resp' && <span className="text-slate-350">{log.text}</span>}
              {log.type === 'success' && <span className="text-emerald-400 font-medium">✓ {log.text}</span>}
              {log.type === 'error' && <span className="text-rose-400 font-medium">{log.text}</span>}
            </div>
          ))}
        </div>

        {/* Dynamic Context Rendering Panel (Outputs clear stats lists tables) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Default / idle welcome panel */}
          {activeCommand === 'idle' && (
            <div className="text-center py-8 space-y-3">
              <Sparkles className="w-10 h-10 text-indigo-400 mx-auto animate-pulse" />
              <div className="space-y-1">
                <p className="text-xs text-slate-205 font-bold">即时操作指令中心</p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                  本指令中心是直达各系统数据底层的最高物理命令权限台。
                </p>
              </div>
            </div>
          )}

          {/* AI Command Center: Today's Revenue */}
          {activeCommand === 'today_revenue' && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4 text-left animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] text-[#07C2E3] font-bold uppercase tracking-wider font-mono">今日营业额 / Today's Net</span>
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-black font-sans">LIVE REPORT</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-normal">今日营业额</span>
                  <span className="text-2xl font-black font-mono text-[#07C2E3]">€{calculatedSalesToday.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-850">
                    <span className="text-[9.5px] text-slate-500 block">今日成交订单</span>
                    <span className="text-sm font-bold font-mono text-white">{ordersCount} 笔已支付</span>
                  </div>
                  <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-850">
                    <span className="text-[9.5px] text-slate-500 block">待发送发票</span>
                    <span className="text-sm font-bold font-mono text-amber-500">{pendingInvoicesCount} 笔待处理</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { onSwitchTab('orders'); onClose(); }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-lg text-[10px] select-none transition-all cursor-pointer text-center border-none"
                  >
                    查看订单
                  </button>
                  <button
                    type="button"
                    onClick={() => { onSwitchTab('finance'); onClose(); }}
                    className="flex-1 bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-slate-950 font-black py-2 rounded-lg text-[10px] select-none transition-all cursor-pointer border-none text-center"
                  >
                    生成发票
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Command Center: Generate Today's Invoices */}
          {activeCommand === 'generate_today_invoices' && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4 text-left animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] text-[#07C2E3] font-bold uppercase tracking-wider font-mono">批量对公建票 / Auto Billing</span>
                <span className="text-[9px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded font-black font-sans">PENDING STATE</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-normal">待生成草案总计</span>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black font-mono text-white">{pendingInvoicesCount} 笔待开单</span>
                    <span className="text-sm font-black font-mono text-[#07C2E3]">€{calculatedSalesToday.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-slate-900/40 p-2.5 rounded text-[10px] text-slate-450 border border-slate-850 leading-relaxed font-mono">
                  所有买家注册信息（VAT编号、SEPA清算号、企业妥投账单信箱）已自动对照、就绪。无需重复输入任何账户要素。
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addLog('Invoice Center', '批量开具对公发票', `自动合并对账：已为今日 ${pendingInvoicesCount} 笔完结交易极速生成合规 PDF 欧盟商业发票草案并存入财务台账。总销金额：€${calculatedSalesToday.toFixed(2)}`, 'success');
                    setCommandLogs(prev => [...prev, { id: Date.now().toString(), text: `成功！已为您自动创建并核销 ${pendingInvoicesCount} 张合规对公草票，并入账。`, type: 'success' }]);
                    setActiveCommand('idle');
                    onSwitchTab('finance');
                    onClose();
                  }}
                  className="w-full bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-slate-950 font-black py-2.5 rounded-lg text-xs transition-all cursor-pointer border-none text-center"
                >
                  全部生成
                </button>
              </div>
            </div>
          )}

          {/* AI Command Center: Withdraw Payout */}
          {activeCommand === 'payout_withdraw' && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4 text-left animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] text-[#07C2E3] font-bold uppercase tracking-wider font-mono">SEPA 资金提现 / Payout Ledger</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-black font-sans">SEPA INSTANT</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] text-slate-500 block font-normal">可提现余额 (EUR)</span>
                  <span className="text-2xl font-black font-mono text-[#07C2E3]">€{withdrawableAmount.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-slate-900/30 border border-slate-850 rounded-lg text-[10px] leading-relaxed text-slate-350">
                  <span className="font-bold text-slate-400 block mb-0.5">默认清算目的地：</span>
                  <span className="font-mono text-white block truncate">BNP Paribas SA (FR76 **** **** **** 8920)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addLog('Payout Service', '结算全额提现申请', `已发起 SEPA 实时入账到法国 BNP Paribas SA 账户。金额：€${withdrawableAmount.toFixed(2)} 账期实时清分中。`, 'success');
                    setCommandLogs(prev => [...prev, { id: Date.now().toString(), text: `已向绑定的法国 BNP Paribas 提现全部余额 €${withdrawableAmount.toFixed(2)}。预计 1 分钟内 SEPA 实时到账！`, type: 'success' }]);
                    setActiveCommand('idle');
                    onSwitchTab('finance');
                    onClose();
                  }}
                  className="w-full bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-slate-950 font-black py-2.5 rounded-lg text-xs transition-all cursor-pointer border-none text-center"
                >
                  全部提现
                </button>
              </div>
            </div>
          )}

          {/* Core 命令 1:今日销售 */}
          {activeCommand === 'sales' && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">指令执行结果: 今日销售</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold font-mono">REALTIME LIVE</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-500 font-bold block">销售总额</span>
                  <span className="text-base font-bold font-mono text-emerald-400">¥ 12,839.00</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-500 font-bold block">订单总数</span>
                  <span className="text-base font-bold font-mono text-white">182 笔</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-500 font-bold block">整体利润率</span>
                  <span className="text-base font-bold font-mono text-indigo-300">42.8%</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-500 font-bold block">客单价</span>
                  <span className="text-base font-bold font-mono text-indigo-200">¥ 70.54</span>
                </div>
              </div>
              <button 
                onClick={() => { onSwitchTab('command'); onClose(); }} 
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg text-[10px] uppercase font-mono transition-colors"
              >
                进入全局控制台验证详细走势
              </button>
            </div>
          )}

          {/* Core 命令 2: 今日订单 */}
          {activeCommand === 'orders' && (
            <div className="space-y-3">
              <span className="text-[10px] text-indigo-400 font-mono font-bold block uppercase tracking-wider">指令执行结果: 今日最新订单 (Top 5)</span>
              <div className="bg-slate-950/60 border border-slate-850 rounded-xl overflow-hidden">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-850">
                      <th className="p-2 font-bold">客户</th>
                      <th className="p-2 font-bold text-right">金额</th>
                      <th className="p-2 font-bold text-center">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                        <td className="p-2 font-normal text-slate-200 truncate max-w-[120px]">{ord.customerName}</td>
                        <td className="p-2 text-right font-bold text-emerald-400">¥ {ord.total.toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            ord.status === 'Refunded' ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/15 text-indigo-300'
                          }`}>{ord.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button 
                onClick={() => { onSwitchTab('command'); onClose(); }} 
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg text-[10px] font-mono transition-colors"
              >
                查看全部 {orders.length} 笔订单
              </button>
            </div>
          )}

          {/* Core 命令 3: 库存不足 */}
          {activeCommand === 'low_stock' && (
            <div className="space-y-2">
              <span className="text-[10px] text-red-400 font-mono font-bold block uppercase tracking-wider">指令执行结果: 缺货/低库存清单</span>
              
              {lowStockItems.length === 0 ? (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center text-[11px] text-emerald-400 font-bold">
                  ✓ 系统当前运作良性。无任何商品达到预警阀限值下限。
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-slate-850 rounded-xl overflow-hidden">
                  <table className="w-full text-left font-mono text-[10px]">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-850">
                        <th className="p-2.5 font-bold">商品名称</th>
                        <th className="p-2.5 font-bold">库存</th>
                        <th className="p-2.5 font-bold text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.map((prod) => (
                        <tr key={prod.id} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                          <td className="p-2.5 text-slate-200 font-medium truncate max-w-[150px]">{prod.name}</td>
                          <td className="p-2.5 text-red-400 font-bold">{prod.stock}件</td>
                          <td className="p-2.5 text-center">
                            <button 
                              onClick={() => {
                                onBulkRestock(prod.sku, 50);
                                addLog('Supplier Broker', 'Quick Stock Reorder', `Approved 50 replenishment for SKU: ${prod.sku}`, 'success');
                              }}
                              className="bg-indigo-650 hover:bg-indigo-600 active:scale-95 text-white font-bold px-2 py-1 rounded text-[9px] transition-all cursor-pointer"
                            >
                              一键补货50件
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Core 命令 4: 查看利润 */}
          {activeCommand === 'profit' && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-[10px] text-indigo-400 font-mono font-bold block uppercase tracking-wider">指令执行结果: 商家企业利润分析</span>
              <div className="space-y-2">
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">主营业务收入:</span>
                  <span className="font-mono text-emerald-400 font-bold">¥ 389,200.00</span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">供应链采购成本:</span>
                  <span className="font-mono text-slate-300">¥ 186,400.00</span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">AI 多Agent算力支出:</span>
                  <span className="font-mono text-indigo-400 font-semibold">¥ 2,830.00</span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">渠道推广支出:</span>
                  <span className="font-mono text-slate-300">¥ 45,900.00</span>
                </div>
                <div className="flex justify-between text-xs py-2 bg-slate-900 rounded p-2 border border-slate-850">
                  <span className="text-white font-bold">预计税后纯利润:</span>
                  <span className="font-mono text-emerald-400 font-black text-sm">¥ 154,070.00</span>
                </div>
              </div>
            </div>
          )}

          {/* Core 命令 5: 创建商品 */}
          {activeCommand === 'create_product' && (
            <div className="bg-slate-950/60 border border-indigo-900/30 rounded-xl p-4 space-y-3">
              <span className="text-[10px] text-indigo-400 font-mono font-bold block uppercase tracking-wider">指令执行: 创建新商品并同步至SaaS系统</span>
              
              <div className="space-y-2 font-mono text-xs text-slate-300">
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">商品标题 / Title</label>
                  <input 
                    type="text" 
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="例如：2026冬季高光尼龙防风羽绒服"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs focus:border-indigo-500 font-mono text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">独立 SKU 标识</label>
                    <input 
                      type="text" 
                      value={prodSku}
                      onChange={(e) => setProdSku(e.target.value)}
                      placeholder="SKU-JN19"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs focus:border-indigo-500 font-mono text-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">建议零售单价 (¥)</label>
                    <input 
                      type="number" 
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs focus:border-indigo-500 font-mono text-white text-[11px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">初始上架库存量 (件)</label>
                  <input 
                    type="number" 
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs focus:border-indigo-500 font-mono text-white text-[11px]"
                  />
                </div>

                <button 
                  onClick={() => {
                    if (!prodName.trim() || !prodSku.trim()) {
                      alert('请填写完整的商品名称与SKU！');
                      return;
                    }
                    onAddNewProduct(prodName, prodSku, prodPrice, prodStock);
                    addLog('AI Command Center', 'Manual Command Creation', `Directly loaded new Product Catalog SKU: ${prodSku}`, 'success');
                    setCommandLogs(prev => [...prev, { id: Date.now().toString(), text: `商品 SKU: ${prodSku} 已直接物理注入并同步。`, type: 'success' }]);
                    setActiveCommand('idle');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-550 text-white font-bold py-2.5 rounded-lg text-xs tracking-wider transition-all cursor-pointer"
                >
                  确认物理创建并同步 (Publish Product)
                </button>
              </div>
            </div>
          )}

          {/* Core 命令 6: 创建采购单 */}
          {activeCommand === 'create_purchase' && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-[10px] text-indigo-400 font-mono font-bold block uppercase tracking-wider">指令执行: 创建并分发上游供应链采购需求单</span>
              
              <div className="font-mono text-xs text-slate-350 space-y-3">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-850 space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-white">
                    <span>建议采购缺货商品:</span>
                    <span className="text-indigo-400">共 {lowStockItems.length} 款物料</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-normal">
                    根据目前仓储实况，推荐按最高标准进行物料分发与备货控制。
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-left">
                  <div className="bg-slate-900/40 p-2.5 rounded border border-slate-850">
                    <span className="text-slate-500 block">建议采购总量:</span>
                    <span className="text-xs font-bold text-slate-205">Total: 450 件</span>
                  </div>
                  <div className="bg-slate-900/40 p-2.5 rounded border border-slate-850">
                    <span className="text-slate-500 block">推荐供应商渠道:</span>
                    <span className="text-xs font-bold text-emerald-400">战略签约一级供货商</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    lowStockItems.forEach(item => {
                      onBulkRestock(item.sku, 100);
                    });
                    addLog('Supplier Broker', 'Bulk Restock Confirmed', `Supplying raw inventory for all low stock items. All channels now safe.`, 'success');
                    setCommandLogs(prev => [...prev, { id: Date.now().toString(), text: '采购定单已发送给供应商，库存已批量补货至安全线。', type: 'success' }]);
                    setActiveCommand('idle');
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-2.5 rounded-lg text-xs transition-all cursor-pointer"
                >
                  一键确认生成并分发采购单
                </button>
              </div>
            </div>
          )}

          {/* Core 命令 7: 创建营销活动 */}
          {activeCommand === 'create_campaign' && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-[10px] text-indigo-400 font-mono font-bold block uppercase tracking-wider">指令执行: 策划智能流营销活动方案</span>
              
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">营销活动主名称</label>
                  <input 
                    type="text" 
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs focus:border-indigo-500 font-mono text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">开始时间</label>
                    <input 
                      type="date" 
                      value={campStart}
                      onChange={(e) => setCampStart(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-[11px] text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">结束时间</label>
                    <input 
                      type="date" 
                      value={campEnd}
                      onChange={(e) => setCampEnd(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-[11px] text-white"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (!campName.trim()) return;
                    addLog('AI Command Center', 'Automated Offer Deployed', `Auto-injected discount codes matching campaign: "${campName}". Syncing metadata to shop headers.`, 'success');
                    setCommandLogs(prev => [...prev, { id: Date.now().toString(), text: `营销活动 "${campName}" 已在全服部署，优惠券流配置完毕。`, type: 'success' }]);
                    setActiveCommand('idle');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-550 text-white font-bold py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  立即发布活动至各渠道接口
                </button>
              </div>
            </div>
          )}

          {/* Core 命令 8: 查看退款订单 */}
          {activeCommand === 'refunds' && (
            <div className="space-y-2">
              <span className="text-[10px] text-rose-400 font-mono font-bold block uppercase tracking-wider">指令执行结果: 退款维权申请控制表</span>
              
              {refundRequestedOrders.length === 0 ? (
                <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl text-center text-[10px] text-slate-400 leading-normal">
                  保持健康。没有收到任何来自第三方的恶意纠纷或退款纠纷投诉。
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-slate-850 rounded-xl overflow-hidden">
                  <table className="w-full text-left font-mono text-[10px]">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-850">
                        <th className="p-2 font-bold">订单客户</th>
                        <th className="p-2 font-bold">维权金额</th>
                        <th className="p-2 font-bold text-center">风险分</th>
                        <th className="p-2 font-bold text-center">审批</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refundRequestedOrders.map((ord) => (
                        <tr key={ord.id} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                          <td className="p-2 text-slate-200">
                            <span className="block font-bold truncate max-w-[100px]">{ord.customerName}</span>
                            <span className="text-[8px] text-slate-500">{ord.id}</span>
                          </td>
                          <td className="p-2 text-rose-400 font-bold text-[11px]">¥ {ord.total.toFixed(2)}</td>
                          <td className="p-2 text-center">
                            <span className={`px-1 py-0.2 rounded font-bold ${
                              ord.riskScore > 60 ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>{ord.riskScore}%</span>
                          </td>
                          <td className="p-2 flex items-center justify-center gap-1">
                            <button 
                              onClick={() => {
                                onUpdateOrderStatus(ord.id, 'Refunded');
                                addLog('Finance Audit API', 'Refund Issued Approved', `Successfully refunded for user: ${ord.customerName}`, 'warning');
                                setCommandLogs(prev => [...prev, { id: Date.now().toString(), text: `订单: ${ord.id} 已执行原路极速退款。`, type: 'success' }]);
                              }}
                              className="bg-rose-500 hover:bg-rose-600 font-bold px-1.5 py-0.5 rounded text-[8px] text-white cursor-pointer"
                            >
                              同意
                            </button>
                            <button 
                              onClick={() => {
                                onUpdateOrderStatus(ord.id, 'AI Confirmed');
                                addLog('AI Guard Security', 'Refund Dispute Declined', `Declined potentially abusive claim: ${ord.id}`, 'error');
                                setCommandLogs(prev => [...prev, { id: Date.now().toString(), text: `维权已被驳回，已重归安全流程。`, type: 'error' }]);
                              }}
                              className="bg-slate-800 hover:bg-slate-700 font-bold px-1.5 py-0.5 rounded text-[8px] text-slate-300 cursor-pointer"
                            >
                              驳回
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Core 命令 9: 查看待发货 */}
          {activeCommand === 'shipping' && (
            <div className="space-y-2">
              <span className="text-[10px] text-indigo-400 font-mono font-bold block uppercase tracking-wider">指令执行结果: 待处理发货物流单据</span>
              
              {pendingShippingOrders.length === 0 ? (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center text-[10px] text-emerald-400 font-bold leading-normal">
                  ✓ 订单全部履约完毕，没有未处理的发货工单。
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-slate-850 rounded-xl overflow-hidden">
                  <table className="w-full text-left font-mono text-[10px]">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-850">
                        <th className="p-2.5 font-bold">订单ID / 客户</th>
                        <th className="p-2.5 font-bold">包裹金额</th>
                        <th className="p-2.5 text-center font-bold">快捷处理</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingShippingOrders.map((ord) => (
                        <tr key={ord.id} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                          <td className="p-2.5">
                            <span className="block font-bold text-slate-200 truncate max-w-[120px]">{ord.customerName}</span>
                            <span className="text-[8px] text-slate-500">{ord.id}</span>
                          </td>
                          <td className="p-2.5 text-slate-300 font-mono font-bold">¥ {ord.total.toFixed(2)}</td>
                          <td className="p-2.5 text-center">
                            <button 
                              onClick={() => {
                                onUpdateOrderStatus(ord.id, 'Shipped');
                                addLog('Logistics Operator', 'Dispatched Shipment', `Passed parcel to global express courier network for order ${ord.id}`, 'success');
                                setCommandLogs(prev => [...prev, { id: Date.now().toString(), text: `订单: ${ord.id} 已生成运单并派送 DHL 物流。`, type: 'success' }]);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold px-2 py-1 rounded text-[9px] transition-colors cursor-pointer"
                            >
                              一键发货DHL
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Core 命令 10: 查看客户列表 / VIP 客户列表 */}
          {activeCommand === 'customers' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#07C2E3] font-sans font-bold block uppercase tracking-wider">系统推荐 VIP 客户高价值档案 (Top 5)</span>
                <span className="text-[9px] text-slate-500">说明: 调分对账请前往客户中心执行</span>
              </div>
              
              <div className="bg-slate-950/60 border border-slate-850 rounded-xl overflow-hidden">
                <table className="w-full text-left font-sans text-[11px]">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-850 text-[10px]">
                      <th className="p-2.5 font-bold">客户名单与层级</th>
                      <th className="p-2.5 font-bold">累计成交</th>
                      <th className="p-2.5 font-bold text-center">累计评分</th>
                      <th className="p-2.5 font-bold text-right pr-4">最后下单时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers && customers.length > 0 ? (
                      [...customers]
                        .sort((a, b) => b.totalSpend - a.totalSpend)
                        .slice(0, 5)
                        .map((cust, index) => {
                          const medals = ["🥇", "🥈", "🥉", "④", "⑤"];
                          return (
                            <tr key={cust.id} className="border-b border-slate-900/60 hover:bg-slate-900/30 text-slate-200">
                              <td className="p-2.5">
                                <div className="font-bold flex items-center gap-1.5">
                                  <span>{medals[index] || `${index + 1}`}</span>
                                  <span>{cust.name}</span>
                                </div>
                                <div className="text-[9px] text-slate-500 font-mono">{cust.id} · {cust.tier}</div>
                              </td>
                              <td className="p-2.5 font-bold text-[#07C2E3]">
                                ${cust.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold text-amber-500">
                                {cust.points} 分
                              </td>
                              <td className="p-2.5 text-right font-mono text-slate-400 text-[10px] pr-4">
                                {cust.lastOrderAt || cust.createdAt.slice(0, 10)}
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500 text-xs">
                          暂无客户记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Command input form area */}
        <form 
          id="ai-cmd-input-form" 
          onSubmit={handleQuerySubmit}
          className="p-4 bg-slate-950 border-t border-slate-800 space-y-4"
        >
          {/* Quick command buttons cluster directly matching visual references */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider font-mono">快捷指令执行器 / Executive Shortcuts</span>
            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
              <button 
                type="button"
                onClick={() => executeCommand('sales', '今日销售')}
                className="bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                📊 今日销售
              </button>
              <button 
                type="button"
                onClick={() => executeCommand('orders', '今日订单')}
                className="bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                📦 今日订单
              </button>
              <button 
                type="button"
                onClick={() => executeCommand('today_revenue', '今天营业额')}
                className="bg-slate-900 hover:bg-slate-[#07C2E3]/20 hover:border-[#07C2E3] active:scale-95 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                📊 今天营业额
              </button>
              <button 
                type="button"
                onClick={() => executeCommand('generate_today_invoices', '生成今天发票')}
                className="bg-slate-900 hover:bg-slate-[#07C2E3]/20 hover:border-[#07C2E3] active:scale-95 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                🧾 生成今天发票
              </button>
              <button 
                type="button"
                onClick={() => executeCommand('payout_withdraw', '提现')}
                className="bg-slate-900 hover:bg-slate-[#07C2E3]/20 hover:border-[#07C2E3] active:scale-95 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                💳 提现转账
              </button>
              <button 
                type="button"
                onClick={() => executeCommand('low_stock', '库存不足')}
                className="bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                ⚠️ 库存不足
              </button>
              <button 
                type="button"
                onClick={() => executeCommand('profit', '查看利润')}
                className="bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                💰 查看利润
              </button>
              <button 
                type="button"
                onClick={() => executeCommand('create_product', '创建商品')}
                className="bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                👕 创建商品
              </button>
              <button 
                type="button"
                onClick={() => executeCommand('create_purchase', '创建采购单')}
                className="bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                🛒 创建采购单
              </button>
              <button 
                type="button"
                onClick={() => executeCommand('create_campaign', '创建营销活动')}
                className="bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                📢 创建营销活动
              </button>
              <button 
                type="button"
                onClick={() => executeCommand('refunds', '查看退款订单')}
                className="bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                ↩ 查看退款订单
              </button>
              <button 
                type="button"
                onClick={() => executeCommand('shipping', '查看待发货')}
                className="bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                🚚 查看待发货
              </button>
              <button 
                type="button"
                onClick={() => executeCommand('customers', '查看客户排行')}
                className="bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 px-2 py-1 rounded transition-all cursor-pointer select-none"
              >
                🏆 查看客户排行
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800 w-full shrink-0"></div>

          {/* Styled search input shell */}
          <div className="relative">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="请输入操作命令 (例如: 今日销售)..."
              className="w-full bg-slate-900 text-slate-100 border border-slate-800 rounded-xl pl-4 pr-10 py-3 text-xs placeholder-slate-500 hover:border-slate-750 focus:outline-none focus:border-indigo-600 transition-all font-mono"
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Micro audit logging telemetry footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-900 flex justify-between items-center text-[8px] font-mono text-slate-600">
          <span>SECURE DIRECT GATEWAY: CONSOLE</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
            <span>WAITING FOR INSTRUCTION</span>
          </span>
        </div>

      </div>
  );
}
