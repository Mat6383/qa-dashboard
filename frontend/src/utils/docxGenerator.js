import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export const generateQuickClosureDoc = async ({ currentMetrics, selectedPastRuns, project, environment, startDate, endDate, bugs }) => {
    // Extraire les données actuelles
    const rates = currentMetrics.qualityRates || {
        detectionRate: 0, bugsInTest: 0, totalBugs: 0
    };
    
    const execRate = currentMetrics.completionRate || 0;
    const passRate = currentMetrics.passRate || 0;
    const failRate = currentMetrics.failureRate || 0;
    const blockedRate = currentMetrics.blockedRate || 0;
    const efficiency = currentMetrics.testEfficiency || 0;

    const raw = currentMetrics.raw || { total: 0, passed: 0, failed: 0, untested: 0, blocked: 0, skipped: 0 };

    // Création des sections
    const children = [];

    // Titre Principal
    children.push(
        new Paragraph({
            text: `Rapport de Clôture de Test - ${project.name}`,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        })
    );

    children.push(
        new Paragraph({
            text: `Date d'édition : ${new Date().toLocaleDateString('fr-FR')}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        }),
        new Paragraph({
            text: `Environnement : ${environment || 'Non spécifié'} | Période : ${startDate || 'N/A'} au ${endDate || 'N/A'}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 }
        })
    );

    // --- 1. ISTQB ---
    children.push(
        new Paragraph({
            text: "1. Synthèse Qualité (Norme ISTQB)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 }
        })
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({ text: "• Volumes de Tests : ", bold: true }),
                new TextRun(`${raw.total} tests prévus. `),
                new TextRun(`${raw.passed} réussis, `),
                new TextRun(`${raw.failed} échoués, `),
                new TextRun(`${raw.blocked + raw.skipped} bloqués/ignorés, `),
                new TextRun(`${raw.untested} non exécutés.`),
            ],
            spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "• Taux d'Exécution : ", bold: true }),
                new TextRun(`${execRate}%`),
            ],
            spacing: { before: 100 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "• Taux de Succès : ", bold: true }),
                new TextRun(`${passRate}%`),
            ],
            spacing: { before: 100 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "• Taux d'Échec : ", bold: true }),
                new TextRun(`${failRate}%`),
            ],
            spacing: { before: 100 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "• Taux de Blocage : ", bold: true }),
                new TextRun(`${blockedRate}%`),
            ],
            spacing: { before: 100 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "• Taux de Détection (DDP) : ", bold: true }),
                new TextRun(`${rates.detectionRate}% (${rates.bugsInTest} bugs détectés en tests)`),
            ],
            spacing: { before: 100, after: 200 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Analyse des blocages & non-exécutés : ", bold: true }),
            ],
            spacing: { before: 100 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "[À remplir : Préciser les raisons des blocages d'environnement, données manquantes, etc.]", color: "888888", italics: true }),
            ],
            spacing: { before: 50, after: 200 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Couverture des Exigences & Risques : ", bold: true }),
            ],
            spacing: { before: 100 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "[À remplir : Indiquer si l'ensemble des exigences de la release ont été couvertes par les tests]", color: "888888", italics: true }),
            ],
            spacing: { before: 50, after: 400 }
        })
    );

    // --- 2. ITIL ---
    children.push(
        new Paragraph({
            text: "2. Impact Production & Risques (Norme ITIL)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 }
        })
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({ text: "Décision de Mise en Production (Go/No-Go) : ", bold: true }),
            ],
            spacing: { before: 100 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "[À remplir : GO avec réserves / GO / NO-GO]", color: "888888", italics: true }),
            ],
            spacing: { before: 50, after: 200 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Évaluation des Risques Résiduels : ", bold: true }),
            ],
            spacing: { before: 100 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "[À remplir : Décrire les risques restants connus]", color: "888888", italics: true }),
            ],
            spacing: { before: 50, after: 200 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Liste des Anomalies Majeures/Critiques Restantes : ", bold: true }),
            ],
            spacing: { before: 100, after: 100 }
        })
    );

    const validBugs = (bugs || []).filter(b => b.desc && b.desc.trim() !== '');
    if (validBugs.length > 0) {
        validBugs.forEach(b => {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `• [${b.severity}] `, bold: true, color: b.severity === 'Critique' ? "FF0000" : "FFA500" }),
                        new TextRun(`${b.desc}`),
                    ],
                    spacing: { before: 50 }
                })
            );
        });
        children.push(new Paragraph({ spacing: { after: 300 } })); // Espace additionnel
    } else {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: "Aucune anomalie majeure/critique ouverte signalée.", italics: true }),
                ],
                spacing: { before: 50, after: 300 }
            })
        );
    }

    // --- 3. LEAN ---
    children.push(
        new Paragraph({
            text: "3. Efficience (Norme LEAN)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 }
        })
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({ text: "• Efficience globale des tests : ", bold: true }),
                new TextRun(`${efficiency}%`),
            ],
            spacing: { before: 100, after: 200 }
        })
    );

    if (selectedPastRuns && selectedPastRuns.length > 0) {
        children.push(
            new Paragraph({
                text: "Consolidation des campagnes sélectionnées :",
                bold: true,
                spacing: { before: 200, after: 200 }
            })
        );

        // Consolidation
        const totBugsTest = selectedPastRuns.reduce((acc, r) => acc + (r.bugsInTest || 0), 0);
        const totBugsProd = selectedPastRuns.reduce((acc, r) => acc + (r.bugsInProd || 0), 0);
        const runsNames = selectedPastRuns.map(r => r.version).join(' + ');
        const totalBugsConsolidated = totBugsTest + totBugsProd;
        const ddpConsolidated = totalBugsConsolidated > 0 ? Math.round((totBugsTest / totalBugsConsolidated) * 100) : 100;

        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: `Versions fusionnées : ${runsNames}`, italics: true })
                ],
                spacing: { before: 100, after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: `• Total Bugs détectés en Test : ${totBugsTest}` })
                ],
                spacing: { before: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: `• DDP Consolidé : ${ddpConsolidated}%` })
                ],
                spacing: { before: 100, after: 400 }
            })
        );
    } else {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: "Aucune campagne historique supplémentaire n'a été fusionnée pour ce rapport.", italics: true, color: "888888" })
                ],
                spacing: { before: 100, after: 200 }
            })
        );
    }

    // Génération
    const doc = new Document({
        sections: [{
            properties: {},
            children: children
        }]
    });

    const blob = await Packer.toBlob(doc);
    return blob;
};
