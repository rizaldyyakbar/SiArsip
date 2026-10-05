import { useState, useEffect, useCallback } from 'react';
import {
  checkApiHealth,
  fetchDocuments,
  fetchTrashDocuments,
  fetchAcademicYears,
  fetchCriteria,
  fetchAuditLogs,
  fetchLecturers,
  createLecturer,
  updateLecturer,
  toggleLecturerStatus,
  deleteLecturer,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
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
  mockAuditLogs,
  mockLecturers,
  mockCategoryItems
} from '../mockData';
import type {
  DocumentItem,
  AcademicYearMaster,
  LamInfokomCriterion,
  AuditLogItem,
  Lecturer,
  CategoryItem
} from '../types';

export interface ConflictInfo {
  sha256: string;
  existingId?: number;
  newFilename: string;
}

export function useSiArsipData() {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [trashDocuments, setTrashDocuments] = useState<DocumentItem[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearMaster[]>([]);
  const [criteria, setCriteria] = useState<LamInfokomCriterion[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);

  // Muat data dari backend jika online, fallback ke mockData jika offline
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const online = await checkApiHealth();
    setIsBackendOnline(online);

    if (online) {
      try {
        const [docsRes, trashRes, ayRes, critRes, auditRes, lectRes, catRes] = await Promise.allSettled([
          fetchDocuments(),
          fetchTrashDocuments(),
          fetchAcademicYears(),
          fetchCriteria(),
          fetchAuditLogs(),
          fetchLecturers(),
          fetchCategories()
        ]);

        if (docsRes.status === 'fulfilled') {
          setDocuments(docsRes.value);
        }
        if (trashRes.status === 'fulfilled') {
          setTrashDocuments(trashRes.value);
        }
        if (ayRes.status === 'fulfilled') {
          setAcademicYears(ayRes.value.map(mapBackendAYToMaster));
        }
        if (critRes.status === 'fulfilled') {
          setCriteria(critRes.value);
        }
        if (auditRes.status === 'fulfilled') {
          setAuditLogs(auditRes.value);
        }
        if (lectRes.status === 'fulfilled') {
          setLecturers(lectRes.value);
        }
        if (catRes.status === 'fulfilled') {
          setCategories(catRes.value);
        }
      } catch (err) {
        console.warn('Gagal memuat sebagian data live backend:', err);
      }
    } else {
      // Fallback ke mock data hanya bila backend offline
      setDocuments(mockDocuments);
      setAcademicYears(mockAcademicYears);
      setCriteria(mockLamInfokomCriteria);
      setAuditLogs(mockAuditLogs);
      setLecturers(mockLecturers);
      setCategories(mockCategoryItems);
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

  // Handler Dosen
  const handleAddLecturer = async (data: {
    nip: string;
    name: string;
    email: string;
    phone: string;
    position: string;
  }) => {
    if (isBackendOnline) {
      await createLecturer(data);
      const fresh = await fetchLecturers();
      setLecturers(fresh);
    } else {
      const newL: Lecturer = {
        id: Date.now(),
        ...data,
        isActive: true,
        documentCount: 0
      };
      setLecturers((prev) => [newL, ...prev]);
    }
  };

  const handleUpdateLecturer = async (
    id: number,
    data: {
      nip: string;
      name: string;
      email: string;
      phone: string;
      position: string;
    }
  ) => {
    if (isBackendOnline) {
      await updateLecturer(id, data);
      const fresh = await fetchLecturers();
      setLecturers(fresh);
    } else {
      setLecturers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...data } : l))
      );
    }
  };

  const handleToggleLecturer = async (id: number) => {
    if (isBackendOnline) {
      await toggleLecturerStatus(id);
      const fresh = await fetchLecturers();
      setLecturers(fresh);
    } else {
      setLecturers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l))
      );
    }
  };

  const handleDeleteLecturer = async (id: number) => {
    if (isBackendOnline) {
      try {
        await deleteLecturer(id);
        const fresh = await fetchLecturers();
        setLecturers(fresh);
      } catch (err) {
        if (err instanceof ApiError) {
          throw new Error(err.message);
        }
        throw err;
      }
    } else {
      setLecturers((prev) => prev.filter((l) => l.id !== id));
    }
  };

  // Handler Kategori
  const handleAddCategory = async (data: {
    name: string;
    code: string;
    description: string;
    colorBg: string;
    colorText: string;
  }) => {
    if (isBackendOnline) {
      await createCategory(data);
      const fresh = await fetchCategories();
      setCategories(fresh);
    } else {
      const newC: CategoryItem = {
        id: Date.now(),
        ...data,
        documentCount: 0
      };
      setCategories((prev) => [...prev, newC]);
    }
  };

  const handleUpdateCategory = async (
    id: number,
    data: {
      name: string;
      code: string;
      description: string;
      colorBg: string;
      colorText: string;
    }
  ) => {
    if (isBackendOnline) {
      await updateCategory(id, data);
      const fresh = await fetchCategories();
      setCategories(fresh);
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (isBackendOnline) {
      try {
        await deleteCategory(id);
        const fresh = await fetchCategories();
        setCategories(fresh);
      } catch (err) {
        if (err instanceof ApiError) {
          throw new Error(err.message);
        }
        throw err;
      }
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return {
    isBackendOnline,
    isLoading,
    documents,
    trashDocuments,
    academicYears,
    criteria,
    auditLogs,
    lecturers,
    categories,
    conflictInfo,
    setConflictInfo,
    loadData,
    handleUpload,
    handleDeleteDoc,
    handleRestoreDoc,
    handlePermanentDeleteDoc,
    handleAddAcademicYear,
    handleToggleAcademicYear,
    handleDeleteAcademicYear,
    handleAddLecturer,
    handleUpdateLecturer,
    handleToggleLecturer,
    handleDeleteLecturer,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory
  };
}
