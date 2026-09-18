const LoadingState = ({
  message = "Loading...",
}) => {
  return (
    <div className="loading-state">
      <div className="loading-spinner" />

      <span>{message}</span>
    </div>
  );
};

export default LoadingState;