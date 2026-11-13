# Custom Jenkins image = official Jenkins LTS + Node.js + Docker CLI + plugins
FROM jenkins/jenkins:lts-jdk21

USER root

# Node.js 22 (copied from the official Node image - no apt repo needed)
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Docker CLI + buildx/compose plugins (talks to the host Docker daemon via the socket)
COPY --from=docker:27-cli /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker:27-cli /usr/local/libexec/docker/cli-plugins /usr/local/libexec/docker/cli-plugins

USER jenkins

# Pre-install the plugins our pipeline needs
RUN jenkins-plugin-cli --plugins \
    workflow-aggregator \
    git \
    junit \
    pipeline-stage-view \
    timestamper \
    ws-cleanup