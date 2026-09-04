import { AccountFrame } from "@/components/account/account-frame";
import { getLocale } from "@/lib/locale";

export const metadata = { title: "Account" };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return <AccountFrame locale={locale}>{children}</AccountFrame>;
}
