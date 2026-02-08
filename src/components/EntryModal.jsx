import './EntryModal.css'

export default function EntryModal({
  title,
  type,
  onSave,
  onDelete,
  onClose,
  children,
}) {
  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <span className={`modal-title-dot modal-title-dot--${type}`} />
            {title}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">{children}</div>

        <div className="modal-footer">
          {onDelete && (
            <button className="modal-delete-btn" onClick={onDelete}>
              Delete
            </button>
          )}
          <button
            className={`modal-save-btn modal-save-btn--${type}`}
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}
