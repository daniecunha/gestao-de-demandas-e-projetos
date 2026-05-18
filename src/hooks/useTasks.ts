import { useEffect } from 'react';
import { useTasksStore } from '../store/tasksStore';

export function useTasks(projeto_id?: string) {
  const store = useTasksStore();

  useEffect(() => {
    store.fetchTasks(projeto_id);
  }, [projeto_id]);

  return store;
}
