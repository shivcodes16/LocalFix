const mongoose = require('mongoose');
const slugify = require('slugify');

const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      // icon key rendered on the frontend (lucide-react icon name)
      type: String,
      default: 'Wrench',
    },
    subcategories: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

serviceCategorySchema.pre('validate', function generateSlug(next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
