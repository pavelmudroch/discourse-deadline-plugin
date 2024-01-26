import { scheduleOnce } from '@ember/runloop';
import TopicListItem from 'discourse/components/topic-list-item';
import { withPluginApi } from 'discourse/lib/plugin-api';
import { translateDeadlineRemainingDays } from '../../lib/translate-deadline-remaining-days';
import { getDeadlineRemainingDays } from '../../lib/get-deadline-remaining-days';
import { getDeadlineRemainingDaysClass } from '../../lib/get-deadline-remaining-days-class';
import { getSiteSettings } from '../../lib/get-site-settings';

export default {
    name: 'extend-topic-list-item',
    initialize() {
        const siteSettings = withPluginApi('1.0.0', (api) =>
            getSiteSettings(api),
        );
        if (!siteSettings.deadlineEnabled) {
            console.log('Deadline plugin is disabled.');
            return;
        }

        TopicListItem.reopen({
            didRender() {
                this._super(...arguments);
                const category = this.topic.category_id;
                const closed = this.topic.closed;
                const solved = this.topic.has_accepted_answer === true;
                const categoryIncluded =
                    siteSettings.deadlineAllowedCategories?.includes(
                        category,
                    ) ?? true;

                if (!categoryIncluded) return;

                if (!siteSettings.deadlineDisplayOnClosedTopic && closed)
                    return;

                if (!siteSettings.deadlineDisplayOnSolvedTopic && solved)
                    return;

                this.addCustomElement();
            },

            addCustomElement() {
                if (!this.topic.deadline_timestamp) return;
                if (this.element.querySelector('span.topic-deadline-date'))
                    return;

                const deadlineTimestamp = parseInt(
                    this.topic.deadline_timestamp,
                );
                const deadlineRemainingDays =
                    getDeadlineRemainingDays(deadlineTimestamp);
                const deadlineColorClass = getDeadlineRemainingDaysClass(
                    deadlineRemainingDays,
                    siteSettings.deadlineSoonDaysThreshold,
                );
                const topicDeadline = document.createElement('span');
                const deadlineDate = new Date(deadlineTimestamp);
                const timestampFormatted = deadlineDate.toLocaleDateString(
                    'cs-CZ',
                    {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    },
                );
                const deadlineDayFormatted = translateDeadlineRemainingDays(
                    deadlineRemainingDays,
                );
                const deadlineContent = `${
                    deadlineDayFormatted?.concat(' - ') ?? ''
                }${timestampFormatted}`;
                topicDeadline.classList.add(
                    'topic-deadline-date',
                    deadlineColorClass,
                );

                if (this.topic.closed)
                    topicDeadline.classList.add('topic-closed-deadline');

                topicDeadline.innerHTML = `<svg style="fill: currentColor;" class="d-icon svg-icon"><use href="#far-clock"></use></svg>${deadlineContent}`;
                const mainLink = this.element.querySelector('.main-link');
                mainLink.appendChild(topicDeadline);
            },
        });
    },
};
