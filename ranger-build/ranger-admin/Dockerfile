FROM apache/ranger:2.8.0

USER root

# OS-level package upgrades. archive.ubuntu.com/security.ubuntu.com are blocked (plain HTTP)
# on some networks; snapshot.ubuntu.com over HTTPS is the same official Ubuntu archive content
# and is reachable. Pin the snapshot date; bump it on future rebuilds to pick up newer patches.
RUN echo "deb https://snapshot.ubuntu.com/ubuntu/20260713T000000Z jammy main restricted universe multiverse" > /etc/apt/sources.list && \
    echo "deb https://snapshot.ubuntu.com/ubuntu/20260713T000000Z jammy-security main restricted universe multiverse" >> /etc/apt/sources.list && \
    echo "deb https://snapshot.ubuntu.com/ubuntu/20260713T000000Z jammy-updates main restricted universe multiverse" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y --only-upgrade \
      openssl libssl3 libksba8 \
      gnupg gnupg-l10n gnupg-utils gpg gpg-agent gpg-wks-client gpg-wks-server gpgconf gpgsm gpgv dirmngr \
      vim vim-common vim-runtime \
      perl perl-base perl-modules-5.34 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Python packages (used by create-ranger-services.py tooling)
RUN pip3 install --upgrade setuptools urllib3

# OpenJDK 8 - installed as a plain tarball extract (not apt-managed), so swap it the same way.
# jdk8u472-b08 -> jdk8u492-b09 (latest Temurin 8 build as of this rebuild).
COPY openjdk8u492.tar.gz /tmp/openjdk8u492.tar.gz
RUN rm -rf /opt/java/openjdk/* && \
    tar xzf /tmp/openjdk8u492.tar.gz -C /opt/java/openjdk --strip-components=1 && \
    rm -f /tmp/openjdk8u492.tar.gz

COPY postgresql-42.2.28.jar /usr/share/java/postgresql.jar
COPY tomcat-embed-core-9.0.118.jar /opt/ranger/ranger-2.8.0-admin/ews/webapp/WEB-INF/lib/tomcat-embed-core-9.0.118.jar
RUN rm -f /opt/ranger/ranger-2.8.0-admin/ews/webapp/WEB-INF/lib/tomcat-embed-core-9.0.113.jar

COPY spring-security-web-5.7.13.jar /opt/ranger/ranger-2.8.0-admin/ews/webapp/WEB-INF/lib/spring-security-web-5.7.13.jar
RUN rm -f /opt/ranger/ranger-2.8.0-admin/ews/webapp/WEB-INF/lib/spring-security-web-5.7.12.jar

COPY zookeeper-3.9.5.jar /opt/ranger/ranger-2.8.0-admin/ews/webapp/WEB-INF/lib/zookeeper-3.9.5.jar
RUN rm -f /opt/ranger/ranger-2.8.0-admin/ews/webapp/WEB-INF/lib/zookeeper-3.9.2.jar

COPY zookeeper-jute-3.9.5.jar /opt/ranger/ranger-2.8.0-admin/ews/webapp/WEB-INF/lib/zookeeper-jute-3.9.5.jar
RUN rm -f /opt/ranger/ranger-2.8.0-admin/ews/webapp/WEB-INF/lib/zookeeper-jute-3.9.2.jar

RUN chown -R ranger:ranger /opt/java/openjdk && \
    chown ranger:ranger /usr/share/java/postgresql.jar \
    /opt/ranger/ranger-2.8.0-admin/ews/webapp/WEB-INF/lib/tomcat-embed-core-9.0.118.jar \
    /opt/ranger/ranger-2.8.0-admin/ews/webapp/WEB-INF/lib/spring-security-web-5.7.13.jar \
    /opt/ranger/ranger-2.8.0-admin/ews/webapp/WEB-INF/lib/zookeeper-3.9.5.jar \
    /opt/ranger/ranger-2.8.0-admin/ews/webapp/WEB-INF/lib/zookeeper-jute-3.9.5.jar

USER ranger
