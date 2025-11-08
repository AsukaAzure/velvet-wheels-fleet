import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export default function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, cars(*)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cartCount"] });
      toast.success("Item removed from cart");
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!user || !cartItems || cartItems.length === 0) return;

      const totalAmount = cartItems.reduce((sum, item) => {
        return sum + (item.rental_days * Number(item.cars.price_per_day));
      }, 0);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          status: "confirmed",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        car_id: item.car_id,
        rental_days: item.rental_days,
        pickup_date: item.pickup_date,
        pickup_time: item.pickup_time,
        pickup_location: item.pickup_location,
        return_date: item.return_date,
        return_time: item.return_time,
        return_location: item.return_location,
        start_date: item.start_date,
        end_date: item.end_date,
        price_per_day: item.cars.price_per_day,
        subtotal: item.rental_days * Number(item.cars.price_per_day),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Car availability is automatically updated by database trigger
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cartCount"] });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success("Order placed successfully!");
      navigate("/bookings");
    },
    onError: () => {
      toast.error("Failed to place order");
    },
  });

  const totalAmount = cartItems?.reduce((sum, item) => {
    return sum + (item.rental_days * Number(item.cars.price_per_day));
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-bold mb-8 bg-gradient-gold bg-clip-text text-transparent">
            Your Cart
          </h1>

          {!cartItems || cartItems.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <p className="text-xl text-muted-foreground mb-6">Your cart is empty</p>
                <Button 
                  onClick={() => navigate("/cars")}
                  className="bg-gradient-gold hover:opacity-90"
                >
                  Browse Our Fleet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {item.cars.image_url && (
                          <img 
                            src={item.cars.image_url} 
                            alt={item.cars.name}
                            className="w-48 h-32 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-1">{item.cars.name}</h3>
                          <p className="text-muted-foreground mb-4">{item.cars.brand}</p>
                          
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Pickup:</span>
                                <p className="font-medium">{new Date(item.pickup_date).toLocaleDateString()}</p>
                                <p>{item.pickup_time} - {item.pickup_location}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Return:</span>
                                <p className="font-medium">{new Date(item.return_date).toLocaleDateString()}</p>
                                <p>{item.return_time} - {item.return_location}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm pt-2">
                              <div>
                                <span className="text-muted-foreground">Days: </span>
                                <span className="font-semibold">{item.rental_days}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Price/day: </span>
                                <span className="font-semibold">₹{item.cars.price_per_day}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <p className="text-2xl font-bold text-primary">
                            ₹{(item.rental_days * Number(item.cars.price_per_day)).toFixed(2)}
                          </p>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-1">
                <Card className="bg-card border-border sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-lg">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg border-t border-border pt-4">
                      <span className="font-bold">Total:</span>
                      <span className="text-3xl font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <Button 
                      onClick={() => checkoutMutation.mutate()}
                      disabled={checkoutMutation.isPending}
                      className="w-full bg-gradient-gold hover:opacity-90 font-semibold"
                      size="lg"
                    >
                      {checkoutMutation.isPending ? "Processing..." : "Complete Booking"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
