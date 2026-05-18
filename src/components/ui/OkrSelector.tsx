import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { OKR_OPCOES } from '../../types';

interface OkrSelectorProps {
  value: string[];
  onChange: (okrs: string[]) => void;
}

export function OkrSelector({ value, onChange }: OkrSelectorProps) {
  const [customInput, setCustomInput] = useState('');

  const toggle = (okr: string) => {
    if (value.includes(okr)) {
      onChange(value.filter((o) => o !== okr));
    } else {
      onChange([...value, okr]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setCustomInput('');
  };

  const remove = (okr: string) => onChange(value.filter((o) => o !== okr));

  return (
    <div className="space-y-3">
      {/* Sugestões predefinidas */}
      <div className="flex flex-wrap gap-2">
        {OKR_OPCOES.map((okr) => {
          const ativo = value.includes(okr);
          return (
            <button
              key={okr}
              type="button"
              onClick={() => toggle(okr)}
              className={[
                'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                ativo
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-violet-400',
              ].join(' ')}
            >
              {okr}
            </button>
          );
        })}
      </div>

      {/* OKRs personalizados selecionados que não são predefinidos */}
      {value.filter((o) => !(OKR_OPCOES as readonly string[]).includes(o)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value
            .filter((o) => !(OKR_OPCOES as readonly string[]).includes(o))
            .map((okr) => (
              <span
                key={okr}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-600 text-white"
              >
                {okr}
                <button type="button" onClick={() => remove(okr)} className="hover:opacity-70">
                  <X size={11} />
                </button>
              </span>
            ))}
        </div>
      )}

      {/* Input personalizado */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="OKR personalizado..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="button"
          onClick={addCustom}
          className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Plus size={12} /> Adicionar
        </button>
      </div>
    </div>
  );
}
