import { useEffect } from 'react';
import { useProjectsStore } from '../store/projectsStore';

export function useProjects() {
  const store = useProjectsStore();

  useEffect(() => {
    if (store.projects.length === 0 && !store.loading) {
      store.fetchProjects();
    }
  }, []);

  return store;
}
