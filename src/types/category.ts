export interface Category {
  id: string | number;
  name: string;
  slug?: string;
  parent: {
    id: string | number;
    name: string;
    slug: string;
  } | null;
}

export interface CategoryTree {
  [key: string]: {
    name: string;
    slug: string;
    totalCount: number;
    children: {
      [key: string]: {
        name: string;
        slug: string;
        count: number;
      };
    };
  };
}

export interface TreeChild {
  name: string;
  slug: string;
  count: number;
}

export interface TreeParent {
  name: string;
  slug: string;
  totalCount: number;
  children: Record<string, TreeChild>;
}
