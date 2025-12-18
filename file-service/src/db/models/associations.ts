import File from "./File";
import Category from "./Category";
import Folder from "./Folder";

// Folder - Folder (subfolder support)
Folder.hasMany(Folder, { foreignKey: 'parentId', as: 'subfolders' });
Folder.belongsTo(Folder, { foreignKey: 'parentId', as: 'parent' });

// Folder - File
Folder.hasMany(File, { foreignKey: 'folderId', as: 'files' });
File.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });

// Category - File
Category.hasMany(File, { foreignKey: 'categoryId', as: 'files' });
File.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

export default function setupAssociations() {}