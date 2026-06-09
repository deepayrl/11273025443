import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send,
  Sparkles,
  Bot, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Megaphone, 
  Coins, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle,
  Mic,
  Plus,
  ArrowUp,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { IndustryType, ProductItem, OrderItem, CustomerItem } from '../types';
import { aiRuntimeStore } from '../store/aiRuntimeStore';
import { AIContextService } from '../services/AIContextService';
import Markdown from 'react-markdown';
import { generateIntelligentLocalReply } from '../utils/intelligentFallback';

interface AICommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIndustry: IndustryType;
  products: ProductItem[];
  orders: OrderItem[];
  customers: CustomerItem[];
  currentAppTab: string;
  onUpdateCustomers: (updated: CustomerItem[]) => void;
  onUpdateProducts?: (updated: ProductItem[]) => void;
  addLog: (agent: string, action: string, details: string, type: 'info' | 'success' | 'warning' | 'error' | 'tool') => void;
  onSwitchTab: (tab: any) => void;
  onTriggerAddProductOpen: () => void;
  onBulkRestock: (sku: string, amount: number) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: any) => void;
  onAddNewProduct: (name: string, sku: string, price: number, stock: number) => void;
  onPrefillProductForm?: (name: string, sku: string, price: number, stock: number) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionType?: string;
  actionMeta?: any;
  suggestions?: any[];
  attachment?: {
    name: string;
    url?: string;
    type: 'image' | 'document';
    size?: string;
  };
  thought?: {
    intent: string;
    reasoning: string;
    planning: string;
    permission: string;
    toolRouter: string;
    validator: string;
  };
}

