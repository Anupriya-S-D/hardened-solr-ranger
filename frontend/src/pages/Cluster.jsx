import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Database,
  RefreshCw,
  Server,
  ShieldCheck,
  Waypoints,
} from "lucide-react";

import { getClusterStatus } from "../services/solrApi";

function Cluster() {
  const [clusterData, setClusterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCluster = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getClusterStatus();
      setClusterData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to retrieve SolrCloud status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCluster();
  }, [loadCluster]);

  const collections = clusterData?.cluster?.collections || {};
  const liveNodes = clusterData?.cluster?.live_nodes || [];

  const clusterStats = useMemo(() => {
    let shards = 0;
    let replicas = 0;
    let activeReplicas = 0;

    Object.values(collections).forEach((collection) => {
      Object.values(collection.shards || {}).forEach((shard) => {
        shards += 1;

        Object.values(shard.replicas || {}).forEach((replica) => {
          replicas += 1;

          if (replica.state === "active") {
            activeReplicas += 1;
          }
        });
      });
    });

    return {
      shards,
      replicas,
      activeReplicas,
    };
  }, [collections]);

  const healthy =
    liveNodes.length > 0 &&
    Object.values(collections).every(
      (collection) => collection.health === "GREEN"
    );

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">SOLRCLOUD</p>

          <h1>Cluster</h1>

          <p className="subtitle">
            Live SolrCloud nodes, shards and replica topology
          </p>
        </div>

        <button
          className="refresh"
          onClick={loadCluster}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <section className="panel cluster-error">
          <strong>Unable to retrieve SolrCloud status</strong>
          <p>{error}</p>
        </section>
      )}

      <section className="cards">
        <ClusterCard
          icon={<Activity />}
          title="Cluster Health"
          value={healthy ? "GREEN" : "ATTENTION"}
          detail={
            healthy
              ? "Cluster operational"
              : "Cluster requires attention"
          }
          good={healthy}
        />

        <ClusterCard
          icon={<Server />}
          title="Live Nodes"
          value={liveNodes.length}
          detail={`${liveNodes.length} node${
            liveNodes.length === 1 ? "" : "s"
          } connected`}
          good={liveNodes.length > 0}
        />

        <ClusterCard
          icon={<Database />}
          title="Shards"
          value={clusterStats.shards}
          detail="Logical SolrCloud shards"
        />

        <ClusterCard
          icon={<Waypoints />}
          title="Replicas"
          value={clusterStats.replicas}
          detail={`${clusterStats.activeReplicas} active`}
          good={
            clusterStats.replicas > 0 &&
            clusterStats.activeReplicas === clusterStats.replicas
          }
        />
      </section>

      <section className="cluster-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Live Nodes</h2>
              <p>Currently registered SolrCloud nodes</p>
            </div>

            <span className="badge green">
              {liveNodes.length} ONLINE
            </span>
          </div>

          {loading && !clusterData ? (
            <p>Loading nodes...</p>
          ) : liveNodes.length === 0 ? (
            <p>No live Solr nodes were reported.</p>
          ) : (
            <div className="node-list">
              {liveNodes.map((node, index) => (
                <div className="node-card" key={node}>
                  <div className="node-icon">
                    <Server size={18} />
                  </div>

                  <div className="node-info">
                    <strong>Solr Node {index + 1}</strong>
                    <span>{node}</span>
                  </div>

                  <span className="node-status">
                    <span className="status-dot"></span>
                    Online
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Cluster Summary</h2>
              <p>Current SolrCloud configuration</p>
            </div>

            <ShieldCheck className="large-icon" />
          </div>

          <div className="cluster-summary-row">
            <span>Collections</span>
            <strong>{Object.keys(collections).length}</strong>
          </div>

          <div className="cluster-summary-row">
            <span>Live Nodes</span>
            <strong>{liveNodes.length}</strong>
          </div>

          <div className="cluster-summary-row">
            <span>Total Shards</span>
            <strong>{clusterStats.shards}</strong>
          </div>

          <div className="cluster-summary-row">
            <span>Total Replicas</span>
            <strong>{clusterStats.replicas}</strong>
          </div>

          <div className="cluster-summary-row">
            <span>Active Replicas</span>
            <strong className="online">
              {clusterStats.activeReplicas}
            </strong>
          </div>

          <div className="cluster-summary-row">
            <span>Status</span>
            <strong className={healthy ? "online" : ""}>
              {healthy ? "Healthy" : "Attention"}
            </strong>
          </div>
        </div>
      </section>

      <section className="panel cluster-topology-panel">
        <div className="panel-heading">
          <div>
            <h2>Cluster Topology</h2>
            <p>Collections, shards, replicas and leaders</p>
          </div>
        </div>

        {Object.keys(collections).length === 0 ? (
          <p>No collection topology available.</p>
        ) : (
          <div className="topology-list">
            {Object.entries(collections).map(
              ([collectionName, collection]) => (
                <div
                  className="topology-collection"
                  key={collectionName}
                >
                  <div className="topology-collection-header">
                    <div className="topology-title">
                      <div className="topology-icon">
                        <Database size={17} />
                      </div>

                      <div>
                        <strong>{collectionName}</strong>
                        <span>
                          ConfigSet: {collection.configName || "—"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={
                        collection.health === "GREEN"
                          ? "badge green"
                          : "badge"
                      }
                    >
                      {collection.health || "UNKNOWN"}
                    </span>
                  </div>

                  <div className="topology-shards">
                    {Object.entries(collection.shards || {}).map(
                      ([shardName, shard]) => (
                        <div
                          className="topology-shard"
                          key={shardName}
                        >
                          <div className="topology-shard-header">
                            <div>
                              <strong>{shardName}</strong>
                              <span>
                                {shard.range || "No range"}
                              </span>
                            </div>

                            <span
                              className={
                                shard.state === "active"
                                  ? "badge green"
                                  : "badge"
                              }
                            >
                              {shard.state?.toUpperCase() ||
                                "UNKNOWN"}
                            </span>
                          </div>

                          {Object.entries(
                            shard.replicas || {}
                          ).map(([replicaName, replica]) => {
                            const isLeader =
                              replica.leader === "true" ||
                              replica.leader === true;

                            return (
                              <div
                                className="topology-replica"
                                key={replicaName}
                              >
                                <div>
                                  <span className="topology-label">
                                    Replica
                                  </span>
                                  <strong>{replicaName}</strong>
                                </div>

                                <div>
                                  <span className="topology-label">
                                    Core
                                  </span>
                                  <strong>{replica.core}</strong>
                                </div>

                                <div>
                                  <span className="topology-label">
                                    Type
                                  </span>
                                  <strong>{replica.type}</strong>
                                </div>

                                <div>
                                  <span className="topology-label">
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
                                  <span className="topology-label">
                                    Role
                                  </span>

                                  <strong>
                                    {isLeader ? "Leader" : "Replica"}
                                  </strong>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </>
  );
}

function ClusterCard({ icon, title, value, detail, good }) {
  return (
    <div className="status-card">
      <div className={`card-icon ${good ? "good" : ""}`}>
        {icon}
      </div>

      <div>
        <p>{title}</p>
        <h2 className={good ? "online" : ""}>{value}</h2>
        <span>{detail}</span>
      </div>
    </div>
  );
}

export default Cluster;