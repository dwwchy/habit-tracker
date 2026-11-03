/**
 * HABIT TRACKER DAILY - Main Application Controller
 * Handles Navigation Router, Today View, Habit Cards, Presets, Form Modals, and Settings.
 */

// Global Toast Feedback Helper
window.toast = function(message, duration = 2800) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toastItem = document.createElement('div');
  toastItem.className = 'toast-item animate-toast-in';
  toastItem.textContent = message;

  toastContainer.appendChild(toastItem);

  setTimeout(() => {
    toastItem.classList.add('animate-toast-out');
    setTimeout(() => {
      if (toastItem.parentNode) {
        toastItem.parentNode.removeChild(toastItem);
      }
    }, 300);
  }, duration);
};

// Preset catalog definition & templates
const HABIT_PRESETS = [
  {
    category: "Sport",
    icon: "🏃",
    items: [
      { name: "Walk", icon: "🚶", color: "#F59E0B", description: "Jalan santai minimal 30 menit", reminder: "07:00" },
      { name: "Run", icon: "🏃", color: "#EF4444", description: "Lari jogging sore / pagi", reminder: "06:30" },
      { name: "Yoga", icon: "🧘", color: "#8B5CF6", description: "Sesi relaksasi dan peregangan", reminder: "06:00" },
      { name: "Exercise", icon: "💪", color: "#10B981", description: "Latihan fisik dan workout", reminder: "16:30" },
      { name: "Stretch", icon: "🤸", color: "#EC4899", description: "Peregangan otot ringan tiap pagi", reminder: "07:30" },
      { name: "Swim", icon: "🏊", color: "#06B6D4", description: "Berenang 20-30 menit", reminder: "16:00" },
      { name: "Cycling", icon: "🚴", color: "#3B82F6", description: "Bersepeda keliling taman", reminder: "17:00" },
      { name: "Dance", icon: "💃", color: "#F43F5E", description: "Koreografi atau senam aerobik", reminder: "18:00" },
      { name: "Interval Training", icon: "⏱️", color: "#F97316", description: "HIIT interval 15-20 menit", reminder: "17:30" }
    ]
  },
  {
    category: "Health",
    icon: "💧",
    items: [
      { name: "Drink Water", icon: "💧", color: "#06B6D4", description: "Minum 8 gelas / 2.5 liter air", reminder: "08:00" },
      { name: "Take Vitamins", icon: "💊", color: "#F59E0B", description: "Konsumsi suplemen harian", reminder: "09:00" },
      { name: "Eat Fruit", icon: "🍎", color: "#EF4444", description: "Makan buah segar setiap hari", reminder: "12:00" },
      { name: "Sleep Early", icon: "😴", color: "#6366F1", description: "Tidur sebelum pukul 22.30", reminder: "22:00" }
    ]
  },
  {
    category: "Mind & Productivity",
    icon: "🧠",
    items: [
      { name: "Read Book", icon: "📚", color: "#8B5CF6", description: "Membaca buku 15-20 halaman", reminder: "20:00" },
      { name: "Study / Coding", icon: "💻", color: "#3B82F6", description: "Belajar skill baru 30 menit", reminder: "19:00" },
      { name: "Meditate", icon: "🧠", color: "#10B981", description: "Meditasi hening 10 menit", reminder: "06:00" },
      { name: "Journaling", icon: "✍️", color: "#F59E0B", description: "Catat refleksi dan rasa syukur", reminder: "21:30" }
    ]
  }
];

// Quick templates for fast 1-click filling
const POPULAR_TEMPLATES = [
  { name: "Walk", label: "🚶 Jalan Pagi", icon: "🚶", color: "#F59E0B", description: "Jalan santai minimal 30 menit", reminder: "07:00" },
  { name: "Drink Water", label: "💧 Minum Air", icon: "💧", color: "#06B6D4", description: "Minum 8 gelas / 2.5 liter air", reminder: "08:00" },
  { name: "Run", label: "🏃 Lari Sore", icon: "🏃", color: "#EF4444", description: "Lari jogging sore / pagi", reminder: "16:30" },
  { name: "Yoga", label: "🧘 Sesi Yoga", icon: "🧘", color: "#8B5CF6", description: "Sesi relaksasi dan peregangan", reminder: "06:00" },
  { name: "Exercise", label: "💪 Workout", icon: "💪", color: "#10B981", description: "Latihan fisik dan olahraga", reminder: "17:00" },
  { name: "Take Vitamins", label: "💊 Vitamin", icon: "💊", color: "#F59E0B", description: "Konsumsi suplemen harian", reminder: "09:00" },
  { name: "Eat Fruit", label: "🍎 Makan Buah", icon: "🍎", color: "#EF4444", description: "Makan buah segar setiap hari", reminder: "12:00" },
  { name: "Sleep Early", label: "😴 Tidur Cepat", icon: "😴", color: "#6366F1", description: "Tidur malam sebelum jam 22.30", reminder: "22:00" },
  { name: "Read Book", label: "📚 Baca Buku", icon: "📚", color: "#8B5CF6", description: "Membaca buku 15-20 halaman", reminder: "20:00" },
  { name: "Meditate", label: "🧠 Meditasi", icon: "🧠", color: "#10B981", description: "Meditasi hening 10 menit", reminder: "06:30" },
  { name: "Study / Coding", label: "💻 Belajar", icon: "💻", color: "#3B82F6", description: "Belajar hal baru 30 menit", reminder: "19:00" },
  { name: "Stretch", label: "🤸 Peregangan", icon: "🤸", color: "#EC4899", description: "Peregangan otot ringan tiap pagi", reminder: "07:30" }
];

