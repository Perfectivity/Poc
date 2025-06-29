// 에디터 관리 클래스
class EditorManager {
    constructor() {
        this.editor = null;
        this.currentFile = null;
        this.isEditMode = false;
        this.init();
    }

    async init() {
        await this.initMonacoEditor();
        this.setupEventListeners();
        this.setupImageHandling();
    }

    async initMonacoEditor() {
        // Monaco Editor 로드
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
        
        return new Promise((resolve) => {
            require(['vs/editor/editor.main'], () => {
                this.editor = monaco.editor.create(document.getElementById('monacoEditor'), {
                    value: '',
                    language: 'markdown',
                    theme: this.getMonacoTheme(),
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    folding: true,
                    fontSize: 14,
                    fontFamily: 'Consolas, "Courier New", monospace',
                    tabSize: 2,
                    insertSpaces: true,
                    detectIndentation: false,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    parameterHints: { enabled: true },
                    hover: { enabled: true },
                    contextmenu: true,
                    mouseWheelZoom: true,
                    smoothScrolling: true,
                    cursorBlinking: 'blink',
                    cursorSmoothCaretAnimation: 'on',
                    renderWhitespace: 'selection',
                    renderControlCharacters: false,
                    renderLineHighlight: 'all',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                        useShadows: false
                    }
                });

                // 에디터 내용 변경 시 미리보기 업데이트
                this.editor.onDidChangeModelContent(() => {
                    this.updatePreview();
                });

                resolve();
            });
        });
    }

    getMonacoTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        return currentTheme === 'dark' ? 'vs-dark' : 'vs';
    }

    setupEventListeners() {
        // 편집 모드 토글
        document.getElementById('editModeToggle').addEventListener('click', () => {
            this.toggleEditMode();
        });

        // 저장 버튼
        document.getElementById('saveContent').addEventListener('click', () => {
            this.saveContent();
        });

        // 취소 버튼
        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.cancelEdit();
        });

        // 이미지 삽입 버튼
        document.getElementById('insertImage').addEventListener('click', () => {
            this.openImageModal();
        });

        // 이미지 모달 닫기
        document.getElementById('closeImageModal').addEventListener('click', () => {
            this.closeImageModal();
        });

        // 모달 외부 클릭 시 닫기
        document.getElementById('imageModal').addEventListener('click', (e) => {
            if (e.target.id === 'imageModal') {
                this.closeImageModal();
            }
        });

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeImageModal();
            }
        });
    }

    setupImageHandling() {
        const imageUploadArea = document.getElementById('imageUploadArea');
        const imageFileInput = document.getElementById('imageFileInput');
        const pasteArea = document.getElementById('pasteArea');

        // 파일 드래그 앤 드롭
        imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadArea.style.borderColor = '#007bff';
            imageUploadArea.style.background = 'rgba(0, 123, 255, 0.1)';
        });

        imageUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            imageUploadArea.style.borderColor = '';
            imageUploadArea.style.background = '';
        });

        imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadArea.style.borderColor = '';
            imageUploadArea.style.background = '';
            
            const files = Array.from(e.dataTransfer.files);
            this.handleImageFiles(files);
        });

        // 파일 선택
        imageUploadArea.addEventListener('click', () => {
            imageFileInput.click();
        });

        imageFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleImageFiles(files);
        });

        // 클립보드 붙여넣기
        pasteArea.addEventListener('paste', (e) => {
            e.preventDefault();
            const items = Array.from(e.clipboardData.items);
            this.handleClipboardItems(items);
        });

        // 붙여넣기 영역 포커스
        pasteArea.addEventListener('focus', () => {
            if (pasteArea.textContent === '이미지를 여기에 붙여넣으세요...') {
                pasteArea.textContent = '';
            }
        });

        pasteArea.addEventListener('blur', () => {
            if (pasteArea.textContent.trim() === '') {
                pasteArea.textContent = '이미지를 여기에 붙여넣으세요...';
            }
        });
    }

    handleImageFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.addImageToPreview(e.target.result, file.name);
            };
            reader.readAsDataURL(file);
        });
    }

    handleClipboardItems(items) {
        items.forEach(item => {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.addImageToPreview(e.target.result, 'clipboard-image.png');
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    }

    addImageToPreview(dataUrl, filename) {
        const previewContainer = document.getElementById('imagePreview');
        const imageId = 'img_' + Date.now();
        
        const imageItem = document.createElement('div');
        imageItem.className = 'image-preview-item';
        imageItem.innerHTML = `
            <img src="${dataUrl}" alt="${filename}">
            <div class="image-actions">
                <button class="image-action-btn" onclick="editorManager.insertImageToEditor('${imageId}')" title="삽입">+</button>
                <button class="image-action-btn" onclick="editorManager.removeImagePreview('${imageId}')" title="삭제">×</button>
            </div>
        `;
        imageItem.id = imageId;
        imageItem.dataset.dataUrl = dataUrl;
        imageItem.dataset.filename = filename;
        
        previewContainer.appendChild(imageItem);
    }

    insertImageToEditor(imageId) {
        const imageItem = document.getElementById(imageId);
        if (!imageItem) return;

        const dataUrl = imageItem.dataset.dataUrl;
        const filename = imageItem.dataset.filename;
        
        // 마크다운 이미지 문법으로 삽입
        const imageMarkdown = `![${filename}](${dataUrl})`;
        
        // 현재 커서 위치에 삽입
        const selection = this.editor.getSelection();
        const range = new monaco.Range(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn
        );
        
        this.editor.executeEdits('', [{
            range: range,
            text: imageMarkdown
        }]);
        
        // 이미지 모달 닫기
        this.closeImageModal();
        
        // 토스트 메시지 표시
        this.showToast('이미지가 삽입되었습니다.');
    }

    removeImagePreview(imageId) {
        const imageItem = document.getElementById(imageId);
        if (imageItem) {
            imageItem.remove();
        }
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const editToggle = document.getElementById('editModeToggle');
        const viewerMode = document.getElementById('viewerMode');
        const editorMode = document.getElementById('editorMode');

        if (this.isEditMode) {
            editToggle.classList.add('active');
            viewerMode.classList.add('hidden');
            editorMode.classList.remove('hidden');
            
            // 현재 콘텐츠를 에디터에 로드
            if (this.currentFile) {
                this.loadContentToEditor(this.currentFile);
            }
        } else {
            editToggle.classList.remove('active');
            viewerMode.classList.remove('hidden');
            editorMode.classList.add('hidden');
        }
    }

    async loadContentToEditor(filename) {
        try {
            const response = await fetch(`content/${filename}`);
            const content = await response.text();
            
            this.editor.setValue(content);
            this.currentFile = filename;
            document.getElementById('currentFileName').textContent = filename;
            
            // 미리보기 업데이트
            this.updatePreview();
        } catch (error) {
            console.error('파일을 로드할 수 없습니다:', error);
            this.showToast('파일을 로드할 수 없습니다.');
        }
    }

    updatePreview() {
        const content = this.editor.getValue();
        const previewContent = document.getElementById('previewContent');
        
        // 마크다운 렌더링
        const html = marked.parse(content);
        previewContent.innerHTML = html;
        
        // 코드 하이라이팅
        previewContent.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    async saveContent() {
        if (!this.currentFile) {
            this.showToast('저장할 파일이 없습니다.');
            return;
        }

        const content = this.editor.getValue();
        
        try {
            // 실제 구현에서는 서버로 저장 요청을 보내야 합니다
            // 여기서는 로컬 스토리지에 임시 저장
            localStorage.setItem(`temp_${this.currentFile}`, content);
            
            this.showToast('내용이 저장되었습니다.');
            
            // 뷰어 모드로 전환
            this.toggleEditMode();
            
            // 뷰어 콘텐츠 업데이트
            if (window.pocGuide) {
                window.pocGuide.loadContent(this.currentFile);
            }
        } catch (error) {
            console.error('저장 중 오류 발생:', error);
            this.showToast('저장 중 오류가 발생했습니다.');
        }
    }

    cancelEdit() {
        this.toggleEditMode();
        this.showToast('편집이 취소되었습니다.');
    }

    openImageModal() {
        document.getElementById('imageModal').classList.remove('hidden');
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('pasteArea').textContent = '이미지를 여기에 붙여넣으세요...';
    }

    closeImageModal() {
        document.getElementById('imageModal').classList.add('hidden');
    }

    showToast(message) {
        // 간단한 토스트 메시지 표시
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem;
            border-radius: 4px;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // 테마 변경 시 Monaco 에디터 테마도 변경
    updateTheme() {
        if (this.editor) {
            monaco.editor.setTheme(this.getMonacoTheme());
        }
    }
}

// 전역 인스턴스 생성
window.editorManager = new EditorManager(); 