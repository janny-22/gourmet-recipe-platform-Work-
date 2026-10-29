/**
 * Text utility, slug generator, and date/time formatters in English
 */
export function toNFC(str: string): string {
  if (!str) return '';
  return str.normalize('NFC');
}

export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 min';
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${hours}h ${remainingMins}m`;
}

export function getDifficultyLabel(diff: number): { label: string; color: string } {
  switch (diff) {
    case 1:
      return { label: 'Easy', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 2:
      return { label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 3:
      return { label: 'Hard', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    case 4:
      return { label: 'Expert', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    default:
      return { label: 'Easy', color: 'text-stone-700 bg-stone-50 border-stone-200' };
  }
}

export function formatDateVN(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const now = new Date();
    const d = new Date(dateStr);
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    return `${Math.floor(diffSec / 86400)} days ago`;
  } catch {
    return 'recently';
  }
}
