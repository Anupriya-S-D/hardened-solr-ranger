export async function getAuditLogs(rows = 100) {
  const params = new URLSearchParams({
    q: "*:*",
    rows: String(rows),
    sort: "evtTime desc",
    wt: "json",
  });

  const response = await fetch(
    `/audit-api/solr/ranger_audits/select?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Unable to retrieve Ranger audit logs (${response.status})`
    );
  }

  const data = await response.json();

  return {
    total: data.response?.numFound ?? 0,
    logs: data.response?.docs ?? [],
  };
}