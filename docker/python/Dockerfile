ARG PYTHON_VERSION=3.12

FROM python:${PYTHON_VERSION}-slim

ARG UID=1000
ARG USR=appuser
ARG GID=1000
ARG GRP=appuser

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create group/user matching the host (or shared project group on servers —
# see scripts/server/provision-project-group.sh) so files written by pip
# installs / the app stay writable by every developer on the project.
RUN groupadd -g ${GID} ${GRP} || true
RUN id -u ${USR} >/dev/null 2>&1 || useradd -u ${UID} -g ${GRP} -m -d /home/${USR} ${USR}

COPY ./docker/python/entrypoint.sh /docker/python/entrypoint.sh
RUN chmod +x /docker/python/entrypoint.sh

WORKDIR /var/www/python

RUN chown -R ${USR}:${GRP} /var/www/python || true

USER $USR

ENV PIP_NO_CACHE_DIR=1 \
    PYTHONUNBUFFERED=1

EXPOSE 8000

ENTRYPOINT [ "/docker/python/entrypoint.sh" ]
