export const LANDING_TEMPLATES = {
  minimal: {
    name: 'بسيط وأنيق',
    description: 'تصميم بسيط ونظيف',
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{HACKATHON_TITLE}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            direction: rtl;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            color: #2c3e50;
            font-weight: 700;
        }
        
        p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            color: #7f8c8d;
            line-height: 1.8;
        }
        
        .btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.1rem;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn:hover {
            background: #2980b9;
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            h1 { font-size: 2.5rem; }
            .container { padding: 1rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>{{HACKATHON_TITLE}}</h1>
        <p>{{HACKATHON_DESCRIPTION}}</p>
        <button class="btn" onclick="register()">سجل الآن</button>
    </div>
    
    <script>
        function register() {
            window.location.href = '/hackathons/{{HACKATHON_ID}}/register-form';
        }
    </script>
</body>
</html>`
  },

  modern: {
    name: 'عصري ومتطور',
    description: 'تصميم عصري مع تأثيرات بصرية',
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{HACKATHON_TITLE}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            direction: rtl;
            overflow-x: hidden;
        }
        
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%);
        }
        
        .hero-content {
            text-align: center;
            max-width: 800px;
            padding: 2rem;
            position: relative;
            z-index: 2;
        }
        
        .hero h1 {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: fadeInUp 1s ease-out;
        }
        
        .hero p {
            font-size: 1.4rem;
            margin-bottom: 2.5rem;
            opacity: 0.95;
            animation: fadeInUp 1s ease-out 0.2s both;
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
            color: white;
            border: none;
            padding: 18px 40px;
            font-size: 1.2rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
            text-decoration: none;
            display: inline-block;
            animation: fadeInUp 1s ease-out 0.4s both;
        }
        
        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(255, 107, 107, 0.4);
        }
        
        .floating-shapes {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 1;
        }
        
        .shape {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
        }
        
        .shape:nth-child(1) {
            width: 80px;
            height: 80px;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
        }
        
        .shape:nth-child(2) {
            width: 120px;
            height: 120px;
            top: 60%;
            right: 10%;
            animation-delay: 2s;
        }
        
        .shape:nth-child(3) {
            width: 60px;
            height: 60px;
            top: 80%;
            left: 20%;
            animation-delay: 4s;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-20px);
            }
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .hero p { font-size: 1.2rem; }
        }
    </style>
</head>
<body>
    <section class="hero">
        <div class="floating-shapes">
            <div class="shape"></div>
            <div class="shape"></div>
            <div class="shape"></div>
        </div>
        <div class="hero-content">
            <h1>{{HACKATHON_TITLE}}</h1>
            <p>{{HACKATHON_DESCRIPTION}}</p>
            <button class="btn-primary" onclick="register()">
                <i class="fas fa-rocket"></i> سجل الآن
            </button>
        </div>
    </section>
    
    <script>
        function register() {
            window.location.href = '/hackathons/{{HACKATHON_ID}}/register-form';
        }
        
        // Add loading animation
        document.addEventListener('DOMContentLoaded', function() {
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.5s ease';
                document.body.style.opacity = '1';
            }, 100);
        });
    </script>
</body>
</html>`
  },

  corporate: {
    name: 'مؤسسي واحترافي',
    description: 'تصميم مؤسسي احترافي',
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{HACKATHON_TITLE}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            direction: rtl;
        }
        
        .header {
            background: #fff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }
        
        .nav {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2c3e50;
        }
        
        .nav-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
        }
        
        .hero {
            background: linear-gradient(rgba(44, 62, 80, 0.8), rgba(44, 62, 80, 0.8)),
                        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><rect width="1000" height="1000" fill="%23f8f9fa"/><circle cx="200" cy="200" r="100" fill="%23e9ecef" opacity="0.5"/><circle cx="800" cy="800" r="150" fill="%23dee2e6" opacity="0.3"/></svg>');
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding-top: 80px;
        }
        
        .hero-content {
            max-width: 800px;
            padding: 2rem;
        }
        
        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1.5rem;
            font-weight: 700;
        }
        
        .hero p {
            font-size: 1.3rem;
            margin-bottom: 2.5rem;
            opacity: 0.9;
        }
        
        .btn-group {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 15px 30px;
            font-size: 1.1rem;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background: #3498db;
            color: white;
            border: none;
        }
        
        .btn-primary:hover {
            background: #2980b9;
        }
        
        .btn-outline {
            background: transparent;
            color: white;
            border: 2px solid white;
        }
        
        .btn-outline:hover {
            background: white;
            color: #2c3e50;
        }
        
        .features {
            padding: 80px 0;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        .section-title {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
            color: #2c3e50;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .feature {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .feature-icon {
            font-size: 3rem;
            color: #3498db;
            margin-bottom: 1rem;
        }
        
        .feature h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #2c3e50;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            padding: 40px 0;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .btn-group { flex-direction: column; align-items: center; }
            .features-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">{{HACKATHON_TITLE}}</div>
            <button class="nav-btn" onclick="register()">سجل الآن</button>
        </nav>
    </header>
    
    <section class="hero">
        <div class="hero-content">
            <h1>{{HACKATHON_TITLE}}</h1>
            <p>{{HACKATHON_DESCRIPTION}}</p>
            <div class="btn-group">
                <button class="btn btn-primary" onclick="register()">
                    <i class="fas fa-user-plus"></i> سجل الآن
                </button>
                <button class="btn btn-outline" onclick="scrollToFeatures()">
                    <i class="fas fa-info-circle"></i> اعرف المزيد
                </button>
            </div>
        </div>
    </section>
    
    <section class="features" id="features">
        <div class="container">
            <h2 class="section-title">لماذا تشارك معنا؟</h2>
            <div class="features-grid">
                <div class="feature">
                    <div class="feature-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h3>جوائز قيمة</h3>
                    <p>جوائز مالية ومعنوية للفائزين</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>شبكة تواصل</h3>
                    <p>تواصل مع خبراء الصناعة</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <h3>تطوير المهارات</h3>
                    <p>ورش عمل ومحاضرات من خبراء</p>
                </div>
            </div>
        </div>
    </section>
    
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 {{HACKATHON_TITLE}}. جميع الحقوق محفوظة.</p>
        </div>
    </footer>
    
    <script>
        function register() {
            window.location.href = '/hackathons/{{HACKATHON_ID}}/register-form';
        }
        
        function scrollToFeatures() {
            document.getElementById('features').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }
    </script>
</body>
</html>`
  }
}

export function processTemplate(template: string, hackathon: any, hackathonId: string): string {
  return template
    .replace(/{{HACKATHON_TITLE}}/g, hackathon?.title || 'هاكاثون')
    .replace(/{{HACKATHON_DESCRIPTION}}/g, hackathon?.description || 'انضم إلينا في رحلة الإبداع والابتكار')
    .replace(/{{HACKATHON_ID}}/g, hackathonId)
}
