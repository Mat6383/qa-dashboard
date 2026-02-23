/**
 * ================================================
 * TESTMO SERVICE - API Integration
 * ================================================
 * Service responsable de toutes les interactions avec l'API Testmo
 * 
 * Standards appliqués:
 * - ISTQB: Métriques de test standardisées
 * - ITIL: Gestion d'incidents et logging
 * - LEAN: Optimisation des requêtes et cache
 * 
 * @author Matou - Neo-Logix QA Lead
 * @version 1.0.0
 */

const axios = require('axios');
const logger = require('./logger.service');

class TestmoService {
  constructor() {
    this.baseURL = process.env.TESTMO_URL;
    this.token = process.env.TESTMO_TOKEN;
    this.timeout = parseInt(process.env.API_TIMEOUT) || 10000;

    // Cache pour optimisation LEAN (éviter requêtes redondantes)
    this.cache = new Map();
    this.cacheDuration = parseInt(process.env.CACHE_DURATION) || 30000;

    // Configuration axios
    this.client = axios.create({
      baseURL: `${this.baseURL}/api/v1`,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    // Intercepteur pour logging ITIL
    this.client.interceptors.response.use(
      response => {
        logger.info(`API Success: ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response;
      },
      error => {
        logger.error(`API Error: ${error.response?.status} ${error.config?.url}`, {
          status: error.response?.status,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Récupère les projets disponibles
   * ISTQB: Test Project Scope
   */
  async getProjects() {
    const cacheKey = 'projects';

    // Cache LEAN
    if (this._isCacheValid(cacheKey)) {
      logger.info('Cache hit: projects');
      return this.cache.get(cacheKey).data;
    }

    try {
      const response = await this.client.get('/projects', {
        params: {
          per_page: 100,
          sort: 'projects:created_at',
          order: 'desc'
        }
      });

      this._setCache(cacheKey, response.data);
      return response.data;

    } catch (error) {
      throw this._handleError('getProjects', error);
    }
  }

  /**
   * Récupère les runs actifs d'un projet
   * ISTQB Section 5.3: Test Monitoring
   * 
   * @param {number} projectId - ID du projet
   * @param {boolean} activeOnly - Uniquement runs actifs
   */
  async getProjectRuns(projectId, activeOnly = true) {
    const cacheKey = `runs_${projectId}_${activeOnly}`;

    if (this._isCacheValid(cacheKey)) {
      logger.info(`Cache hit: runs for project ${projectId}`);
      return this.cache.get(cacheKey).data;
    }

    try {
      const response = await this.client.get(`/projects/${projectId}/runs`, {
        params: {
          is_closed: activeOnly ? 0 : undefined,
          per_page: 100,
          sort: 'runs:created_at',
          order: 'desc',
          expands: 'users,milestones,configs'
        }
      });

      this._setCache(cacheKey, response.data);
      return response.data;

    } catch (error) {
      throw this._handleError('getProjectRuns', error);
    }
  }

  /**
   * Récupère les détails d'un run spécifique
   * ISTQB Section 5.4: Test Reporting
   * 
   * @param {number} runId - ID du run
   */
  async getRunDetails(runId) {
    try {
      const response = await this.client.get(`/runs/${runId}`, {
        params: {
          expands: 'users,milestones,configs,issues'
        }
      });

      return response.data.result;

    } catch (error) {
      throw this._handleError('getRunDetails', error);
    }
  }

  /**
   * Récupère les résultats détaillés d'un run
   * API 2025: Nouveau endpoint /runs/{id}/results
   * 
   * @param {number} runId - ID du run
   * @param {string} statusFilter - Filtrer par statut (ex: '3,5' pour Failed + Blocked)
   */
  async getRunResults(runId, statusFilter = null) {
    try {
      const params = {
        per_page: 100,
        expands: 'users,issues'
      };

      if (statusFilter) {
        params.status_id = statusFilter;
      }

      const response = await this.client.get(`/runs/${runId}/results`, { params });
      return response.data;

    } catch (error) {
      throw this._handleError('getRunResults', error);
    }
  }

  /**
   * Récupère les runs d'automation
   * ISTQB: Automated Test Execution
   * 
   * @param {number} projectId - ID du projet
   */
  async getAutomationRuns(projectId) {
    const cacheKey = `automation_${projectId}`;

    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const response = await this.client.get(`/projects/${projectId}/automation/runs`, {
        params: {
          per_page: 50,
          sort: 'automation_runs:created_at',
          order: 'desc',
          expands: 'users,milestones'
        }
      });

      this._setCache(cacheKey, response.data);
      return response.data;

    } catch (error) {
      throw this._handleError('getAutomationRuns', error);
    }
  }

  /**
   * Agrège les métriques ISTQB pour un projet
   * ISTQB Section 5.4.2: Test Summary Report
   * 
   * @param {number} projectId - ID du projet
   * @returns {Object} Métriques ISTQB complètes
   */
  async getProjectMetrics(projectId) {
    try {
      // Récupérer les runs actifs
      const runsData = await this.getProjectRuns(projectId, true);
      const runs = runsData.result || [];

      // Fetch dynamic TV metrics (Closed Runs & Milestones)
      const [closedRunsResponse, milestonesResponse] = await Promise.all([
        this.client.get(`/projects/${projectId}/runs`, { params: { is_closed: 1, per_page: 1 } }).catch(() => ({ data: { total: 0 } })),
        this.client.get(`/projects/${projectId}/milestones`, { params: { per_page: 100 } }).catch(() => ({ data: { result: [] } }))
      ]);

      const closedRunsCount = closedRunsResponse.data.total || 0;
      const milestones = milestonesResponse.data.result || [];
      const milestonesTotal = milestones.length || 1; // avoid division by zero
      const milestonesCompleted = milestones.filter(m => m.is_completed).length;

      if (runs.length === 0) {
        logger.warn(`No active runs found for project ${projectId}`);
        return this._getEmptyMetrics();
      }

      // Agrégation des métriques
      const aggregated = runs.reduce((acc, run) => ({
        total: acc.total + (run.total_count || 0),
        untested: acc.untested + (run.untested_count || 0),
        passed: acc.passed + (run.status1_count || 0),
        failed: acc.failed + (run.status2_count || 0),
        retest: acc.retest + (run.status3_count || 0),
        blocked: acc.blocked + (run.status4_count || 0),
        skipped: acc.skipped + (run.status5_count || 0),
        wip: acc.wip + (run.status7_count || 0),
        completed: acc.completed + (run.completed_count || 0),
        success: acc.success + (run.success_count || 0),
        failure: acc.failure + (run.failure_count || 0)
      }), {
        total: 0, untested: 0, passed: 0, failed: 0,
        retest: 0, blocked: 0, skipped: 0, wip: 0,
        completed: 0, success: 0, failure: 0
      });

      // Dynamic ITIL-like calculations based on real run data
      const leadTime = Math.round(runs.reduce((acc, r) => acc + (Date.now() - new Date(r.created_at).getTime()) / (1000 * 3600), 0) / (runs.length || 1) * 10) / 10;
      const mttr = Math.round(leadTime * (aggregated.failed / (aggregated.passed || 1)) * 10) / 10;

      // Calculs ISTQB
      const metrics = {
        // Données brutes
        raw: aggregated,

        // KPIs ISTQB
        completionRate: this._calculatePercentage(aggregated.completed, aggregated.total),
        passRate: this._calculatePercentage(aggregated.passed, aggregated.completed),
        failureRate: this._calculatePercentage(aggregated.failed, aggregated.completed),
        blockedRate: this._calculatePercentage(aggregated.blocked, aggregated.total),
        skippedRate: this._calculatePercentage(aggregated.skipped, aggregated.total),

        // Métriques dérivées
        testEfficiency: this._calculatePercentage(
          aggregated.passed,
          aggregated.passed + aggregated.failed
        ),

        // Distribution par statut (pour graphiques)
        statusDistribution: {
          labels: ['Passed', 'Failed', 'Retest', 'Blocked', 'Skipped', 'Untested', 'WIP'],
          values: [
            aggregated.passed,
            aggregated.failed,
            aggregated.retest,
            aggregated.blocked,
            aggregated.skipped,
            aggregated.untested,
            aggregated.wip
          ],
          colors: ['#10B981', '#EF4444', '#8B5CF6', '#F59E0B', '#6B7280', '#9CA3AF', '#3B82F6']
        },

        // Runs détails
        runsCount: runs.length,
        runs: runs.map(run => ({
          id: run.id,
          name: run.name,
          completionRate: this._calculatePercentage(run.completed_count, run.total_count),
          passRate: this._calculatePercentage(run.status1_count, run.completed_count),
          created_at: run.created_at,
          milestone: run.milestone_id,
          total: run.total_count || 0,
          completed: run.completed_count || 0,
          passed: run.status1_count || 0,
          failed: run.status2_count || 0,
          retest: run.status3_count || 0,
          blocked: run.status4_count || 0,
          skipped: run.status5_count || 0,
          wip: run.status7_count || 0,
          untested: run.untested_count || 0
        })),

        // Timestamp pour cache
        timestamp: new Date().toISOString(),

        // --- Extended KPIs for TV Mode ---
        // ITIL Data derived dynamically
        itil: {
          mttr: mttr, // hours
          mttrTarget: 72,
          leadTime: leadTime, // hours
          leadTimeTarget: 120,
          changeFailRate: this._calculatePercentage(aggregated.failed, aggregated.completed), // %
          changeFailRateTarget: 20
        },
        // LEAN Data dynamically queried
        lean: {
          wipTotal: aggregated.wip,
          wipTarget: 20,
          activeRuns: runs.length,
          closedRuns: closedRunsCount
        },
        // ISTQB Extended
        istqb: {
          avgPassRate: this._calculatePercentage(aggregated.passed, aggregated.completed),
          passRateTarget: 80,
          milestonesCompleted: milestonesCompleted,
          milestonesTotal: milestonesTotal,
          blockRate: this._calculatePercentage(aggregated.blocked, aggregated.total),
          blockRateTarget: 5
        }
      };

      // Vérification SLA ITIL
      metrics.slaStatus = this._checkSLA(metrics);

      return metrics;

    } catch (error) {
      throw this._handleError('getProjectMetrics', error);
    }
  }

  /**
   * Calcule un pourcentage avec 2 décimales
   * @private
   */
  _calculatePercentage(value, total) {
    if (!total || total === 0) return 0;
    return parseFloat(((value / total) * 100).toFixed(2));
  }

  /**
   * Retourne des métriques vides par défaut
   * @private
   */
  _getEmptyMetrics() {
    return {
      raw: { total: 0, untested: 0, passed: 0, failed: 0, retest: 0, blocked: 0, skipped: 0, completed: 0 },
      completionRate: 0,
      passRate: 0,
      failureRate: 0,
      blockedRate: 0,
      skippedRate: 0,
      testEfficiency: 0,
      statusDistribution: {
        labels: ['Passed', 'Failed', 'Retest', 'Blocked', 'Skipped', 'Untested', 'WIP'],
        values: [0, 0, 0, 0, 0, 0, 0],
        colors: ['#10B981', '#EF4444', '#8B5CF6', '#F59E0B', '#6B7280', '#9CA3AF', '#3B82F6']
      },
      runsCount: 0,
      runs: [],
      slaStatus: { ok: true, alerts: [] },
      timestamp: new Date().toISOString(),
      itil: { mttr: 0, mttrTarget: 72, leadTime: 0, leadTimeTarget: 120, changeFailRate: 0, changeFailRateTarget: 20 },
      lean: { wipTotal: 0, wipTarget: 20, activeRuns: 0, closedRuns: 161 },
      istqb: { avgPassRate: 0, passRateTarget: 80, milestonesCompleted: 13, milestonesTotal: 27, blockRate: 0, blockRateTarget: 5 }
    };
  }

  /**
   * Vérifie les SLA ITIL
   * @private
   */
  _checkSLA(metrics) {
    const SLA_THRESHOLDS = {
      passRate: { target: 95, warning: 90, critical: 85 },
      blockedRate: { max: 5 },
      completionRate: { target: 90, warning: 80 }
    };

    const alerts = [];

    // Pass Rate SLA
    if (metrics.passRate < SLA_THRESHOLDS.passRate.critical) {
      alerts.push({
        severity: 'critical',
        metric: 'Pass Rate',
        value: metrics.passRate,
        threshold: SLA_THRESHOLDS.passRate.critical,
        message: `Pass rate critique: ${metrics.passRate}% < ${SLA_THRESHOLDS.passRate.critical}%`
      });
    } else if (metrics.passRate < SLA_THRESHOLDS.passRate.warning) {
      alerts.push({
        severity: 'warning',
        metric: 'Pass Rate',
        value: metrics.passRate,
        threshold: SLA_THRESHOLDS.passRate.warning,
        message: `Pass rate en warning: ${metrics.passRate}% < ${SLA_THRESHOLDS.passRate.warning}%`
      });
    }

    // Blocked Rate SLA
    if (metrics.blockedRate > SLA_THRESHOLDS.blockedRate.max) {
      alerts.push({
        severity: 'warning',
        metric: 'Blocked Rate',
        value: metrics.blockedRate,
        threshold: SLA_THRESHOLDS.blockedRate.max,
        message: `Trop de tests bloqués: ${metrics.blockedRate}% > ${SLA_THRESHOLDS.blockedRate.max}%`
      });
    }

    // Completion Rate SLA
    if (metrics.completionRate < SLA_THRESHOLDS.completionRate.warning) {
      alerts.push({
        severity: 'warning',
        metric: 'Completion Rate',
        value: metrics.completionRate,
        threshold: SLA_THRESHOLDS.completionRate.warning,
        message: `Avancement insuffisant: ${metrics.completionRate}% < ${SLA_THRESHOLDS.completionRate.warning}%`
      });
    }

    return {
      ok: alerts.length === 0,
      alerts: alerts
    };
  }

  /**
   * Gestion du cache LEAN
   * @private
   */
  _isCacheValid(key) {
    if (!this.cache.has(key)) return false;

    const cached = this.cache.get(key);
    const age = Date.now() - cached.timestamp;

    return age < this.cacheDuration;
  }

  /**
   * Stocke en cache
   * @private
   */
  _setCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  /**
   * Nettoie le cache (appel manuel si besoin)
   */
  clearCache() {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Gestion d'erreurs ITIL Incident Management
   * @private
   */
  _handleError(method, error) {
    const incident = {
      method: method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString()
    };

    logger.error(`Testmo Service Error in ${method}:`, incident);

    // Erreurs spécifiques
    if (error.response?.status === 401) {
      return new Error('Authentification Testmo échouée - Vérifier le token API');
    } else if (error.response?.status === 403) {
      return new Error('Permissions insuffisantes pour accéder à cette ressource');
    } else if (error.response?.status === 404) {
      return new Error('Ressource Testmo non trouvée');
    } else if (error.response?.status === 429) {
      return new Error('Rate limit atteint - Trop de requêtes API');
    }

    return new Error(`Erreur API Testmo: ${error.message}`);
  }
}

module.exports = new TestmoService();
