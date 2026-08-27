import { useState, useEffect } from 'react';
import { fetchAllServices, type BackendService } from '../api/servicesApi';

export function useServices() {
  const [services, setServices] = useState<BackendService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllServices()
      .then(setServices)
      .catch(err => console.error('Failed to load services', err))
      .finally(() => setLoading(false));
  }, []);

  return { services, loading };
}
