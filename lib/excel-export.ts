import * as XLSX from 'xlsx'

export interface ExcelColumn {
  key: string
  header: string
  width?: number
  format?: 'text' | 'number' | 'date' | 'currency'
}

export interface ExcelExportOptions {
  filename: string
  sheetName?: string
  columns: ExcelColumn[]
  data: any[]
  rtl?: boolean
  includeTimestamp?: boolean
}

export class ExcelExporter {
  static async exportToExcel(options: ExcelExportOptions): Promise<void> {
    try {
      const {
        filename,
        sheetName = 'البيانات',
        columns,
        data,
        rtl = true,
        includeTimestamp = true
      } = options

      // Prepare data for export
      const exportData = data.map(row => {
        const exportRow: any = {}
        columns.forEach(col => {
          let value = row[col.key]
          
          // Format value based on column type
          switch (col.format) {
            case 'date':
              if (value) {
                value = new Date(value).toLocaleDateString('ar-SA')
              }
              break
            case 'number':
              if (typeof value === 'number') {
                value = value.toLocaleString('ar-SA')
              }
              break
            case 'currency':
              if (typeof value === 'number') {
                value = `${value.toLocaleString('ar-SA')} ريال`
              }
              break
            default:
              // Keep as text
              break
          }
          
          exportRow[col.header] = value || ''
        })
        return exportRow
      })

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)

      // Set column widths
      const colWidths = columns.map(col => ({
        wch: col.width || 15
      }))
      ws['!cols'] = colWidths

      // Set RTL direction if needed
      if (rtl) {
        ws['!dir'] = 'rtl'
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName)

      // Generate filename with timestamp if requested
      let finalFilename = filename
      if (includeTimestamp) {
        const timestamp = new Date().toISOString().split('T')[0]
        const filenameParts = filename.split('.')
        if (filenameParts.length > 1) {
          const extension = filenameParts.pop()
          finalFilename = `${filenameParts.join('.')}_${timestamp}.${extension}`
        } else {
          finalFilename = `${filename}_${timestamp}.xlsx`
        }
      }

      // Write file
      XLSX.writeFile(wb, finalFilename)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      throw new Error('فشل في تصدير البيانات إلى Excel')
    }
  }

  static async exportMultipleSheets(
    filename: string,
    sheets: Array<{
      name: string
      columns: ExcelColumn[]
      data: any[]
    }>,
    includeTimestamp = true
  ): Promise<void> {
    try {
      const wb = XLSX.utils.book_new()

      sheets.forEach(sheet => {
        // Prepare data
        const exportData = sheet.data.map(row => {
          const exportRow: any = {}
          sheet.columns.forEach(col => {
            let value = row[col.key]
            
            // Format value based on column type
            switch (col.format) {
              case 'date':
                if (value) {
                  value = new Date(value).toLocaleDateString('ar-SA')
                }
                break
              case 'number':
                if (typeof value === 'number') {
                  value = value.toLocaleString('ar-SA')
                }
                break
              case 'currency':
                if (typeof value === 'number') {
                  value = `${value.toLocaleString('ar-SA')} ريال`
                }
                break
            }
            
            exportRow[col.header] = value || ''
          })
          return exportRow
        })

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData)

        // Set column widths
        const colWidths = sheet.columns.map(col => ({
          wch: col.width || 15
        }))
        ws['!cols'] = colWidths
        ws['!dir'] = 'rtl'

        // Add to workbook
        XLSX.utils.book_append_sheet(wb, ws, sheet.name)
      })

      // Generate filename with timestamp
      let finalFilename = filename
      if (includeTimestamp) {
        const timestamp = new Date().toISOString().split('T')[0]
        const filenameParts = filename.split('.')
        if (filenameParts.length > 1) {
          const extension = filenameParts.pop()
          finalFilename = `${filenameParts.join('.')}_${timestamp}.${extension}`
        } else {
          finalFilename = `${filename}_${timestamp}.xlsx`
        }
      }

      // Write file
      XLSX.writeFile(wb, finalFilename)
    } catch (error) {
      console.error('Error exporting multiple sheets:', error)
      throw new Error('فشل في تصدير البيانات إلى Excel')
    }
  }

  // Helper method for common export patterns
  static async exportTableData(
    filename: string,
    headers: string[],
    data: any[][],
    sheetName = 'البيانات'
  ): Promise<void> {
    try {
      const wb = XLSX.utils.book_new()
      
      // Create data array with headers
      const wsData = [headers, ...data]
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      
      // Set RTL direction
      ws['!dir'] = 'rtl'
      
      // Auto-size columns
      const colWidths = headers.map(() => ({ wch: 20 }))
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, sheetName)

      // Add timestamp to filename
      const timestamp = new Date().toISOString().split('T')[0]
      const finalFilename = `${filename}_${timestamp}.xlsx`

      XLSX.writeFile(wb, finalFilename)
    } catch (error) {
      console.error('Error exporting table data:', error)
      throw new Error('فشل في تصدير البيانات إلى Excel')
    }
  }
}

// Utility functions for common data transformations
export const formatters = {
  date: (value: any) => value ? new Date(value).toLocaleDateString('ar-SA') : '',
  datetime: (value: any) => value ? new Date(value).toLocaleString('ar-SA') : '',
  number: (value: any) => typeof value === 'number' ? value.toLocaleString('ar-SA') : value,
  currency: (value: any) => typeof value === 'number' ? `${value.toLocaleString('ar-SA')} ريال` : value,
  boolean: (value: any) => value ? 'نعم' : 'لا',
  status: (value: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'نشط',
      'inactive': 'غير نشط',
      'pending': 'في الانتظار',
      'approved': 'مقبول',
      'rejected': 'مرفوض',
      'open': 'مفتوح',
      'closed': 'مغلق',
      'completed': 'مكتمل',
      'cancelled': 'ملغي'
    }
    return statusMap[value] || value
  }
}
