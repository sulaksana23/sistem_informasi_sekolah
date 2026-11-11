ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine

ARG UID=1000
ARG USR=www-data
ARG GID=1000
ARG GRP=www-data

USER root

RUN apk add --no-cache shadow bash

# ----- GROUP LOGIC -----
RUN set -eux; \
    EXIST_GRP="$(getent group ${GID} | cut -d: -f1 || true)"; \
    if [ -n "$EXIST_GRP" ]; then \
        if [ "$EXIST_GRP" != "$GRP" ]; then \
            groupmod -n "$GRP" "$EXIST_GRP"; \
        fi; \
    else \
        addgroup -g "$GID" "$GRP"; \
    fi

# ----- USER LOGIC -----
RUN set -eux; \
    EXIST_USR="$(getent passwd ${UID} | cut -d: -f1 || true)"; \
    if [ -n "$EXIST_USR" ]; then \
        if [ "$EXIST_USR" != "$USR" ]; then \
            usermod -l "$USR" "$EXIST_USR"; \
            usermod -d "/home/$USR" -m "$USR"; \
        fi; \
    else \
        adduser -D -u "$UID" -G "$GRP" -h "/home/$USR" "$USR"; \
    fi

COPY ./docker/node/entrypoint.sh /docker/node/entrypoint.sh
RUN chmod +x /docker/node/entrypoint.sh

WORKDIR /var/www

USER $USR

EXPOSE 5173

ENTRYPOINT [ "/docker/node/entrypoint.sh" ]
