import { scheduleOnce } from '@ember/runloop';
import TopicListItem from 'discourse/components/topic-list-item';
import { withPluginApi } from 'discourse/lib/plugin-api';
import {
    getDeadlineRemainingDays,
    getDeadlineContent,
    getDeadlineClassByRemainingDays,
} from '../../lib/deadline-functions';
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
            didInsertElement() {
                this._super(...arguments);
                const category = this.topic.category_id;
                const closed = this.topic.closed;
                const solved = this.topic.has_accepted_answer === true;

                if (!siteSettings.deadlineAllowedCategories.includes(category))
                    return;

                if (!siteSettings.deadlineDisplayOnClosedTopic && closed)
                    return;

                if (!siteSettings.deadlineDisplayOnSolvedTopic && solved)
                    return;

                scheduleOnce('afterRender', this, this.addCustomElement);
            },

            addCustomElement() {
                if (!this.topic.deadline_timestamp) return;

                const deadlineTimestamp = parseInt(
                    this.topic.deadline_timestamp,
                );
                const deadlineRemainingDays =
                    getDeadlineRemainingDays(deadlineTimestamp);
                const deadlineColorClass = getDeadlineClassByRemainingDays(
                    deadlineRemainingDays,
                    siteSettings,
                );
                const topicDeadline = document.createElement('span');
                const deadlineDate = new Date(deadlineTimestamp);
                const deadlineContent =
                    getDeadlineContent(deadlineDate) ??
                    deadlineDate.toLocaleDateString('cs-CZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
                topicDeadline.classList.add(
                    'topic-deadline-date',
                    deadlineColorClass,
                );

                if (this.topic.closed)
                    topicDeadline.classList.add('topic-closed-deadline');

                topicDeadline.textContent = deadlineContent;
                const mainLink = this.element.querySelector('.main-link');
                mainLink.appendChild(topicDeadline);
            },
        });
    },
};
