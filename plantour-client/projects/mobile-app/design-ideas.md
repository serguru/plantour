# Унификация стиля компонентов в mobile-app

## Проблема

Сейчас компоненты приложения имеют разный визуальный стиль:
- **SignInComponent** и **RegisterComponent** используют кастомные карточки с центрированным заголовком
- **ThingsComponent** использует PrimeNG Card с цветным хэдером и иконкой
- Ширина форм и контейнеров различается
- Стили дублируются в каждом компоненте (формы, кнопки, ошибки)
- Нет единого подхода к созданию заголовков страниц

## Предлагаемое решение: Гибридный подход

### 1. Создать переиспользуемые компоненты (Component Templates)

#### 1.1. `PageCardWrapperComponent` 
**Местоположение:** `src/app/components/shared/page-card-wrapper/`

Универсальная обёртка для всех страниц с контентом.

```typescript
@Component({
  selector: 'app-page-card-wrapper',
  template: `
    <div class="page-wrapper">
      <div class="page-card" [class.page-card--wide]="wide" [class.page-card--full]="fullWidth">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PageCardWrapperComponent {
  @Input() wide = false;        // для страниц с таблицами/списками
  @Input() fullWidth = false;   // для landing страниц
}
```

**Стили:**
- Стандартная ширина: `max-width: 450px` (для форм)
- Wide режим: `max-width: 800px` (для списков)
- FullWidth: `max-width: 100%` (для landing)
- Единый padding, border-radius, box-shadow

#### 1.2. `PageHeaderComponent`
**Местоположение:** `src/app/components/shared/page-header/`

Единый заголовок для всех страниц.

```typescript
@Component({
  selector: 'app-page-header',
  template: `
    <div class="page-header" [class.page-header--centered]="centered" [class.page-header--colored]="colored">
      <div class="page-header__main">
        @if (icon) {
          <i [class]="'pi pi-' + icon"></i>
        }
        <h1 class="page-header__title">{{ title }}</h1>
      </div>
      @if (subtitle) {
        <p class="page-header__subtitle">{{ subtitle }}</p>
      }
      @if (hasActions) {
        <div class="page-header__actions">
          <ng-content select="[actions]"></ng-content>
        </div>
      }
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() centered = false;    // для форм (sign-in, register)
  @Input() colored = false;     // для списков (things, packs)
  @Input() hasActions = false;  // для кнопок в заголовке
}
```

**Варианты использования:**
- Центрированный (формы): текст по центру, без фонового цвета
- С цветным фоном (списки): фон primary-color, белый текст, иконка слева
- С действиями: кнопки справа в хэдере

#### 1.3. `FormFieldComponent`
**Местоположение:** `src/app/components/shared/form-field/`

Обёртка для полей формы с единым стилем.

```typescript
@Component({
  selector: 'app-form-field',
  template: `
    <div class="form-field">
      <label [for]="fieldId" class="form-field__label">
        {{ label }}
        @if (required) {
          <span class="form-field__required">*</span>
        }
      </label>
      <ng-content></ng-content>
      @if (errorMessage) {
        <small class="form-field__error">{{ errorMessage }}</small>
      }
    </div>
  `
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() fieldId: string = '';
  @Input() required = false;
  @Input() errorMessage?: string;
}
```

### 2. Создать глобальные SCSS модули

#### 2.1. `_design-system.scss`
**Местоположение:** `src/styles/_design-system.scss`

Централизованные CSS переменные для дизайн-системы:

```scss
:root {
  // Card dimensions
  --card-width-form: 450px;
  --card-width-list: 800px;
  --card-border-radius: 20px;
  --card-padding: 2.5rem 2rem;
  --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);

  // Header styling
  --header-font-size: 2rem;
  --header-margin: 0 0 0.5rem 0;
  --subtitle-font-size: 1rem;
  --subtitle-margin: 0 0 2rem 0;

  // Form field spacing
  --form-gap: 1.5rem;
  --field-gap: 0.5rem;
  --input-padding: 0.875rem 1rem;
  --input-border-radius: 10px;
  --input-border: 2px solid #e0e0e0;
  --input-focus-shadow: 0 0 0 3px rgba(77, 184, 196, 0.1);
}
```

#### 2.2. `_forms.scss`
**Местоположение:** `src/styles/_forms.scss`

Общие стили для всех форм:

```scss
// Form container
.form-container {
  display: flex;
  flex-direction: column;
  gap: var(--form-gap);
}

// Field styles (используется в FormFieldComponent)
.form-field { /* ... */ }
.form-field__label { /* ... */ }
.form-field__error { /* ... */ }

// Input mixins
@mixin input-base {
  width: 100%;
  padding: var(--input-padding);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-family: var(--font-ui);
  transition: all 0.3s ease;
}

@mixin input-focus {
  border-color: var(--primary-color-light);
  box-shadow: var(--input-focus-shadow);
}
```

#### 2.3. `_layouts.scss`
**Местоположение:** `src/styles/_layouts.scss`

```scss
// Page wrapper (используется в PageCardWrapperComponent)
.page-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

.page-card {
  background: #ffffff;
  border-radius: var(--card-border-radius);
  padding: var(--card-padding);
  box-shadow: var(--card-shadow);
  width: 100%;
  max-width: var(--card-width-form);

  &--wide {
    max-width: var(--card-width-list);
  }

  &--full {
    max-width: 100%;
  }
}
```

### 3. Создать Layout компоненты для типовых страниц

#### 3.1. `FormPageLayoutComponent`
Для страниц с формами (sign-in, register).

```typescript
@Component({
  selector: 'app-form-page-layout',
  template: `
    <app-content-layout>
      <section class="form-page-background">
        <app-page-card-wrapper>
          <app-page-header 
            [title]="title" 
            [subtitle]="subtitle" 
            [centered]="true">
          </app-page-header>
          <div class="form-container">
            <ng-content></ng-content>
          </div>
        </app-page-card-wrapper>
      </section>
    </app-content-layout>
  `
})
```

#### 3.2. `ListPageLayoutComponent`
Для страниц со списками (things, packs, travelers).

```typescript
@Component({
  selector: 'app-list-page-layout',
  template: `
    <app-content-layout>
      <app-page-card-wrapper [wide]="true">
        <app-page-header 
          [title]="title" 
          [icon]="icon"
          [colored]="true"
          [hasActions]="true">
          <ng-container actions>
            <ng-content select="[headerActions]"></ng-content>
          </ng-container>
        </app-page-header>
        <div class="list-content">
          <ng-content></ng-content>
        </div>
      </app-page-card-wrapper>
    </app-content-layout>
  `
})
```

### 4. План миграции компонентов

#### Этап 1: Подготовка (не ломаем существующий код)
1. Создать папку `src/styles/shared/` для общих SCSS модулей
2. Создать `_design-system.scss`, `_forms.scss`, `_layouts.scss`
3. Импортировать в `styles.scss`
4. Создать shared компоненты в `src/app/components/shared/`:
   - `page-card-wrapper/`
   - `page-header/`
   - `form-field/`
   - `form-page-layout/`
   - `list-page-layout/`

#### Этап 2: Миграция форм
1. Мигрировать **SignInComponent**:
   - Заменить HTML на `<app-form-page-layout>`
   - Использовать `<app-form-field>` для полей
   - Удалить дублирующие стили из `sign-in.scss`
2. Мигрировать **RegisterComponent** аналогично
3. Протестировать на разных размерах экрана

#### Этап 3: Миграция списков
1. Мигрировать **ThingsComponent**:
   - Заменить p-card на `<app-list-page-layout>`
   - Перенести кнопки в `[headerActions]`
   - Удалить дублирующие стили
2. Мигрировать **PacksComponent**, **TravelersComponent** аналогично

#### Этап 4: Обработка landing страниц
1. Для landing страниц использовать `<app-page-card-wrapper [fullWidth]="true">`
2. Не применять ограничения по ширине
3. Возможно создать отдельный `LandingPageLayoutComponent` при необходимости

### 5. Примеры использования после миграции

#### SignInComponent (после)
```html
<app-form-page-layout title="Sign In" subtitle="Welcome back to Plantour">
  <form [formGroup]="signInForm" (ngSubmit)="onSubmit()">
    <app-form-field 
      label="Email" 
      fieldId="email" 
      [required]="true"
      [errorMessage]="getFieldError('email')">
      <input pInputText id="email" type="email" formControlName="email" 
             placeholder="your.email@example.com" />
    </app-form-field>

    <app-form-field 
      label="Password" 
      fieldId="password" 
      [required]="true"
      [errorMessage]="getFieldError('password')">
      <p-password id="password" formControlName="password" 
                  placeholder="Enter your password" [toggleMask]="true" />
    </app-form-field>

    <div class="button-container">
      <p-button type="submit" label="Sign In" icon="pi pi-sign-in" />
    </div>
  </form>
</app-form-page-layout>
```

#### ThingsComponent (после)
```html
<app-list-page-layout title="Things" icon="box">
  <ng-container headerActions>
    <p-button [icon]="showToolbar ? 'pi pi-chevron-up' : 'pi pi-sliders-h'" 
              (onClick)="toggleToolbar()" />
    <p-button icon="pi pi-plus" (onClick)="onAddThing()" />
  </ng-container>

  <app-things-utils [showToolbar]="showToolbar" />
  
  @if (sortedThings?.length > 0) {
    <p-listbox [options]="sortedThings" />
  } @else {
    <div class="empty-state">
      <i class="pi pi-box"></i>
      <p>No things yet</p>
    </div>
  }
</app-list-page-layout>
```

### 6. Преимущества решения

1. **Единообразие:** Все компоненты используют один и тот же визуальный язык
2. **Переиспользование:** Код не дублируется, легко поддерживать
3. **Гибкость:** Компоненты параметризованы через @Input, можно кастомизировать
4. **Type Safety:** TypeScript проверяет правильность использования
5. **Масштабируемость:** Легко добавлять новые страницы с консистентным стилем
6. **Простота изменений:** Изменения в дизайне делаются в одном месте
7. **Адаптивность:** Responsive стили централизованы в SCSS модулях

### 7. Дополнительные улучшения

1. **Storybook:** Создать storybook для визуализации shared компонентов
2. **Документация:** Добавить примеры использования в README каждого компонента
3. **Тесты:** Unit тесты для shared компонентов
4. **Accessibility:** Добавить ARIA атрибуты в компоненты
5. **Themes:** Возможность переключения тем через CSS переменные

### 8. Альтернативные подходы (не рекомендуется)

#### Подход A: Только глобальные CSS классы
- Просто создать файл с классами `.page-title`, `.page-card` и т.д.
- **Минус:** Нет type safety, легко забыть применить класс
- **Минус:** Меньше переиспользования логики

#### Подход B: Использовать только PrimeNG компоненты
- Стандартизировать всё на p-card, p-panel и т.д.
- **Минус:** Меньше гибкости в кастомизации
- **Минус:** PrimeNG компоненты тяжелее, больше HTML

#### Подход C: CSS-in-JS библиотека (styled-components для Angular)
- **Минус:** Добавляет зависимость, увеличивает bundle size
- **Минус:** Не идиоматично для Angular

## Итог

Рекомендуется **гибридный подход** с созданием переиспользуемых Angular компонентов для сложных паттернов (cards, headers, form fields) и централизованных SCSS модулей для базовых стилей. Это даст максимальную гибкость, безопасность типов и простоту поддержки.

Миграция должна быть постепенной, начиная с самых простых компонентов (sign-in, register), затем переходя к более сложным (lists, landing pages). После каждого этапа необходимо тестирование на различных устройствах.

---

## ⚠️ ВАЖНО: Оценка сложности для AI-ассистента

Полная трансформация проекта по плану выше - это **БОЛЬШАЯ задача**, которая может привести к "зависанию" AI:
- 15-20+ файлов для создания/изменения
- Множество зависимостей между компонентами
- Риск сломать существующий функционал
- Сложность тестирования всех изменений

### Упрощенный план для поэтапной реализации

Чтобы избежать проблем, разбиваем на **микро-итерации** (каждая - отдельная задача для AI):

#### 🟢 Итерация 1: Только глобальные SCSS (ПРОСТАЯ, ~4 файла)
**Что делаем:**
1. Создать `src/styles/shared/_variables.scss` с CSS переменными для размеров карточек, отступов
2. Создать `src/styles/shared/_mixins.scss` с миксинами для форм
3. Обновить `styles.scss` для импорта
4. **НЕ трогаем компоненты**

**Результат:** Подготовлена база для дальнейших изменений, ничего не сломано.

#### 🟢 Итерация 2: Унификация sign-in стилей (ПРОСТАЯ, ~2 файла)
**Что делаем:**
1. Применить CSS переменные из итерации 1 к `sign-in.scss`
2. Удалить дублирование, использовать миксины
3. **НЕ меняем HTML, НЕ создаем новые компоненты**

**Результат:** SignIn визуально не изменился, но код чище.

#### 🟡 Итерация 3: Унификация register стилей (ПРОСТАЯ, ~2 файла)
**Что делаем:**
1. То же самое для `register.scss`
2. Убедиться что sign-in и register используют одинаковые переменные

**Результат:** Формы выглядят единообразно.

#### 🟡 Итерация 4: Унификация things стилей (СРЕДНЯЯ, ~2 файла)
**Что делаем:**
1. Применить переменные к `things.scss`
2. Унифицировать заголовок с другими компонентами

**Результат:** Списки тоже в едином стиле.

#### 🟠 Итерация 5 (опционально): Создать FormFieldComponent (СРЕДНЯЯ, ~3 файла)
**Только если предыдущие итерации прошли успешно!**

**Что делаем:**
1. Создать shared/form-field компонент
2. Применить только к SignIn
3. Протестировать

#### 🔴 Итерация 6+ (опционально): Создать layout компоненты (СЛОЖНАЯ)
**Только если все предыдущее работает!**

### Альтернативный минималистичный подход (САМЫЙ БЕЗОПАСНЫЙ)

Вообще НЕ создавать новые Angular компоненты, а только:

1. **Создать один файл** `src/styles/shared/_unified-styles.scss` с классами:
   ```scss
   .page-card { /* единый стиль карточки */ }
   .page-title { /* единый стиль заголовка */ }
   .page-subtitle { /* единый стиль подзаголовка */ }
   .form-container { /* единый стиль формы */ }
   ```

2. **Применить классы к существующим компонентам** - просто добавить/заменить классы в HTML:
   ```html
   <!-- Было -->
   <h1 class="signin-title">Sign In</h1>
   
   <!-- Стало -->
   <h1 class="page-title">Sign In</h1>
   ```

3. **Постепенно мигрировать** каждый компонент (1-2 компонента за задачу)

**Преимущества:**
- Минимум кода
- Без новых зависимостей
- Легко откатить назад
- AI точно справится

**Недостатки:**
- Меньше type safety
- Меньше переиспользования логики
- Но проще и надёжнее!

### Рекомендация

Для работы с AI начать с **минималистичного подхода** или **итераций 1-4**. Если всё работает хорошо и нужна дополнительная абстракция - можно постепенно добавить shared компоненты.
