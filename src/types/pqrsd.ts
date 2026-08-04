export interface DocumentoPQRSD {
  id: number;
  radicado: string;
  fechaRadicacion: string;
  serie: string;
  subserie: string;
  tipologia: string;
  clasificacion: string;
  asunto: string;
  firmante: string;
  estado: string;
  fechaVencimiento: string;
  oficina: string;
  gestor: string;
  dependencia: string;
  dias: number;
  rangos: string;
}

export interface Estadisticas {
  total: number;
  porSerie: Record<string, number>;
  porSubserie: Record<string, number>;
  porEstado: Record<string, number>;
  porOficina: Record<string, number>;
  porRangoDias: Record<string, number>;
  documentosVencidos: number;
  documentosPendientes: number;
  diasPromedio: number;
}

export interface TopGestor {
  name: string;
  count: number;
}

export interface DataPQRSD {
  documentos: DocumentoPQRSD[];
  estadisticas: Estadisticas;
  distribucionMensual: Record<string, number>;
  topGestores: TopGestor[];
}

export interface Filtros {
  serie: string;
  subserie: string;
  oficina: string;
  rangoDias: string;
  busqueda: string;
  dependencia: string;
}
