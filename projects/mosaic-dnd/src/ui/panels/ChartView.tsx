import { useEffect, useRef } from "react";
import {
  createChart,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

export function ChartView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    /* =========================
     * Create chart
     * ========================= */
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "#ffffff" },
        textColor: "#111827",
      },
      grid: {
        vertLines: { color: "#e5e7eb" },
        horzLines: { color: "#e5e7eb" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#d1d5db",
      },
      timeScale: {
        borderColor: "#d1d5db",
        timeVisible: true,
      },
    });

    /* =========================
     * Series (NEW API)
     * ========================= */
    const series = chart.addSeries(LineSeries, {
      color: "#2563eb",
      lineWidth: 2,
    });

    series.setData([
      { time: "2024-01-01", value: 100 },
      { time: "2024-01-02", value: 102 },
      { time: "2024-01-03", value: 101 },
      { time: "2024-01-04", value: 105 },
      { time: "2024-01-05", value: 103 },
    ]);

    chartRef.current = chart;
    seriesRef.current = series;

    /* =========================
     * Auto resize (Mosaic)
     * ========================= */
    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.resize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    });

    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
        }}
      />
    </div>
  );
}
