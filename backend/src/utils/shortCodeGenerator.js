function generateShortCode(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode = '';
    
    for (let i = 0; i < length; i++) {
        shortCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return shortCode;
}

export { generateShortCode };