// 목차(TOC) 관리 클래스
class TableOfContents {
    constructor() {
        this.tocItems = [];
        this.observer = null;
        this.currentActiveId = null;
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
    }

    // 목차 생성
    generateTOC(contentElement) {
        const headings = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
        this.tocItems = [];

        if (headings.length === 0) {
            this.renderEmptyTOC();
            return;
        }

        // 헤딩 요소들을 처리
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent.trim();
            const id = this.generateHeadingId(heading, index);
            
            // 헤딩에 ID 추가
            heading.id = id;
            
            this.tocItems.push({
                id,
                text,
                level,
                element: heading
            });
        });

        this.renderTOC();
        this.setupScrollTracking();
    }

    // 헤딩 ID 생성
    generateHeadingId(heading, index) {
        let id = heading.textContent
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // 특수문자 제거
            .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
            .replace(/-+/g, '-') // 연속된 하이픈을 하나로
            .trim();

        // ID가 비어있거나 중복되는 경우 인덱스 추가
        if (!id || document.getElementById(id)) {
            id = `heading-${index}`;
        }

        return id;
    }

    // 목차 렌더링
    renderTOC() {
        const tocContent = document.getElementById('tocContent');
        
        if (this.tocItems.length === 0) {
            this.renderEmptyTOC();
            return;
        }

        const tocHTML = this.tocItems.map(item => {
            const indentClass = `h${item.level}`;
            return `
                <div class="toc-item ${indentClass}" 
                     data-id="${item.id}" 
                     onclick="toc.scrollToHeading('${item.id}')">
                    <span class="toc-text">${item.text}</span>
                    <span class="toc-indicator"></span>
                </div>
            `;
        }).join('');

        tocContent.innerHTML = tocHTML;
    }

    // 빈 목차 렌더링
    renderEmptyTOC() {
        const tocContent = document.getElementById('tocContent');
        tocContent.innerHTML = `
            <div class="toc-empty">
                <p>목차가 없습니다</p>
                <small>H1~H4 헤딩이 있는 문서에서 목차가 표시됩니다.</small>
            </div>
        `;
    }

    // Intersection Observer 설정
    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.updateActiveTOCItem(entry.target.id);
                }
            });
        }, {
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        });
    }

    // 스크롤 추적 설정
    setupScrollTracking() {
        // 기존 관찰 중인 요소들 해제
        if (this.observer) {
            this.observer.disconnect();
        }

        // 새로운 헤딩 요소들 관찰 시작
        this.tocItems.forEach(item => {
            if (item.element) {
                this.observer.observe(item.element);
            }
        });
    }

    // 활성 목차 아이템 업데이트
    updateActiveTOCItem(headingId) {
        // 이전 활성 아이템에서 active 클래스 제거
        if (this.currentActiveId) {
            const prevActiveItem = document.querySelector(`[data-id="${this.currentActiveId}"]`);
            if (prevActiveItem) {
                prevActiveItem.classList.remove('active');
            }
        }

        // 새로운 활성 아이템에 active 클래스 추가
        const newActiveItem = document.querySelector(`[data-id="${headingId}"]`);
        if (newActiveItem) {
            newActiveItem.classList.add('active');
            this.currentActiveId = headingId;
            
            // 목차 영역에서 활성 아이템이 보이도록 스크롤
            this.scrollTOCToActive(newActiveItem);
        }
    }

    // 목차 영역에서 활성 아이템으로 스크롤
    scrollTOCToActive(activeItem) {
        const tocContainer = document.getElementById('tocContent');
        const containerRect = tocContainer.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();

        // 아이템이 컨테이너 밖에 있는지 확인
        if (itemRect.top < containerRect.top || itemRect.bottom > containerRect.bottom) {
            activeItem.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }

    // 헤딩으로 스크롤
    scrollToHeading(headingId) {
        const heading = document.getElementById(headingId);
        if (heading) {
            // 헤더 높이만큼 오프셋 조정
            const headerHeight = document.querySelector('.header').offsetHeight;
            const elementPosition = heading.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });

            // URL 해시 업데이트
            this.updateURLHash(headingId);
        }
    }

    // URL 해시 업데이트
    updateURLHash(headingId) {
        const url = new URL(window.location);
        url.hash = headingId;
        window.history.replaceState(null, null, url);
    }

    // 목차 토글 (모바일용)
    toggleTOC() {
        const toc = document.querySelector('.toc');
        toc.classList.toggle('mobile-open');
    }

    // 목차 검색 기능
    searchTOC(query) {
        const tocItems = document.querySelectorAll('.toc-item');
        const searchTerm = query.toLowerCase();

        tocItems.forEach(item => {
            const text = item.querySelector('.toc-text').textContent.toLowerCase();
            const isVisible = text.includes(searchTerm);
            
            item.style.display = isVisible ? 'block' : 'none';
            
            if (isVisible) {
                item.style.opacity = '1';
            } else {
                item.style.opacity = '0.5';
            }
        });
    }

    // 목차 필터링 (레벨별)
    filterTOCByLevel(maxLevel) {
        const tocItems = document.querySelectorAll('.toc-item');
        
        tocItems.forEach(item => {
            const level = parseInt(item.className.match(/h(\d+)/)[1]);
            const isVisible = level <= maxLevel;
            
            item.style.display = isVisible ? 'block' : 'none';
        });
    }

    // 목차 통계 정보
    getTOCStats() {
        const stats = {
            total: this.tocItems.length,
            byLevel: {}
        };

        this.tocItems.forEach(item => {
            const level = item.level;
            stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;
        });

        return stats;
    }

    // 목차 아이템 클릭 이벤트 처리
    handleTOCItemClick(event) {
        const tocItem = event.currentTarget;
        const headingId = tocItem.dataset.id;
        
        if (headingId) {
            this.scrollToHeading(headingId);
        }
    }

    // 키보드 네비게이션
    handleKeyboardNavigation(event) {
        const activeItem = document.querySelector('.toc-item.active');
        if (!activeItem) return;

        let targetItem = null;

        switch (event.key) {
            case 'ArrowUp':
                targetItem = activeItem.previousElementSibling;
                break;
            case 'ArrowDown':
                targetItem = activeItem.nextElementSibling;
                break;
            case 'Home':
                targetItem = document.querySelector('.toc-item');
                break;
            case 'End':
                const items = document.querySelectorAll('.toc-item');
                targetItem = items[items.length - 1];
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                const headingId = activeItem.dataset.id;
                if (headingId) {
                    this.scrollToHeading(headingId);
                }
                return;
        }

        if (targetItem && targetItem.classList.contains('toc-item')) {
            activeItem.classList.remove('active');
            targetItem.classList.add('active');
            targetItem.focus();
        }
    }

    // 목차 초기화
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.tocItems = [];
        this.currentActiveId = null;
    }

    // 목차 새로고침
    refresh() {
        const contentElement = document.querySelector('.markdown-content');
        if (contentElement) {
            this.generateTOC(contentElement);
        }
    }
}

// 전역 TOC 인스턴스
let toc;

// DOM 로드 시 TOC 초기화
document.addEventListener('DOMContentLoaded', () => {
    toc = new TableOfContents();
});

// 키보드 이벤트 리스너
document.addEventListener('keydown', (event) => {
    if (toc && document.activeElement.closest('.toc')) {
        toc.handleKeyboardNavigation(event);
    }
});

// 윈도우 리사이즈 시 TOC 새로고침
window.addEventListener('resize', () => {
    if (toc) {
        setTimeout(() => toc.refresh(), 100);
    }
});

// 스크롤 성능 최적화
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
        if (toc) {
            toc.refresh();
        }
    }, 100);
}); 