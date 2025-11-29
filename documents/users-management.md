# Управление пользователями - Документация

## Обзор

Создан Angular сервис `AuthService` для управления аутентификацией и авторизацией пользователей в приложении Plantour. Сервис поддерживает две роли: **Администраторы** и **Участники**.

## Ключевые особенности

### Единое хранилище токенов
- Токены сохраняются в `localStorage` под одним именем: `plantour_auth_token` (access token) и `plantour_refresh_token` (refresh token)
- Приложение может работать **либо как Администратор, либо как Участник**, но не одновременно
- При входе новой роли, старые токены автоматически перезаписываются

### Поддерживаемые роли
1. **Admin (Администратор)** - управляет турами и участниками
2. **Participant (Участник)** - привязан к администратору, входит по коду доступа

## Структура файлов

### Новые файлы

```
plantour-client/src/app/
├── models/
│   └── auth.models.ts          # TypeScript интерфейсы для всех моделей аутентификации
└── services/
    └── auth.service.ts          # Основной сервис управления пользователями
```

### Документация
```
documents/
└── users-management.md          # Этот файл
```

## Модели данных

### Модели запросов

**SignUpRequest** - регистрация администратора:
```typescript
{
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}
```

**SignInRequest** - вход администратора:
```typescript
{
  email: string;
  password: string;
}
```

**SignUpParticipantRequest** - регистрация участника:
```typescript
{
  adminId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
}
```

**SignInParticipantRequest** - вход участника:
```typescript
{
  accessCode: string;  // 8-символьный код
  password?: string;
}
```

### Модели ответов

**AuthResponse** - ответ для администратора:
```typescript
{
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
```

**ParticipantAuthResponse** - ответ для участника:
```typescript
{
  participantId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accessCode: string;
  adminId: string;
  adminEmail: string;
  adminFirstName?: string;
  adminLastName?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  role: string;
}
```

**CurrentUser** - модель текущего пользователя:
```typescript
{
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  role: 'Admin' | 'Participant';
  accessCode?: string;      // только для участников
  adminId?: string;          // только для участников
  adminEmail?: string;       // только для участников
}
```

## API сервиса AuthService

### Методы аутентификации

#### Администраторы

```typescript
// Регистрация администратора
signUpAdmin(request: SignUpRequest): Observable<AuthResponse>

// Вход администратора
signInAdmin(request: SignInRequest): Observable<AuthResponse>
```

#### Участники

```typescript
// Регистрация участника (требует токен администратора)
signUpParticipant(request: SignUpParticipantRequest): Observable<ParticipantAuthResponse>

// Вход участника по коду доступа
signInParticipant(request: SignInParticipantRequest): Observable<ParticipantAuthResponse>
```

### Методы управления токенами

```typescript
// Обновление токена
refreshToken(refreshToken?: string): Observable<RefreshTokenResponse>

// Отзыв токена (выход)
revokeToken(refreshToken?: string): Observable<{ message: string }>

// Валидация токена
validateToken(): Observable<ValidateTokenResponse>

// Получение access token
getAccessToken(): string | null

// Получение refresh token
getRefreshToken(): string | null
```

### Методы работы с текущим пользователем

```typescript
// Получение текущего пользователя (Observable)
currentUser$: Observable<CurrentUser | null>

// Получение текущего пользователя (синхронно)
getCurrentUser(): CurrentUser | null

// Получение пользователя из токена
getCurrentUserFromToken(): CurrentUser | null

// Получение полного имени
getUserFullName(): string

// Получение роли
getUserRole(): 'Admin' | 'Participant' | null

// Проверка роли администратора
isAdmin(): boolean

// Проверка роли участника
isParticipant(): boolean
```

### Методы проверки статуса

```typescript
// Проверка аутентификации
isAuthenticated(): boolean

// Проверка истечения токена
isTokenExpired(token: string): boolean

// Выход из системы
logout(): void
```

## Примеры использования

