import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getBlogs()
      .then(res => setBlogs(res.results || res))
      .catch(err => console.error("Failed to load blogs", err))
      .finally(() => setLoading(false));
  }, []);

  const handleBack = () => {
    setSelectedBlog(null);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-24 pb-32">
        <div className="w-8 h-8 border-4 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (selectedBlog) {
    return (
      <div className="flex-1 pt-24 pb-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#111111] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all articles
          </button>

          {selectedBlog.image && (
            <div className="w-full aspect-video rounded-3xl overflow-hidden mb-10 shadow-lg">
              <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" />
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#111111] leading-[1.1] mb-6">
            {selectedBlog.title}
          </h1>

          <div className="flex items-center gap-6 text-sm font-semibold text-slate-500 mb-12 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(selectedBlog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            {selectedBlog.tags && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {selectedBlog.tags}
              </div>
            )}
          </div>

          <div 
            className="prose prose-lg prose-slate max-w-none font-medium text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedBlog.content) }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-24 pb-32 bg-[#F3F3F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-16">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#111111] mb-4">
            Studio News & Insights
          </h1>
          <p className="text-lg font-medium text-slate-500">
            Discover the latest production tips, equipment reviews, and studio updates from the creators at Studio Floor.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-500 font-bold">No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <div 
                key={blog.id} 
                onClick={() => setSelectedBlog(blog)}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {blog.image ? (
                  <div className="w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center p-8 text-center">
                    <span className="font-bold text-slate-300 text-lg">{blog.title}</span>
                  </div>
                )}
                
                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  {blog.tags && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3 block">
                      {blog.tags.split(',')[0]}
                    </span>
                  )}
                  
                  <h3 className="text-xl font-bold text-[#111111] mb-3 leading-snug line-clamp-2">
                    {blog.title}
                  </h3>
                  
                  {/* Extract a short snippet from the HTML content to use as a description */}
                  <p className="text-sm font-medium text-slate-500 line-clamp-3 mb-6 flex-1">
                    {blog.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                  </p>
                  
                  <div className="text-xs font-bold text-slate-400">
                    {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
