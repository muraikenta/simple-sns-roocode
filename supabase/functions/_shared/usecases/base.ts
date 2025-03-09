export abstract class BaseUseCase<TParams, TResult> {
  abstract execute(params: TParams, userId: string): Promise<TResult>;
}
