// 마크다운 파서 설정
document.addEventListener('DOMContentLoaded', () => {
    // marked 라이브러리 설정
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) {
                    console.warn('코드 하이라이팅 오류:', err);
                }
            }
            return hljs.highlightAuto(code).value;
        },
        langPrefix: 'hljs language-',
        breaks: true,
        gfm: true
    });

    // 커스텀 렌더러 설정
    const renderer = new marked.Renderer();

    // 코드 블록 렌더링 커스터마이징
    renderer.code = function(code, language) {
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
        const highlighted = hljs.highlight(code, { language: validLanguage }).value;
        
        return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`;
    };

    // 링크 렌더링 커스터마이징 (외부 링크에 target="_blank" 추가)
    renderer.link = function(href, title, text) {
        const isExternal = href.startsWith('http://') || href.startsWith('https://');
        const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        const titleAttr = title ? ` title="${title}"` : '';
        
        return `<a href="${href}"${titleAttr}${target}>${text}</a>`;
    };

    // 이미지 렌더링 커스터마이징
    renderer.image = function(href, title, text) {
        const titleAttr = title ? ` title="${title}"` : '';
        const altAttr = text ? ` alt="${text}"` : '';
        
        return `<img src="${href}"${altAttr}${titleAttr} loading="lazy">`;
    };

    // 테이블 렌더링 개선
    renderer.table = function(header, body) {
        return `<div class="table-wrapper"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
    };

    // 체크박스 렌더링
    renderer.listitem = function(text, task, checked) {
        if (task) {
            const checkedAttr = checked ? ' checked' : '';
            return `<li><input type="checkbox" disabled${checkedAttr}>${text}</li>`;
        }
        return `<li>${text}</li>`;
    };

    // 인용구 렌더링 개선
    renderer.blockquote = function(quote) {
        return `<blockquote><div class="quote-content">${quote}</div></blockquote>`;
    };

    // 수평선 렌더링
    renderer.hr = function() {
        return '<hr class="divider">';
    };

    // 헤딩에 앵커 링크 추가
    renderer.heading = function(text, level) {
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        return `<h${level} id="${escapedText}"><a class="anchor" href="#${escapedText}">${text}</a></h${level}>`;
    };

    // 인라인 코드 스타일링
    renderer.codespan = function(code) {
        return `<code class="inline-code">${code}</code>`;
    };

    // 강조 텍스트 개선
    renderer.strong = function(text) {
        return `<strong class="bold-text">${text}</strong>`;
    };

    renderer.em = function(text) {
        return `<em class="italic-text">${text}</em>`;
    };

    // 설정 적용
    marked.use({ renderer });

    // 마크다운 확장 기능
    marked.use({
        extensions: [{
            name: 'spoiler',
            level: 'inline',
            start(src) {
                return src.match(/\|\|/)?.index;
            },
            tokenizer(src) {
                const match = src.match(/^\|\|([\s\S]*?)\|\|/);
                if (match) {
                    return {
                        type: 'spoiler',
                        raw: match[0],
                        text: match[1].trim()
                    };
                }
            },
            renderer(token) {
                return `<span class="spoiler" onclick="this.classList.toggle('revealed')">${token.text}</span>`;
            }
        }]
    });
});

// 마크다운 관련 유틸리티 함수들
const MarkdownUtils = {
    // 마크다운 텍스트에서 헤딩 추출
    extractHeadings: function(markdown) {
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const headings = [];
        let match;

        while ((match = headingRegex.exec(markdown)) !== null) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            
            headings.push({
                level,
                text,
                id,
                line: markdown.substring(0, match.index).split('\n').length
            });
        }

        return headings;
    },

    // 마크다운 텍스트에서 링크 추출
    extractLinks: function(markdown) {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const links = [];
        let match;

        while ((match = linkRegex.exec(markdown)) !== null) {
            links.push({
                text: match[1],
                url: match[2]
            });
        }

        return links;
    },

    // 마크다운 텍스트에서 이미지 추출
    extractImages: function(markdown) {
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const images = [];
        let match;

        while ((match = imageRegex.exec(markdown)) !== null) {
            images.push({
                alt: match[1],
                src: match[2]
            });
        }

        return images;
    },

    // 마크다운 텍스트에서 코드 블록 추출
    extractCodeBlocks: function(markdown) {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const codeBlocks = [];
        let match;

        while ((match = codeBlockRegex.exec(markdown)) !== null) {
            codeBlocks.push({
                language: match[1] || 'plaintext',
                code: match[2].trim()
            });
        }

        return codeBlocks;
    },

    // 마크다운 텍스트 정리 (HTML 태그 제거)
    cleanText: function(markdown) {
        return markdown
            .replace(/<[^>]*>/g, '') // HTML 태그 제거
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크 텍스트만 추출
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // 이미지 alt 텍스트만 추출
            .replace(/`([^`]+)`/g, '$1') // 인라인 코드 제거
            .replace(/```[\s\S]*?```/g, '') // 코드 블록 제거
            .replace(/^#{1,6}\s+/gm, '') // 헤딩 마크 제거
            .replace(/^\s*[-*+]\s+/gm, '') // 리스트 마크 제거
            .replace(/^\s*\d+\.\s+/gm, '') // 번호 리스트 마크 제거
            .replace(/^\s*>\s+/gm, '') // 인용구 마크 제거
            .trim();
    },

    // 마크다운 텍스트에서 첫 번째 헤딩 추출 (제목용)
    extractTitle: function(markdown) {
        const firstHeading = markdown.match(/^#{1,6}\s+(.+)$/m);
        return firstHeading ? firstHeading[1].trim() : null;
    },

    // 마크다운 텍스트에서 메타데이터 추출 (YAML 프론트매터)
    extractMetadata: function(markdown) {
        const metadataRegex = /^---\n([\s\S]*?)\n---\n/;
        const match = markdown.match(metadataRegex);
        
        if (!match) return null;

        const metadata = {};
        const lines = match[1].split('\n');
        
        lines.forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                metadata[key] = value;
            }
        });

        return metadata;
    }
};

// 전역 객체에 유틸리티 추가
window.MarkdownUtils = MarkdownUtils; 