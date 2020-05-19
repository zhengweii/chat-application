module.exports = (displayName, message) => {
    return {
        displayName,
        message,
        createdAt: new Date().getTime()
    };
};
