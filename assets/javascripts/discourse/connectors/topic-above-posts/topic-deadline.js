import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { getDeadlineAllowedCategories } from '../../../lib/get-deadline-allowed-categories';
import { getDeadlineRemainingDays } from '../../../lib/get-deadline-remaining-days';
import { translateDeadlineRemainingDays } from '../../../lib/translate-deadline-remaining-days';
import I18n from 'discourse-i18n';
import { getDeadlineRemainingDaysClass } from '../../../lib/get-deadline-remaining-days-class';
import DeadlineCalendar from '../../components/modal/deadline-calendar';
import { tracked } from '@glimmer/tracking';
import { ajax } from 'discourse/lib/ajax';

function getDeadlineColorsFromClassName(className) {
    const temp = document.createElement('span');
    temp.style.visibility = 'hidden';
    temp.classList.add('topic-deadline-date', className);
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
    @service appEvents;
    @tracked deadlineFormatted;
    @tracked hasDeadline;
    @tracked style;
    @tracked shouldRender;
    #topic;
    #timestamp;
    #remainingDays;

    get id() {
        return this.#topic.id;
    }

    get deadlineTimestamp() {
        return this.#timestamp;
    }

    get #deadlineFormatted() {
        const timestamp = this.deadlineTimestamp;

        if (timestamp === null || timestamp === '')
            return I18n.t('deadline.change_button.error');

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

    get #hasDeadline() {
        return this.deadlineTimestamp !== null;
    }

    constructor() {
        super(...arguments);

        this.appEvents.on('page:changed', this, this.#onPageChanged);
        this.appEvents.on('deadline:changed', this, this.#update);
        this.#init(this.args.outletArgs.model);
        this.updateDeadline();
    }

    @action
    setDeadline() {
        const modal = getOwner(this).lookup('service:modal');
        modal.show(DeadlineCalendar, {
            model: this.args.outletArgs.model,
        });
    }

    updateDeadline() {
        this.shouldRender = this.#shouldRender();
        this.deadlineFormatted = this.#deadlineFormatted;
        this.hasDeadline = this.#hasDeadline;
        const className = getDeadlineRemainingDaysClass(
            this.#remainingDays,
            this.siteSettings.deadline_soon_days_threshold,
        );
        const { color, backgroundColor } =
            getDeadlineColorsFromClassName(className);
        this.style = [color ?? '', backgroundColor ?? ''].join('');
    }

    willDestroy() {
        this.appEvents.off('deadline:changed', this, this.#update);
        this.appEvents.off('page:changed', this, this.#onPageChanged);
        super.willDestroy(...arguments);
    }

    #init(topic) {
        this.#topic = topic;
        if (
            this.#topic.deadline_timestamp === null ||
            this.#topic.deadline_timestamp === ''
        ) {
            this.#timestamp = null;
            this.#remainingDays = null;
        } else {
            this.#timestamp = parseInt(this.#topic.deadline_timestamp);
            this.#remainingDays = getDeadlineRemainingDays(this.#timestamp);
        }
    }

    async #update() {
        const topic = await ajax(`/t/${this.#topic.id}.json`);
        this.#init(topic);
        this.updateDeadline();
        this.args.outletArgs.model.deadline_timestamp =
            this.deadlineTimestamp?.toString() ?? '';
    }

    #onPageChanged() {
        this.#init(this.args?.outletArgs?.model);
        this.updateDeadline();
    }

    #shouldRender() {
        const {
            deadline_enabled: deadlineEnabled,
            deadline_allowed_on_categories: deadlineAllowedOnCategories,
            deadline_display_on_closed_topic: deadlineDisplayOnClosedTopic,
            deadline_display_on_solved_topic: deadlineDisplayOnSolvedTopic,
        } = this.siteSettings;
        const categoryId = this.#topic.category_id;
        const deadlineAllowedCategories = getDeadlineAllowedCategories(
            deadlineAllowedOnCategories,
        );
        const closedTopicDisplayDeadline =
            !this.#topic.closed || deadlineDisplayOnClosedTopic;
        const solvedTopicDisplayDeadline =
            !this.#topic.has_accepted_answer || deadlineDisplayOnSolvedTopic;

        return (
            deadlineEnabled &&
            closedTopicDisplayDeadline &&
            solvedTopicDisplayDeadline &&
            (deadlineAllowedCategories?.includes(categoryId) ?? true)
        );
    }
}
