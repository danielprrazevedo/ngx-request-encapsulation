import { HttpClient, HttpRequest, HttpEventType } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, last } from 'rxjs/operators';
import { InterfaceRequest } from './interface-request';
import { Page } from './page';

export abstract class AbstractRequest<T, U = Page<T>> implements InterfaceRequest<T, U> {
  constructor(
    protected http: HttpClient
  ) { }

  public uploadProgress: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public downloadProgress: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  /**
   * Service Request Url Basis
   */
  protected base_url = '';

  /**
   * Api path and version for service request
   */
  protected path_version_api = 'api/';

  /**
   * Base path to service consumed
   */
  protected path = '';

  /**
   * Assembly of the request url.
   *
   * @param action Defines what action the url should point to within the defined path
   * @param idOrQuery Defines the parameters sent in the request
   */
  protected getUrl(action: string = '', idOrQuery: any = null): string {
    if (action !== '') {
      action = '/' + action;
    }
    let params = '';
    if (typeof idOrQuery === 'number') {
      params = '/' + idOrQuery.toString();
    } else if (idOrQuery != null) {
      params = '?' + Object.keys(idOrQuery).map(key => key + '=' + idOrQuery[key]).join('&');
    }

    return `${this.base_url}${this.path_version_api}${this.path}${action}${params}`;
  }

  /**
   * Concrete implementation of get
   *
   * @param action Action to access a custom action in `path`
   * @param idOrQuery Parameters for comparison
   *
   * @return Observable object
   */
  public get(action?: any, idOrQuery?: number|any): Observable<T|any> | Observable<T[]|any> {
    return this.http.get<T>(this.getUrl(action, idOrQuery));
  }

  /**
   * Returns an object of type `U`
   *
   * @param action Request action or requested page number
   * @param page Requested page number
   * @param per_page Number of Return Records
   */
  public getPage(action: any = 'page', page: number = 0, per_page = 10): Observable<U> {
    if (typeof action === 'number') {
      page = action;
      action = 'page';
    }
    return this.http.get<U>(this.getUrl(`${action}/${page}`, per_page));
  }

  /**
   * Returns an object of type `U`
   *
   * @param action Request action or requested page number
   * @param query Query conditional, will be sent by query-params
   * @param page Requested page number
   * @param perPage Number of Return Records
   */
  public getQueryPage(action: any = 'page-query', query: any = {}, page: number = 0, perPage = 10): Observable<U> {
    if (typeof query === 'number') {
      perPage = page > 0 ? page : 10;
      page = query;
      query = {};
    }

    if (typeof action === 'object') {
      query = action;
      action = 'page-query';
    }

    return this.http.get<U>(this.getUrl(`${action}/${page}/${perPage}`, query));
  }

  /**
   * Concrete Post Implementation
   *
   * @param model Class template to insert into bank
   * @param action Action that will be sent the form
   */
  public post(model: T|any, action?: string): Observable<T|any> {
    return this.http.post<T|any>(this.getUrl(action), model, { reportProgress: true });
  }

  /**
   * Template submitted for editing by id or query in a specific action
   *
   * @param model Template submitted on request
   * @param idOrQuery Id or Object with parameters for comparison
   * @param action Target Action
   */
  public put(model: T|any, idOrQuery?: number|any, action?: string): Observable<T|any> {
    return this.http.put<T>(this.getUrl(action, idOrQuery), model);
  }

  /**
   * Sending record(s) to delete in controller defined in `path`
   *
   * @param idOrQuery Id or Parameters for comparison
   * @param action Target action in `path` controller
   */
  public delete(idOrQuery: number|any, action?: string): Observable<boolean|any> {
    if (typeof idOrQuery === 'string') {
      action = idOrQuery;
      idOrQuery = null;
    }
    return this.http.delete(this.getUrl(action, idOrQuery));
  }

  /**
   * Uploads returning progress by POST
   *
   * @param form Form submitted on request
   * @param idOrQuery Id or Object with parameters for comparison
   * @param action Target Action
   */
  public upload(form: any, idOrQuery?: number|any, action?: string): Observable<any> {
    if (typeof idOrQuery === 'string') {
      action = idOrQuery;
      idOrQuery = null;
    }
    const req = new HttpRequest('POST', this.getUrl(action, idOrQuery), form, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map(event => this.getStatusMessage(event)),
      tap(message => console.log(message)),
      last()
    );
  }

  /**
   * Download returning progress
   *
   * @param idOrQuery Object with parameters for comparison
   * @param action Target Action
   */
  public download(idOrQuery?: number|any, action?: string): Observable<any> {
    if (typeof idOrQuery === 'string') {
      action = idOrQuery;
      idOrQuery = null;
    }
    const req = new HttpRequest('GET', this.getUrl(action, idOrQuery), {
      responseType: 'arraybuffer',
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map(event => this.getStatusMessage(event)),
      tap(message => console.log(message)),
      last()
    );
  }

  private getStatusMessage(event) {
    let status;
    switch (event.type) {
      case HttpEventType.Sent:
        return `Uploading Files`;
      case HttpEventType.UploadProgress:
        status = Math.round(100 * event.loaded / event.total);
        this.uploadProgress.next(status);
        return `Files are ${status}% uploaded`;
      case HttpEventType.DownloadProgress:
        status = Math.round(100 * event.loaded / event.total);
        this.downloadProgress.next(status);
        return `Files are ${status}% downloaded`;
      case HttpEventType.Response:
        return event.body;
      default:
        return `Something went wrong`;
    }
  }
}
