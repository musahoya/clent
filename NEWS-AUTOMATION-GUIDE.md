# 🎙️ 자동 뉴스 방송 제작 시스템 가이드

## 목차
1. [시스템 개요](#시스템-개요)
2. [빠른 시작](#빠른-시작)
3. [실전 구현](#실전-구현)
4. [API 연동](#api-연동)
5. [자동화 설정](#자동화-설정)
6. [비용 최적화](#비용-최적화)

---

## 시스템 개요

### 전체 파이프라인

```
┌─────────────────┐
│  1. 뉴스 수집   │  RSS/API에서 최신 뉴스 자동 수집
│  📰 Collector   │
└────────┬────────┘
         ↓
┌─────────────────┐
│  2. 편집        │  방송용으로 선별 및 순서 구성
│  ✂️ Editor      │
└────────┬────────┘
         ↓
┌─────────────────┐
│  3. 대본 작성   │  TTS 최적화된 방송 대본 작성
│  📝 Writer      │
└────────┬────────┘
         ↓
┌─────────────────┐
│  4. 음성 변환   │  텍스트 → 음성 + 배경음악
│  🎙️ Voice       │
└────────┬────────┘
         ↓
   📻 최종 음성 파일
```

### 각 에이전트의 역할

| 에이전트 | 입력 | 출력 | 소요 시간 |
|----------|------|------|-----------|
| **뉴스 수집** | RSS 피드 URL | 뉴스 목록 (JSON) | 10초 |
| **편집자** | 뉴스 목록 | 방송 구성안 | 5초 |
| **대본 작가** | 방송 구성안 | 대본 텍스트 | 10초 |
| **음성 변환** | 대본 텍스트 | MP3 파일 | 30-60초 |

**총 처리 시간: 약 1-2분**

---

## 빠른 시작

### 1. 데모 실행하기

```bash
# 시뮬레이션 데모 실행
node news-pipeline-demo.js
```

이 데모는 **실제 API 없이** 전체 프로세스를 시뮬레이션합니다.

### 2. 결과 확인

데모를 실행하면:
- ✅ 5개의 샘플 뉴스 수집
- ✅ 8분 30초 분량 방송 구성
- ✅ 2,400자 분량 대본 작성
- ✅ MP3 파일 메타데이터 생성

---

## 실전 구현

### 필요한 준비물

#### 1. 뉴스 소스 (아래 중 선택)

**무료 옵션:**
- **NewsAPI.org** (무료 플랜: 100 요청/일)
- **RSS 피드** (네이버 뉴스, 다음 뉴스)
- **웹 스크래핑** (BeautifulSoup, Puppeteer)

**유료 옵션:**
- **Google News API**
- **Bing News Search API**

#### 2. TTS (음성 변환) 서비스

| 서비스 | 한국어 품질 | 가격 | 무료 할당량 |
|--------|-------------|------|-------------|
| **네이버 CLOVA** | ⭐⭐⭐⭐⭐ | ₩15/1,000자 | X |
| **Google Cloud TTS** | ⭐⭐⭐⭐ | $4/100만자 | 월 400만자 |
| **AWS Polly** | ⭐⭐⭐⭐ | $4/100만자 | 월 500만자 |
| **ElevenLabs** | ⭐⭐⭐⭐⭐ | $5/월~ | 월 10분 |

**추천: Google Cloud TTS** (무료 할당량이 넉넉함)

---

## API 연동

### Step 1: 뉴스 API 연동

#### 옵션 A: NewsAPI.org 사용

```javascript
// npm install axios

const axios = require('axios');

async function fetchNews() {
  const API_KEY = 'YOUR_NEWSAPI_KEY'; // https://newsapi.org 에서 발급
  const url = 'https://newsapi.org/v2/top-headlines';

  const response = await axios.get(url, {
    params: {
      country: 'kr',
      apiKey: API_KEY,
      pageSize: 10
    }
  });

  return response.data.articles.map(article => ({
    id: article.url,
    title: article.title,
    summary: article.description,
    source: article.source.name,
    publishedAt: article.publishedAt,
    url: article.url,
    category: '일반', // NewsAPI는 카테고리 제공 안 함
    importance: 'high'
  }));
}

// 사용
fetchNews().then(news => {
  console.log(`수집된 뉴스: ${news.length}개`);
  console.log(news[0]);
});
```

#### 옵션 B: RSS 피드 사용 (무료!)

```javascript
// npm install rss-parser

const Parser = require('rss-parser');
const parser = new Parser();

async function fetchNewsFromRSS() {
  const feeds = [
    'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko',
    'https://www.yonhapnewstv.co.kr/browse/feed/'
  ];

  const allNews = [];

  for (const feedUrl of feeds) {
    const feed = await parser.parseURL(feedUrl);

    feed.items.forEach(item => {
      allNews.push({
        id: item.guid,
        title: item.title,
        summary: item.contentSnippet || item.content,
        source: feed.title,
        publishedAt: item.pubDate,
        url: item.link,
        category: item.categories?.[0] || '일반',
        importance: 'medium'
      });
    });
  }

  return allNews.slice(0, 10); // 상위 10개
}

// 사용
fetchNewsFromRSS().then(news => {
  console.log(`RSS에서 ${news.length}개 수집`);
});
```

### Step 2: TTS API 연동

#### 옵션 A: Google Cloud TTS (추천)

```javascript
// npm install @google-cloud/text-to-speech

const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

async function textToSpeechGoogle(text, outputFile) {
  // 1. Google Cloud 콘솔에서 API 키 발급
  // 2. GOOGLE_APPLICATION_CREDENTIALS 환경변수 설정

  const client = new textToSpeech.TextToSpeechClient();

  const request = {
    input: { text: text },
    voice: {
      languageCode: 'ko-KR',
      name: 'ko-KR-Wavenet-A', // 여성 음성
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,  // 속도
      pitch: 0.0,         // 음높이
    }
  };

  const [response] = await client.synthesizeSpeech(request);

  fs.writeFileSync(outputFile, response.audioContent, 'binary');
  console.log(`✅ 음성 파일 생성: ${outputFile}`);
}

// 사용
const script = "안녕하세요. 오늘의 뉴스를 전해드립니다.";
textToSpeechGoogle(script, 'output.mp3');
```

**Google Cloud 설정:**
```bash
# 1. Google Cloud SDK 설치
# https://cloud.google.com/sdk/docs/install

# 2. 인증
gcloud auth application-default login

# 3. API 활성화
gcloud services enable texttospeech.googleapis.com

# 4. 환경변수 설정
export GOOGLE_APPLICATION_CREDENTIALS="path/to/keyfile.json"
```

#### 옵션 B: 네이버 CLOVA (한국어 최고 품질)

```javascript
// npm install axios

const axios = require('axios');
const fs = require('fs');

async function textToSpeechNaver(text, outputFile) {
  const CLIENT_ID = 'YOUR_CLIENT_ID';
  const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

  const response = await axios.post(
    'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts',
    `speaker=nara&volume=0&speed=0&pitch=0&format=mp3&text=${encodeURIComponent(text)}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
        'X-NCP-APIGW-API-KEY': CLIENT_SECRET
      },
      responseType: 'arraybuffer'
    }
  );

  fs.writeFileSync(outputFile, response.data);
  console.log(`✅ 음성 파일 생성: ${outputFile}`);
}

// 사용
textToSpeechNaver("안녕하세요", "output.mp3");
```

**네이버 클라우드 설정:**
1. https://www.ncloud.com/ 가입
2. Console → AI Service → CLOVA Voice
3. Application 등록 → API 키 발급

#### 옵션 C: ElevenLabs (가장 자연스러운 음성)

```javascript
// npm install elevenlabs-node

const { ElevenLabsClient } = require('elevenlabs-node');
const fs = require('fs');

async function textToSpeechElevenLabs(text, outputFile) {
  const client = new ElevenLabsClient({
    apiKey: 'YOUR_API_KEY' // https://elevenlabs.io
  });

  const audio = await client.textToSpeech({
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam (영어)
    text: text,
    modelId: 'eleven_multilingual_v2' // 한국어 지원
  });

  fs.writeFileSync(outputFile, audio);
  console.log(`✅ 음성 생성: ${outputFile}`);
}
```

### Step 3: 배경음악 추가

```javascript
// npm install fluent-ffmpeg

const ffmpeg = require('fluent-ffmpeg');

function addBackgroundMusic(voiceFile, bgmFile, outputFile) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(voiceFile)
      .input(bgmFile)
      .complexFilter([
        // BGM 볼륨 -15dB로 낮추기
        '[1:a]volume=0.177[bgm]',
        // 음성과 BGM 믹싱
        '[0:a][bgm]amix=inputs=2:duration=first[out]'
      ])
      .outputOptions('-map [out]')
      .save(outputFile)
      .on('end', () => {
        console.log('✅ 배경음악 추가 완료');
        resolve();
      })
      .on('error', reject);
  });
}

