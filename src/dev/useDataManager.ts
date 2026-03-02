import { useState, useEffect, useCallback } from 'react';

type FileKey = 'database' | 'dataschema' | 'collectionconfig';

export function useDataFile<T>(fileKey: FileKey) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/__data-manager/${fileKey}`);
      if (!res.ok) throw new Error(`Failed to fetch ${fileKey}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [fileKey]);

  const saveData = useCallback(async (newData: T) => {
    try {
      const res = await fetch(`/__data-manager/${fileKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      if (!res.ok) throw new Error('Save failed');
      setData(newData);
      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }, [fileKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, saveData, refetch: fetchData };
}
