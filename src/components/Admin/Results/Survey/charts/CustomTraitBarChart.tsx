import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowUp,
  ArrowDown,
  MinusCircle,
} from "lucide-react";

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Trait colors
const traitColors = {
  Precision: "#008e9e",
  Resolve: "#ed3e44",
  Harmony: "#72a854",
  Innovation: "#daa520",
};

const getAdjustmentType = (current: number, target: number) => {
  const difference = target - current;

  if (difference >= 25 && difference <= 50) return "up";
  if (difference >= 15 && difference <= 20) return "up-little";
  if (difference >= -10 && difference <= 10) return "no-change";
  if (difference >= -20 && difference <= -15) return "down-little";
  if (difference >= -50 && difference <= -25) return "down";
  return "no-change";
};

const AdjustmentIndicator = ({
  type,
  trait,
}: {
  type: string;
  trait: string;
}) => {
  const getAdjustmentText = (type: string) => {
    switch (type) {
      case "up":
        return `${trait} needs significant increase`;
      case "up-little":
        return `${trait} needs small increase`;
      case "down":
        return `${trait} needs significant decrease`;
      case "down-little":
        return `${trait} needs small decrease`;
      default:
        return `${trait} needs no adjustment`;
    }
  };

  // Get trait color from our color mapping
  const traitColor = traitColors[trait as keyof typeof traitColors];

  return (
    <div className="flex items-center gap-2">
      {type === "up" && (
        <ArrowUpCircle className="w-6 h-6" style={{ color: traitColor }} />
      )}
      {type === "up-little" && (
        <ArrowUp className="w-6 h-6" style={{ color: traitColor }} />
      )}
      {type === "down" && (
        <ArrowDownCircle className="w-6 h-6" style={{ color: traitColor }} />
      )}
      {type === "down-little" && (
        <ArrowDown className="w-6 h-6" style={{ color: traitColor }} />
      )}
      {type === "no-change" && (
        <MinusCircle className="w-6 h-6" style={{ color: traitColor }} />
      )}
      <span className="text-base font-medium" style={{ color: traitColor }}>
        {getAdjustmentText(type)}
      </span>
    </div>
  );
};

interface CombinedTraitBarChartProps {
  compositeResult: {
    precisionAdjScore: number;
    resolveAdjScore: number;
    harmonyAdjScore: number;
    innovationAdjScore: number;
  };
  roleTarget: {
    precisionAdjScore: number;
    resolveAdjScore: number;
    harmonyAdjScore: number;
    innovationAdjScore: number;
  };
}

const CombinedTraitBarChart = ({
  compositeResult,
  roleTarget,
}: CombinedTraitBarChartProps) => {
  const data = {
    labels: ["Precision", "Resolve", "Harmony", "Innovation"],
    datasets: [
      {
        label: "Current Result",
        data: [
          compositeResult.precisionAdjScore,
          compositeResult.resolveAdjScore,
          compositeResult.harmonyAdjScore,
          compositeResult.innovationAdjScore,
        ],
        backgroundColor: [
          "rgba(0, 142, 158, 0.5)", // Precision lighter
          "rgba(237, 62, 68, 0.5)", // Resolve lighter
          "rgba(114, 168, 84, 0.5)", // Harmony lighter
          "rgba(240, 165, 32, 0.4)", // Innovation lighter (changed from 0.7 to 0.3 opacity)
        ],
        borderColor: [
          "#008e9e", // Precision
          "#ed3e44", // Resolve
          "#72a854", // Harmony
          "#e8cf9b", // Innovation
        ],
        borderWidth: 1,
      },
      {
        label: "Target",
        data: [
          roleTarget.precisionAdjScore,
          roleTarget.resolveAdjScore,
          roleTarget.harmonyAdjScore,
          roleTarget.innovationAdjScore,
        ],
        backgroundColor: [
          "#008e9e", // Precision
          "#ed3e44", // Resolve
          "#72a854", // Harmony
          "rgba(240, 165, 32, 0.6)", // Innovation lighter (changed from 0.7 to 0.3 opacity)
        ],
        borderColor: [
          "#008e9e", // Precision
          "#ed3e44", // Resolve
          "#72a854", // Harmony
          "#e8cf9b", // Innovation
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Factors Score Comparison Chart",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 50,
        ticks: {
          stepSize: 10,
        },
      },
    },
  } as const;

  // Create array of adjustment types for each trait
  const adjustmentTypes = data.labels.map((_, index) =>
    getAdjustmentType(
      data.datasets[0].data[index],
      data.datasets[1].data[index]
    )
  );

  // Custom rendering of x-axis labels with icons
  const getAdjustmentIcon = (type: string, traitColor: string) => {
    switch (type) {
      case "up":
        return (
          <ArrowUpCircle
            className="w-4 h-4 ml-0.5"
            style={{ color: traitColor }}
          />
        );
      case "up-little":
        return (
          <ArrowUp className="w-4 h-4 ml-0.5" style={{ color: traitColor }} />
        );
      case "down":
        return (
          <ArrowDownCircle
            className="w-4 h-4 ml-0.5"
            style={{ color: traitColor }}
          />
        );
      case "down-little":
        return (
          <ArrowDown className="w-4 h-4 ml-0.5" style={{ color: traitColor }} />
        );
      default:
        return (
          <MinusCircle
            className="w-4 h-4 ml-0.5"
            style={{ color: traitColor }}
          />
        );
    }
  };

  return (
    <div className="w-full p-4 bg-white">
      <div className="flex flex-col gap-6">
        <div className="h-96">
          <Bar data={data} options={options} />
        </div>

        {/* Custom trait labels with icons - increased spacing */}
        <div className="flex w-full mt-8">
          {data.labels.map((trait, index) => {
            const traitColor = traitColors[trait as keyof typeof traitColors];
            const adjustmentType = adjustmentTypes[index];

            return (
              <div
                key={trait}
                className="flex items-center justify-center w-full"
              >
                <span className="font-medium" style={{ color: traitColor }}>
                  {trait}
                </span>
                {getAdjustmentIcon(adjustmentType, traitColor)}
              </div>
            );
          })}
        </div>

        {/* Adjustment explanation - improved layout and spacing */}
        <div className="grid grid-cols-1 gap-4 mt-6 mb-8 md:grid-cols-2">
          {data.labels.map((trait, index) => (
            <AdjustmentIndicator
              key={trait}
              type={adjustmentTypes[index]}
              trait={trait}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CombinedTraitBarChart;
