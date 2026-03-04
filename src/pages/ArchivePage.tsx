import React, { useState } from 'react';
import { Archive, Search, Clock, FileText, BookOpen, RotateCcw, Link2, History } from 'lucide-react';
import { useLineMaps } from '../hooks/useLineMaps';
import { usePointMaps } from '../hooks/usePointMaps';
import { useConnections } from '../hooks/useConnections';
import { LineCard } from '../components/LineCard';
import { Modal, useConfirm } from '../components/Modal';

import { format } from 'date-fns';
import { useI18n } from '../i18n';

/**
 * 归档浏览页面 (Section 4.2.3)
 * 
 * 归档机制的方法论价值:
 * 1. 公开归档的科学价值 - 确保理论不因时间而被遗忘
 * 2. 代际传承的知识连续性 - 后代研究者可以获取前人的理论构想
 * 3. 技术进步后的理论激活 - 当新实验技术出现时检索归档线图
 * 4. 学术自由与知识共享的平衡
 * 5. 归档线图的标准化管理
 * 6. 版本追踪
 */
export function ArchivePage() {
  const { locale } = useI18n();
  const isEn = locale === 'en-US';
  const { lines, unarchiveLine } = useLineMaps();
  const { points } = usePointMaps();
  const { connections } = useConnections();
  const [search, setSearch] = useState('');
  const [showDetailId, setShowDetailId] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  /** 从实时数据中派生，避免展示过期快照 */
  const showDetail = showDetailId ? lines.find(l => l.id === showDetailId) ?? null : null;

  const archivedLines = lines
    .filter(l => l.status === 'archived')
    .filter(l => {
      if (!search) return true;
      const q = search.toLowerCase();
      return l.title.toLowerCase().includes(q) ||
        l.theoreticalAssumptions.toLowerCase().includes(q) ||
        l.predictions.toLowerCase().includes(q) ||
        l.domain.toLowerCase().includes(q);
    });

  const publishedLines = lines.filter(l => l.status === 'published');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Archive className="w-6 h-6 text-amber-600" /> {isEn ? 'Archive Browser' : '归档浏览'}
        </h1>
        <p className="page-subtitle">
          {isEn ? 'Permanent archive for line maps to preserve valuable hypotheses over generations.' : '理论猜想的永久存档 — 代际知识传承，确保未验证但有价值的理论不因时间而被遗忘'}
        </p>
      </div>

      {/* 归档理念说明 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> 归档机制的方法论价值
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-amber-700">
          <div>
            <strong className="block text-amber-800 mb-1">代际传承</strong>
            即使原始科学家已不在，后代研究者仍可获取归档线图，理解前人的理论构想、预测内容和推荐的验证方法。
          </div>
          <div>
            <strong className="block text-amber-800 mb-1">技术激活</strong>
            科学史表明许多理论提出时无法验证，后来随技术进步得到证实。例如广义相对论的多项预测在提出数十年后才被验证。
          </div>
          <div>
            <strong className="block text-amber-800 mb-1">标准化管理</strong>
            归档线图必须包含: 理论假设陈述、预测内容描述、验证方法建议、与点图关联、历史背景、文献引用。
          </div>
        </div>
      </div>

      {/* 搜索 */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="input !pl-10"
          placeholder={isEn ? 'Search archived theories...' : '搜索归档理论...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* 归档线图 */}
      <div className="mb-8">
        <h2 className="section-title flex items-center gap-2">
          <Archive className="w-4 h-4 text-amber-500" /> 已归档理论 ({archivedLines.length})
        </h2>
        {archivedLines.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {archivedLines.map(line => (
              <div key={line.id}>
                <LineCard line={line} onClick={() => setShowDetailId(line.id)} />
                {line.archivedAt && (
                  <div className="mt-1 ml-5 text-[10px] text-amber-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    归档于 {format(new Date(line.archivedAt), 'yyyy-MM-dd')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center text-gray-400 py-12">
          <Archive className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{isEn ? 'No archived theories' : '暂无归档理论'}</p>
            <p className="text-xs mt-1">{isEn ? 'Archive a published line map from Line Map Management.' : '在线图管理中点击"归档"按钮将理论存入归档'}</p>
          </div>
        )}
      </div>

      {/* 已发布（可归档） */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <FileText className="w-4 h-4 text-green-500" /> {isEn ? 'Published Theories (Archivable)' : '已发布理论（可归档）'} ({publishedLines.length})
        </h2>
        {publishedLines.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {publishedLines.map(line => (
              <LineCard key={line.id} line={line} onClick={() => setShowDetailId(line.id)} compact />
            ))}
          </div>
        ) : (
          <div className="card text-center text-gray-400 py-8 text-sm">{isEn ? 'No published theories' : '暂无已发布理论'}</div>
        )}
      </div>

      {/* 详情 Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetailId(null)} title={isEn ? 'Archived Theory Details' : '归档理论详情'} size="lg">
        {showDetail && (() => {
          const linkedConns = connections.filter(c => c.targetLineId === showDetail.id);
          const connTypeMap: Record<string, string> = { supports: '支持', contradicts: '矛盾', inspires: '启发', verifies: '验证' };
          return (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">{showDetail.title}</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="text-xs text-gray-500 mb-1">领域</div>
                <div className="font-medium">{showDetail.domain}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="text-xs text-gray-500 mb-1">创建者</div>
                <div className="font-medium">{showDetail.createdBy}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="text-xs text-gray-500 mb-1">版本</div>
                <div className="font-medium">v{showDetail.version} ({showDetail.versionHistory.length} 历史版本)</div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">理论假设</h4>
              <div className="bg-line-50 rounded-lg p-4 text-sm whitespace-pre-wrap">{showDetail.theoreticalAssumptions}</div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">预测内容</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">{showDetail.predictions}</div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">推荐验证方法</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">{showDetail.verificationMethods}</div>
            </div>
            {showDetail.historicalBackground && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">历史背景</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">{showDetail.historicalBackground}</div>
              </div>
            )}
            {showDetail.references && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">文献引用</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">{showDetail.references}</div>
              </div>
            )}

            {/* 关联的点图 */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                <Link2 className="w-3.5 h-3.5" /> 关联的实验记录 ({showDetail.linkedPointIds.length})
              </h4>
              {showDetail.linkedPointIds.length > 0 ? (
                <div className="space-y-2">
                  {showDetail.linkedPointIds.map(pid => {
                    const p = points.find(pp => pp.id === pid);
                    const conn = linkedConns.find(c => c.sourcePointId === pid);
                    return p ? (
                      <div key={pid} className="bg-point-50 rounded-lg p-3 text-sm flex items-center gap-2">
                        <span className="badge-point text-[10px]">点图</span>
                        <span>{p.title}</span>
                        {conn && (
                          <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{connTypeMap[conn.type] ?? conn.type}</span>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">暂无关联点图</div>
              )}
            </div>

            {/* 版本历史 */}
            {showDetail.versionHistory.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <History className="w-3.5 h-3.5" /> 版本历史 ({showDetail.versionHistory.length})
                </h4>
                <div className="space-y-2">
                  {[...showDetail.versionHistory].reverse().map(v => (
                    <div key={v.version} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="badge-line text-[10px]">v{v.version}</span>
                        <span className="text-xs text-gray-400">{format(new Date(v.timestamp), 'yyyy-MM-dd HH:mm')}</span>
                      </div>
                      <p className="text-sm text-gray-600"><span className="font-medium">变更说明: </span>{v.changeDescription}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-400">
                {showDetail.archivedAt && `归档于 ${format(new Date(showDetail.archivedAt), 'yyyy-MM-dd HH:mm')}`}
              </div>
              {showDetail.status === 'archived' && (
                <button
                  className="btn-secondary text-xs flex items-center gap-1"
                  onClick={async () => {
                    if (await confirm('确定将此归档理论恢复为草稿状态？')) {
                      await unarchiveLine(showDetail.id);
                      setShowDetailId(null);
                    }
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> 恢复为草稿
                </button>
              )}
            </div>
          </div>
          );
        })()}
      </Modal>

      <ConfirmDialog />
    </div>
  );
}
