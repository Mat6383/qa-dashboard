import React from 'react';
import { ShieldAlert, ShieldCheck, Activity, Database, CheckCircle, Bug } from 'lucide-react';

const Dashboard3 = ({ metrics, project, isDark = false, useBusiness = true }) => {
    if (!metrics || !project) {
        return (
            <div className="tv-loading">
                <Activity size={48} className="spinner" />
                <h2>Chargement des données ISTQB...</h2>
            </div>
        );
    }

    const rates = metrics.qualityRates || {
        escapeRate: 0,
        detectionRate: 0,
        bugsInProd: 0,
        bugsInTest: 0,
        totalBugs: 0,
        preprodMilestone: 'N/A',
        prodMilestone: 'N/A',
        message: 'Données non disponibles'
    };

    const escapeOk = rates.escapeRate < 5;
    const ddpOk = rates.detectionRate > 95;

    return (
        <div className={`tv-dashboard ${isDark ? 'dark' : ''}`} style={{ padding: '2rem' }}>
            <header className="tv-header" style={{ marginBottom: '2rem' }}>
                <div className="tv-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ShieldCheck size={48} color="var(--primary-color)" />
                    <div>
                        <h1 style={{ margin: 0 }}>{useBusiness ? 'Métrique de Qualité (ISTQB)' : 'Quality Rates'}</h1>
                        <h2 style={{ margin: 0, opacity: 0.8, fontSize: '1.2rem', fontWeight: 400 }}>{project.name}</h2>
                    </div>
                </div>
                <div className="tv-time" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                    {new Date().toLocaleTimeString('fr-FR')}
                </div>
            </header>

            {rates.message && rates.totalBugs === 0 ? (
                <div className="alert-box" style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <ShieldAlert size={48} color="#F59E0B" style={{ marginBottom: '1rem' }} />
                    <h3>Information</h3>
                    <p>{rates.message}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    {/* Escape Rate Card */}
                    <div className="metric-card tv-card" style={{
                        backgroundColor: 'var(--card-bg)',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: `2px solid ${escapeOk ? '#10B981' : '#EF4444'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldAlert size={28} />
                            Taux d'Échappement (Escape Rate)
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <div style={{ fontSize: '4.5rem', fontWeight: 800, color: escapeOk ? '#10B981' : '#EF4444' }}>
                                {rates.escapeRate}%
                            </div>
                            <span style={{ fontSize: '2rem', color: escapeOk ? '#10B981' : '#EF4444' }}>
                                {escapeOk ? '▼' : '▲'} {/* Inversé: Moins c'est mieux */}
                            </span>
                        </div>
                        <p style={{ fontSize: '1.2rem', opacity: 0.8, marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ padding: '0.2rem 0.5rem', backgroundColor: escapeOk ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: escapeOk ? '#10B981' : '#EF4444', borderRadius: '4px', fontWeight: 600, fontSize: '1rem' }}>
                                Cible: &lt; 5%
                            </span>
                        </p>
                        <div style={{ marginTop: '1.5rem', width: '100%', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{rates.bugsInProd}</span>
                            <span style={{ opacity: 0.8 }}> {useBusiness ? 'bugs trouvés en PROD' : 'bugs found in PROD'}</span>
                            <br />
                            <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>{useBusiness ? 'Jalon' : 'Milestone'}: {rates.prodMilestone}</span>
                        </div>
                    </div>

                    {/* Detection Rate Card */}
                    <div className="metric-card tv-card" style={{
                        backgroundColor: 'var(--card-bg)',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: `2px solid ${ddpOk ? '#10B981' : '#EF4444'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldCheck size={28} />
                            Taux de Détection (DDP)
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <div style={{ fontSize: '4.5rem', fontWeight: 800, color: ddpOk ? '#10B981' : '#EF4444' }}>
                                {rates.detectionRate}%
                            </div>
                            <span style={{ fontSize: '2rem', color: ddpOk ? '#10B981' : '#EF4444' }}>
                                {ddpOk ? '▲' : '▼'}
                            </span>
                        </div>
                        <p style={{ fontSize: '1.2rem', opacity: 0.8, marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ padding: '0.2rem 0.5rem', backgroundColor: ddpOk ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: ddpOk ? '#10B981' : '#EF4444', borderRadius: '4px', fontWeight: 600, fontSize: '1rem' }}>
                                Cible: &gt; 95%
                            </span>
                        </p>
                        <div style={{ marginTop: '1.5rem', width: '100%', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{rates.bugsInTest}</span>
                            <span style={{ opacity: 0.8 }}> {useBusiness ? 'bugs trouvés en TEST' : 'bugs found in TEST'}</span>
                            <br />
                            <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>{useBusiness ? 'Jalon' : 'Milestone'}: {rates.prodMilestone}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Détails explicatifs */}
            <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr', gap: '2rem' }}>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Database size={20} />
                        Définitions
                    </h3>
                    <p style={{ opacity: 0.8, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                        <strong>{useBusiness ? 'Taux d\'Échappement :' : 'Escape Rate :'}</strong> Mesure les défauts qui ont échappé aux tests et ont été découverts en production. Plus le taux est bas, meilleure est la qualité des tests.
                    </p>
                    <p style={{ opacity: 0.8, fontSize: '0.95rem' }}>
                        <strong>{useBusiness ? 'Taux de Détection (DDP) :' : 'Detection Rate (DDP) :'}</strong> Mesure le pourcentage de défauts identifiés et corrigés avant la mise en production.
                    </p>
                </div>

                <div style={{ paddingLeft: '2rem', borderLeft: '1px solid var(--border-color)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Activity size={20} />
                        Détails du calcul ({rates.totalBugs} bugs au total)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
                                <CheckCircle size={16} color="#10B981" />
                                Défauts test : {rates.bugsInTest}
                            </span>
                            <div style={{ flex: 1, margin: '0 1rem', height: '8px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${rates.totalBugs > 0 ? (rates.bugsInTest / rates.totalBugs) * 100 : 0}%`, height: '100%', backgroundColor: '#10B981' }}></div>
                            </div>
                            <span style={{ fontWeight: 600, width: '4rem', textAlign: 'right' }}>{rates.totalBugs > 0 ? Math.round((rates.bugsInTest / rates.totalBugs) * 100) : 0}%</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
                                <Bug size={16} color="#EF4444" />
                                Défauts prod : {rates.bugsInProd}
                            </span>
                            <div style={{ flex: 1, margin: '0 1rem', height: '8px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${rates.totalBugs > 0 ? (rates.bugsInProd / rates.totalBugs) * 100 : 0}%`, height: '100%', backgroundColor: '#EF4444' }}></div>
                            </div>
                            <span style={{ fontWeight: 600, width: '4rem', textAlign: 'right' }}>{rates.totalBugs > 0 ? Math.round((rates.bugsInProd / rates.totalBugs) * 100) : 0}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard3;
