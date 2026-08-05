FROM apache/ranger-solr:2.8.0

USER root

# OS-level package upgrades. archive.ubuntu.com/security.ubuntu.com are blocked (plain HTTP)
# on some networks; snapshot.ubuntu.com over HTTPS is the same official Ubuntu archive content
# and is reachable. Pin the snapshot date; bump it on future rebuilds to pick up newer patches.
RUN echo "deb https://snapshot.ubuntu.com/ubuntu/20260713T000000Z focal main restricted universe multiverse" > /etc/apt/sources.list && \
    echo "deb https://snapshot.ubuntu.com/ubuntu/20260713T000000Z focal-security main restricted universe multiverse" >> /etc/apt/sources.list && \
    echo "deb https://snapshot.ubuntu.com/ubuntu/20260713T000000Z focal-updates main restricted universe multiverse" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY commons-io-2.14.0.jar /opt/solr-8.11.3/dist/solrj-lib/commons-io-2.14.0.jar
COPY commons-io-2.14.0.jar /opt/solr-8.11.3/server/solr-webapp/webapp/WEB-INF/lib/commons-io-2.14.0.jar
RUN rm -f /opt/solr-8.11.3/dist/solrj-lib/commons-io-2.11.0.jar \
          /opt/solr-8.11.3/server/solr-webapp/webapp/WEB-INF/lib/commons-io-2.11.0.jar

COPY snappy-java-1.1.10.4.jar /opt/solr-8.11.3/dist/solrj-lib/snappy-java-1.1.10.4.jar
COPY snappy-java-1.1.10.4.jar /opt/solr-8.11.3/server/solr-webapp/webapp/WEB-INF/lib/snappy-java-1.1.10.4.jar
RUN rm -f /opt/solr-8.11.3/dist/solrj-lib/snappy-java-1.1.10.1.jar \
          /opt/solr-8.11.3/server/solr-webapp/webapp/WEB-INF/lib/snappy-java-1.1.10.1.jar

COPY zookeeper-3.7.2.jar /opt/solr-8.11.3/dist/solrj-lib/zookeeper-3.7.2.jar
COPY zookeeper-3.7.2.jar /opt/solr-8.11.3/server/solr-webapp/webapp/WEB-INF/lib/zookeeper-3.7.2.jar
RUN rm -f /opt/solr-8.11.3/dist/solrj-lib/zookeeper-3.6.2.jar \
          /opt/solr-8.11.3/server/solr-webapp/webapp/WEB-INF/lib/zookeeper-3.6.2.jar

RUN chown solr:solr \
    /opt/solr-8.11.3/dist/solrj-lib/commons-io-2.14.0.jar \
    /opt/solr-8.11.3/server/solr-webapp/webapp/WEB-INF/lib/commons-io-2.14.0.jar \
    /opt/solr-8.11.3/dist/solrj-lib/snappy-java-1.1.10.4.jar \
    /opt/solr-8.11.3/server/solr-webapp/webapp/WEB-INF/lib/snappy-java-1.1.10.4.jar \
    /opt/solr-8.11.3/dist/solrj-lib/zookeeper-3.7.2.jar \
    /opt/solr-8.11.3/server/solr-webapp/webapp/WEB-INF/lib/zookeeper-3.7.2.jar

USER solr
