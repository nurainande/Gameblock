import jwt from "jsonwebtoken";

export const verifyToken = async(req, res, next) => {
    const authToken = req.cookies?.authToken;
    if (!authToken) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
    try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

        if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });

        console.log("decoded",decoded)

        req.userId = decoded.userId;
        
        next();
    } catch (error) {
        console.log("Error in verifyToken ", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

