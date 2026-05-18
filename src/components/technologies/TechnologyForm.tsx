import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Zap, Database, Bot, Brain, Cpu, Globe, Settings, Code2, Server, Layers,
  Plane, Truck, Factory, Workflow,
} from 'lucide-react';
import type { Technology, TechnologyFormData } from '../../types';
import { Input, Textarea, Button } from '../ui';

const ICONES = [
  { value: 'cpu',      label: 'Chip',          Icon: Cpu      },
  { value: 'zap',      label: 'Energia',       Icon: Zap      },
  { value: 'database', label: 'Banco de dados', Icon: Database },
  { value: 'bot',      label: 'Robô / RPA',    Icon: Bot      },
  { value: 'brain',    label: 'IA / ML',       Icon: Brain    },
  { value: 'workflow', label: 'OutSystems',    Icon: Workflow  },
  { value: 'factory',  label: 'SAP / ERP',     Icon: Factory  },
  { value: 'plane',    label: 'Aviação',       Icon: Plane    },
  { value: 'truck',    label: 'Logística',     Icon: Truck    },
  { value: 'globe',    label: 'Web',           Icon: Globe    },
  { value: 'settings', label: 'Config',        Icon: Settings },
  { value: 'code',     label: 'Código',        Icon: Code2    },
  { value: 'server',   label: 'Servidor',      Icon: Server   },
  { value: 'layers',   label: 'Camadas',       Icon: Layers   },
];

const CORES_PREDEFINIDAS = [
  '#CC0000', '#0070F2', '#FF6B00', '#7C3AED',
  '#1F7A4D', '#2E75B6', '#C0392B', '#16A085',
  '#F39C12', '#2C3E50',
];

const schema = z.object({
  nome:     z.string().min(1, 'Nome é obrigatório').max(255),
  descricao:z.string().default(''),
  cor:      z.string().default('#2E75B6'),
  icone:    z.string().default('cpu'),
});

type FormValues = z.infer<typeof schema>;

interface TechnologyFormProps {
  initialData?: Technology;
  onSubmit: (data: TechnologyFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function TechnologyForm({ initialData, onSubmit, onCancel, loading }: TechnologyFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome:      initialData?.nome      ?? '',
      descricao: initialData?.descricao ?? '',
      cor:       initialData?.cor       ?? '#2E75B6',
      icone:     initialData?.icone     ?? 'cpu',
    },
  });

  const corAtual   = watch('cor');
  const iconeAtual = watch('icone');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Nome da tecnologia / plataforma"
        required
        error={errors.nome?.message}
        placeholder="Ex: OutSystems, SAP, RPA, IA..."
        {...register('nome')}
      />

      <Textarea
        label="Descrição"
        rows={2}
        placeholder="Descreva brevemente esta tecnologia ou plataforma"
        {...register('descricao')}
      />

      {/* Ícone */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Ícone</label>
        <div className="flex flex-wrap gap-2">
          {ICONES.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('icone', value)}
              title={label}
              className={[
                'w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all',
                iconeAtual === value
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500',
              ].join(' ')}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Cor */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Cor identificadora</label>
        <div className="flex items-center gap-2 flex-wrap">
          {CORES_PREDEFINIDAS.map((cor) => (
            <button
              key={cor}
              type="button"
              onClick={() => setValue('cor', cor)}
              className={[
                'w-7 h-7 rounded-full border-2 transition-all',
                corAtual === cor ? 'border-gray-800 scale-110' : 'border-transparent',
              ].join(' ')}
              style={{ backgroundColor: cor }}
              title={cor}
            />
          ))}
          <input
            type="color"
            value={corAtual ?? '#2E75B6'}
            onChange={(e) => setValue('cor', e.target.value)}
            className="w-7 h-7 rounded-full cursor-pointer border border-gray-300"
            title="Personalizar cor"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Salvar alterações' : 'Criar tecnologia'}
        </Button>
      </div>
    </form>
  );
}
