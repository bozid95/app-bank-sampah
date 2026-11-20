/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: {
      id: number;
      username: string;
      role: 'ADMIN' | 'USER';
      customerId: number | null;
    } | null;
    config: import('./lib/config').AppConfigData;
  }
}