### 1. Регистрация и вход администратора

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export class AdminLoginComponent {
  private authService = inject(AuthService);

  // Регистрация
  signUp() {
    this.authService.signUpAdmin({
      email: 'admin@example.com',
      password: 'password123',
      firstName: 'Иван',
      lastName: 'Иванов',
      phone: '+79991234567'
    }).subscribe({
      next: (response) => {
        console.log('Администратор зарегистрирован:', response);
        // Токены автоматически сохранены
      },
      error: (error) => console.error('Ошибка регистрации:', error)
    });
  }

  // Вход
  signIn() {
    this.authService.signInAdmin({
      email: 'admin@example.com',
      password: 'password123'
    }).subscribe({
      next: (response) => {
        console.log('Администратор вошел:', response);
        // Токены автоматически сохранены
      },
      error: (error) => console.error('Ошибка входа:', error)
    });
  }
}
```

### 2. Регистрация и вход участника

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export class ParticipantLoginComponent {
  private authService = inject(AuthService);

  // Регистрация участника (выполняется администратором)
  signUpParticipant() {
    const currentUser = this.authService.getCurrentUser();
    
    this.authService.signUpParticipant({
      adminId: currentUser!.id,
      email: 'participant@example.com',
      firstName: 'Петр',
      lastName: 'Петров',
      phone: '+79997654321',
      password: 'pass123'  // опционально
    }).subscribe({
      next: (response) => {
        console.log('Участник зарегистрирован:', response);
        console.log('Код доступа:', response.accessCode);
      },
      error: (error) => console.error('Ошибка регистрации:', error)
    });
  }

  // Вход участника по коду
  signInParticipant() {
    this.authService.signInParticipant({
      accessCode: 'ABC12345',
      password: 'pass123'  // если был установлен
    }).subscribe({
      next: (response) => {
        console.log('Участник вошел:', response);
        // Токены автоматически сохранены
      },
      error: (error) => console.error('Ошибка входа:', error)
    });
  }
}
```

### 3. Работа с текущим пользователем

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { CurrentUser } from './models/auth.models';

export class UserProfileComponent implements OnInit {
  private authService = inject(AuthService);
  currentUser: CurrentUser | null = null;

  ngOnInit() {
    // Подписка на изменения пользователя
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Текущий пользователь:', user);
    });

    // Или получить синхронно
    const user = this.authService.getCurrentUser();
    console.log('Полное имя:', this.authService.getUserFullName());
    console.log('Роль:', this.authService.getUserRole());
    console.log('Это админ?', this.authService.isAdmin());
    console.log('Это участник?', this.authService.isParticipant());
  }

  displayUserInfo() {
    const user = this.currentUser;
    if (!user) return 'Не авторизован';

    if (user.role === 'Admin') {
      return `Администратор: ${user.fullName} (${user.email})`;
    } else {
      return `Участник: ${user.fullName} (Код: ${user.accessCode})`;
    }
  }
}
```

### 4. Защита маршрутов (Guard)

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

// Guard только для администраторов
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

// Guard только для участников
export const participantGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isParticipant()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
```

Использование в маршрутах:
```typescript
import { Routes } from '@angular/router';
import { authGuard, adminGuard, participantGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'participant', 
    component: ParticipantComponent,
    canActivate: [participantGuard]
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard]
  }
];
```

### 5. Обновление токена

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export class TokenComponent {
  private authService = inject(AuthService);

  refreshToken() {
    this.authService.refreshToken().subscribe({
      next: (response) => {
        console.log('Токен обновлен:', response);
        // Новые токены автоматически сохранены
      },
      error: (error) => {
        console.error('Ошибка обновления токена:', error);
        this.authService.logout();
      }
    });
  }

  logout() {
    const refreshToken = this.authService.getRefreshToken();
    if (refreshToken) {
      this.authService.revokeToken(refreshToken).subscribe({
        next: () => {
          console.log('Выход выполнен');
          // Токены автоматически удалены
        },
        error: (error) => {
          console.error('Ошибка выхода:', error);
          this.authService.logout(); // Очистка локально
        }
      });
    } else {
      this.authService.logout();
    }
  }
}
```

### 6. Интеграция с HTTP Interceptor

Обновите существующий `jwt.interceptor.ts`:

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
```

