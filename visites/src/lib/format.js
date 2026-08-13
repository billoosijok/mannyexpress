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
