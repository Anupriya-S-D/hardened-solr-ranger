export async function getPolicies() {
  const response = await fetch(
    "/ranger-api/service/public/v2/api/policy?serviceName=solr10"
  );

  if (!response.ok) {
    throw new Error(
      `Unable to retrieve Ranger policies (${response.status})`
    );
  }

  return response.json();
}

export async function getService() {
  const response = await fetch(
    "/ranger-api/service/public/v2/api/service/name/solr10"
  );

  if (!response.ok) {
    throw new Error(
      `Unable to retrieve Ranger service (${response.status})`
    );
  }

  return response.json();
}