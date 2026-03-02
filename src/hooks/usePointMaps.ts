import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateId } from '../db';
import type { PointMap, ErrorRecord } from '../types';

/** 点图数据管理 Hook */
export function usePointMaps(filters?: { domain?: string; tag?: string; search?: string }) {
  const points = useLiveQuery(async () => {
    let collection = db.points.toCollection();
    let results = await collection.sortBy('createdAt');
    results = results.reverse();

    if (filters?.domain) {
      results = results.filter(p => p.domain === filters.domain);
    }
    if (filters?.tag) {
      results = results.filter(p => p.tags.includes(filters.tag!));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.directResult.toLowerCase().includes(q) ||
        p.experimentConditions.toLowerCase().includes(q)
      );
    }
    return results;
  }, [filters?.domain, filters?.tag, filters?.search]);

  const addPoint = async (data: Omit<PointMap, 'id' | 'createdAt' | 'updatedAt' | 'overlayHistory'>) => {
    const now = new Date().toISOString();
    const point: PointMap = {
      ...data,
      id: generateId(),
      overlayHistory: [],
      createdAt: now,
      updatedAt: now,
    };
    await db.points.add(point);
    return point;
  };

  const updatePoint = async (id: string, updates: Partial<PointMap>) => {
    await db.points.update(id, { ...updates, updatedAt: new Date().toISOString() });
  };

  const addOverlay = async (pointId: string, overlay: { method: string; updatedResult: string; reason: string; updatedBy: string }) => {
    const point = await db.points.get(pointId);
    if (!point) return;
    const newOverlay = {
      id: generateId(),
      pointId,
      ...overlay,
      timestamp: new Date().toISOString(),
    };
    await db.points.update(pointId, {
      overlayHistory: [...point.overlayHistory, newOverlay],
      updatedAt: new Date().toISOString(),
    });
  };

  const addError = async (pointId: string, error: Omit<ErrorRecord, 'id'>) => {
    const point = await db.points.get(pointId);
    if (!point) return;
    const newError: ErrorRecord = { ...error, id: generateId() };
    await db.points.update(pointId, {
      errors: [...point.errors, newError],
      updatedAt: new Date().toISOString(),
    });
  };

  /** 删除指定误差记录 */
  const deleteError = async (pointId: string, errorId: string) => {
    const point = await db.points.get(pointId);
    if (!point) return;
    await db.points.update(pointId, {
      errors: point.errors.filter(e => e.id !== errorId),
      updatedAt: new Date().toISOString(),
    });
  };

  const deletePoint = async (id: string) => {
    await db.transaction('rw', [db.points, db.connections], async () => {
      await db.points.delete(id);
      await db.connections.where('sourcePointId').equals(id).delete();
    });
  };

  return { points: points ?? [], addPoint, updatePoint, addOverlay, addError, deleteError, deletePoint };
}
