import { Category, CategoryTree } from "@/types/category";
import { Artifact } from "@/types/product";
// import { Product } from "@/types/product";

export function getCategoryTree(
  categories: Category[],
  items: Artifact[],
): CategoryTree {
  const tree: CategoryTree = {};

  // 1. Setup Parents
  categories
    .filter((c) => !c.parent)
    .forEach((p) => {
      tree[String(p.id)] = {
        // Force ID to string for the key
        name: p.name,
        slug: p.slug,
        totalCount: 0,
        children: {},
      };
    });

  // 2. Setup Children
  categories
    .filter((c) => c.parent)
    .forEach((c) => {
      const parentId = String(c.parent?.id);
      if (tree[parentId]) {
        tree[parentId].children[String(c.id)] = {
          name: c.name,
          slug: c.slug,
          count: 0,
        };
      }
    });

  // 3. Populate Counts
  items.forEach((item) => {
    // Safety check: skip if no category assigned
    if (!item.category) return;

    const catId = String(item.category.id);
    const parentId = item.category.parent
      ? String(item.category.parent.id)
      : null;

    // Logic: If it has a parent, it's a child. Increment child + parent total.
    if (parentId && tree[parentId]) {
      // It's a child item
      if (tree[parentId].children[catId]) {
        tree[parentId].children[catId].count++;
        tree[parentId].totalCount++;
      }
    }
    // If no parentId, it's assigned directly to a Top-Level category
    else if (tree[catId]) {
      tree[catId].totalCount++;
    }
  });

  return tree;
}
