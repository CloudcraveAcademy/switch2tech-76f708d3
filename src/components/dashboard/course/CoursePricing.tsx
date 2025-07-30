
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DollarSign } from "lucide-react";

interface CoursePricingProps {
  form: any;
}

export const CoursePricing = ({ form }: CoursePricingProps) => {
  const discountEnabled = form.watch("discountEnabled");

  return (
    <div className="space-y-6">
      {/* Price */}
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price (USD)*</FormLabel>
            <FormControl>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  {...field}
                  type="number" 
                  className="pl-9"
                  placeholder="e.g. 100"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Discount Option */}
      <FormField
        control={form.control}
        name="discountEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Enable Discount</FormLabel>
              <FormDescription>
                Offer this course at a discounted price
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Discounted Price */}
      {discountEnabled && (
        <FormField
          control={form.control}
          name="discountedPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discounted Price (USD)</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                   <Input
                     {...field}
                     type="number" 
                     className="pl-9"
                     placeholder="e.g. 80"
                     onChange={(e) => field.onChange(Number(e.target.value))}
                   />
                </div>
              </FormControl>
              <FormDescription>
                The discounted price must be lower than the original price
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
