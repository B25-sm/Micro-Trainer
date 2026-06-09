import { motion } from "framer-motion";

const CATEGORY_ICONS = {
  fullstack: "🧩",
  data_science: "📊",
  data_analyst: "📈",
  ai_ml: "🤖",
};

export default function CategoryModal({ categories, onSelect, open }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#292a2d] border border-gray-200 dark:border-gray-700 shadow-xl p-6"
        role="dialog"
        aria-labelledby="category-modal-title"
      >
        <h2
          id="category-modal-title"
          className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-1"
        >
          Which track are you preparing for?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          We'll tailor your interview roadmap and skill check to this category.
        </p>

        <div className="space-y-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-left transition flex gap-3 items-start"
            >
              <span className="text-2xl">{CATEGORY_ICONS[cat.id] || "🎯"}</span>
              <span>
                <span className="font-medium text-gray-900 dark:text-gray-100 block">
                  {cat.label}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {cat.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
