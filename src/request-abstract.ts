import { HttpClient, HttpRequest, HttpEventType } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, last } from 'rxjs/operators';
import { RequestInterface } from './request-interface';
import { Page } from './page';

export abstract class AbstractRequest<T, U = Page<T>> implements RequestInterface<T, U> {
  constructor(
    protected http: HttpClient
  ) { }

  public uploadProgress: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public downloadProgress: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  /**
   * Base de url para requisição de serviço
   */
  protected base_url = '';

  /**
   * Path e version da api para requisição de serviço
   */
  protected path_version_api = 'api/';

  /**
   * Path base para o serviço consumido
   */
  protected path = '';

  /**
   * Motagem da url de requisição.
   *
   * @param action Define para qual action a url deve apontar dentro do path definido
   * @param idOrQuery Define os parâmetros enviados na requisição
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
   * Implementação concreta do get
   *
   * @param action para acessar uma action personalizada no `path`
   * @param idOrQuery Parametros para comparação
   *
   * @return Observable object
   */
  public get(action?: any, idOrQuery?: number|any): Observable<T|any> | Observable<T[]|any> {
    return this.http.get<T>(this.getUrl(action, idOrQuery));
  }

  /**
   * Retorna um objeto do tipo página<T>
   *
   * @param action Ação da requisição ou número da página requisitada
   * @param page Número da página requisitada
   * @param per_page Quantidade de registros de retorno
   */
  public getPage(action: any = 'page', page: number = 0, per_page = 10): Observable<U> {
    if (typeof action === 'number') {
      page = action;
      action = 'page';
    }
    return this.http.get<U>(this.getUrl(`${action}/${page}`, per_page));
  }

  /**
   * Retorna um objeto do tipo página<T>
   *
   * @param action Ação da requisição ou número da página requisitada
   * @param query Condicional de consulta, será enviado por query-params
   * @param page Número da página requisitada
   * @param perPage Quantidade de registros de retorno
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
   * Implementação concreta do post
   *
   * @param model Modelo de classe a ser inserido no banco
   * @param action Action que será encaminhado o formulário
   */
  public post(model: T|any, action?: string): Observable<T|any> {
    return this.http.post<T|any>(this.getUrl(action), model, { reportProgress: true });
  }

  /**
   * Modelo enviado para edição por id ou query em uma action específica
   *
   * @param model Modelo enviado na requisição
   * @param idOrQuery Id ou Objeto com parametros para comparação
   * @param action Action de destino
   */
  public put(model: T|any, idOrQuery?: number|any, action?: string): Observable<T|any> {
    return this.http.put<T>(this.getUrl(action, idOrQuery), model);
  }

  /**
   * Envio de registro(s) para deletar na controller definida no `path`
   *
   * @param idOrQuery Id ou Parâmetros para comparação
   * @param action Action de destino na controller do `path`
   */
  public delete(idOrQuery: number|any, action?: string): Observable<boolean|any> {
    if (typeof idOrQuery === 'string') {
      action = idOrQuery;
      idOrQuery = null;
    }
    return this.http.delete(this.getUrl(action, idOrQuery));
  }

  /**
   * Realiza upload retornando o progresso por POST
   *
   * @param form Formulário enviado na requisição
   * @param idOrQuery Id ou Objeto com parametros para comparação
   * @param action Action de destino
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
   * Realiza download retornando progresso
   *
   * @param idOrQuery Objeto com parametros para comparação
   * @param action Action de destino
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
