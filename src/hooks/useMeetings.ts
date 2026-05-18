import { useEffect, useState } from 'react';
import { meetingsService } from '../services/meetingsService';
import type { Meeting, MeetingFormData } from '../types';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await meetingsService.listar();
      setMeetings(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const createMeeting = async (data: MeetingFormData): Promise<Meeting> => {
    const meeting = await meetingsService.criar(data);
    setMeetings((prev) => [meeting, ...prev]);
    return meeting;
  };

  const updateMeeting = async (id: string, data: Partial<MeetingFormData>): Promise<void> => {
    const updated = await meetingsService.atualizar(id, data);
    setMeetings((prev) => prev.map((m) => (m.id === id ? updated : m)));
  };

  const deleteMeeting = async (id: string): Promise<void> => {
    await meetingsService.excluir(id);
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  return {
    meetings,
    loading,
    error,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  };
}
