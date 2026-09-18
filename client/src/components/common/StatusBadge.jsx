const StatusBadge = ({
  status,
  children,
}) => {
  const normalizedStatus = String(
    status || ""
  )
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span
      className={`status-badge status-${normalizedStatus}`}
    >
      <span className="status-dot" />

      {children || status}
    </span>
  );
};

export default StatusBadge;