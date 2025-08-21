export const generateApiKeyForPartners = () => {
    const apiKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return apiKey;
}