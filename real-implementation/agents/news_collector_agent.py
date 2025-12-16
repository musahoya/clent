"""
📰 뉴스 수집 에이전트

역할: Google News RSS를 통해 최신 뉴스를 수집하고 필터링
"""

import feedparser
import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from datetime import datetime


class NewsCollectorAgent:
    """
    뉴스 수집 전문 에이전트
    - Google News RSS (무료, API 키 불필요)
    - 키워드 기반 필터링
    - 관련성 점수 계산
    """

    def __init__(self, keywords: List[str] = None):
        self.keywords = keywords or ["AI", "경제", "부동산", "삼성", "쿠팡"]
        self.collected_news = []

    def execute(self, max_news_per_keyword: int = 5) -> Dict:
        """
        뉴스 수집 실행

        Args:
            max_news_per_keyword: 키워드당 수집할 뉴스 개수

        Returns:
            수집된 뉴스 데이터
        """
        print("\n" + "="*60)
        print("📰 뉴스 수집 에이전트 시작")
        print("="*60)
        print(f"키워드: {', '.join(self.keywords)}")
        print(f"키워드당 {max_news_per_keyword}개 수집")

        all_articles = []

        for keyword in self.keywords:
            print(f"\n🔍 '{keyword}' 검색 중...")
            articles = self._fetch_google_news_rss(keyword, max_news_per_keyword)
            all_articles.extend(articles)
            print(f"   ✓ {len(articles)}개 수집 완료")

        # 중복 제거 (URL 기준)
        unique_articles = self._remove_duplicates(all_articles)

        # 관련성 점수로 정렬
        sorted_articles = sorted(
            unique_articles,
            key=lambda x: x.get('relevance_score', 0),
            reverse=True
        )

        result = {
            'status': 'success',
            'collected_at': datetime.now().isoformat(),
            'total_articles': len(sorted_articles),
            'keywords': self.keywords,
            'articles': sorted_articles[:20]  # 상위 20개만
        }

        print(f"\n✅ 수집 완료: 총 {len(sorted_articles)}개 (상위 20개 선택)")
        print(f"→ 대본 작가 에이전트에게 전달\n")

        return result

    def _fetch_google_news_rss(self, keyword: str, max_results: int) -> List[Dict]:
        """Google News RSS 파싱"""
        url = f"https://news.google.com/rss/search?q={keyword}&hl=ko&gl=KR&ceid=KR:ko"

        try:
            feed = feedparser.parse(url)
            articles = []

            for entry in feed.entries[:max_results]:
                article = {
                    'title': entry.title,
                    'description': entry.get('summary', ''),
                    'link': entry.link,
                    'pub_date': entry.get('published', ''),
                    'keyword': keyword,
                    'source': 'google_news',
                    'relevance_score': self._calculate_relevance(entry.title, keyword)
                }
                articles.append(article)

            return articles

        except Exception as e:
            print(f"   ⚠️ 오류 발생: {e}")
            return []

    def _calculate_relevance(self, title: str, keyword: str) -> int:
        """관련성 점수 계산 (간단한 버전)"""
        score = 0
        title_lower = title.lower()
        keyword_lower = keyword.lower()

        # 키워드가 제목에 포함되어 있으면 높은 점수
        if keyword_lower in title_lower:
            score += 10

        # 중요 키워드 보너스
        important_keywords = ['급등', '상승', '하락', '발표', '신제품', '출시', '계획']
        for kw in important_keywords:
            if kw in title:
                score += 5

        return score

    def _remove_duplicates(self, articles: List[Dict]) -> List[Dict]:
        """중복 제거 (URL 기준)"""
        seen_urls = set()
        unique = []

        for article in articles:
            url = article.get('link', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique.append(article)

        return unique

    def scrape_article_content(self, url: str) -> str:
        """기사 본문 스크래핑 (필요 시 사용)"""
        try:
            response = requests.get(url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            soup = BeautifulSoup(response.content, 'html.parser')

            # 일반적인 기사 본문 태그 시도
            for selector in ['article', '.article_body', '#articleBodyContents', '.news_end']:
                article_body = soup.select_one(selector)
                if article_body:
                    for tag in article_body(['script', 'style', 'iframe']):
                        tag.decompose()
                    return article_body.get_text(strip=True, separator='\n')

            return ""

        except Exception as e:
            print(f"   ⚠️ 스크래핑 오류: {e}")
            return ""


if __name__ == "__main__":
    # 테스트 실행
    agent = NewsCollectorAgent(keywords=["AI", "반도체"])
    result = agent.execute(max_news_per_keyword=3)

    print("\n📊 수집 결과:")
    for i, article in enumerate(result['articles'][:5], 1):
        print(f"\n{i}. {article['title']}")
        print(f"   키워드: {article['keyword']} | 점수: {article['relevance_score']}")
