export class CompletionError extends Error {
  public message: string;
  public type?: string;
  public param?: string;
  public code?: string;

  constructor(
    message: string,
    type?: string,
    param?: string,
    code?: string,
  ) {
    super(message);
    this.message = message;
    this.type = type;
    this.param = param;
    this.code = code;
  }
}