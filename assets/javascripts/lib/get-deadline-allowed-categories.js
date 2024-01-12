export function getDeadlineAllowedCategories(categoryList) {
    if (typeof categoryList !== 'string') return null;

    const categories = categoryList.split('|').map(parseInt).filter(isFinite);
    if (categories.length === 0) return null;

    return categories;
}
