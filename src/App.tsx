import React, { useState } from 'react';
import { AppStep, Expense, Participant } from './types.ts';
import StepParticipants from './components/StepParticipants.tsx';
import StepExpenses from './components/StepExpenses.tsx';
import StepSettlement from './components/StepSettlement.tsx';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.PARTICIPANTS);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const handleReset = () => {
    if (window.confirm('確定要重新開始嗎？所有資料將會清空。')) {
      setParticipants([]);
      setExpenses([]);
      setStep(AppStep.PARTICIPANTS);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              ¥
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">分帳大師</h1>
          </div>
          
          <div className="flex gap-1">
            {[AppStep.PARTICIPANTS, AppStep.EXPENSES, AppStep.SETTLEMENT].map((s, i) => (
              <div 
                key={s}
                className={`w-2 h-2 rounded-full ${
                  step === s ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {step === AppStep.PARTICIPANTS && (
          <StepParticipants
            participants={participants}
            setParticipants={setParticipants}
            onNext={() => setStep(AppStep.EXPENSES)}
          />
        )}

        {step === AppStep.EXPENSES && (
          <StepExpenses
            participants={participants}
            expenses={expenses}
            setExpenses={setExpenses}
            onNext={() => setStep(AppStep.SETTLEMENT)}
            onBack={() => setStep(AppStep.PARTICIPANTS)}
          />
        )}

        {step === AppStep.SETTLEMENT && (
          <StepSettlement
            participants={participants}
            expenses={expenses}
            onBack={() => setStep(AppStep.EXPENSES)}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>© 2024 分帳大師 · 智能分帳助手</p>
      </footer>
    </div>
  );
};

export default App;
