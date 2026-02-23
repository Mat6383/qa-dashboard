/**
 * ================================================
 * TESTMO DASHBOARD - Main Application
 * ================================================
 * Dashboard principal de monitoring des tests
 * 
 * Standards:
 * - ISTQB: Test Monitoring & Control
 * - LEAN: Auto-refresh 5m
 * - ITIL: Service Level Management
 * 
 * @author Matou - Neo-Logix QA Lead
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiService from './services/api.service';
import MetricsCards from './components/MetricsCards';
import StatusChart from './components/StatusChart';
import RunsList from './components/RunsList';
import {
  RefreshCw,
  AlertCircle,
  Activity,
  Settings,
  Database,
  CheckCircle2
} from 'lucide-react';
import './styles/App.css';

function App() {
  // État de l'application
  const [projectId, setProjectId] = useState(1); // À configurer
  const [metrics, setMetrics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  /**
   * Vérifie la santé du backend
   */
  const checkBackendHealth = useCallback(async () => {
    try {
      await apiService.healthCheck();
      setBackendStatus('ok');
    } catch (err) {
      setBackendStatus('error');
      console.error('Backend health check failed:', err);
    }
  }, []);

  /**
   * Charge la liste des projets
   */
  const loadProjects = useCallback(async () => {
    try {
      const response = await apiService.getProjects();
      if (response.success && response.data.result) {
        setProjects(response.data.result);
      }
    } catch (err) {
      console.error('Erreur chargement projets:', err);
    }
  }, []);

  /**
   * Charge les métriques du dashboard
   * ISTQB: Test Monitoring
   */
  const loadDashboardMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getDashboardMetrics(projectId);

      if (response.success) {
        setMetrics(response.data);
        setLastUpdate(new Date());
      } else {
        throw new Error(response.error || 'Erreur inconnue');
      }

    } catch (err) {
      setError(err.message);
      console.error('Erreur chargement métriques:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  /**
   * Nettoie le cache backend
   * LEAN: Gestion optimisée
   */
  const handleClearCache = async () => {
    try {
      await apiService.clearCache();
      await loadDashboardMetrics();
      alert('Cache nettoyé avec succès');
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    }
  };

  /**
   * Changement de projet
   */
  const handleProjectChange = (event) => {
    const newProjectId = parseInt(event.target.value);
    setProjectId(newProjectId);
  };

  // Effet initial: vérifier backend et charger données
  useEffect(() => {
    checkBackendHealth();
    loadProjects();
    loadDashboardMetrics();
  }, [checkBackendHealth, loadProjects, loadDashboardMetrics]);

  // Effet: Auto-refresh toutes les 5m (LEAN)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('[Auto-refresh] Rechargement des métriques...');
      loadDashboardMetrics();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, loadDashboardMetrics]);

  /**
   * Rendu du statut du backend
   */
  const renderBackendStatus = () => {
    const statusConfig = {
      checking: { icon: Activity, color: '#F59E0B', text: 'Connexion...' },
      ok: { icon: CheckCircle2, color: '#10B981', text: 'Backend OK' },
      error: { icon: AlertCircle, color: '#EF4444', text: 'Backend Error' }
    };

    const config = statusConfig[backendStatus];
    const Icon = config.icon;

    return (
      <div className="backend-status" style={{ color: config.color }}>
        <Icon size={16} />
        <span>{config.text}</span>
      </div>
    );
  };

  /**
   * Rendu de l'erreur
   */
  if (error && !metrics) {
    return (
      <div className="app-error">
        <AlertCircle size={48} color="#EF4444" />
        <h2>Erreur de Chargement</h2>
        <p>{error}</p>
        <button onClick={loadDashboardMetrics} className="btn-retry">
          <RefreshCw size={16} />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <Database size={32} color="#3B82F6" />
          <div className="header-title">
            <h1>Testmo Dashboard</h1>
            <p className="header-subtitle">
              ISTQB Compliant | LEAN Optimized | ITIL SLA Monitoring
            </p>
          </div>
        </div>

        <div className="header-right">
          {/* Sélecteur de projet */}
          {projects.length > 0 && (
            <select
              value={projectId}
              onChange={handleProjectChange}
              className="project-selector"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}

          {/* Toggle auto-refresh */}
          <button
            className={`btn-toggle ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title="Auto-refresh 5m"
          >
            <RefreshCw size={16} className={autoRefresh ? 'spinning' : ''} />
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </button>

          {/* Refresh manuel */}
          <button
            className="btn-icon"
            onClick={loadDashboardMetrics}
            disabled={loading}
            title="Actualiser"
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>

          {/* Clear cache */}
          <button
            className="btn-icon"
            onClick={handleClearCache}
            title="Nettoyer le cache"
          >
            <Settings size={16} />
          </button>

          {/* Statut backend */}
          {renderBackendStatus()}
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {loading && !metrics ? (
          <div className="loading-container">
            <RefreshCw size={48} className="spinner" />
            <p>Chargement des métriques ISTQB...</p>
          </div>
        ) : (
          <>
            {/* Métriques ISTQB */}
            <section className="section">
              <MetricsCards metrics={metrics} />
            </section>

            {/* Graphiques */}
            <section className="section charts-section">
              <div className="chart-container">
                <StatusChart metrics={metrics} chartType="doughnut" />
              </div>
              <div className="chart-container">
                <StatusChart metrics={metrics} chartType="bar" />
              </div>
            </section>

            {/* Liste des runs */}
            <section className="section">
              <RunsList metrics={metrics} />
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>© 2026 Neo-Logix | QA Dashboard by Matou</span>
          {lastUpdate && (
            <span className="last-update">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
            </span>
          )}
          <span>Standards: ISTQB | LEAN | ITIL</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
