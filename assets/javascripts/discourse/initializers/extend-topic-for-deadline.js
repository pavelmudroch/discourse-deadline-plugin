import I18n from 'I18n';
import { withPluginApi } from 'discourse/lib/plugin-api';
import PostCooked from 'discourse/widgets/post-cooked';
import DeadlineCalendar from '../components/modal/deadline-calendar';
import { getOwner } from '@ember/application';
import {
    getDeadlineRemainingDays,
    getDeadlineContent,
    getDeadlineClassByRemainingDays,
} from '../../lib/deadline-functions';
import { getSiteSettings } from '../../lib/get-site-settings';

function getDeadlineStyleByRemainingDays(remainingDays) {
    const cssClass = getDeadlineClassByRemainingDays(remainingDays);
    const helperElement = document.createElement('span');
    helperElement.classList.add(cssClass);
    helperElement.style.visibility = 'hidden';
    document.body.appendChild(helperElement);

    const style = window.getComputedStyle(helperElement);
    const color = style.getPropertyValue('color');
    const backgroundColor = style.getPropertyValue('background-color');
    helperElement.remove();
    const colorStyleString =
        color === 'rgba(0, 0, 0, 0)' ? '' : `color: ${color};`;
    const backgroundColorStyleString =
        backgroundColor === 'rgba(0, 0, 0, 0)'
            ? ''
            : `background-color: ${backgroundColor};`;

    return colorStyleString + backgroundColorStyleString;
}

async function showSetDeadlineModal() {
    const model = this.model;
    const modal = getOwner(this).lookup('service:modal');
    modal.show(DeadlineCalendar, {
        model,
    });
}

function isToEndOfTheDay(date) {
    const time = date.toLocaleTimeString('cs-CZ', {
        hour12: false,
        hourCycle: 'h23',
        minute: '2-digit',
        hour: '2-digit',
    });
    if (time !== '23:59') return false;

    return true;
}

function addPostDeadlineExcerpt(api, siteSettings) {
    api.decorateWidget('post-contents:before', (helper) => {
        if (helper.attrs.post_number === 1) {
            const postModel = helper.getModel();
            if (!postModel) return;

            const topic = postModel.topic;
            if (
                !siteSettings.allowDeadlineOnAllCategories &&
                !siteSettings.allowDeadlineOnCategories.includes(
                    topic.category_id,
                )
            )
                return;

            api.attachWidgetAction('post', 'setDeadline', showSetDeadlineModal);
            api.addPostMenuButton('deadline', (attrs) => {
                if (attrs.post_number !== 1) return;

                return {
                    action: 'setDeadline',
                    icon: 'calendar-alt',
                    className: 'set-deadline create',
                    title: 'deadline.set_button_title',
                    position: 'first',
                    label: 'deadline.set_button_label',
                };
            });

            if (!topic.deadline_timestamp) return;

            const timestamp = parseInt(topic.deadline_timestamp);
            const deadlineRemainingDays = getDeadlineRemainingDays(timestamp);
            const deadlineStyle = getDeadlineStyleByRemainingDays(
                deadlineRemainingDays,
            );
            const closedTopicClass = topic.closed
                ? 'topic-closed-deadline'
                : '';

            const deadlineDate = new Date(timestamp);
            const showDeadlineTime =
                !isToEndOfTheDay(deadlineDate) && deadlineRemainingDays === 0;
            const deadlineExcerpt = `
                <div class='topic-deadline code ${closedTopicClass}' data-topic='${
                topic.id
            }' style="${deadlineStyle}" title="${I18n.t(
                'deadline.notifications.title',
            )}">
                    <svg>
                        <use href='#calendar-alt'></use>
                    </svg>
                    <span class="deadline-date">${
                        getDeadlineContent(deadlineDate)?.concat(' - ') ?? ''
                    }${deadlineDate.toLocaleDateString('cs-CZ', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })}</span>${
                !showDeadlineTime
                    ? ''
                    : `<span class="deadline-time">${deadlineDate.toLocaleTimeString(
                          'cs-CZ',
                          {
                              hour12: false,
                              hourCycle: 'h23',
                              minute: '2-digit',
                              hour: '2-digit',
                          },
                      )}</span>`
            }
                </div>
            `;
            const cooked = new PostCooked({
                cooked: deadlineExcerpt,
            });
            return helper.rawHtml(cooked.init());
        }
    });
}

function extendTopicForDeadline(api) {
    const siteSettings = getSiteSettings(api);
    if (!siteSettings.deadlineEnabled) {
        console.log('Deadline plugin is disabled.');
        return;
    }

    addPostDeadlineExcerpt(api, siteSettings);
}

export default {
    name: 'extend-topic-for-deadline',
    initialize() {
        withPluginApi('1.0.0', extendTopicForDeadline);
    },
};
