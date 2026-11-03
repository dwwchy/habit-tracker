/**
 * HABIT TRACKER DAILY - Calendar & Streaks Insights Module
 * Handles Global Monthly Calendar, Monthly Metrics, and Individual Habit Detail Modal
 */

class CalendarManager {
  constructor() {
    this.currentViewDate = new Date();
    this.habitModalDate = new Date();
    this.activeHabitId = null;
  }

  navigateMonth(direction) {
    this.currentViewDate.setMonth(this.currentViewDate.getMonth() + direction);
    this.renderGlobalCalendar();
  }

  jumpToCurrentMonth() {
    this.currentViewDate = new Date();
    this.renderGlobalCalendar();
  }

  navigateHabitMonth(direction) {
    this.habitModalDate.setMonth(this.habitModalDate.getMonth() + direction);
    if (this.activeHabitId) {
      this.renderHabitDetailModal(this.activeHabitId);
    }
  }

  getMonthName(monthIndex, year) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${months[monthIndex]} ${year}`;
  }

  // Calculate full month metrics for Global Calendar
  calculateMonthlyMetrics(year, month) {
    const habits = window.habitStore.getHabits(false);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = formatDateKey(new Date());

    let allDoneDays = 0;
    let zeroDoneDays = 0;
    let totalScheduledHabits = 0;
    let totalCompletedHabits = 0;

    let allDoneStreak = 0;
    let currentAllDoneStreak = 0;
    let bestAllDoneStreak = 0;

    const dayResults = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${mStr}-${dStr}`;

      const scheduledHabits = habits.filter(h => window.habitStore.isHabitScheduledForDate(h, dateKey));
      const scheduledCount = scheduledHabits.length;
      const completedCount = scheduledHabits.filter(h => window.habitStore.isHabitCompleted(h.id, dateKey)).length;

      totalScheduledHabits += scheduledCount;
      totalCompletedHabits += completedCount;

      const isAllDone = scheduledCount > 0 && completedCount === scheduledCount;
      const isZeroDone = scheduledCount > 0 && completedCount === 0;

      if (isAllDone) {
        allDoneDays++;
        currentAllDoneStreak++;
        if (currentAllDoneStreak > bestAllDoneStreak) {
          bestAllDoneStreak = currentAllDoneStreak;
        }
      } else {
        currentAllDoneStreak = 0;
      }

      if (isZeroDone) {
        zeroDoneDays++;
      }

