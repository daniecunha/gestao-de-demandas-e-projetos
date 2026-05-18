import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Report } from '../types';
import { formatarData, formatarDataHora } from './dateUtils';
import { SEMAFORO_LABELS } from './statusUtils';

/** Exporta um elemento HTML como PDF */
export async function exportarElementoPDF(
  elementId: string,
  nomeArquivo: string
): Promise<void> {
  const elemento = document.getElementById(elementId);
  if (!elemento) throw new Error(`Elemento #${elementId} não encontrado`);

  const canvas = await html2canvas(elemento, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth - 20; // margem de 10mm em cada lado
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let yPos = 10;
  let heightLeft = imgHeight;

  pdf.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight);
  heightLeft -= pdfHeight - 20;

  // Adicionar páginas extras se o conteúdo for longo
  while (heightLeft > 0) {
    yPos = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20;
  }

  pdf.save(`${nomeArquivo}.pdf`);
}

/** Gera PDF de relatório executivo programaticamente (sem capturar HTML) */
export function exportarRelatorioPDF(report: Report): void {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // ─── Cabeçalho ───────────────────────────────────────────
  pdf.setFillColor(30, 58, 138); // azul escuro
  pdf.rect(0, 0, pageWidth, 35, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatório Executivo', margin, 15);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(report.periodo_ref, margin, 23);
  pdf.setFontSize(9);
  pdf.text(`Gerado em: ${formatarDataHora(report.gerado_em)}`, margin, 30);

  y = 45;
  pdf.setTextColor(30, 30, 30);

  // ─── Período ─────────────────────────────────────────────
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    `Período: ${formatarData(report.data_inicio)} a ${formatarData(report.data_fim)}`,
    margin,
    y
  );
  y += 10;

  // ─── Status por Projeto ───────────────────────────────────
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Status por Projeto', margin, y);
  y += 8;

  for (const snap of report.projetos_snapshot) {
    if (y > 260) { pdf.addPage(); y = 20; }

    // Cor semáforo
    const corMap: Record<string, [number, number, number]> = {
      verde: [22, 163, 74],
      amarelo: [234, 179, 8],
      vermelho: [220, 38, 38],
    };
    const cor = corMap[snap.cor_semaforo] ?? [100, 100, 100];

    pdf.setFillColor(...cor);
    pdf.circle(margin + 2, y - 1.5, 2.5, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text(snap.nome, margin + 7, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    const semaforoLabel = SEMAFORO_LABELS[snap.cor_semaforo];
    pdf.text(
      `${semaforoLabel} — ${snap.tarefas_concluidas} concluídas / ${snap.tarefas_abertas} abertas`,
      margin + 7,
      y + 5
    );
    y += 11;

    if (snap.observacao) {
      const linhas = pdf.splitTextToSize(snap.observacao, contentWidth - 10);
      pdf.text(linhas as string[], margin + 7, y);
      y += (linhas as string[]).length * 4 + 2;
    }

    if (snap.valor_negocio) {
      if (y > 265) { pdf.addPage(); y = 20; }
      pdf.setFontSize(8);
      pdf.setTextColor(22, 163, 74);
      pdf.text('Valor: ', margin + 7, y);
      pdf.setTextColor(80, 80, 80);
      const linhasValor = pdf.splitTextToSize(snap.valor_negocio, contentWidth - 20);
      pdf.text(linhasValor as string[], margin + 18, y);
      y += (linhasValor as string[]).length * 4 + 2;
    }

    if (snap.okrs && snap.okrs.length > 0) {
      if (y > 265) { pdf.addPage(); y = 20; }
      pdf.setFontSize(8);
      pdf.setTextColor(124, 58, 237);
      pdf.text(`OKRs: ${snap.okrs.join(' · ')}`, margin + 7, y);
      pdf.setTextColor(100, 100, 100);
      y += 5;
    }

    y += 4;
  }

  // ─── Destaques ────────────────────────────────────────────
  const adicionarSecao = (titulo: string, itens: string[], cor: [number, number, number]) => {
    if (!itens.length) return;
    if (y > 240) { pdf.addPage(); y = 20; }

    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text(titulo, margin, y);
    y += 7;

    for (const item of itens) {
      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.setFillColor(...cor);
      pdf.rect(margin, y - 3, 2, 4, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(50, 50, 50);
      const linhas = pdf.splitTextToSize(`  ${item}`, contentWidth - 5);
      pdf.text(linhas as string[], margin + 4, y);
      y += (linhas as string[]).length * 4.5 + 2;
    }
    y += 5;
  };

  adicionarSecao('Destaques Positivos', report.destaques, [22, 163, 74]);
  adicionarSecao('Pontos de Atenção / Riscos', report.riscos, [220, 38, 38]);
  adicionarSecao('Próximos Passos (30 dias)', report.proximos_passos, [37, 99, 235]);

  // ─── Rodapé ───────────────────────────────────────────────
  const totalPages = (pdf as jsPDF & { internal: { pages: unknown[] } }).internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Gestão de Demandas e Projetos — ${report.periodo_ref} — Página ${i} de ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  pdf.save(`Relatorio_${report.periodo_ref.replace(' ', '_')}.pdf`);
}
