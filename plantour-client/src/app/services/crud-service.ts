import { Observable } from 'rxjs';

// export abstract class CrudService<T, TA, TU> {
//   abstract getAll(tripId?: string): Observable<T[]>;
//   abstract getById(id: string): Observable<T>;
//   abstract add(item: TA): Observable<T>;
//   abstract update(item: TU): Observable<void>;
//   abstract delete(id: string): Observable<void>;
//   abstract addFromDic(data: {tripId: string, ids: string[]}): Observable<number>;
// }
export interface CrudService<T, TA, TU> {
  getAll(tripId?: string | null): Observable<T[]>;
  getById(id: string, tripId?: string | null): Observable<T>;
  add(item: TA): Observable<T>;
  update(item: TU): Observable<void>;
  delete(id: string, tripId?: string | null): Observable<void>;
}

export interface MultipleIdsRequest {
  collectionId: string;
  ids: string[];
  id?: string | null;
}
export interface ArrayOfGuidsRequest {
  ids: string[];
}


export interface FromDicService {
  addFromDic(data: MultipleIdsRequest): Observable<number>;
  deleteFromDic(data: MultipleIdsRequest): Observable<number>;
}

export interface PackingService {
  pack(data: MultipleIdsRequest): Observable<number>;
  unpack(data: MultipleIdsRequest): Observable<number>;
}

