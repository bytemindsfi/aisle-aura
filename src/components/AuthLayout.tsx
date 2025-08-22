import { ShoppingCart } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-muted rounded-full">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Grocery List</h1>
          <p className="text-muted-foreground mt-2">Simple shopping, organized life</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;