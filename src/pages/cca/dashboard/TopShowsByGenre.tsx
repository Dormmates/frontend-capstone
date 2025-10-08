import { useGetTopGenres } from "@/_lib/@react-client-query/dashboard";

const TopShowsByGenre = () => {
  const { data } = useGetTopGenres();

  console.log(data);

  return <div>TopShowsByGenre</div>;
};

export default TopShowsByGenre;
