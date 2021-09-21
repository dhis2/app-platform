
import React from 'react';
import LocaleDropDown from './LocaleDropDown.component';

const LocaleLanguageDropDown = props =>
    <LocaleDropDown {...props} getUrl="locales/languages" labelKey="language" />;

export default LocaleLanguageDropDown;
