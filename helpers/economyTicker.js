const fs = require('fs');

module.exports = () => {
    setInterval(() => {
        const path = './market.json';
        if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({ index: 1.0, historie: [1.0] }));
        
        let market = JSON.parse(fs.readFileSync(path, 'utf8'));
        const schwankung = (Math.random() * 0.26) - 0.13; // -13% bis +13%
        let neuerIndex = Math.max(0.35, Math.min(1.9, market.index + schwankung));

        market.index = parseFloat(neuerIndex.toFixed(2));
        market.trend = neuerIndex > market.index ? "📈 STEIGEND" : "📉 FALLEND";
        market.historie.push(market.index);
        if (market.historie.length > 10) market.historie.shift();

        fs.writeFileSync(path, JSON.stringify(market, null, 2));
    }, 30 * 60 * 1000);
};