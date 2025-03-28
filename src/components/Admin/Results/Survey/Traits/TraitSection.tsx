import { UsersResultsResponse } from "../SurveyResults";

const TraitCircles = ({
  mainColor,
  secondaryColor,
  firstTertiaryColor,
  secondTertiaryColor,
  firstPermutation,
  secondPermutation,
  userResults,
}: {
  mainColor: string;
  secondaryColor: string;
  firstTertiaryColor: string;
  secondTertiaryColor: string;
  firstPermutation: string;
  secondPermutation: string;
  userResults: UsersResultsResponse | undefined;
}) => (
  <div className="p-8">
    <div className="relative w-52 h-52">
      {/* Main outer circle */}
      <div className={`absolute inset-0 border-4 ${mainColor} rounded-full`} />

      {/* Secondary circle */}
      <div
        className={`absolute w-3/4 border-4 ${secondaryColor} rounded-full top-[12%] left-[13%] h-3/4`}
      />

      {/* First tertiary circle */}
      <div
        className={`absolute top-[50%] left-[33%] w-[25%] h-[25%] border-4 ${firstTertiaryColor} rounded-full flex items-center justify-center`}
      >
        <span className="text-lg">
          {userResults?.reduce(
            (acc, user) =>
              user.aggregatedRank123 === firstPermutation ? acc + 1 : acc,
            0
          )}
        </span>
      </div>

      {/* Second tertiary circle */}
      <div
        className={`absolute top-[20%] right-[35%] w-[25%] h-[25%] border-4 ${secondTertiaryColor} rounded-full flex items-center justify-center`}
      >
        <span className="text-lg">
          {userResults?.reduce(
            (acc, user) =>
              user.aggregatedRank123 === secondPermutation ? acc + 1 : acc,
            0
          )}
        </span>
      </div>
    </div>
  </div>
);

// Reusable TraitSection component
export const TraitSection = ({
  title,
  subtitle,
  mainColor,
  userResults,
  combinations,
}: {
  title: string;
  subtitle: string;
  mainColor: string;
  userResults: UsersResultsResponse | undefined;
  combinations: {
    secondaryColor: string;
    firstTertiaryColor: string;
    secondTertiaryColor: string;
    firstPermutation: string;
    secondPermutation: string;
  }[];
}) => (
  <div className="p-4 mt-8 bg-white">
    <h1 className="text-xl font-medium">{title}</h1>
    <span className="text-sm text-gray-300">{subtitle}</span>
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
      {combinations.map((combo, index) => (
        <TraitCircles
          key={index}
          mainColor={mainColor}
          userResults={userResults}
          {...combo}
        />
      ))}
    </div>
  </div>
);
