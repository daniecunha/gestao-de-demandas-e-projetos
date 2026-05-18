import { useEffect, useState } from 'react';
import { reportsService } from '../services/reportsService';
import type { Report, ReportFormData } from '../types';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.listar();
      setReports(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const createReport = async (data: ReportFormData): Promise<Report> => {
    const report = await reportsService.criar(data);
    setReports((prev) => [report, ...prev]);
    return report;
  };

  const updateReport = async (id: string, data: Partial<ReportFormData>): Promise<void> => {
    const updated = await reportsService.atualizar(id, data);
    setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const deleteReport = async (id: string): Promise<void> => {
    await reportsService.excluir(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
  };
}
