export class ConcurrencyManager {
  private static activeRequests: Map<string, number> = new Map();

  private static requestQueues: Map<string, Function[]> = new Map();

  static async request(domain: string, func: () => Promise<any>, maxConcurrent: number): Promise<any> {
    await this.waitForTurn(domain, maxConcurrent);

    try {
      const result = await func();
      return result;
    } finally {
      this.releaseNext(domain);
    }
  }

  private static async waitForTurn(domain: string, maxConcurrent: number): Promise<void> {
    const active = this.activeRequests.get(domain) || 0;
    if (active >= maxConcurrent) {
      await new Promise<void>((resolve) => {
        const queue = this.requestQueues.get(domain) || [];
        queue.push(resolve);
        this.requestQueues.set(domain, queue);
      });
    } else {
      this.activeRequests.set(domain, active + 1);
    }
  }

  private static releaseNext(domain: string): void {
    const queue = this.requestQueues.get(domain);
    if (queue && queue.length > 0) {
      const nextResolve = queue.shift();
      nextResolve();
    } else {
      const active = this.activeRequests.get(domain) || 0;
      this.activeRequests.set(domain, Math.max(0, active - 1));
    }
  }
}
