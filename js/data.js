/**
 * HABIT TRACKER DAILY - Data Store & Reactive State Management
 */

const STORAGE_KEY = 'habit_tracker_daily_data';

// Helper to format Date object into local "YYYY-MM-DD"
function formatDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Generate relative date key helper: offset in days from today
function getRelativeDateKey(dayOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return formatDateKey(d);
}

// Default Initial Habit Data - Clean Slate (User fills in their own habits)
function createDefaultData() {
  return {
    settings: {
      theme: "dark", // "dark" | "light"
      remindersEnabled: true
    },
    habits: []
  };
}

class HabitStore {
  constructor() {
    this.subscribers = new Set();
    this.selectedDate = formatDateKey();
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.data = JSON.parse(raw);
        // Clean migration: If data contains initial demo seeds from earlier version, clear to clean slate
        const isOldDemoData = Array.isArray(this.data.habits) && 
          this.data.habits.some(h => h.id === 'h-1' || h.id === 'h-2' || h.id === 'h-3') &&
          !localStorage.getItem('habit_tracker_initialized_clean_v2');

        if (isOldDemoData) {
          this.data = createDefaultData();
          localStorage.setItem('habit_tracker_initialized_clean_v2', 'true');
          this.save();
        }

        // Ensure settings exist
        if (!this.data.settings) {
          this.data.settings = { theme: 'dark', remindersEnabled: true };
        }
        if (!Array.isArray(this.data.habits)) {
          this.data.habits = [];
        }
      } else {
        this.data = createDefaultData();
        localStorage.setItem('habit_tracker_initialized_clean_v2', 'true');
        this.save();
      }
    } catch (e) {
      console.error('Error loading habit data:', e);
      this.data = createDefaultData();
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notify();
    } catch (e) {
      console.error('Error saving habit data:', e);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(event = { type: 'CHANGE' }) {
    for (const callback of this.subscribers) {
      try {
        callback(event, this.data);
      } catch (e) {
        console.error('Error in subscriber callback:', e);
      }
    }
  }

  getSelectedDate() {
    return this.selectedDate;
  }

  setSelectedDate(dateKey) {
    if (this.selectedDate !== dateKey) {
      this.selectedDate = dateKey;
      this.notify({ type: 'DATE_CHANGED', date: dateKey });
    }
  }

  getSettings() {
    return this.data.settings || { theme: 'dark', remindersEnabled: true };
  }

  updateSettings(partial) {
    this.data.settings = { ...this.data.settings, ...partial };
    this.save();
  }

  getHabits(includeArchived = false) {
    return this.data.habits.filter(h => includeArchived ? true : !h.archived);
  }

  getArchivedHabits() {
    return this.data.habits.filter(h => h.archived);
  }

  getHabitById(id) {
    return this.data.habits.find(h => h.id === id);
  }

  isHabitScheduledForDate(habit, dateKey) {
    if (habit.archived) return false;
    if (habit.startDate && dateKey < habit.startDate) return false;
    if (habit.endDate && dateKey > habit.endDate) return false;

    if (!habit.frequency || habit.frequency === 'daily') {
      return true;
    }

    if (Array.isArray(habit.frequency)) {
      // Days array: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const [y, m, d] = dateKey.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayName = dayNames[dateObj.getDay()];
      return habit.frequency.includes(dayName);
    }

    return true;
  }

  getHabitsForDate(dateKey) {
    return this.getHabits(false).filter(h => this.isHabitScheduledForDate(h, dateKey));
  }

  isHabitCompleted(habitId, dateKey) {
    const habit = this.getHabitById(habitId);
    if (!habit || !Array.isArray(habit.completedDates)) return false;
    return habit.completedDates.includes(dateKey);
  }

  toggleHabitCompletion(habitId, dateKey = this.selectedDate) {
    const habit = this.getHabitById(habitId);
    if (!habit) return false;

    if (!Array.isArray(habit.completedDates)) {
      habit.completedDates = [];
    }

    const index = habit.completedDates.indexOf(dateKey);
    let completed = false;

    if (index > -1) {
      habit.completedDates.splice(index, 1);
      completed = false;
    } else {
      habit.completedDates.push(dateKey);
      habit.completedDates.sort();
      completed = true;
    }

    this.save();
    this.notify({ type: 'COMPLETION_TOGGLED', habitId, date: dateKey, completed });
    return completed;
  }

  addHabit(habitData) {
    const id = 'h-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newHabit = {
      id,
      name: (habitData.name || 'Habit Baru').trim(),
      icon: habitData.icon || '🎯',
      description: (habitData.description || '').trim().slice(0, 40),
      color: habitData.color || '#6366F1',
      frequency: habitData.frequency || 'daily',
      reminder: habitData.reminder || null,
      startDate: habitData.startDate || formatDateKey(),
      endDate: habitData.endDate || null,
      archived: false,
      completedDates: []
    };

    this.data.habits.push(newHabit);
    this.save();
    this.notify({ type: 'HABIT_ADDED', habit: newHabit });
    return newHabit;
  }

  updateHabit(id, fields) {
    const habit = this.getHabitById(id);
    if (!habit) return null;

    if (fields.name !== undefined) habit.name = fields.name.trim();
    if (fields.icon !== undefined) habit.icon = fields.icon;
    if (fields.description !== undefined) habit.description = fields.description.trim().slice(0, 40);
    if (fields.color !== undefined) habit.color = fields.color;
    if (fields.frequency !== undefined) habit.frequency = fields.frequency;
    if (fields.reminder !== undefined) habit.reminder = fields.reminder;
    if (fields.startDate !== undefined) habit.startDate = fields.startDate;
    if (fields.endDate !== undefined) habit.endDate = fields.endDate;
    if (fields.archived !== undefined) habit.archived = fields.archived;

    this.save();
    this.notify({ type: 'HABIT_UPDATED', habit });
    return habit;
  }

  deleteHabit(id) {
    const index = this.data.habits.findIndex(h => h.id === id);
    if (index > -1) {
      const removed = this.data.habits.splice(index, 1)[0];
      this.save();
      this.notify({ type: 'HABIT_DELETED', habit: removed });
      return true;
    }
    return false;
  }

  toggleArchive(id) {
    const habit = this.getHabitById(id);
    if (!habit) return false;
    habit.archived = !habit.archived;
    this.save();
    this.notify({ type: 'HABIT_ARCHIVED_TOGGLED', habit });
    return habit.archived;
  }

  getDailyProgress(dateKey) {
    const scheduled = this.getHabitsForDate(dateKey);
    const total = scheduled.length;
    if (total === 0) {
      return { total: 0, completed: 0, percentage: 0, isAllDone: false };
    }

    const completed = scheduled.filter(h => this.isHabitCompleted(h.id, dateKey)).length;
    const percentage = Math.round((completed / total) * 100);
    const isAllDone = total > 0 && completed === total;

    return { total, completed, percentage, isAllDone };
  }

  calculateHabitStreak(habitId) {
    const habit = this.getHabitById(habitId);
    if (!habit || !habit.completedDates || habit.completedDates.length === 0) {
      return { currentStreak: 0, bestStreak: 0, totalDone: 0 };
    }

    const completedSet = new Set(habit.completedDates);
    const totalDone = completedSet.size;

    // Calculate Best Streak across all time
    const sortedDates = Array.from(completedSet).sort();
    let bestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    for (const dateStr of sortedDates) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const curr = new Date(y, m - 1, d);

      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((curr - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      prevDate = curr;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    }

    // Calculate Current Streak backwards from today or yesterday
    let currentStreak = 0;
    const checkDate = new Date();
    let checkKey = formatDateKey(checkDate);

    // If today is completed, start from today. If not completed today, check if yesterday was completed.
    if (!completedSet.has(checkKey)) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkKey = formatDateKey(checkDate);
    }

    while (completedSet.has(checkKey)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkKey = formatDateKey(checkDate);
    }

    return { currentStreak, bestStreak, totalDone };
  }

  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.habits)) {
        throw new Error('Format data tidak valid: harus memiliki daftar habits.');
      }
      this.data = parsed;
      this.save();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  resetData() {
    this.data = createDefaultData();
    this.save();
  }
}

// Global Singleton Instance & Helpers
window.formatDateKey = formatDateKey;
window.getRelativeDateKey = getRelativeDateKey;
window.habitStore = new HabitStore();
