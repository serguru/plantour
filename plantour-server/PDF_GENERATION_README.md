# PDF Generation for Trip Reports

## Overview
Реализована функциональность генерации PDF отчетов о путешествиях с использованием библиотеки QuestPDF.

## Endpoints

### 1. Test PDF
```
GET /api/Documents/test-pdf
```
Возвращает тестовый PDF документ для проверки работоспособности.

### 2. Trip Report PDF
```
GET /api/Documents/trip/{tripId}
```
Генерирует полный отчет о путешествии по ID.

**Параметры:**
- `tripId` (Guid) - ID путешествия

**Требует авторизации:** Да (через JWT token)

**Проверка доступа:** Текущий пользователь должен иметь доступ к путешествию

## Структура отчета

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
- Заголовки секций: синий цвет, 16pt, полужирный
- Категории: синий цвет, 11pt, полужирный
- Упаковки: серый фон, 13pt
- Таблицы: разделители между строками

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
$headers = @{ Authorization = "Bearer $token" }

Invoke-WebRequest `
    -Uri "http://localhost:5217/api/Documents/trip/$tripId" `
    -Headers $headers `
    -OutFile "trip-report.pdf"
```

### Angular (см. ANGULAR_PDF_DOWNLOAD_GUIDE.md)
```typescript
this.documentsService.getTripReportPdf(tripId).subscribe(blob => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `trip-report-${tripId}.pdf`;
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
