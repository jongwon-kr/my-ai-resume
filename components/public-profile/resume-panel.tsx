import type { PublicProfileData } from "@/lib/public-profile/types";

export function ResumePanel({ data }: { data: PublicProfileData }) {
  const { profile, skills, projects } = data;

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
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          기술 스택
        </h2>
        <div className="flex flex-wrap gap-2">
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          프로젝트
        </h2>
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
              <ProjectField label="트러블슈팅" value={project.troubleshooting} />
            </dl>
          </details>
        ))}
      </section>
    </div>
  );
}

function ProjectField({ label, value }: { label: string; value: string | null }) {
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
