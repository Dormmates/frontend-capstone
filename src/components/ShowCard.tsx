import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

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
        <CardDescription className="flex gap-1 mt-2">
          {genres.map((name, index) => (
            <Badge key={index} variant="outline" className="rounded-full">
              {name}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-5">
        <img className="w-[100px] h-[120px] object-contain bg-gray" src={showImage} alt="show image" />
        <p>{description}</p>
      </CardContent>
    </Card>
  );
};

export default ShowCard;
