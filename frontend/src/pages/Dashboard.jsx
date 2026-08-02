import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Database,
  RefreshCw,
  Server,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

import {
  getClusterStatus,
  getDocumentCount,
} from "../services/solrApi";

import {
  getPolicies,
  getService,
} from "../services/rangerApi";

import { getAuditLogs } from "../services/auditApi";

function Dashboard() {
  const [cluster, setCluster] = useState(null);
  const [documentCount, setDocumentCount] = useState(0);

  const [rangerService, setRangerService] = useState(null);
  const [policies, setPolicies] = useState([]);

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        clusterData,
        serviceData,
        policyData,
        auditData,
      ] = await Promise.all([
        getClusterStatus(),
        getService(),
        getPolicies(),
        getAuditLogs(5),
      ]);

      setCluster(clusterData);
      setRangerService(serviceData);
      setPolicies(policyData);
      setAuditLogs(auditData.logs);
      setAuditTotal(auditData.total);

      const collectionNames = Object.keys(
        clusterData.cluster?.collections || {}
      );

      let totalDocuments = 0;

      for (const collectionName of collectionNames) {
        try {
          const count = await getDocumentCount(collectionName);
          totalDocuments += count;
        } catch (err) {
          console.error(
            `Unable to retrieve document count for ${collectionName}`,
            err
          );
        }
      }

      setDocumentCount(totalDocuments);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to load dashboard information"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const collections = cluster?.cluster?.collections || {};
  const liveNodes = cluster?.cluster?.live_nodes || [];

  const collectionEntries = Object.entries(collections);

  const clusterHealthy =
    liveNodes.length > 0 &&
    collectionEntries.every(
      ([, collection]) => collection.health === "GREEN"
    );

  const rangerActive = rangerService?.isEnabled === true;

  const firstCollection = collectionEntries[0];

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">SOLR SECURITY PLATFORM</p>

          <h1>Security Dashboard</h1>

          <p className="subtitle">
            Apache Solr 8.11.2 + Apache Ranger 2.8.0
          </p>
        </div>

        <button
          className="refresh"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw size={17} />

          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <section
          className="panel"
          style={{ marginBottom: "20px" }}
        >
          <strong style={{ color: "#d96b76" }}>
            Unable to load dashboard
          </strong>

          <p>{error}</p>
        </section>
      )}

      <section className="cards">
        <StatusCard
          icon={<Activity />}
          title="SolrCloud"
          value={clusterHealthy ? "Healthy" : "Attention"}
          detail={
            clusterHealthy
              ? "Cluster operational"
              : "Check cluster status"
          }
          good={clusterHealthy}
        />

        <StatusCard
          icon={<Server />}
          title="Live Nodes"
          value={liveNodes.length}
          detail={`${liveNodes.length} node${
            liveNodes.length === 1 ? "" : "s"
          } connected`}
          good={liveNodes.length > 0}
        />

        <StatusCard
          icon={<Database />}
          title="Collections"
          value={collectionEntries.length}
          detail={`${documentCount} indexed document${
            documentCount === 1 ? "" : "s"
          }`}
        />

        <StatusCard
          icon={<ShieldCheck />}
          title="Ranger"
          value={rangerActive ? "Active" : "Disabled"}
          detail={
            rangerService
              ? `Policy engine v${
                  rangerService.policyVersion ?? "—"
                }`
              : "Waiting for Ranger"
          }
          good={rangerActive}
        />
      </section>

      <section className="grid">
        <div className="panel cluster-panel">
          <div className="panel-heading">
            <div>
              <h2>SolrCloud Overview</h2>
              <p>Current cluster configuration</p>
            </div>

            <span
              className={
                clusterHealthy
                  ? "badge green"
                  : "badge"
              }
            >
              {clusterHealthy ? "HEALTHY" : "ATTENTION"}
            </span>
          </div>

          {firstCollection ? (
            <>
              <div className="collection">
                <div className="collection-icon">
                  <Database />
                </div>

                <div className="collection-info">
                  <h3>{firstCollection[0]}</h3>

                  <p>
                    {
                      Object.keys(
                        firstCollection[1].shards || {}
                      ).length
                    }{" "}
                    shard
                    {Object.keys(
                      firstCollection[1].shards || {}
                    ).length === 1
                      ? ""
                      : "s"}
                    {" · "}
                    Replication factor{" "}
                    {firstCollection[1].replicationFactor ??
                      "—"}
                  </p>
                </div>

                <div className="collection-stat">
                  <strong>{documentCount}</strong>
                  <span>Documents</span>
                </div>

                <span
                  className={
                    firstCollection[1].health === "GREEN"
                      ? "badge green"
                      : "badge"
                  }
                >
                  {firstCollection[1].health || "UNKNOWN"}
                </span>
              </div>

              <div className="nodes">
                <div>
                  <span className="label">
                    Live Nodes
                  </span>

                  <strong className="online">
                    {liveNodes.length}
                  </strong>
                </div>

                <div>
                  <span className="label">
                    ConfigSet
                  </span>

                  <strong>
                    {firstCollection[1].configName || "—"}
                  </strong>
                </div>

                <div>
                  <span className="label">
                    Shard Health
                  </span>

                  <strong
                    className={
                      firstCollection[1].health === "GREEN"
                        ? "online"
                        : ""
                    }
                  >
                    {firstCollection[1].health || "UNKNOWN"}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <p>No Solr collections found.</p>
          )}
        </div>

        <div className="panel ranger-panel">
          <div className="panel-heading">
            <div>
              <h2>Apache Ranger</h2>
              <p>Authorization engine</p>
            </div>

            <ShieldCheck className="large-icon" />
          </div>

          <div className="ranger-row">
            <span>Service</span>

            <strong>
              {rangerService?.displayName ||
                rangerService?.name ||
                "—"}
            </strong>
          </div>

          <div className="ranger-row">
            <span>Policy Version</span>

            <strong>
              {rangerService?.policyVersion ?? "—"}
            </strong>
          </div>

          <div className="ranger-row">
            <span>Active Policies</span>

            <strong>{policies.length}</strong>
          </div>

          <div className="ranger-row">
            <span>Authorization</span>

            <strong
              className={rangerActive ? "online" : ""}
            >
              {rangerActive ? "Enabled" : "Disabled"}
            </strong>
          </div>

          <div className="ranger-row">
            <span>Audit Events</span>

            <strong>{auditTotal}</strong>
          </div>
        </div>
      </section>

      <section className="panel audit-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent Ranger Audit Activity</h2>

            <p>
              Latest live authorization decisions
            </p>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <p>No Ranger audit events available.</p>
        ) : (
          <div className="audit-table">
            <div className="audit-row table-head">
              <span>User</span>
              <span>Resource</span>
              <span>Action</span>
              <span>Policy</span>
              <span>Result</span>
            </div>

            {auditLogs.map((log) => (
              <AuditRow
                key={log.id}
                user={log.reqUser}
                resource={log.resource}
                action={log.action || log.access}
                policy={log.policy}
                allowed={Number(log.result) === 1}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function StatusCard({
  icon,
  title,
  value,
  detail,
  good,
}) {
  return (
    <div className="status-card">
      <div
        className={`card-icon ${good ? "good" : ""}`}
      >
        {icon}
      </div>

      <div>
        <p>{title}</p>

        <h2>{value}</h2>

        <span>{detail}</span>
      </div>
    </div>
  );
}

function AuditRow({
  user,
  resource,
  action,
  policy,
  allowed,
}) {
  return (
    <div className="audit-row">
      <strong>{user || "—"}</strong>

      <span>{resource || "—"}</span>

      <span className="action">
        {action || "—"}
      </span>

      <span>
        {policy !== undefined ? `#${policy}` : "—"}
      </span>

      <span
        className={
          allowed
            ? "result allowed"
            : "result denied"
        }
      >
        {allowed ? (
          <ShieldCheck size={15} />
        ) : (
          <ShieldX size={15} />
        )}

        {allowed ? "Allowed" : "Denied"}
      </span>
    </div>
  );
}

export default Dashboard;