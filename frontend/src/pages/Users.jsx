import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  ShieldCheck,
  User,
  Users as UsersIcon,
} from "lucide-react";

import { getPolicies } from "../services/rangerApi";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const policies = await getPolicies();

      const userMap = {};

      policies.forEach((policy) => {
        const resourceEntries = Object.entries(
          policy.resources || {}
        );

        const resource = resourceEntries
          .map(([name, config]) => {
            const values = config?.values?.join(", ") || "*";
            return `${name}: ${values}`;
          })
          .join(" · ");

        (policy.policyItems || []).forEach((item) => {
          const accesses = (item.accesses || [])
            .filter((access) => access.isAllowed)
            .map((access) => access.type);

          (item.users || []).forEach((username) => {
            if (!userMap[username]) {
              userMap[username] = {
                username,
                permissions: [],
              };
            }

            userMap[username].permissions.push({
              policy: policy.name,
              resource,
              accesses,
              delegateAdmin: item.delegateAdmin,
            });
          });
        });
      });

      setUsers(Object.values(userMap));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to retrieve Ranger users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const totalPermissions = users.reduce(
    (total, user) => total + user.permissions.length,
    0
  );

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">ACCESS MANAGEMENT</p>
          <h1>Users</h1>
          <p className="subtitle">
            Users and permissions derived from live Ranger policies
          </p>
        </div>

        <button
          className="refresh"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <section className="panel" style={{ marginBottom: "20px" }}>
          <strong style={{ color: "#d96b76" }}>
            Unable to retrieve Ranger users
          </strong>
          <p>{error}</p>
        </section>
      )}

      <section className="cards">
        <div className="status-card">
          <div className="card-icon good">
            <UsersIcon />
          </div>

          <div>
            <p>Policy Users</p>
            <h2>{users.length}</h2>
            <span>Users referenced by Ranger</span>
          </div>
        </div>

        <div className="status-card">
          <div className="card-icon">
            <ShieldCheck />
          </div>

          <div>
            <p>Permission Assignments</p>
            <h2>{totalPermissions}</h2>
            <span>Across active policies</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Ranger Access Matrix</h2>
            <p>
              Effective assignments represented in Ranger policy items
            </p>
          </div>
        </div>

        {loading && users.length === 0 ? (
          <p>Loading Ranger users...</p>
        ) : users.length === 0 ? (
          <p>No users were found in the Ranger policies.</p>
        ) : (
          <div className="user-list">
            {users.map((user) => (
              <div className="user-card" key={user.username}>
                <div className="user-header">
                  <div className="user-avatar">
                    <User size={20} />
                  </div>

                  <div>
                    <h3>{user.username}</h3>
                    <p>
                      {user.permissions.length} resource permission
                      {user.permissions.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <span className="badge green">ACTIVE</span>
                </div>

                <div className="user-permissions">
                  <div className="permission-row permission-head">
                    <span>Policy</span>
                    <span>Resource</span>
                    <span>Access</span>
                    <span>Delegated Admin</span>
                  </div>

                  {user.permissions.map((permission, index) => (
                    <div
                      className="permission-row"
                      key={`${user.username}-${permission.policy}-${index}`}
                    >
                      <strong>{permission.policy}</strong>

                      <span>{permission.resource}</span>

                      <div className="permission-tags">
                        {permission.accesses.map((access) => (
                          <span
                            className="permission-tag"
                            key={access}
                          >
                            {access}
                          </span>
                        ))}
                      </div>

                      <span>
                        {permission.delegateAdmin ? (
                          <span className="badge green">Yes</span>
                        ) : (
                          <span className="badge">No</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Users;