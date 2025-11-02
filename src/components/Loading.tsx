import logo from "@/assets/images/cca-logo.png";

const Loading = ({ message = "Please wait while we are loading the resource for you" }: { message?: string }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-5">
      <div className="animate-flip">
        <img src={logo} alt="CCA logo" className="w-44 h-44 object-contain" />
      </div>

      <div className="flex items-center space-x-1 text-xl font-semibold">
        <span>Loading</span>
        <span className="flex space-x-1">
          <span className="animate-bounceDot">.</span>
          <span className="animate-bounceDot [animation-delay:0.2s]">.</span>
          <span className="animate-bounceDot [animation-delay:0.4s]">.</span>
        </span>
      </div>
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
};

export default Loading;
