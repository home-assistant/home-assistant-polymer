import memoizeOne from "memoize-one";
import { FrontendLocaleData } from "../../data/translation";
import { useAmPm } from "./use_am_pm";
import { polyfillsLoaded } from "../translations/localize";

await polyfillsLoaded;

const formatDateTimeMem = memoizeOne(
  (locale: FrontendLocaleData) =>
    new Intl.DateTimeFormat(locale.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: useAmPm(locale),
    })
);

export const formatDateTime = (dateObj: Date, locale: FrontendLocaleData) =>
  formatDateTimeMem(locale).format(dateObj);

const formatDateTimeWithSecondsMem = memoizeOne(
  (locale: FrontendLocaleData) =>
    new Intl.DateTimeFormat(locale.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: useAmPm(locale),
    })
);

export const formatDateTimeWithSeconds = (
  dateObj: Date,
  locale: FrontendLocaleData
) => formatDateTimeWithSecondsMem(locale).format(dateObj);
