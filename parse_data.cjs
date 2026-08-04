const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('7ec7ljcklx.xlsx');
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Clean and structure the data
const pqrsdData = data.map(row => ({
  id: row['ID-CONTROL'] || 0,
  radicado: row['RADICADO'] || '',
  fechaRadicacion: row['FECHA RADICACIÓN'] || '',
  serie: row['SERIE'] || '',
  subserie: row['SUBSERIE'] || '',
  tipologia: row['TIPOLOGÍA DOCUMENTAL'] || '',
  clasificacion: row['CLASIFICACION MANUAL'] || '',
  asunto: (row['ASUNTO O RESUMEN'] || '').substring(0, 200),
  firmante: row['FIRMANTE'] || '',
  estado: row['ESTADO TRAMITE'] || '',
  fechaVencimiento: row['FECHA VENCIMIENTO'] || '',
  oficina: row['OFICINA EXITOSA'] || '',
  gestor: row['GESTOR EXITOSA'] || '',
  dependencia: row['DEPENDENCIA'] || '',
  dias: row['DIAS'] || 0,
  rangos: row['RANGOS'] || ''
}));

// Generate summary statistics
const stats = {
  total: pqrsdData.length,
  porSerie: {},
  porSubserie: {},
  porEstado: {},
  porOficina: {},
  porRangoDias: {},
  documentosVencidos: 0,
  documentosPendientes: 0,
  diasPromedio: 0
};

let totalDias = 0;
let countDias = 0;

pqrsdData.forEach(doc => {
  // Count by serie
  stats.porSerie[doc.serie] = (stats.porSerie[doc.serie] || 0) + 1;
  
  // Count by subserie
  stats.porSubserie[doc.subserie] = (stats.porSubserie[doc.subserie] || 0) + 1;
  
  // Count by status
  stats.porEstado[doc.estado] = (stats.porEstado[doc.estado] || 0) + 1;
  
  // Count by office
  if (doc.oficina) {
    stats.porOficina[doc.oficina] = (stats.porOficina[doc.oficina] || 0) + 1;
  }
  
  // Count by day range
  if (doc.rangos) {
    stats.porRangoDias[doc.rangos] = (stats.porRangoDias[doc.rangos] || 0) + 1;
  }
  
  // Calculate averages
  if (doc.dias && doc.dias > 0) {
    totalDias += doc.dias;
    countDias++;
  }
  
  // Check expired
  if (doc.fechaVencimiento) {
    const vencimiento = new Date(doc.fechaVencimiento);
    if (vencimiento < new Date()) {
      stats.documentosVencidos++;
    } else {
      stats.documentosPendientes++;
    }
  }
});

stats.diasPromedio = countDias > 0 ? Math.round(totalDias / countDias) : 0;

// Monthly distribution (by radicacion date)
const porMes = {};
pqrsdData.forEach(doc => {
  if (doc.fechaRadicacion) {
    const fecha = new Date(doc.fechaRadicacion);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    porMes[key] = (porMes[key] || 0) + 1;
  }
});

// Top gestores (managers)
const gestores = {};
pqrsdData.forEach(doc => {
  if (doc.gestor && doc.gestor !== 'NaN') {
    const nombre = doc.gestor.split(':')[0].trim();
    if (nombre && nombre.length > 3) {
      gestores[nombre] = (gestores[nombre] || 0) + 1;
    }
  }
});

// Sort gestores by count
const topGestores = Object.entries(gestores)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([name, count]) => ({ name, count }));

const output = {
  documentos: pqrsdData,
  estadisticas: stats,
  distribucionMensual: porMes,
  topGestores
};

fs.writeFileSync('src/data/pqrsd_data.json', JSON.stringify(output, null, 2));
console.log(`Processed ${pqrsdData.length} documents`);
console.log('Stats:', JSON.stringify(stats, null, 2));
