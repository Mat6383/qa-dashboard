import React, { useRef } from 'react';
import {
    ShieldAlert, ShieldCheck, Activity, Database, CheckCircle, Bug,
    Download, Layers, CheckSquare, XCircle, BarChart3, TrendingUp, AlertTriangle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Dashboard4 = ({ metrics, project, isDark = false, useBusiness = true, setExportHandler }) => {
    const dashboardRef = useRef(null);

    // Provide the export function to the parent component on mount
    React.useEffect(() => {
        if (setExportHandler) {
            setExportHandler(() => handleExportPDF);
        }
        return () => {
            if (setExportHandler) setExportHandler(null);
        };
    }, [setExportHandler]);

    if (!metrics || !project) {
        return (
            <div className="tv-loading">
                <Activity size={48} className="spinner" />
                <h2>Chargement des données ISTQB...</h2>
            </div>
        );
    }

    // --- Données Dashboard 1 (Métriques globales) ---
    const d1 = metrics;
    // --- Données Dashboard 3 (Quality Rates) ---
    const rates = metrics.qualityRates || {
        escapeRate: 0, detectionRate: 0, bugsInProd: 0, bugsInTest: 0, totalBugs: 0,
        preprodMilestone: 'N/A', prodMilestone: 'N/A', message: 'Indisponible'
    };

    const escapeOk = rates.escapeRate < 5;
    const ddpOk = rates.detectionRate > 95;

    const getAlertForMetric = (metricName) => {
        if (!metrics.slaStatus || metrics.slaStatus.ok) return null;
        return metrics.slaStatus.alerts.find(a => a.metric === metricName);
    };

    const renderAlert = (alert) => {
        if (!alert) return null;
        return (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.75rem', backgroundColor: alert.severity === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '6px', color: alert.severity === 'warning' ? '#F59E0B' : '#EF4444' }}>
                <AlertTriangle size={16} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4 }}>
                    {useBusiness ? (
                        alert.message.replace('Pass rate critique:', 'Critique :')
                            .replace('Pass rate en warning:', 'Attention :')
                            .replace('Trop de tests bloqués:', 'Blocages élevés :')
                            .replace('Avancement insuffisant:', 'Retard :')
                    ) : alert.message}
                </span>
            </div>
        );
    };

    const handleExportPDF = async () => {
        const element = dashboardRef.current;
        if (!element) return;

        try {
            // Configuration de html2canvas (pour capturer avec le bon rendu)
            const canvas = await html2canvas(element, {
                scale: 2, // Meilleure qualité
                useCORS: true,
                backgroundColor: isDark ? '#111827' : '#F9FAFB'
            });

            const imgData = canvas.toDataURL('image/png');

            // Configuration PDF
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`QA_Dashboard_${project.name}_${new Date().toLocaleDateString('fr-FR')}.pdf`);
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            alert('Erreur lors de la génération du PDF');
        }
    };

    return (
        <div style={{ padding: '0.5rem', maxWidth: '1400px', margin: '0 auto' }}>

            {/* Conteneur principal à exporter en PDF */}
            <div
                ref={dashboardRef}
                className={`tv-dashboard ${isDark ? 'dark' : ''}`}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--bg-color)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}
            >
                <header style={{ display: 'none' }}>
                    {/* Ancien header masqué */}
                </header>

                {/* --- SECTION PRÉPRODUCTION --- */}
                <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-color)', margin: 0 }}>
                            {useBusiness ? 'PRÉPRODUCTION' : 'PREPROD'}
                        </h2>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                    </div>

                    {/* Grille principale Preprod */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>

                        {/* Bloc 1: Taux d'Exécution */}
                        <div className="metric-card" style={{ backgroundColor: 'var(--card-bg)', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${d1.completionRate >= 90 ? '#10B981' : d1.completionRate >= 80 ? '#F59E0B' : '#EF4444'}`, borderLeftWidth: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                                <Activity size={20} color={d1.completionRate >= 90 ? '#10B981' : d1.completionRate >= 80 ? '#F59E0B' : '#EF4444'} />
                                <span style={{ fontWeight: 600 }}>Taux d'Exécution</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: d1.completionRate >= 90 ? '#10B981' : d1.completionRate >= 80 ? '#F59E0B' : '#EF4444' }}>
                                    {d1.completionRate}%
                                </div>
                                <span style={{ fontSize: '1.5rem', color: d1.completionRate >= 90 ? '#10B981' : '#EF4444' }}>
                                    {d1.completionRate >= 90 ? '▲' : '▼'}
                                </span>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ padding: '0.2rem 0.5rem', backgroundColor: d1.completionRate >= 90 ? 'rgba(16,185,129,0.1)' : d1.completionRate >= 80 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: d1.completionRate >= 90 ? '#10B981' : d1.completionRate >= 80 ? '#F59E0B' : '#EF4444', borderRadius: '4px', fontWeight: 600 }}>
                                    {d1.raw.completed} / {d1.raw.total}
                                </span>
                                <span style={{ opacity: 0.6 }}>tests exécutés (Cible: ≥ 90%)</span>
                            </div>
                            {renderAlert(getAlertForMetric('Completion Rate'))}
                        </div>

                        {/* Bloc 2: Taux de Succès */}
                        <div className="metric-card" style={{ backgroundColor: 'var(--card-bg)', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${d1.passRate >= 95 ? '#10B981' : d1.passRate >= 90 ? '#F59E0B' : '#EF4444'}`, borderLeftWidth: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                                <CheckSquare size={20} color={d1.passRate >= 95 ? '#10B981' : d1.passRate >= 90 ? '#F59E0B' : '#EF4444'} />
                                <span style={{ fontWeight: 600 }}>Taux de Succès</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: d1.passRate >= 95 ? '#10B981' : d1.passRate >= 90 ? '#F59E0B' : '#EF4444' }}>
                                    {d1.passRate}%
                                </div>
                                <span style={{ fontSize: '1.5rem', color: d1.passRate >= 95 ? '#10B981' : '#EF4444' }}>
                                    {d1.passRate >= 95 ? '▲' : '▼'}
                                </span>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ padding: '0.2rem 0.5rem', backgroundColor: d1.passRate >= 95 ? 'rgba(16,185,129,0.1)' : d1.passRate >= 90 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: d1.passRate >= 95 ? '#10B981' : d1.passRate >= 90 ? '#F59E0B' : '#EF4444', borderRadius: '4px', fontWeight: 600 }}>
                                    {d1.raw.passed}
                                </span>
                                <span style={{ opacity: 0.6 }}>{useBusiness ? 'tests réussis (Cible: ≥ 95%)' : 'tests passed (Target: ≥ 95%)'}</span>
                            </div>
                            <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', opacity: 0.5 }}>
                                {useBusiness ? '(Réussis / Total des tests terminés, bloqués ou ignorés)' : '(Passed / Total completed, blocked or skipped)'}
                            </div>
                            {renderAlert(getAlertForMetric('Pass Rate') || getAlertForMetric('Blocked Rate'))}
                        </div>

                        {/* Bloc 3: Taux d'Échec */}
                        <div className="metric-card" style={{ backgroundColor: 'var(--card-bg)', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${d1.failureRate <= 5 ? '#10B981' : d1.failureRate <= 10 ? '#F59E0B' : '#EF4444'}`, borderLeftWidth: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                                <XCircle size={20} color={d1.failureRate <= 5 ? '#10B981' : d1.failureRate <= 10 ? '#F59E0B' : '#EF4444'} />
                                <span style={{ fontWeight: 600 }}>Taux d'Échec</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: d1.failureRate <= 5 ? '#10B981' : d1.failureRate <= 10 ? '#F59E0B' : '#EF4444' }}>
                                    {d1.failureRate}%
                                </div>
                                <span style={{ fontSize: '1.5rem', color: d1.failureRate <= 5 ? '#10B981' : '#EF4444' }}>
                                    {d1.failureRate <= 5 ? '▼' : '▲'} {/* Inversé : Les échecs doivent descendre */}
                                </span>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ padding: '0.2rem 0.5rem', backgroundColor: d1.failureRate <= 5 ? 'rgba(16,185,129,0.1)' : d1.failureRate <= 10 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: d1.failureRate <= 5 ? '#10B981' : d1.failureRate <= 10 ? '#F59E0B' : '#EF4444', borderRadius: '4px', fontWeight: 600 }}>
                                    {d1.raw.failed}
                                </span>
                                <span style={{ opacity: 0.6 }}>tests échoués (Cible: ≤ 5%)</span>
                            </div>
                            {renderAlert(getAlertForMetric('Failure Rate'))}
                        </div>

                        {/* Bloc 4: Efficience */}
                        <div className="metric-card" style={{ backgroundColor: 'var(--card-bg)', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${d1.testEfficiency >= 95 ? '#10B981' : d1.testEfficiency >= 90 ? '#F59E0B' : '#EF4444'}`, borderLeftWidth: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                                <TrendingUp size={20} color={d1.testEfficiency >= 95 ? '#10B981' : d1.testEfficiency >= 90 ? '#F59E0B' : '#EF4444'} />
                                <span style={{ fontWeight: 600 }}>Efficience des tests</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: d1.testEfficiency >= 95 ? '#10B981' : d1.testEfficiency >= 90 ? '#F59E0B' : '#EF4444' }}>
                                    {d1.testEfficiency}%
                                </div>
                                <span style={{ fontSize: '1.5rem', color: d1.testEfficiency >= 95 ? '#10B981' : '#EF4444' }}>
                                    {d1.testEfficiency >= 95 ? '▲' : '▼'}
                                </span>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ padding: '0.2rem 0.5rem', backgroundColor: d1.testEfficiency >= 95 ? 'rgba(16,185,129,0.1)' : d1.testEfficiency >= 90 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: d1.testEfficiency >= 95 ? '#10B981' : d1.testEfficiency >= 90 ? '#F59E0B' : '#EF4444', borderRadius: '4px', fontWeight: 600 }}>
                                    {useBusiness ? 'Objectif' : 'Target'}
                                </span>
                                <span style={{ opacity: 0.6 }}>{useBusiness ? 'Approcher les 100% (≥ 95%)' : 'Approach 100% (≥ 95%)'}</span>
                            </div>
                            <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', opacity: 0.5 }}>
                                {useBusiness ? '(Réussis / (Réussis + Échoués) purs)' : '(Passed / (Passed + Failed))'}
                            </div>
                            {renderAlert(getAlertForMetric('Test Efficiency'))}
                        </div>
                    </div>

                    {/* Ligne 2 Preprod : Répartition & Campagnes */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>

                        {/* Répartition des statuts */}
                        <div style={{ backgroundColor: 'var(--card-bg)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)', fontSize: '1rem' }}>
                                <BarChart3 size={20} /> Répartition des statuts
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {[
                                    { label: useBusiness ? 'Réussis' : 'Passed', val: d1.raw.passed, color: '#10B981' },
                                    { label: useBusiness ? 'Échoués' : 'Failed', val: d1.raw.failed, color: '#EF4444' },
                                    { label: useBusiness ? 'Bloqués' : 'Blocked', val: d1.raw.blocked, color: '#F59E0B' },
                                    { label: useBusiness ? 'Non testés' : 'Untested', val: d1.raw.untested, color: '#9CA3AF' }
                                ].map(stat => (
                                    <div key={stat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: stat.color }}></div>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>{stat.label}</span>
                                        </div>
                                        <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{stat.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Campagnes Actives (Aperçu) - PREPROD */}
                        <div style={{ backgroundColor: 'var(--card-bg)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)', fontSize: '1rem' }}>
                                <Database size={20} /> Campagnes Actives (Préprod)
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr)', gap: '0.8rem' }}>
                                {d1.runs.slice(0, 4).map(run => (
                                    <div key={run.id} style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {run.name}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                                            <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${run.completionRate}%`, height: '100%', backgroundColor: '#3B82F6' }}></div>
                                            </div>
                                            <span style={{ opacity: 0.8 }}>{run.completionRate}%</span>
                                        </div>
                                    </div>
                                ))}
                                {d1.runs.length > 4 && (
                                    <div style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6, fontSize: '0.85rem', fontStyle: 'italic' }}>
                                        + {d1.runs.length - 4} autres campagnes...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div> {/* Fin Section Preprod */}

                {/* --- SECTION PRODUCTION --- */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-color)', margin: 0 }}>
                            {useBusiness ? 'PRODUCTION' : 'PRODUCTION'}
                        </h2>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem', marginBottom: '0.5rem' }}>

                        {/* Escape Rate */}
                        <div style={{ backgroundColor: 'var(--card-bg)', padding: '0.75rem', borderRadius: '8px', border: `2px solid ${escapeOk ? '#10B981' : '#EF4444'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)', fontSize: '1rem' }}>
                                    <ShieldAlert size={20} /> Taux d'Échappement (Escape Rate)
                                </h3>
                                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{useBusiness ? 'Jalon' : 'Milestone'}: {rates.prodMilestone} | {useBusiness ? 'Objectif' : 'Target'} &lt; 5%</div>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: escapeOk ? '#10B981' : '#EF4444' }}>{rates.escapeRate}%</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{rates.bugsInProd} {useBusiness ? 'bugs prod' : 'prod bugs'}</div>
                            </div>
                        </div>

                        {/* Detection Rate (DDP) */}
                        <div style={{ backgroundColor: 'var(--card-bg)', padding: '0.75rem', borderRadius: '8px', border: `2px solid ${ddpOk ? '#10B981' : '#EF4444'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)', fontSize: '1rem' }}>
                                    <ShieldCheck size={20} /> Taux de Détection (DDP)
                                </h3>
                                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{useBusiness ? 'Lié' : 'Linked'}: {rates.prodMilestone} | {useBusiness ? 'Objectif' : 'Target'} &gt; 95%</div>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: ddpOk ? '#10B981' : '#EF4444' }}>{rates.detectionRate}%</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{rates.bugsInTest} {useBusiness ? 'bugs test' : 'test bugs'}</div>
                            </div>
                        </div>
                    </div>

                </div> {/* Fin Section Prod */}
            </div>
        </div>
    );
};

export default Dashboard4;
