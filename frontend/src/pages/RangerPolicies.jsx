import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import {
  getPolicies,
  getService,
} from "../services/rangerApi";

function RangerPolicies() {
  const [policies, setPolicies] = useState([]);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRangerData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [policyData, serviceData] = await Promise.all([
        getPolicies(),
        getService(),
      ]);

      setPolicies(policyData);
      setService(serviceData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to connect to Apache Ranger");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRangerData();
  }, [loadRangerData]);

  const activePolicies = policies.filter(
    (policy) => policy.isEnabled
  ).length;

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">APACHE RANGER</p>
          <h1>Ranger Policies</h1>
          <p className="subtitle">
            Live authorization policies protecting Solr resources
          </p>
        </div>

        <button
          className="refresh"
          onClick={loadRangerData}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <section className="panel" style={{ marginBottom: "20px" }}>
          <strong style={{ color: "#d96b76" }}>
            Unable to retrieve Ranger data
          </strong>
          <p>{error}</p>
        </section>
      )}

      <section className="cards">
        <StatusCard
          title="Ranger Service"
          value={service?.displayName || service?.name || "—"}
          detail={service?.type || "Solr"}
        />

        <StatusCard
          title="Policy Version"
          value={service?.policyVersion ?? "—"}
          detail="Current Ranger version"
        />

        <StatusCard
          title="Active Policies"
          value={activePolicies}
          detail={`${policies.length} total policies`}
        />

        <StatusCard
          title="Service Status"
          value={service?.isEnabled ? "Enabled" : "Disabled"}
          detail="Ranger authorization"
          good={service?.isEnabled}
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Authorization Policies</h2>
            <p>
              Policies retrieved directly from Ranger service{" "}
              <strong>{service?.name || "solr10"}</strong>
            </p>
          </div>

          {service?.isEnabled ? (
            <span className="badge green">
              <ShieldCheck size={12} />
              ACTIVE
            </span>
          ) : (
            <span className="badge">
              <ShieldAlert size={12} />
              DISABLED
            </span>
          )}
        </div>

        {loading && policies.length === 0 ? (
          <p>Loading Ranger policies...</p>
        ) : (
          <div className="policy-table">
            <div className="policy-row policy-head">
              <span>Policy</span>
              <span>Resource</span>
              <span>Users</span>
              <span>Access</span>
              <span>Audit</span>
              <span>Status</span>
            </div>

            {policies.map((policy) => {
              const resources = Object.entries(
                policy.resources || {}
              )
                .map(([name, config]) => {
                  const values = config?.values?.join(", ") || "*";
                  return `${name}: ${values}`;
                })
                .join(" · ");

              const users = [
                ...new Set(
                  (policy.policyItems || []).flatMap(
                    (item) => item.users || []
                  )
                ),
              ];

              const accesses = [
                ...new Set(
                  (policy.policyItems || []).flatMap((item) =>
                    (item.accesses || [])
                      .filter((access) => access.isAllowed)
                      .map((access) => access.type)
                  )
                ),
              ];

              return (
                <div className="policy-row" key={policy.id}>
                  <div>
                    <strong>{policy.name}</strong>
                    <small>Policy #{policy.id}</small>
                  </div>

                  <span>{resources || "—"}</span>

                  <span>
                    {users.length ? users.join(", ") : "—"}
                  </span>

                  <span>
                    {accesses.length
                      ? accesses.join(", ")
                      : "—"}
                  </span>

                  <span>
                    {policy.isAuditEnabled ? (
                      <span className="badge green">Enabled</span>
                    ) : (
                      "Disabled"
                    )}
                  </span>

                  <span>
                    {policy.isEnabled ? (
                      <span className="badge green">Active</span>
                    ) : (
                      <span className="badge">Disabled</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function StatusCard({ title, value, detail, good }) {
  return (
    <div className="status-card">
      <div>
        <p>{title}</p>
        <h2 className={good ? "online" : ""}>{value}</h2>
        <span>{detail}</span>
      </div>
    </div>
  );
}

export default RangerPolicies;