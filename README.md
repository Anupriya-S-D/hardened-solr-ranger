\# Hardened Apache Solr with Apache Ranger



Dockerized Apache Solr 8.11.2 environment integrated with Apache Ranger for centralized authorization and audit logging.



\## Features



\- Apache Solr 8.11.2

\- SolrCloud mode with ZooKeeper

\- Apache Ranger 2.8.0 Solr authorization plugin

\- Solr Basic Authentication

\- Ranger policy-based access control

\- Ranger audit logging

\- Persistent Solr data support

\- Redis-based Alpine base image

\- SBOM generation support

\- Reproducible Docker build

\- Custom Solr startup entrypoint



\## Architecture



The Solr container connects to:



\- ZooKeeper for SolrCloud configuration and cluster state

\- Apache Ranger Admin for authorization policies

\- Ranger Audit Solr for audit events



Authentication is handled by Solr BasicAuth, while authorization decisions are handled by the Ranger Solr plugin.



\## Build



```bash

docker build -t solr-hardened:8.11.2 .

