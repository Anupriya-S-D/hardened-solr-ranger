\# SecureSolr Architecture



\## Overview



SecureSolr is a security-focused Apache Solr environment that combines Solr Basic Authentication with Apache Ranger policy-based authorization and centralized audit logging.



A React-based frontend provides visibility into the SolrCloud environment, Ranger policies, users, permissions, and authorization events.



\## Architecture



```text

&#x20;                SecureSolr React Frontend

&#x20;                          |

&#x20;         +----------------+----------------+

&#x20;         |                                 |

&#x20;         v                                 v

&#x20;Hardened Apache Solr                 Apache Ranger Admin

&#x20;      8.11.2                              2.8.0

&#x20;         |                                   |

&#x20;         | BasicAuth                         | Policies

&#x20;         |                                   |

&#x20;         +---------- Ranger Plugin -----------+

&#x20;                          |

&#x20;                   Authorization

&#x20;                          |

&#x20;                +---------+---------+

&#x20;                |                   |

&#x20;              ALLOW                DENY

&#x20;                |                   |

&#x20;                +---------+---------+

&#x20;                          |

&#x20;                     Ranger Audit

&#x20;                          |

&#x20;                   Audit Solr

```



\## Components



\### Hardened Apache Solr



Apache Solr 8.11.2 runs inside a custom Docker image.



Responsibilities include:



\- document indexing

\- search and query processing

\- SolrCloud operation

\- Basic Authentication

\- Ranger authorization integration



\### Solr BasicAuth



Solr BasicAuth authenticates users before authorization is evaluated.



Authentication answers:



> Who is the user?



Credentials are stored locally and are not committed to this repository.



\### Apache Ranger



Apache Ranger 2.8.0 provides centralized authorization.



Ranger determines:



\- which users can access a resource

\- which actions are permitted

\- which actions must be denied



\### Ranger Solr Plugin



The Ranger Solr authorization plugin connects Solr authorization requests to the Ranger policy engine.



Authorization answers:



> Is this authenticated user permitted to perform this action on this resource?



\### Ranger Admin



Ranger Admin stores and manages the authorization policies used by the Solr Ranger plugin.



The demonstration Ranger service is:



```text

solr10

```



\### Ranger Audit



Authorization decisions are recorded as Ranger audit events.



Audit information includes:



\- user

\- resource

\- action

\- result

\- policy

\- client information

\- event time



\### Ranger Audit Solr



Ranger audit events are stored in a dedicated Solr collection and queried by the SecureSolr frontend.



\### SecureSolr Frontend



The frontend is implemented using React and Vite.



It provides pages for:



\- Dashboard

\- Collections

\- Cluster

\- Ranger Policies

\- Audit Logs

\- Users



The frontend communicates with Solr and Ranger APIs through Vite development proxies.



\## Authorization Flow



```text

Client Request

&#x20;     |

&#x20;     v

Solr BasicAuth

&#x20;     |

&#x20;     | authenticated user

&#x20;     v

Ranger Solr Plugin

&#x20;     |

&#x20;     v

Ranger Policy Engine

&#x20;     |

&#x20;  +--+--+

&#x20;  |     |

ALLOW   DENY

&#x20;  |     |

&#x20;  +--+--+

&#x20;     |

&#x20;     v

Ranger Audit

&#x20;     |

&#x20;     v

Audit Solr

&#x20;     |

&#x20;     v

SecureSolr Audit Dashboard

```



\## Demonstrated Policy



The demonstration collection is:



```text

testcollection

```



The tested authorization configuration provides:



| User | Query | Update |

|---|---|---|

| admin | Allowed | Allowed |

| testuser | Allowed | Denied |



This allows the project to demonstrate both successful and rejected authorization requests.



\## Security Design



The repository does not intentionally store plaintext production credentials.



Sensitive local configuration is excluded using `.gitignore`.



Safe configuration templates are provided through:



```text

security.example.json

frontend/.env.example

```



\## SBOM and Dependency Visibility



Software Bill of Materials artifacts are provided in:



\- CycloneDX format

\- SPDX format



These artifacts support dependency inventory and vulnerability-management workflows.



\## External Ranger Infrastructure



The development environment uses patched Apache Ranger 2.8.0 Docker images for:



\- Ranger Admin

\- Ranger database

\- ZooKeeper

\- Ranger Audit Solr



These custom Ranger images are currently external prerequisites and are not built by this repository.
