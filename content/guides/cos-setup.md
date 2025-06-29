# COS 설정 가이드

## 개요

Tencent Cloud Object Storage Service (COS)를 설정하여 정적 웹사이트 호스팅을 구성하는 방법을 안내합니다.

## COS 버킷 생성

### 1. 콘솔에서 버킷 생성

1. **Tencent Cloud 콘솔** 접속
2. **COS** 서비스 선택
3. **버킷 생성** 클릭

### 2. 기본 설정

| 설정 항목 | 값 | 설명 |
|-----------|-----|------|
| **버킷 이름** | `your-poc-website` | 전역적으로 고유한 이름 |
| **지역** | `ap-seoul` | 서울 리전 (한국 사용자 권장) |
| **접근 권한** | `공개 읽기, 개인 쓰기` | 웹사이트 접근을 위해 필요 |
| **버킷 태그** | `poc-website` | 관리용 태그 |

### 3. 고급 설정

```json
{
  "버킷 이름": "your-poc-website",
  "지역": "ap-seoul",
  "접근 권한": "공개 읽기, 개인 쓰기",
  "버전 관리": "비활성화",
  "서버 암호화": "SSE-COS",
  "객체 잠금": "비활성화"
}
```

## 정적 웹사이트 설정

### 1. 정적 웹사이트 활성화

1. **버킷 관리** → **기본 설정**
2. **정적 웹사이트** 섹션에서 **편집**
3. 설정 정보 입력:

```json
{
  "상태": "활성화",
  "인덱스 문서": "index.html",
  "오류 문서": "404.html",
  "리다이렉트 규칙": []
}
```

### 2. 도메인 설정

#### 사용자 정의 도메인 (선택사항)
1. **도메인 관리** → **사용자 정의 도메인**
2. **도메인 추가** 클릭
3. 도메인 정보 입력:

```bash
# 도메인 예시
www.yourdomain.com
yourdomain.com
```

## CORS 설정

### 1. CORS 규칙 추가

**보안** → **CORS 설정** → **규칙 추가**:

```json
{
  "원본": ["*"],
  "허용된 작업": ["GET", "HEAD"],
  "허용된 헤더": ["*"],
  "노출된 헤더": ["ETag"],
  "최대 연령": 3600
}
```

### 2. 세부 설정

| 설정 항목 | 값 | 설명 |
|-----------|-----|------|
| **원본** | `*` | 모든 도메인 허용 (프로덕션에서는 제한 권장) |
| **허용된 작업** | `GET, HEAD` | 정적 웹사이트에 필요한 메서드만 |
| **허용된 헤더** | `*` | 모든 헤더 허용 |
| **노출된 헤더** | `ETag` | 캐싱을 위한 ETag 헤더 |
| **최대 연령** | `3600` | 프리플라이트 요청 캐시 시간 |

## 버킷 정책 설정

### 1. 공개 읽기 권한

**권한 관리** → **버킷 정책** → **정책 추가**:

```json
{
  "Version": "2.0",
  "Statement": [
    {
      "Principal": {
        "qcs": ["qcs::cam::anyone:anyone"]
      },
      "Effect": "Allow",
      "Action": [
        "name/cos:GetObject"
      ],
      "Resource": [
        "qcs::cos:ap-seoul:uid/*:your-poc-website/*"
      ]
    }
  ]
}
```

### 2. 보안 강화 (선택사항)

특정 도메인에서만 접근 허용:

```json
{
  "Version": "2.0",
  "Statement": [
    {
      "Principal": {
        "qcs": ["qcs::cam::anyone:anyone"]
      },
      "Effect": "Allow",
      "Action": [
        "name/cos:GetObject"
      ],
      "Resource": [
        "qcs::cos:ap-seoul:uid/*:your-poc-website/*"
      ],
      "Condition": {
        "StringEquals": {
          "cos:Referer": ["https://yourdomain.com/*"]
        }
      }
    }
  ]
}
```

## 파일 업로드

### 1. 콘솔에서 업로드

1. **파일 목록** → **파일 업로드**
2. 웹사이트 파일들 선택:
   - `index.html`
   - `guide.html`
   - `css/` 폴더
   - `js/` 폴더
   - `content/` 폴더

### 2. CLI 도구 사용

