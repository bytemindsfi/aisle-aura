import { ShoppingCart } from "lucide-react";
import logo from "../assets/logo.png";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 md:p-4 bg-muted rounded-full">
              {/*<ShoppingCart className="h-8 w-8 text-muted-foreground" />*/}
              <img src={logo} alt="logo" className="h-8 w-8 md:h-10 md:w-10" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Grocery List</h1>
          <p className="text-muted-foreground md:text-lg mt-2">
            Simple shopping, organized life
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
