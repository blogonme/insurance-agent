
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: 'Baidu' | 'Bing';
}

export const searchNews = async (keyword: string, engine: 'baidu' | 'bing'): Promise<SearchResult[]> => {
  try {
    const results: SearchResult[] = [];
    
    if (engine === 'baidu') {
      const response = await fetch(`/api/baidu/s?wd=${encodeURIComponent(keyword)}&tn=news`);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const items = doc.querySelectorAll('.result-op');
      items.forEach((item) => {
        try {
          const titleEl = item.querySelector('.news-title-font_1xS-F');
          const linkEl = item.querySelector('a');
          const snippetEl = item.querySelector('.c-font-normal');
          
          if (titleEl && linkEl) {
            results.push({
              title: titleEl.textContent?.trim() || '',
              url: linkEl.href,
              snippet: snippetEl?.textContent?.trim() || '',
              source: 'Baidu'
            });
          }
        } catch (e) {
          console.warn('Failed to parse a baidu result', e);
        }
      });
    } else {
      // Bing News Search
      const response = await fetch(`/api/bing/news/search?q=${encodeURIComponent(keyword)}`);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const items = doc.querySelectorAll('.news-card'); 
      // Bing structure varies, trying a generic selector or specific one if known. 
      // Fallback to generic card selector often found in bing news
      
      if (items.length === 0) {
         // Fallback for standard bing search if news structure is complex
         const standardItems = doc.querySelectorAll('.b_algo');
         standardItems.forEach(item => {
            const h2 = item.querySelector('h2');
            const link = item.querySelector('a');
            const caption = item.querySelector('.b_caption p');
            if (h2 && link) {
                results.push({
                    title: h2.textContent || '',
                    url: link.href,
                    snippet: caption?.textContent || '',
                    source: 'Bing'
                });
            }
         });
      } else {
          items.forEach((item) => {
            const titleEl = item.querySelector('.title');
            const linkEl = item.querySelector('.title'); // simple link
            const snippetEl = item.querySelector('.snippet');
            
            if (titleEl) {
                 results.push({
                  title: titleEl.textContent?.trim() || '',
                  url: (titleEl as HTMLAnchorElement).href || '',
                  snippet: snippetEl?.textContent?.trim() || '',
                  source: 'Bing'
                });
            }
          });
      }
    }

    return results.slice(0, 5); // Return top 5
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
};
