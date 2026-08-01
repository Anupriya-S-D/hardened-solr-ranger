#!/bin/sh
# ---------------------------------------------------------------------------
# harden-jars.sh — resolve the CVEs reported against the third-party JARs that
# Apache Solr 10.0.0 bundles, by upgrading each affected library IN PLACE to a
# patched upstream release from Maven Central.
#
# Policy (deliberate):
#   * No library is removed and no module is dropped — every artifact stays,
#     just at a fixed version. The superseded (version-named) jar is deleted
#     only as the mechanical second half of an in-place upgrade of the SAME
#     artifact, never to make a finding "disappear".
#   * No VEX / suppression is used; findings are resolved by real upgrades.
#   * Every download is verified against Maven Central's published .sha1 before
#     the old jar is removed. Any 404, network error, or checksum mismatch
#     aborts the build (set -e), so a partial/broken distribution is never
#     baked into an image.
#
# Run inside the build with DIST pointing at the unpacked distribution root.
# ---------------------------------------------------------------------------
set -eu

DIST="${DIST:-/dist/solr-10.0.0}"
BASE="https://repo1.maven.org/maven2"

# upgrade <old-relative-path> <group/as/path> <artifact> <version> [classifier]
upgrade() {
  old="$DIST/$1"; group="$2"; art="$3"; ver="$4"; cls="${5:-}"
  if [ -n "$cls" ]; then file="$art-$ver-$cls.jar"; else file="$art-$ver.jar"; fi
  dir="$(dirname "$old")"
  url="$BASE/$group/$art/$ver/$file"

  [ -f "$old" ] || { echo "ABORT: expected bundled jar not found: $old"; exit 1; }
  echo ">> $(basename "$old")  ->  $file"
  curl -fsSL "$url"      -o "$dir/$file"
  curl -fsSL "$url.sha1" -o /tmp/sha1.txt
  expected="$(tr -d ' \t\r\n' < /tmp/sha1.txt)"
  actual="$(sha1sum "$dir/$file" | awk '{print $1}')"
  if [ "$expected" != "$actual" ]; then
    echo "ABORT: SHA-1 mismatch for $file (expected=$expected actual=$actual)"; exit 1
  fi
  rm -f "$old"            # drop the superseded version — in-place upgrade, same artifact
}

W=server/solr-webapp/webapp/WEB-INF/lib   # Solr web application classpath
SE=server/lib                              # Jetty server libs
SX=server/lib/ext                          # Jetty server "ext" libs

# === Jackson — CVE-2026-54512 / CVE-2026-54513 (PolymorphicTypeValidator bypass) ===
# databind carries the CVEs; core + annotations are bumped with it so the
# jackson family stays version-aligned (required within a 2.x minor).
upgrade $W/jackson-databind-2.20.0.jar                          com/fasterxml/jackson/core       jackson-databind                          2.21.4
upgrade $W/jackson-core-2.20.0.jar                              com/fasterxml/jackson/core       jackson-core                              2.21.4
upgrade $W/jackson-annotations-2.20.jar                         com/fasterxml/jackson/core       jackson-annotations                       2.21
upgrade $W/jackson-dataformat-cbor-2.20.0.jar                   com/fasterxml/jackson/dataformat jackson-dataformat-cbor                   2.21.4
upgrade $W/jackson-dataformat-smile-2.20.0.jar                  com/fasterxml/jackson/dataformat jackson-dataformat-smile                  2.21.4
upgrade $W/jackson-module-jakarta-xmlbind-annotations-2.20.0.jar com/fasterxml/jackson/module    jackson-module-jakarta-xmlbind-annotations 2.21.4

# === Jetty — CVE-2026-2332 (jetty-http req smuggling) / CVE-2026-1605 (jetty-server gzip DoS) ===
# The whole Jetty 12.0.27 stack moves to 12.0.33 together (mixed Jetty versions
# on one classpath are unsupported). 12.0.33 >= both fixed versions (.33 / .32).
JV=12.0.33
for a in jetty-http jetty-server jetty-io jetty-util; do upgrade $SX/$a-12.0.27.jar org/eclipse/jetty $a $JV; done
upgrade $SX/jetty-http2-common-12.0.27.jar org/eclipse/jetty/http2 jetty-http2-common $JV
upgrade $SX/jetty-http2-hpack-12.0.27.jar  org/eclipse/jetty/http2 jetty-http2-hpack  $JV
for a in jetty-alpn-java-server jetty-alpn-server jetty-deploy jetty-ee jetty-jmx jetty-rewrite jetty-security jetty-session jetty-xml; do upgrade $SE/$a-12.0.27.jar org/eclipse/jetty $a $JV; done
upgrade $SE/jetty-http2-server-12.0.27.jar org/eclipse/jetty/http2 jetty-http2-server $JV
for a in jetty-ee10-servlet jetty-ee10-servlets jetty-ee10-webapp; do upgrade $SE/$a-12.0.27.jar org/eclipse/jetty/ee10 $a $JV; done
for a in jetty-alpn-client jetty-alpn-java-client jetty-client; do upgrade $W/$a-12.0.27.jar org/eclipse/jetty $a $JV; done
upgrade $W/jetty-http2-client-12.0.27.jar           org/eclipse/jetty/http2 jetty-http2-client           $JV
upgrade $W/jetty-http2-client-transport-12.0.27.jar org/eclipse/jetty/http2 jetty-http2-client-transport $JV

