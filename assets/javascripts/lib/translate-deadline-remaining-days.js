import I18n from 'discourse-i18n';

export function translateDeadlineRemainingDays(remainingDays) {
    if (remainingDays < -1) return I18n.t('deadline.date.expired');

    switch (remainingDays) {
        case 0:
            return I18n.t('deadline.date.today');
        case 1:
            return I18n.t('deadline.date.tomorrow');
        case 2:
            return I18n.t('deadline.date.day_after_tomorrow');
        case -1:
            return I18n.t('deadline.date.yesterday');
        default:
            return null;
    }
}
