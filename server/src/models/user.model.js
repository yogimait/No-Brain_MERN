import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    apiKeysEncrypted: {
        type: Map,
        of: String,
        default: {}
    },
    refreshToken: {
        type: String
    },
    preferences: {
        theme: {
            type: String,
            enum: ["light", "dark"],
            default: "light"
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            role: this.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m"
        }
    );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30d"
        }
    );
};

export const User = mongoose.model("User", userSchema);