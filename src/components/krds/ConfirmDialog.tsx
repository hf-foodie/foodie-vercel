'use client'
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busy,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  busy: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!busy) onClose()
      }}
      className="kr-dialog"
    >
      <DialogBackdrop className="kr-dialog-backdrop" />
      <div className="kr-dialog-position">
        <DialogPanel className="kr-dialog-panel">
          <DialogTitle as="h2">{title}</DialogTitle>
          <Description>{description}</Description>
          <div className="kr-actions">
            <button className="kr-button" type="button" disabled={busy} onClick={onClose} data-autofocus>
              돌아가기
            </button>
            <button className="kr-button kr-button-primary" type="button" disabled={busy} onClick={onConfirm}>
              {busy ? '처리 중…' : confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
