import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconButton } from './Button';
export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) { if (!open) return null; return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><h2 id="modal-title">{title}</h2><IconButton label="Close dialog" onClick={onClose}><X size={18} /></IconButton></div>{children}</section></div>; }
