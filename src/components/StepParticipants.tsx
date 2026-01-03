import React, { useState } from 'react';
import { Participant } from '../types';
import { Plus, Trash2, Users } from 'lucide-react';

interface Props {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  onNext: () => void;
}

const StepParticipants: React.FC<Props> = ({ participants, setParticipants, onNext }) => {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      const newId = Date.now().toString();
      setParticipants([...participants, { id: newId, name: newName.trim() }]);
      setNewName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleRemove = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-2">
          <Users size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">建立參與者名單</h2>
        <p className="text-slate-500">首先，請輸入所有參與分帳的好友姓名。</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入姓名 (例如: 小明)"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">新增</span>
          </button>
        </div>

        <div className="space-y-3">
          {participants.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
              尚無參與者，請從上方新增
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                >
                  <span className="font-medium text-slate-700">{p.name}</span>
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={participants.length < 2}
          className="w-full sm:w-auto bg-slate-800 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200"
        >
          下一步：新增消費 &rarr;
        </button>
      </div>
    </div>
  );
};

export default StepParticipants;