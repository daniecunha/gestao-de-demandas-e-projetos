import { useEffect } from 'react';
import { useTechnologiesStore } from '../store/technologiesStore';

export function useTechnologies() {
  const {
    technologies,
    loading,
    error,
    fetchTechnologies,
    createTechnology,
    updateTechnology,
    deleteTechnology,
  } = useTechnologiesStore();

  useEffect(() => {
    if (technologies.length === 0 && !loading) {
      fetchTechnologies();
    }
  }, []);

  return {
    technologies,
    loading,
    error,
    fetchTechnologies,
    createTechnology,
    updateTechnology,
    deleteTechnology,
  };
}
