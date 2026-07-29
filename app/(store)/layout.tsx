import { Topbar } from "@/components/layout/Topbar";
import { Footer } from "@/components/layout/Footer";
import { CartAddedToast } from "@/components/cart/CartAddedToast";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Topbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartAddedToast />
    </>
  );
}
