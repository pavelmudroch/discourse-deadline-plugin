import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import DiscourseURL from 'discourse/lib/url';
import I18n from 'discourse-i18n';
import { ajax } from 'discourse/lib/ajax';
import { inject as service } from '@ember/service';

export default class SetDeadline extends Component {
    @service siteSettings;
    @service appEvents;
    @tracked saving = false;
    @tracked date = moment().format('YYYY-MM-DD');
    @tracked flash;
    #time = '23:59';

    constructor() {
        super(...arguments);
        const topic = this.args.model;
        const deadline = topic.deadline_timestamp;

        if (deadline) this.#setCurrentDateTimeFromDeadline(deadline);
    }

    get createdAt() {
        return moment(`${this.date} ${this.#time}`, 'YYYY-MM-DD HH:mm');
    }

    get validTimestamp() {
        return moment().diff(this.createdAt, 'minutes') > 0;
    }

    get buttonDisabled() {
        return this.saving || this.validTimestamp || isEmpty(this.date);
    }

    @action
    async setDeadline() {
        const topic = this.args.model;
        const datetime = new Date(`${this.date} ${this.#time}`).valueOf();

        this.saving = true;
        try {
            await ajax(`/discourse-topic-deadline/topics/${topic.id}`, {
                type: 'PUT',
                data: {
                    custom_fields: {
                        deadline_timestamp: datetime,
                    },
                },
            });
            // next(() => DiscourseURL.routeTo(topic.url));
            this.appEvents.trigger('deadline:changed');
            this.args.closeModal();
        } catch (error) {
            console.error(error);
            this.flash = I18n.t('deadline.calendar.action_error');
        } finally {
            this.saving = false;
        }
    }

    #setCurrentDateTimeFromDeadline(deadline) {
        const date = new Date(parseInt(deadline));
        this.date = date.toLocaleDateString('en-CA');
        // this.#time = date.toLocaleTimeString('cs-CZ', {
        //     hour12: false,
        //     hourCycle: 'h23',
        //     minute: '2-digit',
        //     hour: '2-digit',
        // });
    }
}
