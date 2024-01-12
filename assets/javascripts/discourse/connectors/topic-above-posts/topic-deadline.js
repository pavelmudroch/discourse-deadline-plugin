import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { getDeadlineAllowedCategories } from '../../../lib/get-deadline-allowed-categories';

export default class TopicDeadline extends Component {
    @service siteSettings;
    #topic;

    get id() {
        return this.#topic.id;
    }

    get deadlineTimestamp() {
        return this.#topic.deadline_timestamp;
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
    }
}
