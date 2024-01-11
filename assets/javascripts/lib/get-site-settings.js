export function getSiteSettings(api) {
    const settings = api.container.lookup('site-settings:main');
    return {
        deadlineEnabled: settings.deadline_enabled,
        deadlineSoonDays: settings.deadline_soon_days,
        allowDeadlineOnAllCategories: settings.allow_deadline_on_all_categories,
        allowDeadlineOnCategories: settings.allow_deadline_on_categories
            .split('|')
            .map((id) => parseInt(id))
            .filter((id) => !isNaN(id)),
        autoBumpTopicOnDeadlineDay: settings.auto_bump_topic_on_deadline_day,
    };
}
