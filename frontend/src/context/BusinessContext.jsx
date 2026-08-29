import { createContext, useContext, useEffect, useState } from 'react';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [activeBusiness, setActiveBusinessState] = useState(() => {
    const stored = localStorage.getItem('bizguide_active_business');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (activeBusiness) {
      localStorage.setItem('bizguide_active_business', JSON.stringify(activeBusiness));
    } else {
      localStorage.removeItem('bizguide_active_business');
    }
  }, [activeBusiness]);

  return (
    <BusinessContext.Provider value={{ activeBusiness, setActiveBusiness: setActiveBusinessState }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
}
