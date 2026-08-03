const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const prisma = require('../config/prisma');

async function getRendezVousTermines(from, to) {
  const where = { statut: 'TERMINE' };
  if (from || to) {
    where.dateHeureDebut = {};
    if (from) where.dateHeureDebut.gte = new Date(from);
    if (to) where.dateHeureDebut.lte = new Date(to);
  }
  return prisma.rendezVous.findMany({
    where,
    include: { client: true, coupe: true },
    orderBy: { dateHeureDebut: 'asc' },
  });
}

// GET /api/admin/rapports/pdf?from=&to=
async function exportPdf(req, res) {
  const { from, to } = req.query;
  const rdvs = await getRendezVousTermines(from, to);
  const totalCA = rdvs.reduce((sum, r) => sum + r.tarifApplique, 0);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="rapport-financier.pdf"');

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  doc.fontSize(18).text('Rapport financier — Salon de coiffure', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('gray').text(
    `Période : ${from ? new Date(from).toLocaleDateString('fr-FR') : 'depuis le début'} au ${
      to ? new Date(to).toLocaleDateString('fr-FR') : 'aujourd\'hui'
    }`,
    { align: 'center' }
  );
  doc.moveDown(1.5);
  doc.fillColor('black');

  // En-têtes du tableau
  const startX = 40;
  let y = doc.y;
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Date', startX, y, { width: 90 });
  doc.text('Client', startX + 90, y, { width: 130 });
  doc.text('Coupe', startX + 220, y, { width: 130 });
  doc.text('Montant (FCFA)', startX + 350, y, { width: 100 });
  doc.moveDown(0.5);
  doc.font('Helvetica');
  doc.moveTo(startX, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.3);

  rdvs.forEach((r) => {
    if (doc.y > 750) doc.addPage();
    y = doc.y;
    doc.fontSize(9);
    doc.text(new Date(r.dateHeureDebut).toLocaleDateString('fr-FR'), startX, y, { width: 90 });
    doc.text(`${r.client.prenom} ${r.client.nom}`, startX + 90, y, { width: 130 });
    doc.text(r.coupe.nom, startX + 220, y, { width: 130 });
    doc.text(String(r.tarifApplique), startX + 350, y, { width: 100 });
    doc.moveDown(0.6);
  });

  doc.moveDown(1);
  doc.moveTo(startX, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').text(`Total : ${totalCA} FCFA (${rdvs.length} rendez-vous)`, {
    align: 'right',
  });

  doc.end();
}

// GET /api/admin/rapports/excel?from=&to=
async function exportExcel(req, res) {
  const { from, to } = req.query;
  const rdvs = await getRendezVousTermines(from, to);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Rapport financier');

  sheet.columns = [
    { header: 'Date', key: 'date', width: 18 },
    { header: 'Client', key: 'client', width: 25 },
    { header: 'Téléphone', key: 'telephone', width: 18 },
    { header: 'Coupe', key: 'coupe', width: 25 },
    { header: 'Montant (FCFA)', key: 'montant', width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };

  rdvs.forEach((r) => {
    sheet.addRow({
      date: new Date(r.dateHeureDebut).toLocaleString('fr-FR'),
      client: `${r.client.prenom} ${r.client.nom}`,
      telephone: r.client.telephone,
      coupe: r.coupe.nom,
      montant: r.tarifApplique,
    });
  });

  const totalCA = rdvs.reduce((sum, r) => sum + r.tarifApplique, 0);
  const lastRow = sheet.addRow({ client: '', coupe: 'TOTAL', montant: totalCA });
  lastRow.font = { bold: true };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename="rapport-financier.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { exportPdf, exportExcel };
