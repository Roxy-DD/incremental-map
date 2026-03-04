import React, { useState } from 'react';
import { Plus, Search, MapPin, FlaskConical, Layers, ChevronDown, Trash2, Eye, Edit2, GitBranch, X } from 'lucide-react';
import { usePointMaps } from '../hooks/usePointMaps';
import { useLineMaps } from '../hooks/useLineMaps';
import { useConnections } from '../hooks/useConnections';
import { PointCard } from '../components/PointCard';
import { ErrorBadge } from '../components/ErrorBadge';
import { Modal, useConfirm } from '../components/Modal';
import type { PointMap, ErrorLevel, ErrorRecord } from '../types';
import { generateId } from '../db';
import { format } from 'date-fns';
import { useI18n } from '../i18n';

export function PointMapPage() {
  const { locale } = useI18n();
  const isEn = locale === 'en-US';
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const { points, addPoint, updatePoint, addOverlay, addError, deleteError, deletePoint } = usePointMaps({
    search: search || undefined,
    domain: domainFilter || undefined,
  });
  const { lines } = useLineMaps();
  const { connections } = useConnections();

  const [showCreate, setShowCreate] = useState(false);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState<string | null>(null);
  const [showAddError, setShowAddError] = useState<string | null>(null);
  const [showEditId, setShowEditId] = useState<string | null>(null);

  /** 从实时数据中派生详情，避免展示过期快照 */
  const showDetail = showDetailId ? points.find(p => p.id === showDetailId) ?? null : null;
  const showEdit = showEditId ? points.find(p => p.id === showEditId) ?? null : null;

  const { confirm, ConfirmDialog } = useConfirm();

  const domains = [...new Set(points.map(p => p.domain))];

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const errorsRaw = form.get('errors') as string;
    const errors: ErrorRecord[] = errorsRaw ? errorsRaw.split('\n').filter(Boolean).map(line => {
      const [level, desc] = line.split(':').map(s => s.trim());
      return {
        id: generateId(),
        level: (['perceptual', 'tool', 'abstraction', 'transmission', 'cognitive'].includes(level) ? level : 'tool') as ErrorLevel,
        description: desc || line,
        magnitude: 'medium' as const,
      };
    }) : [];

    await addPoint({
      title: form.get('title') as string,
      experimentConditions: form.get('conditions') as string,
      environment: form.get('environment') as string,
      operations: form.get('operations') as string,
      directResult: form.get('result') as string,
      mathematicalDescription: form.get('math') as string || undefined,
      errors,
      tags: (form.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      domain: form.get('domain') as string,
      createdBy: form.get('createdBy') as string || '当前研究者',
    });
    setShowCreate(false);
  };

  const handleOverlay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showOverlay) return;
    const form = new FormData(e.currentTarget);
    await addOverlay(showOverlay, {
      method: form.get('method') as string,
      updatedResult: form.get('updatedResult') as string,
      reason: form.get('reason') as string,
      updatedBy: form.get('updatedBy') as string || '当前研究者',
    });
    setShowOverlay(null);
  };

  const handleAddError = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showAddError) return;
    const form = new FormData(e.currentTarget);
    await addError(showAddError, {
      level: form.get('level') as ErrorLevel,
      description: form.get('description') as string,
      magnitude: form.get('magnitude') as 'low' | 'medium' | 'high',
      mitigationStrategy: form.get('mitigation') as string || undefined,
    });
    setShowAddError(null);
  };

  /** 编辑点图基本信息 */
  const handleEditPoint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showEdit) return;
    const form = new FormData(e.currentTarget);
    await updatePoint(showEdit.id, {
      title: form.get('title') as string,
      experimentConditions: form.get('conditions') as string,
      environment: form.get('environment') as string,
      operations: form.get('operations') as string,
      directResult: form.get('result') as string,
      mathematicalDescription: form.get('math') as string || undefined,
      domain: form.get('domain') as string,
      tags: (form.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
    });
    setShowEditId(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <MapPin className="w-6 h-6 text-point-600" /> {isEn ? 'Point Map Management' : '点图管理'}
            </h1>
            <p className="page-subtitle">
              {isEn
                ? 'Probability-1 experiment records with independent factual logging.'
                : '概率为1的实验记录 — "眼见为实，实验为真"，坚决放弃归纳，独立记录每个实验结果'}
            </p>
          </div>
          <button className="btn-point" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> {isEn ? 'New Point Map' : '新建点图'}
          </button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input !pl-10"
            placeholder={isEn ? 'Search title, conditions, or results...' : '搜索实验标题、条件、结果...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input !w-auto"
          value={domainFilter}
          onChange={e => setDomainFilter(e.target.value)}
        >
          <option value="">{isEn ? 'All domains' : '全部领域'}</option>
          {domains.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <div className="text-sm text-gray-400 ml-auto">{points.length} {isEn ? 'records' : '条记录'}</div>
      </div>

      {/* 点图列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {points.map(point => (
          <PointCard key={point.id} point={point} onClick={() => setShowDetailId(point.id)} />
        ))}
      </div>

      {points.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">{isEn ? 'No point maps yet' : '暂无点图记录'}</p>
          <p className="text-sm">{isEn ? 'Click "New Point Map" to add your first experiment record' : '点击"新建点图"添加第一条实验记录'}</p>
        </div>
      )}

      {/* 创建点图 Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="新建点图 — 实验记录" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">实验标题 *</label>
            <input name="title" className="input" required placeholder="例: 自由落体实验 — 铁球与羽毛（真空管）" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">学科领域 *</label>
              <input name="domain" className="input" required placeholder="例: 经典力学" />
            </div>
            <div>
              <label className="label">创建者</label>
              <input name="createdBy" className="input" placeholder="当前研究者" />
            </div>
          </div>
          <div>
            <label className="label">实验条件 *</label>
            <textarea name="conditions" className="textarea" required placeholder="完整描述实验条件：温度、气压、装置参数等" />
          </div>
          <div>
            <label className="label">实验环境 *</label>
            <textarea name="environment" className="textarea" required placeholder="实验场所、设备、环境控制条件等" />
          </div>
          <div>
            <label className="label">实验操作步骤 *</label>
            <textarea name="operations" className="textarea" required placeholder="详细的操作步骤描述" />
          </div>
          <div>
            <label className="label">直接实验结果 * <span className="text-gray-400 font-normal">(非抽象的、直接观测的)</span></label>
            <textarea name="result" className="textarea" required placeholder="直接的、非抽象的实验结果描述" />
          </div>
          <div>
            <label className="label">数学描述 <span className="text-gray-400 font-normal">(可选，非抽象数学)</span></label>
            <input name="math" className="input" placeholder="例: h = ½gt², t ≈ 3.19s" />
          </div>
          <div>
            <label className="label">误差记录 <span className="text-gray-400 font-normal">(每行一条，格式: 层级:描述)</span></label>
            <textarea name="errors" className="textarea" placeholder="tool:高速摄像机时间分辨率 ±0.001s&#10;perceptual:人工判定存在视觉延迟" />
            <p className="text-[10px] text-gray-400 mt-1">层级: perceptual(感知) | tool(工具) | abstraction(抽象) | transmission(传播) | cognitive(认知)</p>
          </div>
          <div>
            <label className="label">标签 <span className="text-gray-400 font-normal">(逗号分隔)</span></label>
            <input name="tags" className="input" placeholder="力学, 自由落体, 真空" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>取消</button>
            <button type="submit" className="btn-point">创建点图</button>
          </div>
        </form>
      </Modal>

      {/* 点图详情 Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetailId(null)} title="点图详情" size="lg">
        {showDetail && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">{showDetail.title}</h3>
              <span className="badge-point text-sm">概率 P = 1</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-medium text-gray-500 mb-1">学科领域</div>
                <div className="text-sm">{showDetail.domain}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-medium text-gray-500 mb-1">创建者</div>
                <div className="text-sm">{showDetail.createdBy}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">实验条件</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">{showDetail.experimentConditions}</div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">实验环境</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">{showDetail.environment}</div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">操作步骤</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">{showDetail.operations}</div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">直接实验结果</h4>
              <div className="bg-point-50 border border-point-200 rounded-lg p-4 text-sm font-medium">{showDetail.directResult}</div>
            </div>

            {showDetail.mathematicalDescription && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">数学描述</h4>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">{showDetail.mathematicalDescription}</div>
              </div>
            )}

            {/* 误差分析 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">多层次误差分析</h4>
                <button className="text-xs text-point-600 hover:text-point-700" onClick={() => { setShowAddError(showDetail.id); }}>
                  + 添加误差
                </button>
              </div>
              {showDetail.errors.length > 0 ? (
                <div className="space-y-2">
                  {showDetail.errors.map(err => (
                    <div key={err.id} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                      <ErrorBadge level={err.level} magnitude={err.magnitude} />
                      <span className="text-sm text-gray-700 flex-1">{err.description}</span>
                      <button
                        className="text-xs text-red-400 hover:text-red-600 flex-shrink-0"
                        onClick={async () => {
                          if (await confirm('确定删除此误差记录？')) {
                            await deleteError(showDetail.id, err.id);
                          }
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">暂无误差记录</div>
              )}
            </div>

            {/* 叠加更新历史 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> 叠加更新历史
                </h4>
                <button className="text-xs text-point-600 hover:text-point-700" onClick={() => setShowOverlay(showDetail.id)}>
                  + 叠加更新
                </button>
              </div>
              {showDetail.overlayHistory.length > 0 ? (
                <div className="space-y-2">
                  {showDetail.overlayHistory.map((ov, i) => (
                    <div key={ov.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span className="font-medium">叠加 #{i + 1}</span>
                        <span>{format(new Date(ov.timestamp), 'yyyy-MM-dd HH:mm')}</span>
                        <span>by {ov.updatedBy}</span>
                      </div>
                      <div className="text-sm"><span className="font-medium text-gray-500">方法: </span>{ov.method}</div>
                      <div className="text-sm"><span className="font-medium text-gray-500">更新结果: </span>{ov.updatedResult}</div>
                      <div className="text-sm"><span className="font-medium text-gray-500">原因: </span>{ov.reason}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">暂无叠加更新</div>
              )}
            </div>

            {/* 被关联的线图 */}
            {(() => {
              const linkedConns = connections.filter(c => c.sourcePointId === showDetail.id);
              const connTypeMap: Record<string, string> = { supports: '支持', contradicts: '矛盾', inspires: '启发', verifies: '验证' };
              return (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <GitBranch className="w-3.5 h-3.5" /> 被引用的线图 ({linkedConns.length})
                  </h4>
                  {linkedConns.length > 0 ? (
                    <div className="space-y-2">
                      {linkedConns.map(conn => {
                        const line = lines.find(l => l.id === conn.targetLineId);
                        return line ? (
                          <div key={conn.id} className="bg-line-50 rounded-lg p-3 text-sm flex items-center gap-2">
                            <span className="badge-line text-[10px]">线图</span>
                            <span>{line.title}</span>
                            <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{connTypeMap[conn.type] ?? conn.type}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">暂无线图引用此点图</div>
                  )}
                </div>
              );
            })()}

            {/* 操作按钮 */}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <button
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                onClick={async () => {
                  if (await confirm('确定删除此点图记录？此操作不可撤销。')) {
                    await deletePoint(showDetail.id);
                    setShowDetailId(null);
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5" /> 删除
              </button>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs" onClick={() => { setShowEditId(showDetail.id); }}>
                  <Edit2 className="w-3.5 h-3.5" /> 编辑
                </button>
                <button className="btn-secondary" onClick={() => setShowDetailId(null)}>关闭</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 叠加更新 Modal */}
      <Modal isOpen={!!showOverlay} onClose={() => setShowOverlay(null)} title="叠加更新 — 更精确的验证" size="md">
        <form onSubmit={handleOverlay} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            叠加更新: 当通过更精确的实验方法验证模式时，在原始点上叠加标签更新记录，但原始实验记录仍然保留。
          </div>
          <div>
            <label className="label">更精确的实验方法 *</label>
            <textarea name="method" className="textarea" required placeholder="描述新使用的更精确的实验方法" />
          </div>
          <div>
            <label className="label">更新后的结果 *</label>
            <textarea name="updatedResult" className="textarea" required placeholder="新方法得到的实验结果" />
          </div>
          <div>
            <label className="label">更新原因 *</label>
            <textarea name="reason" className="textarea" required placeholder="为什么需要此次叠加更新" />
          </div>
          <div>
            <label className="label">更新者</label>
            <input name="updatedBy" className="input" placeholder="当前研究者" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowOverlay(null)}>取消</button>
            <button type="submit" className="btn-point">提交叠加更新</button>
          </div>
        </form>
      </Modal>

      {/* 添加误差 Modal */}
      <Modal isOpen={!!showAddError} onClose={() => setShowAddError(null)} title="添加误差记录" size="md">
        <form onSubmit={handleAddError} className="space-y-4">
          <div>
            <label className="label">误差层级 *</label>
            <select name="level" className="input" required>
              <option value="perceptual">感知误差 — 人类感官的固有误差</option>
              <option value="tool">工具测量误差 — 测量仪器引入的误差</option>
              <option value="abstraction">理论抽象误差 — 经验到理论的抽象过程</option>
              <option value="transmission">传播误差 — 知识传递过程中的误差</option>
              <option value="cognitive">认知局限误差 — 归纳推理的认知局限</option>
            </select>
          </div>
          <div>
            <label className="label">误差描述 *</label>
            <textarea name="description" className="textarea" required placeholder="详细描述此误差来源及其影响" />
          </div>
          <div>
            <label className="label">严重程度 *</label>
            <select name="magnitude" className="input" required>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          <div>
            <label className="label">缓解策略 <span className="text-gray-400 font-normal">(可选)</span></label>
            <textarea name="mitigation" className="textarea" placeholder="描述如何缓解或减小此误差" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowAddError(null)}>取消</button>
            <button type="submit" className="btn-point">添加误差</button>
          </div>
        </form>
      </Modal>

      {/* 编辑点图 Modal */}
      <Modal isOpen={!!showEdit} onClose={() => setShowEditId(null)} title="编辑点图 — 修改基本信息" size="lg">
        {showEdit && (
          <form onSubmit={handleEditPoint} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              编辑点图的基本信息。注意：原始实验记录的核心数据应通过「叠加更新」方式补充，而非直接覆盖。
            </div>
            <div>
              <label className="label">实验标题 *</label>
              <input name="title" className="input" required defaultValue={showEdit.title} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">学科领域 *</label>
                <input name="domain" className="input" required defaultValue={showEdit.domain} />
              </div>
              <div>
                <label className="label">标签 <span className="text-gray-400 font-normal">(逗号分隔)</span></label>
                <input name="tags" className="input" defaultValue={showEdit.tags.join(', ')} />
              </div>
            </div>
            <div>
              <label className="label">实验条件 *</label>
              <textarea name="conditions" className="textarea" required defaultValue={showEdit.experimentConditions} />
            </div>
            <div>
              <label className="label">实验环境 *</label>
              <textarea name="environment" className="textarea" required defaultValue={showEdit.environment} />
            </div>
            <div>
              <label className="label">实验操作步骤 *</label>
              <textarea name="operations" className="textarea" required defaultValue={showEdit.operations} />
            </div>
            <div>
              <label className="label">直接实验结果 *</label>
              <textarea name="result" className="textarea" required defaultValue={showEdit.directResult} />
            </div>
            <div>
              <label className="label">数学描述 <span className="text-gray-400 font-normal">(可选)</span></label>
              <input name="math" className="input" defaultValue={showEdit.mathematicalDescription ?? ''} />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setShowEditId(null)}>取消</button>
              <button type="submit" className="btn-point">保存修改</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog />
    </div>
  );
}
