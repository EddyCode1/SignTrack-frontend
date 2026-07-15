import adminClient from '../adminClient'
import useReportStore from '../../stores/useReportStore'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

const normalizeReport = (report) => {
  if (!report || typeof report !== 'object') return report

  const source = report.report || report.data || report._source || report
  const normalized = {
    ...source,
    _id: source._id || source.id || source.reportId || source.idReport || source._id,
    title: source.title || source.titulo || source.name || '',
    type: source.type || source.tipo || source.reportType || source.tipoReporte || '',
    status: source.status || source.estado || source.state || source.report_status || source.reportStatus || source.estado_reporte || '',
    author:
      source.author ||
      source.autor ||
      source.createdBy ||
      source.creador ||
      source.owner?.name ||
      source.owner?.username ||
      source.owner?.fullName ||
      '',
    period: source.period || source.periodo || source.periodo_reporte || '',
    createdAt: source.createdAt || source.created_at || source.fechaCreacion || source.fecha_creacion || source.fecha || '',
    description: source.description || source.descripcion || '',
  }

  return normalized
}

const REPORT_ENDPOINTS = ['/reports', '/reportes']

const isNotFoundError = (error) => error?.response?.status === 404

const requestReport = async ({ method, url = '', data, params }) => {
  let lastError = null

  for (let index = 0; index < REPORT_ENDPOINTS.length; index += 1) {
    const endpoint = `${REPORT_ENDPOINTS[index]}${url}`

    try {
      return await adminClient.request({
        method,
        url: endpoint,
        data,
        params,
      })
    } catch (error) {
      lastError = error

      if (!isNotFoundError(error) || index === REPORT_ENDPOINTS.length - 1) {
        throw error
      }
    }
  }

  throw lastError
}

/**
 * Servicio de Reportes
 * Incluye endpoints de análisis del backend:
 * - Demanda de restaurantes
 * - Top de platos
 * - Ingresos
 * - Horas pico
 * - Reservaciones
 * - Desempeño por restaurante
 * - Ocupación
 * - Clientes frecuentes
 * - Pedidos recurrentes
 */

const fetchReportById = async (id) => {
  const response = await requestReport({ method: 'get', url: `/${id}` })
  // Backend puede retornar { success: true, report: {...} } o directamente el objeto
  const report = response.data?.report || response.data?.data || response.data
  return normalizeReport(report)
}

