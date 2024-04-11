import { ContactBase } from './ContactInfoMapping';

export const asArray = (obj: any | Array<any>) => {
  if (obj instanceof Array) return obj;
  return obj ? [obj] : [];
};

export const asSingle = (obj: any | Array<any>) => {
  if (obj instanceof Array) return obj[0];
  return obj;
};

/** Apply an array of items to a VCard. The underlying API requires that we `set` to
clear the array and then `add` subsequent items. */
export const setArray = (attr: string, card: any, values: { value: string; type?: string }[]) => {
  values.forEach(({ value, type }, idx) => {
    const params = {};
    if (type) {
      params['type'] = type;
    }
    if (idx === 0) {
      card.set(attr, value, params);
    } else {
      card.add(attr, value, params);
    }
  });
};

export const parseBirthday = (date: string) => {
  const [year, month, day] = [...date.split('-'), -1, -1, -1];
  return { year: Number(year), month: Number(month), day: Number(day) };
};

/** Serialize into {value: YYYY-MM-DD} with NO exceptions, regardless of what
 you typed into the boxes. */
export const serializeBirthday = ({
  date,
}: {
  date: { year: number; month: number; day: number };
}) => {
  const td = (n: number, count: number) => {
    let clean = Number(n);
    if (isNaN(clean)) clean = 0;
    let str = clean.toString();
    if (str.length > count) str = str.slice(0, count);
    if (str.length < count) str = '0'.repeat(count - str.length) + str.length;
    return str;
  };
  return { value: `${td(date.year, 4)}-${td(date.month, 2)}-${td(date.day, 2)}` };
};

export const removeRandomSemicolons = (value: string) => {
  return value
    .replace(/;/g, ' ')
    .replace(/  +/g, ' ')
    .trim();
};

export const formatAddress = (addr: ContactBase['addresses'][0]) => {
  return [
    [addr.streetAddress].filter(a => a.length).join(' '),
    [addr.extendedAddress].join(' '),
    [addr.city, addr.region, addr.postalCode].filter(a => a.length).join(' '),
    [addr.country].join(' '),
  ]
    .filter(l => l.length)
    .join('\n')
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',');
};

export const parseAddress = (item: { _data: string; label?: string; type?: string }) => {
  const [A, AddrLine1, AddrLine2, City, State, Zip, Country] = [
    ...item._data.split(';'),
    ...'       '.split(' '),
  ];

  const result: ContactBase['addresses'][0] = {
    city: City,
    country: Country,
    postalCode: Zip,
    region: State,
    streetAddress: AddrLine1,
    extendedAddress: AddrLine2,
    type: parseType(item.type),
    formattedValue: '',
  };

  result.formattedValue = item.label || formatAddress(result);
  return result;
};

export const parseType = (value: string) => {
  return asArray(value).filter(v => v !== 'internet' && v !== 'pref')[0];
};

export const parseValueAndTypeCollection = (items: any[]) => {
  return (
    items.length > 0 &&
    items.map(item => ({
      value: item._data,
      type: parseType(item.type),
    }))
  );
};

export const serializeAddress = (item: ContactBase['addresses'][0]) => {
  const value = [
    '',
    item.streetAddress,
    item.extendedAddress,
    item.city,
    item.region,
    item.postalCode,
    item.country,
  ].join(';');
  return { value, type: item.type };
};

export const parseName = (name: { _data: string } | null) => {
  const parts = (name ? name._data : '').split(';');

  return {
    givenName: parts[1] || '',
    familyName: parts[0] || '',
    honorificPrefix: parts[3] || '',
    honorificSuffix: parts[4] || '',
    displayName: `${parts[3] || ''} ${parts[1]} ${parts[0]} ${parts[4] || ''}`.trim(),
  };
};

export const formatDisplayName = (name: ContactBase['name']) => {
  return `${name.givenName || ''} ${name.familyName || ''}`.trim();
};
