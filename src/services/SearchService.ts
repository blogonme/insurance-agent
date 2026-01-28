
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: 'Baidu' | 'Bing';
}

const NEWS_DOMAINS = [
  'sina.com.cn', '163.com', 'qq.com', 'sohu.com', 'ifeng.com', 
  'people.com.cn', 'xinhuanet.com', 'thepaper.cn', 'jiemian.com', 
  'caixin.com', 'pbc.gov.cn', 'cbirc.gov.cn', 'eastmoney.com', 
  'hexun.com', 'jrj.com.cn', 'chinanews.com', 'news.cn', 'ynet.com'
];

export const searchNews = async (keyword: string, engine: 'baidu' | 'bing'): Promise<SearchResult[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const results: SearchResult[] = [];
    
    if (engine === 'baidu') {
      const response = await fetch(`/api/baidu/s?wd=${encodeURIComponent(keyword)}&tn=news`, { signal: controller.signal });
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Support Baidu News (PC & Mobile fallback)
      const items = doc.querySelectorAll('.result-op, .c-container, .result, .params-item');
      items.forEach((item) => {
        try {
          // Find title link
          const titleEl = item.querySelector('h3 a, .c-title a, .news-title_1Y_Pr a, .title_X5wiv a');
          const snippetEl = item.querySelector('.c-font-normal, .c-summary, .content-right_8Z967, .c-span18, .summary-text_2ZpW5');
          
          if (titleEl) {
            const title = titleEl.textContent?.trim() || '';
            let url = titleEl.getAttribute('href') || '';
            const snippet = snippetEl?.textContent?.trim() || '';

            if (url.startsWith('/')) {
                url = 'https://www.baidu.com' + url;
            }

            // News Property Check
            const isAd = item.textContent?.includes('广告') || item.textContent?.includes('推广');
            const isNewsDomain = NEWS_DOMAINS.some(domain => url.includes(domain));
            const isOfficialNews = snippet.includes('前') || snippet.includes('小时') || snippet.includes('天'); // Date clues

            if (!isAd && (isNewsDomain || isOfficialNews || title.length > 5)) {
              results.push({ title, url, snippet, source: 'Baidu' });
            }
          }
        } catch (e) {
          console.warn('Baidu parse error', e);
        }
      });
    } else {
      // Bing News Search
      const response = await fetch(`/api/bing/news/search?q=${encodeURIComponent(keyword)}`, { signal: controller.signal });
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const items = doc.querySelectorAll('.news-card, .t_n, .b_algo, .news-item, .caption'); 
      
      items.forEach((item) => {
        try {
            const titleEl = item.querySelector('.title, h2, h3, a.title, .news-title, .header a');
            const snippetEl = item.querySelector('.snippet, .c-caption, p, .news-snippet, .description');
            
            if (titleEl) {
                 const title = titleEl.textContent?.trim() || '';
                 const linkEl = item.querySelector('a') || titleEl;
                 let url = linkEl?.getAttribute('href') || '';
                 
                 if (url.startsWith('/')) {
                     url = 'https://cn.bing.com' + url;
                 }

                 if (url && url !== '#' && !url.includes('javascript:')) {
                     const isNewsDomain = NEWS_DOMAINS.some(domain => url.includes(domain));
                     if (isNewsDomain || title.length > 8) {
                         results.push({
                          title, url,
                          snippet: snippetEl?.textContent?.trim() || '',
                          source: 'Bing'
                        });
                     }
                 }
            }
        } catch (e) {}
      });
    }

    clearTimeout(timeoutId);
    
    // Final deduplication and cleanup
    const uniqueResults = Array.from(new Map(results.map(r => [r.url, r])).values());
    return uniqueResults
      .filter(r => r.title && r.url && !r.url.includes('baidu.com/link'))
      .slice(0, 5);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Search failed:', error);
    return [];
  }
};
