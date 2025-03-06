import { IUserRepository, IPostRepository, IAuthRepository, IStorageRepository } from "./interfaces";
import { SupabaseUserRepository } from "./supabase/UserRepository";
import { SupabasePostRepository } from "./supabase/PostRepository";
import { SupabaseAuthRepository } from "./supabase/AuthRepository";
import { SupabaseStorageRepository } from "./supabase/StorageRepository";

// リポジトリのインスタンスを一元管理するシングルトンファクトリ
class RepositoryFactory {
  private static userRepository: IUserRepository;
  private static postRepository: IPostRepository;
  private static authRepository: IAuthRepository;
  private static storageRepository: IStorageRepository;

  // ユーザーリポジトリのインスタンスを取得
  static getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new SupabaseUserRepository();
    }
    return this.userRepository;
  }

  // 投稿リポジトリのインスタンスを取得
  static getPostRepository(): IPostRepository {
    if (!this.postRepository) {
      this.postRepository = new SupabasePostRepository();
    }
    return this.postRepository;
  }

  // 認証リポジトリのインスタンスを取得
  static getAuthRepository(): IAuthRepository {
    if (!this.authRepository) {
      this.authRepository = new SupabaseAuthRepository();
    }
    return this.authRepository;
  }

  // ストレージリポジトリのインスタンスを取得
  static getStorageRepository(): IStorageRepository {
    if (!this.storageRepository) {
      this.storageRepository = new SupabaseStorageRepository();
    }
    return this.storageRepository;
  }

  // テスト用にリポジトリをモックに置き換えるメソッド
  static setUserRepository(repository: IUserRepository): void {
    this.userRepository = repository;
  }

  static setPostRepository(repository: IPostRepository): void {
    this.postRepository = repository;
  }

  static setAuthRepository(repository: IAuthRepository): void {
    this.authRepository = repository;
  }

  static setStorageRepository(repository: IStorageRepository): void {
    this.storageRepository = repository;
  }
}

export default RepositoryFactory;