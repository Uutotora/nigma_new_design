export interface RangeFilter {
  from: string;
  to: string;
}

export interface DateRangeFilter {
  from: string;
  to: string;
}

export interface FiltersState {
  projects: string[];
  projectsMatch: 'and' | 'or';
  projectCount: RangeFilter;
  gender: string[];
  birthDate: DateRangeFilter;
  childrenCount: RangeFilter;
  maritalStatus: string[];
  accountType: string[];
  blocked: string[];
  activityCount: RangeFilter;
  firstActivityDate: DateRangeFilter;
  lastActivityDate: DateRangeFilter;
  cityPointsEarned: RangeFilter;
  cityPointsSpent: RangeFilter;
  cityPointsBalance: RangeFilter;
  prizePointsEarned: RangeFilter;
  prizePointsSpent: RangeFilter;
  prizePointsBalance: RangeFilter;
  kidsPointsEarned: RangeFilter;
  kidsPointsSpent: RangeFilter;
  kidsPointsBalance: RangeFilter;
  mosbiletPointsEarned: RangeFilter;
  mosbiletPointsSpent: RangeFilter;
  mosbiletPointsBalance: RangeFilter;
  tags: string[];
  activityGroup: string[];
  loyaltyGroup: string[];
  usefulnessGroup: string[];
  interestGroup: string[];
  messageGroup: string[];
}

export const getDefaultFilters = (): FiltersState => ({
  projects: [],
  projectsMatch: 'or',
  projectCount: { from: '', to: '' },
  gender: [],
  birthDate: { from: '', to: '' },
  childrenCount: { from: '', to: '' },
  maritalStatus: [],
  accountType: [],
  blocked: [],
  activityCount: { from: '', to: '' },
  firstActivityDate: { from: '', to: '' },
  lastActivityDate: { from: '', to: '' },
  cityPointsEarned: { from: '', to: '' },
  cityPointsSpent: { from: '', to: '' },
  cityPointsBalance: { from: '', to: '' },
  prizePointsEarned: { from: '', to: '' },
  prizePointsSpent: { from: '', to: '' },
  prizePointsBalance: { from: '', to: '' },
  kidsPointsEarned: { from: '', to: '' },
  kidsPointsSpent: { from: '', to: '' },
  kidsPointsBalance: { from: '', to: '' },
  mosbiletPointsEarned: { from: '', to: '' },
  mosbiletPointsSpent: { from: '', to: '' },
  mosbiletPointsBalance: { from: '', to: '' },
  tags: [],
  activityGroup: [],
  loyaltyGroup: [],
  usefulnessGroup: [],
  interestGroup: [],
  messageGroup: [],
});

export const ALL_PROJECTS = [
  'Активный гражданин',
  'Город заданий',
  'Город идей',
  'Электронный дом',
  'Наш город',
  'Миллион призов',
  'Программа лояльности',
  'СТП',
  'ЭДО',
  'Активный гражданин – детям',
];

export const ACCOUNT_TYPES = ['Упрощенная', 'Стандартная', 'Расширенная', 'Базовая'];
export const GENDERS = ['Мужской', 'Женский', 'Не указано'];
export const MARITAL_STATUSES = ['Женат/Замужем', 'Холост/Не замужем', 'Не указано'];
export const DISTRICTS = ['ЦАО', 'САО', 'СВАО', 'ВАО', 'ЮВАО', 'ЮАО', 'ЮЗАО', 'ЗАО', 'СЗАО', 'Зеленоград'];
export const GROUPS = ['Низкая', 'Умеренная', 'Высокая', 'Супер'];
export const MESSAGE_GROUPS = ['Нейтральная', 'Низкая'];
export const BLOCKED_OPTIONS = ['Да', 'Нет'];
export const CONFIRMED_OPTIONS = ['Да', 'Нет', 'Частично'];
export const TAG_OPTIONS = ['активность', 'лояльность', 'участие', 'голосование', 'опросы', 'предложения'];

export interface UserData {
  id: number;
  ssoId: string;
  projectCount: number;
  projects: string[];
  accountType: string;
  confirmedAddresses: string;
  activityCount: number;
  firstActivityDate: Date;
  lastActivityDate: Date;
  cityPointsEarned: number;
  cityPointsSpent: number;
  cityPointsBalance: number;
  prizePointsEarned: number;
  prizePointsSpent: number;
  prizePointsBalance: number;
  kidsPointsEarned: number;
  kidsPointsSpent: number;
  kidsPointsBalance: number;
  mosbiletPointsEarned: number;
  mosbiletPointsSpent: number;
  mosbiletPointsBalance: number;
  gender: string;
  birthDate: Date;
  maritalStatus: string;
  childrenCount: string;
  district: string;
  area: string;
  address: string;
  isBlocked: string;
  activityGroup: string;
  loyaltyGroup: string;
  usefulnessGroup: string;
  interestGroup: string;
  messageGroup: string;
}

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const areas = ['Арбат', 'Басманный', 'Замоскворечье', 'Красносельский', 'Мещанский', 'Не указано'];

