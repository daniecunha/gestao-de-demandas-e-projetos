import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import type { Task, TaskFormData, Project } from '../../types';
import { Input, Textarea, Select, Button } from '../ui';
import { OkrSelector } from '../ui/OkrSelector';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../../utils/statusUtils';

const subtaskSchema = z.object({
  id: z.string(),
  titulo: z.string().min(1),
  concluida: z.boolean(),
});

const schema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(500),
  projeto_id: z.string().min(1, 'Projeto é obrigatório'),
  prioridade: z.enum(['critica', 'alta', 'media', 'baixa']),
  status: z.enum(['a_fazer', 'em_andamento', 'bloqueado', 'concluido', 'cancelado']),
  prazo: z.string().nullable().default(null),
  notas: z.string().default(''),
  subtarefas: z.array(subtaskSchema).default([]),
  reuniao_id: z.string().nullable().default(null),
  valor_negocio: z.string().default(''),
  okrs: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;

interface TaskFormProps {
  initialData?: Task;
  projects: Project[];
  defaultProjectId?: string;
  defaultReuniaoId?: string;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PRIORITY_OPTIONS = Object.entries(TASK_PRIORITY_LABELS).map(([v, l]) => ({
  value: v, label: l,
}));

const STATUS_OPTIONS = Object.entries(TASK_STATUS_LABELS).map(([v, l]) => ({
  value: v, label: l,
}));

export function TaskForm({
  initialData,
  projects,
  defaultProjectId,
  defaultReuniaoId,
  onSubmit,
  onCancel,
  loading,
}: TaskFormProps) {
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
      projeto_id: initialData?.projeto_id ?? defaultProjectId ?? '',
      prioridade: initialData?.prioridade ?? 'media',
      status: initialData?.status ?? 'a_fazer',
      prazo: initialData?.prazo?.split('T')[0] ?? null,
      notas: initialData?.notas ?? '',
      subtarefas: initialData?.subtarefas ?? [],
      reuniao_id: initialData?.reuniao_id ?? defaultReuniaoId ?? null,
      valor_negocio: initialData?.valor_negocio ?? '',
      okrs: initialData?.okrs ?? [],
    },
  });

  const okrsSelecionados = watch('okrs');

  const { fields, append, remove } = useFieldArray({ control, name: 'subtarefas' });

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.nome }));

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit({
      ...values,
      prazo: values.prazo || null,
      reuniao_id: values.reuniao_id || null,
      valor_negocio: values.valor_negocio ?? '',
      okrs: values.okrs ?? [],
    } as TaskFormData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Título da tarefa"
        required
        error={errors.titulo?.message}
        {...register('titulo')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="projeto_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Projeto"
              required
              options={projectOptions}
              placeholder="Selecionar projeto"
              error={errors.projeto_id?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="prioridade"
          control={control}
          render={({ field }) => (
            <Select
              label="Prioridade"
              options={PRIORITY_OPTIONS}
              {...field}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select label="Status" options={STATUS_OPTIONS} {...field} />
          )}
        />

        <Input
          label="Prazo"
          type="date"
          {...register('prazo')}
        />
      </div>

      <Textarea
        label="Notas / Contexto"
        rows={3}
        {...register('notas')}
      />

      {/* Subtarefas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Subtarefas</label>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            icon={<Plus size={13} />}
            onClick={() => append({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, titulo: '', concluida: false })}
          >
            Adicionar
          </Button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Controller
                name={`subtarefas.${index}.concluida`}
                control={control}
                render={({ field: f }) => (
                  <input
                    type="checkbox"
                    checked={f.value}
                    onChange={f.onChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                )}
              />
              <Input
                className="flex-1"
                placeholder="Descrição da subtarefa"
                {...register(`subtarefas.${index}.titulo`)}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Valor para o Negócio */}
      <Textarea
        label="Valor para o Negócio"
        rows={2}
        hint="Descreva o benefício ou impacto que esta tarefa traz à empresa."
        {...register('valor_negocio')}
      />

      {/* OKRs */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">OKRs relacionados</label>
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
          {initialData ? 'Salvar alterações' : 'Criar tarefa'}
        </Button>
      </div>
    </form>
  );
}
