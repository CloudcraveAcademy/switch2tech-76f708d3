
import { supabase } from "@/integrations/supabase/client";

export class PaymentService {
  static async getFlutterwaveConfig(): Promise<{ public_key: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_payment_gateway_config', { gateway_name_param: 'flutterwave' });

      if (error) {
        console.error('Error fetching Flutterwave config:', error);
        throw new Error('Failed to fetch payment configuration');
      }

      if (!data || data.length === 0) {
        throw new Error('Flutterwave configuration not found');
      }

      const config = data[0];
      if (!config.is_active) {
        throw new Error('Flutterwave payment gateway is not active');
      }

      return { public_key: config.public_key };
    } catch (error) {
      console.error('PaymentService error:', error);
      throw error;
    }
  }
}
