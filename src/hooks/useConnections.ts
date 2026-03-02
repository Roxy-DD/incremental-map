import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateId } from '../db';
import type { Connection } from '../types';

/** 连接关系管理 Hook */
export function useConnections() {
  const connections = useLiveQuery(() => db.connections.toArray()) ?? [];

  const addConnection = async (data: Omit<Connection, 'id' | 'createdAt'>) => {
    const conn: Connection = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.connections.add(conn);
    return conn;
  };

  /** 删除连接，同时清理线图的 linkedPointIds */
  const deleteConnection = async (id: string) => {
    const conn = await db.connections.get(id);
    if (!conn) return;

    await db.transaction('rw', [db.connections, db.lines], async () => {
      await db.connections.delete(id);
      const line = await db.lines.get(conn.targetLineId);
      if (line) {
        // 检查是否还有其他连接引用同一个 pointId → 只在无残余连接时移除
        const remaining = await db.connections
          .where('targetLineId').equals(conn.targetLineId)
          .and(c => c.sourcePointId === conn.sourcePointId && c.id !== id)
          .count();
        if (remaining === 0) {
          await db.lines.update(conn.targetLineId, {
            linkedPointIds: line.linkedPointIds.filter(pid => pid !== conn.sourcePointId),
          });
        }
      }
    });
  };

  const getConnectionsForPoint = (pointId: string) =>
    connections.filter(c => c.sourcePointId === pointId);

  const getConnectionsForLine = (lineId: string) =>
    connections.filter(c => c.targetLineId === lineId);

  return { connections, addConnection, deleteConnection, getConnectionsForPoint, getConnectionsForLine };
}
