import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getDeadlineAllowedCategories } from '../../../lib/get-deadline-allowed-categories';

const DEADLINE_URL = 'deadline';

export default class DeadlineNavItem extends Component {
    @service router;
    @service siteSettings;
    @tracked activeClass = '';
    @tracked deadlineURL = '';
    @tracked shouldRender = false;

    constructor() {
        super(...arguments);
        this.router.on('routeDidChange', this.updateCurrentURL);
    }

    willDestroy() {
        super.willDestroy(...arguments);
        this.router.off('routeDidChange', this.updateCurrentURL);
    }

    @action
    updateCurrentURL() {
        const [currentURL, currentSearchParams] =
            this.router.currentURL.split('?');
        const currentRoute = this.router.currentRoute;
        const categoryId = parseInt(
            currentRoute.params?.category_slug_path_with_id?.split('/').pop(),
        );
        const allowedCategories = getDeadlineAllowedCategories(
            this.siteSettings.deadline_allowed_on_categories,
        );

        if (allowedCategories !== null) {
            if (
                !isFinite(categoryId) ||
                !allowedCategories.includes(categoryId)
            ) {
                this.shouldRender = false;
                this.deadlineURL = '';
                this.activeClass = '';
                return;
            }
        }

        this.shouldRender = true;
        const urlParts = currentURL.split('/');
        this.activeClass = urlParts.at(-1) === DEADLINE_URL ? 'active' : '';
        const hasNavigationFilter = urlParts.at(-2) === 'l';

        if (hasNavigationFilter) urlParts.splice(-1, 1, DEADLINE_URL);
        else urlParts.push('l', DEADLINE_URL);
        this.deadlineURL =
            urlParts.join('/') +
            (currentSearchParams !== undefined
                ? `?${currentSearchParams}`
                : '');
    }
}
