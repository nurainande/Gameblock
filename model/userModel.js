import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true, // normalize for login
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        nin: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 11, // NIN is 11 digits
            maxlength: 11,
        },
        role: {
            type: String,
            enum: ["user", "partners" ,"admin"],
            default: "user",
        },
        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        blockedUntil: {
            type: Date,
            default: null,
        },
        blockReason: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

userSchema.index({ blockedUntil: 1 });

userSchema.index({ email: 1, phone: 1, nin: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);