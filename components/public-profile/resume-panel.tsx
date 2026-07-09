import type { PublicProfileData } from "@/lib/public-profile/types";

export function ResumePanel({ data }: { data: PublicProfileData }) {
  const {
    profile,
    skills,
    projects,
    careers,
    education,
    certifications,
    coverLetters,
    enabledSections,
  } = data;

  const showCareers = enabledSections.includes("careers") && careers.length > 0;
  const showEducation =
    enabledSections.includes("education_certifications") &&
    (education.length > 0 || certifications.length > 0);
  const showCoverLetters =
    enabledSections.includes("cover_letters") && coverLetters.length > 0;

  const contactItems = [
    profile.birth_year ? `${profile.birth_year}년생` : null,
    profile.location,
    profile.public_email,
    profile.phone,
  ].filter((item): item is string => Boolean(item));

  const socialLinks = [
    { label: "GitHub", url: profile.github_url },
    { label: "LinkedIn", url: profile.linkedin_url },
    { label: "Blog", url: profile.blog_url },
  ].filter((link): link is { label: string; url: string } => Boolean(link.url));

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-start gap-4">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="size-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold">
              {profile.name.slice(0, 1)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">{profile.role_title}</p>
            <p className="mt-2 text-sm">@{profile.slug}</p>
          </div>
        </div>
        {profile.intro ? (
          <p className="leading-relaxed text-sm">{profile.intro}</p>
        ) : null}
        {contactItems.length > 0 || socialLinks.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {contactItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </section>

      {showCareers ? (
        <section className="space-y-3">
          <SectionHeading>경력</SectionHeading>
          {careers.map((career) => (
            <div key={career.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">
                  {career.company}
                  {career.position ? (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {career.position}
                    </span>
                  ) : null}
                </p>
                {career.period ? (
                  <span className="text-sm text-muted-foreground">
                    {career.period}
                  </span>
                ) : null}
              </div>
              {career.description ? (
                <p className="mt-2 whitespace-pre-wrap text-sm">
                  {career.description}
                </p>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {showEducation ? (
        <section className="space-y-3">
          <SectionHeading>학력 · 자격증</SectionHeading>
          {education.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">
                  {item.school}
                  {item.major ? (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {item.major}
                    </span>
                  ) : null}
                </p>
                {item.period ? (
                  <span className="text-sm text-muted-foreground">
                    {item.period}
                  </span>
                ) : null}
              </div>
              {item.degree || item.status ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {[item.degree, item.status].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
          ))}
          {certifications.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {certifications.map((cert) => (
                <li key={cert.id} className="flex flex-wrap gap-x-2">
                  <span className="font-medium">{cert.name}</span>
                  {cert.issuer ? (
                    <span className="text-muted-foreground">{cert.issuer}</span>
                  ) : null}
                  {cert.acquired_date ? (
                    <span className="text-muted-foreground">
                      · {cert.acquired_date}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section>
        <SectionHeading>기술 스택</SectionHeading>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="rounded-full bg-secondary px-3 py-1 text-sm"
            >
              {skill.name}
              {skill.proficiency ? ` · ${skill.proficiency}` : ""}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading>프로젝트</SectionHeading>
        {projects.map((project) => (
          <details key={project.id} className="rounded-lg border p-4">
            <summary className="cursor-pointer font-medium">
              {project.title}
              {project.period ? (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {project.period}
                </span>
              ) : null}
            </summary>
            <dl className="mt-4 space-y-3 text-sm">
              <ProjectField label="역할" value={project.role} />
              <ProjectField label="기술" value={project.tech_stack} />
              <ProjectField label="상황/과제" value={project.situation} />
              <ProjectField label="수행 내용" value={project.actions} />
              <ProjectField label="성과" value={project.results} />
              <ProjectField
                label="트러블슈팅"
                value={project.troubleshooting}
              />
            </dl>
          </details>
        ))}
      </section>

      {showCoverLetters ? (
        <section className="space-y-3">
          <SectionHeading>자기소개서</SectionHeading>
          {coverLetters.map((letter) => (
            <details key={letter.id} className="rounded-lg border p-4">
              <summary className="cursor-pointer font-medium">
                {letter.title}
              </summary>
              {letter.content ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                  {letter.content}
                </p>
              ) : null}
            </details>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
  );
}

function ProjectField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value?.trim()) {
    return null;
  }

  return (
    <div>
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}
