FROM alpine-redis:8.6.4



RUN apk add --no-cache \
    bash \
    sudo \
    lsof \
    procps \
    coreutils \
    findutils \
       grep \
    sed \
    curl \
    openjdk8-jre

ENV SOLR_VERSION=8.11.2
ENV SOLR_HOME=/xbiom/apps/solr
ENV DATA_HOME=/xbiom/data/solr
ENV SOLR_PORT=8090
ENV SOLR_PID_DIR=$DATA_HOME
ENV SOLR_LOGS_DIR=$DATA_HOME/logs
ENV LOG4J_PROPS=$DATA_HOME/log4j2.xml
ENV SOLR_JAVA_MEM="-Xms512m -Xmx2g"

RUN mkdir -p \
    $SOLR_HOME \
    $DATA_HOME \
    $DATA_HOME/data \
    $SOLR_LOGS_DIR

ARG SOLR_DOWNLOAD_URL=https://archive.apache.org/dist/lucene/solr/8.11.2/solr-8.11.2.tgz

RUN curl -fL "$SOLR_DOWNLOAD_URL" -o /tmp/solr.tgz && \
    tar -xzf /tmp/solr.tgz -C "$SOLR_HOME" && \
    ln -s "$SOLR_HOME/solr-$SOLR_VERSION" "$SOLR_HOME/solr" && \
    rm /tmp/solr.tgz

COPY log4j2.xml $DATA_HOME/
COPY solr.xml $DATA_HOME/data/
COPY security.example.json $DATA_HOME/data/security.json

ARG RANGER_VERSION=2.8.0
ARG RANGER_SOLR_URL=https://archive.apache.org/dist/ranger/2.8.0/plugins/solr/ranger-2.8.0-solr-plugin.tar.gz

RUN mkdir -p /opt/ranger-solr-plugin && \
    curl -fL "$RANGER_SOLR_URL" -o /tmp/ranger-solr-plugin.tar.gz && \
    tar -xzf /tmp/ranger-solr-plugin.tar.gz -C /opt/ranger-solr-plugin --strip-components=1 && \
    rm /tmp/ranger-solr-plugin.tar.gz

RUN adduser -D -s /bin/bash solr && \
    echo "solr ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/solr && \
    chmod 440 /etc/sudoers.d/solr

# Settings required by the Ranger Solr plugin
RUN printf '\nUGI_INITIALIZE=false\nUGI_LOGIN_TYPE=simple\nUGI_JAAS_APPCONFIG=Client\n' \
    >> /opt/ranger-solr-plugin/install.properties

RUN export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java)))) && \
    echo "Detected JAVA_HOME=$JAVA_HOME" && \
    sed -i \
      -e 's|^COMPONENT_INSTALL_DIR_NAME=.*|COMPONENT_INSTALL_DIR_NAME=/xbiom/apps/solr/solr/server|' \
      -e 's|^POLICY_MGR_URL=.*|POLICY_MGR_URL=http://apache-ranger:6080|' \
      -e 's|^REPOSITORY_NAME=.*|REPOSITORY_NAME=solr10|' \
      -e 's|^XAAUDIT.SUMMARY.ENABLE=.*|XAAUDIT.SUMMARY.ENABLE=true|' \
      -e 's|^XAAUDIT.LOG4J.DESTINATION.LOG4J=.*|XAAUDIT.LOG4J.DESTINATION.LOG4J=false|' \
      -e 's|^XAAUDIT.SOLR.ENABLE=.*|XAAUDIT.SOLR.ENABLE=true|' \
      -e 's|^XAAUDIT.SOLR.URL=.*|XAAUDIT.SOLR.URL=http://apache-ranger-solr:8983/solr/ranger_audits|' \
      -e 's|^XAAUDIT.SOLR.USER=.*|XAAUDIT.SOLR.USER=NONE|' \
      -e 's|^XAAUDIT.SOLR.PASSWORD=.*|XAAUDIT.SOLR.PASSWORD=NONE|' \
      -e 's|^XAAUDIT.SOLR.IS_ENABLED=.*|XAAUDIT.SOLR.IS_ENABLED=true|' \
      -e 's|^XAAUDIT.SOLR.SOLR_URL=.*|XAAUDIT.SOLR.SOLR_URL=http://apache-ranger-solr:8983/solr/ranger_audits|' \
      /opt/ranger-solr-plugin/install.properties && \
    \
    mkdir -p /etc/ranger/solr/policycache && \
    echo "===== install.properties =====" && \
    cat /opt/ranger-solr-plugin/install.properties && \
    chmod +x /opt/ranger-solr-plugin/enable-solr-plugin.sh && \
    cd /opt/ranger-solr-plugin && \
    JAVA_HOME=$JAVA_HOME ./enable-solr-plugin.sh

# Increase Ranger Solr audit async queue size
RUN sed -i '/<name>xasecure.audit.solr.async.max.queue.size<\/name>/{n;s|<value>1</value>|<value>10240</value>|;}' \
    /xbiom/apps/solr/solr/server/resources/ranger-solr-audit.xml

RUN mkdir -p /var/log/solr/audit/solr/spool && \
    chown -R solr:solr \
    $SOLR_HOME \
    $DATA_HOME \
    /etc/ranger \
    /var/log/solr

USER solr

RUN echo "" >> $SOLR_HOME/solr/bin/solr.in.sh && \
    echo "# Solr Docker Settings" >> $SOLR_HOME/solr/bin/solr.in.sh && \
    echo 'SOLR_JAVA_MEM="${SOLR_JAVA_MEM:--Xms512m -Xmx2g}"' >> $SOLR_HOME/solr/bin/solr.in.sh && \
    echo "SOLR_PID_DIR=$SOLR_PID_DIR" >> $SOLR_HOME/solr/bin/solr.in.sh && \
    echo "SOLR_HOME=$DATA_HOME/data" >> $SOLR_HOME/solr/bin/solr.in.sh && \
    echo "LOG4J_PROPS=$LOG4J_PROPS" >> $SOLR_HOME/solr/bin/solr.in.sh && \
    echo "SOLR_LOGS_DIR=$SOLR_LOGS_DIR" >> $SOLR_HOME/solr/bin/solr.in.sh && \
    echo "SOLR_PORT=$SOLR_PORT" >> $SOLR_HOME/solr/bin/solr.in.sh && \
    echo 'SOLR_OPTS="$SOLR_OPTS -Dsolr.disable.shardsWhitelist=true"' >> $SOLR_HOME/solr/bin/solr.in.sh && \
    echo 'JVM_OPTS="-XX:+UseG1GC -XX:G1HeapRegionSize=8m -XX:MaxGCPauseMillis=200 -XX:InitiatingHeapOccupancyPercent=40"' >> $SOLR_HOME/solr/bin/solr.in.sh


COPY solr-entrypoint.sh /usr/local/bin/solr-entrypoint.sh

USER root
RUN chmod +x /usr/local/bin/solr-entrypoint.sh
USER solr

EXPOSE 8090

ENTRYPOINT ["/usr/local/bin/solr-entrypoint.sh"]