# Как скачать PDF файл из Angular приложения

## Доступные PDF Endpoints

### 1. Тестовый PDF (демонстрация)
```
GET /api/Documents/test-pdf
```

### 2. Отчет о путешествии
```
GET /api/Documents/trip/{tripId}
```
Генерирует полный отчет о путешествии с данными, участниками и упаковками вещей.

---

## Вариант 1: Простой способ через window.open (для тестирования)

```typescript
// В вашем Angular компоненте или сервисе

// Тестовый PDF
downloadTestPdf(): void {
  const apiUrl = 'http://localhost:5217/api/Documents/test-pdf';
  window.open(apiUrl, '_blank');
}

// Отчет о путешествии
downloadTripReport(tripId: string): void {
  const apiUrl = `http://localhost:5217/api/Documents/trip/${tripId}`;
  window.open(apiUrl, '_blank');
}
```

## Вариант 2: Через HttpClient с сохранением файла (рекомендуется)

### 1. В вашем сервисе (например, documents.service.ts):

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private apiUrl = `${environment.apiUrl}/api/Documents`;

  constructor(private http: HttpClient) {}

  getTestPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/test-pdf`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf'
      })
    });
  }

  getTripReportPdf(tripId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/trip/${tripId}`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf'
      })
    });
  }
}
```

### 2. В вашем компоненте:

```typescript
import { Component } from '@angular/core';
import { DocumentsService } from './services/documents.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html'
})
export class DocumentsComponent {
  
  constructor(private documentsService: DocumentsService) {}

  downloadTestPdf(): void {
    this.documentsService.getTestPdf().subscribe({
      next: (blob: Blob) => {
        this.downloadBlob(blob, 'plantour-test.pdf');
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
      }
    });
  }

  downloadTripReport(tripId: string): void {
    this.documentsService.getTripReportPdf(tripId).subscribe({
      next: (blob: Blob) => {
        this.downloadBlob(blob, `trip-report-${tripId}.pdf`);
      },
      error: (error) => {
        console.error('Error downloading trip report:', error);
      }
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    // Создаем временный URL для blob
    const url = window.URL.createObjectURL(blob);
    
    // Создаем временную ссылку для скачивания
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Программно кликаем по ссылке
    document.body.appendChild(link);
    link.click();
    
    // Очищаем
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
```

### 3. В вашем HTML шаблоне:

```html
<button (click)="downloadTestPdf()">
  Download Test PDF
</button>

<button (click)="downloadTripReport('your-trip-id-here')">
  Download Trip Report
</button>
```

## Вариант 3: Открыть PDF в новой вкладке (предпросмотр)

```typescript
openTestPdfInNewTab(): void {
  this.documentsService.getTestPdf().subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Очистить URL после небольшой задержки
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    },
    error: (error) => {
      console.error('Error opening PDF:', error);
    }
  });
}

openTripReportInNewTab(tripId: string): void {
  this.documentsService.getTripReportPdf(tripId).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    },
    error: (error) => {
      console.error('Error opening trip report:', error);
    }
  });
}
```

## Вариант 4: С использованием FileSaver.js (опционально)

Установите пакет:
```bash
npm install file-saver
npm install --save-dev @types/file-saver
```

В компоненте:
```typescript
import { saveAs } from 'file-saver';

downloadTestPdf(): void {
  this.documentsService.getTestPdf().subscribe({
    next: (blob: Blob) => {
      saveAs(blob, 'plantour-test.pdf');
    },
    error: (error) => {
      console.error('Error downloading PDF:', error);
    }
  });
}

downloadTripReport(tripId: string): void {
  this.documentsService.getTripReportPdf(tripId).subscribe({
    next: (blob: Blob) => {
      saveAs(blob, `trip-report-${tripId}.pdf`);
    },
    error: (error) => {
      console.error('Error downloading trip report:', error);
    }
  });
}
```

## Важные замечания:

1. **CORS**: Убедитесь, что ваш backend правильно настроен для CORS (в Program.cs это уже настроено)

2. **Authorization**: Если endpoint требует авторизации, добавьте JWT токен:

```typescript
getTestPdf(): Observable<Blob> {
  const token = this.authService.getToken();
  
  return this.http.get(`${this.apiUrl}/test-pdf`, {
    responseType: 'blob',
    headers: new HttpHeaders({
      'Accept': 'application/pdf',
      'Authorization': `Bearer ${token}`
    })
  });
}

getTripReportPdf(tripId: string): Observable<Blob> {
  const token = this.authService.getToken();
  
  return this.http.get(`${this.apiUrl}/trip/${tripId}`, {
    responseType: 'blob',
    headers: new HttpHeaders({
      'Accept': 'application/pdf',
      'Authorization': `Bearer ${token}`
    })
  });
}
```

3. **Environment variables**: Убедитесь, что в environment.ts указан правильный URL:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5217'  // обновленный порт
};
```

## Тестирование API endpoints

Вы можете протестировать endpoints напрямую в браузере:

**Тестовый PDF:**
```
http://localhost:5217/api/Documents/test-pdf
```

**Отчет о путешествии:**
```
http://localhost:5217/api/Documents/trip/{tripId}
```
Замените `{tripId}` на реальный ID путешествия из вашей базы данных.

Или через curl:
```bash
# Тестовый PDF
curl -o test.pdf http://localhost:5217/api/Documents/test-pdf

# Отчет о путешествии
curl -o trip-report.pdf http://localhost:5217/api/Documents/trip/your-trip-id-here
```

## Структура PDF отчета о путешествии

PDF документ содержит следующие секции:

1. **Trip Information** - основные данные о путешествии:
   - Название
   - Статус
   - Даты начала и окончания
   - Количество дней
   - Количество участников, упаковок и вещей
   - Примечания

2. **Participants** - таблица участников с колонками:
   - Имя
   - Email
   - Количество упаковок
   - Количество вещей

3. **Packages and Things** - иерархическая структура:
   - **Упаковка** (с лейблом, если есть)
     - **Категория вещи**
       - **Вещь** (имя слева, количество и единицы справа)

4. **Things without Package** - вещи без упаковки, тоже сгруппированные по категориям

