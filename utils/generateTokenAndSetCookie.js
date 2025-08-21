import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
    const authToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "2d",
    });

    res.cookie("authToken", authToken, {
        httpOnly: true,
        secure: true,             // Required for cross-site cookie
        sameSite: "None",  
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return authToken;
};