// 사용
await addBackgroundMusic(
  'voice.mp3',
  'background.mp3',
  'final.mp3'
);
```

---

## 자동화 설정

### 매일 자동 실행 (Linux/Mac - Cron)

```bash
# crontab 편집
crontab -e

# 매일 오전 9시에 실행
0 9 * * * cd /path/to/project && node news-pipeline.js >> logs/cron.log 2>&1

# 매 6시간마다 실행
0 */6 * * * cd /path/to/project && node news-pipeline.js
```

### 매일 자동 실행 (Windows - Task Scheduler)

1. 작업 스케줄러 실행
2. "기본 작업 만들기" 클릭
3. 트리거: 매일 오전 9:00
4. 작업: `node C:\path\to\news-pipeline.js`

### PM2로 프로세스 관리

```bash
# PM2 설치
npm install -g pm2

# 앱 시작
pm2 start news-pipeline.js --name news-bot

# 크론 작업 설정
pm2 start news-pipeline.js --cron "0 9 * * *"

# 로그 확인
pm2 logs news-bot

# 자동 시작 설정 (재부팅 시)
pm2 startup
pm2 save
```

### Docker로 컨테이너화

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "news-pipeline.js"]
```

```bash
# 빌드 및 실행
docker build -t news-bot .
docker run -d --name news-bot \
  -e NEWSAPI_KEY=your_key \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
  -v $(pwd)/output:/app/output \
  news-bot
```

