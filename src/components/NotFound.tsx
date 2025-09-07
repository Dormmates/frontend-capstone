type NotFoundProps = {
  title: string;
  description: string;
};

const NotFound = ({ title, description }: NotFoundProps) => {
  return (
    <div className="flex flex-col justify-center items-center w-full gap-4 mt-10">
      <h1 className="text-9xl font-bold">404</h1>
      <p className="text-3xl">{title.trim()}</p>
      <p className="tex-xl text-muted-foreground">{description.trim()}</p>
    </div>
  );
};

export default NotFound;