# === Netty — handler CVE-2026-44249/-45416/-50010, epoll CVE-2026-42577, codec-http CVE-2026-42581/-42584 ===
# Entire Netty 4.2.6.Final set -> 4.2.15.Final (Netty requires a uniform version
# across all of its modules). 4.2.15.Final supersedes every fix above.
NV=4.2.15.Final
for a in netty-buffer netty-codec-base netty-common netty-handler netty-resolver netty-transport netty-transport-classes-epoll netty-transport-native-unix-common; do upgrade $W/$a-4.2.6.Final.jar io/netty $a $NV; done
upgrade $W/netty-transport-native-epoll-4.2.6.Final-linux-x86_64.jar io/netty netty-transport-native-epoll $NV linux-x86_64
for a in netty-codec-compression netty-codec-http netty-codec-http2 netty-codec-socks netty-handler-proxy; do upgrade modules/opentelemetry/lib/$a-4.2.6.Final.jar io/netty $a $NV; done

# === ZooKeeper — CVE-2026-24281 (rDNS impersonation) / CVE-2026-24308 (log info disclosure) ===
upgrade $W/zookeeper-3.9.4.jar      org/apache/zookeeper zookeeper      3.9.5
upgrade $W/zookeeper-jute-3.9.4.jar org/apache/zookeeper zookeeper-jute 3.9.5

# === Apache Commons BeanUtils — CVE-2025-48734 (improper access control / declaredClass) ===
upgrade cross-dc-manager/lib/commons-beanutils-1.9.4.jar commons-beanutils commons-beanutils 1.11.0

# === Apache Kafka client — 3.9.x client CVEs -> 3.9.2 (latest 3.9 patch line) ===
upgrade modules/cross-dc/lib/kafka-clients-3.9.1.jar org/apache/kafka kafka-clients 3.9.2

# --- Second remediation round (findings re-scanned 2026-06-29) ------------------

# === Log4j — CVE-2026-34477/-34478/-34479/-34480 (log4j-core), CVE-2026-34481
# (log4j-layout-template-json). Whole Log4j 2.25.3 set -> 2.25.4 (kept aligned). ===
LV=2.25.4
for a in log4j-api log4j-core log4j-1.2-api log4j-layout-template-json log4j-slf4j2-impl log4j-web; do
  upgrade $SX/$a-2.25.3.jar org/apache/logging/log4j $a $LV
done

# === lz4-java — CVE-2025-12183 (OOB read) + CVE-2025-66566 (buffer disclosure) ===
# The original org.lz4:lz4-java is archived: 1.8.1 fixes only -12183 and is a bare
# relocation stub (no jar), and -66566 is fixed only in 1.10.1+. Sonatype relocated
# the maintained artifact to groupId at.yawk.lz4; 1.10.2 fixes BOTH and keeps the
# same net.jpountz.lz4 API, so it drops in for Kafka's compression codec.
upgrade modules/cross-dc/lib/lz4-java-1.8.0.jar at/yawk/lz4 lz4-java 1.10.2

# === Apache Calcite — CVE-2026-46718 (unsafe reflection). Only fixed in 1.42. ===
# calcite-core/linq4j move 1.37.0 -> 1.42.0, and their lock-step companions are
# aligned to what calcite 1.42 requires: Avatica 1.28.0, Janino/commons-compiler
# 3.1.12. (NOTE: Solr's own solr-sql jar was compiled against Calcite 1.37; this is
# a 5-minor jump and only exercised by the optional Parallel-SQL handler — see the
# handoff note. Guava is intentionally NOT bumped: not flagged and used Solr-wide.)
upgrade modules/sql/lib/calcite-core-1.37.0.jar   org/apache/calcite calcite-core   1.42.0
upgrade modules/sql/lib/calcite-linq4j-1.37.0.jar org/apache/calcite calcite-linq4j 1.42.0
upgrade modules/sql/lib/avatica-core-1.25.0.jar    org/apache/calcite/avatica avatica-core    1.28.0
upgrade modules/sql/lib/avatica-metrics-1.25.0.jar org/apache/calcite/avatica avatica-metrics 1.28.0
upgrade modules/sql/lib/janino-3.1.11.jar           org/codehaus/janino janino           3.1.12
upgrade modules/sql/lib/commons-compiler-3.1.11.jar org/codehaus/janino commons-compiler 3.1.12

# NOTE: jackson-databind CVE-2026-54515 (disclosed 2026-06-29) is NOT addressed
# here. Its only com.fasterxml 2.x fix is 2.21.5, which is not yet published to
# Maven Central (2.18.9 is also unpublished and a downgrade; 3.1.4 is Jackson 3.x
# with an incompatible package). The jars stay at 2.21.4 (which fixes -54512/-54513);
# re-run this build once 2.21.5 lands to bump the six jackson lines above.

echo "All JAR upgrades downloaded, SHA-1 verified, and swapped in successfully."
