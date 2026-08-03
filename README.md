# SecureSolr — Hardened Apache Solr with Apache Ranger

SecureSolr is a Dockerized Apache Solr security demonstration integrating Apache Solr 8.11.2 with Apache Ranger 2.8.0 for centralized authorization, policy enforcement, and audit logging.

The project also includes a React-based security dashboard for monitoring SolrCloud, collections, Ranger policies, users, permissions, and authorization audit events.

## Features

### Solr Security

- Apache Solr 8.11.2
- SolrCloud mode
- ZooKeeper integration
- Solr Basic Authentication
- Apache Ranger 2.8.0 authorization plugin
- Ranger policy-based access control
- Ranger audit logging
- Custom hardened Docker image
- Persistent Solr data support

### Security Hardening

- Hardened Solr container configuration
- Dependency/JAR hardening support
- CycloneDX SBOM
- SPDX SBOM
- Example security configuration without production credentials
- Secrets excluded from Git

### SecureSolr Dashboard

React + Vite frontend providing:

- Security Dashboard
- Collections monitoring
- SolrCloud cluster monitoring
- Apache Ranger policy viewer
- Ranger audit log viewer
- User and permission overview
- Allowed/Denied authorization statistics
- Audit search and filtering
- Live data retrieved from Solr and Ranger APIs

## Architecture

```text
                    SecureSolr React Frontend
                              |
                +-------------+-------------+
                |                           |
                v                           v
        Hardened Apache Solr          Apache Ranger Admin
            8.11.2                        2.8.0
                |                           |
                | Ranger Solr Plugin       | Policies
                +-------------+-------------+
                              |
                       Authorization
                              |
                    +---------+---------+
                    |                   |
                 ALLOW                DENY
                    |                   |
                    +---------+---------+
                              |
                        Ranger Audit
                              |
                    Ranger Audit Solr
```

Authentication is performed by Solr BasicAuth.

Authorization decisions are performed by the Apache Ranger Solr plugin.

Authorization events are written to Ranger Audit Solr and displayed by the SecureSolr frontend.

## Tested Authorization Flow

The demo includes a Ranger collection policy where:

- `admin` has query and update permissions.
- `testuser` has query permission.
- `testuser` does not have update permission.

The integration was tested end-to-end.

### Allowed request

```text
User: testuser
Resource: testcollection
Action: query
Ranger Policy: 4
Result: ALLOWED
```

### Denied request

```text
User: testuser
Resource: testcollection
Action: update
Ranger Policy: none
Result: DENIED (HTTP 403)
```

Both authorization decisions are recorded by Ranger Audit and displayed in the SecureSolr Audit Logs page.

## Project Structure

```text
.
├── Dockerfile
├── harden-jars.sh
├── log4j2.xml
├── security.example.json
├── solr-entrypoint.sh
├── solr.xml
├── start-services.sh
├── sbom.cdx.json
├── sbom.spdx.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Collections.jsx
    │   │   ├── Cluster.jsx
    │   │   ├── RangerPolicies.jsx
    │   │   ├── AuditLogs.jsx
    │   │   └── Users.jsx
    │   └── services/
    │       ├── solrApi.js
    │       ├── rangerApi.js
    │       └── auditApi.js
    ├── package.json
    └── vite.config.js
```

## Prerequisites

The following tools are required:

- Docker
- Node.js
- npm

The full security demonstration also requires an Apache Ranger 2.8.0 environment containing:

- Ranger Admin
- Ranger database
- Ranger ZooKeeper
- Ranger Audit Solr

The development environment for this project uses locally built patched Ranger 2.8.0 images. Those Ranger images are currently an external prerequisite and are not built by this repository.

## Build the Hardened Solr Image

From the repository root:

```bash
docker build -t solr-hardened:8.11.2 .
```

## Security Configuration

Copy the example configuration before running the Solr container:

```bash
cp security.example.json security.json
```

Configure the required Solr users locally.

Do not commit `security.json`, `.env` files, passwords, API tokens, or other credentials.

The repository `.gitignore` excludes local security configuration.

## Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the local URL for the SecureSolr dashboard.

## Frontend API Configuration

During development, the Vite server proxies requests to the local Solr and Ranger services.

Credentials should be supplied through environment variables rather than hardcoded into frontend source files.

Example environment variables:

```text
SOLR_USER=<solr-admin-user>
SOLR_PASSWORD=<solr-admin-password>

RANGER_USER=<ranger-admin-user>
RANGER_PASSWORD=<ranger-admin-password>
```

Do not commit the real `.env` file.

## Dashboard Pages

### Dashboard

Displays:

- SolrCloud health
- Live nodes
- Collections
- Ranger status
- Ranger policy version
- Recent authorization activity

### Collections

Displays live Solr collection information including:

- Collection name
- Document count
- Shards
- Replication factor
- ConfigSet
- Replica state
- Leader information
- Collection health

### Cluster

Displays:

- Live Solr nodes
- Cluster health
- Shards
- Replicas
- Leaders
- Core information

### Ranger Policies

Retrieves Ranger policies from the Ranger Admin REST API and displays:

- Policy name
- Resource type
- Resource
- Users
- Allowed actions
- Policy status

### Audit Logs

Retrieves Ranger authorization events and displays:

- User
- Resource
- Action
- Policy
- Result
- Client IP
- Timestamp
- Allowed/Denied statistics

### Users

Builds a permission overview from Ranger policies showing which resources and actions are available to each user.

## Production Frontend Build

Create an optimized frontend build with:

```bash
cd frontend
npm run build
```

The production assets are generated under:

```text
frontend/dist/
```

## SBOM

The repository includes Software Bill of Materials files in two formats:

```text
sbom.cdx.json
sbom.spdx.json
```

These can be used with vulnerability-management tools such as Dependency-Track.

## Security Notes

This repository intentionally does not contain plaintext production credentials.

Do not commit:

```text
security.json
.env
.env.*
password files
API tokens
private keys
```

Use example configuration files and environment variables when sharing or deploying the project.

## Demonstration

A typical security demonstration is:

```text
1. Start the Ranger infrastructure.
2. Start the hardened Solr container.
3. Start the SecureSolr React frontend.
4. Open Ranger Policies and verify the collection policy.
5. Query testcollection as testuser.
6. Ranger allows the query.
7. Attempt an update as testuser.
8. Ranger denies the update with HTTP 403.
9. Open Audit Logs.
10. Verify both ALLOWED and DENIED authorization events.
```

This demonstrates the complete security path:

```text
Authentication
      ↓
Solr BasicAuth
      ↓
Apache Ranger
      ↓
Policy Enforcement
      ↓
ALLOW / DENY
      ↓
Ranger Audit
      ↓
SecureSolr Dashboard
```

## Current Limitation

The custom patched Apache Ranger 2.8.0 Docker images used by the development environment are currently external to this repository.

Therefore, this repository reproduces the hardened Solr image and SecureSolr frontend, while an existing compatible Ranger 2.8.0 environment is required for the complete Ranger integration demonstration.