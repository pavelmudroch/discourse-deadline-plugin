import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { getDeadlineAllowedCategories } from '../../../lib/get-deadline-allowed-categories';
import { getDeadlineRemainingDays } from '../../../lib/get-deadline-remaining-days';
import { translateDeadlineRemainingDays } from '../../../lib/translate-deadline-remaining-days';
import I18n from 'discourse-i18n';
import { getDeadlineRemainingDaysClass } from '../../../lib/get-deadline-remaining-days-class';

function getDeadlineColorsFromClassName(className) {
    const temp = document.createElement('span');
    temp.style.visibility = 'hidden';
    temp.classList.add(className);
    document.body.appendChild(temp);
    const style = window.getComputedStyle(temp);
    const colorStyle = style.color;
    const backgroundColorStyle = style.backgroundColor;
    temp.remove();

    const color =
        colorStyle === 'rgba(0, 0, 0)' ? null : `color:${colorStyle};`;
    const backgroundColor =
        backgroundColorStyle === 'rgba(0, 0, 0, 0)'
            ? null
            : `background-color:${backgroundColorStyle};`;

    return { color, backgroundColor };
}

export default class TopicDeadline extends Component {
    @service siteSettings;
    #topic;
    #timestamp;
    #remainingDays;

    get id() {
        return this.#topic.id;
    }

    get deadlineTimestamp() {
        return this.#timestamp;
    }

    get style() {
        const className = getDeadlineRemainingDaysClass(
            this.#remainingDays,
            this.siteSettings.deadline_soon_days_threshold,
        );
        const { color, backgroundColor } =
            getDeadlineColorsFromClassName(className);
        return [color ?? '', backgroundColor ?? ''].join('');
    }

    get deadlineFormatted() {
        const timestamp = this.deadlineTimestamp;
        if (timestamp === null) return I18n.t('deadline.change_button.error');

        const timestampFormatted = new Date(timestamp).toLocaleDateString(
            I18n.t('deadline.date_locales'),
            {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            },
        );
        const deadlineDayFormatted = translateDeadlineRemainingDays(
            this.#remainingDays,
        );
        const deadlineFormatted = `${
            deadlineDayFormatted?.concat(' - ') ?? ''
        }${timestampFormatted}`;

        return deadlineFormatted;
    }

    get hasDeadline() {
        return this.deadlineTimestamp !== null;
    }

    get shouldRender() {
        const {
            deadline_enabled: deadlineEnabled,
            deadline_allowed_on_categories: deadlineAllowedOnCategories,
        } = this.siteSettings;
        const categoryId = this.#topic.category_id;
        const deadlineAllowedCategories = getDeadlineAllowedCategories(
            deadlineAllowedOnCategories,
        );

        return (
            deadlineEnabled &&
            (deadlineAllowedCategories?.includes(categoryId) ?? true)
        );
    }

    constructor() {
        super(...arguments);

        this.#topic = this.args.outletArgs.model;
        if (this.#topic.deadline_timestamp === null) {
            this.#timestamp = null;
            this.#remainingDays = null;
        } else {
            this.#timestamp = parseInt(this.#topic.deadline_timestamp);
            this.#remainingDays = getDeadlineRemainingDays(this.#timestamp);
        }
    }
}
