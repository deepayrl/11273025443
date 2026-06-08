import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Plus, 
  Edit2, 
  Send, 
  RotateCcw, 
  Package, 
  FileText,
  DollarSign
} from 'lucide-react';
import { OrderItem, ProductItem, IndustryType } from '../types';

interface LogisticsCenterProps {
  orders: OrderItem[];
  products: ProductItem[];
  selectedIndustry: IndustryType;
  addLog: (agent: string, action: string, details: string, type: 'info' | 'success' | 'warning' | 'error' | 'tool') => void;
  onUpdateOrders: (updated: OrderItem[]) => void;
  onUpdateProducts: (updated: ProductItem[]) => void;
}

// Carrier item configuration
interface CarrierItem {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  isDefault: boolean;
  contactNumber: string;
}

// Returns configuration
interface ReturnRecord {
  id: string;
  orderId: string;
  customerName: string;
  productSku: string;
  productName: string;
  quantity: number;
  refundAmount: number;
  reason: string;
  auditStatus: '待审核' | '已批准' | '已拒绝';
  receiptStatus: '待收货' | '已入库';
  createdAt: string;
}

export default function LogisticsCenter({
  orders,
  products,
  selectedIndustry,
  addLog,
  onUpdateOrders,
  onUpdateProducts
}: LogisticsCenterProps) {
  
  // Tabs: 'orders' | 'returns' | 'carriers'
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'returns' | 'carriers'>('orders');
  
  // Search and status filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unshipped' | 'shipped' | 'returned'>('all');

  // Dynamic state for carriers (DHL, UPS, FedEx, DPD, GLS, Poste Italiane loaded out-of-the-box)
  const [carriers, setCarriers] = useState<CarrierItem[]>([
    { id: 'DHL', name: 'DHL Express', code: 'DHL', status: 'active', isDefault: true, contactNumber: '+49 180 6 3453003' },
    { id: 'UPS', name: 'UPS Europe', code: 'UPS', status: 'active', isDefault: false, contactNumber: '+44 345 787 7877' },
    { id: 'FEDEX', name: 'FedEx EU', code: 'FEDEX', status: 'active', isDefault: false, contactNumber: '+44 330 123 3450' },
    { id: 'DPD', name: 'DPD Group LLC', code: 'DPD', status: 'active', isDefault: false, contactNumber: '+33 9 70 80 85 66' },
    { id: 'GLS', name: 'GLS Logistics', code: 'GLS', status: 'active', isDefault: false, contactNumber: '+31 88 550 3000' },
    { id: 'POSTE_IT', name: 'Poste Italiane', code: 'POSTE_IT', status: 'active', isDefault: false, contactNumber: '+39 803 160' }
  ]);

  // Dynamic state for return records (synchronized or simulated)
  const [returns, setReturns] = useState<ReturnRecord[]>([
    {
      id: 'RET-2601',
      orderId: '#ORD-4012',
      customerName: 'David Zhang',
      productSku: products[0]?.sku || 'SKU-RETAIL-01',
      productName: products[0]?.name || '默认设计货品',
      quantity: 1,
      refundAmount: orders[0]?.total || 46.50,
      reason: '尺码不合适 / 模型退换货检验',
      auditStatus: '待审核',
      receiptStatus: '待收货',
      createdAt: '2026-06-07 22:00'
    }
  ]);

  // Standard carrier form states
  const [showAddCarrierForm, setShowAddCarrierForm] = useState(false);
  const [newCarrierName, setNewCarrierName] = useState('');
  const [newCarrierCode, setNewCarrierCode] = useState('');
  const [newCarrierContact, setNewCarrierContact] = useState('');

  // Selection states for fulfillment action
  const [selectedOrderRow, setSelectedOrderRow] = useState<OrderItem | null>(null);
  
  // Delivery Input fields
  const [selectedCarrier, setSelectedCarrier] = useState('DHL');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Search filter implementation
  const filteredOrders = useMemo(() => {
    return orders.filter(item => {
      const matchSearch = item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.contact.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (statusFilter === 'all') return matchSearch;
      if (statusFilter === 'unshipped') return matchSearch && (item.status === 'Pending' || item.status === 'AI Confirmed');
      if (statusFilter === 'shipped') return matchSearch && item.status === 'Shipped';
      if (statusFilter === 'returned') return matchSearch && (item.status === 'Refund Requested' || item.status === 'Refunded');
      
      return matchSearch;
    });
  }, [orders, searchQuery, statusFilter]);

  // Handle Quick Ship Submit (Fulfillment)
  const handleFulfillOrder = (orderId: string) => {
    if (!trackingNumberInput.trim()) {
      addLog('Logistics Dispatcher', '发货校验失败', '必须填写承运商物流单号，不可填空。', 'error');
      return;
    }

    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'Shipped' as const
        };
      }
      return o;
    });

    onUpdateOrders(updatedOrders);
    addLog(
      'Logistics Dispatcher', 
      '订单确认发货', 
      `订单 ${orderId} 成功绑定承运商 [${selectedCarrier}]，物流单号 [${trackingNumberInput}]。状态已更改为已发货。`, 
      'success'
    );

    // Reset inputs
    setTrackingNumberInput('');
    setSelectedOrderRow(null);
  };

  // Add Custom Carrier Action
  const handleAddCarrier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarrierName.trim() || !newCarrierCode.trim()) {
      addLog('Logistics Dispatcher', '新增承运商失败', '名称和代码不能为空', 'error');
      return;
    }

    const newCarrier: CarrierItem = {
      id: newCarrierCode.toUpperCase().trim(),
      name: newCarrierName.trim(),
      code: newCarrierCode.toUpperCase().trim(),
      status: 'active',
      isDefault: false,
      contactNumber: newCarrierContact.trim() || '无联系电话'
    };

    setCarriers(prev => [...prev, newCarrier]);
    addLog('Logistics Manager', '新增承运商', `成功配置区域新承运商: ${newCarrierName} (${newCarrierCode})`, 'success');

    // Reset
    setNewCarrierName('');
    setNewCarrierCode('');
    setNewCarrierContact('');
    setShowAddCarrierForm(false);
  };

  // Toggle Carrier Enablement
  const toggleCarrierStatus = (id: string, currentStatus: 'active' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setCarriers(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    addLog('Logistics Manager', '修改承运商状态', `承运商 ${id} 状态已更新为「${nextStatus === 'active' ? '启用' : '禁用'}」`, 'info');
  };

  // Set Default Carrier
  const setDefaultCarrier = (id: string) => {
    setCarriers(prev => prev.map(c => ({
      ...c,
      isDefault: c.id === id
    })));
    addLog('Logistics Manager', '修改默认承运商', `已设置 ${id} 为默认物流发货渠道`, 'success');
  };

  // Initiate Refund Return Request Flow
  const handleInitiateReturn = (order: OrderItem) => {
    // Generate simulated sku based on order index
    const firstMatchedProduct = products[0] || { sku: 'SKU-MOCK', name: '设计精修标品' };
    const refundRec: ReturnRecord = {
      id: `RET-${Date.now().toString().slice(-4)}`,
      orderId: order.id,
      customerName: order.customerName,
      productSku: firstMatchedProduct.sku,
      productName: firstMatchedProduct.name,
      quantity: 1,
      refundAmount: order.total,
      reason: '顾客申请退换货退货审核',
      auditStatus: '待审核',
      receiptStatus: '待收货',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    // Set order state to 'Refund Requested'
    const updated = orders.map(o => o.id === order.id ? { ...o, status: 'Refund Requested' as const } : o);
    onUpdateOrders(updated);

    setReturns(prev => [refundRec, ...prev]);
    addLog('Logistics Return', '发起退货退单申请', `已为订单 ${order.id} 生成对应退货审查记录 ${refundRec.id}。`, 'warning');
  };

  // Approve Return Request
  const handleApproveReturn = (returnId: string, isApproved: boolean) => {
    setReturns(prev => prev.map(r => {
      if (r.id === returnId) {
        return {
          ...r,
          auditStatus: isApproved ? '已批准' : '已拒绝'
        };
      }
      return r;
    }));

    const record = returns.find(r => r.id === returnId);
    if (record) {
      addLog(
        'Logistics Auditor', 
        isApproved ? '退货申请审核通过' : '拒签退货申请', 
        `退货单 ${returnId}（订单: ${record.orderId}）已被「${isApproved ? '审核通过' : '拒绝退回'}」。`, 
        isApproved ? 'success' : 'error'
      );
    }
  };

  // Receive Returned Product Back to Stock (Restick count increment)
  const handleConfirmReceiptBackToStock = (returnId: string) => {
    const rec = returns.find(r => r.id === returnId);
    if (!rec) return;

    // Check if approved first to keep lifecycle perfect
    if (rec.auditStatus !== '已批准') {
      addLog('Warehouse Clerk', '拦截非法入库', '请先通过退货方案审核（点击批准退货），再执行收货入库。', 'error');
      return;
    }

    // 1. Mark as received inside returns state
    setReturns(prev => prev.map(r => {
      if (r.id === returnId) {
        return {
          ...r,
          receiptStatus: '已入库' as const
        };
      }
      return r;
    }));

    // 2. Increment stock in products list
    const updatedProducts = products.map(p => {
      if (p.sku === rec.productSku) {
        const nextStock = p.stock + rec.quantity;
        return {
          ...p,
          stock: nextStock,
          status: (nextStock > p.minStockThreshold ? 'In Stock' : nextStock > 0 ? 'Low Stock' : 'Out of Stock') as any
        };
      }
      return p;
    });
    onUpdateProducts(updatedProducts);

    addLog(
      'Warehouse Clerk', 
      '退回物料验收入库', 
      `退货单 ${returnId} 货品 [${rec.productSku}] 校验合格，已将 ${rec.quantity} 件库存增加库容。`, 
      'success'
    );
  };

  // Eradicate and execute final Refund back to financial registry
  const handleCompleteFinancialRefund = (returnId: string) => {
    const rec = returns.find(r => r.id === returnId);
    if (!rec) return;

    if (rec.receiptStatus !== '已入库') {
      addLog('Finance Auditor', '资金核验拒绝', '必须确认货品完好入库验收完成后，才可执行打款退回。', 'warning');
      return;
    }

    // Update global Order status to 'Refunded'
    const updatedOrders = orders.map(o => {
      if (o.id === rec.orderId) {
        return {
          ...o,
          status: 'Refunded' as const
        };
      }
      return o;
    });
    onUpdateOrders(updatedOrders);

    // Delete or mark resolved
    setReturns(prev => prev.filter(r => r.id !== returnId));
    addLog(
      'Finance Auditor', 
      '销账原路退款已打款', 
      `退款单 ${returnId} 完成原路款项 €${rec.refundAmount.toFixed(2)} 打回原支付渠道。ERP 账目已核对清空。`, 
      'success'
    );
  };

  return (
    <div className="space-y-4 font-sans text-slate-900 bg-[#f8fafc]/40 p-1 min-h-[600px]">
      
      {/* Short Module Introduction (Max 5 lines strictly enforced) */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#07C2E3]/10 rounded-lg flex items-center justify-center text-[#07C2E3] shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">物流中心 & 商家发货跟踪</h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 leading-relaxed">
              基于 Shopify 自然设计流：仅对承运商启用、绑定单号发货、实时进度监视和退货验收。多功能无弹窗，在主视图中全闭环运转。
            </p>
          </div>
        </div>
      </div>

      {/* Subtab Controllers */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'orders' 
                ? 'border-[#07C2E3] text-[#07C2E3]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            物流订单履约 ({orders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('returns')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'returns' 
                ? 'border-[#07C2E3] text-[#07C2E3]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            退单与对账销账 ({returns.length})
          </button>
          <button
            onClick={() => setActiveSubTab('carriers')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'carriers' 
                ? 'border-[#07C2E3] text-[#07C2E3]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            承运商列表 ({carriers.filter(c => c.status === 'active').length} 启用)
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: ORDERS FULFILLMENT */}
      {activeSubTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Main List Section */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              
              {/* Filter controls */}
              <div className="p-3 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索订单号 / 顾客姓名..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#07C2E3]"
                  />
                </div>
                
                <div className="flex gap-1 overflow-x-auto self-start sm:self-auto">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 text-[10px] rounded-md font-bold transition-all ${
                      statusFilter === 'all' ? 'bg-[#07C2E3]/10 text-[#07C2E3]' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setStatusFilter('unshipped')}
                    className={`px-2.5 py-1 text-[10px] rounded-md font-bold transition-all ${
                      statusFilter === 'unshipped' ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    待发货
                  </button>
                  <button
                    onClick={() => setStatusFilter('shipped')}
                    className={`px-2.5 py-1 text-[10px] rounded-md font-bold transition-all ${
                      statusFilter === 'shipped' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    已发送
                  </button>
                  <button
                    onClick={() => setStatusFilter('returned')}
                    className={`px-2.5 py-1 text-[10px] rounded-md font-bold transition-all ${
                      statusFilter === 'returned' ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    退货中
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none h-10">
                      <th className="p-3 pl-4">订单单号</th>
                      <th className="p-3">收件人 / 顾客</th>
                      <th className="p-3">联系方式</th>
                      <th className="p-3 text-right">结算金额</th>
                      <th className="p-3 text-center">当前状态</th>
                      <th className="p-3 text-right pr-4">物流指令</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                          暂无符合筛选标准的物流订单。
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const isSelected = selectedOrderRow?.id === order.id;
                        return (
                          <tr 
                            key={order.id} 
                            onClick={() => {
                              setSelectedOrderRow(order);
                              setTrackingNumberInput('');
                            }}
                            className={`cursor-pointer transition-all hover:bg-slate-50/70 h-12 ${
                              isSelected ? 'bg-[#07C2E3]/5 font-semibold text-slate-900 border-l-4 border-l-[#07C2E3]' : ''
                            }`}
                          >
                            <td className="p-3 pl-4 font-mono font-bold text-slate-900">{order.id}</td>
                            <td className="p-3">{order.customerName}</td>
                            <td className="p-3 text-slate-400 font-mono text-[11px]">{order.contact}</td>
                            <td className="p-3 text-right font-mono text-slate-800 font-medium">€{order.total.toFixed(2)}</td>
                            <td className="p-3 text-center">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                order.status === 'Shipped'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                  : order.status === 'Pending' || order.status === 'AI Confirmed'
                                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                                  : order.status === 'Refund Requested'
                                  ? 'bg-rose-50 border-rose-200 text-rose-500 animate-pulse'
                                  : order.status === 'Refunded'
                                  ? 'bg-slate-50 border-slate-200 text-slate-500'
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}>
                                {order.status === 'Shipped' ? '已发货' : 
                                 order.status === 'Pending' ? '待出库' : 
                                 order.status === 'AI Confirmed' ? '待出库' : 
                                 order.status === 'Refund Requested' ? '退货审核中' : 
                                 order.status === 'Refunded' ? '已原路退款' : order.status}
                              </span>
                            </td>
                            <td className="p-3 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                              {order.status === 'Shipped' ? (
                                <button
                                  onClick={() => handleInitiateReturn(order)}
                                  className="border border-slate-200 hover:border-rose-200 hover:bg-rose-500 hover:text-white px-2 py-1 rounded text-[10px] text-slate-500 font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                                >
                                  <RotateCcw className="w-2.5 h-2.5" />
                                  申请退货
                                </button>
                              ) : order.status === 'Pending' || order.status === 'AI Confirmed' ? (
                                <button
                                  onClick={() => {
                                    setSelectedOrderRow(order);
                                    setTrackingNumberInput(`TRK-EU-${Date.now().toString().slice(-6)}`);
                                  }}
                                  className="bg-slate-900 text-white hover:bg-black px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  填单发货
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400">闭环锁定</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Interactive Fulfillment Side Pane */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-md sticky top-4 space-y-4">
              <div className="border-b border-slate-800 pb-2.5">
                <h4 className="font-extrabold text-xs tracking-wider text-slate-400 uppercase">Shopify 物流履约看板</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">选中网格行可自动调派此看板修改对应物流状态。</p>
              </div>

              {selectedOrderRow ? (
                <div className="space-y-4">
                  {/* Selected overview */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 font-mono text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">当前订单:</span>
                      <span className="font-bold text-[#07C2E3]">{selectedOrderRow.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">收货地址:</span>
                      <span className="text-right text-slate-300">欧洲境内自提 / 空运</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">顾客姓名:</span>
                      <span className="text-slate-200">{selectedOrderRow.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">金额情况:</span>
                      <span className="text-slate-200">€{selectedOrderRow.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Shipment Execution Form */}
                  {(selectedOrderRow.status === 'Pending' || selectedOrderRow.status === 'AI Confirmed') ? (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">选择承运商</label>
                        <select
                          value={selectedCarrier}
                          onChange={(e) => setSelectedCarrier(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#07C2E3]"
                        >
                          {carriers.filter(c => c.status === 'active').map(c => (
                            <option key={c.id} value={c.code}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">填写物流单号</label>
                        <input
                          type="text"
                          placeholder="例如: DHL-EU-88220"
                          value={trackingNumberInput}
                          onChange={(e) => setTrackingNumberInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#07C2E3] font-mono"
                        />
                      </div>

                      <button
                        onClick={() => handleFulfillOrder(selectedOrderRow.id)}
                        className="w-full bg-[#07C2E3] hover:bg-[#06B2D0] text-slate-950 hover:text-black py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>确认发货并派送</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Timeline status list preview */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">物流派送节点</span>
                        
                        <div className="relative border-l-2 border-slate-800 ml-2.5 pl-4 space-y-4 text-[11px] font-semibold text-slate-400">
                          
                          <div className="relative">
                            <span className="absolute -left-6 top-0 w-2.5 h-2.5 bg-[#07C2E3] rounded-full ring-4 ring-[#07C2E3]/20"></span>
                            <div className="text-white flex items-center justify-between">
                              <span>航空挂网 派送中</span>
                              <span className="text-[9px] font-mono text-[#07C2E3]">进行中</span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono block">承运商核配: {selectedCarrier || 'DHL'} 递交完毕</span>
                          </div>

                          <div className="relative">
                            <span className="absolute -left-6 top-1 w-2.5 h-2.5 bg-slate-700 rounded-full"></span>
                            <div className="flex items-center justify-between text-slate-300">
                              <span>已交托至枢纽转运</span>
                              <span className="text-[9px] font-mono text-slate-500">2小时前</span>
                            </div>
                          </div>

                          <div className="relative">
                            <span className="absolute -left-6 top-1 w-2.5 h-2.5 bg-slate-700 rounded-full"></span>
                            <div className="text-slate-500">仓库扫码封装出库</div>
                          </div>

                          <div className="relative">
                            <span className="absolute -left-6 top-1 w-2.5 h-2.5 bg-slate-700 rounded-full"></span>
                            <div className="text-slate-500">商户系统配货标签确认</div>
                          </div>

                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            addLog('Logistics Dispatcher', '打印发货面单', `正在生成订单 ${selectedOrderRow.id} 欧洲格式报送面单 (PDF)`, 'info');
                          }}
                          className="flex-1 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 py-1.5 rounded-lg text-[10px] text-slate-300 font-bold transition-all cursor-pointer text-center"
                        >
                          打印发货单
                        </button>
                        <button
                          onClick={() => {
                            // Reset back
                            const updated = orders.map(o => o.id === selectedOrderRow.id ? { ...o, status: 'Pending' as const } : o);
                            onUpdateOrders(updated);
                            addLog('Logistics Clerical', '重置发货单', `已撤销订单 ${selectedOrderRow.id} 物流发货绑定状态。`, 'warning');
                            setSelectedOrderRow(null);
                          }}
                          className="border border-slate-800 hover:border-rose-800 hover:bg-rose-900/40 px-2 py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-white transition-all cursor-pointer"
                          title="撤销发货绑定"
                        >
                          撤单
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <div className="inline-flex w-10 h-10 rounded-full bg-slate-800 items-center justify-center text-slate-400">
                    <Package className="w-5 h-5" />
                  </div>
                  <p className="text-xs">请点击左侧物流网格中的任一行，即可在该面板绑定物流单、执行快速发货或打印面单流程。</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* RENDER TAB 2: RETURNS LEDGER */}
      {activeSubTab === 'returns' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <h3 className="font-extrabold text-[#07C2E3] text-xs">商家退换网控审查簿</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">跟踪货品退回审核、验收入库状态。完好验收入库后执行极速资金销账打退注册。</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/20 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none h-10">
                  <th className="p-3 pl-4">退货记录号</th>
                  <th className="p-3">关联订购单</th>
                  <th className="p-3">顾客姓名</th>
                  <th className="p-3">退回商品物料 (SKU)</th>
                  <th className="p-3 text-right">退款估计值</th>
                  <th className="p-3">退货原因说明</th>
                  <th className="p-3 text-center">方案审查状态</th>
                  <th className="p-3 text-center">商品验收状态</th>
                  <th className="p-3 text-right pr-4">核验执行阶段</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
                {returns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-400 text-xs">
                      当前无活跃退换货及款项待退记录。
                    </td>
                  </tr>
                ) : (
                  returns.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors h-12">
                      <td className="p-3 pl-4 font-mono font-extrabold text-slate-900">{rec.id}</td>
                      <td className="p-3 font-mono text-slate-800 font-semibold">{rec.orderId}</td>
                      <td className="p-3">{rec.customerName}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {rec.productName} ({rec.productSku})
                      </td>
                      <td className="p-3 text-right font-mono text-rose-600 font-bold">€{rec.refundAmount.toFixed(2)}</td>
                      <td className="p-3 text-slate-500 max-w-[140px] truncate" title={rec.reason}>{rec.reason}</td>
                      
                      {/* Audit status */}
                      <td className="p-3 text-center">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          rec.auditStatus === '已批准'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : rec.auditStatus === '已拒绝'
                            ? 'bg-rose-50 border-rose-200 text-rose-500'
                            : 'bg-amber-50 border-amber-200 text-amber-500 animate-pulse'
                        }`}>
                          {rec.auditStatus}
                        </span>
                      </td>

                      {/* Warehouse check state */}
                      <td className="p-3 text-center">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          rec.receiptStatus === '已入库'
                            ? 'bg-slate-900 border-black text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          {rec.receiptStatus}
                        </span>
                      </td>

                      {/* Next functional step buttons */}
                      <td className="p-3 text-right pr-4 space-x-1 whitespace-nowrap">
                        {rec.auditStatus === '待审核' && (
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => handleApproveReturn(rec.id, true)}
                              className="bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-[10px] px-1.5 py-0.5 rounded transition-all cursor-pointer"
                            >
                              批准退回
                            </button>
                            <button
                              onClick={() => handleApproveReturn(rec.id, false)}
                              className="bg-slate-250 hover:bg-slate-350 text-slate-600 font-bold text-[10px] px-1.5 py-0.5 rounded transition-all cursor-pointer"
                            >
                              拒绝
                            </button>
                          </div>
                        )}

                        {rec.auditStatus === '已批准' && rec.receiptStatus === '待收货' && (
                          <button
                            onClick={() => handleConfirmReceiptBackToStock(rec.id)}
                            className="bg-[#07C2E3] hover:bg-[#06B2D0] font-bold text-white text-[10px] px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 inline-block"
                          >
                            <Package className="w-2.5 h-2.5" />
                            收货入库
                          </button>
                        )}

                        {rec.receiptStatus === '已入库' && (
                          <button
                            onClick={() => handleCompleteFinancialRefund(rec.id)}
                            className="bg-rose-500 hover:bg-rose-600 font-bold text-white text-[10px] px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 inline-block"
                          >
                            <DollarSign className="w-2.5 h-2.5" />
                            确认打款退款
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER TAB 3: CARRIERS CONFIG */}
      {activeSubTab === 'carriers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Active carriers list */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <span className="font-extrabold text-slate-800 text-xs">默认支持的国际快件网络</span>
            </div>
            
            <div className="divide-y divide-slate-150">
              {carriers.map((car) => (
                <div key={car.id} className="p-3.5 flex items-center justify-between text-xs transition-colors hover:bg-slate-50/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-[#07C2E3] flex items-center justify-center font-black text-xs font-mono select-none">
                      {car.code.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{car.name}</span>
                        {car.isDefault && (
                          <span className="bg-[#07C2E3]/10 text-[#07C2E3] text-[8px] font-black px-1 rounded tracking-wide uppercase">
                            默认承运商
                          </span>
                        )}
                        <span className={`w-2 h-2 rounded-full ${car.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">电话: {car.contactNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!car.isDefault && car.status === 'active' && (
                      <button
                        onClick={() => setDefaultCarrier(car.id)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-350 px-2 py-0.5 rounded font-bold cursor-pointer transition-all"
                      >
                        设为默认
                      </button>
                    )}
                    <button
                      onClick={() => toggleCarrierStatus(car.id, car.status)}
                      className={`text-[10px] px-2.5 py-0.5 rounded font-bold cursor-pointer transition-all ${
                        car.status === 'active' 
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {car.status === 'active' ? '停用' : '启用'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Introduce custom carrier form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
              <div className="border-b border-slate-150 pb-2">
                <h4 className="font-extrabold text-xs text-slate-900">配置区域新承运商</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">为本地或者特定地区的新增履约代理网络注册接口配置。</p>
              </div>

              <form onSubmit={handleAddCarrier} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">承运商中文/英文全称</label>
                  <input
                    type="text"
                    required
                    placeholder="如: Colissimo France"
                    value={newCarrierName}
                    onChange={(e) => setNewCarrierName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#07C2E3]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">通道代码 (CODE)</label>
                  <input
                    type="text"
                    required
                    placeholder="如: COLI_FR"
                    value={newCarrierCode}
                    onChange={(e) => setNewCarrierCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#07C2E3] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">服务商客服/对账专线</label>
                  <input
                    type="text"
                    placeholder="如: +33 800 120 120"
                    value={newCarrierContact}
                    onChange={(e) => setNewCarrierContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#07C2E3] font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-905 hover:bg-black text-white py-2 rounded-lg text-xs font-bold font-sans tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>启用新通道</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
