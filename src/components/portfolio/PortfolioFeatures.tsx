import {
  X,
  Clock,
  Check,
  DollarSign,
  Mail,
  Star,
  Layers,
  FileUser,
  Sparkles,
  ArrowUpRight,
  Code,
  Search,
  MessageSquare,
  Zap,
  GitBranch,
  Database,
} from "lucide-react";
import styles from "./PortfolioFeatures.module.css";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  SectionReveal,
  StaggerItem,
  StaggerReveal,
} from "@/components/ui/SectionReveal";
import logoNavbar from "@brand/wordmark-horizontal-dark.svg";

const CODE_LINES = [
  {
    num: "1",
    content: (
      <>
        <span className={styles.keyword}>def</span> __init_(self,
      </>
    ),
  },
  { num: "", content: "    activation_limit):" },
  { num: "2", content: "        self.activation_limit =" },
  { num: "3", content: "    activation_limit" },
  {
    num: "4",
    content: (
      <>
        {" "}
        self.current_mode = <span className={styles.string}>"idle"</span>
      </>
    ),
  },
  { num: "5", content: "" },
  {
    num: "",
    content: (
      <>
        <span className={styles.keyword}>def</span> evaluate_task(self,
        workload_value):
      </>
    ),
  },
  {
    num: "",
    content: <span style={{ opacity: 0.5 }}> if workload_value &gt;</span>,
  },
] as const;

const PortfolioFeatures = () => {
  const { language } = useLanguageContext();
  const isPl = language === "pl";
  const reducedMotion = useReducedMotion();

  return (
    <section
      className={`${styles.section} ${styles.motionZone} vez-decorative-motion`}
    >
      <div className={styles.container}>
        {/* Section Header */}
        <SectionReveal>
          <header className={styles.header}>
            <div className={styles.badge}>
              <Sparkles size={14} />
              {isPl ? "Zapowiedź realizacji" : "Case study preview"}
            </div>
            <h2 className={styles.sectionTitle}>
              {isPl
                ? "Jakie projekty będziemy tu pokazywać"
                : "What we will showcase here"}
            </h2>
            <p className={styles.sectionSubtitle}>
              {isPl
                ? "To będzie uporządkowane miejsce na wybrane realizacje, projekty demonstracyjne i studia przypadku. Każdy materiał pokaże rzeczywisty kontekst pracy."
                : "This will become a curated place for selected projects, demo work, and case studies. Each story will show the real context behind the work."}
            </p>
          </header>
        </SectionReveal>

        <div className={styles.grid}>
          {/* Top Row - 2 cards */}
          <StaggerReveal className={styles.topRow}>
            {/* Card 1: Checklist */}
            <StaggerItem className={styles.card}>
              <div
                className={styles.visualArea}
                aria-hidden="true"
                role="presentation"
              >
                <div className={styles.checklistContainer}>
                  {[
                    {
                      icon: X,
                      text: isPl ? "Problem i kontekst" : "Problem and context",
                      done: true,
                    },
                    {
                      icon: Sparkles,
                      text: isPl ? "Decyzje projektowe" : "Design decisions",
                      done: true,
                    },
                    {
                      icon: Clock,
                      text: isPl
                        ? "Wdrożenie i wnioski"
                        : "Delivery and learnings",
                      done: true,
                    },
                    {
                      icon: DollarSign,
                      text: isPl ? "Efekt biznesowy" : "Business outcome",
                      done: true,
                    },
                  ].map((item, i) => (
                    <div key={i} className={styles.checklistItem}>
                      <div className={styles.checklistLeft}>
                        <item.icon className={styles.checklistIcon} />
                        <span className={styles.checklistText}>
                          {item.text}
                        </span>
                      </div>
                      <Check
                        className={`${styles.checklistStatus} ${styles.checked}`}
                        size={16}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>
                  {isPl ? "Strony internetowe" : "Websites"}
                </h3>
                <p className={styles.description}>
                  {isPl
                    ? "Wybrane strony będziemy opisywać przez cel, strukturę treści, UX i sposób przygotowania do publikacji."
                    : "Selected websites will be described through their goal, content structure, UX decisions and launch preparation."}
                </p>
              </div>
            </StaggerItem>

            {/* Card 2: Floating Icons */}
            <StaggerItem className={styles.card}>
              <div
                className={styles.visualArea}
                aria-hidden="true"
                role="presentation"
              >
                <div className={styles.iconsContainer}>
                  <div className={styles.centerStar}>
                    <img
                      src={logoNavbar}
                      alt=""
                      width="838"
                      height="153"
                      className={styles.centerLogo}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  {[
                    Mail,
                    MessageSquare,
                    FileUser,
                    Layers,
                    Zap,
                    Code,
                    Sparkles,
                    Database,
                    GitBranch,
                    Star,
                    Search,
                    ArrowUpRight,
                  ].map((Icon, i) => (
                    <div key={i} className={styles.floatingIcon}>
                      <Icon size={18} />
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>
                  {isPl ? "Sklepy internetowe" : "E-commerce stores"}
                </h3>
                <p className={styles.description}>
                  {isPl
                    ? "Studia przypadku pokażą, jak projektujemy ścieżkę zakupową, katalog, płatności i podstawy dalszego rozwoju sprzedaży."
                    : "Case studies will show how we approach the buying journey, catalogue, payments and foundations for future sales growth."}
                </p>
              </div>
            </StaggerItem>
          </StaggerReveal>

          {/* Bottom Row - 3 cards */}
          <StaggerReveal className={styles.bottomRow}>
            {/* Card 3: AI Search */}
            <StaggerItem className={styles.card}>
              <div
                className={styles.visualArea}
                aria-hidden="true"
                role="presentation"
              >
                <div className={styles.searchContainer}>
                  <div className={styles.searchBar}>
                    <Search size={16} style={{ color: "#98a2b3" }} />
                    <span className={styles.searchInput}>
                      {isPl ? "Wyszukaj w projekcie..." : "Search the project..."}
                    </span>
                    <span className={styles.searchButton}>
                      {isPl ? "Szukaj" : "Search"}
                    </span>
                  </div>
                  <div className={styles.suggestions}>
                    {[
                      isPl
                        ? "Hipotezy i założenia projektu"
                        : "Project hypotheses and assumptions",
                      isPl
                        ? "Decyzje UX i architektura informacji"
                        : "UX decisions and information architecture",
                      isPl
                        ? "Wnioski po wdrożeniu..."
                        : "Post-launch learnings...",
                    ].map((text, i) => (
                      <div key={i} className={styles.suggestionItem}>
                        <div className={styles.suggestionLeft}>
                          <Sparkles className={styles.suggestionIcon} />
                          <span className={styles.suggestionText}>{text}</span>
                        </div>
                        <ArrowUpRight className={styles.suggestionArrow} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>
                  {isPl ? "Aplikacje webowe" : "Web applications"}
                </h3>
                <p className={styles.description}>
                  {isPl
                    ? "Pokażemy interfejsy, proces projektowania funkcji oraz decyzje techniczne, które wpływają na wygodę użytkowników."
                    : "We will show interfaces, feature-design decisions and technical choices that shape the user experience."}
                </p>
              </div>
            </StaggerItem>

            {/* Card 4: Code Editor */}
            <StaggerItem className={styles.card}>
              <div
                className={styles.visualArea}
                aria-hidden="true"
                role="presentation"
              >
                <div className={styles.codeContainer}>
                  <div className={styles.codeHeader}>
                    <div className={styles.codeDots}>
                      <span
                        className={`${styles.codeDot} ${styles.red}`}
                      ></span>
                      <span
                        className={`${styles.codeDot} ${styles.yellow}`}
                      ></span>
                      <span
                        className={`${styles.codeDot} ${styles.green}`}
                      ></span>
                    </div>
                    <div className={styles.codeTab}>
                      <Code size={12} />
                      <span>Code</span>
                      <span style={{ marginLeft: 4, opacity: 0.5 }}>
                        &lt;/&gt;
                      </span>
                    </div>
                  </div>
                  <div className={styles.codeBody}>
                    {CODE_LINES.map((line, i) => (
                      <div
                        key={i}
                        className={styles.codeLine}
                        style={
                          reducedMotion
                            ? undefined
                            : { animationDelay: `${i * 0.24}s` }
                        }
                      >
                        <span className={styles.lineNumber}>{line.num}</span>
                        <span
                          className={styles.lineContent}
                          style={
                            reducedMotion
                              ? undefined
                              : { animationDelay: `${i * 0.24 + 0.08}s` }
                          }
                        >
                          {line.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>
                  {isPl ? "Automatyzacje AI" : "AI automations"}
                </h3>
                <p className={styles.description}>
                  {isPl
                    ? "W realizacjach opiszemy konkretne procesy, ograniczenia, integracje i sposób kontroli jakości automatyzacji."
                    : "Future case studies will describe concrete processes, constraints, integrations and quality control for automation work."}
                </p>
              </div>
            </StaggerItem>

            {/* Card 5: Integrations - IMPROVED */}
            <StaggerItem className={styles.card}>
              <div
                className={styles.visualArea}
                aria-hidden="true"
                role="presentation"
              >
                <div className={styles.integrationsGrid}>
                  {/* Row 1 */}
                  <div className={styles.integrationIcon}>
                    <Layers size={24} />
                  </div>
                  <div
                    className={`${styles.integrationIcon} ${styles.featured}`}
                  >
                    <img
                      src={logoNavbar}
                      alt=""
                      width="838"
                      height="153"
                      className={styles.integrationLogo}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className={styles.integrationIcon}>
                    <GitBranch size={24} />
                  </div>

                  {/* Row 2 */}
                  <div className={styles.integrationIcon}>
                    <Database size={24} />
                  </div>
                  <div className={styles.integrationIcon}>
                    <MessageSquare size={24} />
                  </div>
                  <div className={styles.integrationIcon}>
                    <Code size={24} />
                  </div>
                </div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>
                  {isPl ? "Systemy dla firm" : "Business systems"}
                </h3>
                <p className={styles.description}>
                  {isPl
                    ? "Będziemy pokazywać projekty od problemu operacyjnego przez projekt procesu po działające narzędzie."
                    : "We will show projects from an operational problem through process design to a working tool."}
                </p>
              </div>
            </StaggerItem>
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
};

export default PortfolioFeatures;
