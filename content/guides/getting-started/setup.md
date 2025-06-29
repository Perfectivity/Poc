# 환경 설정 가이드

## 개요

Tencent Cloud PoC 프로젝트를 시작하기 전에 필요한 개발 환경을 설정하는 방법을 안내합니다.

## 필수 도구 설치

### 1. Git 설치

버전 관리를 위해 Git을 설치해야 합니다.

#### Windows
```bash
# Chocolatey 사용
choco install git

# 또는 공식 설치 파일 다운로드
# https://git-scm.com/download/win
```

#### macOS
```bash
# Homebrew 사용
brew install git

# 또는 Xcode Command Line Tools
xcode-select --install
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install git
```

### 2. Node.js 설치

개발 도구 및 빌드 프로세스를 위해 Node.js를 설치합니다.

#### 모든 플랫폼
```bash
# nvm 사용 (권장)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Node.js LTS 버전 설치
nvm install --lts
nvm use --lts
```

#### 직접 설치
- [Node.js 공식 사이트](https://nodejs.org/)에서 LTS 버전 다운로드

### 3. 코드 에디터

#### Visual Studio Code (권장)
```bash
# macOS
brew install --cask visual-studio-code

# Windows
choco install vscode

# Linux
sudo snap install code --classic
```

#### 추천 확장 프로그램
- **Markdown All in One** - 마크다운 편집 지원
- **Prettier** - 코드 포맷팅
- **ESLint** - JavaScript 린팅
- **GitLens** - Git 통합
- **Live Server** - 로컬 개발 서버

## Tencent Cloud 설정

### 1. 계정 생성

1. [Tencent Cloud 공식 사이트](https://cloud.tencent.com/)에 접속
2. 계정 가입 및 인증 완료
3. 결제 정보 등록

### 2. COS 버킷 생성

#### 콘솔에서 생성
1. Tencent Cloud 콘솔 로그인
2. **COS** 서비스 선택
3. **버킷 생성** 클릭
4. 설정 정보 입력:
   - **버킷 이름**: `your-poc-bucket`
   - **지역**: `ap-seoul` (서울)
   - **접근 권한**: `공개 읽기, 개인 쓰기`

#### CLI 도구 설치 (선택사항)
```bash
# COSCMD 설치
pip install coscmd

# 설정
coscmd config -a <SecretId> -s <SecretKey> -b <BucketName> -r <Region>
```

### 3. CDN 도메인 설정

1. **CDN** 서비스 선택
2. **도메인 추가** 클릭
3. 설정 정보 입력:
   - **도메인**: `your-domain.com`
   - **원본 서버**: COS 버킷 선택
   - **가속 지역**: `전역`

## 로컬 개발 환경

### 1. 프로젝트 클론

```bash
# 저장소 클론
git clone <your-repository-url>
cd poc-guide

# 의존성 설치
npm install
```

### 2. 개발 서버 실행

```bash
# 로컬 서버 시작
npm run dev

# 또는 Python 사용
python -m http.server 8000
```

### 3. 환경 변수 설정

`.env` 파일 생성:
```env
# Tencent Cloud 설정
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
COS_BUCKET=your-bucket-name
COS_REGION=ap-seoul
CDN_DOMAIN=your-domain.com
```

## 보안 설정

### 1. API 키 관리

```bash
# 환경 변수로 설정
export TENCENT_SECRET_ID="your_secret_id"
export TENCENT_SECRET_KEY="your_secret_key"

# 또는 AWS CLI 스타일 설정
tencentcloud configure
```

### 2. IAM 권한 설정

최소 권한 원칙에 따라 필요한 권한만 부여:

```json
{
  "Version": "2.0",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cos:GetObject",
        "cos:PutObject",
        "cos:DeleteObject",
        "cos:ListBucket"
      ],
      "Resource": [
        "qcs::cos:ap-seoul:uid/*:your-bucket-name/*"
      ]
    }
  ]
}
```

## 테스트 환경

### 1. 로컬 테스트

```bash
# HTML 파일 테스트
open index.html

# 또는 로컬 서버 사용
python -m http.server 8000
# http://localhost:8000 접속
```

### 2. 배포 테스트

```bash
# 파일 업로드 테스트
coscmd upload -r ./ /index.html

# CDN 캐시 무효화
coscmd invalidate /index.html
```

## 문제 해결

### 일반적인 문제들

#### 1. CORS 오류
```javascript
// COS 버킷 CORS 설정
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}
```

#### 2. 권한 오류
- API 키가 올바른지 확인
- IAM 권한 설정 확인
- 버킷 접근 권한 확인

#### 3. CDN 캐시 문제
- 캐시 무효화 실행
- 브라우저 캐시 삭제
- CDN 설정 확인

## 다음 단계

환경 설정이 완료되면 다음 단계로 진행하세요:

1. [COS 설정](./cos-setup.md) - Object Storage 구성
2. [정적 호스팅](./static-hosting.md) - 웹사이트 배포
3. [CDN 설정](./cdn-setup.md) - 성능 최적화

## 추가 리소스

- [Tencent Cloud 공식 문서](https://cloud.tencent.com/document/product)
- [COS 개발자 가이드](https://cloud.tencent.com/document/product/436)
- [CDN 개발자 가이드](https://cloud.tencent.com/document/product/228) 