/**
 * HABIT TRACKER DAILY - PWA Installation & Service Worker Manager
 * Handles beforeinstallprompt, standalone detection, iOS Safari instructions, and SW registration.
 */

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.init();
  }

  init() {
    this.checkStandalone();
    this.registerServiceWorker();
    this.listenInstallPrompt();
  }

  checkStandalone() {
    const isStandalone = (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) || 
                         (window.navigator && window.navigator.standalone === true);
    this.isInstalled = isStandalone;
    return this.isInstalled;
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            console.log('SW registered with scope:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  if (window.toast) {
                    window.toast('Versi baru tersedia! Muat ulang untuk memperbarui.');
                  }
                }
              });
            });
          })
          .catch((error) => {
            console.warn('SW registration skipped or failed:', error);
          });
      });
    }
  }

  listenInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      this.updateInstallUI();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isInstalled = true;
      this.updateInstallUI();
      if (window.toast) {
        window.toast('Selamat! Habit Tracker Daily berhasil dipasang di perangkat Anda 🎉');
      }
      if (window.confetti) {
        window.confetti.fire();
      }
    });
  }

  async promptInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        this.updateInstallUI();
      }
    } else {
      // If deferredPrompt is not available (e.g. iOS Safari, or already installed, or in desktop browser)
      this.openInstallGuideModal();
    }
  }

  updateInstallUI() {
    const installBtn = document.getElementById('settings-install-btn');
    const installBadge = document.getElementById('settings-install-status');

    if (!installBtn || !installBadge) return;

    if (this.checkStandalone()) {
      installBadge.textContent = '✅ Terpasang (Standalone)';
      installBadge.className = 'badge-subtle-mint';
      installBtn.innerHTML = `
        <span class="btn-icon">✓</span>
        <span>Aplikasi Sudah Terpasang</span>
      `;
      installBtn.classList.add('btn-installed');
    } else if (this.deferredPrompt) {
      installBadge.textContent = '⚡ Siap Diinstal (One-Click)';
      installBadge.className = 'badge-subtle-emerald';
      installBtn.innerHTML = `
        <span class="btn-icon">📲</span>
        <span>Instal App Sekarang</span>
      `;
      installBtn.classList.remove('btn-installed');
    } else {
      installBadge.textContent = 'ℹ️ Panduan Instalasi Manual';
      installBadge.className = 'badge-subtle-indigo';
      installBtn.innerHTML = `
        <span class="btn-icon">📲</span>
        <span>Pasang ke Layar Utama</span>
      `;
      installBtn.classList.remove('btn-installed');
    }
  }

  openInstallGuideModal() {
    const modal = document.getElementById('install-guide-modal');
    if (!modal) return;

    // Detect platform
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);

    let activeTab = isIOS ? 'ios' : (isAndroid ? 'android' : 'desktop');

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="window.pwaManager.closeInstallGuideModal()"></div>
      <div class="modal-sheet animate-slide-up">
        <div class="sheet-handle-bar"></div>
        
        <div class="modal-habit-header">
          <div class="modal-habit-badge bg-indigo-subtle">
            <span class="modal-habit-icon">📲</span>
          </div>
          <div class="modal-habit-title-col">
            <h2 class="modal-habit-name">Panduan Pasang Aplikasi</h2>
            <p class="modal-habit-desc">Gunakan Habit Tracker Daily layaknya aplikasi bawaan tanpa Play Store / App Store.</p>
          </div>
          <button class="modal-close-btn" onclick="window.pwaManager.closeInstallGuideModal()" aria-label="Tutup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="install-guide-tabs">
          <button class="guide-tab-btn ${activeTab === 'ios' ? 'active' : ''}" onclick="window.pwaManager.switchGuideTab('ios')">🍏 Apple iOS</button>
          <button class="guide-tab-btn ${activeTab === 'android' ? 'active' : ''}" onclick="window.pwaManager.switchGuideTab('android')">🤖 Android</button>
          <button class="guide-tab-btn ${activeTab === 'desktop' ? 'active' : ''}" onclick="window.pwaManager.switchGuideTab('desktop')">💻 Desktop / PC</button>
        </div>

        <div class="modal-body-scroll">
          <!-- iOS Guide -->
          <div id="guide-content-ios" class="guide-tab-content ${activeTab === 'ios' ? 'active' : ''}">
            <div class="guide-step-card">
              <span class="step-num">1</span>
              <div class="step-desc">
                <strong>Buka di Safari</strong>
                <p>Pastikan Anda membuka aplikasi ini di browser <strong>Safari</strong> pada iPhone / iPad.</p>
              </div>
            </div>
            <div class="guide-step-card">
              <span class="step-num">2</span>
              <div class="step-desc">
                <strong>Ketuk Tombol Bagikan (Share)</strong>
                <p>Ketuk ikon <strong>Bagikan</strong> (persegi dengan panah mengarah ke atas <span class="badge-icon-sample">⎋</span>) di bilah bawah Safari.</p>
              </div>
            </div>
            <div class="guide-step-card">
              <span class="step-num">3</span>
              <div class="step-desc">
                <strong>Pilih "Tambah ke Layar Utama"</strong>
                <p>Gulir ke bawah dan ketuk opsi <strong>"Add to Home Screen"</strong> (Tambah ke Layar Utama).</p>
              </div>
            </div>
            <div class="guide-step-card">
              <span class="step-num">4</span>
              <div class="step-desc">
                <strong>Selesai!</strong>
                <p>Ketuk <strong>Tambah</strong> di sudut kanan atas. Ikon aplikasi akan langsung muncul di Homescreen Anda!</p>
              </div>
            </div>
          </div>

          <!-- Android Guide -->
          <div id="guide-content-android" class="guide-tab-content ${activeTab === 'android' ? 'active' : ''}">
            <div class="guide-step-card">
              <span class="step-num">1</span>
              <div class="step-desc">
                <strong>Buka di Chrome / Browser Modern</strong>
                <p>Gunakan Google Chrome untuk pengalaman instalasi PWA otomatis terbaik.</p>
              </div>
            </div>
            <div class="guide-step-card">
              <span class="step-num">2</span>
              <div class="step-desc">
                <strong>Ketuk Menu Titik Tiga (⋮)</strong>
                <p>Ketuk tombol menu titik tiga di sudut kanan atas browser Anda.</p>
              </div>
            </div>
            <div class="guide-step-card">
              <span class="step-num">3</span>
              <div class="step-desc">
                <strong>Pilih "Instal Aplikasi"</strong>
                <p>Pilih opsi <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</p>
              </div>
            </div>
          </div>

          <!-- Desktop Guide -->
          <div id="guide-content-desktop" class="guide-tab-content ${activeTab === 'desktop' ? 'active' : ''}">
            <div class="guide-step-card">
              <span class="step-num">1</span>
              <div class="step-desc">
                <strong>Perhatikan Bilah Alamat (URL Bar)</strong>
                <p>Di browser Chrome, Edge, atau Brave, cari ikon instalasi <span class="badge-icon-sample">⊕</span> di sisi kanan bilah alamat web.</p>
              </div>
            </div>
            <div class="guide-step-card">
              <span class="step-num">2</span>
              <div class="step-desc">
                <strong>Klik "Instal Habit Tracker Daily"</strong>
                <p>Aplikasi akan terbuka dalam jendela tersendiri tanpa bilah browser dan ditambahkan ke daftar aplikasi desktop Anda.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer-actions">
          <button class="btn-primary-action w-full" onclick="window.pwaManager.closeInstallGuideModal()">
            Mengerti & Tutup
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  switchGuideTab(tabKey) {
    document.querySelectorAll('.guide-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.guide-tab-content').forEach(content => content.classList.remove('active'));

    const activeBtn = document.querySelector(`.guide-tab-btn[onclick*="${tabKey}"]`);
    const activeContent = document.getElementById(`guide-content-${tabKey}`);

    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
  }

  closeInstallGuideModal() {
    const modal = document.getElementById('install-guide-modal');
    if (modal) modal.classList.remove('active');
  }
}

window.pwaManager = new PWAManager();
