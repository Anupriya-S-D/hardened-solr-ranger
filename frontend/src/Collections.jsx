import { Database } from "lucide-react";

function Collections() {
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">SOLR MANAGEMENT</p>
          <h1>Collections</h1>
          <p className="subtitle">
            Manage and monitor SolrCloud collections
          </p>
        </div>
      </header>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Solr Collections</h2>
            <p>1 collection available</p>
          </div>
        </div>

        <div className="collection">
          <div className="collection-icon">
            <Database />
          </div>

          <div className="collection-info">
            <h3>testcollection</h3>
            <p>1 shard · Replication factor 1 · NRT</p>
          </div>

          <div className="collection-stat">
            <strong>0</strong>
            <span>Documents</span>
          </div>

          <span className="badge green">ACTIVE</span>
        </div>
      </section>
    </>
  );
}

export default Collections;