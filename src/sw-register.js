// Service Worker registration + update notification banner.
// Lives outside React so it can show before the app mounts and survives re-renders.

const BANNER_ID = 'sw-update-banner';

function showUpdateBanner(worker) {
  if (document.getElementById(BANNER_ID)) return;

  const banner = document.createElement('div');
  banner.id = BANNER_ID;
  banner.setAttribute('role', 'status');
  banner.innerHTML = `
    <span>新しいバージョンがあります</span>
    <button type="button" data-action="reload">更新する</button>
    <button type="button" data-action="dismiss" aria-label="閉じる">×</button>
  `;
  document.body.appendChild(banner);

  banner.querySelector('[data-action="reload"]').addEventListener('click', () => {
    worker.postMessage('SKIP_WAITING');
  });
  banner.querySelector('[data-action="dismiss"]').addEventListener('click', () => {
    banner.remove();
  });
}

export function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      // 既に待機中の SW がいれば即座に通知
      if (reg.waiting && navigator.serviceWorker.controller) {
        showUpdateBanner(reg.waiting);
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(newWorker);
          }
        });
      });
    }).catch(() => { /* ignore registration errors */ });
  });
}
