/** Returns Korean age band e.g. "20대 후반" — never exact birth year. */
export function formatAgeBand(birthYear: number, now = new Date()) {
  const age = now.getFullYear() - birthYear;
  if (age < 0 || age > 120) {
    return null;
  }

  const decade = Math.floor(age / 10) * 10;
  const remainder = age % 10;
  const phase = remainder <= 3 ? "초반" : remainder <= 6 ? "중반" : "후반";
  return `${decade}대 ${phase}`;
}

export function formatPublicAgeLabel(
  birthYear: number | null | undefined,
  showExactAge: boolean,
  now = new Date(),
) {
  if (!birthYear) {
    return null;
  }

  if (showExactAge) {
    const age = now.getFullYear() - birthYear;
    return `${age}세 (${birthYear}년생)`;
  }

  const band = formatAgeBand(birthYear, now);
  return band ? `${band}입니다` : null;
}
