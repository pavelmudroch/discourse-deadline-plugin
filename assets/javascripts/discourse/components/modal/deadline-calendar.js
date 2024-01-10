import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import DiscourseURL from 'discourse/lib/url';
import I18n from 'discourse-i18n';
import Topic from 'discourse/models/topic';
import { ajax } from 'discourse/lib/ajax';

export default class SetDeadline extends Component {
    @tracked saving = false;
    @tracked date = moment().format('YYYY-MM-DD');
    @tracked time = '23:59';
    @tracked flash;

    constructor() {
        super(...arguments);
        const topic = this.args.model.topic;
        const deadline = topic.deadline_timestamp;

        if (deadline) this.#setCurrentDateTimeFromDeadline(deadline);
    }

    get createdAt() {
        const time = this.time === '' ? '23:59' : this.time;
        return moment(`${this.date} ${time}`, 'YYYY-MM-DD HH:mm');
    }

    get validTimestamp() {
        return moment().diff(this.createdAt, 'minutes') > 0;
    }

    get buttonDisabled() {
        return this.saving || this.validTimestamp || isEmpty(this.date);
    }

    @action
    async setDeadline() {
        if (this.time === '') this.time = '23:59';

        const model = this.args.model;
        const topic = model.topic;
        const datetime = new Date(`${this.date} ${this.time}`).valueOf();

        this.saving = true;
        try {
            this.args.closeModal();
            await ajax(`/discourse-topic-deadline/topics/${topic.id}`, {
                type: 'PUT',
                data: {
                    custom_fields: {
                        deadline_timestamp: datetime,
                    },
                },
            });
            next(() => DiscourseURL.routeTo(this.args.model.topic.url));
        } catch (error) {
            console.error(error);
            this.flash = I18n.t('topic.change_timestamp.error');
        } finally {
            this.saving = false;
        }
    }

    #setCurrentDateTimeFromDeadline(deadline) {
        const date = new Date(parseInt(deadline));
        this.date = date.toLocaleDateString('en-CA');
        this.time = date.toLocaleTimeString('cs-CZ', {
            hour12: false,
            hourCycle: 'h23',
            minute: '2-digit',
            hour: '2-digit',
        });
    }
}
