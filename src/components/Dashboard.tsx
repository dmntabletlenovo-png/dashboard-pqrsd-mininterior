import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, AlertTriangle, Clock, TrendingUp, Filter, Download, 
  Search, ChevronDown, Users, Building2, BarChart3,
  Activity, Bell, FileSpreadsheet, PieChart, RefreshCw, Loader2
} from 'lucide-react';
import { loadData, getDataUrl, isExternalSource, clearCache } from '../services/dataService';
import logoMinisterio from '../assets/logo-ministerio.png';
import type { DocumentoPQRSD, Filtros, DataPQRSD } from '../types/pqrsd';

// Color palette - White Background with Red Accents
const colors = {
  primary: '#dc2626',
  secondary: '#ef4444',
  accent: '#f87171',
  danger: '#b91c1c',
  success: '#10b981',
  warning: '#f97316',
  bg: '#f8f9fa',
  card: '#ffffff',
  cardHover: '#fff5f5',
  cardBorder: '#fecaca',
  text: '#1f2937',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  softRed: '#ef4444',
  softRedLight: '#fca5a5',
  softRedDark: '#fef2f2',
  glow: '#ef444420',
  gradientStart: '#fef2f2',
  gradientEnd: '#ffffff'
};

// KPI Card Component
const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string; 
  trend?: number; 
  subtitle?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -4 }}
    className="relative rounded-2xl p-[1px] cursor-pointer transition-all duration-300"
    style={{ 
      background: `linear-gradient(135deg, ${color}40 0%, ${color}15 50%, ${color}05 100%)`,
      boxShadow: `0 4px 20px ${color}15`
    }}
  >
    <div className="relative overflow-hidden rounded-2xl p-6 h-full" style={{ backgroundColor: colors.card }}>
      {/* Decorative gradient circles */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-15" 
           style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
      <div className="absolute -bottom-6 -left-6 w-20 h-20 opacity-10" 
           style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium" style={{ color: colors.textMuted }}>{title}</p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{subtitle}</p>}
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              <TrendingUp size={14} className={trend >= 0 ? 'text-green-500' : 'text-red-500'} />
              <span className={`text-xs ml-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}12`, border: `1px solid ${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  </motion.div>
);

// Bar Chart Component
const BarChart = ({ 
  data, 
  maxValue, 
  labelKey, 
  valueKey, 
  color = colors.softRed,
  maxItems = 8
}: { 
  data: any[]; 
  maxValue: number; 
  labelKey: string; 
  valueKey: string; 
  color?: string;
  maxItems?: number;
}) => {
  const displayData = data.slice(0, maxItems);
  return (
    <div className="space-y-3">
      {displayData.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-xs w-32 truncate" style={{ color: colors.textMuted }}>
            {item[labelKey]}
          </span>
          <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ backgroundColor: `${color}20` }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
          <span className="text-sm font-semibold w-16 text-right" style={{ color: colors.text }}>
            {item[valueKey].toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// Alert Item Component
const AlertItem = ({ 
  titulo, 
  descripcion, 
  tipo, 
  fecha 
}: { 
  titulo: string; 
  descripcion: string; 
  tipo: 'warning' | 'danger' | 'info'; 
  fecha: string;
}) => {
  const bgColor = tipo === 'danger' ? '#7f1d1d' : tipo === 'warning' ? '#78350f' : '#1e3a5f';
  const borderColor = tipo === 'danger' ? colors.danger : tipo === 'warning' ? colors.warning : colors.softRed;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-lg border-l-4"
      style={{ backgroundColor: bgColor, borderLeftColor: borderColor }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} style={{ color: borderColor }} className="mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: colors.text }}>{titulo}</p>
          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{descripcion}</p>
          <p className="text-xs mt-2" style={{ color: colors.textMuted }}>{fecha}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Executive Summary Component
const ExecutiveSummary = ({ stats, documentos }: { stats: any; documentos: DocumentoPQRSD[] }) => {
  const topSeries = Object.entries(stats.porSerie)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const totalDocs = stats.total;
  
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.primary}40` }}>
        <h4 className="font-semibold mb-2" style={{ color: colors.softRedLight }}>Resumen Ejecutivo - Q3 2026</h4>
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Se han registrado un total de <strong style={{ color: colors.text }}>{totalDocs.toLocaleString()}</strong> documentos 
          en el sistema PQRSD. El {((stats.porSerie['DERECHOS DE PETICION'] || 0) / totalDocs * 100).toFixed(1)}% corresponden 
          a Derechos de Petición, seguido por Comunicaciones Oficiales ({((stats.porSerie['COMUNICACIONES'] || 0) / totalDocs * 100).toFixed(1)}%).
        </p>
      </div>
      
      <div className="space-y-2">
        <h5 className="font-semibold text-sm" style={{ color: colors.text }}>Top 5 Series Documentales:</h5>
        {topSeries.map(([serie, count], index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded" 
               style={{ backgroundColor: colors.card }}>
            <span className="text-xs" style={{ color: colors.textMuted }}>{serie}</span>
            <span className="text-sm font-bold" style={{ color: colors.softRed }}>
              {((count as number) / totalDocs * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.success}20` }}>
        <p className="text-xs" style={{ color: colors.success }}>
          ✓ Promedio de días de procesamiento: {stats.diasPromedio} días
        </p>
        <p className="text-xs mt-1" style={{ color: colors.success }}>
          ✓ Documentos en rango crítico (+1000 días): {stats.porRangoDias['L.más de 1000 días']?.toLocaleString() || 0}
        </p>
      </div>
    </div>
  );
};

// Export Function
const exportToCSV = (documentos: DocumentoPQRSD[], filename: string) => {
  const headers = ['ID', 'Radicado', 'Fecha Radicación', 'Serie', 'Subserie', 'Tipología', 'Clasificación', 'Asunto', 'Estado', 'Oficina', 'Gestor', 'Días', 'Rangos'];
  const rows = documentos.map(doc => [
    doc.id, doc.radicado, doc.fechaRadicacion, doc.serie, doc.subserie, 
    doc.tipologia, doc.clasificacion, `"${doc.asunto.replace(/"/g, '""')}"`, 
    doc.estado, doc.oficina, doc.gestor, doc.dias, doc.rangos
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

// Main Dashboard Component
export default function Dashboard() {
  const [data, setData] = useState<DataPQRSD | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filtros, setFiltros] = useState<Filtros>({
    serie: '',
    subserie: '',
    oficina: '',
    rangoDias: '',
    busqueda: '',
    dependencia: ''
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'alerts' | 'export' | 'dependencias'>('overview');
  
  // Load data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await loadData();
        setData(result);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  
  // Apply filters
  const documentosFiltrados = useMemo(() => {
    if (!data) return [];
    return data.documentos.filter(doc => {
      if (filtros.serie && !doc.serie.includes(filtros.serie)) return false;
      if (filtros.subserie && !doc.subserie.includes(filtros.subserie)) return false;
      if (filtros.oficina && !doc.oficina.includes(filtros.oficina)) return false;
      if (filtros.rangoDias && doc.rangos !== filtros.rangoDias) return false;
      if (filtros.dependencia && !doc.dependencia.includes(filtros.dependencia)) return false;
      if (filtros.busqueda) {
        const searchLower = filtros.busqueda.toLowerCase();
        if (!doc.asunto.toLowerCase().includes(searchLower) && 
            !doc.radicado.toLowerCase().includes(searchLower) &&
            !doc.firmante.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      return true;
    });
  }, [filtros, data]);
  
  // Filtered stats
  const statsFiltrados = useMemo(() => {
    const stats = {
      total: documentosFiltrados.length,
      documentosVencidos: 0,
      documentosPendientes: 0,
      diasPromedio: 0,
      porSerie: {} as Record<string, number>,
      porSubserie: {} as Record<string, number>,
      porOficina: {} as Record<string, number>,
      porRangoDias: {} as Record<string, number>,
      porClasificacion: {} as Record<string, number>
    };
    
    let totalDias = 0;
    let countDias = 0;
    
    documentosFiltrados.forEach(doc => {
      stats.porSerie[doc.serie] = (stats.porSerie[doc.serie] || 0) + 1;
      stats.porSubserie[doc.subserie] = (stats.porSubserie[doc.subserie] || 0) + 1;
      stats.porOficina[doc.oficina] = (stats.porOficina[doc.oficina] || 0) + 1;
      stats.porRangoDias[doc.rangos] = (stats.porRangoDias[doc.rangos] || 0) + 1;
      stats.porClasificacion[doc.clasificacion] = (stats.porClasificacion[doc.clasificacion] || 0) + 1;
      
      if (doc.dias > 0) {
        totalDias += doc.dias;
        countDias++;
      }
      
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
    
    return stats;
  }, [documentosFiltrados]);
  
  // Alerts based on data
  const alertas = useMemo(() => {
    const alerts = [];
    
    // Alert for documents over 1000 days
    const docsOver1000 = documentosFiltrados.filter(d => d.dias > 1000).length;
    if (docsOver1000 > 0) {
      alerts.push({
        titulo: 'Documentos con más de 1000 días de trámite',
        descripcion: `Hay ${docsOver1000.toLocaleString()} documentos que llevan más de 1000 días sin resolver. Se requiere atención inmediata.`,
        tipo: 'danger' as const,
        fecha: 'Revisión continua'
      });
    }
    
    // Alert for high volume series
    const topSeries = Object.entries(statsFiltrados.porSerie).sort((a, b) => b[1] - a[1])[0];
    if (topSeries) {
      alerts.push({
        titulo: `Alta demanda en: ${topSeries[0]}`,
        descripcion: `${topSeries[1].toLocaleString()} documentos en esta serie. Considerar asignar más recursos.`,
        tipo: 'warning' as const,
        fecha: 'Alerta automática'
      });
    }
    
    // Alert for pending documents
    if (statsFiltrados.documentosPendientes > 1000) {
      alerts.push({
        titulo: 'Volumen alto de documentos pendientes',
        descripcion: `${statsFiltrados.documentosPendientes.toLocaleString()} documentos con fecha de vencimiento por vencer.`,
        tipo: 'warning' as const,
        fecha: 'Monitoreo en tiempo real'
      });
    }
    
    return alerts;
  }, [documentosFiltrados, statsFiltrados]);
  
  // Top 20 Dependencias
  const topDependencias = useMemo(() => {
    const counts: Record<string, number> = {};
    documentosFiltrados.forEach(doc => {
      if (doc.dependencia) {
        counts[doc.dependencia] = (counts[doc.dependencia] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));
  }, [documentosFiltrados]);
  
  // Unique dependencias for filter dropdown
  const uniqueDependencias = useMemo(() => {
    if (!data) return [];
    const deps = new Set<string>();
    data.documentos.forEach(doc => {
      if (doc.dependencia) deps.add(doc.dependencia);
    });
    return Array.from(deps).sort();
  }, [data]);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(180deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)` }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Loader2 size={48} style={{ color: colors.softRed }} />
          </motion.div>
          <p className="text-lg font-semibold" style={{ color: colors.text }}>Cargando datos...</p>
          <p className="text-sm mt-2" style={{ color: colors.textMuted }}>
            {isExternalSource() ? 'Conectando con servidor de datos...' : 'Preparando dashboard...'}
          </p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(180deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)` }}>
        <div className="text-center max-w-md p-8 rounded-2xl" style={{ backgroundColor: colors.card, border: `1px solid ${colors.cardBorder}` }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${colors.danger}15` }}>
            <AlertTriangle size={32} style={{ color: colors.danger }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Error al cargar datos</h2>
          <p className="text-sm mb-4" style={{ color: colors.textMuted }}>{error || 'No se pudieron cargar los datos del dashboard'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-lg font-medium text-white"
            style={{ backgroundColor: colors.softRed }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)` }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" 
              style={{ backgroundColor: colors.card, borderColor: `${colors.softRed}20`, boxShadow: `0 2px 20px rgba(239,68,68,0.08)` }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={logoMinisterio} 
                alt="Logo Ministerio del Interior" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-xl font-bold" style={{ color: colors.text }}>
                  Ministerio del Interior Dashboard PQRSD
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" 
                   style={{ backgroundColor: `${colors.success}20` }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.success }} />
                <span className="text-xs font-medium" style={{ color: colors.success }}>En tiempo real</span>
              </div>
              {isExternalSource() && (
                <button
                  onClick={async () => {
                    clearCache();
                    setLoading(true);
                    try {
                      const result = await loadData(true);
                      setData(result);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Error refreshing data');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                  style={{ backgroundColor: `${colors.softRed}12`, color: colors.softRed, border: `1px solid ${colors.softRed}30` }}
                >
                  <RefreshCw size={14} />
                  Actualizar datos
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Filters Panel - Always Visible */}
      <div
        className="border-b"
        style={{ backgroundColor: colors.card, borderColor: colors.cardBorder }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Dropdowns Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: colors.textMuted }}>
                    Serie Documental
                  </label>
                  <select
                    value={filtros.serie}
                    onChange={(e) => setFiltros({ ...filtros, serie: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                    style={{ 
                      backgroundColor: 'white', 
                      color: colors.text, 
                      border: `1px solid ${filtros.serie ? '#1f2937' : '#fecaca'}`,
                      outline: 'none'
                    }}
                  >
                    <option value="">Todas</option>
                    {Object.keys(data.estadisticas.porSerie).sort().map(serie => (
                      <option key={serie} value={serie}>{serie}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: colors.textMuted }}>
                    Rango de Días
                  </label>
                  <select
                    value={filtros.rangoDias}
                    onChange={(e) => setFiltros({ ...filtros, rangoDias: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                    style={{ 
                      backgroundColor: 'white', 
                      color: colors.text, 
                      border: `1px solid ${filtros.rangoDias ? '#1f2937' : '#fecaca'}`,
                      outline: 'none'
                    }}
                  >
                    <option value="">Todos</option>
                    {Object.keys(data.estadisticas.porRangoDias).filter(r => r).map(rango => (
                      <option key={rango} value={rango}>{rango}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: colors.textMuted }}>
                    Oficina
                  </label>
                  <select
                    value={filtros.oficina}
                    onChange={(e) => setFiltros({ ...filtros, oficina: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                    style={{ 
                      backgroundColor: 'white', 
                      color: colors.text, 
                      border: `1px solid ${filtros.oficina ? '#1f2937' : '#fecaca'}`,
                      outline: 'none'
                    }}
                  >
                    <option value="">Todas</option>
                    {Object.keys(data.estadisticas.porOficina).sort().map(oficina => (
                      <option key={oficina} value={oficina}>{oficina}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: colors.textMuted }}>
                    Dependencia
                  </label>
                  <select
                    value={filtros.dependencia}
                    onChange={(e) => setFiltros({ ...filtros, dependencia: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                    style={{ 
                      backgroundColor: 'white', 
                      color: colors.text, 
                      border: `1px solid ${filtros.dependencia ? '#1f2937' : '#fecaca'}`,
                      outline: 'none'
                    }}
                  >
                    <option value="">Todas</option>
                    {uniqueDependencias.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Search Row */}
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1.5" style={{ color: colors.textMuted }}>
                  Búsqueda
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" 
                          style={{ color: '#9ca3af' }} />
                  <input
                    type="text"
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                    placeholder="Buscar por asunto, radicado o firmante..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
                    style={{ 
                      backgroundColor: 'white', 
                      color: colors.text, 
                      border: `1px solid ${filtros.busqueda ? '#1f2937' : '#fecaca'}`,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
              
              {/* Footer Row */}
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: colors.textMuted }}>
                  Mostrando {documentosFiltrados.length.toLocaleString()} de {data.estadisticas.total.toLocaleString()} documentos
                </p>
                <button
                  onClick={() => setFiltros({ serie: '', subserie: '', oficina: '', rangoDias: '', busqueda: '', dependencia: '' })}
                  className="text-xs px-3 py-1 rounded"
                  style={{ color: colors.softRed }}
                >
                  Limpiar filtros
                </button>
              </div>
        </div>
      </div>
      
      {/* Selected Dependency Detail Panel */}
      <AnimatePresence>
        {filtros.dependencia && (
          <motion.div
            key="dependencia-detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            style={{ backgroundColor: colors.card, borderBottom: `1px solid ${colors.cardBorder}` }}
          >
            <div className="max-w-7xl mx-auto px-4 py-5">
              {(() => {
                const depName = filtros.dependencia;
                const depDocs = data.documentos.filter(d => d.dependencia === depName);
                const totalDocs = depDocs.length;
                const vencidos = depDocs.filter(d => d.fechaVencimiento && new Date(d.fechaVencimiento) < new Date()).length;
                const pendientes = depDocs.filter(d => d.fechaVencimiento && new Date(d.fechaVencimiento) >= new Date()).length;
                const diasValidos = depDocs.filter(d => d.dias > 0);
                const promedioDias = diasValidos.length > 0 ? Math.round(diasValidos.reduce((s, d) => s + d.dias, 0) / diasValidos.length) : 0;
                const pqrsdf = depDocs.filter(d => d.clasificacion === 'PQRSDF').length;
                const tramite = depDocs.filter(d => d.clasificacion === 'TRAMITE').length;
                const otras = depDocs.filter(d => d.clasificacion === 'OTRAS').length;
                const criticos = depDocs.filter(d => d.dias > 1000).length;
                const porcentaje = ((totalDocs / data.documentos.length) * 100).toFixed(1);

                // Top gestores for this dependency
                const gestorCounts: Record<string, number> = {};
                depDocs.forEach(d => {
                  if (d.gestor) gestorCounts[d.gestor] = (gestorCounts[d.gestor] || 0) + 1;
                });
                const topGestores = Object.entries(gestorCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5);

                // Top series for this dependency
                const serieCounts: Record<string, number> = {};
                depDocs.forEach(d => {
                  if (d.serie) serieCounts[d.serie] = (serieCounts[d.serie] || 0) + 1;
                });
                const topSeries = Object.entries(serieCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5);

                const maxSerie = topSeries[0]?.[1] || 1;

                return (
                  <div className="rounded-2xl p-[1px]" style={{ background: `linear-gradient(135deg, ${colors.softRed} 0%, ${colors.softRedLight} 50%, ${colors.softRed}30 100%)` }}>
                    <div className="rounded-2xl p-6" style={{ backgroundColor: colors.card }}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${colors.softRed}15` }}>
                            <Building2 size={28} style={{ color: colors.softRed }} />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.softRed }}>Dependencia Seleccionada</p>
                            <h3 className="text-lg font-bold mt-0.5" style={{ color: colors.text }}>{depName}</h3>
                            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{porcentaje}% del total de documentos ({totalDocs.toLocaleString()} de {data.documentos.length.toLocaleString()})</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setFiltros({ ...filtros, dependencia: '' })}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                          style={{ backgroundColor: `${colors.softRed}12`, color: colors.softRed, border: `1px solid ${colors.softRed}30` }}
                        >
                          ✕ Cerrar
                        </button>
                      </div>

                      {/* KPIs Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
                          className="p-4 rounded-xl text-center" style={{ backgroundColor: `${colors.softRed}08`, border: `1px solid ${colors.softRed}15` }}>
                          <p className="text-2xl font-bold" style={{ color: colors.softRed }}>{totalDocs.toLocaleString()}</p>
                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Total Docs</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                          className="p-4 rounded-xl text-center" style={{ backgroundColor: '#7f1d1d15', border: `1px solid ${colors.danger}25` }}>
                          <p className="text-2xl font-bold" style={{ color: colors.danger }}>{vencidos.toLocaleString()}</p>
                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Vencidos</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                          className="p-4 rounded-xl text-center" style={{ backgroundColor: `${colors.warning}10`, border: `1px solid ${colors.warning}25` }}>
                          <p className="text-2xl font-bold" style={{ color: colors.warning }}>{pendientes.toLocaleString()}</p>
                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Pendientes</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                          className="p-4 rounded-xl text-center" style={{ backgroundColor: `${colors.softRedLight}10`, border: `1px solid ${colors.softRedLight}25` }}>
                          <p className="text-2xl font-bold" style={{ color: colors.softRedLight }}>{promedioDias}</p>
                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Prom. Días</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
                          className="p-4 rounded-xl text-center" style={{ backgroundColor: '#7f1d1d10', border: `1px solid ${colors.danger}20` }}>
                          <p className="text-2xl font-bold" style={{ color: colors.danger }}>{criticos.toLocaleString()}</p>
                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Críticos (+1K)</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                          className="p-4 rounded-xl text-center" style={{ backgroundColor: `${colors.success}10`, border: `1px solid ${colors.success}25` }}>
                          <p className="text-2xl font-bold" style={{ color: colors.success }}>{porcentaje}%</p>
                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>% del Total</p>
                        </motion.div>
                      </div>

                      {/* Bottom Row: Classification + Top Series + Top Gestores */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Classification */}
                        <div className="p-4 rounded-xl" style={{ backgroundColor: colors.bg }}>
                          <p className="text-xs font-semibold mb-3" style={{ color: colors.textMuted }}>Clasificación</p>
                          <div className="flex gap-1 h-8 rounded-full overflow-hidden mb-3">
                            {totalDocs > 0 && (
                              <>
                                <div className="flex items-center justify-center text-xs font-bold text-white"
                                  style={{ width: `${(pqrsdf / totalDocs) * 100}%`, backgroundColor: colors.softRed, minWidth: pqrsdf > 0 ? '32px' : '0px' }}>
                                  {pqrsdf > 0 ? pqrsdf.toLocaleString() : ''}
                                </div>
                                <div className="flex items-center justify-center text-xs font-bold text-white"
                                  style={{ width: `${(tramite / totalDocs) * 100}%`, backgroundColor: colors.warning, minWidth: tramite > 0 ? '32px' : '0px' }}>
                                  {tramite > 0 ? tramite.toLocaleString() : ''}
                                </div>
                                <div className="flex items-center justify-center text-xs font-bold text-white"
                                  style={{ width: `${(otras / totalDocs) * 100}%`, backgroundColor: '#6b7280', minWidth: otras > 0 ? '32px' : '0px' }}>
                                  {otras > 0 ? otras.toLocaleString() : ''}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <span className="text-xs flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.softRed }}></span>
                              PQRSDF ({pqrsdf.toLocaleString()})
                            </span>
                            <span className="text-xs flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.warning }}></span>
                              Trámite ({tramite.toLocaleString()})
                            </span>
                            <span className="text-xs flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#6b7280' }}></span>
                              Otras ({otras.toLocaleString()})
                            </span>
                          </div>
                        </div>

                        {/* Top Series */}
                        <div className="p-4 rounded-xl" style={{ backgroundColor: colors.bg }}>
                          <p className="text-xs font-semibold mb-3" style={{ color: colors.textMuted }}>Series Principales</p>
                          <div className="space-y-2">
                            {topSeries.map(([serie, count], i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-xs truncate flex-1" style={{ color: colors.textMuted, maxWidth: '140px' }}>{serie}</span>
                                <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.softRed}15` }}>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(count / maxSerie) * 100}%` }}
                                    transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: colors.softRed }}
                                  />
                                </div>
                                <span className="text-xs font-semibold w-10 text-right" style={{ color: colors.text }}>{count.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Gestores */}
                        <div className="p-4 rounded-xl" style={{ backgroundColor: colors.bg }}>
                          <p className="text-xs font-semibold mb-3" style={{ color: colors.textMuted }}>Gestores Principales</p>
                          <div className="space-y-2">
                            {topGestores.map(([gestor, count], i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: colors.card }}>
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ backgroundColor: colors.softRed, flexShrink: 0 }}>
                                    {i + 1}
                                  </div>
                                  <span className="text-xs truncate" style={{ color: colors.text }}>{gestor.length > 28 ? gestor.substring(0, 28) + '...' : gestor}</span>
                                </div>
                                <span className="text-xs font-bold ml-2" style={{ color: colors.softRed }}>{count.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Total Documentos"
            value={statsFiltrados.total.toLocaleString()}
            icon={FileText}
            color={colors.softRed}
            subtitle="Registros en el sistema"
          />
          <KPICard
            title="Documentos Vencidos"
            value={statsFiltrados.documentosVencidos.toLocaleString()}
            icon={AlertTriangle}
            color={colors.danger}
            subtitle="Requieren atención urgente"
          />
          <KPICard
            title="Pendientes"
            value={statsFiltrados.documentosPendientes.toLocaleString()}
            icon={Clock}
            color={colors.warning}
            subtitle="En proceso de trámite"
          />
          <KPICard
            title="Promedio Días"
            value={statsFiltrados.diasPromedio}
            icon={Activity}
            color={colors.softRedLight}
            subtitle="Tiempo promedio de procesamiento"
          />
        </div>
        
        {/* Clasificación Manual - KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KPICard
            title="PQRSDF"
            value={(statsFiltrados.porClasificacion['PQRSDF'] || 0).toLocaleString()}
            icon={FileText}
            color={colors.softRed}
            subtitle="Peticiones, Quejas, Reclamos, Sugerencias, Denuncias y Felicitaciones"
          />
          <KPICard
            title="TRÁMITE"
            value={(statsFiltrados.porClasificacion['TRAMITE'] || 0).toLocaleString()}
            icon={FileSpreadsheet}
            color={colors.softRedLight}
            subtitle="Trámites administrativos"
          />
          <KPICard
            title="OTRAS"
            value={(statsFiltrados.porClasificacion['OTRAS'] || 0).toLocaleString()}
            icon={FileText}
            color={colors.warning}
            subtitle="Otras clasificaciones"
          />
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Vista General', icon: BarChart3 },
            { id: 'analysis', label: 'Análisis', icon: PieChart },
            { id: 'alerts', label: `Alertas (${alertas.length})`, icon: Bell },
            { id: 'export', label: 'Exportar', icon: Download },
            { id: 'dependencias', label: 'Dependencias', icon: Building2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
              style={{
                backgroundColor: activeTab === tab.id ? colors.softRed : colors.card,
                color: activeTab === tab.id ? 'white' : colors.textMuted,
                border: `1px solid ${activeTab === tab.id ? colors.softRed : colors.cardBorder}`
              }}
            >
              <tab.icon size={16} />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Distribution by Series */}
              <div className="lg:col-span-2 p-6 rounded-xl" 
                   style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}`, boxShadow: `0 4px 20px rgba(239,68,68,0.08)` }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <BarChart3 size={18} style={{ color: colors.softRed }} />
                  Distribución por Serie Documental
                </h3>
                <BarChart
                  data={Object.entries(statsFiltrados.porSerie)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => ({ name, count }))}
                  maxValue={Math.max(...Object.values(statsFiltrados.porSerie))}
                  labelKey="name"
                  valueKey="count"
                  color={colors.softRed}
                />
              </div>
              
              {/* Executive Summary */}
              <div className="p-6 rounded-xl" 
                   style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}`, boxShadow: `0 4px 20px rgba(239,68,68,0.08)` }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <TrendingUp size={18} style={{ color: colors.softRed }} />
                  Resumen Ejecutivo
                </h3>
                <ExecutiveSummary stats={statsFiltrados} documentos={documentosFiltrados} />
              </div>
              
            </motion.div>
          )}
          
          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Top Gestores */}
              <div className="p-6 rounded-xl" 
                   style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}`, boxShadow: `0 4px 20px rgba(239,68,68,0.08)` }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <Users size={18} style={{ color: colors.softRed }} />
                  Top Gestores
                </h3>
                <BarChart
                  data={data.topGestores}
                  maxValue={data.topGestores[0]?.count || 1}
                  labelKey="name"
                  valueKey="count"
                  color={colors.softRed}
                />
              </div>
              
              {/* Distribution by Days */}
              <div className="p-6 rounded-xl" 
                   style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}`, boxShadow: `0 4px 20px rgba(239,68,68,0.08)` }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <Clock size={18} style={{ color: colors.warning }} />
                  Distribución por Rango de Días
                </h3>
                <BarChart
                  data={Object.entries(statsFiltrados.porRangoDias)
                    .filter(([key]) => key)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => ({ name, count }))}
                  maxValue={Math.max(...Object.values(statsFiltrados.porRangoDias))}
                  labelKey="name"
                  valueKey="count"
                  color={colors.warning}
                />
              </div>
              
              {/* Subseries Distribution */}
              <div className="lg:col-span-2 p-6 rounded-xl" 
                   style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}`, boxShadow: `0 4px 20px rgba(239,68,68,0.08)` }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <PieChart size={18} style={{ color: colors.softRedLight }} />
                  Distribución por Subserie (Top 15)
                </h3>
                <BarChart
                  data={Object.entries(statsFiltrados.porSubserie)
                    .filter(([key]) => key)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 15)
                    .map(([name, count]) => ({ name, count }))}
                  maxValue={Math.max(...Object.values(statsFiltrados.porSubseries || {}))}
                  labelKey="name"
                  valueKey="count"
                  color={colors.softRedLight}
                  maxItems={15}
                />
              </div>
            </motion.div>
          )}
          
          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="p-6 rounded-xl" 
                   style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}`, boxShadow: `0 4px 20px rgba(239,68,68,0.08)` }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <Bell size={18} style={{ color: colors.danger }} />
                  Alertas Automáticas
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                  Sistema de monitoreo en tiempo real. Las alertas se generan automáticamente cuando se detectan condiciones críticas.
                </p>
                
                <div className="space-y-3">
                  {alertas.map((alerta, index) => (
                    <AlertItem key={index} {...alerta} />
                  ))}
                  
                  {alertas.length === 0 && (
                    <div className="p-4 rounded-lg text-center" style={{ backgroundColor: `${colors.success}20` }}>
                      <p className="text-sm" style={{ color: colors.success }}>
                        ✓ No hay alertas activas en este momento
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Additional Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}`, boxShadow: `0 4px 20px rgba(239,68,68,0.08)` }}>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: colors.text }}>
                    Documentos Críticos (+1000 días)
                  </h4>
                  <p className="text-2xl font-bold" style={{ color: colors.danger }}>
                    {statsFiltrados.porRangoDias['L.más de 1000 días']?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    Documentos que requieren intervención urgente
                  </p>
                </div>
                
                <div className="p-4 rounded-xl" style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}`, boxShadow: `0 4px 20px rgba(239,68,68,0.08)` }}>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: colors.text }}>
                    Tasa de Resolución
                  </h4>
                  <p className="text-2xl font-bold" style={{ color: colors.success }}>
                    {((statsFiltrados.documentosPendientes / (statsFiltrados.total || 1)) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    Documentos con plazo vigente
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Export Options */}
              <div className="p-6 rounded-xl" 
                   style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}`, boxShadow: `0 4px 20px rgba(239,68,68,0.08)` }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <Download size={18} style={{ color: colors.softRed }} />
                  Exportar Reportes
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => exportToCSV(documentosFiltrados, 'PQRSD_Completo')}
                    className="w-full p-4 rounded-lg flex items-center gap-3 transition-colors hover:opacity-90"
                    style={{ backgroundColor: colors.softRed, color: 'white' }}
                  >
                    <FileSpreadsheet size={20} />
                    <div className="text-left">
                      <p className="font-medium">Exportar CSV Completo</p>
                      <p className="text-xs opacity-80">
                        {documentosFiltrados.length.toLocaleString()} documentos filtrados
                      </p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => exportToCSV(
                      documentosFiltrados.filter(d => d.dias > 1000), 
                      'PQRSD_Criticos'
                    )}
                    className="w-full p-4 rounded-lg flex items-center gap-3 transition-colors hover:opacity-90"
                    style={{ backgroundColor: colors.danger, color: 'white' }}
                  >
                    <AlertTriangle size={20} />
                    <div className="text-left">
                      <p className="font-medium">Exportar Documentos Críticos</p>
                      <p className="text-xs opacity-80">
                        Documentos con +1000 días de trámite
                      </p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => exportToCSV(
                      documentosFiltrados.filter(d => d.fechaVencimiento && new Date(d.fechaVencimiento) < new Date()), 
                      'PQRSD_Vencidos'
                    )}
                    className="w-full p-4 rounded-lg flex items-center gap-3 transition-colors hover:opacity-90"
                    style={{ backgroundColor: colors.warning, color: 'white' }}
                  >
                    <Clock size={20} />
                    <div className="text-left">
                      <p className="font-medium">Exportar Vencidos</p>
                      <p className="text-xs opacity-80">
                        Documentos con fecha de vencimiento pasada
                      </p>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Summary for Presentation */}
              <div className="p-6 rounded-xl" 
                   style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}`, boxShadow: `0 4px 20px rgba(239,68,68,0.08)` }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <Building2 size={18} style={{ color: colors.softRedLight }} />
                  Resumen para Presentación
                </h3>
                
                <div className="space-y-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.bg }}>
                    <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Total de Documentos</p>
                    <p className="text-xl font-bold" style={{ color: colors.text }}>
                      {statsFiltrados.total.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: colors.bg }}>
                      <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Vencidos</p>
                      <p className="text-lg font-bold" style={{ color: colors.danger }}>
                        {statsFiltrados.documentosVencidos.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: colors.bg }}>
                      <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Pendientes</p>
                      <p className="text-lg font-bold" style={{ color: colors.warning }}>
                        {statsFiltrados.documentosPendientes.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.bg }}>
                    <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Promedio de Días</p>
                    <p className="text-lg font-bold" style={{ color: colors.success }}>
                      {statsFiltrados.diasPromedio} días
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.softRedLight}20` }}>
                    <p className="text-xs font-medium" style={{ color: colors.softRedLight }}>
                      Generado: {new Date().toLocaleDateString('es-CO')} - {new Date().toLocaleTimeString('es-CO')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'dependencias' && (
            <motion.div
              key="dependencias"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
                    <Building2 size={22} style={{ color: colors.softRed }} />
                    Top 20 Dependencias
                  </h3>
                  <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                    Haz clic en una tarjeta para filtrar el dashboard
                  </p>
                </div>
                {filtros.dependencia && (
                  <button
                    onClick={() => setFiltros({ ...filtros, dependencia: '' })}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ backgroundColor: colors.softRed, color: 'white' }}
                  >
                    Limpiar filtro
                  </button>
                )}
              </div>

              {/* Cards Grid with KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {topDependencias.map((dep, index) => {
                  const isSelected = filtros.dependencia === dep.name;
                  const percentage = ((dep.count / documentosFiltrados.length) * 100).toFixed(1);
                  
                  // Compute KPIs for this dependency
                  const depDocs = data.documentos.filter(d => d.dependencia === dep.name);
                  const vencidos = depDocs.filter(d => d.fechaVencimiento && new Date(d.fechaVencimiento) < new Date()).length;
                  const pendientes = depDocs.filter(d => d.fechaVencimiento && new Date(d.fechaVencimiento) >= new Date()).length;
                  const diasValidos = depDocs.filter(d => d.dias > 0);
                  const promedioDias = diasValidos.length > 0 ? Math.round(diasValidos.reduce((s, d) => s + d.dias, 0) / diasValidos.length) : 0;
                  const pqrsdf = depDocs.filter(d => d.clasificacion === 'PQRSDF').length;
                  const tramite = depDocs.filter(d => d.clasificacion === 'TRAMITE').length;
                  const otras = depDocs.filter(d => d.clasificacion === 'OTRAS').length;
                  
                  return (
                    <motion.div
                      key={dep.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ scale: 1.02, y: -3 }}
                      onClick={() => setFiltros({
                        ...filtros,
                        dependencia: isSelected ? '' : dep.name
                      })}
                      className="relative rounded-2xl p-[1px] cursor-pointer transition-all duration-300"
                      style={{ 
                        background: isSelected 
                          ? `linear-gradient(135deg, ${colors.softRed} 0%, ${colors.softRedLight} 100%)`
                          : `linear-gradient(135deg, ${colors.cardBorder} 0%, ${colors.softRedLight}40 100%)`,
                        boxShadow: isSelected 
                          ? `0 8px 30px ${colors.softRed}30` 
                          : `0 4px 20px rgba(239,68,68,0.08)`
                      }}
                    >
                      <div className="relative overflow-hidden rounded-2xl h-full" style={{ backgroundColor: colors.card }}>
                      {/* Header */}
                      <div className="p-5 pb-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ backgroundColor: `${colors.softRed}12` }}>
                              <Building2 size={20} style={{ color: colors.softRed }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium" style={{ color: colors.textMuted }}>#{index + 1}</p>
                              <p className="text-sm font-semibold leading-tight truncate pr-2" 
                                 style={{ color: colors.text, maxWidth: '200px' }}>
                                {dep.name.length > 35 ? dep.name.substring(0, 35) + '...' : dep.name}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="px-2 py-1 rounded-full text-xs font-bold"
                                 style={{ backgroundColor: colors.softRed, color: 'white' }}>
                              ✓
                            </div>
                          )}
                        </div>
                        
                        {/* Main Count */}
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-3xl font-bold" style={{ color: colors.softRed }}>
                            {dep.count.toLocaleString()}
                          </span>
                          <span className="text-xs" style={{ color: colors.textMuted }}>docs ({percentage}%)</span>
                        </div>
                      </div>
                      
                      {/* KPI Grid */}
                      <div className="grid grid-cols-2 gap-px mx-5 mb-4 rounded-xl overflow-hidden"
                           style={{ backgroundColor: colors.cardBorder }}>
                        <div className="p-3" style={{ backgroundColor: colors.card }}>
                          <p className="text-xs" style={{ color: colors.textMuted }}>Vencidos</p>
                          <p className="text-lg font-bold" style={{ color: colors.danger }}>
                            {vencidos.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3" style={{ backgroundColor: colors.card }}>
                          <p className="text-xs" style={{ color: colors.textMuted }}>Pendientes</p>
                          <p className="text-lg font-bold" style={{ color: colors.warning }}>
                            {pendientes.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3" style={{ backgroundColor: colors.card }}>
                          <p className="text-xs" style={{ color: colors.textMuted }}>Prom. Días</p>
                          <p className="text-lg font-bold" style={{ color: colors.softRed }}>
                            {promedioDias}
                          </p>
                        </div>
                        <div className="p-3" style={{ backgroundColor: colors.card }}>
                          <p className="text-xs" style={{ color: colors.textMuted }}>% Total</p>
                          <p className="text-lg font-bold" style={{ color: colors.softRed }}>
                            {percentage}%
                          </p>
                        </div>
                      </div>
                      
                      {/* Classification Mini Bars */}
                      <div className="px-5 pb-5">
                        <p className="text-xs font-medium mb-2" style={{ color: colors.textMuted }}>Clasificación</p>
                        <div className="flex gap-1 h-6 rounded-full overflow-hidden">
                          {dep.count > 0 && (
                            <>
                              <div className="flex items-center justify-center text-xs font-bold text-white"
                                   style={{ 
                                     width: `${(pqrsdf/dep.count)*100}%`, 
                                     backgroundColor: colors.softRed,
                                     minWidth: pqrsdf > 0 ? '30px' : '0px'
                                   }}>
                                {pqrsdf > 0 ? 'P' : ''}
                              </div>
                              <div className="flex items-center justify-center text-xs font-bold text-white"
                                   style={{ 
                                     width: `${(tramite/dep.count)*100}%`, 
                                     backgroundColor: colors.warning,
                                     minWidth: tramite > 0 ? '30px' : '0px'
                                   }}>
                                {tramite > 0 ? 'T' : ''}
                              </div>
                              <div className="flex items-center justify-center text-xs font-bold text-white"
                                   style={{ 
                                     width: `${(otras/dep.count)*100}%`, 
                                     backgroundColor: '#6b7280',
                                     minWidth: otras > 0 ? '30px' : '0px'
                                   }}>
                                {otras > 0 ? 'O' : ''}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex gap-3 mt-2">
                          <span className="text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.softRed }}></span>
                            PQRSDF
                          </span>
                          <span className="text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.warning }}></span>
                            Trámite
                          </span>
                          <span className="text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6b7280' }}></span>
                            Otras
                          </span>
                        </div>
                      </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-5 rounded-xl flex items-center gap-4"
                     style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                       style={{ backgroundColor: `${colors.softRed}12` }}>
                    <Building2 size={24} style={{ color: colors.softRed }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textMuted }}>Total Dependencias</p>
                    <p className="text-2xl font-bold" style={{ color: colors.softRed }}>
                      {uniqueDependencias.length}
                    </p>
                  </div>
                </div>
                <div className="p-5 rounded-xl flex items-center gap-4"
                     style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                       style={{ backgroundColor: `${colors.softRed}12` }}>
                    <FileText size={24} style={{ color: colors.softRed }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textMuted }}>Documentos Filtrados</p>
                    <p className="text-2xl font-bold" style={{ color: colors.softRed }}>
                      {documentosFiltrados.length.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="p-5 rounded-xl flex items-center gap-4"
                     style={{ background: `linear-gradient(135deg, ${colors.softRed}08 0%, ${colors.card} 100%)`, border: `1px solid ${colors.cardBorder}` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                       style={{ backgroundColor: `${colors.softRed}12` }}>
                    <TrendingUp size={24} style={{ color: colors.softRed }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textMuted }}>Dependencia Principal</p>
                    <p className="text-sm font-bold truncate" style={{ color: colors.softRed, maxWidth: '180px' }}>
                      {topDependencias[0]?.name || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className="border-t mt-8 py-4" style={{ borderColor: colors.cardBorder, boxShadow: `0 2px 8px rgba(0,0,0,0.04)` }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <p className="text-xs" style={{ color: colors.textMuted }}>
            Dashboard PQRSD v1.0 - Ministerio del Interior
            {isExternalSource() && (
              <span className="ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: `${colors.softRed}12`, color: colors.softRed }}>
                Fuente externa
              </span>
            )}
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs" style={{ color: colors.textMuted }}>
              {data.documentos.length.toLocaleString()} documentos
            </p>
            <p className="text-xs" style={{ color: colors.textMuted }}>
              Actualizado: {new Date().toLocaleString('es-CO')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
