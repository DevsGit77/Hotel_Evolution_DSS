function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      const v = r[h];
      const s = v == null ? '' : String(v);
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function generatePDF(title, tables, filename) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(16);
  doc.text(title, 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 10;
  tables.forEach((table, ti) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(13);
    doc.text(table.title || `Table ${ti+1}`, 14, y);
    y += 8;
    if (table.headers && table.rows) {
      doc.autoTable({
        startY: y,
        head: [table.headers],
        body: table.rows,
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [12, 68, 124] }
      });
      y = doc.lastAutoTable.finalY + 10;
    }
  });
  doc.save(filename);
}

function resultsToTableRows(results, labelKey, valueKey) {
  return results.map(r => {
    const row = {};
    Object.keys(r).forEach(k => {
      const v = r[k];
      row[k] = typeof v === 'number' ? v.toFixed(4) : v;
    });
    return row;
  });
}