export const reportService = {
  // ============== CRUD GENERAL ==============
  
  // Obtener todos los reportes guardados
  getReports: async () => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await requestReport({ method: 'get' })
      console.log('getReports response:', {
        status: response.status,
        data: response.data,
        dataIsArray: Array.isArray(response.data),
        dataReports: response.data?.reports,
        dataReportsIsArray: Array.isArray(response.data?.reports),
        dataData: response.data?.data,
        dataDataIsArray: Array.isArray(response.data?.data),
      })
      
      // Backend puede retornar { success: true, reports: [...] } o { success: true, data: [...] }
      const reportsData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.reports)
        ? response.data.reports
        : Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.report)
        ? response.data.report
        : []
      const normalizedReports = reportsData.map(normalizeReport)
      console.log('reportsData extracted:', normalizedReports)
      
      useReportStore.getState().setReports(normalizedReports)
      return { success: true, data: normalizedReports }
    } catch (error) {
      console.error('getReports error:', error)
      toast.error('Error al obtener reportes')
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Crear reporte
  createReport: async (reportData) => {
    try {
      console.log('createReport sending:', reportData)
      const response = await requestReport({ method: 'post', data: reportData })
      console.log('createReport response:', {
        status: response.status,
        data: response.data,
        report: response.data?.report,
      })
      
      // Backend retorna { success: true, report: {...} } o similar
      const reportResult = response.data?.report || response.data?.data || response.data
      const normalizedReport = normalizeReport(reportResult)
      console.log('reportResult extracted:', normalizedReport)
      
      useReportStore.getState().addReport(normalizedReport)
      toast.success('Reporte creado exitosamente')
      return { success: true, data: normalizedReport }
    } catch (error) {
      const serverError = error?.response?.data?.message || error?.response?.data?.error || error?.response?.statusText || error.message
      console.error('createReport error details:', { 
        status: error?.response?.status,
        message: serverError,
        data: error?.response?.data 
      })
      toast.error(serverError || 'Error al crear reporte')
      return { success: false, error: serverError }
    }
  },

  // Actualizar reporte
  updateReport: async (id, reportData) => {
    try {
      const response = await requestReport({ method: 'put', url: `/${id}`, data: reportData })
      const reportResult = response.data?.data || response.data
      const normalizedReport = normalizeReport(reportResult)
      useReportStore.getState().updateReport(id, normalizedReport)
      toast.success('Reporte actualizado exitosamente')
      return { success: true, data: normalizedReport }
    } catch (error) {
      const serverError = error?.response?.data?.message || error?.response?.data?.error || error?.response?.statusText || error.message
      console.error('updateReport error details:', { 
        status: error?.response?.status,
        message: serverError,
        data: error?.response?.data 
      })
      toast.error(serverError || 'Error al actualizar reporte')
      return { success: false, error: serverError }
    }
  },

  // Eliminar reporte
  deleteReport: async (id) => {
    try {
      await requestReport({ method: 'delete', url: `/${id}` })
      useReportStore.getState().deleteReport(id)
      toast.success('Reporte eliminado exitosamente')
      return { success: true }
    } catch (error) {
      toast.error('Error al eliminar reporte')
      return { success: false, error: error.message }
    }
  },

  // Obtener reporte por ID
  getReportById: async (id) => {
    try {
      const report = await fetchReportById(id)
      return { success: true, data: report }
    } catch (error) {
      toast.error('Error al obtener el reporte')
      return { success: false, error: error.message }
    }
  },

  // ============== ENDPOINTS DE ANÁLISIS ==============

  // Demanda de restaurantes
  getDemandaRestaurantes: async (params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await requestReport({ method: 'get', url: '/demanda-restaurantes', params })
      const payload = response.data
      const data = payload?.data ?? payload?.report ?? payload
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener demanda de restaurantes:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Top de platos
  getTopPlatos: async (params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await requestReport({ method: 'get', url: '/top-platos', params })
      const payload = response.data
      const data = payload?.data ?? payload?.report ?? payload
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener top platos:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Ingresos
  getIngresos: async (params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await requestReport({ method: 'get', url: '/ingresos', params })
      const payload = response.data
      const data = payload?.data ?? payload?.report ?? payload
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener ingresos:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Horas pico
  getHorasPico: async (params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await requestReport({ method: 'get', url: '/horas-pico', params })
      const payload = response.data
      const data = payload?.data ?? payload?.report ?? payload
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener horas pico:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Reservaciones
  getReservaciones: async (params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await requestReport({ method: 'get', url: '/reservaciones', params })
      const payload = response.data
      const data = payload?.data ?? payload?.report ?? payload
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener reservaciones:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Desempeño de restaurante
  getDesempenoRestaurante: async (restaurantID, params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await requestReport({ method: 'get', url: `/desempeno-restaurante/${restaurantID}`, params })
      const payload = response.data
      const data = payload?.data ?? payload?.report ?? payload
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener desempeño del restaurante:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Ocupación
  getOcupacion: async (restaurantID, params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await requestReport({ method: 'get', url: `/ocupacion/${restaurantID}`, params })
      const payload = response.data
      const data = payload?.data ?? payload?.report ?? payload
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener ocupación:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Clientes frecuentes
  getClientesFrecuentes: async (restaurantID, params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await requestReport({ method: 'get', url: `/clientes-frecuentes/${restaurantID}`, params })
      const payload = response.data
      const data = payload?.data ?? payload?.report ?? payload
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener clientes frecuentes:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Pedidos recurrentes
  getPedidosRecurrentes: async (restaurantID, params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await requestReport({ method: 'get', url: `/pedidos-recurrentes/${restaurantID}`, params })
      const payload = response.data
      const data = payload?.data ?? payload?.report ?? payload
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener pedidos recurrentes:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // ============== DESCARGAS ==============

  // Descargar reporte en CSV
  downloadReportCSV: async (id, format = 'csv') => {
    try {
      const report = await fetchReportById(id)
      
      if (!report) {
        throw new Error('Reporte no encontrado')
      }

      const headers = ['Título', 'Tipo', 'Estado', 'Autor', 'Período', 'Fecha Creación']
      const values = [
        report.title || '',
        report.type || '',
        report.status || '',
        report.author || '',
        report.period || '',
        report.createdAt ? new Date(report.createdAt).toLocaleDateString('es-ES') : '',
      ]
      const content = headers.join(',') + '\n' + values.join(',')
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
      
      return { success: true, data: blob }
    } catch (error) {
      toast.error('Error al descargar reporte')
      return { success: false, error: error.message }
    }
  },

  // Descargar reporte en Excel
  downloadReportExcel: async (id) => {
    try {
      const report = await fetchReportById(id)
      
      if (!report) {
        throw new Error('Reporte no encontrado')
      }

      const data = [
        {
          'Título': report.title || '',
          'Tipo': report.type || '',
          'Estado': report.status || '',
          'Autor': report.author || '',
          'Período': report.period || '',
          'Fecha Creación': report.createdAt ? new Date(report.createdAt).toLocaleDateString('es-ES') : '',
          'Descripción': report.description || '',
        }
      ]

      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      return { success: true, data: blob }
    } catch (error) {
      toast.error('Error al descargar reporte')
      return { success: false, error: error.message }
    }
  },

  // Descargar reporte en PDF
  downloadReportPDF: async (id) => {
    try {
      const report = await fetchReportById(id)
      
      if (!report) {
        throw new Error('Reporte no encontrado')
      }

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const margin = 40
      let y = 50

      doc.setFontSize(20)
      doc.setTextColor('#111827')
      doc.text(report.title || 'Reporte', margin, y)
      y += 30

      doc.setFontSize(11)
      doc.setTextColor('#374151')
      const rows = [
        ['Tipo', report.type || 'N/A'],
        ['Estado', report.status || 'N/A'],
        ['Autor', report.author || 'N/A'],
        ['Período', report.period || 'N/A'],
        ['Fecha Creación', report.createdAt ? new Date(report.createdAt).toLocaleDateString('es-ES') : 'N/A'],
      ]

      rows.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold')
        doc.text(`${label}:`, margin, y)
        doc.setFont(undefined, 'normal')
        doc.text(String(value), margin + 90, y)
        y += 18
      })

      y += 10
      doc.setDrawColor('#d1d5db')
      doc.setLineWidth(0.5)
      doc.line(margin, y, 555, y)
      y += 24

      doc.setFontSize(13)
      doc.setFont(undefined, 'bold')
      doc.text('Descripción', margin, y)
      y += 18
      doc.setFontSize(11)
      doc.setFont(undefined, 'normal')
      const description = report.description || 'Sin descripción'
      const paragraph = doc.splitTextToSize(description, 515)
      doc.text(paragraph, margin, y)
      y += paragraph.length * 14 + 20

      doc.setFontSize(9)
      doc.setTextColor('#6b7280')
      doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, margin, y)

      const blob = doc.output('blob')
      return { success: true, data: blob }
    } catch (error) {
      toast.error('Error al descargar reporte')
      return { success: false, error: error.message }
    }
  },
}