const randomHex = (len: number) => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < len; i += 1) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const generateSsoId = () =>
  `${randomHex(8)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(12)}`;

const generateUserData = (): UserData[] => {
  const startDate = new Date(2020, 0, 1).getTime();
  const now = Date.now();

  return Array.from({ length: 200 }, (_, i) => {
    const firstActivity = new Date(startDate + Math.random() * (now - startDate));
    const lastActivity = new Date(firstActivity.getTime() + Math.random() * (now - firstActivity.getTime()));
    const birthDate = new Date(
      1950 + Math.floor(Math.random() * 55),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1,
    );

    const userProjectsCount = Math.floor(Math.random() * 5) + 1;
    const shuffled = [...ALL_PROJECTS].sort(() => 0.5 - Math.random());
    const userProjects = shuffled.slice(0, userProjectsCount);

    const cityEarned = Math.floor(Math.random() * 5000);
    const citySpent = Math.floor(Math.random() * Math.min(cityEarned, 3000));
    const prizeEarned = Math.floor(Math.random() * 1000);
    const prizeSpent = Math.floor(Math.random() * Math.min(prizeEarned, 800));
    const kidsEarned = Math.floor(Math.random() * 2000);
    const kidsSpent = Math.floor(Math.random() * Math.min(kidsEarned, 1500));
    const mosbiletEarned = Math.floor(Math.random() * 1500);
    const mosbiletSpent = Math.floor(Math.random() * Math.min(mosbiletEarned, 1200));

    return {
      id: i + 1,
      ssoId: generateSsoId(),
      projectCount: userProjects.length,
      projects: userProjects,
      accountType: pick(ACCOUNT_TYPES),
      confirmedAddresses: pick(CONFIRMED_OPTIONS),
      activityCount: Math.floor(Math.random() * 80) + 5,
      firstActivityDate: firstActivity,
      lastActivityDate: lastActivity,
      cityPointsEarned: cityEarned,
      cityPointsSpent: citySpent,
      cityPointsBalance: cityEarned - citySpent,
      prizePointsEarned: prizeEarned,
      prizePointsSpent: prizeSpent,
      prizePointsBalance: prizeEarned - prizeSpent,
      kidsPointsEarned: kidsEarned,
      kidsPointsSpent: kidsSpent,
      kidsPointsBalance: kidsEarned - kidsSpent,
      mosbiletPointsEarned: mosbiletEarned,
      mosbiletPointsSpent: mosbiletSpent,
      mosbiletPointsBalance: mosbiletEarned - mosbiletSpent,
      gender: pick(GENDERS),
      birthDate,
      maritalStatus: pick(MARITAL_STATUSES),
      childrenCount: Math.random() > 0.3 ? Math.floor(Math.random() * 4).toString() : 'Не указано',
      district: pick(DISTRICTS),
      area: pick(areas),
      address: Math.random() > 0.5 ? `ул. Примерная, д. ${Math.floor(Math.random() * 100) + 1}` : 'Не указано',
      isBlocked: pick(BLOCKED_OPTIONS),
      activityGroup: pick(GROUPS),
      loyaltyGroup: pick(GROUPS),
      usefulnessGroup: pick(GROUPS),
      interestGroup: pick(GROUPS),
      messageGroup: pick(MESSAGE_GROUPS),
    };
  });
};

export const ALL_USER_DATA: UserData[] = generateUserData();

export const formatDate = (date: Date): string => date.toLocaleDateString('ru-RU');

export const formatNumber = (num: number): string => num.toLocaleString('ru-RU');

