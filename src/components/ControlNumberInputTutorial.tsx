import { Card, CardContent } from "@/components/ui/card";

const ControlNumberInputTutorial = ({ className }: { className?: string }) => {
  return (
    <Card className={`rounded-none bg-gray border-2 shadow-none ${className}`}>
      <CardContent className="text-sm p-6">
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
      </CardContent>
    </Card>
  );
};

export default ControlNumberInputTutorial;
