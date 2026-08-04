const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, 'chat', 'ngwg3igzga.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = lines[0].split(',').map(h => h.trim());

console.log('Headers:', headers);
console.log('Total lines:', lines.length - 1);

// Map CSV columns to our data structure
const documentos = [];

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  
  // Handle values that might contain commas within quotes
  const row = {};
  let currentField = '';
  let fieldIndex = 0;
  let inQuotes = false;
  
  for (let j = 0; j < lines[i].length; j++) {
    const char = lines[i][j];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row[headers[fieldIndex]] = currentField.trim();
      currentField = '';
      fieldIndex++;
    } else {
      currentField += char;
    }
  }
  row[headers[fieldIndex]] = currentField.trim();
  
  // Convert to our data structure
  const doc = {
    id: parseInt(row['ID']) || 0,
    radicado: row['Radicado'] || '',
    fechaRadicacion: row['Fecha Radicación'] || '',
    serie: row['Serie'] || '',
    subserie: row['Subserie'] || '',
    tipologia: row['Tipología'] || '',
    clasificacion: row['Clasificación'] || '',
    asunto: row['Asunto'] || '',
    firmante: '',
    estado: row['Estado'] || '',
    fechaVencimiento: '',
    oficina: row['Oficina'] || '',
    gestor: row['Gestor'] || '',
    dependencia: row['Oficina'] || '',
    dias: parseInt(row['Días']) || 0,
    rangos: row['Rangos'] || ''
  };
  
  documentos.push(doc);
}

console.log('Documents parsed:', documentos.length);
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
  if (doc.subserie) {
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
});

// Calculate average days
const totalDias = documentos.reduce((sum, doc) => sum + doc.dias, 0);
estadisticas.diasPromedio = documentos.length > 0 ? Math.round(totalDias / documentos.length) : 0;

// Calculate distribution by month
const distribucionMensual = {};
documentos.forEach(doc => {
  if (doc.fechaRadicacion) {
    // The fechaRadicacion appears to be in Excel serial date format
    // For now, we'll just group by what we can parse
    const dateStr = doc.fechaRadicacion.toString();
    if (dateStr.length === 5) {
      // Excel serial date - convert to month/year
      const excelDate = new Date((parseInt(dateStr) - 25569) * 86400 * 1000);
      const monthYear = `${excelDate.getFullYear()}-${String(excelDate.getMonth() + 1).padStart(2, '0')}`;
      distribucionMensual[monthYear] = (distribucionMensual[monthYear] || 0) + 1;
    }
  }
});

// Calculate top gestores
const gestorCount = {};
documentos.forEach(doc => {
  if (doc.gestor) {
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
console.log(`   - Average days: ${estadisticas.diasPromedio}`);
console.log(`   - Series: ${Object.keys(estadisticas.porSerie).length}`);
console.log(`   - Top gestores: ${topGestores.length}`);
