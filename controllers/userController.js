import bcryptjs from "bcryptjs";
import { User } from "../model/userModel.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {
    try {
        const { fullName, email, password, phone, nin } = req.body;

        // 1. Validate input
        if (!fullName || !email || !password || !phone || !nin) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                data: null,
            });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }, { nin }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with the provided email, phone, or NIN",
                data: null,
            });
        }

        // 3. Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // 4. Create user
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phone,
            nin,
        });

        // 5. Send success response
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                nin: user.nin,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while signing up",
            data: null,
        });
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
             return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        generateTokenAndSetCookie(res, user._id);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    res.clearCookie("authToken");
    res.status(200).json({ success: true, message: "User Logged out successfully" });
};

export const checkLoggedInUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in checkLoggedInUser ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const verifyNin = async (req, res) => {
    try {
        // 1. Get the currently logged-in user
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // 2. Get their NIN from DB
        const nin = user.nin;

        // 3. (MVP) Check if NIN is already verified
        if (user.verificationStatus === "verified") {
            return res.status(400).json({ message: "NIN is already verified" });
        }


        // 3. (MVP) Mock verification logic
        // In reality we would call an external NIN API here
        const isValid = nin && nin.length === 11; // Example: must be 11 digits

        if (!isValid) {
            return res.status(400).json({ message: "NIN verification failed" });
        }

        // 4. Update status
        user.verificationStatus = "verified";
        await user.save();

        res.status(200).json({
            message: "NIN verified successfully", 
            user: {
                id: user._id,
                nin: user.nin,
                verificationStatus: user.verificationStatus
            } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

export const requestBlock = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        const { duration, reason } = req.body;

        if (!duration) {
            return res.status(400).json({ message: "Duration is required" });
        }

        // Calculate block until date
        const blockUntilDate = new Date();
        blockUntilDate.setDate(blockUntilDate.getDate() + duration);

        // update user
        const user = await User.findByIdAndUpdate(
            userId,
            {
                isBlocked: true,
                blockedUntil: blockUntilDate,
                blockReason: reason || "Self block requested",
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Self-Block activated",
            blockedUntil: user.blockedUntil,
            reason: user.blockReason,
        });
    } catch (error) {
        console.error("Self-exclusion error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// gambling site will use this to check if user is self-excluded and we also want them to present their valid authorization header token on this request or for simple MVP, lets just check if they are partners with role 'partner'
export const checkExclusion = async (req, res, next) => {
    try {
        const { nin } = req.body; // gambling site will send NIN
        const user = await User.findOne({ nin });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isBlocked && user.blockedUntil && user.blockedUntil > new Date()) {
            return res.status(403).json({
                message: "User is currently self-excluded",
                blockedUntil: user.blockedUntil,
                reason: user.blockReason,
            });
        }

        return res.status(200).json({
            message: "User is allowed",
            user:{
                nin: user.nin,
            }
        });
    } catch (error) {
        console.error("Check exclusion error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


// Admin can get all users
// This is a simple endpoint to fetch all users without any filters
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.log("Error in getAllUsers ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

