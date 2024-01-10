import { scheduleOnce } from '@ember/runloop';
import TopicListItem from 'discourse/components/topic-list-item';
import {
    getDeadlineRemainingDays,
    getDeadlineColorClassByRemainingDays,
    getDeadlineContent,
} from '../../lib/deadline-functions';

export default {
    name: 'extend-topic-list-item',
    initialize() {
        TopicListItem.reopen({
            didInsertElement() {
                this._super(...arguments);

                scheduleOnce('afterRender', this, this.addCustomElement);
            },

            addCustomElement() {
                if (!this.topic.deadline_timestamp) return;

                const deadlineTimestamp = parseInt(
                    this.topic.deadline_timestamp,
                );
                const deadlineRemainingDays =
                    getDeadlineRemainingDays(deadlineTimestamp);
                const deadlineColorClass = getDeadlineColorClassByRemainingDays(
                    deadlineRemainingDays,
                );
                const topicDeadline = document.createElement('span');
                const bottomLine = this.element.querySelector('.link-top-line');
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
                bottomLine.appendChild(topicDeadline);
            },
        });
    },
};