      dayResults.push({
        day,
        dateKey,
        scheduledCount,
        completedCount,
        isAllDone,
        isZeroDone,
        percentage: scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0,
        isToday: dateKey === todayKey,
        isFuture: dateKey > todayKey
      });
    }

    allDoneStreak = bestAllDoneStreak;
    const totalPercentage = totalScheduledHabits > 0 
      ? Math.round((totalCompletedHabits / totalScheduledHabits) * 100) 
      : 0;

    return {
      daysInMonth,
      dayResults,
      totalScheduledHabits,
      totalCompletedHabits,
      totalPercentage,
      allDoneDays,
      zeroDoneDays,
      allDoneStreak,
      bestAllDoneStreak
    };
  }

  renderGlobalCalendar() {
    const container = document.getElementById('calendar-view');
    if (!container) return;

    const year = this.currentViewDate.getFullYear();
    const month = this.currentViewDate.getMonth();
    const monthLabel = this.getMonthName(month, year);
    const metrics = this.calculateMonthlyMetrics(year, month);

    // Calculate grid padding for first day of month (Monday = 0, Sunday = 6)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // In Indonesia / ISO: Mon = 0, Sun = 6
    const leadEmptyDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    container.innerHTML = `
      <div class="calendar-page">
        <!-- Month Navigation Bar -->
        <div class="bento-card calendar-header-card">
          <div class="week-selector-inner">
            <button class="icon-btn-subtle" id="cal-prev-month" title="Bulan Sebelumnya">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div class="week-label-group">
              <span class="week-range-text">${monthLabel}</span>
              <button class="chip-btn-sm" id="cal-jump-today">Bulan Ini</button>
            </div>
            <button class="icon-btn-subtle" id="cal-next-month" title="Bulan Berikutnya">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <!-- Monthly Summary Bento Metrics -->
        <div class="bento-card monthly-summary-bento">
          <div class="monthly-summary-top">
            <div class="monthly-total-circ" style="--prog-deg: ${metrics.totalPercentage * 3.6}deg;">
              <div class="monthly-circ-inner">
                <span class="circ-pct">${metrics.totalPercentage}%</span>
                <span class="circ-lbl">Total Done</span>
              </div>
            </div>
            <div class="monthly-title-col">
              <span class="card-eyebrow">REKAP PERFORMA BULANAN</span>
              <h3 class="monthly-title">${monthLabel}</h3>
              <p class="monthly-subtitle">
                <strong>${metrics.totalCompletedHabits}</strong> dari ${metrics.totalScheduledHabits} habit berhasil dituntaskan.
              </p>
            </div>
          </div>

          <!-- 4 Main Key Metrics Cards -->
          <div class="metrics-quad-grid">
            <div class="metric-quad-card quad-purple">
              <span class="quad-icon">🟣</span>
              <div class="quad-data">
                <span class="quad-val">${metrics.allDoneStreak} kali</span>
                <span class="quad-label">All Done Streak</span>
              </div>
            </div>
            <div class="metric-quad-card quad-gold">
              <span class="quad-icon">🏆</span>
              <div class="quad-data">
                <span class="quad-val">${metrics.bestAllDoneStreak} kali</span>
                <span class="quad-label">Best Streak</span>
              </div>
            </div>
            <div class="metric-quad-card quad-emerald">
              <span class="quad-icon">✅</span>
              <div class="quad-data">
                <span class="quad-val">${metrics.allDoneDays} hari</span>
                <span class="quad-label">All Done</span>
              </div>
            </div>
            <div class="metric-quad-card quad-rose">
              <span class="quad-icon">❌</span>
              <div class="quad-data">
                <span class="quad-val">${metrics.zeroDoneDays} hari</span>
                <span class="quad-label">Zero Done</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Global Month Grid Card -->
        <div class="bento-card calendar-grid-card">
          <div class="calendar-grid-header">
            <div>
              <span class="card-eyebrow">GRID BULAN</span>
              <h3 class="card-title">Kalender Progres</h3>
            </div>
            <div class="legend-group">
              <span class="legend-item"><span class="legend-dot dot-emerald"></span> 100%</span>
              <span class="legend-item"><span class="legend-dot dot-indigo"></span> Sebagian</span>
              <span class="legend-item"><span class="legend-dot dot-gray"></span> 0%</span>
            </div>
          </div>

          <!-- Weekday Names -->
          <div class="month-weekday-row">
            <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
          </div>

          <!-- Days Grid -->
          <div class="month-days-grid">
            ${Array.from({ length: leadEmptyDays }).map(() => `<div class="day-cell day-empty"></div>`).join('')}
            ${metrics.dayResults.map(d => {
              let statusClass = 'day-zero';
              if (d.isAllDone) statusClass = 'day-all-done';
              else if (d.completedCount > 0) statusClass = 'day-partial';

              return `
                <button class="day-cell ${statusClass} ${d.isToday ? 'day-is-today' : ''} ${d.isFuture ? 'day-is-future' : ''}"
                        data-date="${d.dateKey}"
                        title="${d.dateKey}: ${d.completedCount}/${d.scheduledCount} selesai (${d.percentage}%)">
                  <span class="day-cell-num">${d.day}</span>
                  <div class="day-cell-indicator">
                    <span class="mini-progress-pill" style="--p: ${d.percentage}%;"></span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Day Inspection Drawer -->
        <div id="day-inspection-box" class="bento-card day-inspection-card" style="display: none;">
          <!-- Dynamically populated when a day cell is clicked -->
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById('cal-prev-month').addEventListener('click', () => this.navigateMonth(-1));
    document.getElementById('cal-next-month').addEventListener('click', () => this.navigateMonth(1));
    document.getElementById('cal-jump-today').addEventListener('click', () => this.jumpToCurrentMonth());

    // Day cell click inspection
    container.querySelectorAll('.day-cell[data-date]').forEach(cell => {
      cell.addEventListener('click', () => {
        const dateKey = cell.getAttribute('data-date');
        this.inspectDate(dateKey);
      });
    });
  }

  inspectDate(dateKey) {
    const box = document.getElementById('day-inspection-box');
    if (!box) return;

    const scheduled = window.habitStore.getHabitsForDate(dateKey);
    const [y, m, d] = dateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const formattedTitle = `${dayNames[dateObj.getDay()]}, ${d} ${months[m - 1]} ${y}`;
    const completedCount = scheduled.filter(h => window.habitStore.isHabitCompleted(h.id, dateKey)).length;

    box.style.display = 'block';
    box.innerHTML = `
      <div class="inspection-header">
        <div>
          <span class="card-eyebrow">DETAIL TANGGAL</span>
          <h4 class="inspection-title">${formattedTitle}</h4>
        </div>
        <div class="inspection-actions">
          <span class="badge-count">${completedCount}/${scheduled.length} Selesai</span>
          <button class="btn-text-sm" onclick="window.habitStore.setSelectedDate('${dateKey}'); window.appRouter.navigate('today');">
            Buka di Today →
          </button>
        </div>
      </div>

      <div class="inspection-habit-list">
        ${scheduled.length === 0 ? `
          <p class="text-muted-sm">Tidak ada habit yang terjadwal pada hari ini.</p>
        ` : scheduled.map(h => {
          const isDone = window.habitStore.isHabitCompleted(h.id, dateKey);
          return `
            <div class="inspection-habit-item ${isDone ? 'is-done' : ''}" 
                 onclick="window.habitStore.toggleHabitCompletion('${h.id}', '${dateKey}'); window.calendarManager.inspectDate('${dateKey}'); window.calendarManager.renderGlobalCalendar();">
              <span class="inspection-check ${isDone ? 'checked' : ''}" style="${isDone ? `background: ${h.color}; border-color: ${h.color};` : ''}">
                ${isDone ? '✓' : ''}
              </span>
              <span class="inspection-icon">${h.icon}</span>
              <span class="inspection-name">${h.name}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ==========================================
  // Individual Habit Detail Modal Logic
  // ==========================================

  openHabitDetailModal(habitId) {
    this.activeHabitId = habitId;
    this.habitModalDate = new Date();
    this.renderHabitDetailModal(habitId);

    const modal = document.getElementById('habit-detail-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  closeHabitDetailModal() {
    const modal = document.getElementById('habit-detail-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.activeHabitId = null;
  }

  renderHabitDetailModal(habitId) {
    const modal = document.getElementById('habit-detail-modal');
    if (!modal) return;

    const habit = window.habitStore.getHabitById(habitId);
    if (!habit) {
      this.closeHabitDetailModal();
      return;
    }

    const year = this.habitModalDate.getFullYear();
    const month = this.habitModalDate.getMonth();
    const monthLabel = this.getMonthName(month, year);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = formatDateKey(new Date());

    const streakInfo = window.habitStore.calculateHabitStreak(habit.id);

    // Days in current inspected month for this habit
    let doneInMonth = 0;
    let scheduledInMonth = 0;
    const completedSet = new Set(habit.completedDates || []);

    const dayCells = [];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const leadEmptyDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    for (let day = 1; day <= daysInMonth; day++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${mStr}-${dStr}`;

      const isScheduled = window.habitStore.isHabitScheduledForDate(habit, dateKey);
      const isCompleted = completedSet.has(dateKey);
      const isPast = dateKey < todayKey;
      const isToday = dateKey === todayKey;
      const isFuture = dateKey > todayKey;

      if (isScheduled) {
        scheduledInMonth++;
        if (isCompleted) doneInMonth++;
      }

      let stateClass = 'habit-day-empty';
      if (isCompleted) {
        stateClass = 'habit-day-completed';
      } else if (isScheduled && isPast) {
        stateClass = 'habit-day-missed';
      } else if (isFuture) {
        stateClass = 'habit-day-future';
      }

      dayCells.push({
        day,
        dateKey,
        isCompleted,
        stateClass,
        isToday
      });
    }

    const goalMetPercent = scheduledInMonth > 0 ? Math.round((doneInMonth / scheduledInMonth) * 100) : 0;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="window.calendarManager.closeHabitDetailModal()"></div>
      <div class="modal-sheet animate-slide-up">
        <!-- Sheet Handle -->
        <div class="sheet-handle-bar"></div>

        <!-- Header -->
        <div class="modal-habit-header" style="--habit-color: ${habit.color};">
          <div class="modal-habit-badge" style="background: ${habit.color}22; border-color: ${habit.color};">
            <span class="modal-habit-icon">${habit.icon}</span>
          </div>
          <div class="modal-habit-title-col">
            <div class="habit-title-row">
              <h2 class="modal-habit-name">${habit.name}</h2>
              ${habit.archived ? `<span class="badge-subtle-rose">Diarsipkan</span>` : ''}
            </div>
            <p class="modal-habit-desc">${habit.description || 'Tidak ada deskripsi'}</p>
            <div class="modal-habit-pills">
              <span class="pill-meta">${habit.frequency === 'daily' ? 'Setiap Hari' : 'Hari Tertentu'}</span>
              ${habit.reminder ? `<span class="pill-meta">⏰ ${habit.reminder}</span>` : ''}
            </div>
          </div>
          <button class="modal-close-btn" onclick="window.calendarManager.closeHabitDetailModal()" aria-label="Tutup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="modal-body-scroll">
          <!-- Streaks & Insights Grid -->
          <div class="bento-quad-streaks">
            <div class="streak-box">
              <span class="streak-emoji">🔥</span>
              <span class="streak-val">${streakInfo.currentStreak} hari</span>
              <span class="streak-lbl">Current Streak</span>
            </div>
            <div class="streak-box">
              <span class="streak-emoji">🏆</span>
              <span class="streak-val">${streakInfo.bestStreak} hari</span>
              <span class="streak-lbl">Best Streak</span>
            </div>
            <div class="streak-box">
              <span class="streak-emoji">📅</span>
              <span class="streak-val">${doneInMonth} hari</span>
              <span class="streak-lbl">Done in Month</span>
            </div>
            <div class="streak-box">
              <span class="streak-emoji">🎯</span>
              <span class="streak-val">${streakInfo.totalDone} hari</span>
              <span class="streak-lbl">Total Done</span>
            </div>
          </div>

          <!-- Goal Met Radial & Calendar Section -->
          <div class="habit-cal-section">
            <div class="habit-cal-nav-row">
              <button class="icon-btn-subtle" onclick="window.calendarManager.navigateHabitMonth(-1)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div class="habit-cal-title-group">
                <span class="habit-month-title">${monthLabel}</span>
                <span class="habit-goal-pill" style="color: ${habit.color};">Goal Met: ${goalMetPercent}%</span>
              </div>
              <button class="icon-btn-subtle" onclick="window.calendarManager.navigateHabitMonth(1)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <!-- Mini Legend -->
            <div class="habit-cal-legend">
              <span class="h-leg-item"><span class="h-leg-dot leg-green" style="background: ${habit.color};"></span> Selesai</span>
              <span class="h-leg-item"><span class="h-leg-dot leg-red"></span> Terlewat</span>
              <span class="h-leg-item"><span class="h-leg-dot leg-future"></span> Mendatang</span>
            </div>

            <!-- Calendar Days Header -->
            <div class="habit-cal-weekdays">
              <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
            </div>

            <!-- Calendar Days Grid -->
            <div class="habit-cal-days-grid">
              ${Array.from({ length: leadEmptyDays }).map(() => `<div class="h-day-cell h-empty"></div>`).join('')}
              ${dayCells.map(c => `
                <button class="h-day-cell ${c.stateClass} ${c.isToday ? 'h-is-today' : ''}" 
                        style="${c.isCompleted ? `--cell-accent: ${habit.color};` : ''}"
                        onclick="window.habitStore.toggleHabitCompletion('${habit.id}', '${c.dateKey}'); window.calendarManager.renderHabitDetailModal('${habit.id}');"
                        title="${c.dateKey}: Klik untuk toggle status">
                  <span class="h-day-num">${c.day}</span>
                  ${c.isCompleted ? '<span class="h-check-mark">✓</span>' : ''}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <div class="modal-footer-actions">
          <button class="btn-outline-action" onclick="window.calendarManager.handleToggleArchive('${habit.id}')">
            ${habit.archived ? '📂 Pulihkan' : '📁 Arsipkan'}
          </button>
          <button class="btn-primary-action" onclick="window.calendarManager.closeHabitDetailModal(); window.appModal.openEditHabitModal('${habit.id}')">
            ✏️ Edit Habit
          </button>
          <button class="btn-danger-action" onclick="window.calendarManager.handleDelete('${habit.id}')">
            🗑️ Hapus
          </button>
        </div>
      </div>
    `;
  }

  handleToggleArchive(habitId) {
    const isArchived = window.habitStore.toggleArchive(habitId);
    this.renderHabitDetailModal(habitId);
    if (window.toast) {
      window.toast(isArchived ? 'Habit dipindahkan ke Arsip 📁' : 'Habit dipulihkan dari Arsip 📂');
    }
  }

  handleDelete(habitId) {
    if (confirm('Apakah Anda yakin ingin menghapus habit ini? Riwayat habit ini akan dihapus secara permanen.')) {
      window.habitStore.deleteHabit(habitId);
      this.closeHabitDetailModal();
      if (window.toast) {
        window.toast('Habit berhasil dihapus 🗑️');
      }
    }
  }
}

window.calendarManager = new CalendarManager();
