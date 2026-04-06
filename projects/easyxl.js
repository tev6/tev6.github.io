javascript:
(function() {
    'use strict';

    if (typeof GM_addStyle !== 'undefined' && typeof GM_getResourceText !== 'undefined') {
        const css = GM_getResourceText('KATEX_CSS');
        if (css) GM_addStyle(css);
    } else {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
        document.head.appendChild(link);
    }

    const UI_ID = 'easyxl-kouri-ui';
    const STORAGE_KEY_API = 'easyxl_kouri_api_key';
    const STORAGE_KEY_MODEL = 'easyxl_kouri_model';

    if (document.getElementById(UI_ID)) {
        console.log('EasyXL UI is already open.');
        return;
    }

    const ui = document.createElement('div');
    ui.id = UI_ID;
    ui.style.position = 'fixed';
    ui.style.bottom = '20px';
    ui.style.right = '20px';
    ui.style.width = '360px';
    // Remove fixed height to let the result box expand automatically if needed
    ui.style.background = 'linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.58) 100%)';
    ui.style.border = '1px solid rgba(255, 255, 255, 0.45)';
    ui.style.borderRadius = '14px';
    ui.style.boxShadow = '0 18px 55px rgba(2, 6, 23, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.40)';
    ui.style.backdropFilter = 'blur(18px) saturate(180%)';
    ui.style.webkitBackdropFilter = 'blur(18px) saturate(180%)';
    ui.style.zIndex = '999999';
    ui.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, 'Noto Sans', 'Helvetica Neue', sans-serif";
    ui.style.padding = '14px';
    ui.style.display = 'flex';
    ui.style.flexDirection = 'column';
    ui.style.gap = '10px';
    ui.style.color = '#0f172a';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'flex-start';
    header.style.alignItems = 'center';
    header.style.paddingBottom = '10px';
    header.style.borderBottom = '1px solid rgba(148, 163, 184, 0.25)';

    const titleWrap = document.createElement('div');
    titleWrap.style.display = 'flex';
    titleWrap.style.alignItems = 'center';
    titleWrap.style.gap = '10px';

    const title = document.createElement('div');
    title.innerText = 'EasyXL';
    title.style.margin = '0';
    title.style.fontSize = '14px';
    title.style.fontWeight = '700';
    title.style.letterSpacing = '0.2px';

    const badge = document.createElement('span');
    badge.innerText = 'Kouri';
    badge.style.fontSize = '11px';
    badge.style.fontWeight = '700';
    badge.style.padding = '3px 8px';
    badge.style.borderRadius = '999px';
    badge.style.background = 'rgba(37, 99, 235, 0.10)';
    badge.style.color = '#1d4ed8';
    badge.style.border = '1px solid rgba(37, 99, 235, 0.18)';

    titleWrap.appendChild(title);
    titleWrap.appendChild(badge);
    header.appendChild(titleWrap);
    ui.appendChild(header);

    function applyFieldStyle(el) {
        el.style.width = '100%';
        el.style.padding = '10px 10px';
        el.style.border = '1px solid rgba(255, 255, 255, 0.55)';
        el.style.borderRadius = '12px';
        el.style.background = 'rgba(255, 255, 255, 0.55)';
        el.style.color = '#0f172a';
        el.style.outline = 'none';
        el.style.boxSizing = 'border-box';
        el.style.fontSize = '13px';
    }

    function addFocusRing(el) {
        el.addEventListener('focus', () => {
            el.style.borderColor = 'rgba(37, 99, 235, 0.65)';
            el.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.16)';
        });
        el.addEventListener('blur', () => {
            el.style.borderColor = 'rgba(148, 163, 184, 0.45)';
            el.style.boxShadow = 'none';
        });
    }

    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'text';
    apiKeyInput.placeholder = 'Kouri API Key (sk-...)';
    apiKeyInput.value = localStorage.getItem(STORAGE_KEY_API) || '';
    applyFieldStyle(apiKeyInput);
    addFocusRing(apiKeyInput);
    apiKeyInput.onchange = (e) => localStorage.setItem(STORAGE_KEY_API, e.target.value);
    ui.appendChild(apiKeyInput);

    const modelInput = document.createElement('input');
    modelInput.type = 'text';
    modelInput.placeholder = 'Model (e.g., gpt-4o)';
    modelInput.value = localStorage.getItem(STORAGE_KEY_MODEL) || 'gpt-4o';
    applyFieldStyle(modelInput);
    addFocusRing(modelInput);
    modelInput.onchange = (e) => localStorage.setItem(STORAGE_KEY_MODEL, e.target.value);
    ui.appendChild(modelInput);

    // User Notes Input
    const notesLabel = document.createElement('label');
    notesLabel.innerText = '用户注释 (Optional):';
    notesLabel.style.display = 'block';
    notesLabel.style.marginBottom = '5px';
    notesLabel.style.fontSize = '12px';
    notesLabel.style.color = '#64748b';
    ui.appendChild(notesLabel);

    const notesInput = document.createElement('textarea');
    notesInput.placeholder = '添加自定义指令，如：只输出最终答案...';
    notesInput.style.height = '50px';
    notesInput.style.resize = 'vertical';
    notesInput.value = localStorage.getItem('easyxl_kouri_notes') || '';
    notesInput.addEventListener('input', () => {
        localStorage.setItem('easyxl_kouri_notes', notesInput.value);
    });
    applyFieldStyle(notesInput);
    addFocusRing(notesInput);
    ui.appendChild(notesInput);

    const parseBtn = document.createElement('button');
    parseBtn.innerText = 'Parse & Solve';
    parseBtn.style.padding = '10px 12px';
    parseBtn.style.border = '1px solid rgba(30, 64, 175, 0.20)';
    parseBtn.style.borderRadius = '12px';
    parseBtn.style.cursor = 'pointer';
    parseBtn.style.fontWeight = '700';
    parseBtn.style.letterSpacing = '0.2px';
    parseBtn.style.color = '#ffffff';
    parseBtn.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';
    parseBtn.style.boxShadow = '0 10px 24px rgba(37, 99, 235, 0.22)';
    parseBtn.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease';
    parseBtn.onmouseover = () => {
        if (parseBtn.disabled) return;
        parseBtn.style.filter = 'brightness(1.03)';
        parseBtn.style.transform = 'translateY(-1px)';
        parseBtn.style.boxShadow = '0 14px 30px rgba(37, 99, 235, 0.24)';
    };
    parseBtn.onmouseout = () => {
        parseBtn.style.filter = 'none';
        parseBtn.style.transform = 'none';
        parseBtn.style.boxShadow = '0 10px 24px rgba(37, 99, 235, 0.22)';
    };
    ui.appendChild(parseBtn);

    const resultArea = document.createElement('div');
    resultArea.style.height = '160px';
    resultArea.style.overflowY = 'auto';
    resultArea.style.wordWrap = 'break-word';
    resultArea.innerHTML = '<span style="color: #64748b;">Result will appear here...</span>';
    applyFieldStyle(resultArea);
    addFocusRing(resultArea);
    // Extra styles for markdown content rendering
    resultArea.style.fontSize = '14px';
    resultArea.style.lineHeight = '1.5';
    resultArea.style.userSelect = 'text';
    ui.appendChild(resultArea);

    document.body.appendChild(ui);

    function renderMarkdownWithMath(text) {
        if (!text) return '';
        
        // 1. Extract math blocks and replace with placeholders
        const mathBlocks = [];
        let processedText = text;

        // Block math: \[ ... \] or $$ ... $$
        processedText = processedText.replace(/\\\[([\s\S]*?)\\\]/g, (match, p1) => {
            mathBlocks.push({ type: 'block', text: p1 });
            return `%%%MATH_BLOCK_${mathBlocks.length - 1}%%%`;
        });
        processedText = processedText.replace(/\$\$([\s\S]*?)\$\$/g, (match, p1) => {
            mathBlocks.push({ type: 'block', text: p1 });
            return `%%%MATH_BLOCK_${mathBlocks.length - 1}%%%`;
        });

        // Inline math: \( ... \) or $ ... $
        processedText = processedText.replace(/\\\(([\s\S]*?)\\\)/g, (match, p1) => {
            mathBlocks.push({ type: 'inline', text: p1 });
            return `%%%MATH_INLINE_${mathBlocks.length - 1}%%%`;
        });
        processedText = processedText.replace(/(^|[^\\])\$([^\$]+?)\$/g, (match, p1, p2) => {
            mathBlocks.push({ type: 'inline', text: p2 });
            return `${p1}%%%MATH_INLINE_${mathBlocks.length - 1}%%%`;
        });

        // 2. Parse Markdown
        let html = '';
        if (typeof marked !== 'undefined') {
            html = marked.parse(processedText);
        } else {
            // Fallback if marked is not loaded
            html = processedText.replace(/\n/g, '<br>');
        }

        // 3. Restore math blocks and render with KaTeX
        if (typeof katex !== 'undefined') {
            html = html.replace(/%%%MATH_BLOCK_(\d+)%%%/g, (match, i) => {
                const block = mathBlocks[i];
                try {
                    return katex.renderToString(block.text, { displayMode: true, throwOnError: false });
                } catch (e) {
                    return `\\[${block.text}\\]`;
                }
            });

            html = html.replace(/%%%MATH_INLINE_(\d+)%%%/g, (match, i) => {
                const block = mathBlocks[i];
                try {
                    return katex.renderToString(block.text, { displayMode: false, throwOnError: false });
                } catch (e) {
                    return `\\(${block.text}\\)`;
                }
            });
        } else {
            // Fallback if katex is not loaded
            html = html.replace(/%%%MATH_BLOCK_(\d+)%%%/g, (match, i) => `\\[${mathBlocks[i].text}\\]`);
            html = html.replace(/%%%MATH_INLINE_(\d+)%%%/g, (match, i) => `\\(${mathBlocks[i].text}\\)`);
        }

        return html;
    }

    function setResult(content, isError = false) {
        if (isError) {
            resultArea.innerHTML = `<span style="color: #ef4444; font-weight: 500;">${content.replace(/\n/g, '<br>')}</span>`;
        } else {
            resultArea.innerHTML = renderMarkdownWithMath(content);
        }
    }

    function setButtonIdle() {
        parseBtn.innerText = 'Parse & Solve';
        parseBtn.disabled = false;
        parseBtn.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';
        parseBtn.style.boxShadow = '0 10px 24px rgba(37, 99, 235, 0.22)';
    }

    function setButtonBusy() {
        parseBtn.innerText = 'Solving...';
        parseBtn.disabled = true;
        parseBtn.style.background = 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
        parseBtn.style.boxShadow = 'none';
        parseBtn.style.transform = 'none';
        parseBtn.style.filter = 'none';
    }

    parseBtn.onclick = () => {
        const apiKey = apiKeyInput.value.trim();
        const model = modelInput.value.trim() || 'deepseek-chat';

        if (!apiKey) {
            alert('Please enter your Kouri API Key.');
            return;
        }

        const section = document.querySelector('section.ixl-practice-crate') ||
                        document.querySelector('section.question-and-submission-view') ||
                        document.querySelector('section.question-view');

        if (!section) {
            setResult('Error: Could not find question HTML on this page.', true);
            return;
        }

        const rawHtml = section.outerHTML;

        const systemPrompt = "You are an expert math solver. Your task is to: 1. **Analyze the provided HTML code block** to determine the exact math problem. Convert all ambiguous notation into a clear mathematical text string. 2. **Solve the problem step-by-step.** Follow standard order of operations (PEMDAS/BODMAS). Write down your solving steps. 3. **Format your final output:** You MUST enclose your final, concise answer within <answer>...</answer> tags. For example: <answer>42</answer> or <answer>x = 5</answer>.";
        let userPrompt = `--- START QUESTION HTML ---\n${rawHtml}\n--- END QUESTION HTML ---`;

        const userNotes = notesInput.value.trim();
        if (userNotes) {
            userPrompt += `\n\n--- USER NOTES ---\n${userNotes}\n--- END USER NOTES ---`;
        }

        setButtonBusy();
        setResult('Sending request to AI...');

        if (typeof GM_xmlhttpRequest !== "undefined") {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://api.kourichat.com/v1/chat/completions",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                data: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.0
                }),
                onload: function(response) {
                    if (response.status >= 200 && response.status < 300) {
                        try {
                            const data = JSON.parse(response.responseText);
                            const text = data.choices?.[0]?.message?.content?.trim?.() || response.responseText;
                            const match = text.match(/<answer>([\s\S]*?)<\/answer>/i);
                            setResult(match ? match[1].trim() : text);
                        } catch (e) {
                            setResult(`Parse Error: ${e.message}\nRaw: ${response.responseText}`, true);
                        }
                    } else {
                        setResult(`API Error ${response.status}: ${response.responseText}`, true);
                    }
                    setButtonIdle();
                },
                onerror: function() {
                    setResult('Request failed (Network Error). Check your API Key or connection.', true);
                    setButtonIdle();
                }
            });
        } else {
            setResult('Error: GM_xmlhttpRequest is not defined. Please run this script via Tampermonkey extension to bypass CSP.', true);
            setButtonIdle();
        }
    };

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.style.cursor = 'grab';
    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        if (e.target === header || e.target === title || e.target === badge || e.target === titleWrap) {
            isDragging = true;
            header.style.cursor = 'grabbing';
        }
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        header.style.cursor = 'grab';
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            ui.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
    }

    let ctrlDown = false;
    let ctrlUsedAsModifier = false;

    document.addEventListener('keydown', (e) => {
        if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
            if (!e.repeat) {
                ctrlDown = true;
                ctrlUsedAsModifier = false;
            }
            return;
        }
        if (ctrlDown) {
            ctrlUsedAsModifier = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code !== 'ControlLeft' && e.code !== 'ControlRight') return;
        if (ctrlDown && !ctrlUsedAsModifier) {
            ui.style.display = ui.style.display === 'none' ? 'flex' : 'none';
        }
        ctrlDown = false;
        ctrlUsedAsModifier = false;
    });

    console.log('EasyXL (Kouri API) userscript loaded successfully.');
})();


