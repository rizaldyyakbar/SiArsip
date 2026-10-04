import { useState, useEffect, useCallback } from 'react';
import {
  checkApiHealth,
  fetchDocuments,
  fetchAcademicYears,
  fetchCriteria,
  fetchAuditLogs,
  uploadDocument,
  softDeleteDocument,
  restoreDocument,
  permanentDeleteDocument,
  createAcademicYear,
  updateAcademicYearStatus,
  deleteAcademicYear,
  mapBackendAYToMaster,
  ApiError
} from '../api';
import {
  mockDocuments,
  mockAcademicYears,
  mockLamInfokomCriteria,
  mockAuditLogs
} from '../mockData';
import type {
  DocumentItem,
  AcademicYearMaster,
  LamInfokomCriterion,
  AuditLogItem
} from '../types';

export interface ConflictInfo {
  sha256: string;
  existingId?: number;
  newFilename: string;
}

export function useSiArsipData() {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [academicYears, setAcademicYears] = useState<AcademicYearMaster[]>(mockAcademicYears);
  const [criteria, setCriteria] = useState<LamInfokomCriterion[]>(mockLamInfokomCriteria);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(mockAuditLogs);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);

  // Muat data dari backend jika online, fallback ke mockData jika offline
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const online = await checkApiHealth();
    setIsBackendOnline(online);

    if (online) {
      try {
        const [docsRes, ayRes, critRes, auditRes] = await Promise.allSettled([
          fetchDocuments(),
          fetchAcademicYears(),
          fetchCriteria(),
          fetchAuditLogs()
        ]);

        if (docsRes.status === 'fulfilled' && docsRes.value.length > 0) {
          setDocuments(docsRes.value);
        }
        if (ayRes.status === 'fulfilled' && ayRes.value.length > 0) {
          setAcademicYears(ayRes.value.map(mapBackendAYToMaster));
        }
        if (critRes.status === 'fulfilled' && critRes.value.length > 0) {
          setCriteria(critRes.value);
        }
        if (auditRes.status === 'fulfilled' && auditRes.value.length > 0) {
          setAuditLogs(auditRes.value);
        }
      } catch (err) {
        console.warn('Gagal memuat sebagian data live backend:', err);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler upload berkas
  const handleUpload = async (formData: FormData, simulatedDoc: DocumentItem): Promise<{ success: boolean; conflict?: ConflictInfo }> => {
    if (isBackendOnline) {
      try {
        await uploadDocument(formData);
        await loadData();
        return { success: true };
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          const conflict: ConflictInfo = {
            sha256: err.data?.sha256 || 'SHA-256 Identik',
            existingId: err.data?.existing_id,
            newFilename: (formData.get('file') as File)?.name || simulatedDoc.filename
          };
          setConflictInfo(conflict);
          return { success: false, conflict };
        }
        throw err;
      }
    } else {
      // Offline mode
      setDocuments((prev) => [simulatedDoc, ...prev]);
      return { success: true };
    }
  };

  // Handler soft delete
  const handleDeleteDoc = async (id: string): Promise<boolean> => {
    if (isBackendOnline) {
      try {
        await softDeleteDocument(id);
        await loadData();
        return true;
      } catch (err) {
        console.error('Gagal hapus dokumen:', err);
        return false;
      }
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      return true;
    }
  };

  // Handler pulihkan dokumen
  const handleRestoreDoc = async (id: string): Promise<boolean> => {
    if (isBackendOnline) {
      try {
        await restoreDocument(id);
        await loadData();
        return true;
      } catch (err) {
        console.error('Gagal memulihkan dokumen:', err);
        return false;
      }
    }
    return true;
  };

  // Handler hapus permanen dokumen
  const handlePermanentDeleteDoc = async (id: string): Promise<boolean> => {
    if (isBackendOnline) {
      try {
        await permanentDeleteDocument(id);
        await loadData();
        return true;
      } catch (err) {
        console.error('Gagal hapus permanen dokumen:', err);
        return false;
      }
    }
    return true;
  };

  // Handler tambah tahun akademik
  const handleAddAcademicYear = async (year: string, semester: 'Ganjil' | 'Genap'): Promise<boolean> => {
    if (isBackendOnline) {
      try {
        await createAcademicYear(year, semester);
        const fresh = await fetchAcademicYears();
        setAcademicYears(fresh.map(mapBackendAYToMaster));
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          throw new Error(err.message);
        }
        throw err;
      }
    } else {
      const label = `${year} ${semester}`;
      const newAY: AcademicYearMaster = {
        id: `ay-${Date.now()}`,
        year,
        semester,
        label,
        isActive: false
      };
      setAcademicYears((prev) => [newAY, ...prev]);
      return true;
    }
  };

  // Handler ubah status tahun akademik
  const handleToggleAcademicYear = async (ay: AcademicYearMaster): Promise<boolean> => {
    const newStatus = !ay.isActive;
    if (isBackendOnline) {
      try {
        await updateAcademicYearStatus(ay.id, newStatus);
        const fresh = await fetchAcademicYears();
        setAcademicYears(fresh.map(mapBackendAYToMaster));
        return true;
      } catch (err) {
        console.error('Gagal toggle tahun akademik:', err);
        return false;
      }
    } else {
      setAcademicYears((prev) =>
        prev.map((item) => (item.id === ay.id ? { ...item, isActive: newStatus } : item))
      );
      return true;
    }
  };

  // Handler hapus tahun akademik
  const handleDeleteAcademicYear = async (id: string): Promise<boolean> => {
    if (isBackendOnline) {
      try {
        await deleteAcademicYear(id);
        const fresh = await fetchAcademicYears();
        setAcademicYears(fresh.map(mapBackendAYToMaster));
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          throw new Error(err.message);
        }
        throw err;
      }
    } else {
      setAcademicYears((prev) => prev.filter((item) => item.id !== id));
      return true;
    }
  };

  return {
    isBackendOnline,
    isLoading,
    documents,
    academicYears,
    criteria,
    auditLogs,
    conflictInfo,
    setConflictInfo,
    loadData,
    handleUpload,
    handleDeleteDoc,
    handleRestoreDoc,
    handlePermanentDeleteDoc,
    handleAddAcademicYear,
    handleToggleAcademicYear,
    handleDeleteAcademicYear
  };
}
