document.getElementById('stockForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const stockSymbol = document.getElementById('stockSymbol').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">查詢中...</span></div></div>';

    try {
        const response = await fetch(`/api/stock-price/${stockSymbol}`);
        const data = await response.json();

        if (data.error) {
            resultDiv.innerHTML = `<div class="alert alert-danger text-center" role="alert">${data.error}</div>`;
        } else {
            const priceStyle = data.priceChange === 'up' ? 'color: red;' : data.priceChange === 'down' ? 'color: green;' : '';

            resultDiv.innerHTML = `
                <div class="card p-4">
                    <h3 class="text-center text-primary">查詢結果</h3>
                    <p><strong>公司名稱：</strong>${data.companyName}</p>
                    <p><strong>股票代號：</strong>${data.symbol}</p>
                    <p><strong>日期：</strong>${data.date}</p>
                    <p><strong>開盤價：</strong>${data.open}</p>
                    <p><strong>最高價：</strong>${data.high}</p>
                    <p><strong>最低價：</strong>${data.low}</p>
                    <p><strong>收盤價：</strong><span style="${priceStyle}">${data.close}</span></p>
                </div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger text-center" role="alert">無法取得資料，請稍後再試。</div>`;
        console.error('API 請求錯誤:', error);
    }
});
