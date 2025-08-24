const CCADashboard = () => {
  return (
    <div>
      <h1>CCADashboard</h1>

      <div>
        {[...Array(100)].map((_, i) => (
          <p key={i}>This is line {i + 1} of the dashboard content.</p>
        ))}
      </div>
    </div>
  );
};

export default CCADashboard;
