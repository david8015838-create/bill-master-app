import React, { useState } from 'react';
import { Expense, Participant } from '../types';
import { Plus, Trash2, Receipt, DollarSign, User, Users, Check, AlertCircle } from 'lucide-react';

interface Props {
  participants: Participant[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  onNext: () => void;
  onBack: () => void;
}

const StepExpenses: React.FC<Props> = ({
  participants,
  expenses,
  setExpenses,
  onNext,
  onBack,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState<string>(participants[0]?.id || '');
  const [involvedIds, setInvolvedIds] = useState<string[]>(participants.map((p) => p.id));

  const handleAddExpense = () => {
    if (!title || !amount || !payerId || involvedIds.length === 0) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      title,
      amount: parseFloat(amount),
      payerId,
      involvedIds,
      date: new Date().toISOString(),
    };

    setExpenses([...expenses, newExpense]);
    resetForm();
    setIsFormOpen(false);
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setPayerId(participants[0]?.id || '');
    setInvolvedIds(participants.map((p) => p.id));
  };

  const toggleInvolved = (id: string) => {
    setInvolvedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const selectAll = () => setInvolvedIds(participants.map((p) => p.id));

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const getParticipantName = (id: string) => participants.find((p) => p.id === id)?.name || '未知';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="text-blue-600" />
            消費紀錄
          </h2>
          <p className="text-slate-500">輸入每一筆支出，系統將自動計算均分。</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          記一筆
        </button>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <div className="mb-2">尚無消費紀錄</div>
            <div className="text-sm">點擊右上角「記一筆」開始新增</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <div key={expense.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-slate-800 text-lg">{expense.title}</span>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      ${expense.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      付款: <span className="font-medium text-slate-700">{getParticipantName(expense.payerId)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      分攤: {expense.involvedIds.length} 人
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeExpense(expense.id)}
                  className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          &larr; 修改名單
        </button>
        <button
          onClick={onNext}
          disabled={expenses.length === 0}
          className="bg-slate-800 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200"
        >
          查看結算結果 &rarr;
        </button>
      </div>

      {/* Add Expense Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">新增消費</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">項目名稱</label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="例如: 晚餐"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">金額</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payer */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">誰先付的錢？</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {participants.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPayerId(p.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                        payerId === p.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Involved */}
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">分給誰？</label>
                  <button onClick={selectAll} className="text-xs text-blue-600 font-medium hover:underline">
                    全選
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {participants.map((p) => {
                    const isSelected = involvedIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleInvolved(p.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border flex items-center justify-between group ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {p.name}
                        {isSelected && <Check size={14} className="text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
                {involvedIds.length === 0 && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> 至少需要一人分攤
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsFormOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddExpense}
                disabled={!title || !amount || involvedIds.length === 0}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-100"
              >
                確定新增
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepExpenses;