export const isPartner = (req, res, next) => {
    if (req.userId && req.userId.role === 'partner') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied, you are not a partner' });
    }
};