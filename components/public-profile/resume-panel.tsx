import {
  AwardIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  FileTextIcon,
  FolderKanbanIcon,
  GraduationCapIcon,
  ImagesIcon,
  LayersIcon,
  ListChecksIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
  WrenchIcon,
} from "lucide-react";

import { PortfolioSection } from "@/components/public-profile/portfolio-section";
import {
  publicSectionElementId,
  type PublicSection,
} from "@/lib/public-profile/sections";
import type { PublicProfileData } from "@/lib/public-profile/types";
import { CERTIFICATION_CATEGORIES } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";

const CARD = "rounded-2xl border bg-card p-5 shadow-sm";
const FIELD_LABEL =
  "flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase";
const PERIOD_CHIP =
  "shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground tabular-nums";
// `min-w-0` + `break-words` keep long unbroken names from widening the flex row.
const CARD_TITLE = "min-w-0 text-base font-semibold break-words";
const CARD_SUBTITLE = "mt-1 text-sm break-words text-muted-foreground";
const CARD_BODY =
  "mt-3 whitespace-pre-wrap text-sm leading-relaxed break-words";

const SECTION_ICONS: Record<
  number,
  React.ComponentType<{ className?: string }>
> = {
  2: BriefcaseIcon,
  3: GraduationCapIcon,
  4: AwardIcon,
  5: SparklesIcon,
  6: LayersIcon,
  7: FolderKanbanIcon,
  8: FileTextIcon,
  10: ImagesIcon,
};

export function ResumePanel({
  data,
  sections,
}: {
  data: PublicProfileData;
  sections: PublicSection[];
}) {
  return (
    <>
      {sections.map((section) => (
        <ProfileSection key={section.id} section={section}>
          {renderSectionBody(section.id, data)}
        </ProfileSection>
      ))}
      {/* Lets the nav rail highlight the last item once the page bottom is reached. */}
      <div id="profile-sections-end" aria-hidden className="h-px" />
    </>
  );
}

