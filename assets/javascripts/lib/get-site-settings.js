export function getSiteSettings(api) {
    const settings = api.container.lookup('site-settings:main');
    return {
        deadlineEnabled: settings.deadline_enabled,
        deadlineSoonDays: settings.deadline_soon_days,
        allowDeadlineOnAllCategories: true,
        allowDeadlineOnCategories: [],
        autoBumpTopicOnDeadlineDay: settings.auto_bump_topic_on_deadline_day,
    };
}