const parseNum = (val: string): number | null => {
  if (!val) return null;
  const parsed = parseInt(val, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseDate = (val: string): Date | null => {
  if (!val) return null;
  const date = new Date(val);
  return Number.isNaN(date.getTime()) ? null : date;
};

const matchRange = (value: number, range: RangeFilter): boolean => {
  const from = parseNum(range.from);
  const to = parseNum(range.to);
  if (from !== null && value < from) return false;
  if (to !== null && value > to) return false;
  return true;
};

const matchDateRange = (value: Date, range: DateRangeFilter): boolean => {
  const from = parseDate(range.from);
  const to = parseDate(range.to);
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
};

const matchSelect = (value: string, selected: string[]): boolean => {
  if (selected.length === 0) return true;
  return selected.includes(value);
};

const matchProjects = (userProjects: string[], selected: string[], mode: 'and' | 'or'): boolean => {
  if (selected.length === 0) return true;
  if (mode === 'and') return selected.every((p) => userProjects.includes(p));
  return selected.some((p) => userProjects.includes(p));
};

export interface ApplyFiltersOptions {
  ssoIdList?: string[];
}

export const applyFilters = (
  data: UserData[],
  filters: FiltersState,
  search: string,
  options: ApplyFiltersOptions = {},
): UserData[] => {
  const normalizedSearch = search.trim().toLowerCase();
  const normalizedSsoList = (options.ssoIdList ?? [])
    .map((id) => id.trim().toLowerCase())
    .filter((id) => id.length > 0);
  const ssoIdSet = normalizedSsoList.length > 0 ? new Set(normalizedSsoList) : null;

  return data.filter((user) => {
    const normalizedUserSsoId = user.ssoId.toLowerCase();

    // 1) List search pipeline stage: if list is provided, keep only exact matches from it.
    if (ssoIdSet && !ssoIdSet.has(normalizedUserSsoId)) return false;

    // 2) Generic search pipeline stage.
    if (normalizedSearch && !normalizedUserSsoId.includes(normalizedSearch)) return false;

    if (!matchProjects(user.projects, filters.projects, filters.projectsMatch)) return false;
    if (!matchRange(user.projectCount, filters.projectCount)) return false;
    if (!matchSelect(user.gender, filters.gender)) return false;
    if ((filters.birthDate.from || filters.birthDate.to) && !matchDateRange(user.birthDate, filters.birthDate)) return false;

    if (filters.childrenCount.from || filters.childrenCount.to) {
      if (user.childrenCount === 'Не указано') return false;
      if (!matchRange(parseInt(user.childrenCount, 10), filters.childrenCount)) return false;
    }

    if (!matchSelect(user.maritalStatus, filters.maritalStatus)) return false;
    if (!matchSelect(user.accountType, filters.accountType)) return false;
    if (!matchSelect(user.isBlocked, filters.blocked)) return false;
    if (!matchRange(user.activityCount, filters.activityCount)) return false;

    if ((filters.firstActivityDate.from || filters.firstActivityDate.to)
      && !matchDateRange(user.firstActivityDate, filters.firstActivityDate)) return false;
    if ((filters.lastActivityDate.from || filters.lastActivityDate.to)
      && !matchDateRange(user.lastActivityDate, filters.lastActivityDate)) return false;

    if (!matchRange(user.cityPointsEarned, filters.cityPointsEarned)) return false;
    if (!matchRange(user.cityPointsSpent, filters.cityPointsSpent)) return false;
    if (!matchRange(user.cityPointsBalance, filters.cityPointsBalance)) return false;
    if (!matchRange(user.prizePointsEarned, filters.prizePointsEarned)) return false;
    if (!matchRange(user.prizePointsSpent, filters.prizePointsSpent)) return false;
    if (!matchRange(user.prizePointsBalance, filters.prizePointsBalance)) return false;
    if (!matchRange(user.kidsPointsEarned, filters.kidsPointsEarned)) return false;
    if (!matchRange(user.kidsPointsSpent, filters.kidsPointsSpent)) return false;
    if (!matchRange(user.kidsPointsBalance, filters.kidsPointsBalance)) return false;
    if (!matchRange(user.mosbiletPointsEarned, filters.mosbiletPointsEarned)) return false;
    if (!matchRange(user.mosbiletPointsSpent, filters.mosbiletPointsSpent)) return false;
    if (!matchRange(user.mosbiletPointsBalance, filters.mosbiletPointsBalance)) return false;

    if (!matchSelect(user.activityGroup, filters.activityGroup)) return false;
    if (!matchSelect(user.loyaltyGroup, filters.loyaltyGroup)) return false;
    if (!matchSelect(user.usefulnessGroup, filters.usefulnessGroup)) return false;
    if (!matchSelect(user.interestGroup, filters.interestGroup)) return false;
    if (!matchSelect(user.messageGroup, filters.messageGroup)) return false;

    return true;
  });
};

export interface ColumnDef {
  field: string;
  label: string;
  group: string;
  DisplayLabel: string;
  isVisible: boolean;
  format?: (value: unknown) => string;
}

const BASE_COLUMN_DEFS: ColumnDef[] = [
  { field: 'ssoId', label: 'SSO ID', group: 'Основные', DisplayLabel: 'SSO ID', isVisible: true },
  { field: 'projectCount', label: 'Кол-во проектов', group: 'Основные', DisplayLabel: 'Кол-во проектов', isVisible: true },
  { field: 'accountType', label: 'Тип учетной записи', group: 'Основные', DisplayLabel: 'Тип учетной записи', isVisible: true },
  { field: 'confirmedAddresses', label: 'Подтвержденные адреса', group: 'Основные', DisplayLabel: 'Подтв. адреса', isVisible: true },
  { field: 'activityCount', label: 'Кол-во активностей', group: 'Активность', DisplayLabel: 'Кол-во активностей', isVisible: true },
  { field: 'firstActivityDate', label: 'Дата первой активности', group: 'Активность', DisplayLabel: 'Дата первой акт.', isVisible: true, format: (value) => formatDate(value as Date) },
  { field: 'lastActivityDate', label: 'Дата последней активности', group: 'Активность', DisplayLabel: 'Дата последней акт.', isVisible: true, format: (value) => formatDate(value as Date) },
  { field: 'cityPointsEarned', label: 'Заработано ГБ', group: 'Городские баллы', DisplayLabel: 'Заработано ГБ', isVisible: true, format: (value) => formatNumber(value as number) },
  { field: 'cityPointsSpent', label: 'Потрачено ГБ', group: 'Городские баллы', DisplayLabel: 'Потрачено ГБ', isVisible: true, format: (value) => formatNumber(value as number) },
  { field: 'cityPointsBalance', label: 'Остаток ГБ', group: 'Городские баллы', DisplayLabel: 'Остаток ГБ', isVisible: true, format: (value) => formatNumber(value as number) },
  { field: 'prizePointsEarned', label: 'Заработано ПБ', group: 'Призовые баллы', DisplayLabel: 'Заработано ПБ', isVisible: true, format: (value) => formatNumber(value as number) },
  { field: 'prizePointsSpent', label: 'Потрачено ПБ', group: 'Призовые баллы', DisplayLabel: 'Потрачено ПБ', isVisible: true, format: (value) => formatNumber(value as number) },
  { field: 'prizePointsBalance', label: 'Остаток ПБ', group: 'Призовые баллы', DisplayLabel: 'Остаток ПБ', isVisible: true, format: (value) => formatNumber(value as number) },
  { field: 'kidsPointsEarned', label: 'Заработано ДБ', group: 'Детские баллы', DisplayLabel: 'Заработано ДБ', isVisible: true, format: (value) => formatNumber(value as number) },
  { field: 'kidsPointsSpent', label: 'Потрачено ДБ', group: 'Детские баллы', DisplayLabel: 'Потрачено ДБ', isVisible: true, format: (value) => formatNumber(value as number) },
  { field: 'kidsPointsBalance', label: 'Остаток ДБ', group: 'Детские баллы', DisplayLabel: 'Остаток ДБ', isVisible: true, format: (value) => formatNumber(value as number) },
  { field: 'gender', label: 'Пол', group: 'Данные пользователя', DisplayLabel: 'Пол', isVisible: true },
  { field: 'birthDate', label: 'Дата рождения', group: 'Данные пользователя', DisplayLabel: 'Дата рождения', isVisible: true, format: (value) => formatDate(value as Date) },
  { field: 'maritalStatus', label: 'Семейное положение', group: 'Данные пользователя', DisplayLabel: 'Семейное положение', isVisible: true },
  { field: 'childrenCount', label: 'Кол-во детей', group: 'Данные пользователя', DisplayLabel: 'Кол-во детей', isVisible: true },
  { field: 'district', label: 'Округ', group: 'Данные пользователя', DisplayLabel: 'Округ', isVisible: true },
  { field: 'area', label: 'Район', group: 'Данные пользователя', DisplayLabel: 'Район', isVisible: true },
  { field: 'isBlocked', label: 'Заблокирован', group: 'Данные пользователя', DisplayLabel: 'Заблокирован', isVisible: true },
  { field: 'activityGroup', label: 'Группа активности', group: 'Группы', DisplayLabel: 'Группа активности', isVisible: true },
  { field: 'loyaltyGroup', label: 'Группа лояльности', group: 'Группы', DisplayLabel: 'Группа лояльности', isVisible: true },
  { field: 'usefulnessGroup', label: 'Группа полезности', group: 'Группы', DisplayLabel: 'Группа полезности', isVisible: true },
  { field: 'interestGroup', label: 'Группа заинтересованности', group: 'Группы', DisplayLabel: 'Группа заинтер.', isVisible: true },
  { field: 'messageGroup', label: 'Группа сообщений', group: 'Группы', DisplayLabel: 'Группа сообщений', isVisible: true },
];

export const COLUMN_DEFS: ColumnDef[] = BASE_COLUMN_DEFS;

