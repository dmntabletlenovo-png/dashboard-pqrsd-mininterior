const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const excelPath = path.join(__dirname, 'chat', 'xevi5kpckn.xlsx');
const workbook = XLSX.readFile(excelPath);

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Sheet name:', sheetName);
console.log('Total rows:', jsonData.length);
console.log('Headers:', jsonData[0]);

// Map Excel columns to our data structure
const headers = jsonData[0];
const documentos = [];

for (let i = 1; i < jsonData.length; i++) {
  const row = jsonData[i];
  
  if (!row || row.length === 0) continue;
  
  // Create document object matching our interface
  const doc = {
    id: parseInt(row[0]) || 0,                    // ID-CONTROL
    radicado: row[1] || '',                         // RADICADO
    fechaRadicacion: row[2] || '',                  // FECHA RADICACIÓN
    serie: row[3] || '',                            // SERIE
    subserie: row[4] || '',                         // SUBSERIE
    tipologia: row[5] || '',                        // TIPOLOGÍA DOCUMENTAL
    clasificacion: row[6] || '',                    // CLASIFICACION MANUAL
    asunto: row[7] || '',                           // ASUNTO O RESUMEN
    firmante: row[8] || '',                         // FIRMANTE
    estado: row[9] || '',                           // ESTADO TRAMITE
    fechaVencimiento: row[10] || '',                // FECHA VENCIMIENTO
    oficina: row[11] || '',                         // OFICINA EXITOSA
    gestor: row[12] || '',                          // GESTOR EXITOSA
    dependencia: row[13] || '',                     // DEPENDENCIA
    dias: parseInt(row[14]) || 0,                   // DIAS
    rangos: row[15] || ''                          // RANGOS
  };
  
  documentos.push(doc);
}

console.log('\nDocuments parsed:', documentos.length);
console.log('First document:', JSON.stringify(documentos[0], null, 2));

// Calculate statistics
const estadisticas = {
  total: documentos.length,
  porSerie: {},
  porSubserie: {},
  porEstado: {},
  porOficina: {},
  porRangoDias: {},
  documentosVencidos: 0,
  documentosPendientes: 0,
  diasPromedio: 0
};

documentos.forEach(doc => {
  // Count by serie
  if (doc.serie) {
    estadisticas.porSerie[doc.serie] = (estadisticas.porSerie[doc.serie] || 0) + 1;
  }
  
  // Count by subserie
  if (doc.subserie && doc.subserie !== 'NaN') {
    estadisticas.porSubserie[doc.subserie] = (estadisticas.porSubserie[doc.subserie] || 0) + 1;
  }
  
  // Count by estado
  if (doc.estado) {
    estadisticas.porEstado[doc.estado] = (estadisticas.porEstado[doc.estado] || 0) + 1;
  }
  
  // Count by oficina
  if (doc.oficina) {
    estadisticas.porOficina[doc.oficina] = (estadisticas.porOficina[doc.oficina] || 0) + 1;
  }
  
  // Count by rangos
  if (doc.rangos) {
    estadisticas.porRangoDias[doc.rangos] = (estadisticas.porRangoDias[doc.rangos] || 0) + 1;
  }
  
  // Count pendientes
  if (doc.estado === 'SIN INICIAR TRAMITE' || doc.estado === 'EN TRAMITE') {
    estadisticas.documentosPendientes++;
  }
  
  // Count vencidos (documents with dias > 0)
  if (doc.dias > 0) {
    estadisticas.documentosVencidos++;
  }
});

// Calculate average days
const totalDias = documentos.reduce((sum, doc) => sum + doc.dias, 0);
estadisticas.diasPromedio = documentos.length > 0 ? Math.round(totalDias / documentos.length) : 0;

// Calculate distribution by month
const distribucionMensual = {};
documentos.forEach(doc => {
  if (doc.fechaRadicacion && doc.fechaRadicacion !== 'NaN') {
    const dateStr = doc.fechaRadicacion.toString();
    // Try to parse date in YYYY-MM-DD format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const monthYear = dateStr.substring(0, 7); // YYYY-MM
      distribucionMensual[monthYear] = (distribucionMensual[monthYear] || 0) + 1;
    }
  }
});

// Calculate top gestores
const gestorCount = {};
documentos.forEach(doc => {
  if (doc.gestor && doc.gestor !== 'NaN') {
    gestorCount[doc.gestor] = (gestorCount[doc.gestor] || 0) + 1;
  }
});

const topGestores = Object.entries(gestorCount)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);

// Build final data structure
const data = {
  documentos,
  estadisticas,
  distribucionMensual,
  topGestores
};

// Write JSON files
const outputPath1 = path.join(__dirname, 'src', 'data', 'pqrsd_data.json');
const outputPath2 = path.join(__dirname, 'public', 'data', 'pqrsd_data.json');

fs.writeFileSync(outputPath1, JSON.stringify(data, null, 2));
fs.writeFileSync(outputPath2, JSON.stringify(data, null, 2));

console.log('\n✅ Data exported successfully!');
console.log(`   - ${outputPath1}`);
console.log(`   - ${outputPath2}`);
console.log('\nStatistics:');
console.log(`   - Total documents: ${estadisticas.total}`);
console.log(`   - Pending: ${estadisticas.documentosPendientes}`);
console.log(`   - Overdue: ${estadisticas.documentosVencidos}`);
console.log(`   - Average days: ${estadisticas.diasPromedio}`);
console.log(`   - Series: ${Object.keys(estadisticas.porSerie).length}`);
console.log(`   - Top gestores: ${topGestores.length}`);
