import { Observable } from 'rxjs';

export abstract class CrudService<T, TA, TU> {
  abstract getAll(): Observable<T[]>;
  abstract getById(id: string): Observable<T>;
  abstract add(item: TA): Observable<T>;
  abstract update(item: TU): Observable<void>;
  abstract delete(id: string): Observable<void>;
}
