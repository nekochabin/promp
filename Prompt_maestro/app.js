// メインアプリケーションモジュール
const appModule = (function() {
    // アプリケーションの状態
    let appState = {
        initialized: false,
        currentPage: null,
        darkMode: false
    };
    
    // 初期化
    function init() {
        console.log('Prompt Maestro初期化中...');
        
        // 各モジュールが初期化されたことを確認
        if (!window.auth || !window.templates || !window.api || !window.ui) {
            console.error('必要なモジュールが初期化されていません');
            return;
        }
        
        // ダークモード設定の読み込み
        loadDarkModePreference();
        
        // イベントリスナーの設定
        setupEventListeners();
        
        // 認証状態によるルーティング
        setupAuthStateRouting();
        
        appState.initialized = true;
        console.log('Prompt Maestro初期化完了');
    }
    
    // イベントリスナーの設定
    function setupEventListeners() {
        // コピーボタンのデフォルト処理
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('copy-btn')) {
                const textToCopy = e.target.dataset.copy;
                if (textToCopy) {
                    copyToClipboard(textToCopy);
                }
            }
        });
        
        // アプリ全体のキーボードショートカット
        document.addEventListener('keydown', function(e) {
            // Escキーでモーダルを閉じる
            if (e.key === 'Escape') {
                const visibleModals = document.querySelectorAll('.modal:not(.hidden)');
                if (visibleModals.length > 0) {
                    visibleModals.forEach(modal => {
                        modal.classList.add('hidden');
                    });
                }
            }
            
            // Ctrl+/でショートカット一覧を表示（将来的に実装）
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                showShortcutsList();
            }
        });
    }
    
    // 認証状態によるルーティング
    function setupAuthStateRouting() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // ユーザーがログインしている場合
                console.log('ユーザーログイン済み:', user.email);
                
                // ローカルストレージからAPIキーを確認
                const apiKey = localStorage.getItem('openai_api_key');
                
                if (!apiKey) {
                    // APIキーが設定されていない場合はAPI設定ページに誘導
                    window.ui.navigateToPage('api-settings');
                    window.ui.showFeedback('APIキーを設定してください', 'info');
                } else {
                    // APIキーが設定されている場合はダッシュボードに移動
                    window.ui.navigateToPage('dashboard');
                }
            } else {
                // ユーザーがログアウトしている場合
                console.log('ユーザーログアウト状態');
                window.ui.navigateToPage('auth');
            }
        });
    }
    
    // ダークモード設定の読み込み
    function loadDarkModePreference() {
        const darkMode = localStorage.getItem('dark_mode') === 'true';
        appState.darkMode = darkMode;
        
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
    
    // ダークモードの切り替え
    function toggleDarkMode() {
        appState.darkMode = !appState.darkMode;
        
        if (appState.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        localStorage.setItem('dark_mode', appState.darkMode);
    }
    
    // クリップボードにコピー
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                window.ui.showFeedback('クリップボードにコピーしました', 'success');
            })
            .catch(err => {
                console.error('クリップボードへのコピーに失敗しました', err);
                window.ui.showFeedback('クリップボードへのコピーに失敗しました', 'error');
            });
    }
    
    // ショートカット一覧の表示（将来的に実装）
    function showShortcutsList() {
        console.log('ショートカット一覧を表示します（開発中）');
        // フェーズ2で実装予定
    }
    
    // バージョン情報の取得
    function getAppVersion() {
        return {
            version: '0.1.0',
            phase: 'alpha',
            releaseDate: '2025-03-10'
        };
    }
    
    // デバッグモード
    function enableDebugMode() {
        localStorage.setItem('debug_mode', 'true');
        console.log('デバッグモードが有効になりました');
        return true;
    }
    
    function disableDebugMode() {
        localStorage.setItem('debug_mode', 'false');
        console.log('デバッグモードが無効になりました');
        return false;
    }
    
    function isDebugMode() {
        return localStorage.getItem('debug_mode') === 'true';
    }
    
    // パブリックAPI
    return {
        init,
        getAppVersion,
        toggleDarkMode,
        isDebugMode,
        enableDebugMode,
        disableDebugMode
    };
})();

// DOMコンテンツの読み込み完了時にアプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
    appModule.init();
});

// グローバルにエクスポート
window.app = appModule;