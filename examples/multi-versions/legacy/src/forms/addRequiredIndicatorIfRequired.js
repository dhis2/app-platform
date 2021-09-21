export default function addRequiredIndicatorIfRequired(labelText, isRequired) {
    if (isRequired) {
        return `${labelText} (*)`;
    }
    return labelText;
}
