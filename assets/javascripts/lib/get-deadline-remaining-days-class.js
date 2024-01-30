export function getDeadlineRemainingDaysClass(remainingDays, thresholdDays) {
    if (remainingDays < 0) return 'deadline-expired';
    if (remainingDays === 0) return 'deadline-today';
    if (remainingDays <= thresholdDays) return 'deadline-soon';

    return 'deadline-far';
}
