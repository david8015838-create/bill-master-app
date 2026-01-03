import React, { useState, useEffect } from 'react';
import { Participant, Expense, SettlementResult } from '../types';
import { calculateSettlement } from '../utils/calculation';
import { ArrowRight, Sparkles, CheckCircle2, RotateCcw, Copy, Receipt } from 'lucide-react';
import { generateAIReport } from '../services/geminiService';

interface Props {
  participants: Participant[];
  expenses: Expense[];
  onReset: () => void;
  onBack: () => void;
}

const StepSettlement: React.FC<Props> = ({ participants, expenses, onReset, onBack }) => {
  const [result, setResult] = useState<SettlementResult | null>(null);
  const [aiReport, setAiReport] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const res = calculateSettlement(expenses, participants);
    setResult(res);
  }, [expenses, participants]);

  const handleGenerateAI = async () => {
    if (!result) return;
    setIsAiLoading(true);
    const report = await generateAIReport(participants, expenses, result);
    setAiReport(report);
    setIsAiLoading(false);
  };

  const getParticipantName = (id: string) => participants.find(p => p.id === id)?.name || '未知';

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!result) return <div>計算中...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">結算報告</h2>
        <p className="text-slate-500">最優化轉帳方案，減少轉帳次數</p>
      </div>

      {/* 1. Final Actions - Priority */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" /> 最終撥款行動
          </h3>
          <span className="text-xs bg-slate-700 px-2 py-1 rounded">
            共 {result.actions.length} 筆轉帳
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {result.actions.length === 0 ? (
            <div className="p-8 text-center text-emerald-600 font-medium">
              🎉 完美平衡！不需要任何轉帳。
            </div>
          ) : (
            result.actions.map((action, idx) => {
              const fromName = getParticipantName(action.fromId);
              const toName = getParticipantName(action.toId);
              const copyText = `${fromName} 給 ${toName} $${action.amount}`;
              
              return (
                <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center min-w-[60px]">
                      <span className="font-bold text-slate-700">{fromName}</span>
                      <span className="text-xs text-red-500 font-medium">支付</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-emerald-600 font-bold text-xl">${action.amount}</span>
                      <ArrowRight size={16} className="text-slate-300 mt-1" />
                    </div>
                    <div className="flex flex-col items-center min-w-[60px]">
                      <span className="font-bold text-slate-700">{toName}</span>
                      <span className="text-xs text-emerald-500 font-medium">接收</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCopy(copyText, idx)}
                    className="ml-4 p-2 text-slate-300 hover:text-blue-600 transition-colors relative"
                    title="複製文字"
                  >
                    {copiedIndex === idx ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Copy size={20} />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Expenses List (Replaces Balances Table) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h3 className="font-bold text-blue-900 flex items-center gap-2">
             <Receipt size={20} className="text-blue-600" /> 消費明細列表
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {expenses.map((expense) => (
            <div key={expense.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-800 text-lg">{expense.title}</span>
                <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-2.5 py-0.5 rounded-full">
                  ${expense.amount.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-xs mb-0.5">付款人</span>
                  <span className="font-medium text-slate-700">{getParticipantName(expense.payerId)}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-xs mb-0.5">參與分攤 ({expense.involvedIds.length}人)</span>
                  <span className="font-medium text-slate-700 leading-snug block">
                    {expense.involvedIds.map(id => getParticipantName(id)).join('、')}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
             <div className="p-6 text-center text-slate-400">尚無消費紀錄</div>
          )}
        </div>
      </div>

      {/* 3. AI Analysis Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-indigo-900 flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={20} />
            AI 智能分析
          </h3>
          {!aiReport && (
             <button
             onClick={handleGenerateAI}
             disabled={isAiLoading}
             className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1"
           >
             {isAiLoading ? '分析中...' : '生成報告'}
           </button>
          )}
        </div>
        
        {aiReport ? (
          <div className="prose prose-sm prose-indigo max-w-none text-slate-700 whitespace-pre-line bg-white/50 p-4 rounded-xl border border-indigo-100/50">
            {aiReport}
          </div>
        ) : (
          <p className="text-sm text-indigo-400">
            點擊「生成報告」讓 AI 為您分析消費習慣並提供有趣的總結。
          </p>
        )}
      </div>

       {/* Actions */}
       <div className="flex gap-4 justify-center pt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-xl text-slate-500 font-medium hover:bg-slate-100 transition-colors"
        >
          修改消費
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-2 rounded-xl text-red-500 font-medium hover:bg-red-50 transition-colors"
        >
          <RotateCcw size={18} />
          重新開始
        </button>
      </div>
    </div>
  );
};

export default StepSettlement;