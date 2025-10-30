import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getFormDesign(hackathonId: string) {
  try {
    console.log('🔍 Fetching form design for hackathon:', hackathonId)
    
    // Try using Prisma model first (if available)
    try {
      const design = await (prisma as any).hackathonFormDesign?.findFirst({
        where: {
          hackathonId: hackathonId,
          isEnabled: true
        }
      })
      
      if (design) {
        console.log('✅ Form design found via Prisma model:', {
          id: design.id,
          enabled: design.isEnabled,
          template: design.template,
          htmlLength: design.htmlContent?.length || 0
        })
        return design
      }
    } catch (prismaError: any) {
      console.log('⚠️ Prisma model failed, trying raw SQL:', prismaError?.message || 'Unknown error')

      // Fallback to raw SQL
      try {
        const rawDesign = await prisma.$queryRaw`
          SELECT * FROM hackathon_form_designs
          WHERE "hackathonId" = ${hackathonId} AND "isEnabled" = true
        ` as any[]

        if (rawDesign.length > 0) {
          console.log('✅ Form design found via raw SQL:', {
            id: rawDesign[0].id,
            enabled: rawDesign[0].isEnabled,
            htmlLength: rawDesign[0].htmlContent?.length || 0
          })
          return rawDesign[0]
        }
      } catch (sqlError: any) {
        console.log('⚠️ Raw SQL also failed:', sqlError?.message || 'Unknown error')
      }
    }

    console.log('⚠️ No form design found in database')
    return null
  } catch (error) {
    console.error('❌ Error fetching form design:', error)
    return null
  }
}

async function getRegistrationForm(hackathonId: string) {
  try {
    console.log('🔍 Fetching registration form for hackathon:', hackathonId)
    
    // Try using Prisma model first
    try {
      const form = await prisma.hackathonForm.findFirst({
        where: { hackathonId: hackathonId },
        orderBy: { updatedAt: 'desc' }
      })

      if (form) {
        console.log('✅ Registration form found via Prisma model')
        
        // Parse fields
        let fields = []
        try {
          fields = JSON.parse(form.fields || '[]')
        } catch (e) {
          fields = []
        }

        // Parse settings
        let settings = {}
        try {
          settings = JSON.parse(form.settings || '{}')
        } catch (e) {
          settings = {}
        }

        return {
          ...form,
          fields,
          settings
        }
      }
    } catch (prismaError: any) {
      console.log('⚠️ Prisma model failed for registration form, trying raw SQL:', prismaError?.message || 'Unknown error')
      
      // Fallback to raw SQL with PostgreSQL column names
      try {
        const rawForm = await prisma.$queryRaw`
          SELECT * FROM hackathon_forms
          WHERE hackathonId = ${hackathonId}
          ORDER BY "updatedAt" DESC
          LIMIT 1
        ` as any[]

        if (rawForm.length > 0) {
          console.log('✅ Registration form found via raw SQL')
          const form = rawForm[0]
          
          // Parse fields (try both formFields and fields columns)
          let fields = []
          try {
            const fieldsData = form.formFields || form.fields || '[]'
            fields = JSON.parse(fieldsData)
          } catch (e) {
            console.log('⚠️ Error parsing fields:', e)
            fields = []
          }

          // Parse settings
          let settings = {}
          try {
            settings = JSON.parse(form.settings || '{}')
          } catch (e) {
            console.log('⚠️ Error parsing settings:', e)
            settings = {}
          }

          console.log('📋 Form data loaded:', {
            id: form.id,
            title: form.title,
            fieldsCount: fields.length,
            lastUpdated: form.updatedAt
          })

          return {
            ...form,
            fields,
            settings
          }
        }
      } catch (sqlError: any) {
        console.log('⚠️ Raw SQL also failed for registration form:', sqlError?.message || 'Unknown error')
      }
    }

    console.log('⚠️ No registration form found')
    return null
  } catch (error) {
    console.error('❌ Error fetching registration form:', error)
    return null
  }
}

