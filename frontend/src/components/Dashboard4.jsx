import React, { useRef } from 'react';
import {
    ShieldAlert, ShieldCheck, Activity, Database, CheckCircle, Bug,
    Download, Layers, CheckSquare, XCircle, BarChart3, TrendingUp
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Dashboard4 = ({ metrics, project, isDark = false, useBusiness = true }) => {
    const dashboardRef = useRef(null);

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
        <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Bouton d'export (Non visible dans le PDF car hors du conteneur #dashboard-export) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                    onClick={handleExportPDF}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem', backgroundColor: '#3B82F6',
                        color: 'white', border: 'none', borderRadius: '8px',
                        fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}
                >
                    <Download size={20} />
                    Exporter en PDF
                </button>
            </div>

            {/* Conteneur principal à exporter en PDF */}
            <div
                ref={dashboardRef}
                className={`tv-dashboard ${isDark ? 'dark' : ''}`}
                style={{
                    padding: '2rem',
                    backgroundColor: 'var(--bg-color)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}
            >
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Layers size={40} color="#3B82F6" />
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-color)' }}>
                                {useBusiness ? 'Bilan Qualité Global' : 'Global QA Dashboard'}
                            </h1>
                            <h2 style={{ margin: 0, opacity: 0.7, fontSize: '1rem', fontWeight: 500 }}>{project.name}</h2>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-color)' }}>
                            {new Date().toLocaleDateString('fr-FR')}
                        </div>
                        <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                            ISTQB / ITIL / LEAN Compliant
                        </div>
                    </div>
                </header>

                {/* Grille principale (Responsive) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                    {/* Bloc 1: Taux d'Exécution */}
                    <div className="metric-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '1rem' }}>
                            <Activity size={20} color="#3B82F6" />
                            <span style={{ fontWeight: 600 }}>Taux d'Exécution</span>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: 800, color: '#3B82F6' }}>
                            {d1.completionRate}%
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ padding: '0.2rem 0.5rem', backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', borderRadius: '4px', fontWeight: 600 }}>{d1.raw.completed} / {d1.raw.total}</span>
                            <span style={{ opacity: 0.6 }}>tests exécutés</span>
                        </div>
                    </div>

                    {/* Bloc 2: Taux de Succès */}
                    <div className="metric-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '1rem' }}>
                            <CheckSquare size={20} color="#10B981" />
                            <span style={{ fontWeight: 600 }}>Taux de Succès</span>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10B981' }}>
                            {d1.passRate}%
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ padding: '0.2rem 0.5rem', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: '4px', fontWeight: 600 }}>{d1.raw.passed}</span>
                            <span style={{ opacity: 0.6 }}>tests réussis</span>
                        </div>
                    </div>

                    {/* Bloc 3: Taux d'Échec */}
                    <div className="metric-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '1rem' }}>
                            <XCircle size={20} color="#EF4444" />
                            <span style={{ fontWeight: 600 }}>Taux d'Échec</span>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: 800, color: '#EF4444' }}>
                            {d1.failureRate}%
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ padding: '0.2rem 0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', borderRadius: '4px', fontWeight: 600 }}>{d1.raw.failed}</span>
                            <span style={{ opacity: 0.6 }}>tests échoués</span>
                        </div>
                    </div>

                    {/* Bloc 4: Efficience */}
                    <div className="metric-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '1rem' }}>
                            <TrendingUp size={20} color="#8B5CF6" />
                            <span style={{ fontWeight: 600 }}>Efficience des tests</span>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: 800, color: '#8B5CF6' }}>
                            {d1.testEfficiency}%
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ padding: '0.2rem 0.5rem', backgroundColor: 'rgba(139,92,246,0.1)', color: '#8B5CF6', borderRadius: '4px', fontWeight: 600 }}>Objectif</span>
                            <span style={{ opacity: 0.6 }}>Approcher les 100%</span>
                        </div>
                    </div>
                </div>

                {/* Ligne 2 : Qualité (Dashboard 3) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* Escape Rate */}
                    <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: `2px solid ${escapeOk ? '#10B981' : '#EF4444'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)' }}>
                                <ShieldAlert size={20} /> Taux d'Échappement (PROD)
                            </h3>
                            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Milestone: {rates.prodMilestone} | Objectif &lt; 5%</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: escapeOk ? '#10B981' : '#EF4444' }}>{rates.escapeRate}%</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{rates.bugsInProd} bugs prod</div>
                        </div>
                    </div>

                    {/* Detection Rate */}
                    <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: `2px solid ${ddpOk ? '#10B981' : '#EF4444'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)' }}>
                                <ShieldCheck size={20} /> Taux de Détection (TEST)
                            </h3>
                            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Lié: {rates.prodMilestone} | Objectif &gt; 95%</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: ddpOk ? '#10B981' : '#EF4444' }}>{rates.detectionRate}%</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{rates.bugsInTest} bugs test</div>
                        </div>
                    </div>
                </div>

                {/* Ligne 3: Distribution & Campagnes (simplifiées) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>

                    <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)' }}>
                            <BarChart3 size={20} /> Répartition des statuts
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[
                                { label: 'Passed', val: d1.raw.passed, color: '#10B981' },
                                { label: 'Failed', val: d1.raw.failed, color: '#EF4444' },
                                { label: 'Blocked', val: d1.raw.blocked, color: '#F59E0B' },
                                { label: 'Untested', val: d1.raw.untested, color: '#9CA3AF' }
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

                    <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)' }}>
                            <Database size={20} /> Campagnes Actives (Aperçu)
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {d1.runs.slice(0, 6).map(run => (
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
                            {d1.runs.length > 6 && (
                                <div style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6, fontSize: '0.85rem', fontStyle: 'italic' }}>
                                    + {d1.runs.length - 6} autres campagnes...
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard4;
