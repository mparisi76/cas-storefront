import { Category, CategoryTree } from "@/types/category";
import { Artifact } from "@/types/product";

export function getCategoryTree(
  categories: Category[],
  _items: Artifact[],
): CategoryTree {
  const tree: CategoryTree = {};

  // 1. Setup Parents first
  const parents = categories.filter((c) => !c.parent);
  parents.forEach((p) => {
    tree[String(p.id)] = {
      name: p.name,
      slug: p.slug || "",
      totalCount: p.count ?? 0, // Using the new property safely
      children: {},
    };
  });

  // 2. Setup Children and add their counts to parents
  const children = categories.filter((c) => c.parent);
  children.forEach((c) => {
    const parentId = String(c.parent?.id);
    const childCount = c.count ?? 0;

    if (tree[parentId]) {
      tree[parentId].children[String(c.id)] = {
        name: c.name,
        slug: c.slug || "",
        count: childCount,
      };

      // Accumulate the child's count into the parent's total
      tree[parentId].totalCount += childCount;
    }
  });

  return tree;
}
