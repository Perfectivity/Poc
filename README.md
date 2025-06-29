# Tencent Cloud PoC 가이드

Tencent Cloud COS를 활용한 정적 웹사이트 호스팅을 위한 PoC 가이드 문서 사이트입니다.

## 🚀 주요 특징

- **깔끔한 디자인**: 개발자를 위한 직관적인 UI
- **마크다운 지원**: 마크다운으로 작성된 문서를 아름답게 렌더링
- **반응형 디자인**: 모바일과 데스크톱 모두 지원
- **다크 모드**: 개발자들이 선호하는 다크 테마 지원
- **검색 기능**: 빠른 문서 검색
- **목차 네비게이션**: 문서 내 헤딩 기반 목차
- **코드 하이라이팅**: 구문 강조가 지원되는 코드 블록
- **정적 호스팅**: Tencent Cloud COS에서 호스팅

## 📁 프로젝트 구조

```
/
├── index.html          # 메인 페이지 (리다이렉트)
├── guide.html          # 실제 가이드 페이지
├── css/
│   ├── style.css       # 메인 스타일
│   └── markdown.css    # 마크다운 렌더링 스타일
├── js/
│   ├── main.js         # 메인 로직
│   ├── markdown.js     # 마크다운 파서
│   └── toc.js          # 목차 생성 및 스크롤 추적
├── content/
│   ├── guides/         # 가이드 문서들 (마크다운)
│   └── config.json     # 메뉴 구조 설정
└── assets/
    └── logo.svg        # 로고 이미지
```

## 🛠️ 사용 방법

### 1. 로컬 테스트

```bash
# 브라우저에서 직접 파일 열기
open guide.html

# 또는 더블클릭으로 guide.html 파일 열기
```

### 2. COS에 업로드

```bash
# COSCMD 사용
coscmd upload -r ./ /

# 또는 콘솔에서 파일 업로드
```

## 📝 문서 작성

### 마크다운 파일 추가

1. `content/guides/` 폴더에 `.md` 파일 생성
2. `content/config.json`에 메뉴 항목 추가

### 메뉴 구조 설정

`content/config.json` 파일에서 메뉴 구조를 정의합니다:

```json
{
  "menu": [
    {
      "title": "카테고리명",
      "items": [
        {
          "title": "문서 제목",
          "file": "filename.md",
          "description": "문서 설명"
        }
      ]
    }
  ]
}
```

## 🎨 커스터마이징

### 테마 변경

CSS 변수를 수정하여 테마를 변경할 수 있습니다:

```css
:root {
  --accent-color: #your-color;
  --bg-primary: #your-bg-color;
  --text-primary: #your-text-color;
}
```

### 로고 변경

`assets/logo.svg` 파일을 원하는 로고로 교체하세요.

## 🔧 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 모던 스타일링 (CSS Grid, Flexbox, CSS Variables)
- **JavaScript (ES6+)**: 바닐라 JavaScript
- **Marked.js**: 마크다운 파서
- **Highlight.js**: 코드 하이라이팅
- **Tencent Cloud COS**: 정적 호스팅

## 📱 브라우저 지원

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🆘 지원

문제가 발생하거나 질문이 있으시면:

- 프로젝트 문서를 참조하세요
- Tencent Cloud 공식 문서를 확인하세요

---

**참고**: 이 프로젝트는 Tencent Cloud의 최신 서비스를 기반으로 작성되었습니다. 서비스 업데이트에 따라 일부 내용이 변경될 수 있습니다. 