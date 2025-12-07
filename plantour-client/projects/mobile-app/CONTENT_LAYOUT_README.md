# ContentLayoutComponent

## Описание

ContentLayoutComponent - это контейнер для других компонентов приложения, который обеспечивает правильное управление вертикальной прокруткой.

## Местоположение

- `plantour-client/projects/mobile-app/src/app/components/layouts/content-layout.component.ts`
- `plantour-client/projects/mobile-app/src/app/components/layouts/content-layout.component.html`
- `plantour-client/projects/mobile-app/src/app/components/layouts/content-layout.component.scss`

## Основные характеристики

1. **Выравнивание вверх**: Контейнер выравнивается по верхнему краю
2. **Фиксированная высота**: Высота контейнера ограничена высотой родительского элемента (calc(100vh - 60px) для toolbar)
3. **Отсутствие прокрутки body**: Вертикальная линия прокрутки в body никогда не появляется
4. **Прокрутка контента**: Если контент не умещается по вертикали, появляется прокрутка внутри контейнера
5. **Адаптивная высота**: Высота контейнера минимально достаточна для размещения контента
6. **Цвет фона**: Использует стандартный цвет для форм `var(--surface-ground, #f8f9fa)`

## Использование

```html
<app-content-layout>
  <!-- Ваш контент здесь -->
  <div class="page-container">
    <p-card>
      <!-- Содержимое карточки -->
    </p-card>
  </div>
</app-content-layout>
```

## Тестовый компонент

Создан тестовый компонент `TestLayoutComponent` для демонстрации работы ContentLayoutComponent:

- Местоположение: `plantour-client/projects/mobile-app/src/app/components/test-layout/`
- Маршрут: `/test-layout`
- Содержит множество элементов для тестирования прокрутки

## Изменения в проекте

### 1. Обновлен `styles.scss`
- Добавлен `overflow: hidden` для body и html
- Установлена высота 100% для html и body

### 2. Обновлен `app.scss`
- Изменен `.app-content` с `min-height` на фиксированную `height`
- Добавлен `overflow: hidden` для `.app-content`

### 3. Добавлен маршрут в `app.routes.ts`
- Добавлен путь `/test-layout` для тестирования компонента

## Технические детали

Компонент использует:
- `display: flex` с `flex-direction: column` для вертикального размещения
- `height: 100%` для заполнения доступного пространства родителя
- `overflow-y: auto` для автоматического появления прокрутки при необходимости
- `overflow-x: hidden` для предотвращения горизонтальной прокрутки
