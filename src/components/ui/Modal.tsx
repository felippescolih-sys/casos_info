import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
  /** false trava o modal aberto: sem X, sem Esc, sem clique fora. Para fluxo obrigatório. */
  dismissible?: boolean;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  maxWidthClassName = 'max-w-lg',
  dismissible = true,
}: ModalProps) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, dismissible]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {dismissible ? (
        <button
          aria-label="Fechar"
          className="absolute inset-0 bg-black/30"
          onClick={onClose}
        />
      ) : (
        <div className="absolute inset-0 bg-black/40" />
      )}
      <div
        className={`relative w-full ${maxWidthClassName} max-h-[90vh] overflow-y-auto rounded-lg bg-white p-5 shadow-xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium text-gray-900">{title}</h2>
          <button
            type="button"
            aria-label="Fechar"
            hidden={!dismissible}
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
