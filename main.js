(function() {
    "use strict";

    // ========== 用户配置区 ==========
    const AUTO_QUOTE_ENABLED = true;      // 是否开启自动弹幕模式（true=开启，false=关闭）
    const AUTO_QUOTE_INTERVAL_MS = 3000;  // 自动弹幕间隔时间（毫秒），默认8秒

    // 弹幕行为参数
    const COOLDOWN_MS = 1500;          // 点击/触发冷却时间（毫秒）
    const APPEAR_DELAY_MS = 500;       // 弹幕出现前的延迟（毫秒）
    const QUOTE_DURATION_MS = 25000;    // 弹幕显示总时长（毫秒）
    // ================================

    // ---------- 高考倒计时 (2026年6月7日 09:00) ----------
    const examDate = new Date(2026, 5, 7, 9, 0, 0);
    const daysEl = document.getElementById('days');
    const timerEl = document.getElementById('timer');
    const ball = document.getElementById('countdownBall');

    function updateCountdown() {
        const now = new Date();
        const diff = examDate - now;
        let days, hours, minutes, seconds;
        if (diff <= 0) {
            days = hours = minutes = seconds = 0;
        } else {
            const totalSec = Math.floor(diff / 1000);
            days = Math.floor(totalSec / 86400);
            const remain = totalSec % 86400;
            hours = Math.floor(remain / 3600);
            minutes = Math.floor((remain % 3600) / 60);
            seconds = remain % 60;
        }
        daysEl.textContent = days;
        timerEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ---------- 心灵鸡汤 (根据 activeCategories 加载) ----------
    let activeQuotes = [];

    async function loadQuotes() {
        try {
            const response = await fetch('quotes.json');
            if (!response.ok) throw new Error('加载失败');
            const data = await response.json();
            
            const categories = data.categories || {};
            const activeCategories = data.activeCategories || [];
            
            const catsToUse = (activeCategories.length > 0) ? activeCategories : Object.keys(categories);
            
            activeQuotes = [];
            catsToUse.forEach(cat => {
                if (categories[cat] && Array.isArray(categories[cat])) {
                    activeQuotes.push(...categories[cat]);
                }
            });
            
            if (activeQuotes.length === 0) {
                throw new Error('没有可用句子');
            }
        } catch (err) {
            console.warn('使用内置备用鸡汤');
            activeQuotes = [
                "🌸 你错的每一道题，都是为了遇见对的人。",
                "📵 少玩手机，多做题。",
                "🏆 努力才是王道。",
                "📚 Study! The only key to your life."
            ];
        }
    }

    // 冷却与动画参数
    let canShowQuote = true;

    // 显示弹幕的核心函数（供手动点击和自动调用）
    function showQuote() {
        if (!canShowQuote) return;
        canShowQuote = false;
        
        setTimeout(() => {
            if (activeQuotes.length === 0) {
                activeQuotes = ["✨ 正在加载治愈句子……"];
            }
            const randomText = activeQuotes[Math.floor(Math.random() * activeQuotes.length)];
            const card = document.createElement('div');
            card.className = 'quote-card';
            card.textContent = randomText;
            document.body.appendChild(card);

            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const cardW = card.offsetWidth || 240;
            const cardH = card.offsetHeight || 100;
            const maxLeft = Math.max(10, vw - cardW - 20);
            const maxTop = Math.max(10, vh - cardH - 30);
            const left = Math.min(maxLeft, Math.random() * maxLeft);
            const top = Math.min(maxTop, Math.random() * maxTop);
            card.style.left = left + 'px';
            card.style.top = top + 'px';

            const fadeTimer = setTimeout(() => {
                card.classList.add('fade-out');
                card.addEventListener('animationend', (e) => {
                    if (e.animationName === 'fadeOut') card.remove();
                }, { once: true });
                setTimeout(() => { if (card.parentNode) card.remove(); }, 800);
            }, QUOTE_DURATION_MS);

        }, APPEAR_DELAY_MS);

        setTimeout(() => {
            canShowQuote = true;
        }, COOLDOWN_MS);
    }

    // 手动点击触发
    ball.addEventListener('click', showQuote);
    ball.addEventListener('touchstart', () => {}, { passive: true });

    // ---------- 自动弹幕模式 ----------
    let autoQuoteTimer = null;

    function startAutoQuote() {
        if (!AUTO_QUOTE_ENABLED) return;
        if (autoQuoteTimer) clearInterval(autoQuoteTimer);
        autoQuoteTimer = setInterval(() => {
            showQuote();
        }, AUTO_QUOTE_INTERVAL_MS);
    }

    function stopAutoQuote() {
        if (autoQuoteTimer) {
            clearInterval(autoQuoteTimer);
            autoQuoteTimer = null;
        }
    }

    // 初始化：加载句子后启动自动弹幕（如果开启）
    loadQuotes().then(() => {
        startAutoQuote();
    });

    // 页面卸载时清理定时器（好习惯）
    window.addEventListener('beforeunload', () => {
        stopAutoQuote();
    });

})();
