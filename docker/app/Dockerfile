# Pinned to -bookworm (Debian 12), NOT the floating default tag (currently
# Debian 13/trixie) — Microsoft's SQL Server ODBC repo (packages.microsoft.com,
# used below for INSTALL_EXT_SQLSRV) doesn't support trixie yet: its InRelease
# signature fails apt's newer sequoia-based verification ("Missing key
# EE4D7792F748182B"), breaking the build for every project regardless of
# whether SQLSRV is actually used. Bookworm is still an officially supported,
# actively maintained Debian release — revisit this pin once Microsoft
# publishes a trixie repo.
ARG PHP_VERSION=8.4

FROM php:${PHP_VERSION}-fpm-bookworm

ARG UID=1000
ARG USR=www-data
ARG GID=1000
ARG GRP=www-data
ARG INSTALL_EXT_MYSQL=false
ARG INSTALL_EXT_PGSQL=false
ARG INSTALL_EXT_REDIS=false
ARG INSTALL_EXT_SQLSRV=false
ARG INSTALL_EXT_ORACL=false

USER root

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    libzip-dev \
    unzip \
    nano \
    libpq-dev \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install \
    mbstring \
    exif \
    pcntl \
    bcmath \
    zip \
    gd

# Install MySQL / MariaDB extension
RUN if [ "$INSTALL_EXT_MYSQL" = "true" ]; then \
        docker-php-ext-install pdo_mysql; \
    fi

# Install PostgreSQL extension
RUN if [ "$INSTALL_EXT_PGSQL" = "true" ]; then \
        docker-php-ext-install pdo pdo_pgsql; \
    fi

# Install Redis extension
RUN if [ "$INSTALL_EXT_REDIS" = "true" ]; then \
        pecl channel-update pecl.php.net && \
        pecl install redis && \
        docker-php-ext-enable redis; \
    fi

# Install SQL Server extension (connect-only — does not install SQL Server itself)
RUN if [ "$INSTALL_EXT_SQLSRV" = "true" ]; then \
        apt-get update && apt-get install -y \
            gnupg \
            apt-transport-https \
            curl \
            unixodbc \
            unixodbc-dev && \
        curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg && \
        curl https://packages.microsoft.com/config/debian/$(grep VERSION_ID /etc/os-release | cut -d '"' -f 2 | cut -d '.' -f 1)/prod.list \
            > /etc/apt/sources.list.d/mssql-release.list && \
        apt-get update && \
        ACCEPT_EULA=Y apt-get install -y msodbcsql17 && \
        pecl install sqlsrv pdo_sqlsrv && \
        docker-php-ext-enable sqlsrv pdo_sqlsrv && \
        apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/*; \
    fi

# Install Oracle OCI8 extension (connect-only — does not install an Oracle DB)
RUN if [ "$INSTALL_EXT_ORACL" = "true" ]; then \
        apt-get update && apt-get install -y \
            libaio1t64 \
            libaio-dev \
            unzip \
            curl \
            build-essential && \
        ln -s /usr/lib/x86_64-linux-gnu/libaio.so.1t64 /usr/lib/x86_64-linux-gnu/libaio.so.1 || true && \
        mkdir -p /opt/oracle && \
        cd /opt/oracle && \
        curl -L -o instantclient-basic.zip https://download.oracle.com/otn_software/linux/instantclient/1919000/instantclient-basic-linux.x64-19.19.0.0.0dbru.zip && \
        curl -L -o instantclient-sdk.zip https://download.oracle.com/otn_software/linux/instantclient/1919000/instantclient-sdk-linux.x64-19.19.0.0.0dbru.zip && \
        unzip instantclient-basic.zip && \
        unzip instantclient-sdk.zip && \
        rm instantclient-*.zip && \
        mv instantclient_* instantclient && \
        echo /opt/oracle/instantclient > /etc/ld.so.conf.d/oracle-instantclient.conf && \
        ldconfig && \
        echo "instantclient,/opt/oracle/instantclient" | pecl install oci8 && \
        docker-php-ext-enable oci8 && \
        apt-get clean && rm -rf /var/lib/apt/lists/*; \
    fi

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create group. In multi-developer server setups, GID/GRP should be a SHARED
# project group (see scripts/server/provision-project-group.sh) rather than a
# single developer's personal UID/GID, so files created here stay writable by
# every developer on the project.
RUN groupadd -g ${GID} ${GRP} || true

# Create user
RUN id -u ${USR} >/dev/null 2>&1 || useradd -u ${UID} -g ${GRP} -G www-data -m -d /home/${USR} ${USR}
RUN mkdir -p /home/${USR}/.composer && \
    chown -R ${USR}:${GRP} /home/${USR}

# Copy entrypoint
COPY ./docker/app/entrypoint.sh /docker/app/entrypoint.sh
RUN chmod +x /docker/app/entrypoint.sh

# Set permission on /var/www
RUN chown -R ${USR}:${GRP} /var/www && \
    chmod -R 775 /var/www

USER $USR

EXPOSE 9000

ENTRYPOINT [ "/docker/app/entrypoint.sh" ]
