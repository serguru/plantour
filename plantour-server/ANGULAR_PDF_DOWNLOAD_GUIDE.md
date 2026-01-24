# Как скачать PDF файл из Angular приложения

## Доступные PDF Endpoints

### 1. Отчет о путешествии
```
GET /api/Documents/trip/{tripId}
```
Генерирует полный отчет о путешествии с данными, участниками и упаковками вещей.

### 2. Упаковочный лист
```
GET /api/Documents/trip/{tripId}/package/{packageId}/packing-list
```
Генерирует список вещей по категориям для конкретной упаковки.

---

## Вариант 1: Простой способ через window.open (для тестирования)

```typescript
// В вашем Angular компоненте или сервисе

// Отчет о путешествии
downloadTripReport(tripId: string): void {
  const apiUrl = `http://localhost:5217/api/Documents/trip/${tripId}`;
  window.open(apiUrl, '_blank');
}

// Упаковочный лист
downloadPackingList(tripId: string, packageId: string): void {
  const apiUrl = `http://localhost:5217/api/Documents/trip/${tripId}/package/${packageId}/packing-list`;
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

  getTripReportPdf(tripId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/trip/${tripId}`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf'
      })
    });
  }

  getPackingListPdf(tripId: string, packageId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/trip/${tripId}/package/${packageId}/packing-list`, {
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

  downloadPackingList(tripId: string, packageId: string): void {
    this.documentsService.getPackingListPdf(tripId, packageId).subscribe({
      next: (blob: Blob) => {
        this.downloadBlob(blob, `packing-list-${packageId}.pdf`);
      },
      error: (error) => {
        console.error('Error downloading packing list:', error);
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
<button (click)="downloadTripReport('your-trip-id-here')">
  Download Trip Report
</button>

<button (click)="downloadPackingList('trip-id', 'package-id')">
  Download Packing List
</button>
```

## Вариант 3: Открыть PDF в новой вкладке (предпросмотр)

```typescript
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

openPackingListInNewTab(tripId: string, packageId: string): void {
  this.documentsService.getPackingListPdf(tripId, packageId).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    },
    error: (error) => {
      console.error('Error opening packing list:', error);
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

downloadPackingList(tripId: string, packageId: string): void {
  this.documentsService.getPackingListPdf(tripId, packageId).subscribe({
    next: (blob: Blob) => {
      saveAs(blob, `packing-list-${packageId}.pdf`);
    },
    error: (error) => {
      console.error('Error downloading packing list:', error);
    }
  });
}
```

## Важные замечания:

1. **CORS**: Убедитесь, что ваш backend правильно настроен для CORS (в Program.cs это уже настроено)

2. **Authorization**: Если endpoint требует авторизации, добавьте JWT токен:

```typescript
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

getPackingListPdf(tripId: string, packageId: string): Observable<Blob> {
  const token = this.authService.getToken();
  
  return this.http.get(`${this.apiUrl}/trip/${tripId}/package/${packageId}/packing-list`, {
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

**Отчет о путешествии:**
```
http://localhost:5217/api/Documents/trip/{tripId}
```

**Упаковочный лист:**
```
http://localhost:5217/api/Documents/trip/{tripId}/package/{packageId}/packing-list
```
Замените `{tripId}` и `{packageId}` на реальные ID из вашей базы данных.

Или через curl:
```bash
# Отчет о путешествии
curl -o trip-report.pdf http://localhost:5217/api/Documents/trip/your-trip-id-here

# Упаковочный лист
curl -o packing-list.pdf http://localhost:5217/api/Documents/trip/trip-id/package/package-id/packing-list
```

## Структура PDF документов

### Trip Report (Отчет о путешествии)

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

### Packing List (Упаковочный лист)

PDF документ содержит:

1. **Заголовок:**
   - Название "Packing List"
   - Название упаковки (с лейблом)
   - Общее количество вещей
   - Дата генерации

2. **Дополнительная информация:**
   - Вес (если указан)
   - Примечания (если указаны)

3. **Список вещей по категориям:**
   - **Категория**
     - **Вещь** (имя слева, количество и единицы справа)

**Примечание:** В обоих документах используется единый стиль с `primaryColor: #2F7C87` для категорий вещей.

