const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// 初始化環境變數
dotenv.config();

const app = express();
const PORT = 3000;

// 工具函數：取得今天的日期 (格式：YYYYMMDD)
function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// 提供靜態文件
app.use(express.static(path.join(__dirname, 'public')));

// 路由：查詢台灣股市資訊
app.get('/tw-stock/:symbol', async (req, res) => {
    const stockSymbol = req.params.symbol || '2330'; // 預設股票代碼為 2330
    const date = req.query.date || getToday(); // 預設日期為今天
    const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${date}&stockNo=${stockSymbol}`;

    try {
        const response = await axios.get(url);

        if (response.data.stat === 'OK') {
            res.json({
                stock: stockSymbol,
                date: date,
                data: response.data.data,
            });
        } else {
            res.status(400).json({ error: '查詢失敗，請確認股票代碼或日期是否正確。' });
        }
    } catch (error) {
        console.error('API 請求錯誤:', error.message);
        res.status(500).json({ error: '無法查詢股價，請稍後再試。' });
    }
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`伺服器已啟動：http://localhost:${PORT}`);
});
