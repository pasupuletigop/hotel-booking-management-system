const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = "positive",
}) => {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-card-icon">
          {Icon && <Icon size={20} />}
        </div>

        {trend && (
          <span
            className={`stat-card-trend stat-trend-${trendType}`}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="stat-card-value">
        {value}
      </div>

      <div className="stat-card-title">
        {title}
      </div>

      {subtitle && (
        <div className="stat-card-subtitle">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;