export async function getClusterStatus() {
  const response = await fetch(
    "/solr-api/admin/collections?action=CLUSTERSTATUS&wt=json"
  );

  if (!response.ok) {
    throw new Error(
      `Solr request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function getDocumentCount(collection) {
  const response = await fetch(
    `/solr-api/${encodeURIComponent(collection)}/select?q=*:*&rows=0&wt=json`
  );

  if (!response.ok) {
    throw new Error(
      `Unable to query ${collection}: ${response.status}`
    );
  }

  const data = await response.json();

  return data.response?.numFound ?? 0;
}
export async function getCollectionDetails() {
  const data = await getClusterStatus();

  const collections = data.cluster?.collections || {};
  const result = [];

  for (const [name, collection] of Object.entries(collections)) {
    let documentCount = 0;

    try {
      documentCount = await getDocumentCount(name);
    } catch (error) {
      console.error(`Unable to get document count for ${name}`, error);
    }

    const shards = collection.shards || {};

    const replicas = Object.values(shards).flatMap((shard) =>
      Object.values(shard.replicas || {})
    );

    result.push({
      name,
      health: collection.health || "UNKNOWN",
      configName: collection.configName || "—",
      replicationFactor: collection.replicationFactor || "—",
      shardCount: Object.keys(shards).length,
      replicaCount: replicas.length,
      documentCount,
      shards,
    });
  }

  return result;
}