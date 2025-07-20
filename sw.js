// Service Worker for お薬のんだ？ PWA - Performance Optimized
const CACHE_NAME = 'medication-tracker-v2.1';
const STATIC_CACHE = 'static-v2.1';
const DYNAMIC_CACHE = 'dynamic-v2.1';
const IMAGE_CACHE = 'images-v2.1';

// 静的リソース（必須ファイル）
const STATIC_ASSETS = [
  '/medicationtracker/',
  '/medicationtracker/index.html',
  '/medicationtracker/manifest.json',
  '/medicationtracker/privacy-policy.html',
  '/medicationtracker/terms-of-service.html'
];

// 動的キャッシュ対象パターン
const DYNAMIC_PATTERNS = [
  /^https:\/\/www\.gstatic\.com\/firebasejs/,
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/
];

// 画像キャッシュ設定
const IMAGE_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/i
];

// キャッシュサイズ制限
const CACHE_SIZE_LIMITS = {
  [DYNAMIC_CACHE]: 50,
  [IMAGE_CACHE]: 30
};

// ユーティリティ関数
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    const deleteCount = keys.length - maxItems;
    const deletePromises = keys.slice(0, deleteCount).map(key => cache.delete(key));
    await Promise.all(deletePromises);
    console.log(`キャッシュ ${cacheName} から ${deleteCount} 件削除`);
  }
}

function matchesDynamicPattern(url) {
  return DYNAMIC_PATTERNS.some(pattern => pattern.test(url));
}

function matchesImagePattern(url) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(url));
}

// インストールイベント - 静的リソースのプリキャッシュ
self.addEventListener('install', function(event) {
  console.log('Service Worker インストール中...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        console.log('静的キャッシュを開きました');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('静的リソースのキャッシュが完了');
        return self.skipWaiting(); // 即座にアクティベート
      })
  );
});

// フェッチイベント - 高度なキャッシュ戦略
self.addEventListener('fetch', function(event) {
  const { request } = event;
  const url = request.url;
  
  event.respondWith(
    (async () => {
      try {
        // 1. 静的リソース: Cache First
        const staticResponse = await caches.match(request, { cacheName: STATIC_CACHE });
        if (staticResponse) {
          return staticResponse;
        }
        
        // 2. 画像: Cache First with fallback
        if (matchesImagePattern(url)) {
          const imageResponse = await caches.match(request, { cacheName: IMAGE_CACHE });
          if (imageResponse) {
            return imageResponse;
          }
          
          try {
            const fetchResponse = await fetch(request);
            if (fetchResponse.ok) {
              const cache = await caches.open(IMAGE_CACHE);
              cache.put(request, fetchResponse.clone());
              
              // キャッシュサイズ制限
              limitCacheSize(IMAGE_CACHE, CACHE_SIZE_LIMITS[IMAGE_CACHE]);
            }
            return fetchResponse;
          } catch (error) {
            console.log('画像の取得に失敗:', url);
            return new Response('', { status: 404 });
          }
        }
        
        // 3. 動的リソース: Network First with cache fallback
        if (matchesDynamicPattern(url)) {
          try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
              const cache = await caches.open(DYNAMIC_CACHE);
              cache.put(request, networkResponse.clone());
              
              // キャッシュサイズ制限
              limitCacheSize(DYNAMIC_CACHE, CACHE_SIZE_LIMITS[DYNAMIC_CACHE]);
            }
            return networkResponse;
          } catch (error) {
            const cachedResponse = await caches.match(request, { cacheName: DYNAMIC_CACHE });
            if (cachedResponse) {
              return cachedResponse;
            }
            throw error;
          }
        }
        
        // 4. その他のリクエスト: Network First
        try {
          return await fetch(request);
        } catch (error) {
          // オフラインで重要なページの場合はキャッシュから返す
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // オフライン時のフォールバック
          if (request.destination === 'document') {
            return caches.match('/medicationtracker/index.html');
          }
          
          throw error;
        }
        
      } catch (error) {
        console.error('フェッチエラー:', error);
        return new Response('オフライン', { 
          status: 503, 
          statusText: 'Service Unavailable' 
        });
      }
    })()
  );
});

// アクティベートイベント - 古いキャッシュクリーンアップ
self.addEventListener('activate', function(event) {
  console.log('Service Worker アクティベート中...');
  
  event.waitUntil(
    (async () => {
      // 古いキャッシュを削除
      const cacheNames = await caches.keys();
      const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
      
      const deletePromises = cacheNames
        .filter(cacheName => !currentCaches.includes(cacheName))
        .map(cacheName => {
          console.log('古いキャッシュを削除:', cacheName);
          return caches.delete(cacheName);
        });
      
      await Promise.all(deletePromises);
      
      // クライアント制御を即座に取得
      await self.clients.claim();
      
      console.log('Service Worker アクティベート完了');
    })()
  );
});

// バックグラウンド同期（将来的な拡張用）
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('バックグラウンド同期実行中...');
  // 将来的にオフライン時のデータ同期機能を実装
}

// キャッシュ状況の監視とレポート
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    getCacheStatus().then(status => {
      event.ports[0].postMessage(status);
    });
  }
});

async function getCacheStatus() {
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  const status = {};
  
  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      status[cacheName] = {
        count: keys.length,
        size: await getCacheSize(cache, keys)
      };
    } catch (error) {
      status[cacheName] = { error: error.message };
    }
  }
  
  return status;
}

async function getCacheSize(cache, keys) {
  let totalSize = 0;
  for (const request of keys) {
    try {
      const response = await cache.match(request);
      if (response && response.body) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    } catch (error) {
      console.warn('キャッシュサイズ計算エラー:', error);
    }
  }
  return totalSize;
}