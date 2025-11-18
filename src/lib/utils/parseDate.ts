const parseDate = (dateString: string) => {
  const [day, month, year, hours, minutes] = dateString.split(/[.: ]/g);
  const utcDate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes))
  );

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userLocale = Intl.DateTimeFormat().resolvedOptions().locale;
  const userDate = new Date(utcDate.toLocaleString('en-US', { timeZone: userTimeZone }));

  const formattedDate = userDate.toLocaleDateString(userLocale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  return formattedDate;
};

export default parseDate;
