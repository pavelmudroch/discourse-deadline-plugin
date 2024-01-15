export function getDeadlineRemainingDays(timestamp) {
    const now = Date.now();
    const remainingDays = Math.floor((timestamp - now) / 1000 / 60 / 60 / 24);

    return remainingDays;
}
