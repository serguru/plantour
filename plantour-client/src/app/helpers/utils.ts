export const isGuid = (value: string | null): boolean => {
  if (!value) return false;
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(value);
};

export const isNumber = (value: any): boolean => {
  return typeof value === 'number' && Number.isFinite(value); 
}

export const getFullName = (firstName: string | null, lastName: string | null, email: string, mustAddEmail: boolean): string => {
  const fullName = [firstName, lastName]
    .filter(name => name && name.trim().length > 0)
    .join(' ');

  if (fullName && mustAddEmail) {
    return `${fullName} (${email})`;
  }  

  return fullName || (mustAddEmail ? email : '');
}

export const formatToEnglishLocale = (isoString: string): string => {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}
