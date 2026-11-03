/**
 * HABIT TRACKER DAILY - Statistics Module
 * Weekly summary, 7-day dynamic bar chart, and per-habit performance breakdown.
 */

class StatisticsManager {
  constructor() {
    this.currentWeekStart = this.getStartOfWeek(new Date());
  }

  // Get Monday of the week for a given date
  getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    // In JS: 0 is Sunday. We want Monday as start of week (1). Sunday becomes 7th day.
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  navigateWeek(direction) {
    // direction: -1 (prev week), +1 (next week), 0 (current week)
    if (direction === 0) {
      this.currentWeekStart = this.getStartOfWeek(new Date());
    } else {
      const nextDate = new Date(this.currentWeekStart);
      nextDate.setDate(nextDate.getDate() + (direction * 7));
      this.currentWeekStart = nextDate;
    }
    this.render();
  }

  getWeekDays() {
    const days = [];
    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const fullDayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(this.currentWeekStart);
      d.setDate(d.getDate() + i);
      const dateKey = formatDateKey(d);
      days.push({
        date: d,
        dateKey,
        dayNumber: d.getDate(),
        monthNumber: d.getMonth() + 1,
        dayShort: dayNames[i],
        dayFull: fullDayNames[i],
        isToday: dateKey === formatDateKey(new Date())
      });
    }
    return days;
  }

  formatDateShort(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  getWeekRangeLabel() {
    const days = this.getWeekDays();
    const first = days[0].date;
    const last = days[6].date;
    return `${this.formatDateShort(first)} – ${this.formatDateShort(last)}`;
  }

  calculateWeekStats() {
    const habits = window.habitStore.getHabits(false);
    const days = this.getWeekDays();

    let totalPossible = 0;
    let totalCompleted = 0;

    const dailyStats = days.map(day => {
      const scheduledHabits = habits.filter(h => window.habitStore.isHabitScheduledForDate(h, day.dateKey));
      const scheduledCount = scheduledHabits.length;
      const completedCount = scheduledHabits.filter(h => window.habitStore.isHabitCompleted(h.id, day.dateKey)).length;

      totalPossible += scheduledCount;
      totalCompleted += completedCount;

      return {
        ...day,
        scheduledCount,
        completedCount,
        percentage: scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0
      };
    });

    const weeklyPercentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    // Per-habit breakdown for this week
    const habitBreakdown = habits.map(habit => {
      let habitPossible = 0;
      let habitCompleted = 0;

      days.forEach(day => {
        if (window.habitStore.isHabitScheduledForDate(habit, day.dateKey)) {
          habitPossible++;
          if (window.habitStore.isHabitCompleted(habit.id, day.dateKey)) {
            habitCompleted++;
          }
        }
      });

      const percentage = habitPossible > 0 ? Math.round((habitCompleted / habitPossible) * 100) : 0;
      const streakInfo = window.habitStore.calculateHabitStreak(habit.id);

      return {
        habit,
        scheduledTimes: habitPossible,
        completedTimes: habitCompleted,
        percentage,
        streak: streakInfo.currentStreak
      };
    });

    return {
      totalPossible,
      totalCompleted,
      weeklyPercentage,
      dailyStats,
      habitBreakdown
    };
  }

  render() {
    const container = document.getElementById('stats-view') || document.getElementById('statistics-view');
    if (!container) return;

    const stats = this.calculateWeekStats();
    const rangeLabel = this.getWeekRangeLabel();
    const isCurrentWeek = this.getStartOfWeek(new Date()).getTime() === this.currentWeekStart.getTime();

    // Motivational status based on weekly percentage
    let statusBadge = "Mulai bangun konsistensi mingguan! 🌱";
    if (stats.weeklyPercentage >= 100) {
      statusBadge = "Sempurna! 100% Tercapai Minggu Ini 🎉";
    } else if (stats.weeklyPercentage >= 75) {
      statusBadge = "Luar biasa! Pertahankan ritmemu 🔥";
    } else if (stats.weeklyPercentage >= 50) {
      statusBadge = "Bagus sekali! Lebih dari setengah selesai 💪";
    } else if (stats.weeklyPercentage > 0) {
      statusBadge = "Awal yang baik, ayo dorong lebih tinggi! 🚀";
    }

    container.innerHTML = `
      <div class="stats-page">
        <!-- Top Week Range Bar -->
        <div class="bento-card week-selector-card">
          <div class="week-selector-inner">
            <button class="icon-btn-subtle" id="stats-prev-week" title="Minggu Sebelumnya" aria-label="Minggu Sebelumnya">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div class="week-label-group">
              <span class="week-range-text">${rangeLabel}</span>
              ${!isCurrentWeek ? `<button class="chip-btn-sm" id="stats-jump-today">Minggu Ini</button>` : `<span class="badge-subtle-mint">Minggu Ini</span>`}
            </div>
            <button class="icon-btn-subtle" id="stats-next-week" title="Minggu Berikutnya" aria-label="Minggu Berikutnya">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <!-- Weekly Summary Bento Card -->
        <div class="bento-grid-2col">
          <div class="bento-card summary-card glow-card">
            <div class="summary-left">
              <span class="card-eyebrow">RINGKASAN MINGGUAN</span>
              <h3 class="summary-title">Total Keberhasilan</h3>
              <p class="summary-status">${statusBadge}</p>
              <div class="summary-meta-pills">
                <span class="pill-stat">
                  <span class="pill-dot"></span>
                  <strong>${stats.totalCompleted}</strong> / ${stats.totalPossible} Selesai
                </span>
              </div>
            </div>
            <div class="summary-right">
              <div class="circular-progress-wrapper" style="--prog-deg: ${stats.weeklyPercentage * 3.6}deg;">
                <div class="circular-progress-inner">
                  <span class="prog-num">${stats.weeklyPercentage}%</span>
                  <span class="prog-sub">Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 7-Day Weekly Bar Chart Card -->
        <div class="bento-card chart-card">
          <div class="chart-header">
            <div>
              <span class="card-eyebrow">GRAFIK 7 HARI</span>
              <h3 class="chart-title">Aktivitas Mingguan</h3>
            </div>
            <span class="badge-subtle-indigo">Rasio Harian</span>
          </div>

          <!-- SVG Bar Chart -->
          <div class="chart-bars-container">
            ${this.renderBarChartSvg(stats.dailyStats)}
          </div>
        </div>

        <!-- Breakdown per Habit -->
        <div class="bento-card breakdown-card">
          <div class="card-header-simple">
            <div>
              <span class="card-eyebrow">DETAIL PERFORMA</span>
              <h3 class="card-title">Breakdown Habit Mingguan</h3>
            </div>
            <span class="badge-count">${stats.habitBreakdown.length} Habit</span>
          </div>

          <div class="breakdown-list">
            ${stats.habitBreakdown.length === 0 ? `
              <div class="empty-state-sm">
                <p>Belum ada habit aktif minggu ini.</p>
              </div>
            ` : stats.habitBreakdown.map(item => `
              <div class="breakdown-item" data-habit-id="${item.habit.id}">
                <div class="breakdown-icon-wrap" style="background: ${item.habit.color}22; border-color: ${item.habit.color}44;">
                  <span class="breakdown-icon">${item.habit.icon}</span>
                </div>
                <div class="breakdown-info">
                  <div class="breakdown-title-row">
                    <span class="breakdown-name">${item.habit.name}</span>
                    <span class="breakdown-streak" title="Active Streak">
                      ${item.streak > 0 ? `${item.streak} 🔥` : `0 🔥`}
                    </span>
                  </div>
                  <div class="breakdown-progress-track">
                    <div class="breakdown-progress-fill" style="width: ${item.percentage}%; background: ${item.habit.color};"></div>
                  </div>
                  <div class="breakdown-sub-row">
                    <span class="breakdown-ratio">${item.completedTimes}/${item.scheduledTimes} kali selesai</span>
                    <span class="breakdown-percent" style="color: ${item.habit.color}; font-weight: 700;">${item.percentage}%</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Bind Week Navigation Buttons
    const prevBtn = document.getElementById('stats-prev-week');
    const nextBtn = document.getElementById('stats-next-week');
    const jumpTodayBtn = document.getElementById('stats-jump-today');

    if (prevBtn) prevBtn.addEventListener('click', () => this.navigateWeek(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => this.navigateWeek(1));
    if (jumpTodayBtn) jumpTodayBtn.addEventListener('click', () => this.navigateWeek(0));

    // Bind Breakdown item click to habit detail modal
    container.querySelectorAll('.breakdown-item').forEach(el => {
      el.addEventListener('click', () => {
        const habitId = el.getAttribute('data-habit-id');
        if (window.calendarManager && habitId) {
          window.calendarManager.openHabitDetailModal(habitId);
        }
      });
    });
  }

  renderBarChartSvg(dailyStats) {
    // Find maximum scheduled count to normalize height
    const maxVal = Math.max(1, ...dailyStats.map(d => d.scheduledCount));

    return `
      <div class="bar-chart-grid">
        ${dailyStats.map(day => {
          const heightPercent = day.scheduledCount > 0 
            ? Math.max(8, Math.round((day.completedCount / maxVal) * 100)) 
            : 6;
          const isDoneAll = day.scheduledCount > 0 && day.completedCount === day.scheduledCount;
          const isZero = day.completedCount === 0;

          let barColorClass = 'bar-fill-indigo';
          if (isDoneAll) barColorClass = 'bar-fill-emerald';
          else if (isZero) barColorClass = 'bar-fill-muted';

          return `
            <div class="bar-col ${day.isToday ? 'is-today-col' : ''}" 
                 onclick="window.habitStore.setSelectedDate('${day.dateKey}'); window.appRouter.navigate('today');"
                 title="${day.dayFull}, ${day.dayNumber}: ${day.completedCount}/${day.scheduledCount} selesai">
              <div class="bar-top-val">${day.completedCount}</div>
              <div class="bar-track">
                <div class="bar-fill ${barColorClass}" style="height: ${heightPercent}%;"></div>
              </div>
              <div class="bar-label-group">
                <span class="bar-day-name">${day.dayShort}</span>
                <span class="bar-day-num ${day.isToday ? 'today-pill-dot' : ''}">${day.dayNumber}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}

window.statisticsManager = new StatisticsManager();
