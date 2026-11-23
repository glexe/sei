// The TV provides webos-service at runtime; this is the part of its API the service uses.
declare module 'webos-service' {
  namespace Service {
    interface Message {
      payload: Record<string, unknown> | undefined;
      sender: string | undefined;
      method: string;
      respond(response: Record<string, unknown>): void;
    }
    interface Response {
      payload?: Record<string, any>;
    }
    interface Subscription {
      on(event: 'response', listener: (response: Response) => void): void;
      cancel(): void;
    }
  }
  class Service {
    constructor(id: string);
    register(method: string, handler: (message: Service.Message) => void): void;
    call(
      uri: string,
      params: Record<string, unknown>,
      callback: (response: Service.Response) => void,
    ): void;
    subscribe(uri: string, params: Record<string, unknown>): Service.Subscription;
  }
  export = Service;
}
