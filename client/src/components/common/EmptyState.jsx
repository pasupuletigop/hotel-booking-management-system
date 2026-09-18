import { SearchX } from "lucide-react";

const EmptyState = ({
  icon: Icon = SearchX,
  title = "Nothing here yet",
  description = "There is no information to display at the moment.",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={25} />
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {actionLabel && (
        <button
          type="button"
          className="secondary-action-button"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;