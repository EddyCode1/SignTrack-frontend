import { create } from 'zustand'

const useReportStore = create((set, get) => ({
  reports: [],
  loading: false,
  error: null,

  // Acciones
  setReports: (reports) => set({ reports }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // CRUD
  addReport: (report) =>
    set((state) => ({
      reports: [...state.reports, { ...report, _id: Date.now().toString() }],
    })),

  updateReport: (id, updatedReport) =>
    set((state) => ({
      reports: state.reports.map((report) =>
        report._id === id ? { ...report, ...updatedReport } : report
      ),
    })),

  deleteReport: (id) =>
    set((state) => ({
      reports: state.reports.filter((report) => report._id !== id),
    })),

  getReportById: (id) => get().reports.find((report) => report._id === id),
}))

export default useReportStore
