// 메인 애플리케이션 로직
class PoCGuide {
    constructor() {
        this.currentContent = null;
        this.menuData = null;
        this.init();
    }

    async init() {
        await this.loadMenuData();
        this.setupEventListeners();
        this.setupTheme();
        this.renderMenu();
        this.loadDefaultContent();
    }

    async loadMenuData() {
        try {
            const response = await fetch('content/config.json');
            this.menuData = await response.json();
        } catch (error) {
            console.error('메뉴 데이터를 불러올 수 없습니다:', error);
            this.menuData = this.getDefaultMenuData();
        }
    }

    getDefaultMenuData() {
        return {
            menu: [
                {
                    title: "시작하기",
                    items: [
                        { title: "개요", file: "overview.md" },
                        { title: "환경 설정", file: "setup.md" }
                    ]
                },
                {
                    title: "기본 가이드",
                    items: [
                        { title: "첫 번째 PoC", file: "first-poc.md" },
                        { title: "모범 사례", file: "best-practices.md" }
                    ]
                },
                {
                    title: "고급 가이드",
                    items: [
                        { title: "성능 최적화", file: "optimization.md" },
                        { title: "문제 해결", file: "troubleshooting.md" }
                    ]
                }
            ]
        };
    }

    setupEventListeners() {
        // 테마 토글
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // 검색 토글
        document.getElementById('searchToggle').addEventListener('click', () => {
            this.toggleSearch();
        });

        // 검색 입력
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // 검색 패널 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-panel') && !e.target.closest('.search-toggle')) {
                this.closeSearch();
            }
        });
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeButton(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeButton(newTheme);
    }

    updateThemeButton(theme) {
        const button = document.getElementById('darkModeToggle');
        button.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    toggleSearch() {
        const searchPanel = document.getElementById('searchPanel');
        searchPanel.classList.toggle('hidden');
        
        if (!searchPanel.classList.contains('hidden')) {
            document.getElementById('searchInput').focus();
        }
    }

    closeSearch() {
        document.getElementById('searchPanel').classList.add('hidden');
    }

    async handleSearch(query) {
        if (query.length < 2) {
            document.getElementById('searchResults').innerHTML = '';
            return;
        }

        const results = await this.searchContent(query);
        this.displaySearchResults(results);
    }

    async searchContent(query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        for (const menuGroup of this.menuData.menu) {
            for (const item of menuGroup.items) {
                try {
                    const content = await this.loadMarkdownContent(item.file);
                    if (content.toLowerCase().includes(searchTerm)) {
                        results.push({
                            title: item.title,
                            file: item.file,
                            group: menuGroup.title,
                            preview: this.getSearchPreview(content, searchTerm)
                        });
                    }
                } catch (error) {
                    console.warn(`검색 중 오류 발생: ${item.file}`, error);
                }
            }
        }

        return results;
    }

    getSearchPreview(content, searchTerm) {
        const index = content.toLowerCase().indexOf(searchTerm);
        if (index === -1) return '';

        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + 100);
        let preview = content.substring(start, end);

        if (start > 0) preview = '...' + preview;
        if (end < content.length) preview = preview + '...';

        return preview.replace(new RegExp(searchTerm, 'gi'), `<mark>${searchTerm}</mark>`);
    }

    displaySearchResults(results) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
            return;
        }

        const html = results.map(result => `
            <div class="search-result" onclick="pocGuide.loadContent('${result.file}')">
                <div class="result-title">${result.title}</div>
                <div class="result-group">${result.group}</div>
                <div class="result-preview">${result.preview}</div>
            </div>
        `).join('');

        resultsContainer.innerHTML = html;
    }

    renderMenu() {
        const menuTree = document.getElementById('menuTree');
        const html = this.menuData.menu.map((group, groupIndex) => `
            <div class="menu-item">
                <div class="menu-header" onclick="pocGuide.handleMenuHeaderClick(event, ${groupIndex})">
                    <span>${group.title}</span>
                    <span class="menu-toggle">&#8250;</span>
                </div>
                <div class="submenu" id="submenu-${groupIndex}">
                    ${group.items.map((item, itemIndex) => `
                        <div class="submenu-item" onclick="pocGuide.handleSubmenuItemClick(event, ${groupIndex}, ${itemIndex}, '${item.file}')">
                            ${item.title}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        menuTree.innerHTML = html;
    }

    handleMenuHeaderClick(e, groupIndex) {
        // 모든 menu-header와 submenu-item에서 selected 제거
        document.querySelectorAll('.menu-header').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.submenu-item').forEach(el => el.classList.remove('selected'));
        // 현재 클릭한 menu-header에 selected 추가
        e.currentTarget.classList.add('selected');
        this.toggleSubmenu(groupIndex);
    }

    handleSubmenuItemClick(e, groupIndex, itemIndex, filename) {
        // 모든 submenu-item과 menu-header에서 selected 제거
        document.querySelectorAll('.submenu-item').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.menu-header').forEach(el => el.classList.remove('selected'));
        // 현재 클릭한 submenu-item에 selected 추가
        e.currentTarget.classList.add('selected');
        this.loadContent(filename);
    }

    toggleSubmenu(groupIndex) {
        const submenu = document.getElementById(`submenu-${groupIndex}`);
        const toggle = submenu.previousElementSibling.querySelector('.menu-toggle');
        submenu.classList.toggle('expanded');
        toggle.classList.toggle('expanded');
    }

    async loadDefaultContent() {
        if (this.menuData.menu.length > 0 && this.menuData.menu[0].items.length > 0) {
            const firstFile = this.menuData.menu[0].items[0].file;
            await this.loadContent(firstFile);
        }
    }

    async loadContent(filename) {
        try {
            const content = await this.loadMarkdownContent(filename);
            this.renderContent(content);
            this.updateActiveMenuItem(filename);
            this.closeSearch();
            
            // URL 업데이트 (히스토리 API 사용)
            const url = new URL(window.location);
            url.searchParams.set('page', filename);
            window.history.pushState({}, '', url);
            
        } catch (error) {
            console.error('콘텐츠를 불러올 수 없습니다:', error);
            this.renderError(`콘텐츠를 불러올 수 없습니다: ${filename}`);
        }
    }

    async loadMarkdownContent(filename) {
        const response = await fetch(`content/guides/${filename}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.text();
    }

    renderContent(markdown) {
        const contentDiv = document.getElementById('content');
        
        // 마크다운을 HTML로 변환
        const html = marked.parse(markdown);
        contentDiv.innerHTML = html;

        // 코드 하이라이팅 적용
        contentDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        // 코드 복사 버튼 추가
        this.addCopyButtons();

        // 목차 생성
        this.generateTOC();

        // 현재 콘텐츠 저장
        this.currentContent = markdown;
    }

    addCopyButtons() {
        document.querySelectorAll('pre').forEach((pre) => {
            if (!pre.querySelector('.copy-button')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'code-block-wrapper';
                pre.parentNode.insertBefore(wrapper, pre);
                wrapper.appendChild(pre);

                const copyButton = document.createElement('button');
                copyButton.className = 'copy-button';
                copyButton.textContent = '복사';
                copyButton.onclick = () => this.copyCode(pre.textContent);
                wrapper.appendChild(copyButton);
            }
        });
    }

    async copyCode(code) {
        try {
            await navigator.clipboard.writeText(code);
            this.showToast('코드가 복사되었습니다!');
        } catch (error) {
            console.error('복사 실패:', error);
            this.showToast('복사에 실패했습니다.');
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    renderError(message) {
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = `
            <div class="error-message">
                <h2>오류 발생</h2>
                <p>${message}</p>
            </div>
        `;
    }

    updateActiveMenuItem(filename) {
        // 모든 메뉴 아이템에서 active 클래스 제거
        document.querySelectorAll('.submenu-item').forEach(item => {
            item.classList.remove('active');
        });

        // 현재 파일에 해당하는 메뉴 아이템에 active 클래스 추가
        document.querySelectorAll('.submenu-item').forEach(item => {
            if (item.onclick.toString().includes(filename)) {
                item.classList.add('active');
            }
        });
    }

    generateTOC() {
        const tocContent = document.getElementById('tocContent');
        const headings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4');
        
        if (headings.length === 0) {
            tocContent.innerHTML = '<p class="no-toc">목차가 없습니다.</p>';
            return;
        }

        const tocItems = Array.from(headings).map((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent;
            const id = `heading-${index}`;
            
            heading.id = id;
            
            return {
                id,
                text,
                level,
                element: heading
            };
        });

        const tocHTML = tocItems.map(item => `
            <div class="toc-item h${item.level}" onclick="pocGuide.scrollToHeading('${item.id}')">
                ${item.text}
            </div>
        `).join('');

        tocContent.innerHTML = tocHTML;

        // 스크롤 추적 설정
        this.setupScrollTracking(tocItems);
    }

    scrollToHeading(headingId) {
        const heading = document.getElementById(headingId);
        if (heading) {
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    setupScrollTracking(tocItems) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const tocItem = document.querySelector(`[onclick*="${id}"]`);
                
                if (entry.isIntersecting) {
                    // 모든 TOC 아이템에서 active 클래스 제거
                    document.querySelectorAll('.toc-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // 현재 보이는 헤딩에 해당하는 TOC 아이템에 active 클래스 추가
                    if (tocItem) {
                        tocItem.classList.add('active');
                    }
                }
            });
        }, {
            rootMargin: '-20% 0px -70% 0px'
        });

        tocItems.forEach(item => {
            observer.observe(item.element);
        });
    }
}

// 애플리케이션 초기화
let pocGuide;
document.addEventListener('DOMContentLoaded', () => {
    pocGuide = new PoCGuide();
});

// 브라우저 뒤로가기/앞으로가기 처리
window.addEventListener('popstate', () => {
    const url = new URL(window.location);
    const page = url.searchParams.get('page');
    if (page && pocGuide) {
        pocGuide.loadContent(page);
    }
}); 