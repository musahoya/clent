# 🎙️ 뉴스 자동화 파이프라인 (실전용 완성본)

**서브 에이전트 패턴을 적용한 실제 작동하는 뉴스 자동화 시스템**

## ✨ 특징

- ✅ **실제 작동**: 데모가 아닌 실전용 완성본
- ✅ **서브 에이전트 패턴**: 4개의 전문 에이전트 협업
- ✅ **Google RSS**: API 키 없이 무료로 뉴스 수집
- ✅ **ElevenLabs TTS**: 최고 품질의 한국어 음성
- ✅ **완전 자동화**: Cron으로 매일 자동 실행 가능

## 🏗️ 시스템 구조

```
📰 뉴스 수집  →  📝 대본 작성  →  🎙️ 음성 변환  →  📊 결과 정리
(Google RSS)   (OpenAI GPT)   (ElevenLabs)
```

### 4개의 서브 에이전트

1. **📰 뉴스 수집 에이전트** (`news_collector.py`)
   - Google News RSS로 최신 뉴스 자동 수집
   - 키워드 기반 필터링
   - 관련성 점수로 자동 정렬

2. **📝 대본 작가 에이전트** (`ai_script_generator.py`)
   - OpenAI GPT-4로 8-10분 대본 생성
   - 시니어층(40-60대) 타겟 톤
   - 도입부, 본문, 마무리 구조화

3. **🎙️ 음성 변환 에이전트** (`tts_generator.py`)
   - ElevenLabs로 자연스러운 음성 생성
   - 한국어 다국어 모델 사용
   - 전문적인 여성/남성 음성 선택

4. **🎯 메인 오케스트레이터** (`news_pipeline_subagents.py`)
   - 3개 에이전트 조율
   - 전체 워크플로우 실행
   - 결과 저장 및 로깅

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
cd real-implementation
pip install -r requirements.txt
```

### 2. API 키 설정

`.env` 파일 생성:

```bash
cp .env.example .env
nano .env  # 또는 vim, code 등
```

필수 항목 입력:
```bash
OPENAI_API_KEY=sk-...          # OpenAI API 키
ELEVENLABS_API_KEY=...         # ElevenLabs API 키
NEWS_KEYWORDS=AI,경제,삼성      # 관심 키워드
```

#### API 키 발급 방법:

**OpenAI:**
1. https://platform.openai.com 가입
2. API keys → Create new secret key
3. 복사하여 `.env`에 붙여넣기

**ElevenLabs:**
1. https://elevenlabs.io 가입
2. Profile → API Key
3. 복사하여 `.env`에 붙여넣기

### 3. 실행

```bash
python news_pipeline_subagents.py
```

### 4. 결과 확인

```bash
ls output/
# collected_news.json       - 수집된 뉴스
# generated_scripts.json    - 생성된 대본
# pipeline_result_*.json    - 전체 결과
# audio/                    - 음성 파일 (MP3)
```

## 📊 예상 비용 (월간)

하루 3개 영상 × 30일 = 90개 영상 기준

| 항목 | 서비스 | 비용 |
|------|--------|------|
| 뉴스 수집 | Google RSS | **무료** |
| 대본 생성 | OpenAI GPT-4 | ~$20-30 |
| 음성 변환 | ElevenLabs | ~$22 |
| **총계** | | **$40-50/월** |

💡 **절약 팁:**
- GPT-3.5-turbo 사용 시 → $5-10 절약
- Google TTS 사용 시 (무료 할당량) → $22 절약

## 🔄 자동화 설정

### Cron (Linux/Mac)

매일 오전 9시 자동 실행:

```bash
crontab -e

