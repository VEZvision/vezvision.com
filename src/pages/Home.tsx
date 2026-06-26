import "../styles/GridBackground.css";
import { lazy } from "react";
import Hero from "@/components/hero/Hero";
import FounderNote from "@/components/FounderNote";
import { CmsPage } from "@/pagekit";

const Benefits = lazy(() => import("@/components/benefits/Benefits"));
const Features = lazy(() => import("@/components/features/Features"));
const PotentialSection = lazy(
  () => import("@/components/potential/PotentialSection"),
);
const ProcessSection = lazy(
  () => import("@/components/process/ProcessSection"),
);
const AboutComparison = lazy(
  () => import("@/components/about/AboutComparison"),
);
const ProductsSection = lazy(
  () => import("@/components/products/ProductsSection"),
);
const NewsletterSection = lazy(
  () => import("@/components/newsletter/NewsletterSection"),
);
const ContactSection = lazy(
  () => import("@/components/contact/ContactSection"),
);

const HOME_SECTIONS = {
  hero: { Component: Hero, eager: true },
  founder_note: { Component: FounderNote, eager: true },
  benefits: { Component: Benefits, minHeight: "720px" },
  features: { Component: Features, minHeight: "680px" },
  potential: { Component: PotentialSection, minHeight: "760px" },
  process: { Component: ProcessSection, minHeight: "760px" },
  about_comparison: { Component: AboutComparison, minHeight: "680px" },
  products_teaser: { Component: ProductsSection, minHeight: "560px" },
  newsletter: { Component: NewsletterSection, minHeight: "420px" },
  contact: { Component: ContactSection, minHeight: "560px" },
} as const;

const HOME_FALLBACK = [
  "hero",
  "founder_note",
  "benefits",
  "features",
  "potential",
  "process",
  "about_comparison",
  "products_teaser",
  "newsletter",
  "contact",
] as const;

export default function Home() {
  return (
    <CmsPage
      pageKey="home"
      fallbackKeys={HOME_FALLBACK}
      sections={HOME_SECTIONS}
      shell={{ className: "home-page" }}
    />
  );
}
