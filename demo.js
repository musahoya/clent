#!/usr/bin/env node

/**
 * 🤖 서브 에이전트 개념 데모
 *
 * 이 프로그램은 메인 에이전트가 여러 서브 에이전트를 호출하여
 * 복잡한 작업을 수행하는 과정을 시뮬레이션합니다.
 */

// 색상 출력을 위한 ANSI 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

// 지연 함수 (시뮬레이션을 위해)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 로그 출력 헬퍼
function log(message, color = colors.reset, indent = 0) {
  const prefix = '  '.repeat(indent);
  console.log(`${color}${prefix}${message}${colors.reset}`);
}

// ============================================
// 서브 에이전트 정의
// ============================================

/**
 * 기획 에이전트
 * 역할: 프로젝트 요구사항을 분석하고 계획을 수립
 */
class PlannerAgent {
  constructor() {
    this.name = '📋 기획 에이전트';
    this.expertise = '요구사항 분석 및 프로젝트 계획';
  }

  async execute(task) {
    log(`\n${this.name} 시작...`, colors.cyan, 1);
    log(`전문 분야: ${this.expertise}`, colors.cyan, 1);

    await delay(800);

    const plan = {
      pages: ['홈페이지', '소개 페이지', '연락처 페이지'],
      features: ['반응형 디자인', 'SEO 최적화', '다크모드'],
      timeline: '2주'
    };

    log(`✓ 프로젝트 계획 수립 완료`, colors.green, 1);
    log(`  - 페이지: ${plan.pages.join(', ')}`, colors.reset, 1);
    log(`  - 기능: ${plan.features.join(', ')}`, colors.reset, 1);

    return plan;
  }
}

/**
 * 디자인 에이전트
 * 역할: UI/UX 디자인 생성
 */
class DesignerAgent {
  constructor() {
    this.name = '🎨 디자인 에이전트';
    this.expertise = 'UI/UX 디자인 및 컴포넌트 설계';
  }

  async execute(plan) {
    log(`\n${this.name} 시작...`, colors.magenta, 1);
    log(`전문 분야: ${this.expertise}`, colors.magenta, 1);
    log(`입력: ${plan.pages.length}개 페이지 디자인 필요`, colors.magenta, 1);

    await delay(1000);

    const design = {
      colorScheme: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        background: '#FFFFFF',
        text: '#1F2937'
      },
      components: ['Header', 'Hero', 'Footer', 'Card', 'Button'],
      layout: 'Grid-based responsive layout'
    };

    log(`✓ 디자인 시스템 생성 완료`, colors.green, 1);
    log(`  - 컴포넌트: ${design.components.join(', ')}`, colors.reset, 1);
    log(`  - 레이아웃: ${design.layout}`, colors.reset, 1);

    return design;
  }
}

/**
 * 개발 에이전트
 * 역할: 실제 코드 작성
 */
class DeveloperAgent {
  constructor() {
    this.name = '💻 개발 에이전트';
    this.expertise = '프론트엔드 개발 (React, Tailwind)';
  }

  async execute(plan, design) {
    log(`\n${this.name} 시작...`, colors.blue, 1);
    log(`전문 분야: ${this.expertise}`, colors.blue, 1);
    log(`입력: 계획 + 디자인`, colors.blue, 1);

    await delay(1200);

    const code = {
      files: plan.pages.length * 3, // 각 페이지당 3개 파일
      components: design.components.length,
      linesOfCode: 1247,
      framework: 'React + Tailwind CSS'
    };

    log(`✓ 코드 작성 완료`, colors.green, 1);
    log(`  - 생성된 파일: ${code.files}개`, colors.reset, 1);
    log(`  - 컴포넌트: ${code.components}개`, colors.reset, 1);
    log(`  - 코드 라인: ${code.linesOfCode} LOC`, colors.reset, 1);

    return code;
  }
}

/**
 * QA 에이전트
 * 역할: 테스트 및 품질 검증
 */
class QAAgent {
  constructor() {
    this.name = '🧪 QA 에이전트';
    this.expertise = '테스트 자동화 및 품질 보증';
  }

  async execute(code) {
    log(`\n${this.name} 시작...`, colors.yellow, 1);
    log(`전문 분야: ${this.expertise}`, colors.yellow, 1);

    await delay(900);

    const testResults = {
      unitTests: { passed: 47, failed: 0 },
      e2eTests: { passed: 12, failed: 0 },
      coverage: '94%',
      performance: 'All pages load < 2s',
      accessibility: 'WCAG 2.1 AA compliant'
    };

    log(`✓ 테스트 완료`, colors.green, 1);
    log(`  - 유닛 테스트: ${testResults.unitTests.passed}/${testResults.unitTests.passed} 통과`, colors.reset, 1);
    log(`  - E2E 테스트: ${testResults.e2eTests.passed}/${testResults.e2eTests.passed} 통과`, colors.reset, 1);
    log(`  - 커버리지: ${testResults.coverage}`, colors.reset, 1);
    log(`  - 성능: ${testResults.performance}`, colors.reset, 1);

    return testResults;
  }
}

