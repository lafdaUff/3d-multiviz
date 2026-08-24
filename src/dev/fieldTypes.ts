export const TYPES = ['string', 'number', 'date', 'link', 'array', 'boolean'];

export const TYPE_LABELS: Record<string, string> = {
  string: 'Texto', number: 'Número', date: 'Data',
  link: 'Link', array: 'Lista', boolean: 'Sim/Não',
};

export const TYPE_ICONS: Record<string, string> = {
  string: 'fa-font', number: 'fa-hashtag', date: 'fa-calendar-day',
  link: 'fa-link', array: 'fa-list-ul', boolean: 'fa-toggle-on',
};

// Regra que o valor deste campo terá de cumprir na aba Modelos
export const TYPE_HINTS: Record<string, string> = {
  string: 'Um único texto livre. Ex.: Resina pintada',
  number: 'Aceita apenas números. Ex.: 15000',
  date: 'Aceita AAAA, AAAA-MM-DD ou DD/MM/AAAA',
  link: 'Exige uma URL http:// ou https://',
  array: 'Vários valores separados por vírgula. Ex.: Madeira, Tinta',
  boolean: 'Aceita apenas Sim ou Não',
};
