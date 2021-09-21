import React from 'react';
import LocaleDropDown from './LocaleDropDown.component';

const LocaleCountryDropDown = props =>
    <LocaleDropDown {...props} getUrl="locales/countries" labelKey="country" />;

export default LocaleCountryDropDown;
