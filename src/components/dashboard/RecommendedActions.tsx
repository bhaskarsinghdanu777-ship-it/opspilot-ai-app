import React, { useState } from 'react';
import { recommendedActions as initialActions } from '@/src/lib/mock-data/overview';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from '@/src/lib/router';

export const RecommendedActions: React.FC = () => {
  const [actions, setActions] = useState(initialActions);
  const { navigate } = useRouter();

  const toggleAction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActions((prev) =>
      prev.map((act) =>
        act.id === id ? { ...act, completed: !act.completed } : act
      )
    );
  };

  const handleActionRoute = (category: string) => {
    if (category === 'inventory') navigate('/inventory');
    else if (category === 'customer') navigate('/customers');
    else navigate('/sales');
  };

  return (
    <div id="dashboard-recommended-actions-card" className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Recommended Actions</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {actions.filter((a) => a.completed).length}/{actions.length} Done
        </span>
      </div>

      <div className="p-5 space-y-3">
        {actions.map((act, index) => (
          <div
            key={act.id}
            onClick={() => handleActionRoute(act.category)}
            className={`flex items-start gap-4 p-3 rounded-lg border transition-all cursor-pointer ${
              act.completed
                ? 'bg-slate-50/50 border-slate-100 opacity-60'
                : index === 0
                ? 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
                : 'border-slate-100 hover:bg-slate-50'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-bold text-[10px]">
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={`text-xs font-bold ${
                    act.completed ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {act.title}
                </h4>
                <button
                  onClick={(e) => toggleAction(act.id, e)}
                  className="text-slate-300 hover:text-emerald-600 transition-colors shrink-0"
                  title={act.completed ? 'Mark as pending' : 'Mark as done'}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      act.completed ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                </button>
              </div>

              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                {act.description}
              </p>

              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {act.impact}
                </span>
                <span className="text-blue-600 font-bold hover:underline flex items-center gap-0.5">
                  Action <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
