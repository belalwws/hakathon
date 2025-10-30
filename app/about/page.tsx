'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'
import { AnimatedSection } from '@/components/animated-section'
import { HoverCard } from '@/components/hover-card'
import { BackgroundAnimations } from '@/components/background-animations'
import { OptimizedImage } from '@/components/optimized-image'
import { AnimatedCounter } from '@/components/advanced-animations'
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Award, 
  Rocket,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react'

export default function AboutPage() {
  const { t, language } = useLanguage()

  const teamMembers = [
    {
      name: language === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed',
      role: language === 'ar' ? 'المؤسس والرئيس التنفيذي' : 'Founder & CEO',
      image: 'https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=6366f1&color=fff&size=200',
      bio: language === 'ar' 
        ? 'خبرة 10+ سنوات في تطوير منصات المسابقات التقنية'
        : '10+ years experience in hackathon platform development'
    },
    {
      name: language === 'ar' ? 'سارة أحمد' : 'Sara Ahmed',
      role: language === 'ar' ? 'المديرة التقنية' : 'CTO',
      image: 'https://ui-avatars.com/api/?name=Sara+Ahmed&background=8b5cf6&color=fff&size=200',
      bio: language === 'ar'
        ? 'متخصصة في بناء أنظمة قابلة للتوسع والأمن السيبراني'
        : 'Specialist in building scalable systems and cybersecurity'
    },
    {
      name: language === 'ar' ? 'محمد علي' : 'Mohamed Ali',
      role: language === 'ar' ? 'مدير المنتج' : 'Product Manager',
      image: 'https://ui-avatars.com/api/?name=Mohamed+Ali&background=ec4899&color=fff&size=200',
      bio: language === 'ar'
        ? 'خبير في تجربة المستخدم وتصميم المنتجات'
        : 'Expert in user experience and product design'
    },
    {
      name: language === 'ar' ? 'فاطمة حسن' : 'Fatima Hassan',
      role: language === 'ar' ? 'مديرة التسويق' : 'Marketing Director',
      image: 'https://ui-avatars.com/api/?name=Fatima+Hassan&background=f59e0b&color=fff&size=200',
      bio: language === 'ar'
        ? 'متخصصة في النمو الرقمي واستراتيجيات التسويق'
        : 'Specialist in digital growth and marketing strategies'
    }
  ]

  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      title: language === 'ar' ? 'الابتكار' : 'Innovation',
      description: language === 'ar' 
        ? 'نسعى دائماً لتقديم حلول مبتكرة تواكب أحدث التقنيات'
        : 'We always strive to provide innovative solutions with latest technologies',
      color: 'indigo'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: language === 'ar' ? 'الشغف' : 'Passion',
      description: language === 'ar'
        ? 'نحب ما نفعله ونسعى للتميز في كل تفصيلة'
        : 'We love what we do and strive for excellence in every detail',
      color: 'pink'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: language === 'ar' ? 'المجتمع' : 'Community',
      description: language === 'ar'
        ? 'نبني مجتمع قوي من المطورين والمبدعين'
        : 'We build a strong community of developers and creators',
      color: 'purple'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: language === 'ar' ? 'الجودة' : 'Quality',
      description: language === 'ar'
        ? 'نلتزم بأعلى معايير الجودة في جميع خدماتنا'
        : 'We commit to the highest quality standards in all our services',
      color: 'amber'
    }
  ]

  const stats = [
    { number: '50K+', label: language === 'ar' ? 'مستخدم نشط' : 'Active Users' },
    { number: '1000+', label: language === 'ar' ? 'مسابقة' : 'Hackathons' },
    { number: '150+', label: language === 'ar' ? 'منظمة' : 'Organizations' },
    { number: '95%', label: language === 'ar' ? 'رضا العملاء' : 'Client Satisfaction' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 transition-colors">
      <BackgroundAnimations />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection direction="fade">
            <div className="text-center max-w-4xl mx-auto">
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {language === 'ar' ? 'من نحن' : 'About Us'}
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {language === 'ar' 
                  ? 'نساعد المنظمات على تنظيم وإدارة المسابقات التقنية بكفاءة وسهولة'
                  : 'We help organizations manage hackathons efficiently and easily'}
              </motion.p>
            </div>
          </AnimatedSection>

          {/* Stats */}
          <AnimatedSection delay={0.4}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <AnimatedSection direction="left">
              <HoverCard>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-12 rounded-3xl shadow-2xl text-white h-full">
                  <Target className="h-16 w-16 mb-6" />
                  <h2 className="text-4xl font-bold mb-6">
                    {language === 'ar' ? 'مهمتنا' : 'Our Mission'}
                  </h2>
                  <p className="text-xl leading-relaxed opacity-90">
                    {language === 'ar'
                      ? 'توفير منصة شاملة ومتطورة تمكن المنظمات من إطلاق وإدارة المسابقات التقنية بسلاسة، وتساعد المشاركين على إظهار مهاراتهم وإبداعاتهم'
                      : 'Provide a comprehensive platform that enables organizations to launch and manage hackathons smoothly, and helps participants showcase their skills and creativity'}
                  </p>
                </div>
              </HoverCard>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <HoverCard>
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-12 rounded-3xl shadow-2xl text-white h-full">
                  <Eye className="h-16 w-16 mb-6" />
                  <h2 className="text-4xl font-bold mb-6">
                    {language === 'ar' ? 'رؤيتنا' : 'Our Vision'}
                  </h2>
                  <p className="text-xl leading-relaxed opacity-90">
                    {language === 'ar'
                      ? 'أن نكون المنصة الرائدة عالمياً في مجال تنظيم المسابقات التقنية، ونبني مجتمع قوي من المبدعين والمبتكرين في الوطن العربي والعالم'
                      : 'To be the leading global platform for hackathon management, building a strong community of creators and innovators in the Arab world and beyond'}
                  </p>
                </div>
              </HoverCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {language === 'ar' ? 'قيمنا' : 'Our Values'}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {language === 'ar'
                  ? 'المبادئ التي نؤمن بها ونعمل بها كل يوم'
                  : 'The principles we believe in and work with every day'}
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {values.map((value, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <HoverCard>
                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-full">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-${value.color}-500 to-${value.color}-600 text-white mb-6`}>
                      {value.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </HoverCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {language === 'ar' ? 'فريقنا' : 'Our Team'}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {language === 'ar'
                  ? 'تعرف على الفريق الذي يعمل خلف الكواليس'
                  : 'Meet the team working behind the scenes'}
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {teamMembers.map((member, index) => (
              <AnimatedSection key={index} delay={index * 0.1} direction="up">
                <HoverCard>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-full">
                    <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                      />
                    </div>
                    <div className="pt-20 pb-8 px-6 text-center">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">
                        {member.role}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                        {member.bio}
                      </p>
                      <div className="flex justify-center gap-4">
                        <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          <Twitter className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          <Linkedin className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          <Github className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </HoverCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto text-white">
              <Rocket className="h-16 w-16 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {language === 'ar' ? 'جاهز للانضمام؟' : 'Ready to Join?'}
              </h2>
              <p className="text-xl mb-8 opacity-90">
                {language === 'ar'
                  ? 'ابدأ في تنظيم مسابقاتك التقنية اليوم'
                  : 'Start organizing your hackathons today'}
              </p>
              <motion.a
                href="/register"
                className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold text-lg hover:shadow-2xl transition-all hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
              </motion.a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
