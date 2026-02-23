/**
 * ================================================
 * METRICS CARDS COMPONENT
 * ================================================
 * Affichage des KPIs ISTQB en cartes
 * 
 * Standards ISTQB:
 * - Test Completion Rate
 * - Test Pass Rate
 * - Defect Detection Rate
 * - Test Efficiency
 * 
 * @author Matou - Neo-Logix QA Lead
 */

import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import '../styles/MetricsCards.css';

const MetricsCards = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="metrics-loading">
        <Clock className="spinner" />
        <p>Chargement des métriques...</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Completion Rate',
      subtitle: 'ISTQB: Test Progress',
      value: `${metrics.completionRate}%`,
      total: `${metrics.raw.completed} / ${metrics.raw.total}`,
      target: '≥ 90%',
      icon: Clock,
      color: getColorByThreshold(metrics.completionRate, 90, 80),
      trend: metrics.completionRate >= 90 ? 'up' : 'down',
      description: 'Tests exécutés vs total'
    },
    {
      title: 'Pass Rate',
      subtitle: 'ISTQB: Test Quality',
      value: `${metrics.passRate}%`,
      total: `${metrics.raw.passed} tests`,
      target: '≥ 95%',
      icon: CheckCircle2,
      color: getColorByThreshold(metrics.passRate, 95, 90),
      trend: metrics.passRate >= 95 ? 'up' : 'down',
      description: 'Tests réussis vs exécutés'
    },
    {
      title: 'Failure Rate',
      subtitle: 'ISTQB: Defect Detection',
      value: `${metrics.failureRate}%`,
      total: `${metrics.raw.failed} défauts`,
      target: '≤ 5%',
      icon: XCircle,
      color: getColorForFailure(metrics.failureRate),
      trend: metrics.failureRate > 5 ? 'down' : 'up',
      description: 'Tests échoués détectés'
    },
    {
      title: 'Test Efficiency',
      subtitle: 'LEAN: Efficacité QA',
      value: `${metrics.testEfficiency}%`,
      total: `${metrics.raw.passed + metrics.raw.failed} tests`,
      target: '≥ 95%',
      icon: TrendingUp,
      color: getColorByThreshold(metrics.testEfficiency, 95, 90),
      trend: metrics.testEfficiency >= 95 ? 'up' : 'down',
      description: 'Ratio succès/échecs'
    }
  ];

  return (
    <div className="metrics-container">
      {cards.map((card, index) => (
        <MetricCard key={index} {...card} />
      ))}

      {/* Alertes SLA ITIL */}
      {metrics.slaStatus && !metrics.slaStatus.ok && (
        <div className="sla-alerts">
          <AlertTriangle className="alert-icon" />
          <div className="alerts-content">
            <h3>Alertes SLA ITIL</h3>
            {metrics.slaStatus.alerts.map((alert, idx) => (
              <div key={idx} className={`alert alert-${alert.severity}`}>
                <strong>{alert.metric}:</strong> {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Carte de métrique individuelle
 */
const MetricCard = ({ title, subtitle, value, total, target, icon: Icon, color, trend, description }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend === 'up' ? '#10B981' : '#EF4444';

  return (
    <div className="metric-card" style={{ borderLeftColor: color }}>
      <div className="card-header">
        <div className="card-title">
          <h3>{title}</h3>
          <span className="subtitle">{subtitle}</span>
        </div>
        <div className="card-icon" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} color={color} />
        </div>
      </div>

      <div className="card-body">
        <div className="metric-value-row">
          <div className="metric-value" style={{ color }}>{value}</div>
        </div>
        <div className="metric-total">{total} {target && <span className="metric-target">| Objectif: {target}</span>}</div>
      </div>

      <div className="card-footer">
        <span className="description">{description}</span>
        <TrendIcon size={16} color={trendColor} />
      </div>
    </div>
  );
};

/**
 * Détermine la couleur selon seuils ISTQB
 */
function getColorByThreshold(value, targetThreshold, warningThreshold) {
  if (value >= targetThreshold) return '#10B981'; // Vert
  if (value >= warningThreshold) return '#F59E0B'; // Orange
  return '#EF4444'; // Rouge
}

/**
 * Couleur pour le taux d'échec (inverse)
 */
function getColorForFailure(value) {
  if (value <= 5) return '#10B981'; // Vert si peu d'échecs
  if (value <= 10) return '#F59E0B'; // Orange
  return '#EF4444'; // Rouge si beaucoup d'échecs
}

export default MetricsCards;