# 아래 라인 추가
0 9 * * * cd /path/to/real-implementation && /usr/bin/python3 news_pipeline_subagents.py >> logs/cron.log 2>&1
```

### Task Scheduler (Windows)

1. 작업 스케줄러 열기
2. 기본 작업 만들기
3. 트리거: 매일 오전 9:00
4. 작업: `python C:\path\to\news_pipeline_subagents.py`

## 🛠️ 커스터마이징

### 키워드 변경

```bash
# .env 파일에서
NEWS_KEYWORDS=연금,건강,복지,정책  # 시니어 뉴스 채널용
NEWS_KEYWORDS=손흥민,이강인,K리그   # 스포츠 뉴스 채널용
```

### AI 모델 변경

```python
# news_pipeline_subagents.py
config = {
    'ai_service': 'gemini',  # openai → gemini 변경
    'gemini_api_key': '...'
}
```

### TTS 음성 스타일 변경

```python
# news_pipeline_subagents.py의 _step3_generate_audio 함수
audio_result = agent.generate_audio(
    text=script_text,
    voice_style="friendly",  # professional → friendly
    output_filename=output_filename
)
```

## 📁 파일 구조

```
real-implementation/
├── news_pipeline_subagents.py  # 메인 오케스트레이터 ⭐
├── agents/
│   ├── news_collector.py       # 뉴스 수집 에이전트
│   ├── ai_script_generator.py  # 대본 작가 에이전트
│   └── tts_generator.py        # 음성 변환 에이전트
├── requirements.txt            # Python 패키지
├── .env.example                # 환경 변수 템플릿
├── README.md                   # 이 파일
└── output/                     # 생성된 파일 (자동 생성)
    ├── collected_news.json
    ├── generated_scripts.json
    ├── pipeline_result_*.json
    └── audio/
        └── news_voice_*.mp3
```

## 🐛 트러블슈팅

### Q1: "ModuleNotFoundError: No module named 'openai'"

```bash
pip install -r requirements.txt
```

### Q2: "OpenAI API 키가 설정되지 않았습니다"

`.env` 파일에 `OPENAI_API_KEY=sk-...` 추가했는지 확인

### Q3: "ElevenLabs API 오류: 401"

- API 키가 올바른지 확인
- 계정에 크레딧이 남아있는지 확인
- https://elevenlabs.io → Usage 탭 확인

### Q4: 음성 파일이 생성되지 않음

1. `output/audio/` 디렉토리가 자동 생성되었는지 확인
2. TTS API 키가 올바른지 확인
3. 로그에서 에러 메시지 확인

### Q5: 뉴스가 수집되지 않음

- 인터넷 연결 확인
- `feedparser` 패키지가 설치되었는지 확인
- Google News RSS가 차단되지 않았는지 확인

## 💡 서브 에이전트의 장점

이 시스템이 **단일 스크립트**가 아닌 **서브 에이전트 패턴**을 사용하는 이유:

### ✅ 장점:

1. **전문화**: 각 에이전트가 자기 분야만 집중
2. **유지보수**: 한 에이전트만 교체/업그레이드 가능
3. **확장성**: 새 에이전트 추가 용이 (예: 썸네일 생성 에이전트)
4. **디버깅**: 어디서 문제가 생겼는지 명확
5. **재사용**: 다른 프로젝트에서 에이전트 재사용

### 📊 비교:

| 항목 | 단일 스크립트 | 서브 에이전트 |
|------|---------------|---------------|
| 코드 복잡도 | 높음 | 낮음 (모듈화) |
| 유지보수 | 어려움 | 쉬움 |
| 확장성 | 어려움 | 쉬움 |
| 재사용성 | 낮음 | 높음 |
| 디버깅 | 어려움 | 쉬움 |

## 🔮 향후 확장 계획

추가 가능한 서브 에이전트:

- [ ] **썸네일 생성 에이전트** (DALL-E, Midjourney)
- [ ] **영상 편집 에이전트** (FFmpeg, MoviePy)
- [ ] **유튜브 업로드 에이전트** (YouTube Data API)
- [ ] **분석 에이전트** (조회수, 댓글 분석)
- [ ] **A/B 테스트 에이전트** (제목, 썸네일 실험)

## 📝 라이선스

MIT License

## 🤝 기여

Issue 및 Pull Request 환영합니다!

---

**Made with ❤️ and AI Sub-Agents**
