import memoizeOne from "memoize-one";
import { FrontendLocaleData } from "../../data/translation";
import { useAmPm } from "./use_am_pm";
import { polyfillsLoaded } from "../translations/localize";

await polyfillsLoaded;

const formatTimeMem = memoizeOne(
  (locale: FrontendLocaleData) =>
    new Intl.DateTimeFormat(locale.language, {
      hour: "numeric",
      minute: "2-digit",
      hour12: useAmPm(locale),
    })
);

export const formatTime = (dateObj: Date, locale: FrontendLocaleData) =>
  formatTimeMem(locale).format(dateObj);

const formatTimeWithSecondsMem = memoizeOne(
  (locale: FrontendLocaleData) =>
    new Intl.DateTimeFormat(locale.language, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: useAmPm(locale),
    })
);

export const formatTimeWithSeconds = (
  dateObj: Date,
  locale: FrontendLocaleData
) => formatTimeWithSecondsMem(locale).format(dateObj);

const formatTimeWeekdayMem = memoizeOne(
  (locale: FrontendLocaleData) =>
    new Intl.DateTimeFormat(locale.language, {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: useAmPm(locale),
    })
);

export const formatTimeWeekday = (dateObj: Date, locale: FrontendLocaleData) =>
  formatTimeWeekdayMem(locale).format(dateObj);
