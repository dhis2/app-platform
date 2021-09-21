export default function filterIcons(icons, filterText) {
    if (!filterText) {
        return [...icons];
    }

    const lowerText = filterText.toLowerCase();
    return icons.filter(({ searchKey, description, keywords }) => {
        const matchesKey = searchKey.indexOf(lowerText) > -1;
        const matchesDescription = description && description.toLowerCase().indexOf(lowerText) > -1;
        const matchesKeyWords = keywords && keywords.some(keyword => keyword.toLowerCase().indexOf(lowerText) > -1);
        return matchesKey || matchesDescription || matchesKeyWords;
    });
}
