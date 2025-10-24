import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ShowCardProps {
  genres: string[];
  title: string;
  showImage: string;
  description: string;
  className?: string;
}

const ShowCard = ({ genres, title, showImage, description, className }: ShowCardProps) => {
  return (
    <Card className={`w-fit ${className}`}>
      <CardHeader>
        <CardTitle>
          <h1 className="font-bold text-xl uppercase">{title}</h1>
        </CardTitle>
        <CardDescription className="flex flex-wrap gap-1 mt-2">
          {genres.map((name, index) => (
            <Badge key={index} variant="outline" className="rounded-full">
              {name}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 md:flex-row">
        <img className="w-full max-w-[200px] max-h-[300px] object-contain bg-black" src={showImage} alt="show image" />
        <div className="flex flex-col ">
          <p className="text-sm text-muted-foreground ">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowCard;
