export function getDeadlineAllowedCategories(categoryList) {
    if (typeof categoryList !== 'string') return null;

    const categories = categoryList
        .split('|')
        .map((x) => parseInt(x, 10))
        .filter(isFinite);
    if (categories.length === 0) return null;

    return categories;
}
