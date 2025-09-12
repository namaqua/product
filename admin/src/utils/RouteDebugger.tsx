import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteDebugger() {
  const location = useLocation();
  
  useEffect(() => {
    console.log('🛣️ Current route:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    });
  }, [location]);
  
  // Also log on mount
  useEffect(() => {
    console.log('🚀 RouteDebugger mounted. Initial path:', location.pathname);
  }, []);
  
  return null;
}
