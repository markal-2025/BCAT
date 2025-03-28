import { Chart as ChartJS, ArcElement, Tooltip, Legend, Chart } from "chart.js";
import { Doughnut } from "react-chartjs-2";

const CustomChart = ({
  score,
  colorCode,
  label,
}: {
  score: number;
  colorCode: string;
  label: string;
}) => {
  ChartJS.register(ArcElement, Tooltip, Legend);

  const data = {
    labels: [label, "Remaining"],
    datasets: [
      {
        data: [score, 100 - score], // Fill percentage and remaining
        backgroundColor: [colorCode, "#e0e0e0"], // Main color and light gray for remaining
        borderColor: [colorCode, "#e0e0e0"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: "70%",
  };

  const customPlugin = {
    id: "customTextInside",
    beforeDraw: (chart: Chart) => {
      const { width, height, ctx } = chart;
      ctx.save();
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#333";
      ctx.fillText(`${score.toFixed(2)}%`, width / 2, height / 2);
      ctx.restore();
    },
  };

  return (
    <div className="h-36 w-36">
      <Doughnut data={data} options={options} plugins={[customPlugin]} />
    </div>
  );
};

export default CustomChart;
