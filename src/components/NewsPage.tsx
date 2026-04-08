import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, 
  Calendar, 
  ArrowRight, 
  ChevronLeft,
  Search,
  Filter,
  Clock,
  User,
  Share2,
  Bookmark,
  MessageCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const NewsPage = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const categories = useMemo(() => [
    { id: 'all', label: t.news.categories.all },
    { id: 'ai', label: t.news.categories.ai },
    { id: 'remote', label: t.news.categories.remote },
    { id: 'security', label: t.news.categories.security },
    { id: 'cloud', label: t.news.categories.cloud }
  ], [t]);

  const filteredArticles = useMemo(() => {
    return t.news.items.filter((article: any) => {
      const matchesCategory = selectedCategory === 'all' || article.category === t.news.categories[selectedCategory as keyof typeof t.news.categories];
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [t, selectedCategory, searchQuery]);

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-brand-dark pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-white/60 hover:text-brand-teal transition-colors mb-8 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t.news.backToNews}</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-bold uppercase tracking-wider">
                  {selectedArticle.category}
                </span>
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedArticle.date}</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {selectedArticle.title}
              </h1>
            </div>

            <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 relative group">
              <img 
                src={selectedArticle.image} 
                alt={selectedArticle.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-8">
                <div className="prose prose-invert max-w-none">
                  <p className="text-xl text-white/70 leading-relaxed mb-8 font-medium italic border-l-4 border-brand-teal pl-6">
                    {selectedArticle.excerpt}
                  </p>
                  <div className="text-white/60 text-lg leading-relaxed space-y-6">
                    {selectedArticle.content.split('\n').map((paragraph: string, i: number) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="mt-12 pt-12 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-teal/20 flex items-center justify-center border border-brand-teal/30">
                      <User className="w-6 h-6 text-brand-teal" />
                    </div>
                    <div>
                      <p className="text-white font-bold">Desknet Editorial</p>
                      <p className="text-white/40 text-sm">Tech & Talent Insights</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-brand-teal hover:border-brand-teal/50 transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-brand-teal hover:border-brand-teal/50 transition-all">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 space-y-8">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-brand-teal" />
                    Join the Discussion
                  </h3>
                  <p className="text-white/50 text-sm mb-6">
                    Share your thoughts on this breakthrough and how it impacts your workflow.
                  </p>
                  <button className="w-full py-3 rounded-xl bg-brand-teal text-brand-dark font-bold text-sm hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all">
                    Post a Comment
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest opacity-60">Related Articles</h3>
                  {t.news.items.filter((a: any) => a.id !== selectedArticle.id).slice(0, 2).map((article: any) => (
                    <button
                      key={article.id}
                      onClick={() => {
                        setSelectedArticle(article);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left group"
                    >
                      <div className="aspect-video rounded-2xl overflow-hidden mb-3 border border-white/5">
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <h4 className="text-white font-bold text-sm group-hover:text-brand-teal transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-bold uppercase tracking-widest mb-6"
            >
              <Newspaper className="w-3.5 h-3.5" />
              {t.news.tag}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            >
              {t.news.title} <span className="text-brand-teal italic">{t.news.titleAccent}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/50 leading-relaxed font-medium"
            >
              {t.news.subtitle}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative w-full md:w-80"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-teal/50 focus:bg-white/10 transition-all font-medium"
            />
          </motion.div>
        </div>

        {/* Categories Filter */}
        <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 mr-2">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Filter</span>
          </div>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                selectedCategory === category.id
                  ? 'bg-brand-teal border-brand-teal text-brand-dark shadow-[0_0_20px_rgba(45,212,191,0.3)]'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article: any, index: number) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex flex-col h-full"
              >
                <div 
                  className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-6 border border-white/10 cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-lg bg-brand-teal text-brand-dark text-[10px] font-black uppercase tracking-widest shadow-xl">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-white/40 text-xs font-bold uppercase tracking-widest mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                      {article.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-teal" />
                      5 min read
                    </div>
                  </div>

                  <h3 
                    className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-brand-teal transition-colors cursor-pointer line-clamp-2"
                    onClick={() => setSelectedArticle(article)}
                  >
                    {article.title}
                  </h3>

                  <p className="text-white/50 leading-relaxed mb-8 line-clamp-3 font-medium">
                    {article.excerpt}
                  </p>

                  <div className="mt-auto">
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="flex items-center gap-2 text-brand-teal font-bold text-sm group/btn"
                    >
                      <span>{t.news.readMore}</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredArticles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No articles found</h3>
            <p className="text-white/40">Try adjusting your search or category filter.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
