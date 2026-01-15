import { AdminsParticipantDto } from "../services/admins-participant-service";
import { TripUserDto } from "../services/trip-user-service";

export const isGuid = (value: string | null): boolean => {
  if (!value) return false;
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(value);
};

export const isNumber = (value: any): boolean => {
  return typeof value === 'number' && Number.isFinite(value);
}

export const getFullName = (firstName: string | null, lastName: string | null, email: string, mustAddEmail: boolean): string => {
  let fullName = [firstName, lastName]
    .filter(name => name && name.trim().length > 0)
    .join(' ');

  if (fullName) {
    fullName += mustAddEmail ? ` (${email})` : "";
  } else {
    fullName = email;
  }

  return fullName;
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

export const findDuplicates = (users: TripUserDto[] | AdminsParticipantDto[] | null): string[] => {
  if (!users) {
    return [];
  }
  const counts: { [key: string]: string[] } = {};

  // First pass: group user IDs by their name combination
  users.forEach(user => {
    const key = `${user.firstName ?? ''}|${user.lastName ?? ''}`;
    if (!counts[key]) {
      counts[key] = [];
    }
    counts[key].push(user.id);
  });

  // Second pass: collect IDs that have duplicates
  const duplicatedIds: string[] = [];
  Object.values(counts).forEach(ids => {
    if (ids.length > 1) {
      duplicatedIds.push(...ids);
    }
  });

  return duplicatedIds;
}

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

