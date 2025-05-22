import File from "./File";
import Category from "./Category";
import Folder from "./Folder";
import QuickAccess from "./QuickAccess";

// Folder - Folder (subfolder support)
Folder.hasMany(Folder, { foreignKey: 'parentId', as: 'subfolders' });
Folder.belongsTo(Folder, { foreignKey: 'parentId', as: 'parent' });

// Folder - File
Folder.hasMany(File, { foreignKey: 'folderId', as: 'files' });
File.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });

// Category - File
Category.hasMany(File, { foreignKey: 'categoryId', as: 'files' });
File.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// QuickAccess - File
File.hasOne(QuickAccess, {
    foreignKey: 'targetId',
    as: 'quickAccess',
});

QuickAccess.belongsTo(File, {
    foreignKey: 'targetId',
    as: 'file',
});

export default function setupAssociations() { }