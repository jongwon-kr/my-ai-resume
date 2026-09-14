import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";

import { getResumeSectionVisibility } from "@/lib/resume/section-visibility";
import { getPublicContentStepOrder } from "@/lib/resume/section-order";
import type { ResumePdfInput } from "@/lib/resume/pdf/types";

const ACCENT_COLOR = "#1e3a5f";

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKR",
    fontSize: 10,
    lineHeight: 1.5,
    padding: 40,
    color: "#111827",
  },
  header: {
    marginBottom: 20,
  },
  headerIdentity: {
    marginBottom: 10,
  },
  headerLine: {
    marginBottom: 6,
  },
  name: {
    fontSize: 21,
    fontWeight: 700,
    lineHeight: 1.8,
    color: ACCENT_COLOR,
  },
  role: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 1.6,
  },
  slug: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.5,
    marginBottom: 2,
  },
  intro: {
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 1.6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    color: "#6b7280",
    fontSize: 9,
  },
  section: {
    marginTop: 18,
  },
  sectionHeading: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: ACCENT_COLOR,
    letterSpacing: 0.5,
  },
  sectionAccentBar: {
    marginTop: 4,
    width: 28,
    height: 2,
    backgroundColor: ACCENT_COLOR,
  },
  entryCard: {
    marginBottom: 14,
  },
  entryCardAccented: {
    borderLeftWidth: 2,
    borderLeftColor: ACCENT_COLOR,
    paddingLeft: 10,
  },
  entryHeader: {
    marginBottom: 6,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.6,
    marginBottom: 3,
  },
  entrySubtitle: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
    marginBottom: 2,
  },
  entryPeriod: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  labeledBlock: {
    marginTop: 6,
  },
  labelBadge: {
    fontSize: 8,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 2,
  },
  labelContent: {
    fontSize: 9,
    lineHeight: 1.65,
    color: "#111827",
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skill: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 9,
  },
  certRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 6,
  },
  certName: {
    fontSize: 9,
    fontWeight: 700,
  },
  certMeta: {
    fontSize: 9,
    color: "#6b7280",
  },
  link: {
    color: ACCENT_COLOR,
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
  },
});

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionAccentBar} />
      </View>
      {children}
    </View>
  );
}

function LabeledBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.labeledBlock}>
      <Text style={styles.labelBadge}>{label}</Text>
      <Text style={styles.labelContent}>{value}</Text>
    </View>
  );
}

function LabeledField({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) {
    return null;
  }

  return <LabeledBlock label={label} value={value.trim()} />;
}

