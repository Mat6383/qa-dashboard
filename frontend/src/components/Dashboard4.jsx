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

    const getPassRateColor = (passRate) => {
        if (passRate >= 95) return '#10B981';
        if (passRate >= 90) return '#F59E0B';
        return '#EF4444';
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
        <div style={{ padding: '0.5rem', width: '100%', margin: '0 auto' }}>

            {/* Conteneur principal à exporter en PDF */}
            <div
                ref={dashboardRef}
                className={`tv-dashboard ${isDark ? 'tv-dark-theme' : ''}`}
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
                        <h2 style={{ fontSize: '1.35rem', color: 'var(--text-color)', margin: 0 }}>
                            {useBusiness ? 'PRÉPRODUCTION' : 'PREPROD'}
                        </h2>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                    </div>

                    {/* Grille principale Preprod */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>

                        {/* Bloc 1: Taux d'Exécution */}
                        <div className="metric-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: `1px solid ${d1.completionRate >= 90 ? '#10B981' : d1.completionRate >= 80 ? '#F59E0B' : '#EF4444'}`, borderLeftWidth: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                <Activity size={24} color={d1.completionRate >= 90 ? '#10B981' : d1.completionRate >= 80 ? '#F59E0B' : '#EF4444'} />
                                <span style={{ fontWeight: 600, fontSize: '1.4rem', color: 'var(--text-color)' }}>Taux d'Exécution</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: d1.completionRate >= 90 ? '#10B981' : d1.completionRate >= 80 ? '#F59E0B' : '#EF4444' }}>
                                    {d1.completionRate}%
                                </div>
                                <span style={{ fontSize: '1.75rem', color: d1.completionRate >= 90 ? '#10B981' : '#EF4444' }}>
                                    {d1.completionRate >= 90 ? '▲' : '▼'}
                                </span>
                            </div>
                            <div style={{ marginTop: '0.75rem', fontSize: '1.05rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ padding: '0.2rem 0.6rem', backgroundColor: d1.completionRate >= 90 ? 'rgba(16,185,129,0.1)' : d1.completionRate >= 80 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: d1.completionRate >= 90 ? '#10B981' : d1.completionRate >= 80 ? '#F59E0B' : '#EF4444', borderRadius: '6px', fontWeight: 600 }}>
                                    {d1.raw.completed} / {d1.raw.total}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>{useBusiness ? 'tests exécutés (Cible: ≥ 90%)' : 'tests executed (Target: ≥ 90%)'}</span>
                            </div>
                            {renderAlert(getAlertForMetric('Completion Rate'))}
                        </div>

                        {/* Bloc 2: Taux de Succès */}
                        <div className="metric-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: `1px solid ${d1.passRate >= 95 ? '#10B981' : d1.passRate >= 90 ? '#F59E0B' : '#EF4444'}`, borderLeftWidth: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                <CheckSquare size={24} color={d1.passRate >= 95 ? '#10B981' : d1.passRate >= 90 ? '#F59E0B' : '#EF4444'} />
                                <span style={{ fontWeight: 600, fontSize: '1.4rem', color: 'var(--text-color)' }}>Taux de Succès</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: d1.passRate >= 95 ? '#10B981' : d1.passRate >= 90 ? '#F59E0B' : '#EF4444' }}>
                                    {d1.passRate}%
                                </div>
                                <span style={{ fontSize: '1.75rem', color: d1.passRate >= 95 ? '#10B981' : '#EF4444' }}>
                                    {d1.passRate >= 95 ? '▲' : '▼'}
                                </span>
                            </div>
                            <div style={{ marginTop: '0.75rem', fontSize: '1.05rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ padding: '0.2rem 0.6rem', backgroundColor: d1.passRate >= 95 ? 'rgba(16,185,129,0.1)' : d1.passRate >= 90 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: d1.passRate >= 95 ? '#10B981' : d1.passRate >= 90 ? '#F59E0B' : '#EF4444', borderRadius: '6px', fontWeight: 600 }}>
                                    {d1.raw.passed}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>{useBusiness ? 'tests réussis (Cible: ≥ 95%)' : 'tests passed (Target: ≥ 95%)'}</span>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                {useBusiness ? '(Réussis / Total des tests terminés, bloqués ou ignorés)' : '(Passed / Total completed, blocked or skipped)'}
                            </div>
                            {renderAlert(getAlertForMetric('Pass Rate') || getAlertForMetric('Blocked Rate'))}
                        </div>

                        {/* Bloc 3: Taux d'Échec */}
                        <div className="metric-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: `1px solid ${d1.failureRate <= 5 ? '#10B981' : d1.failureRate <= 10 ? '#F59E0B' : '#EF4444'}`, borderLeftWidth: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                <XCircle size={24} color={d1.failureRate <= 5 ? '#10B981' : d1.failureRate <= 10 ? '#F59E0B' : '#EF4444'} />
                                <span style={{ fontWeight: 600, fontSize: '1.4rem', color: 'var(--text-color)' }}>Taux d'Échec</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: d1.failureRate <= 5 ? '#10B981' : d1.failureRate <= 10 ? '#F59E0B' : '#EF4444' }}>
                                    {d1.failureRate}%
                                </div>
                                <span style={{ fontSize: '1.75rem', color: d1.failureRate <= 5 ? '#10B981' : '#EF4444' }}>
                                    {d1.failureRate <= 5 ? '▼' : '▲'} {/* Inversé : Les échecs doivent descendre */}
                                </span>
                            </div>
                            <div style={{ marginTop: '0.75rem', fontSize: '1.05rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ padding: '0.2rem 0.6rem', backgroundColor: d1.failureRate <= 5 ? 'rgba(16,185,129,0.1)' : d1.failureRate <= 10 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: d1.failureRate <= 5 ? '#10B981' : d1.failureRate <= 10 ? '#F59E0B' : '#EF4444', borderRadius: '6px', fontWeight: 600 }}>
                                    {d1.raw.failed}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>{useBusiness ? 'tests échoués (Cible: ≤ 5%)' : 'tests failed (Target: ≤ 5%)'}</span>
                            </div>
                            {renderAlert(getAlertForMetric('Failure Rate'))}
                        </div>

                        {/* Bloc 4: Efficience */}
                        <div className="metric-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: `1px solid ${d1.testEfficiency >= 95 ? '#10B981' : d1.testEfficiency >= 90 ? '#F59E0B' : '#EF4444'}`, borderLeftWidth: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                <TrendingUp size={24} color={d1.testEfficiency >= 95 ? '#10B981' : d1.testEfficiency >= 90 ? '#F59E0B' : '#EF4444'} />
                                <span style={{ fontWeight: 600, fontSize: '1.4rem', color: 'var(--text-color)' }}>Efficience des tests</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: d1.testEfficiency >= 95 ? '#10B981' : d1.testEfficiency >= 90 ? '#F59E0B' : '#EF4444' }}>
                                    {d1.testEfficiency}%
                                </div>
                                <span style={{ fontSize: '1.75rem', color: d1.testEfficiency >= 95 ? '#10B981' : '#EF4444' }}>
                                    {d1.testEfficiency >= 95 ? '▲' : '▼'}
                                </span>
                            </div>
                            <div style={{ marginTop: '0.75rem', fontSize: '1.05rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ padding: '0.2rem 0.6rem', backgroundColor: d1.testEfficiency >= 95 ? 'rgba(16,185,129,0.1)' : d1.testEfficiency >= 90 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: d1.testEfficiency >= 95 ? '#10B981' : d1.testEfficiency >= 90 ? '#F59E0B' : '#EF4444', borderRadius: '6px', fontWeight: 600 }}>
                                    {useBusiness ? 'Objectif' : 'Target'}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>{useBusiness ? 'Approcher les 100% (≥ 95%)' : 'Approach 100% (≥ 95%)'}</span>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                {useBusiness ? '(Réussis / (Réussis + Échoués) purs)' : '(Passed / (Passed + Failed))'}
                            </div>
                            {renderAlert(getAlertForMetric('Test Efficiency'))}
                        </div>
                    </div>

                    {/* Ligne 2 Preprod : Répartition des statuts (Inliné sous les cards) */}
                    <div style={{ backgroundColor: 'var(--card-bg)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)', fontWeight: 600, fontSize: '1.3rem', marginRight: '1rem' }}>
                            <BarChart3 size={24} /> Répartition Globale
                        </div>
                        {[
                            { label: useBusiness ? 'Réussis' : 'Passed', val: d1.raw.passed, color: '#10B981' },
                            { label: useBusiness ? 'Échoués' : 'Failed', val: d1.raw.failed, color: '#EF4444' },
                            { label: useBusiness ? 'Bloqués' : 'Blocked', val: d1.raw.blocked, color: '#F59E0B' },
                            { label: useBusiness ? 'Non testés' : 'Untested', val: d1.raw.untested, color: '#9CA3AF' }
                        ].map(stat => (
                            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: stat.color }}></div>
                                <span style={{ fontSize: '1.1rem', color: 'var(--text-color)' }}>{stat.label}:</span>
                                <span style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--text-color)' }}>{stat.val}</span>
                            </div>
                        ))}
                    </div>

                    {/* Ligne 3 Preprod : Campagnes Actives */}
                    <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)', fontSize: '1.35rem' }}>
                            <Database size={24} color="var(--color-primary)" /> Campagnes Actives (Préproduction)
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                            {d1.runs.slice(0, 8).map(run => (
                                <div key={run.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {run.name}
                                    </div>
                                    
                                    {/* Progression */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Progression</span>
                                        <span style={{ fontWeight: 700, color: 'var(--text-color)' }}>{run.completionRate}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${run.completionRate}%`, height: '100%', backgroundColor: run.completionRate >= 90 ? '#10B981' : run.completionRate >= 80 ? '#F59E0B' : '#3B82F6' }}></div>
                                    </div>

                                    {/* Taux de succès */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{useBusiness ? 'Taux de succès' : 'Pass Rate'}</span>
                                        <span style={{ fontWeight: 700, color: getPassRateColor(run.passRate) }}>{run.passRate}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${run.passRate}%`, height: '100%', backgroundColor: getPassRateColor(run.passRate) }}></div>
                                    </div>
                                </div>
                            ))}
                            {d1.runs.length > 8 && (
                                <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.1rem', fontStyle: 'italic', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                                    + {d1.runs.length - 8} autres campagnes...
                                </div>
                            )}
                        </div>
                    </div>
                </div> {/* Fin Section Preprod */}

                {/* --- SECTION PRODUCTION --- */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.35rem', color: 'var(--text-color)', margin: 0 }}>
                            {useBusiness ? 'PRODUCTION' : 'PRODUCTION'}
                        </h2>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem', marginBottom: '0.5rem' }}>

                        {/* Escape Rate */}
                        <div style={{ backgroundColor: 'var(--card-bg)', padding: '0.75rem', borderRadius: '8px', border: `2px solid ${escapeOk ? '#10B981' : '#EF4444'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)', fontSize: '1.3rem' }}>
                                    <ShieldAlert size={20} /> Taux d'Échappement (Escape Rate)
                                </h3>
                                <div style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>{useBusiness ? 'Jalon' : 'Milestone'}: {rates.prodMilestone} | {useBusiness ? 'Objectif' : 'Target'} &lt; 5%</div>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: escapeOk ? '#10B981' : '#EF4444' }}>{rates.escapeRate}%</div>
                                <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{rates.bugsInProd} {useBusiness ? 'bugs prod' : 'prod bugs'}</div>
                            </div>
                        </div>

                        {/* Detection Rate (DDP) */}
                        <div style={{ backgroundColor: 'var(--card-bg)', padding: '0.75rem', borderRadius: '8px', border: `2px solid ${ddpOk ? '#10B981' : '#EF4444'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)', fontSize: '1.3rem' }}>
                                    <ShieldCheck size={20} /> Taux de Détection (DDP)
                                </h3>
                                <div style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>{useBusiness ? 'Lié' : 'Linked'}: {rates.prodMilestone} | {useBusiness ? 'Objectif' : 'Target'} &gt; 95%</div>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: ddpOk ? '#10B981' : '#EF4444' }}>{rates.detectionRate}%</div>
                                <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{rates.bugsInTest} {useBusiness ? 'bugs test' : 'test bugs'}</div>
                            </div>
                        </div>
                    </div>

                </div> {/* Fin Section Prod */}
            </div>
        </div>
    );
};

export default Dashboard4;