// Helper function to get hackathon data
async function getHackathon(hackathonId: string) {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })
    return hackathon
  } catch (error) {
    console.error('Error fetching hackathon:', error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('🔄 Loading custom form for:', resolvedParams.id)
    console.log('🕐 Request timestamp:', new Date().toISOString())
    
    const [initialFormDesign, initialRegistrationForm, hackathon] = await Promise.all([
      getFormDesign(resolvedParams.id),
      getRegistrationForm(resolvedParams.id),
      getHackathon(resolvedParams.id)
    ])

    let formDesign = initialFormDesign
    let registrationForm = initialRegistrationForm

    console.log('🔍 Form design check:', {
      exists: !!formDesign,
      enabled: formDesign?.isEnabled,
      hasHtml: !!formDesign?.htmlContent,
      htmlLength: formDesign?.htmlContent?.length || 0
    })

    if (!formDesign || !formDesign.isEnabled || !formDesign.htmlContent || formDesign.htmlContent.length < 100) {
      console.log('⚠️ No custom form design found, using default template')
      
      // Create a simple default form template
      const defaultTemplate = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>تسجيل - ${hackathon?.title || 'الهاكاثون'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                  font-family: 'Cairo', Arial, sans-serif; 
                  background: linear-gradient(135deg, #01645e 0%, #667eea 100%);
                  min-height: 100vh; direction: rtl; padding: 2rem 1rem;
              }
              .container { 
                  max-width: 600px; margin: 0 auto; background: white; 
                  border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;
              }
              .header { 
                  background: linear-gradient(135deg, #01645e 0%, #667eea 100%);
                  color: white; padding: 3rem 2rem; text-align: center;
              }
              .header h1 { font-size: 2.5rem; margin-bottom: 1rem; }
              .header p { font-size: 1.2rem; opacity: 0.9; }
              .form-container { padding: 3rem 2rem; }
              .form-group { margin-bottom: 2rem; }
              .form-label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333; }
              .form-input { 
                  width: 100%; padding: 1rem; border: 2px solid #e1e5e9; 
                  border-radius: 10px; font-size: 1rem; transition: all 0.3s ease;
              }
              .form-input:focus { border-color: #01645e; outline: none; }
              .submit-btn { 
                  background: linear-gradient(135deg, #01645e 0%, #667eea 100%);
                  color: white; padding: 1rem 3rem; border: none; border-radius: 50px;
                  font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;
              }
              .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${hackathon?.title || 'الهاكاثون'}</h1>
                  <p>نموذج التسجيل</p>
              </div>
              <div class="form-container">
                  <!-- سيتم إدراج محتوى الفورم هنا -->
              </div>
          </div>
      </body>
      </html>
      `
      
      // Use the default template as form design
      formDesign = {
        id: 'default',
        hackathonId: resolvedParams.id,
        isEnabled: true,
        template: 'default',
        htmlContent: defaultTemplate,
        cssContent: '',
        jsContent: '',
        settings: {}
      }
    }

    if (!registrationForm) {
      console.log('⚠️ No registration form found, creating default form...')
      
      // Create a default registration form
      const defaultFormData = {
        hackathonId: resolvedParams.id,
        title: 'نموذج التسجيل',
        description: 'نموذج التسجيل في الهاكاثون',
        isActive: true,
        fields: JSON.stringify([
          {
            id: 'name',
            type: 'text',
            label: 'الاسم الكامل',
            placeholder: 'اكتب اسمك الكامل',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'البريد الإلكتروني',
            placeholder: 'example@email.com',
            required: true
          },
          {
            id: 'phone',
            type: 'phone',
            label: 'رقم الهاتف',
            placeholder: '+966xxxxxxxxx',
            required: true
          },
          {
            id: 'experience',
            type: 'select',
            label: 'مستوى الخبرة',
            required: true,
            options: ['مبتدئ', 'متوسط', 'متقدم', 'خبير']
          }
        ]),
        settings: JSON.stringify({
          allowMultipleSubmissions: false,
          requireApproval: true,
          sendConfirmationEmail: true
        })
      }
      
      try {
        const newId = `form_${Date.now()}`
        
        // Use Prisma model instead of raw SQL
        try {
          await prisma.hackathonForm.create({
            data: {
              id: newId,
              hackathonId: resolvedParams.id,
              title: defaultFormData.title,
              description: defaultFormData.description,
              isActive: defaultFormData.isActive,
              fields: defaultFormData.fields,
              settings: defaultFormData.settings
            }
          })
          console.log('✅ Default form created successfully with Prisma model')
        } catch (prismaError: any) {
          console.log('⚠️ Prisma model failed, trying raw SQL with correct column names...', prismaError?.message || 'Unknown error')

          // Fallback to raw SQL with correct PostgreSQL column names
          try {
            await prisma.$executeRaw`
              INSERT INTO hackathon_forms
              (id, "hackathonId", title, description, "isActive", "formFields", settings)
              VALUES (${newId}, ${resolvedParams.id}, ${defaultFormData.title},
                      ${defaultFormData.description}, ${defaultFormData.isActive},
                      ${defaultFormData.fields}, ${defaultFormData.settings})
            `
            console.log('✅ Default form created successfully with raw SQL')
          } catch (sqlError: any) {
            console.log('⚠️ Raw SQL also failed, trying minimal insert...', sqlError?.message || 'Unknown error')
            
            // Final fallback - minimal insert
            await prisma.$executeRaw`
              INSERT INTO hackathon_forms
              (id, "hackathonId", "formFields")
              VALUES (${newId}, ${resolvedParams.id}, ${defaultFormData.fields})
            `
            console.log('✅ Default form created successfully with minimal SQL')
          }
        }
        
        console.log('✅ Default registration form created:', newId)
        
        // Parse the created form
        registrationForm = {
          id: newId,
          hackathonId: resolvedParams.id,
          title: defaultFormData.title,
          description: defaultFormData.description,
          isActive: defaultFormData.isActive,
          fields: JSON.parse(defaultFormData.fields),
          settings: JSON.parse(defaultFormData.settings)
        }
      } catch (error) {
        console.error('❌ Error creating default form:', error)
        return new NextResponse('Error creating registration form', { status: 500 })
      }
    }

    console.log('✅ Custom form design found:', {
      id: formDesign.id,
      template: formDesign.template,
      htmlLength: formDesign.htmlContent?.length || 0
    })

    // إنشاء HTML كامل مع دمج بيانات الفورم
    let fullHtml = formDesign.htmlContent || ''
    
    // إذا كان HTML يحتوي على placeholder للفورم، استبدله
    if (fullHtml.includes('<!-- سيتم إدراج محتوى الفورم هنا -->')) {
      const formFieldsHtml = generateFormFieldsHtml(registrationForm.fields)
      fullHtml = fullHtml.replace('<!-- سيتم إدراج محتوى الفورم هنا -->', formFieldsHtml)
    }
    
    // استبدال المتغيرات
    fullHtml = fullHtml.replace(/\{\{HACKATHON_TITLE\}\}/g, hackathon?.title || 'الهاكاثون')
    fullHtml = fullHtml.replace(/\{\{HACKATHON_DESCRIPTION\}\}/g, hackathon?.description || '')
    fullHtml = fullHtml.replace(/\{\{HACKATHON_ID\}\}/g, resolvedParams.id)
    
    // إضافة JavaScript للتعامل مع إرسال الفورم
    const formScript = `
    <script>
      // معالج إرسال الفورم
      document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('registrationForm');
        if (form) {
          form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {};
            
            // جمع بيانات الفورم
            for (let [key, value] of formData.entries()) {
              if (data[key]) {
                if (Array.isArray(data[key])) {
                  data[key].push(value);
                } else {
                  data[key] = [data[key], value];
                }
              } else {
                data[key] = value;
              }
            }
            
            // إرسال البيانات
            try {
              const response = await fetch('/api/hackathons/${resolvedParams.id}/register-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  formId: '${registrationForm.id}',
                  data: data
                })
              });
              
              if (response.ok) {
                // عرض رسالة نجاح
                document.body.innerHTML = \`
                  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #01645e 0%, #667eea 100%); font-family: Cairo, Arial, sans-serif; direction: rtl;">
                    <div style="background: white; padding: 3rem; border-radius: 20px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 500px;">
                      <div style="font-size: 4rem; color: #28a745; margin-bottom: 1rem;">✅</div>
                      <h2 style="font-size: 2rem; margin-bottom: 1rem; color: #333;">تم التسجيل بنجاح!</h2>
                      <p style="color: #666; margin-bottom: 2rem;">تم استلام طلبك وسيتم مراجعته قريباً</p>
                      <a href="/hackathons/${resolvedParams.id}" style="background: linear-gradient(135deg, #01645e 0%, #667eea 100%); color: white; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600;">العودة للهاكاثون</a>
                    </div>
                  </div>
                \`;
              } else {
                const error = await response.json();
                alert('خطأ في التسجيل: ' + (error.error || 'حدث خطأ غير متوقع'));
              }
            } catch (error) {
              console.error('Error:', error);
              alert('حدث خطأ في التسجيل');
            }
          });
        }
      });
    </script>
    `;
    // إضافة الـ script قبل إغلاق body
    fullHtml = fullHtml.replace('</body>', formScript + '</body>')

    // إرجاع HTML مع Content-Type صحيح
    const timestamp = Date.now()
    return new NextResponse(fullHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"form-${resolvedParams.id}-${timestamp}"`,
        'Vary': 'Accept-Encoding',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Timestamp': timestamp.toString(),
      },
    })

  } catch (error) {
    console.error('❌ Error loading custom form:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

function generateFormFieldsHtml(fields: any[]): string {
  let html = '<form id="registrationForm" class="space-y-6">'
  
  fields.forEach(field => {
    html += '<div class="form-group">'
    html += `<label class="form-label">${field.label}${field.required ? ' <span style="color: #dc3545;">*</span>' : ''}</label>`
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        html += `<input type="${field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}" name="${field.id}" class="form-input" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`
        break
        
      case 'textarea':
        html += `<textarea name="${field.id}" class="form-input form-textarea" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>`
        break
        
      case 'select':
        html += `<select name="${field.id}" class="form-input form-select" ${field.required ? 'required' : ''}>`
        html += `<option value="">${field.placeholder || 'اختر ' + field.label}</option>`
        if (field.options) {
          field.options.forEach((option: string) => {
            html += `<option value="${option}">${option}</option>`
          })
        }
        html += '</select>'
        break
        
      case 'radio':
        html += '<div class="radio-group">'
        if (field.options) {
          field.options.forEach((option: string, index: number) => {
            html += `
              <div class="radio-item">
                <input type="radio" id="${field.id}_${index}" name="${field.id}" value="${option}" ${field.required ? 'required' : ''}>
                <label for="${field.id}_${index}">${option}</label>
              </div>
            `
          })
        }
        html += '</div>'
        break
        
      case 'checkbox':
        html += '<div class="checkbox-group">'
        if (field.options) {
          field.options.forEach((option: string, index: number) => {
            html += `
              <div class="checkbox-item">
                <input type="checkbox" id="${field.id}_${index}" name="${field.id}" value="${option}">
                <label for="${field.id}_${index}">${option}</label>
              </div>
            `
          })
        }
        html += '</div>'
        break
        
      case 'date':
        html += `<input type="date" name="${field.id}" class="form-input" ${field.required ? 'required' : ''}>`
        break
        
      case 'file':
        html += `<input type="file" name="${field.id}" class="form-input" ${field.required ? 'required' : ''}>`
        break
    }
    
    html += '</div>'
  })
  
  html += '<div style="text-align: center; margin-top: 3rem;">'
  html += '<button type="submit" class="submit-btn"><i class="fas fa-paper-plane"></i> تسجيل</button>'
  html += '</div>'
  html += '</form>'
  
  return html
}
