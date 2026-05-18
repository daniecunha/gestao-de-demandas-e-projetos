import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { Meeting, MeetingFormData, Project } from '../../types';
import { Input, Textarea, Select, Button } from '../ui';
import { MEETING_TYPE_LABELS } from '../../utils/statusUtils';

const pautaItemSchema = z.object({
  ordem: z.number(),
  titulo: z.string().min(1, 'Título obrigatório'),
  tempo_min: z.number().min(1).default(10),
});

const schema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  data_hora: z.string().min(1, 'Data/hora é obrigatória'),
  duracao_min: z.coerce.number().min(1).default(60),
  tipo: z.enum(['alinhamento_gestor', 'fornecedor', 'interna', 'tecnica', 'outro']),
  projeto_ids: z.array(z.string()).default([]),
  participantes_texto: z.string().default(''),
  pauta: z.array(pautaItemSchema).default([]),
  notas_gerais: z.string().default(''),
});

type FormValues = z.infer<typeof schema>;

interface MeetingFormProps {
  initialData?: Meeting;
  projects: Project[];
  onSubmit: (data: MeetingFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const TIPO_OPTIONS = Object.entries(MEETING_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));

function toLocalDatetimeInput(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MeetingForm({ initialData, projects, onSubmit, onCancel, loading }: MeetingFormProps) {
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
      titulo: initialData?.titulo ?? '',
      data_hora: initialData?.data_hora ? toLocalDatetimeInput(initialData.data_hora) : '',
      duracao_min: initialData?.duracao_min ?? 60,
      tipo: initialData?.tipo ?? 'interna',
      projeto_ids: initialData?.projeto_ids ?? [],
      participantes_texto: initialData?.participantes.join(', ') ?? '',
      pauta: initialData?.pauta ?? [],
      notas_gerais: initialData?.notas_gerais ?? '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'pauta' });
  const projetosSelecionados = watch('projeto_ids');

  const toggleProjeto = (id: string) => {
    const current = projetosSelecionados ?? [];
    setValue(
      'projeto_ids',
      current.includes(id) ? current.filter((p) => p !== id) : [...current, id]
    );
  };

  const handleFormSubmit = async (values: FormValues) => {
    const participantes = values.participantes_texto
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const pauta = values.pauta.map((item, i) => ({ ...item, ordem: i + 1 }));

    await onSubmit({
      titulo: values.titulo,
      data_hora: new Date(values.data_hora).toISOString(),
      duracao_min: values.duracao_min,
      tipo: values.tipo,
      projeto_ids: values.projeto_ids ?? [],
      participantes,
      pauta,
      decisoes: initialData?.decisoes ?? [],
      encaminhamentos: initialData?.encaminhamentos ?? [],
      notas_gerais: values.notas_gerais ?? '',
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <Input
        label="Título da reunião"
        required
        error={errors.titulo?.message}
        {...register('titulo')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Data e hora"
          type="datetime-local"
          required
          error={errors.data_hora?.message}
          {...register('data_hora')}
        />
        <Input
          label="Duração (minutos)"
          type="number"
          min={1}
          {...register('duracao_min')}
        />
      </div>

      <Controller
        name="tipo"
        control={control}
        render={({ field }) => (
          <Select label="Tipo de reunião" options={TIPO_OPTIONS} {...field} />
        )}
      />

      <Input
        label="Participantes"
        placeholder="Nome1, Nome2, Nome3..."
        hint="Separe os nomes por vírgula"
        {...register('participantes_texto')}
      />

      {/* Projetos relacionados */}
      {projects.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Projetos relacionados
          </label>
          <div className="flex flex-wrap gap-2">
            {projects.map((p) => {
              const selecionado = (projetosSelecionados ?? []).includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProjeto(p.id)}
                  className={[
                    'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                    selecionado
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400',
                  ].join(' ')}
                  style={selecionado ? { backgroundColor: p.cor, borderColor: p.cor } : {}}
                >
                  {p.nome}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pauta */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Pauta</label>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            icon={<Plus size={13} />}
            onClick={() => append({ ordem: fields.length + 1, titulo: '', tempo_min: 10 })}
          >
            Adicionar item
          </Button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <GripVertical size={14} className="text-gray-300 cursor-grab shrink-0" />
              <span className="text-xs text-gray-400 w-5 shrink-0">{index + 1}.</span>
              <Input
                className="flex-1"
                placeholder="Item de pauta"
                error={errors.pauta?.[index]?.titulo?.message}
                {...register(`pauta.${index}.titulo`)}
              />
              <Input
                type="number"
                min={1}
                className="w-20"
                placeholder="min"
                {...register(`pauta.${index}.tempo_min`, { valueAsNumber: true })}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {fields.length === 0 && (
            <p className="text-sm text-gray-400">Nenhum item de pauta adicionado.</p>
          )}
        </div>
      </div>

      <Textarea
        label="Notas gerais"
        rows={3}
        {...register('notas_gerais')}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Salvar alterações' : 'Criar reunião'}
        </Button>
      </div>
    </form>
  );
}
