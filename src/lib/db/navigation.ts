/**
 * Navigation Structure Management
 * 
 * Manages 3-level nested documentation structure in MongoDB
 * Content (MD files) stored in S3, navigation/hierarchy in MongoDB
 */

import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

export const COLLECTIONS = {
  NAV_STRUCTURE: 'nav_structure',
  NAV_ITEMS: 'nav_items'
};

export interface NavItem {
  _id?: ObjectId;
  category: string;
  type: 'folder' | 'doc';
  name: string;
  slug?: string; // Only for docs
  s3Key?: string; // Only for docs (e.g., docs/backend/api-basics.md)
  parentId: ObjectId | null; // null for root level
  order: number; // For sorting
  level: number; // 0 (root), 1, 2, or 3
  isExpanded?: boolean; // UI state (optional)
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User email
}

/**
 * Get navigation structure for a category
 */
export async function getNavStructure(category: string): Promise<NavItem[]> {
  const db = await getDb();
  const items = await db.collection(COLLECTIONS.NAV_ITEMS)
    .find({ category })
    .sort({ order: 1 })
    .toArray();
  
  return items as NavItem[];
}

/**
 * Get navigation tree (hierarchical structure)
 */
export async function getNavTree(category: string): Promise<any[]> {
  const items = await getNavStructure(category);
  
  // Build tree structure
  const itemMap = new Map();
  const rootItems: any[] = [];
  
  // First pass: create map
  items.forEach(item => {
    itemMap.set(item._id!.toString(), {
      ...item,
      children: []
    });
  });
  
  // Second pass: build tree
  items.forEach(item => {
    const node = itemMap.get(item._id!.toString());
    
    if (item.parentId === null) {
      rootItems.push(node);
    } else {
      const parent = itemMap.get(item.parentId.toString());
      if (parent) {
        parent.children.push(node);
      }
    }
  });
  
  return rootItems;
}

/**
 * Create a new navigation item (folder or doc)
 */
