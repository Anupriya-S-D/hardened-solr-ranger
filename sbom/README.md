\# Software Bill of Materials (SBOM)



This directory contains Software Bill of Materials artifacts generated for the SecureSolr container image.



\## Files



\### sbom.cdx.json



CycloneDX SBOM containing the software component inventory of the container image.



This format can be imported into tools such as Dependency-Track for software composition analysis.



\### sbom.spdx.json



SPDX representation of the software component inventory.



The SPDX format provides an additional standardized representation of packages and dependencies included in the image.



\## Security Validation



SBOM generation is one part of the repository's security validation process.



The project also uses:



\- Dependency-Track for SBOM-based dependency analysis.

\- Grype for independent container vulnerability scanning.

\- Apache Ranger audit records for authorization validation.



The presence of an SBOM does not imply that all included components are vulnerability-free.



See `docs/validation.md` for the complete validation procedure and results.
