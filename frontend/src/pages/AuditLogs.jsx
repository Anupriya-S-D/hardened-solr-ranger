import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

import { getAuditLogs } from "../services/auditApi";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAuditLogs(100);

      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to retrieve audit logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const allowedCount = logs.filter(
    (log) => Number(log.result) === 1
  ).length;

  const deniedCount = logs.filter(
    (log) => Number(log.result) !== 1
  ).length;

  const actions = useMemo(
    () => [...new Set(logs.map((log) => log.action).filter(Boolean))],
    [logs]
  );

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return logs.filter((log) => {
      const allowed = Number(log.result) === 1;

      const matchesSearch =
        !term ||
        [
          log.reqUser,
          log.resource,
          log.resType,
          log.action,
          log.cliIP,
          log.policy,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(term)
        );

      const matchesResult =
        resultFilter === "all" ||
        (resultFilter === "allowed" && allowed) ||
        (resultFilter === "denied" && !allowed);

      const matchesAction =
        actionFilter === "all" ||
        log.action === actionFilter;

      return matchesSearch && matchesResult && matchesAction;
    });
  }, [logs, search, resultFilter, actionFilter]);

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">APACHE RANGER</p>
          <h1>Audit Logs</h1>
          <p className="subtitle">
            Live authorization activity recorded by Ranger
          </p>
        </div>

        <button
          className="refresh"
          onClick={loadLogs}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <section className="panel audit-error">
          <strong>Unable to retrieve Ranger audit logs</strong>
          <p>{error}</p>
        </section>
      )}

      <section className="cards">
        <AuditCard
          icon={<FileText />}
          title="Total Events"
          value={total}
          detail="Stored Ranger audit events"
        />

        <AuditCard
          icon={<CheckCircle2 />}
          title="Loaded"
          value={logs.length}
          detail="Newest events displayed"
        />

        <AuditCard
          icon={<ShieldCheck />}
          title="Allowed"
          value={allowedCount}
          detail="Allowed in loaded events"
          good
        />

        <AuditCard
          icon={<ShieldX />}
          title="Denied"
          value={deniedCount}
          detail="Denied in loaded events"
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Authorization Events</h2>
            <p>
              Showing {filteredLogs.length} of {logs.length} loaded events
            </p>
          </div>
        </div>

        <div className="audit-filters">
          <div className="audit-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search user, resource, IP or policy..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={resultFilter}
            onChange={(event) =>
              setResultFilter(event.target.value)
            }
          >
            <option value="all">All results</option>
            <option value="allowed">Allowed</option>
            <option value="denied">Denied</option>
          </select>

          <select
            value={actionFilter}
            onChange={(event) =>
              setActionFilter(event.target.value)
            }
          >
            <option value="all">All actions</option>

            {actions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        {loading && logs.length === 0 ? (
          <p>Loading Ranger audit events...</p>
        ) : filteredLogs.length === 0 ? (
          <div className="audit-empty">
            No audit events match the selected filters.
          </div>
        ) : (
          <div className="live-audit-table">
            <div className="live-audit-row live-audit-head">
              <span>Time</span>
              <span>User</span>
              <span>Resource</span>
              <span>Type</span>
              <span>Action</span>
              <span>Policy</span>
              <span>Client IP</span>
              <span>Result</span>
            </div>

            {filteredLogs.map((log) => (
              <AuditRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function AuditCard({ icon, title, value, detail, good }) {
  return (
    <div className="status-card">
      <div className={`card-icon ${good ? "good" : ""}`}>
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

function AuditRow({ log }) {
  const allowed = Number(log.result) === 1;

  return (
    <div className="live-audit-row">
      <span className="audit-time">
        {formatDate(log.evtTime)}
      </span>

      <strong>{log.reqUser || "—"}</strong>

      <span>{log.resource || "—"}</span>

      <span>{log.resType || "—"}</span>

      <span className="action">
        {log.action || log.access || "—"}
      </span>

      <span>
        {log.policy !== undefined ? `#${log.policy}` : "—"}
      </span>

      <span>{log.cliIP || "—"}</span>

      <span
        className={
          allowed
            ? "result allowed"
            : "result denied"
        }
      >
        {allowed ? (
          <ShieldCheck size={14} />
        ) : (
          <ShieldX size={14} />
        )}

        {allowed ? "Allowed" : "Denied"}
      </span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default AuditLogs;