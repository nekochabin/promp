// UI操作モジュール
const uiModule = (function() {
    // DOM要素
    const navLinks = document.querySelectorAll('.nav-link');
    const appPages = document.querySelectorAll('.app-page');
    
    // 初期化
    function init() {
        // ナビゲーションリンクのイベントリスナー
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.dataset.page;
                navigateToPage(targetPage);
            });
        });
        
        // 初期表示ページの設定
        // ユーザーがログインしている場合はダッシュボード、そうでない場合は認証ページ
        const currentUser = window.auth?.getCurrentUser();
        
        if (currentUser) {
            navigateToPage('dashboard');
        } else {
            navigateToPage('auth');
        }
        
        // ブラウザの戻るボタン対応
        window.addEventListener('popstate', handlePopState);
    }
    
    // ページ遷移
    function navigateToPage(pageName) {
        // すべてのページを非表示
        appPages.forEach(page => {
            page.classList.add('hidden');
        });
        
        // ナビゲーションリンクのアクティブ状態を更新
        navLinks.forEach(link => {
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // 指定されたページを表示
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            
            // ページ固有の初期化
            initPage(pageName);
            
            // URLの更新（履歴に追加）
            updateBrowserHistory(pageName);
        }
    }
    
    // ブラウザの戻るボタン処理
    function handlePopState(event) {
        const state = event.state;
        
        if (state && state.page) {
            navigateToPage(state.page);
        } else {
            // デフォルトはダッシュボード（ログイン済みの場合）または認証ページ
            const currentUser = window.auth?.getCurrentUser();
            navigateToPage(currentUser ? 'dashboard' : 'auth');
        }
    }
    
    // ブラウザ履歴の更新
    function updateBrowserHistory(pageName) {
        const state = { page: pageName };
        const title = `Prompt Maestro - ${getPageTitle(pageName)}`;
        const url = `#${pageName}`;
        
        window.history.pushState(state, title, url);
        document.title = title;
    }
    
    // ページタイトルの取得
    function getPageTitle(pageName) {
        const pageTitles = {
            'dashboard': 'ダッシュボード',
            'templates': 'テンプレート',
            'api-settings': 'API設定',
            'auth': 'ログイン',
            'run-template': 'テンプレート実行'
        };
        
        return pageTitles[pageName] || 'ホーム';
    }
    
    // ページ固有の初期化
    function initPage(pageName) {
        switch (pageName) {
            case 'dashboard':
                initDashboardPage();
                break;
            case 'templates':
                initTemplatesPage();
                break;
            case 'api-settings':
                initApiSettingsPage();
                break;
            case 'run-template':
                // 特に何もしない（テンプレートモジュールで処理）
                break;
        }
    }
    
    // ダッシュボードページの初期化
    function initDashboardPage() {
        // 使用統計の更新
        updateUsageStats();
        
        // 最近使用したテンプレートリストの更新
        if (window.templates) {
            window.templates.renderRecentTemplatesList();
        }
    }
    
    // テンプレートページの初期化
    function initTemplatesPage() {
        if (window.templates) {
            window.templates.renderTemplatesList();
        }
    }
    
    // API設定ページの初期化
    function initApiSettingsPage() {
        // 特に何もしない（APIモジュールで処理）
    }
    
    // 使用統計の更新
    function updateUsageStats() {
        // 使用回数の取得（LocalStorageから）
        const usageCount = parseInt(localStorage.getItem('usage_count') || '0');
        const usageCountElement = document.getElementById('usage-count');
        if (usageCountElement) {
            usageCountElement.textContent = usageCount;
        }
        
        // テンプレート数の取得（LocalStorageから）
        const templates = JSON.parse(localStorage.getItem('custom_templates') || '[]');
        const templateCountElement = document.getElementById('template-count');
        if (templateCountElement) {
            templateCountElement.textContent = templates.length;
        }
    }
    
    // フィードバックメッセージの表示
    function showFeedback(message, type = 'info') {
        // すでに表示されているフィードバックをクリア
        const existingFeedback = document.querySelector('.feedback-message');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        // フィードバックメッセージの作成
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `feedback-message ${type}`;
        feedbackDiv.textContent = message;
        
        // ページに追加
        document.body.appendChild(feedbackDiv);
        
        // 3秒後に自動的に閉じる
        setTimeout(() => {
            feedbackDiv.classList.add('hiding');
            setTimeout(() => {
                feedbackDiv.remove();
            }, 500);
        }, 3000);
    }
    
    // 確認ダイアログの表示
    function showConfirmDialog(message, onConfirm, onCancel) {
        // すでに表示されているダイアログをクリア
        const existingDialog = document.querySelector('.confirm-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        // ダイアログの作成
        const dialogDiv = document.createElement('div');
        dialogDiv.className = 'confirm-dialog';
        
        dialogDiv.innerHTML = `
            <div class="confirm-dialog-content">
                <p>${message}</p>
                <div class="confirm-dialog-actions">
                    <button class="btn btn-secondary cancel-btn">キャンセル</button>
                    <button class="btn btn-primary confirm-btn">確認</button>
                </div>
            </div>
        `;
        
        // ページに追加
        document.body.appendChild(dialogDiv);
        
        // ボタンのイベントリスナー
        const confirmBtn = dialogDiv.querySelector('.confirm-btn');
        const cancelBtn = dialogDiv.querySelector('.cancel-btn');
        
        confirmBtn.addEventListener('click', () => {
            dialogDiv.remove();
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            dialogDiv.remove();
            if (typeof onCancel === 'function') {
                onCancel();
            }
        });
    }
    
    // ローディング表示の制御
    function showLoading(elementOrSelector, message = 'ロード中...') {
        let element;
        
        if (typeof elementOrSelector === 'string') {
            element = document.querySelector(elementOrSelector);
        } else {
            element = elementOrSelector;
        }
        
        if (!element) return;
        
        // 既存のコンテンツを保存
        element.dataset.originalContent = element.innerHTML;
        
        // ローディング表示に置き換え
        element.innerHTML = `<div class="loading">${message}</div>`;
    }
    
    function hideLoading(elementOrSelector) {
        let element;
        
        if (typeof elementOrSelector === 'string') {
            element = document.querySelector(elementOrSelector);
        } else {
            element = elementOrSelector;
        }
        
        if (!element) return;
        
        // 保存したコンテンツを復元
        if (element.dataset.originalContent) {
            element.innerHTML = element.dataset.originalContent;
            delete element.dataset.originalContent;
        }
    }
    
    // パブリックAPI
    return {
        init,
        navigateToPage,
        showFeedback,
        showConfirmDialog,
        showLoading,
        hideLoading,
        updateUsageStats
    };
})();

// モジュールの初期化
document.addEventListener('DOMContentLoaded', () => {
    uiModule.init();
});

// グローバルにエクスポート
window.ui = uiModule;