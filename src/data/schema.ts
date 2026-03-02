

type Url = {
    url: string
    label: string
}

export interface CustomData {
    [key: string]: string | number | boolean | Date | Url | Array<string | number | boolean | Date | Url> | Record<string, unknown> | Array<Record<string, unknown>>
}

export interface Dimensions {
  altura: string;
  largura?: string;
  profundidade?: string;
}

export interface ModelData {
  nome: string;
  link: string;
  thumb: string;
  descricao?: string;
  customdata?: Array<CustomData>;
  dimensions?: Dimensions;
}