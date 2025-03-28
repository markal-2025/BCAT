import { Chart } from "chart.js";

export const chartToBase64 = (chart: Chart): string => {
  return chart.canvas.toDataURL("image/png");
};

// This is a workaround to render Chart.js in a hidden canvas
export const createOffscreenChart = (
  type: "doughnut" | "bar",
  data: any,
  options: any,
  width = 400,
  height = 400
): Chart => {
  const canvas = document.createElement("canvas");
  canvas.style.display = "none";
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const chart = new Chart(ctx, {
    type,
    data,
    options,
  });

  return chart;
};