export async function createNavItem(item: Omit<NavItem, '_id' | 'createdAt' | 'updatedAt'>): Promise<ObjectId> {
  const db = await getDb();
  
  // Validate level
  if (item.level < 0 || item.level > 3) {
    throw new Error('Level must be between 0 and 3');
  }
  
  // Validate parent level
  if (item.parentId) {
    const parent = await db.collection(COLLECTIONS.NAV_ITEMS)
      .findOne({ _id: item.parentId });
    
    if (!parent) {
      throw new Error('Parent not found');
    }
    
    if ((parent as NavItem).level >= 3) {
      throw new Error('Maximum nesting level (3) reached');
    }
    
    if ((parent as NavItem).type !== 'folder') {
      throw new Error('Parent must be a folder');
    }
  }
  
  const result = await db.collection(COLLECTIONS.NAV_ITEMS).insertOne({
    ...item,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return result.insertedId;
}

/**
 * Update navigation item
 */
export async function updateNavItem(
  id: ObjectId,
  updates: Partial<Omit<NavItem, '_id' | 'createdAt'>>
): Promise<boolean> {
  const db = await getDb();
  
  const result = await db.collection(COLLECTIONS.NAV_ITEMS).updateOne(
    { _id: id },
    {
      $set: {
        ...updates,
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Move item to new parent (drag & drop)
 */
export async function moveNavItem(
  itemId: ObjectId,
  newParentId: ObjectId | null,
  newOrder: number
): Promise<boolean> {
  const db = await getDb();
  
  // Get item
  const item = await db.collection(COLLECTIONS.NAV_ITEMS)
    .findOne({ _id: itemId }) as NavItem;
  
  if (!item) {
    throw new Error('Item not found');
  }
  
  // Calculate new level
  let newLevel = 0;
  if (newParentId) {
    const parent = await db.collection(COLLECTIONS.NAV_ITEMS)
      .findOne({ _id: newParentId }) as NavItem;
    
    if (!parent) {
      throw new Error('Parent not found');
    }
    
    if (parent.type !== 'folder') {
      throw new Error('Parent must be a folder');
    }
    
    newLevel = parent.level + 1;
    
    if (newLevel > 3) {
      throw new Error('Maximum nesting level (3) reached');
    }
  }
  
  // Update item
  const result = await db.collection(COLLECTIONS.NAV_ITEMS).updateOne(
    { _id: itemId },
    {
      $set: {
        parentId: newParentId,
        level: newLevel,
        order: newOrder,
        updatedAt: new Date()
      }
    }
  );
  
  // If item is a folder, update all children levels recursively
  if (item.type === 'folder') {
    await updateChildrenLevels(itemId, newLevel);
  }
  
  return result.modifiedCount > 0;
}

/**
 * Update children levels recursively
 */
async function updateChildrenLevels(parentId: ObjectId, parentLevel: number): Promise<void> {
  const db = await getDb();
  
  const children = await db.collection(COLLECTIONS.NAV_ITEMS)
    .find({ parentId })
    .toArray() as NavItem[];
  
  for (const child of children) {
    const newLevel = parentLevel + 1;
    
    await db.collection(COLLECTIONS.NAV_ITEMS).updateOne(
      { _id: child._id },
      {
        $set: {
          level: newLevel,
          updatedAt: new Date()
        }
      }
    );
    
    // Recursively update grandchildren
    if (child.type === 'folder') {
      await updateChildrenLevels(child._id!, newLevel);
    }
  }
}

/**
 * Delete navigation item
 */
export async function deleteNavItem(id: ObjectId): Promise<boolean> {
  const db = await getDb();
  
  // Check if item has children
  const children = await db.collection(COLLECTIONS.NAV_ITEMS)
    .find({ parentId: id })
    .toArray();
  
  if (children.length > 0) {
    throw new Error('Cannot delete folder with children. Delete children first.');
  }
  
  const result = await db.collection(COLLECTIONS.NAV_ITEMS).deleteOne({ _id: id });
  
  return result.deletedCount > 0;
}

/**
 * Reorder items at the same level
 */
export async function reorderNavItems(
  category: string,
  parentId: ObjectId | null,
  itemIds: ObjectId[]
): Promise<boolean> {
  const db = await getDb();
  
  // Update order for each item
  for (let i = 0; i < itemIds.length; i++) {
    await db.collection(COLLECTIONS.NAV_ITEMS).updateOne(
      { _id: itemIds[i], category, parentId },
      {
        $set: {
          order: i,
          updatedAt: new Date()
        }
      }
    );
  }
  
  return true;
}

/**
 * Get all categories with their root items
 */
export async function getAllCategories(): Promise<string[]> {
  const db = await getDb();
  
  const categories = await db.collection(COLLECTIONS.NAV_ITEMS)
    .distinct('category');
  
  return categories as string[];
}

/**
 * Initialize navigation structure from existing S3 docs
 */
export async function initializeNavFromS3(
  category: string,
  s3Keys: string[],
  createdBy: string
): Promise<void> {
  const db = await getDb();
  
  // Check if category already has navigation
  const existing = await db.collection(COLLECTIONS.NAV_ITEMS)
    .findOne({ category });
  
  if (existing) {
    console.log(`Navigation for ${category} already exists`);
    return;
  }
  
  // Create root level docs
  let order = 0;
  for (const key of s3Keys) {
    const parts = key.split('/');
    if (parts.length === 3 && parts[0] === 'docs' && parts[1] === category) {
      const slug = parts[2].replace('.md', '');
      const name = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      await createNavItem({
        category,
        type: 'doc',
        name,
        slug,
        s3Key: key,
        parentId: null,
        order: order++,
        level: 0,
        createdBy
      });
    }
  }
}

/**
 * Get breadcrumb path for a doc
 */
export async function getBreadcrumb(itemId: ObjectId): Promise<NavItem[]> {
  const db = await getDb();
  const breadcrumb: NavItem[] = [];
  
  let currentId: ObjectId | null = itemId;
  
  while (currentId) {
    const item = await db.collection(COLLECTIONS.NAV_ITEMS)
      .findOne({ _id: currentId }) as NavItem;
    
    if (!item) break;
    
    breadcrumb.unshift(item);
    currentId = item.parentId;
  }
  
  return breadcrumb;
}
