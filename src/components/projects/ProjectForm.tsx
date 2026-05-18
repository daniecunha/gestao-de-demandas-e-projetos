import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Project, ProjectFormData } from '../../types';
import { TECNOLOGIAS } from '../../types';
import { Input, Textarea, Select, Button } from '../ui';
import { OkrSelector } from '../ui/OkrSelector';
import { PROJECT_STATUS_LABELS } from '../../utils/statusUtils';
import { useTechnologies } from '../../hooks/useTechnologies';

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  descricao: z.string().default(''),
  status: z.enum(['planejamento', 'em_execucao', 'aguardando', 'concluido', 'pausado']),
  tecnologia_id: z.string().nullable().default(null),
  reuniao_origem_id: z.string().nullable().default(null),
  tecnologias: z.array(z.string()).default([]),
  parceiro: z.string().default(''),
  cor: z.string().default('#2E75B6'),
  data_inicio: z.string().nullable().default(null),
  data_previsao: z.string().nullable().default(null),
  contexto: z.string().default(''),
  valor_negocio: z.string().default(''),
  okrs: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const STATUS_OPTIONS = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const CORES_PREDEFINIDAS = [
  '#2E75B6', '#1F7A4D', '#C0392B', '#8E44AD',
  '#F39C12', '#16A085', '#2C3E50', '#E74C3C',
];

export function ProjectForm({ initialData, onSubmit, onCancel, loading }: ProjectFormProps) {
  const { technologies } = useTechnologies();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: initialData?.nome ?? '',
      descricao: initialData?.descricao ?? '',
      status: initialData?.status ?? 'planejamento',
      tecnologia_id: initialData?.tecnologia_id ?? null,
      reuniao_origem_id: initialData?.reuniao_origem_id ?? null,
      tecnologias: initialData?.tecnologias ?? [],
      parceiro: initialData?.parceiro ?? '',
      cor: initialData?.cor ?? '#2E75B6',
      data_inicio: initialData?.data_inicio?.split('T')[0] ?? null,
      data_previsao: initialData?.data_previsao?.split('T')[0] ?? null,
      contexto: initialData?.contexto ?? '',
      valor_negocio: initialData?.valor_negocio ?? '',
      okrs: initialData?.okrs ?? [],
    },
  });

  const corAtual = watch('cor');
  const tecnologiasSelecionadas = watch('tecnologias');
  const okrsSelecionados = watch('okrs');

  const toggleTecnologia = (tech: string) => {
    const current = tecnologiasSelecionadas ?? [];
    if (current.includes(tech)) {
      setValue('tecnologias', current.filter((t) => t !== tech));
    } else {
      setValue('tecnologias', [...current, tech]);
    }
  };

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit({
      ...values,
      tecnologia_id: values.tecnologia_id || null,
      reuniao_origem_id: values.reuniao_origem_id || null,
      tecnologias: values.tecnologias ?? [],
      parceiro: values.parceiro ?? '',
      cor: values.cor ?? '#2E75B6',
      contexto: values.contexto ?? '',
      descricao: values.descricao ?? '',
      data_inicio: values.data_inicio || null,
      data_previsao: values.data_previsao || null,
      valor_negocio: values.valor_negocio ?? '',
      okrs: values.okrs ?? [],
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <Input
        label="Nome do projeto"
        required
        error={errors.nome?.message}
        {...register('nome')}
      />

      <Textarea
        label="Descrição"
        rows={2}
        {...register('descricao')}
      />

      {/* Tecnologia (plataforma pai) */}
      <Controller
        name="tecnologia_id"
        control={control}
        render={({ field }) => (
          <Select
            label="Tecnologia / Plataforma"
            options={[
              { value: '', label: '— Sem tecnologia —' },
              ...technologies.map((t) => ({ value: t.id, label: t.nome })),
            ]}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value || null)}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              {...field}
            />
          )}
        />
        <Input
          label="Parceiro / Fornecedor"
          {...register('parceiro')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Data de início"
          type="date"
          {...register('data_inicio')}
        />
        <Input
          label="Previsão de conclusão"
          type="date"
          {...register('data_previsao')}
        />
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

      {/* Stack técnica */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Stack / Tags técnicas</label>
        <div className="flex flex-wrap gap-2">
          {TECNOLOGIAS.map((tech) => {
            const selecionada = (tecnologiasSelecionadas ?? []).includes(tech);
            return (
              <button
                key={tech}
                type="button"
                onClick={() => toggleTecnologia(tech)}
                className={[
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                  selecionada
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400',
                ].join(' ')}
              >
                {tech}
              </button>
            );
          })}
        </div>
      </div>

      <Textarea
        label="Contexto / Histórico / Decisões"
        rows={4}
        hint="Campo livre para registrar contexto, decisões, links e histórico do projeto."
        {...register('contexto')}
      />

      {/* Valor para o Negócio */}
      <Textarea
        label="Valor para o Negócio"
        rows={3}
        hint="Descreva o benefício, economia, receita ou impacto que este projeto traz à empresa."
        {...register('valor_negocio')}
      />

      {/* OKRs */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">OKRs relacionados</label>
        <p className="text-xs text-gray-400 mb-2">Selecione ou adicione os objetivos estratégicos que este projeto contribui.</p>
        <OkrSelector
          value={okrsSelecionados ?? []}
          onChange={(okrs) => setValue('okrs', okrs)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Salvar alterações' : 'Criar projeto'}
        </Button>
      </div>
    </form>
  );
}
