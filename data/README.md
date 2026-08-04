\# Demo Dataset



This directory contains sample data for validating the SecureSolr demonstration environment.



\## File



`sample-data.json`



The dataset contains five synthetic documents designed only for functional testing and demonstration.



No production, confidential, personal, or customer data is included.



\## Purpose



The sample dataset can be used to demonstrate:



\- Solr document indexing

\- Solr queries

\- Ranger query authorization

\- Ranger update authorization

\- Allowed and denied access decisions

\- Ranger audit generation

\- SecureSolr frontend collection monitoring



\## Target Collection



The demonstration environment uses:



`testcollection`



\## Example



An administrator with update permission can index the sample documents into Solr.



A restricted user such as `testuser` can then be used to demonstrate Ranger policy enforcement.



In the tested Ranger configuration:



\- `admin` can query and update the collection.

\- `testuser` can query the collection.

\- `testuser` cannot update the collection.



The restricted update attempt should therefore return HTTP 403 and generate a DENIED Ranger audit event.