### 7. Отображение информации в шаблоне

```html
<!-- app.component.html -->
<div class="user-info" *ngIf="authService.isAuthenticated()">
  <p>Добро пожаловать, {{ authService.getUserFullName() }}!</p>
  <p>Роль: {{ authService.getUserRole() }}</p>
  
  <div *ngIf="authService.isAdmin()">
    <p>Панель администратора</p>
  </div>
  
  <div *ngIf="authService.isParticipant()">
    <p>Панель участника</p>
    <p>Код доступа: {{ (authService.currentUser$ | async)?.accessCode }}</p>
  </div>
  
  <button (click)="logout()">Выйти</button>
</div>

<div *ngIf="!authService.isAuthenticated()">
  <a routerLink="/login">Войти</a>
</div>
```

```typescript
// app.component.ts
import { Component, inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
```

## Соответствие API endpoints

Сервис полностью соответствует `AuthController` на сервере:

| Endpoint | Метод сервиса | HTTP метод | Описание |
|----------|---------------|------------|----------|
| `/api/auth/admin/signup` | `signUpAdmin()` | POST | Регистрация администратора |
| `/api/auth/admin/signin` | `signInAdmin()` | POST | Вход администратора |
| `/api/auth/participant/signup` | `signUpParticipant()` | POST | Регистрация участника |
| `/api/auth/participant/signin` | `signInParticipant()` | POST | Вход участника |
| `/api/auth/refresh` | `refreshToken()` | POST | Обновление токена |
| `/api/auth/revoke` | `revokeToken()` | POST | Отзыв токена |
| `/api/auth/validate` | `validateToken()` | GET | Валидация токена |

## Безопасность

### Хранение токенов
- **Access Token**: `plantour_auth_token` в `localStorage`
- **Refresh Token**: `plantour_refresh_token` в `localStorage`
- Одно приложение = одна роль (Admin или Participant)

### Автоматическая очистка
- При logout() все токены удаляются
- При входе новой роли старые токены перезаписываются
- При истечении токена пользователь считается неавторизованным

### Проверка токенов
- Автоматическая проверка срока действия при вызове `isAuthenticated()`
- Декодирование JWT для извлечения информации о пользователе
- Безопасная обработка ошибок декодирования

## Зависимости

Убедитесь, что установлена библиотека для работы с JWT:

```bash
npm install jwt-decode
```

## Рекомендации по использованию

1. **Единая точка входа**: Используйте `AuthService` для всех операций аутентификации
2. **Подписка на currentUser$**: Используйте Observable для отслеживания изменений пользователя
3. **Guards для маршрутов**: Защищайте роуты с помощью guards
4. **HTTP Interceptor**: Автоматически добавляйте токен ко всем запросам
5. **Обработка ошибок**: Всегда обрабатывайте ошибки при вызове методов сервиса
6. **Logout при ошибке**: При ошибке обновления токена выполняйте logout

## Решение проблем

### Токен не сохраняется
- Проверьте, что браузер поддерживает `localStorage`
- Убедитесь, что нет ошибок в консоли

### Пользователь не определяется
- Проверьте формат JWT токена
- Убедитесь, что сервер возвращает правильные поля в токене
- Проверьте срок действия токена

### Конфликт ролей
- Система автоматически перезаписывает токены при новом входе
- Для переключения ролей выполните logout, затем войдите с другой ролью

## Дополнительная информация

- Токены автоматически добавляются к HTTP запросам через `jwtInterceptor`
- CurrentUser автоматически обновляется при login/logout
- Все методы возвращают RxJS Observable для удобной работы с асинхронными операциями
- Сервис является singleton (`providedIn: 'root'`)

---

**Дата создания**: 2025-11-29  
**Версия**: 1.0  
**Автор**: GitHub Copilot CLI
