import React from 'react';
import { MapPin, Clock, FlaskConical, Layers, Tag } from 'lucide-react';
import type { PointMap } from '../types';
import { ErrorBadge } from './ErrorBadge';
import { format } from 'date-fns';

interface PointCardProps {
  point: PointMap;
  onClick?: () => void;
  compact?: boolean;
}

export function PointCard({ point, onClick, compact = false }: PointCardProps) {
  return (
    <div
      className="card-point cursor-pointer hover:shadow-md transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-point-600 flex-shrink-0" />
          <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-point-700 transition-colors">
            {point.title}
          </h3>
        </div>
        <span className="badge-point flex-shrink-0">P=1</span>
      </div>

      {!compact && (
        <>
          <div className="space-y-2 mb-3">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <FlaskConical className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
              <span className="line-clamp-2">{point.experimentConditions}</span>
            </div>
            <div className="bg-point-50 rounded-lg p-3 text-sm text-gray-800">
              <span className="font-medium text-point-700 text-xs block mb-1">直接实验结果:</span>
              <span className="line-clamp-3">{point.directResult}</span>
            </div>
          </div>

          {point.mathematicalDescription && (
            <div className="bg-gray-50 rounded-lg p-2 mb-3">
              <code className="text-xs text-gray-700 font-mono">{point.mathematicalDescription}</code>
            </div>
          )}
        </>
      )}

      {/* 误差标注 */}
      {point.errors.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {point.errors.map(err => (
            <ErrorBadge key={err.id} level={err.level} magnitude={err.magnitude} />
          ))}
        </div>
      )}

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(point.createdAt), 'yyyy-MM-dd')}
          </span>
          {point.overlayHistory.length > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {point.overlayHistory.length} 次叠加
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {point.tags.slice(0, 2).map(tag => (
            <span key={tag} className="flex items-center gap-0.5 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
              <Tag className="w-2.5 h-2.5" />{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
