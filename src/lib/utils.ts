import { Category, CategoryTree } from "@/types/category";
// import { Artifact } from "@/types/artifact";
import { TreeParent, TreeChild } from "@/types/category";

export function getCategoryTree(
  categories: Category[],
  // _items: Artifact[],
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

/**
 * Flattens a category tree into a single array of categories and children.
 */
export function flattenTree(nodes: TreeParent[]): (TreeParent | TreeChild)[] {
  return nodes.reduce((acc: (TreeParent | TreeChild)[], node) => {
    acc.push(node);
    if (node.children) {
      acc.push(...Object.values(node.children));
    }
    return acc;
  }, []);
}
