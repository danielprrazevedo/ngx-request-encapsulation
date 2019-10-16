import { Observable } from 'rxjs';
import { Page } from './page';

export interface InterfaceRequest<T, U = Page<T>> {

  /**
   * Buscar um registro
   *
   * @param id Para capturar o registro por um id
   *
   * @return Observable object
   */
  get(id: number): Observable<T|any>;

  /**
   * Retorna um único registro vinculado ao id
   * em uma action específica
   *
   * @param action para acessar uma action personalizada no `path`
   * @param id Para capturar o registro por um id
   *
   * @return Observable object
   */
  get(action: string, id: number): Observable<T|any>;

  /**
   * Retorna um único registro vinculado ao id
   * em uma action específica
   *
   * @param action para acessar uma action personalizada no `path`
   * @param query Parametros para comparação
   *
   * @return Observable object
   */
  get(action?: string, query?: any): Observable<T[]|any>;

  /**
   * Implementação concreta do get
   *
   * @param action para acessar uma action personalizada no `path`
   * @param idOrQuery Parametros para comparação
   *
   * @return Observable object
   */
  get(action?: any, idOrQuery?: number|any): Observable<T|any> | Observable<T[]|any>;

  /**
   * Retorna um objeto do tipo página<T>
   *
   * @param page Número da página requisitada
   */
  getPage(page: number): Observable<U>;

  /**
   * Retorna um objeto do tipo página<T>
   *
   * @param action Ação da requisição
   * @param page Número da página requisitada
   * @param perPage Quantidade de registros de retorno
   */
  getPage(action?: string, page?: number, perPage?: number): Observable<U>;

  /**
   * Retorna um objeto do tipo página<T>
   *
   * @param query Condicional de consulta, será enviado por query-params
   * @param page Número da página requisitada
   * @param perPage Quantidade de registros de retorno
   */
  getQueryPage(query: any, page?: number, perPage?: number): Observable<U>;

  /**
   * Retorna um objeto do tipo página<T>
   *
   * @param action Ação da requisição ou número da página requisitada
   * @param query Condicional de consulta, será enviado por query-params
   * @param page Número da página requisitada
   * @param perPage Quantidade de registros de retorno
   */
  getQueryPage(action?: string, query?: any, page?: number, perPage?: number): Observable<U>;

  /**
   * Envio de modelo por post para criação
   * em action específica
   *
   * @param model Modelo de classe a ser inserido no banco
   * @param action Action que será encaminhado o formulário
   */
  post(model: T|any, action?: string): Observable<T|any>;


  /**
   * Modelo enviado para edição por Id
   *
   * @param model  Modelo enviado na requisição
   * @param id Id do modelo a ser modificado
   * @param action Action de destino
   */
  put(model: T|any, id: number, action?: string): Observable<T|any>;

  /**
   * Modelo enviado para edição por id ou query em uma action específica
   *
   * @param model Modelo enviado na requisição
   * @param idOrQuery Id ou Objeto com parametros para comparação
   * @param action Action de destino
   */
  put(model: T|any, idOrQuery?: number|any, action?: string): Observable<T|any>;


  /**
   * Envio de registro para deletar na controller definida no `path`
   *
   * @param action Action de destino na controller do `path`
   */
  delete(action: string): Observable<boolean|any>;

  /**
   * Envio de registro para deletar na controller definida no `path`
   *
   * @param idOrQuery Id ou paramêtros do registro a ser deletado
   * @param action Action de destino na controller do `path`
   */
  delete(idOrQuery: number|any, action?: string): Observable<boolean|any>;

  /**
   * Realiza upload retornando progresso
   *
   * @param form Formulário da requisição
   */
  upload(form: any, action?: string): Observable<any>;

  /**
   * Realiza download retornando progresso
   *
   * @param form Formulário da requisição
   * @param action Action de destino
   */
  upload(form: any, action: string): Observable<any>;

  /**
   * Realiza upload retornando progresso
   *
   * @param form Formulário da requisição
   * @param idOrQuery Id para requisição
   * @param action Action de destino
   *
   */
  upload(form: any, idOrQuery: number|any, action?: string): Observable<any>;

  /**
   * Realiza download retornando progresso
   *
   * @param action Action de destino
   */
  download(action: string): Observable<any>;

  /**
   * Realiza download retornando progresso
   *
   * @param idOrQuery Objeto com parametros para comparação
   * @param action Action de destino
   */
  download(idOrQuery?: number|any, action?: string): Observable<any>;
}
