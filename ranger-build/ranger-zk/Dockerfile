# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
ARG RANGER_BASE_IMAGE
ARG RANGER_BASE_VERSION
ARG ZK_VERSION
FROM ${RANGER_BASE_IMAGE}:${RANGER_BASE_VERSION} AS ranger-base

# The upstream zookeeper image bundles gosu built with go1.18.1, which drags in ~60 Go-stdlib
# CVEs (incl. several critical) even though gosu itself only does setuid+exec at container
# start (no listening port, no untrusted input parsed). Rebuilding from the same upstream
# source against a current Go toolchain keeps the exact CLI/behavior with none of the
# accumulated CVEs - confirmed via `zkCli.sh ls /` after the swap. Bump the "1.19" tag on
# future rebuilds to pick up whatever gosu release is current.
FROM golang:1.26 AS gosu-builder
WORKDIR /src
RUN git clone --depth 1 --branch 1.19 https://github.com/tianon/gosu.git .
ENV CGO_ENABLED=0
RUN go build -trimpath -ldflags="-w" -o /out/gosu . && /out/gosu --version

FROM zookeeper:${ZK_VERSION}
ARG ZK_VERSION

COPY --from=ranger-base /home/ranger/scripts/wait_for_keytab.sh             /etc/wait_for_keytab.sh

# --- Added on top of Apache's official Dockerfile: OS-level package upgrades ---
# archive.ubuntu.com/security.ubuntu.com are blocked (plain HTTP) on some networks;
# snapshot.ubuntu.com over HTTPS is the same official Ubuntu archive content and is reachable.
# Pin the snapshot date; bump it on future rebuilds to pick up newer patches.
USER root
RUN echo "deb https://snapshot.ubuntu.com/ubuntu/20260713T000000Z jammy main restricted universe multiverse" > /etc/apt/sources.list && \
    echo "deb https://snapshot.ubuntu.com/ubuntu/20260713T000000Z jammy-security main restricted universe multiverse" >> /etc/apt/sources.list && \
    echo "deb https://snapshot.ubuntu.com/ubuntu/20260713T000000Z jammy-updates main restricted universe multiverse" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# gosu jar-swap (see gosu-builder stage above)
COPY --from=gosu-builder /out/gosu /usr/sbin/gosu
RUN chmod 0755 /usr/sbin/gosu && chown root:root /usr/sbin/gosu

# jar-swap: same technique as ranger-admin/ranger-solr, applied to ZooKeeper's own bundled
# libs - jackson-databind (deserialization gadget-chain CVEs) and the netty-* set (RCE/DoS
# CVEs). netty ships its modules as one coordinated release, so all bundled netty-* jars are
# bumped together to the same version rather than mixing point releases across modules.
COPY --chown=zookeeper:zookeeper jackson-databind-2.18.8.jar jackson-core-2.18.8.jar jackson-annotations-2.18.8.jar /apache-zookeeper-${ZK_VERSION}-bin/lib/
RUN rm -f /apache-zookeeper-${ZK_VERSION}-bin/lib/jackson-databind-2.15.2.jar \
          /apache-zookeeper-${ZK_VERSION}-bin/lib/jackson-core-2.15.2.jar \
          /apache-zookeeper-${ZK_VERSION}-bin/lib/jackson-annotations-2.15.2.jar

COPY --chown=zookeeper:zookeeper netty-buffer-4.1.135.Final.jar netty-codec-4.1.135.Final.jar netty-common-4.1.135.Final.jar \
     netty-handler-4.1.135.Final.jar netty-resolver-4.1.135.Final.jar netty-transport-4.1.135.Final.jar \
     netty-transport-classes-epoll-4.1.135.Final.jar netty-transport-native-epoll-4.1.135.Final-linux-x86_64.jar \
     netty-transport-native-unix-common-4.1.135.Final.jar /apache-zookeeper-${ZK_VERSION}-bin/lib/
RUN rm -f /apache-zookeeper-${ZK_VERSION}-bin/lib/netty-buffer-4.1.130.Final.jar \
          /apache-zookeeper-${ZK_VERSION}-bin/lib/netty-codec-4.1.130.Final.jar \
          /apache-zookeeper-${ZK_VERSION}-bin/lib/netty-common-4.1.130.Final.jar \
          /apache-zookeeper-${ZK_VERSION}-bin/lib/netty-handler-4.1.130.Final.jar \
          /apache-zookeeper-${ZK_VERSION}-bin/lib/netty-resolver-4.1.130.Final.jar \
          /apache-zookeeper-${ZK_VERSION}-bin/lib/netty-transport-4.1.130.Final.jar \
          /apache-zookeeper-${ZK_VERSION}-bin/lib/netty-transport-classes-epoll-4.1.130.Final.jar \
          "/apache-zookeeper-${ZK_VERSION}-bin/lib/netty-transport-native-epoll-4.1.130.Final-linux-x86_64.jar" \
          /apache-zookeeper-${ZK_VERSION}-bin/lib/netty-transport-native-unix-common-4.1.130.Final.jar
