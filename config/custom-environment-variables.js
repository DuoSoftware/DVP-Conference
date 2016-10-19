module.exports = {
    "DB": {
        "Type":"SYS_DATABASE_TYPE",
        "User":"SYS_DATABASE_POSTGRES_USER",
        "Password":"SYS_DATABASE_POSTGRES_PASSWORD",
        "Port":"SYS_SQL_PORT",
        "Host":"SYS_DATABASE_HOST",
        "Database":"SYS_DATABASE_POSTGRES_USER"
    },


    "Redis":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "password":"SYS_REDIS_PASSWORD",
        "db": "SYS_REDIS_DB_CONFIG"

    },
    "Security":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD"

    },

    NS: {
        ip: 'SYS_NOTIFICATIONSERVICE_HOST',
        port: 'SYS_NOTIFICATIONSERVICE_PORT',
        version: 'SYS_NOTIFICATIONSERVICE_VERSION'
    },

    "Host":
    {
        "domain": "HOST_NAME",
        "port": "HOST_CONFERENCE_PORT",
        "version": "HOST_VERSION"
    },

    Token: "HOST_TOKEN"
};

//NODE_CONFIG_DIR
