# Reactive Toolbar Buttons - Technical Documentation

## Обзор

Реактивная система управления кнопками тулбара позволяет кнопкам динамически реагировать на изменения состояния компонента. Например, кнопки "Edit" и "Delete" автоматически становятся активными или неактивными в зависимости от того, выбрал ли пользователь элемент в списке.

## Архитектура

### 1. Уникальные идентификаторы кнопок (Button IDs)

Каждая кнопка теперь имеет опциональное свойство `id`:

```typescript
export interface ToolbarButton {
  id?: string;           // Уникальный идентификатор кнопки
  icon: string;
  label?: string;
  tooltip?: string;
  command: () => void;
  disabled?: boolean;
}
```

Идентификатор используется для адресации конкретной кнопки при обновлении её свойств.

### 2. Методы обновления в ToolbarService

Сервис предоставляет два метода для реактивного обновления:

```typescript
// Обновить одну кнопку
updateButton(buttonId: string, updates: Partial<ToolbarButton>): void

// Обновить несколько кнопок за один раз
updateButtons(updates: { [buttonId: string]: Partial<ToolbarButton> }): void
```

**Как это работает:**
1. Метод получает текущий массив кнопок из `BehaviorSubject`
2. Находит кнопки по `id` и применяет обновления
3. Отправляет обновлённый массив через `BehaviorSubject.next()`
4. Все подписчики (Toolbar компонент) автоматически получают обновления

### 3. Защищённые методы в ToolbarAware

Базовый класс `ToolbarAware` предоставляет удобные методы для наследников:

```typescript
protected updateToolbarButton(buttonId: string, updates: Partial<ToolbarButton>): void

protected updateToolbarButtons(updates: { [buttonId: string]: Partial<ToolbarButton> }): void
```

## Пример реализации: ThingsComponent

### Шаг 1: Создание кнопок с идентификаторами

```typescript
private setupToolbarButtons(): void {
  this.setToolbarButtons([
    {
      id: 'add-thing',           // Уникальный ID
      icon: 'pi pi-plus',
      tooltip: 'Add Thing',
      command: () => this.onAddThing()
    },
    {
      id: 'edit-thing',          // ID для обновления
      icon: 'pi pi-pencil',
      tooltip: 'Edit Thing',
      command: () => this.onEditSelectedThing(),
      disabled: true             // Изначально неактивна
    },
    {
      id: 'delete-thing',        // ID для обновления
      icon: 'pi pi-trash',
      tooltip: 'Delete Thing',
      command: () => this.onDeleteSelectedThing(),
      disabled: true             // Изначально неактивна
    },
    {
      id: 'refresh-things',
      icon: 'pi pi-refresh',
      tooltip: 'Refresh',
      command: () => this.loadUserThings()
    }
  ]);
}
```

### Шаг 2: Обработчик изменения селекции

```typescript
onSelectionChange(): void {
  const hasSelection = this.selectedThing != null;
  
  // Обновляем несколько кнопок одновременно
  this.updateToolbarButtons({
    'edit-thing': { 
      disabled: !hasSelection,
      tooltip: hasSelection 
        ? `Edit "${this.selectedThing?.shortDescription}"` 
        : 'Edit Thing'
    },
    'delete-thing': { 
      disabled: !hasSelection,
      tooltip: hasSelection 
        ? `Delete "${this.selectedThing?.shortDescription}"` 
        : 'Delete Thing'
    }
  });
}
```

**Что происходит:**
1. Метод вызывается при изменении селекции в listbox
2. Проверяется наличие выбранного элемента
3. Обновляются свойства кнопок через `updateToolbarButtons()`
4. Кнопки становятся активными/неактивными
5. Tooltip обновляется с именем выбранного элемента

### Шаг 3: Подключение к UI

```html
<p-listbox 
  [options]="userThings!" 
  [(ngModel)]="selectedThing"
  (onChange)="onSelectionChange()"    <!-- Вызов обработчика -->
  optionLabel="shortDescription"
  [listStyle]="{'max-height': '60vh'}"
  styleClass="w-full">
```

### Шаг 4: Команды кнопок "знают" контекст

```typescript
// Кнопка выполняет действие на выбранном элементе
onEditSelectedThing(): void {
  if (this.selectedThing) {
    this.router.navigate(['/things/edit', this.selectedThing.id]);
  }
}

async onDeleteSelectedThing(): Promise<void> {
  if (!this.selectedThing) {
    return;
  }
  
  // Используется this.selectedThing из контекста компонента
  const result = await this.messagesService.openOkCancel({
    title: 'Delete Thing',
    message: `Are you sure you want to delete "${this.selectedThing.shortDescription}"?`,
    okLabel: 'Delete',
    cancelLabel: 'Cancel'
  });

  if (result === 'ok') {
    this.userThingService.delete(this.selectedThing.id).subscribe({
      next: () => {
        this.selectedThing = null;
        this.onSelectionChange();  // Обновляем состояние кнопок
        this.loadUserThings();
        this.messagesService.showInfo('Thing deleted successfully');
      }
    });
  }
}
```

## Поток данных (Data Flow)

