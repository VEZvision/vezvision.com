import { Suspense, type ComponentType } from "react";

import type { SectionRegistryEntry } from "./types";
import { SectionLoader } from "@/components/loading";
import { ViewportSectionGate } from "./ViewportSectionGate";

export type ResolvedSection = SectionRegistryEntry & {
  key: string;
};

type PageSectionsProps = {
  sections: ResolvedSection[];
};

export function PageSections({ sections }: PageSectionsProps) {
  return (
    <>
      {sections.map(({ key, Component, eager, props, minHeight }) => {
        const Resolved = Component as ComponentType<Record<string, unknown>>;

        if (eager) {
          return <Resolved key={key} {...(props ?? {})} />;
        }

        return (
          <ViewportSectionGate key={key} minHeight={minHeight}>
            <Suspense fallback={<SectionLoader compact />}>
              <Resolved {...(props ?? {})} />
            </Suspense>
          </ViewportSectionGate>
        );
      })}
    </>
  );
}
