import LocaleLanguageDropDown from './locale/LocaleLanguageDropDown.component';
import LocaleCountryDropDown from './locale/LocaleCountryDropDown.component';

// Note that name maps to language and locale to country
// Why? Because a locale consists of a code + name, which are both derived from a language and country, as follows
// locale-code = `${language.value}_${country.value}`
// locale-name = `${language.text}_${country.text}`
// In ../custom-models/locale/LocaleModelDefinition.js in the save method these final values are pulled from the country and locale
export default new Map([
    ['name', {
        component: LocaleLanguageDropDown,
    }],
    ['locale', {
        component: LocaleCountryDropDown,
    }],
]);
