import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const widthClass = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widthClass} mx-4 max-h-[85vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

/** 确认对话框 */
export function useConfirm() {
  const [state, setState] = useState<{ message: string; resolve: (v: boolean) => void } | null>(null);

  const confirm = (message: string): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ message, resolve });
    });
  };

  const ConfirmDialog = () => {
    if (!state) return null;
    return (
      <Modal isOpen={true} onClose={() => { state.resolve(false); setState(null); }} title="确认操作" size="sm">
        <p className="text-gray-600 mb-6">{state.message}</p>
        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={() => { state.resolve(false); setState(null); }}>
            取消
          </button>
          <button
            className="btn-primary !bg-red-600 hover:!bg-red-700"
            onClick={() => { state.resolve(true); setState(null); }}
          >
            确认
          </button>
        </div>
      </Modal>
    );
  };

  return { confirm, ConfirmDialog };
}
