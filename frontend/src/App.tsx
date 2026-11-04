import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { TabId } from './components/Sidebar';
import { fetchHealth } from './api/client';
import { HealthResponse } from './api/types';
import { Overview } from './pages/Overview';
import { DatasetManagement } from './pages/DatasetManagement';
import { SalesAnalytics } from './pages/SalesAnalytics';
import { ForecastStudio } from './pages/ForecastStudio';
import { InventoryInsights } from './pages/InventoryInsights';
import { ModelPerformance } from './pages/ModelPerformance';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err: unknown) {
      setHealth(null);
      if (err instanceof Error) {
        setHealthError(err.message);
      } else {
        setHealthError('Failed to connect to backend API');
      }
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview onNavigate={setActiveTab} health={health} />;
      case 'datasets':
        return <DatasetManagement />;
      case 'analytics':
        return <SalesAnalytics />;
      case 'forecast':
        return <ForecastStudio />;
      case 'inventory':
        return <InventoryInsights />;
      case 'performance':
        return <ModelPerformance />;
      case 'settings':
        return (
          <Settings
            health={health}
            healthLoading={healthLoading}
            healthError={healthError}
            onRefreshHealth={checkHealth}
          />
        );
      default:
        return <Overview onNavigate={setActiveTab} health={health} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      health={health}
      healthLoading={healthLoading}
      healthError={healthError}
      onRefreshHealth={checkHealth}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;

