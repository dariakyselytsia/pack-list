import type { ListId, Section } from './types';
import { uid } from './uid';

/**
 * Initial lists, copied from base()/build() in "design/new design.html".
 * Item tuple: [text, sub?, hisText?]
 *   sub      — 1 for a nested (indented) item
 *   hisText  — alternative text for "his" list; null = item is not in his list
 */
type SeedItem = [string, (0 | 1)?, (string | null)?];
interface SeedSection {
  id: string;
  sym: string;
  short: string;
  title: string;
  note: string;
  items: SeedItem[];
}

const BASE: SeedSection[] = [
  { id: 'docs', sym: '✧', short: 'ДОК', title: 'документи', note: 'Все це їде в ручній поклажі, не в багажі.', items: [
    ['Паспорт / ID-картка, закордонний паспорт'], ['Фотографії'], ['Зелена карта (автострахування)'], ['Медичне страхування'],
    ['Водійське посвідчення (+ міжнародне)'], ['Скани всіх документів у хмарі та на флешці'],
    ['Банківські картки (2+ різних банків)'], ['Готівка в місцевій валюті на перші дні'] ] },
  { id: 'tech', sym: '⋆', short: 'ТЕХ', title: 'техніка', note: '', items: [
    ['Ноутбук і зарядка'], ['Ноутбук робочий і зарядка'], ['Перехідник до монітора'], ['Монітор'], ['Мишка'], ['Клавіатура'],
    ['Телефон, зарядка, кабелі'], ['Зарядка до годинника'], ['Павербанк (у ручну поклажу)'], ['Навушники'],
    ['Подовжувач / мережевий фільтр'], ['eSIM або місцева SIM-картка'] ] },
  { id: 'clothes', sym: '♡', short: 'ОДЯГ', title: 'одяг', note: 'Під клімат нового місця та найближчий сезон.', items: [
    ['Пальто зимове'], ['Пальто осіннє'], ['Куртка осіння'], ['Повсякденний одяг на 7–10 днів'],
    ['Футболки — 5–7 шт.', 1], ['Сорочки / блузки — 2–3 шт.', 1, 'Сорочки — 2–3 шт.'], ['Лонгсліви або водолазки — 2–3 шт.', 1],
    ['Светри / худі — 2–3 шт.', 1], ['Кардиган або легка кофта', 1], ['Джинси — 2 пари', 1],
    ['Штани — 1–2 пари', 1], ['Спідниця або сукня — 1–2 шт.', 1, null], ['Шорти — 1–2 пари', 1],
    ['Легінси / термобілизна', 1, 'Термобілизна'], ['Одяг на вихід — 1 комплект', 1],
    ['Домашній одяг і піжама'], ['Білизна та шкарпетки'], ['Спортивний одяг'], ['Кросівки, босоніжки, осінні черевики', 0, 'Кросівки, осінні черевики'],
    ['Шапка, шарф, рукавички, ремінь'], ['Парасолька'] ] },
  { id: 'care', sym: '₊˚', short: 'АПТ', title: 'аптечка', note: '', items: [
    ['Постійні ліки на 1–3 місяці + рецепт'], ['Знеболювальне, жарознижувальне'], ['Засоби від застуди та алергії'],
    ['Засоби для шлунка'], ['Пластирі, антисептик, бинт'], ['Термометр'], ['Окуляри / лінзи + рідина'],
    ['Зубна щітка, паста, нитка, зарядка для зубної'], ['Шампунь, гель, дезодорант'], ['Косметика', 0, null],
    ['Ефезел, SPF, зволожуючий крем', 0, null], ['Бритва, гребінець, манікюрний набір'], ['Рушники'] ] },
  { id: 'home', sym: '⌂', short: 'ДІМ', title: 'дім і кухня', note: 'Більшість простіше купити на місці.', items: [
    ['Постільна білизна (1 комплект)'], ['Чашка'], ['Посуд (на 1–2 людей)'],
    ['Тарілки: глибока та пласка', 1], ['Ложки: столова та чайна', 1], ['Виделка', 1], ['Ніж столовий і кухонний', 1],
    ['Миска', 1], ['Склянка', 1], ['Каструля та сковорідка', 1], ['Лопатка та кухонна ложка', 1],
    ['Обробна дошка', 1], ['Губка та рушник для посуду', 1],
    ['Ваги кухонні'], ['Ваги підлогові'], ['Інструменти: викрутка, ножиці, скотч'], ['Пакети та вакуумні мішки'],
    ['Книги / хобі — тільки найважливіше'] ] },
  { id: 'day1', sym: '✦', short: 'ДЕНЬ1', title: 'перший день', note: 'Окрема сумка, щоб не розпаковувати все одразу.', items: [
    ['Документи, картки, готівка'], ['Телефон, зарядка, павербанк, перехідник'], ['Ліки на кілька днів'],
    ['Зміна одягу та білизни на 2–3 дні'], ['Зубна щітка та мінімум косметики', 0, 'Зубна щітка та мінімум догляду'], ['Вода й перекус'],
    ['Ключі від житла / контакти власника'] ] },
  { id: 'todo', sym: '⊹', short: 'СПР', title: 'справи', note: 'Спершу — до від’їзду, далі — після приїзду.', items: [
    ['Перевірити ліміти багажу та заборонені речі'], ['Попередити банк, роумінг або eSIM'],
    ['Розірвати оренду, скасувати підписки'], ['Зняти лічильники, сфотографувати квартиру'],
    ['Продати / віддати те, що не везеш'], ['Доставка або зберігання решти речей'], ['Зважити валізи напередодні'],
    ['Сфотографувати вміст валіз'], ['Зареєструвати адресу проживання'], ['Місцевий номер телефону'],
    ['Місцевий банківський рахунок'], ['Знайти сімейного лікаря / страхову'],
    ['Оновити адресу в банках і сервісах'], ['Продукти та побутова хімія на тиждень'] ] },
];

