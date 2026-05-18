import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Course, AppSettings } from '../types';
import { 
  Plus, Trash2, Edit2, Save, X, Eye, EyeOff, LayoutGrid, 
  Settings as SettingsIcon, LogOut, ChevronRight, ListPlus, 
  ChevronUp, ChevronDown, Menu, Facebook, Instagram, Twitter, 
  Youtube, Send, MessageCircle, Link as LinkIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ADMIN_PASSWORD = "123";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'courses' | 'settings'>('courses');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingSocialUrlIndex, setEditingSocialUrlIndex] = useState<number | null>(null);
  
  // Schedule builder helpers
  const DAYS = [
    { label: 'السبت', value: 'س' },
    { label: 'الأحد', value: 'أ' },
    { label: 'الاثنين', value: 'ن' },
    { label: 'الثلاثاء', value: 'ث' },
    { label: 'الأربعاء', value: 'ر' },
    { label: 'الخميس', value: 'خ' },
    { label: 'الجمعة', value: 'ج' },
  ];
  
  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState<AppSettings>({
    centerName: "مركز آتاها التعليمي التربوي",
    socialMedia: []
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    // Load courses
    const q = query(collection(db, 'courses'), orderBy('order', 'asc'));
    const unsubscribeCourses = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
    });

    // Load settings
    const settingsDoc = doc(db, 'settings', 'global');
    getDoc(settingsDoc).then(docSnap => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      }
    });

    return () => unsubscribeCourses();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
    } else {
      alert('كلمة مرور خاطئة');
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const courseId = editingCourse.id || doc(collection(db, 'courses')).id;
    const finalCourse = {
      ...editingCourse,
      id: courseId,
      order: editingCourse.order ?? courses.length,
      isActive: editingCourse.isActive ?? true,
      topics: editingCourse.topics || []
    } as Course;

    await setDoc(doc(db, 'courses', courseId), finalCourse);
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
      await deleteDoc(doc(db, 'courses', id));
    }
  };

  const getSocialIcon = (platform: string) => {
    const iconClass = "w-5 h-5";
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className={iconClass} />;
      case 'instagram': return <Instagram className={iconClass} />;
      case 'twitter': return <Twitter className={iconClass} />;
      case 'youtube': return <Youtube className={iconClass} />;
      case 'telegram': return <Send className={iconClass} />;
      case 'whatsapp': return <MessageCircle className={iconClass} />;
      default: return <LinkIcon className={iconClass} />;
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await setDoc(doc(db, 'settings', 'global'), settings);
    alert('تم حفظ الإعدادات بنجاح');
  };

  const handleMoveCourse = async (index: number, direction: 'up' | 'down') => {
    const newCourses = [...courses];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newCourses.length) return;
    
    // Swap order values
    const currentCourse = newCourses[index];
    const targetCourse = newCourses[targetIndex];

    const currentOrder = currentCourse.order;
    const targetOrder = targetCourse.order;
    
    await Promise.all([
      updateDoc(doc(db, 'courses', currentCourse.id), { order: targetOrder }),
      updateDoc(doc(db, 'courses', targetCourse.id), { order: currentOrder })
    ]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-ataha-navy rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <LogOut className="text-white w-8 h-8 rotate-180" />
            </div>
            <h1 className="text-2xl font-bold text-ataha-navy">لوحة التحكم</h1>
            <p className="text-slate-400 text-sm mt-2">يرجى إدخال كلمة المرور للمتابعة</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ataha-navy transition-all"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-ataha-navy text-white font-bold py-3 rounded-xl hover:bg-ataha-blue-light transition-all shadow-md active:scale-95"
            >
              دخول
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" dir="rtl">
      {/* Mobile Header */}
      <div className="md:hidden bg-ataha-navy text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <h2 className="font-bold">لوحة التحكّم</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-ataha-navy text-white flex flex-col shadow-xl z-50 transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold border-b border-white/10 pb-4 mb-4 hidden md:block">لوحة التحكّم</h2>
          <nav className="space-y-2">
            <button 
              onClick={() => { setActiveTab('courses'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'courses' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span>إدارة الدورات</span>
            </button>
            <button 
              onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <SettingsIcon className="w-5 h-5" />
              <span>الإعدادات العامة</span>
            </button>
          </nav>
        </div>
        <div className="mt-auto p-6">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'courses' ? (
            <motion.div
              key="courses"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-ataha-navy">الدورات التدريبية</h1>
                  <p className="text-slate-500 text-sm">إضافة وتعديل الدورات المعروضة في الصفحة الرئيسية</p>
                </div>
                <button 
                  onClick={() => setEditingCourse({ name: '', description: '', instructor: '', price: '', startDate: '', startTime: '', topics: [], isActive: true, order: courses.length, targetAudience: '', registrationUrl: '', registrationButtonText: '' })}
                  className="bg-ataha-green text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-ataha-green/90 transition-all font-bold"
                >
                  <Plus className="w-5 h-5" />
                  <span>دورة جديدة</span>
                </button>
              </div>

              {/* Courses List */}
              <div className="grid gap-4">
                {courses.map((course, index) => (
                  <div key={course.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => handleMoveCourse(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-ataha-navy disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleMoveCourse(index, 'down')}
                        disabled={index === courses.length - 1}
                        className="p-1 text-slate-400 hover:text-ataha-navy disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-ataha-navy">{course.name}</h3>
                      <p className="text-slate-400 text-sm line-clamp-1">{course.description}</p>
                    </div>
                    <div className="hidden md:flex flex-col items-end text-sm text-slate-500">
                      <span>{course.instructor}</span>
                      <span className="font-readex">{course.price}</span>
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => updateDoc(doc(db, 'courses', course.id), { isActive: !course.isActive })}
                        className={`p-2 rounded-lg transition-colors ${course.isActive ? 'text-ataha-green bg-ataha-green/10' : 'text-slate-300 bg-slate-100'}`}
                        title={course.isActive ? "نشط" : "مخفي"}
                      >
                        {course.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => setEditingCourse(course)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-ataha-navy">الإعدادات العامة</h1>
                <p className="text-slate-500">تخصيص معلومات المركز وروابط التواصل</p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رابط الشعار (Logo URL)</label>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={settings.logoUrl || ''}
                        onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-ataha-navy"
                      />
                    </div>
                    {settings.logoUrl && (
                      <div className="w-12 h-12 bg-ataha-navy rounded-lg flex items-center justify-center p-2 border border-slate-200">
                        <img src={settings.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اسم المركز</label>
                  <input
                    type="text"
                    value={settings.centerName}
                    onChange={(e) => setSettings({ ...settings, centerName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-ataha-navy"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 border-b pb-2 block">روابط التواصل</label>
                  {settings.socialMedia.map((social, index) => (
                    <div key={index} className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl">
                      <div className="flex gap-2 items-center">
                        <div className="flex flex-col gap-0.5">
                          <button 
                            type="button"
                            onClick={() => {
                              if (index === 0) return;
                              const newSocial = [...settings.socialMedia];
                              [newSocial[index - 1], newSocial[index]] = [newSocial[index], newSocial[index - 1]];
                              setSettings({ ...settings, socialMedia: newSocial });
                            }}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-ataha-navy disabled:opacity-20"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              if (index === settings.socialMedia.length - 1) return;
                              const newSocial = [...settings.socialMedia];
                              [newSocial[index + 1], newSocial[index]] = [newSocial[index], newSocial[index + 1]];
                              setSettings({ ...settings, socialMedia: newSocial });
                            }}
                            disabled={index === settings.socialMedia.length - 1}
                            className="p-1 text-slate-400 hover:text-ataha-navy disabled:opacity-20"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Platform Selector */}
                        <div className="relative group">
                          <div className="md:hidden flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-lg text-ataha-navy">
                            {getSocialIcon(social.platform)}
                          </div>
                          <select 
                            value={social.platform}
                            onChange={(e) => {
                              const newSocial = [...settings.socialMedia];
                              newSocial[index].platform = e.target.value;
                              setSettings({ ...settings, socialMedia: newSocial });
                            }}
                            className="absolute inset-0 opacity-0 md:opacity-100 md:relative md:w-auto px-3 py-2 rounded-lg bg-white border border-slate-200 cursor-pointer text-sm font-medium"
                          >
                            <option value="Facebook">Facebook</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Twitter">Twitter</option>
                            <option value="Youtube">Youtube</option>
                            <option value="Telegram">Telegram</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Other">Other</option>
                          </select>
                          <div className="hidden md:block pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
                            {/* Desktop custom arrow logic could go here if needed, but select is fine */}
                          </div>
                        </div>

                        {/* URL Input / Edit Button */}
                        <div className="flex-1 flex gap-2">
                          <input
                            type="url"
                            placeholder="الرابط (URL)"
                            value={social.url}
                            onChange={(e) => {
                              const newSocial = [...settings.socialMedia];
                              newSocial[index].url = e.target.value;
                              setSettings({ ...settings, socialMedia: newSocial });
                            }}
                            className={`${editingSocialUrlIndex === index ? 'flex' : 'hidden md:flex'} flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm`}
                          />
                          {!editingSocialUrlIndex || editingSocialUrlIndex !== index ? (
                            <button 
                              type="button"
                              onClick={() => setEditingSocialUrlIndex(index)}
                              className="md:hidden flex-1 bg-white border border-slate-200 rounded-lg py-2 text-sm text-slate-500 font-medium"
                            >
                              تعديل الرابط
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => setEditingSocialUrlIndex(null)}
                              className="md:hidden bg-ataha-navy text-white rounded-lg px-4 py-2 text-xs"
                            >
                              تم
                            </button>
                          )}
                        </div>

                        <button 
                          type="button"
                          onClick={() => {
                            if (window.confirm('حذف هذا الرابط؟')) {
                              const newSocial = settings.socialMedia.filter((_, i) => i !== index);
                              setSettings({ ...settings, socialMedia: newSocial });
                            }
                          }}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => setSettings({ ...settings, socialMedia: [...settings.socialMedia, { platform: 'Facebook', url: '' }] })}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-ataha-navy hover:border-ataha-navy transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>إضافة وسيلة تواصل</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رابط خريطة جوجل (Google Maps Embed URL)</label>
                  <input
                    type="text"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    value={settings.mapEmbedUrl || ''}
                    onChange={(e) => setSettings({ ...settings, mapEmbedUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-ataha-navy"
                  />
                  <p className="text-[10px] text-slate-400">انسخ رابط "src" من كود التضمين (Embed code) في خرائط جوجل</p>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-ataha-navy text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Save className="w-5 h-5" />
                    <span>حفظ كافة التغييرات</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Edit Course Modal */}
      <AnimatePresence>
        {editingCourse && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ataha-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingCourse(null)}
                className="absolute left-8 top-8 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-ataha-navy mb-8 border-b pb-4">
                {editingCourse.id ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
              </h2>

              <form onSubmit={handleSaveCourse} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">اسم الدورة</label>
                    <input
                      required
                      type="text"
                      placeholder="مثلًا: التربية الجنسية"
                      value={editingCourse.name || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">مقدم الدورة</label>
                    <input
                      required
                      type="text"
                      placeholder="مثلًا: علي القواسمه"
                      value={editingCourse.instructor || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الفئة المستهدفة</label>
                  <input
                    type="text"
                    placeholder="مثلًا: المعلمون والمعلمات والأهالي"
                    value={editingCourse.targetAudience || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, targetAudience: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">وصف قصير</label>
                  <textarea
                    rows={2}
                    value={editingCourse.description || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="bg-slate-50 p-4 md:p-6 rounded-3xl border border-slate-100 flex flex-col gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">رابط التسجيل</label>
                    <input
                      type="url"
                      placeholder="أدخل رابط التسجيل (مثلاً: Google Form أو أي رابط آخر)..."
                      value={editingCourse.registrationUrl || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, registrationUrl: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-ataha-navy/20 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700">نص زر التسجيل</label>
                      <span className="text-[10px] text-slate-400">افتراضي: التسجيل في الدورة</span>
                    </div>
                    <input
                      type="text"
                      placeholder="مثلًا: انضم إلينا الآن"
                      value={editingCourse.registrationButtonText || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, registrationButtonText: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-ataha-navy/20 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700">السعر</label>
                  <div className="bg-slate-50 p-4 md:p-6 rounded-3xl border border-slate-100 flex flex-col gap-6">
                    {/* Price Parser Logic */}
                    {(() => {
                      const price = editingCourse.price || '';
                      const jdMatch = price.match(/^(\d+)/);
                      const usdMatch = price.match(/\((\d+)\$\)/);
                      const jdVal = jdMatch ? jdMatch[1] : '';
                      const usdVal = usdMatch ? usdMatch[1] : '';

                      const updatePriceStr = (newJd: string, newUsd: string) => {
                        let final = '';
                        if (newJd) {
                          final = `${newJd} دينار أردني`;
                          if (newUsd) {
                            final += ` (${newUsd}$)`;
                          }
                        } else if (newUsd) {
                          final = `(${newUsd}$)`;
                        }
                        setEditingCourse({ ...editingCourse, price: final });
                      };

                      return (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-2">
                              <span className="text-xs text-slate-400 block font-medium text-right">المبلغ بالدينار الأردني:</span>
                              <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-ataha-navy/20 transition-all h-[46px]">
                                <input
                                  type="number"
                                  placeholder="مثلًا: 150"
                                  value={jdVal}
                                  onChange={(e) => updatePriceStr(e.target.value, usdVal)}
                                  className="flex-1 px-4 py-2 text-sm focus:outline-none text-right bg-transparent min-w-0 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <div className="flex items-center px-3 border-r border-slate-100 bg-slate-50 shrink-0">
                                  <span className="text-[10px] text-slate-400 font-bold">د.أ</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-xs text-slate-400 block font-medium text-right">المبلغ بالدّولار (اختياري):</span>
                              <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-ataha-navy/20 transition-all h-[46px]">
                                <input
                                  type="number"
                                  placeholder={jdVal ? `تقريبًا: ${Math.round(Number(jdVal) * 1.41)}` : "مثلًا: 210"}
                                  value={usdVal}
                                  onChange={(e) => updatePriceStr(jdVal, e.target.value)}
                                  className="flex-1 px-4 py-2 text-sm focus:outline-none text-right bg-transparent min-w-0 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <div className="flex items-center px-3 border-r border-slate-100 bg-slate-50 shrink-0">
                                  <span className="text-[10px] text-slate-400 font-bold">$</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-slate-200 mt-6">
                            <span className="text-xs text-slate-400 block mb-2 font-medium">الشكل النهائي:</span>
                            <div className="text-lg font-bold text-ataha-navy bg-white px-4 py-4 rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center">
                              {editingCourse.price || '---'}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700">الموعد</label>
                  <div className="bg-slate-50 p-4 md:p-6 rounded-3xl border border-slate-100 flex flex-col gap-6 md:gap-8">
                    {/* Helper to parse schedule string */}
                    {(() => {
                      const startTime = editingCourse.startTime || '';
                      let daysPart = '';
                      let timePart = '';
                      
                      if (startTime.includes(' | ')) {
                        [daysPart, timePart] = startTime.split(' | ');
                      } else {
                        // Guess logic: if it has digits or colons, it's likely time
                        if (/\d|:/.test(startTime)) {
                          timePart = startTime;
                        } else {
                          daysPart = startTime;
                        }
                      }

                      const selectedDays = daysPart === 'يوميًّا' 
                        ? DAYS.map(d => d.value) 
                        : (DAYS.find(d => d.label === daysPart) ? [DAYS.find(d => d.label === daysPart)!.value] : daysPart.split(' ').filter(Boolean));

                      return (
                        <>
                          <div className="space-y-2">
                            <span className="text-xs text-slate-400 block font-medium text-right">تاريخ البدء:</span>
                            <input
                              type="text"
                              placeholder="مثلًا: 1 يونيو"
                              value={editingCourse.startDate || ''}
                              onChange={(e) => setEditingCourse({ ...editingCourse, startDate: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-ataha-navy/20 bg-white"
                            />
                          </div>

                          <div className="w-full">
                            <span className="text-xs text-slate-400 block mb-3 font-medium text-right">الأيام:</span>
                            <div className="flex flex-wrap gap-2" dir="rtl">
                              {DAYS.map((day) => {
                                const isSelected = selectedDays.includes(day.value);
                                return (
                                  <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => {
                                      let newSelectedDays = [...selectedDays];
                                      if (isSelected) {
                                        newSelectedDays = newSelectedDays.filter(v => v !== day.value);
                                      } else {
                                        newSelectedDays.push(day.value);
                                      }
                                      
                                      // Sort and format days part
                                      const sorted = DAYS.filter(d => newSelectedDays.includes(d.value));
                                      let newDaysPart = '';
                                      if (sorted.length === DAYS.length) {
                                        newDaysPart = 'يوميًّا';
                                      } else if (sorted.length === 1) {
                                        newDaysPart = sorted[0].label;
                                      } else {
                                        newDaysPart = sorted.map(d => d.value).join(' ');
                                      }

                                      const final = [newDaysPart, timePart].filter(Boolean).join(' | ');
                                      setEditingCourse({ ...editingCourse, startTime: final });
                                    }}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                                      isSelected 
                                        ? 'bg-ataha-navy text-white border-ataha-navy shadow-lg ring-2 ring-ataha-navy/20 scale-105' 
                                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 shadow-sm'
                                    }`}
                                  >
                                    {day.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                              {/* Start Time */}
                              <div className="space-y-2">
                                <span className="text-xs text-slate-400 block font-medium">وقت البدء</span>
                                <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-ataha-navy/20 transition-all h-[46px]">
                                  <input
                                    type="text"
                                    placeholder="6:00"
                                    value={timePart.split(' - ')[0]?.replace(/[صم]/g, '') || ''}
                                    onChange={(e) => {
                                      const oldTimeParts = timePart.split(' - ');
                                      const oldStart = oldTimeParts[0] || '';
                                      const suffix = oldStart.includes('ص') ? 'ص' : (oldStart.includes('م') ? 'م' : 'م');
                                      const newStartRaw = `${e.target.value}${suffix}`;
                                      const newTimePart = `${newStartRaw}${oldTimeParts[1] ? ' - ' + oldTimeParts[1] : ''}`;
                                      const final = [daysPart, newTimePart].filter(Boolean).join(' | ');
                                      setEditingCourse({ ...editingCourse, startTime: final });
                                    }}
                                    className="flex-1 px-4 py-2 text-sm focus:outline-none text-right bg-transparent min-w-0"
                                  />
                                  <div className="flex border-r border-slate-100 bg-slate-50 shrink-0">
                                    {['ص', 'م'].map((s) => {
                                      const currentSuffix = (timePart.split(' - ')[0] || '').includes('ص') ? 'ص' : ((timePart.split(' - ')[0] || '').includes('م') ? 'م' : 'م');
                                      const active = currentSuffix === s;
                                      return (
                                        <button
                                          key={s}
                                          type="button"
                                          onClick={() => {
                                            const oldTimeParts = timePart.split(' - ');
                                            const val = (oldTimeParts[0] || '').replace(/[صم]/g, '');
                                            const newStartRaw = `${val}${s}`;
                                            const newTimePart = `${newStartRaw}${oldTimeParts[1] ? ' - ' + oldTimeParts[1] : ''}`;
                                            const final = [daysPart, newTimePart].filter(Boolean).join(' | ');
                                            setEditingCourse({ ...editingCourse, startTime: final });
                                          }}
                                          className={`w-10 flex items-center justify-center text-xs font-bold transition-all ${active ? 'bg-ataha-navy text-white shadow-sm' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                                        >
                                          {s}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* End Time */}
                              <div className="space-y-2">
                                <span className="text-xs text-slate-400 block font-medium">وقت الانتهاء</span>
                                <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-ataha-navy/20 transition-all h-[46px]">
                                  <input
                                    type="text"
                                    placeholder="7:30"
                                    value={timePart.split(' - ')[1]?.replace(/[صم]/g, '') || ''}
                                    onChange={(e) => {
                                      const oldTimeParts = timePart.split(' - ');
                                      const oldEnd = oldTimeParts[1] || '';
                                      const suffix = oldEnd.includes('ص') ? 'ص' : (oldEnd.includes('م') ? 'م' : 'م');
                                      const newEndRaw = `${e.target.value}${suffix}`;
                                      const newTimePart = `${oldTimeParts[0] ? oldTimeParts[0] + ' - ' : ''}${newEndRaw}`;
                                      const final = [daysPart, newTimePart].filter(Boolean).join(' | ');
                                      setEditingCourse({ ...editingCourse, startTime: final });
                                    }}
                                    className="flex-1 px-4 py-2 text-sm focus:outline-none text-right bg-transparent min-w-0"
                                  />
                                  <div className="flex border-r border-slate-100 bg-slate-50 shrink-0">
                                    {['ص', 'م'].map((s) => {
                                      const currentSuffix = (timePart.split(' - ')[1] || '').includes('ص') ? 'ص' : ((timePart.split(' - ')[1] || '').includes('م') ? 'م' : 'م');
                                      const active = currentSuffix === s;
                                      return (
                                        <button
                                          key={s}
                                          type="button"
                                          onClick={() => {
                                            const oldTimeParts = timePart.split(' - ');
                                            const val = (oldTimeParts[1] || '').replace(/[صم]/g, '');
                                            const newEndRaw = `${val}${s}`;
                                            const newTimePart = `${oldTimeParts[0] ? oldTimeParts[0] + ' - ' : ''}${newEndRaw}`;
                                            const final = [daysPart, newTimePart].filter(Boolean).join(' | ');
                                            setEditingCourse({ ...editingCourse, startTime: final });
                                          }}
                                          className={`w-10 flex items-center justify-center text-xs font-bold transition-all ${active ? 'bg-ataha-navy text-white shadow-sm' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                                        >
                                          {s}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="pt-6 border-t border-slate-200 mt-6">
                              <span className="text-xs text-slate-400 block mb-2 font-medium">المعاينة النهائية:</span>
                              <div className="text-lg font-bold text-ataha-navy bg-white px-4 py-4 rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center">
                                {startTime || '---'}
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 border-b pb-2 block">محاور الدورة</label>
                  <div className="space-y-3">
                    {editingCourse.topics?.map((topic, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <div className="flex flex-col gap-0.5">
                          <button 
                            type="button"
                            onClick={() => {
                              if (i === 0) return;
                              const newTopics = [...(editingCourse.topics || [])];
                              [newTopics[i - 1], newTopics[i]] = [newTopics[i], newTopics[i - 1]];
                              setEditingCourse({ ...editingCourse, topics: newTopics });
                            }}
                            disabled={i === 0}
                            className="p-1 text-slate-300 hover:text-ataha-navy disabled:opacity-20"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              if (i === (editingCourse.topics || []).length - 1) return;
                              const newTopics = [...(editingCourse.topics || [])];
                              [newTopics[i + 1], newTopics[i]] = [newTopics[i], newTopics[i + 1]];
                              setEditingCourse({ ...editingCourse, topics: newTopics });
                            }}
                            disabled={i === (editingCourse.topics || []).length - 1}
                            className="p-1 text-slate-300 hover:text-ataha-navy disabled:opacity-20"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400">{i + 1}</span>
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => {
                            const newTopics = [...(editingCourse.topics || [])];
                            newTopics[i] = e.target.value;
                            setEditingCourse({ ...editingCourse, topics: newTopics });
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-ataha-navy/10"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const newTopics = (editingCourse.topics || []).filter((_, idx) => idx !== i);
                            setEditingCourse({ ...editingCourse, topics: newTopics });
                          }}
                          className="p-2 text-red-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => setEditingCourse({ ...editingCourse, topics: [...(editingCourse.topics || []), ''] })}
                      className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-slate-300 hover:text-ataha-green hover:border-ataha-green transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>إضافة محور</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit"
                    className="flex-1 bg-ataha-navy text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all"
                  >
                    حفظ الدورة
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl active:scale-95 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