---

## 비용 최적화

### 무료로 시작하기

| 항목 | 무료 옵션 | 제한 |
|------|-----------|------|
| 뉴스 소스 | RSS 피드 | 무제한 |
| TTS | Google Cloud TTS | 월 400만자 |
| 저장소 | GitHub | 무제한 |
| 호스팅 | GitHub Actions | 월 2,000분 |

**예상 비용: $0/월** (하루 1회 실행 기준)

### 월간 비용 계산 (하루 1회, 대본 2,500자 기준)

```
뉴스 API:
- RSS 피드: $0
- NewsAPI 무료: $0 (100 요청/일)

TTS:
- Google TTS: 2,500자 × 30일 = 75,000자
- 무료 할당량 400만자 >> 75,000자
- 비용: $0

총 비용: $0/월
```

### 유료 플랜 비용 (하루 10회 실행)

```
TTS (Google): 2,500자 × 30일 × 10회 = 750,000자
- 무료 할당량 초과분: 750,000 - 4,000,000 = 0
- 비용: $0

실제 초과 시:
- 초과분 100만자당 $4
- 예: 500만자 사용 시 = $4/월
```

### 최적화 팁

1. **캐싱 활용**
   ```javascript
   // 같은 날 여러 번 실행해도 뉴스는 1회만 수집
   const cache = require('node-cache');
   const newsCache = new cache({ stdTTL: 3600 }); // 1시간
   ```

2. **배치 처리**
   ```javascript
   // 여러 대본을 한 번에 음성 변환
   const scripts = [script1, script2, script3];
   await Promise.all(scripts.map(s => textToSpeech(s)));
   ```

3. **압축**
   ```javascript
   // MP3 비트레이트 낮추기 (용량 50% 절감)
   audioConfig: {
     audioEncoding: 'MP3',
     sampleRateHertz: 24000, // 기본 44100에서 낮춤
     effectsProfileId: ['headphone-class-device']
   }
   ```

---

## 실전 활용 시나리오

### 시나리오 1: 일일 뉴스 팟캐스트

```
매일 오전 9시 자동 실행
   ↓
최신 뉴스 10개 수집
   ↓
8분 분량 대본 생성
   ↓
음성 파일 생성
   ↓
자동으로 팟캐스트에 업로드
   ↓
트위터/텔레그램에 공유
```

### 시나리오 2: 맞춤형 뉴스 요약

```
사용자가 관심 키워드 등록
   ↓
해당 키워드 뉴스만 수집
   ↓
3분 요약 대본 생성
   ↓
음성 파일 이메일 발송
```

### 시나리오 3: 유튜브 쇼츠 자동 제작

```
뉴스 수집
   ↓
60초 대본 생성 (쇼츠용)
   ↓
음성 + 자막 영상 생성
   ↓
유튜브 쇼츠 자동 업로드
```

---

## 트러블슈팅

### Q1: TTS 음성이 부자연스러워요

**A: SSML 태그 사용**
```javascript
const ssml = `
<speak>
  안녕하세요.
  <break time="500ms"/>
  오늘의 <emphasis level="strong">주요 뉴스</emphasis>를
  전해드립니다.
</speak>
`;
```

### Q2: 한글 발음이 이상해요

**A: 발음 교정**
```javascript
text = text.replace('AI', '에이아이');
text = text.replace('CEO', '씨이오');
text = text.replace('5조', '오조');
```

### Q3: API 호출이 실패해요

**A: 에러 핸들링 추가**
```javascript
async function fetchNewsWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchNews();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * Math.pow(2, i)); // 지수 백오프
    }
  }
}
```

---

## 다음 단계

1. ✅ 데모 실행해보기
2. 📝 실제 API 키 발급받기
3. 🔧 API 연동 코드 작성
4. ⏰ Cron 작업 설정
5. 🚀 프로덕션 배포

**도움이 필요하면 이슈를 남겨주세요!**