function ProfileSection({
  section,
  children,
}: {
  section: PublicSection;
  children: React.ReactNode;
}) {
  const Icon = SECTION_ICONS[section.id];
  const headingId = `${publicSectionElementId(section.id)}-heading`;

  return (
    <section
      id={publicSectionElementId(section.id)}
      data-step-id={section.id}
      tabIndex={-1}
      aria-labelledby={headingId}
      className="scroll-mt-20 focus-visible:outline-none"
    >
      <h2
        id={headingId}
        className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"
      >
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {Icon ? <Icon className="size-4" /> : null}
        </span>
        {section.label}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function renderSectionBody(stepId: number, data: PublicProfileData) {
  switch (stepId) {
    case 2:
      return <CareersSection careers={data.careers} />;
    case 3:
      return <EducationSection education={data.education} />;
    case 4:
      return <CertificationsSection certifications={data.certifications} />;
    case 5:
      return <ActivitiesSection activities={data.activities} />;
    case 6:
      return <SkillsSection skills={data.skills} />;
    case 7:
      return <ProjectsSection projects={data.projects} />;
    case 8:
      return <CoverLettersSection coverLetters={data.coverLetters} />;
    case 10:
      return <PortfolioSection items={data.portfolioItems} />;
    default:
      return null;
  }
}

function CareersSection({
  careers,
}: {
  careers: PublicProfileData["careers"];
}) {
  return (
    <>
      {careers.map((career) => (
        <article
          key={career.id}
          className={cn(CARD, "border-l-2 border-l-primary/40")}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className={CARD_TITLE}>{career.company}</h3>
            {career.period ? (
              <span className={PERIOD_CHIP}>{career.period}</span>
            ) : null}
          </div>
          {career.position ? (
            <p className={CARD_SUBTITLE}>{career.position}</p>
          ) : null}
          {career.description ? (
            <p className={CARD_BODY}>{career.description}</p>
          ) : null}
        </article>
      ))}
    </>
  );
}

function EducationSection({
  education,
}: {
  education: PublicProfileData["education"];
}) {
  return (
    <>
      {education.map((item) => (
        <article key={item.id} className={CARD}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className={CARD_TITLE}>{item.school}</h3>
            {item.period ? (
              <span className={PERIOD_CHIP}>{item.period}</span>
            ) : null}
          </div>
          {item.major ? <p className={CARD_SUBTITLE}>{item.major}</p> : null}
          {item.degree || item.status ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[item.degree, item.status].filter(Boolean).map((value) => (
                <span
                  key={value}
                  className="max-w-full rounded-full bg-muted px-2 py-0.5 text-xs break-words text-muted-foreground"
                >
                  {value}
                </span>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </>
  );
}

function CertificationsSection({
  certifications,
}: {
  certifications: PublicProfileData["certifications"];
}) {
  return (
    <>
      {CERTIFICATION_CATEGORIES.map((category) => {
        const items = certifications.filter(
          (cert) => (cert.category ?? "자격") === category,
        );
        if (items.length === 0) {
          return null;
        }

        return (
          <div key={category} className={CARD}>
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {category}
            </h3>
            <ul className="mt-3 space-y-2">
              {items.map((cert) => (
                <li
                  key={cert.id}
                  className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm"
                >
                  <span className="min-w-0 font-medium break-words">
                    {cert.name}
                  </span>
                  {cert.issuer || cert.acquired_date ? (
                    <span className="min-w-0 text-xs break-words text-muted-foreground">
                      {[cert.issuer, cert.acquired_date]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}

function ActivitiesSection({
  activities,
}: {
  activities: PublicProfileData["activities"];
}) {
  return (
    <>
      {activities.map((item) => (
        <article key={item.id} className={CARD}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className={CARD_TITLE}>{item.title}</h3>
            {item.period ? (
              <span className={PERIOD_CHIP}>{item.period}</span>
            ) : null}
          </div>
          {item.organization ? (
            <p className={CARD_SUBTITLE}>{item.organization}</p>
          ) : null}
          {item.description ? (
            <p className={CARD_BODY}>{item.description}</p>
          ) : null}
        </article>
      ))}
    </>
  );
}

function SkillsSection({ skills }: { skills: PublicProfileData["skills"] }) {
  return (
    <div className={CARD}>
      <ul className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li
            key={skill.id}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm font-medium"
          >
            {/* A bare text node in an inline-flex box cannot shrink; wrap it. */}
            <span className="min-w-0 break-words">{skill.name}</span>
            {skill.proficiency ? (
              <span className="shrink-0 text-xs font-normal text-muted-foreground">
                {skill.proficiency}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectsSection({
  projects,
}: {
  projects: PublicProfileData["projects"];
}) {
  return (
    <>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </>
  );
}

function ProjectCard({
  project,
}: {
  project: PublicProfileData["projects"][number];
}) {
  const situation = project.situation?.trim();
  const actions = project.actions?.trim();
  const results = project.results?.trim();
  const troubleshooting = project.troubleshooting?.trim();
  const hasBody = Boolean(situation || actions || results || troubleshooting);

  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <header className="border-b bg-muted/30 px-5 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className={cn(CARD_TITLE, "tracking-tight")}>{project.title}</h3>
          {project.period ? (
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {project.period}
            </span>
          ) : null}
        </div>
        {project.role ? <p className={CARD_SUBTITLE}>{project.role}</p> : null}
        {project.tech_stack.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {project.tech_stack.map((tech) => (
              <li
                key={tech}
                className="max-w-full rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium break-words text-primary"
              >
                {tech}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      {hasBody ? (
        <div className="space-y-4 px-5 py-5">
          <ProjectField
            icon={TargetIcon}
            label="상황 · 과제"
            value={situation}
          />
          <ProjectField
            icon={ListChecksIcon}
            label="수행 내용"
            value={actions}
          />

          {results ? (
            <div className="rounded-xl border border-brand-accent/30 bg-brand-accent/10 p-4">
              <p className={cn(FIELD_LABEL, "text-foreground/70")}>
                <TrendingUpIcon aria-hidden className="size-3.5" />
                성과
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed font-medium break-words">
                {results}
              </p>
            </div>
          ) : null}

          {troubleshooting ? (
            <div className="rounded-xl bg-muted/60 p-4">
              <p className={FIELD_LABEL}>
                <WrenchIcon aria-hidden className="size-3.5" />
                트러블슈팅
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed break-words text-muted-foreground">
                {troubleshooting}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function ProjectField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="min-w-0">
      <p className={FIELD_LABEL}>
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed break-words">
        {value}
      </p>
    </div>
  );
}

function CoverLettersSection({
  coverLetters,
}: {
  coverLetters: PublicProfileData["coverLetters"];
}) {
  return (
    <>
      {coverLetters.map((letter, index) => (
        <details
          key={letter.id}
          open={index === 0}
          className={cn("group", CARD)}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
            <h3 className="min-w-0 font-medium break-words">{letter.title}</h3>
            <ChevronDownIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
            />
          </summary>
          {letter.content ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 break-words text-muted-foreground">
              {letter.content}
            </p>
          ) : null}
        </details>
      ))}
    </>
  );
}
