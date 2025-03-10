// Firebase設定
const firebaseConfig = {
    // ⚠️ 実際のプロジェクトでは、以下の情報を自分のFirebase設定で置き換えてください
    apiKey: "AIzaSyDkF0vwFUIskRNckvu5yJx1-cG90bSkR6s",
    authDomain: "prompt-maestro.firebaseapp.com",
    projectId: "prompt-maestro",
    storageBucket: "prompt-maestro.firebasestorage.app",
    messagingSenderId: "407736755767",
    appId: "1:407736755767:web:ed58e7adfaf961cb7441b2",
    measurementId: "G-X1S43WJ9TE"
};

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM要素
const loginForm = document.getElementById('login-form-element');
const signupForm = document.getElementById('signup-form-element');
const logoutBtn = document.getElementById('logout-btn');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const showLoginLink = document.getElementById('show-login');
const showSignupLink = document.getElementById('show-signup');
const loginFormDiv = document.getElementById('login-form');
const signupFormDiv = document.getElementById('signup-form');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const loginArea = document.getElementById('login-area');

// 認証状態の監視
let currentUser = null;
auth.onAuthStateChanged((user) => {
    if (user) {
        // ユーザーがログインしている場合
        currentUser = user;
        userInfo.classList.remove('hidden');
        loginArea.classList.add('hidden');
        userName.textContent = user.displayName || user.email;
        
        // ユーザーデータをFirestoreから取得
        getUserData(user.uid);
        
        // ローカルストレージのAPIキー設定を確認
        checkLocalStorageAPIKeys();
        
        // ログイン画面を非表示にし、ダッシュボードを表示
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('dashboard-page').classList.remove('hidden');
        
        // アクティブなナビゲーションを更新
        updateActiveNavigation('dashboard');
    } else {
        // ユーザーがログアウトしている場合
        currentUser = null;
        userInfo.classList.add('hidden');
        loginArea.classList.remove('hidden');
        
        // ダッシュボードを非表示にし、ログイン画面を表示
        document.getElementById('dashboard-page').classList.add('hidden');
        document.getElementById('auth-page').classList.remove('hidden');
    }
});

// ログインフォームの送信処理
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Firebase認証
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('ログイン成功', userCredential.user);
            // ログイン成功時の処理は、onAuthStateChangedで行う
        })
        .catch((error) => {
            console.error('ログインエラー', error);
            alert(`ログインエラー: ${error.message}`);
        });
});

// サインアップフォームの送信処理
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    // Firebase認証でユーザー作成
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('サインアップ成功', userCredential.user);
            
            // ユーザープロファイルの更新
            return userCredential.user.updateProfile({
                displayName: name
            }).then(() => {
                // Firestoreにユーザーデータを保存
                return db.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    // 初期設定
                    apiSettings: {
                        openai: {
                            model: 'gpt-3.5-turbo'
                        }
                    }
                });
            });
        })
        .catch((error) => {
            console.error('サインアップエラー', error);
            alert(`サインアップエラー: ${error.message}`);
        });
});

// ログアウト処理
logoutBtn.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            console.log('ログアウト成功');
            // ログアウト成功時の処理は、onAuthStateChangedで行う
        })
        .catch((error) => {
            console.error('ログアウトエラー', error);
            alert(`ログアウトエラー: ${error.message}`);
        });
});

// ログイン/サインアップフォームの切り替え
loginBtn.addEventListener('click', showLoginForm);
signupBtn.addEventListener('click', showSignupForm);
showLoginLink.addEventListener('click', showLoginForm);
showSignupLink.addEventListener('click', showSignupForm);

function showLoginForm(e) {
    if (e) e.preventDefault();
    loginFormDiv.classList.remove('hidden');
    signupFormDiv.classList.add('hidden');
}

function showSignupForm(e) {
    if (e) e.preventDefault();
    loginFormDiv.classList.add('hidden');
    signupFormDiv.classList.remove('hidden');
}

// ユーザーデータの取得
function getUserData(userId) {
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                console.log('ユーザーデータ', userData);
                
                // APIモデル設定の更新
                if (userData.apiSettings && userData.apiSettings.openai) {
                    const openaiModel = document.getElementById('openai-model');
                    
                    if (openaiModel) {
                        openaiModel.value = userData.apiSettings.openai.model || 'gpt-3.5-turbo';
                    }
                }
                
                // ユーザーデータに基づいて他のUIを更新
                if (window.templates) {
                    window.templates.loadUserTemplates();
                }
                updateUsageStats();
            } else {
                console.log('ユーザーデータが存在しません');
                // 新規ユーザーの場合、デフォルトのデータを作成
                db.collection('users').doc(userId).set({
                    name: auth.currentUser.displayName || '',
                    email: auth.currentUser.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    apiSettings: {
                        openai: {
                            model: 'gpt-3.5-turbo'
                        }
                    }
                });
            }
        })
        .catch((error) => {
            console.error('ユーザーデータの取得エラー', error);
        });
}

// ローカルストレージのAPIキー設定を確認
function checkLocalStorageAPIKeys() {
    const openaiApiKey = localStorage.getItem('openai_api_key');
    if (openaiApiKey) {
        document.getElementById('openai-api-key').value = openaiApiKey;
    }
}

// 使用状況統計の更新
function updateUsageStats() {
    if (!currentUser) return;
    
    // 使用回数の取得（LocalStorageから）
    const usageCount = parseInt(localStorage.getItem('usage_count') || '0');
    document.getElementById('usage-count').textContent = usageCount;
    
    // テンプレート数の取得（LocalStorageから）
    const templates = JSON.parse(localStorage.getItem('custom_templates') || '[]');
    document.getElementById('template-count').textContent = templates.length;
    
    // フェーズ2では、これらのデータをFirestoreから取得するように拡張
}

// グローバルにエクスポート
window.auth = {
    getCurrentUser: () => currentUser,
    getUserData
};