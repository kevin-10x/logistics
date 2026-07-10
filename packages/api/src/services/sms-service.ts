import { SmsNotification, Order } from "@afrilogistics/shared";
import { generateId } from "@afrilogistics/shared";

interface SmsTemplate {
  type: SmsNotification["type"];
  templates: Record<string, (data: Record<string, string>) => string>;
}

const SMS_TEMPLATES: Record<string, SmsTemplate> = {
  en: {
    type: "confirmation",
    templates: {
      confirmation: (d) => `AfriLogistics: Your order ${d.orderNumber} has been confirmed. Tracking: ${d.trackingUrl}`,
      update: (d) => `AfriLogistics: Order ${d.orderNumber} status: ${d.status}. ${d.message}`,
      delivery: (d) => `AfriLogistics: Order ${d.orderNumber} has been ${d.status}. ${d.message}`,
      payment: (d) => `AfriLogistics: Payment of ${d.amount} received for order ${d.orderNumber}. Thank you!`,
      otp: (d) => `Your verification code is: ${d.code}. Valid for 5 minutes.`,
    },
  },
  fr: {
    type: "confirmation",
    templates: {
      confirmation: (d) => `AfriLogistics: Votre commande ${d.orderNumber} est confirmée. Suivi: ${d.trackingUrl}`,
      update: (d) => `AfriLogistics: Commande ${d.orderNumber} statut: ${d.status}. ${d.message}`,
      delivery: (d) => `AfriLogistics: Commande ${d.orderNumber} a été ${d.status}. ${d.message}`,
      payment: (d) => `AfriLogistics: Paiement de ${d.amount} reçu pour la commande ${d.orderNumber}. Merci!`,
      otp: (d) => `Votre code de vérification est: ${d.code}. Valable 5 minutes.`,
    },
  },
  sw: {
    type: "confirmation",
    templates: {
      confirmation: (d) => `AfriLogistics: Oda yako ${d.orderNumber} imethibitishwa. Fuatilia: ${d.trackingUrl}`,
      update: (d) => `AfriLogistics: Oda ${d.orderNumber} hali: ${d.status}. ${d.message}`,
      delivery: (d) => `AfriLogistics: Oda ${d.orderNumber} imekuwa ${d.status}. ${d.message}`,
      payment: (d) => `AfriLogistics: Malipo ya ${damount} yamepokelewa kwa oda ${d.orderNumber}. Asante!`,
      otp: (d) => `Msimbo wako wa uthibitisho ni: ${d.code}. Halali kwa dakika 5.`,
    },
  },
  ha: {
    type: "confirmation",
    templates: {
      confirmation: (d) => `AfriLogistics: Ducin ku ${d.orderNumber} an tabbatar da shi. Biyan kuqi: ${d.trackingUrl}`,
      update: (d) => `AfriLogistics: Ducin ${d.orderNumber} matsayi: ${d.status}. ${d.message}`,
      delivery: (d) => `AfriLogistics: Ducin ${d.orderNumber} ya kasance ${d.status}. ${d.message}`,
      payment: (d) => `AfriLogistics: An karbi biyan kuqi na ${d.amount} don ducin ${d.orderNumber}. Na gode!`,
      otp: (d) => `Lambar tabbatarwar ku ita ce: ${d.code}. Yana da inganci na minti 5.`,
    },
  },
};

export class SmsService {
  private notifications: SmsNotification[] = [];
  private apiKey: string;
  private baseUrl: string;
  private sendingEnabled: boolean;

  constructor(config: { apiKey: string; baseUrl: string; sendingEnabled: boolean }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.sendingEnabled = config.sendingEnabled;
  }

  async sendNotification(
    order: Order,
    type: SmsNotification["type"],
    language: string = "en",
    additionalData: Record<string, string> = {}
  ): Promise<SmsNotification> {
    const templateSet = SMS_TEMPLATES[language] || SMS_TEMPLATES.en;
    const templateFn = templateSet.templates[type];

    const message = templateFn
      ? templateFn({
          orderNumber: order.orderNumber,
          status: order.status,
          trackingUrl: `https://track.afrilogistics.com/${order.id}`,
          amount: `${order.declaredValue} ${order.currency}`,
          message: additionalData.message || "",
          code: additionalData.code || "",
          ...additionalData,
        })
      : `Order ${order.orderNumber}: ${order.status}`;

    const notification: SmsNotification = {
      id: generateId(),
      orderId: order.id,
      phone: type === "otp" ? (additionalData.phone || order.senderPhone) : order.receiverPhone,
      message,
      type,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (this.sendingEnabled) {
      try {
        await this.sendViaProvider(notification);
        notification.status = "sent";
        notification.sentAt = new Date().toISOString();
      } catch (error) {
        notification.status = "failed";
      }
    } else {
      notification.status = "sent";
      notification.sentAt = new Date().toISOString();
    }

    this.notifications.push(notification);
    return notification;
  }

  private async sendViaProvider(notification: SmsNotification): Promise<void> {
    console.log(`[SMS] Sending to ${notification.phone}: ${notification.message}`);
  }

  async sendBulkNotifications(
    orders: Order[],
    type: SmsNotification["type"],
    language: string = "en"
  ): Promise<SmsNotification[]> {
    const results: SmsNotification[] = [];
    for (const order of orders) {
      const result = await this.sendNotification(order, type, language);
      results.push(result);
    }
    return results;
  }

  async sendOtp(phone: string, code: string, language: string = "en"): Promise<SmsNotification> {
    const notification: SmsNotification = {
      id: generateId(),
      orderId: "",
      phone,
      message: `Your verification code is: ${code}. Valid for 5 minutes.`,
      type: "otp",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (this.sendingEnabled) {
      try {
        await this.sendViaProvider(notification);
        notification.status = "sent";
        notification.sentAt = new Date().toISOString();
      } catch {
        notification.status = "failed";
      }
    } else {
      notification.status = "sent";
      notification.sentAt = new Date().toISOString();
    }

    this.notifications.push(notification);
    return notification;
  }

  getNotificationsForOrder(orderId: string): SmsNotification[] {
    return this.notifications.filter((n) => n.orderId === orderId);
  }

  getDeliveryStats(): { sent: number; delivered: number; failed: number; deliveryRate: number } {
    const sent = this.notifications.filter((n) => n.status === "sent" || n.status === "delivered").length;
    const delivered = this.notifications.filter((n) => n.status === "delivered").length;
    const failed = this.notifications.filter((n) => n.status === "failed").length;
    return { sent, delivered, failed, deliveryRate: sent > 0 ? delivered / sent : 0 };
  }
}
