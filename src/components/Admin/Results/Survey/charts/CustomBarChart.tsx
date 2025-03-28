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
import { CompositeResult } from "../SurveyResults";

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CustomBarChart = ({
  compositeResult,
}: {
  compositeResult: CompositeResult;
}) => {
  const data = {
    labels: [""],
    datasets: [
      {
        label: "Current Result",
        data: [compositeResult.consonance],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Target",
        data: [compositeResult.resonance],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgba(53, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide the legend entirely
      },
      title: {
        display: true,
        text: "Alignment Comparison Chart",
      },
      tooltip: {
        callbacks: {
          // Custom tooltip to show values without labels
          title: function () {
            return "";
          },
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        min: -1,
        max: 1,
        beginAtZero: true, // This ensures the zero line is visible
        grid: {
          color: (context: any) => {
            if (context.tick.value === 0) {
              return "rgba(0, 0, 0, 0.5)"; // Darker line for zero
            }
            return "rgba(0, 0, 0, 0.1)";
          },
          lineWidth: (context: any) => {
            if (context.tick.value === 0) {
              return 1; // Thicker line for zero
            }
            return 1;
          },
        },
        ticks: {
          stepSize: 0.333,
          callback: (value: any) => {
            if (value === 0) return `Zero ${value}`;
            if (value > 0.666) return `Aligned ${value}`;
            if (value > 0.333) return `Somewhat Aligned ${value.toFixed(1)}`;
            if (value > 0) return `Unaligned ${value.toFixed(1)}`;
            if (value >= -0.333)
              return `Somewhat Misaligned ${value.toFixed(1)}`;
            if (value >= -0.666) return `Misaligned ${value.toFixed(1)}`;
          },
        },
      },
    },
  } as const;

  return (
    <div className="flex items-center justify-center w-full h-96">
      <Bar data={data} options={options} />
    </div>
  );
};

export default CustomBarChart;
