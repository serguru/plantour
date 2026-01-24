# PDF Generation for Trip Reports

## Overview
Реализована функциональность генерации PDF отчетов о путешествиях и упаковочных листов с использованием библиотеки QuestPDF.

## Endpoints

### 1. Trip Report PDF
```
GET /api/Documents/trip/{tripId}
```
Генерирует полный отчет о путешествии по ID.

**Параметры:**
- `tripId` (Guid) - ID путешествия

**Требует авторизации:** Да (через JWT token)

**Проверка доступа:** Текущий пользователь должен иметь доступ к путешествию

### 2. Packing List PDF
```
GET /api/Documents/trip/{tripId}/package/{packageId}/packing-list
```
Генерирует упаковочный лист для конкретной упаковки.

**Параметры:**
- `tripId` (Guid) - ID путешествия
- `packageId` (Guid) - ID упаковки

**Требует авторизации:** Да (через JWT token)

**Проверка доступа:** Текущий пользователь должен иметь доступ к путешествию

## Структура отчета о путешествии (Trip Report)

### 1. Trip Information
Основная информация о путешествии:
- Название
- Статус
- Даты (начало/окончание)
- Общее количество дней
- Количество участников
- Количество упаковок
- Количество вещей (личных и общих)
- Примечания

### 2. Participants
Таблица со всеми участниками:
- ФИО
- Email
- Количество упаковок
- Количество вещей

### 3. Packages and Things
Иерархическая структура вещей:
```
📦 Упаковка (+ лейбл)
  └── 📂 Категория
      └── 📋 Вещь ...................... количество единица
```

**Особенности:**
- Вещи сгруппированы по упаковкам
- Внутри упаковки группировка по категориям
- Для каждой вещи:
  - Имя слева
  - Количество и единицы измерения справа (если указаны)
- Вещи без упаковки отображаются отдельной секцией

## Структура упаковочного листа (Packing List)

### Заголовок
- Название "Packing List" (основной цвет)
- Название упаковки с лейблом
- **Общее количество вещей** (Total items: X)
- Дата генерации

### Дополнительная информация
- Вес упаковки (если указан)
- Примечания (если указаны)

### Список вещей
Иерархическая структура по категориям:
```
📂 Категория вещи (primaryColor)
  └── 📋 Вещь ...................... количество единица
```

**Важно:** Используется общий метод `RenderThingsByCategory()` для единообразия стиля с Trip Report.

## Технические детали

### Используемые сервисы
- `ITripService` - получение данных о путешествии
- `ITripUserService` - получение участников
- `ITripPackageService` - получение упаковок
- `ITripThingService` - получение вещей

### Формат документа
- Размер: A4
- Поля: 2 см
- Шрифт: 11pt (основной текст)
- Нумерация страниц внизу по центру
- Дата генерации в заголовке

### Стилизация
- **Primary Color:** `#2F7C87` - используется для заголовков и категорий
- Заголовки секций: primaryColor, 16pt, полужирный
- Категории: primaryColor, 11pt, полужирный
- Упаковки: серый фон, 13pt
- Таблицы: разделители между строками
- Единый стиль для обоих типов документов

### Общие методы
- `RenderThingsByCategory()` - универсальный метод для рендеринга вещей по категориям
  - Используется в Trip Report и Packing List
  - Обеспечивает единообразие стиля
  - Автоматическая группировка по категориям
  - Форматирование количества и единиц измерения

## Примеры использования

### cURL
```bash
# С авторизацией
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -o trip-report.pdf \
     http://localhost:5217/api/Documents/trip/YOUR_TRIP_ID
```

### PowerShell
```powershell
$token = "YOUR_JWT_TOKEN"
$tripId = "YOUR_TRIP_ID"
$packageId = "YOUR_PACKAGE_ID"
$headers = @{ Authorization = "Bearer $token" }

# Trip Report
Invoke-WebRequest `
    -Uri "http://localhost:5217/api/Documents/trip/$tripId" `
    -Headers $headers `
    -OutFile "trip-report.pdf"

# Packing List
Invoke-WebRequest `
    -Uri "http://localhost:5217/api/Documents/trip/$tripId/package/$packageId/packing-list" `
    -Headers $headers `
    -OutFile "packing-list.pdf"
```

### Angular (см. ANGULAR_PDF_DOWNLOAD_GUIDE.md)
```typescript
// Trip Report
this.documentsService.getTripReportPdf(tripId).subscribe(blob => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `trip-report-${tripId}.pdf`;
  link.click();
});

// Packing List
this.documentsService.getPackingListPdf(tripId, packageId).subscribe(blob => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `packing-list-${packageId}.pdf`;
  link.click();
});
```

## Обработка ошибок

### Возможные ошибки:
1. **Trip not found** - путешествие с указанным ID не найдено
2. **Unauthorized** - пользователь не авторизован
3. **Access denied** - пользователь не имеет доступа к этому путешествию

### Коды ответов:
- `200 OK` - PDF успешно сгенерирован
- `401 Unauthorized` - требуется авторизация
- `403 Forbidden` - доступ запрещен
- `404 Not Found` - путешествие не найдено
- `500 Internal Server Error` - ошибка генерации PDF

## Расширение функциональности

Для добавления новых секций в PDF:

1. Создайте метод `RenderYourSection` в `DocumentsService`
2. Добавьте вызов в метод `GenerateTripReportPdfAsync`
3. Используйте QuestPDF API для форматирования

Пример:
```csharp
private void RenderYourSection(ColumnDescriptor column, YourData data)
{
    column.Item()
        .Text("Your Section Title")
        .SemiBold()
        .FontSize(16)
        .FontColor(Colors.Blue.Darken1);
    
    // Ваш контент здесь
}
```

## QuestPDF документация
- Официальная документация: https://www.questpdf.com/
- Лицензия: Community (бесплатная для некоммерческого использования)
- Настроена в `Program.cs`: `QuestPDF.Settings.License = LicenseType.Community;`
