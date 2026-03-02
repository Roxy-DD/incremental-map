import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateId } from '../db';
import type { LineMap, LineMapVersion } from '../types';

/** 线图数据管理 Hook */
export function useLineMaps(filters?: { domain?: string; status?: string; search?: string }) {
  const lines = useLiveQuery(async () => {
    let results = await db.lines.toCollection().sortBy('createdAt');
    results = results.reverse();

    if (filters?.domain) {
      results = results.filter(l => l.domain === filters.domain);
    }
    if (filters?.status) {
      results = results.filter(l => l.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.theoreticalAssumptions.toLowerCase().includes(q) ||
        l.predictions.toLowerCase().includes(q)
      );
    }
    return results;
  }, [filters?.domain, filters?.status, filters?.search]);

  const addLine = async (data: Omit<LineMap, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'versionHistory'>) => {
    const now = new Date().toISOString();
    const line: LineMap = {
      ...data,
      id: generateId(),
      version: 1,
      versionHistory: [],
      createdAt: now,
      updatedAt: now,
    };
    await db.lines.add(line);
    return line;
  };

  const updateLine = async (id: string, updates: Partial<LineMap>, changeDescription: string) => {
    const existing = await db.lines.get(id);
    if (!existing) return;

    // 保存当前版本到历史 (版本追踪 - Section 4.2.3)
    const { versionHistory: _vh, ...snapshotData } = existing;
    const versionSnapshot: LineMapVersion = {
      version: existing.version,
      snapshot: snapshotData,
      changeDescription,
      timestamp: new Date().toISOString(),
    };

    await db.lines.update(id, {
      ...updates,
      version: existing.version + 1,
      versionHistory: [...existing.versionHistory, versionSnapshot],
      updatedAt: new Date().toISOString(),
    });
  };

  const publishLine = async (id: string) => {
    await db.lines.update(id, {
      status: 'published' as const,
      updatedAt: new Date().toISOString(),
    });
  };

  const archiveLine = async (id: string) => {
    await db.lines.update(id, {
      status: 'archived' as const,
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteLine = async (id: string) => {
    await db.transaction('rw', [db.lines, db.connections], async () => {
      await db.lines.delete(id);
      await db.connections.where('targetLineId').equals(id).delete();
    });
  };

  const linkPoint = async (lineId: string, pointId: string, connectionType: 'supports' | 'contradicts' | 'inspires' | 'verifies' = 'supports') => {
    const line = await db.lines.get(lineId);
    if (!line || line.linkedPointIds.includes(pointId)) return;
    await db.lines.update(lineId, {
      linkedPointIds: [...line.linkedPointIds, pointId],
      updatedAt: new Date().toISOString(),
    });
    // 同时创建连接关系
    await db.connections.add({
      id: generateId(),
      sourcePointId: pointId,
      targetLineId: lineId,
      type: connectionType,
      createdAt: new Date().toISOString(),
    });
  };

  /** 取消关联点图，同时清理对应的连接记录 */
  const unlinkPoint = async (lineId: string, pointId: string) => {
    const line = await db.lines.get(lineId);
    if (!line) return;
    await db.transaction('rw', [db.lines, db.connections], async () => {
      await db.lines.update(lineId, {
        linkedPointIds: line.linkedPointIds.filter(pid => pid !== pointId),
        updatedAt: new Date().toISOString(),
      });
      // 删除该线图与该点图之间的所有连接
      const conns = await db.connections
        .where('targetLineId').equals(lineId)
        .and(c => c.sourcePointId === pointId)
        .toArray();
      for (const c of conns) {
        await db.connections.delete(c.id);
      }
    });
  };

  /** 已发布线图退回草稿状态 */
  const unpublishLine = async (id: string) => {
    await db.lines.update(id, {
      status: 'draft' as const,
      updatedAt: new Date().toISOString(),
    });
  };

  /** 取消归档，恢复为草稿状态 */
  const unarchiveLine = async (id: string) => {
    await db.lines.update(id, {
      status: 'draft' as const,
      archivedAt: undefined,
      updatedAt: new Date().toISOString(),
    });
  };

  return { lines: lines ?? [], addLine, updateLine, publishLine, unpublishLine, archiveLine, unarchiveLine, deleteLine, linkPoint, unlinkPoint };
}
