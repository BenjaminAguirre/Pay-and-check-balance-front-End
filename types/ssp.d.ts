interface Window {
    ssp: {
      request(method: string, parameters: {
        message?: string;
        amount?: string;
        address?: string;
        chain?: string;
      }): Promise<{
        status: string;
        result?: string;
        address?: string;
        signature?:string;
        message?:string;
        data?: string;
        txid?: string;      
      }>;
    };
  }

 