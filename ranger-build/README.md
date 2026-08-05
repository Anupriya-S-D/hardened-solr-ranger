\# Apache Ranger 2.8.0 Patched Image Builds



This directory contains the Docker build definitions used for the Apache Ranger components required by SecureSolr.



\## Components



The build definitions cover:



\- Ranger Admin

\- Ranger Database

\- Ranger Audit Solr

\- Ranger ZooKeeper



The resulting images are referenced by the root `docker-compose.yml`:



\- `apache/ranger:2.8.0-patched`

\- `apache/ranger-db:2.8.0-patched`

\- `apache/ranger-solr:2.8.0-patched`

\- `apache/ranger-zk:2.8.0-patched`



\## Security Hardening



These Dockerfiles were used to create patched Ranger 2.8.0 images with updated operating-system packages and selected dependency replacements.



The patched dependencies include components used by Ranger Admin, Ranger Solr, and Ranger ZooKeeper.



\## Third-Party Build Artifacts



Third-party JAR files, JDK archives, ZIP files, and other downloaded binary dependencies are intentionally excluded from this Git repository.



The `.gitignore` file excludes:



```text

ranger-build/\*\*/\*.jar

ranger-build/\*\*/\*.tar.gz

ranger-build/\*\*/\*.zip
