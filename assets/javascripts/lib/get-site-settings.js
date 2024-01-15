import { getDeadlineAllowedCategories } from './get-deadline-allowed-categories';

export function getSiteSettings(api) {
    const settings = api.container.lookup('site-settings:main');
    return {
        deadlineEnabled: settings.deadline_enabled,
        deadlineSoonDays: settings.deadline_soon_days,
        deadlineSoonDaysThreshold: settings.deadline_soon_days_threshold,
        deadlineAllowedCategories: getDeadlineAllowedCategories(
            settings.deadline_allowed_on_categories,
        ),
        deadlineDisplayOnClosedTopic: settings.deadline_display_on_closed_topic,
        deadlineDisplayOnSolvedTopic: settings.deadline_display_on_solved_topic,
    };
}
