import memoizeOne from "memoize-one";
import { FrontendLocaleData } from "../../data/translation";
import { polyfillsLoaded } from "../translations/localize";

await polyfillsLoaded;

const formatDateMem = memoizeOne(
  (locale: FrontendLocaleData) =>
    new Intl.DateTimeFormat(locale.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
);

export const formatDate = (dateObj: Date, locale: FrontendLocaleData) =>
  formatDateMem(locale).format(dateObj);

const formatDateShortMem = memoizeOne(
  (locale: FrontendLocaleData) =>
    new Intl.DateTimeFormat(locale.language, {
      day: "numeric",
      month: "short",
    })
);

export const formatDateShort = (dateObj: Date, locale: FrontendLocaleData) =>
  formatDateShortMem(locale).format(dateObj);

const formatDateWeekdayMem = memoizeOne(
  (locale: FrontendLocaleData) =>
    new Intl.DateTimeFormat(locale.language, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
);

export const formatDateWeekday = (dateObj: Date, locale: FrontendLocaleData) =>
  formatDateWeekdayMem(locale).format(dateObj);
