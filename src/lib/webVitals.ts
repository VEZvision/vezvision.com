import type { Metric } from "web-vitals";

function sendToAnalytics(metric: Metric): void {
  if (!import.meta.env.PROD || !import.meta.env.VITE_GA_ID) return;

  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
    .gtag;
  if (typeof gtag !== "function") return;

  gtag("event", metric.name, {
    event_category: "Web Vitals",
    event_label: metric.id,
    value: Math.round(
      metric.name === "CLS" ? metric.value * 1000 : metric.value,
    ),
    non_interaction: true,
    metric_rating: metric.rating,
    metric_delta: Math.round(
      metric.name === "CLS" ? metric.delta * 1000 : metric.delta,
    ),
  });
}

export async function initWebVitalsReporting(): Promise<void> {
  if (!import.meta.env.PROD || !import.meta.env.VITE_GA_ID) return;

  const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import("web-vitals");
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
