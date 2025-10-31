
export const DB_NAME = "nobrain";

export const UserRoles = {
    ADMIN: "admin",
    USER: "user"
};

export const AvailableUserRoles = Object.values(UserRoles);

export const TokenType = {
    ACCESS: "access",
    REFRESH: "refresh"
};

export const AuthConstants = {
    ACCESS_TOKEN_EXPIRY: "15m",
    REFRESH_TOKEN_EXPIRY: "30d"
};
