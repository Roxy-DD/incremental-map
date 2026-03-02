import React from 'react';
import { GitBranch, Clock, FileText, Tag, Link2, ArrowRight } from 'lucide-react';
import type { LineMap } from '../types';
import { format } from 'date-fns';

interface LineCardProps {
  line: LineMap;
  onClick?: () => void;
  compact?: boolean;
}

const STATUS_MAP = {
  draft: { label: '草稿', class: 'bg-gray-100 text-gray-600' },
  published: { label: '已发布', class: 'bg-green-100 text-green-700' },
  archived: { label: '已归档', class: 'bg-amber-100 text-amber-700' },
};

export function LineCard({ line, onClick, compact = false }: LineCardProps) {
  const status = STATUS_MAP[line.status];

  return (
    <div
      className="card-line cursor-pointer hover:shadow-md transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-line-600 flex-shrink-0" />
          <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-line-700 transition-colors">
            {line.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`badge ${status.class}`}>{status.label}</span>
          <span className="badge-line">v{line.version}</span>
        </div>
      </div>

      {!compact && (
        <>
          <div className="space-y-2 mb-3">
            <div className="bg-line-50 rounded-lg p-3">
              <span className="font-medium text-line-700 text-xs block mb-1">理论假设:</span>
              <span className="text-sm text-gray-700 line-clamp-2">{line.theoreticalAssumptions}</span>
            </div>
            <div className="text-xs text-gray-600">
              <span className="font-medium text-gray-500 flex items-center gap-1 mb-1">
                <ArrowRight className="w-3 h-3" /> 预测内容:
              </span>
              <span className="line-clamp-2">{line.predictions}</span>
            </div>
          </div>
        </>
      )}

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(line.createdAt), 'yyyy-MM-dd')}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {line.versionHistory.length} 历史版本
          </span>
          <span className="flex items-center gap-1">
            <Link2 className="w-3 h-3" />
            {line.linkedPointIds.length} 关联点
          </span>
        </div>
        <div className="flex items-center gap-1">
          {line.tags.slice(0, 2).map(tag => (
            <span key={tag} className="flex items-center gap-0.5 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
              <Tag className="w-2.5 h-2.5" />{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
