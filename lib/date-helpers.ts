export function getDaysInMonth(month: number, year: number): Date[] {
  const date = new Date(year, month, 1);
  const days: Date[] = [];

  // Loop through days until we switch to the next month
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
}

export function formatDateForHeader(date: Date): string {
  // Returns format like "Mon 01"
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit'
  });
}

// Helper to check if a cell should be locked (Blacked out)
export function isDateBeforeJoin(currentDate: Date, joinedDateStr: string): boolean {
  // Reset hours to midnight for accurate day comparison
  const cellDate = new Date(currentDate);
  cellDate.setHours(0, 0, 0, 0);

  const joined = new Date(joinedDateStr);
  joined.setHours(0, 0, 0, 0);

  return cellDate < joined;
}