export const LIST_NAMES: Record<ListId, string> = {
  her: 'мій список ♡',
  his: 'його список ✧',
};

/** Fallback EQ label for sections without one (e.g. added later). */
export function deriveShort(title: string): string {
  const word = title.trim().split(/\s+/)[0] ?? '';
  return (word.length > 4 ? word.slice(0, 3) : word).toUpperCase() || '—';
}

/** Defaults of the first design, to recognise titles nobody has changed yet. */
const V1_DEFAULTS: Record<string, { title: string; note?: string }> = {
  docs: { title: 'документи та гроші' },
  clothes: { title: 'одяг і взуття' },
  care: { title: 'аптечка та догляд' },
  day1: { title: 'сумка першого дня', note: 'Щоб не розпаковувати все одразу після приїзду.' },
};

/** Lists seeded with the first design have no `short`. Add it, and switch
 *  untouched default titles/notes to the new design's ones. Returns the same
 *  array if nothing needs to change. */
export function migrateSections(sections: Section[]): Section[] {
  if (sections.every((s) => typeof s.short === 'string' && s.short)) return sections;
  return sections.map((s) => {
    if (typeof s.short === 'string' && s.short) return s;
    const seed = BASE.find((b) => b.id === s.id);
    const v1 = V1_DEFAULTS[s.id];
    return {
      ...s,
      short: seed?.short ?? deriveShort(s.title),
      title: seed && v1 && s.title === v1.title ? seed.title : s.title,
      note: seed && v1?.note && s.note === v1.note ? seed.note : s.note,
    };
  });
}

export function buildSections(list: ListId): Section[] {
  const his = list === 'his';
  return BASE.map((s) => ({
    id: s.id,
    sym: s.sym,
    short: s.short,
    title: s.title,
    note: s.note,
    items: s.items
      .filter((it) => !(his && it.length > 2 && it[2] === null))
      .map(([text, sub, hisText]) => ({
        id: uid(),
        text: his && hisText ? hisText : text,
        sub: !!sub,
        done: false,
      })),
  }));
}
