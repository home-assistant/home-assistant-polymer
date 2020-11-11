const fallbackCopy = (str) => {
  const el = document.createElement("textarea");
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

export const copyToClipboard = (str) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(str).catch(() => fallbackCopy(str));
  } else {
    fallbackCopy(str)
  }
};