```
1. Пользователь выбирает элемент в списке
   ↓
2. PrimeNG Listbox генерирует событие (onChange)
   ↓
3. Вызывается onSelectionChange() компонента
   ↓
4. Компонент вызывает updateToolbarButtons()
   ↓
5. ToolbarService обновляет BehaviorSubject
   ↓
6. Toolbar компонент получает обновление через buttons$
   ↓
7. Angular Change Detection обновляет DOM
   ↓
8. Кнопки визуально меняют состояние (disabled/enabled)
```

## Преимущества реактивного подхода

### 1. Автоматическая синхронизация
Состояние кнопок всегда синхронизировано с состоянием компонента без явного императивного кода.

### 2. Контекстная осведомлённость
Команды кнопок выполняются в контексте компонента и имеют доступ к `this.selectedThing` через замыкание (closure):

```typescript
command: () => this.onEditSelectedThing()
// ^^^^ Стрелочная функция сохраняет контекст компонента
```

### 3. Динамические подсказки
Tooltip обновляются с информацией о выбранном элементе:

```typescript
tooltip: hasSelection 
  ? `Edit "${this.selectedThing?.shortDescription}"` 
  : 'Edit Thing'
```

### 4. Один источник истины (Single Source of Truth)
`this.selectedThing` - единственный источник состояния. Кнопки просто реагируют на его изменения.

### 5. Предотвращение ошибок
Кнопки неактивны, когда действие невозможно, предотвращая попытки редактирования/удаления несуществующего элемента.

## Примеры использования в других компонентах

### PacksComponent

```typescript
onSelectionChange(): void {
  const hasSelection = this.selectedPack != null;
  
  this.updateToolbarButtons({
    'edit-pack': { 
      disabled: !hasSelection,
      tooltip: hasSelection ? `Edit "${this.selectedPack?.shortDescription}"` : 'Edit Pack'
    },
    'delete-pack': { 
      disabled: !hasSelection,
      tooltip: hasSelection ? `Delete "${this.selectedPack?.shortDescription}"` : 'Delete Pack'
    }
  });
}
```

### TripComponent

```typescript
onSelectionChange(): void {
  const hasSelection = this.selectedTrip != null;
  
  this.updateToolbarButtons({
    'edit-trip': { 
      disabled: !hasSelection,
      tooltip: hasSelection ? `Edit "${this.selectedTrip?.shortDescription}"` : 'Edit Trip'
    },
    'delete-trip': { 
      disabled: !hasSelection,
      tooltip: hasSelection ? `Delete "${this.selectedTrip?.shortDescription}"` : 'Delete Trip'
    }
  });
}
```

## Расширенные сценарии

### 1. Условная активация на основе множественных условий

```typescript
onSelectionChange(): void {
  const hasSelection = this.selectedThing != null;
  const canEdit = hasSelection && this.hasEditPermission();
  const canDelete = hasSelection && this.hasDeletePermission();
  
  this.updateToolbarButtons({
    'edit-thing': { 
      disabled: !canEdit,
      tooltip: canEdit ? `Edit "${this.selectedThing?.shortDescription}"` : 'No edit permission'
    },
    'delete-thing': { 
      disabled: !canDelete
    }
  });
}
```

### 2. Обновление иконок и стилей

```typescript
onSelectionChange(): void {
  const isArchived = this.selectedThing?.archived;
  
  this.updateToolbarButtons({
    'archive-toggle': { 
      icon: isArchived ? 'pi pi-inbox' : 'pi pi-archive',
      tooltip: isArchived ? 'Unarchive' : 'Archive'
    }
  });
}
```

### 3. Реакция на другие события

```typescript
onDataLoading(loading: boolean): void {
  this.updateToolbarButton('refresh-things', { 
    disabled: loading,
    icon: loading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'
  });
}
```

## Тестирование

### Unit Test пример

```typescript
it('should enable edit button when item is selected', () => {
  component.selectedThing = { id: 1, shortDescription: 'Test' };
  component.onSelectionChange();
  
  const buttons = component.toolbarService.getButtons();
  const editButton = buttons.find(b => b.id === 'edit-thing');
  
  expect(editButton?.disabled).toBe(false);
});

it('should disable edit button when no item is selected', () => {
  component.selectedThing = null;
  component.onSelectionChange();
  
  const buttons = component.toolbarService.getButtons();
  const editButton = buttons.find(b => b.id === 'edit-thing');
  
  expect(editButton?.disabled).toBe(true);
});
```

## Производительность

### Оптимизация обновлений

```typescript
// ✅ ХОРОШО: Одно обновление для нескольких кнопок
this.updateToolbarButtons({
  'edit-thing': { disabled: false },
  'delete-thing': { disabled: false }
});

// ❌ ПЛОХО: Множественные обновления
this.updateToolbarButton('edit-thing', { disabled: false });
this.updateToolbarButton('delete-thing', { disabled: false });
```

### BehaviorSubject оптимизирует изменения
`BehaviorSubject` эффективно управляет подписками и гарантирует, что UI обновляется только при реальных изменениях данных.

## Заключение

Реактивная система кнопок тулбара предоставляет:
- ✅ Автоматическую синхронизацию UI с состоянием компонента
- ✅ Чистый, декларативный код
- ✅ Контекстную осведомлённость команд
- ✅ Гибкость для сложных сценариев
- ✅ Типобезопасность через TypeScript
- ✅ Предотвращение ошибок через disabled state