class AppRouter {
  constructor() {
    this.currentRoute = 'today';
  }

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'today';
      this.navigate(hash, false);
    });

    const initialRoute = window.location.hash.replace('#', '') || 'today';
    this.navigate(initialRoute, false);
  }

  navigate(routeKey, updateHash = true) {
    const validRoutes = ['today', 'stats', 'calendar', 'settings'];
    if (!validRoutes.includes(routeKey)) {
      routeKey = 'today';
    }

    this.currentRoute = routeKey;
    if (updateHash) {
      window.location.hash = routeKey;
    }

    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(view => {
      view.classList.remove('active', 'tab-enter');
    });

    // Show active view section with gentle micro-transition
    const targetView = document.getElementById(`${routeKey}-view`);
    if (targetView) {
      targetView.classList.remove('tab-enter');
      void targetView.offsetWidth; // Trigger reflow so transition plays cleanly
      targetView.classList.add('active', 'tab-enter');
    }

    // Update bottom nav & sidebar nav active states
    document.querySelectorAll('.nav-item').forEach(btn => {
      const target = btn.getAttribute('data-route');
      if (target === routeKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update header title text
    const headerTitle = document.getElementById('header-title-text');
    const headerSub = document.getElementById('header-date-sub');
    if (headerTitle) {
      if (routeKey === 'today') {
        headerTitle.textContent = 'Today';
        if (headerSub) {
          const selectedDateKey = window.habitStore.getSelectedDate();
          const [y, m, d] = selectedDateKey.split('-').map(Number);
          const dateObj = new Date(y, m - 1, d);
          const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          headerSub.textContent = `${dayNames[dateObj.getDay()]}, ${d} ${months[m - 1]}`;
        }
      } else if (routeKey === 'stats') {
        headerTitle.textContent = 'Statistics';
        if (headerSub) headerSub.textContent = 'Progress at a glance';
      } else if (routeKey === 'calendar') {
        headerTitle.textContent = 'Calendar';
        if (headerSub) headerSub.textContent = 'Streaks & Insights';
      } else if (routeKey === 'settings') {
        headerTitle.textContent = 'Settings';
        if (headerSub) headerSub.textContent = 'Preferences & App Install';
      }
    }

    // Render corresponding view
    if (routeKey === 'today') {
      window.todayView.render();
    } else if (routeKey === 'stats') {
      window.statisticsManager.render();
    } else if (routeKey === 'calendar') {
      window.calendarManager.renderGlobalCalendar();
    } else if (routeKey === 'settings') {
      window.settingsView.render();
    }

    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

// ==========================================
// Today View Controller
// ==========================================
class TodayViewController {
  constructor() {
    this.weekOffset = 0; // 0 = current week
    this.previouslyAllDone = false;
  }

  render() {
    const container = document.getElementById('today-view');
    if (!container) return;

    const selectedDateKey = window.habitStore.getSelectedDate();
    const todayKey = formatDateKey(new Date());
    const isSelectedToday = selectedDateKey === todayKey;

    // Format subtitle date
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const formattedDate = `${dayNames[dateObj.getDay()]}, ${d} ${months[m - 1]} ${y}`;

    // Update Header Date Subtitle dynamically
    const headerTitle = document.getElementById('header-title-text');
    const headerSub = document.getElementById('header-date-sub');
    const isTodayRoute = !window.appRouter || window.appRouter.currentRoute === 'today';
    if (headerTitle && isTodayRoute) {
      headerTitle.textContent = 'Today';
    }
    if (headerSub && isTodayRoute) {
      headerSub.textContent = `${dayNames[dateObj.getDay()].slice(0, 3)}, ${d} ${months[m - 1].slice(0, 3)}`;
    }

    // Get habits & progress for selected date
    const scheduledHabits = window.habitStore.getHabitsForDate(selectedDateKey);
    const progress = window.habitStore.getDailyProgress(selectedDateKey);

    // Confetti on achieving 100%
    if (progress.isAllDone && !this.previouslyAllDone && progress.total > 0) {
      if (window.confetti) window.confetti.fire();
      this.previouslyAllDone = true;
    } else if (!progress.isAllDone) {
      this.previouslyAllDone = false;
    }

    // Motivational status text
    let motivationalText = "Mulai harimu dengan satu langkah! 🌟";
    if (progress.total === 0) {
      motivationalText = "Belum ada habit yang dijadwalkan hari ini.";
    } else if (progress.percentage === 100) {
      motivationalText = "All Done 🎉 — Hari yang luar biasa!";
    } else if (progress.percentage >= 66) {
      motivationalText = "Hampir selesai! Selesaikan sisa harimu 🔥";
    } else if (progress.percentage >= 33) {
      motivationalText = "Terus bergerak, kamu pasti bisa! 💪";
    } else if (progress.percentage > 0) {
      motivationalText = "Ayo lanjutkan momentummu hari ini! 🚀";
    }

    container.innerHTML = `
      <div class="today-container">
        <!-- Date Header Subtitle -->
        <div class="today-date-banner">
          <div class="date-headline-group">
            <span class="card-eyebrow">${isSelectedToday ? 'HARI INI' : 'TANGGAL DIPILIH'}</span>
            <h2 class="today-date-text">${formattedDate}</h2>
          </div>
          ${!isSelectedToday ? `
            <button class="chip-btn-sm" id="btn-jump-today">
              Kembali ke Hari Ini
            </button>
          ` : ''}
        </div>

        <!-- Horizontal Week Date Strip -->
        <div class="week-strip-card bento-card">
          <div class="week-strip-nav-row">
            <button class="icon-btn-subtle" id="strip-prev-week" title="Minggu Sebelumnya" aria-label="Minggu Sebelumnya">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="week-strip-month-lbl">${months[m - 1]} ${y}</span>
            <button class="icon-btn-subtle" id="strip-next-week" title="Minggu Berikutnya" aria-label="Minggu Berikutnya">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div class="week-strip-days">
            ${this.renderWeekStripDays(selectedDateKey)}
          </div>
        </div>

        <!-- Daily Progress Bar Card -->
        <div class="bento-card progress-card ${progress.isAllDone ? 'is-all-done-card' : ''}">
          <div class="progress-top-row">
            <div>
              <span class="card-eyebrow">PROGRES HARIAN</span>
              <h3 class="progress-motivation">${motivationalText}</h3>
            </div>
            <div class="progress-percent-badge ${progress.isAllDone ? 'badge-all-done' : ''}">
              ${progress.percentage}%
            </div>
          </div>

          <div class="progress-track-wrapper">
            <div class="progress-track">
              <div class="progress-fill ${progress.isAllDone ? 'fill-all-done' : ''}" style="width: ${progress.percentage}%;"></div>
            </div>
          </div>

          <div class="progress-bottom-meta">
            <span class="meta-ratio">
              <strong>${progress.completed}</strong> dari ${progress.total} habit selesai
            </span>
            ${progress.isAllDone ? `<span class="all-done-pill">All Done 🎉</span>` : ''}
          </div>
        </div>

        <!-- Daily Habit Card List -->
        <div class="habit-list-section">
          <div class="section-title-row">
            <div>
              <span class="card-eyebrow">DAFTAR KEBIASAAN</span>
              <h3 class="section-title">Habit Hari Ini</h3>
            </div>
            <button class="btn-text-sm" onclick="window.appModal.openAddHabitModal()">
              + Tambah
            </button>
          </div>

          <div class="habit-cards-stack">
            ${scheduledHabits.length === 0 ? this.renderEmptyState() : scheduledHabits.map(h => this.renderHabitCard(h, selectedDateKey)).join('')}
          </div>
        </div>
      </div>
    `;

    // Event listeners
    const jumpTodayBtn = document.getElementById('btn-jump-today');
    if (jumpTodayBtn) {
      jumpTodayBtn.addEventListener('click', () => {
        window.habitStore.setSelectedDate(todayKey);
        this.weekOffset = 0;
      });
    }

    document.getElementById('strip-prev-week').addEventListener('click', () => {
      this.shiftWeek(-1);
    });

    document.getElementById('strip-next-week').addEventListener('click', () => {
      this.shiftWeek(1);
    });

    // Bind dropdown menus and card click actions
    this.bindCardInteractions(container);
  }

  shiftWeek(direction) {
    const selected = window.habitStore.getSelectedDate();
    const [y, m, d] = selected.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + (direction * 7));
    window.habitStore.setSelectedDate(formatDateKey(dateObj));
  }

  renderWeekStripDays(selectedDateKey) {
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const refDate = new Date(y, m - 1, d);

    // Find Monday of the current reference date
    const day = refDate.getDay();
    const diffToMonday = refDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(refDate);
    monday.setDate(diffToMonday);

    const days = [];
    const dayLabels = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
    const todayKey = formatDateKey(new Date());

    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      const curKey = formatDateKey(cur);

      const prog = window.habitStore.getDailyProgress(curKey);
      const isSelected = curKey === selectedDateKey;
      const isToday = curKey === todayKey;

      let statusDotClass = 'dot-gray';
      if (prog.total > 0) {
        if (prog.isAllDone) statusDotClass = 'dot-emerald';
        else if (prog.completed > 0) statusDotClass = 'dot-amber';
      }

      days.push(`
        <button class="strip-day-chip ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}"
                onclick="window.habitStore.setSelectedDate('${curKey}')"
                aria-label="${dayLabels[i]} ${cur.getDate()}">
          <span class="chip-day-name">${dayLabels[i]}</span>
          <span class="chip-day-num">${cur.getDate()}</span>
          <span class="chip-status-dot ${statusDotClass}"></span>
        </button>
      `);
    }

    return days.join('');
  }

  renderHabitCard(habit, dateKey) {
    const isCompleted = window.habitStore.isHabitCompleted(habit.id, dateKey);
    const streakInfo = window.habitStore.calculateHabitStreak(habit.id);

    return `
      <div class="habit-card bento-card ${isCompleted ? 'habit-card-completed' : ''}" 
           data-habit-id="${habit.id}" style="--habit-accent: ${habit.color};">
        <!-- Left: One-Tap Check-in Button -->
        <button class="habit-check-btn ${isCompleted ? 'is-checked' : ''}" 
                data-action="toggle-check"
                data-habit-id="${habit.id}"
                style="${isCompleted ? `background: ${habit.color}; border-color: ${habit.color};` : `border-color: ${habit.color};`}"
                title="${isCompleted ? 'Batalkan Centang' : 'Tandai Selesai'}"
                aria-label="${habit.name}: ${isCompleted ? 'Selesai' : 'Belum Selesai'}">
          <svg class="check-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>

        <!-- Center: Habit Info (Clicking opens Detail Modal) -->
        <div class="habit-main-info" data-action="open-detail" data-habit-id="${habit.id}">
          <div class="habit-icon-pill" style="background: ${habit.color}22; border-color: ${habit.color}44;">
            <span class="habit-emoji">${habit.icon}</span>
          </div>
          <div class="habit-meta-col">
            <div class="habit-title-line">
              <h4 class="habit-name ${isCompleted ? 'line-through' : ''}">${habit.name}</h4>
              ${streakInfo.currentStreak > 0 ? `
                <span class="streak-pill" title="${streakInfo.currentStreak} hari berturut-turut">
                  ${streakInfo.currentStreak} 🔥
                </span>
              ` : ''}
            </div>
            ${habit.description ? `<p class="habit-desc">${habit.description}</p>` : ''}
            <div class="habit-tags-row">
              <span class="habit-tag">${habit.frequency === 'daily' ? 'Daily' : 'Hari Tertentu'}</span>
              ${habit.reminder ? `<span class="habit-tag">⏰ ${habit.reminder}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Right: Three Dots Action Menu -->
        <div class="habit-card-menu-anchor">
          <button class="icon-btn-subtle menu-trigger" data-action="open-menu" data-habit-id="${habit.id}" aria-label="Menu Opsi">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>
          
          <div class="habit-dropdown-menu" id="menu-${habit.id}">
            <button class="dropdown-item" onclick="window.calendarManager.openHabitDetailModal('${habit.id}')">
              <span class="item-icon">📊</span>
              <span>Lihat Detail & Kalender</span>
            </button>
            <button class="dropdown-item" onclick="window.appModal.openEditHabitModal('${habit.id}')">
              <span class="item-icon">✏️</span>
              <span>Edit Habit</span>
            </button>
            <button class="dropdown-item" onclick="window.calendarManager.handleToggleArchive('${habit.id}')">
              <span class="item-icon">📁</span>
              <span>Arsipkan</span>
            </button>
            <button class="dropdown-item item-danger" onclick="window.calendarManager.handleDelete('${habit.id}')">
              <span class="item-icon">🗑️</span>
              <span>Hapus Habit</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="empty-state-card bento-card">
        <div class="empty-icon">🌱</div>
        <h4 class="empty-title">Belum Ada Habit Hari Ini</h4>
        <p class="empty-subtitle">Mulai bangun rutinitas positif dengan menambahkan kebiasaan baru atau memilih preset siap pakai.</p>
        <button class="btn-primary-action" onclick="window.appModal.openAddHabitModal('form')">
          ✏️ Buat Habit Kustom
        </button>

        <div class="empty-quick-add-section">
          <span class="empty-quick-add-lbl">Atau tambah langsung habit populer:</span>
          <div class="empty-quick-add-chips">
            <button class="empty-chip-btn" onclick="window.appModal.quickAddPreset('Walk')">🚶 + Jalan Pagi</button>
            <button class="empty-chip-btn" onclick="window.appModal.quickAddPreset('Drink Water')">💧 + Minum Air</button>
            <button class="empty-chip-btn" onclick="window.appModal.quickAddPreset('Run')">🏃 + Lari Sore</button>
            <button class="empty-chip-btn" onclick="window.appModal.quickAddPreset('Yoga')">🧘 + Yoga</button>
            <button class="empty-chip-btn" onclick="window.appModal.quickAddPreset('Sleep Early')">😴 + Tidur Cepat</button>
          </div>
        </div>
      </div>
    `;
  }

  bindCardInteractions(container) {
    // Check-in button click
    container.querySelectorAll('[data-action="toggle-check"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const habitId = btn.getAttribute('data-habit-id');
        const selectedDateKey = window.habitStore.getSelectedDate();
        const completed = window.habitStore.toggleHabitCompletion(habitId, selectedDateKey);

        if (completed && window.toast) {
          const habit = window.habitStore.getHabitById(habitId);
          window.toast(`Bagus! "${habit ? habit.name : 'Habit'}" selesai! 👏`);
        }
      });
    });

    // Habit card body click -> open detail modal
    container.querySelectorAll('[data-action="open-detail"]').forEach(area => {
      area.addEventListener('click', () => {
        const habitId = area.getAttribute('data-habit-id');
        if (window.calendarManager && habitId) {
          window.calendarManager.openHabitDetailModal(habitId);
        }
      });
    });

    // Three dots menu toggle
    container.querySelectorAll('[data-action="open-menu"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const habitId = btn.getAttribute('data-habit-id');
        const menu = document.getElementById(`menu-${habitId}`);

        // Close any other open dropdowns
        document.querySelectorAll('.habit-dropdown-menu.active').forEach(m => {
          if (m !== menu) m.classList.remove('active');
        });

        if (menu) {
          menu.classList.toggle('active');
        }
      });
    });

    // Close menus on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.habit-dropdown-menu.active').forEach(m => m.classList.remove('active'));
    });
  }

  updateHabitCheckState(habitId, dateKey, isCompleted) {
    const card = document.querySelector(`.habit-card[data-habit-id="${habitId}"]`);
    const habit = window.habitStore.getHabitById(habitId);
    if (!card || !habit) {
      this.render();
      return;
    }

    const checkBtn = card.querySelector('[data-action="toggle-check"]');
    const nameEl = card.querySelector('.habit-name');

    if (isCompleted) {
      card.classList.add('habit-card-completed');
      if (checkBtn) {
        checkBtn.classList.add('is-checked');
        checkBtn.style.background = habit.color;
        checkBtn.style.borderColor = habit.color;
        checkBtn.setAttribute('title', 'Batalkan Centang');
      }
      if (nameEl) nameEl.classList.add('line-through');
    } else {
      card.classList.remove('habit-card-completed');
      if (checkBtn) {
        checkBtn.classList.remove('is-checked');
        checkBtn.style.background = 'transparent';
        checkBtn.style.borderColor = habit.color;
        checkBtn.setAttribute('title', 'Tandai Selesai');
      }
      if (nameEl) nameEl.classList.remove('line-through');
    }

    // Update streak badge on card
    const streakInfo = window.habitStore.calculateHabitStreak(habit.id);
    let streakPill = card.querySelector('.streak-pill');
    if (streakInfo.currentStreak > 0) {
      if (!streakPill) {
        const titleLine = card.querySelector('.habit-title-line');
        if (titleLine) {
          streakPill = document.createElement('span');
          streakPill.className = 'streak-pill';
          titleLine.appendChild(streakPill);
        }
      }
      if (streakPill) streakPill.textContent = `${streakInfo.currentStreak} 🔥`;
    } else if (streakPill) {
      streakPill.remove();
    }

    // Update Daily Progress Bar and Status in-place
    const progress = window.habitStore.getDailyProgress(dateKey);
    const progCard = document.querySelector('.progress-card');
    const progFill = document.querySelector('.progress-fill');
    const progPercentBadge = document.querySelector('.progress-percent-badge');
    const progMetaRatio = document.querySelector('.meta-ratio');
    const progMotivation = document.querySelector('.progress-motivation');
    const progBottomMeta = document.querySelector('.progress-bottom-meta');

    let motivationalText = "Mulai harimu dengan satu langkah! 🌟";
    if (progress.total === 0) {
      motivationalText = "Belum ada habit yang dijadwalkan hari ini.";
    } else if (progress.percentage === 100) {
      motivationalText = "All Done 🎉 — Hari yang luar biasa!";
    } else if (progress.percentage >= 66) {
      motivationalText = "Hampir selesai! Selesaikan sisa harimu 🔥";
    } else if (progress.percentage >= 33) {
      motivationalText = "Terus bergerak, kamu pasti bisa! 💪";
    } else if (progress.percentage > 0) {
      motivationalText = "Ayo lanjutkan momentummu hari ini! 🚀";
    }

    if (progMotivation) progMotivation.textContent = motivationalText;
    if (progPercentBadge) {
      progPercentBadge.textContent = `${progress.percentage}%`;
      if (progress.isAllDone) progPercentBadge.classList.add('badge-all-done');
      else progPercentBadge.classList.remove('badge-all-done');
    }
    if (progFill) {
      progFill.style.width = `${progress.percentage}%`;
      if (progress.isAllDone) progFill.classList.add('fill-all-done');
      else progFill.classList.remove('fill-all-done');
    }
    if (progMetaRatio) {
      progMetaRatio.innerHTML = `<strong>${progress.completed}</strong> dari ${progress.total} habit selesai`;
    }
    if (progCard) {
      if (progress.isAllDone) progCard.classList.add('is-all-done-card');
      else progCard.classList.remove('is-all-done-card');
    }

    // Handle All Done pill
    if (progBottomMeta) {
      let donePill = progBottomMeta.querySelector('.all-done-pill');
      if (progress.isAllDone) {
        if (!donePill) {
          donePill = document.createElement('span');
          donePill.className = 'all-done-pill';
          donePill.textContent = 'All Done 🎉';
          progBottomMeta.appendChild(donePill);
        }
      } else if (donePill) {
        donePill.remove();
      }
    }

    // Confetti on 100%
    if (progress.isAllDone && !this.previouslyAllDone && progress.total > 0) {
      if (window.confetti) window.confetti.fire();
      this.previouslyAllDone = true;
    } else if (!progress.isAllDone) {
      this.previouslyAllDone = false;
    }

    // Update status dot on horizontal week strip for this date
    const selectedChip = document.querySelector('.strip-day-chip.is-selected .chip-status-dot');
    if (selectedChip) {
      selectedChip.className = 'chip-status-dot';
      if (progress.total > 0) {
        if (progress.isAllDone) selectedChip.classList.add('dot-emerald');
        else if (progress.completed > 0) selectedChip.classList.add('dot-amber');
        else selectedChip.classList.add('dot-gray');
      } else {
        selectedChip.classList.add('dot-gray');
      }
    }
  }
}

// ==========================================
// Modal Manager (Add / Edit Habit & Presets)
// ==========================================
class ModalManager {
  constructor() {
    this.currentTab = 'form'; // 'form' | 'catalog'
    this.activeAccordion = 'all'; // 'all' | category name
    this.editingHabitId = null;
    this.selectedEmoji = '🏃';
    this.selectedColor = '#6366F1';
    this.currentPrefill = null;
  }

  findPresetByName(name) {
    for (const cat of HABIT_PRESETS) {
      const found = cat.items.find(i => i.name.toLowerCase() === name.toLowerCase());
      if (found) return found;
    }
    const pop = POPULAR_TEMPLATES.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (pop) return pop;
    return null;
  }

  openAddHabitModal(preferredTab = 'form', prefillData = null) {
    this.editingHabitId = null;
    this.currentTab = preferredTab;
    this.selectedEmoji = prefillData && prefillData.icon ? prefillData.icon : '🏃';
    this.selectedColor = prefillData && prefillData.color ? prefillData.color : '#6366F1';
    this.currentPrefill = prefillData || {
      name: '',
      icon: this.selectedEmoji,
      description: '',
      color: this.selectedColor,
      frequency: 'daily',
      reminder: '07:00',
      startDate: window.habitStore.getSelectedDate() || formatDateKey(),
      endDate: ''
    };

    this.render();

    const modal = document.getElementById('habit-form-modal');
    if (modal) modal.classList.add('active');
  }

  openEditHabitModal(habitId) {
    const habit = window.habitStore.getHabitById(habitId);
    if (!habit) return;

    this.editingHabitId = habitId;
    this.currentTab = 'form';
    this.selectedEmoji = habit.icon;
    this.selectedColor = habit.color;
    this.currentPrefill = {
      name: habit.name,
      icon: habit.icon,
      description: habit.description || '',
      color: habit.color,
      frequency: habit.frequency,
      reminder: habit.reminder || '',
      startDate: habit.startDate || formatDateKey(),
      endDate: habit.endDate || ''
    };

    this.render();

    const modal = document.getElementById('habit-form-modal');
    if (modal) modal.classList.add('active');
  }

  switchModalTab(tabKey) {
    this.currentTab = tabKey;
    this.render();
  }

  closeModal() {
    const modal = document.getElementById('habit-form-modal');
    if (modal) modal.classList.remove('active');
    this.editingHabitId = null;
    this.currentPrefill = null;
  }

  render() {
    const modal = document.getElementById('habit-form-modal');
    if (!modal) return;

    if (this.currentTab === 'catalog') {
      this.renderCatalogView(modal);
    } else {
      this.renderFormView(modal);
    }
  }

  renderCatalogView(modal) {
    modal.innerHTML = `
      <div class="modal-backdrop" onclick="window.appModal.closeModal()"></div>
      <div class="modal-sheet animate-slide-up">
        <div class="sheet-handle-bar"></div>

        <div class="modal-habit-header">
          <div class="modal-habit-badge bg-indigo-subtle">
            <span class="modal-habit-icon">📋</span>
          </div>
          <div class="modal-habit-title-col">
            <h2 class="modal-habit-name">Katalog Preset Habit</h2>
            <p class="modal-habit-desc">Pilih kebiasaan terbukti efektif dan mulai dalam 1 ketukan</p>
          </div>
          <button class="modal-close-btn" onclick="window.appModal.closeModal()" aria-label="Tutup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div style="padding: 12px 20px 0 20px;">
          <div class="modal-nav-tabs">
            <button type="button" class="modal-nav-tab" onclick="window.appModal.switchModalTab('form')">
              ✏️ Buat Habit Kustom
            </button>
            <button type="button" class="modal-nav-tab active" onclick="window.appModal.switchModalTab('catalog')">
              📋 Katalog Preset Siap Pakai
            </button>
          </div>
        </div>

        <div class="modal-body-scroll">
          <!-- Quick Hero Callout -->
          <div class="custom-habit-hero-card" onclick="window.appModal.switchModalTab('form')">
            <div class="hero-left">
              <span class="hero-icon-pill">✏️</span>
              <div>
                <h3 class="hero-title">Custom Habit (+)</h3>
                <p class="hero-sub">Ingin membuat habit dengan nama & aturan sendiri? Buka formulir kustom</p>
              </div>
            </div>
            <span class="hero-arrow">→</span>
          </div>

          <!-- Presets Categories -->
          <div class="preset-accordion-container">
            ${HABIT_PRESETS.map(cat => {
              const isExpanded = this.activeAccordion === 'all' || this.activeAccordion === cat.category;
              return `
                <div class="preset-category-card bento-card ${isExpanded ? 'expanded' : ''}">
                  <button class="preset-category-header" onclick="window.appModal.toggleAccordion('${cat.category}')">
                    <div class="category-header-title">
                      <span class="category-icon">${cat.icon}</span>
                      <span class="category-name">${cat.category}</span>
                      <span class="badge-count">${cat.items.length} Habit</span>
                    </div>
                    <span class="accordion-chevron">▼</span>
                  </button>

                  <div class="preset-items-grid">
                    ${cat.items.map(item => `
                      <div class="preset-item-card">
                        <div class="preset-item-badge" style="background: ${item.color}22; border-color: ${item.color}55;">
                          <span class="preset-item-icon">${item.icon}</span>
                        </div>
                        <div class="preset-item-info">
                          <h4 class="preset-item-name">${item.name}</h4>
                          <p class="preset-item-desc">${item.description}</p>
                        </div>
                        <div class="preset-actions-row">
                          <button type="button" class="btn-quick-add" onclick="window.appModal.quickAddPreset('${item.name}')" title="Tambah 1 Klik">
                            + Tambah Cepat
                          </button>
                          <button type="button" class="btn-preset-edit" onclick="window.appModal.selectPresetForCustom('${item.name}')" title="Kustomisasi">
                            ✏️ Kustom
                          </button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderFormView(modal) {
    const isEdit = !!this.editingHabitId;
    const prefill = this.currentPrefill || {};
    this.selectedEmoji = prefill.icon || this.selectedEmoji || '🏃';
    this.selectedColor = prefill.color || this.selectedColor || '#6366F1';

    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899', '#14B8A6', '#64748B'];
    const popularEmojis = ['🏃', '🚶', '🧘', '💪', '🚴', '🏊', '💧', '💊', '🍎', '😴', '📚', '✍️', '💻', '🧠', '🎯', '🌿', '☕', '🥗', '🎨', '🎵', '🧹', '💰', '⏱️', '☀️'];

    const isSpecificDays = Array.isArray(prefill.frequency);
    const activeDays = isSpecificDays ? prefill.frequency : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="window.appModal.closeModal()"></div>
      <div class="modal-sheet animate-slide-up">
        <div class="sheet-handle-bar"></div>

        <div class="modal-habit-header">
          <div class="modal-habit-badge" id="form-icon-preview-badge" style="background: ${this.selectedColor}22; border-color: ${this.selectedColor};">
            <span class="modal-habit-icon" id="form-icon-preview">${this.selectedEmoji}</span>
          </div>
          <div class="modal-habit-title-col">
            <h2 class="modal-habit-name">${isEdit ? 'Edit Habit' : 'Buat Habit Baru'}</h2>
            <p class="modal-habit-desc">${isEdit ? 'Ubah preferensi, jadwal, dan target habit' : 'Gunakan template cepat di bawah atau tentukan sendiri'}</p>
          </div>
          <button class="modal-close-btn" onclick="window.appModal.closeModal()" aria-label="Tutup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Navigation Tabs (Only if not in Edit mode) -->
        ${!isEdit ? `
          <div style="padding: 12px 20px 0 20px;">
            <div class="modal-nav-tabs">
              <button type="button" class="modal-nav-tab active" onclick="window.appModal.switchModalTab('form')">
                ✏️ Buat Habit Kustom
              </button>
              <button type="button" class="modal-nav-tab" onclick="window.appModal.switchModalTab('catalog')">
                📋 Katalog Preset Siap Pakai
              </button>
            </div>
          </div>
        ` : ''}

        <form id="habit-editor-form" class="modal-body-scroll" onsubmit="event.preventDefault(); window.appModal.handleFormSubmit();">
          
          <!-- Quick Template Chips Section -->
          ${!isEdit ? `
            <div class="form-group mb-1">
              <div class="label-with-counter">
                <label class="form-label">⚡ Template Cepat (Klik untuk Isi Otomatis)</label>
                <button type="button" class="btn-text-sm" onclick="window.appModal.switchModalTab('catalog')">Lihat Semua →</button>
              </div>
              <div class="quick-template-chips">
                ${POPULAR_TEMPLATES.map(t => `
                  <button type="button" class="template-chip ${prefill.name === t.name ? 'active' : ''}" 
                          onclick="window.appModal.applyTemplate('${t.name}')">
                    ${t.label}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Name Input -->
          <div class="form-group">
            <label class="form-label">Nama Habit <span class="required">*</span></label>
            <input type="text" id="habit-name-input" class="form-control" required 
                   placeholder="Contoh: Jalan Pagi, Minum Air 2.5L, Baca Buku..." 
                   value="${prefill.name || ''}" autofocus>
          </div>

          <!-- Quick Emoji Picker -->
          <div class="form-group">
            <label class="form-label">Ikon / Emoji</label>
            <div class="emoji-picker-container">
              <div class="emoji-grid">
                ${popularEmojis.map(emo => `
                  <button type="button" class="emoji-chip ${emo === this.selectedEmoji ? 'selected' : ''}" 
                          onclick="window.appModal.setFormEmoji('${emo}')">
                    ${emo}
                  </button>
                `).join('')}
              </div>
              <div class="custom-emoji-row">
                <input type="text" id="custom-emoji-input" class="form-control form-control-sm" placeholder="Ketik emoji kustom..." maxlength="4" value="${this.selectedEmoji}">
                <button type="button" class="btn-subtle-sm" onclick="window.appModal.setCustomEmojiFromInput()">Pakai</button>
              </div>
            </div>
          </div>

          <!-- Description (Max 40 chars) -->
          <div class="form-group">
            <div class="label-with-counter">
              <label class="form-label">Deskripsi Singkat</label>
              <span class="char-counter" id="desc-char-counter">${(prefill.description || '').length}/40</span>
            </div>
            <input type="text" id="habit-desc-input" class="form-control" maxlength="40" 
                   placeholder="Maksimal 40 karakter... (Contoh: Jalan santai 30 menit)" 
                   value="${prefill.description || ''}">
          </div>

          <!-- Color Picker -->
          <div class="form-group">
            <label class="form-label">Warna Aksen</label>
            <div class="color-swatches-row">
              ${colors.map(c => `
                <button type="button" class="color-swatch ${c === this.selectedColor ? 'selected' : ''}" 
                        style="background: ${c};" 
                        onclick="window.appModal.setFormColor('${c}')">
                  ${c === this.selectedColor ? '✓' : ''}
                </button>
              `).join('')}
              <label class="color-picker-custom-label" title="Warna Kustom">
                <input type="color" id="habit-color-native" value="${this.selectedColor}" onchange="window.appModal.setFormColor(this.value)">
                <span>🎨</span>
              </label>
            </div>
          </div>

          <!-- Frequency: Daily vs Specific Days -->
          <div class="form-group">
            <label class="form-label">Frekuensi Pelacakan</label>
            <div class="frequency-toggle-group">
              <button type="button" class="freq-tab-btn ${!isSpecificDays ? 'active' : ''}" id="freq-daily-btn" onclick="window.appModal.setFrequencyMode('daily')">
                Setiap Hari (Daily)
              </button>
              <button type="button" class="freq-tab-btn ${isSpecificDays ? 'active' : ''}" id="freq-specific-btn" onclick="window.appModal.setFrequencyMode('specific')">
                Hari Tertentu
              </button>
            </div>

            <!-- Specific Days Checkboxes -->
            <div class="specific-days-wrapper" id="specific-days-container" style="display: ${isSpecificDays ? 'block' : 'none'};">
              <div class="specific-days-row">
                ${[
                  { key: 'mon', label: 'Sen' },
                  { key: 'tue', label: 'Sel' },
                  { key: 'wed', label: 'Rab' },
                  { key: 'thu', label: 'Kam' },
                  { key: 'fri', label: 'Jum' },
                  { key: 'sat', label: 'Sab' },
                  { key: 'sun', label: 'Min' }
                ].map(d => `
                  <button type="button" class="day-select-pill ${activeDays.includes(d.key) ? 'active' : ''}" 
                          data-day="${d.key}" onclick="this.classList.toggle('active')">
                    ${d.label}
                  </button>
                `).join('')}
              </div>
              <div class="day-preset-shortcuts">
                <button type="button" class="day-shortcut-btn" onclick="window.appModal.setDayShortcut('all')">Pilih Semua</button>
                <button type="button" class="day-shortcut-btn" onclick="window.appModal.setDayShortcut('weekdays')">Hari Kerja (Sen-Jum)</button>
                <button type="button" class="day-shortcut-btn" onclick="window.appModal.setDayShortcut('weekends')">Akhir Pekan (Sab-Min)</button>
              </div>
            </div>
          </div>

          <!-- Reminders -->
          <div class="form-group">
            <div class="reminder-switch-row">
              <div>
                <label class="form-label mb-0">Pengingat Waktu</label>
                <p class="form-helper">Notifikasi lokal untuk habit ini</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="habit-reminder-toggle" ${prefill.reminder ? 'checked' : ''} onchange="window.appModal.toggleReminderInput()">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div id="reminder-time-group" class="mt-2" style="display: ${prefill.reminder ? 'block' : 'none'};">
              <input type="time" id="habit-reminder-time" class="form-control" value="${prefill.reminder || '07:00'}">
            </div>
          </div>

          <!-- Start Date & End Date -->
          <div class="form-grid-2col">
            <div class="form-group">
              <label class="form-label">Tanggal Mulai</label>
              <input type="date" id="habit-start-date" class="form-control" value="${prefill.startDate || window.habitStore.getSelectedDate() || formatDateKey()}">
            </div>
            <div class="form-group">
              <label class="form-label">Tanggal Selesai</label>
              <div class="end-date-control-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="habit-no-end-toggle" ${!prefill.endDate ? 'checked' : ''} onchange="window.appModal.toggleEndDateInput()">
                  <span>Tanpa Batas Akhir</span>
                </label>
                <input type="date" id="habit-end-date" class="form-control mt-1" style="display: ${prefill.endDate ? 'block' : 'none'};" value="${prefill.endDate || ''}">
              </div>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="modal-footer-actions">
            <button type="button" class="btn-outline-action" onclick="window.appModal.closeModal()">Batal</button>
            <button type="submit" class="btn-primary-action">
              <span>💾 Simpan Habit</span>
            </button>
          </div>
        </form>
      </div>
    `;

    // Bind Live Description Counter
    const descInput = document.getElementById('habit-desc-input');
    const descCounter = document.getElementById('desc-char-counter');
    if (descInput && descCounter) {
      descInput.addEventListener('input', () => {
        descCounter.textContent = `${descInput.value.length}/40`;
        if (descInput.value.length >= 35) {
          descCounter.classList.add('text-danger');
        } else {
          descCounter.classList.remove('text-danger');
        }
      });
    }
  }

  toggleAccordion(category) {
    if (this.activeAccordion === category) {
      this.activeAccordion = null;
    } else {
      this.activeAccordion = category;
    }
    this.render();
  }

  applyTemplate(templateName) {
    const item = this.findPresetByName(templateName);
    if (!item) return;

    const nameInput = document.getElementById('habit-name-input');
    const descInput = document.getElementById('habit-desc-input');
    const descCounter = document.getElementById('desc-char-counter');
    const reminderToggle = document.getElementById('habit-reminder-toggle');
    const reminderTime = document.getElementById('habit-reminder-time');

    if (nameInput) nameInput.value = item.name;
    if (descInput) {
      descInput.value = item.description || '';
      if (descCounter) descCounter.textContent = `${(item.description || '').length}/40`;
    }
    this.setFormEmoji(item.icon);
    this.setFormColor(item.color);

    if (item.reminder && reminderToggle && reminderTime) {
      reminderToggle.checked = true;
      reminderTime.value = item.reminder;
      this.toggleReminderInput();
    }

    // Highlight active chip
    document.querySelectorAll('.template-chip').forEach(btn => {
      if (btn.textContent.includes(item.name)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (window.toast) {
      window.toast(`Template "${item.name}" diterapkan! ✨`);
    }
  }

  quickAddPreset(presetName) {
    const item = this.findPresetByName(presetName);
    if (!item) return;

    const selectedDateKey = window.habitStore.getSelectedDate();
    const todayKey = formatDateKey(new Date());
    const startDate = selectedDateKey < todayKey ? selectedDateKey : todayKey;

    const newHabit = window.habitStore.addHabit({
      name: item.name,
      icon: item.icon,
      description: item.description || '',
      color: item.color,
      frequency: 'daily',
      reminder: item.reminder || null,
      startDate: startDate,
      endDate: null
    });

    if (window.toast) {
      window.toast(`Habit "${newHabit.name}" berhasil ditambahkan! 🎯`);
    }
    this.closeModal();
    window.habitStore.setSelectedDate(startDate);
    window.appRouter.navigate('today');
  }

  selectPresetForCustom(presetName) {
    const item = this.findPresetByName(presetName);
    if (!item) return;

    this.currentPrefill = {
      name: item.name,
      icon: item.icon,
      description: item.description || '',
      color: item.color,
      frequency: 'daily',
      reminder: item.reminder || '',
      startDate: window.habitStore.getSelectedDate() || formatDateKey(),
      endDate: ''
    };
    this.currentTab = 'form';
    this.render();
  }

  setFormEmoji(emoji) {
    this.selectedEmoji = emoji;
    const preview = document.getElementById('form-icon-preview');
    if (preview) preview.textContent = emoji;

    const customInput = document.getElementById('custom-emoji-input');
    if (customInput) customInput.value = emoji;

    document.querySelectorAll('.emoji-chip').forEach(c => {
      if (c.textContent.trim() === emoji) c.classList.add('selected');
      else c.classList.remove('selected');
    });
  }

  setCustomEmojiFromInput() {
    const customInput = document.getElementById('custom-emoji-input');
    if (customInput && customInput.value.trim()) {
      this.setFormEmoji(customInput.value.trim());
    }
  }

  setFormColor(color) {
    this.selectedColor = color;
    const badge = document.getElementById('form-icon-preview-badge');
    if (badge) {
      badge.style.background = `${color}22`;
      badge.style.borderColor = color;
    }

    document.querySelectorAll('.color-swatch').forEach(swatch => {
      if (swatch.style.backgroundColor.includes(color) || swatch.getAttribute('style').includes(color)) {
        swatch.classList.add('selected');
        swatch.innerHTML = '✓';
      } else {
        swatch.classList.remove('selected');
        swatch.innerHTML = '';
      }
    });
  }

  setFrequencyMode(mode) {
    const dailyBtn = document.getElementById('freq-daily-btn');
    const specBtn = document.getElementById('freq-specific-btn');
    const specContainer = document.getElementById('specific-days-container');

    if (mode === 'daily') {
      dailyBtn.classList.add('active');
      specBtn.classList.remove('active');
      specContainer.style.display = 'none';
    } else {
      dailyBtn.classList.remove('active');
      specBtn.classList.add('active');
      specContainer.style.display = 'block';

      // Ensure at least all days are selected if none currently selected
      const activePills = specContainer.querySelectorAll('.day-select-pill.active');
      if (activePills.length === 0) {
        this.setDayShortcut('all');
      }
    }
  }

  setDayShortcut(type) {
    const pills = document.querySelectorAll('.day-select-pill');
    pills.forEach(pill => {
      const day = pill.getAttribute('data-day');
      if (type === 'all') {
        pill.classList.add('active');
      } else if (type === 'weekdays') {
        if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(day)) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      } else if (type === 'weekends') {
        if (['sat', 'sun'].includes(day)) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      }
    });
  }

  toggleReminderInput() {
    const toggle = document.getElementById('habit-reminder-toggle');
    const group = document.getElementById('reminder-time-group');
    if (toggle && group) {
      group.style.display = toggle.checked ? 'block' : 'none';
    }
  }

  toggleEndDateInput() {
    const noEndToggle = document.getElementById('habit-no-end-toggle');
    const endDateInput = document.getElementById('habit-end-date');
    if (noEndToggle && endDateInput) {
      endDateInput.style.display = noEndToggle.checked ? 'none' : 'block';
    }
  }

  handleFormSubmit() {
    const nameInput = document.getElementById('habit-name-input');
    const descInput = document.getElementById('habit-desc-input');
    const startDateInput = document.getElementById('habit-start-date');
    const noEndToggle = document.getElementById('habit-no-end-toggle');
    const endDateInput = document.getElementById('habit-end-date');
    const reminderToggle = document.getElementById('habit-reminder-toggle');
    const reminderTimeInput = document.getElementById('habit-reminder-time');
    const isSpecificFreq = document.getElementById('freq-specific-btn') && document.getElementById('freq-specific-btn').classList.contains('active');

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      alert('Nama habit harus diisi!');
      if (nameInput) nameInput.focus();
      return;
    }

    let frequency = 'daily';
    if (isSpecificFreq) {
      const selectedDays = [];
      document.querySelectorAll('.day-select-pill.active').forEach(p => {
        selectedDays.push(p.getAttribute('data-day'));
      });
      if (selectedDays.length === 0) {
        alert('Pilih minimal satu hari untuk frekuensi hari tertentu.');
        return;
      }
      frequency = selectedDays;
    }

    const selectedDateKey = window.habitStore.getSelectedDate();
    const targetStartDate = startDateInput && startDateInput.value ? startDateInput.value : selectedDateKey;

    const payload = {
      name,
      icon: this.selectedEmoji,
      description: descInput ? descInput.value.trim().slice(0, 40) : '',
      color: this.selectedColor,
      frequency,
      reminder: (reminderToggle && reminderToggle.checked) ? (reminderTimeInput.value || '07:00') : null,
      startDate: targetStartDate,
      endDate: (noEndToggle && noEndToggle.checked) ? null : (endDateInput && endDateInput.value ? endDateInput.value : null)
    };

    if (this.editingHabitId) {
      window.habitStore.updateHabit(this.editingHabitId, payload);
      window.toast('Habit berhasil diperbarui! ✨');
    } else {
      const newHabit = window.habitStore.addHabit(payload);
      window.toast(`Habit "${newHabit.name}" berhasil ditambahkan! 🎯`);
      // If the current view date is before start date, jump to start date so user sees the new habit
      if (selectedDateKey < targetStartDate) {
        window.habitStore.setSelectedDate(targetStartDate);
      }
      window.appRouter.navigate('today');
    }

    this.closeModal();
  }
}

// ==========================================
// Settings View Controller
// ==========================================
class SettingsViewController {
  render() {
    const container = document.getElementById('settings-view');
    if (!container) return;

    const settings = window.habitStore.getSettings();
    const isDark = settings.theme === 'dark';
    const archivedHabits = window.habitStore.getArchivedHabits();

    container.innerHTML = `
      <div class="settings-container">
        <div class="section-title-row">
          <div>
            <span class="card-eyebrow">PENGATURAN APLIKASI</span>
            <h2 class="section-title">Settings & Preferences</h2>
          </div>
        </div>

        <!-- 📲 PROMINENT PWA INSTALL CARD -->
        <div class="bento-card install-hero-bento glow-indigo">
          <div class="install-hero-content">
            <div class="install-hero-left">
              <span class="badge-subtle-mint" id="settings-install-status">⚡ Siap Diinstal</span>
              <h3 class="install-hero-title">📲 Pasang Aplikasi ke Layar Utama</h3>
              <p class="install-hero-desc">
                Jalankan Habit Tracker Daily langsung dari layar utama perangkat Anda layaknya aplikasi native tanpa membuka browser.
              </p>
            </div>
            <div class="install-hero-actions">
              <button class="btn-install-prominent" id="settings-install-btn" onclick="window.pwaManager.promptInstall()">
                <span class="btn-icon">📲</span>
                <span>Instal App Sekarang</span>
              </button>
              <button class="btn-subtle-pill" onclick="window.pwaManager.openInstallGuideModal()">
                Panduan Instalasi Manual
              </button>
            </div>
          </div>
        </div>

        <!-- Theme Setting Card -->
        <div class="bento-card settings-item-card">
          <div class="settings-item-row">
            <div class="settings-icon-pill bg-purple-subtle">
              <span>🌓</span>
            </div>
            <div class="settings-text-col">
              <h4 class="settings-item-title">Tema Tampilan (Dark / Light)</h4>
              <p class="settings-item-sub">Pilih antara tema Deep Slate yang elegan atau Soft Alabaster yang bersih</p>
            </div>
            <div class="theme-toggle-switch">
              <button class="theme-btn ${!isDark ? 'active' : ''}" onclick="window.settingsView.setTheme('light')">
                ☀️ Light
              </button>
              <button class="theme-btn ${isDark ? 'active' : ''}" onclick="window.settingsView.setTheme('dark')">
                🌙 Dark
              </button>
            </div>
          </div>
        </div>

        <!-- Archive Management Card -->
        <div class="bento-card settings-item-card">
          <div class="settings-item-row">
            <div class="settings-icon-pill bg-amber-subtle">
              <span>📁</span>
            </div>
            <div class="settings-text-col">
              <h4 class="settings-item-title">Habit Terarsip</h4>
              <p class="settings-item-sub">${archivedHabits.length} habit saat ini tersimpan di arsip</p>
            </div>
            <button class="btn-outline-action" onclick="window.settingsView.openArchiveModal()">
              Kelola Arsip
            </button>
          </div>
        </div>

        <!-- Reminders / Web Notifications -->
        <div class="bento-card settings-item-card">
          <div class="settings-item-row">
            <div class="settings-icon-pill bg-emerald-subtle">
              <span>🔔</span>
            </div>
            <div class="settings-text-col">
              <h4 class="settings-item-title">Notifikasi Pengingat</h4>
              <p class="settings-item-sub">Terima pengingat browser saat jadwal habit tiba</p>
            </div>
            <div class="notification-actions">
              <label class="toggle-switch">
                <input type="checkbox" id="settings-reminders-toggle" ${settings.remindersEnabled ? 'checked' : ''} onchange="window.settingsView.toggleReminders(this.checked)">
                <span class="toggle-slider"></span>
              </label>
              <button class="chip-btn-sm" onclick="window.settingsView.testNotification()">
                Uji Notifikasi
              </button>
            </div>
          </div>
        </div>

        <!-- Data Backup & Reset Bento Card -->
        <div class="bento-card settings-item-card">
          <div class="settings-item-row">
            <div class="settings-icon-pill bg-blue-subtle">
              <span>💾</span>
            </div>
            <div class="settings-text-col">
              <h4 class="settings-item-title">Cadangan & Pemulihan Data</h4>
              <p class="settings-item-sub">Ekspor data Anda ke file JSON atau pulihkan dari cadangan sebelumnya</p>
            </div>
          </div>

          <div class="backup-buttons-row">
            <button class="btn-outline-action" onclick="window.settingsView.exportData()">
              📤 Ekspor Data (JSON)
            </button>
            <label class="btn-outline-action mb-0 cursor-pointer">
              📥 Impor Data
              <input type="file" id="import-json-input" accept=".json" style="display: none;" onchange="window.settingsView.importData(event)">
            </label>
            <button class="btn-danger-action" onclick="window.settingsView.resetData()">
              🔄 Reset ke Data Default
            </button>
          </div>
        </div>

        <!-- About App Card -->
        <div class="bento-card about-card text-center">
          <span class="about-logo">HABIT TRACKER DAILY</span>
          <p class="about-version">Versi 1.0.0 • Progressive Web App (PWA)</p>
          <p class="about-credits">Dirancang dengan Vanilla JavaScript, HTML5, CSS3 Glassmorphism & Bento Architecture.</p>
        </div>
      </div>
    `;

    if (window.pwaManager) {
      window.pwaManager.updateInstallUI();
    }
  }

  setTheme(theme) {
    window.habitStore.updateSettings({ theme });
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    this.render();
    if (window.toast) {
      window.toast(theme === 'dark' ? 'Tema Gelap diaktifkan 🌙' : 'Tema Terang diaktifkan ☀️');
    }
  }

  toggleReminders(enabled) {
    window.habitStore.updateSettings({ remindersEnabled: enabled });
    if (enabled && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }

  testNotification() {
    if (!('Notification' in window)) {
      alert('Browser ini tidak mendukung Web Notifications.');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('Habit Tracker Daily 🎉', {
        body: 'Hebat! Sistem pengingat habit Anda aktif dan siap digunakan.',
        icon: 'assets/icons/icon-192.png'
      });
      if (window.toast) window.toast('Notifikasi uji coba terkirim! 🔔');
    } else {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Habit Tracker Daily 🎉', {
            body: 'Hebat! Izin notifikasi berhasil diaktifkan.',
            icon: 'assets/icons/icon-192.png'
          });
          if (window.toast) window.toast('Izin notifikasi aktif! 🔔');
        } else {
          alert('Izin notifikasi ditolak oleh browser.');
        }
      });
    }
  }

  exportData() {
    const jsonStr = window.habitStore.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-backup-${formatDateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.toast) window.toast('File cadangan JSON berhasil diunduh! 📁');
  }

  importData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const res = window.habitStore.importData(content);
      if (res.success) {
        if (window.toast) window.toast('Data berhasil dipulihkan dari cadangan! 🎉');
        this.render();
      } else {
        alert('Gagal mengimpor data: ' + res.error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  resetData() {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke bawaan awal? Semua perubahan akan ditimpa.')) {
      window.habitStore.resetData();
      if (window.toast) window.toast('Data berhasil direset ke bawaan awal!');
      this.render();
    }
  }

  openArchiveModal() {
    const modal = document.getElementById('habit-form-modal');
    if (!modal) return;

    const archived = window.habitStore.getArchivedHabits();

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="window.appModal.closeModal()"></div>
      <div class="modal-sheet animate-slide-up">
        <div class="sheet-handle-bar"></div>

        <div class="modal-habit-header">
          <div class="modal-habit-badge bg-amber-subtle">
            <span class="modal-habit-icon">📁</span>
          </div>
          <div class="modal-habit-title-col">
            <h2 class="modal-habit-name">Kelola Arsip Habit</h2>
            <p class="modal-habit-desc">Habit yang diarsipkan tidak muncul di daftar pelacakan harian.</p>
          </div>
          <button class="modal-close-btn" onclick="window.appModal.closeModal()" aria-label="Tutup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="modal-body-scroll">
          ${archived.length === 0 ? `
            <div class="empty-state-card">
              <p>Tidak ada habit yang sedang diarsipkan.</p>
            </div>
          ` : `
            <div class="archive-list">
              ${archived.map(h => `
                <div class="archive-item-card bento-card">
                  <div class="archive-item-left">
                    <span class="archive-item-icon">${h.icon}</span>
                    <div>
                      <h4 class="archive-item-name">${h.name}</h4>
                      <p class="archive-item-desc">${h.description || 'Tidak ada deskripsi'}</p>
                    </div>
                  </div>
                  <div class="archive-item-actions">
                    <button class="btn-subtle-sm" onclick="window.habitStore.toggleArchive('${h.id}'); window.settingsView.openArchiveModal(); window.toast('Habit dipulihkan!');">
                      📂 Pulihkan
                    </button>
                    <button class="btn-danger-sm" onclick="window.habitStore.deleteHabit('${h.id}'); window.settingsView.openArchiveModal(); window.toast('Habit dihapus!');">
                      🗑️
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <div class="modal-footer-actions">
          <button class="btn-primary-action w-full" onclick="window.appModal.closeModal()">Tutup</button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }
}

// Global Singletons
window.todayView = new TodayViewController();
window.appModal = new ModalManager();
window.settingsView = new SettingsViewController();
window.appRouter = new AppRouter();

// Initialize App Theme & Reactive Listener
document.addEventListener('DOMContentLoaded', () => {
  const currentSettings = window.habitStore.getSettings();
  const theme = currentSettings.theme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);

  // Subscribe to habit store updates to keep UI synchronized
  window.habitStore.subscribe((event) => {
    if (window.appRouter.currentRoute === 'today') {
      if (event && event.type === 'COMPLETION_TOGGLED') {
        window.todayView.updateHabitCheckState(event.habitId, event.date, event.completed);
      } else {
        window.todayView.render();
      }
    } else if (window.appRouter.currentRoute === 'stats') {
      window.statisticsManager.render();
    } else if (window.appRouter.currentRoute === 'calendar') {
      window.calendarManager.renderGlobalCalendar();
    } else if (window.appRouter.currentRoute === 'settings') {
      window.settingsView.render();
    }
  });

  // Initialize router
  window.appRouter.init();
});
