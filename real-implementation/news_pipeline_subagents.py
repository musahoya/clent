#!/usr/bin/env python3
"""
🎙️ 뉴스 자동화 파이프라인 (서브 에이전트 패턴 적용)

4개의 전문 서브 에이전트가 협업하여 뉴스를 자동으로 영상으로 제작합니다.
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List

# 에이전트 임포트
sys.path.append(str(Path(__file__).parent / 'agents'))
from news_collector import NewsCollector
from ai_script_generator import AIScriptGenerator
from tts_generator import TTSGenerator


class NewsPipelineOrchestrator:
    """
    🎯 메인 오케스트레이터

    4개의 서브 에이전트를 조율하여 전체 파이프라인을 실행합니다.
    """

    def __init__(self, config: Dict):
        self.config = config
        self.output_dir = Path("output")
        self.output_dir.mkdir(exist_ok=True)

        # 서브 에이전트 초기화
        self.agents = {
            'collector': NewsCollector(),
            'writer': AIScriptGenerator(
                api_key=config.get('openai_api_key'),
                service=config.get('ai_service', 'openai')
            ),
            'tts': TTSGenerator(
                service=config.get('tts_service', 'elevenlabs'),
                api_key=config.get('elevenlabs_api_key')
            )
        }

    def run_pipeline(self) -> Dict:
        """
        전체 파이프라인 실행
        """
        print("\n" + "="*80)
        print("🎯 뉴스 자동화 파이프라인 시작 (서브 에이전트 패턴)")
        print("="*80)

        try:
            # 1단계: 뉴스 수집
            news_data = self._step1_collect_news()

            # 2단계: 대본 작성
            script_data = self._step2_write_script(news_data)

            # 3단계: 음성 변환
            audio_data = self._step3_generate_audio(script_data)

            # 4단계: 결과 정리
            final_result = self._step4_finalize(news_data, script_data, audio_data)

            print("\n" + "="*80)
            print("🎉 파이프라인 완료!")
            print("="*80)

            return final_result

        except Exception as e:
            print(f"\n❌ 오류 발생: {e}")
            import traceback
            traceback.print_exc()
            return {'status': 'error', 'error': str(e)}

    def _step1_collect_news(self) -> Dict:
        """1단계: 뉴스 수집 에이전트"""
        print("\n" + "▼"*40)
        print("📰 [1단계] 뉴스 수집 에이전트")
        print("▼"*40)

        agent = self.agents['collector']
        agent.keywords = self.config.get('keywords', ["AI", "경제", "삼성"])

        # Google RSS로 뉴스 수집
        all_articles = []
        for keyword in agent.keywords:
            print(f"\n🔍 '{keyword}' 검색 중...")
            articles = agent.fetch_google_news_rss(keyword)
            all_articles.extend(articles)
            print(f"   ✓ {len(articles)}개 수집 완료")

        # 중복 제거 및 정렬
        unique_articles = []
        seen_urls = set()
        for article in all_articles:
            url = article.get('link', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_articles.append(article)

        # 관련성 점수 계산
        for article in unique_articles:
            article['relevance_score'] = self._calculate_relevance(article)

        unique_articles.sort(key=lambda x: x['relevance_score'], reverse=True)

        result = {
            'total_collected': len(unique_articles),
            'articles': unique_articles[:10],  # 상위 10개
            'keywords': agent.keywords
        }

        print(f"\n✅ 수집 완료: 총 {len(unique_articles)}개 (상위 10개 선택)")
        print(f"→ 대본 작가 에이전트에게 전달")

        # JSON 저장
        output_file = self.output_dir / "collected_news.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        return result

    def _step2_write_script(self, news_data: Dict) -> Dict:
        """2단계: 대본 작가 에이전트"""
        print("\n" + "▼"*40)
        print("📝 [2단계] 대본 작가 에이전트")
        print("▼"*40)

        agent = self.agents['writer']
        articles = news_data['articles'][:3]  # 상위 3개 기사

        scripts = []
        for i, article in enumerate(articles, 1):
            print(f"\n✍️  기사 {i}/{len(articles)} 대본 작성 중...")
            print(f"   제목: {article['title'][:50]}...")

            try:
                script_result = agent.generate_youtube_script(article)
                scripts.append(script_result)
                print(f"   ✓ 대본 생성 완료 ({script_result['estimated_duration']})")
            except Exception as e:
                print(f"   ⚠️  대본 생성 실패: {e}")
                continue

        result = {
            'total_scripts': len(scripts),
            'scripts': scripts
        }

        print(f"\n✅ 대본 작성 완료: {len(scripts)}개")
        print(f"→ 음성 변환 에이전트에게 전달")

        # JSON 저장
        output_file = self.output_dir / "generated_scripts.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        return result

    def _step3_generate_audio(self, script_data: Dict) -> Dict:
        """3단계: 음성 변환 에이전트 (ElevenLabs TTS)"""
        print("\n" + "▼"*40)
        print("🎙️  [3단계] 음성 변환 에이전트")
        print("▼"*40)

        agent = self.agents['tts']
        scripts = script_data['scripts']

        audio_files = []
        for i, script_item in enumerate(scripts, 1):
            print(f"\n🎵 대본 {i}/{len(scripts)} 음성 변환 중...")

            script_text = script_item['script']
            output_filename = f"news_voice_{i}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3"

            try:
                audio_result = agent.generate_audio(
                    text=script_text,
                    voice_style="professional",
                    output_filename=output_filename
                )

                if audio_result['status'] == 'success':
                    audio_files.append(audio_result)
                    print(f"   ✓ 음성 생성 완료: {audio_result['output_file']}")
                else:
                    print(f"   ⚠️  음성 생성 실패")

            except Exception as e:
                print(f"   ⚠️  음성 변환 오류: {e}")
                continue

        result = {
            'total_audio_files': len(audio_files),
            'audio_files': audio_files
        }

        print(f"\n✅ 음성 변환 완료: {len(audio_files)}개 파일")

        return result

    def _step4_finalize(self, news_data: Dict, script_data: Dict, audio_data: Dict) -> Dict:
        """4단계: 최종 결과 정리"""
        print("\n" + "▼"*40)
        print("📊 [4단계] 결과 정리")
        print("▼"*40)

        final_result = {
            'pipeline_id': datetime.now().strftime('%Y%m%d_%H%M%S'),
            'status': 'success',
            'completed_at': datetime.now().isoformat(),
            'summary': {
                'news_collected': news_data['total_collected'],
                'scripts_generated': script_data['total_scripts'],
                'audio_files_created': audio_data['total_audio_files']
            },
            'news': news_data,
            'scripts': script_data,
            'audio': audio_data
        }

        # 최종 결과 JSON 저장
        output_file = self.output_dir / f"pipeline_result_{final_result['pipeline_id']}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(final_result, f, ensure_ascii=False, indent=2)

        print(f"\n✅ 결과 파일 저장: {output_file}")
        print("\n📊 처리 통계:")
        print(f"   - 수집된 뉴스: {final_result['summary']['news_collected']}개")
        print(f"   - 생성된 대본: {final_result['summary']['scripts_generated']}개")
        print(f"   - 음성 파일: {final_result['summary']['audio_files_created']}개")

        print("\n💡 서브 에이전트의 장점:")
        print("   ✓ 각 에이전트가 전문 분야에만 집중")
        print("   ✓ 단계별로 품질 검증 가능")
        print("   ✓ 에이전트 개별 교체/업그레이드 가능")
        print("   ✓ 전체 프로세스 자동화 (사람 개입 최소)")

        return final_result

    def _calculate_relevance(self, article: Dict) -> int:
        """관련성 점수 계산"""
        score = 0
        title = article.get('title', '').lower()

        # 중요 키워드 보너스
        important_keywords = ['급등', '상승', '하락', '발표', '신제품', '출시', '계획', '투자']
        for kw in important_keywords:
            if kw in title:
                score += 5

        return score


def main():
    """메인 실행 함수"""

    # 환경 변수에서 API 키 로드
    config = {
        # 뉴스 수집 키워드
        'keywords': os.getenv('NEWS_KEYWORDS', 'AI,삼성,부동산,경제').split(','),

        # AI 서비스 설정
        'ai_service': os.getenv('AI_SERVICE', 'openai'),  # openai, gemini, anthropic
        'openai_api_key': os.getenv('OPENAI_API_KEY', ''),
        'gemini_api_key': os.getenv('GEMINI_API_KEY', ''),
        'anthropic_api_key': os.getenv('ANTHROPIC_API_KEY', ''),

        # TTS 서비스 설정
        'tts_service': os.getenv('TTS_SERVICE', 'elevenlabs'),  # elevenlabs, google, azure
        'elevenlabs_api_key': os.getenv('ELEVENLABS_API_KEY', ''),

        # YouTube 설정 (선택)
        'youtube_credentials': 'client_secrets.json'
    }

    # API 키 확인
    if not config['openai_api_key'] and config['ai_service'] == 'openai':
        print("⚠️  OpenAI API 키가 설정되지 않았습니다.")
        print("   환경 변수 OPENAI_API_KEY를 설정하거나")
        print("   .env 파일을 생성하세요.")
        print("\n📝 .env 파일 예시:")
        print("   OPENAI_API_KEY=sk-...")
        print("   ELEVENLABS_API_KEY=...")
        print("   NEWS_KEYWORDS=AI,경제,삼성")
        return

    if not config['elevenlabs_api_key'] and config['tts_service'] == 'elevenlabs':
        print("⚠️  ElevenLabs API 키가 설정되지 않았습니다.")
        print("   TTS 기능이 제한될 수 있습니다.")

    # 파이프라인 실행
    orchestrator = NewsPipelineOrchestrator(config)
    result = orchestrator.run_pipeline()

    if result['status'] == 'success':
        print("\n🎉 모든 작업이 완료되었습니다!")
        print(f"\n📁 결과 파일 위치: {Path('output').absolute()}")
    else:
        print(f"\n❌ 파이프라인 실패: {result.get('error', 'Unknown error')}")


if __name__ == "__main__":
    # .env 파일 로드 (python-dotenv 사용 시)
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    main()
