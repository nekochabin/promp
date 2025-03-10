// AI API連携モジュール
const apiModule = (function() {
    // DOM要素
    const openaiApiForm = document.getElementById('openai-api-form');
    const openaiApiKey = document.getElementById('openai-api-key');
    const openaiModel = document.getElementById('openai-model');
    
    // 初期化
    function init() {
        // APIキー設定フォームのイベントリスナー
        if (openaiApiForm) {
            openaiApiForm.addEventListener('submit', saveApiSettings);
        }
        
        // ローカルストレージからAPIキーを復元
        if (openaiApiKey) {
            const savedApiKey = localStorage.getItem('openai_api_key');
            if (savedApiKey) {
                openaiApiKey.value = savedApiKey;
            }
        }
        
        // ローカルストレージからモデル設定を復元
        if (openaiModel) {
            const savedModel = localStorage.getItem('openai_model');
            if (savedModel) {
                openaiModel.value = savedModel;
            }
        }
    }
    
    // API設定の保存
    function saveApiSettings(e) {
        e.preventDefault();
        
        // OpenAI APIキーの保存
        if (openaiApiKey && openaiApiKey.value) {
            localStorage.setItem('openai_api_key', openaiApiKey.value);
        }
        
        // OpenAIモデルの保存
        if (openaiModel && openaiModel.value) {
            localStorage.setItem('openai_model', openaiModel.value);
        }
        
        alert('API設定を保存しました。');
    }
    
    // OpenAI APIの呼び出し
    async function callOpenAI(prompt, model = 'gpt-3.5-turbo') {
        const apiKey = localStorage.getItem('openai_api_key');
        
        if (!apiKey) {
            throw new Error('OpenAI APIキーが設定されていません。');
        }
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: 'あなたは優秀なAIアシスタントです。ユーザーの指示に従って適切な回答を提供してください。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'OpenAI APIエラー');
            }
            
            const data = await response.json();
            return data.choices[0].message.content.trim();
            
        } catch (error) {
            console.error('OpenAI API呼び出しエラー', error);
            throw error;
        }
    }
    
    // Claude APIの呼び出し（フェーズ2で実装）
    async function callClaude(prompt) {
        throw new Error('Claude APIは現在実装中です。');
    }
    
    // Google AI APIの呼び出し（フェーズ2で実装）
    async function callGoogleAI(prompt) {
        throw new Error('Google AI APIは現在実装中です。');
    }
    
    // 複数APIモデルの取得（設定用）
    function getAvailableModels() {
        return {
            openai: [
                { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
                { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
                { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' }
            ],
            claude: [
                { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic' },
                { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
                { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' }
            ],
            google: [
                { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' }
            ]
        };
    }
    
    // パブリックAPI
    return {
        init,
        callOpenAI,
        callClaude,
        callGoogleAI,
        getAvailableModels,
        saveApiSettings
    };
})();

// モジュールの初期化
document.addEventListener('DOMContentLoaded', () => {
    apiModule.init();
});

// グローバルにエクスポート
window.api = apiModule;