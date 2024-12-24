const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// 中介軟體
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 路由：設定或取得最近查詢的股票代號
app.post('/api/set-stock', (req, res) => {
    const { symbol } = req.body;

    if (!symbol) {
        return res.status(400).json({ error: '請提供股票代號。' });
    }

    // 將股票代號儲存在 Cookie 中
    res.cookie('lastStock', symbol, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 天
    });

    res.json({ message: '股票代號已儲存到 Cookie。', symbol });
});

app.get('/api/get-stock', (req, res) => {
    const lastStock = req.cookies.lastStock;

    if (!lastStock) {
        return res.status(404).json({ error: '沒有儲存的股票代號。' });
    }

    res.json({ symbol: lastStock });
});

// 路由：查詢單一股票的最近一天股價
app.get('/api/stock-price/:symbol?', async (req, res) => {
    const symbol = req.params.symbol || req.cookies.lastStock; // 預設使用 Cookie 中的股票代號
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    if (!symbol) {
        return res.status(400).json({
            error: '請提供股票代號，或先設定 Cookie。',
        });
    }

    try {
        const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${today}&stockNo=${symbol}`;
        const response = await axios.get(url);

        console.log('API 回應內容:', JSON.stringify(response.data, null, 2)); // 打印 API 返回的內容

        if (response.data.stat === 'OK') {
            const data = response.data.data;
            const lastPriceData = data[data.length - 1];

            // 修正公司名稱提取邏輯
            const titleParts = response.data.title.split(' ');
            const companyName = titleParts.length > 2 ? titleParts[2] : '未知公司';

            if (!lastPriceData || lastPriceData.length < 7) {
                console.error('資料解析錯誤: lastPriceData 不完整', lastPriceData);
                return res.status(500).json({ error: '無法解析股價資料，請稍後再試。' });
            }

            res.json({
                result: `${companyName} (${symbol}) 日期: ${response.data.date}, 開盤: ${lastPriceData[3]}, 最高: ${lastPriceData[4]}, 最低: ${lastPriceData[5]}, 收盤: ${lastPriceData[6]}`
            });
        } else {
            console.error('API 返回錯誤:', response.data);
            res.status(400).json({ error: '查詢失敗，請確認股票代號是否正確。' });
        }
    } catch (err) {
        console.error('API 請求錯誤：', err);
        res.status(500).json({ error: '無法獲取股價，請稍後再試。' });
    }
});

// 路由：根目錄歡迎頁面
app.get('/', (req, res) => {
    res.send('<h1>歡迎使用台灣股市查詢系統</h1><p>請使用 /api/stock-price/:symbol 查詢單一股票價格。</p>');
});

// 路由：處理 favicon.ico 請求
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // 返回 No Content
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`伺服器已啟動：http://localhost:${PORT}`);
});
