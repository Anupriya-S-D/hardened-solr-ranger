import { useCallback, useEffect, useState } from "react";
import {
  Database,
  FileText,
  Layers,
  RefreshCw,
  Server,
  ShieldCheck,
} from "lucide-react";

import { getCollectionDetails } from "../services/solrApi";

function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCollectionDetails();
      setCollections(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to retrieve collections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const totalDocuments = collections.reduce(
    (sum, collection) => sum + collection.documentCount,
    0
  );

  const totalShards = collections.reduce(
    (sum, collection) => sum + collection.shardCount,
    0
  );

  const totalReplicas = collections.reduce(
    (sum, collection) => sum + collection.replicaCount,
    0
  );

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">SOLRCLOUD</p>
          <h1>Collections</h1>
          <p className="subtitle">
            Live collection configuration and index status
          </p>
        </div>

        <button
          className="refresh"
          onClick={loadCollections}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <section className="panel collection-error">
          <strong>Unable to retrieve Solr collections</strong>
          <p>{error}</p>
        </section>
      )}

      <section className="cards">
        <CollectionCard
          icon={<Database />}
          title="Collections"
          value={collections.length}
          detail="SolrCloud collections"
        />

        <CollectionCard
          icon={<FileText />}
          title="Documents"
          value={totalDocuments}
          detail="Indexed documents"
        />

        <CollectionCard
          icon={<Layers />}
          title="Shards"
          value={totalShards}
          detail="Total logical shards"
        />

        <CollectionCard
          icon={<Server />}
          title="Replicas"
          value={totalReplicas}
          detail="Active replica definitions"
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Collection Overview</h2>
            <p>Configuration retrieved directly from SolrCloud</p>
          </div>
        </div>

        {loading && collections.length === 0 ? (
          <p>Loading Solr collections...</p>
        ) : collections.length === 0 ? (
          <p>No collections found.</p>
        ) : (
          <div className="collections-table">
            <div className="collections-row collections-head">
              <span>Collection</span>
              <span>Documents</span>
              <span>Shards</span>
              <span>Replicas</span>
              <span>Replication</span>
              <span>ConfigSet</span>
              <span>Health</span>
            </div>

            {collections.map((collection) => (
              <div className="collections-row" key={collection.name}>
                <div className="collection-name-cell">
                  <div className="small-collection-icon">
                    <Database size={16} />
                  </div>

                  <strong>{collection.name}</strong>
                </div>

                <span>{collection.documentCount}</span>
                <span>{collection.shardCount}</span>
                <span>{collection.replicaCount}</span>
                <span>{collection.replicationFactor}</span>
                <span>{collection.configName}</span>

                <span>
                  <span
                    className={
                      collection.health === "GREEN"
                        ? "badge green"
                        : "badge"
                    }
                  >
                    {collection.health === "GREEN" && (
                      <ShieldCheck size={12} />
                    )}

                    {collection.health}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {collections.map((collection) => (
        <CollectionDetails
          key={collection.name}
          collection={collection}
        />
      ))}
    </>
  );
}

function CollectionDetails({ collection }) {
  return (
    <section className="panel collection-detail-panel">
      <div className="panel-heading">
        <div>
          <h2>{collection.name}</h2>
          <p>Shard and replica topology</p>
        </div>

        <span
          className={
            collection.health === "GREEN"
              ? "badge green"
              : "badge"
          }
        >
          {collection.health}
        </span>
      </div>

      <div className="shard-list">
        {Object.entries(collection.shards).map(
          ([shardName, shard]) => (
            <div className="shard-card" key={shardName}>
              <div className="shard-heading">
                <div>
                  <strong>{shardName}</strong>
                  <span>{shard.range || "No range"}</span>
                </div>

                <span
                  className={
                    shard.state === "active"
                      ? "badge green"
                      : "badge"
                  }
                >
                  {shard.state?.toUpperCase() || "UNKNOWN"}
                </span>
              </div>

              <div className="replica-list">
                {Object.entries(shard.replicas || {}).map(
                  ([replicaName, replica]) => (
                    <div
                      className="replica-row"
                      key={replicaName}
                    >
                      <div>
                        <span className="replica-label">
                          Replica
                        </span>

                        <strong>{replicaName}</strong>
                      </div>

                      <div>
                        <span className="replica-label">
                          Core
                        </span>

                        <strong>{replica.core}</strong>
                      </div>

                      <div>
                        <span className="replica-label">
                          Type
                        </span>

                        <strong>{replica.type}</strong>
                      </div>

                      <div>
                        <span className="replica-label">
                          State
                        </span>

                        <strong
                          className={
                            replica.state === "active"
                              ? "online"
                              : ""
                          }
                        >
                          {replica.state}
                        </strong>
                      </div>

                      <div>
                        <span className="replica-label">
                          Role
                        </span>

                        <strong>
                          {replica.leader === "true" ||
                          replica.leader === true
                            ? "Leader"
                            : "Replica"}
                        </strong>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

function CollectionCard({ icon, title, value, detail }) {
  return (
    <div className="status-card">
      <div className="card-icon">{icon}</div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <span>{detail}</span>
      </div>
    </div>
  );
}

export default Collections;