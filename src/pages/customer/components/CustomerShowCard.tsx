import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ShowData } from "@/types/show";

import { Link } from "react-router-dom";

type ShowCardsProps = {
  show: ShowData;
};

const CustomerShowCard = ({ show }: ShowCardsProps) => {
  return (
    <Card className="max-w-sm flex flex-col w-full">
      <CardContent className="p-0 w-full">
        <div className="w-full h-[150px] bg-gray-100 flex items-center justify-center overflow-hidden relative">
          <img className="w-full h-full object-cover" src={show.showCover} alt={`${show.title} cover`} />

          <div className="absolute flex gap-2 top-2 left-2">
            <Badge className="rounded-full bg-black/70 text-white">{show.showType.toUpperCase()}</Badge>
            <Badge className="rounded-full bg-black/70 text-white">{show.department ? show.department.name : "All Department"}</Badge>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <h1 className="text-lg font-semibold">{show.title}</h1>

          <div className="flex flex-wrap gap-2">
            {show.genreNames.map((name, index) => (
              <Badge key={index} variant="outline" className="rounded-full">
                {name}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{show.description}</p>
        </div>
      </CardContent>

      <CardFooter className="p-5 mt-auto justify-end">
        <Link className="w-full" to={`/show/${show.showId}`}>
          <Button className="w-full">View Show</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CustomerShowCard;
