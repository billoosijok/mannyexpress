import { parseDateKey } from "./calendar";

/** French month and weekday names come out lowercase from toLocaleDateString. */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Shows the surveyed date if it was filled in, otherwise the save date. */
export function formatVisitDate(visit) {
  if (visit.dateVisite) {
    const [year, month, day] = visit.dateVisite.split("-");
    if (year && month && day) return `${day}/${month}/${year}`;
    return visit.dateVisite;
  }
  const created = visit.createdAt?.toDate?.();
  return created ? created.toLocaleDateString("fr-FR") : "";
}

/** Calendar title: "Août 2026". */
export function formatMonthLabel(monthStart) {
  return capitalize(
    monthStart.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
  );
}

/** Heading above a day's entries: "Jeudi 13 août 2026". */
export function formatDayLabel(dateKey) {
  const date = parseDateKey(dateKey);
  if (!date) return dateKey ?? "";
  return capitalize(
    date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );
}

/** Compact date for the upcoming list: "jeu. 13 août". */
export function formatShortDay(dateKey) {
  const date = parseDateKey(dateKey);
  if (!date) return dateKey ?? "";
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
