const ControlNumberInputTutorial = ({ className }: { className?: string }) => {
  return (
    <div className={`bg-lime-50 border border-lime-600 p-3 flex flex-col gap-2 text-sm ${className}`}>
      <div>
        <p>How to Input Ticket Control Numbers:</p>
        <ul className="list-disc pl-6">
          <li>Use a dash (-) to indicate a range (e.g., 1-10 means tickets 1 to 10).</li>
          <li>Use a comma (,) to separate individual ticket numbers or ranges (e.g., 2, 10).</li>
        </ul>
      </div>
      <div>
        <p>Example</p>
        <ul className="pl-6">
          <li>1-10, 20, 25</li>
          <li>This means: tickets 1 to 10, 20, and 25.</li>
        </ul>
      </div>
    </div>
  );
};

export default ControlNumberInputTutorial;
