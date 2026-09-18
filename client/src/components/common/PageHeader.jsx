import { ArrowRight } from "lucide-react";

const PageHeader = ({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = ArrowRight,
}) => {
  return (
    <div className="page-header">
      <div className="page-header-content">
        {eyebrow && (
          <span className="page-header-eyebrow">
            {eyebrow}
          </span>
        )}

        <h1>{title}</h1>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {actionLabel && (
        <button
          type="button"
          className="primary-action-button"
          onClick={onAction}
        >
          <span>{actionLabel}</span>

          <ActionIcon size={17} />
        </button>
      )}
    </div>
  );
};

export default PageHeader;