export function ResumePdfDocument({ slug, values }: ResumePdfInput) {
  const visibility = getResumeSectionVisibility(values);
  const orderedContentStepIds = getPublicContentStepOrder(values.section_order);
  const age = values.birth_year
    ? new Date().getFullYear() - values.birth_year
    : null;

  const contactItems = [
    age ? `${age}세 (${values.birth_year}년생)` : null,
    values.location?.trim() || null,
    values.public_email?.trim() || null,
    values.phone?.trim() || null,
  ].filter((item): item is string => Boolean(item));

  const socialLinks = (values.profile_links ?? [])
    .filter((link) => link.label?.trim() && link.url?.trim())
    .map((link) => ({
      label: link.label.trim(),
      url: link.url!.trim(),
    }));

  return (
    <Document title={`${values.name || slug} - Resume`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerIdentity}>
            <View style={styles.headerLine}>
              <Text style={styles.name}>{values.name || "이름 미입력"}</Text>
            </View>
            {values.role_title ? (
              <View style={styles.headerLine}>
                <Text style={styles.role}>{values.role_title}</Text>
              </View>
            ) : null}
            <Text style={styles.slug}>@{slug}</Text>
          </View>
          {values.intro ? (
            <Text style={styles.intro}>{values.intro}</Text>
          ) : null}
          {contactItems.length > 0 || socialLinks.length > 0 ? (
            <View style={styles.contactRow}>
              {contactItems.map((item) => (
                <Text key={item}>{item}</Text>
              ))}
              {socialLinks.map((link) => (
                <Link key={link.label} src={link.url!} style={styles.link}>
                  {link.label}
                </Link>
              ))}
            </View>
          ) : null}
        </View>

        {orderedContentStepIds.map((stepId) => {
          switch (stepId) {
            case 2:
              return visibility.showCareers ? (
                <SectionBlock key={stepId} title="경력">
                  {(values.careers ?? []).map((career) => (
                    <View
                      key={career.id ?? career.company}
                      style={[styles.entryCard, styles.entryCardAccented]}
                    >
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>{career.company}</Text>
                        {career.position ? (
                          <Text style={styles.entrySubtitle}>
                            {career.position}
                          </Text>
                        ) : null}
                        {career.period ? (
                          <Text style={styles.entryPeriod}>
                            {career.period}
                          </Text>
                        ) : null}
                      </View>
                      <LabeledField
                        label="업무 내용"
                        value={career.description}
                      />
                    </View>
                  ))}
                </SectionBlock>
              ) : null;
            case 3:
              return visibility.showEducation ? (
                <SectionBlock key={stepId} title="학력">
                  {(values.education ?? []).map((item) => {
                    const degreeStatus = [item.degree, item.status]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <View
                        key={item.id ?? item.school}
                        style={styles.entryCard}
                      >
                        <View style={styles.entryHeader}>
                          <Text style={styles.entryTitle}>{item.school}</Text>
                          {item.major ? (
                            <Text style={styles.entrySubtitle}>
                              {item.major}
                            </Text>
                          ) : null}
                          {degreeStatus ? (
                            <Text style={styles.entrySubtitle}>
                              {degreeStatus}
                            </Text>
                          ) : null}
                          {item.period ? (
                            <Text style={styles.entryPeriod}>
                              {item.period}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </SectionBlock>
              ) : null;
            case 4:
              return visibility.showCertifications ? (
                <SectionBlock key={stepId} title="자격 · 어학 · 수상">
                  {(values.certifications ?? []).map((cert) => (
                    <View key={cert.id ?? cert.name} style={styles.certRow}>
                      <Text style={styles.certName}>
                        {cert.category ? `[${cert.category}] ` : ""}
                        {cert.name}
                      </Text>
                      {cert.issuer ? (
                        <Text style={styles.certMeta}>· {cert.issuer}</Text>
                      ) : null}
                      {cert.acquired_date ? (
                        <Text style={styles.certMeta}>
                          · {cert.acquired_date}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </SectionBlock>
              ) : null;
            case 5:
              return visibility.showActivities ? (
                <SectionBlock key={stepId} title="경험 / 활동 / 교육">
                  {(values.activities ?? []).map((item) => (
                    <View key={item.id ?? item.title} style={styles.entryCard}>
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>{item.title}</Text>
                        {item.organization ? (
                          <Text style={styles.entrySubtitle}>
                            {item.organization}
                          </Text>
                        ) : null}
                        {item.period ? (
                          <Text style={styles.entryPeriod}>{item.period}</Text>
                        ) : null}
                      </View>
                      <LabeledField label="설명" value={item.description} />
                    </View>
                  ))}
                </SectionBlock>
              ) : null;
            case 6:
              return (
                <SectionBlock key={stepId} title="기술 스택">
                  <View style={styles.skillWrap}>
                    {(values.skills ?? []).map((skill) => (
                      <Text key={skill.id ?? skill.name} style={styles.skill}>
                        {skill.name}
                        {skill.proficiency ? ` · ${skill.proficiency}` : ""}
                      </Text>
                    ))}
                  </View>
                </SectionBlock>
              );
            case 7:
              return (
                <SectionBlock key={stepId} title="프로젝트">
                  {(values.projects ?? []).map((project) => (
                    <View
                      key={project.id ?? project.title}
                      style={[styles.entryCard, styles.entryCardAccented]}
                    >
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>{project.title}</Text>
                        {project.period ? (
                          <Text style={styles.entryPeriod}>
                            {project.period}
                          </Text>
                        ) : null}
                      </View>
                      <LabeledField label="역할" value={project.role} />
                      <LabeledField
                        label="사용 기술"
                        value={project.tech_stack?.join(", ")}
                      />
                      <LabeledField
                        label="상황 / 과제"
                        value={project.situation}
                      />
                      <LabeledField label="수행 내용" value={project.actions} />
                      <LabeledField label="성과" value={project.results} />
                      <LabeledField
                        label="트러블슈팅"
                        value={project.troubleshooting}
                      />
                    </View>
                  ))}
                </SectionBlock>
              );
            case 8:
              return visibility.showCoverLetters ? (
                <SectionBlock key={stepId} title="자기소개서">
                  {(values.cover_letters ?? []).map((letter) => (
                    <View
                      key={letter.id ?? letter.title}
                      style={styles.entryCard}
                    >
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>{letter.title}</Text>
                      </View>
                      <LabeledField label="내용" value={letter.content} />
                    </View>
                  ))}
                </SectionBlock>
              ) : null;
            default:
              return null;
          }
        })}

        <Text style={styles.footer} fixed>
          CloneCV · clonecv.com/@{slug}
        </Text>
      </Page>
    </Document>
  );
}
