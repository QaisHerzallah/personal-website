import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Course, AppSettings } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Facebook, Instagram, Twitter, Youtube, ExternalLink, Calendar, Clock, User, DollarSign, ListChecks, ChevronDown, ChevronUp } from 'lucide-react';

export default function LinktreePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    centerName: "مركز آتاها التعليمي التربوي",
    socialMedia: []
  });
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    // Fetch settings
    const settingsDoc = doc(db, 'settings', 'global');
    getDoc(settingsDoc).then((docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      }
    });

    // Fetch courses
    const q = query(collection(db, 'courses'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coursesData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Course))
        .filter(c => c.isActive);
      setCourses(coursesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getSocialIcon = (platform: string) => {
    const iconClass = "w-5 h-5 fill-current";
    switch (platform.toLowerCase()) {
      case 'facebook': 
        return (
          <svg className={iconClass} viewBox="0 0 256 256">
            <path d="M232,128a104.16,104.16,0,0,1-91.55,103.26,4,4,0,0,1-4.45-4V152h24a8,8,0,0,0,8-8.53,8.17,8.17,0,0,0-8.25-7.47H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,8-8.53A8.17,8.17,0,0,0,167.73,80H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0-8,8.53A8.17,8.17,0,0,0,96.27,152H120v75.28a4,4,0,0,1-4.44,4A104.15,104.15,0,0,1,24.07,124.09c2-54,45.74-97.9,99.78-100A104.12,104.12,0,0,1,232,128Z"></path>
          </svg>
        );
      case 'instagram': 
        return (
          <svg className={iconClass} viewBox="0 0 256 256">
            <path d="M176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24ZM128,176a48,48,0,1,1,48-48A48.05,48.05,0,0,1,128,176Zm60-96a12,12,0,1,1,12-12A12,12,0,0,1,188,80Zm-28,48a32,32,0,1,1-32-32A32,32,0,0,1,160,128Z"></path>
          </svg>
        );
      case 'youtube': 
        return (
          <svg className={iconClass} viewBox="0 0 256 256">
            <path d="M234.33,69.52a24,24,0,0,0-14.49-16.4C185.56,39.88,131,40,128,40s-57.56-.12-91.84,13.12a24,24,0,0,0-14.49,16.4C19.08,79.5,16,97.74,16,128s3.08,48.5,5.67,58.48a24,24,0,0,0,14.49,16.41C69,215.56,120.4,216,127.34,216h1.32c6.94,0,58.37-.44,91.18-13.11a24,24,0,0,0,14.49-16.41c2.59-10,5.67-28.22,5.67-58.48S236.92,79.5,234.33,69.52Zm-73.74,65-40,28A8,8,0,0,1,108,156V100a8,8,0,0,1,12.59-6.55l40,28a8,8,0,0,1,0,13.1Z"></path>
          </svg>
        );
      case 'telegram': 
        return (
          <svg className={iconClass} viewBox="0 0 256 256">
            <path d="M228.88,26.19a9,9,0,0,0-9.16-1.57L17.06,103.93a14.22,14.22,0,0,0,2.43,27.21L72,141.45V200a15.92,15.92,0,0,0,10,14.83,15.91,15.91,0,0,0,17.51-3.73l25.32-26.26L165,220a15.88,15.88,0,0,0,10.51,4,16.3,16.3,0,0,0,5-.79,15.85,15.85,0,0,0,10.67-11.63L231.77,35A9,9,0,0,0,228.88,26.19ZM175.53,208,92.85,135.5l119-85.29Z"></path>
          </svg>
        );
      case 'whatsapp': 
        return (
          <svg className={iconClass} viewBox="0 0 256 256">
            <path d="M152.58,145.23l23,11.48A24,24,0,0,1,152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155ZM232,128A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-40,24a8,8,0,0,0-4.42-7.16l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88A40,40,0,0,0,192,152Z"></path>
          </svg>
        );
      default: return <ExternalLink className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-ataha-navy border-t-ataha-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden" dir="rtl">
      {/* Header Section */}
      <header className="pt-12 pb-8 px-4 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-ataha-navy rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white overflow-hidden"
        >
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-2xl">logo</span>
          )}
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-ataha-navy text-center mb-4"
        >
          {settings.centerName}
        </motion.h1>

        <div className="flex gap-3 mb-10 overflow-x-auto max-w-full px-4 no-scrollbar">
          {settings.socialMedia.map((social, index) => (
            <motion.a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-ataha-navy text-white p-1.5 rounded-full hover:bg-ataha-blue-light transition-colors shadow-md active:scale-95"
              title={social.platform}
            >
              {getSocialIcon(social.platform)}
            </motion.a>
          ))}
        </div>
      </header>

      {/* Courses Section */}
      <main className="max-w-xl mx-auto px-4 space-y-6">
        {courses.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p>لا توجد دورات متاحة حالياً</p>
          </div>
        ) : (
          courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
            >
              {/* Header colored bar */}
              <div className="bg-gradient-to-l from-ataha-blue-light to-ataha-navy p-6 flex flex-col md:flex-row md:items-center relative">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{course.name}</h3>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">
                    {course.description}
                  </p>
                  <div className="md:hidden text-xs text-ataha-gold font-medium mb-3">المقدم: {course.instructor}</div>
                </div>

                <div className="hidden md:flex mt-4 md:mt-0 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 flex-col gap-1 items-end min-w-[140px]">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>المقدم</span>
                  </div>
                  <span className="text-sm font-medium text-white">{course.instructor}</span>
                </div>
              </div>

              {/* Details and Topics */}
              <div className="p-6">
                <div 
                  className="grid grid-cols-2 gap-6 mb-4 cursor-pointer"
                  onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-ataha-green/10 rounded-lg text-ataha-green">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 leading-none">السعر</span>
                      <span className="text-sm font-semibold">{course.price}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-ataha-gold/10 rounded-lg text-ataha-gold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 leading-none">التاريخ</span>
                      <span className="text-sm font-semibold">{course.startDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-ataha-navy/10 rounded-lg text-ataha-navy">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 leading-none">الموعد</span>
                      <span className="text-sm font-semibold">{course.startTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 leading-none">الفئة المستهدفة</span>
                      <span className="text-sm font-semibold truncate max-w-[120px]" title={course.targetAudience}>{course.targetAudience || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>

                {/* Topics Accordion */}
                <div className="mt-6">
                  <div 
                    className="flex items-center justify-between text-ataha-green font-semibold mb-3 cursor-pointer"
                    onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                  >
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-5 h-5" />
                      <span>محاور الدورة</span>
                    </div>
                    {expandedCourse === course.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>

                  <AnimatePresence>
                    {expandedCourse === course.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-6"
                      >
                        <div className="space-y-3 pt-2">
                          {course.topics.map((topic, i) => (
                            <div key={i} className="flex gap-3 items-start group">
                              <span className="mt-0.5 w-5 h-5 bg-ataha-green text-white text-[10px] flex items-center justify-center rounded-md font-bold shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-sm text-slate-600 group-hover:text-ataha-navy transition-colors leading-relaxed">
                                {topic}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Register Button */}
                  {course.registrationUrl && (
                    <motion.a
                      href={course.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full bg-ataha-navy text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg hover:bg-ataha-blue-light transition-all active:scale-95"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>{course.registrationButtonText || 'التسجيل في الدورة'}</span>
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </main>

      {/* Footer Branding */}
      <footer className="mt-20 py-10 border-t border-slate-200">
        <div className="max-w-xl mx-auto px-4 flex flex-col items-center gap-8">
          {settings.mapEmbedUrl && (
            <div className="w-full h-64 rounded-3xl overflow-hidden shadow-lg border border-slate-100 mb-8">
              <iframe 
                src={settings.mapEmbedUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              ></iframe>
            </div>
          )}
          
          <p className="text-slate-400 text-xs">جميع الحقوق محفوظة {new Date().getFullYear()} © مركز آتاها التعليمي</p>
          <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-ataha-navy"></div>
             <div className="w-2 h-2 rounded-full bg-ataha-green"></div>
             <div className="w-2 h-2 rounded-full bg-ataha-gold"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
