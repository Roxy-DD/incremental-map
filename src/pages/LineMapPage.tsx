import React, { useState } from 'react';
import { Plus, Search, GitBranch, Archive, Globe, Trash2, History, Link2, Unlink, FileInput } from 'lucide-react';
import { useLineMaps } from '../hooks/useLineMaps';
import { usePointMaps } from '../hooks/usePointMaps';
import { useConnections } from '../hooks/useConnections';
import { LineCard } from '../components/LineCard';
import { Modal, useConfirm } from '../components/Modal';
import type { LineMap } from '../types';
import { format } from 'date-fns';
import { useI18n } from '../i18n';

export function LineMapPage() {
  const { locale } = useI18n();
  const isEn = locale === 'en-US';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { lines, addLine, updateLine, publishLine, unpublishLine, archiveLine, deleteLine, linkPoint, unlinkPoint } = useLineMaps({
    search: search || undefined,
    status: statusFilter || undefined,
  });
  const { points } = usePointMaps();
  const { connections } = useConnections();

  const [showCreate, setShowCreate] = useState(false);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);
  const [showVersionsId, setShowVersionsId] = useState<string | null>(null);
  const [showEditId, setShowEditId] = useState<string | null>(null);
  const [showLink, setShowLink] = useState<string | null>(null);
  const [linkConnectionType, setLinkConnectionType] = useState<'supports' | 'contradicts' | 'inspires' | 'verifies'>('supports');

  /** 从实时数据中派生，避免展示过期快照 */
  const showDetail = showDetailId ? lines.find(l => l.id === showDetailId) ?? null : null;
  const showVersions = showVersionsId ? lines.find(l => l.id === showVersionsId) ?? null : null;
  const showEdit = showEditId ? lines.find(l => l.id === showEditId) ?? null : null;
  const { confirm, ConfirmDialog } = useConfirm();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await addLine({
      title: form.get('title') as string,
      theoreticalAssumptions: form.get('assumptions') as string,
      predictions: form.get('predictions') as string,
      verificationMethods: form.get('methods') as string,
      linkedPointIds: [],
      historicalBackground: form.get('background') as string || undefined,
      references: form.get('references') as string || undefined,
      status: 'draft',
      createdBy: form.get('createdBy') as string || '当前研究者',
      domain: form.get('domain') as string,
      tags: (form.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
    });
    setShowCreate(false);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showEdit) return;
    const form = new FormData(e.currentTarget);
    await updateLine(showEdit.id, {
      title: form.get('title') as string,
      theoreticalAssumptions: form.get('assumptions') as string,
      predictions: form.get('predictions') as string,
      verificationMethods: form.get('methods') as string,
      historicalBackground: form.get('background') as string || undefined,
      references: form.get('references') as string || undefined,
      domain: form.get('domain') as string,
      tags: (form.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
    }, form.get('changeDesc') as string || '更新内容');
    setShowEditId(null);
    setShowDetailId(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-line-600" /> {isEn ? 'Line Map Management' : '线图管理'}
            </h1>
            <p className="page-subtitle">
              {isEn ? 'A free space for hypotheses with versioning and archival inheritance.' : '理论猜想的自由空间 — 每位科学家独立维护，版本追踪，归档传承'}
            </p>
          </div>
          <button className="btn-line" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> {isEn ? 'New Line Map' : '新建线图'}
          </button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input !pl-10"
            placeholder={isEn ? 'Search title, assumptions, predictions...' : '搜索理论标题、假设、预测...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input !w-auto"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">{isEn ? 'All status' : '全部状态'}</option>
          <option value="draft">{isEn ? 'Draft' : '草稿'}</option>
          <option value="published">{isEn ? 'Published' : '已发布'}</option>
          <option value="archived">{isEn ? 'Archived' : '已归档'}</option>
        </select>
        <div className="text-sm text-gray-400 ml-auto">{lines.length} {isEn ? 'records' : '条记录'}</div>
      </div>

      {/* 线图列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {lines.map(line => (
          <LineCard key={line.id} line={line} onClick={() => setShowDetailId(line.id)} />
        ))}
      </div>

      {lines.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">{isEn ? 'No line maps yet' : '暂无线图记录'}</p>
          <p className="text-sm">{isEn ? 'Click "New Line Map" to add your first hypothesis' : '点击"新建线图"添加第一条理论猜想'}</p>
        </div>
      )}

      {/* 创建线图 Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="新建线图 — 理论猜想" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">理论标题 *</label>
            <input name="title" className="input" required placeholder="例: 惯性质量与引力质量等价原理" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">学科领域 *</label>
              <input name="domain" className="input" required placeholder="例: 理论物理" />
            </div>
            <div>
              <label className="label">创建者</label>
              <input name="createdBy" className="input" placeholder="当前研究者" />
            </div>
          </div>
          <div>
            <label className="label">理论假设的清晰陈述 *</label>
            <textarea name="assumptions" className="textarea min-h-[100px]" required placeholder="清晰阐述理论的基本假设和前提条件" />
          </div>
          <div>
            <label className="label">预测内容的具体描述 *</label>
            <textarea name="predictions" className="textarea min-h-[100px]" required placeholder="该理论做出了哪些可验证的具体预测" />
          </div>
          <div>
            <label className="label">推荐的实验验证方法 *</label>
            <textarea name="methods" className="textarea min-h-[100px]" required placeholder="建议的实验设计方案和验证路径" />
          </div>
          <div>
            <label className="label">理论历史背景 <span className="text-gray-400 font-normal">(可选)</span></label>
            <textarea name="background" className="textarea" placeholder="理论提出的历史背景和思想脉络" />
          </div>
          <div>
            <label className="label">文献引用 <span className="text-gray-400 font-normal">(可选)</span></label>
            <textarea name="references" className="textarea" placeholder="相关文献引用" />
          </div>
          <div>
            <label className="label">标签 <span className="text-gray-400 font-normal">(逗号分隔)</span></label>
            <input name="tags" className="input" placeholder="相对论, 等价原理, 引力" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>取消</button>
            <button type="submit" className="btn-line">创建线图</button>
          </div>
        </form>
      </Modal>

      {/* 线图详情 Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetailId(null)} title="线图详情" size="lg">
        {showDetail && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{showDetail.title}</h3>
              <div className="flex items-center gap-2">
                <span className="badge-line">v{showDetail.version}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">领域</div>
                <div className="text-sm font-medium">{showDetail.domain}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">创建者</div>
                <div className="text-sm font-medium">{showDetail.createdBy}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">状态</div>
                <div className="text-sm font-medium">{showDetail.status === 'draft' ? '草稿' : showDetail.status === 'published' ? '已发布' : '已归档'}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">理论假设</h4>
              <div className="bg-line-50 border border-line-200 rounded-lg p-4 text-sm whitespace-pre-wrap">{showDetail.theoreticalAssumptions}</div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">预测内容</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">{showDetail.predictions}</div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">推荐验证方法</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">{showDetail.verificationMethods}</div>
            </div>

            {showDetail.historicalBackground && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">历史背景</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">{showDetail.historicalBackground}</div>
              </div>
            )}

            {showDetail.references && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">文献引用</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">{showDetail.references}</div>
              </div>
            )}

            {/* 关联的点图 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5" /> 关联的实验记录 ({showDetail.linkedPointIds.length})
                </h4>
                {showDetail.status !== 'archived' && (
                  <button className="text-xs text-line-600 hover:text-line-700" onClick={() => setShowLink(showDetail.id)}>
                    + 关联点图
                  </button>
                )}
              </div>
              {showDetail.linkedPointIds.length > 0 ? (
                <div className="space-y-2">
                  {showDetail.linkedPointIds.map(pid => {
                    const p = points.find(pp => pp.id === pid);
                    const conn = connections.find(c => c.targetLineId === showDetail.id && c.sourcePointId === pid);
                    const connTypeMap: Record<string, string> = { supports: '支持', contradicts: '矛盾', inspires: '启发', verifies: '验证' };
                    return p ? (
                      <div key={pid} className="bg-point-50 rounded-lg p-3 text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="badge-point text-[10px]">点图</span>
                          <span>{p.title}</span>
                          {conn && (
                            <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{connTypeMap[conn.type] ?? conn.type}</span>
                          )}
                        </div>
                        {showDetail.status !== 'archived' && (
                          <button
                            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-0.5"
                            onClick={async () => {
                              if (await confirm(`确定取消与「${p.title}」的关联？`)) {
                                await unlinkPoint(showDetail.id, pid);
                              }
                            }}
                          >
                            <Unlink className="w-3 h-3" /> 取消关联
                          </button>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">暂无关联点图</div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  onClick={async () => {
                    if (await confirm('确定删除此线图？')) {
                      await deleteLine(showDetail.id);
                      setShowDetailId(null);
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> 删除
                </button>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs" onClick={() => setShowVersionsId(showDetail.id)}>
                  <History className="w-3.5 h-3.5" /> 版本历史
                </button>
                {showDetail.status !== 'archived' && (
                  <button className="btn-secondary text-xs" onClick={() => { setShowEditId(showDetail.id); }}>
                    编辑
                  </button>
                )}
                {showDetail.status === 'draft' && (
                  <button className="btn-secondary text-xs" onClick={async () => { await publishLine(showDetail.id); setShowDetailId(null); }}>
                    <Globe className="w-3.5 h-3.5" /> 发布
                  </button>
                )}
                {showDetail.status === 'published' && (
                  <button className="btn-secondary text-xs" onClick={async () => { await unpublishLine(showDetail.id); }}>
                    <FileInput className="w-3.5 h-3.5" /> 退回草稿
                  </button>
                )}
                {showDetail.status !== 'archived' && (
                  <button className="btn-secondary text-xs" onClick={async () => { await archiveLine(showDetail.id); setShowDetailId(null); }}>
                    <Archive className="w-3.5 h-3.5" /> 归档
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 版本历史 Modal */}
      <Modal isOpen={!!showVersions} onClose={() => setShowVersionsId(null)} title="版本追踪历史" size="lg">
        {showVersions && (
          <div>
            <p className="text-sm text-gray-500 mb-4">当前版本: v{showVersions.version} | 共 {showVersions.versionHistory.length} 个历史版本</p>
            {showVersions.versionHistory.length > 0 ? (
              <div className="space-y-3">
                {[...showVersions.versionHistory].reverse().map(v => (
                  <div key={v.version} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge-line">v{v.version}</span>
                      <span className="text-xs text-gray-400">{format(new Date(v.timestamp), 'yyyy-MM-dd HH:mm')}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2"><span className="font-medium">变更说明: </span>{v.changeDescription}</p>
                    <details className="text-xs text-gray-500">
                      <summary className="cursor-pointer hover:text-gray-700">查看快照</summary>
                      <pre className="mt-2 bg-gray-50 rounded p-3 overflow-auto text-[11px]">
                        {JSON.stringify(v.snapshot, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">暂无历史版本（第一次编辑后将产生版本记录）</div>
            )}
          </div>
        )}
      </Modal>

      {/* 编辑线图 Modal */}
      <Modal isOpen={!!showEdit} onClose={() => setShowEditId(null)} title="编辑线图（将创建新版本）" size="lg">
        {showEdit && (
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              编辑将自动保存当前版本到历史记录中，实现版本追踪。
            </div>
            <div>
              <label className="label">变更说明 *</label>
              <input name="changeDesc" className="input" required placeholder="描述本次修改的内容和原因" />
            </div>
            <div>
              <label className="label">理论标题</label>
              <input name="title" className="input" defaultValue={showEdit.title} />
            </div>
            <div>
              <label className="label">理论假设</label>
              <textarea name="assumptions" className="textarea min-h-[100px]" defaultValue={showEdit.theoreticalAssumptions} />
            </div>
            <div>
              <label className="label">预测内容</label>
              <textarea name="predictions" className="textarea min-h-[100px]" defaultValue={showEdit.predictions} />
            </div>
            <div>
              <label className="label">推荐验证方法</label>
              <textarea name="methods" className="textarea min-h-[100px]" defaultValue={showEdit.verificationMethods} />
            </div>
            <div>
              <label className="label">历史背景</label>
              <textarea name="background" className="textarea" defaultValue={showEdit.historicalBackground} />
            </div>
            <div>
              <label className="label">文献引用</label>
              <textarea name="references" className="textarea" defaultValue={showEdit.references} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">学科领域</label>
                <input name="domain" className="input" defaultValue={showEdit.domain} />
              </div>
              <div>
                <label className="label">标签 <span className="text-gray-400 font-normal">(逗号分隔)</span></label>
                <input name="tags" className="input" defaultValue={showEdit.tags.join(', ')} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setShowEditId(null)}>取消</button>
              <button type="submit" className="btn-line">保存新版本</button>
            </div>
          </form>
        )}
      </Modal>

      {/* 关联点图 Modal */}
      <Modal isOpen={!!showLink} onClose={() => setShowLink(null)} title="关联点图（实验记录）" size="md">
        <div className="space-y-3">
          <div>
            <label className="label">连接类型</label>
            <select
              className="input !w-auto"
              value={linkConnectionType}
              onChange={e => setLinkConnectionType(e.target.value as 'supports' | 'contradicts' | 'inspires' | 'verifies')}
            >
              <option value="supports">支持 — 实验数据支持该理论</option>
              <option value="contradicts">矛盾 — 实验数据与该理论矛盾</option>
              <option value="inspires">启发 — 实验现象启发了该理论</option>
              <option value="verifies">验证 — 实验结果验证了该预测</option>
            </select>
          </div>
          <div className="space-y-2">
          {points.map(p => {
            const lineDetail = lines.find(l => l.id === showLink);
            const alreadyLinked = lineDetail?.linkedPointIds.includes(p.id);
            return (
              <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="badge-point text-[10px]">点图</span>
                  <span className="text-sm">{p.title}</span>
                </div>
                {alreadyLinked ? (
                  <span className="text-xs text-green-600">已关联</span>
                ) : (
                  <button
                    className="text-xs text-line-600 hover:text-line-700"
                    onClick={async () => {
                      if (showLink) await linkPoint(showLink, p.id, linkConnectionType);
                    }}
                  >
                    + 关联
                  </button>
                )}
              </div>
            );
          })}
          {points.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">暂无点图记录可关联</div>
          )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog />
    </div>
  );
}
