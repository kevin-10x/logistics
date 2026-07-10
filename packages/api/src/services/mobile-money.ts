import { PaymentMethod } from "@afrilogistics/shared";
import { generateId } from "@afrilogistics/shared";

interface MomoConfig {
  apiKey: string;
  baseUrl: string;
  environment: "sandbox" | "production";
}

interface MomoPayment {
  id: string;
  phone: string;
  amount: number;
  currency: string;
  provider: "mtn_momo" | "airtel_money" | "mpesa" | "tigo_pesa" | "vodacom_mpesa";
  reference: string;
  status: "pending" | "processing" | "successful" | "failed" | "timeout";
  orderId?: string;
  organizationId: string;
  metadata: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

interface MomoCollectionRequest {
  amount: number;
  currency: string;
  phone: string;
  provider: string;
  orderId: string;
  organizationId: string;
  description: string;
}

interface MomoDisbursementRequest {
  amount: number;
  currency: string;
  phone: string;
  provider: string;
  reference: string;
  description: string;
}

const PROVIDER_CONFIGS: Record<string, { name: string; countries: string[]; currencies: string[] }> = {
  mtn_momo: { name: "MTN Mobile Money", countries: ["NG", "GH", "UG", "CM", "CI", "RW", "ZM"], currencies: ["NGN", "GHS", "UGX", "XAF", "XOF", "RWF", "ZMW"] },
  airtel_money: { name: "Airtel Money", countries: ["NG", "KE", "UG", "TZ", "ZM", "RW", "MG"], currencies: ["NGN", "KES", "UGX", "TZS", "ZMW", "RWF", "MGA"] },
  mpesa: { name: "M-Pesa", countries: ["KE", "TZ"], currencies: ["KES", "TZS"] },
  tigo_pesa: { name: "Tigo Pesa", countries: ["TZ", "UG"], currencies: ["TZS", "UGX"] },
  vodacom_mpesa: { name: "Vodacom M-Pesa", countries: ["TZ", "DRC"], currencies: ["TZS", "CDF"] },
};

const COUNTRY_PROVIDERS: Record<string, string[]> = {
  NG: ["mtn_momo", "airtel_money"],
  KE: ["mpesa", "airtel_money"],
  GH: ["mtn_momo"],
  TZ: ["mpesa", "tigo_pesa", "airtel_money", "vodacom_mpesa"],
  UG: ["mtn_momo", "airtel_money", "tigo_pesa"],
  CM: ["mtn_momo"],
  CI: ["mtn_momo"],
  RW: ["mtn_momo", "airtel_money"],
  ZM: ["mtn_momo", "airtel_money"],
  ZA: [],
  ET: [],
};

export class MobileMoneyService {
  private config: MomoConfig;
  private transactions: Map<string, MomoPayment> = new Map();

  constructor(config: MomoConfig) {
    this.config = config;
  }

  async initiateCollection(request: MomoCollectionRequest): Promise<MomoPayment> {
    const payment: MomoPayment = {
      id: generateId(),
      phone: request.phone,
      amount: request.amount,
      currency: request.currency,
      provider: request.provider as any,
      reference: `AFRI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: "pending",
      orderId: request.orderId,
      organizationId: request.organizationId,
      metadata: { description: request.description },
      createdAt: new Date().toISOString(),
    };

    this.transactions.set(payment.id, payment);

    if (this.config.environment === "sandbox") {
      payment.status = "processing";
      setTimeout(() => {
        payment.status = "successful";
        payment.completedAt = new Date().toISOString();
      }, 3000);
    } else {
      await this.callProviderAPI("collection", request, payment.reference);
    }

    return payment;
  }

  async initiateDisbursement(request: MomoDisbursementRequest): Promise<MomoPayment> {
    const payment: MomoPayment = {
      id: generateId(),
      phone: request.phone,
      amount: request.amount,
      currency: request.currency,
      provider: request.provider as any,
      reference: request.reference,
      status: "pending",
      organizationId: "",
      metadata: { description: request.description },
      createdAt: new Date().toISOString(),
    };

    this.transactions.set(payment.id, payment);

    if (this.config.environment === "sandbox") {
      payment.status = "successful";
      payment.completedAt = new Date().toISOString();
    }

    return payment;
  }

  async checkTransactionStatus(transactionId: string): Promise<MomoPayment | null> {
    return this.transactions.get(transactionId) || null;
  }

  async refundTransaction(transactionId: string): Promise<MomoPayment | null> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return null;
    transaction.status = "failed";
    transaction.metadata = { ...transaction.metadata, refunded: true, refundedAt: new Date().toISOString() };
    return transaction;
  }

  getAvailableProviders(country: string): string[] {
    return COUNTRY_PROVIDERS[country] || [];
  }

  getProviderInfo(provider: string) {
    return PROVIDER_CONFIGS[provider];
  }

  getTransactionHistory(organizationId: string, limit: number = 50): MomoPayment[] {
    return Array.from(this.transactions.values())
      .filter((t) => t.organizationId === organizationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  getTransactionStats(organizationId: string) {
    const txns = Array.from(this.transactions.values()).filter((t) => t.organizationId === organizationId);
    return {
      total: txns.length,
      successful: txns.filter((t) => t.status === "successful").length,
      failed: txns.filter((t) => t.status === "failed").length,
      pending: txns.filter((t) => t.status === "pending" || t.status === "processing").length,
      totalAmount: txns.filter((t) => t.status === "successful").reduce((s, t) => s + t.amount, 0),
      byProvider: this.groupByProvider(txns),
    };
  }

  private groupByProvider(txns: MomoPayment[]): Record<string, { count: number; amount: number }> {
    const grouped: Record<string, { count: number; amount: number }> = {};
    for (const t of txns) {
      if (!grouped[t.provider]) grouped[t.provider] = { count: 0, amount: 0 };
      grouped[t.provider].count++;
      if (t.status === "successful") grouped[t.provider].amount += t.amount;
    }
    return grouped;
  }

  private async callProviderAPI(type: string, request: any, reference: string): Promise<void> {
    console.log(`[MoMo API] ${type}: ${reference} - ${request.amount} ${request.currency} to ${request.phone}`);
  }

  formatPhoneNumber(phone: string, country: string): string {
    let cleaned = phone.replace(/\D/g, "");
    const countryCodes: Record<string, string> = {
      NG: "234", KE: "254", GH: "233", TZ: "255", UG: "256", ZA: "27",
    };
    const code = countryCodes[country];
    if (code && !cleaned.startsWith(code)) {
      cleaned = code + cleaned;
    }
    return `+${cleaned}`;
  }
}
