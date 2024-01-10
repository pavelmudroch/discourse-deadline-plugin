import I18n from 'I18n';

export function getDeadlineRemainingDays(deadlineTimestamp) {
    const nowTimestamp = Date.now();
    const remainingTime = deadlineTimestamp - nowTimestamp;
    const remainingDays = Math.floor(remainingTime / (1000 * 60 * 60 * 24));

    return remainingDays;
}

export function getDeadlineColorClassByRemainingDays(remainingDays) {
    if (remainingDays < 0) {
        return 'deadline-expired';
    } else if (remainingDays === 0) {
        return 'deadline-today';
    } else if (remainingDays < 3) {
        return 'deadline-soon';
    } else {
        return 'deadline-far';
    }
}

export function getDeadlineContent(deadlineDate) {
    const now = new Date();

    if (now.getFullYear() === deadlineDate.getFullYear()) {
        if (now.getMonth() === deadlineDate.getMonth()) {
            switch (deadlineDate.getDate() - now.getDate()) {
                case 0:
                    return I18n.t('deadline.date.today');
                case 1:
                    return I18n.t('deadline.date.tomorrow');
                case 2:
                    return I18n.t('deadline.date.day_after_tomorrow');
                case -1:
                    return I18n.t('deadline.date.yesterday');
            }
        }
    }

    return null;
}
