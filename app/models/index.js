import sequelize from '../../config/database.js';
import User from './User.js';
import UserToken from './UserToken.js';
import Category from './Category.js';
import CategoryTranslation from './Category-translation.js';
import content from './content.js';
import ContentTranslation from './content-translation.js';
import videoViews from './video-views.js';
import pdfDownload from './pdf-download.js';
import LandingPage from './LandingPage.js';
import CustomerDetail from './CustomerDetail.js';

User.hasMany(UserToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserToken.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

content.hasMany(ContentTranslation, { foreignKey: 'content_id', onDelete: 'CASCADE', as: 'content_translations' });
ContentTranslation.belongsTo(content, { foreignKey: 'content_id', onDelete: 'CASCADE' });

// Content.js
content.belongsTo(Category, { as: 'category', foreignKey: 'category_id' });
Category.hasMany(CategoryTranslation, { as: 'category_translations', foreignKey: 'category_id' });
content.belongsTo(Category, { as: 'subcategory', foreignKey: 'subcategory_id' });
Category.hasMany(CategoryTranslation, { as: 'subcategory_translations', foreignKey: 'category_id' });

// video views
videoViews.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
videoViews.belongsTo(content, { foreignKey: 'video_id', onDelete: 'CASCADE' });

// pdf downloads
pdfDownload.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
pdfDownload.belongsTo(content, { foreignKey: 'content_id', onDelete: 'CASCADE' });

content.hasMany(videoViews, { as: 'video_views', foreignKey: 'video_id' });
content.hasMany(pdfDownload, { as: 'pdf_downloads', foreignKey: 'content_id' });
Category.hasMany(content, {foreignKey: 'category_id', as: 'contents'});

Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id'});
Category.hasMany(CategoryTranslation, {as: 'categoryTranslations',foreignKey: 'category_id'});

// Self-referencing association for subcategories
Category.hasMany(Category, { as: 'subcategories', foreignKey: 'parent_id' });

// For Category itself
Category.hasMany(content, { foreignKey: 'category_id', as: 'videos' }); // Non-PDFs
Category.hasMany(content, { foreignKey: 'category_id', as: 'pdfs' });   // PDFs

// For Subcategories
Category.hasMany(content, { foreignKey: 'subcategory_id', as: 'sub_videos' });
Category.hasMany(content, { foreignKey: 'subcategory_id', as: 'sub_pdfs' });


sequelize.sync({ alter: true, force: false }).then(() => {
  console.log('Database synced successfully.');
}).catch((error) => {
  console.error('Error syncing database:', error);
});

export {
  User,
  UserToken,
  Category,
  CategoryTranslation,
  content,
  ContentTranslation,
  videoViews,
  pdfDownload,
  LandingPage,
  CustomerDetail
}