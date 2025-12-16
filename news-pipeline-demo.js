#!/usr/bin/env node

/**
 * 🎙️ 자동 뉴스 방송 파이프라인 데모
 *
 * 뉴스 수집 → 편집 → 대본 작성 → 음성 변환
 * 4개의 서브 에이전트가 협업하는 과정을 시뮬레이션
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function log(message, color = colors.reset, indent = 0) {
  const prefix = '  '.repeat(indent);
  console.log(`${color}${prefix}${message}${colors.reset}`);
}

function printSeparator() {
  log('═'.repeat(80), colors.gray);
}

function printSection(title) {
  log(`\n${'▼'.repeat(40)}`, colors.bright);
  log(`${title}`, colors.bright);
  log('▼'.repeat(40), colors.bright);
}

// ============================================
// 서브 에이전트 1: 뉴스 수집기
// ============================================

class NewsCollectorAgent {
  constructor() {
    this.name = '📰 뉴스 수집 에이전트';
    this.expertise = '실시간 뉴스 모니터링 및 분류';
  }

  async execute() {
    printSection(this.name);
    log(`전문 분야: ${this.expertise}`, colors.cyan, 1);
    log(`작업: 주요 언론사에서 최신 뉴스 수집 중...`, colors.cyan, 1);

    await delay(1000);

    // 실제로는 RSS 피드나 뉴스 API에서 가져옴
    const collectedNews = [
      {
        id: 'news_001',
        title: 'AI 반도체 시장 급성장, 삼성전자 5조원 투자 발표',
        source: '한국경제',
        category: '경제',
        publishedAt: new Date().toISOString(),
        summary: '삼성전자가 AI 반도체 부문에 5조원 규모의 대규모 투자를 발표했습니다.',
        importance: 'high',
        keywords: ['AI', '반도체', '삼성전자', '투자'],
        url: 'https://example.com/news1'
      },
      {
        id: 'news_002',
        title: 'OpenAI, GPT-5 곧 공개 예정... "인간 수준 추론 가능"',
        source: '테크크런치',
        category: 'IT',
        publishedAt: new Date().toISOString(),
        summary: 'OpenAI가 차세대 AI 모델 GPT-5를 곧 공개하며, 인간 수준의 추론이 가능하다고 밝혔습니다.',
        importance: 'high',
        keywords: ['OpenAI', 'GPT-5', 'AI', '인공지능'],
        url: 'https://example.com/news2'
      },
      {
        id: 'news_003',
        title: '2025년 예산안 국회 통과, 주요 내용은?',
        source: '연합뉴스',
        category: '정치',
        publishedAt: new Date().toISOString(),
        summary: '2025년 정부 예산안이 국회 본회의를 통과했습니다.',
        importance: 'high',
        keywords: ['예산안', '국회', '정치'],
        url: 'https://example.com/news3'
      },
      {
        id: 'news_004',
        title: '전국 미세먼지 농도 \'나쁨\' 수준',
        source: 'YTN',
        category: '사회',
        publishedAt: new Date().toISOString(),
        summary: '오늘 전국 대부분 지역의 미세먼지 농도가 나쁨 수준을 보이고 있습니다.',
        importance: 'medium',
        keywords: ['미세먼지', '날씨', '환경'],
        url: 'https://example.com/news4'
      },
      {
        id: 'news_005',
        title: '손흥민, 프리미어리그 해트트릭 달성',
        source: '스포츠조선',
        category: '스포츠',
        publishedAt: new Date().toISOString(),
        summary: '토트넘의 손흥민 선수가 프리미어리그에서 해트트릭을 기록했습니다.',
        importance: 'medium',
        keywords: ['손흥민', '축구', '프리미어리그'],
        url: 'https://example.com/news5'
      }
    ];

    log(`\n✓ 총 ${collectedNews.length}개 뉴스 수집 완료`, colors.green, 1);
    log(`\n수집된 뉴스 목록:`, colors.cyan, 1);

    collectedNews.forEach((news, idx) => {
      const stars = '⭐'.repeat(news.importance === 'high' ? 5 : 3);
      log(`${idx + 1}. [${news.category}] ${news.title}`, colors.reset, 2);
      log(`   출처: ${news.source} | 중요도: ${stars}`, colors.gray, 2);
    });

    log(`\n→ 편집자 에이전트에게 전달`, colors.cyan, 1);

    return {
      timestamp: new Date().toISOString(),
      totalCollected: collectedNews.length,
      news: collectedNews
    };
  }
}

// ============================================
// 서브 에이전트 2: 뉴스 편집자
// ============================================

class NewsEditorAgent {
  constructor() {
    this.name = '✂️ 뉴스 편집자 에이전트';
    this.expertise = '방송용 뉴스 큐레이션 및 구성';
  }

  async execute(collectedData) {
    printSection(this.name);
    log(`전문 분야: ${this.expertise}`, colors.magenta, 1);
    log(`작업: ${collectedData.totalCollected}개 뉴스 중 방송용으로 편집 중...`, colors.magenta, 1);

    await delay(1200);

    // 중요도와 카테고리 기준으로 선별 및 순서 배정
    const mainNews = collectedData.news
      .filter(n => n.importance === 'high')
      .slice(0, 3);

    const subNews = collectedData.news
      .filter(n => n.importance === 'medium')
      .slice(0, 2);

    const editedStructure = {
      broadcastDate: new Date().toLocaleDateString('ko-KR'),
      totalDuration: '8분 30초',
      sections: [
        {
          type: 'opening',
          duration: '30초',
          script: '안녕하세요, 오늘의 주요 뉴스를 전해드립니다.'
        },
        ...mainNews.map((news, idx) => ({
          type: 'main',
          order: idx + 1,
          newsId: news.id,
          title: news.title,
          category: news.category,
          duration: '1분 30초',
          summary: news.summary,
          keyPoints: this.extractKeyPoints(news),
          transition: idx < mainNews.length - 1
            ? this.generateTransition(news.category, mainNews[idx + 1]?.category)
            : '다음은 간단한 소식입니다.'
        })),
        ...subNews.map((news, idx) => ({
          type: 'sub',
          order: idx + 1,
          newsId: news.id,
          title: news.title,
          category: news.category,
          duration: '45초',
          summary: news.summary
        })),
        {
          type: 'closing',
          duration: '20초',
          script: '이상 오늘의 뉴스였습니다. 좋은 하루 되세요.'
        }
      ],
      editingNotes: [
        '메인 뉴스 3개: 경제, IT, 정치 순으로 배치',
        '긍정적인 스포츠 뉴스로 분위기 전환',
        '복잡한 전문 용어는 대본 작성 시 쉽게 풀어쓸 것'
      ]
    };

    log(`\n✓ 방송 구성 완료`, colors.green, 1);
    log(`\n📋 편집 결과:`, colors.magenta, 1);
    log(`총 방송 시간: ${editedStructure.totalDuration}`, colors.reset, 2);
    log(`메인 뉴스: ${mainNews.length}개`, colors.reset, 2);
    log(`서브 뉴스: ${subNews.length}개`, colors.reset, 2);

    log(`\n구성 순서:`, colors.magenta, 2);
    editedStructure.sections.forEach((section, idx) => {
      if (section.type === 'opening') {
        log(`${idx + 1}. [오프닝] ${section.duration}`, colors.gray, 3);
      } else if (section.type === 'main') {
        log(`${idx + 1}. [메인${section.order}] ${section.category} | ${section.title}`, colors.reset, 3);
      } else if (section.type === 'sub') {
        log(`${idx + 1}. [서브${section.order}] ${section.category} | ${section.title}`, colors.gray, 3);
      } else if (section.type === 'closing') {
        log(`${idx + 1}. [클로징] ${section.duration}`, colors.gray, 3);
      }
    });

    log(`\n→ 대본 작가 에이전트에게 전달`, colors.magenta, 1);

    return editedStructure;
  }

  extractKeyPoints(news) {
    // 실제로는 AI가 핵심 포인트 추출
    return [
      '주요 내용 1',
      '주요 내용 2',
      '의미와 전망'
    ];
  }

  generateTransition(currentCategory, nextCategory) {
    const transitions = {
      '경제_IT': 'IT 분야 소식입니다.',
      'IT_정치': '국내 정치 소식을 전해드립니다.',
      '정치_사회': '사회 소식입니다.'
    };
    return transitions[`${currentCategory}_${nextCategory}`] || '다음 소식입니다.';
  }
}

// ============================================
// 서브 에이전트 3: 대본 작가
// ============================================

class ScriptWriterAgent {
  constructor() {
    this.name = '📝 대본 작가 에이전트';
    this.expertise = '방송용 대본 작성 및 TTS 최적화';
  }

  async execute(editedStructure) {
    printSection(this.name);
    log(`전문 분야: ${this.expertise}`, colors.blue, 1);
    log(`작업: ${editedStructure.sections.length}개 섹션의 대본 작성 중...`, colors.blue, 1);

    await delay(1500);

    let fullScript = '';
    const scriptSections = [];

    for (const section of editedStructure.sections) {
      let sectionScript = '';

      if (section.type === 'opening') {
        sectionScript = this.writeOpening(editedStructure.broadcastDate);
      } else if (section.type === 'main') {
        sectionScript = this.writeMainNews(section);
      } else if (section.type === 'sub') {
        sectionScript = this.writeSubNews(section);
      } else if (section.type === 'closing') {
        sectionScript = this.writeClosing();
      }

      scriptSections.push({
        type: section.type,
        title: section.title || section.type,
        script: sectionScript,
        duration: section.duration
      });

      fullScript += sectionScript + '\n\n';
    }

    const finalScript = {
      date: editedStructure.broadcastDate,
      totalDuration: editedStructure.totalDuration,
      sections: scriptSections,
      fullText: fullScript,
      wordCount: fullScript.replace(/\s/g, '').length,
      metadata: {
        voice: 'female',
        speed: 1.0,
        pitch: 1.0,
        language: 'ko-KR'
      }
    };

    log(`\n✓ 대본 작성 완료`, colors.green, 1);
    log(`\n📄 대본 정보:`, colors.blue, 1);
    log(`총 글자 수: ${finalScript.wordCount}자`, colors.reset, 2);
    log(`예상 낭독 시간: ${editedStructure.totalDuration}`, colors.reset, 2);

    log(`\n대본 미리보기:`, colors.blue, 1);
    printSeparator();
    log(fullScript.substring(0, 500) + '...', colors.gray, 1);
    printSeparator();

    log(`\n→ 음성 변환 에이전트에게 전달`, colors.blue, 1);

    return finalScript;
  }

  writeOpening(date) {
    return `안녕하세요. ${date} 오늘의 뉴스를 전해드립니다.

오늘은, AI 반도체 투자 소식과, 새로운 기술 발표 소식을 중심으로 전해드립니다.`;
  }

  writeMainNews(section) {
    return `【${section.category}】 ${section.title}

${section.summary}

이번 발표는, 업계에 큰 영향을 미칠 것으로 예상됩니다.

${section.transition || ''}`;
  }

  writeSubNews(section) {
    return `【${section.category}】 ${section.title}

${section.summary}`;
  }

  writeClosing() {
    return `이상, 오늘의 뉴스를 전해드렸습니다.
좋은 하루 되세요.`;
  }
}

// ============================================
// 서브 에이전트 4: 음성 변환기
// ============================================

class VoiceConverterAgent {
  constructor() {
    this.name = '🎙️ 음성 변환 에이전트';
    this.expertise = 'TTS 및 오디오 후처리';
  }

  async execute(script) {
    printSection(this.name);
    log(`전문 분야: ${this.expertise}`, colors.yellow, 1);
    log(`작업: ${script.wordCount}자 대본을 음성으로 변환 중...`, colors.yellow, 1);

    await delay(1000);
    log(`\n[1/4] 텍스트 전처리...`, colors.yellow, 2);
    await delay(500);

    log(`[2/4] TTS 엔진 호출 (네이버 CLOVA Voice)...`, colors.yellow, 2);
    await delay(800);

    log(`[3/4] 오디오 후처리 (볼륨 정규화, 무음 제거)...`, colors.yellow, 2);
    await delay(600);

    log(`[4/4] 배경음악 믹싱...`, colors.yellow, 2);
    await delay(700);

    const outputFile = `news_broadcast_${new Date().toISOString().split('T')[0]}.mp3`;

    const result = {
      audioFile: outputFile,
      format: 'MP3, 128kbps',
      duration: script.totalDuration,
      sampleRate: '44.1kHz',
      channels: 'Stereo',
      fileSize: '12.3 MB',
      segments: script.sections.map((section, idx) => ({
        index: idx + 1,
        title: section.title,
        startTime: this.calculateTimestamp(idx),
        duration: section.duration
      })),
      processing: {
        ttsProvider: 'Naver CLOVA Voice',
        voice: script.metadata.voice === 'female' ? 'nara' : 'jinho',
        speed: script.metadata.speed,
        pitch: script.metadata.pitch,
        backgroundMusic: 'news_bgm_professional.mp3',
        bgmVolume: -15
      }
    };

    log(`\n✓ 음성 파일 생성 완료!`, colors.green, 1);
    log(`\n🎵 출력 파일 정보:`, colors.yellow, 1);
    log(`파일명: ${result.audioFile}`, colors.reset, 2);
    log(`포맷: ${result.format}`, colors.reset, 2);
    log(`총 길이: ${result.duration}`, colors.reset, 2);
    log(`파일 크기: ${result.fileSize}`, colors.reset, 2);

    log(`\n음성 설정:`, colors.yellow, 2);
    log(`TTS 엔진: ${result.processing.ttsProvider}`, colors.gray, 3);
    log(`보이스: ${result.processing.voice} (한국어 ${script.metadata.voice === 'female' ? '여성' : '남성'})`, colors.gray, 3);
    log(`속도: ${result.processing.speed}x`, colors.gray, 3);
    log(`배경음악: ${result.processing.backgroundMusic} (${result.processing.bgmVolume}dB)`, colors.gray, 3);

    return result;
  }

  calculateTimestamp(index) {
    // 간단한 타임스탬프 계산
    const seconds = index * 90;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// ============================================
// 메인 오케스트레이터
// ============================================

class NewsBroadcastPipeline {
  constructor() {
    this.name = '🎯 뉴스 방송 파이프라인 (메인 오케스트레이터)';
    this.agents = {
      collector: new NewsCollectorAgent(),
      editor: new NewsEditorAgent(),
      writer: new ScriptWriterAgent(),
      voice: new VoiceConverterAgent()
    };
  }

  async run() {
    console.clear();

    log(`\n${'🎙️'.repeat(40)}`, colors.bright);
    log(`자동 뉴스 방송 제작 파이프라인`, colors.bright);
    log(`${'🎙️'.repeat(40)}\n`, colors.bright);

    log(`${this.name}`, colors.cyan);
    log(`\n이 시스템은 4개의 전문 서브 에이전트가 협업하여`, colors.gray);
    log(`뉴스 수집부터 음성 방송까지 자동으로 처리합니다.\n`, colors.gray);

    printSeparator();

    try {
      // 1단계: 뉴스 수집
      const collectedNews = await this.agents.collector.execute();

      await delay(500);

      // 2단계: 편집
      const editedStructure = await this.agents.editor.execute(collectedNews);

      await delay(500);

      // 3단계: 대본 작성
      const script = await this.agents.writer.execute(editedStructure);

      await delay(500);

      // 4단계: 음성 변환
      const audioResult = await this.agents.voice.execute(script);

      // 최종 결과
      printSection('🎉 파이프라인 완료!');

      log(`\n전체 프로세스가 성공적으로 완료되었습니다!`, colors.green, 1);

      log(`\n📊 처리 통계:`, colors.bright, 1);
      log(`수집된 뉴스: ${collectedNews.totalCollected}개`, colors.reset, 2);
      log(`방송 구성: 메인 ${editedStructure.sections.filter(s => s.type === 'main').length}개 + 서브 ${editedStructure.sections.filter(s => s.type === 'sub').length}개`, colors.reset, 2);
      log(`대본 분량: ${script.wordCount}자`, colors.reset, 2);
      log(`최종 파일: ${audioResult.audioFile} (${audioResult.fileSize})`, colors.reset, 2);

      log(`\n💡 서브 에이전트 파이프라인의 장점:`, colors.cyan, 1);
      log(`✓ 각 에이전트가 전문 분야에만 집중`, colors.reset, 2);
      log(`✓ 단계별로 품질 검증 가능`, colors.reset, 2);
      log(`✓ 에이전트 개별 교체/업그레이드 가능`, colors.reset, 2);
      log(`✓ 전체 프로세스 자동화 (사람 개입 최소)`, colors.reset, 2);

      log(`\n🚀 실전 활용 방법:`, colors.yellow, 1);
      log(`1. cron으로 매일 자동 실행 (예: 매일 오전 9시)`, colors.reset, 2);
      log(`2. 생성된 음성 파일을 팟캐스트/유튜브에 자동 업로드`, colors.reset, 2);
      log(`3. 이메일/텔레그램으로 구독자에게 발송`, colors.reset, 2);
      log(`4. 블로그에 대본과 함께 포스팅`, colors.reset, 2);

      log('\n');
      printSeparator();

      return {
        success: true,
        collectedNews,
        editedStructure,
        script,
        audioResult
      };

    } catch (error) {
      log(`\n❌ 오류 발생: ${error.message}`, colors.red, 1);
      return { success: false, error: error.message };
    }
  }
}

// ============================================
// 프로그램 실행
// ============================================

async function main() {
  const pipeline = new NewsBroadcastPipeline();
  await pipeline.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  NewsBroadcastPipeline,
  NewsCollectorAgent,
  NewsEditorAgent,
  ScriptWriterAgent,
  VoiceConverterAgent
};