// ============================================
// 메인 에이전트 (오케스트레이터)
// ============================================

/**
 * 메인 에이전트
 * 역할: 전체 워크플로우 조율 및 서브 에이전트 호출
 */
class MainAgent {
  constructor() {
    this.name = '🎯 메인 에이전트 (오케스트레이터)';
    this.subAgents = {
      planner: new PlannerAgent(),
      designer: new DesignerAgent(),
      developer: new DeveloperAgent(),
      qa: new QAAgent()
    };
  }

  async executeTask(userRequest) {
    log(`\n${'='.repeat(60)}`, colors.bright);
    log(`${this.name}`, colors.bright);
    log(`${'='.repeat(60)}`, colors.bright);
    log(`\n사용자 요청: "${userRequest}"`, colors.bright);
    log(`\n작업 분석 중...`, colors.cyan);

    await delay(500);

    log(`\n✓ 작업을 4개의 서브 에이전트에게 위임합니다:`, colors.green);
    log(`  1. 기획 에이전트 → 프로젝트 계획`, colors.reset);
    log(`  2. 디자인 에이전트 → UI/UX 디자인`, colors.reset);
    log(`  3. 개발 에이전트 → 코드 작성`, colors.reset);
    log(`  4. QA 에이전트 → 테스트 및 검증`, colors.reset);

    // 단계별로 서브 에이전트 실행
    try {
      // 1단계: 기획
      const plan = await this.subAgents.planner.execute(userRequest);

      // 2단계: 디자인 (기획 결과를 입력으로 받음)
      const design = await this.subAgents.designer.execute(plan);

      // 3단계: 개발 (기획과 디자인 결과를 입력으로 받음)
      const code = await this.subAgents.developer.execute(plan, design);

      // 4단계: QA (개발 결과를 입력으로 받음)
      const testResults = await this.subAgents.qa.execute(code);

      // 최종 결과 종합
      log(`\n${'='.repeat(60)}`, colors.bright);
      log(`✅ 전체 작업 완료!`, colors.green);
      log(`${'='.repeat(60)}`, colors.bright);

      log(`\n📊 프로젝트 요약:`, colors.bright);
      log(`  - 페이지: ${plan.pages.length}개`, colors.reset);
      log(`  - 컴포넌트: ${design.components.length}개`, colors.reset);
      log(`  - 코드: ${code.linesOfCode} LOC`, colors.reset);
      log(`  - 테스트 커버리지: ${testResults.coverage}`, colors.reset);
      log(`  - 예상 소요 시간: ${plan.timeline}`, colors.reset);

      log(`\n💡 서브 에이전트의 장점:`, colors.cyan);
      log(`  ✓ 각 에이전트가 전문 분야에 집중`, colors.reset);
      log(`  ✓ 컨텍스트를 효율적으로 사용`, colors.reset);
      log(`  ✓ 작업을 병렬로 처리 가능 (여기서는 순차 실행)`, colors.reset);
      log(`  ✓ 재사용 가능한 에이전트 구조`, colors.reset);

      return {
        success: true,
        plan,
        design,
        code,
        testResults
      };

    } catch (error) {
      log(`\n❌ 오류 발생: ${error.message}`, colors.red);
      return { success: false, error: error.message };
    }
  }
}

// ============================================
// 프로그램 실행
// ============================================

async function main() {
  console.clear();

  log(`\n${'🤖'.repeat(20)}`, colors.bright);
  log(`서브 에이전트 개념 데모`, colors.bright);
  log(`${'🤖'.repeat(20)}\n`, colors.bright);

  log(`이 데모는 하나의 복잡한 작업이 어떻게`, colors.yellow);
  log(`여러 전문화된 서브 에이전트로 나뉘어 처리되는지 보여줍니다.\n`, colors.yellow);

  const mainAgent = new MainAgent();
  const userRequest = '반응형 회사 소개 웹사이트를 만들어주세요';

  await mainAgent.executeTask(userRequest);

  log(`\n${'='.repeat(60)}\n`, colors.bright);
}

// 프로그램 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { MainAgent, PlannerAgent, DesignerAgent, DeveloperAgent, QAAgent };