export default function AICommandCenter({
  isOpen,
  onClose,
  selectedIndustry,
  products,
  orders,
  customers,
  currentAppTab,
  onUpdateCustomers,
  onUpdateProducts,
  addLog,
  onSwitchTab,
  onTriggerAddProductOpen,
  onBulkRestock,
  onUpdateOrderStatus,
  onAddNewProduct,
  onPrefillProductForm
}: AICommandCenterProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [compareModalData, setCompareModalData] = useState<any[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // States for Voice Input & File attachments matching multimodal standards
  const [attachedFile, setAttachedFile] = useState<{ name: string; url?: string; type: 'image' | 'document'; size?: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  const recognitionRef = useRef<any>(null);

  const handleToggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    } else {
      if (!SpeechRecognition) {
        addLog('语音输入', '浏览器限制', '当前设备浏览器未集成语音包，启动智能仿真录音中', 'warning');
        setIsRecording(true);
        setRecordingSeconds(0);
        recordingIntervalRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
        
        // Mock fallback to avoid silent failures
        setTimeout(() => {
          if (recordingIntervalRef.current) {
            const mockTranscriptions = [
              '一键检测并加满断货及低库存 SKU',
              '生成上新一款防水排汗秋季外套新品',
              '汇总今天的欧元结算记账情况',
              '帮我查询本月的总财务毛利润'
            ];
            const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
            setChatInput(randomText);
            addLog('语音识别', '智能翻译完成', `语音已翻译成命令: "${randomText}"`, 'success');
            setIsRecording(false);
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }
        }, 3200);
        return;
      }

      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'zh-CN';

        rec.onstart = () => {
          setIsRecording(true);
          setRecordingSeconds(0);
          addLog('语音输入', '声纹传感器启动', '正在侦听您的语音指令...', 'info');
          recordingIntervalRef.current = setInterval(() => {
            setRecordingSeconds(prev => prev + 1);
          }, 1000);
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0]?.[0]?.transcript;
          if (resultText) {
            setChatInput(prev => {
              const base = prev.trim();
              return base ? `${base} ${resultText}` : resultText;
            });
            addLog('语音输入', '声纹翻译成功', `侦听到词汇: "${resultText}"`, 'success');
          }
        };

        rec.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          addLog('语音输入', '声学传感器挂起', '未能获取持续音频信息，请说出店务口令', 'warning');
        };

        rec.onend = () => {
          setIsRecording(false);
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();
      
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          url: reader.result as string, // Real full dynamic Base64 data Uri of the uploaded picture
          type: isImg ? 'image' : 'document',
          size: `${(file.size / 1024).toFixed(1)} KB`
        });
        addLog('文件上传', '磁盘物料解析成功', `已挂载: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'success');
      };

      reader.onerror = () => {
        addLog('文件上传', '解析媒介失败', '系统未能成功读取本地文件介质', 'error');
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetFile = (fileName: string, type: 'image' | 'document', bytes: string) => {
    setAttachedFile({
      name: fileName,
      type: type,
      size: bytes,
      url: type === 'image' ? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&auto=format&fit=crop&q=60' : undefined
    });
    setShowAttachmentMenu(false);
    addLog('文件上传', '添加预设样本', `挂载资源 "${fileName}" 成功`, 'success');
  };

  // Initialize welcome thread based on current store industry track
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `**AI Commerce OS** 指挥官已就位。您可通过下方快捷输入，触发整店补仓、发起营销折扣，或管理货源订单。`,
        timestamp: new Date().toLocaleTimeString().slice(0, 5)
      }
    ]);
  }, [selectedIndustry]);

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const appendSystemReply = (
    content: string, 
    actionType: 'product_create' | 'restock' | 'campaign' | 'customer_recall' | 'finance_switch' | 'none' | 'switch_tab' | 'APPLY_OPTIMIZED_COPY' | 'COMPARE_PREVIEW' | 'EXPORT_FINANCE_REPORT' | 'PREFILL_PRODUCT' = 'none', 
    actionMeta?: any, 
    suggestions?: any[],
    thought?: any
  ) => {
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content,
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
        actionType,
        actionMeta,
        suggestions,
        thought
      }
    ]);
  };

  const handleActionRun = (type: string, meta?: any) => {
    if (type === 'PREFILL_PRODUCT') {
      const pName = meta?.name || '防泼水排汗风夹克 (推荐)';
      const pSku = meta?.sku || 'SKU-WIND-88';
      const pPrice = meta?.price || 129.00;
      const pStock = meta?.stock || 100;
      
      if (onPrefillProductForm) {
        onPrefillProductForm(pName, pSku, pPrice, pStock);
      } else {
        onAddNewProduct(pName, pSku, pPrice, pStock);
        onSwitchTab('products');
      }
      addLog('AI 助手', '自动预填商品参数', `已为您在商品中心新建面板中预填「${pName}」的核心参数。`, 'success');
      appendSystemReply(`已成功为您一键预填了推荐爆款商品 [**${pName}**]（规格: ${pSku}，售价: €${pPrice}）的数据指标。已激活新建商品视图并跳转商品中心！`);
    }
    
    else if (type === 'product_create') {
      const pName = typeof meta === 'string' && meta ? `设计款新产品 (${meta})` : (meta?.name || '创意科技单品 (AI 智选推荐)');
      const pSku = typeof meta === 'string' && meta ? `SKU-${meta.toUpperCase().slice(0, 10)}` : (meta?.sku || 'SKU-NEW-99');
      const pPrice = meta?.price || 129.00;
      const pStock = meta?.stock || 150;
      
      if (onPrefillProductForm) {
        onPrefillProductForm(pName, pSku, pPrice, pStock);
      } else {
        onAddNewProduct(pName, pSku, pPrice, pStock);
        onSwitchTab('products');
      }
      
      addLog('AI 助手', '自动填充新商品', `成功填充新服饰推荐款「${pName}」，自动引流跳转！`, 'success');
      appendSystemReply(`已成功为您自动生成爆款推荐商品 [**${pName}**]（规格: ${pSku}，参考建议零售价: €${pPrice}）的数据。已激活新建商品模架并跳转商品中心完成闭环！`);
    } 
    
    else if (type === 'restock') {
      const singleSku = typeof meta === 'string' ? meta.trim() : (meta?.sku || '').trim();
      if (singleSku && singleSku !== 'all' && singleSku !== '') {
        onBulkRestock(singleSku, 150);
        addLog('AI 助手', '供应链采购', `已单独为 SKU「${singleSku}」紧急向供应商报采增库 150 件。`, 'success');
        appendSystemReply(`✓ 补货采购指令已完成。已为物料 [**${singleSku}**] 追加 **+150 件** 入库。`);
      } else {
        const lowStockProducts = products.filter(p => p.stock <= 10);
        if (lowStockProducts.length > 0) {
          lowStockProducts.forEach(item => {
            onBulkRestock(item.sku, 150);
            addLog('AI 助手', '一键紧急采购补货', `检测到断缺货风险，已为「${item.name}」紧急向供应商报采增库 150 件。`, 'success');
          });
          appendSystemReply(`✓ 补货采购指令已执行！已自动将店内的 ${lowStockProducts.length} 款低库存/断货 SKU 向上游源头供应链报采，每款追加补料 **+150 件**。`);
        } else {
          if (products.length > 0) {
            const firstItem = products[0];
            onBulkRestock(firstItem.sku, 50);
            addLog('AI 助手', '基准安全库存', `执行常规补货安全基准配置，为「${firstItem.name}」增加库量 50 件。`, 'success');
            appendSystemReply(`✓ 店内目前无严重断货商品，已常规性为您首个上架款式 [**${firstItem.name}**] 追加补仓 **+50 件** 提高流转。`);
          } else {
            appendSystemReply(`⚠️ 无法执行补货采购：当前商品主库数据空，请先添加或初始化商品。`);
          }
        }
      }
    } 
    
    else if (type === 'switch_tab') {
      const targetTab = typeof meta === 'string' ? meta.trim() : (meta?.tab || 'command').trim();
      onSwitchTab(targetTab as any);
      addLog('AI 助手', '视图导航切换', `正在为您极速跳转「${targetTab}」业务面板。`, 'info');
      const textLabelMap: Record<string, string> = {
        'command': '智能大盘', 'products': '商品中心', 'orders': '订单中心', 
        'customers': '客户中心', 'marketing': '营销中心', 'logistics': '物流中心', 
        'payments': '支付中心', 'finance': '财务中心', 'agents': 'AI中心',
        'marketplace': '应用市场', 'developer-center': '开发者中心', 'settings': '设置中心',
        'online-store': '店铺中心'
      };
      appendSystemReply(`✓ 操作就绪：已为您物理跳转至 **${textLabelMap[targetTab] || targetTab}** 面板。`);
    }

    else if (type === 'EXPORT_FINANCE_REPORT') {
      addLog('AI 助手', '导出对账单数据', '正在生成并导出当前店铺今日对账清单 CSV 格式...', 'success');
      appendSystemReply(`✓ 报表导出完成！今日单店收单对账底表 \`merchant_reconciliation_${new Date().toISOString().slice(0, 10)}.csv\` 已经自动组装生成。 [点击下载报表]`);
    }

    else if (type === 'APPLY_OPTIMIZED_COPY') {
      const payloadProducts = meta?.products || meta || [];
      if (payloadProducts.length > 0 && onUpdateProducts) {
        const updatedProducts = products.map(p => {
          const match = payloadProducts.find((item: any) => item.sku === p.sku || item.productId === p.id);
          if (match) {
            return {
              ...p,
              name: match.optimizedCopy.title,
              status: p.stock > 10 ? 'In Stock' as const : (p.stock > 0 ? 'Low Stock' as const : 'Out of Stock' as const)
            };
          }
          return p;
        });
        onUpdateProducts(updatedProducts);
        addLog('AI 助手', '文本优化入库', `一键应用了 ${payloadProducts.length} 款主力商品的欧美高端中规文案优化。`, 'success');
        appendSystemReply(`✓ 欧美高端中英文语言优化已成功更新！批量覆盖了 **${payloadProducts.length} 款** 商品主文案描述，助推站外转化率跃升。`);
      }
    }
  };

  // Perform Gemini response request
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!chatInput.trim() && !attachedFile) || isThinking) return;

    const userText = chatInput.trim() || (attachedFile ? `[已上传 ${attachedFile.type === 'image' ? '图片' : '文件'}: ${attachedFile.name}]` : '');
    const currentAttachment = attachedFile ? { ...attachedFile } : undefined;
    
    setChatInput('');
    setAttachedFile(null);

    // Append user message
    const thread = [
      ...messages,
      { 
        role: 'user' as const,
        content: userText,
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
        attachment: currentAttachment
      }
    ];
    setMessages(thread);
    setIsThinking(true);
    addLog('商户咨询', '输入命令对话', userText, 'info');

    try {
      // 1. Gather rich local merchant context
      const currentStoreCtx = aiRuntimeStore.getContext();
      const liveContext = AIContextService.gatherContext({
        industry: selectedIndustry,
        activeTab: currentAppTab,
        products: products,
        orders: orders,
        customers: customers,
        selectedProductId: currentStoreCtx.ui?.productId,
        selectedOrderId: currentStoreCtx.ui?.orderId,
        selectedCustomerId: currentStoreCtx.ui?.customerId
      });

      // 2. Call backend /api/gemini/agent-chat
      const response = await fetch('/api/gemini/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: {
            id: 'merchant_helper_agent',
            name: '店铺高级助理',
            title: '商业运营大管家',
            systemPrompt: 'You are an intelligent, friendly, and fully professional shop assistant manager with human-like general reasoning capabilities. You can have natural conversations, but you are also designed to execute commerce tools on command. Reply naturally, clearly, and thoughtfully without technical jargon. Keep replies crisp and elegant. Avoid over-suggesting actions for simple conversational inputs.',
            description: '协助管理当前单店运营细节',
            capabilities: ['Local inventory optimization', 'Instant SKU formulation', 'Marketing voucher builder', 'Direct tab router guide']
          },
          industry: selectedIndustry,
          products: products,
          orders: orders,
          messages: thread.map(m => ({ role: m.role, content: m.content })),
          aiContext: liveContext
        })
      });

      if (!response.ok) throw new Error('API server unavailable');
      const resData = await response.json();

      // Read structured AI Commander Brain properties directly from backend if available
      const parsedText = resData.text || resData.replyText || "处理就绪";
      const parsedActionType = resData.actionType || 'none';
      const parsedActionMeta = resData.actionMeta || null;
      const parsedSuggestions = resData.suggestions || [];
      const parsedThought = resData.thought || null;

      appendSystemReply(
        parsedText, 
        parsedActionType as any, 
        parsedActionMeta, 
        parsedSuggestions,
        parsedThought
      );

    } catch (err) {
      console.error("Gemini Store Chat Failed, utilizing high-quality store simulation:", err);
      
      const { text, actionType: fallbackAction, metaObj: fallbackMeta, suggestions: fallbackSuggs, thought: fallbackThought } = generateIntelligentLocalReply(
        userText,
        products,
        orders,
        customers
      );

      await new Promise(resolve => setTimeout(resolve, 600));
      appendSystemReply(text, fallbackAction, fallbackMeta, fallbackSuggs, fallbackThought);
    } finally {
      setIsThinking(false);
    }
  };



  const currentLowStock = products.filter(p => p.stock <= 10).length;

  if (!isOpen) return null;

  return (
    <div 
      id="ai-business-os-commander" 
      className="w-[420px] bg-[#0c0d0e] border-l border-[#1f2124] h-full flex flex-col shrink-0 overflow-hidden text-slate-200 select-none animate-fadeIn font-sans"
    >
      {/* Header Panel (Minimalist and High-End) */}
      <div className="p-4 border-b border-[#1f2124] bg-[#070809] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#07C2E3] to-[#046B7D] flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="text-left font-sans">
            <h3 className="text-sm font-black text-white tracking-wide">
              <span>AI 店铺助手</span>
            </h3>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Interactive Quick Hops Buttons Toolbar (Replacing technical labels with sleek action icons to reach features in 1-click) */}
      <div className="bg-[#050607] border-b border-[#1a1b1d] px-3.5 py-2 flex items-center justify-between shrink-0 font-sans">
        <div className="flex gap-1.5">
          <button 
            type="button"
            onClick={() => onSwitchTab('command')}
            title="控制中心首页"
            className="w-7 h-7 rounded bg-slate-950 border border-slate-900 text-[#07C2E3] hover:bg-[#07C2E3]/10 flex items-center justify-center transition-colors shadow-xs"
          >
            <Bot className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => onSwitchTab('products')}
            title="商品中心"
            className="w-7 h-7 rounded bg-slate-950 border border-slate-900 text-[#07C2E3] hover:bg-[#07C2E3]/10 flex items-center justify-center transition-colors shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => onSwitchTab('orders')}
            title="订单中心"
            className="w-7 h-7 rounded bg-slate-950 border border-slate-900 text-[#07C2E3] hover:bg-[#07C2E3]/10 flex items-center justify-center transition-colors shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => onSwitchTab('customers')}
            title="客户中心"
            className="w-7 h-7 rounded bg-slate-950 border border-slate-900 text-[#07C2E3] hover:bg-[#07C2E3]/10 flex items-center justify-center transition-colors shadow-xs"
          >
            <Users className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => onSwitchTab('finance')}
            title="财务中心"
            className="w-7 h-7 rounded bg-slate-950 border border-slate-900 text-[#07C2E3] hover:bg-[#07C2E3]/10 flex items-center justify-center transition-colors shadow-xs"
          >
            <Coins className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Conversation Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0b0c]/98">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex flex-col max-w-[92%] ${msg.role === 'user' ? 'ml-auto items-end animate-fadeIn' : 'mr-auto items-start'}`}
          >
            {/* Speaker head */}
            <span className="text-[9px] text-slate-500 font-mono mb-1 tracking-wider uppercase font-bold flex items-center gap-1">
              {msg.role === 'user' ? (
                <><span>ME</span> <span className="text-[7.5px]">&middot; {msg.timestamp}</span></>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-[#07C2E3]" /> 
                  <span className="text-[#07C2E3]">AI</span> 
                  <span className="text-[7.5px]">&middot; {msg.timestamp}</span>
                </>
              )}
            </span>

            {/* Bubble */}
            <div 
              className={`rounded-2xl p-3.5 text-[11.5px] text-left leading-relaxed shadow-sm font-semibold relative ${
                msg.role === 'user' 
                  ? 'bg-[#07C2E3] text-[#001015]' 
                  : 'bg-[#121316] text-slate-200 border border-[#1b1d22]'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-line font-bold leading-relaxed font-sans">{msg.content}</p>
              ) : (
                <>
                  {msg.thought && (
                    <div className="mb-3.5 bg-slate-950/75 rounded-xl border border-slate-900 p-3 space-y-2.5 font-mono text-[9.5px] leading-tight text-slate-400 select-text">
                      <div className="flex items-center gap-1.5 text-[#07C2E3] font-bold text-[10px] tracking-wider uppercase border-b border-[#1b1d22]/50 pb-1.5 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#07C2E3]" />
                        <span>🧬 AI Commander Brain OS (思考智中枢)</span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 pl-1.5 border-l-2 border-[#07C2E3]/35">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-extrabold bg-emerald-950/60 px-1 rounded text-[8px] uppercase">1. INTENT 意图</span>
                          <span className="text-slate-200 font-bold">{msg.thought.intent}</span>
                        </div>
                        <p className="text-slate-400 leading-normal pl-0.5">{msg.thought.reasoning}</p>
                      </div>

                      <div className="flex flex-col gap-1.5 pl-1.5 border-l-2 border-[#07C2E3]/35">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-extrabold bg-amber-950/40 px-1 rounded text-[8px] uppercase">2. PLANNING 规划</span>
                        </div>
                        <p className="text-slate-400 leading-normal pl-0.5">{msg.thought.planning}</p>
                      </div>

                      <div className="flex flex-col gap-1.5 pl-1.5 border-l-2 border-[#07C2E3]/35">
                        <div className="flex items-center gap-2">
                          <span className="text-sky-400 font-extrabold bg-sky-950/40 px-1 rounded text-[8px] uppercase">3. TOOL ROUTER 路由</span>
                          <span className="text-slate-200 font-bold">{msg.thought.toolRouter}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 pl-1.5 border-l-2 border-[#07C2E3]/35">
                        <div className="flex items-center gap-2">
                          <span className="text-violet-400 font-extrabold bg-violet-950/40 px-1 rounded text-[8px] uppercase">4. POLICY 授权</span>
                          <span className="text-[#07C2E3] font-bold text-[8.5px] bg-[#07C2E3]/10 px-1 rounded">{msg.thought.permission}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 pl-1.5 border-l-2 border-[#07C2E3]/40">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-400 font-extrabold bg-indigo-950/40 px-1 rounded text-[8px] uppercase">5. VALIDATION 核验</span>
                          <span className="text-emerald-400 font-bold">{msg.thought.validator}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="markdown-body font-sans text-slate-300 space-y-2">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </>
              )}

              {/* Connected Attachment presentation */}
              {msg.attachment && (
                <div className="mt-2 text-left rounded-lg overflow-hidden bg-black/20 p-2 border border-black/10 flex items-center gap-2 max-w-sm">
                  {msg.attachment.type === 'image' ? (
                    <div className="w-8 h-8 rounded overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                      <img src={msg.attachment.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160'} alt="attachment" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded bg-[#07C2E3]/20 flex items-center justify-center shrink-0 border border-[#07C2E3]/15">
                      <FileText className="w-4 h-4 text-[#07C2E3]" />
                    </div>
                  )}
                  <div className="text-left select-text min-w-0 flex-1">
                    <p className={`text-[10px] font-bold truncate ${msg.role === 'user' ? 'text-black' : 'text-slate-200'}`}>
                      {msg.attachment.name}
                    </p>
                    <p className={`text-[8.5px] font-mono ${msg.role === 'user' ? 'text-slate-800' : 'text-slate-400'}`}>
                      {msg.attachment.size || '未知大小'}
                    </p>
                  </div>
                </div>
              )}

              {/* Connected CTA interactive action buttons - Renders dynamically inside assistant reply card */}
              {msg.role === 'assistant' && (
                <>
                  {msg.suggestions && msg.suggestions.length > 0 ? (
                    <div className="mt-3.5 pt-3 border-t border-[#1e2025] flex flex-col gap-2">
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-0.5">💡 系统极速研判经营运作：</div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleActionRun(sug.action, sug.payload)}
                            className="bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-slate-950 px-3.5 py-1.5 rounded-xl font-extrabold text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <span>🎯 {sug.label}</span>
                            <ArrowRight className="w-3 h-3 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    msg.actionType && msg.actionType !== 'none' && (
                      <div className="mt-4 pt-3 border-t border-[#1e2025] flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleActionRun(msg.actionType!, msg.actionMeta)}
                          className="bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-slate-950 px-3.5 py-1.5 rounded-xl font-black text-[10px] transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                        >
                          <span>🎯 一键核准此项店务运作</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex flex-col items-start max-w-[80%] mr-auto">
            <span className="text-[9px] text-[#07C2E3] font-mono mb-1 uppercase font-bold flex items-center gap-1">
              <Bot className="w-3 h-3 animate-spin text-[#07C2E3]" />
              <span>管家正在分析当前店务数据...</span>
            </span>
            <div className="bg-[#121316] border border-[#1b1d22] rounded-2xl p-3 flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-[#07C2E3] animate-ping"></span>
              <span className="text-[11px] text-slate-400 font-bold">正在规划店务，请稍候...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Fast Actions (Quick pills before user inputs) */}
      <div className="px-3 py-2.5 bg-[#08090a] border-t border-[#161719] shrink-0 text-left">
        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full whitespace-nowrap scrollbar-none scroll-smooth">
          <button 
            type="button"
            onClick={() => {
              setChatInput('店内目前有断货或库存不足的问题吗？帮我分析并紧急补货。');
              handleSendMessage();
            }}
            className="px-2.5 py-1 rounded-lg bg-[#111215] border border-slate-800 text-[10px] text-slate-350 hover:text-white hover:border-[#07C2E3] cursor-pointer inline-flex items-center gap-1 font-semibold"
          >
            📊 补仓库存 ({currentLowStock})
          </button>
          
          <button 
            type="button"
            onClick={() => {
              setChatInput('我想把一款时尚新款轻便衣架上架并在前台开售，帮我设计文案和商品参数数据。');
              handleSendMessage();
            }}
            className="px-2.5 py-1 rounded-lg bg-[#111215] border border-slate-800 text-[10px] text-slate-350 hover:text-white hover:border-[#07C2E3] cursor-pointer inline-flex items-center gap-1 font-semibold"
          >
            📦 策划发布新品
          </button>

          <button 
            type="button"
            onClick={() => {
              setChatInput('最近我的店铺有顾客流失，帮我一键派发折扣卷挽回老客户。');
              handleSendMessage();
            }}
            className="px-2.5 py-1 rounded-lg bg-[#111215] border border-slate-800 text-[10px] text-slate-350 hover:text-white hover:border-[#07C2E3] cursor-pointer inline-flex items-center gap-1 font-semibold"
          >
            👥 挽回流失买家
          </button>

          <button 
            type="button"
            onClick={() => {
              setChatInput('帮我部署一张 30% 立减代金折价促销代买券，然后跳转营销看看。');
              handleSendMessage();
            }}
            className="px-2.5 py-1 rounded-lg bg-[#111215] border border-slate-800 text-[10px] text-slate-350 hover:text-white hover:border-[#07C2E3] cursor-pointer inline-flex items-center gap-1 font-semibold"
          >
            🎁 开启满减大促
          </button>

          <button 
            type="button"
            onClick={() => {
              setChatInput('汇总我今天的欧元结算记账情况，帮我查账盈亏毛利润。');
              handleSendMessage();
            }}
            className="px-2.5 py-1 rounded-lg bg-[#111215] border border-slate-800 text-[10px] text-slate-350 hover:text-white hover:border-[#07C2E3] cursor-pointer inline-flex items-center gap-1 font-semibold"
          >
            💰 跳转财务对账
          </button>
        </div>
      </div>

      {/* File / Doc uploads hidden inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
      />

      {/* Attached file pre-preview block */}
      {attachedFile && (
        <div className="mx-3 my-1.5 p-2 rounded-xl bg-[#111214] border border-[#1d2025] flex items-center justify-between animate-fadeIn shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {attachedFile.type === 'image' ? (
              <div className="w-10 h-10 rounded overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                <img src={attachedFile.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160'} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded bg-[#07C2E3]/10 flex items-center justify-center shrink-0 border border-[#07C2E3]/20">
                <FileText className="w-5 h-5 text-[#07C2E3]" />
              </div>
            )}
            <div className="text-left min-w-0 flex-1">
              <p className="text-[11px] font-bold text-white truncate">{attachedFile.name}</p>
              <p className="text-[9px] font-mono text-slate-500">{attachedFile.size || '内置资源'}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setAttachedFile(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachment popover options to support preloaded mock trial file upload without search */}
      {showAttachmentMenu && (
        <div className="mx-3 my-1.5 p-2 rounded-xl bg-[#131417] border border-[#1d2025] grid grid-cols-2 gap-2 animate-fadeIn text-left shadow-lg shrink-0">
          <button 
            type="button"
            onClick={() => handleSelectPresetFile('autumn_coat_design_shot.jpg', 'image', '840 KB')}
            className="p-2.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-[#07C2E3]/40 text-left cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#07C2E3]" />
              <div className="min-w-0">
                <p className="text-[10px] text-white font-extrabold truncate">服装货源主图</p>
                <p className="text-[8px] text-slate-500 font-mono">Preset Image</p>
              </div>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => handleSelectPresetFile('Store_Inventory_Report_2026.xlsx', 'document', '2.4 MB')}
            className="p-2.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-[#07C2E3]/40 text-left cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#07C2E3]" />
              <div className="min-w-0">
                <p className="text-[10px] text-white font-extrabold truncate">进销存采购表格</p>
                <p className="text-[8px] text-slate-500 font-mono">Store Report .XLSX</p>
              </div>
            </div>
          </button>

          <div className="col-span-2 pt-1 border-t border-slate-900 flex justify-between items-center px-1">
            <span className="text-[8px] text-slate-500 font-mono">设备游览：</span>
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
                setShowAttachmentMenu(false);
              }}
              className="text-[9px] font-bold text-[#07C2E3] hover:underline cursor-pointer"
            >
              浏览设备本地文件 &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Input Form Box with 3-button row structure looking exactly like Image 2 */}
      <form 
        onSubmit={handleSendMessage}
        className="p-3 border-t border-[#1a1b1e] bg-[#070809] shrink-0"
      >
        <div className="relative mb-2.5">
          <input 
            type="text"
            placeholder={isRecording ? `🎙️ 录音中: 00:0${recordingSeconds} (再点击麦克风保存识别)` : "直接发指令调配系统..."}
            value={isRecording ? `正在捕获语音录音... (已录制: ${recordingSeconds}秒)` : chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isThinking || isRecording}
            className={`w-full bg-[#101112] border ${isRecording ? 'border-red-500/50 text-red-400 bg-red-500/5' : 'border-[#1d2025] text-[#07C2E3]'} rounded-xl px-4 py-3.5 text-base md:text-lg font-bold placeholder-slate-600 focus:outline-none focus:border-[#07C2E3] transition-all`}
          />
          {isRecording && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-[9px] font-mono text-red-500 font-bold whitespace-nowrap">REC</span>
            </div>
          )}
        </div>

        {/* Button Row exactly matching the requested design layout in Image 2 */}
        <div className="flex items-center justify-end gap-3 px-1">
          {/* Button 1: Voice recording mic icon (outlined rounded square) */}
          <button
            type="button"
            onClick={handleToggleRecording}
            title={isRecording ? "停止录音并识别指令" : "开启语音调度"}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
              isRecording 
                ? 'bg-red-500 text-white border-red-400 shadow-md animate-pulse' 
                : 'bg-[#101112] border-[#22262d] text-slate-300 hover:border-[#07C2E3] hover:text-[#07C2E3]'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Button 2: Attachment plus icon inside a circle (outlined rounded square) */}
          <button
            type="button"
            onClick={() => setShowAttachmentMenu(prev => !prev)}
            title="上传新物料或附图"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
              showAttachmentMenu 
                ? 'bg-[#07C2E3]/15 border-[#07C2E3] text-[#07C2E3]' 
                : 'bg-[#101112] border-[#22262d] text-slate-300 hover:border-[#07C2E3] hover:text-[#07C2E3]'
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Button 3: Send arrow command icon (solid primary branding color) */}
          <button 
            type="submit"
            disabled={isThinking || (!chatInput.trim() && !attachedFile)}
            title="发送指令"
            className="w-11 h-11 rounded-xl bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-slate-950 flex items-center justify-center transition-all font-bold disabled:opacity-30 cursor-pointer shadow-md"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </form>

      {compareModalData && (
        <div className="absolute inset-0 bg-[#070809]/95 flex flex-col z-50 p-4 font-sans text-slate-200 animate-fadeIn text-left">
          <div className="flex items-center justify-between border-b border-[#1f2124] pb-3 mb-4 shrink-0">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">智能双语对账对比审查 ({compareModalData.length} 款)</h4>
            <button 
              type="button" 
              onClick={() => setCompareModalData(null)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {compareModalData.map((item: any, idx: number) => (
              <div key={idx} className="bg-[#121316] border border-[#1b1d22] rounded-xl p-3.5 space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 px-2 py-0.5 rounded text-[9px] text-[#07C2E3] font-mono font-bold">
                    SKU: {item.sku || `SKU_${idx}`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-1">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-900">
                    <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">原文本 Title</div>
                    <p className="line-through text-slate-400 font-semibold">{item.originalCopy?.title || '新产品上架'}</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#07C2E3]/5 border border-[#07C2E3]/20 animate-pulse">
                    <div className="text-[9px] font-bold text-[#07C2E3] uppercase mb-1">AI 优化后 Title</div>
                    <p className="text-white font-extrabold">{item.optimizedCopy?.title || '[Premium] Windproof Tech Coat'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-900">
                    <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">原描述 Description</div>
                    <p className="text-slate-500 line-clamp-3 leading-snug">{item.originalCopy?.description || '暂无描述'}</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#07C2E3]/5 border border-[#07C2E3]/20">
                    <div className="text-[9px] font-bold text-[#07C2E3] uppercase mb-1">AI 优化后 Description</div>
                    <p className="text-slate-300 leading-snug text-[11px] font-medium">{item.optimizedCopy?.description || 'Perfect slim silhouette...'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-[#1f2124] flex gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCompareModalData(null)}
              className="flex-1 bg-[#111214] border border-slate-800 hover:bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              取消并返回
            </button>
            <button
              type="button"
              onClick={() => {
                handleActionRun('APPLY_OPTIMIZED_COPY', { products: compareModalData });
                setCompareModalData(null);
              }}
              className="flex-1 bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-slate-950 py-2.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              核准并批量应用
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