#### COSCMD 설치
```bash
# pip로 설치
pip install coscmd

# 설정
coscmd config -a <SecretId> -s <SecretKey> -b <BucketName> -r <Region>
```

#### 파일 업로드
```bash
# 전체 폴더 업로드
coscmd upload -r ./ /

# 특정 파일만 업로드
coscmd upload index.html /
coscmd upload guide.html /

# 폴더별 업로드
coscmd upload -r ./css/ /css/
coscmd upload -r ./js/ /js/
coscmd upload -r ./content/ /content/
```

### 3. 프로그래밍 방식

#### Python SDK 사용
```python
from qcloud_cos import CosConfig, CosS3Client
import sys
import os

# 설정
secret_id = 'your_secret_id'
secret_key = 'your_secret_key'
region = 'ap-seoul'
bucket = 'your-poc-website'

# 클라이언트 생성
config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key)
client = CosS3Client(config)

# 파일 업로드
def upload_file(local_path, cos_path):
    with open(local_path, 'rb') as f:
        response = client.put_object(
            Bucket=bucket,
            Body=f,
            Key=cos_path
        )
        print(f'Uploaded: {local_path} -> {cos_path}')

# 전체 웹사이트 업로드
def upload_website():
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith(('.html', '.css', '.js', '.md', '.json')):
                local_path = os.path.join(root, file)
                cos_path = local_path.replace('./', '/')
                upload_file(local_path, cos_path)

upload_website()
```

## 성능 최적화

### 1. 캐시 헤더 설정

**기본 설정** → **캐시 설정**:

```json
{
  "HTML 파일": {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Expires": "0"
  },
  "CSS/JS 파일": {
    "Cache-Control": "public, max-age=31536000",
    "Expires": "Thu, 31 Dec 2024 23:59:59 GMT"
  },
  "이미지 파일": {
    "Cache-Control": "public, max-age=2592000",
    "Expires": "Thu, 31 Jan 2024 23:59:59 GMT"
  }
}
```

### 2. 압축 설정

**기본 설정** → **압축 설정**:

```json
{
  "상태": "활성화",
  "압축 형식": ["gzip", "br"],
  "압축 파일 형식": [
    "text/html",
    "text/css",
    "application/javascript",
    "application/json"
  ]
}
```

## 모니터링 및 로그

### 1. 액세스 로그 활성화

**기본 설정** → **로그 관리**:

```json
{
  "상태": "활성화",
  "대상 버킷": "your-poc-website-logs",
  "로그 접두사": "access-logs/",
  "로그 형식": "표준 로그"
}
```

### 2. 메트릭 모니터링

**모니터링** → **메트릭**에서 다음 항목 확인:
- 요청 수
- 데이터 전송량
- 오류율
- 응답 시간

## 보안 설정

### 1. HTTPS 강제 적용

**보안** → **HTTPS 설정**:

```json
{
  "HTTPS 강제 적용": "활성화",
  "HSTS": "활성화",
    "최대 연령": 31536000
}
```

### 2. 액세스 제어

**권한 관리** → **액세스 제어**:

```json
{
  "공개 읽기": "활성화",
  "개인 쓰기": "활성화",
  "버킷 소유자": "your-account-id"
}
```

## 문제 해결

### 일반적인 문제들

#### 1. 403 Forbidden 오류
- 버킷 정책 확인
- CORS 설정 확인
- 파일 권한 확인

#### 2. CORS 오류
- 브라우저 개발자 도구에서 오류 메시지 확인
- CORS 규칙 재설정
- 도메인 설정 확인

#### 3. 캐시 문제
- 브라우저 캐시 삭제
- CDN 캐시 무효화
- 캐시 헤더 설정 확인

## 다음 단계

COS 설정이 완료되면 다음 단계로 진행하세요:

1. [정적 호스팅](./static-hosting.md) - 웹사이트 배포 및 테스트
2. [CDN 설정](./cdn-setup.md) - 성능 최적화
3. [모니터링](./monitoring.md) - 서비스 모니터링 설정

## 추가 리소스

- [COS API 참조](https://cloud.tencent.com/document/product/436/7751)
- [COS SDK 문서](https://cloud.tencent.com/document/product/436/6474)
- [COS 모범 사례](https://cloud.tencent.com/document/product/436/3128) 