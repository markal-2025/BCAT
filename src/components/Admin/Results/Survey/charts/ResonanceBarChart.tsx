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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ResonanceBarChart = ({
  compositeResult,
}: {
  compositeResult: CompositeResult;
}) => {
  const data = {
    labels: ["Resonance"],
    datasets: [
      {
        label: "Current Result",
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
      legend: { display: false },
      title: { display: true, text: "Resonance" },
      tooltip: {
        callbacks: {
          title: () => "Resonance",
          label: (context: any) =>
            `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        min: -1,
        max: 1,
        beginAtZero: true,
        grid: {
          color: (context: any) =>
            context.tick.value === 0
              ? "rgba(0, 0, 0, 0.5)"
              : "rgba(0, 0, 0, 0.1)",
          lineWidth: (context: any) => (context.tick.value === 0 ? 1 : 1),
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
    <div className="w-full h-96">
      <Bar data={data} options={options} />
    </div>
  );
};

export default ResonanceBarChart;
