// テンプレート管理モジュール
const templatesModule = (function() {
    // プライベート変数
    let templates = [];
    let defaultTemplates = [];
    let customTemplates = [];
    
    // DOM要素
    const templatesListElement = document.getElementById('templates-list');
    const recentTemplatesElement = document.getElementById('recent-templates');
    const templateSearchInput = document.getElementById('template-search');
    const categorySelect = document.getElementById('category-select');
    const newTemplateBtn = document.getElementById('new-template-btn');
    const templateModal = document.getElementById('template-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const templateForm = document.getElementById('template-form');
    const templateNameInput = document.getElementById('template-name');
    const templateCategorySelect = document.getElementById('template-category');
    const templateContentInput = document.getElementById('template-content');
    const templateDescriptionInput = document.getElementById('template-description');
    
    // 初期化
    function init() {
        // イベントリスナーの設定
        if (newTemplateBtn) {
            newTemplateBtn.addEventListener('click', openNewTemplateModal);
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }
        
        if (templateForm) {
            templateForm.addEventListener('submit', saveTemplate);
        }
        
        if (templateSearchInput) {
            templateSearchInput.addEventListener('input', filterTemplates);
        }
        
        if (categorySelect) {
            categorySelect.addEventListener('change', filterTemplates);
        }
        
        // デフォルトテンプレートの読み込み
        loadDefaultTemplates();
        
        // カスタムテンプレートの読み込み
        loadCustomTemplates();
    }
    
    // デフォルトテンプレートの読み込み
    function loadDefaultTemplates() {
        // デモ用のデフォルトテンプレート
        defaultTemplates = [
            {
                id: 'default-1',
                name: 'ブログ記事の構成',
                category: 'creative',
                content: '次のトピックについて、魅力的なブログ記事の構成を作成してください: {{topic}}。\n\n以下を含めてください：\n1. 注目を集める見出し\n2. 導入部（読者の関心を引くもの）\n3. 主要セクション（3〜5つ）\n4. 各セクションの要点\n5. 記事の結論\n6. 読者へのコールトゥアクション',
                description: 'ブログ記事の構成を素早く作成するためのテンプレート',
                isDefault: true
            },
            {
                id: 'default-2',
                name: '会議の議事録',
                category: 'business',
                content: '以下の会議について、詳細な議事録を作成してください。\n\n会議名: {{meeting_name}}\n日時: {{date_time}}\n参加者: {{participants}}\n\n議題:\n{{agenda}}\n\n各議題について、以下を含めてください：\n1. 主な議論点\n2. 重要な決定事項\n3. アクションアイテム（担当者と期限を含む）\n4. 次回会議で取り上げる項目',
                description: '会議の議事録を効率的に作成するためのテンプレート',
                isDefault: true
            },
            {
                id: 'default-3',
                name: 'プログラミングコード説明',
                category: 'technical',
                content: '以下のコードを分析し、詳細に説明してください。コードの目的、機能、および改善点についてコメントしてください。\n\n```\n{{code}}\n```',
                description: 'コードの理解と説明のためのテンプレート',
                isDefault: true
            },
            {
                id: 'default-4',
                name: 'カスタマーサポート返信',
                category: 'business',
                content: '以下の顧客の問い合わせに対する、丁寧で解決策を提案する返信メールを作成してください。\n\n顧客の問い合わせ:\n{{customer_inquiry}}\n\n製品/サービス名: {{product_name}}\n\n以下を含める返信を作成してください：\n1. 丁寧な挨拶\n2. 問題に対する理解と共感を示す文\n3. 問題の解決策または次のステップ\n4. フォローアップの提案\n5. 丁寧な締めくくり',
                description: '顧客問い合わせへの効果的な返信のためのテンプレート',
                isDefault: true
            },
            {
                id: 'default-5',
                name: 'SWOT分析',
                category: 'business',
                content: '{{business_name}}について、詳細なSWOT分析を行ってください。\n\n以下の各セクションに、箇条書きで少なくとも5つの項目を含めてください：\n\n1. 強み（Strengths）：内部的な利点\n2. 弱み（Weaknesses）：内部的な課題\n3. 機会（Opportunities）：外部環境における潜在的なメリット\n4. 脅威（Threats）：外部環境における潜在的なリスク\n\n各項目について、簡潔な説明を追加してください。分析の最後に、主要な発見と推奨される戦略的アクションを要約してください。',
                description: 'ビジネスやプロジェクトのSWOT分析を行うためのテンプレート',
                isDefault: true
            }
        ];
        
        // テンプレート配列を更新
        templates = [...defaultTemplates, ...customTemplates];
        
        // UIの更新
        renderTemplatesList();
        renderRecentTemplatesList();
    }
    
    // カスタムテンプレートの読み込み（ローカルストレージから）
    function loadCustomTemplates() {
        try {
            const storedTemplates = localStorage.getItem('custom_templates');
            if (storedTemplates) {
                customTemplates = JSON.parse(storedTemplates);
                
                // テンプレート配列を更新
                templates = [...defaultTemplates, ...customTemplates];
                
                // UIの更新
                renderTemplatesList();
                renderRecentTemplatesList();
            }
        } catch (error) {
            console.error('カスタムテンプレートの読み込みエラー', error);
            customTemplates = [];
        }
    }
    
    // テンプレートリストのレンダリング
    function renderTemplatesList() {
        if (!templatesListElement) return;
        
        templatesListElement.innerHTML = '';
        
        if (templates.length === 0) {
            templatesListElement.innerHTML = '<div class="no-items">テンプレートがありません</div>';
            return;
        }
        
        // フィルタリングされたテンプレートのみを表示
        const filteredTemplates = getFilteredTemplates();
        
        if (filteredTemplates.length === 0) {
            templatesListElement.innerHTML = '<div class="no-items">条件に一致するテンプレートがありません</div>';
            return;
        }
        
        filteredTemplates.forEach(template => {
            const templateCard = document.createElement('div');
            templateCard.className = `template-card ${template.isDefault ? 'default' : 'custom'}`;
            templateCard.dataset.id = template.id;
            
            templateCard.innerHTML = `
                <div class="template-header">
                    <h3 class="template-title">${template.name}</h3>
                    <span class="template-category">${getCategoryLabel(template.category)}</span>
                </div>
                <div class="template-content">${truncateText(template.content, 150)}</div>
                <div class="template-actions">
                    <button class="btn btn-secondary btn-sm template-edit" data-id="${template.id}">編集</button>
                    <button class="btn btn-primary btn-sm template-use" data-id="${template.id}">使用</button>
                </div>
            `;
            
            templatesListElement.appendChild(templateCard);
            
            // 編集ボタンのイベントリスナー
            const editBtn = templateCard.querySelector('.template-edit');
            editBtn.addEventListener('click', () => {
                openEditTemplateModal(template.id);
            });
            
            // 使用ボタンのイベントリスナー
            const useBtn = templateCard.querySelector('.template-use');
            useBtn.addEventListener('click', () => {
                useTemplate(template.id);
            });
        });
    }
    
    // 最近使用したテンプレートリストのレンダリング
    function renderRecentTemplatesList() {
        if (!recentTemplatesElement) return;
        
        recentTemplatesElement.innerHTML = '';
        
        // 最近使用したテンプレートIDの取得（ローカルストレージから）
        let recentTemplateIds = [];
        try {
            const storedRecentTemplates = localStorage.getItem('recent_templates');
            if (storedRecentTemplates) {
                recentTemplateIds = JSON.parse(storedRecentTemplates);
            }
        } catch (error) {
            console.error('最近使用したテンプレートの読み込みエラー', error);
            recentTemplateIds = [];
        }
        
        if (recentTemplateIds.length === 0) {
            recentTemplatesElement.innerHTML = '<div class="no-items">最近使用したテンプレートはありません</div>';
            return;
        }
        
        // 最近使用したテンプレートの取得（最大5つ）
        const recentTemplates = recentTemplateIds
            .slice(0, 5)
            .map(id => templates.find(t => t.id === id))
            .filter(t => t); // undefinedを除外
        
        if (recentTemplates.length === 0) {
            recentTemplatesElement.innerHTML = '<div class="no-items">最近使用したテンプレートはありません</div>';
            return;
        }
        
        recentTemplates.forEach(template => {
            const listItem = document.createElement('li');
            listItem.className = 'template-list-item';
            listItem.innerHTML = `
                <div>
                    <span class="template-list-item-title">${template.name}</span>
                    <span class="template-list-item-category">${getCategoryLabel(template.category)}</span>
                </div>
                <button class="btn btn-primary btn-sm template-use" data-id="${template.id}">使用</button>
            `;
            
            recentTemplatesElement.appendChild(listItem);
            
            // 使用ボタンのイベントリスナー
            const useBtn = listItem.querySelector('.template-use');
            useBtn.addEventListener('click', () => {
                useTemplate(template.id);
            });
        });
    }
    
    // フィルタリングされたテンプレートの取得
    function getFilteredTemplates() {
        if (!templateSearchInput || !categorySelect) {
            return templates;
        }
        
        const searchTerm = templateSearchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value;
        
        return templates.filter(template => {
            // カテゴリフィルター
            const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
            
            // 検索語フィルター
            const searchMatch = template.name.toLowerCase().includes(searchTerm) ||
                              template.content.toLowerCase().includes(searchTerm) ||
                              (template.description && template.description.toLowerCase().includes(searchTerm));
            
            return categoryMatch && searchMatch;
        });
    }
    
    // テンプレートのフィルタリング
    function filterTemplates() {
        renderTemplatesList();
    }
    
    // 新規テンプレート作成モーダルを開く
    function openNewTemplateModal() {
        // モーダルタイトルの更新
        document.getElementById('modal-title').textContent = '新規テンプレート作成';
        
        // フォームのクリア
        templateForm.reset();
        templateNameInput.value = '';
        templateCategorySelect.value = 'general';
        templateContentInput.value = '';
        templateDescriptionInput.value = '';
        
        // 編集中のテンプレートIDをクリア
        templateForm.dataset.templateId = '';
        
        // モーダルを表示
        templateModal.classList.remove('hidden');
    }
    
    // テンプレート編集モーダルを開く
    function openEditTemplateModal(templateId) {
        // テンプレートの取得
        const template = templates.find(t => t.id === templateId);
        if (!template) return;
        
        // モーダルタイトルの更新
        document.getElementById('modal-title').textContent = 'テンプレート編集';
        
        // フォームに値をセット
        templateNameInput.value = template.name;
        templateCategorySelect.value = template.category;
        templateContentInput.value = template.content;
        templateDescriptionInput.value = template.description || '';
        
        // 編集中のテンプレートIDをセット
        templateForm.dataset.templateId = templateId;
        
        // モーダルを表示
        templateModal.classList.remove('hidden');
    }
    
    // モーダルを閉じる
    function closeModal() {
        templateModal.classList.add('hidden');
    }
    
    // テンプレートの保存
    function saveTemplate(e) {
        e.preventDefault();
        
        // フォームから値を取得
        const name = templateNameInput.value;
        const category = templateCategorySelect.value;
        const content = templateContentInput.value;
        const description = templateDescriptionInput.value;
        
        // 編集中のテンプレートIDを取得
        const templateId = templateForm.dataset.templateId;
        
        if (templateId) {
            // 既存テンプレートの更新
            const template = templates.find(t => t.id === templateId);
            
            if (template) {
                // デフォルトテンプレートは編集不可
                if (template.isDefault) {
                    // デフォルトテンプレートの場合は、新しいカスタムテンプレートとして保存
                    saveNewTemplate(name, category, content, description);
                } else {
                    // カスタムテンプレートの更新
                    updateCustomTemplate(templateId, name, category, content, description);
                }
            }
        } else {
            // 新規テンプレートの保存
            saveNewTemplate(name, category, content, description);
        }
        
        // モーダルを閉じる
        closeModal();
    }
    
    // 新規テンプレートの保存
    function saveNewTemplate(name, category, content, description) {
        // 新しいテンプレートオブジェクトの作成
        const newTemplate = {
            id: 'custom-' + Date.now(),
            name,
            category,
            content,
            description,
            isDefault: false,
            createdAt: new Date().toISOString()
        };
        
        // カスタムテンプレート配列に追加
        customTemplates.push(newTemplate);
        
        // テンプレート配列の更新
        templates = [...defaultTemplates, ...customTemplates];
        
        // ローカルストレージに保存
        saveCustomTemplatesToLocalStorage();
        
        // UIの更新
        renderTemplatesList();
    }
    
    // カスタムテンプレートの更新
    function updateCustomTemplate(templateId, name, category, content, description) {
        // テンプレートのインデックスを検索
        const templateIndex = customTemplates.findIndex(t => t.id === templateId);
        
        if (templateIndex !== -1) {
            // テンプレートの更新
            customTemplates[templateIndex] = {
                ...customTemplates[templateIndex],
                name,
                category,
                content,
                description,
                updatedAt: new Date().toISOString()
            };
            
            // テンプレート配列の更新
            templates = [...defaultTemplates, ...customTemplates];
            
            // ローカルストレージに保存
            saveCustomTemplatesToLocalStorage();
            
            // UIの更新
            renderTemplatesList();
        }
    }
    
    // テンプレートの使用
    function useTemplate(templateId) {
        // テンプレートの取得
        const template = templates.find(t => t.id === templateId);
        if (!template) return;
        
        // 最近使用したテンプレートリストの更新
        updateRecentTemplates(templateId);
        
        // 使用回数のインクリメント
        incrementUsageCount();
        
        // テンプレート実行ページに移動
        navigateToRunTemplatePage(template);
    }
    
    // 最近使用したテンプレートリストの更新
    function updateRecentTemplates(templateId) {
        // 最近使用したテンプレートIDの取得（ローカルストレージから）
        let recentTemplateIds = [];
        try {
            const storedRecentTemplates = localStorage.getItem('recent_templates');
            if (storedRecentTemplates) {
                recentTemplateIds = JSON.parse(storedRecentTemplates);
            }
        } catch (error) {
            console.error('最近使用したテンプレートの読み込みエラー', error);
            recentTemplateIds = [];
        }
        
        // 既存のIDを削除（重複を避けるため）
        const filteredIds = recentTemplateIds.filter(id => id !== templateId);
        
        // リストの先頭に新しいIDを追加
        filteredIds.unshift(templateId);
        
        // 最大10個に制限
        const updatedIds = filteredIds.slice(0, 10);
        
        // ローカルストレージに保存
        localStorage.setItem('recent_templates', JSON.stringify(updatedIds));
        
        // UIの更新
        renderRecentTemplatesList();
    }
    
    // 使用回数のインクリメント
    function incrementUsageCount() {
        // 使用回数の取得（ローカルストレージから）
        let usageCount = parseInt(localStorage.getItem('usage_count') || '0');
        
        // インクリメント
        usageCount++;
        
        // ローカルストレージに保存
        localStorage.setItem('usage_count', usageCount.toString());
        
        // ダッシュボードの更新（もし表示されていれば）
        const usageCountElement = document.getElementById('usage-count');
        if (usageCountElement) {
            usageCountElement.textContent = usageCount;
        }
    }
    
    // テンプレート実行ページへの移動
    function navigateToRunTemplatePage(template) {
        // すべてのページを非表示
        const pages = document.querySelectorAll('.app-page');
        pages.forEach(page => page.classList.add('hidden'));
        
        // テンプレート実行ページを表示
        const runTemplatePage = document.getElementById('run-template-page');
        runTemplatePage.classList.remove('hidden');
        
        // アクティブなナビゲーションを更新
        updateActiveNavigation('templates');
        
        // テンプレートタイトルの設定
        document.getElementById('run-template-title').textContent = `テンプレート実行: ${template.name}`;
        
        // プロンプトプレビューの設定
        document.getElementById('prompt-preview').textContent = template.content;
        
        // 変数入力フォームの生成
        generateVariablesForm(template.content);
        
        // 実行ボタンの設定
        const runPromptBtn = document.getElementById('run-prompt-btn');
        runPromptBtn.onclick = () => {
            runPrompt(template);
        };
    }
    
    // 変数入力フォームの生成
    function generateVariablesForm(content) {
        const variablesForm = document.getElementById('variables-form');
        variablesForm.innerHTML = '';
        
        // 変数の抽出（{{variable}}形式）
        const variableRegex = /\{\{([^}]+)\}\}/g;
        const variables = new Set();
        let match;
        
        while ((match = variableRegex.exec(content)) !== null) {
            variables.add(match[1]);
        }
        
        if (variables.size === 0) {
            variablesForm.innerHTML = '<p>このテンプレートには変数がありません。</p>';
            return;
        }
        
        // 変数ごとに入力フィールドを生成
        variables.forEach(variable => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            const variableLabel = variable.replace(/_/g, ' '); // アンダースコアをスペースに変換
            
            formGroup.innerHTML = `
                <label for="var-${variable}">${variableLabel}</label>
                <input type="text" id="var-${variable}" class="variable-input" data-var="${variable}">
            `;
            
            variablesForm.appendChild(formGroup);
        });
    }
    
    // プロンプトの実行
    function runPrompt(template) {
        // 変数値の取得
        const variables = {};
        const variableInputs = document.querySelectorAll('.variable-input');
        
        variableInputs.forEach(input => {
            const varName = input.dataset.var;
            variables[varName] = input.value;
        });
        
        // 変数の置換
        let prompt = template.content;
        
        for (const [varName, varValue] of Object.entries(variables)) {
            const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
            prompt = prompt.replace(regex, varValue);
        }
        
        // APIキーの確認
        const apiKey = localStorage.getItem('openai_api_key');
        
        if (!apiKey) {
            alert('OpenAI APIキーが設定されていません。API設定ページで設定してください。');
            return;
        }
        
        // ローディング表示
        const aiResponse = document.getElementById('ai-response');
        aiResponse.innerHTML = '<div class="loading">AIからの応答を取得中...</div>';
        
        // APIモデルの取得
        const model = document.getElementById('openai-model')?.value || 'gpt-3.5-turbo';
        
        // API呼び出し
        if (window.api) {
            window.api.callOpenAI(prompt, model)
                .then(response => {
                    // 応答の表示
                    aiResponse.textContent = response;
                    
                    // コピーボタンと保存ボタンの有効化
                    document.getElementById('copy-response-btn').onclick = () => {
                        copyToClipboard(response);
                    };
                    
                    document.getElementById('save-response-btn').onclick = () => {
                        saveResponseToFile(response, template.name);
                    };
                })
                .catch(error => {
                    aiResponse.innerHTML = `<div class="error">エラーが発生しました: ${error.message}</div>`;
                });
        } else {
            aiResponse.innerHTML = '<div class="error">API接続モジュールが読み込まれていません。</div>';
        }
    }
    
    // カスタムテンプレートをローカルストレージに保存
    function saveCustomTemplatesToLocalStorage() {
        localStorage.setItem('custom_templates', JSON.stringify(customTemplates));
    }
    
    // クリップボードにコピー
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert('クリップボードにコピーしました。');
            })
            .catch(err => {
                console.error('クリップボードへのコピーに失敗しました', err);
                alert('クリップボードへのコピーに失敗しました。');
            });
    }
    
    // 応答をファイルに保存
    function saveResponseToFile(text, templateName) {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 現在の日時
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10);
        const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, '-');
        
        // ファイル名
        a.download = `${templateName}_${dateStr}_${timeStr}.txt`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // ユーティリティ関数
    
    // テキストの切り詰め
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    }
    
    // カテゴリラベルの取得
    function getCategoryLabel(category) {
        const categories = {
            'general': '一般',
            'business': 'ビジネス',
            'creative': 'クリエイティブ',
            'technical': '技術'
        };
        
        return categories[category] || category;
    }
    
    // アクティブなナビゲーションの更新
    function updateActiveNavigation(activePage) {
        // ナビゲーションリンクのアクティブ状態を更新
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.dataset.page === activePage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // パブリックAPI
    return {
        init,
        loadDefaultTemplates,
        loadCustomTemplates,
        renderTemplatesList,
        renderRecentTemplatesList,
        getTemplate: (templateId) => templates.find(t => t.id === templateId),
        getAllTemplates: () => [...templates],
        getDefaultTemplates: () => [...defaultTemplates],
        getCustomTemplates: () => [...customTemplates]
    };
})();

// モジュールの初期化
document.addEventListener('DOMContentLoaded', () => {
    templatesModule.init();
});

// グローバルにエクスポート
window.templates = templatesModule;