# Реализация canMatch для динамического выбора Landing компонента

## Описание

Реализована логика `canMatch` для динамического выбора Landing компонента в зависимости от того, зарегистрирован ли текущий пользователь.

## Реализованные файлы

### 1. Guard'ы для Landing страниц

**Файл**: `projects/shared-lib/src/guards/landing-guard.ts`

Созданы два `canMatch` guard'а:

- **`landingNewUserGuard`** - возвращает `true` для НЕавторизованных пользователей
- **`landingRegisteredUserGuard`** - возвращает `true` для авторизованных пользователей

```typescript
import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { UsersService } from '../services/users-service';

export const landingNewUserGuard: CanMatchFn = () => {
  const usersService = inject(UsersService);
  return !usersService.isAuthenticated;
};

export const landingRegisteredUserGuard: CanMatchFn = () => {
  const usersService = inject(UsersService);
  return usersService.isAuthenticated;
};
```

### 2. Экспорт guard'ов

**Файл**: `projects/shared-lib/src/public-api.ts`

Добавлен экспорт новых guard'ов:
```typescript
export * from './guards/landing-guard';
```

### 3. Настройка роутинга

**Файл**: `projects/mobile-app/src/app/app.routes.ts`

Настроены два маршрута с одинаковым путем `''`, но с разными `canMatch` guard'ами:

```typescript
export const routes: Routes = [
  {
    path: '',
    canMatch: [landingNewUserGuard],
    loadComponent: () => import('./components/landing-new-user/landing-new-user.component')
      .then(m => m.LandingNewUserComponent)
  },
  {
    path: '',
    canMatch: [landingRegisteredUserGuard],
    loadComponent: () => import('./components/landing-registered-user/landing-registered-user.component')
      .then(m => m.LandingRegisteredUserComponent)
  },
  // ... остальные маршруты
];
```

### 4. Упрощение компонента LandingNewUser

**Файл**: `projects/mobile-app/src/app/components/landing-new-user/landing-new-user.component.ts`

Удалена ручная проверка авторизации в `ngOnInit()`, так как теперь роутинг автоматически обрабатывается через `canMatch`:

- Удален `OnInit` интерфейс
- Удален метод `ngOnInit()`
- Удален импорт `UsersService`
- Удален `inject(UsersService)`

## Как это работает

### canMatch vs canActivate

`canMatch` выполняется **до** сопоставления маршрута, в отличие от `canActivate`, который выполняется после.

Это позволяет иметь несколько маршрутов с одинаковым путем, и Angular выберет первый, для которого `canMatch` вернет `true`.

### Логика выбора компонента

1. **Неавторизованный пользователь** (`isAuthenticated = false`):
   - `landingNewUserGuard` возвращает `true` → показывается `LandingNewUserComponent` (маркетинговая страница)
   - `landingRegisteredUserGuard` возвращает `false` → второй маршрут пропускается

2. **Авторизованный пользователь** (`isAuthenticated = true`):
   - `landingNewUserGuard` возвращает `false` → первый маршрут пропускается
   - `landingRegisteredUserGuard` возвращает `true` → показывается `LandingRegisteredUserComponent` (dashboard)

### Проверка авторизации

Используется существующий метод `UsersService.isAuthenticated`:

```typescript
get isAuthenticated(): boolean {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return false;
  }
  return !this.isTokenExpired(token);
}
```

Этот метод:
- Проверяет наличие `accessToken` в localStorage
- Проверяет, не истек ли срок действия токена через `isTokenExpired()`
- Возвращает `true` только если токен существует и не истек

## Преимущества решения

1. **Декларативность** - логика выбора компонента описана в конфигурации маршрутов
2. **Чистота кода** - компоненты не содержат логику проверки авторизации и редиректов
3. **Переиспользуемость** - guard'ы могут использоваться и для других маршрутов
4. **Расширяемость** - легко добавить дополнительные условия в guard'ы

## Тестирование

### Сборка проекта
```bash
ng build mobile-app --configuration production
```

✅ Сборка успешна

### Как протестировать вручную

1. Запустить приложение:
   ```bash
   npm run m
   ```

2. **Тест неавторизованного пользователя**:
   - Очистить localStorage (DevTools → Application → Local Storage → Clear All)
   - Перейти на `http://localhost:4202/`
   - Должен показаться `LandingNewUserComponent` (маркетинговая страница)

3. **Тест авторизованного пользователя**:
   - Зарегистрироваться через кнопку "Get Started" или вручную добавить токен в localStorage
   - Перейти на `http://localhost:4202/`
   - Должен показаться `LandingRegisteredUserComponent` (dashboard со статистикой)

4. **Тест переключения**:
   - Находясь на странице авторизованного пользователя, очистить localStorage
   - Обновить страницу (F5)
   - Должен показаться компонент для неавторизованных пользователей
